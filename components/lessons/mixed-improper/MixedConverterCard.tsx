"use client";

import { useState } from "react";
import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionText } from "@/components/fractions/FractionText";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

type Mode = "toMixed" | "toImproper";

export function MixedConverterCard() {
  const [mode, setMode] = useState<Mode>("toMixed");

  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-r from-pink-600 to-fuchsia-600 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">4</span>
          <h2 className="text-xl font-extrabold">เครื่องแปลง ⇄</h2>
        </div>
      </div>
      <div className="p-5">
        {/* Tabs */}
        <div className="flex overflow-hidden rounded-xl border border-pink-100">
          <button
            onClick={() => setMode("toMixed")}
            className={cn(
              "flex-1 py-2 text-xs font-extrabold transition",
              mode === "toMixed"
                ? "bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white"
                : "bg-white text-slate-600 hover:bg-pink-50"
            )}
          >
            เศษเกิน → จำนวนคละ
          </button>
          <button
            onClick={() => setMode("toImproper")}
            className={cn(
              "flex-1 py-2 text-xs font-extrabold transition",
              mode === "toImproper"
                ? "bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white"
                : "bg-white text-slate-600 hover:bg-pink-50"
            )}
          >
            จำนวนคละ → เศษเกิน
          </button>
        </div>

        {mode === "toMixed" && (
          <div className="mt-4">
            {/* 8/3 = 2 2/3  (8 ÷ 3 = 2 remainder 2) */}
            <p className="text-center text-xs font-bold text-slate-500">8 ÷ 3 = 2 เศษ 2</p>
            <div className="mt-3 flex items-center justify-center gap-4 rounded-2xl bg-pink-50/60 py-4">
              <FractionText numerator={8} denominator={3} className="text-4xl" toneClassName="text-pink-600" />
              <span className="text-2xl font-extrabold text-slate-400">→</span>
              <div className="flex items-center gap-0.5">
                <span className="text-4xl font-extrabold text-fuchsia-600">2</span>
                <FractionText numerator={2} denominator={3} className="text-3xl" toneClassName="text-fuchsia-600" />
              </div>
            </div>
            <div className="mt-3 flex justify-center gap-1">
              <FractionShape numerator={3} denominator={3} shape="bar" tone="pink" className="h-6 w-20" />
              <FractionShape numerator={3} denominator={3} shape="bar" tone="pink" className="h-6 w-20" />
              <FractionShape numerator={2} denominator={3} shape="bar" tone="accent" className="h-6 w-20" />
            </div>
          </div>
        )}

        {mode === "toImproper" && (
          <div className="mt-4">
            {/* 3 1/5 = 16/5  (3×5 + 1 = 16) */}
            <p className="text-center text-xs font-bold text-slate-500">3 × 5 = 15 &nbsp;|&nbsp; 15 + 1 = 16</p>
            <div className="mt-3 flex items-center justify-center gap-4 rounded-2xl bg-pink-50/60 py-4">
              <div className="flex items-center gap-0.5">
                <span className="text-4xl font-extrabold text-pink-600">3</span>
                <FractionText numerator={1} denominator={5} className="text-3xl" toneClassName="text-pink-600" />
              </div>
              <span className="text-2xl font-extrabold text-slate-400">→</span>
              <FractionText numerator={16} denominator={5} className="text-4xl" toneClassName="text-fuchsia-600" />
            </div>
            <div className="mt-3 flex flex-col items-center gap-1">
              {[1, 2, 3].map((i) => (
                <FractionShape key={i} numerator={5} denominator={5} shape="bar" tone="violet" className="h-5 w-40" />
              ))}
              <FractionShape numerator={1} denominator={5} shape="bar" tone="accent" className="h-5 w-40" />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
