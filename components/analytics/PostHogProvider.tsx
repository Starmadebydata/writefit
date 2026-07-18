// ====================================================================
// PostHog 分析 Provider
// ====================================================================
// 仅当配置了 NEXT_PUBLIC_POSTHOG_KEY 时才初始化 posthog-js。
// 未配置时：直接渲染 children，posthog-js 通过动态 import 懒加载，
// 不会被加载执行，完全静默。
//
// 注意：process.env.NEXT_PUBLIC_* 必须直接字面引用，
// Next.js 在构建时内联替换，不能用变量间接访问。
// ====================================================================

"use client";

import { useEffect } from "react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;

    // 防止 StrictMode 下 effect 重跑导致的重复初始化
    let cancelled = false;

    import("posthog-js").then(({ default: posthog }) => {
      if (cancelled || posthog.__loaded) return;

      posthog.init(key, {
        api_host:
          process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
        // 只为已识别用户创建画像，减少匿名数据噪音
        person_profiles: "identified_only",
        capture_pageview: true,
        mask_all_element_attributes: false,
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return <>{children}</>;
}
