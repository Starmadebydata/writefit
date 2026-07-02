// ====================================================================
// 中间件：语言路由 + 认证保护
// ====================================================================
// 合并两个功能：
// 1. next-intl 的语言路由（检测 locale，重写 URL）
// 2. Auth.js 的认证保护（未登录用户不能访问私有页面）
//
// 工作流程：
// 1. 请求进来 → next-intl 中间件处理语言路由
// 2. 然后检查是否是需要保护的页面
// 3. 未登录 → 跳转到登录页
// 4. 已登录但访问登录页 → 跳转到 Dashboard
// ====================================================================

import createMiddleware from "next-intl/middleware";
import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";
import { routing } from "@/i18n/routing";

// next-intl 的语言路由中间件
const intlMiddleware = createMiddleware(routing);

// 需要登录才能访问的页面路径（不含 locale 前缀）
const protectedPaths = [
  "/dashboard",
  "/practice",
  "/sentence-gym",
  "/drafts",
  "/ideas",
  "/progress",
  "/settings",
];

export default auth((req) => {
  // 先让 next-intl 处理语言路由
  const intlResponse = intlMiddleware(req);

  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // 获取不含 locale 前缀的路径
  // 例如 /zh/dashboard → /dashboard，/dashboard → /dashboard
  let pathname = nextUrl.pathname;
  for (const locale of routing.locales) {
    if (pathname.startsWith(`/${locale}/`)) {
      pathname = pathname.slice(`/${locale}`.length);
      break;
    }
    if (pathname === `/${locale}`) {
      pathname = "/";
      break;
    }
  }

  // /practice/dev 和 /ai-setup 是开发测试页面，不需要登录
  const isProtectedPath =
    protectedPaths.some((path) => pathname.startsWith(path)) &&
    !pathname.startsWith("/practice/dev") &&
    !pathname.startsWith("/ai-setup");

  // 如果是需要保护的页面，但用户没登录 → 跳转到登录页
  if (isProtectedPath && !isLoggedIn) {
    // 构建登录页 URL（保留当前 locale）
    const locale = nextUrl.pathname.split("/")[1];
    const isLocalePrefix = routing.locales.includes(locale as "en" | "zh");
    const loginPath = isLocalePrefix
      ? `/${locale}/auth/login`
      : "/auth/login";
    return NextResponse.redirect(new URL(loginPath, nextUrl));
  }

  // 如果用户已登录但访问登录页 → 跳转到 Dashboard
  if (isLoggedIn && pathname === "/auth/login") {
    const locale = nextUrl.pathname.split("/")[1];
    const isLocalePrefix = routing.locales.includes(locale as "en" | "zh");
    const dashboardPath = isLocalePrefix
      ? `/${locale}/dashboard`
      : "/dashboard";
    return NextResponse.redirect(new URL(dashboardPath, nextUrl));
  }

  // 返回 next-intl 的响应（处理语言路由）
  return intlResponse;
});

// 中间件匹配的路径
export const config = {
  matcher: [
    // 匹配所有路径，但排除：
    // - api 开头的 API 路由
    // - _next/static 开头的静态资源
    // - _next/image 开头的图片优化
    // - favicon.ico
    // - 包含点号的文件（如 .png, .css 等）
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
