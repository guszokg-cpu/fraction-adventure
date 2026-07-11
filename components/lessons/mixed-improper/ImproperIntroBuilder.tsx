"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionText } from "@/components/fractions/FractionText";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";

const DENOMINATORS = [2, 3, 4, 5, 6];

export function ImproperIntroBuilder() {
  const [den, setDen] = useState(4);
  const [count, setCount] = useState(5);

  const maxCount = den * 3;
  const whole = Math.floor(count / den);
  const rem = count % den;
  const kind = count > den ? "improper" : count === den ? "one" : "proper";

  function changeDen(d: number) {
    setDen(d);
    setCount((c) => Math.min(c, d * 3));
  }

  // วงกลมที่ต้องวาด: เต็ม whole วง + เศษ 1 วง (ถ้ามี)
  const circles: { numerator: number }[] = [
    ...Array.from({ length: whole }, () => ({ numerator: den })),
    ...(rem > 0 ? [{ numerator: rem }] : []),
  ];

  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-r from-pink-600 to-fuchsia-600 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">1</span>
          <h2 className="text-xl font-extrabold">รู้จักเศษเกิน 🍕</h2>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        {/* เลือกจำนวนชิ้นต่อถาด */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-sm font-bold text-slate-500">แบ่งถาดละ</span>
          {DENOMINATORS.map((d) => (
            <button
              key={d}
              onClick={() => changeDen(d)}
              className={cn(
                "h-11 w-12 rounded-xl text-lg font-extrabold transition",
                den === d ? "bg-pink-600 text-white shadow-md" : "border border-slate-200 bg-white text-slate-500 hover:bg-pink-50"
              )}
            >
              {d}
            </button>
          ))}
          <span className="text-sm font-bold text-slate-500">ชิ้น</span>
        </div>

        {/* ปุ่มเพิ่ม/ลดชิ้น */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setCount((c) => Math.max(1, c - 1))}
            disabled={count <= 1}
            className="flex h-12 items-center gap-1.5 rounded-xl border-2 border-pink-200 bg-white px-5 text-base font-extrabold text-pink-600 transition hover:bg-pink-50 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus size={18} /> เอาออก 1 ชิ้น
          </button>
          <button
            onClick={() => setCount((c) => Math.min(maxCount, c + 1))}
            disabled={count >= maxCount}
            className="flex h-12 items-center gap-1.5 rounded-xl bg-pink-600 px-5 text-base font-extrabold text-white shadow-md transition hover:bg-pink-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus size={18} /> เพิ่ม 1 ชิ้น
          </button>
        </div>

        {/* ถาดพิซซา */}
        <div className="flex min-h-28 flex-wrap items-center justify-center gap-3 rounded-2xl bg-pink-50/60 p-4">
          {circles.map((c, i) => (
            <FractionShape key={i} numerator={c.numerator} denominator={den} shape="pizza" className="h-24 w-24 sm:h-28 sm:w-28" />
          ))}
        </div>

        {/* ตัวเลขสองแบบคู่กัน */}
        <div className="flex flex-wrap items-center justify-center gap-4 rounded-2xl bg-white px-4 py-4 ring-1 ring-pink-100">
          <div className="flex flex-col items-center gap-1">
            <FractionText numerator={count} denominator={den} className="text-4xl sm:text-5xl" toneClassName="text-pink-600" />
            <span className="rounded-full bg-pink-50 px-3 py-0.5 text-xs font-extrabold text-pink-600 sm:text-sm">เขียนแบบเศษส่วน</span>
          </div>
          {whole > 0 && (
            <>
              <span className="text-3xl font-extrabold text-slate-300 sm:text-4xl">=</span>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-1">
                  <span className="text-4xl font-extrabold text-fuchsia-600 sm:text-5xl">{whole}</span>
                  {rem > 0 && (
                    <FractionText numerator={rem} denominator={den} className="text-3xl sm:text-4xl" toneClassName="text-fuchsia-600" />
                  )}
                </div>
                <span className="rounded-full bg-fuchsia-50 px-3 py-0.5 text-xs font-extrabold text-fuchsia-600 sm:text-sm">
                  {rem > 0 ? "เขียนแบบจำนวนคละ" : "จำนวนเต็มพอดี"}
                </span>
              </div>
            </>
          )}
        </div>

        {/* ป้ายสถานะ */}
        <div
          className={cn(
            "rounded-xl px-4 py-3 text-center text-sm font-extrabold sm:text-base",
            kind === "improper" && "bg-fuchsia-50 text-fuchsia-700",
            kind === "one" && "bg-emerald-50 text-emerald-700",
            kind === "proper" && "bg-sky-50 text-sky-700"
          )}
        >
          {kind === "improper" && (
            <>ตัวเศษ ({count}) มากกว่าตัวส่วน ({den}) → เกิน 1 ถาด เรียกว่า &ldquo;เศษเกิน&rdquo; เขียนอีกแบบเป็นจำนวนคละได้</>
          )}
          {kind === "one" && <>ครบ 1 ถาดพอดี ({count}/{den} = 1)</>}
          {kind === "proper" && <>ยังไม่ถึง 1 ถาด → เป็นเศษส่วนแท้ ลองกดเพิ่มชิ้นจนเกินถาดดูสิ!</>}
        </div>
      </div>
    </Card>
  );
}
