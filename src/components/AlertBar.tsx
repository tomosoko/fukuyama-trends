'use client';

import { useState } from 'react';
import { addAlert, removeAlert } from '@/lib/keyword-alerts';

interface AlertBarProps {
  alerts: string[];
  onAlertsChange: (alerts: string[]) => void;
  currentSearch?: string;
}

export function AlertBar({ alerts, onAlertsChange, currentSearch }: AlertBarProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [input, setInput] = useState('');

  const handleAdd = (kw: string) => {
    const kw2 = kw.trim();
    if (!kw2) return;
    onAlertsChange(addAlert(kw2));
    setInput('');
    setShowAdd(false);
  };

  const handleRemove = (kw: string) => {
    onAlertsChange(removeAlert(kw));
  };

  const canAddSearch = currentSearch && !alerts.includes(currentSearch);

  if (alerts.length === 0 && !canAddSearch) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30">
      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide shrink-0">
        🔔 アラート
      </span>
      {alerts.map(kw => (
        <span key={kw} className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs rounded-full font-medium">
          {kw}
          <button
            onClick={() => handleRemove(kw)}
            className="w-3.5 h-3.5 rounded-full hover:bg-amber-200 dark:hover:bg-amber-800 flex items-center justify-center transition-colors"
          >
            ×
          </button>
        </span>
      ))}
      {canAddSearch && (
        <button
          onClick={() => handleAdd(currentSearch!)}
          className="flex items-center gap-1 px-2 py-0.5 bg-amber-500 text-white text-xs rounded-full font-medium hover:bg-amber-600 transition-colors"
        >
          + 「{currentSearch}」を追加
        </button>
      )}
      {showAdd ? (
        <form onSubmit={e => { e.preventDefault(); handleAdd(input); }} className="flex items-center gap-1">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            autoFocus
            placeholder="キーワード入力"
            className="text-xs px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 w-28 outline-none focus:ring-1 focus:ring-amber-400"
          />
          <button type="submit" className="text-xs text-amber-600 font-medium">追加</button>
          <button type="button" onClick={() => setShowAdd(false)} className="text-xs text-gray-400">×</button>
        </form>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="text-[10px] text-amber-400 hover:text-amber-600 transition-colors"
        >
          + キーワード
        </button>
      )}
    </div>
  );
}
