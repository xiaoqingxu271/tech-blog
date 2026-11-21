import type { Metadata } from "next";
import "./globals.css";
import { getSettings } from "@/server/services/settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: {
      default: settings.site_name || "技术成长博客",
      template: `%s · ${settings.site_name || "技术成长博客"}`
    },
    description: settings.site_description || "记录学习、踩坑与源码解读"
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}`
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
