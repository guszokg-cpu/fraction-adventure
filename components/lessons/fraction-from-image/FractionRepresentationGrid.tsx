"use client";
import { Frac } from "@/components/lessons/Frac";

import { Volume2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionText } from "@/components/fractions/FractionText";
import { readThaiFraction } from "@/lib/thaiNumber";
import type { FractionShapeKind, FractionTone } from "@/types/lessonContent";

function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "th-TH";
  utterance.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

const REPRESENTATIONS: { shape: FractionShapeKind; label: string; tone: FractionTone }[] = [
  { shape: "circle", label: "วงกลม", tone: "pink" },
  { shape: "bar", label: "แท่ง", tone: "pink" },
  { shape: "grid", label: "ตาราง", tone: "pink" },
  { shape: "window", label: "หน้าต่าง", tone: "sky" },
];

type Props = { numerator: number; denominator: number };

export function FractionRepresentationGrid({ numerator, denominator }: Props) {
  const reading = readThaiFraction(numerator, denominator);

  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-xl font-extrabold text-brand-900">
        <span>⭐</span> ดูรูปแบบต่าง ๆ ที่แทน <Frac n={numerator} d={denominator} /> เหมือนกัน
      </h3>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {REPRESENTATIONS.map((rep, i) => (
          <Card key={rep.shape} className="rounded-2xl border-slate-200 text-center">
            <div className="mx-auto mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-violet-500 text-sm font-extrabold text-white">
              {i + 1}
            </div>
            <div className="text-sm font-extrabold text-brand-700">{rep.label}</div>

            <div className="mt-3 flex justify-center">
              <FractionShape
                numerator={numerator}
                denominator={denominator}
                shape={rep.shape}
                tone={rep.tone}
                className={rep.shape === "bar" ? "h-16 w-40" : "h-28 w-28"}
              />
            </div>

            <div className="mt-4 space-y-1 text-left text-sm font-bold text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-rose-400" />
                ระบาย {numerator} ส่วน
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-sky-400" />
                ทั้งหมด {denominator} ส่วน
              </div>
            </div>

            <div className="mt-4 text-slate-500">
              เขียนเป็น
              <div className="mt-1 flex justify-center">
                <FractionText numerator={numerator} denominator={denominator} className="text-3xl" toneClassName="text-brand-800" />
              </div>
            </div>

            <button
              onClick={() => speak(reading)}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
            >
              <Volume2 size={12} />
              อ่านว่า {reading}
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
