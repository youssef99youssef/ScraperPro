import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Hash,
  TrendingUp,
  Clock,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  SlidersHorizontal,
} from 'lucide-react';
import { SeoAnalysisResult } from '../types/scraper';
import { CopyButton } from './CopyButton';
import { LongTextViewer } from './LongTextViewer';

interface SeoExtractorProps {
  onScrapeCompleted: (url: string, title?: string) => void;
}

export const SeoExtractor: React.FC<SeoExtractorProps> = ({ onScrapeCompleted }) => {
  const [url, setUrl] = useState('https://siiir.tv');
  const [loading, setLoading] = useState(false);
  const [runAi, setRunAi] = useState(true);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showPromptCustomizer, setShowPromptCustomizer] = useState(false);
  const [keywordFilter, setKeywordFilter] = useState('');
  const [data, setData] = useState<SeoAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const presets = [
    { label: 'siiir.tv (بث ومباريات)', url: 'https://siiir.tv' },
    { label: 'الجزيرة نت', url: 'https://aljazeera.net' },
    { label: 'ويكيبيديا العربية', url: 'https://ar.wikipedia.org' },
    { label: 'موقع تجريبي', url: 'https://example.com' },
  ];

  const handleStartAnalysis = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/scrape/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          runAIAnalysis: runAi,
          customPrompt: customPrompt.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || `خطأ في الخادم (${res.status})`);
      }

      setData(json);
      onScrapeCompleted(json.url, json.title);
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || 'حدث خطأ غير متوقع أثناء معالجة الموقع.');
    } finally {
      setLoading(false);
    }
  };

  const filteredKeywords = data?.topWords.filter((item) =>
    item.word.toLowerCase().includes(keywordFilter.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header section */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Search className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight">
            محرك استخراج الكلمات المفتاحية وتحليل الـ SEO الاحترافي
          </h2>
        </div>
        <p className="text-sm text-slate-400">
          استخرج عناصر الميتا، العناوين، وأهم الكلمات المفتاحية لأي موقع مع تحليل ذكي لاستراتيجية التصدر والمنافسة.
        </p>
      </div>

      {/* Input Card */}
      <div className="st-card p-5 space-y-4">
        <form onSubmit={handleStartAnalysis} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              أدخل رابط الموقع المستهدف (Target URL):
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  dir="ltr"
                  className="w-full bg-[#0e1117] border border-[#30363d] focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 transition-colors font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 active:scale-[0.98] transition-all shadow-md shadow-cyan-600/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-200" />
                    <span>جاري التحليل والسحب...</span>
                  </>
                ) : (
                  <>
                    <span>🚀 بدء التحليل الشامل</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-400">نماذج سريعة للتجربة:</span>
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setUrl(p.url);
                }}
                className="text-[11px] bg-[#21262d] hover:bg-[#30363d] text-slate-300 hover:text-white px-2.5 py-1 rounded-md border border-[#30363d] transition-colors cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* AI Settings toggle */}
          <div className="pt-2 border-t border-[#30363d]/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={runAi}
                onChange={(e) => setRunAi(e.target.checked)}
                className="rounded border-[#30363d] text-cyan-500 focus:ring-cyan-500/20 w-4 h-4 bg-[#0e1117]"
              />
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                توليد تقرير ذكاء اصطناعي لاستراتيجية التصدر (Ollama / Gemini)
              </span>
            </label>

            <button
              type="button"
              onClick={() => setShowPromptCustomizer(!showPromptCustomizer)}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>{showPromptCustomizer ? 'إخفاء تخصيص موجه الذكاء' : 'تخصيص أمر التحليل (Prompt)'}</span>
            </button>
          </div>

          {showPromptCustomizer && (
            <div className="p-3 bg-[#0e1117] rounded-xl border border-[#30363d] space-y-2 animate-in fade-in">
              <label className="text-xs text-slate-400 block">
                توجيه مخصص لنموذج الذكاء الاصطناعي (اختياري):
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="اكتب هنا أي متطلبات محددة، مثل: ركز على المنافسة في السوق الخليجي واقترح خطة محتوى شهرية..."
                rows={2}
                className="w-full bg-[#161b22] border border-[#30363d] rounded-lg p-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:border-cyan-500 focus:outline-none"
              />
            </div>
          )}
        </form>
      </div>

      {/* Error display */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 flex items-start gap-3 animate-in shake">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <strong className="block font-semibold mb-1">تعذر استخراج بيانات الـ SEO:</strong>
            <p className="text-red-300/90 text-xs">{error}</p>
          </div>
        </div>
      )}

      {/* Loading state indicator */}
      {loading && (
        <div className="st-card p-12 text-center space-y-4 animate-pulse">
          <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>
          <h3 className="text-base font-semibold text-slate-200">
            جاري سحب المحتوى، ضبط الترميز، واستخراج الكلمات وتحليل الـ SEO...
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            نقوم بمسح وسوم الميتا، العناوين H1/H2، فلترة حروف الجر والكلمات الشائعة (Stop Words) وإعداد التقرير.
          </p>
        </div>
      )}

      {/* Scraped Results Dashboard */}
      {data && !loading && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Status summary banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[#161b22] rounded-xl border border-[#30363d]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-xs font-semibold text-slate-200">
                تم التحليل بنجاح
              </span>
              <span className="text-xs text-slate-400 font-mono" dir="ltr">
                ({data.url})
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                {data.duration} ms
              </span>
              <span className="text-slate-600">|</span>
              <span>الحالة: <strong className="text-emerald-400 font-mono">{data.status} OK</strong></span>
              <span className="text-slate-600">|</span>
              <CopyButton
                text={JSON.stringify(data, null, 2)}
                label="نسخ كل النتائج (JSON)"
                copiedLabel="تم نسخ النتائج!"
                variant="badge"
              />
            </div>
          </div>

          {/* Two-column layout matching user's Streamlit col1 and col2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Col 1: Meta Elements & Headings */}
            <div className="st-card p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
                <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                  <span>📌</span> عناصر الـ Meta والعناوين
                </h3>
                <CopyButton
                  text={`العنوان: ${data.title}\nالوصف: ${data.metaDescription}\nعناوين H1: ${data.h1.join(', ')}\nعناوين H2: ${data.h2.join(', ')}`}
                  label="نسخ العناصر"
                  variant="badge"
                />
              </div>

              {/* Title item */}
              <div className="space-y-1.5 p-3 rounded-lg bg-[#21262d] border border-[#30363d]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-cyan-400">
                    العنوان (Page Title):
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {data.title.length} حرف
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-100 select-all leading-relaxed">
                  {data.title}
                </p>
                <div className="pt-1 flex items-center justify-end">
                  <CopyButton text={data.title} variant="ghost" label="نسخ العنوان" />
                </div>
              </div>

              {/* Description item */}
              <div className="space-y-1.5 p-3 rounded-lg bg-[#21262d] border border-[#30363d]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-400">
                    الوصف (Meta Description):
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {data.metaDescription.length} حرف
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed select-all">
                  {data.metaDescription || 'غير محدد (لم يقم الموقع بتعيين وسم الوصف)'}
                </p>
                {data.metaDescription && (
                  <div className="pt-1 flex items-center justify-end">
                    <CopyButton text={data.metaDescription} variant="ghost" label="نسخ الوصف" />
                  </div>
                )}
              </div>

              {/* H1 Headings */}
              <div className="space-y-1.5 p-3 rounded-lg bg-[#21262d] border border-[#30363d]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-400">
                    عناوين H1 ({data.h1.length}):
                  </span>
                  <CopyButton text={data.h1.join('\n')} variant="ghost" label="نسخ H1" />
                </div>
                {data.h1.length > 0 ? (
                  <ul className="space-y-1 text-xs text-slate-200">
                    {data.h1.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 bg-[#161b22] p-2 rounded border border-[#30363d]/60">
                        <span className="text-amber-400 font-bold shrink-0">H1</span>
                        <span className="select-all">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 italic">لا توجد عناوين H1 في هذه الصفحة.</p>
                )}
              </div>

              {/* H2 Headings */}
              <div className="space-y-1.5 p-3 rounded-lg bg-[#21262d] border border-[#30363d]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-purple-400">
                    عناوين H2 ({data.h2.length}):
                  </span>
                  <CopyButton text={data.h2.join('\n')} variant="ghost" label="نسخ H2" />
                </div>
                {data.h2.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto space-y-1 text-xs text-slate-300">
                    {data.h2.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 bg-[#161b22] p-2 rounded border border-[#30363d]/50">
                        <span className="text-purple-400 text-[11px] font-bold shrink-0">H2</span>
                        <span className="truncate select-all">{item}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">لا توجد عناوين H2.</p>
                )}
              </div>
            </div>

            {/* Col 2: Top Words & Frequency */}
            <div className="st-card p-5 space-y-4 flex flex-col">
              <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                    <span>📊</span> الكلمات الأكثر تكراراً
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    إجمالي الكلمات المعالجة: {data.totalWordsCount.toLocaleString()}
                  </p>
                </div>
                <CopyButton
                  text={data.topWords.map((w) => `${w.word}: ${w.count} (${w.percentage}%)`).join('\n')}
                  label="نسخ الكلمات"
                  variant="badge"
                />
              </div>

              {/* Quick filter input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={keywordFilter}
                  onChange={(e) => setKeywordFilter(e.target.value)}
                  placeholder="تصفية الكلمات المفتاحية..."
                  className="w-full bg-[#0e1117] border border-[#30363d] rounded-lg ltr:pl-9 rtl:pr-9 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Word list */}
              <div className="flex-1 max-h-[460px] overflow-y-auto space-y-1.5 pr-1">
                {filteredKeywords && filteredKeywords.length > 0 ? (
                  filteredKeywords.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-[#21262d] hover:bg-[#282f38] border border-[#30363d] transition-colors group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-[#161b22] text-slate-400 text-[10px] font-mono flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-xs text-slate-100 truncate select-all">
                          {item.word}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#161b22] text-cyan-300 border border-[#30363d]">
                          تكرار {item.count} مرة
                        </span>
                        <CopyButton text={item.word} variant="icon" title="نسخ الكلمة" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-500 text-xs italic">
                    لم يتم العثور على كلمات مميزة تطابق البحث.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Report Section */}
          {data.aiReport && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-200">
                    🤖 تحليل استراتيجية التصدر بواسطة الذكاء الاصطناعي (Ollama / Gemini)
                  </h3>
                </div>
                {/* Specific copy button requested */}
                <CopyButton
                  text={data.aiReport}
                  label="نسخ تقرير الاستراتيجية"
                  copiedLabel="تم نسخ التقرير بنجاح!"
                  className="bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border-purple-500/40"
                />
              </div>

              {/* Professional Long Text Viewer with search, line numbers, and fullscreen */}
              <LongTextViewer
                content={data.aiReport}
                title="تقرير استراتيجية الـ SEO والكلمات المفتاحية"
                subtitle={`الموقع: ${data.url}`}
                language="markdown"
                downloadFilename={`seo_report_${new URL(data.url).hostname}.md`}
                maxInitialHeight="max-h-[500px]"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
