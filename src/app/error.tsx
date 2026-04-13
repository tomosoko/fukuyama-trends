'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col items-center justify-center px-4 text-center">
      <div className="text-8xl mb-6">⚠️</div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">
        エラーが発生しました
      </h1>
      <p className="text-gray-500 dark:text-slate-400 mb-8 max-w-xs">
        予期しないエラーが発生しました。再試行するかページを更新してください。
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20"
        >
          再試行
        </button>
        <a
          href="/"
          className="px-6 py-3 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 font-medium rounded-xl border border-gray-200 dark:border-slate-700 hover:border-gray-300 transition-colors"
        >
          ホームへ
        </a>
      </div>
    </div>
  );
}
