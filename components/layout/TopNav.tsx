"use client";

// ====================================================================
// 顶部导航栏组件
// ====================================================================
// 登录后页面的顶部栏，显示：
// - 当前页面标题
// - 用户头像和菜单（退出登录等）
//
// 就像大楼里每层的门牌号 + 用户身份卡
// ====================================================================

import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { LogOut, User } from "lucide-react";

interface TopNavProps {
  // 当前用户信息
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  // 当前页面标题
  title: string;
}

export function TopNav({ user, title }: TopNavProps) {
  const t = useTranslations("nav");
  const router = useRouter();

  // 获取用户名字首字母作为头像占位符
  const initials = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() ?? "U";

  // 跳转到设置页
  function goToSettings() {
    router.push("/settings");
  }

  // 退出登录，跳转到首页
  function handleSignOut() {
    signOut({ callbackUrl: "/", redirect: true });
  }

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-background">
      {/* 页面标题 */}
      <h1 className="text-lg font-semibold">{title}</h1>

      <div className="flex items-center gap-2">
        {/* 语言切换器 */}
        <LanguageSwitcher />

        {/* 用户菜单 */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon" className="rounded-full" />
            }
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? t("user")} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{user?.name ?? t("user")}</span>
                  <span className="text-xs text-muted-foreground font-normal">
                    {user?.email}
                  </span>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={goToSettings}>
              <User className="h-4 w-4" />
              {t("settings")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="flex items-center gap-2 text-destructive"
            >
              <LogOut className="h-4 w-4" />
              {t("logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
