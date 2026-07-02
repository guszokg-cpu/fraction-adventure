"use client";

import { useState } from "react";
import { Check, Shuffle, X } from "lucide-react";
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

type TrickId = "same-denominator" | "same-numerator" | "benchmark";

type Challenge = { left: { n: number; d: number }; right: { n: number; d: number }; benchmark?: boolean };

function makeChallenge(trick: TrickId): Challenge {
  if (trick === "same-denominator") {
    const d = randInt(3, 9);
    let n1 = randInt(1, d - 1);
    let n2 = randInt(1, d - 1);
    let tries = 0;
    while (n1 === n2 && tries++ < 20) n2 = randInt(1, d - 1);
    return { left: { n: n1, d }, right: { n: n2, d } };
  }
  if (trick === "same-numerator") {
    const n = randInt(1, 4);
    let d1 = randInt(n + 1, 9);
    let d2 = randInt(n + 1, 9);
    let tries = 0;
    while (d1 === d2 && tries++ < 20) d2 = randInt(n + 1, 9);
    return { left: { n, d: d1 }, right: { n, d: d2 } };
  }
  // benchmark: เทียบเศษส่วนกับ 1/2
  let d = randInt(3, 9);
  let n = randInt(1, d - 1);
  let tries = 0;
  while (n / d === 0.5 && tries++ < 20) {
    d = randInt(3, 9);
    n = randInt(1, d - 1);
  }
  return { left: { n, d }, right: { n: 1, d: 2 }, benchmark: true };
}

const TRICKS: { id: TrickId; icon: string; title: string; rule: string; color: string; activeClass: string }[] = [
  {
    id: "same-denominator",
    icon: "1️⃣",
    title: "ตัวส่วนเท่ากัน",
    rule: "ถ้าตัวส่วนเท่ากัน ให้ดูที่ตัวเศษ — ตัวเศษมากกว่า ค่ามากกว่า",
    color: "text-sky-700",
    activeClass: "border-sky-500 bg-sky-50",
  },
  {
    id: "same-numerator",
    icon: "2️⃣",
    title: "ตัวเศษเท่ากัน",
    rule: "ถ้าตัวเศษเท่ากัน ตัวส่วนยิ่งน้อย ค่ายิ่งมาก — เพราะแบ่งน้อยชิ้น แต่ละชิ้นเลยใหญ่",
    color: "text-amber-700",
    activeClass: "border-amber-500 bg-amber-50",
  },
  {
    id: "benchmark",
    icon: "3️⃣",
    title: "เทียบกับครึ่ง (1/2)",
    rule: "ใช้ 1/2 เป็นหลัก — ถ้าตัวเศษมากกว่าครึ่งหนึ่งของตัวส่วน แสดงว่ามากกว่า 1/2",
    color: "text-violet-700",
    activeClass: "border-violet-500 bg-violet-50",
  },
];

function TrickPractice({ trick }: { trick: TrickId }) {
  const [challenge, setChallenge] = useState<Challenge>(() =>
    trick === "same-denominator"
      ? { left: { n: 3, d: 5 }, right: { n: 2, d: 5 } }
      : trick === "same-numerator"
        ? { left: { n: 1, d: 3 }, right: { n: 1, d: 5 } }
        : { left: { n: 3, d: 5 }, right: { n: 1, d: 2 }, benchmark: true }
  );
  const [picked, setPicked] = useState<Sign | null>(null);

  const leftVal = challenge.left.n / challenge.left.d;
  const rightVal = challenge.right.n / challenge.right.d;
  const answer = signOf(leftVal, rightVal);
  const isCorrect = picked === answer;

  function choose(sign: Sign) {
    if (picked) return;
    setPicked(sign);
  }
  function next() {
    setChallenge(makeChallenge(trick));
    setPicked(null);
  }

  const bench = challenge.benchmark;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-4 sm:gap-6">
        <div className="flex flex-col items-center gap-2">
          <FractionShape numerator={challenge.left.n} denominator={challenge.left.d} shape="bar" tone="sky" className="h-12 w-32" />
          <StackedFraction numerator={challenge.left.n} denominator={challenge.left.d} className="text-2xl" toneClassName="text-sky-600" />
        </div>
        <span className="text-2xl font-extrabold text-slate-400">?</span>
        <div className="flex flex-col items-center gap-2">
          <FractionShape numerator={challenge.right.n} denominator={challenge.right.d} shape="bar" tone={bench ? "violet" : "emerald"} className="h-12 w-32" />
          <StackedFraction numerator={challenge.right.n} denominator={challenge.right.d} className="text-2xl" toneClassName={bench ? "text-violet-600" : "text-emerald-600"} />
        </div>
      </div>

      <div className="flex items-center justify-center gap-2.5">
        {SIGNS.map((sign) => {
          const active = picked === sign;
          const rightPick = sign === answer;
          return (
            <button
              key={sign}
              onClick={() => choose(sign)}
              disabled={picked !== null}
              className={cn(
                "grid h-12 w-12 place-items-center rounded-xl border-2 text-2xl font-extrabold transition",
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
        <button
          onClick={next}
          className="ml-2 flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-500 transition hover:bg-slate-50"
        >
          <Shuffle size={13} /> ลองข้อใหม่
        </button>
      </div>

      {picked && (
        <div className={cn("rounded-xl px-4 py-3 text-sm font-bold", isCorrect ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600")}>
          <span className="flex items-start gap-2">
            {isCorrect ? <Check size={17} className="mt-0.5 shrink-0" /> : <X size={17} className="mt-0.5 shrink-0" />}
            <span>
              {isCorrect ? "ถูกต้อง! " : "ยังไม่ถูก — "}
              {trick === "same-denominator" &&
                `ตัวส่วนเท่ากัน (${challenge.left.d}) จึงดูตัวเศษ: ${challenge.left.n} ${SIGN_TEXT(answer)} ${challenge.right.n}`}
              {trick === "same-numerator" &&
                `ตัวเศษเท่ากัน (${challenge.left.n}) ตัวส่วนน้อยกว่าค่ามากกว่า: ${challenge.left.d} ช่อง เทียบ ${challenge.right.d} ช่อง`}
              {trick === "benchmark" &&
                `ครึ่งหนึ่งของ ${challenge.left.d} คือ ${challenge.left.d / 2} — ตัวเศษ ${challenge.left.n} ${challenge.left.n > challenge.left.d / 2 ? "มากกว่า" : challenge.left.n < challenge.left.d / 2 ? "น้อยกว่า" : "เท่ากับ"}ครึ่ง จึง ${answer} 1/2`}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}

function SIGN_TEXT(sign: Sign): string {
  return sign === ">" ? "มากกว่า" : sign === "<" ? "น้อยกว่า" : "เท่ากับ";
}

export function ThreeTricks() {
  const [active, setActive] = useState<TrickId>("same-denominator");
  const activeTrick = TRICKS.find((t) => t.id === active)!;

  return (
    <Card className="overflow-hidden rounded-3xl p-0 shadow-sm">
      <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-green-500 px-6 py-5 text-white">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20 text-lg font-extrabold">3</span>
        <div>
          <h2 className="text-2xl font-extrabold">3 เคล็ดลับเปรียบเทียบ</h2>
          <p className="mt-0.5 text-sm font-bold text-emerald-100">เลือกเคล็ดลับให้เหมาะกับโจทย์ แล้วลองฝึกทันที</p>
        </div>
      </div>

      <div className="space-y-5 p-6">
        {/* แท็บเลือกเคล็ดลับ */}
        <div className="grid gap-3 sm:grid-cols-3">
          {TRICKS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={cn(
                "rounded-2xl border-2 p-4 text-left transition",
                active === t.id ? t.activeClass : "border-slate-200 bg-white hover:border-slate-300"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl" aria-hidden>{t.icon}</span>
                <span className={cn("text-base font-extrabold", active === t.id ? t.color : "text-slate-700")}>{t.title}</span>
              </div>
            </button>
          ))}
        </div>

        {/* กฎของเคล็ดลับที่เลือก */}
        <div className={cn("rounded-2xl px-5 py-4 text-center text-base font-bold", activeTrick.activeClass, activeTrick.color)}>
          💡 {activeTrick.rule}
        </div>

        {/* ฝึกทันที — key ให้ state รีเซ็ตเมื่อสลับเคล็ดลับ */}
        <TrickPractice key={active} trick={active} />
      </div>
    </Card>
  );
}
