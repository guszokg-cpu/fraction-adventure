"use client";

import { Volume2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FractionText } from "@/components/fractions/FractionText";
import { cn } from "@/lib/cn";
import { readThaiFraction } from "@/lib/thaiNumber";

const DENOMINATORS = [2, 3, 4, 5, 6, 8];

function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "th-TH";
  utterance.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

type Props = {
  numerator: number;
  denominator: number;
  onDenominatorChange: (value: number) => void;
  onNumeratorChange: (value: number) => void;
};

export function FractionRepresentationControl({
  numerator,
  denominator,
  onDenominatorChange,
  onNumeratorChange,
}: Props) {
  const reading = readThaiFraction(numerator, denominator);

  return (
    <Card className="rounded-2xl">
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr_auto]">
        <div>
          <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
            เลือกตัวส่วน <span className="text-brand-500">(ทั้งหมด)</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {DENOMINATORS.map((v) => (
              <button
                key={v}
                onClick={() => onDenominatorChange(v)}
                className={cn(
                  "h-11 w-11 rounded-xl border text-base font-extrabold transition",
                  v === denominator
                    ? "border-brand-600 bg-brand-600 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:bg-brand-50"
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
            เลือกตัวเศษ <span className="text-rose-500">(ส่วนที่ระบาย)</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {Array.from({ length: denominator + 1 }, (_, i) => i).map((v) => (
              <button
                key={v}
                onClick={() => onNumeratorChange(v)}
                className={cn(
                  "h-11 w-11 rounded-xl border text-base font-extrabold transition",
                  v === numerator
                    ? "border-rose-500 bg-rose-500 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-rose-300 hover:bg-rose-50"
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-violet-100 bg-violet-50/40 px-6 py-4">
          <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">ค่าที่เลือกตอนนี้</div>
          <FractionText numerator={numerator} denominator={denominator} className="text-4xl" toneClassName="text-brand-800" />
          <button
            onClick={() => speak(reading)}
            className="flex items-center gap-1.5 rounded-lg border border-violet-200 bg-white px-3 py-1.5 text-xs font-extrabold text-violet-600 transition hover:bg-violet-50"
          >
            <Volume2 size={13} />
            อ่านว่า {reading}
          </button>
        </div>
      </div>
    </Card>
  );
}
