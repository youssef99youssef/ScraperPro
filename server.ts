import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import * as cheerio from 'cheerio';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Shared Gemini client instance
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

const COMMON_HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept':
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
};

const ARABIC_STOP_WORDS = new Set([
  'في', 'من', 'على', 'إلى', 'عن', 'مع', 'هذا', 'هذه', 'التي', 'الذي', 'أن', 'إن', 'كان',
  'لا', 'ما', 'أو', 'او', 'اند', 'كل', 'هنا', 'ذلك', 'بعد', 'قبل', 'بين', 'حتى', 'إذا',
  'ثم', 'قد', 'تم', 'غير', 'كما', 'حول', 'عند', 'أجل', 'هو', 'هي', 'هم', 'هن', 'نحن',
  'أنا', 'انت', 'أنتم', 'لها', 'له', 'بها', 'به', 'فقد', 'يكون', 'تكون', 'كانت', 'خلال',
  'جميع', 'لدى', 'لقد', 'منذ', 'حيث', 'تلك', 'الذين', 'اللتين', 'اللذين', 'أيها', 'أيتها',
  'فقط', 'كذلك', 'نحو', 'ضمن', 'لديهم', 'لديه', 'بينما', 'حين', 'دون', 'سوى', 'مثل',
  'أمام', 'وراء', 'فوق', 'تحت', 'وسط', 'ضد', 'نفس', 'بعض', 'أي', 'أية', 'أيضا', 'جدا',
  'com', 'www', 'http', 'https', 'html'
]);

const ENGLISH_STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'are', 'have', 'you', 'not', 'all',
  'can', 'will', 'was', 'your', 'more', 'about', 'our', 'what', 'when', 'which', 'their',
  'one', 'been', 'there', 'were', 'who', 'how', 'its', 'also', 'has', 'into', 'just',
  'any', 'some', 'them', 'they', 'than', 'only', 'other', 'new', 'time', 'like', 'these'
]);

// Helper to fetch website with custom timeout and browser-like headers
async function fetchTarget(targetUrl: string, customHeaders?: Record<string, string>) {
  let normalizedUrl = targetUrl.trim();
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    normalizedUrl = 'https://' + normalizedUrl;
  }

  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch(normalizedUrl, {
      method: 'GET',
      headers: { ...COMMON_HEADERS, ...(customHeaders || {}) },
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;
    const contentType = res.headers.get('content-type') || '';
    const text = await res.text();

    const headersObj: Record<string, string> = {};
    res.headers.forEach((value, key) => {
      headersObj[key] = value;
    });

    return {
      url: res.url || normalizedUrl,
      status: res.status,
      statusText: res.statusText,
      headers: headersObj,
      contentType,
      duration,
      html: text,
      contentLength: text.length,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const error = err as Error;
    throw new Error(
      error.name === 'AbortError'
        ? 'انتهت مهلة الاتصال بالرابط (20 ثانية). يرجى التأكد من عمل الموقع أو جرب رابطاً آخر.'
        : `فشل الاتصال بالموقع (${error.message || 'Network error'}). تأكد من صحة الرابط أو حماية الموقع.`
    );
  }
}

// 1. API: SEO & Keyword Extraction
app.post('/api/scrape/seo', async (req: Request, res: Response) => {
  try {
    const { url, runAIAnalysis = true, customPrompt } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'يرجى تقديم رابط صالح (URL).' });
    }

    const fetched = await fetchTarget(url);
    const $ = cheerio.load(fetched.html);

    // Remove script, style, noscript, etc.
    $('script, style, noscript, svg, path, link, meta').remove();

    const pageTitle = $('title').first().text().trim() || 'بدون عنوان (No Title)';
    
    // Meta tags from original HTML
    const $orig = cheerio.load(fetched.html);
    const metaDesc =
      $orig('meta[name="description" i]').attr('content') ||
      $orig('meta[property="og:description" i]').attr('content') ||
      '';
    const metaKeywords = $orig('meta[name="keywords" i]').attr('content') || '';
    const canonical = $orig('link[rel="canonical" i]').attr('href') || '';
    const ogTitle = $orig('meta[property="og:title" i]').attr('content') || '';
    const ogImage = $orig('meta[property="og:image" i]').attr('content') || '';
    const twitterCard = $orig('meta[name="twitter:card" i]').attr('content') || '';

    // Headings
    const h1Tags: string[] = [];
    $orig('h1').each((_, el) => {
      const text = $(el).text().trim();
      if (text && !h1Tags.includes(text)) h1Tags.push(text);
    });

    const h2Tags: string[] = [];
    $orig('h2').each((_, el) => {
      const text = $(el).text().trim();
      if (text && !h2Tags.includes(text)) h2Tags.push(text);
    });

    const h3Tags: string[] = [];
    $orig('h3').each((_, el) => {
      const text = $(el).text().trim();
      if (text && !h3Tags.includes(text) && h3Tags.length < 20) h3Tags.push(text);
    });

    // Clean body text
    const textContent = $('body').text().replace(/\s+/g, ' ').trim();
    
    // Word Tokenization: Arabic & English
    const wordMatches = textContent.match(/[\u0600-\u06FFa-zA-Z]{3,}/g) || [];
    const wordCounts: Record<string, number> = {};

    for (const rawWord of wordMatches) {
      const word = rawWord.toLowerCase();
      if (ARABIC_STOP_WORDS.has(word) || ENGLISH_STOP_WORDS.has(word)) {
        continue;
      }
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }

    const topWords = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word, count]) => ({
        word,
        count,
        percentage: ((count / Math.max(wordMatches.length, 1)) * 100).toFixed(1),
      }));

    // AI SEO Strategy Generation
    let aiReport: string | null = null;
    if (runAIAnalysis) {
      const ai = getGeminiClient();
      if (ai) {
        try {
          const prompt =
            customPrompt ||
            `أنت خبير محترف في تحسين محركات البحث (SEO Master) والتسويق الرقمي.
قم بتحليل بيانات الـ SEO التالية للموقع المستهدف:
- الرابط: ${fetched.url}
- العنوان (Title): ${pageTitle}
- الوصف (Meta Description): ${metaDesc || 'غير متوفر'}
- عناوين H1: ${h1Tags.join(' | ') || 'لا توجد'}
- عناوين H2: ${h2Tags.slice(0, 5).join(' | ') || 'لا توجد'}
- أهم الكلمات المفتاحية تكراراً: ${topWords.slice(0, 10).map((w) => `${w.word} (${w.count})`).join(', ')}

المطلوب:
1. تقييم جودة عنوان الصفحة والوصف ومعدل النقر المتوقع (CTR).
2. تحليل استراتيجية التصدر والكلمات المفتاحية التي يستهدفها الموقع فعلياً.
3. نقاط القوة ونقاط الضعف الأساسية في المحتوى المتاح.
4. 4 توصيات عملية مباشرة لتحسين الترتيب في محرك بحث جوجل وجذب زيارات أكبر.

اكتب التقرير بلغة عربية احترافية، منسقة بنقاط وعناوين واضحة ومباشرة.`;

          const aiResponse = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              systemInstruction:
                'You are an elite SEO strategist, web data analyst, and digital marketing expert.',
            },
          });
          aiReport = aiResponse.text || 'لم يتم إنشاء تقرير ذكاء اصطناعي.';
        } catch (aiErr: unknown) {
          const err = aiErr as Error;
          aiReport = `تعذر الحصول على تحليل الذكاء الاصطناعي: ${err.message || 'Gemini API Error'}`;
        }
      } else {
        aiReport =
          'مفتاح Gemini API غير مهيأ في الخادم حالياً. تم استخراج كافة عناصر الـ SEO والكلمات بنجاح.';
      }
    }

    return res.json({
      success: true,
      url: fetched.url,
      status: fetched.status,
      duration: fetched.duration,
      contentLength: fetched.contentLength,
      title: pageTitle,
      metaDescription: metaDesc,
      metaKeywords,
      canonical,
      ogTitle,
      ogImage,
      twitterCard,
      h1: h1Tags,
      h2: h2Tags,
      h3: h3Tags,
      totalWordsCount: wordMatches.length,
      topWords,
      aiReport,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return res.status(500).json({ error: err.message || 'حدث خطأ أثناء معالجة تحليل الـ SEO' });
  }
});

// 2. API: Static Scraper (Requests & BS4 equivalent)
app.post('/api/scrape/static', async (req: Request, res: Response) => {
  try {
    const { url, maxChars = 2000, selector } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'يرجى تقديم رابط صالح (URL).' });
    }

    const fetched = await fetchTarget(url);
    const $ = cheerio.load(fetched.html);

    const title = $('title').first().text().trim() || 'بدون عنوان';

    // Extracted Links
    const links: { text: string; href: string }[] = [];
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href')?.trim();
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      if (href && !href.startsWith('javascript:') && links.length < 50) {
        links.push({ text: text || '(بدون نص)', href });
      }
    });

    // Extracted Images
    const images: { alt: string; src: string }[] = [];
    $('img[src]').each((_, el) => {
      const src = $(el).attr('src')?.trim();
      const alt = $(el).attr('alt')?.trim() || '';
      if (src && images.length < 40) {
        images.push({ alt, src });
      }
    });

    // Custom CSS selector search if provided
    let selectorResults: string[] = [];
    if (selector && selector.trim()) {
      try {
        $(selector.trim()).each((_, el) => {
          if (selectorResults.length < 25) {
            selectorResults.push($.html(el).slice(0, 1000));
          }
        });
      } catch (selErr) {
        // ignore invalid selector
      }
    }

    const limit = Number(maxChars) || 2000;
    const htmlSnippet = limit > 0 ? fetched.html.slice(0, limit) : fetched.html;

    return res.json({
      success: true,
      url: fetched.url,
      status: fetched.status,
      statusText: fetched.statusText,
      duration: fetched.duration,
      contentType: fetched.contentType,
      totalLength: fetched.html.length,
      snippetLength: htmlSnippet.length,
      title,
      htmlSnippet,
      totalLinks: $('a').length,
      totalImages: $('img').length,
      totalScripts: $('script').length,
      linksSample: links,
      imagesSample: images,
      selectorResults,
      headers: fetched.headers,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return res.status(500).json({ error: err.message || 'حدث خطأ في الجلب الثابت' });
  }
});

// 3. API: Dynamic & Frame Extractor (Selenium/Playwright style)
app.post('/api/scrape/iframes', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'يرجى تقديم رابط صالح (URL).' });
    }

    const fetched = await fetchTarget(url);
    const $ = cheerio.load(fetched.html);

    interface FrameInfo {
      src: string;
      title?: string;
      id?: string;
      className?: string;
      allow?: string;
      sandbox?: string;
      width?: string;
      height?: string;
      type: 'stream' | 'video' | 'embed' | 'ad' | 'general';
    }

    const frames: FrameInfo[] = [];

    // 1. Scan iframes
    $('iframe').each((_, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src') || '';
      if (!src) return;

      let type: FrameInfo['type'] = 'general';
      const lower = src.toLowerCase();
      if (
        lower.includes('player') ||
        lower.includes('stream') ||
        lower.includes('embed') ||
        lower.includes('m3u8') ||
        lower.includes('live') ||
        lower.includes('siiir') ||
        lower.includes('tv') ||
        lower.includes('video') ||
        lower.includes('vids')
      ) {
        type = 'stream';
      } else if (lower.includes('youtube') || lower.includes('vimeo') || lower.includes('dailymotion')) {
        type = 'video';
      } else if (lower.includes('ad') || lower.includes('banner') || lower.includes('doubleclick')) {
        type = 'ad';
      }

      frames.push({
        src,
        title: $(el).attr('title') || '',
        id: $(el).attr('id') || '',
        className: $(el).attr('class') || '',
        allow: $(el).attr('allow') || '',
        sandbox: $(el).attr('sandbox') || '',
        width: $(el).attr('width') || '',
        height: $(el).attr('height') || '',
        type,
      });
    });

    // 2. Scan direct video & source tags
    const directVideos: { src: string; type?: string }[] = [];
    $('video, audio').each((_, el) => {
      const src = $(el).attr('src');
      const tag = $(el).prop('tagName');
      if (src) directVideos.push({ src, type: tag ? tag.toLowerCase() : 'video' });
    });
    $('video source, audio source').each((_, el) => {
      const src = $(el).attr('src');
      const type = $(el).attr('type');
      if (src) directVideos.push({ src, type: type || 'video/source' });
    });

    // 3. Scan for regex patterns inside JavaScript (common in streaming and live sites like siiir.tv)
    const streamRegex = /(https?:\/\/[^\s"'<>]+\.(?:m3u8|mpd|mp4|webm|flv)[^\s"'<>]*)/gi;
    const embedRegex = /(https?:\/\/[^\s"'<>]+\/(?:embed|player|stream|iframe)\/[^\s"'<>]+)/gi;

    const rawMatches = new Set<string>();
    let match;
    while ((match = streamRegex.exec(fetched.html)) !== null) {
      rawMatches.add(match[1]);
    }
    while ((match = embedRegex.exec(fetched.html)) !== null) {
      rawMatches.add(match[1]);
    }

    const scriptStreamUrls = Array.from(rawMatches).slice(0, 25);

    return res.json({
      success: true,
      url: fetched.url,
      totalFrames: frames.length,
      frames,
      directVideos,
      scriptStreamUrls,
      pageTitle: $('title').first().text().trim() || 'بدون عنوان',
    });
  } catch (error: unknown) {
    const err = error as Error;
    return res.status(500).json({ error: err.message || 'حدث خطأ في استخراج الإطارات' });
  }
});

// 4. API: Playwright / Modern Inspector Diagnostics
app.post('/api/scrape/automation', async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'يرجى تقديم رابط صالح (URL).' });
    }

    const fetched = await fetchTarget(url);
    const $ = cheerio.load(fetched.html);

    // Security header assessment
    const headers = fetched.headers;
    const securityCheck = {
      hasHttps: fetched.url.startsWith('https://'),
      hasCsp: Boolean(headers['content-security-policy']),
      cspValue: headers['content-security-policy'] || 'غير مفعل (None)',
      xFrameOptions: headers['x-frame-options'] || 'غير محدد (Allow All)',
      hsts: Boolean(headers['strict-transport-security']),
      contentTypeOptions: headers['x-content-type-options'] || 'غير محدد',
      referrerPolicy: headers['referrer-policy'] || 'غير محدد',
    };

    // DOM Composition Breakdown
    const domSummary = {
      totalElements: $('*').length,
      formsCount: $('form').length,
      inputsCount: $('input, textarea, select').length,
      buttonsCount: $('button, a[role="button"]').length,
      imagesCount: $('img').length,
      iframesCount: $('iframe').length,
      scriptsCount: $('script').length,
      stylesCount: $('style, link[rel="stylesheet"]').length,
    };

    // Social Meta Card preview info
    const socialPreview = {
      title: $('meta[property="og:title"]').attr('content') || $('title').text().trim(),
      description:
        $('meta[property="og:description"]').attr('content') ||
        $('meta[name="description"]').attr('content') ||
        'لا يوجد وصف معتمد للوسائط الاجتماعية.',
      image: $('meta[property="og:image"]').attr('content') || '',
      siteName: $('meta[property="og:site_name"]').attr('content') || '',
      type: $('meta[property="og:type"]').attr('content') || 'website',
    };

    return res.json({
      success: true,
      url: fetched.url,
      title: $('title').text().trim(),
      status: fetched.status,
      duration: fetched.duration,
      securityCheck,
      domSummary,
      socialPreview,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return res.status(500).json({ error: err.message || 'حدث خطأ أثناء فحص الأتمتة' });
  }
});

// 5. API: AI Assistant (Ollama & Gemini powered)
app.post('/api/ai/assistant', async (req: Request, res: Response) => {
  try {
    const { prompt, context, toolType = 'general', customModel } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'يرجى إدخال السؤال أو النص المطلوب.' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({
        error:
          'مفتاح Gemini API غير مهيأ في بيئة العمل. يرجى التأكد من إضافة GEMINI_API_KEY في الإعدادات.',
      });
    }

    const systemPrompt = `أنت المساعد الذكي الخبير "Scraper Pro AI Assistant".
أنت متخصص رفيع المستوى في:
1. استخراج بيانات الويب (Web Scraping) باستخدام Python و Beautiful Soup و Selenium و Playwright و Cheerio.
2. هندسة الكلمات المفتاحية وتحليل الـ SEO العربي والعالمي، وهيكلة الميتا داتا.
3. كتابة التعابير النمطية (Regular Expressions) المتقنة لاستخراج الروابط، الإطارات، الـ m3u8، والـ JSON.
4. التعامل مع المواقع الديناميكية وتجاوز التحديات الشائعة بأعلى كفاءة.

قواعد الاستجابة:
- كن دقيقاً وعملياً ومباشراً.
- قدم شروحات مرتبة ومقاطع كود نظيفة موثقة بالتعليقات عند الطلب.
- إذا كان السؤال باللغة العربية، أجب بلغة عربية فصيحة ومتقنة مع المصطلحات التقنية الدقيقة.
- جهز الاستجابة لتكون مريحة للقراءة ومناسبة للنسخ المباشر عبر الحافظة.`;

    const fullPrompt = context
      ? `السياق الحالي / البيانات المستخرجة:\n${typeof context === 'object' ? JSON.stringify(context, null, 2) : context}\n\nسؤال أو طلب المستخدم:\n${prompt}`
      : prompt;

    const response = await ai.models.generateContent({
      model: customModel || 'gemini-3.8-flash',
      contents: fullPrompt,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    return res.json({
      success: true,
      reply: response.text || 'لا توجد استجابة نصية مولدة.',
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const err = error as Error;
    return res.status(500).json({
      error: `حدث خطأ أثناء استدعاء الذكاء الاصطناعي: ${err.message || 'Unknown error'}`,
    });
  }
});

// Vite Middleware Mounting for Dev / Static Serving for Production
async function setupServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[All-in-One Scraper Pro] Server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
