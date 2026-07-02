// ====================================================================
// Auth.js 类型扩展
// ====================================================================
// NextAuth 默认的 User 类型没有 id 字段
// 这里扩展类型，让 session.user.id 可以在代码里使用
// ====================================================================

import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
  }
}

// next-auth v5 的 JWT 模块从 @auth/core/jwt 重导出
// 需要扩展 @auth/core/jwt 的 JWT 接口
declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
  }
}
