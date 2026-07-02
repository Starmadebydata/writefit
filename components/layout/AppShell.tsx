"use client";

// ====================================================================
// 应用主框架组件
// ====================================================================
// 这是登录后所有页面的"外壳"，包含：
// - 左侧侧边栏（Sidebar）
// - 顶部导航栏（TopNav）
// - 中间内容区域
//
// 就像大楼的整体结构：楼梯 + 走廊 + 房间
// 每个页面只需要提供"房间里的内容"就行
// ====================================================================

import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";

interface AppShellProps {
  children: React.ReactNode;
  // 当前页面标题
  title: string;
  // 当前用户信息
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function AppShell({ children, title, user }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* 左侧侧边栏 */}
      <Sidebar />

      {/* 右侧主内容区 */}
      <div className="flex flex-1 flex-col min-w-0">
        <TopNav title={title} user={user} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
