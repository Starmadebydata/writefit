"use client";

// ====================================================================
// AI 设置表单组件
// ====================================================================
// 让用户配置自己的 AI 服务
//
// 用户可以：
// 1. 选择 AI 服务商（DeepSeek / OpenAI / Moonshot / 自定义）
// 2. 填写 API Key
// 3. 选择模型
// 4. 调整温度和最大 token 数
// 5. 测试连接是否成功
// ====================================================================

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bot,
  Key,
  Link as LinkIcon,
  Cpu,
  Thermometer,
  Zap,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Trash2,
} from "lucide-react";
import {
  AI_PROVIDERS,
  type AISettings,
  getAISettingsFromLocal,
  saveAISettingsToLocal,
  clearAISettingsFromLocal,
  testAIConnection,
} from "@/lib/ai/settings";
import { toast } from "sonner";

// 初始化函数：从 localStorage 读取已保存的设置，没有则用默认值
function initSettings() {
  const saved = getAISettingsFromLocal();
  if (saved) {
    return {
      provider: saved.provider,
      apiBaseUrl: saved.apiBaseUrl,
      apiKey: saved.apiKey,
      model: saved.model,
      temperature: saved.temperature,
      maxTokens: saved.maxTokens,
      isConfigured: true,
    };
  }
  // 没有保存的设置，用 DeepSeek 默认值
  const defaultProvider = AI_PROVIDERS[0];
  return {
    provider: defaultProvider.id,
    apiBaseUrl: defaultProvider.apiBaseUrl,
    apiKey: "",
    model: defaultProvider.models[0],
    temperature: 0.3,
    maxTokens: 2000,
    isConfigured: false,
  };
}

export function AISettingsForm() {
  // ---- 状态管理（用 lazy initializer 从 localStorage 初始化） ----
  const t = useTranslations("settings.ai");
  const initial = initSettings();
  const [provider, setProvider] = useState(initial.provider);
  const [apiBaseUrl, setApiBaseUrl] = useState(initial.apiBaseUrl);
  const [apiKey, setApiKey] = useState(initial.apiKey);
  const [model, setModel] = useState(initial.model);
  const [temperature, setTemperature] = useState(initial.temperature);
  const [maxTokens, setMaxTokens] = useState(initial.maxTokens);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isConfigured, setIsConfigured] = useState(initial.isConfigured);
  const [showApiKey, setShowApiKey] = useState(false);

  // ---- 选择服务商时自动填充默认值 ----
  function handleProviderChange(providerId: string) {
    setProvider(providerId);
    const found = AI_PROVIDERS.find((p) => p.id === providerId);
    if (found) {
      setApiBaseUrl(found.apiBaseUrl);
      if (found.models.length > 0) {
        setModel(found.models[0]);
      }
    }
  }

  // ---- 保存设置 ----
  async function handleSave() {
    if (!apiBaseUrl) {
      toast.error(t("errorApiUrl"));
      return;
    }
    if (!apiKey) {
      toast.error(t("errorApiKey"));
      return;
    }
    if (!model) {
      toast.error(t("errorModel"));
      return;
    }

    setIsSaving(true);
    try {
      const settings: AISettings = {
        provider,
        apiBaseUrl,
        apiKey,
        model,
        temperature,
        maxTokens,
      };
      saveAISettingsToLocal(settings);

      // 同时保存到服务端（生产环境用）
      await fetch("/api/ai-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      setIsConfigured(true);
      toast.success(t("savedSuccess"));
    } catch {
      toast.error(t("saveError"));
    } finally {
      setIsSaving(false);
    }
  }

  // ---- 测试连接 ----
  async function handleTest() {
    if (!apiBaseUrl || !apiKey || !model) {
      toast.error(t("fillComplete"));
      return;
    }

    setIsTesting(true);
    try {
      const result = await testAIConnection({
        provider,
        apiBaseUrl,
        apiKey,
        model,
        temperature,
        maxTokens,
      });
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error(t("testError"));
    } finally {
      setIsTesting(false);
    }
  }

  // ---- 删除设置 ----
  function handleDelete() {
    clearAISettingsFromLocal();
    fetch("/api/ai-settings", { method: "DELETE" });
    setApiKey("");
    setIsConfigured(false);
    const defaultProvider = AI_PROVIDERS[0];
    setProvider(defaultProvider.id);
    setApiBaseUrl(defaultProvider.apiBaseUrl);
    setModel(defaultProvider.models[0]);
    toast.success(t("cleared"));
  }

  const currentProvider = AI_PROVIDERS.find((p) => p.id === provider);

  return (
    <div className="space-y-6">
      {/* 状态提示 */}
      {isConfigured ? (
        <div className="flex items-center gap-2 rounded-lg bg-primary/10 border border-primary/20 px-4 py-3">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <div>
            <p className="text-sm font-semibold text-primary">{t("configured")}</p>
            <p className="text-xs text-muted-foreground">
              {t("currentUsing", { provider: currentProvider?.name ?? provider, model })}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
          <Bot className="h-5 w-5 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-amber-800">{t("notConfigured")}</p>
            <p className="text-xs text-amber-700">
              {t("notConfiguredDesc")}
            </p>
          </div>
        </div>
      )}

      {/* 配置表单 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="h-5 w-5" />
            {t("title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* 1. 选择服务商 */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              {t("provider")}
            </Label>
            <Select value={provider} onValueChange={(v) => v && handleProviderChange(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AI_PROVIDERS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {t("providerDesc")}
            </p>
          </div>

          {/* 2. API 地址 */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              {t("apiUrl")}
            </Label>
            <Input
              value={apiBaseUrl}
              onChange={(e) => setApiBaseUrl(e.target.value)}
              placeholder="https://api.deepseek.com/v1"
              disabled={provider !== "custom"}
            />
            <p className="text-xs text-muted-foreground">
              {t("apiUrlDesc")}
            </p>
          </div>

          {/* 3. API Key */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              {t("apiKey")}
            </Label>
            <div className="relative">
              <Input
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="pr-20"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 text-xs"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? t("hide") : t("show")}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("apiKeyStorageDesc")}
            </p>
            {currentProvider?.website && (
              <a
                href={currentProvider.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                {t("getKeyDesc", { provider: currentProvider.name })}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          {/* 4. 模型选择 */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              {t("model")}
            </Label>
            {currentProvider && currentProvider.models.length > 0 ? (
              <Select value={model} onValueChange={(v) => v && setModel(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currentProvider.models.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder={t("modelInputPlaceholder")}
              />
            )}
            <p className="text-xs text-muted-foreground">
              {t("modelPlaceholder")}
            </p>
          </div>

          {/* 5. 高级设置（可折叠） */}
          <details className="space-y-4">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
              {t("advancedSettings")}
            </summary>
            <div className="space-y-4 pt-2">
              {/* 温度 */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4" />
                  {t("temperature")}：{temperature.toFixed(1)}
                  <Badge variant="secondary" className="text-xs">
                    {temperature < 0.3 ? t("tempPrecise") : temperature < 0.7 ? t("tempBalanced") : t("tempCreative")}
                  </Badge>
                </Label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-primary"
                />
                <p className="text-xs text-muted-foreground">
                  {t("temperatureDesc")}
                </p>
              </div>

              {/* 最大 token 数 */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  {t("maxTokens")}
                </Label>
                <Input
                  type="number"
                  value={maxTokens}
                  onChange={(e) => setMaxTokens(parseInt(e.target.value) || 2000)}
                  min="100"
                  max="8000"
                  step="100"
                />
                <p className="text-xs text-muted-foreground">
                  {t("maxTokensDesc")}
                </p>
              </div>
            </div>
          </details>

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("savingBtn")}
                </>
              ) : (
                t("saveSettings")
              )}
            </Button>
            <Button variant="outline" onClick={handleTest} disabled={isTesting}>
              {isTesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("testingBtn")}
                </>
              ) : (
                t("testConnection")
              )}
            </Button>
            {isConfigured && (
              <Button variant="ghost" onClick={handleDelete} className="text-destructive">
                <Trash2 className="mr-1 h-4 w-4" />
                {t("clearSettings")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
