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
];

export const SEARCH_KEYWORDS = {
  gourmet: ['福山市 ランチ 人気', '福山 グルメ おすすめ', '福山 新規オープン レストラン'],
  events: ['福山市 イベント 今週', '福山 観光 スポット', '福山 お祭り 2026'],
  trends: ['福山市 話題', '福山 トレンド', '福山市 流行'],
};
