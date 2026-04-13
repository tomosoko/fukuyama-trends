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
  {
    name: '広島県観光情報',
    url: 'https://www.kankou.pref.hiroshima.jp/rss/news.xml',
    category: 'events',
  },
  {
    name: '中国新聞',
    url: 'https://www.chugoku-np.co.jp/rss/local.xml',
    category: 'trends',
  },
  {
    name: 'じゃらん 福山',
    url: 'https://www.jalan.net/rss/sightseeing/250000.rss',
    category: 'gourmet',
  },
];

export const SEARCH_KEYWORDS: Record<string, { query: string; category: 'gourmet' | 'events' | 'trends' }[]> = {
  gourmet: [
    { query: '福山市 ランチ 人気 2026', category: 'gourmet' },
    { query: '福山 グルメ おすすめ 新店', category: 'gourmet' },
    { query: '福山市 カフェ 話題', category: 'gourmet' },
    { query: '福山 居酒屋 ランキング', category: 'gourmet' },
  ],
  events: [
    { query: '福山市 イベント 2026', category: 'events' },
    { query: '福山 観光 春 スポット', category: 'events' },
    { query: '福山城 イベント', category: 'events' },
    { query: '福山市 祭り 花見', category: 'events' },
  ],
  trends: [
    { query: '福山市 話題 ニュース', category: 'trends' },
    { query: '福山 SNS 話題 スポット', category: 'trends' },
    { query: '福山市 新規オープン', category: 'trends' },
    { query: '福山 インスタ映え', category: 'trends' },
  ],
};
