import type { WorksheetLevel, WorksheetFileType } from "@/types/worksheet";

export type WsItem = {
  id: string;
  title: string;
  description: string;
  level: WorksheetLevel;
  fileType: WorksheetFileType;
  fileUrl: string;
  previewImage: string;
  sortOrder: number;
  visible: boolean;
};

export type WorksheetsConfig = Record<string, WsItem[]>;

let _cache: { data: WorksheetsConfig; ts: number } | null = null;
const CACHE_TTL = 1500;

export function invalidateWorksheetsCache() {
  _cache = null;
}

export async function fetchWorksheetsConfig(): Promise<WorksheetsConfig> {
  if (_cache && Date.now() - _cache.ts < CACHE_TTL) return _cache.data;
  try {
    const res = await fetch("/api/worksheets-config", { cache: "no-store" });
    if (!res.ok) return _cache?.data ?? {};
    const data: WorksheetsConfig = await res.json();
    _cache = { data, ts: Date.now() };
    return data;
  } catch {
    return _cache?.data ?? {};
  }
}

async function saveWorksheetsConfig(data: WorksheetsConfig): Promise<void> {
  _cache = null;
  await fetch("/api/worksheets-config", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function getWorksheetsForLesson(lessonSlug: string): Promise<WsItem[]> {
  const config = await fetchWorksheetsConfig();
  return (config[lessonSlug] ?? [])
    .filter((ws) => ws.visible)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function addWorksheet(
  lessonSlug: string,
  ws: Omit<WsItem, "id" | "sortOrder">
): Promise<void> {
  const config = await fetchWorksheetsConfig();
  const items = config[lessonSlug] ?? [];
  const newItem: WsItem = {
    ...ws,
    id: `ws-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    sortOrder: items.length + 1,
  };
  config[lessonSlug] = [...items, newItem];
  await saveWorksheetsConfig(config);
}

export async function deleteWorksheet(lessonSlug: string, id: string): Promise<void> {
  const config = await fetchWorksheetsConfig();
  config[lessonSlug] = (config[lessonSlug] ?? []).filter((ws) => ws.id !== id);
  await saveWorksheetsConfig(config);
}

export async function toggleWorksheetVisible(lessonSlug: string, id: string): Promise<void> {
  const config = await fetchWorksheetsConfig();
  const item = (config[lessonSlug] ?? []).find((ws) => ws.id === id);
  if (item) item.visible = !item.visible;
  await saveWorksheetsConfig(config);
}
