import { MOCK_WORKSHEETS } from "@/data/worksheets";
import type { Worksheet } from "@/types/worksheet";

export const WS_STORAGE_KEY = "fa_worksheets";

export function loadWorksheets(): Worksheet[] {
  if (typeof window === "undefined") return MOCK_WORKSHEETS;
  try {
    const raw = localStorage.getItem(WS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Worksheet[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  // seed localStorage with mock data on first visit
  try {
    localStorage.setItem(WS_STORAGE_KEY, JSON.stringify(MOCK_WORKSHEETS));
  } catch {}
  return MOCK_WORKSHEETS;
}

export function saveWorksheets(ws: Worksheet[]): void {
  try {
    localStorage.setItem(WS_STORAGE_KEY, JSON.stringify(ws));
  } catch {}
}

export function getPublishedBySlug(slug: string): Worksheet[] {
  return loadWorksheets()
    .filter((w) => w.lessonSlug === slug && w.isPublished)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}
