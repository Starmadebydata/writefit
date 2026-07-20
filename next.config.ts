import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// next-intl 插件：让 Next.js 识别 i18n/request.ts 配置
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

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
  // 安全响应头（CSP 暂不上强制版：next-intl/PostHog/内联脚本易被打破，
  // 如需 CSP 先用 Content-Security-Policy-Report-Only 观察）
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

// 用 next-intl 插件包装 Next.js 配置
export default withNextIntl(nextConfig);
