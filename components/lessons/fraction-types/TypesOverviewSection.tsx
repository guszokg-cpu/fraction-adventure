"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionStack } from "@/components/fractions/FractionStack";
import { cn } from "@/lib/cn";

type TypeInfo = {
  id: "proper" | "improper" | "mixed";
  title: string;
  condition: string;
  valueNote: string;
  examples: string[];
  tone: "emerald" | "accent" | "violet";
  cardClass: string;
  headingClass: string;
  shapeNumerator: number;
  shapeDenominator: number;
  heroWhole: number;
  heroNumerator: number;
  heroDenominator: number;
};

const TYPES: TypeInfo[] = [
  {
    id: "proper",
    title: "เศษส่วนแท้",
    condition: "ตัวเศษน้อยกว่าตัวส่วน",
    valueNote: "มีค่าน้อยกว่า 1",
    examples: ["1/2", "3/4", "5/8"],
    tone: "emerald",
    cardClass: "border-emerald-200 bg-emerald-50/50",
    headingClass: "text-emerald-700",
    shapeNumerator: 3,
    shapeDenominator: 4,
    heroWhole: 0,
    heroNumerator: 3,
    heroDenominator: 4,
  },
  {
    id: "improper",
    title: "เศษเกิน",
    condition: "ตัวเศษมากกว่าหรือเท่ากับตัวส่วน",
    valueNote: "มีค่ามากกว่าหรือเท่ากับ 1",
    examples: ["4/4", "5/4", "7/3"],
    tone: "accent",
    cardClass: "border-amber-200 bg-amber-50/50",
    headingClass: "text-amber-700",
    shapeNumerator: 5,
    shapeDenominator: 4,
    heroWhole: 0,
    heroNumerator: 5,
    heroDenominator: 4,
  },
  {
    id: "mixed",
    title: "จำนวนคละ",
    condition: "มีจำนวนเต็มรวมกับเศษส่วนแท้",
    valueNote: "มีค่ามากกว่าหรือเท่ากับ 1",
    examples: ["1 1/2", "2 1/3", "3 2/5"],
    tone: "violet",
    cardClass: "border-violet-200 bg-violet-50/50",
    headingClass: "text-violet-700",
    shapeNumerator: 5,
    shapeDenominator: 4,
    heroWhole: 1,
    heroNumerator: 1,
    heroDenominator: 4,
  },
];

const COMPARE_ROWS = [
  { type: "เศษส่วนแท้", condition: "ตัวเศษน้อยกว่าตัวส่วน", value: "น้อยกว่า 1", pct: 40, examples: ["1/2", "3/5", "7/8"] },
  { type: "เศษเกิน", condition: "ตัวเศษมากกว่าหรือเท่ากับตัวส่วน", value: "มากกว่าหรือเท่ากับ 1", pct: 65, examples: ["4/4", "5/4", "7/3"] },
  { type: "จำนวนคละ", condition: "จำนวนเต็ม + เศษส่วนแท้", value: "มากกว่าหรือเท่ากับ 1", pct: 75, examples: ["1 1/2", "2 1/3", "3 2/5"] },
];

/** แปลงป้ายข้อความ "N/D" หรือ "W N/D" ให้เป็นตัวเลขสำหรับแสดงผลแบบเศษส่วนตั้ง */
function parseFractionLabel(label: string): { whole: number | null; numerator: number; denominator: number } {
  const parts = label.trim().split(" ");
  const fractionPart = parts.length === 2 ? parts[1] : parts[0];
  const [numerator, denominator] = fractionPart.split("/").map(Number);
  return { whole: parts.length === 2 ? Number(parts[0]) : null, numerator, denominator };
}

/** แสดงเศษส่วน (หรือจำนวนคละ) จากป้ายข้อความ โดยตัวเศษอยู่บน ตัวส่วนอยู่ล่างเสมอ */
function InlineFraction({ label, className }: { label: string; className?: string }) {
  const { whole, numerator, denominator } = parseFractionLabel(label);
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      {whole !== null && <span className="font-extrabold">{whole}</span>}
      <FractionStack top={numerator} bottom={denominator} />
    </span>
  );
}

/** เส้นจำนวน 0-2 แบบย่อ พร้อมจุดแสดงตำแหน่งคร่าว ๆ ของค่าเศษส่วนประเภทนั้น */
function MiniNumberLine({ pct }: { pct: number }) {
  return (
    <div className="relative h-2 w-full min-w-[120px] rounded-full bg-slate-200">
      <div
        className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 border-white bg-violet-500 shadow"
        style={{ left: `${pct}%` }}
      />
      <span className="absolute -bottom-4 left-0 text-[10px] font-bold text-slate-400">0</span>
      <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400">1</span>
      <span className="absolute -bottom-4 right-0 text-[10px] font-bold text-slate-400">2</span>
    </div>
  );
}

const CLASSIFY_CHIPS: { label: string; answer: string; tone: string }[] = [
  { label: "3/5", answer: "เศษส่วนแท้", tone: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { label: "5/4", answer: "เศษเกิน", tone: "text-amber-600 bg-amber-50 border-amber-200" },
  { label: "1 2/3", answer: "จำนวนคละ", tone: "text-violet-600 bg-violet-50 border-violet-200" },
  { label: "2/7", answer: "เศษส่วนแท้", tone: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { label: "8/8", answer: "เศษเกิน", tone: "text-amber-600 bg-amber-50 border-amber-200" },
  { label: "2 1/4", answer: "จำนวนคละ", tone: "text-violet-600 bg-violet-50 border-violet-200" },
];

export function TypesOverviewSection() {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  return (
    <div className="space-y-8">
      <Card className="overflow-hidden rounded-3xl border-violet-100 bg-gradient-to-br from-violet-50 to-white p-0">
        <div className="flex items-center gap-3 bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-5 text-white">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20 text-lg font-extrabold">
            1
          </span>
          <div>
            <h2 className="text-2xl font-extrabold">ประเภทของเศษส่วน</h2>
            <p className="mt-0.5 text-sm font-bold text-violet-100">
              เศษส่วนแบ่งออกเป็น 3 ประเภท ตามความสัมพันธ์ของตัวเศษและตัวส่วน
            </p>
          </div>
          <span className="ml-auto hidden text-5xl sm:block" aria-hidden>
            🐻
          </span>
        </div>
      </Card>

      {/* 3 การ์ดประเภท */}
      <div className="grid gap-4 sm:grid-cols-3">
        {TYPES.map((t) => (
          <div key={t.id} className={cn("rounded-2xl border-2 p-5", t.cardClass)}>
            <h3 className={cn("text-lg font-extrabold", t.headingClass)}>{t.title}</h3>
            <p className="mt-1 text-sm font-bold text-slate-600">{t.condition}</p>
            <p className="text-sm font-bold text-slate-500">{t.valueNote}</p>

            <div className="mt-4 flex items-center justify-center gap-4">
              <FractionShape
                numerator={t.shapeNumerator > t.shapeDenominator ? t.shapeDenominator : t.shapeNumerator}
                denominator={t.shapeDenominator}
                shape="bar"
                tone={t.tone}
                className="h-16 w-24"
              />
              <span className="inline-flex items-center gap-1.5">
                {t.heroWhole > 0 && <span className={cn("text-3xl font-extrabold", t.headingClass)}>{t.heroWhole}</span>}
                <FractionStack top={t.heroNumerator} bottom={t.heroDenominator} className="text-2xl font-extrabold" />
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              <span className="text-xs font-bold text-slate-400">ตัวอย่าง</span>
              {t.examples.map((ex) => (
                <span key={ex} className="rounded-full bg-white px-2.5 py-1 shadow-sm">
                  <InlineFraction label={ex} className="text-xs font-extrabold text-slate-600" />
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ตารางเปรียบเทียบ */}
      <div>
        <h3 className="mb-3 text-lg font-extrabold text-brand-900">เปรียบเทียบให้เข้าใจง่าย</h3>
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-500">
                <th className="px-4 py-3 font-extrabold">ประเภท</th>
                <th className="px-4 py-3 font-extrabold">เงื่อนไข</th>
                <th className="px-4 py-3 font-extrabold">ค่าของเศษส่วน</th>
                <th className="px-4 py-3 font-extrabold">ตัวอย่าง</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row) => (
                <tr key={row.type} className="border-t border-slate-100">
                  <td className="px-4 py-4 font-extrabold text-brand-900">{row.type}</td>
                  <td className="px-4 py-4 font-bold text-slate-600">{row.condition}</td>
                  <td className="px-4 py-4">
                    <div className="pb-4">
                      <MiniNumberLine pct={row.pct} />
                    </div>
                    <span className="text-xs font-bold text-slate-500">{row.value}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {row.examples.map((ex) => (
                        <span key={ex} className="rounded-full bg-slate-100 px-2 py-1">
                          <InlineFraction label={ex} className="text-xs font-extrabold text-slate-600" />
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ลองจำแนกเร็ว */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-extrabold text-brand-900">ลองจำแนกเร็ว!</h3>
        <p className="mt-1 text-sm font-bold text-slate-500">คลิกที่แต่ละข้อเพื่อดูว่าเป็นเศษส่วนประเภทใด</p>
        <div className="mt-4 grid grid-cols-3 gap-2.5 sm:grid-cols-6">
          {CLASSIFY_CHIPS.map((chip, i) => (
            <button
              key={i}
              onClick={() => toggle(i)}
              className="flex flex-col items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-3 py-3 text-center transition hover:border-violet-200"
            >
              <InlineFraction label={chip.label} className="text-lg font-extrabold text-brand-900" />
              {revealed.has(i) && (
                <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-extrabold", chip.tone)}>
                  {chip.answer}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* จำให้แม่น */}
      <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
        <div className="rounded-2xl bg-amber-50 p-5">
          <h3 className="flex items-center gap-2 text-base font-extrabold text-amber-700">💡 จำให้แม่น!</h3>
          <ul className="mt-2 space-y-1.5 text-sm font-bold text-amber-700">
            <li>• ถ้าตัวเศษน้อยกว่าตัวส่วน → เป็นเศษส่วนแท้ (ค่าน้อยกว่า 1)</li>
            <li>• ถ้าตัวเศษมากกว่าหรือเท่ากับตัวส่วน → เป็นเศษเกิน (ค่าอย่างน้อย 1)</li>
            <li>• ถ้ามีจำนวนเต็มนำหน้า → เป็นจำนวนคละ (จำนวนเต็ม + เศษส่วนแท้)</li>
          </ul>
        </div>
        <div className="rounded-2xl bg-sky-50 p-5 sm:max-w-xs">
          <p className="flex items-center gap-2 text-sm font-extrabold text-sky-700">📌 หมายเหตุ</p>
          <p className="mt-2 flex flex-wrap items-center gap-1.5 text-sm font-bold text-sky-700">
            <span>เศษส่วนแท้และเศษเกินสามารถย่อให้เป็น “เศษส่วนอย่างต่ำ” ได้ เช่น</span>
            <InlineFraction label="6/8" className="text-sky-700" />
            <span>ย่อเป็น</span>
            <InlineFraction label="3/4" className="text-sky-700" />
            <span>
              แต่ “เศษส่วนอย่างต่ำ” ไม่ใช่ประเภทของเศษส่วน เป็นเพียงรูปที่ย่อจนที่สุดแล้วเท่านั้น
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
