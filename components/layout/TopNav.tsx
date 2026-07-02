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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  // 获取用户名字首字母作为头像占位符
  const initials = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() ?? "U";

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-background">
      {/* 页面标题 */}
      <h1 className="text-lg font-semibold">{title}</h1>

      {/* 用户菜单 */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon" className="rounded-full" />
          }
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? "用户"} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span>{user?.name ?? "用户"}</span>
              <span className="text-xs text-muted-foreground font-normal">
                {user?.email}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<a href="/settings" />}>
            <User className="h-4 w-4" />
            设置
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 text-destructive"
          >
            <LogOut className="h-4 w-4" />
            退出登录
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
