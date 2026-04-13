'use client';

export type DateRange = 'all' | 'today' | 'week' | 'month';

const OPTIONS: { value: DateRange; label: string }[] = [
  { value: 'all',   label: 'すべて' },
  { value: 'today', label: '今日' },
  { value: 'week',  label: '今週' },
  { value: 'month', label: '今月' },
];

export function DateFilter({
  active,
  onChange,
}: {
  active: DateRange;
  onChange: (r: DateRange) => void;
}) {
  return (
    <div className="flex gap-1.5 items-center">
      <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
            active === opt.value
              ? 'bg-gray-900 dark:bg-slate-100 text-white dark:text-slate-900'
              : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-700 dark:hover:text-slate-200'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function filterByDate(publishedAt: string | undefined, range: DateRange): boolean {
  if (range === 'all' || !publishedAt) return true;
  const date = new Date(publishedAt);
  if (isNaN(date.getTime())) return true;
  const now = new Date();
  const diffH = (now.getTime() - date.getTime()) / 3600000;
  if (range === 'today') return diffH < 24;
  if (range === 'week')  return diffH < 24 * 7;
  if (range === 'month') return diffH < 24 * 30;
  return true;
}
