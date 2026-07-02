// ====================================================================
// 路由保护中间件
// ====================================================================
// 这个文件就像大厦入口的保安，检查每个请求：
// - 未登录的用户不能进入 /dashboard、/practice 等私有页面
// - 未登录的用户可以访问首页、登录页
// - 未完成 Onboarding 的用户会被引导到 /onboarding
//
// 工作流程：
// 1. 用户访问某个页面 → 中间件先检查是否有登录令牌
// 2. 没有令牌 → 跳转到登录页
// 3. 有令牌但没完成 Onboarding → 跳转到 /onboarding
// 4. 有令牌且已完成 Onboarding → 放行
// ====================================================================

import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";

// 需要登录才能访问的页面路径
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
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // 检查当前路径是否是需要保护的页面
  // /practice/dev 和 /ai-setup 是开发测试页面，不需要登录
  const isProtectedPath = protectedPaths.some((path) =>
    nextUrl.pathname.startsWith(path)
  ) && !nextUrl.pathname.startsWith("/practice/dev") && !nextUrl.pathname.startsWith("/ai-setup");

  // 如果是需要保护的页面，但用户没登录 → 跳转到登录页
  if (isProtectedPath && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/login", nextUrl));
  }

  // 如果用户已登录但访问登录页 → 跳转到 Dashboard
  if (isLoggedIn && nextUrl.pathname === "/auth/login") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // 其他情况放行
  return NextResponse.next();
});

// 配置中间件匹配的路径
export const config = {
  matcher: [
    // 匹配所有路径，但排除以下内容：
    // - api/auth 开头的登录 API 路由
    // - _next/static 开头的静态资源
    // - _next/image 开头的图片优化
    // - favicon.ico
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
