import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Maximize2,
  Minimize2,
  Search,
  Download,
  WrapText,
  ListOrdered,
  Type,
  ChevronDown,
  ChevronUp,
  X,
  FileText,
} from 'lucide-react';
import { CopyButton } from './CopyButton';

interface LongTextViewerProps {
  content: string;
  title?: string;
  subtitle?: string;
  language?: 'html' | 'json' | 'text' | 'markdown';
  initialCollapsed?: boolean;
  maxInitialHeight?: string; // e.g. 'max-h-96'
  allowDownload?: boolean;
  downloadFilename?: string;
  className?: string;
}

export const LongTextViewer: React.FC<LongTextViewerProps> = ({
  content = '',
  title = 'عرض النص الكامل',
  subtitle,
  language = 'text',
  initialCollapsed = false,
  maxInitialHeight = 'max-h-[460px]',
  allowDownload = true,
  downloadFilename = 'scraped_content.txt',
  className = '',
}) => {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [wrapLines, setWrapLines] = useState(true);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('sm');
  const [isMono, setIsMono] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const textContainerRef = useRef<HTMLDivElement>(null);

  // Statistics
  const stats = useMemo(() => {
    const chars = content.length;
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const lines = content.length ? content.split('\n').length : 0;
    return { chars, words, lines };
  }, [content]);

  // Line splitting
  const linesArray = useMemo(() => {
    return content.split('\n');
  }, [content]);

  // Search match count
  const searchMatchesCount = useMemo(() => {
    if (!searchQuery.trim()) return 0;
    try {
      const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      return (content.match(regex) || []).length;
    } catch {
      return 0;
    }
  }, [content, searchQuery]);

  // Handle file download
  const handleDownload = () => {
    const mimeTypes: Record<string, string> = {
      html: 'text/html;charset=utf-8',
      json: 'application/json;charset=utf-8',
      markdown: 'text/markdown;charset=utf-8',
      text: 'text/plain;charset=utf-8',
    };
    const blob = new Blob([content], { type: mimeTypes[language] || 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = downloadFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Keyboard escape for fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const fontSizeClasses = {
    sm: 'text-xs leading-5',
    base: 'text-sm leading-6',
    lg: 'text-base leading-7',
  }[fontSize];

  const renderContentBody = () => {
    if (!content) {
      return (
        <div className="py-12 text-center text-slate-500 italic">
          لا يوجد محتوى نصي متاح للعرض حالياً.
        </div>
      );
    }

    return (
      <div
        ref={textContainerRef}
        className={`relative overflow-auto p-4 transition-all duration-200 select-text ${fontSizeClasses} ${
          isMono ? 'font-mono' : 'font-sans'
        } ${!wrapLines ? 'whitespace-pre overflow-x-auto' : 'whitespace-pre-wrap break-words'}`}
      >
        {linesArray.map((line, idx) => {
          let lineContent: React.ReactNode = line;

          if (searchQuery.trim()) {
            const parts = line.split(new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
            lineContent = parts.map((part, pIdx) =>
              part.toLowerCase() === searchQuery.toLowerCase() ? (
                <mark
                  key={pIdx}
                  className="bg-amber-400 text-slate-950 font-semibold px-0.5 rounded shadow-sm"
                >
                  {part}
                </mark>
              ) : (
                part
              )
            );
          }

          return (
            <div key={idx} className="flex items-start hover:bg-slate-800/40 rounded px-1 group">
              {showLineNumbers && (
                <span
                  className="inline-block w-12 shrink-0 text-slate-600 text-right select-none font-mono text-[11px] ltr:mr-3 rtl:ml-3 group-hover:text-cyan-400/80 transition-colors"
                  dir="ltr"
                >
                  {idx + 1}
                </span>
              )}
              <span className="flex-1 text-slate-200 selection:bg-cyan-500/30 selection:text-cyan-100">
                {lineContent || '\u00A0'}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const toolbar = (
    <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 py-2.5 bg-[#161b22] border-b border-[#30363d] select-none">
      {/* Title & Badge */}
      <div className="flex items-center gap-2 min-w-0">
        <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
        <span className="font-semibold text-xs md:text-sm text-slate-200 truncate">{title}</span>
        {subtitle && (
          <span className="hidden sm:inline-block text-[11px] text-slate-400 bg-[#21262d] px-2 py-0.5 rounded border border-[#30363d] truncate">
            {subtitle}
          </span>
        )}
      </div>

      {/* Quick Text Stats */}
      <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-400 bg-[#0e1117]/80 px-2.5 py-1 rounded-md border border-[#30363d]/70">
        <span>
          الحروف: <strong className="text-slate-200">{stats.chars.toLocaleString()}</strong>
        </span>
        <span className="text-slate-600">|</span>
        <span>
          الكلمات: <strong className="text-slate-200">{stats.words.toLocaleString()}</strong>
        </span>
        <span className="text-slate-600">|</span>
        <span>
          الأسطر: <strong className="text-slate-200">{stats.lines.toLocaleString()}</strong>
        </span>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Search trigger */}
        <button
          onClick={() => setShowSearch(!showSearch)}
          title="بحث داخل النص"
          className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
            showSearch || searchQuery
              ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white hover:bg-[#21262d]'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
        </button>

        {/* Line numbers toggle */}
        <button
          onClick={() => setShowLineNumbers(!showLineNumbers)}
          title={showLineNumbers ? 'إخفاء أرقام الأسطر' : 'إظهار أرقام الأسطر'}
          className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
            showLineNumbers
              ? 'bg-[#21262d] text-cyan-400 border border-[#30363d]'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <ListOrdered className="w-3.5 h-3.5" />
        </button>

        {/* Wrap lines toggle */}
        <button
          onClick={() => setWrapLines(!wrapLines)}
          title={wrapLines ? 'إلغاء التفاف الأسطر (تمرير أفقي)' : 'تفعيل التفاف الأسطر'}
          className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
            wrapLines
              ? 'bg-[#21262d] text-cyan-400 border border-[#30363d]'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <WrapText className="w-3.5 h-3.5" />
        </button>

        {/* Font mono / sans toggle */}
        <button
          onClick={() => setIsMono(!isMono)}
          title={isMono ? 'التبديل إلى خط عادي' : 'التبديل إلى خط برمجي (Monospace)'}
          className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
            isMono
              ? 'bg-[#21262d] text-emerald-400 border border-[#30363d]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
        </button>

        {/* Font size cycler */}
        <button
          onClick={() => {
            setFontSize((prev) => (prev === 'sm' ? 'base' : prev === 'base' ? 'lg' : 'sm'));
          }}
          title="تغيير حجم الخط"
          className="px-2 py-1 text-[11px] font-semibold text-slate-400 hover:text-white bg-[#21262d] hover:bg-[#30363d] rounded border border-[#30363d] transition-colors cursor-pointer"
        >
          {fontSize.toUpperCase()}
        </button>

        {/* Download file */}
        {allowDownload && (
          <button
            onClick={handleDownload}
            title="تحميل كملف"
            className="p-1.5 rounded-md text-xs text-slate-400 hover:text-cyan-400 hover:bg-[#21262d] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Dedicated Copy Button - Main feature requested! */}
        <CopyButton
          text={content}
          label="نسخ الاستجابة"
          copiedLabel="تم النسخ بنجاح!"
          title="نسخ النص الكامل إلى الحافظة"
          className="bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border-cyan-500/30"
        />

        {/* Fullscreen Modal trigger */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          title={isFullscreen ? 'تصغير' : 'تكبير ملء الشاشة'}
          className="p-1.5 rounded-md text-xs text-slate-400 hover:text-white hover:bg-[#21262d] transition-colors cursor-pointer"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Collapse toggle if not fullscreen */}
        {!isFullscreen && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'عرض المحتوى' : 'طي المحتوى'}
            className="p-1.5 rounded-md text-xs text-slate-400 hover:text-white hover:bg-[#21262d] transition-colors cursor-pointer"
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );

  const searchBar = showSearch && (
    <div className="flex items-center gap-2 px-4 py-2 bg-[#0e1117] border-b border-[#30363d]/80 text-xs animate-in slide-in-from-top-1">
      <Search className="w-3.5 h-3.5 text-slate-500" />
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="ابحث داخل النص أو الكود..."
        className="flex-1 bg-transparent border-none text-slate-200 placeholder:text-slate-600 focus:outline-none"
        autoFocus
      />
      {searchQuery && (
        <span className="text-[11px] text-slate-400 px-2 py-0.5 rounded bg-[#21262d] border border-[#30363d]">
          {searchMatchesCount} تطابق
        </span>
      )}
      <button
        onClick={() => {
          setSearchQuery('');
          setShowSearch(false);
        }}
        className="p-1 text-slate-500 hover:text-slate-300 rounded cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  // Fullscreen Modal Render
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-[#0e1117] backdrop-blur-md animate-in fade-in duration-150">
        <div className="flex-none shadow-lg">{toolbar}</div>
        {searchBar}
        <div className="flex-1 overflow-auto bg-[#0a0d12]">{renderContentBody()}</div>
        <div className="flex-none px-4 py-2 text-xs bg-[#161b22] border-t border-[#30363d] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            وضع ملء الشاشة (اضغط ESC للخروج)
          </span>
          <CopyButton
            text={content}
            label="نسخ إلى الحافظة"
            copiedLabel="تم النسخ!"
            variant="badge"
          />
        </div>
      </div>
    );
  }

  // Normal Card View
  return (
    <div
      className={`rounded-xl border border-[#30363d] bg-[#12161d] overflow-hidden shadow-lg transition-all duration-200 hover:border-[#3d4550] ${className}`}
    >
      {toolbar}
      {searchBar}

      {!isCollapsed && (
        <div
          className={`${maxInitialHeight} overflow-y-auto bg-[#0b0e14] scroll-smooth`}
        >
          {renderContentBody()}
        </div>
      )}

      {isCollapsed && (
        <div
          onClick={() => setIsCollapsed(false)}
          className="p-3 text-center text-xs text-cyan-400/90 hover:text-cyan-300 hover:bg-[#161b22] cursor-pointer flex items-center justify-center gap-1.5 transition-colors border-t border-[#30363d]/50"
        >
          <ChevronDown className="w-3.5 h-3.5" />
          <span>المحتوى مطوي (اضغط لعرض {stats.lines.toLocaleString()} سطر / {stats.chars.toLocaleString()} حرف)</span>
        </div>
      )}
    </div>
  );
};
