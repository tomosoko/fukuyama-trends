import type { Metadata, Viewport } from "next";
import { Geist, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: '--font-geist' });
const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "福山トレンド",
  description: "福山市の最新トレンド・おすすめ情報をまとめてお届け",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "福山トレンド",
  },
  openGraph: {
    title: "福山トレンド",
    description: "福山市の最新トレンド・おすすめ情報",
    locale: "ja_JP",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#1d4ed8",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: '福山トレンド',
  description: '福山市の最新トレンド・おすすめ情報をまとめてお届け',
  url: 'https://fukuyama-trends.vercel.app',
  inLanguage: 'ja',
  about: {
    '@type': 'City',
    name: '福山市',
    containedInPlace: { '@type': 'State', name: '広島県' },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${geist.variable} ${notoSansJP.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-gray-50 dark:bg-slate-900">{children}</body>
    </html>
  );
}
