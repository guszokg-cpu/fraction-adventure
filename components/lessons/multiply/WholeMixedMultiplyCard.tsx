"use client";

import { useState } from "react";
import { Shuffle } from "lucide-react";
import { FractionShape } from "@/components/fractions/FractionShape";
import { Card } from "@/components/ui/Card";
import { FractionStack, SectionHeader } from "@/components/lessons/multiply/MultiplyMath";
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

export function WholeMixedMultiplyCard() {
  const [mode, setMode] = useState<Mode>("whole");

  // โหมดจำนวนเต็ม: w × a/d
  const [w, setW] = useState(3);
  const [wa, setWa] = useState(2);
  const [wd, setWd] = useState(5);

  // โหมดจำนวนคละ: (W a/d) × b/q
  const [mW, setMW] = useState(1);
  const [ma, setMa] = useState(1);
  const [md, setMd] = useState(2);
  const [mb, setMb] = useState(2);
  const [mq, setMq] = useState(3);

  function randomize() {
    if (mode === "whole") {
      const d = randInt(3, 6);
      setW(randInt(2, 4));
      setWd(d);
      setWa(randInt(1, d - 1));
    } else {
      const d = randInt(2, 5);
      const q = randInt(2, 5);
      setMW(randInt(1, 3));
      setMd(d);
      setMa(randInt(1, d - 1));
      setMq(q);
      setMb(randInt(1, q - 1));
    }
  }

  // คำนวณโหมดจำนวนเต็ม
  const wRaw = w * wa;
  const wResult = simplifyFraction(wRaw, wd);
  const wMixed = toMixedNumber(wResult.numerator, wResult.denominator);

  // คำนวณโหมดจำนวนคละ
  const improper = mW * md + ma;
  const mRawNum = improper * mb;
  const mRawDen = md * mq;
  const mResult = simplifyFraction(mRawNum, mRawDen);
  const mMixed = toMixedNumber(mResult.numerator, mResult.denominator);

  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={4} title="จำนวนเต็ม & จำนวนคละ" />
      <div className="space-y-5 p-5 sm:p-6">
        {/* สลับโหมด */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setMode("whole")}
            className={cn(
              "flex h-12 items-center justify-center rounded-xl text-sm font-extrabold transition sm:text-base",
              mode === "whole" ? "bg-orange-500 text-white shadow-md" : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            )}
          >
            จำนวนเต็ม × เศษส่วน
          </button>
          <button
            onClick={() => setMode("mixed")}
            className={cn(
              "flex h-12 items-center justify-center rounded-xl text-sm font-extrabold transition sm:text-base",
              mode === "mixed" ? "bg-amber-500 text-white shadow-md" : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            )}
          >
            จำนวนคละ × เศษส่วน
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
            {/* โจทย์ */}
            <div className="flex items-center justify-center gap-3 rounded-2xl bg-orange-50 px-4 py-4 text-3xl font-extrabold sm:text-4xl">
              <span className="text-sky-600">{w}</span>
              <span className="text-slate-400">×</span>
              <FractionStack top={wa} bottom={wd} className="text-amber-600" />
            </div>

            {/* ภาพ w กลุ่ม */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {Array.from({ length: w }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <FractionShape numerator={wa} denominator={wd} shape="bar" tone="accent" className="h-8 w-20" />
                  <span className="text-xs font-bold text-slate-400">
                    กลุ่ม {i + 1}
                  </span>
                </div>
              ))}
            </div>

            {/* วิธีคิด */}
            <div className="rounded-2xl border-2 border-orange-200 bg-white p-4 text-center sm:p-5">
              <p className="text-sm font-bold text-slate-500">มองจำนวนเต็มเป็นตัวส่วนเท่ากับ 1</p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 text-2xl font-extrabold sm:text-3xl">
                <FractionStack top={w} bottom={1} className="text-sky-600" />
                <span className="text-slate-400">×</span>
                <FractionStack top={wa} bottom={wd} className="text-amber-600" />
                <span className="text-slate-400">=</span>
                <FractionStack top={wRaw} bottom={wd} className="text-orange-700" />
                {(wResult.numerator !== wRaw || wResult.denominator !== wd) && (
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
              </div>
            </div>
            <p className="text-center text-sm font-bold text-slate-600 sm:text-base">
              คูณจำนวนเต็มเข้ากับตัวเศษ ตัวส่วนคงเดิม — {w}×{wa}={wRaw} จาก {wd}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* โจทย์ */}
            <div className="flex items-center justify-center gap-3 rounded-2xl bg-amber-50 px-4 py-4 text-3xl font-extrabold sm:text-4xl">
              <Mixed whole={mW} num={ma} den={md} className="text-sky-600" />
              <span className="text-slate-400">×</span>
              <FractionStack top={mb} bottom={mq} className="text-amber-600" />
            </div>

            {/* ขั้นที่ 1: แปลงเป็นเศษเกิน */}
            <div className="rounded-2xl border-2 border-sky-200 bg-white p-4 text-center">
              <span className="rounded-full bg-sky-500 px-3 py-0.5 text-xs font-extrabold text-white">ขั้นที่ 1: แปลงจำนวนคละเป็นเศษเกิน</span>
              <div className="mt-3 flex items-center justify-center gap-2 text-xl font-extrabold sm:text-2xl">
                <Mixed whole={mW} num={ma} den={md} className="text-sky-600" />
                <span className="text-slate-400">=</span>
                <FractionStack top={improper} bottom={md} className="text-sky-600" />
                <span className="text-sm font-bold text-slate-400">
                  ({mW}×{md}+{ma})
                </span>
              </div>
            </div>

            {/* ขั้นที่ 2: คูณ */}
            <div className="rounded-2xl border-2 border-amber-200 bg-white p-4 text-center">
              <span className="rounded-full bg-amber-500 px-3 py-0.5 text-xs font-extrabold text-white">ขั้นที่ 2: คูณเศษส่วน</span>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xl font-extrabold sm:text-2xl">
                <FractionStack top={improper} bottom={md} className="text-sky-600" />
                <span className="text-slate-400">×</span>
                <FractionStack top={mb} bottom={mq} className="text-amber-600" />
                <span className="text-slate-400">=</span>
                <FractionStack top={mRawNum} bottom={mRawDen} className="text-orange-700" />
              </div>
            </div>

            {/* ขั้นที่ 3: ย่อ + จำนวนคละ */}
            <div className="rounded-2xl border-2 border-emerald-200 bg-white p-4 text-center">
              <span className="rounded-full bg-emerald-600 px-3 py-0.5 text-xs font-extrabold text-white">ขั้นที่ 3: ทำให้อย่างต่ำ / จำนวนคละ</span>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-2xl font-extrabold sm:text-3xl">
                <FractionStack top={mRawNum} bottom={mRawDen} className="text-orange-700" />
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
