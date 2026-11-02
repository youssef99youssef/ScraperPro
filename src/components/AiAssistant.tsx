import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  RefreshCw,
  AlertCircle,
  Code,
  Copy,
  Check,
  Cpu,
  Trash2,
  FileCode,
  Layers,
  Search,
} from 'lucide-react';
import { CopyButton } from './CopyButton';
import { LongTextViewer } from './LongTextViewer';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AiAssistant: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `مرحباً بك في المساعد الذكي لمشروع All-in-One Scraper Pro! 🕷️\n\nأنا جاهز لمساعدتك في أي مهمة تتعلق بـ:\n- كتابة كود بايثون متكامل (Requests + BeautifulSoup أو Selenium أو Playwright).\n- إنشاء تعابير نمطية متقدمة (Regex) لسحب روابط البث ومشغلات الـ iframes.\n- تحليل بيانات الـ SEO واستخراج الكلمات المفتاحية واستراتيجيات تصدر جوجل.\n- فك تشفير وتجاوز الحمايات البرمجية بأسلوب تقني عالي الاحترافية.\n\nيمكنك استخدام الأزرار الجاهزة بالأسفل أو كتابة أي سؤال في الصندوق.`,
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [error, setError] = useState<string | null>(null);

  const promptPresets = [
    {
      title: 'كود بايثون مع BeautifulSoup',
      icon: FileCode,
      prompt:
        'اكتب لي كود بايثون احترافي باستخدام requests و BeautifulSoup لاستخراج كافة وسوم الميتا والعناوين H1 والروابط من صفحة ويب وحفظها في ملف JSON مع معالجة الأخطاء والترميز العربي UTF-8.',
    },
    {
      title: 'استخراج iframes بـ Playwright',
      icon: Layers,
      prompt:
        'اكتب لي سكريبت بايثون باستخدام Playwright للانتظار حتى تحميل الصفحة بالكامل واستخراج كافة روابط iframes ومشغلات الفيديو ومصادر الـ m3u8 المخفية في شبكة الموقع (Network Requests).',
    },
    {
      title: 'تعبير نمطي (Regex) للبث الحي',
      icon: Code,
      prompt:
        'أريد تعبير نمطي (Regex) بالبايثون وجافاسكريبت دقيق جداً لاستخراج روابط m3u8 و mpd و mp4 وروابط البث الحي المشفرة من نصوص ملفات الجافاسكريبت داخل صفحات الويب.',
    },
    {
      title: 'استراتيجية تصدر SEO عربي',
      icon: Search,
      prompt:
        'كيف أحسن ترتيب موقع محتوى عربي ليتصدر الكلمات المفتاحية التنافسية؟ قدم لي خطة عملية تشمل الكلمات طويلة الذيل (Long-tail keywords) وبنية العناوين وسرعة الصفحة.',
    },
  ];

  const handleSend = async (customText?: string) => {
    const textToSend = customText || prompt;
    if (!textToSend.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setPrompt('');
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMessage.text,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || `خطأ في استجابة الذكاء الاصطناعي (${res.status})`);
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: json.reply,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || 'حدث خطأ غير متوقع أثناء معالجة الطلب.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'assistant',
        text: 'تم مسح المحادثة. كيف يمكنني مساعدتك الآن؟',
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // The latest assistant reply for quick featured copy
  const latestAssistantMessage = [...messages].reverse().find((m) => m.sender === 'assistant');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header section matching Streamlit original header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Bot className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              🤖 المساعد الذكي المتكامل (Ollama & Gemini Pro)
            </h2>
          </div>
          <p className="text-sm text-slate-400">
            مساعد متخصص في هندسة استخراج البيانات، البرمجة، والـ SEO مع أدوات نسخ فورية وعرض متقدم للنصوص الطويلة.
          </p>
        </div>

        {/* Server status badge matching Streamlit "سيرفر Ollama متصل وجاهز للعمل" */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold select-none">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>سيرفر الذكاء الاصطناعي متصل وجاهز للعمل</span>
        </div>
      </div>

      {/* Quick Prompt Presets Bar */}
      <div className="space-y-2">
        <span className="text-xs text-slate-400 font-semibold block">
          قوالب وأوامر جاهزة للاستخدام السريع:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {promptPresets.map((preset, idx) => {
            const Icon = preset.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(preset.prompt)}
                disabled={loading}
                className="p-3 rounded-xl bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] hover:border-purple-500/40 text-right transition-all group cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200 group-hover:text-purple-300 mb-1">
                  <Icon className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="truncate">{preset.title}</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {preset.prompt}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Text Area Container */}
      <div className="st-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-300">
            أدخل سؤالك أو الكود أو النص المراد معالجته:
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearChat}
              className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>مسح المحادثة</span>
            </button>
          </div>
        </div>

        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="اكتب طلبك هنا... مثال: استخرج لي روابط الفيديوهات من كود الـ HTML التالي، أو اكتب كود بايثون متكامل..."
            rows={4}
            className="w-full bg-[#0e1117] border border-[#30363d] focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl p-3.5 text-sm text-slate-100 placeholder:text-slate-600 transition-colors resize-y min-h-[110px]"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <span className="text-[11px] text-slate-500">
            نصيحة: اضغط <kbd className="px-1.5 py-0.5 rounded bg-[#21262d] border border-[#30363d] font-mono text-[10px] text-slate-300">Ctrl + Enter</kbd> للإرسال السريع
          </span>

          <button
            onClick={() => handleSend()}
            disabled={loading || !prompt.trim()}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-[0.98] transition-all shadow-md shadow-purple-600/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-purple-200" />
                <span>جاري المعالجة والتفكير...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-purple-200" />
                <span>إرسال للذكاء الاصطناعي</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <strong className="block font-semibold mb-1">تعذر الحصول على رد من الذكاء الاصطناعي:</strong>
            <p className="text-red-300/90 text-xs">{error}</p>
          </div>
        </div>
      )}

      {/* Responses and Conversation Feed */}
      <div className="space-y-5">
        <div className="flex items-center justify-between border-b border-[#30363d] pb-2">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <span>💬</span>
            <span>الردود وسجل الاستجابة:</span>
          </h3>
          {latestAssistantMessage && (
            <CopyButton
              text={latestAssistantMessage.text}
              label="نسخ أحدث استجابة للحافظة"
              copiedLabel="تم نسخ الاستجابة!"
              variant="badge"
              className="bg-purple-500/20 text-purple-300 border-purple-500/40"
            />
          )}
        </div>

        {messages.map((msg, index) => {
          const isUser = msg.sender === 'user';

          if (isUser) {
            return (
              <div
                key={msg.id || index}
                className="flex items-start gap-3 p-4 rounded-xl bg-[#161b22] border border-[#30363d]/80 animate-in fade-in"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                  أنت
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-300">سؤالك:</span>
                    <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
                  </div>
                  <p className="text-sm text-slate-100 whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            );
          }

          // Assistant Response: Rendered with the Enhanced LongTextViewer + Copy to Clipboard!
          return (
            <div key={msg.id || index} className="space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-purple-300 block">
                      استجابة الذكاء الاصطناعي (AI Response)
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
                  </div>
                </div>

                {/* Primary requested copy button */}
                <CopyButton
                  text={msg.text}
                  label="نسخ الاستجابة إلى الحافظة"
                  copiedLabel="تم نسخ الاستجابة بنجاح!"
                  title="نسخ نص الاستجابة بالكامل إلى الحافظة"
                  className="bg-purple-600/25 hover:bg-purple-600/35 text-purple-200 border-purple-500/40 shadow-sm"
                />
              </div>

              {/* Enhanced Long-Text Display Interface */}
              <LongTextViewer
                content={msg.text}
                title="نص الاستجابة الكامل"
                subtitle={`الوقت: ${msg.timestamp}`}
                language="markdown"
                downloadFilename={`ai_response_${index}.txt`}
                maxInitialHeight="max-h-[550px]"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
