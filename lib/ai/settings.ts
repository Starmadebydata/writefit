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
  defaultModel: string; // 默认选中的模型
  defaultTemperature: number; // 推荐温度
  defaultMaxTokens: number; // 推荐最大 token 数
  description: string; // 供应商英文简介
  descriptionZh: string; // 供应商中文简介
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
// 所有供应商都兼容 OpenAI API 格式，用户只需填 API Key 即可使用

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: "deepseek",
    name: "DeepSeek",
    apiBaseUrl: "https://api.deepseek.com/v1",
    models: ["deepseek-chat", "deepseek-reasoner", "deepseek-v4-flash", "deepseek-v4-pro"],
    website: "https://platform.deepseek.com/api_keys",
    defaultModel: "deepseek-chat",
    defaultTemperature: 0.3,
    defaultMaxTokens: 2000,
    description: "Great value, strong Chinese understanding, ideal for writing practice",
    descriptionZh: "性价比高，中文理解能力强，适合写作训练",
  },
  {
    id: "zai",
    name: "Z.ai (GLM)",
    apiBaseUrl: "https://api.z.ai/api/paas/v4",
    models: ["glm-5.2", "glm-4.7", "glm-4.6", "glm-4-plus", "glm-4-flash", "glm-4-air"],
    website: "https://z.ai/manage-apikey/apikey-list",
    defaultModel: "glm-4.6",
    defaultTemperature: 0.3,
    defaultMaxTokens: 2000,
    description: "Balanced Chinese and English, fast response",
    descriptionZh: "智谱 AI，中英文能力均衡，响应速度快",
  },
  {
    id: "kimi-code",
    name: "Kimi Code",
    apiBaseUrl: "https://api.kimi.com/coding/v1",
    models: ["kimi-for-coding"],
    website: "https://code.kimi.com/console",
    defaultModel: "kimi-for-coding",
    defaultTemperature: 0.3,
    defaultMaxTokens: 2000,
    description: "Kimi coding-focused, great for code-related tasks",
    descriptionZh: "Kimi 编程专用，适合代码相关任务",
  },
  {
    id: "moonshot",
    name: "Moonshot (Kimi)",
    apiBaseUrl: "https://api.moonshot.cn/v1",
    models: ["moonshot-v1-8k", "moonshot-v1-32k", "moonshot-v1-128k", "kimi-k2-0905"],
    website: "https://platform.moonshot.cn/console/api-keys",
    defaultModel: "moonshot-v1-32k",
    defaultTemperature: 0.3,
    defaultMaxTokens: 2000,
    description: "Moonshot Kimi platform, strong long-text processing",
    descriptionZh: "月之暗面 Kimi 开放平台，长文本处理能力强",
  },
  {
    id: "openai",
    name: "OpenAI",
    apiBaseUrl: "https://api.openai.com/v1",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4.1", "gpt-4.1-mini", "o3-mini", "o4-mini"],
    website: "https://platform.openai.com/api-keys",
    defaultModel: "gpt-4o-mini",
    defaultTemperature: 0.3,
    defaultMaxTokens: 2000,
    description: "Industry benchmark, strong English writing, higher cost",
    descriptionZh: "业界标杆，英文写作能力强，价格较高",
  },
  {
    id: "groq",
    name: "Groq",
    apiBaseUrl: "https://api.groq.com/openai/v1",
    models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "openai/gpt-oss-120b", "openai/gpt-oss-20b"],
    website: "https://console.groq.com/keys",
    defaultModel: "llama-3.3-70b-versatile",
    defaultTemperature: 0.3,
    defaultMaxTokens: 2000,
    description: "Ultra-fast inference, generous free tier, great for iteration",
    descriptionZh: "极速推理，免费额度充足，适合快速迭代",
  },
  {
    id: "siliconflow",
    name: "SiliconFlow",
    apiBaseUrl: "https://api.siliconflow.cn/v1",
    models: [
      "deepseek-ai/DeepSeek-V3",
      "deepseek-ai/DeepSeek-R1",
      "Qwen/Qwen3-32B",
      "zai-org/GLM-4.6",
    ],
    website: "https://cloud.siliconflow.cn/account/ak",
    defaultModel: "deepseek-ai/DeepSeek-V3",
    defaultTemperature: 0.3,
    defaultMaxTokens: 2000,
    description: "Aggregator platform, one key for many models, some free",
    descriptionZh: "聚合平台，一个 Key 调用多个模型，部分免费",
  },
  {
    id: "qwen",
    name: "Qwen (Alibaba)",
    apiBaseUrl: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    models: ["qwen-plus", "qwen-turbo", "qwen-max", "qwen3-235b-a22b", "qwen3-32b", "qwq-32b"],
    website: "https://dashscope.console.aliyun.com/apiKey",
    defaultModel: "qwen-plus",
    defaultTemperature: 0.3,
    defaultMaxTokens: 2000,
    description: "Alibaba Qwen, excellent Chinese, stable in China",
    descriptionZh: "阿里通义千问，中文能力优秀，国内访问稳定",
  },
  {
    id: "ollama",
    name: "Ollama (Local)",
    apiBaseUrl: "http://localhost:11434/v1",
    models: ["llama3.2", "qwen2.5", "deepseek-r1"],
    website: "https://ollama.com/download",
    defaultModel: "llama3.2",
    defaultTemperature: 0.3,
    defaultMaxTokens: 2000,
    description: "Run models locally, completely free, no internet needed",
    descriptionZh: "本地运行模型，完全免费，无需联网，需要先安装 Ollama",
  },
  {
    id: "custom",
    name: "Custom (OpenAI compatible)",
    apiBaseUrl: "",
    models: [],
    website: "",
    defaultModel: "",
    defaultTemperature: 0.3,
    defaultMaxTokens: 2000,
    description: "Any OpenAI-compatible API service",
    descriptionZh: "自定义任何兼容 OpenAI 格式的 API 服务",
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

// ---- 服务端存储工具（预留：P1 平台 Key 时实现，当前 API 是桩不落库） ----

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
