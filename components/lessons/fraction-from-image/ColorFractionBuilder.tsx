"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { randInt } from "@/lib/randomFraction";
import { countColoredParts } from "@/lib/fractionUtils";
import { ShapeSelector, SHAPE_OPTIONS, type ShapeKind } from "@/components/lessons/fraction-from-image/ShapeSelector";
import { ShapeCountSelector } from "@/components/lessons/fraction-from-image/ShapeCountSelector";
import { PartitionSelector } from "@/components/lessons/fraction-from-image/PartitionSelector";
import { FractionWorkspace } from "@/components/lessons/fraction-from-image/FractionWorkspace";
import { FractionResultSummary } from "@/components/lessons/fraction-from-image/FractionResultSummary";
import { FractionActionButtons } from "@/components/lessons/fraction-from-image/FractionActionButtons";

const COLOR_OPTIONS = [
  { id: "pink", label: "ชมพู", hex: "#f472b6" },
  { id: "violet", label: "ม่วง", hex: "#a78bfa" },
  { id: "amber", label: "เหลือง", hex: "#fbbf24" },
  { id: "sky", label: "ฟ้า", hex: "#38bdf8" },
  { id: "emerald", label: "เขียว", hex: "#34d399" },
] as const;

const DENOMINATOR_POOL = [2, 3, 4, 5, 6, 8, 10, 12];

const DEFAULT_SHAPE: ShapeKind = "circle";
const DEFAULT_SHAPE_COUNT = 3;
const DEFAULT_DENOMINATOR = 4;
const DEFAULT_COLORED_TOTAL = 7;

/** สร้างตาราง coloredParts ขนาด shapeCount x denominator แล้วระบายไล่จากรูปแรกจนครบ coloredTotal */
function buildColoredGrid(shapeCount: number, denominator: number, coloredTotal: number): boolean[][] {
  let remaining = coloredTotal;
  return Array.from({ length: shapeCount }, () =>
    Array.from({ length: denominator }, () => {
      if (remaining > 0) {
        remaining -= 1;
        return true;
      }
      return false;
    })
  );
}

export function ColorFractionBuilder() {
  const [shape, setShape] = useState<ShapeKind>(DEFAULT_SHAPE);
  const [shapeCount, setShapeCount] = useState(DEFAULT_SHAPE_COUNT);
  const [denominator, setDenominator] = useState(DEFAULT_DENOMINATOR);
  const [colorId, setColorId] = useState<(typeof COLOR_OPTIONS)[number]["id"]>("pink");
  const [coloredParts, setColoredParts] = useState<boolean[][]>(() =>
    buildColoredGrid(DEFAULT_SHAPE_COUNT, DEFAULT_DENOMINATOR, DEFAULT_COLORED_TOTAL)
  );

  const colorHex = COLOR_OPTIONS.find((c) => c.id === colorId)!.hex;

  /** เปลี่ยนขนาดตาราง coloredParts ให้ตรงกับ shapeCount/denominator ใหม่ โดยคงค่าที่ระบายไว้เท่าที่ยังอยู่ในขอบเขต */
  function resizeGrid(nextShapeCount: number, nextDenominator: number) {
    setColoredParts((prev) =>
      Array.from({ length: nextShapeCount }, (_, s) =>
        Array.from({ length: nextDenominator }, (_, p) => prev[s]?.[p] ?? false)
      )
    );
  }

  function handleShapeCountChange(next: number) {
    setShapeCount(next);
    resizeGrid(next, denominator);
  }

  function handleDenominatorChange(next: number) {
    setDenominator(next);
    resizeGrid(shapeCount, next);
  }

  function toggleCell(shapeIndex: number, partIndex: number) {
    setColoredParts((prev) => {
      const next = prev.map((row) => [...row]);
      next[shapeIndex][partIndex] = !next[shapeIndex][partIndex];
      return next;
    });
  }

  function clearAll() {
    setColoredParts((prev) => prev.map((row) => row.map(() => false)));
  }

  function fillOneShape() {
    setColoredParts((prev) => {
      const targetIndex = prev.findIndex((row) => row.some((v) => !v));
      if (targetIndex === -1) return prev;
      const next = prev.map((row) => [...row]);
      next[targetIndex] = next[targetIndex].map(() => true);
      return next;
    });
  }

  function randomize() {
    const nextShape = SHAPE_OPTIONS[randInt(0, SHAPE_OPTIONS.length - 1)].id;
    const nextShapeCount = randInt(1, 5);
    const nextDenominator = DENOMINATOR_POOL[randInt(0, DENOMINATOR_POOL.length - 1)];
    const nextColoredTotal = randInt(0, nextShapeCount * nextDenominator);
    setShape(nextShape);
    setShapeCount(nextShapeCount);
    setDenominator(nextDenominator);
    setColoredParts(buildColoredGrid(nextShapeCount, nextDenominator, nextColoredTotal));
  }

  function reset() {
    setShape(DEFAULT_SHAPE);
    setShapeCount(DEFAULT_SHAPE_COUNT);
    setDenominator(DEFAULT_DENOMINATOR);
    setColoredParts(buildColoredGrid(DEFAULT_SHAPE_COUNT, DEFAULT_DENOMINATOR, DEFAULT_COLORED_TOTAL));
  }

  const coloredTotal = countColoredParts(coloredParts);

  return (
    <Card className="overflow-hidden rounded-3xl p-0 shadow-sm">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-sky-600 to-blue-600 px-6 py-5 text-white">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20 text-lg font-extrabold">
            4
          </span>
          <div>
            <h2 className="text-2xl font-extrabold">ลองสร้างและระบายเศษส่วน</h2>
            <p className="mt-0.5 text-sm font-bold text-sky-100">
              เลือกภาพ แบ่งเป็นส่วนเท่า ๆ กัน แล้วคลิกระบายสีเพื่อสร้างเศษส่วนของตัวเอง
            </p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1.5 text-sm font-extrabold">
          <HelpCircle size={15} />
          วิธีเล่น
        </span>
      </div>

      {/* ── Body: 2 คอลัมน์ ── */}
      <div className="grid gap-6 p-6 lg:grid-cols-[280px_1fr]">
        {/* ── คอลัมน์ซ้าย: แผงควบคุม ── */}
        <div className="space-y-5">
          <ShapeSelector value={shape} onChange={setShape} />
          <ShapeCountSelector value={shapeCount} onChange={handleShapeCountChange} />
          <PartitionSelector value={denominator} onChange={handleDenominatorChange} />

          <div>
            <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">4. เลือกสีระบาย</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setColorId(c.id)}
                  aria-label={`สี${c.label}`}
                  title={c.label}
                  className={cn(
                    "h-9 w-9 rounded-full border-2 transition",
                    colorId === c.id ? "border-slate-700 scale-110 shadow-sm" : "border-white shadow"
                  )}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── คอลัมน์ขวา: พื้นที่ระบายสี + สรุปผล ── */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
            <FractionWorkspace
              shape={shape}
              denominator={denominator}
              coloredParts={coloredParts}
              colorHex={colorHex}
              onToggle={toggleCell}
            />
          </div>

          <FractionActionButtons onClear={clearAll} onFillOne={fillOneShape} onRandomize={randomize} onReset={reset} />

          <FractionResultSummary coloredTotal={coloredTotal} denominator={denominator} />
        </div>
      </div>
    </Card>
  );
}
