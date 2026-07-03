"use client";

import { useState } from "react";
import { Check, Minus, Plus, Shuffle, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FractionShape } from "@/components/fractions/FractionShape";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { cn } from "@/lib/cn";
import { randInt } from "@/lib/randomFraction";
import type { FractionShapeKind } from "@/types/lessonContent";

const SIGNS = [">", "=", "<"] as const;
type Sign = (typeof SIGNS)[number];

function signOf(a: number, b: number): Sign {
  if (a > b) return ">";
  if (a < b) return "<";
  return "=";
}

type Fraction = { numerator: number; denominator: number };

const FOODS: { id: FractionShapeKind; label: string; icon: string }[] = [
  { id: "pizza", label: "พิซซา", icon: "🍕" },
  { id: "watermelon", label: "แตงโม", icon: "🍉" },
  { id: "chocolate", label: "ช็อกโกแลต", icon: "🍫" },
];

function BigStepper({
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
    <div className="flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2">
      <span className="text-sm font-extrabold text-slate-500 sm:text-base">{label}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`ลด${label}`}
          className={cn("grid h-11 w-11 place-items-center rounded-xl text-white shadow-sm transition active:scale-95 disabled:opacity-30", color)}
        >
          <Minus size={22} strokeWidth={3} />
        </button>
        <span className="w-8 text-center text-xl font-extrabold text-slate-700">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`เพิ่ม${label}`}
          className={cn("grid h-11 w-11 place-items-center rounded-xl text-white shadow-sm transition active:scale-95 disabled:opacity-30", color)}
        >
          <Plus size={22} strokeWidth={3} />
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
  food,
  tone,
  colorClass,
  buttonColor,
  cardClass,
}: {
  emoji: string;
  name: string;
  fraction: Fraction;
  onChange: (f: Fraction) => void;
  food: FractionShapeKind;
  tone: "sky" | "pink";
  colorClass: string;
  buttonColor: string;
  cardClass: string;
}) {
  function setNumerator(n: number) {
    onChange({ ...fraction, numerator: Math.min(n, fraction.denominator - 1) });
  }
  function setDenominator(d: number) {
    onChange({ denominator: d, numerator: Math.min(fraction.numerator, d - 1) });
  }

  return (
    <div className={cn("flex flex-col items-center gap-4 rounded-3xl border-2 p-5 shadow-sm", cardClass)}>
      <div className="flex items-center gap-2">
        <span className="text-3xl" aria-hidden>{emoji}</span>
        <span className="text-lg font-extrabold text-slate-700 sm:text-xl">{name}</span>
      </div>

      {/* จานรองขนาดเท่ากันเสมอ — ตอกย้ำว่าเป็นของทั้งชิ้นเท่ากัน */}
      <div className="grid h-44 w-44 place-items-center rounded-full border-4 border-white bg-slate-100 shadow-inner sm:h-56 sm:w-56">
        <FractionShape numerator={fraction.numerator} denominator={fraction.denominator} shape={food} tone={tone} className="h-40 w-40 sm:h-52 sm:w-52" />
      </div>

      <StackedFraction numerator={fraction.numerator} denominator={fraction.denominator} className="text-5xl sm:text-6xl" toneClassName={colorClass} />

      <div className="w-full space-y-2">
        <BigStepper label="ตัวเศษ" value={fraction.numerator} min={1} max={fraction.denominator - 1} onChange={setNumerator} color={buttonColor} />
        <BigStepper label="ตัวส่วน" value={fraction.denominator} min={2} max={9} onChange={setDenominator} color={buttonColor} />
      </div>
    </div>
  );
}

/** แถบเทียบแนวนอน ยาวเท่ากันเสมอ เติมสีตามสัดส่วนจริง — เห็นชัดว่าใครกินเยอะกว่า */
function CompareBar({
  label,
  fraction,
  colorClass,
  barColor,
  reveal,
}: {
  label: string;
  fraction: Fraction;
  colorClass: string;
  barColor: string;
  reveal: boolean;
}) {
  const pct = (fraction.numerator / fraction.denominator) * 100;
  return (
    <div className="flex items-center gap-3">
      <span className={cn("w-16 shrink-0 text-sm font-extrabold sm:w-20 sm:text-base", colorClass)}>{label}</span>
      <div className="h-8 flex-1 overflow-hidden rounded-full bg-slate-100 sm:h-10">
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out", barColor)}
          style={{ width: reveal ? `${pct}%` : "0%" }}
        />
      </div>
      <span className={cn("w-14 shrink-0 text-right text-sm font-extrabold sm:text-base", colorClass)}>
        {reveal ? `${Math.round(pct)}%` : ""}
      </span>
    </div>
  );
}

function reasonText(left: Fraction, right: Fraction, leftName: string, rightName: string, answer: Sign): string {
  if (left.denominator === right.denominator) {
    return `ตัวส่วนเท่ากัน (ทั้งคู่แบ่งเป็น ${left.denominator} ชิ้นเท่ากัน) จึงเทียบตัวเศษได้เลย: ${left.numerator} ${answer} ${right.numerator}`;
  }
  if (left.numerator === right.numerator) {
    const smallerDen = left.denominator < right.denominator ? leftName : rightName;
    return `กินไปคนละ ${left.numerator} ชิ้นเท่ากัน แต่${smallerDen}แบ่งเป็นชิ้นที่ใหญ่กว่า (แบ่งน้อยชิ้นกว่า) จึงกินได้เยอะกว่า`;
  }
  return "ดูแถบเทียบด้านล่าง — แท่งของใครยาวกว่า แสดงว่ากินได้เยอะกว่า";
}

const DEFAULT_LEFT: Fraction = { numerator: 1, denominator: 2 };
const DEFAULT_RIGHT: Fraction = { numerator: 1, denominator: 3 };

export function VisualCompareBattle() {
  const [left, setLeft] = useState<Fraction>(DEFAULT_LEFT);
  const [right, setRight] = useState<Fraction>(DEFAULT_RIGHT);
  const [food, setFood] = useState<FractionShapeKind>("pizza");
  const [picked, setPicked] = useState<Sign | null>(null);
  const [streak, setStreak] = useState(0);

  const leftVal = left.numerator / left.denominator;
  const rightVal = right.numerator / right.denominator;
  const answer = signOf(leftVal, rightVal);
  const isCorrect = picked === answer;
  const revealed = picked !== null;

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
            <h2 className="text-2xl font-extrabold sm:text-3xl">ใครกินเยอะกว่า?</h2>
            <p className="mt-0.5 text-sm font-bold text-emerald-100 sm:text-base">ทายก่อนว่าใครกินเยอะกว่า แล้วดูเฉลยจากแถบเทียบด้านล่าง</p>
          </div>
        </div>
        <span className="rounded-full bg-white/20 px-3.5 py-1.5 text-sm font-extrabold">⭐ ตอบถูกติดกัน {streak} ข้อ</span>
      </div>

      <div className="space-y-6 bg-gradient-to-b from-emerald-50/40 to-white p-5 sm:p-6">
        {/* เลือกของกิน */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-sm font-extrabold text-slate-500">เลือกของกิน:</span>
          {FOODS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFood(f.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-xl border-2 px-3.5 py-2 text-sm font-extrabold transition",
                food === f.id ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-500 hover:border-emerald-200"
              )}
            >
              <span aria-hidden>{f.icon}</span> {f.label}
            </button>
          ))}
        </div>

        {/* จานทั้งสอง */}
        <div className="grid items-start gap-4 sm:grid-cols-[1fr_auto_1fr]">
          <Plate emoji="🐻" name="หมีน้อย" fraction={left} onChange={updateLeft} food={food} tone="sky" colorClass="text-sky-600" buttonColor="bg-sky-500 hover:bg-sky-600" cardClass="border-sky-200 bg-sky-50/60" />
          <div className="hidden self-center sm:grid h-14 w-14 place-items-center justify-self-center rounded-full bg-slate-100 text-3xl font-extrabold text-slate-400">
            ?
          </div>
          <Plate emoji="🐰" name="กระต่ายน้อย" fraction={right} onChange={updateRight} food={food} tone="pink" colorClass="text-pink-600" buttonColor="bg-pink-500 hover:bg-pink-600" cardClass="border-pink-200 bg-pink-50/60" />
        </div>

        <div className="flex justify-center">
          <button
            onClick={randomize}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50"
          >
            <Shuffle size={15} /> สุ่มโจทย์ใหม่
          </button>
        </div>

        {/* ทายเครื่องหมาย */}
        <div className="text-center text-base font-bold text-slate-600">ทายก่อน: ใครกินเยอะกว่ากัน?</div>
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
                  "grid h-16 w-16 place-items-center rounded-2xl border-2 text-3xl font-extrabold transition sm:h-20 sm:w-20 sm:text-4xl",
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

        {/* แถบเทียบ — เฉลยแบบเคลื่อนไหวเมื่อทายแล้ว */}
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <p className="text-center text-sm font-bold text-slate-500">แถบเทียบสัดส่วนที่กิน</p>
          <CompareBar label="🐻 หมีน้อย" fraction={left} colorClass="text-sky-600" barColor="bg-sky-500" reveal={revealed} />
          <CompareBar label="🐰 กระต่าย" fraction={right} colorClass="text-pink-600" barColor="bg-pink-500" reveal={revealed} />
        </div>

        {picked && (
          <div
            className={cn(
              "flex items-start gap-2 rounded-xl px-4 py-3 text-sm font-bold sm:text-base",
              isCorrect ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"
            )}
          >
            {isCorrect ? <Check size={19} className="mt-0.5 shrink-0" /> : <X size={19} className="mt-0.5 shrink-0" />}
            <span className="flex flex-wrap items-center gap-1.5">
              {isCorrect ? "ถูกต้อง! " : "ยังไม่ถูก — "}
              <StackedFraction numerator={left.numerator} denominator={left.denominator} className="text-base" toneClassName="text-sky-600" />
              <span className="text-lg font-extrabold">{answer}</span>
              <StackedFraction numerator={right.numerator} denominator={right.denominator} className="text-base" toneClassName="text-pink-600" />
              <span>— {reasonText(left, right, "หมีน้อย", "กระต่าย", answer)}</span>
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
