"use client";

import { useState } from "react";
import { ArrowLeft, Play, Lock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FishJarGame } from "@/components/lessons/equivalent/FishJarGame";
import { FractionChocFactory } from "@/components/lessons/equivalent/FractionChocFactory";
import { FractionTrainGame } from "@/components/lessons/equivalent/FractionTrainGame";
import { FractionBalloonGame } from "@/components/lessons/equivalent/FractionBalloonGame";
import { cn } from "@/lib/cn";

type GameDef = {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  accent: string;
  ready: boolean;
};

const GAMES: GameDef[] = [
  { id: "jar", emoji: "🐟", title: "โหลปลาเศษส่วน", desc: "ติดแถบเศษส่วนที่โหล เทน้ำหาขีดที่ตรงกัน — โหมดครู + ภารกิจ", accent: "from-sky-500 to-cyan-500", ready: true },
  { id: "choc", emoji: "🍫", title: "โรงงานช็อกโกแลตแฝด", desc: "ตัดแท่งขวาให้เท่าแท่งซ้าย พิสูจน์ด้วยการเทียบปริมาณ", accent: "from-amber-600 to-orange-500", ready: true },
  { id: "train", emoji: "🚂", title: "รถไฟจับคู่เศษส่วน", desc: "เปิดการ์ดจับคู่ที่เท่ากัน ต่อขบวนรถไฟ 3D + โหมด 2 ทีมแข่งหน้าห้อง", accent: "from-emerald-500 to-teal-500", ready: true },
  { id: "balloon", emoji: "🎈", title: "ยิงลูกโป่งเศษส่วน", desc: "แตะเฉพาะลูกโป่งที่เท่ากับโจทย์ ก่อนลอยหลุดไป!", accent: "from-rose-500 to-pink-500", ready: true },
];

export function EquivalentGameHub() {
  const [active, setActive] = useState<string | null>(null);
  const activeGame = GAMES.find((g) => g.id === active);

  return (
    <Card className="overflow-hidden p-0">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-teal-600 to-violet-500 px-4 py-2.5 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white/25 text-sm font-extrabold">9</span>
          <h2 className="text-lg font-extrabold">โซนเกมเศษส่วนเท่ากัน 🎮</h2>
        </div>
        {activeGame && (
          <button onClick={() => setActive(null)} className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold transition hover:bg-white/30">
            <ArrowLeft size={14} /> กลับโซนเกม
          </button>
        )}
      </div>

      <div className="p-4 sm:p-6">
        {/* ── เมนูเลือกเกม ── */}
        {!activeGame && (
          <div className="space-y-4">
            <p className="text-center text-base font-extrabold text-slate-700 sm:text-lg">
              เลือกเกมที่อยากเล่น — ฝึกหาเศษส่วนที่เท่ากันให้สนุกและแม่นขึ้น!
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {GAMES.map((g) => (
                <button
                  key={g.id}
                  onClick={() => g.ready && setActive(g.id)}
                  disabled={!g.ready}
                  className={cn(
                    "group relative flex items-center gap-3 overflow-hidden rounded-2xl border-2 p-4 text-left transition",
                    g.ready ? "border-teal-200 bg-white hover:border-teal-400 hover:shadow-md active:scale-[0.98]" : "cursor-not-allowed border-slate-100 bg-slate-50"
                  )}
                >
                  <span className={cn("grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-3xl shadow-sm", g.accent, !g.ready && "opacity-50 grayscale")}>
                    {g.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-base font-extrabold sm:text-lg", g.ready ? "text-slate-800" : "text-slate-400")}>{g.title}</span>
                      {!g.ready && <span className="flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-extrabold text-slate-500"><Lock size={10} /> เร็ว ๆ นี้</span>}
                    </div>
                    <p className={cn("mt-0.5 text-xs font-bold sm:text-sm", g.ready ? "text-slate-500" : "text-slate-400")}>{g.desc}</p>
                  </div>
                  {g.ready && (
                    <span className="flex shrink-0 items-center gap-1 rounded-xl bg-teal-600 px-3 py-1.5 text-sm font-extrabold text-white transition group-hover:bg-teal-700">
                      <Play size={14} /> เล่น
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── เกมที่เลือก ── */}
        {activeGame && (
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className={cn("grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br text-2xl", activeGame.accent)}>{activeGame.emoji}</span>
              <div>
                <h3 className="text-lg font-extrabold text-slate-800">{activeGame.title}</h3>
                <p className="text-xs font-bold text-slate-500">{activeGame.desc}</p>
              </div>
            </div>
            {activeGame.id === "jar" && <FishJarGame />}
            {activeGame.id === "choc" && <FractionChocFactory />}
            {activeGame.id === "train" && <FractionTrainGame />}
            {activeGame.id === "balloon" && <FractionBalloonGame />}
          </div>
        )}
      </div>
    </Card>
  );
}
