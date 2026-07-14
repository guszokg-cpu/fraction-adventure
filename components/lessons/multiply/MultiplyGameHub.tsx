"use client";

import { useState } from "react";
import { ArrowLeft, Play, Lock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { MultiplyMarketGame } from "@/components/lessons/multiply/MultiplyMarketGame";
import { MultiplyMoneyGame } from "@/components/lessons/multiply/MultiplyMoneyGame";
import { MultiplyGardenGame } from "@/components/lessons/multiply/MultiplyGardenGame";
import { MultiplyTowerGame } from "@/components/lessons/multiply/MultiplyTowerGame";
import { cn } from "@/lib/cn";

type GameDef = { id: string; emoji: string; title: string; desc: string; accent: string; ready: boolean };

const GAMES: GameDef[] = [
  { id: "market", emoji: "⚖️", title: "ตลาดนัดชั่งกิโล", desc: "วางถุงสินค้าทีละถุงลงตาชั่งเข็มหมุน เห็นการบวกซ้ำ — จำนวนเต็ม × เศษส่วน เปลี่ยนชื่อ/สินค้า/ตัวละครได้", accent: "from-amber-500 to-orange-500", ready: true },
  { id: "money", emoji: "💰", title: "เงินค่าขนมของฉัน", desc: "แบ่งเงิน (หรือจำนวนนักเรียน) เป็นกอง ๆ ด้วยแถบบาร์โมเดล แล้วเลือก a/b ของทั้งหมด — เศษส่วนของจำนวน สลับเงิน↔นักเรียนได้", accent: "from-emerald-500 to-green-500", ready: true },
  { id: "garden", emoji: "🥬", title: "แปลงผักคุณยาย", desc: "ปลูกผักเป็นคอลัมน์ แล้วหว่านผักบุ้งเป็นแถว ช่องซ้อนทับคือคำตอบ — เศษส่วน × เศษส่วน เห็นชัดว่าทำไมตัวส่วนคูณกัน", accent: "from-lime-500 to-emerald-500", ready: true },
  { id: "tower", emoji: "📦", title: "หอคอยกล่องมหัศจรรย์", desc: "วางกล่องซ้อนวัดความสูงรวมด้วยไม้บรรทัดยักษ์ (หรือเทน้ำลงแท็งก์) — จำนวนคละ × จำนวนเต็ม สลับเมตร↔ลิตรได้", accent: "from-amber-600 to-orange-500", ready: true },
];

export function MultiplyGameHub() {
  const [active, setActive] = useState<string | null>(null);
  const activeGame = GAMES.find((g) => g.id === active);

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between bg-gradient-to-r from-amber-600 to-orange-500 px-4 py-2.5 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white/25 text-sm font-extrabold">10</span>
          <h2 className="text-lg font-extrabold">โซนเกมการคูณเศษส่วน 🎮</h2>
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
              เลือกเกมที่อยากเล่น — สร้างโจทย์ปัญหาการคูณจากชีวิตจริง แล้วพิสูจน์คำตอบให้เห็นภาพ!
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {GAMES.map((g) => (
                <button
                  key={g.id}
                  onClick={() => g.ready && setActive(g.id)}
                  disabled={!g.ready}
                  className={cn(
                    "group relative flex items-center gap-3 overflow-hidden rounded-2xl border-2 p-4 text-left transition",
                    g.ready ? "border-amber-200 bg-white hover:border-amber-400 hover:shadow-md active:scale-[0.98]" : "cursor-not-allowed border-slate-100 bg-slate-50",
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
                    <span className="flex shrink-0 items-center gap-1 rounded-xl bg-amber-600 px-3 py-1.5 text-sm font-extrabold text-white transition group-hover:bg-amber-700">
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
            {activeGame.id === "market" && <MultiplyMarketGame />}
            {activeGame.id === "money" && <MultiplyMoneyGame />}
            {activeGame.id === "garden" && <MultiplyGardenGame />}
            {activeGame.id === "tower" && <MultiplyTowerGame />}
          </div>
        )}
      </div>
    </Card>
  );
}
