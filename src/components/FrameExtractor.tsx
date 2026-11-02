import React, { useState } from 'react';
import {
  Layers,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Play,
  Film,
  Radio,
  Eye,
  CheckCircle,
} from 'lucide-react';
import { FrameExtractionResult, FrameInfo } from '../types/scraper';
import { CopyButton } from './CopyButton';
import { LongTextViewer } from './LongTextViewer';

interface FrameExtractorProps {
  onScrapeCompleted: (url: string, title?: string) => void;
}

export const FrameExtractor: React.FC<FrameExtractorProps> = ({ onScrapeCompleted }) => {
  const [url, setUrl] = useState('https://siiir.tv');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FrameExtractionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewFrameSrc, setPreviewFrameSrc] = useState<string | null>(null);

  const handleExtract = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setPreviewFrameSrc(null);

    try {
      const res = await fetch('/api/scrape/iframes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || `خطأ أثناء استخراج الإطارات (${res.status})`);
      }

      setData(json);
      onScrapeCompleted(json.url, json.pageTitle);
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || 'حدث خطأ غير متوقع أثناء استخراج الإطارات.');
    } finally {
      setLoading(false);
    }
  };

  const allUrlsList = [
    ...(data?.frames.map((f) => f.src) || []),
    ...(data?.scriptStreamUrls || []),
    ...(data?.directVideos.map((v) => v.src) || []),
  ].join('\n');

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header section */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Layers className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-white tracking-tight">
            🌐 Dynamic Scraper - استخراج الإطارات (Selenium / Playwright)
          </h2>
        </div>
        <p className="text-sm text-slate-400">
          استخراج وحصر كافة إطارات الـ Iframes ومشغلات الفيديو وروابط البث الحي (m3u8/mpd) المدمجة داخل الصفحة.
        </p>
      </div>

      {/* Input Card */}
      <div className="st-card p-5 space-y-4">
        <form onSubmit={handleExtract} className="space-y-3">
          <label className="block text-xs font-semibold text-slate-300">
            أدخل الرابط الديناميكي المستهدف:
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://siiir.tv"
              dir="ltr"
              className="flex-1 bg-[#0e1117] border border-[#30363d] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 transition-colors font-mono"
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] transition-all shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50 shrink-0"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
                  <span>جاري تشغيل المتصفح وسحب الإطارات...</span>
                </>
              ) : (
                <>
                  <span>🚀 تشغيل استخراج الـ Iframes</span>
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
            <strong className="block font-semibold mb-1">تعذر استخراج الإطارات:</strong>
            <p className="text-red-300/90 text-xs">{error}</p>
          </div>
        </div>
      )}

      {/* Results Section */}
      {data && !loading && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Status Banner */}
          <div className="p-4 rounded-xl bg-[#161b22] border border-[#30363d] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-white">
                  تم العثور على {data.totalFrames} إطار (Iframe) و {data.scriptStreamUrls.length} رابط بث مخفي
                </h3>
                <span className="text-xs text-slate-400 font-mono" dir="ltr">
                  {data.pageTitle}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CopyButton
                text={allUrlsList}
                label="نسخ جميع الروابط المكتشفة"
                copiedLabel="تم نسخ كافة الروابط!"
                className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
              />
            </div>
          </div>

          {/* List of Extracted Iframes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Film className="w-4 h-4 text-emerald-400" />
                <span>قائمة الإطارات المستخرجة (Iframes List):</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {data.frames.length} إطار
              </span>
            </div>

            {data.frames.length > 0 ? (
              <div className="space-y-2.5">
                {data.frames.map((frame, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#161b22] hover:bg-[#1a2029] border border-[#30363d] transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#0e1117] text-emerald-400 border border-[#30363d] font-bold">
                          [{idx + 1}]
                        </span>
                        {frame.type === 'stream' && (
                          <span className="text-[10px] bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <Radio className="w-3 h-3 text-red-400 animate-pulse" />
                            مشغل بث حي / Live Stream
                          </span>
                        )}
                        {frame.type === 'video' && (
                          <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">
                            فيديو مدمج
                          </span>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => setPreviewFrameSrc(frame.src)}
                          title="معاينة الإطار"
                          className="px-2.5 py-1 text-xs rounded-lg bg-[#21262d] hover:bg-[#30363d] text-slate-300 hover:text-white border border-[#30363d] flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-cyan-400" />
                          <span>معاينة</span>
                        </button>
                        <a
                          href={frame.src}
                          target="_blank"
                          rel="noreferrer"
                          title="فتح في لسان جديد"
                          className="p-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-slate-300 hover:text-white border border-[#30363d]"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <CopyButton text={frame.src} label="نسخ" variant="button" />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#0e1117] border border-[#30363d]/80 font-mono text-xs text-emerald-300/90 break-all select-all" dir="ltr">
                      {frame.src}
                    </div>

                    {/* Metadata chips */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                      {frame.title && <span>العنوان: {frame.title}</span>}
                      {frame.width && <span>العرض: {frame.width}</span>}
                      {frame.height && <span>الارتفاع: {frame.height}</span>}
                      {frame.sandbox && (
                        <span className="text-amber-400">Sandbox: {frame.sandbox}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="st-card p-8 text-center text-slate-500 text-xs italic">
                لا توجد إطارات ظاهرية (No Iframes Found).
              </div>
            )}
          </div>

          {/* Hidden stream regex URLs (m3u8, player endpoints) */}
          {data.scriptStreamUrls.length > 0 && (
            <div className="st-card p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[#30363d] pb-2.5">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-red-400" />
                  <h4 className="text-xs font-bold text-white">
                    روابط تدفق وبث مستخرجة عبر Regular Expressions ({data.scriptStreamUrls.length}):
                  </h4>
                </div>
                <CopyButton
                  text={data.scriptStreamUrls.join('\n')}
                  label="نسخ روابط البث"
                  variant="badge"
                />
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {data.scriptStreamUrls.map((streamUrl, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-2.5 rounded-lg bg-[#0e1117] border border-[#30363d] flex items-center justify-between gap-3 text-xs"
                  >
                    <span className="font-mono text-red-300 break-all flex-1 select-all" dir="ltr">
                      {streamUrl}
                    </span>
                    <CopyButton text={streamUrl} variant="icon" title="نسخ رابط البث" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Safe Frame Preview */}
          {previewFrameSrc && (
            <div className="st-card p-4 space-y-3 border-cyan-500/40 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  معاينة مشغل الإطار المحدد (Safe Sandboxed Iframe):
                </span>
                <button
                  onClick={() => setPreviewFrameSrc(null)}
                  className="text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded bg-[#21262d] cursor-pointer"
                >
                  إغلاق المعاينة
                </button>
              </div>

              <div className="w-full aspect-video rounded-xl bg-black border border-[#30363d] overflow-hidden relative">
                <iframe
                  src={previewFrameSrc}
                  className="w-full h-full border-none"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                  title="Frame Preview"
                  loading="lazy"
                />
              </div>
            </div>
          )}

          {/* Long Text Export of All Frames */}
          <LongTextViewer
            content={allUrlsList}
            title="سجل كافة روابط الإطارات والبث المكتشفة"
            subtitle={`إجمالي الروابط: ${allUrlsList.split('\n').filter(Boolean).length}`}
            language="text"
            downloadFilename="extracted_frames.txt"
          />
        </div>
      )}
    </div>
  );
};
