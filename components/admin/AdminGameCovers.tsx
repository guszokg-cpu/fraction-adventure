"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, Trash2, ImageIcon, CheckCircle2, AlertTriangle } from "lucide-react";
import { GAME_REGISTRY } from "@/data/gameRegistry";
import { coverKey, migrateLegacyCovers, removeGameCover, setGameCover, useGameCovers } from "@/lib/gameCovers";
import { resizeImageToBase64 } from "@/lib/imageUtils";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────────────────────────
   จัดการหน้าปกเกม (หลังบ้าน)
   - วนรายการจาก data/gameRegistry.ts → เพิ่มเกมใหม่ที่ registry แล้วโผล่ที่นี่เอง
   - บันทึกเป็นไฟล์จริงผ่าน /api/game-covers (ไม่ใช้ localStorage แล้ว)
   ───────────────────────────────────────────────────────────── */

export function AdminGameCovers() {
  const { covers } = useGameCovers();
  const [uploading, setUploading] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pendingRef = useRef<{ slug: string; id: string } | null>(null);

  const totalGames = GAME_REGISTRY.reduce((s, l) => s + l.games.length, 0);
  const withCover = Object.keys(covers).length;

  const flash = (ok: boolean, text: string) => {
    setMsg({ ok, text });
    window.setTimeout(() => setMsg(null), 4000);
  };

  /* ย้ายปกเก่าที่ค้างใน localStorage เข้าไฟล์จริงอัตโนมัติ (ครั้งเดียว) */
  useEffect(() => {
    migrateLegacyCovers()
      .then((n) => { if (n > 0) flash(true, `ย้ายหน้าปกเดิม ${n} รูปจากเบราว์เซอร์มาเก็บเป็นไฟล์ถาวรแล้ว`); })
      .catch(() => {});
  }, []);

  function pickFile(slug: string, id: string) {
    pendingRef.current = { slug, id };
    inputRef.current?.click();
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const target = pendingRef.current;
    if (!file || !target) return;
    const key = coverKey(target.slug, target.id);
    setUploading(key);
    try {
      const b64 = await resizeImageToBase64(file, 640);
      await setGameCover(target.slug, target.id, b64);
      flash(true, "บันทึกหน้าปกเป็นไฟล์แล้ว ✓");
    } catch (err) {
      flash(false, `บันทึกไม่สำเร็จ: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setUploading(null);
      pendingRef.current = null;
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove(slug: string, id: string) {
    try {
      await removeGameCover(slug, id);
      flash(true, "ลบหน้าปกแล้ว — กลับไปใช้ปกอีโมจิ");
    } catch (err) {
      flash(false, `ลบไม่สำเร็จ: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const groups = GAME_REGISTRY.filter((l) => filter === "all" || l.slug === filter);

  return (
    <div className="space-y-4">
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-xl shadow-sm ring-1 ring-slate-200">🖼️</span>
          <div className="min-w-0 flex-1">
            <p className="font-extrabold text-slate-800">หน้าปกเกม</p>
            <p className="text-xs text-slate-500">อัปโหลดภาพหน้าปกให้แต่ละเกม (ไม่อัปโหลดจะใช้ปกอีโมจิอัตโนมัติ)</p>
          </div>
          <span className="shrink-0 rounded-full bg-violet-100 px-3 py-1 text-xs font-extrabold text-violet-700">
            ใส่ปกแล้ว {withCover}/{totalGames}
          </span>
        </div>

        <div className="space-y-4 p-5">
          {msg && (
            <div className={cn("flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-extrabold ring-1", msg.ok ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-rose-50 text-rose-700 ring-rose-200")}>
              {msg.ok ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />} {msg.text}
            </div>
          )}

          {/* กรองตามบท */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilter("all")}
              className={cn("rounded-lg border-2 px-2.5 py-1 text-xs font-extrabold transition", filter === "all" ? "border-violet-500 bg-violet-100 text-violet-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}
            >
              ทุกบท ({totalGames})
            </button>
            {GAME_REGISTRY.map((l) => (
              <button
                key={l.slug}
                onClick={() => setFilter(l.slug)}
                className={cn("flex items-center gap-1 rounded-lg border-2 px-2.5 py-1 text-xs font-extrabold transition", filter === l.slug ? "border-violet-500 bg-violet-100 text-violet-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}
              >
                <span>{l.icon}</span> {l.lessonTitle} ({l.games.length})
              </button>
            ))}
          </div>

          <p className="rounded-xl bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700 ring-1 ring-sky-200">
            💡 แนะนำภาพแนวนอน ~640×400 px · ระบบย่อขนาดให้เอง · <b>เก็บเป็นไฟล์จริงใน <code>public/images/games/</code></b> จึงไม่หายแม้ล้าง cache หรือเปลี่ยนเบราว์เซอร์
          </p>

          {groups.map((lesson) => (
            <div key={lesson.slug} className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={cn("grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br text-base", lesson.accent)}>{lesson.icon}</span>
                <p className="text-sm font-extrabold text-slate-700">{lesson.lessonTitle}</p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {lesson.games.map((g) => {
                  const key = coverKey(lesson.slug, g.id);
                  const cover = covers[key];
                  const busy = uploading === key;
                  return (
                    <div key={g.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2.5">
                      {/* พรีวิวปก */}
                      <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg ring-1 ring-slate-200">
                        {cover ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={cover} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className={cn("flex h-full w-full items-center justify-center bg-gradient-to-br text-2xl", g.accent)}>{g.emoji}</div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-extrabold text-slate-800">{g.title}</p>
                        <p className="truncate text-[11px] font-bold text-slate-400">{g.concept}</p>
                        {cover && <p className="text-[10px] font-extrabold text-emerald-600">✓ ใช้ภาพที่อัปโหลด</p>}
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          onClick={() => pickFile(lesson.slug, g.id)}
                          disabled={busy}
                          className="flex items-center gap-1 rounded-lg border-2 border-slate-200 bg-white px-2 py-1.5 text-xs font-extrabold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                          title="อัปโหลดหน้าปก"
                        >
                          {busy ? <ImageIcon size={13} className="animate-pulse" /> : <Upload size={13} />}
                          {cover ? "เปลี่ยน" : "อัปโหลด"}
                        </button>
                        {cover && (
                          <button
                            onClick={() => handleRemove(lesson.slug, g.id)}
                            className="grid h-8 w-8 place-items-center rounded-lg border-2 border-rose-200 bg-white text-rose-500 transition hover:bg-rose-50"
                            title="ลบหน้าปก (กลับไปใช้ปกอีโมจิ)"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
