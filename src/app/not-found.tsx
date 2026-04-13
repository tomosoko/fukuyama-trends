import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col items-center justify-center px-4 text-center">
      <div className="text-8xl mb-6">🏯</div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">
        ページが見つかりません
      </h1>
      <p className="text-gray-500 dark:text-slate-400 mb-8 max-w-xs">
        お探しのページは存在しないか、移動した可能性があります
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20"
      >
        ← 福山トレンドに戻る
      </Link>
    </div>
  );
}
