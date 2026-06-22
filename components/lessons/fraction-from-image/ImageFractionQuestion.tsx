"use client";

import { useState } from "react";
import { CheckCircle, RotateCcw, XCircle } from "lucide-react";
import { FractionShape } from "@/components/fractions/FractionShape";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

const choices = ["1/4", "2/4", "3/4", "4/4"];
const correctAnswer = "3/4";

export function ImageFractionQuestion() {
  const [selected, setSelected] = useState<string | null>(null);
  const isCorrect = selected === correctAnswer;

  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-r from-sky-600 to-blue-600 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">1</span>
          <h2 className="text-xl font-extrabold">ภาพนี้คือเศษส่วนอะไร?</h2>
        </div>
      </div>

      <div className="grid gap-6 p-5 lg:grid-cols-[1fr_220px]">
        <div className="flex flex-col items-center justify-center rounded-2xl bg-sky-50/70 p-5">
          <FractionShape numerator={3} denominator={4} tone="pink" className="h-52 w-52" />
          <div className="mt-4 rounded-xl bg-white px-4 py-2 text-center text-sm font-bold text-slate-600 shadow-sm">
            วงกลม 1 รูป แบ่งเป็น 4 ส่วนเท่า ๆ กัน และระบายสี 3 ส่วน
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
                ? "ถูกต้อง! ระบายสี 3 ส่วน จากทั้งหมด 4 ส่วน จึงเป็น 3/4"
                : "ลองดูจำนวนส่วนที่ระบายสีอีกครั้ง คำตอบที่ถูกคือ 3/4"}
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
