"use client";

import { useState } from "react";
import { Shuffle } from "lucide-react";
import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionText } from "@/components/fractions/FractionText";
import { Card } from "@/components/ui/Card";
import { FractionInput } from "@/components/ui/FractionInput";
import { cn } from "@/lib/cn";
import { randomImproper, randomMixed } from "@/lib/randomFraction";

type Mode = "toMixed" | "toImproper";

const wholeInputCls = cn(
  "h-14 w-16 rounded-xl border-2 border-fuchsia-300 bg-white text-center text-3xl font-extrabold text-fuchsia-700 transition",
  "focus:border-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-100",
  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
);

export function MixedConverterCard() {
  const [mode, setMode] = useState<Mode>("toMixed");

  // Tab 1: เศษเกิน → คละ
  const [impNum, setImpNum] = useState(8);
  const [impDen, setImpDen] = useState(3);

  // Tab 2: คละ → เศษเกิน
  const [mixWhole, setMixWhole] = useState(3);
  const [mixNum, setMixNum]   = useState(1);
  const [mixDen, setMixDen]   = useState(5);

  // Derived — Tab 1
  const t1Whole  = Math.floor(impNum / impDen);
  const t1Rem    = impNum % impDen;
  const t1Valid  = impNum > impDen;

  // Derived — Tab 2
  const t2Product = mixWhole * mixDen;
  const t2Result  = t2Product + mixNum;
  const t2Valid   = mixNum > 0 && mixNum < mixDen;

  function randomizeT1() {
    const { num, den } = randomImproper();
    setImpNum(num); setImpDen(den);
  }

  function randomizeT2() {
    const { whole, num, den } = randomMixed();
    setMixWhole(whole); setMixNum(num); setMixDen(den);
  }

  return (
    <Card className="overflow-hidden p-0">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-fuchsia-600 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">4</span>
          <h2 className="text-xl font-extrabold">เครื่องแปลง ⇄</h2>
        </div>
      </div>

      <div className="p-5">
        {/* Tabs */}
        <div className="flex overflow-hidden rounded-xl border border-pink-100">
          {(["toMixed", "toImproper"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "flex-1 py-2 text-xs font-extrabold transition",
                mode === m
                  ? "bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white"
                  : "bg-white text-slate-600 hover:bg-pink-50",
              )}
            >
              {m === "toMixed" ? "เศษเกิน → จำนวนคละ" : "จำนวนคละ → เศษเกิน"}
            </button>
          ))}
        </div>

        {/* ── Tab 1: เศษเกิน → คละ ── */}
        {mode === "toMixed" && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-600">ใส่เศษเกิน:</p>
              <button
                onClick={randomizeT1}
                className="flex items-center gap-1 rounded-lg bg-pink-100 px-3 py-1.5 text-xs font-extrabold text-pink-700 transition hover:bg-pink-200"
              >
                <Shuffle size={13} />
                สุ่มโจทย์
              </button>
            </div>

            {/* Input */}
            <div className="flex justify-center">
              <FractionInput
                numerator={impNum}
                denominator={impDen}
                size="lg"
                colorClass="border-pink-300 focus:border-pink-500 focus:ring-pink-100 bg-pink-600"
                onChange={(n, d) => { setImpNum(n); setImpDen(d); }}
              />
            </div>

            {t1Valid ? (
              <>
                {/* Steps */}
                <p className="text-center text-sm font-bold text-slate-500">
                  {impNum} ÷ {impDen} ={" "}
                  <span className="font-extrabold text-pink-600">{t1Whole}</span>
                  {" "}เศษ{" "}
                  <span className="font-extrabold text-fuchsia-600">{t1Rem}</span>
                </p>

                {/* Result display */}
                <div className="flex items-center justify-center gap-4 rounded-2xl bg-pink-50/60 py-4">
                  <FractionText numerator={impNum} denominator={impDen} className="text-4xl" toneClassName="text-pink-600" />
                  <span className="text-2xl font-extrabold text-slate-400">→</span>
                  <div className="flex items-center gap-1">
                    <span className="text-4xl font-extrabold text-fuchsia-600">{t1Whole}</span>
                    {t1Rem > 0 && (
                      <FractionText numerator={t1Rem} denominator={impDen} className="text-3xl" toneClassName="text-fuchsia-600" />
                    )}
                  </div>
                </div>

                {/* Visualisation bars */}
                <div className="flex flex-wrap justify-center gap-1">
                  {Array.from({ length: t1Whole }).map((_, i) => (
                    <FractionShape key={i} numerator={impDen} denominator={impDen} shape="bar" tone="pink" className="h-6 w-16" />
                  ))}
                  {t1Rem > 0 && (
                    <FractionShape numerator={t1Rem} denominator={impDen} shape="bar" tone="accent" className="h-6 w-16" />
                  )}
                </div>
              </>
            ) : (
              <p className="text-center text-xs text-slate-400">* ตัวเศษต้องมากกว่าตัวส่วน (เศษเกินจริงๆ)</p>
            )}
          </div>
        )}

        {/* ── Tab 2: คละ → เศษเกิน ── */}
        {mode === "toImproper" && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-600">ใส่จำนวนคละ:</p>
              <button
                onClick={randomizeT2}
                className="flex items-center gap-1 rounded-lg bg-fuchsia-100 px-3 py-1.5 text-xs font-extrabold text-fuchsia-700 transition hover:bg-fuchsia-200"
              >
                <Shuffle size={13} />
                สุ่มโจทย์
              </button>
            </div>

            {/* Input: whole number + fraction */}
            <div className="flex items-center justify-center gap-3">
              <input
                type="number"
                value={mixWhole}
                min={1}
                max={9}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v) && v >= 1 && v <= 9) setMixWhole(v);
                }}
                className={wholeInputCls}
              />
              <FractionInput
                numerator={mixNum}
                denominator={mixDen}
                size="lg"
                colorClass="border-fuchsia-300 focus:border-fuchsia-500 focus:ring-fuchsia-100 bg-fuchsia-600"
                onChange={(n, d) => { setMixNum(n); setMixDen(d); }}
              />
            </div>

            {t2Valid ? (
              <>
                {/* Steps */}
                <p className="text-center text-sm font-bold text-slate-500">
                  {mixWhole} × {mixDen} ={" "}
                  <span className="font-extrabold text-fuchsia-600">{t2Product}</span>
                  {"  |  "}
                  {t2Product} + {mixNum} ={" "}
                  <span className="font-extrabold text-pink-600">{t2Result}</span>
                </p>

                {/* Result display */}
                <div className="flex items-center justify-center gap-4 rounded-2xl bg-fuchsia-50/60 py-4">
                  <div className="flex items-center gap-1">
                    <span className="text-4xl font-extrabold text-fuchsia-600">{mixWhole}</span>
                    <FractionText numerator={mixNum} denominator={mixDen} className="text-3xl" toneClassName="text-fuchsia-600" />
                  </div>
                  <span className="text-2xl font-extrabold text-slate-400">→</span>
                  <FractionText numerator={t2Result} denominator={mixDen} className="text-4xl" toneClassName="text-pink-600" />
                </div>

                {/* Visualisation bars */}
                <div className="flex flex-col items-center gap-1">
                  {Array.from({ length: mixWhole }).map((_, i) => (
                    <FractionShape key={i} numerator={mixDen} denominator={mixDen} shape="bar" tone="violet" className="h-5 w-40" />
                  ))}
                  <FractionShape numerator={mixNum} denominator={mixDen} shape="bar" tone="accent" className="h-5 w-40" />
                </div>
              </>
            ) : (
              <p className="text-center text-xs text-slate-400">* ตัวเศษต้องน้อยกว่าตัวส่วน (เศษส่วนแท้)</p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
