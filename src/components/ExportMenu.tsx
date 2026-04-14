'use client';

import { useState, useRef, useEffect } from 'react';
import { TrendItem } from '@/lib/types';
import { exportAsText, exportAsCSV } from '@/lib/export';
import { showToast } from './Toast';

export function ExportMenu({ items }: { items: TrendItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (items.length === 0) return null;

  const handleText = () => {
    exportAsText(items);
    setOpen(false);
    showToast('テキストでエクスポートしました', 'success');
  };
  const handleCSV = () => {
    exportAsCSV(items);
    setOpen(false);
    showToast('CSVでエクスポートしました', 'success');
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border border-gray-200 dark:border-slate-700"
        title="エクスポート"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span className="hidden sm:inline">エクスポート</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden z-10">
          <button
            onClick={handleText}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            <span>📄</span>
            テキスト (.txt)
          </button>
          <button
            onClick={handleCSV}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors border-t border-gray-100 dark:border-slate-700"
          >
            <span>📊</span>
            CSV (.csv)
          </button>
        </div>
      )}
    </div>
  );
}
