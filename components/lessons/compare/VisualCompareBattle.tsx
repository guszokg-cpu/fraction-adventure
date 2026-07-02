"use client";

import { useState } from "react";
import { Check, Minus, Plus, Shuffle, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FractionShape } from "@/components/fractions/FractionShape";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { cn } from "@/lib/cn";
import { randInt } from "@/lib/randomFraction";

const SIGNS = [">", "=", "<"] as const;
type Sign = (typeof SIGNS)[number];

function signOf(a: number, b: number): Sign {
  if (a > b) return ">";
  if (a < b) return "<";
  return "=";
}

type Fraction = { numerator: number; denominator: number };

/** ป้ายคำอธิบายเครื่องหมายให้เป็นภาษาเด็ก */
const SIGN_WORD: Record<Sign, string> = { ">": "มากกว่า", "=": "เท่ากับ", "<": "น้อยกว่า" };

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
  color,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg bg-white px-2 py-1.5">
      <span className="text-xs font-bold text-slate-500">{label}</span>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`ลด${label}`}
          className="grid h-6 w-6 place-items-center rounded-md bg-slate-100 text-slate-600 transition hover:bg-slate-200 disabled:opacity-30"
        >
          <Minus size={13} />
        </button>
        <span className={cn("w-5 text-center text-base font-extrabold", color)}>{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`เพิ่ม${label}`}
          className="grid h-6 w-6 place-items-center rounded-md bg-slate-100 text-slate-600 transition hover:bg-slate-200 disabled:opacity-30"
        >
          <Plus size={13} />
        </button>
      </div>
    </div>
  );
}

function Plate({
  emoji,
  name,
  fraction,
  onChange,
  tone,
  colorClass,
}: {
  emoji: string;
  name: string;
  fraction: Fraction;
  onChange: (f: Fraction) => void;
  tone: "sky" | "pink";
  colorClass: string;
}) {
  function setNumerator(n: number) {
    onChange({ ...fraction, numerator: Math.min(n, fraction.denominator - 1) });
  }
  function setDenominator(d: number) {
    onChange({ denominator: d, numerator: Math.min(fraction.numerator, d - 1) });
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
      <div className="flex items-center gap-2">
        <span className="text-2xl" aria-hidden>{emoji}</span>
        <span className="text-sm font-extrabold text-slate-600">{name}</span>
      </div>
      <FractionShape numerator={fraction.numerator} denominator={fraction.denominator} shape="pizza" tone={tone} className="h-28 w-28" />
      <StackedFraction numerator={fraction.numerator} denominator={fraction.denominator} className="text-3xl" toneClassName={colorClass} />
      <div className="w-full space-y-1.5">
        <Stepper label="ตัวเศษ" value={fraction.numerator} min={1} max={fraction.denominator - 1} onChange={setNumerator} color={colorClass} />
        <Stepper label="ตัวส่วน" value={fraction.denominator} min={2} max={9} onChange={setDenominator} color={colorClass} />
      </div>
    </div>
  );
}

export function VisualCompareBattle() {
  const [left, setLeft] = useState<Fraction>({ numerator: 1, denominator: 2 });
  const [right, setRight] = useState<Fraction>({ numerator: 1, denominator: 3 });
  const [picked, setPicked] = useState<Sign | null>(null);
  const [streak, setStreak] = useState(0);

  const leftVal = left.numerator / left.denominator;
  const rightVal = right.numerator / right.denominator;
  const answer = signOf(leftVal, rightVal);
  const isCorrect = picked === answer;

  function updateLeft(f: Fraction) {
    setLeft(f);
    setPicked(null);
  }
  function updateRight(f: Fraction) {
    setRight(f);
    setPicked(null);
  }

  function randomize() {
    const d1 = randInt(2, 8);
    const d2 = randInt(2, 8);
    setLeft({ denominator: d1, numerator: randInt(1, d1 - 1) });
    setRight({ denominator: d2, numerator: randInt(1, d2 - 1) });
    setPicked(null);
  }

  function choose(sign: Sign) {
    if (picked) return;
    setPicked(sign);
    setStreak((s) => (sign === answer ? s + 1 : 0));
  }

  return (
    <Card className="overflow-hidden rounded-3xl p-0 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-emerald-600 to-green-500 px-6 py-5 text-white">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20 text-lg font-extrabold">2</span>
          <div>
            <h2 className="text-2xl font-extrabold">ใครกินเยอะกว่า?</h2>
            <p className="mt-0.5 text-sm font-bold text-emerald-100">ดูภาพพิซซาที่แต่ละคนกิน แล้วทายว่าเศษส่วนไหนมากกว่า</p>
          </div>
        </div>
        <span className="rounded-full bg-white/20 px-3.5 py-1.5 text-sm font-extrabold">⭐ ตอบถูกติดกัน {streak} ข้อ</span>
      </div>

      <div className="space-y-5 p-6">
        <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
          <Plate emoji="🐻" name="หมีน้อย" fraction={left} onChange={updateLeft} tone="sky" colorClass="text-sky-600" />
          <div className="grid h-12 w-12 place-items-center justify-self-center rounded-full bg-slate-100 text-2xl font-extrabold text-slate-400">
            ?
          </div>
          <Plate emoji="🐰" name="กระต่ายน้อย" fraction={right} onChange={updateRight} tone="pink" colorClass="text-pink-600" />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={randomize}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-500 transition hover:bg-slate-50"
          >
            <Shuffle size={13} /> สุ่มโจทย์ใหม่
          </button>
        </div>

        <div className="text-center text-sm font-bold text-slate-500">เลือกเครื่องหมายที่ถูกต้อง</div>
        <div className="flex items-center justify-center gap-3">
          {SIGNS.map((sign) => {
            const active = picked === sign;
            const rightPick = sign === answer;
            return (
              <button
                key={sign}
                onClick={() => choose(sign)}
                disabled={picked !== null}
                aria-label={`เลือกเครื่องหมาย ${sign}`}
                className={cn(
                  "grid h-16 w-16 place-items-center rounded-2xl border-2 text-3xl font-extrabold transition",
                  !picked && "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50",
                  picked && !active && !rightPick && "border-slate-100 bg-slate-50 text-slate-300",
                  active && rightPick && "border-emerald-400 bg-emerald-500 text-white",
                  active && !rightPick && "border-rose-400 bg-rose-50 text-rose-600",
                  picked && rightPick && !active && "border-emerald-300 bg-emerald-50 text-emerald-600"
                )}
              >
                {sign}
              </button>
            );
          })}
        </div>

        {picked && (
          <div
            className={cn(
              "flex items-start gap-2 rounded-xl px-4 py-3 text-sm font-bold",
              isCorrect ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"
            )}
          >
            {isCorrect ? <Check size={17} className="mt-0.5 shrink-0" /> : <X size={17} className="mt-0.5 shrink-0" />}
            <span className="flex flex-wrap items-center gap-1.5">
              {isCorrect ? "ถูกต้อง! " : "ยังไม่ถูก — "}
              <StackedFraction numerator={left.numerator} denominator={left.denominator} className="text-base" toneClassName="text-sky-600" />
              <span className="text-lg font-extrabold">{answer}</span>
              <StackedFraction numerator={right.numerator} denominator={right.denominator} className="text-base" toneClassName="text-pink-600" />
              <span>
                — หมีน้อยกินไป {(leftVal * 100).toFixed(0)}% ของถาด กระต่ายกินไป {(rightVal * 100).toFixed(0)}% จึง
                {answer === "=" ? "กินเท่ากันพอดี" : answer === ">" ? "หมีน้อยกินมากกว่า" : "กระต่ายกินมากกว่า"}
              </span>
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
