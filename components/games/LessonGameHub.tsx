"use client";

import { useState } from "react";
import { ArrowLeft, Play, Lock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { GameRenderer } from "@/components/games/GameRenderer";
import { getLessonGames } from "@/data/gameRegistry";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────────────────────────
   โซนเกมของบทเรียน (ใช้ร่วมทุกบท)
   อ่านรายการเกมจาก data/gameRegistry.ts และเรนเดอร์ผ่าน GameRenderer
   → เพิ่ม/แก้เกมที่ registry ที่เดียว ทุกบท + หน้า /games อัปเดตตาม
   ───────────────────────────────────────────────────────────── */

/* คลาสเต็มของแต่ละธีม — ต้องเขียนครบสตริง ไม่งั้น Tailwind purge ทิ้ง */
export type HubTheme = "violet" | "sky" | "amber" | "emerald" | "pink" | "orange" | "teal";
const THEME: Record<HubTheme, { card: string; play: string }> = {
  violet:  { card: "border-violet-200 hover:border-violet-400",   play: "bg-violet-600 group-hover:bg-violet-700" },
  sky:     { card: "border-sky-200 hover:border-sky-400",         play: "bg-sky-600 group-hover:bg-sky-700" },
  amber:   { card: "border-amber-200 hover:border-amber-400",     play: "bg-amber-600 group-hover:bg-amber-700" },
  emerald: { card: "border-emerald-200 hover:border-emerald-400", play: "bg-emerald-600 group-hover:bg-emerald-700" },
  pink:    { card: "border-pink-200 hover:border-pink-400",       play: "bg-pink-600 group-hover:bg-pink-700" },
  orange:  { card: "border-orange-200 hover:border-orange-400",   play: "bg-orange-600 group-hover:bg-orange-700" },
  teal:    { card: "border-teal-200 hover:border-teal-400",       play: "bg-teal-600 group-hover:bg-teal-700" },
};

type Props = {
  /** ตรงกับ slug ใน GAME_REGISTRY */
  slug: string;
  /** เลขขั้นที่แสดงบนหัวการ์ด */
  stepNo: number;
  /** เช่น "โซนเกมการหารเศษส่วน 🎮" */
  title: string;
  /** gradient ของแถบหัว */
  headerGradient: string;
  /** สีธีมของการ์ด */
  theme: HubTheme;
  /** ข้อความชวนเล่นใต้หัวข้อ */
  intro: string;
};

export function LessonGameHub({ slug, stepNo, title, headerGradient, theme, intro }: Props) {
  const th = THEME[theme];
  const games = getLessonGames(slug);
  const [active, setActive] = useState<string | null>(null);
  const activeGame = games.find((g) => g.id === active);

  return (
    <Card className="overflow-hidden p-0">
      <div className={cn("flex items-center justify-between px-4 py-2.5 text-white", headerGradient)}>
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white/25 text-sm font-extrabold">{stepNo}</span>
          <h2 className="text-lg font-extrabold">{title}</h2>
        </div>
        {activeGame && (
          <button onClick={() => setActive(null)} className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold transition hover:bg-white/30">
            <ArrowLeft size={14} /> กลับโซนเกม
          </button>
        )}
      </div>

      <div className="p-4 sm:p-6">
        {!activeGame && (
          <div className="space-y-4">
            <p className="text-center text-base font-extrabold text-slate-700 sm:text-lg">{intro}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {games.map((g) => (
                <button
                  key={g.id}
                  onClick={() => g.ready && setActive(g.id)}
                  disabled={!g.ready}
                  className={cn(
                    "group relative flex items-center gap-3 overflow-hidden rounded-2xl border-2 p-4 text-left transition",
                    g.ready
                      ? cn(th.card, "bg-white hover:shadow-md active:scale-[0.98]")
                      : "cursor-not-allowed border-slate-100 bg-slate-50",
                  )}
                >
                  <span className={cn("grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-3xl shadow-sm", g.accent, !g.ready && "opacity-50 grayscale")}>{g.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-base font-extrabold sm:text-lg", g.ready ? "text-slate-800" : "text-slate-400")}>{g.title}</span>
                      {!g.ready && <span className="flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-extrabold text-slate-500"><Lock size={10} /> เร็ว ๆ นี้</span>}
                    </div>
                    <p className={cn("mt-0.5 text-xs font-bold sm:text-sm", g.ready ? "text-slate-500" : "text-slate-400")}>{g.desc}</p>
                  </div>
                  {g.ready && (
                    <span className={cn("flex shrink-0 items-center gap-1 rounded-xl px-3 py-1.5 text-sm font-extrabold text-white transition", th.play)}>
                      <Play size={14} /> เล่น
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeGame && (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className={cn("grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br text-2xl", activeGame.accent)}>{activeGame.emoji}</span>
              <div>
                <h3 className="text-lg font-extrabold text-slate-800">{activeGame.title}</h3>
                <p className="text-xs font-bold text-slate-500">{activeGame.desc}</p>
              </div>
            </div>
            <GameRenderer slug={slug} id={activeGame.id} />
          </div>
        )}
      </div>
    </Card>
  );
}
