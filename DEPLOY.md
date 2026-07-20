# WriteFit 部署上线指南

> 域名：writefit.app
> 部署平台：Cloudflare Pages

## 一、上线前需要完成的配置

### 1. 生成 AUTH_SECRET（必须）

这是登录系统的加密密钥，每个环境都需要一个。

```bash
openssl rand -base64 32
```

把生成的字符串填入：
- 本地 `.env` 文件的 `AUTH_SECRET=`
- Cloudflare Dashboard 的环境变量 `AUTH_SECRET`

### 2. 创建 GitHub OAuth 应用

1. 打开 https://github.com/settings/developers
2. 点击 "New OAuth App"
3. 填写：
   - Application name: WriteFit
   - Homepage URL: `https://writefit.app`
   - Authorization callback URL: `https://writefit.app/api/auth/callback/github`
4. 创建后获取 Client ID 和 Client Secret
5. 填入 `.env` 的 `AUTH_GITHUB_ID` 和 `AUTH_GITHUB_SECRET`
6. 在 Cloudflare Dashboard 也添加这两个环境变量

### 3. 创建 Google OAuth 应用

1. 打开 https://console.cloud.google.com/apis/credentials
2. 创建 OAuth 2.0 客户端 ID
3. 填写：
   - 已授权的 JavaScript 来源: `https://writefit.app`
   - 已授权的重定向 URI: `https://writefit.app/api/auth/callback/google`
4. 获取 Client ID 和 Client Secret
5. 填入 `.env` 的 `AUTH_GOOGLE_ID` 和 `AUTH_GOOGLE_SECRET`
6. 在 Cloudflare Dashboard 也添加这两个环境变量

### 4. 创建 Cloudflare D1 数据库

```bash
# 创建数据库
npx wrangler d1 create writefit-db

# 把返回的 database_id 填入 wrangler.jsonc
```

### 5. 生成数据库迁移并执行

```bash
# 生成迁移文件
npx drizzle-kit generate

# 本地执行迁移
npx wrangler d1 migrations apply writefit-db --local

# 生产环境执行迁移
npx wrangler d1 migrations apply writefit-db --remote
```

## 二、部署到 Cloudflare Pages

### 1. 构建项目

```bash
npm run build
npx opennextjs-cloudflare build
```

### 2. 部署

```bash
npx wrangler deploy
```

### 3. 在 Cloudflare Dashboard 绑定域名

1. 打开 Cloudflare Dashboard
2. 进入 Workers & Pages → writefit
3. Settings → Domains → Add Custom Domain
4. 输入 `writefit.app`
5. 再添加 `www.writefit.app`（可选）

## 三、环境变量清单

在 Cloudflare Dashboard → Settings → Variables 中添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| AUTH_SECRET | （openssl 生成的随机字符串） | 登录加密密钥 |
| AUTH_GITHUB_ID | （GitHub OAuth App Client ID） | GitHub 登录 |
| AUTH_GITHUB_SECRET | （GitHub OAuth App Client Secret） | GitHub 登录 |
| AUTH_GOOGLE_ID | （Google OAuth Client ID） | Google 登录 |
| AUTH_GOOGLE_SECRET | （Google OAuth Client Secret） | Google 登录 |
| NEXTAUTH_URL | https://writefit.app | 应用 URL |

## 四、本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 打开浏览器
# http://localhost:3000
```

本地 `.env` 文件配置：
- `AUTH_SECRET` — 用 openssl 生成
- `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` — GitHub OAuth App（回调URL填 http://localhost:3000/api/auth/callback/github）
- `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — Google OAuth（回调URL填 http://localhost:3000/api/auth/callback/google）
- `NEXTAUTH_URL=http://localhost:3000`

## 五、验证部署成功

部署完成后，检查：
1. 打开 https://writefit.app 能看到首页
2. 打开 https://writefit.app/practice/dev 能体验训练流程
3. 打开 https://writefit.app/ai-setup 能配置 AI
4. 点击登录能跳转到 GitHub/Google 授权页面

## 六、安全加固（2026-07 审计后新增）

### 部署顺序（本次加固涉及数据库迁移）

1. 先应用生产数据库迁移（新增 billing_events 表和 users.plan_interval 列）：
   ```bash
   wrangler d1 migrations apply writefit-db --remote
   ```
2. 再部署代码：`npm run deploy`
3. 部署前确认 `wrangler secret list` 里有 `AUTH_SECRET`——
   现在生产环境缺失时会直接拒绝启动（防伪造会话）。
4. 部署后 `wrangler tail` 观察 5-10 分钟。

### Cloudflare WAF 限流规则（Dashboard → Security → WAF → Rate limiting rules）

代码层不做 IP 限流（Workers 无 Redis，D1 限流自身有竞态），用 WAF 兜底：

| 优先级 | 路径 | 规则 | 动作 |
|---|---|---|---|
| 1 | `/api/auth/register` | 5 次 / 10 秒 / IP | Block 1 分钟（防 bcrypt CPU 滥用、邮箱枚举、批量注册） |
| 2 | `/api/webhooks/paypal` | 30 次 / 10 秒 / IP | Block（防出站 PayPal 验签调用被放大） |
| 3 | `/api/ai*` | 30 次 / 分钟 / IP | Block（用户配额之上的 IP 级兜底） |

Free plan 只能建 1 条规则时，保留优先级 1（register 暴露面最大）。

### 其他一次性配置

- Dashboard → SSL/TLS → Edge Certificates → 开启 HSTS（覆盖静态资源；
  Worker 响应已带 Strict-Transport-Security 头）
- Dashboard → Workers → writefit → 设置错误率告警通知
  （wrangler.jsonc 已开启 observability，console 日志可在 Dashboard 查询）
