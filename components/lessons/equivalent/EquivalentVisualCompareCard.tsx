"use client";

import { useState } from "react";
import { Plus, Trash2, Wand2, X } from "lucide-react";
import { FractionShape } from "@/components/fractions/FractionShape";
import { Card } from "@/components/ui/Card";
import { FractionStack, SectionHeader } from "@/components/lessons/equivalent/EquivalentMath";
import { cn } from "@/lib/cn";
import { randInt } from "@/lib/randomFraction";

type ShapeType = "circle" | "hbar" | "vbar";
type Fraction = { numerator: number; denominator: number };
type CompareItem = Fraction & { id: number };

const SHAPE_OPTIONS: { id: ShapeType; label: string; icon: string }[] = [
  { id: "circle", label: "วงกลม", icon: "⬤" },
  { id: "vbar", label: "แนวตั้ง", icon: "▮" },
  { id: "hbar", label: "แนวนอน", icon: "▬" },
];

const MAX_ITEMS = 6;

const FILL = "#a78bfa";
const EMPTY = "#ffffff";
const STROKE = "#312e81";

function VerticalBarSVG({ numerator, denominator }: { numerator: number; denominator: number }) {
  const h = 100 / denominator;
  const cells = Array.from({ length: denominator }, (_, i) => (
    <rect
      key={i}
      x={0}
      y={i * h}
      width={26}
      height={h}
      fill={i >= denominator - numerator ? FILL : EMPTY}
      stroke={STROKE}
      strokeWidth={1.2}
    />
  ));
  return (
    <svg viewBox="0 0 26 100" className="h-full w-full" role="img" aria-label={`${numerator} ส่วนจาก ${denominator}`}>
      {cells}
    </svg>
  );
}

function crossEqual(a: Fraction, b: Fraction) {
  return a.numerator * b.denominator === b.numerator * a.denominator;
}

const EXAMPLE_BASES = [
  { n: 1, d: 2 },
  { n: 1, d: 3 },
  { n: 2, d: 3 },
  { n: 1, d: 4 },
  { n: 3, d: 4 },
];

export function EquivalentVisualCompareCard() {
  const [shape, setShape] = useState<ShapeType>("circle");
  const [num, setNum] = useState(1);
  const [den, setDen] = useState(2);
  const [items, setItems] = useState<CompareItem[]>([]);
  const [nextId, setNextId] = useState(1);

  function addItem() {
    if (items.length >= MAX_ITEMS) return;
    setItems((prev) => [...prev, { numerator: num, denominator: den, id: nextId }]);
    setNextId((n) => n + 1);
  }

  function removeItem(id: number) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function clearAll() {
    setItems([]);
  }

  function decDen() {
    const nd = Math.max(1, den - 1);
    setDen(nd);
    if (num > nd) setNum(nd);
  }

  function tryExample(equal: boolean) {
    const b = EXAMPLE_BASES[randInt(0, EXAMPLE_BASES.length - 1)];
    let newItems: CompareItem[];
    if (equal) {
      newItems = [1, 2, 3].map((m, i) => ({
        numerator: b.n * m,
        denominator: b.d * m,
        id: nextId + i,
      }));
    } else {
      newItems = [
        { numerator: b.n, denominator: b.d, id: nextId },
        { numerator: b.n * 2, denominator: b.d * 2, id: nextId + 1 },
        { numerator: b.n + 1, denominator: b.d + 1, id: nextId + 2 },
      ];
    }
    setItems(newItems);
    setNextId((n) => n + 3);
  }

  const shapeSize =
    shape === "circle"
      ? "h-28 w-28 sm:h-32 sm:w-32"
      : shape === "vbar"
        ? "h-28 w-10 sm:h-32 sm:w-11"
        : "h-10 w-28 sm:h-11 sm:w-32";

  function renderShape(f: Fraction) {
    if (shape === "circle") {
      return <FractionShape numerator={f.numerator} denominator={f.denominator} shape="circle" tone="violet" className={shapeSize} />;
    }
    if (shape === "hbar") {
      return <FractionShape numerator={f.numerator} denominator={f.denominator} shape="bar" tone="violet" className={shapeSize} />;
    }
    return (
      <div className={cn("grid place-items-center", shapeSize)}>
        <VerticalBarSVG numerator={f.numerator} denominator={f.denominator} />
      </div>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={2} title="เปรียบเทียบด้วยภาพ" />
      <div className="space-y-5 p-5 sm:p-6">
        {/* Shape selector */}
        <div className="flex items-center justify-center gap-2">
          {SHAPE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setShape(opt.id)}
              className={cn(
                "rounded-xl px-4 py-2.5 text-sm font-extrabold transition sm:text-base",
                shape === opt.id ? "bg-violet-600 text-white shadow-md" : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
              )}
            >
              <span className="mr-1.5">{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>

        {/* Fraction picker */}
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-500">เศษ</span>
            <button
              onClick={() => setNum((n) => Math.max(0, n - 1))}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-lg font-bold text-slate-600 transition hover:bg-slate-200"
            >
              −
            </button>
            <span className="w-8 text-center text-2xl font-extrabold text-violet-700">{num}</span>
            <button
              onClick={() => setNum((n) => Math.min(den, n + 1))}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-lg font-bold text-slate-600 transition hover:bg-slate-200"
            >
              +
            </button>
          </div>
          <div className="text-3xl font-extrabold text-slate-300">/</div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-500">ส่วน</span>
            <button
              onClick={decDen}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-lg font-bold text-slate-600 transition hover:bg-slate-200"
            >
              −
            </button>
            <span className="w-8 text-center text-2xl font-extrabold text-violet-700">{den}</span>
            <button
              onClick={() => setDen((d) => Math.min(12, d + 1))}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-lg font-bold text-slate-600 transition hover:bg-slate-200"
            >
              +
            </button>
          </div>
        </div>

        {/* Preview + Add */}
        <div className="flex flex-col items-center gap-3">
          <div className="rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50/50 p-4">
            {renderShape({ numerator: num, denominator: den })}
          </div>
          <button
            onClick={addItem}
            disabled={items.length >= MAX_ITEMS}
            className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-extrabold text-white shadow transition hover:bg-violet-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 sm:text-base"
          >
            <Plus size={18} /> เพิ่มรูปเปรียบเทียบ
          </button>
        </div>

        {/* Comparison area */}
        {items.length > 0 && (
          <>
            <div className="flex flex-wrap items-end justify-center gap-3 sm:gap-4">
              {items.map((item, i) => {
                const isFirst = i === 0;
                const isEqual = isFirst || crossEqual(items[0], item);
                return (
                  <div
                    key={item.id}
                    className={cn(
                      "relative flex flex-col items-center gap-2 rounded-2xl border-2 p-3 sm:p-4",
                      isFirst
                        ? "border-violet-300 bg-violet-50"
                        : isEqual
                          ? "border-emerald-400 bg-emerald-50"
                          : "border-rose-300 bg-rose-50"
                    )}
                  >
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-slate-400 text-white transition hover:bg-slate-600"
                    >
                      <X size={14} />
                    </button>
                    {renderShape(item)}
                    <FractionStack top={item.numerator} bottom={item.denominator} className="text-2xl text-violet-700 sm:text-3xl" />
                    {!isFirst && (
                      <span className={cn("text-xs font-extrabold sm:text-sm", isEqual ? "text-emerald-600" : "text-rose-500")}>
                        {isEqual ? "= เท่ากัน" : "≠ ไม่เท่ากัน"}
                      </span>
                    )}
                    {isFirst && <span className="text-xs font-extrabold text-violet-500 sm:text-sm">ตัวตั้ง</span>}
                  </div>
                );
              })}
            </div>

            {/* Equation bar */}
            {items.length >= 2 && (
              <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl bg-teal-50 px-4 py-3">
                {items.map((item, i) => {
                  const isEqual = i === 0 || crossEqual(items[0], item);
                  return (
                    <span key={item.id} className="flex items-center gap-2">
                      {i > 0 && (
                        <span className={cn("text-xl font-extrabold sm:text-2xl", isEqual ? "text-emerald-600" : "text-rose-500")}>
                          {isEqual ? "=" : "≠"}
                        </span>
                      )}
                      <FractionStack top={item.numerator} bottom={item.denominator} className="text-xl text-teal-700 sm:text-2xl" />
                    </span>
                  );
                })}
              </div>
            )}

            <div className="flex justify-center">
              <button
                onClick={clearAll}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-500 transition hover:bg-slate-50 sm:text-sm"
              >
                <Trash2 size={13} /> ล้างทั้งหมด
              </button>
            </div>
          </>
        )}

        {/* Empty state */}
        {items.length === 0 && (
          <div className="space-y-3">
            <p className="text-center text-sm font-bold text-slate-400">ตั้งค่าเศษส่วนแล้วกดเพิ่มรูปเปรียบเทียบ เพื่อเริ่มเปรียบเทียบ</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => tryExample(true)}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-extrabold text-emerald-700 transition hover:bg-emerald-100 sm:text-sm"
              >
                <Wand2 size={14} /> ลองตัวอย่างเท่ากัน
              </button>
              <button
                onClick={() => tryExample(false)}
                className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-extrabold text-rose-600 transition hover:bg-rose-100 sm:text-sm"
              >
                <Wand2 size={14} /> ลองตัวอย่างไม่เท่ากัน
              </button>
            </div>
          </div>
        )}

        <p className="text-center text-sm font-bold text-slate-500 sm:text-base">
          รูปทรงเดียวกัน ขนาดเท่ากัน — ถ้าส่วนที่ระบายเท่ากัน แปลว่าเป็น<span className="text-teal-700">เศษส่วนที่เท่ากัน</span>
        </p>
      </div>
    </Card>
  );
}
