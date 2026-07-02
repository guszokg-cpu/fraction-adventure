"use client";

import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  score: number;
  total: number;
  results: boolean[];
  onRestart: () => void;
};

export function DrawChallengeResult({ score, total, results, onRestart }: Props) {
  const pct = score / total;
  const emoji = pct >= 0.9 ? "🏆" : pct >= 0.7 ? "😄" : pct >= 0.5 ? "🙂" : "💪";
  const msg =
    pct >= 0.9 ? "ยอดเยี่ยมมาก!" : pct >= 0.7 ? "ทำได้ดีมาก!" : pct >= 0.5 ? "พอใช้ได้ ลองอีกครั้งนะ" : "ฝึกฝนอีกนิดนะ";

  return (
    <div className="flex flex-col items-center gap-5 py-10 text-center">
      <div className="text-7xl">{emoji}</div>
      <div>
        <p className="text-xl font-extrabold text-slate-700">{msg}</p>
        <p className="mt-2 text-5xl font-extrabold text-brand-700">
          {score}
          <span className="text-2xl text-slate-400"> / {total}</span>
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {results.map((ok, i) => (
          <div
            key={i}
            title={`ข้อ ${i + 1}: ${ok ? "ถูก" : "ผิด"}`}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full text-sm font-extrabold",
              ok ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600"
            )}
          >
            {ok ? "✓" : "✗"}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-xl bg-violet-50 px-4 py-3 text-sm font-bold text-violet-700">
        🐻 เก่งมากที่ลองสร้างภาพเศษส่วนด้วยตัวเอง!
      </div>

      <button
        onClick={onRestart}
        className="flex items-center gap-2 rounded-xl bg-brand-600 px-8 py-3.5 text-sm font-extrabold text-white transition hover:bg-brand-700 active:scale-[0.98]"
      >
        <RotateCcw size={16} />
        ทำอีกชุด
      </button>
    </div>
  );
}
