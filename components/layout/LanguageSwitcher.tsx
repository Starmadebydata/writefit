"use client";

// ====================================================================
// 语言切换器
// ====================================================================
// 在英文和中文之间切换
// 切换时保持当前路径，只改变 locale 前缀
// ====================================================================

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLanguage() {
    // 切换到另一种语言
    const nextLocale = locale === "en" ? "zh" : "en";
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={switchLanguage}
      className="text-muted-foreground hover:text-foreground"
    >
      <Globe className="h-4 w-4 mr-1" />
      {locale === "en" ? "中文" : "EN"}
    </Button>
  );
}
