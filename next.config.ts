import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // OG画像取得先の外部ドメインを許可
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http',  hostname: '**' },
    ],
  },
};

export default nextConfig;
