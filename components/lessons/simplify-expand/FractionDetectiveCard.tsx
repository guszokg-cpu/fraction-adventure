"use client";

import { useState } from "react";
import { CheckCircle, Search, XCircle } from "lucide-react";
import { FractionText } from "@/components/fractions/FractionText";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { detectiveChoices } from "@/data/lessonSimplifyExpand";

const TARGET = { numerator: 4, denominator: 6 }; // 4/6 = 2/3
const CORRECT = { numerator: 2, denominator: 3 };

export function FractionDetectiveCard() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">6</span>
          <h2 className="text-xl font-extrabold">เกมนักสืบเศษส่วน</h2>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-center gap-3">
          <Search className="text-orange-500" size={22} />
          <span className="text-base font-extrabold text-brand-900">คู่แท้ของฉันคือใคร?</span>
          <FractionText numerator={TARGET.numerator} denominator={TARGET.denominator} className="text-3xl" toneClassName="text-orange-600" />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {detectiveChoices.map((choice) => {
            const key = `${choice.numerator}/${choice.denominator}`;
            const isCorrectChoice = choice.numerator === CORRECT.numerator && choice.denominator === CORRECT.denominator;
            const active = selected === key;
            const showCorrect = selected !== null && isCorrectChoice;

            return (
              <button
                key={key}
                onClick={() => setSelected(key)}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border py-4 transition",
                  !active && !showCorrect && "border-orange-200 bg-white hover:bg-orange-50",
                  active && !isCorrectChoice && "border-rose-300 bg-rose-50",
                  showCorrect && "border-emerald-300 bg-emerald-50"
                )}
              >
                <FractionText
                  numerator={choice.numerator}
                  denominator={choice.denominator}
                  className="text-2xl"
                  toneClassName={showCorrect ? "text-emerald-700" : active ? "text-rose-600" : "text-brand-900"}
                />
                {active && !isCorrectChoice && <XCircle className="text-rose-500" size={20} />}
                {showCorrect && <CheckCircle className="text-emerald-600" size={20} />}
              </button>
            );
          })}
        </div>

        {selected && (
          <p
            className={cn(
              "mt-4 rounded-xl px-4 py-3 text-center text-sm font-bold",
              selected === `${CORRECT.numerator}/${CORRECT.denominator}`
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            )}
          >
            {selected === `${CORRECT.numerator}/${CORRECT.denominator}`
              ? "ถูกต้อง! 4/6 ย่อด้วย 2 ได้ 2/3 จึงเป็นคู่แท้กัน"
              : "ยังไม่ใช่ ลองย่อ 4/6 ด้วย 2 จะได้ 2/3"}
          </p>
        )}
      </div>
    </Card>
  );
}
