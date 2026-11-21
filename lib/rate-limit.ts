// 简易内存滑动窗口限流（单实例）。多实例部署可换 Redis。
const buckets = new Map<string, number[]>();

export function rateLimit(key: string, maxHits: number, windowMs: number): boolean {
  const now = Date.now();
  const arr = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= maxHits) {
    buckets.set(key, arr);
    return true; // limited
  }
  arr.push(now);
  buckets.set(key, arr);
  return false;
}

export function clientIp(req: Request): string {
  const h = req.headers.get("x-forwarded-for");
  return h?.split(",")[0]?.trim() || "unknown";
}
