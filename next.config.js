/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Docker 自托管需要 standalone 产物；Vercel 部署会忽略此项，两者兼容
  ...(process.env.BUILD_TARGET === "docker" ? { output: "standalone" } : {}),
  images: {
    remotePatterns: [
      // Vercel Blob 默认域名（上传后返回的 URL 走这里）
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      // 兼容外链封面 / 友链头像等任意 https 图源
      { protocol: "https", hostname: "**" }
    ]
  }
};

module.exports = nextConfig;
