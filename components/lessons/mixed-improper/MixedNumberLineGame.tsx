"use client";

import { useState } from "react";
import { Check, Shuffle, X } from "lucide-react";
import { FractionText } from "@/components/fractions/FractionText";
import { Card } from "@/components/ui/Card";
import { SvgFrac } from "@/components/lessons/Frac";
import { cn } from "@/lib/cn";
import { randInt, shuffle } from "@/lib/randomFraction";

type Round = {
  den: number;
  whole: number;
  num: number;
  options: { whole: number; num: number }[];
};

function makeRound(): Round {
  const den = randInt(2, 4);
  const whole = randInt(0, 2);
  const num = randInt(1, den - 1);

  const seen = new Set([`${whole},${num}`]);
  const wrongs: { whole: number; num: number }[] = [];
  // ตัวลวงหลัก: เปลี่ยนตัวเศษ/จำนวนเต็มทีละนิด — สำรอง: จำนวนเต็มอื่น (จำเป็นเมื่อส่วน = 2 ซึ่งเศษมีค่าเดียว)
  const candidates = shuffle([
    { whole: whole + 1, num },
    { whole: Math.max(0, whole - 1), num },
    { whole, num: num + 1 <= den - 1 ? num + 1 : num - 1 },
    { whole: whole + 1, num: num + 1 <= den - 1 ? num + 1 : num - 1 },
  ]).concat(shuffle([0, 1, 2, 3]).map((w) => ({ whole: w, num })));
  for (const c of candidates) {
    if (c.num < 1 || c.num > den - 1 || c.whole < 0 || c.whole > 3) continue;
    const key = `${c.whole},${c.num}`;
    if (seen.has(key)) continue;
    seen.add(key);
    wrongs.push(c);
    if (wrongs.length === 3) break;
  }
  return { den, whole, num, options: shuffle([{ whole, num }, ...wrongs]) };
}

const L = 50;
const R = 630;
const Y = 78;
const SCALE = (R - L) / 3;
const px = (v: number) => L + v * SCALE;

function LineDiagram({ round, revealed }: { round: Round; revealed: boolean }) {
  const value = round.whole + round.num / round.den;
  const improperNum = round.whole * round.den + round.num;
  const x = px(value);
  return (
    <svg viewBox="0 0 680 165" className="w-full" role="img" aria-label="เส้นจำนวน 0 ถึง 3">
      <line x1={L - 10} y1={Y} x2={R + 14} y2={Y} stroke="#312e81" strokeWidth={4} />
      <polygon points={`${R + 26},${Y} ${R + 12},${Y - 8} ${R + 12},${Y + 8}`} fill="#312e81" />

      {/* ขีดย่อยตามตัวส่วน */}
      {Array.from({ length: 3 * round.den + 1 }, (_, i) => i / round.den).map((v) => (
        <line key={v} x1={px(v)} y1={Y - 7} x2={px(v)} y2={Y + 7} stroke="#94a3b8" strokeWidth={2} />
      ))}

      {/* ขีดจำนวนเต็ม */}
      {[0, 1, 2, 3].map((n) => (
        <g key={n}>
          <line x1={px(n)} y1={Y - 14} x2={px(n)} y2={Y + 14} stroke="#312e81" strokeWidth={4} />
          <text x={px(n)} y={Y + 44} textAnchor="middle" fontSize={26} fontWeight={800} fill="#312e81">
            {n}
          </text>
        </g>
      ))}

      {/* จุดปริศนา */}
      <circle cx={x} cy={Y} r={11} fill="#ec4899" stroke="#ffffff" strokeWidth={3} />
      {!revealed && (
        <text x={x} y={Y - 26} textAnchor="middle" fontSize={30} fontWeight={800} fill="#ec4899">
          ?
        </text>
      )}

      {revealed && (
        <g>
          {/* ป้ายจำนวนคละ (บน) */}
          <rect x={x - 42} y={Y - 58} width={84} height={30} rx={15} fill="#c026d3" />
          {round.whole > 0
            ? <>
                <text x={x - 20} y={Y - 36} textAnchor="middle" fontSize={18} fontWeight={800} fill="#ffffff">{round.whole}</text>
                <SvgFrac x={x + 16} y={Y - 43} n={round.num} d={round.den} size={15} fill="#ffffff" />
              </>
            : <SvgFrac x={x} y={Y - 43} n={round.num} d={round.den} size={17} fill="#ffffff" />}
          {/* ป้ายเศษเกิน (ล่าง) */}
          <rect x={x - 32} y={Y + 54} width={64} height={30} rx={15} fill="#ec4899" />
          <SvgFrac x={x} y={Y + 69} n={improperNum} d={round.den} size={17} fill="#ffffff" />
        </g>
      )}
    </svg>
  );
}

export function MixedNumberLineGame() {
  const [round, setRound] = useState<Round>(() => makeRound());
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const answered = picked !== null;

  function isCorrect(i: number) {
    const o = round.options[i];
    return o.whole === round.whole && o.num === round.num;
  }

  const pickedCorrect = answered && isCorrect(picked);

  function choose(i: number) {
    if (answered) return;
    setPicked(i);
    setScore((s) => ({ correct: s.correct + (isCorrect(i) ? 1 : 0), total: s.total + 1 }));
  }

  function next() {
    setRound(makeRound());
    setPicked(null);
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between bg-gradient-to-r from-pink-600 to-fuchsia-600 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">3</span>
          <h2 className="text-xl font-extrabold">จุดปริศนาบนเส้นจำนวน</h2>
        </div>
        <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold">
          ถูก {score.correct}/{score.total}
        </span>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <p className="text-center text-base font-extrabold text-slate-600 sm:text-lg">จุดสีชมพูคือจำนวนใด?</p>

        <div className="rounded-2xl bg-pink-50/60 p-3">
          <LineDiagram round={round} revealed={answered} />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {round.options.map((o, i) => {
            const correct = isCorrect(i);
            const isPicked = picked === i;
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                disabled={answered}
                className={cn(
                  "flex min-h-16 items-center justify-center gap-1 rounded-2xl border-2 bg-white p-3 transition",
                  !answered && "border-slate-200 hover:border-pink-300 hover:bg-pink-50",
                  answered && correct && "border-emerald-400 bg-emerald-50",
                  answered && !correct && isPicked && "border-rose-400 bg-rose-50",
                  answered && !correct && !isPicked && "border-slate-100 opacity-60"
                )}
              >
                {o.whole > 0 && <span className="text-2xl font-extrabold text-slate-700 sm:text-3xl">{o.whole}</span>}
                <FractionText numerator={o.num} denominator={round.den} className="text-xl sm:text-2xl" toneClassName="text-slate-700" />
              </button>
            );
          })}
        </div>

        {answered && (
          <div className="space-y-3">
            <div
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-base font-extrabold sm:text-lg",
                pickedCorrect ? "bg-emerald-100 text-emerald-700" : "bg-rose-50 text-rose-600"
              )}
            >
              {pickedCorrect ? <Check size={20} className="shrink-0" /> : <X size={20} className="shrink-0" />}
              {pickedCorrect ? "ถูกต้อง!" : "ยังไม่ถูก"} — จุดนี้อยู่เลย {round.whole} มาอีก {round.num} ช่องจาก {round.den} ช่อง
            </div>
            <p className="text-center text-sm font-bold text-slate-500 sm:text-base">
              สังเกต: จุดเดียวกันเขียนได้ 2 แบบ — จำนวนคละ (ป้ายม่วง) และเศษเกิน (ป้ายชมพู)
            </p>
            <div className="flex justify-center">
              <button
                onClick={next}
                className="flex items-center gap-1.5 rounded-xl bg-pink-600 px-6 py-2.5 text-sm font-extrabold text-white shadow transition hover:bg-pink-700 active:scale-[0.98] sm:text-base"
              >
                <Shuffle size={16} /> จุดต่อไป
              </button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
