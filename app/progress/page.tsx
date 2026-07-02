import type { Metadata } from "next";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";

export const metadata: Metadata = {
  title: "Writing Progress | WriteFit",
  description: "Track your write practice progress over time.",
  alternates: { canonical: "https://writefit.app/progress" },
  robots: { index: false, follow: false },
};

export default async function Page() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <AppShell title="功能开发中" user={session.user}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Construction className="h-6 w-6 text-primary" />
            <CardTitle>即将上线</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">这个功能正在开发中，敬请期待。</p>
        </CardContent>
      </Card>
    </AppShell>
  );
}
