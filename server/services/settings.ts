import prisma from "@/lib/prisma";

export type SiteSettings = {
  site_name: string;
  site_description: string;
  site_logo: string;
  about: string;
  icp: string;
};

const defaults: SiteSettings = {
  site_name: "技术成长博客",
  site_description: "记录学习、踩坑与源码解读",
  site_logo: "",
  about: "",
  icp: ""
};

export async function getSettings(): Promise<SiteSettings> {
  try {
    const rows = await prisma.setting.findMany();
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    // 只回传已知公开键，防止未来新增私有 key 通过 GET 泄漏
    return {
      site_name: map.site_name ?? defaults.site_name,
      site_description: map.site_description ?? defaults.site_description,
      site_logo: map.site_logo ?? defaults.site_logo,
      about: map.about ?? defaults.about,
      icp: map.icp ?? defaults.icp
    };
  } catch {
    return defaults;
  }
}

export async function setSetting(key: string, value: string) {
  return prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value }
  });
}
