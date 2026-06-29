const STORAGE_KEY = "fa_lesson_stars";

export type StarCount = 0 | 1 | 2 | 3;

function load(): Record<string, StarCount> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, StarCount>) : {};
  } catch {
    return {};
  }
}

function save(data: Record<string, StarCount>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

/** อ่านดาวปัจจุบันของ lesson (0-3) */
export function getStars(slug: string): StarCount {
  return load()[slug] ?? 0;
}

/** เพิ่มดาว — ไม่มีวันลดลง (max wins) */
export function awardStars(slug: string, stars: StarCount) {
  const data = load();
  const current = data[slug] ?? 0;
  if (stars > current) {
    data[slug] = stars;
    save(data);
  }
}

/** ดาวของทุก lesson สำหรับแสดงใน grid/map */
export function getAllStars(): Record<string, StarCount> {
  return load();
}
