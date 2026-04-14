'use client';

const INFO = [
  { icon: '🏯', label: '福山城',    value: '1622年築城', url: 'https://www.fukuyamajo.jp/' },
  { icon: '🌹', label: 'バラのまち', value: '年間100万本', url: 'https://www.fukuyama-kankou.jp/' },
  { icon: '👥', label: '人口',       value: '約45万人',   url: null },
  { icon: '🗺️', label: '面積',       value: '518 km²',   url: null },
  { icon: '🎉', label: 'ばら祭',     value: '毎年5月',    url: 'https://www.fukuyama-kankou.jp/spot/rose/' },
  { icon: '🌊', label: '鞆の浦',     value: '国の名勝',   url: 'https://www.tomonoura.jp/' },
];

const QUICK_LINKS = [
  { label: '福山市公式', url: 'https://www.city.fukuyama.hiroshima.jp/', icon: '🏛️' },
  { label: '観光情報',   url: 'https://www.fukuyama-kankou.jp/',           icon: '🗾' },
  { label: 'ばら公園',   url: 'https://www.fukuyama-kankou.jp/spot/rose/', icon: '🌹' },
  { label: '鞆の浦',     url: 'https://www.tomonoura.jp/',                 icon: '⚓' },
];

export function FukuyamaInfo() {
  return (
    <section className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-base">🏯</span>
        <h2 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">福山市について</h2>
      </div>

      {/* インフォグリッド */}
      <div className="grid grid-cols-3 gap-2">
        {INFO.map(item => {
          const inner = (
            <>
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-xs font-semibold text-gray-700 dark:text-slate-300">{item.value}</span>
              <span className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{item.label}</span>
            </>
          );
          return item.url ? (
            <a
              key={item.label}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center text-center p-2 rounded-xl bg-gray-50 dark:bg-slate-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              {inner}
            </a>
          ) : (
            <div key={item.label} className="flex flex-col items-center text-center p-2 rounded-xl bg-gray-50 dark:bg-slate-700/50">
              {inner}
            </div>
          );
        })}
      </div>

      {/* クイックリンク */}
      <div className="grid grid-cols-2 gap-2">
        {QUICK_LINKS.map(link => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-slate-700/50 rounded-xl text-xs text-gray-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-colors"
          >
            <span>{link.icon}</span>
            <span className="font-medium truncate">{link.label}</span>
            <svg className="w-3 h-3 text-gray-300 dark:text-slate-600 ml-auto shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        ))}
      </div>

      <p className="text-xs text-gray-400 dark:text-slate-500 leading-relaxed">
        広島県東部に位置する中核市。バラの名所として知られ、鞆の浦や福山城など歴史的観光地も多い。
      </p>
    </section>
  );
}
