export const dynamic = "force-dynamic";

import Navbar from "@/components/Navbar";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { getSettings } from "@/server/services/settings";

export default async function AboutPage() {
  const settings = await getSettings();
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">关于</h1>
        {settings.about ? (
          <MarkdownRenderer content={settings.about} />
        ) : (
          <p className="text-gray-400">站长还没有填写关于内容~</p>
        )}
      </main>
    </>
  );
}
