// ====================================================================
// Cloudflare 环境变量类型扩展
// ====================================================================
// @opennextjs/cloudflare 定义了全局的 CloudflareEnv 接口
// 但不包含我们自定义的绑定（D1 数据库、Email 发信）
// 这里扩展接口，加入自定义绑定
// ====================================================================

// Cloudflare Email Service 发信 binding（send_email）
// 项目未安装 @cloudflare/workers-types，这里定义最小可用类型
interface SendEmailMessage {
  from: string;
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

interface SendEmail {
  send(message: SendEmailMessage): Promise<{ messageId?: string }>;
}

declare global {
  interface CloudflareEnv {
    // Cloudflare D1 数据库绑定
    DB: D1Database;
    // Cloudflare Email Service 发信 binding（本地 next dev 不存在，故可选）
    EMAIL?: SendEmail;
  }
}

export {};
