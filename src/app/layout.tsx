import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "SonicVault — مكتبة الأصوات والمؤثرات الضخمة",
  description: "آلاف الأصوات والمؤثرات المسمّاة والمصنّفة: أصوات مفصولة من فيديوهات الموشن + مستودعات CC0. بحث فوري، لوحة بادات، وتنزيل مباشر.",
};

export const viewport: Viewport = { themeColor: "#07080c" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-[#07080c] text-white antialiased">{children}</body>
    </html>
  );
}
