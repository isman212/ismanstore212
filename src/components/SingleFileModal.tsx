import React, { useMemo, useState } from 'react';
import { Download, Copy, Check, X, Code2 } from 'lucide-react';
import { generateSingleFileHtml } from '../utils/singleFileHtmlGenerator';

interface SingleFileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SingleFileModal: React.FC<SingleFileModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  const htmlSource = useMemo(() => {
    if (!isOpen) return '';
    return generateSingleFileHtml();
  }, [isOpen]);

  if (!isOpen) return null;

  function handleDownload() {
    const blob = new Blob([htmlSource], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ismanstore212.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleCopy() {
    navigator.clipboard.writeText(htmlSource);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Ekspor Kode HTML Tunggal ismanstore212"
    >
      <div className="bg-[#11151E] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Code2 className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-display text-lg font-bold text-slate-50">
                Versi Satu File HTML + CSS + JavaScript
              </h3>
              <p className="text-xs text-slate-400">
                Simpan sebagai <span className="font-mono text-slate-200">ismanstore212.html</span> dan buka langsung di browser mana saja
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-200 hover:bg-white/10 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  Kode Disalin
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Salin Semua Kode
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Unduh ismanstore212.html
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 overflow-auto flex-1 bg-[#090B10]">
          <pre className="font-mono text-xs leading-relaxed text-slate-300 whitespace-pre-wrap break-all">
            {htmlSource}
          </pre>
        </div>
      </div>
    </div>
  );
};
