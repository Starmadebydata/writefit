// ====================================================================
// Auth.js v5 登录系统配置
// ====================================================================
// 这个文件配置用户登录系统，支持 GitHub 和 Google 第三方登录
//
// 工作原理：
// 1. 用户点击"用 GitHub 登录" → 跳转到 GitHub 授权页面
// 2. 用户同意授权 → GitHub 把用户信息发回我们的应用
// 3. 我们在数据库里创建或更新用户记录
// 4. 生成一个 JWT 令牌发给浏览器，后续请求用这个令牌识别用户
//
// 技术说明：
// - 使用 JWT 策略（不依赖数据库存储会话，适合 Cloudflare 边缘运行时）
// - 使用自定义适配器，按需获取 D1 数据库连接
// ====================================================================

import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import type { Adapter, AdapterUser, AdapterAccount } from "next-auth/adapters";
import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { users, accounts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// 创建一个按需获取数据库的 Auth.js 适配器
// 普通的适配器在配置时就创建数据库连接，但 Cloudflare D1 是按请求获取的
// 所以我们创建一个"懒加载"适配器，每次操作时才获取数据库连接
function createD1Adapter(): Adapter {
  // 获取数据库连接的内部函数
  function getDb() {
    const { env } = getCloudflareContext();
    return drizzle(env.DB);
  }

  return {
    // 创建新用户（首次登录时调用）
    async createUser(data: AdapterUser) {
      const db = getDb();
      const id = crypto.randomUUID();
      await db.insert(users).values({
        id,
        name: data.name,
        email: data.email,
        emailVerified: data.emailVerified,
        image: data.image,
      });
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user as AdapterUser;
    },

    // 根据 ID 查找用户
    async getUser(id: string) {
      const db = getDb();
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return (user as AdapterUser) ?? null;
    },

    // 根据邮箱查找用户
    async getUserByEmail(email: string) {
      const db = getDb();
      const [user] = await db.select().from(users).where(eq(users.email, email));
      return (user as AdapterUser) ?? null;
    },

    // 创建第三方账号关联
    async linkAccount(data: AdapterAccount) {
      const db = getDb();
      const id = crypto.randomUUID();
      // AdapterAccount 的字段类型是 JsonValue，需要转为数据库 schema 期望的类型
      await db.insert(accounts).values({
        id,
        userId: data.userId,
        type: data.type,
        provider: data.provider,
        providerAccountId: data.providerAccountId,
        refresh_token: data.refresh_token as string | null | undefined,
        access_token: data.access_token as string | null | undefined,
        expires_at:
          typeof data.expires_at === "number"
            ? data.expires_at
            : data.expires_at == null
              ? null
              : Number(data.expires_at) || null,
        token_type: data.token_type as string | null | undefined,
        scope: data.scope as string | null | undefined,
        id_token: data.id_token as string | null | undefined,
        session_state: data.session_state as string | null | undefined,
      });
      const [account] = await db.select().from(accounts).where(eq(accounts.id, id));
      return account as AdapterAccount;
    },

    // 查找第三方账号关联
    async getAccount(providerAccountId: string) {
      const db = getDb();
      const [account] = await db
        .select()
        .from(accounts)
        .where(eq(accounts.providerAccountId, providerAccountId));
      return (account as AdapterAccount) ?? null;
    },

    // 更新用户信息
    async updateUser(data: Partial<AdapterUser> & Pick<AdapterUser, "id">) {
      const db = getDb();
      const { id, ...rest } = data;
      await db.update(users).set(rest).where(eq(users.id, id));
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user as AdapterUser;
    },

    // 删除用户
    async deleteUser(id: string) {
      const db = getDb();
      await db.delete(users).where(eq(users.id, id));
      return;
    },

    // 以下方法在使用 JWT 策略时不会被调用，但适配器接口要求必须实现
    // 使用类型断言满足接口要求（JWT 策略下不会实际执行）
    async createSession() {
      return null as never;
    },
    async getSessionAndUser() {
      return null;
    },
    async updateSession() {
      return null as never;
    },
    async deleteSession() {
      return;
    },
    async createVerificationToken() {
      return null;
    },
    async useVerificationToken() {
      return null;
    },
  };
}

// Auth.js 主配置
export const { handlers, auth, signIn, signOut } = NextAuth({
  // 开发环境默认 secret：没配置 AUTH_SECRET 时用这个
  // 生产环境必须在 .env 中设置 AUTH_SECRET
  secret: process.env.AUTH_SECRET ?? "dev-only-secret-do-not-use-in-production",
  // 登录方式：GitHub 和 Google
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  // 使用自定义 D1 适配器
  adapter: createD1Adapter(),
  // 使用 JWT 策略（不依赖数据库存储会话，适合 Cloudflare）
  session: {
    strategy: "jwt",
  },
  // 登录后跳转页面
  pages: {
    signIn: "/auth/login",
  },
  // 回调函数：在 JWT 中加入用户 ID
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
