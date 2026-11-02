import React, { useState } from 'react';
import {
  Zap,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Code2,
  Link2,
  Image,
  Sliders,
  Terminal,
} from 'lucide-react';
import { StaticScrapeResult } from '../types/scraper';
import { CopyButton } from './CopyButton';
import { LongTextViewer } from './LongTextViewer';

interface StaticScraperProps {
  onScrapeCompleted: (url: string, title?: string) => void;
}

export const StaticScraper: React.FC<StaticScraperProps> = ({ onScrapeCompleted }) => {
  const [url, setUrl] = useState('https://example.com');
  const [maxChars, setMaxChars] = useState<number>(2000);
  const [selector, setSelector] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<StaticScrapeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'source' | 'links' | 'images' | 'headers'>('source');

  const handleFetch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/scrape/static', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          maxChars: Number(maxChars),
          selector: selector.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || `خطأ في الجلب (${res.status})`);
      }

      setData(json);
      onScrapeCompleted(json.url, json.title);
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || 'حدث خطأ في جلب بيانات الموقع الثابتة.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header section */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Zap className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight">
            ⚡ Static Scraper (Requests & BS4)
          </h2>
        </div>
        <p className="text-sm text-slate-400">
          محاكاة مكتبات بايثون Requests & BeautifulSoup لجلب كود الـ HTML الصافي وفحص الروابط والصور والترويسات بسرعة فائقة.
        </p>
      </div>

      {/* Form Card */}
      <div className="st-card p-5 space-y-4">
        <form onSubmit={handleFetch} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              أدخل الرابط الثابت (Target URL):
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                dir="ltr"
                className="flex-1 bg-[#0e1117] border border-[#30363d] focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 transition-colors font-mono"
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 active:scale-[0.98] transition-all shadow-md shadow-amber-600/20 cursor-pointer disabled:opacity-50 shrink-0"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري جلب البيانات...</span>
                  </>
                ) : (
                  <>
                    <span>⚡ جلب البيانات</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Characters limit */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                حجم العرض الأولي لمصدر الصفحة:
              </label>
              <select
                value={maxChars}
                onChange={(e) => setMaxChars(Number(e.target.value))}
                className="w-full bg-[#0e1117] border border-[#30363d] rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
              >
                <option value={1000}>أول 1,000 حرف (كما في الكود الأصلي)</option>
                <option value={3000}>أول 3,000 حرف</option>
                <option value={10000}>أول 10,000 حرف</option>
                <option value={0}>كامل مصدر الصفحة بدون اقتطاع (Full HTML)</option>
              </select>
            </div>

            {/* Optional CSS selector */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                محدد CSS اختياري للتصفية (مثل h1, .title, a):
              </label>
              <input
                type="text"
                value={selector}
                onChange={(e) => setSelector(e.target.value)}
                placeholder="مثال: h1, #content, .article-title"
                dir="ltr"
                className="w-full bg-[#0e1117] border border-[#30363d] rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </form>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="text-sm">
            <strong className="block font-semibold mb-1">فشل طلب Requests & BS4:</strong>
            <p className="text-red-300/90 text-xs">{error}</p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {data && !loading && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Main Title Badge Banner */}
          <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-xs text-amber-400 font-semibold block">العنوان الرئيسي (soup.title.string):</span>
              <h3 className="text-sm md:text-base font-bold text-white select-all">
                {data.title}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <CopyButton text={data.title} label="نسخ العنوان" variant="badge" />
              <CopyButton
                text={data.htmlSnippet}
                label="نسخ الـ HTML المعروض"
                copiedLabel="تم نسخ المصدر!"
                variant="button"
                className="bg-amber-500/20 text-amber-300 border-amber-500/40"
              />
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="metric-box p-3 text-center">
              <span className="text-[11px] text-slate-400 block mb-0.5">زمن الاستجابة</span>
              <span className="text-base font-bold text-white font-mono">{data.duration} ms</span>
            </div>
            <div className="metric-box p-3 text-center">
              <span className="text-[11px] text-slate-400 block mb-0.5">الحجم الإجمالي</span>
              <span className="text-base font-bold text-amber-400 font-mono">
                {(data.totalLength / 1024).toFixed(1)} KB
              </span>
            </div>
            <div className="metric-box p-3 text-center">
              <span className="text-[11px] text-slate-400 block mb-0.5">إجمالي الروابط (a)</span>
              <span className="text-base font-bold text-cyan-400 font-mono">{data.totalLinks}</span>
            </div>
            <div className="metric-box p-3 text-center">
              <span className="text-[11px] text-slate-400 block mb-0.5">إجمالي الصور (img)</span>
              <span className="text-base font-bold text-purple-400 font-mono">{data.totalImages}</span>
            </div>
          </div>

          {/* Sub-tabs for content */}
          <div className="flex items-center gap-2 border-b border-[#30363d] pb-2 text-xs">
            <button
              onClick={() => setActiveSubTab('source')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'source'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>مصدر الصفحة (HTML Source)</span>
            </button>
            <button
              onClick={() => setActiveSubTab('links')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'links'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>الروابط المستخرجة ({data.linksSample.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('images')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'images'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Image className="w-3.5 h-3.5" />
              <span>الصور المستخرجة ({data.imagesSample.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('headers')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'headers'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>ترويسات الاستجابة</span>
            </button>
          </div>

          {/* SubTab 1: Source Code in Enhanced LongTextViewer */}
          {activeSubTab === 'source' && (
            <div className="space-y-3">
              {data.selectorResults && data.selectorResults.length > 0 && (
                <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-amber-300">
                      نتائج محدد الـ CSS المحدد ({data.selectorResults.length} عنصر):
                    </span>
                    <CopyButton text={data.selectorResults.join('\n\n')} label="نسخ العناصر المحددة" variant="badge" />
                  </div>
                  <div className="space-y-1.5 font-mono text-xs max-h-40 overflow-y-auto">
                    {data.selectorResults.map((html, idx) => (
                      <pre key={idx} className="p-2 bg-[#0e1117] rounded border border-[#30363d] overflow-x-auto text-slate-300">
                        {html}
                      </pre>
                    ))}
                  </div>
                </div>
              )}

              <LongTextViewer
                content={data.htmlSnippet}
                title="كود مصدر الصفحة (Page Source HTML)"
                subtitle={`المعروض: ${data.snippetLength.toLocaleString()} من أصل ${data.totalLength.toLocaleString()} حرف`}
                language="html"
                downloadFilename={`source_${new URL(data.url).hostname}.html`}
                maxInitialHeight="max-h-[500px]"
              />
            </div>
          )}

          {/* SubTab 2: Links */}
          {activeSubTab === 'links' && (
            <div className="st-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300">
                  عينة من الروابط الموجودة في الصفحة ({data.linksSample.length}):
                </h4>
                <CopyButton
                  text={data.linksSample.map((l) => `${l.text}: ${l.href}`).join('\n')}
                  label="نسخ جميع الروابط"
                  variant="badge"
                />
              </div>

              <div className="max-h-96 overflow-y-auto space-y-1.5">
                {data.linksSample.map((link, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-[#21262d] hover:bg-[#282f38] border border-[#30363d] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="font-semibold text-slate-200 block truncate">
                        {link.text}
                      </span>
                      <span className="text-cyan-400 font-mono text-[11px] block truncate" dir="ltr">
                        {link.href}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <CopyButton text={link.href} variant="icon" title="نسخ الرابط" />
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-[#161b22]"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SubTab 3: Images */}
          {activeSubTab === 'images' && (
            <div className="st-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300">
                  الصور المستخرجة ({data.imagesSample.length}):
                </h4>
                <CopyButton
                  text={data.imagesSample.map((img) => img.src).join('\n')}
                  label="نسخ روابط الصور"
                  variant="badge"
                />
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {data.imagesSample.map((img, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-[#21262d] border border-[#30363d] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0 flex-1">
                      <span className="text-slate-300 block text-xs">
                        {img.alt || '(بدون نص بديل Alt)'}
                      </span>
                      <span className="text-purple-400 font-mono text-[11px] block truncate" dir="ltr">
                        {img.src}
                      </span>
                    </div>
                    <CopyButton text={img.src} variant="icon" title="نسخ رابط الصورة" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SubTab 4: Headers */}
          {activeSubTab === 'headers' && (
            <div className="st-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300">ترويسات الاستجابة (HTTP Headers):</h4>
                <CopyButton text={JSON.stringify(data.headers, null, 2)} label="نسخ الترويسات (JSON)" variant="badge" />
              </div>
              <div className="space-y-1 font-mono text-xs max-h-80 overflow-y-auto">
                {Object.entries(data.headers).map(([key, val], idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 rounded bg-[#0e1117] border border-[#30363d]/60">
                    <span className="text-cyan-400 font-semibold shrink-0" dir="ltr">{key}:</span>
                    <span className="text-slate-300 break-all" dir="ltr">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
