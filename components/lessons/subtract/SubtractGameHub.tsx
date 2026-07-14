"use client";

import { useState } from "react";
import { ArrowLeft, Play, Lock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SubtractFishJarGame } from "@/components/lessons/subtract/SubtractFishJarGame";
import { SubtractChocoGame } from "@/components/lessons/subtract/SubtractChocoGame";
import { SubtractBalanceGame } from "@/components/lessons/subtract/SubtractBalanceGame";
import { SubtractCakeShopGame } from "@/components/lessons/subtract/SubtractCakeShopGame";
import { SubtractBottleGame } from "@/components/lessons/subtract/SubtractBottleGame";
import { cn } from "@/lib/cn";

type GameDef = { id: string; emoji: string; title: string; desc: string; accent: string; ready: boolean };

const GAMES: GameDef[] = [
  { id: "fishjar", emoji: "🐠", title: "โหลปลาน้ำลด", desc: "เทน้ำออกจากโหลปลาผ่านก๊อก น้ำลดจริง ปลาลอยตามระดับ — ตัวส่วนเท่ากัน โหมดครู + ทายก่อนเท", accent: "from-sky-500 to-cyan-500", ready: true },
  { id: "choco", emoji: "🍫", title: "ช็อกโกแลตแบ่งเพื่อน", desc: "หักช็อกโกแลตแบ่งให้เพื่อน เหลือกี่ชิ้น — ตัวส่วนเท่ากัน โหมดครู + แบ่งปันที่โรงเรียน 8 ข้อ", accent: "from-amber-600 to-orange-500", ready: true },
  { id: "balance", emoji: "⚖️", title: "เครื่องชั่งสมดุล", desc: "ทำส่วนให้เท่าก่อน แล้ววางลูกตุ้มชั่งหาความต่าง — ส่วนไม่เท่ากัน โหมดครู + นักชั่งแห่งแล็บ", accent: "from-violet-500 to-purple-500", ready: true },
  { id: "cake", emoji: "🎂", title: "ร้านขนมหมู่บ้าน", desc: "ลบจำนวนคละที่เศษพอลบกันได้ ลูกค้าพิกเซลเดินมาซื้อเค้ก โหมดครู + เปิดร้านวันหยุด", accent: "from-pink-500 to-rose-500", ready: true },
  { id: "bottle", emoji: "🧃", title: "สถานีน้ำนักวิ่ง", desc: "เศษลบไม่ได้ ต้องเปิดขวดเต็มแตกเป็นเศษก่อน (การยืม) — โหมดครู + สถานีน้ำ กม.5", accent: "from-emerald-500 to-teal-500", ready: true },
];

export function SubtractGameHub() {
  const [active, setActive] = useState<string | null>(null);
  const activeGame = GAMES.find((g) => g.id === active);

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between bg-gradient-to-r from-sky-500 to-cyan-500 px-4 py-2.5 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white/25 text-sm font-extrabold">9</span>
          <h2 className="text-lg font-extrabold">โซนเกมการลบเศษส่วน 🎮</h2>
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
              เลือกเกมที่อยากเล่น — ฝึกลบเศษส่วนให้เห็นภาพและแม่นขึ้น!
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {GAMES.map((g) => (
                <button
                  key={g.id}
                  onClick={() => g.ready && setActive(g.id)}
                  disabled={!g.ready}
                  className={cn(
                    "group relative flex items-center gap-3 overflow-hidden rounded-2xl border-2 p-4 text-left transition",
                    g.ready ? "border-sky-200 bg-white hover:border-sky-400 hover:shadow-md active:scale-[0.98]" : "cursor-not-allowed border-slate-100 bg-slate-50",
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
                    <span className="flex shrink-0 items-center gap-1 rounded-xl bg-sky-600 px-3 py-1.5 text-sm font-extrabold text-white transition group-hover:bg-sky-700">
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
            {activeGame.id === "fishjar" && <SubtractFishJarGame />}
            {activeGame.id === "choco" && <SubtractChocoGame />}
            {activeGame.id === "balance" && <SubtractBalanceGame />}
            {activeGame.id === "cake" && <SubtractCakeShopGame />}
            {activeGame.id === "bottle" && <SubtractBottleGame />}
          </div>
        )}
      </div>
    </Card>
  );
}
