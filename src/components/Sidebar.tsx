import React from 'react';
import {
  Search,
  Zap,
  Layers,
  Bot,
  Compass,
  Code2,
  ExternalLink,
  Cpu,
} from 'lucide-react';

export type ToolType =
  | 'SEO & Keyword Extractor'
  | 'Requests & BS4'
  | 'Selenium (Extract Frames)'
  | 'Playwright'
  | 'Ollama Assistant';

interface SidebarProps {
  currentTool: ToolType;
  onSelectTool: (tool: ToolType) => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTool,
  onSelectTool,
  className = '',
}) => {
  const tools: {
    id: ToolType;
    label: string;
    sublabel: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    tag?: string;
  }[] = [
    {
      id: 'SEO & Keyword Extractor',
      label: 'SEO & Keyword Extractor',
      sublabel: 'استخراج الكلمات المفتاحية وتحليل الـ SEO',
      icon: Search,
      accentColor: 'text-cyan-400 group-hover:text-cyan-300',
      tag: 'شائع',
    },
    {
      id: 'Requests & BS4',
      label: 'Requests & BS4',
      sublabel: 'كاشط الويب الثابت وتحليل HTML',
      icon: Zap,
      accentColor: 'text-amber-400 group-hover:text-amber-300',
    },
    {
      id: 'Selenium (Extract Frames)',
      label: 'Selenium (Extract Frames)',
      sublabel: 'استخراج إطارات الـ iframes وروابط البث',
      icon: Layers,
      accentColor: 'text-emerald-400 group-hover:text-emerald-300',
      tag: 'ديناميكي',
    },
    {
      id: 'Playwright',
      label: 'Playwright',
      sublabel: 'فحص الأمان والـ DOM وهيكلة الصفحة',
      icon: Code2,
      accentColor: 'text-blue-400 group-hover:text-blue-300',
    },
    {
      id: 'Ollama Assistant',
      label: 'Ollama Assistant',
      sublabel: 'المساعد الذكي لكتابة الكود والتحليل',
      icon: Bot,
      accentColor: 'text-purple-400 group-hover:text-purple-300',
      tag: 'AI Pro',
    },
  ];

  return (
    <aside
      className={`w-full md:w-72 lg:w-80 shrink-0 bg-[#161b22] border-b md:border-b-0 md:border-l md:border-r border-[#30363d] flex flex-col p-4 select-none ${className}`}
    >
      {/* Title */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#30363d]">
        <Compass className="w-4 h-4 text-cyan-400" />
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          لوحة التحكم الرئيسية
        </h2>
      </div>

      {/* Navigation Options */}
      <nav className="flex flex-col gap-1.5 flex-1">
        {tools.map((item) => {
          const Icon = item.icon;
          const isActive = currentTool === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTool(item.id)}
              className={`group flex items-start gap-3 p-3 rounded-xl transition-all duration-200 text-right cursor-pointer relative overflow-hidden ${
                isActive
                  ? 'bg-[#21262d] border border-cyan-500/40 shadow-[0_0_16px_rgba(6,182,212,0.1)]'
                  : 'hover:bg-[#21262d]/60 border border-transparent hover:border-[#30363d]'
              }`}
            >
              {isActive && (
                <span className="absolute inset-y-0 ltr:left-0 rtl:right-0 w-1 bg-gradient-to-b from-cyan-400 to-indigo-500 rounded-full" />
              )}
              <div
                className={`p-2 rounded-lg shrink-0 transition-colors ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'bg-[#0e1117] text-slate-400 group-hover:text-slate-200 border border-[#30363d]'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`font-semibold text-xs truncate ${
                      isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'
                    }`}
                  >
                    {item.label}
                  </span>
                  {item.tag && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                        isActive
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-[#282f38] text-slate-400'
                      }`}
                    >
                      {item.tag}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1 leading-normal">
                  {item.sublabel}
                </p>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Info card at bottom matching Streamlit sidebar info */}
      <div className="mt-4 pt-3 border-t border-[#30363d]">
        <div className="bg-[#21262d]/80 rounded-xl p-3 border border-[#30363d] text-xs space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold">
            <Cpu className="w-4 h-4 shrink-0 text-cyan-400" />
            <span>محرك الذكاء الاصطناعي</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            💡 يدعم التحليل المباشر عبر Google Gemini 3.8 Flash مع التوافقية الكاملة لنماذج Ollama و Qwen.
          </p>
          <div className="text-[10px] text-slate-500 pt-1 flex items-center justify-between border-t border-[#30363d]/60">
            <span>تحديث الترميز التلقائي</span>
            <span className="text-emerald-400 font-mono">UTF-8 Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
