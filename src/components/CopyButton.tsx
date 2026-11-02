import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  label?: string;
  copiedLabel?: string;
  variant?: 'icon' | 'badge' | 'button' | 'ghost';
  className?: string;
  title?: string;
  onCopySuccess?: () => void;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  label = 'نسخ',
  copiedLabel = 'تم النسخ!',
  variant = 'button',
  className = '',
  title = 'نسخ إلى الحافظة',
  onCopySuccess,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for non-https or older browser context
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopied(true);
      if (onCopySuccess) onCopySuccess();
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleCopy}
        title={copied ? copiedLabel : title}
        aria-label={title}
        className={`p-1.5 rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center ${
          copied
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
            : 'text-slate-400 hover:text-slate-100 hover:bg-[#21262d] border border-transparent hover:border-[#30363d]'
        } ${className}`}
      >
        {copied ? <Check className="w-4 h-4 text-emerald-400 animate-in zoom-in" /> : <Copy className="w-4 h-4" />}
      </button>
    );
  }

  if (variant === 'badge') {
    return (
      <button
        onClick={handleCopy}
        title={title}
        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md transition-all duration-200 cursor-pointer ${
          copied
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            : 'bg-[#21262d] text-slate-300 hover:text-white hover:bg-[#30363d] border border-[#30363d]'
        } ${className}`}
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>{copiedLabel}</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-slate-400" />
            <span>{label}</span>
          </>
        )}
      </button>
    );
  }

  if (variant === 'ghost') {
    return (
      <button
        onClick={handleCopy}
        title={title}
        className={`inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer py-1 px-2 rounded hover:bg-slate-800/50 ${className}`}
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 font-medium">{copiedLabel}</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            <span>{label}</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleCopy}
      title={title}
      className={`inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer select-none active:scale-95 ${
        copied
          ? 'bg-emerald-600/90 text-white shadow-[0_0_16px_rgba(16,185,129,0.4)] border border-emerald-500'
          : 'bg-[#21262d] text-slate-200 hover:text-white hover:bg-[#2b323c] border border-[#30363d] hover:border-slate-500 shadow-sm'
      } ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-emerald-300 animate-in zoom-in" />
          <span>{copiedLabel}</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 text-cyan-400" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
};
