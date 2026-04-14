import { TrendItem } from './types';

export function exportAsText(items: TrendItem[]): void {
  const lines = [
    '福山トレンド エクスポート',
    `${new Date().toLocaleString('ja-JP')}`,
    `合計 ${items.length} 件`,
    '='.repeat(60),
    '',
    ...items.map((item, i) => [
      `${i + 1}. ${item.title}`,
      `   カテゴリ: ${item.category === 'gourmet' ? 'グルメ' : item.category === 'events' ? 'イベント' : 'トレンド'}`,
      `   情報源: ${item.source}`,
      item.publishedAt ? `   日時: ${new Date(item.publishedAt).toLocaleString('ja-JP')}` : null,
      item.summary ? `   概要: ${item.summary}` : null,
      item.url ? `   URL: ${item.url}` : null,
      '',
    ].filter((s): s is string => s !== null).join('\n')),
  ];

  const text = lines.join('\n');
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fukuyama-trends-${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportAsCSV(items: TrendItem[]): void {
  const header = 'タイトル,カテゴリ,情報源,日時,概要,URL';
  const esc = (s: string) => `"${(s ?? '').replace(/"/g, '""')}"`;
  const rows = items.map(item => [
    esc(item.title),
    esc(item.category),
    esc(item.source),
    esc(item.publishedAt ?? ''),
    esc(item.summary ?? ''),
    esc(item.url ?? ''),
  ].join(','));

  const csv = [header, ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }); // BOMでExcel対応
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fukuyama-trends-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
