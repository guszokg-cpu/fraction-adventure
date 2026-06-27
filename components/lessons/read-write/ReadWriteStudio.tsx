"use client";

import { useState, type ReactNode } from "react";
import { Check, RefreshCw, Volume2, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FractionShape } from "@/components/fractions/FractionShape";
import { cn } from "@/lib/cn";
import { readThaiFraction } from "@/lib/thaiNumber";
import { readPracticeFractions } from "@/data/lessonReadWrite";

function speak(text: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "th-TH";
  utterance.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function FracStack({
  top,
  bottom,
  className,
  lineClassName,
}: {
  top: ReactNode;
  bottom: ReactNode;
  className?: string;
  lineClassName?: string;
}) {
  return (
    <span className={cn("inline-flex flex-col items-center leading-none", className)}>
      <span>{top}</span>
      <span className={cn("my-1 h-0.5 w-full min-w-[1.4rem] rounded-full bg-current", lineClassName)} />
      <span>{bottom}</span>
    </span>
  );
}

function SpeakButton({ text, className }: { text: string; className?: string }) {
  return (
    <button
      onClick={() => speak(text)}
      aria-label={`ฟังเสียงอ่าน ${text}`}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border border-brand-100 bg-white px-3 py-2 text-sm font-bold text-brand-700 transition hover:bg-brand-50",
        className
      )}
    >
      <Volume2 size={16} />
      ฟังเสียงอ่าน
    </button>
  );
}

function Stepper({
  label,
  value,
  onDecrease,
  onIncrease
}: {
  label: string;
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm font-bold text-slate-600">{label}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={onDecrease}
          aria-label={`ลด ${label}`}
          className="grid h-8 w-8 place-items-center rounded-lg border border-brand-100 bg-white text-lg font-extrabold text-brand-700 hover:bg-brand-50"
        >
          −
        </button>
        <span className="w-7 text-center text-lg font-extrabold text-brand-900">{value}</span>
        <button
          onClick={onIncrease}
          aria-label={`เพิ่ม ${label}`}
          className="grid h-8 w-8 place-items-center rounded-lg border border-brand-100 bg-white text-lg font-extrabold text-brand-700 hover:bg-brand-50"
        >
          +
        </button>
      </div>
    </div>
  );
}

export function ReadWriteStudio() {
  const [numerator, setNumerator] = useState(7);
  const [denominator, setDenominator] = useState(10);
  const [pickIndex, setPickIndex] = useState(0);
  const [targetIndex, setTargetIndex] = useState(9);
  const [answerNumerator, setAnswerNumerator] = useState("");
  const [answerDenominator, setAnswerDenominator] = useState("");
  const [checked, setChecked] = useState(false);

  const safeNumerator = Math.min(numerator, denominator);
  const picked = readPracticeFractions[pickIndex];
  const target = readPracticeFractions[targetIndex];
  const isCorrect =
    Number(answerNumerator) === target.numerator && Number(answerDenominator) === target.denominator;

  function decreaseDenominator() {
    const next = Math.max(2, denominator - 1);
    setDenominator(next);
    if (numerator > next) {
      setNumerator(next);
    }
  }

  function nextTarget() {
    setTargetIndex((targetIndex + 1) % readPracticeFractions.length);
    setAnswerNumerator("");
    setAnswerDenominator("");
    setChecked(false);
  }

  return (
    <>
      {/* การอ่านเศษส่วน */}
      <Card>
        <h2 className="text-xl font-extrabold text-brand-900">การอ่านเศษส่วน</h2>
        <div className="mt-4 grid items-center gap-6 md:grid-cols-[160px_1fr_auto]">
          <FractionShape numerator={3} denominator={4} tone="accent" className="mx-auto h-36 w-36" />
          <div>
            <div className="flex items-center gap-4">
              <div className="text-6xl font-extrabold leading-none text-slate-300">
                <FracStack top={<span className="text-rose-500">3</span>} bottom={<span className="text-brand-600">4</span>} />
              </div>
              <div className="space-y-2 text-sm font-bold">
                <div className="rounded-lg bg-rose-50 px-3 py-1.5 text-rose-600">ตัวเศษ = ส่วนที่เลือก</div>
                <div className="rounded-lg bg-brand-50 px-3 py-1.5 text-brand-700">ตัวส่วน = ส่วนทั้งหมด</div>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="rounded-xl bg-violet-50 px-5 py-3 text-2xl font-extrabold text-violet-700">
              เศษสามส่วนสี่
            </div>
            <SpeakButton text="เศษสามส่วนสี่" className="mt-3" />
          </div>
        </div>
      </Card>

      {/* เครื่องมือช่วยเรียนรู้ */}
      <Card>
        <h2 className="text-xl font-extrabold text-brand-900">เครื่องมือช่วยเรียนรู้</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {/* Tool 1 */}
          <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-4">
            <div className="text-sm font-extrabold text-brand-700">1. สร้างเศษส่วน แล้วฟังคำอ่าน</div>
            <div className="mt-3 space-y-2">
              <Stepper
                label="ตัวส่วน"
                value={denominator}
                onDecrease={decreaseDenominator}
                onIncrease={() => setDenominator(Math.min(12, denominator + 1))}
              />
              <Stepper
                label="ตัวเศษ"
                value={safeNumerator}
                onDecrease={() => setNumerator(Math.max(0, numerator - 1))}
                onIncrease={() => setNumerator(Math.min(denominator, numerator + 1))}
              />
            </div>
            <div className="mt-3 flex items-center justify-center gap-3 rounded-lg bg-white p-2">
              <FractionShape numerator={safeNumerator} denominator={denominator} tone="emerald" className="h-12 w-12" />
              <FracStack top={safeNumerator} bottom={denominator} className="text-3xl font-extrabold text-brand-900" />
            </div>
            <div className="mt-2 text-center text-sm font-bold text-slate-700">
              อ่านว่า {readThaiFraction(safeNumerator, denominator)}
            </div>
            <SpeakButton text={readThaiFraction(safeNumerator, denominator)} className="mt-2 w-full justify-center" />
          </div>

          {/* Tool 2 */}
          <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-4">
            <div className="text-sm font-extrabold text-brand-700">2. เลือกเศษส่วนเพื่อฝึกอ่าน</div>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {readPracticeFractions.map((fraction, index) => (
                <button
                  key={`${fraction.numerator}-${fraction.denominator}`}
                  onClick={() => setPickIndex(index)}
                  className={cn(
                    "flex justify-center rounded-lg border py-1.5 font-extrabold transition",
                    index === pickIndex
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-brand-100 bg-white text-brand-700 hover:bg-brand-50"
                  )}
                >
                  <FracStack top={fraction.numerator} bottom={fraction.denominator} className="text-[13px]" />
                </button>
              ))}
            </div>
            <div className="mt-3 rounded-lg bg-white p-3 text-center">
              <div className="flex justify-center">
                <FracStack top={picked.numerator} bottom={picked.denominator} className="text-3xl font-extrabold text-brand-900" />
              </div>
              <div className="mt-1 text-sm font-bold text-violet-700">
                {readThaiFraction(picked.numerator, picked.denominator)}
              </div>
            </div>
            <SpeakButton
              text={readThaiFraction(picked.numerator, picked.denominator)}
              className="mt-2 w-full justify-center"
            />
          </div>

          {/* Tool 3 */}
          <div className="rounded-xl border border-brand-100 bg-brand-50/40 p-4">
            <div className="text-sm font-extrabold text-brand-700">3. เขียนเศษส่วนจากคำอ่าน</div>
            <div className="mt-3 rounded-lg bg-violet-50 px-3 py-3 text-center text-lg font-extrabold text-violet-700">
              {readThaiFraction(target.numerator, target.denominator)}
            </div>
            <div className="mt-3 flex flex-col items-center gap-1.5">
              <input
                type="number"
                value={answerNumerator}
                onChange={(event) => {
                  setAnswerNumerator(event.target.value);
                  setChecked(false);
                }}
                aria-label="ตัวเศษ"
                className="h-12 w-16 rounded-lg border border-brand-100 text-center text-2xl font-extrabold text-brand-900 outline-none focus:border-brand-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <span className="h-[3px] w-16 rounded-full bg-slate-300" />
              <input
                type="number"
                value={answerDenominator}
                onChange={(event) => {
                  setAnswerDenominator(event.target.value);
                  setChecked(false);
                }}
                aria-label="ตัวส่วน"
                className="h-12 w-16 rounded-lg border border-brand-100 text-center text-2xl font-extrabold text-brand-900 outline-none focus:border-brand-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setChecked(true)}
                className="inline-flex h-9 flex-1 items-center justify-center gap-1 rounded-lg bg-brand-600 px-3 text-sm font-bold text-white hover:bg-brand-700"
              >
                <Check size={16} />
                ตรวจคำตอบ
              </button>
              <button
                onClick={nextTarget}
                aria-label="ข้อใหม่"
                className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-brand-100 bg-white px-3 text-sm font-bold text-brand-700 hover:bg-brand-50"
              >
                <RefreshCw size={16} />
              </button>
            </div>
            {checked && (
              <div
                className={cn(
                  "mt-2 flex items-center justify-center gap-1 rounded-lg py-1.5 text-sm font-bold",
                  isCorrect ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                )}
              >
                {isCorrect ? <Check size={16} /> : <X size={16} />}
                {isCorrect ? "ถูกต้อง เก่งมาก!" : "ยังไม่ถูก ลองอีกครั้ง"}
              </div>
            )}
          </div>
        </div>
      </Card>
    </>
  );
}
