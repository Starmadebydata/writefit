// ====================================================================
// AI 设置管理工具
// ====================================================================
// 管理用户自定义的 AI 服务配置
//
// 存储策略：
// - 开发阶段：存在浏览器 localStorage 里（不需要数据库）
// - 生产环境：存在 D1 数据库的 ai_settings 表里（加密存储）
//
// 支持的 AI 服务（OpenAI 兼容格式）：
// - DeepSeek：https://api.deepseek.com/v1
// - OpenAI：https://api.openai.com/v1
// - Moonshot：https://api.moonshot.cn/v1
// - 本地 Ollama：http://localhost:11434/v1
// - 其他任何兼容 OpenAI 接口格式的服务
// ====================================================================

// ---- 类型定义 ----

// AI 服务商预设
export interface AIProvider {
  id: string; // 服务商标识
  name: string; // 显示名称
  apiBaseUrl: string; // 默认 API 地址
  models: string[]; // 可选模型列表
  website: string; // 获取 API Key 的网址
}

// 用户的 AI 设置
export interface AISettings {
  provider: string; // 服务商标识
  apiBaseUrl: string; // API 地址
  apiKey: string; // API Key
  model: string; // 模型名称
  temperature: number; // 温度（0-2，0 最确定，2 最有创意）
  maxTokens: number; // 最大输出 token 数
}

// ---- 预设服务商列表 ----

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: "deepseek",
    name: "DeepSeek",
    apiBaseUrl: "https://api.deepseek.com/v1",
    models: ["deepseek-chat", "deepseek-reasoner"],
    website: "https://platform.deepseek.com/api_keys",
  },
  {
    id: "openai",
    name: "OpenAI",
    apiBaseUrl: "https://api.openai.com/v1",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"],
    website: "https://platform.openai.com/api-keys",
  },
  {
    id: "moonshot",
    name: "Moonshot",
    apiBaseUrl: "https://api.moonshot.cn/v1",
    models: ["moonshot-v1-8k", "moonshot-v1-32k", "moonshot-v1-128k"],
    website: "https://platform.moonshot.cn/console/api-keys",
  },
  {
    id: "custom",
    name: "Custom (OpenAI compatible)",
    apiBaseUrl: "",
    models: [],
    website: "",
  },
];

// ---- localStorage 存储工具（开发阶段用） ----

const STORAGE_KEY = "writefit_ai_settings";

// 简单的 Base64 编码（不是真正的加密，但能防止直接看到明文）
// 生产环境会用更强的加密方式
function encodeKey(key: string): string {
  if (typeof window === "undefined") return key;
  return btoa(unescape(encodeURIComponent(key)));
}

function decodeKey(encoded: string): string {
  if (typeof window === "undefined") return encoded;
  try {
    return decodeURIComponent(escape(atob(encoded)));
  } catch {
    return "";
  }
}

// 保存 AI 设置到 localStorage
export function saveAISettingsToLocal(settings: AISettings): void {
  if (typeof window === "undefined") return;
  const data = {
    ...settings,
    apiKey: encodeKey(settings.apiKey), // 编码 API Key
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// 从 localStorage 读取 AI 设置
export function getAISettingsFromLocal(): AISettings | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    return {
      ...data,
      apiKey: decodeKey(data.apiKey), // 解码 API Key
    };
  } catch {
    return null;
  }
}

// 从 localStorage 删除 AI 设置
export function clearAISettingsFromLocal(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

// 检查是否已配置 AI 设置
export function hasAISettings(): boolean {
  const settings = getAISettingsFromLocal();
  return !!(settings && settings.apiKey && settings.apiBaseUrl && settings.model);
}

// ---- 服务端存储工具（生产环境用，通过 API 调用） ----

// 从服务端获取 AI 设置（通过 API 路由）
export async function getAISettingsFromServer(): Promise<AISettings | null> {
  try {
    const res = await fetch("/api/ai-settings");
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.apiKey) return null;
    return data as AISettings;
  } catch {
    return null;
  }
}

// 保存 AI 设置到服务端
export async function saveAISettingsToServer(settings: AISettings): Promise<boolean> {
  try {
    const res = await fetch("/api/ai-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ---- 统一的获取/保存接口 ----
// 开发阶段用 localStorage，生产环境用服务端
// 这里统一封装，调用方不需要关心存储位置

export async function getAISettings(): Promise<AISettings | null> {
  // 先尝试从服务端获取（生产环境）
  const serverSettings = await getAISettingsFromServer();
  if (serverSettings) return serverSettings;

  // 回退到 localStorage（开发阶段）
  return getAISettingsFromLocal();
}

export async function saveAISettings(settings: AISettings): Promise<void> {
  // 同时保存到 localStorage（开发阶段用）和服务端（生产环境用）
  saveAISettingsToLocal(settings);
  await saveAISettingsToServer(settings);
}

// ---- 测试 AI 连接 ----

// 用用户的配置发送一个简单的测试请求
export async function testAIConnection(
  settings: AISettings
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`${settings.apiBaseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.apiKey}`,
      },
      body: JSON.stringify({
        model: settings.model,
        messages: [
          { role: "user", content: "Reply with exactly: connection successful" },
        ],
        max_tokens: 20,
        temperature: 0,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        message: `Connection failed (${response.status}): ${errorText.slice(0, 200)}`,
      };
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content ?? "";
    return {
      success: true,
      message: `Connection successful! AI replied: ${reply}`,
    };
  } catch (error) {
    return {
      success: false,
      message: `Connection failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}
