import React from 'react';
import { History, X, Trash2, ArrowUpRight, Clock, Globe } from 'lucide-react';
import { ScrapeHistoryItem } from '../types/scraper';
import { CopyButton } from './CopyButton';

interface ScrapeHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: ScrapeHistoryItem[];
  onSelectUrl: (url: string) => void;
  onClearHistory: () => void;
}

export const ScrapeHistoryModal: React.FC<ScrapeHistoryModalProps> = ({
  isOpen,
  onClose,
  items,
  onSelectUrl,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#12161d]">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">سجل المواقع والعمليات السابقة</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#21262d] text-slate-400 border border-[#30363d]">
              {items.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {items.length > 0 && (
              <button
                onClick={onClearHistory}
                title="مسح السجل"
                className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          {items.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              لا توجد عمليات فحص مسجلة حتى الآن.
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-[#21262d] hover:bg-[#282f38] border border-[#30363d] transition-all flex items-center justify-between gap-3 text-xs group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-slate-200 truncate">
                      {item.title || item.url}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#161b22] text-cyan-400 border border-[#30363d]">
                      {item.tool}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono" dir="ltr">
                    <Globe className="w-3 h-3 text-slate-500 shrink-0" />
                    <span className="truncate">{item.url}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <CopyButton text={item.url} variant="icon" title="نسخ الرابط" />
                  <button
                    onClick={() => {
                      onSelectUrl(item.url);
                      onClose();
                    }}
                    title="تحميل الرابط وفحصه"
                    className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 cursor-pointer"
                  >
                    <span>فحص</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
