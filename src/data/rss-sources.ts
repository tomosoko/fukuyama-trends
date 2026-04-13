export interface RssSource {
  name: string;
  url: string;
  category: 'gourmet' | 'events' | 'trends';
}

export const RSS_SOURCES: RssSource[] = [
  {
    name: '福山市公式',
    url: 'https://www.city.fukuyama.hiroshima.jp/rss/siteinfo.rdf',
    category: 'events',
  },
];

// Google News RSS — 「福山市」必須で検索して広島全域の混入を防ぐ
export const SEARCH_KEYWORDS: { query: string; category: 'gourmet' | 'events' | 'trends' }[] = [
  // グルメ
  { query: '福山市 グルメ ランチ',           category: 'gourmet' },
  { query: '福山市 カフェ 新規オープン',      category: 'gourmet' },
  { query: '福山市 居酒屋 人気',             category: 'gourmet' },
  { query: '福山市 ラーメン おすすめ',        category: 'gourmet' },
  { query: '福山市 スイーツ パン',            category: 'gourmet' },
  { query: '福山 駅前 飲食店 話題',          category: 'gourmet' },
  // イベント
  { query: '福山市 イベント 2026',            category: 'events' },
  { query: '福山市 お祭り 春',               category: 'events' },
  { query: '福山城 イベント',                 category: 'events' },
  { query: '福山市 コンサート ライブ',         category: 'events' },
  { query: '鞆の浦 イベント',                 category: 'events' },
  { query: 'ふくやまばら祭 2026',             category: 'events' },
  // トレンド
  { query: '福山市 話題 ニュース',            category: 'trends' },
  { query: '福山市 新規オープン 店舗',         category: 'trends' },
  { query: '福山 SNS 人気 スポット',          category: 'trends' },
  { query: '福山市 観光 おすすめ 2026',        category: 'trends' },
  { query: '福山市 開発 再開発',              category: 'trends' },
];
