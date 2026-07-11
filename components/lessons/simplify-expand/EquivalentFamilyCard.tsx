"use client";

import { useState } from "react";
import { Crown, Sparkles, Shuffle } from "lucide-react";
import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionText } from "@/components/fractions/FractionText";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { simplifyFraction } from "@/lib/fractionUtils";
import { randInt } from "@/lib/randomFraction";

type Fraction = { numerator: number; denominator: number };

const BASES: Fraction[] = [
  { numerator: 2, denominator: 4 },
  { numerator: 1, denominator: 3 },
  { numerator: 2, denominator: 3 },
  { numerator: 2, denominator: 6 },
  { numerator: 3, denominator: 4 },
  { numerator: 3, denominator: 9 },
  { numerator: 2, denominator: 5 },
  { numerator: 4, denominator: 6 },
];

const MAX_CHAIN = 5;

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

export function EquivalentFamilyCard() {
  const [raw, setRaw] = useState<Fraction>(BASES[0]);
  const [chainLen, setChainLen] = useState(3);

  const head = simplifyFraction(raw.numerator, raw.denominator);
  const wasReducible = head.numerator !== raw.numerator || head.denominator !== raw.denominator;
  const family: Fraction[] = Array.from({ length: chainLen }, (_, i) => ({
    numerator: head.numerator * (i + 1),
    denominator: head.denominator * (i + 1),
  }));

  function setNum(n: number) {
    setRaw((f) => ({ ...f, numerator: Math.max(1, Math.min(f.denominator, n)) }));
    setChainLen(3);
  }
  function setDen(d: number) {
    const nd = Math.max(2, Math.min(16, d));
    setRaw((f) => ({ numerator: Math.min(f.numerator, nd), denominator: nd }));
    setChainLen(3);
  }
  function randomize() {
    let next = raw;
    let tries = 0;
    while (next.numerator === raw.numerator && next.denominator === raw.denominator && tries++ < 10) {
      next = BASES[randInt(0, BASES.length - 1)];
    }
    setRaw(next);
    setChainLen(3);
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">1</span>
          <h2 className="text-xl font-extrabold">ครอบครัวเศษส่วนเท่ากัน 👑</h2>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        {/* ตั้งค่าเศษส่วนเริ่มต้น */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-500">เศษ</span>
            <StepBtn onClick={() => setNum(raw.numerator - 1)}>−</StepBtn>
            <span className="w-9 text-center text-3xl font-extrabold text-orange-600">{raw.numerator}</span>
            <StepBtn onClick={() => setNum(raw.numerator + 1)}>+</StepBtn>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-500">ส่วน</span>
            <StepBtn onClick={() => setDen(raw.denominator - 1)}>−</StepBtn>
            <span className="w-9 text-center text-3xl font-extrabold text-orange-600">{raw.denominator}</span>
            <StepBtn onClick={() => setDen(raw.denominator + 1)}>+</StepBtn>
          </div>
          <button
            onClick={randomize}
            className="flex h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50"
          >
            <Shuffle size={15} /> สุ่มครอบครัวใหม่
          </button>
        </div>

        {wasReducible && (
          <p className="text-center text-sm font-bold text-amber-700">
            คุณใส่ <FractionText numerator={raw.numerator} denominator={raw.denominator} className="mx-1 inline-flex text-base" toneClassName="text-amber-700" />
            — เศษส่วนนี้ย่อได้เป็น{" "}
            <FractionText numerator={head.numerator} denominator={head.denominator} className="mx-1 inline-flex text-base" toneClassName="text-emerald-700" />
            ก่อน แล้วค่อยสร้างครอบครัวจากตัวนั้น
          </p>
        )}

        {/* แถวครอบครัว */}
        <div className="space-y-3">
          {family.map((f, i) => (
            <div key={i} className="grid grid-cols-[1fr_5.5rem] items-center gap-3">
              <FractionShape numerator={f.numerator} denominator={f.denominator} shape="bar" tone="pink" className="h-12 w-full sm:h-14" />
              <div className="flex flex-col items-center gap-1">
                <FractionText numerator={f.numerator} denominator={f.denominator} className="text-2xl text-pink-600 sm:text-3xl" />
                {i === 0 && (
                  <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-700 sm:text-xs">
                    <Crown size={11} /> หัวหน้า
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <button
            onClick={() => setChainLen((n) => Math.min(MAX_CHAIN, n + 1))}
            disabled={chainLen >= MAX_CHAIN}
            className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-orange-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 sm:text-base"
          >
            <Sparkles size={16} /> ขยายครอบครัวอีก
          </button>
        </div>

        <p className="text-center text-sm font-bold text-slate-600 sm:text-base">
          ทุกคนในครอบครัวมี<span className="text-orange-600">ค่าเท่ากัน</span> แต่{" "}
          <span className="inline-flex items-center gap-1 font-extrabold text-amber-700">
            <Crown size={14} /> หัวหน้าครอบครัว
          </span>{" "}
          คือตัวที่เล็กที่สุด หารต่อไม่ได้อีกแล้ว — เรียกว่า <span className="text-emerald-700">เศษส่วนอย่างต่ำ</span>
        </p>
      </div>
    </Card>
  );
}
