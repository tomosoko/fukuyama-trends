export type Category = 'all' | 'gourmet' | 'events' | 'trends';

export interface TrendItem {
  id: string;
  title: string;
  summary: string;
  url?: string;
  source: string;
  category: Exclude<Category, 'all'>;
  publishedAt?: string;
  thumbnail?: string;
}

export interface AISummary {
  highlight: string;
  items: {
    category: string;
    text: string;
  }[];
}
