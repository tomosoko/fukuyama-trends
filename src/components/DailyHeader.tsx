'use client';

import { useMemo, useState, useEffect } from 'react';

// 月ごとの福山おすすめ情報
const MONTHLY_TIPS: Record<number, string> = {
  1:  '成人式・初詣シーズン',
  2:  'バレンタインチョコ特集',
  3:  '卒業式・お花見情報',
  4:  '入学・春のお出かけ情報',
  5:  'ばら祭開催中！',
  6:  '梅雨・アジサイスポット',
  7:  '夏祭り・花火大会',
  8:  '鞆の浦・海水浴シーズン',
  9:  '秋の行楽情報',
  10: '紅葉スポット・食欲の秋',
  11: '福山城ライトアップ',
  12: 'クリスマス・年末特集',
};

// 曜日ごとのアドバイス
const DAY_TIPS: Record<number, string> = {
  0: '日曜日 — ゆったり観光日和',
  1: '月曜日 — 週のスタートはランチで栄養補給',
  2: '火曜日 — 新着グルメをチェック',
  3: '水曜日 — 週半ば、今週のイベントを確認',
  4: '木曜日 — 週末のお出かけ計画を立てよう',
  5: '金曜日 — 今夜は福山の居酒屋へ',
  6: '土曜日 — 鞆の浦や福山城を散策しよう',
};

function getDateInfo() {
  const now = new Date();
  return {
    dateStr: now.toLocaleDateString('ja-JP', {
      year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
    }),
    dayTip: DAY_TIPS[now.getDay()],
    monthTip: MONTHLY_TIPS[now.getMonth() + 1],
  };
}

export function DailyHeader() {
  const [info, setInfo] = useState(getDateInfo);

  // 真夜中に日付を更新する
  useEffect(() => {
    const scheduleUpdate = () => {
      const now = new Date();
      const msUntilMidnight =
        new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();
      const id = setTimeout(() => {
        setInfo(getDateInfo());
        scheduleUpdate();
      }, msUntilMidnight);
      return id;
    };
    const id = scheduleUpdate();
    return () => clearTimeout(id);
  }, []);

  const { dateStr, dayTip, monthTip } = info;

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-lg">
        📅
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 truncate">{dateStr}</p>
        <p className="text-xs text-indigo-500 dark:text-indigo-400 truncate">{dayTip}</p>
      </div>
      {monthTip && (
        <span className="shrink-0 text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 font-medium px-2 py-1 rounded-lg">
          {monthTip}
        </span>
      )}
    </div>
  );
}
