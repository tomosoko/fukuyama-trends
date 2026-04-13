'use client';

const INFO = [
  { icon: '🏯', label: '福山城', value: '1622年築城' },
  { icon: '🌹', label: 'バラのまち', value: '年間100万本' },
  { icon: '👥', label: '人口', value: '約45万人' },
  { icon: '🗺️', label: '面積', value: '518 km²' },
  { icon: '🎉', label: 'ばら祭', value: '毎年5月' },
  { icon: '🌊', label: '鞆の浦', value: '国の名勝' },
];

export function FukuyamaInfo() {
  return (
    <section className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">🏯</span>
        <h2 className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">福山市について</h2>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {INFO.map(item => (
          <div key={item.label} className="flex flex-col items-center text-center p-2 rounded-xl bg-gray-50 dark:bg-slate-700/50">
            <span className="text-xl mb-1">{item.icon}</span>
            <span className="text-xs font-semibold text-gray-700 dark:text-slate-300">{item.value}</span>
            <span className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{item.label}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 dark:text-slate-500 mt-3 leading-relaxed">
        広島県東部に位置する中核市。バラの名所として知られ、鞆の浦や福山城など歴史的観光地も多い。
      </p>
    </section>
  );
}
