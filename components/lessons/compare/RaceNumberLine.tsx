"use client";

import { useState } from "react";
import { Check, Flag, Minus, Play, Plus, Shuffle, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { cn } from "@/lib/cn";
import { randInt } from "@/lib/randomFraction";

type Runner = { numerator: number; denominator: number };
type Guess = "left" | "right" | "tie";

// พิกัดลู่วิ่ง
const LEFT = 30;
const RIGHT = 290;
const USABLE = RIGHT - LEFT;

function CompactPicker({
  runner,
  onChange,
  color,
}: {
  runner: Runner;
  onChange: (r: Runner) => void;
  color: string;
}) {
  function setNum(n: number) {
    onChange({ ...runner, numerator: Math.max(1, Math.min(n, runner.denominator - 1)) });
  }
  function setDen(d: number) {
    const dd = Math.max(2, Math.min(d, 9));
    onChange({ denominator: dd, numerator: Math.min(runner.numerator, dd - 1) });
  }
  return (
    <div className="flex items-center gap-3">
      <StackedFraction numerator={runner.numerator} denominator={runner.denominator} className="text-2xl" toneClassName={color} />
      <div className="space-y-1">
        <div className="flex items-center gap-1">
          <span className="w-10 text-[11px] font-bold text-slate-400">เศษ</span>
          <button onClick={() => setNum(runner.numerator - 1)} className="grid h-6 w-6 place-items-center rounded bg-slate-100 hover:bg-slate-200"><Minus size={12} /></button>
          <button onClick={() => setNum(runner.numerator + 1)} className="grid h-6 w-6 place-items-center rounded bg-slate-100 hover:bg-slate-200"><Plus size={12} /></button>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-10 text-[11px] font-bold text-slate-400">ส่วน</span>
          <button onClick={() => setDen(runner.denominator - 1)} className="grid h-6 w-6 place-items-center rounded bg-slate-100 hover:bg-slate-200"><Minus size={12} /></button>
          <button onClick={() => setDen(runner.denominator + 1)} className="grid h-6 w-6 place-items-center rounded bg-slate-100 hover:bg-slate-200"><Plus size={12} /></button>
        </div>
      </div>
    </div>
  );
}

export function RaceNumberLine() {
  const [left, setLeft] = useState<Runner>({ numerator: 2, denominator: 3 });
  const [right, setRight] = useState<Runner>({ numerator: 3, denominator: 5 });
  const [guess, setGuess] = useState<Guess | null>(null);
  const [raced, setRaced] = useState(false);

  const leftVal = left.numerator / left.denominator;
  const rightVal = right.numerator / right.denominator;
  const winner: Guess = leftVal > rightVal ? "left" : leftVal < rightVal ? "right" : "tie";
  const guessedRight = guess === winner;

  // ตำแหน่งนักวิ่ง — ก่อนแข่งอยู่ที่เส้นสตาร์ท (0) เพื่อความน่าตื่นเต้น
  const leftPct = raced ? (leftVal * USABLE + LEFT) / 3.2 : (LEFT / 3.2);
  const rightPct = raced ? (rightVal * USABLE + LEFT) / 3.2 : (LEFT / 3.2);

  function reset(next: { left: Runner; right: Runner }) {
    setLeft(next.left);
    setRight(next.right);
    setGuess(null);
    setRaced(false);
  }

  function randomize() {
    const d1 = randInt(2, 8);
    const d2 = randInt(2, 8);
    reset({ left: { denominator: d1, numerator: randInt(1, d1 - 1) }, right: { denominator: d2, numerator: randInt(1, d2 - 1) } });
  }

  return (
    <Card className="overflow-hidden rounded-3xl p-0 shadow-sm">
      <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-green-500 px-6 py-5 text-white">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20 text-lg font-extrabold">4</span>
        <div>
          <h2 className="text-2xl font-extrabold">แข่งวิ่งบนเส้นจำนวน</h2>
          <p className="mt-0.5 text-sm font-bold text-emerald-100">เศษส่วนที่ค่ามากกว่าจะวิ่งไปได้ไกลกว่า ใครถึงเส้นชัยก่อนชนะ!</p>
        </div>
      </div>

      <div className="space-y-5 p-6">
        {/* เลือกนักวิ่ง */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-sky-100 bg-sky-50/40 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-extrabold text-sky-700"><span aria-hidden>🐢</span> นักวิ่งเต่า</div>
            <CompactPicker runner={left} onChange={(r) => { setLeft(r); setRaced(false); setGuess(null); }} color="text-sky-600" />
          </div>
          <div className="rounded-2xl border border-pink-100 bg-pink-50/40 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-extrabold text-pink-700"><span aria-hidden>🐇</span> นักวิ่งกระต่าย</div>
            <CompactPicker runner={right} onChange={(r) => { setRight(r); setRaced(false); setGuess(null); }} color="text-pink-600" />
          </div>
        </div>

        {/* ทายก่อนแข่ง */}
        {!raced && (
          <div className="space-y-2">
            <div className="text-center text-sm font-bold text-slate-500">ทายก่อนแข่ง: ใครจะไปได้ไกลกว่า?</div>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <button onClick={() => setGuess("left")} className={cn("rounded-xl border-2 px-4 py-2 text-sm font-extrabold transition", guess === "left" ? "border-sky-500 bg-sky-50 text-sky-700" : "border-slate-200 bg-white text-slate-600 hover:border-sky-300")}>🐢 เต่า</button>
              <button onClick={() => setGuess("tie")} className={cn("rounded-xl border-2 px-4 py-2 text-sm font-extrabold transition", guess === "tie" ? "border-slate-500 bg-slate-100 text-slate-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300")}>เสมอ</button>
              <button onClick={() => setGuess("right")} className={cn("rounded-xl border-2 px-4 py-2 text-sm font-extrabold transition", guess === "right" ? "border-pink-500 bg-pink-50 text-pink-700" : "border-slate-200 bg-white text-slate-600 hover:border-pink-300")}>🐇 กระต่าย</button>
            </div>
          </div>
        )}

        {/* ลู่วิ่ง */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
          <div className="relative w-full" style={{ aspectRatio: "320 / 120" }}>
            <svg viewBox="0 0 320 120" className="absolute inset-0 h-full w-full" aria-hidden>
              {/* ลู่ 2 เลน */}
              {[38, 82].map((y, lane) => (
                <g key={y}>
                  <rect x={LEFT - 6} y={y - 13} width={USABLE + 12} height={26} rx={8} fill={lane === 0 ? "#e0f2fe" : "#fce7f3"} />
                  <line x1={LEFT} y1={y} x2={RIGHT} y2={y} stroke={lane === 0 ? "#7dd3fc" : "#f9a8d4"} strokeWidth={1.5} strokeDasharray="5 5" />
                </g>
              ))}
              {/* เส้นสตาร์ทและเส้นชัย */}
              <line x1={LEFT} y1={12} x2={LEFT} y2={108} stroke="#94a3b8" strokeWidth={2} />
              <text x={LEFT} y={118} textAnchor="middle" fontSize={10} fontWeight={800} fill="#475569">0</text>
              <line x1={RIGHT} y1={12} x2={RIGHT} y2={108} stroke="#334155" strokeWidth={2.4} />
              <text x={RIGHT} y={118} textAnchor="middle" fontSize={10} fontWeight={800} fill="#1e293b">1</text>
            </svg>

            {/* นักวิ่ง overlay — เลื่อนนุ่ม ๆ */}
            <div className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-2xl transition-all duration-[1200ms] ease-out sm:text-3xl" style={{ left: `${leftPct}%`, top: `${(38 / 120) * 100}%` }} aria-hidden>🐢</div>
            <div className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-2xl transition-all duration-[1200ms] ease-out sm:text-3xl" style={{ left: `${rightPct}%`, top: `${(82 / 120) * 100}%` }} aria-hidden>🐇</div>
            <div className="pointer-events-none absolute -translate-y-1/2 text-lg" style={{ left: `${(RIGHT / 3.2) + 1}%`, top: `${(60 / 120) * 100}%` }} aria-hidden>🏁</div>
          </div>
        </div>

        {/* ปุ่มควบคุม */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {!raced ? (
            <button onClick={() => setRaced(true)} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-base font-extrabold text-white transition hover:bg-emerald-700 active:scale-[0.98]">
              <Play size={18} /> เริ่มแข่ง!
            </button>
          ) : (
            <button onClick={randomize} className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-emerald-700">
              <Flag size={15} /> แข่งคู่ใหม่
            </button>
          )}
          <button onClick={randomize} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-extrabold text-slate-500 transition hover:bg-slate-50">
            <Shuffle size={13} /> สุ่มคู่
          </button>
        </div>

        {/* ผลการแข่ง */}
        {raced && (
          <div className={cn("rounded-xl px-4 py-3 text-sm font-bold", guess === null ? "bg-emerald-50 text-emerald-700" : guessedRight ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600")}>
            <span className="flex flex-wrap items-center gap-1.5">
              {guess !== null && (guessedRight ? <Check size={17} className="shrink-0" /> : <X size={17} className="shrink-0" />)}
              {guess !== null && (guessedRight ? "ทายถูก! " : "ทายผิด — ")}
              <StackedFraction numerator={left.numerator} denominator={left.denominator} className="text-base" toneClassName="text-sky-600" />
              <span className="text-lg font-extrabold">{winner === "left" ? ">" : winner === "right" ? "<" : "="}</span>
              <StackedFraction numerator={right.numerator} denominator={right.denominator} className="text-base" toneClassName="text-pink-600" />
              <span>
                — {winner === "tie" ? "ทั้งคู่ไปได้ไกลเท่ากัน (ค่าเท่ากัน)" : `${winner === "left" ? "🐢 เต่า" : "🐇 กระต่าย"}อยู่ทางขวามากกว่า จึงมีค่ามากกว่า`}
              </span>
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
