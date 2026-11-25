import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next 内置类型检查器在部分受限环境会 spawn EPERM；CI 单独跑 npm run typecheck。
  typescript: { ignoreBuildErrors: true },
  // 有意不开 cacheComponents：让页面按最经典的 Next.js 行为工作，
  // 与 AI / 教程里的共识一致，降低 vibe coding 出意外的概率。
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
