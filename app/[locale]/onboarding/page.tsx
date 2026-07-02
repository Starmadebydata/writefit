import type { Metadata } from "next";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";
import { setRequestLocale, getLocale, getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  const titles = {
    en: "Welcome to WriteFit | Set Up Your Writing Practice",
    zh: "欢迎使用 WriteFit | 设置你的写作训练",
  };

  const descriptions = {
    en: "Set your writing goals and start your daily write practice with WriteFit.",
    zh: "设置你的写作目标，开始每日写作训练。",
  };

  return {
    title: titles[locale as "en" | "zh"],
    description: descriptions[locale as "en" | "zh"],
    alternates: { canonical: "https://writefit.app/onboarding" },
    robots: { index: false, follow: false },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  const t = await getTranslations("common");

  return (
    <AppShell title={t("comingSoon")} user={session.user}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Construction className="h-6 w-6 text-primary" />
            <CardTitle>{t("comingSoon")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t("comingSoonDesc")}</p>
        </CardContent>
      </Card>
    </AppShell>
  );
}
