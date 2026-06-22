"use client";

import { useState } from "react";
import { Trophy } from "lucide-react";
import { FractionText } from "@/components/fractions/FractionText";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { lowestTermOptions } from "@/data/lessonSimplifyExpand";

const NUMERATOR = 12;
const DENOMINATOR = 18;
const GCD = 6; // ตัวหารร่วมมากของ 12 และ 18

export function LowestTermCard() {
  const [selected, setSelected] = useState<number | null>(null);

  const dividesEvenly = selected !== null && NUMERATOR % selected === 0 && DENOMINATOR % selected === 0;
  const reduced = dividesEvenly
    ? { numerator: NUMERATOR / (selected as number), denominator: DENOMINATOR / (selected as number) }
    : null;
  const isLowest = selected === GCD;

  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">5</span>
          <h2 className="text-xl font-extrabold">หาเศษส่วนอย่างต่ำ</h2>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-center gap-3">
          <span className="text-sm font-extrabold text-brand-700">ตัวอย่าง</span>
          <FractionText numerator={NUMERATOR} denominator={DENOMINATOR} className="text-3xl" toneClassName="text-orange-600" />
        </div>

        <p className="mt-3 text-center text-sm font-extrabold text-brand-700">หารได้ด้วยอะไร?</p>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {lowestTermOptions.map((value) => (
            <button
              key={value}
              onClick={() => setSelected(value)}
              className={cn(
                "h-11 w-14 rounded-xl border text-base font-extrabold transition",
                value === selected && value === GCD && "border-emerald-400 bg-emerald-500 text-white",
                value === selected && value !== GCD && "border-amber-400 bg-amber-50 text-amber-700",
                value !== selected && "border-orange-200 bg-white text-orange-600 hover:bg-orange-50"
              )}
            >
              {value}
            </button>
          ))}
        </div>

        {selected !== null && (
          <div className="mt-4">
            {dividesEvenly && reduced ? (
              <div className="rounded-xl bg-orange-50/70 p-4">
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-lg font-extrabold text-brand-900">
                  <span>{NUMERATOR} ÷ {selected} = {reduced.numerator}</span>
                  <span>{DENOMINATOR} ÷ {selected} = {reduced.denominator}</span>
                </div>
                <div className="mt-3 flex items-center justify-center gap-3">
                  <span className="font-extrabold text-brand-700">ดังนั้น</span>
                  <FractionText numerator={NUMERATOR} denominator={DENOMINATOR} className="text-2xl" toneClassName="text-orange-600" />
                  <span className="text-2xl font-extrabold">=</span>
                  <FractionText numerator={reduced.numerator} denominator={reduced.denominator} className="text-2xl" toneClassName="text-emerald-600" />
                  {isLowest && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-700">
                      <Trophy size={14} />
                      เศษส่วนอย่างต่ำ
                    </span>
                  )}
                </div>
                {!isLowest && (
                  <p className="mt-3 text-center text-sm font-bold text-amber-700">
                    ยังย่อได้อีก! ลองหารด้วยจำนวนที่มากกว่านี้ (ตัวหารร่วมมากคือ 6)
                  </p>
                )}
              </div>
            ) : (
              <p className="rounded-xl bg-rose-50 px-4 py-3 text-center text-sm font-bold text-rose-600">
                {NUMERATOR} หรือ {DENOMINATOR} หารด้วย {selected} ไม่ลงตัว ลองเลือกตัวหารอื่น
              </p>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
