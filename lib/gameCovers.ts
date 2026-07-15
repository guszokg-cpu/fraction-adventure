"use client";

import { useCallback, useEffect, useState } from "react";

/* ─────────────────────────────────────────────────────────────
   หน้าปกเกม — เก็บเป็นไฟล์จริงผ่าน /api/game-covers
   (เดิมเก็บ base64 ใน localStorage → ชนเพดาน ~5MB และหายง่าย)

   คีย์ = `${lessonSlug}:${gameId}` ตรงกับ data/gameRegistry.ts
   ค่า   = path รูป เช่น "/images/games/divide-frog.jpg?v=1712..."
   ───────────────────────────────────────────────────────────── */

const API = "/api/game-covers";
const CHANGED_EVENT = "fa-game-covers-changed";
/** คีย์เดิมสมัยเก็บ localStorage — ใช้ย้ายข้อมูลเก่าเข้าระบบไฟล์ */
const LEGACY_KEY = "fa_game_covers";

export type GameCovers = Record<string, string>;

export const coverKey = (slug: string, id: string) => `${slug}:${id}`;

const notify = () => window.dispatchEvent(new CustomEvent(CHANGED_EVENT));

export async function fetchGameCovers(): Promise<GameCovers> {
  try {
    const res = await fetch(API, { cache: "no-store" });
    return res.ok ? ((await res.json()) as GameCovers) : {};
  } catch {
    return {};
  }
}

export async function setGameCover(slug: string, id: string, dataUrl: string): Promise<void> {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, id, dataUrl }),
  });
  const json = await res.json().catch(() => ({ ok: false, error: "อ่านคำตอบจากเซิร์ฟเวอร์ไม่ได้" }));
  if (!res.ok || !json.ok) throw new Error(json.error || "บันทึกหน้าปกไม่สำเร็จ");
  notify();
}

export async function removeGameCover(slug: string, id: string): Promise<void> {
  const res = await fetch(API, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, id }),
  });
  const json = await res.json().catch(() => ({ ok: false }));
  if (!res.ok || !json.ok) throw new Error(json.error || "ลบหน้าปกไม่สำเร็จ");
  notify();
}

/** ย้ายปกที่ยังค้างใน localStorage (ระบบเก่า) เข้าไฟล์จริง — ทำครั้งเดียวแล้วล้างคีย์เก่า */
export async function migrateLegacyCovers(): Promise<number> {
  if (typeof window === "undefined") return 0;
  let legacy: GameCovers = {};
  try {
    legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) ?? "{}") as GameCovers;
  } catch {
    localStorage.removeItem(LEGACY_KEY);
    return 0;
  }
  const entries = Object.entries(legacy).filter(([, v]) => typeof v === "string" && v.startsWith("data:image/"));
  if (entries.length === 0) {
    if (Object.keys(legacy).length > 0) localStorage.removeItem(LEGACY_KEY);
    return 0;
  }

  let moved = 0;
  for (const [key, dataUrl] of entries) {
    const [slug, id] = key.split(":");
    if (!slug || !id) continue;
    try {
      await setGameCover(slug, id, dataUrl);
      moved++;
    } catch {
      /* ย้ายไม่ได้ก็ข้าม — เก็บ localStorage ไว้ก่อน ไม่ลบทิ้ง */
    }
  }
  if (moved === entries.length) localStorage.removeItem(LEGACY_KEY);
  notify();
  return moved;
}

/** อ่านหน้าปกทั้งหมด + รีเฟรชอัตโนมัติเมื่อมีการเปลี่ยนแปลง */
export function useGameCovers(): { covers: GameCovers; reload: () => void } {
  const [covers, setCovers] = useState<GameCovers>({});

  const reload = useCallback(() => {
    void fetchGameCovers().then(setCovers);
  }, []);

  useEffect(() => {
    reload();
    window.addEventListener(CHANGED_EVENT, reload);
    return () => window.removeEventListener(CHANGED_EVENT, reload);
  }, [reload]);

  return { covers, reload };
}
