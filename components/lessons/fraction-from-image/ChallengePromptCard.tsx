"use client";

import { Volume2 } from "lucide-react";
import { FractionText } from "@/components/fractions/FractionText";
import {
  getThaiFractionReading,
  getThaiMixedNumberReading,
  toMixedNumber,
  type DrawChallenge,
} from "@/lib/fractionUtils";

function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "th-TH";
  utterance.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

const KIND_LABELS: Record<DrawChallenge["kind"], string> = {
  proper: "เศษส่วนแท้",
  improper: "เศษเกิน",
  mixed: "จำนวนคละ",
};

type Props = { challenge: DrawChallenge };

export function ChallengePromptCard({ challenge }: Props) {
  const { kind, numerator, denominator } = challenge;
  const mixed = kind === "mixed" ? toMixedNumber(numerator, denominator) : null;
  const reading =
    kind === "mixed" && mixed
      ? getThaiMixedNumberReading(mixed.whole, mixed.numerator, mixed.denominator)
      : getThaiFractionReading(numerator, denominator);

  return (
    <div className="rounded-2xl border border-violet-100 bg-violet-50/50 p-5 text-center">
      <span className="inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-extrabold text-violet-700">
        โจทย์: {KIND_LABELS[kind]}
      </span>
      <p className="mt-2 text-lg font-bold text-slate-700">สร้างภาพแทนเศษส่วนนี้ให้ถูกต้อง</p>

      <div className="mt-3 flex items-center justify-center gap-2">
        {mixed ? (
          <>
            <span className="text-6xl font-extrabold text-brand-800">{mixed.whole}</span>
            <FractionText numerator={mixed.numerator} denominator={mixed.denominator} className="text-4xl" toneClassName="text-pink-600" />
          </>
        ) : (
          <FractionText numerator={numerator} denominator={denominator} className="text-6xl" toneClassName="text-brand-800" />
        )}
      </div>

      <button
        onClick={() => speak(reading)}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-white px-3 py-1.5 text-xs font-extrabold text-violet-600 transition hover:bg-violet-50"
      >
        <Volume2 size={13} />
        อ่านว่า {reading}
      </button>
    </div>
  );
}
