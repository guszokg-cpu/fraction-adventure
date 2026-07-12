"use client";

import { useState } from "react";
import { ArrowLeft, Play, Lock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { AddJuiceTankGame } from "@/components/lessons/add/AddJuiceTankGame";
import { AddMixedDrinkGame } from "@/components/lessons/add/AddMixedDrinkGame";
import { AddBridgeGame } from "@/components/lessons/add/AddBridgeGame";
import { AddJourneyGame } from "@/components/lessons/add/AddJourneyGame";
import { AddRaceGame } from "@/components/lessons/add/AddRaceGame";
import { cn } from "@/lib/cn";

type GameDef = { id: string; emoji: string; title: string; desc: string; accent: string; ready: boolean };

const GAMES: GameDef[] = [
  { id: "juice", emoji: "🍊", title: "โหลน้ำส้มรวมพลัง", desc: "เทน้ำส้มจากโหล A ลงโหล B ดูระดับเพิ่มขึ้นจริง — ครูตั้งโจทย์ได้ + โหมดทายก่อนเท", accent: "from-orange-500 to-amber-500", ready: true },
  { id: "drink", emoji: "🥤", title: "บาร์ผสมน้ำ (จำนวนคละ)", desc: "เลือกสี+ตั้งชื่อน้ำ เทรวมสองแก้ว น้ำล้นก็เพิ่มแก้ว = จำนวนคละ 1 แก้วกับอีกเศษ", accent: "from-pink-500 to-rose-500", ready: true },
  { id: "bridge", emoji: "🌉", title: "สะพานข้ามเหวเศษส่วน", desc: "เลือกแผ่นไม้ 2 แผ่นบวกให้พอดีเหว ตัวละครเดินข้าม — โหมดครู + แข่ง 2 ทีม", accent: "from-emerald-500 to-teal-500", ready: true },
  { id: "whole", emoji: "🚗", title: "ขับรถให้ถึงเส้นชัย (ครบ 1)", desc: "เลือกระยะที่เหลือให้รถถึงเส้นชัยพอดี (รวมกันได้ 1) + โหมดระยะจริง กม./ม.", accent: "from-violet-500 to-purple-500", ready: true },
  { id: "race", emoji: "🏎️", title: "รถแข่งบวกเร็ว", desc: "เห็นโจทย์ตอบเลย ตอบถูกรถพุ่ง แข่งกับรถ AI ถึงเส้นชัยก่อนชนะ", accent: "from-rose-500 to-pink-500", ready: true },
];

export function AddGameHub() {
  const [active, setActive] = useState<string | null>(null);
  const activeGame = GAMES.find((g) => g.id === active);

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between bg-gradient-to-r from-orange-500 to-rose-500 px-4 py-2.5 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white/25 text-sm font-extrabold">9</span>
          <h2 className="text-lg font-extrabold">โซนเกมการบวกเศษส่วน 🎮</h2>
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
            <p className="text-center text-base font-extrabold text-slate-700 sm:text-lg">
              เลือกเกมที่อยากเล่น — ฝึกบวกเศษส่วนให้เห็นภาพและแม่นขึ้น!
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {GAMES.map((g) => (
                <button
                  key={g.id}
                  onClick={() => g.ready && setActive(g.id)}
                  disabled={!g.ready}
                  className={cn(
                    "group relative flex items-center gap-3 overflow-hidden rounded-2xl border-2 p-4 text-left transition",
                    g.ready ? "border-orange-200 bg-white hover:border-orange-400 hover:shadow-md active:scale-[0.98]" : "cursor-not-allowed border-slate-100 bg-slate-50",
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
                    <span className="flex shrink-0 items-center gap-1 rounded-xl bg-orange-600 px-3 py-1.5 text-sm font-extrabold text-white transition group-hover:bg-orange-700">
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
            {activeGame.id === "juice" && <AddJuiceTankGame />}
            {activeGame.id === "drink" && <AddMixedDrinkGame />}
            {activeGame.id === "bridge" && <AddBridgeGame />}
            {activeGame.id === "whole" && <AddJourneyGame />}
            {activeGame.id === "race" && <AddRaceGame />}
          </div>
        )}
      </div>
    </Card>
  );
}
