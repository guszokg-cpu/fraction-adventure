"use client";

import { useState } from "react";
import { MultipleRepresentationsIntro } from "@/components/lessons/fraction-from-image/MultipleRepresentationsIntro";
import { FractionRepresentationControl } from "@/components/lessons/fraction-from-image/FractionRepresentationControl";
import { FractionRepresentationGrid } from "@/components/lessons/fraction-from-image/FractionRepresentationGrid";
import { FractionObservationSummary } from "@/components/lessons/fraction-from-image/FractionObservationSummary";
import { OddOneOutFractionActivity } from "@/components/lessons/fraction-from-image/OddOneOutFractionActivity";
import { MultipleRepresentationsSummary } from "@/components/lessons/fraction-from-image/MultipleRepresentationsSummary";

const DEFAULT_DENOMINATOR = 4;
const DEFAULT_NUMERATOR = 3;

export function MultipleRepresentationsSection() {
  const [denominator, setDenominator] = useState(DEFAULT_DENOMINATOR);
  const [numerator, setNumerator] = useState(DEFAULT_NUMERATOR);

  function handleDenominatorChange(next: number) {
    setDenominator(next);
    if (numerator > next) setNumerator(next);
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-brand-900">เศษส่วนเดียวกัน แสดงได้หลายแบบ</h2>
        <p className="mt-1 text-base font-bold text-slate-500">
          ไม่ว่าภาพจะต่างกัน ถ้าระบาย 3 ส่วน จากทั้งหมด 4 ส่วนเท่ากัน ก็เขียนเป็น 3/4 เหมือนกัน
        </p>
      </div>

      <MultipleRepresentationsIntro />

      <FractionRepresentationControl
        numerator={numerator}
        denominator={denominator}
        onDenominatorChange={handleDenominatorChange}
        onNumeratorChange={setNumerator}
      />

      <FractionRepresentationGrid numerator={numerator} denominator={denominator} />

      <FractionObservationSummary numerator={numerator} denominator={denominator} />

      <OddOneOutFractionActivity />

      <MultipleRepresentationsSummary />
    </div>
  );
}
