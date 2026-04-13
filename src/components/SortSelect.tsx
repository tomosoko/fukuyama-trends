'use client';

export type SortOrder = 'newest' | 'oldest' | 'source';

const OPTIONS: { value: SortOrder; label: string }[] = [
  { value: 'newest', label: '新着順' },
  { value: 'oldest', label: '古い順' },
  { value: 'source', label: 'メディア別' },
];

export function SortSelect({
  value,
  onChange,
}: {
  value: SortOrder;
  onChange: (v: SortOrder) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
      </svg>
      <select
        value={value}
        onChange={e => onChange(e.target.value as SortOrder)}
        className="text-xs font-medium text-gray-500 dark:text-slate-400 bg-transparent border-none focus:outline-none cursor-pointer hover:text-gray-700 dark:hover:text-slate-200 transition-colors"
      >
        {OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}
