"use client";

import { useState } from "react";
import { Check, Shuffle, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/lessons/equivalent/EquivalentMath";
import { cn } from "@/lib/cn";
import { randInt } from "@/lib/randomFraction";

type Fraction = { numerator: number; denominator: number };

const BASES: Fraction[] = [
  { numerator: 1, denominator: 2 },
  { numerator: 1, denominator: 3 },
  { numerator: 2, denominator: 3 },
  { numerator: 1, denominator: 4 },
  { numerator: 3, denominator: 4 },
  { numerator: 2, denominator: 5 },
  { numerator: 3, denominator: 5 },
];

function makePair(): { left: Fraction; right: Fraction } {
  const base = BASES[randInt(0, BASES.length - 1)];
  const k = randInt(2, 3);
  const left = { numerator: base.numerator, denominator: base.denominator };
  if (Math.random() < 0.5) {
    return { left, right: { numerator: base.numerator * k, denominator: base.denominator * k } };
  }
  // คู่ลวง: บวกเท่ากันทั้งบนล่าง (กับดักยอดฮิต) หรือคลาดเศษไป 1
  const right =
    Math.random() < 0.5
      ? { numerator: base.numerator + k, denominator: base.denominator + k }
      : { numerator: base.numerator * k + 1, denominator: base.denominator * k };
  return { left, right };
}

const GREEN = "#059669";
const SKY = "#0284c7";
const ROSE = "#e11d48";
const INK = "#312e81";

function CrossDiagram({ left, right, revealed }: { left: Fraction; right: Fraction; revealed: boolean }) {
  const productA = left.numerator * right.denominator;
  const productB = right.numerator * left.denominator;
  const equal = productA === productB;
  return (
    <svg viewBox="0 0 640 300" className="mx-auto w-full max-w-2xl" role="img" aria-label="แผนภาพคูณไขว้">
      <defs>
        <marker id="cross-head-a" markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto">
          <path d="M0 0 L4 2 L0 4 Z" fill={GREEN} />
        </marker>
        <marker id="cross-head-b" markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto">
          <path d="M0 0 L4 2 L0 4 Z" fill={SKY} />
        </marker>
      </defs>

      {/* เศษส่วนซ้าย */}
      <text x={180} y={80} textAnchor="middle" fontSize={58} fontWeight={800} fill={INK}>
        {left.numerator}
      </text>
      <rect x={138} y={97} width={84} height={6} rx={3} fill={INK} />
      <text x={180} y={168} textAnchor="middle" fontSize={58} fontWeight={800} fill={INK}>
        {left.denominator}
      </text>

      {/* เศษส่วนขวา */}
      <text x={460} y={80} textAnchor="middle" fontSize={58} fontWeight={800} fill={INK}>
        {right.numerator}
      </text>
      <rect x={418} y={97} width={84} height={6} rx={3} fill={INK} />
      <text x={460} y={168} textAnchor="middle" fontSize={58} fontWeight={800} fill={INK}>
        {right.denominator}
      </text>

      {/* ก่อนเฉลย: เครื่องหมายคำถามตรงกลาง */}
      {!revealed && (
        <text x={320} y={125} textAnchor="middle" fontSize={64} fontWeight={800} fill="#94a3b8">
          ?
        </text>
      )}

      {revealed && (
        <g>
          {/* ลูกศรไขว้: เขียว = เศษซ้าย × ส่วนขวา, ฟ้า = ส่วนซ้าย × เศษขวา */}
          <line x1={228} y1={62} x2={408} y2={148} stroke={GREEN} strokeWidth={5} markerEnd="url(#cross-head-a)" opacity={0.85} />
          <line x1={228} y1={148} x2={408} y2={62} stroke={SKY} strokeWidth={5} markerEnd="url(#cross-head-b)" opacity={0.85} />

          {/* ผลคูณสองฝั่ง สีตรงกับลูกศร */}
          <text x={180} y={255} textAnchor="middle" fontSize={34} fontWeight={800} fill={GREEN}>
            {left.numerator} × {right.denominator} = {productA}
          </text>
          <text x={460} y={255} textAnchor="middle" fontSize={34} fontWeight={800} fill={SKY}>
            {right.numerator} × {left.denominator} = {productB}
          </text>
          <text x={320} y={255} textAnchor="middle" fontSize={40} fontWeight={800} fill={equal ? GREEN : ROSE}>
            {equal ? "=" : "≠"}
          </text>
        </g>
      )}
    </svg>
  );
}

function StepBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xl font-extrabold text-slate-600 transition hover:bg-slate-200 active:scale-95"
    >
      {children}
    </button>
  );
}

function FractionPicker({
  label,
  frac,
  onChange,
}: {
  label: string;
  frac: Fraction;
  onChange: (f: Fraction) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-slate-100 bg-white p-3">
      <span className="text-sm font-extrabold text-slate-400">{label}</span>
      <div className="flex items-center gap-2">
        <StepBtn onClick={() => onChange({ ...frac, numerator: Math.max(1, frac.numerator - 1) })}>−</StepBtn>
        <span className="w-9 text-center text-2xl font-extrabold text-brand-900">{frac.numerator}</span>
        <StepBtn onClick={() => onChange({ ...frac, numerator: Math.min(12, frac.numerator + 1) })}>+</StepBtn>
      </div>
      <div className="h-0.5 w-16 rounded-full bg-slate-300" />
      <div className="flex items-center gap-2">
        <StepBtn onClick={() => onChange({ ...frac, denominator: Math.max(2, frac.denominator - 1) })}>−</StepBtn>
        <span className="w-9 text-center text-2xl font-extrabold text-brand-900">{frac.denominator}</span>
        <StepBtn onClick={() => onChange({ ...frac, denominator: Math.min(12, frac.denominator + 1) })}>+</StepBtn>
      </div>
    </div>
  );
}

export function EquivalentCrossCheckCard() {
  const [left, setLeft] = useState<Fraction>({ numerator: 2, denominator: 3 });
  const [right, setRight] = useState<Fraction>({ numerator: 4, denominator: 6 });
  const [guess, setGuess] = useState<"equal" | "notequal" | null>(null);

  const revealed = guess !== null;
  const productA = left.numerator * right.denominator;
  const productB = right.numerator * left.denominator;
  const isEqual = productA === productB;
  const guessCorrect = revealed && (guess === "equal") === isEqual;

  function changeLeft(f: Fraction) {
    setLeft(f);
    setGuess(null);
  }
  function changeRight(f: Fraction) {
    setRight(f);
    setGuess(null);
  }
  function randomPair() {
    const pair = makePair();
    setLeft(pair.left);
    setRight(pair.right);
    setGuess(null);
  }

  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={4} title="ตรวจสอบด้วยการคูณไขว้" />
      <div className="space-y-5 p-5 sm:p-6">
        {/* ตั้งค่าเศษส่วนสองตัว */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
          <FractionPicker label="ตัวซ้าย" frac={left} onChange={changeLeft} />
          <FractionPicker label="ตัวขวา" frac={right} onChange={changeRight} />
          <button
            onClick={randomPair}
            className="flex h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50"
          >
            <Shuffle size={15} /> สุ่มคู่ใหม่
          </button>
        </div>

        {/* แผนภาพคูณไขว้ */}
        <CrossDiagram left={left} right={right} revealed={revealed} />

        {/* ทายก่อนเฉลย */}
        {!revealed ? (
          <div className="space-y-2">
            <p className="text-center text-base font-extrabold text-slate-600 sm:text-lg">ทายสิ — สองตัวนี้เท่ากันไหม?</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setGuess("equal")}
                className="h-13 rounded-xl bg-emerald-600 px-8 py-3 text-lg font-extrabold text-white shadow-md transition hover:bg-emerald-700 active:scale-[0.98]"
              >
                เท่ากัน =
              </button>
              <button
                onClick={() => setGuess("notequal")}
                className="h-13 rounded-xl bg-rose-500 px-8 py-3 text-lg font-extrabold text-white shadow-md transition hover:bg-rose-600 active:scale-[0.98]"
              >
                ไม่เท่ากัน ≠
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-base font-extrabold sm:text-lg",
                guessCorrect ? "bg-emerald-100 text-emerald-700" : "bg-rose-50 text-rose-600"
              )}
            >
              {guessCorrect ? <Check size={20} className="shrink-0" /> : <X size={20} className="shrink-0" />}
              {guessCorrect ? "ทายถูก!" : "ยังไม่ถูก"} — ผลคูณไขว้ {productA} {isEqual ? "=" : "≠"} {productB} ดังนั้น
              {isEqual ? "เท่ากัน" : "ไม่เท่ากัน"}
            </div>
            <div className="flex justify-center">
              <button
                onClick={randomPair}
                className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-extrabold text-white shadow transition hover:bg-violet-700 active:scale-[0.98] sm:text-base"
              >
                <Shuffle size={16} /> ลองคู่ต่อไป
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-sm font-bold text-slate-500 sm:text-base">
          เคล็ดลับ: คูณไขว้แล้วได้ผลเท่ากัน แปลว่าเป็น<span className="text-teal-700">เศษส่วนที่เท่ากัน</span>แน่นอน
          ไม่ต้องวาดรูปก็ตรวจได้
        </p>
      </div>
    </Card>
  );
}
