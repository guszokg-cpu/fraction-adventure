"use client";

import { Volume2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FractionText } from "@/components/fractions/FractionText";
import { gcd, simplifyFraction, toMixedNumber, getThaiFractionReading, getThaiMixedNumberReading } from "@/lib/fractionUtils";

function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "th-TH";
  utterance.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

type Props = {
  coloredTotal: number;
  denominator: number;
};

export function FractionResultSummary({ coloredTotal, denominator }: Props) {
  const isEmpty = coloredTotal === 0;
  const isWholeUnit = coloredTotal === denominator;
  const isImproper = coloredTotal > denominator;

  const mixed = isImproper ? toMixedNumber(coloredTotal, denominator) : null;
  const simplified = isImproper
    ? simplifyFraction(mixed!.numerator, mixed!.denominator)
    : simplifyFraction(coloredTotal, denominator);
  const canSimplify = isImproper
    ? gcd(mixed!.numerator, mixed!.denominator) > 1
    : gcd(coloredTotal, denominator) > 1 && coloredTotal > 0 && !isWholeUnit;

  const reading = isImproper
    ? getThaiMixedNumberReading(mixed!.whole, mixed!.numerator, mixed!.denominator)
    : getThaiFractionReading(coloredTotal, denominator);

  let explanation: string;
  if (isEmpty) {
    explanation = "ยังไม่ได้ระบายส่วนใด";
  } else if (isWholeUnit) {
    explanation = "ระบายครบ 1 หน่วย";
  } else if (isImproper) {
    explanation = `มี ${mixed!.whole} หน่วยเต็ม และอีก ${mixed!.numerator} ส่วน จาก ${denominator} ส่วน`;
  } else {
    explanation = `ระบาย ${coloredTotal} ส่วน จากรูปที่แบ่งเป็น ${denominator} ส่วนเท่า ๆ กัน จึงเขียนได้เป็น ${coloredTotal}/${denominator}`;
  }

  return (
    <Card className="rounded-2xl border-violet-100 bg-violet-50/30">
      <h3 className="flex items-center gap-2 text-lg font-extrabold text-brand-900">
        <span>🌟</span> สรุปผลอัตโนมัติ
      </h3>

      <div className="mt-4 space-y-2.5 text-sm font-bold text-slate-600">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span>ระบายทั้งหมด</span>
          <span className="text-brand-900">{coloredTotal} ส่วน</span>
        </div>
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span>แบ่งรูปละ</span>
          <span className="text-brand-900">{denominator} ส่วน</span>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
          <span className="text-sm font-bold text-slate-500">{isImproper ? "เศษเกิน" : "เศษส่วนรวม"}</span>
          <FractionText numerator={coloredTotal} denominator={denominator} className="text-3xl" toneClassName="text-brand-800" />
        </div>

        {isImproper && mixed && (
          <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
            <span className="text-sm font-bold text-slate-500">จำนวนคละ</span>
            <div className="flex items-center gap-2 text-3xl font-extrabold text-brand-800">
              <span>{mixed.whole}</span>
              <FractionText numerator={mixed.numerator} denominator={mixed.denominator} className="text-xl" toneClassName="text-pink-600" />
            </div>
          </div>
        )}

        {canSimplify && (
          <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3">
            <span className="text-sm font-bold text-emerald-700">รูปอย่างต่ำ</span>
            <div className="flex items-center gap-2 text-2xl font-extrabold text-emerald-700">
              {isImproper && mixed && <span>{mixed.whole}</span>}
              <FractionText numerator={simplified.numerator} denominator={simplified.denominator} className="text-2xl" toneClassName="text-emerald-700" />
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 rounded-xl bg-sky-50 px-4 py-3 text-sm font-bold text-sky-700">{explanation}</div>

      {!isEmpty && (
        <button
          onClick={() => speak(reading)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-extrabold text-amber-700 transition hover:bg-amber-100"
        >
          <Volume2 size={16} />
          อ่านว่า {reading}
        </button>
      )}
    </Card>
  );
}
