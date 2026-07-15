"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Lock, Search, BookOpen, Gamepad2 } from "lucide-react";
import { GameRenderer } from "@/components/games/GameRenderer";
import { GAME_REGISTRY, totalReadyGames, type GameDef, type LessonGames } from "@/data/gameRegistry";
import { coverKey, useGameCovers } from "@/lib/gameCovers";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────────────────────────
   หน้ารวมเกมทั้งหมด — อ่านจาก data/gameRegistry.ts ที่เดียว
   เพิ่ม/แก้เกมในบทเรียน → หน้านี้อัปเดตเองอัตโนมัติ
   ───────────────────────────────────────────────────────────── */

type Selected = { lesson: LessonGames; game: GameDef } | null;

/* หน้าปกเกม — ใช้ภาพที่แอดมินอัปโหลดถ้ามี ไม่งั้นใช้ปกอีโมจิ+gradient */
function GameCover({ emoji, accent, cover, big = false }: { emoji: string; accent: string; cover?: string; big?: boolean }) {
  if (cover) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={cover} alt="" className={cn("block object-cover", big ? "h-14 w-14 rounded-xl" : "h-full w-full")} />
    );
  }
  return (
    <div className={cn("relative flex shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br", accent, big ? "h-14 w-14 rounded-xl" : "h-full w-full")}>
      {/* ลายจุดพื้นหลัง */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,.55) 1.5px, transparent 1.6px)", backgroundSize: "12px 12px" }}
      />
      {/* วงแสง */}
      <div className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/25 blur-md" />
      <div className="pointer-events-none absolute -bottom-10 -left-6 h-24 w-24 rounded-full bg-black/10 blur-md" />
      <span className={cn("relative drop-shadow-lg", big ? "text-3xl" : "text-6xl sm:text-7xl")}>{emoji}</span>
    </div>
  );
}

export function AllGamesContent() {
  const [selected, setSelected] = useState<Selected>(null);
  const [q, setQ] = useState("");
  const [lessonFilter, setLessonFilter] = useState<string>("all");
  const { covers } = useGameCovers();

  const readyTotal = totalReadyGames();

  /* ค้นหา + กรองตามบทเรียน */
  const groups = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return GAME_REGISTRY
      .filter((l) => lessonFilter === "all" || l.slug === lessonFilter)
      .map((l) => ({
        ...l,
        games: l.games.filter(
          (g) => !kw || g.title.toLowerCase().includes(kw) || g.desc.toLowerCase().includes(kw) || g.concept.toLowerCase().includes(kw) || l.lessonTitle.toLowerCase().includes(kw),
        ),
      }))
      .filter((l) => l.games.length > 0);
  }, [q, lessonFilter]);

  const shownCount = groups.reduce((s, l) => s + l.games.length, 0);

  /* ── กำลังเล่นเกมอยู่ ── */
  if (selected) {
    const { lesson, game } = selected;
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex min-w-0 items-center gap-3">
            <GameCover emoji={game.emoji} accent={game.accent} cover={covers[coverKey(lesson.slug, game.id)]} big />
            <div className="min-w-0">
              <h2 className="truncate text-lg font-extrabold text-slate-800">{game.title}</h2>
              <p className="truncate text-xs font-bold text-slate-500">{game.concept} · จากบท{lesson.lessonTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={lesson.href} className="flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50">
              <BookOpen size={15} /> ไปบทเรียน
            </Link>
            <button onClick={() => setSelected(null)} className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-slate-700">
              <ArrowLeft size={15} /> กลับหน้ารวมเกม
            </button>
          </div>
        </div>
        <GameRenderer slug={lesson.slug} id={game.id} />
      </div>
    );
  }

  /* ── หน้ารวมเกม ── */
  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-500 p-6 shadow-xl">
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,.6) 1.5px, transparent 1.6px)", backgroundSize: "16px 16px" }}
        />
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Gamepad2 className="text-white drop-shadow" size={30} />
              <h1 className="text-2xl font-extrabold text-white drop-shadow sm:text-3xl">เกมเศษส่วน</h1>
            </div>
            <p className="mt-1 max-w-2xl text-sm font-bold text-white/90">
              รวมทุกเกมจากทุกบทเรียนไว้ที่เดียว — เลือกเกมแล้วเล่นได้ทันที ทุกเกมมีโหมดครูสำหรับสอนหน้าห้อง
            </p>
          </div>
          <div className="flex gap-2">
            <div className="rounded-2xl bg-white/95 px-4 py-2 text-center shadow">
              <div className="text-2xl font-extrabold text-violet-700">{readyTotal}</div>
              <div className="text-[10px] font-extrabold text-slate-500">เกมพร้อมเล่น</div>
            </div>
            <div className="rounded-2xl bg-white/95 px-4 py-2 text-center shadow">
              <div className="text-2xl font-extrabold text-fuchsia-600">{GAME_REGISTRY.length}</div>
              <div className="text-[10px] font-extrabold text-slate-500">บทเรียน</div>
            </div>
          </div>
        </div>
      </div>

      {/* ค้นหา + กรอง */}
      <div className="space-y-2 rounded-2xl border-2 border-slate-200 bg-white p-3 shadow-sm">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ค้นหาเกม เช่น ตาชั่ง, ริบบิ้น, จำนวนคละ…"
            className="w-full rounded-xl border-2 border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm font-bold text-slate-700 outline-none transition focus:border-violet-400 focus:bg-white"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setLessonFilter("all")}
            className={cn("rounded-lg border-2 px-2.5 py-1 text-xs font-extrabold transition", lessonFilter === "all" ? "border-violet-500 bg-violet-100 text-violet-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}
          >
            ทุกบท
          </button>
          {GAME_REGISTRY.map((l) => (
            <button
              key={l.slug}
              onClick={() => setLessonFilter(l.slug)}
              className={cn("flex items-center gap-1 rounded-lg border-2 px-2.5 py-1 text-xs font-extrabold transition", lessonFilter === l.slug ? "border-violet-500 bg-violet-100 text-violet-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}
            >
              <span>{l.icon}</span> {l.lessonTitle}
            </button>
          ))}
        </div>
      </div>

      {shownCount === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center">
          <div className="text-4xl">🔍</div>
          <p className="mt-2 text-sm font-extrabold text-slate-400">ไม่พบเกมที่ค้นหา</p>
        </div>
      )}

      {/* กลุ่มตามบทเรียน */}
      {groups.map((lesson) => (
        <section key={lesson.slug} className="space-y-3">
          <div className="flex items-center gap-2">
            <span className={cn("grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br text-xl shadow-sm", lesson.accent)}>{lesson.icon}</span>
            <h2 className="text-lg font-extrabold text-slate-800">{lesson.lessonTitle}</h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-extrabold text-slate-500">{lesson.games.length} เกม</span>
            <Link href={lesson.href} className="ml-auto flex items-center gap-1 text-xs font-extrabold text-slate-400 transition hover:text-violet-600">
              <BookOpen size={13} /> ไปบทเรียน
            </Link>
          </div>

          {/* แถวละ 2 เกม — การ์ดใหญ่ ไม่เบียดกัน */}
          <div className="grid gap-4 md:grid-cols-2">
            {lesson.games.map((g) => (
              <button
                key={g.id}
                onClick={() => g.ready && setSelected({ lesson, game: g })}
                disabled={!g.ready}
                className={cn(
                  "group flex overflow-hidden rounded-2xl border-2 bg-white text-left shadow-sm transition-all duration-200",
                  g.ready
                    ? "border-slate-200 hover:-translate-y-1 hover:border-violet-300 hover:shadow-xl active:scale-[0.99]"
                    : "cursor-not-allowed border-slate-100 opacity-60",
                )}
              >
                {/* หน้าปก (ซ้าย) */}
                <div className={cn("relative w-32 shrink-0 sm:w-40", !g.ready && "grayscale")}>
                  <GameCover emoji={g.emoji} accent={g.accent} cover={covers[coverKey(lesson.slug, g.id)]} />
                  {!g.ready && (
                    <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-slate-700/80 px-2 py-0.5 text-[10px] font-extrabold text-white">
                      <Lock size={9} /> เร็ว ๆ นี้
                    </span>
                  )}
                </div>

                {/* เนื้อหา (ขวา) */}
                <div className="flex flex-1 flex-col gap-2 p-4">
                  {/* ป้ายแนวคิดที่สอน */}
                  <span className={cn("w-fit rounded-lg bg-gradient-to-r px-2 py-0.5 text-[10px] font-extrabold text-white shadow-sm", g.accent)}>
                    📚 {g.concept}
                  </span>
                  <h3 className={cn("text-base font-extrabold leading-snug sm:text-lg", g.ready ? "text-slate-800 group-hover:text-violet-700" : "text-slate-400")}>
                    {g.title}
                  </h3>
                  <p className="flex-1 text-xs font-bold leading-relaxed text-slate-500">{g.desc}</p>
                  {g.ready && (
                    <span className="mt-0.5 flex w-fit items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-sm font-extrabold text-white transition group-hover:bg-violet-700">
                      <Play size={14} /> เล่นเลย
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
