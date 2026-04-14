const KEY = 'fk_keyword_alerts';

export function getAlerts(): string[] {
  if (typeof localStorage === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]'); } catch { return []; }
}

export function addAlert(keyword: string): string[] {
  const current = getAlerts();
  if (current.includes(keyword)) return current;
  const updated = [...current, keyword].slice(-10); // 最大10件
  localStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
}

export function removeAlert(keyword: string): string[] {
  const updated = getAlerts().filter(k => k !== keyword);
  localStorage.setItem(KEY, JSON.stringify(updated));
  return updated;
}

export function hasAlert(keyword: string): boolean {
  return getAlerts().includes(keyword);
}

export function matchesAlert(text: string, alerts: string[]): string | null {
  const lower = text.toLowerCase();
  return alerts.find(a => lower.includes(a.toLowerCase())) ?? null;
}
