// Auth.js API 路由
// 这个文件处理所有和登录相关的请求，比如：
// - 跳转到 GitHub/Google 登录页面
// - 登录成功后的回调
// - 退出登录
// handlers 里包含了 GET 和 POST 两个处理函数

import { handlers } from "@/lib/auth/auth";

export const { GET, POST } = handlers;
