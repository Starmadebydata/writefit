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

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import {
  LayoutDashboard,
  PenLine,
  Scissors,
  FileText,
  Lightbulb,
  TrendingUp,
  Settings,
  Home,
  Drama,
} from "lucide-react";
import { cn } from "@/lib/utils";

// 导航项配置
const navItems = [
  {
    labelKey: "dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    labelKey: "practice",
    href: "/practice/today",
    icon: PenLine,
  },
  {
    labelKey: "sentenceGym",
    href: "/sentence-gym",
    icon: Scissors,
  },
  {
    labelKey: "characterWorkshop",
    href: "/character-workshop",
    icon: Drama,
  },
  {
    labelKey: "drafts",
    href: "/drafts",
    icon: FileText,
  },
  {
    labelKey: "ideas",
    href: "/ideas",
    icon: Lightbulb,
  },
  {
    labelKey: "progress",
    href: "/progress",
    icon: TrendingUp,
  },
  {
    labelKey: "settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-60 flex-col border-r border-border bg-sidebar min-h-screen">
      {/* Logo 区域（点击返回网站首页） */}
      <Link
        href="/"
        className="flex items-center gap-2 px-6 py-5 border-b border-border hover:bg-sidebar-accent/50 transition-colors"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
          W
        </div>
        <span className="font-semibold text-lg text-sidebar-foreground">
          WriteFit
        </span>
      </Link>

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
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </nav>

      {/* 底部：返回首页 + 训练提示 */}
      <div className="px-4 py-4 border-t border-border space-y-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-sidebar-foreground transition-colors"
        >
          <Home className="h-3.5 w-3.5" />
          {t("backToSite")}
        </Link>
        <p className="text-xs text-muted-foreground whitespace-pre-line">
          {t("footerTagline")}
        </p>
      </div>
    </aside>
  );
}
