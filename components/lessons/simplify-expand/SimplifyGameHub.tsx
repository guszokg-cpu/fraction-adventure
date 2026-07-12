"use client";

import { useState } from "react";
import { ArrowLeft, Play } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SimplifyShrinkMachine } from "@/components/lessons/simplify-expand/SimplifyShrinkMachine";
import { SimplifyRocketGame } from "@/components/lessons/simplify-expand/SimplifyRocketGame";
import { cn } from "@/lib/cn";

type GameDef = { id: string; emoji: string; title: string; desc: string; accent: string };

const GAMES: GameDef[] = [
  { id: "shrink", emoji: "🏭", title: "เครื่องย่อเศษส่วน", desc: "กดตัวหารบีบให้เล็กลง — ค่าเท่าเดิม ชื่อเล็กลง จนอย่างต่ำ", accent: "from-orange-500 to-amber-500" },
  { id: "rocket", emoji: "🚀", title: "จรวดเศษส่วนอย่างต่ำ", desc: "เลือกรูปอย่างต่ำเติมเชื้อเพลิงให้จรวดทะยาน — มีโหมด 2 ทีมแข่ง", accent: "from-indigo-500 to-violet-500" },
];

export function SimplifyGameHub() {
  const [active, setActive] = useState<string | null>(null);
  const activeGame = GAMES.find((g) => g.id === active);

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white/25 text-sm font-extrabold">10</span>
          <h2 className="text-lg font-extrabold">โซนเกมเศษส่วนอย่างต่ำ 🎮</h2>
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
              เลือกเกมที่อยากเล่น — ฝึกทำเศษส่วนอย่างต่ำให้สนุกและแม่นขึ้น!
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {GAMES.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setActive(g.id)}
                  className="group relative flex items-center gap-3 overflow-hidden rounded-2xl border-2 border-orange-200 bg-white p-4 text-left transition hover:border-orange-400 hover:shadow-md active:scale-[0.98]"
                >
                  <span className={cn("grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-3xl shadow-sm", g.accent)}>{g.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <span className="text-base font-extrabold text-slate-800 sm:text-lg">{g.title}</span>
                    <p className="mt-0.5 text-xs font-bold text-slate-500 sm:text-sm">{g.desc}</p>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 rounded-xl bg-orange-600 px-3 py-1.5 text-sm font-extrabold text-white transition group-hover:bg-orange-700">
                    <Play size={14} /> เล่น
                  </span>
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
            {activeGame.id === "shrink" && <SimplifyShrinkMachine />}
            {activeGame.id === "rocket" && <SimplifyRocketGame />}
          </div>
        )}
      </div>
    </Card>
  );
}
