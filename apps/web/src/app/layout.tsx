import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: "互助地图 | 校园综合互助平台",
  description:
    "把校园里的求助、组队、拼车、失物和学校信息，放到一张可检索、可接单、可追踪的地图上。",
};

export const viewport: Viewport = {
  themeColor: "#0f5132",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
