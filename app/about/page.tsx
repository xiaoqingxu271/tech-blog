export const dynamic = "force-dynamic";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { getSettings } from "@/server/services/settings";

export default async function AboutPage() {
  const settings = await getSettings();
  const siteName = settings.site_name || "极光博客";

  return (
    <>
      <Navbar siteName={siteName} logo={settings.site_logo || undefined} />
      <main className="mx-auto max-w-4xl px-4 pb-8 pt-10">
        <h1 className="mb-8 text-3xl font-bold">关于我</h1>
        <div className="glass p-6 sm:p-8">
          {settings.about ? (
            <MarkdownRenderer content={settings.about} />
          ) : (
            <p className="text-muted">站长还没有填写关于内容~</p>
          )}
        </div>
      </main>
      <Footer siteName={siteName} description={settings.site_description} />
    </>
  );
}
