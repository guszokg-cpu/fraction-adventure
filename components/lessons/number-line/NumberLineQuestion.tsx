"use client";

import { useState } from "react";
import { CheckCircle, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { NumberLineStrip } from "@/components/lessons/number-line/NumberLineStrip";

const denominator = 5;
const markerValue = 2;
const choices = ["1/5", "2/5", "3/5", "4/5"];
const correctAnswer = `${markerValue}/${denominator}`;

export function NumberLineQuestion() {
  const [selected, setSelected] = useState<string | null>(null);
  const isCorrect = selected === correctAnswer;

  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">1</span>
          <h2 className="text-xl font-extrabold">จุดสีนี้คือเศษส่วนอะไร?</h2>
        </div>
      </div>

      <div className="grid gap-6 p-5 lg:grid-cols-[1fr_220px]">
        <div className="flex flex-col items-center justify-center rounded-2xl bg-teal-50/70 p-5">
          <NumberLineStrip
            denominator={denominator}
            marker={markerValue}
            tone="emerald"
            showMarkerLabel={false}
            className="h-32 w-full max-w-md"
          />
          <div className="mt-3 rounded-xl bg-white px-4 py-2 text-center text-sm font-bold text-slate-600 shadow-sm">
            ช่วง 0 ถึง 1 แบ่งเป็น 5 ช่องเท่า ๆ กัน จุดอยู่ที่ช่องที่ 2
          </div>
        </div>

        <div className="flex flex-col justify-center gap-3">
          {choices.map((choice) => {
            const active = selected === choice;
            const shouldShowCorrect = selected && choice === correctAnswer;

            return (
              <button
                key={choice}
                onClick={() => setSelected(choice)}
                className={cn(
                  "flex h-14 items-center justify-between rounded-xl border px-5 text-2xl font-extrabold transition",
                  !active && !shouldShowCorrect && "border-brand-100 bg-white text-brand-900 hover:bg-brand-50",
                  active && !isCorrect && "border-rose-300 bg-rose-50 text-rose-600",
                  shouldShowCorrect && "border-emerald-300 bg-emerald-50 text-emerald-700"
                )}
              >
                <span>{choice}</span>
                {active && !isCorrect && <XCircle size={24} />}
                {shouldShowCorrect && <CheckCircle size={24} />}
              </button>
            );
          })}

          {selected && (
            <div
              className={cn(
                "rounded-xl px-4 py-3 text-sm font-bold",
                isCorrect ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
              )}
            >
              {isCorrect
                ? "ถูกต้อง! นับจาก 0 ไป 2 ช่อง จากทั้งหมด 5 ช่อง จึงเป็น 2/5"
                : "ลองนับช่องจาก 0 ถึงจุดอีกครั้ง คำตอบที่ถูกคือ 2/5"}
            </div>
          )}

          <Button variant="secondary" onClick={() => setSelected(null)} className="mt-1">
            <RotateCcw size={18} />
            เริ่มใหม่
          </Button>
        </div>
      </div>
    </Card>
  );
}
