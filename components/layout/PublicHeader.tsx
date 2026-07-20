// ====================================================================
// 公开页面共享顶部导航
// ====================================================================
// 用于 blog / about / methodology / privacy / terms 等公开内容页
// （这些页面无登录态逻辑，保持静态渲染）。
// Landing / Pricing 有各自的定制 header（含 CTA / 登录态），不用此组件。
// ====================================================================

import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./LanguageSwitcher";

export async function PublicHeader() {
  const t = await getTranslations("landing");

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            W
          </div>
          <span className="font-semibold">WriteFit</span>
        </Link>
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <Button variant="ghost" size="sm" render={<Link href="/pricing" />}>
            {t("nav.pricing")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
            render={<Link href="/methodology" />}
          >
            {t("nav.methodology")}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
            render={<Link href="/blog" />}
          >
            {t("nav.blog")}
          </Button>
        </div>
      </div>
    </header>
  );
}
