import React from 'react';
import {
  Globe,
  History,
  Sparkles,
  Layers,
  Terminal,
  Languages,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenHistory: () => void;
  historyCount: number;
  isRtl: boolean;
  onToggleRtl: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenHistory,
  historyCount,
  isRtl,
  onToggleRtl,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#161b22]/95 backdrop-blur border-b border-[#30363d] px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand / Title */}
        <div className="flex items-center gap-3 select-none">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 p-0.5 shadow-md shadow-cyan-500/10 flex items-center justify-center">
            <span className="text-xl">🕷️</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base md:text-lg font-bold text-white tracking-tight">
                All-in-One Scraper Pro
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                PRO v2.5
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              محرك استخراج البيانات المتقدم، تحليل الـ SEO، والإطارات مع الذكاء الاصطناعي
            </p>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {/* Quick AI Trigger */}
          <button
            onClick={() => onTabChange('Ollama Assistant')}
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'Ollama Assistant'
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                : 'bg-[#21262d] text-slate-300 hover:text-white hover:bg-[#30363d] border border-[#30363d]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>المساعد الذكي</span>
          </button>

          {/* History drawer button */}
          <button
            onClick={onOpenHistory}
            title="سجل العمليات السابقة"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#21262d] hover:bg-[#30363d] text-slate-300 hover:text-white border border-[#30363d] transition-all cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">السجل</span>
            {historyCount > 0 && (
              <span className="bg-cyan-500/30 text-cyan-300 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                {historyCount}
              </span>
            )}
          </button>

          {/* RTL / LTR toggle */}
          <button
            onClick={onToggleRtl}
            title={isRtl ? 'Switch to LTR' : 'التحويل إلى نمط RTL العربي'}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-[#21262d] hover:bg-[#30363d] text-slate-300 hover:text-white border border-[#30363d] transition-all cursor-pointer"
          >
            <Languages className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-semibold">{isRtl ? 'عربي' : 'LTR'}</span>
          </button>

          {/* System status pill */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#21262d]/60 border border-[#30363d] text-[11px] text-slate-400 select-none">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>الخادم متصل</span>
          </div>
        </div>
      </div>
    </header>
  );
};
