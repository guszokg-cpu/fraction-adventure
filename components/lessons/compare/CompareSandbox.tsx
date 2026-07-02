"use client";

import { useState } from "react";
import { Minus, Plus, Shuffle } from "lucide-react";
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

const LEFT = 30;
const RIGHT = 290;
const USABLE = RIGHT - LEFT;
const BASE_Y = 56;

/** เส้นจำนวน 2 จุดแบบไดนามิก */
function TwoPointLine({ left, right }: { left: Fraction; right: Fraction }) {
  const lv = left.numerator / left.denominator;
  const rv = right.numerator / right.denominator;
  const points = [
    { v: lv, color: "#0ea5e9", above: true, f: left },
    { v: rv, color: "#10b981", above: false, f: right },
  ];
  return (
    <svg viewBox="0 0 320 100" className="mx-auto h-32 w-full max-w-2xl" role="img" aria-label="เส้นจำนวนเปรียบเทียบสองจุด">
      <line x1={LEFT - 12} y1={BASE_Y} x2={RIGHT + 12} y2={BASE_Y} stroke="#334155" strokeWidth={2.4} strokeLinecap="round" />
      <polygon points={`${LEFT - 12},${BASE_Y} ${LEFT - 4},${BASE_Y - 4.5} ${LEFT - 4},${BASE_Y + 4.5}`} fill="#334155" />
      <polygon points={`${RIGHT + 12},${BASE_Y} ${RIGHT + 4},${BASE_Y - 4.5} ${RIGHT + 4},${BASE_Y + 4.5}`} fill="#334155" />
      {[0, 1].map((w) => {
        const x = LEFT + w * USABLE;
        return (
          <g key={w}>
            <line x1={x} y1={BASE_Y - 10} x2={x} y2={BASE_Y + 10} stroke="#334155" strokeWidth={2.2} />
            <text x={x} y={BASE_Y + 26} textAnchor="middle" fontSize={13} fontWeight={800} fill="#1e1b4b">{w}</text>
          </g>
        );
      })}
      {points.map((p, i) => {
        const x = LEFT + p.v * USABLE;
        const labelY = p.above ? BASE_Y - 22 : BASE_Y + 22;
        return (
          <g key={i}>
            <line x1={x} y1={BASE_Y} x2={x} y2={p.above ? BASE_Y - 14 : BASE_Y + 14} stroke={p.color} strokeWidth={2} strokeDasharray="3 3" />
            <rect x={x - 11} y={labelY - 12} width={22} height={24} rx={6} fill={p.color} />
            <text x={x} y={labelY - 2} textAnchor="middle" fontSize={9} fontWeight={800} fill="#fff">{p.f.numerator}</text>
            <line x1={x - 6} y1={labelY + 1} x2={x + 6} y2={labelY + 1} stroke="#fff" strokeWidth={1} />
            <text x={x} y={labelY + 11} textAnchor="middle" fontSize={9} fontWeight={800} fill="#fff">{p.f.denominator}</text>
            <circle cx={x} cy={BASE_Y} r={7} fill={p.color} stroke="#fff" strokeWidth={2.4} />
          </g>
        );
      })}
    </svg>
  );
}

function Picker({ fraction, onChange, color }: { fraction: Fraction; onChange: (f: Fraction) => void; color: string }) {
  function setNum(n: number) {
    onChange({ ...fraction, numerator: Math.max(1, Math.min(n, fraction.denominator - 1)) });
  }
  function setDen(d: number) {
    const dd = Math.max(2, Math.min(d, 9));
    onChange({ denominator: dd, numerator: Math.min(fraction.numerator, dd - 1) });
  }
  return (
    <div className="flex items-center gap-3">
      <StackedFraction numerator={fraction.numerator} denominator={fraction.denominator} className="text-3xl" toneClassName={color} />
      <div className="space-y-1">
        <div className="flex items-center gap-1">
          <span className="w-9 text-[11px] font-bold text-slate-400">เศษ</span>
          <button onClick={() => setNum(fraction.numerator - 1)} className="grid h-6 w-6 place-items-center rounded bg-slate-100 hover:bg-slate-200"><Minus size={12} /></button>
          <button onClick={() => setNum(fraction.numerator + 1)} className="grid h-6 w-6 place-items-center rounded bg-slate-100 hover:bg-slate-200"><Plus size={12} /></button>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-9 text-[11px] font-bold text-slate-400">ส่วน</span>
          <button onClick={() => setDen(fraction.denominator - 1)} className="grid h-6 w-6 place-items-center rounded bg-slate-100 hover:bg-slate-200"><Minus size={12} /></button>
          <button onClick={() => setDen(fraction.denominator + 1)} className="grid h-6 w-6 place-items-center rounded bg-slate-100 hover:bg-slate-200"><Plus size={12} /></button>
        </div>
      </div>
    </div>
  );
}

export function CompareSandbox() {
  const [left, setLeft] = useState<Fraction>({ numerator: 2, denominator: 3 });
  const [right, setRight] = useState<Fraction>({ numerator: 3, denominator: 4 });
  const [view, setView] = useState<View>("bar");

  const lv = left.numerator / left.denominator;
  const rv = right.numerator / right.denominator;
  const sign = lv > rv ? ">" : lv < rv ? "<" : "=";

  const commonDen = lcm(left.denominator, right.denominator);
  const leftNewNum = left.numerator * (commonDen / left.denominator);
  const rightNewNum = right.numerator * (commonDen / right.denominator);

  function randomize() {
    const d1 = randInt(2, 8);
    const d2 = randInt(2, 8);
    setLeft({ denominator: d1, numerator: randInt(1, d1 - 1) });
    setRight({ denominator: d2, numerator: randInt(1, d2 - 1) });
  }

  return (
    <Card className="overflow-hidden rounded-3xl p-0 shadow-sm">
      <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-green-500 px-6 py-5 text-white">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20 text-lg font-extrabold">6</span>
        <div>
          <h2 className="text-2xl font-extrabold">ห้องทดลองเทียบเศษส่วน</h2>
          <p className="mt-0.5 text-sm font-bold text-emerald-100">ใส่เศษส่วนอะไรก็ได้ แล้วสลับดูได้ทุกมุม ทุกวิธีให้คำตอบเดียวกัน!</p>
        </div>
      </div>

      <div className="space-y-5 p-6">
        {/* เลือกโจทย์ + ผลลัพธ์ */}
        <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
          <div className="rounded-2xl border border-sky-100 bg-sky-50/40 p-4">
            <Picker fraction={left} onChange={setLeft} color="text-sky-600" />
          </div>
          <div className="grid h-14 w-14 place-items-center justify-self-center rounded-full bg-emerald-500 text-3xl font-extrabold text-white">{sign}</div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
            <Picker fraction={right} onChange={setRight} color="text-emerald-600" />
          </div>
        </div>

        <div className="flex justify-center">
          <button onClick={randomize} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-500 transition hover:bg-slate-50">
            <Shuffle size={13} /> สุ่มเศษส่วน
          </button>
        </div>

        {/* แท็บมุมมอง */}
        <div className="flex flex-wrap gap-2">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-xl border-2 px-4 py-2 text-sm font-extrabold transition",
                view === v.id ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-500 hover:border-emerald-200"
              )}
            >
              <span aria-hidden>{v.icon}</span> {v.label}
            </button>
          ))}
        </div>

        {/* พื้นที่แสดงผลตามมุมมอง */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
          {view === "bar" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <FractionShape numerator={left.numerator} denominator={left.denominator} shape="bar" tone="sky" className="h-12 w-full" />
                <StackedFraction numerator={left.numerator} denominator={left.denominator} className="shrink-0 text-lg" toneClassName="text-sky-600" />
              </div>
              <div className="flex items-center gap-3">
                <FractionShape numerator={right.numerator} denominator={right.denominator} shape="bar" tone="emerald" className="h-12 w-full" />
                <StackedFraction numerator={right.numerator} denominator={right.denominator} className="shrink-0 text-lg" toneClassName="text-emerald-600" />
              </div>
              <p className="text-center text-sm font-bold text-slate-500">แท่งที่ระบายยาวกว่า มีค่ามากกว่า</p>
            </div>
          )}

          {view === "circle" && (
            <div className="flex flex-wrap items-center justify-center gap-6">
              <div className="flex flex-col items-center gap-2">
                <FractionShape numerator={left.numerator} denominator={left.denominator} tone="sky" className="h-28 w-28" />
                <StackedFraction numerator={left.numerator} denominator={left.denominator} className="text-xl" toneClassName="text-sky-600" />
              </div>
              <span className="text-3xl font-extrabold text-slate-400">{sign}</span>
              <div className="flex flex-col items-center gap-2">
                <FractionShape numerator={right.numerator} denominator={right.denominator} tone="emerald" className="h-28 w-28" />
                <StackedFraction numerator={right.numerator} denominator={right.denominator} className="text-xl" toneClassName="text-emerald-600" />
              </div>
            </div>
          )}

          {view === "line" && (
            <div>
              <TwoPointLine left={left} right={right} />
              <p className="mt-2 text-center text-sm font-bold text-slate-500">จุดที่อยู่ทางขวามากกว่า มีค่ามากกว่า</p>
            </div>
          )}

          {view === "equalize" && (
            <div className="space-y-3 text-center">
              <p className="text-sm font-bold text-slate-600">
                ทำตัวส่วนทั้งคู่ให้เป็น <span className="font-extrabold text-amber-600">{commonDen}</span>
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <span className="flex items-center gap-1.5">
                  <StackedFraction numerator={left.numerator} denominator={left.denominator} className="text-lg" toneClassName="text-sky-600" />
                  <span className="text-slate-400">=</span>
                  <StackedFraction numerator={leftNewNum} denominator={commonDen} className="text-2xl" toneClassName="text-sky-600" />
                </span>
                <span className="text-2xl font-extrabold text-emerald-600">{sign}</span>
                <span className="flex items-center gap-1.5">
                  <StackedFraction numerator={rightNewNum} denominator={commonDen} className="text-2xl" toneClassName="text-emerald-600" />
                  <span className="text-slate-400">=</span>
                  <StackedFraction numerator={right.numerator} denominator={right.denominator} className="text-lg" toneClassName="text-emerald-600" />
                </span>
              </div>
              <p className="text-sm font-bold text-slate-500">ตัวส่วนเท่ากันแล้ว เทียบตัวเศษ: {leftNewNum} {sign} {rightNewNum}</p>
            </div>
          )}
        </div>

        {/* สรุปผลรวม */}
        <div className="flex items-center justify-center gap-3 rounded-xl bg-emerald-50 px-4 py-3 text-emerald-700">
          <span className="text-base font-extrabold">คำตอบ:</span>
          <StackedFraction numerator={left.numerator} denominator={left.denominator} className="text-xl" toneClassName="text-emerald-700" />
          <span className="text-2xl font-extrabold">{sign}</span>
          <StackedFraction numerator={right.numerator} denominator={right.denominator} className="text-xl" toneClassName="text-emerald-700" />
        </div>
      </div>
    </Card>
  );
}
