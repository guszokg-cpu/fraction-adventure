"use client";

import { useState } from "react";
import { Shuffle } from "lucide-react";
import { FractionShape } from "@/components/fractions/FractionShape";
import { Card } from "@/components/ui/Card";
import { FractionStack, SectionHeader } from "@/components/lessons/divide/DivideMath";
import { cn } from "@/lib/cn";
import { simplifyFraction, toMixedNumber } from "@/lib/fractionUtils";
import { randInt } from "@/lib/randomFraction";

type Mode = "whole" | "mixed";

function Mixed({ whole, num, den, className }: { whole: number; num: number; den: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {(whole > 0 || num === 0) && <span>{whole}</span>}
      {num > 0 && <FractionStack top={num} bottom={den} className="text-[0.75em]" />}
    </span>
  );
}

export function WholeMixedDivideCard() {
  const [mode, setMode] = useState<Mode>("whole");

  // โหมดจำนวนเต็ม ÷ เศษส่วน: w ÷ b/q
  const [w, setW] = useState(2);
  const [wb, setWb] = useState(1);
  const [wq, setWq] = useState(4);

  // โหมดจำนวนคละ ÷ เศษส่วน: (W a/d) ÷ b/q
  const [mW, setMW] = useState(1);
  const [ma, setMa] = useState(1);
  const [md, setMd] = useState(2);
  const [mb, setMb] = useState(1);
  const [mq, setMq] = useState(4);

  function randomize() {
    if (mode === "whole") {
      const q = randInt(2, 5);
      setW(randInt(2, 4));
      setWq(q);
      setWb(randInt(1, q - 1));
    } else {
      const d = randInt(2, 4);
      const q = randInt(2, 5);
      setMW(randInt(1, 3));
      setMd(d);
      setMa(randInt(1, d - 1));
      setMq(q);
      setMb(randInt(1, q - 1));
    }
  }

  // จำนวนเต็ม: w ÷ b/q = w × q/b
  const wRawNum = w * wq;
  const wResult = simplifyFraction(wRawNum, wb);
  const wMixed = toMixedNumber(wResult.numerator, wResult.denominator);

  // จำนวนคละ: (W a/d) ÷ b/q = improper/d × q/b
  const improper = mW * md + ma;
  const mRawNum = improper * mq;
  const mRawDen = md * mb;
  const mResult = simplifyFraction(mRawNum, mRawDen);
  const mMixed = toMixedNumber(mResult.numerator, mResult.denominator);

  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={3} title="จำนวนเต็ม & จำนวนคละ" />
      <div className="space-y-5 p-5 sm:p-6">
        {/* สลับโหมด */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setMode("whole")}
            className={cn(
              "flex h-12 items-center justify-center rounded-xl text-sm font-extrabold transition sm:text-base",
              mode === "whole" ? "bg-violet-600 text-white shadow-md" : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            )}
          >
            จำนวนเต็ม ÷ เศษส่วน
          </button>
          <button
            onClick={() => setMode("mixed")}
            className={cn(
              "flex h-12 items-center justify-center rounded-xl text-sm font-extrabold transition sm:text-base",
              mode === "mixed" ? "bg-purple-600 text-white shadow-md" : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            )}
          >
            จำนวนคละ ÷ เศษส่วน
          </button>
        </div>

        <div className="flex justify-center">
          <button
            onClick={randomize}
            className="flex h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50"
          >
            <Shuffle size={15} /> สุ่มโจทย์
          </button>
        </div>

        {mode === "whole" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 rounded-2xl bg-violet-50 px-4 py-4 text-3xl font-extrabold sm:text-4xl">
              <span className="text-pink-600">{w}</span>
              <span className="text-slate-400">÷</span>
              <FractionStack top={wb} bottom={wq} className="text-violet-600" />
            </div>

            {/* ภาพ: w วงเต็ม แบ่งเป็นชิ้นละ b/q */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {Array.from({ length: w }).map((_, i) => (
                <FractionShape key={i} numerator={wq} denominator={wq} shape="circle" tone="accent" className="h-16 w-16" />
              ))}
            </div>

            <div className="rounded-2xl border-2 border-violet-200 bg-white p-4 text-center sm:p-5">
              <p className="text-sm font-bold text-slate-500">จำนวนเต็มมองเป็นตัวส่วนเท่ากับ 1 → กลับตัวหลังแล้วคูณ</p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-2xl font-extrabold sm:text-3xl">
                <FractionStack top={w} bottom={1} className="text-pink-600" />
                <span className="text-slate-400">×</span>
                <FractionStack top={wq} bottom={wb} className="text-emerald-600" />
                <span className="text-slate-400">=</span>
                <FractionStack top={wRawNum} bottom={wb} className="text-purple-700" />
                {(wResult.numerator !== wRawNum || wResult.denominator !== wb) && (
                  <>
                    <span className="text-slate-400">=</span>
                    <FractionStack top={wResult.numerator} bottom={wResult.denominator} className="text-emerald-700" />
                  </>
                )}
                {wMixed.whole > 0 && wMixed.numerator > 0 && (
                  <>
                    <span className="text-slate-400">=</span>
                    <Mixed whole={wMixed.whole} num={wMixed.numerator} den={wMixed.denominator} className="text-emerald-700" />
                  </>
                )}
                {wResult.denominator === 1 && (
                  <>
                    <span className="text-slate-400">=</span>
                    <span className="text-emerald-700">{wResult.numerator}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 rounded-2xl bg-purple-50 px-4 py-4 text-3xl font-extrabold sm:text-4xl">
              <Mixed whole={mW} num={ma} den={md} className="text-pink-600" />
              <span className="text-slate-400">÷</span>
              <FractionStack top={mb} bottom={mq} className="text-violet-600" />
            </div>

            <div className="rounded-2xl border-2 border-pink-200 bg-white p-4 text-center">
              <span className="rounded-full bg-pink-500 px-3 py-0.5 text-xs font-extrabold text-white">ขั้นที่ 1: แปลงจำนวนคละเป็นเศษเกิน</span>
              <div className="mt-3 flex items-center justify-center gap-2 text-xl font-extrabold sm:text-2xl">
                <Mixed whole={mW} num={ma} den={md} className="text-pink-600" />
                <span className="text-slate-400">=</span>
                <FractionStack top={improper} bottom={md} className="text-pink-600" />
                <span className="text-sm font-bold text-slate-400">({mW}×{md}+{ma})</span>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-violet-200 bg-white p-4 text-center">
              <span className="rounded-full bg-violet-500 px-3 py-0.5 text-xs font-extrabold text-white">ขั้นที่ 2: กลับตัวหลังแล้วคูณ</span>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xl font-extrabold sm:text-2xl">
                <FractionStack top={improper} bottom={md} className="text-pink-600" />
                <span className="text-slate-400">×</span>
                <FractionStack top={mq} bottom={mb} className="text-emerald-600" />
                <span className="text-slate-400">=</span>
                <FractionStack top={mRawNum} bottom={mRawDen} className="text-purple-700" />
              </div>
            </div>

            <div className="rounded-2xl border-2 border-emerald-200 bg-white p-4 text-center">
              <span className="rounded-full bg-emerald-600 px-3 py-0.5 text-xs font-extrabold text-white">ขั้นที่ 3: ทำให้อย่างต่ำ / จำนวนคละ</span>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-2xl font-extrabold sm:text-3xl">
                <FractionStack top={mRawNum} bottom={mRawDen} className="text-purple-700" />
                <span className="text-slate-400">=</span>
                <FractionStack top={mResult.numerator} bottom={mResult.denominator} className="text-emerald-700" />
                {mMixed.whole > 0 && mMixed.numerator > 0 && (
                  <>
                    <span className="text-slate-400">=</span>
                    <Mixed whole={mMixed.whole} num={mMixed.numerator} den={mMixed.denominator} className="text-emerald-700" />
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
