// ====================================================================
// Google Analytics (GA4) 集成
// ====================================================================
// 用 next/script 加载 gtag.js，afterInteractive 策略：
// 页面 hydration 后注入，不阻塞首屏渲染。
// 仅生产环境渲染，避免本地开发流量污染 GA 数据。
// GA4 增强衡量会自动追踪 SPA 路由切换的 page_view，无需手动上报。
// ====================================================================

import Script from "next/script";

const GA_ID = "G-62DHCM3SQV";

export function GoogleAnalytics() {
  if (process.env.NODE_ENV !== "production") return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  );
}
