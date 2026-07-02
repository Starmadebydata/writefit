"use client";

// ====================================================================
// 侧边栏导航组件
// ====================================================================
// 这是登录后页面的左侧导航栏，用户可以通过它切换不同功能页面
// 就像一栋大楼每层的楼层指引牌
//
// 包含的导航项：
// - Dashboard 仪表盘（主页）
// - Practice 今日训练
// - Sentence Gym 句子训练
// - Drafts 草稿实验室
// - Ideas 素材库
// - Progress 进度
// - Settings 设置
// ====================================================================

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PenLine,
  Scissors,
  FileText,
  Lightbulb,
  TrendingUp,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

// 导航项配置
const navItems = [
  {
    label: "Dashboard",
    labelZh: "仪表盘",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Practice",
    labelZh: "今日训练",
    href: "/practice/today",
    icon: PenLine,
  },
  {
    label: "Sentence Gym",
    labelZh: "句子训练",
    href: "/sentence-gym",
    icon: Scissors,
  },
  {
    label: "Drafts",
    labelZh: "草稿实验室",
    href: "/drafts",
    icon: FileText,
  },
  {
    label: "Ideas",
    labelZh: "素材库",
    href: "/ideas",
    icon: Lightbulb,
  },
  {
    label: "Progress",
    labelZh: "进度",
    href: "/progress",
    icon: TrendingUp,
  },
  {
    label: "Settings",
    labelZh: "设置",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-60 flex-col border-r border-border bg-sidebar min-h-screen">
      {/* Logo 区域 */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
          W
        </div>
        <span className="font-semibold text-lg text-sidebar-foreground">
          WriteFit
        </span>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* 底部：训练提示 */}
      <div className="px-4 py-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          每天 15 分钟
          <br />
          训练你自己的写作能力
        </p>
      </div>
    </aside>
  );
}
