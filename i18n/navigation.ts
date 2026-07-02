// ====================================================================
// 国际化导航工具
// ====================================================================
// 提供 Link、redirect、useRouter、usePathname 等
// 这些工具会自动处理 locale 前缀
// ====================================================================

import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// 创建带 locale 的导航工具
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
