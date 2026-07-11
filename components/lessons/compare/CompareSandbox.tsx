"use client";

import { useEffect, useState } from "react";
import { Check, Lock, Minus, Plus, Shuffle, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FractionShape } from "@/components/fractions/FractionShape";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { cn } from "@/lib/cn";
import { gcd } from "@/lib/fractionUtils";
import { randInt } from "@/lib/randomFraction";

type Fraction = { numerator: number; denominator: number };
type View = "bar" | "circle" | "line" | "equalize";

const VIEWS: { id: View; label: string; icon: string }[] = [
  { id: "bar", label: "แท่ง", icon: "🟦" },
  { id: "circle", label: "วงกลม", icon: "🟢" },
  { id: "line", label: "เส้นจำนวน", icon: "📏" },
  { id: "equalize", label: "ทำส่วนเท่ากัน", icon: "🟰" },
];

function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}

const LEFT = 60;
const RIGHT = 840;
const USABLE = RIGHT - LEFT;
const BASE_Y = 90;

/** เส้นจำนวนใหญ่แบบจอทีวี — วางจุด 2 จุดบนเส้นเดียวกันให้เทียบตำแหน่งซ้าย-ขวาได้ทันที */
function TwoPointLine({ left, right }: { left: Fraction; right: Fraction }) {
  const lv = left.numerator / left.denominator;
  const rv = right.numerator / right.denominator;
  const points = [
    { v: lv, color: "#0ea5e9", above: true, f: left },
    { v: rv, color: "#10b981", above: false, f: right },
  ];
  return (
    <svg viewBox="0 0 900 200" className="mx-auto h-40 w-full max-w-3xl sm:h-48" role="img" aria-label="เส้นจำนวนเปรียบเทียบสองจุด">
      <line x1={LEFT - 30} y1={BASE_Y} x2={RIGHT + 30} y2={BASE_Y} stroke="#334155" strokeWidth={5} strokeLinecap="round" />
      <polygon points={`${LEFT - 30},${BASE_Y} ${LEFT - 12},${BASE_Y - 10} ${LEFT - 12},${BASE_Y + 10}`} fill="#334155" />
      <polygon points={`${RIGHT + 30},${BASE_Y} ${RIGHT + 12},${BASE_Y - 10} ${RIGHT + 12},${BASE_Y + 10}`} fill="#334155" />
      {[0, 1].map((w) => {
        const x = LEFT + w * USABLE;
        return (
          <g key={w}>
            <line x1={x} y1={BASE_Y - 20} x2={x} y2={BASE_Y + 20} stroke="#334155" strokeWidth={4} />
            <text x={x} y={BASE_Y + 52} textAnchor="middle" fontSize={30} fontWeight={800} fill="#1e1b4b">{w}</text>
          </g>
        );
      })}
      {points.map((p, i) => {
        const x = LEFT + p.v * USABLE;
        const labelY = p.above ? BASE_Y - 46 : BASE_Y + 46;
        return (
          <g key={i}>
            <line x1={x} y1={BASE_Y} x2={x} y2={p.above ? BASE_Y - 26 : BASE_Y + 26} stroke={p.color} strokeWidth={3.5} strokeDasharray="5 5" />
            <rect x={x - 28} y={labelY - 30} width={56} height={60} rx={12} fill={p.color} />
            <text x={x} y={labelY - 6} textAnchor="middle" fontSize={22} fontWeight={800} fill="#fff">{p.f.numerator}</text>
            <line x1={x - 15} y1={labelY + 2} x2={x + 15} y2={labelY + 2} stroke="#fff" strokeWidth={2} />
            <text x={x} y={labelY + 26} textAnchor="middle" fontSize={22} fontWeight={800} fill="#fff">{p.f.denominator}</text>
            <circle cx={x} cy={BASE_Y} r={13} fill={p.color} stroke="#fff" strokeWidth={4} />
          </g>
        );
      })}
    </svg>
  );
}

/** ปุ่มปรับค่าตัวใหญ่ เหมาะกับจอทีวี */
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
          onClick={() => onChange(value - 1)}
          disabled={value <= min}
          aria-label={`ลด${label}`}
          className={cn("grid h-11 w-11 place-items-center rounded-xl text-white shadow-sm transition active:scale-95 disabled:opacity-30", color)}
        >
          <Minus size={22} strokeWidth={3} />
        </button>
        <span className="w-8 text-center text-xl font-extrabold text-slate-700">{value}</span>
        <button
          onClick={() => onChange(value + 1)}
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

function Picker({
  fraction,
  onChange,
  color,
  buttonColor,
}: {
  fraction: Fraction;
  onChange: (f: Fraction) => void;
  color: string;
  buttonColor: string;
}) {
  function setNum(n: number) {
    onChange({ ...fraction, numerator: Math.max(1, Math.min(n, fraction.denominator - 1)) });
  }
  function setDen(d: number) {
    const dd = Math.max(2, Math.min(d, 9));
    onChange({ denominator: dd, numerator: Math.min(fraction.numerator, dd - 1) });
  }
  return (
    <div className="flex flex-col items-center gap-3">
      <StackedFraction numerator={fraction.numerator} denominator={fraction.denominator} className="text-5xl sm:text-6xl" toneClassName={color} />
      <div className="w-full space-y-2">
        <BigStepper label="ตัวเศษ" value={fraction.numerator} min={1} max={fraction.denominator - 1} onChange={setNum} color={buttonColor} />
        <BigStepper label="ตัวส่วน" value={fraction.denominator} min={2} max={9} onChange={setDen} color={buttonColor} />
      </div>
    </div>
  );
}

/** แท่งแนวตั้งเล็ก แบ่งชั้นตามตัวส่วน กรอบสูงเท่ากันเสมอ (แทนค่า "1 ทั้งหมด") */
function MiniBar({ fraction, fillHex }: { fraction: Fraction; fillHex: string }) {
  const pct = (fraction.numerator / fraction.denominator) * 100;
  return (
    <div className="relative h-28 w-10 sm:h-32 sm:w-12">
      <div className="absolute inset-0 overflow-hidden rounded-lg border-[3px] border-slate-700 bg-white shadow-inner">
        <div className="absolute inset-x-0 bottom-0" style={{ height: `${pct}%`, backgroundColor: fillHex }} />
        <div className="absolute inset-0 flex flex-col-reverse">
          {Array.from({ length: fraction.denominator }, (_, i) => (
            <div key={i} className="flex-1 border-t-2 border-slate-500 last:border-t-0" />
          ))}
        </div>
      </div>
    </div>
  );
}

const EMPTY_VIEWED: Record<View, boolean> = { bar: false, circle: false, line: false, equalize: false };

export function CompareSandbox() {
  const [left, setLeftState] = useState<Fraction>({ numerator: 2, denominator: 3 });
  const [right, setRightState] = useState<Fraction>({ numerator: 3, denominator: 4 });
  const [view, setView] = useState<View>("bar");
  const [viewed, setViewed] = useState<Record<View, boolean>>({ bar: true, circle: false, line: false, equalize: false });

  const allViewed = VIEWS.every((v) => viewed[v.id]);

  useEffect(() => {
    setViewed((prev) => ({ ...prev, [view]: true }));
  }, [view]);

  const leftNum = left.numerator;
  const leftDen = left.denominator;
  const rightNum = right.numerator;
  const rightDen = right.denominator;
  const cross = leftNum * rightDen - rightNum * leftDen;
  const sign = cross > 0 ? ">" : cross < 0 ? "<" : "=";

  const commonDen = lcm(left.denominator, right.denominator);
  const leftNewNum = left.numerator * (commonDen / left.denominator);
  const rightNewNum = right.numerator * (commonDen / right.denominator);

  function setLeft(f: Fraction) {
    setLeftState(f);
    setViewed({ ...EMPTY_VIEWED, [view]: true });
  }
  function setRight(f: Fraction) {
    setRightState(f);
    setViewed({ ...EMPTY_VIEWED, [view]: true });
  }

  function randomize() {
    const d1 = randInt(2, 8);
    const d2 = randInt(2, 8);
    setLeftState({ denominator: d1, numerator: randInt(1, d1 - 1) });
    setRightState({ denominator: d2, numerator: randInt(1, d2 - 1) });
    setViewed({ ...EMPTY_VIEWED, [view]: true });
  }

  return (
    <Card className="overflow-hidden rounded-3xl p-0 shadow-sm">
      <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-green-500 px-6 py-5 text-white">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20 text-lg font-extrabold">6</span>
        <div>
          <h2 className="text-2xl font-extrabold sm:text-3xl">ห้องทดลองเทียบเศษส่วน</h2>
          <p className="mt-0.5 text-sm font-bold text-emerald-100 sm:text-base">ใส่เศษส่วนอะไรก็ได้ แล้วเปิดดูให้ครบ 4 มุมมอง — ทุกวิธีต้องให้คำตอบเดียวกัน!</p>
        </div>
      </div>

      <div className="space-y-5 bg-gradient-to-b from-emerald-50/40 to-white p-5 sm:p-6">
        {/* เลือกโจทย์ */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-4">
            <Picker fraction={left} onChange={setLeft} color="text-sky-600" buttonColor="bg-sky-500 hover:bg-sky-600" />
          </div>
          <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/60 p-4">
            <Picker fraction={right} onChange={setRight} color="text-emerald-600" buttonColor="bg-emerald-500 hover:bg-emerald-600" />
          </div>
        </div>

        <div className="flex justify-center">
          <button onClick={randomize} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50">
            <Shuffle size={15} /> สุ่มเศษส่วนใหม่
          </button>
        </div>

        {/* แท็บมุมมอง + checklist สำรวจ */}
        <div className="flex flex-wrap justify-center gap-2">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={cn(
                "relative flex items-center gap-1.5 rounded-xl border-2 px-4 py-2.5 text-sm font-extrabold transition sm:text-base",
                view === v.id ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-500 hover:border-emerald-200"
              )}
            >
              <span aria-hidden>{v.icon}</span> {v.label}
              {viewed[v.id] && (
                <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-white">
                  <Check size={13} strokeWidth={3} />
                </span>
              )}
            </button>
          ))}
        </div>
        <p className="text-center text-xs font-bold text-slate-400">
          สำรวจแล้ว {VIEWS.filter((v) => viewed[v.id]).length}/4 มุมมอง{!allViewed && " — เปิดดูให้ครบเพื่อปลดล็อกสรุปคำตอบ"}
        </p>

        {/* พื้นที่แสดงผลตามมุมมอง */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          {view === "bar" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <FractionShape numerator={left.numerator} denominator={left.denominator} shape="bar" tone="sky" className="h-14 w-full" />
                <StackedFraction numerator={left.numerator} denominator={left.denominator} className="shrink-0 text-2xl" toneClassName="text-sky-600" />
              </div>
              <div className="flex items-center gap-3">
                <FractionShape numerator={right.numerator} denominator={right.denominator} shape="bar" tone="emerald" className="h-14 w-full" />
                <StackedFraction numerator={right.numerator} denominator={right.denominator} className="shrink-0 text-2xl" toneClassName="text-emerald-600" />
              </div>
              <p className="text-center text-sm font-bold text-slate-500 sm:text-base">แท่งที่ระบายยาวกว่า มีค่ามากกว่า</p>
            </div>
          )}

          {view === "circle" && (
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
              <div className="flex flex-col items-center gap-2">
                <FractionShape numerator={left.numerator} denominator={left.denominator} tone="sky" className="h-36 w-36 sm:h-44 sm:w-44" />
                <StackedFraction numerator={left.numerator} denominator={left.denominator} className="text-3xl" toneClassName="text-sky-600" />
              </div>
              <span className="text-4xl font-extrabold text-slate-400">{sign}</span>
              <div className="flex flex-col items-center gap-2">
                <FractionShape numerator={right.numerator} denominator={right.denominator} tone="emerald" className="h-36 w-36 sm:h-44 sm:w-44" />
                <StackedFraction numerator={right.numerator} denominator={right.denominator} className="text-3xl" toneClassName="text-emerald-600" />
              </div>
            </div>
          )}

          {view === "line" && (
            <div>
              <TwoPointLine left={left} right={right} />
              <p className="mt-2 text-center text-sm font-bold text-slate-500 sm:text-base">จุดที่อยู่ทางขวามากกว่า มีค่ามากกว่า</p>
            </div>
          )}

          {view === "equalize" && (
            <div className="space-y-4 text-center">
              <p className="text-sm font-bold text-slate-600 sm:text-base">
                ทำตัวส่วนทั้งคู่ให้เป็น <span className="text-lg font-extrabold text-amber-600">{commonDen}</span>
              </p>
              <div className="flex flex-wrap items-end justify-center gap-6 sm:gap-10">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="flex items-end gap-2">
                    <MiniBar fraction={left} fillHex="#38bdf8" />
                    <MiniBar fraction={{ numerator: leftNewNum, denominator: commonDen }} fillHex="#38bdf8" />
                  </div>
                  <span className="flex items-center gap-1.5 text-sm font-bold text-slate-500">
                    <StackedFraction numerator={left.numerator} denominator={left.denominator} className="text-base" toneClassName="text-sky-600" />
                    =
                    <StackedFraction numerator={leftNewNum} denominator={commonDen} className="text-lg" toneClassName="text-sky-600" />
                  </span>
                </div>
                <span className="pb-6 text-3xl font-extrabold text-emerald-600">{sign}</span>
                <div className="flex flex-col items-center gap-1.5">
                  <div className="flex items-end gap-2">
                    <MiniBar fraction={right} fillHex="#34d399" />
                    <MiniBar fraction={{ numerator: rightNewNum, denominator: commonDen }} fillHex="#34d399" />
                  </div>
                  <span className="flex items-center gap-1.5 text-sm font-bold text-slate-500">
                    <StackedFraction numerator={right.numerator} denominator={right.denominator} className="text-base" toneClassName="text-emerald-600" />
                    =
                    <StackedFraction numerator={rightNewNum} denominator={commonDen} className="text-lg" toneClassName="text-emerald-600" />
                  </span>
                </div>
              </div>
              <p className="text-sm font-bold text-slate-500 sm:text-base">ตัวส่วนเท่ากันแล้ว เทียบตัวเศษ: {leftNewNum} {sign} {rightNewNum}</p>
            </div>
          )}
        </div>

        {/* สรุปผลรวม — ปลดล็อกเมื่อสำรวจครบ 4 มุมมอง */}
        {allViewed ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-4 text-emerald-700 sm:flex-row sm:justify-center sm:gap-4">
            <span className="flex items-center gap-1.5 text-base font-extrabold sm:text-lg">
              <Sparkles size={20} /> สรุปคำตอบ:
            </span>
            <span className="flex items-center gap-3">
              <StackedFraction numerator={left.numerator} denominator={left.denominator} className="text-2xl sm:text-3xl" toneClassName="text-sky-600" />
              <span className="text-3xl font-extrabold sm:text-4xl">{sign}</span>
              <StackedFraction numerator={right.numerator} denominator={right.denominator} className="text-2xl sm:text-3xl" toneClassName="text-emerald-600" />
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-slate-400">
            <Lock size={18} />
            <span className="text-sm font-bold sm:text-base">เปิดดูให้ครบ 4 มุมมองก่อน แล้วสรุปคำตอบจะปรากฏที่นี่</span>
          </div>
        )}
      </div>
    </Card>
  );
}
