import { TrendItem } from './types';

// OGP画像URLをHTMLから抽出
async function fetchOgImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(4000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FukuyamaTrends/1.0)' },
    });
    if (!res.ok) return null;
    const html = await res.text();

    // og:image を探す
    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    if (ogMatch?.[1]) {
      const src = ogMatch[1];
      // 相対URLを絶対URLに変換
      if (src.startsWith('http')) return src;
      const base = new URL(url);
      return new URL(src, base.origin).href;
    }

    // twitter:image にフォールバック
    const twMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);
    if (twMatch?.[1] && twMatch[1].startsWith('http')) return twMatch[1];

    return null;
  } catch {
    return null;
  }
}

// 並列でOG画像を取得して各 item に追加（最大10件同時）
export async function enrichWithThumbnails(items: TrendItem[]): Promise<TrendItem[]> {
  const BATCH = 10;
  const result = [...items];

  for (let i = 0; i < result.length; i += BATCH) {
    const batch = result.slice(i, i + BATCH);
    const images = await Promise.allSettled(
      batch.map(item => item.url ? fetchOgImage(item.url) : Promise.resolve(null))
    );
    images.forEach((res, j) => {
      if (res.status === 'fulfilled' && res.value) {
        result[i + j] = { ...result[i + j], thumbnail: res.value };
      }
    });
  }

  return result;
}
