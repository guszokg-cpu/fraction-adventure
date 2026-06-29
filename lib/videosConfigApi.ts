export type VideosConfig = Record<string, string>;

let _cache: { data: VideosConfig; ts: number } | null = null;
const CACHE_TTL = 1500;

export function invalidateVideosCache() {
  _cache = null;
}

export async function fetchVideosConfig(): Promise<VideosConfig> {
  if (_cache && Date.now() - _cache.ts < CACHE_TTL) return _cache.data;
  try {
    const res = await fetch("/api/videos-config", { cache: "no-store" });
    if (!res.ok) return _cache?.data ?? {};
    const data: VideosConfig = await res.json();
    _cache = { data, ts: Date.now() };
    return data;
  } catch {
    return _cache?.data ?? {};
  }
}

async function saveVideosConfig(data: VideosConfig): Promise<void> {
  _cache = null;
  await fetch("/api/videos-config", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function getVideoUrl(lessonPath: string): Promise<string> {
  const config = await fetchVideosConfig();
  return config[lessonPath] ?? "";
}

export async function setVideoUrl(lessonPath: string, url: string): Promise<void> {
  const config = await fetchVideosConfig();
  config[lessonPath] = url;
  await saveVideosConfig(config);
}
