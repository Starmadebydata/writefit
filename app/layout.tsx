// ====================================================================
// 根布局（最小化）
// ====================================================================
// next-intl 要求根布局不包含 html/body 标签
// 真正的布局在 [locale]/layout.tsx 中
// ====================================================================

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
