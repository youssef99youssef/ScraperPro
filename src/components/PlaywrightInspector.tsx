import React, { useState } from 'react';
import {
  Code2,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  Layout,
  Smartphone,
  Tablet,
  Monitor,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import { AutomationResult } from '../types/scraper';
import { CopyButton } from './CopyButton';
import { LongTextViewer } from './LongTextViewer';

interface PlaywrightInspectorProps {
  onScrapeCompleted: (url: string, title?: string) => void;
}

export const PlaywrightInspector: React.FC<PlaywrightInspectorProps> = ({ onScrapeCompleted }) => {
  const [url, setUrl] = useState('https://example.com');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AutomationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const handleInspect = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/scrape/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || `خطأ أثناء فحص الأتمتة (${res.status})`);
      }

      setData(json);
      onScrapeCompleted(json.url, json.title);
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || 'حدث خطأ في تشغيل فحص Playwright.');
    } finally {
      setLoading(false);
    }
  };

  const getViewportWidth = () => {
    switch (viewportMode) {
      case 'mobile':
        return 'max-w-[390px]';
      case 'tablet':
        return 'max-w-[768px]';
      case 'desktop':
      default:
        return 'w-full';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header section */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Code2 className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight">
            🎭 Modern Automation (Playwright Inspector)
          </h2>
        </div>
        <p className="text-sm text-slate-400">
          محاكاة متصفح Playwright الحديث لفحص هيكلية الـ DOM، رؤوس الأمان (Security Headers)، ومحاكاة بطاقات المشاركة الاجتماعية.
        </p>
      </div>

      {/* Input Card */}
      <div className="st-card p-5 space-y-4">
        <form onSubmit={handleInspect} className="space-y-3">
          <label className="block text-xs font-semibold text-slate-300">
            أدخل رابط الموقع لاختباره عبر محرك Playwright:
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              dir="ltr"
              className="flex-1 bg-[#0e1117] border border-[#30363d] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 transition-colors font-mono"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.98] transition-all shadow-md shadow-blue-600/20 cursor-pointer disabled:opacity-50 shrink-0"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-200" />
                  <span>جاري تشغيل المتصفح الخفي وفحص الصفحة...</span>
                </>
              ) : (
                <>
                  <span>🎭 فحص عبر Playwright</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <strong className="block font-semibold mb-1">تعذر استكمال فحص Playwright:</strong>
            <p className="text-red-300/90 text-xs">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {data && !loading && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Main Title Badge */}
          <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs text-blue-400 font-semibold block">
                عنوان الصفحة المستهدفة (page.title()):
              </span>
              <h3 className="text-base font-bold text-white select-all">
                {data.title || 'بدون عنوان (No Title)'}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <CopyButton text={data.title} label="نسخ العنوان" variant="badge" />
              <CopyButton
                text={JSON.stringify(data, null, 2)}
                label="نسخ تقرير الفحص كاملاً"
                variant="button"
                className="bg-blue-600/20 text-blue-300 border-blue-500/40"
              />
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="metric-box p-3 text-center">
              <span className="text-[11px] text-slate-400 block mb-0.5">عناصر الـ DOM الكلية</span>
              <span className="text-lg font-bold text-white font-mono">
                {data.domSummary.totalElements.toLocaleString()}
              </span>
            </div>
            <div className="metric-box p-3 text-center">
              <span className="text-[11px] text-slate-400 block mb-0.5">النماذج وحقول الإدخال</span>
              <span className="text-lg font-bold text-cyan-400 font-mono">
                {data.domSummary.formsCount} نماذج / {data.domSummary.inputsCount} حقول
              </span>
            </div>
            <div className="metric-box p-3 text-center">
              <span className="text-[11px] text-slate-400 block mb-0.5">الأزرار التفاعلية</span>
              <span className="text-lg font-bold text-amber-400 font-mono">
                {data.domSummary.buttonsCount}
              </span>
            </div>
            <div className="metric-box p-3 text-center">
              <span className="text-[11px] text-slate-400 block mb-0.5">السكربتات والأنماط</span>
              <span className="text-lg font-bold text-purple-400 font-mono">
                {data.domSummary.scriptsCount} JS / {data.domSummary.stylesCount} CSS
              </span>
            </div>
          </div>

          {/* Security & Social Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Security Audit */}
            <div className="st-card p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[#30363d] pb-2.5">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>فحص ترويسات الأمان (Security Headers)</span>
                </h4>
                <CopyButton
                  text={JSON.stringify(data.securityCheck, null, 2)}
                  label="نسخ تقرير الأمان"
                  variant="badge"
                />
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-[#0e1117] border border-[#30363d]">
                  <span>بروتوكول HTTPS المشفر:</span>
                  <span
                    className={`font-semibold ${
                      data.securityCheck.hasHttps ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {data.securityCheck.hasHttps ? '✓ مشفر وآمن' : '✗ غير مشفر'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-[#0e1117] border border-[#30363d]">
                  <span>سياسة أمان المحتوى (CSP):</span>
                  <span
                    className={`font-mono text-[11px] truncate max-w-[200px] ${
                      data.securityCheck.hasCsp ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                    dir="ltr"
                  >
                    {data.securityCheck.hasCsp ? '✓ مفعل' : 'غير متوفر'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-[#0e1117] border border-[#30363d]">
                  <span>حماية التضمين (X-Frame-Options):</span>
                  <span className="text-cyan-400 font-mono text-[11px]" dir="ltr">
                    {data.securityCheck.xFrameOptions}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-[#0e1117] border border-[#30363d]">
                  <span>بروتوكول HSTS:</span>
                  <span
                    className={`font-semibold ${
                      data.securityCheck.hsts ? 'text-emerald-400' : 'text-slate-400'
                    }`}
                  >
                    {data.securityCheck.hsts ? '✓ مفعل إجبارياً' : 'غير مفعل'}
                  </span>
                </div>
              </div>
            </div>

            {/* Social Card Preview */}
            <div className="st-card p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[#30363d] pb-2.5">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-purple-400" />
                  <span>محاكاة بطاقة المشاركة والبحث (Social / Search Card)</span>
                </h4>
                <CopyButton
                  text={`العنوان: ${data.socialPreview.title}\nالوصف: ${data.socialPreview.description}`}
                  label="نسخ بيانات البطاقة"
                  variant="badge"
                />
              </div>

              {/* Google Search Snippet Simulation */}
              <div className="p-3.5 rounded-xl bg-[#202124] text-slate-100 border border-[#3c4043] space-y-1">
                <div className="text-[11px] text-[#bdc1c6] font-mono truncate" dir="ltr">
                  {data.url}
                </div>
                <h5 className="text-sm font-semibold text-[#8ab4f8] hover:underline cursor-pointer truncate">
                  {data.socialPreview.title}
                </h5>
                <p className="text-xs text-[#bdc1c6] line-clamp-2 leading-relaxed">
                  {data.socialPreview.description}
                </p>
              </div>
            </div>
          </div>

          {/* Long Text Full Inspection Log */}
          <LongTextViewer
            content={JSON.stringify(data, null, 2)}
            title="سجل الفحص التفصيلي لـ Playwright"
            subtitle={`الأصول: ${data.domSummary.totalElements} عنصر`}
            language="json"
            downloadFilename={`playwright_audit_${new URL(data.url).hostname}.json`}
          />
        </div>
      )}
    </div>
  );
};
