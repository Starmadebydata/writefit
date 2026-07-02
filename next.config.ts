import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Workers 运行时需要这些配置
  // 让 Next.js 在 Cloudflare 边缘节点上正常运行
  experimental: {
    // 允许在服务端组件中直接访问 Cloudflare 绑定资源（如 D1 数据库）
  },
  // 图片优化在 Cloudflare 上需要特殊处理，先关闭
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
