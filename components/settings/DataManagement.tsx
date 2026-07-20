"use client";

// ====================================================================
// 数据管理组件
// ====================================================================
// 包含两个功能：
// 1. 数据导出：调用 /api/export 下载用户所有数据为 JSON
// 2. 删除账号：调用 /api/profile DELETE 永久删除账号和所有数据
//    删除前需要用户输入 "DELETE" 确认
// ====================================================================

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Download, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { signOut } from "next-auth/react";

export function DataManagement() {
  const t = useTranslations("settings.data");
  const router = useRouter();

  const [exporting, setExporting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  // ---- 导出数据 ----
  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/export");
      if (!res.ok) throw new Error("export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "writefit-data-export.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(t("exportBtn"));
    } catch {
      toast.error(t("exportError"));
    } finally {
      setExporting(false);
    }
  }

  // ---- 删除账号 ----
  async function handleDelete() {
    if (deleteConfirm !== "DELETE") return;
    setDeleting(true);
    try {
      const res = await fetch("/api/profile", { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");
      // 登出并跳转到首页
      await signOut({ redirect: false });
      router.push("/");
    } catch {
      toast.error(t("deleteError"));
      setDeleting(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("title")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 数据导出 */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold">{t("exportTitle")}</h3>
              <p className="text-xs text-muted-foreground mt-1">{t("exportDesc")}</p>
            </div>
            <Button variant="outline" onClick={handleExport} disabled={exporting}>
              {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {exporting ? t("exporting") : t("exportBtn")}
            </Button>
          </div>

          {/* 分隔线 */}
          <div className="border-t border-border" />

          {/* 删除账号 */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-destructive">{t("deleteTitle")}</h3>
              <p className="text-xs text-muted-foreground mt-1">{t("deleteDesc")}</p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
              {t("deleteBtn")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 删除确认对话框 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              {t("confirmDelete")}
            </DialogTitle>
            <DialogDescription>{t("confirmDeleteDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="delete-confirm">{t("confirmPlaceholder")}</Label>
            <Input
              id="delete-confirm"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
              autoComplete="off"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setDeleteConfirm("");
              }}
              disabled={deleting}
            >
              {t("cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting || deleteConfirm !== "DELETE"}
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              {deleting ? t("deleting") : t("confirmBtn")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
