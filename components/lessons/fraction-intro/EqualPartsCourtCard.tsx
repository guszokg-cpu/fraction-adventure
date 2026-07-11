"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { FractionShape } from "@/components/fractions/FractionShape";
import { randInt } from "@/lib/randomFraction";
import { cn } from "@/lib/cn";
import type { FractionShapeKind } from "@/types/lessonContent";

const STROKE = "#94a3b8";
const FILL_A = "#fb923c";
const FILL_B = "#fed7aa";

function polar(deg: number) {
  const a = ((deg - 90) * Math.PI) / 180;
  return [50 + 46 * Math.cos(a), 50 + 46 * Math.sin(a)] as const;
}

/* ── ภาพ "แบ่งไม่เท่า" แบบสุ่ม เพื่อให้เล่นซ้ำได้ไม่จำเฉลย ── */

function RandomUnequalCircle({ angles }: { angles: number[] }) {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label="วงกลมแบ่งไม่เท่ากัน">
      {angles.slice(0, -1).map((start, i) => {
        const end = angles[i + 1];
        const [x1, y1] = polar(start);
        const [x2, y2] = polar(end);
        const large = end - start > 180 ? 1 : 0;
        const d = `M50 50 L ${x1.toFixed(2)} ${y1.toFixed(2)} A 46 46 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
        return <path key={i} d={d} fill={i % 2 ? FILL_B : FILL_A} stroke={STROKE} strokeWidth={1.5} />;
      })}
    </svg>
  );
}

function RandomUnequalBar({ widths }: { widths: number[] }) {
  let acc = 0;
  return (
    <svg viewBox="0 0 100 34" className="h-full w-full" role="img" aria-label="แท่งแบ่งไม่เท่ากัน">
      {widths.map((w, i) => {
        const x = acc;
        acc += w;
        return <rect key={i} x={x} y={2} width={w} height={30} fill={i % 2 ? FILL_B : FILL_A} stroke={STROKE} strokeWidth={1.2} />;
      })}
    </svg>
  );
}

function RandomUnequalGrid({ splitX, splitY }: { splitX: number; splitY: number }) {
  const cells = [
    { x: 0, y: 0, w: splitX, h: splitY },
    { x: splitX, y: 0, w: 100 - splitX, h: splitY },
    { x: 0, y: splitY, w: 100 - splitX, h: 100 - splitY },
    { x: 100 - splitX, y: splitY, w: splitX, h: 100 - splitY },
  ];
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label="ตารางแบ่งไม่เท่ากัน">
      {cells.map((c, i) => (
        <rect key={i} x={c.x} y={c.y} width={c.w} height={c.h} fill={i % 2 ? FILL_B : FILL_A} stroke={STROKE} strokeWidth={1.4} />
      ))}
    </svg>
  );
}

/* ── สุ่มคดี ── */

type EqualCase = { kind: "equal"; shape: FractionShapeKind; num: number; den: number; parts: number };
type UnequalCase =
  | { kind: "unequal"; variant: "circle"; angles: number[]; parts: number }
  | { kind: "unequal"; variant: "bar"; widths: number[]; parts: number }
  | { kind: "unequal"; variant: "grid"; splitX: number; splitY: number; parts: number };
type CourtCase = EqualCase | UnequalCase;

const EQUAL_SHAPES: FractionShapeKind[] = ["circle", "bar", "grid", "pizza", "chocolate"];

function makeCase(): CourtCase {
  if (Math.random() < 0.5) {
    const shape = EQUAL_SHAPES[randInt(0, EQUAL_SHAPES.length - 1)];
    const dens = shape === "grid" ? [4, 6, 9] : [2, 3, 4, 5, 6, 8];
    const den = dens[randInt(0, dens.length - 1)];
    return { kind: "equal", shape, num: randInt(1, den - 1), den, parts: den };
  }
  const variant = (["circle", "bar", "grid"] as const)[randInt(0, 2)];
  if (variant === "circle") {
    // เริ่มจากแบ่งเท่า แล้วดันเส้นแบ่ง 1 เส้นแรง ๆ → ไม่เท่าชัดเจนเสมอ
    const n = randInt(3, 4);
    const base = 360 / n;
    const angles = Array.from({ length: n + 1 }, (_, i) => i * base);
    const idx = randInt(1, n - 1);
    const shift = base * (randInt(35, 55) / 100) * (Math.random() < 0.5 ? -1 : 1);
    angles[idx] += shift;
    return { kind: "unequal", variant, angles, parts: n };
  }
  if (variant === "bar") {
    const n = randInt(3, 4);
    const base = 100 / n;
    const edges = Array.from({ length: n + 1 }, (_, i) => i * base);
    const idx = randInt(1, n - 1);
    const shift = base * (randInt(35, 55) / 100) * (Math.random() < 0.5 ? -1 : 1);
    edges[idx] += shift;
    const widths = edges.slice(1).map((e, i) => e - edges[i]);
    return { kind: "unequal", variant, widths, parts: n };
  }
  return { kind: "unequal", variant, splitX: randInt(25, 42), splitY: randInt(28, 45), parts: 4 };
}

export function EqualPartsCourtCard() {
  const [courtCase, setCourtCase] = useState<CourtCase>(() => makeCase());
  const [verdict, setVerdict] = useState<"equal" | "unequal" | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);

  const answered = verdict !== null;
  const isCorrect = answered && verdict === courtCase.kind;

  function judge(v: "equal" | "unequal") {
    if (answered) return;
    setVerdict(v);
    setTotal((t) => t + 1);
    if (v === courtCase.kind) {
      setScore((s) => s + 1);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
  }

  function next() {
    setCourtCase(makeCase());
    setVerdict(null);
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center justify-between bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2.5 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white/25 text-sm font-extrabold">6</span>
          <h2 className="text-lg font-extrabold">ศาลเศษส่วน: เท่าหรือไม่เท่า? ⚖️</h2>
        </div>
        <div className="flex items-center gap-2 text-xs font-extrabold">
          <span className="rounded-full bg-white/20 px-3 py-1">ถูก {score}/{total}</span>
          {streak >= 2 && <span className="rounded-full bg-white/20 px-3 py-1">🔥 {streak}</span>}
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-6">
        {/* กติกาสั้น ๆ */}
        <div className="rounded-2xl border-2 border-emerald-100 bg-emerald-50/50 px-4 py-3 text-center text-sm font-extrabold text-emerald-800 sm:text-base">
          จะเขียนเป็นเศษส่วนได้ <span className="underline decoration-wavy">ทุกส่วนต้องมีขนาดเท่ากัน</span> —
          ท่านผู้พิพากษา โปรดตัดสินรูปนี้!
        </div>

        {/* หลักฐานคดี */}
        <div className="mx-auto grid h-44 w-full max-w-xs place-items-center rounded-2xl border-2 border-slate-100 bg-white p-4">
          <div className={cn("mx-auto", courtCase.kind === "unequal" && courtCase.variant === "bar" ? "h-16 w-full max-w-[240px]" : courtCase.kind === "equal" && courtCase.shape === "bar" ? "h-12 w-full max-w-[240px]" : "h-36 w-36")}>
            {courtCase.kind === "equal" ? (
              <FractionShape numerator={courtCase.num} denominator={courtCase.den} shape={courtCase.shape} tone="accent" className="h-full w-full" />
            ) : courtCase.variant === "circle" ? (
              <RandomUnequalCircle angles={courtCase.angles} />
            ) : courtCase.variant === "bar" ? (
              <RandomUnequalBar widths={courtCase.widths} />
            ) : (
              <RandomUnequalGrid splitX={courtCase.splitX} splitY={courtCase.splitY} />
            )}
          </div>
        </div>

        {/* ปุ่มตัดสิน */}
        {!answered ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => judge("equal")}
              className="flex h-16 items-center justify-center gap-2 rounded-2xl border-2 border-emerald-300 bg-emerald-50 text-lg font-extrabold text-emerald-700 transition hover:bg-emerald-100 active:scale-[0.97] sm:text-xl"
            >
              ✅ แบ่งเท่ากัน
            </button>
            <button
              onClick={() => judge("unequal")}
              className="flex h-16 items-center justify-center gap-2 rounded-2xl border-2 border-rose-300 bg-rose-50 text-lg font-extrabold text-rose-600 transition hover:bg-rose-100 active:scale-[0.97] sm:text-xl"
            >
              ❌ แบ่งไม่เท่า
            </button>
          </div>
        ) : (
          <div
            className={cn(
              "rounded-2xl border-2 p-4 text-center",
              isCorrect ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"
            )}
          >
            <p className={cn("text-lg font-extrabold sm:text-xl", isCorrect ? "text-emerald-700" : "text-rose-600")}>
              {isCorrect ? "⚖️ ตัดสินถูกต้อง!" : "ตัดสินพลาด!"}
            </p>
            <p className="mt-1 text-sm font-bold text-slate-600 sm:text-base">
              {courtCase.kind === "equal"
                ? `รูปนี้แบ่งเป็น ${courtCase.parts} ส่วนเท่า ๆ กัน → เขียนเป็นเศษส่วนได้`
                : `รูปนี้แบ่งเป็น ${courtCase.parts} ส่วนก็จริง แต่ขนาดไม่เท่ากัน → ยังเขียนเป็นเศษส่วนไม่ได้`}
            </p>
            <button
              onClick={next}
              className="mt-3 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-extrabold text-white shadow transition hover:bg-emerald-700 active:scale-[0.98] sm:text-base"
            >
              คดีต่อไป →
            </button>
          </div>
        )}

        <p className="text-center text-sm font-bold text-slate-500">
          เคล็ดลับ: อย่านับแค่จำนวนส่วน — ดูด้วยว่าทุกส่วน<span className="text-emerald-700">ขนาดเท่ากัน</span>หรือไม่
        </p>
      </div>
    </Card>
  );
}
