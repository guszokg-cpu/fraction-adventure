"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionText } from "@/components/fractions/FractionText";
import { Card } from "@/components/ui/Card";

type Pair = { numerator: number; denominator: number };

function buildEquivalents(base: Pair): Pair[] {
  return [2, 3, 4, 5].map((factor) => ({
    numerator: base.numerator * factor,
    denominator: base.denominator * factor
  }));
}

export function EquivalentGeneratorCard() {
  const [numerator, setNumerator] = useState(3);
  const [denominator, setDenominator] = useState(5);
  const [results, setResults] = useState<Pair[]>(() => buildEquivalents({ numerator: 3, denominator: 5 }));

  function generate() {
    const safeNumerator = Math.max(1, Math.min(20, Math.round(numerator) || 1));
    const safeDenominator = Math.max(1, Math.min(20, Math.round(denominator) || 1));
    setNumerator(safeNumerator);
    setDenominator(safeDenominator);
    setResults(buildEquivalents({ numerator: safeNumerator, denominator: safeDenominator }));
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">4</span>
          <h2 className="text-xl font-extrabold">เครื่องสร้างเศษส่วนเท่ากัน</h2>
        </div>
      </div>

      <div className="p-5">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="text-sm font-extrabold text-brand-700">ใส่เศษส่วนเริ่มต้น</span>
          <div className="flex items-center gap-2 rounded-xl border border-orange-200 bg-white px-3 py-2">
            <input
              type="number"
              min={1}
              max={20}
              value={numerator}
              onChange={(event) => setNumerator(Number(event.target.value))}
              className="h-9 w-14 rounded-lg border border-orange-100 bg-orange-50/50 text-center text-lg font-extrabold text-orange-600 outline-none focus:border-orange-400"
              aria-label="ตัวเศษ"
            />
            <span className="text-xl font-extrabold text-slate-400">/</span>
            <input
              type="number"
              min={1}
              max={20}
              value={denominator}
              onChange={(event) => setDenominator(Number(event.target.value))}
              className="h-9 w-14 rounded-lg border border-orange-100 bg-orange-50/50 text-center text-lg font-extrabold text-orange-600 outline-none focus:border-orange-400"
              aria-label="ตัวส่วน"
            />
          </div>
          <button
            onClick={generate}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-orange-500 px-5 text-sm font-extrabold text-white transition hover:bg-orange-600"
          >
            <Sparkles size={18} />
            สร้าง
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {results.map((item) => (
            <div key={`${item.numerator}-${item.denominator}`} className="rounded-xl border border-orange-100 bg-white p-4 text-center">
              <FractionText numerator={item.numerator} denominator={item.denominator} className="text-3xl" toneClassName="text-orange-600" />
              <FractionShape
                numerator={item.numerator}
                denominator={item.denominator}
                shape="bar"
                tone="emerald"
                className="mx-auto mt-3 h-8 w-full"
              />
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-1 rounded-xl bg-amber-50 px-4 py-3 text-center text-sm font-bold text-amber-700">
          ทุกคำตอบมีค่าเท่ากับ
          <FractionText numerator={numerator} denominator={denominator} className="text-base" toneClassName="text-amber-700" />
          เพราะคูณตัวเศษและตัวส่วนด้วยจำนวนเดียวกัน
        </div>
      </div>
    </Card>
  );
}
