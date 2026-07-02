"use client";

import { useState } from "react";
import { Shuffle, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FractionShape } from "@/components/fractions/FractionShape";
import { cn } from "@/lib/cn";
import { randInt, shuffle } from "@/lib/randomFraction";
import type { FractionShapeKind } from "@/types/lessonContent";

type Item = { shape: FractionShapeKind; numerator: number; denominator: number };

const SHAPES: FractionShapeKind[] = ["circle", "bar", "grid", "window"];

function generateSet(): { items: Item[]; oddIndex: number } {
  const shapes = shuffle(SHAPES);
  const d = randInt(3, 6);
  const n = randInt(1, d - 1);

  let dOther = randInt(3, 6);
  let nOther = randInt(1, dOther - 1);
  let tries = 0;
  while (nOther / dOther === n / d && tries++ < 10) {
    dOther = randInt(3, 6);
    nOther = randInt(1, dOther - 1);
  }

  const oddIndex = randInt(0, 3);
  const items = shapes.map((shape, i) =>
    i === oddIndex ? { shape, numerator: nOther, denominator: dOther } : { shape, numerator: n, denominator: d }
  );
  return { items, oddIndex };
}

const DEFAULT_SET: { items: Item[]; oddIndex: number } = {
  items: [
    { shape: "circle", numerator: 3, denominator: 4 },
    { shape: "bar", numerator: 3, denominator: 4 },
    { shape: "grid", numerator: 2, denominator: 4 },
    { shape: "window", numerator: 3, denominator: 4 },
  ],
  oddIndex: 2,
};

export function OddOneOutFractionActivity() {
  const [set, setSet] = useState(DEFAULT_SET);
  const [selected, setSelected] = useState<number | null>(null);

  const mainItem = set.items[set.oddIndex === 0 ? 1 : 0];
  const oddItem = set.items[set.oddIndex];

  function pick(index: number) {
    setSelected(index);
  }

  function randomize() {
    setSet(generateSet());
    setSelected(null);
  }

  const isCorrect = selected === set.oddIndex;

  return (
    <Card className="rounded-2xl">
      <h3 className="flex items-center gap-2 text-xl font-extrabold text-brand-900">
        <span>🎯</span> กิจกรรม: ภาพไหนไม่เหมือนเพื่อน?
      </h3>
      <p className="mt-1 text-sm font-bold text-slate-500">คลิกเลือกภาพที่ไม่ได้แทน {mainItem.numerator}/{mainItem.denominator}</p>

      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {set.items.map((item, i) => {
          const active = selected === i;
          const isOdd = i === set.oddIndex;
          const revealCorrect = selected !== null && isOdd;
          const revealWrong = active && !isOdd;

          return (
            <button
              key={i}
              onClick={() => pick(i)}
              disabled={selected !== null}
              className={cn(
                "flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition disabled:cursor-default",
                !active && !revealCorrect && "border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50",
                revealCorrect && "border-emerald-400 bg-emerald-50",
                revealWrong && "border-rose-300 bg-rose-50"
              )}
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-slate-400 text-xs font-extrabold text-white">
                {i + 1}
              </span>
              <FractionShape
                numerator={item.numerator}
                denominator={item.denominator}
                shape={item.shape}
                tone="pink"
                className={item.shape === "bar" ? "h-14 w-32" : "h-24 w-24"}
              />
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div
          className={cn(
            "mt-5 rounded-xl px-5 py-3.5 text-center text-base font-bold",
            isCorrect ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-500"
          )}
        >
          {isCorrect ? (
            <span className="flex items-center justify-center gap-1.5">
              <CheckCircle2 size={18} />
              คำตอบ: ข้อ {set.oddIndex + 1} — ถูกต้อง! เพราะภาพนี้ระบาย {oddItem.numerator} ส่วน จากทั้งหมด {oddItem.denominator} ส่วน
              จึงเขียนเป็น {oddItem.numerator}/{oddItem.denominator} ไม่ใช่ {mainItem.numerator}/{mainItem.denominator}
            </span>
          ) : (
            "ลองดูจำนวนส่วนที่ระบายอีกครั้ง"
          )}
        </div>
      )}

      <button
        onClick={randomize}
        className="mt-4 flex items-center gap-1.5 rounded-xl border border-violet-200 bg-white px-4 py-2 text-sm font-extrabold text-violet-600 transition hover:bg-violet-50"
      >
        <Shuffle size={15} />
        สุ่มใหม่
      </button>
    </Card>
  );
}
