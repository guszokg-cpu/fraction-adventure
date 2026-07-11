"use client";

import { useState } from "react";
import { RefreshCw, Shuffle, Trophy } from "lucide-react";
import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionText } from "@/components/fractions/FractionText";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { gcd } from "@/lib/fractionUtils";
import { randInt } from "@/lib/randomFraction";

type Fraction = { numerator: number; denominator: number };
type ChainStep = Fraction & { divisor?: number };

const DIVISORS = [2, 3, 4, 5, 6, 7, 8, 9];
const MAX_CHAIN = 5;

const POOL: Fraction[] = [
  { numerator: 12, denominator: 18 },
  { numerator: 16, denominator: 24 },
  { numerator: 18, denominator: 24 },
  { numerator: 20, denominator: 30 },
  { numerator: 24, denominator: 36 },
  { numerator: 15, denominator: 25 },
  { numerator: 14, denominator: 21 },
  { numerator: 27, denominator: 36 },
];

function StepBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-xl font-extrabold text-orange-600 transition hover:bg-orange-100 active:scale-95"
    >
      {children}
    </button>
  );
}

export function SimplifyLabCard() {
  const [chain, setChain] = useState<ChainStep[]>([POOL[0]]);

  const current = chain[chain.length - 1];
  const isLowest = gcd(current.numerator, current.denominator) === 1;

  function divisorAvail(d: number) {
    return current.numerator % d === 0 && current.denominator % d === 0;
  }

  function setStart(n: number, d: number) {
    const den = Math.max(2, Math.min(60, d));
    const num = Math.max(1, Math.min(den, n));
    setChain([{ numerator: num, denominator: den }]);
  }

  function applyDivide(d: number) {
    if (!divisorAvail(d) || chain.length >= MAX_CHAIN) return;
    setChain((prev) => {
      const cur = prev[prev.length - 1];
      return [...prev, { numerator: cur.numerator / d, denominator: cur.denominator / d, divisor: d }];
    });
  }

  function randomize() {
    let next = POOL[randInt(0, POOL.length - 1)];
    let tries = 0;
    while (next.numerator === chain[0].numerator && next.denominator === chain[0].denominator && tries++ < 10) {
      next = POOL[randInt(0, POOL.length - 1)];
    }
    setChain([next]);
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">2</span>
          <h2 className="text-xl font-extrabold">ห้องทดลองย่อเศษส่วน</h2>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        {/* ตั้งค่าเศษส่วนเริ่มต้น */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-500">เศษ</span>
            <StepBtn onClick={() => setStart(chain[0].numerator - 1, chain[0].denominator)}>−</StepBtn>
            <span className="w-9 text-center text-3xl font-extrabold text-orange-600">{chain[0].numerator}</span>
            <StepBtn onClick={() => setStart(chain[0].numerator + 1, chain[0].denominator)}>+</StepBtn>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-500">ส่วน</span>
            <StepBtn onClick={() => setStart(chain[0].numerator, chain[0].denominator - 1)}>−</StepBtn>
            <span className="w-9 text-center text-3xl font-extrabold text-orange-600">{chain[0].denominator}</span>
            <StepBtn onClick={() => setStart(chain[0].numerator, chain[0].denominator + 1)}>+</StepBtn>
          </div>
          <button
            onClick={randomize}
            className="flex h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50"
          >
            <Shuffle size={15} /> สุ่มโจทย์
          </button>
        </div>

        {/* ปุ่มตัวหาร */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {DIVISORS.map((d) => (
              <button
                key={d}
                onClick={() => applyDivide(d)}
                disabled={!divisorAvail(d) || chain.length >= MAX_CHAIN}
                className={cn(
                  "h-11 w-14 rounded-xl text-lg font-extrabold transition",
                  divisorAvail(d) && chain.length < MAX_CHAIN
                    ? "bg-orange-500 text-white shadow-md hover:bg-orange-600 active:scale-95"
                    : "cursor-not-allowed border border-slate-200 bg-white text-slate-300"
                )}
              >
                ÷{d}
              </button>
            ))}
          </div>
          <p className="text-center text-xs font-bold text-slate-400">ปุ่มจาง = หารไม่ลงตัว (ต้องหารทั้งเศษและส่วนพร้อมกัน)</p>
        </div>

        {/* สมการสายการหาร */}
        <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-orange-50/70 px-4 py-4">
          {chain.map((step, i) => (
            <span key={i} className="flex items-center gap-3">
              {i > 0 && (
                <>
                  <span className="text-lg font-extrabold text-orange-600 sm:text-xl">÷{step.divisor}</span>
                  <span className="text-2xl font-extrabold text-slate-400">=</span>
                </>
              )}
              <FractionText numerator={step.numerator} denominator={step.denominator} className="text-2xl text-orange-700 sm:text-3xl" />
            </span>
          ))}
        </div>

        {/* บาร์แต่ละทอด ยาวเท่ากันเสมอ */}
        <div className="space-y-3">
          {chain.map((step, i) => (
            <div key={i} className="grid grid-cols-[3.5rem_1fr_4.5rem] items-center gap-3">
              <span className="text-center text-sm font-extrabold text-slate-500">{i === 0 ? "เริ่ม" : `÷${step.divisor}`}</span>
              <FractionShape numerator={step.numerator} denominator={step.denominator} shape="bar" tone="pink" className="h-11 w-full sm:h-12" />
              <FractionText numerator={step.numerator} denominator={step.denominator} className="justify-self-center text-xl text-pink-600 sm:text-2xl" />
            </div>
          ))}
        </div>

        {isLowest ? (
          <div className="flex items-center justify-center gap-2 rounded-xl bg-yellow-100 px-4 py-3 text-base font-extrabold text-yellow-700 sm:text-lg">
            <Trophy size={22} className="shrink-0" /> เป็นเศษส่วนอย่างต่ำแล้ว!
          </div>
        ) : (
          <div className="rounded-xl bg-orange-50 px-4 py-3 text-center text-sm font-extrabold text-orange-700 sm:text-base">
            ยังย่อได้อีก — กดปุ่มหารต่อได้เลย!
          </div>
        )}

        {chain.length > 1 && (
          <div className="flex justify-center">
            <button
              onClick={() => setChain((prev) => [prev[0]])}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-500 transition hover:bg-slate-50 sm:text-sm"
            >
              <RefreshCw size={13} /> เริ่มใหม่
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}
