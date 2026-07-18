// ====================================================================
// DeepSeek / OpenAI 兼容 API 客户端
// ====================================================================
// 负责和 AI 服务通信，支持任何 OpenAI 兼容格式的 API
//
// 工作原理：
// 1. 前端把用户的 AI 设置（API Key、模型等）随请求一起发来
// 2. 服务端用这些设置调用对应的 AI 服务
// 3. 返回结构化的 JSON 反馈
//
// 安全说明：
// - API Key 从不存储在服务端环境变量里
// - 每次请求时由前端传入，用完即弃
// - Key 只存在用户浏览器的 localStorage 中；服务端数据库存储为 P1 预留（未实现）
// - 付费墙上线后将支持平台托管 Key（环境变量注入），本文件的 config 参数即注入点
// ====================================================================

// AI 配置（由调用方提供）
export interface AIConfig {
  apiBaseUrl: string; // API 地址，如 https://api.deepseek.com/v1
  apiKey: string; // API Key
  model: string; // 模型名称，如 deepseek-chat
  temperature?: number; // 温度（0-2）
  maxTokens?: number; // 最大输出 token 数
}

// 对话消息类型
interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// 请求选项
interface AIRequestOptions {
  config: AIConfig; // AI 配置
  systemPrompt?: string; // 系统提示词
  messages: ChatMessage[]; // 对话消息
  temperature?: number; // 覆盖温度
  maxTokens?: number; // 覆盖最大 token
  jsonMode?: boolean; // 是否返回 JSON 格式
}

// 调用 AI API 的核心函数
export async function callAI(options: AIRequestOptions): Promise<string> {
  const {
    config,
    systemPrompt,
    messages,
    temperature = config.temperature ?? 0.3,
    maxTokens = config.maxTokens ?? 2000,
    jsonMode = false,
  } = options;

  if (!config.apiKey) {
    throw new Error("缺少 API Key，请在设置中配置你的 AI 服务");
  }
  if (!config.apiBaseUrl) {
    throw new Error("缺少 API 地址，请在设置中配置你的 AI 服务");
  }

  // 组装完整的消息列表
  const fullMessages: ChatMessage[] = [];
  if (systemPrompt) {
    fullMessages.push({ role: "system", content: systemPrompt });
  }
  fullMessages.push(...messages);

  // 构建请求 URL（确保 apiBaseUrl 末尾没有多余的斜杠）
  const baseUrl = config.apiBaseUrl.replace(/\/+$/, "");
  const url = `${baseUrl}/chat/completions`;

  // 发送请求到 AI 服务
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: fullMessages,
      temperature,
      max_tokens: maxTokens,
      // json_mode 让 AI 返回合法的 JSON 格式
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI API 调用失败 (${response.status}): ${errorText.slice(0, 300)}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? "";
}

// 调用 AI 并解析为 JSON 对象
export async function callAIJson<T = Record<string, unknown>>(
  options: AIRequestOptions
): Promise<T> {
  const content = await callAI({ ...options, jsonMode: true });

  try {
    return JSON.parse(content) as T;
  } catch {
    // 如果 AI 返回的不是合法 JSON，尝试提取 JSON 部分
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as T;
    }
    throw new Error("AI 返回的内容不是合法的 JSON 格式");
  }
}
