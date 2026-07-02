"use client";

import { useState } from "react";
import { ArrowRight, Cog, Minus, Plus, RotateCcw, Shuffle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FractionShape } from "@/components/fractions/FractionShape";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { cn } from "@/lib/cn";
import { gcd } from "@/lib/fractionUtils";
import { randInt } from "@/lib/randomFraction";

function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}

type Fraction = { numerator: number; denominator: number };

function Picker({ fraction, onChange, color }: { fraction: Fraction; onChange: (f: Fraction) => void; color: string }) {
  function setNum(n: number) {
    onChange({ ...fraction, numerator: Math.max(1, Math.min(n, fraction.denominator - 1)) });
  }
  function setDen(d: number) {
    const dd = Math.max(2, Math.min(d, 6));
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

export function EqualizeMachine() {
  const [left, setLeft] = useState<Fraction>({ numerator: 1, denominator: 2 });
  const [right, setRight] = useState<Fraction>({ numerator: 2, denominator: 3 });
  const [stage, setStage] = useState(0); // 0=เริ่ม 1=หา ค.ร.น. 2=แปลง 3=เทียบ

  const commonDen = lcm(left.denominator, right.denominator);
  const leftFactor = commonDen / left.denominator;
  const rightFactor = commonDen / right.denominator;
  const leftNewNum = left.numerator * leftFactor;
  const rightNewNum = right.numerator * rightFactor;
  const sign = leftNewNum > rightNewNum ? ">" : leftNewNum < rightNewNum ? "<" : "=";

  function resetStage(next?: { left: Fraction; right: Fraction }) {
    if (next) {
      setLeft(next.left);
      setRight(next.right);
    }
    setStage(0);
  }

  function changeLeft(f: Fraction) {
    setLeft(f);
    setStage(0);
  }
  function changeRight(f: Fraction) {
    setRight(f);
    setStage(0);
  }

  function randomize() {
    const d1 = randInt(2, 6);
    const d2 = randInt(2, 6);
    resetStage({ left: { denominator: d1, numerator: randInt(1, d1 - 1) }, right: { denominator: d2, numerator: randInt(1, d2 - 1) } });
  }

  return (
    <Card className="overflow-hidden rounded-3xl p-0 shadow-sm">
      <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-green-500 px-6 py-5 text-white">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20 text-lg font-extrabold">5</span>
        <div>
          <h2 className="text-2xl font-extrabold">เครื่องทำส่วนเท่ากัน</h2>
          <p className="mt-0.5 text-sm font-bold text-emerald-100">วิธีที่ใช้ได้ทุกโจทย์ — ทำตัวส่วนให้เท่ากันก่อน แล้วเทียบตัวเศษ</p>
        </div>
      </div>

      <div className="space-y-5 p-6">
        {/* เลือกโจทย์ */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-sky-100 bg-sky-50/40 p-4">
            <Picker fraction={left} onChange={changeLeft} color="text-sky-600" />
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4">
            <Picker fraction={right} onChange={changeRight} color="text-emerald-600" />
          </div>
        </div>

        {/* จอเครื่อง */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
          {stage === 0 && (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <Cog size={36} className="text-slate-300" />
              <p className="text-sm font-bold text-slate-500">
                กดปุ่ม “เดินเครื่อง” เพื่อดูวิธีทำตัวส่วนของ{" "}
                <StackedFraction numerator={left.numerator} denominator={left.denominator} className="mx-1 inline-flex text-sm align-middle" toneClassName="text-sky-600" /> กับ{" "}
                <StackedFraction numerator={right.numerator} denominator={right.denominator} className="mx-1 inline-flex text-sm align-middle" toneClassName="text-emerald-600" /> ให้เท่ากัน
              </p>
            </div>
          )}

          {stage >= 1 && (
            <div className="space-y-4">
              {/* ขั้น 1: ค.ร.น. */}
              <div className="rounded-xl bg-white p-4">
                <div className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-700">ขั้นที่ 1 — หาตัวส่วนร่วม</div>
                <p className="mt-2 text-sm font-bold text-slate-600">
                  ตัวส่วนคูณร่วมน้อยของ {left.denominator} กับ {right.denominator} คือ{" "}
                  <span className="text-lg font-extrabold text-amber-600">{commonDen}</span>
                </p>
              </div>

              {/* ขั้น 2: แปลง */}
              {stage >= 2 && (
                <div className="rounded-xl bg-white p-4">
                  <div className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-extrabold text-sky-700">ขั้นที่ 2 — คูณให้ตัวส่วนเป็น {commonDen}</div>
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <StackedFraction numerator={left.numerator} denominator={left.denominator} className="text-xl" toneClassName="text-sky-600" />
                      <span className="text-xs font-bold text-slate-400">(×{leftFactor})</span>
                      <ArrowRight size={16} className="text-slate-400" />
                      <StackedFraction numerator={leftNewNum} denominator={commonDen} className="text-2xl" toneClassName="text-sky-600" />
                    </span>
                    <span className="flex items-center gap-1.5">
                      <StackedFraction numerator={right.numerator} denominator={right.denominator} className="text-xl" toneClassName="text-emerald-600" />
                      <span className="text-xs font-bold text-slate-400">(×{rightFactor})</span>
                      <ArrowRight size={16} className="text-slate-400" />
                      <StackedFraction numerator={rightNewNum} denominator={commonDen} className="text-2xl" toneClassName="text-emerald-600" />
                    </span>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <div className="flex items-center gap-2 rounded-lg border border-slate-100 p-2">
                      <FractionShape numerator={leftNewNum} denominator={commonDen} shape="bar" tone="sky" className="h-9 w-full" />
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-slate-100 p-2">
                      <FractionShape numerator={rightNewNum} denominator={commonDen} shape="bar" tone="emerald" className="h-9 w-full" />
                    </div>
                  </div>
                </div>
              )}

              {/* ขั้น 3: เทียบ */}
              {stage >= 3 && (
                <div className="rounded-xl bg-emerald-50 p-4">
                  <div className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-700">ขั้นที่ 3 — เทียบตัวเศษ</div>
                  <p className="mt-2 text-sm font-bold text-emerald-700">
                    ตัวส่วนเท่ากันแล้ว ({commonDen}) จึงเทียบตัวเศษ: {leftNewNum} {sign === ">" ? "มากกว่า" : sign === "<" ? "น้อยกว่า" : "เท่ากับ"} {rightNewNum}
                  </p>
                  <div className="mt-3 flex items-center justify-center gap-3">
                    <StackedFraction numerator={left.numerator} denominator={left.denominator} className="text-2xl" toneClassName="text-sky-600" />
                    <span className="text-3xl font-extrabold text-emerald-700">{sign}</span>
                    <StackedFraction numerator={right.numerator} denominator={right.denominator} className="text-2xl" toneClassName="text-emerald-600" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ปุ่มควบคุม */}
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {stage < 3 ? (
            <button onClick={() => setStage((s) => s + 1)} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-base font-extrabold text-white transition hover:bg-emerald-700 active:scale-[0.98]">
              <Cog size={18} /> {stage === 0 ? "เดินเครื่อง" : "ขั้นถัดไป"}
            </button>
          ) : (
            <button onClick={() => resetStage()} className="flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-5 py-2.5 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50">
              <RotateCcw size={15} /> ดูใหม่อีกครั้ง
            </button>
          )}
          <button onClick={randomize} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-extrabold text-slate-500 transition hover:bg-slate-50">
            <Shuffle size={13} /> สุ่มโจทย์
          </button>
        </div>
      </div>
    </Card>
  );
}
