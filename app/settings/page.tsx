// ====================================================================
// 设置页面
// ====================================================================
// 用户可以在这里配置自己的 AI 服务
// 目前包含：AI 服务配置
// 后续会加入：个人资料、通知设置等
// ====================================================================

import type { Metadata } from "next";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { AISettingsForm } from "@/components/settings/AISettingsForm";

// 设置页面 SEO
export const metadata: Metadata = {
  title: "Settings | WriteFit",
  description:
    "Manage your WriteFit account and AI writing coach settings.",
  keywords: ["WriteFit settings", "AI writing coach settings"],
  alternates: {
    canonical: "https://writefit.app/settings",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <AppShell title="设置" user={session.user}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* AI 设置 */}
        <AISettingsForm />

        {/* 后续功能占位 */}
        <div className="rounded-lg border border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">
            更多设置（个人资料、通知偏好等）即将上线
          </p>
        </div>
      </div>
    </AppShell>
  );
}
