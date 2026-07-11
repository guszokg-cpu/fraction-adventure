"use client";

import { useState } from "react";
import { RotateCcw, Utensils } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FractionStack } from "@/components/fractions/FractionStack";
import { readThaiFraction } from "@/lib/thaiNumber";
import { cn } from "@/lib/cn";

/** ลำดับการตัด: กดมีดทีละครั้ง 1 → 2 → 4 → 6 → 8 ชิ้น */
const CUT_STEPS = [1, 2, 4, 6, 8];

const CRUST = "#f59e0b";
const CHEESE = "#fde68a";
const PICKED = "#fb7185";
const STROKE = "#92400e";

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
}

/** พิซซ่า SVG ที่กดเลือกชิ้นได้ */
function ClickPizza({
  slices,
  picked,
  onToggle,
}: {
  slices: number;
  picked: boolean[];
  onToggle: (i: number) => void;
}) {
  if (slices === 1) {
    return (
      <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label="พิซซ่าเต็มถาด 1 หน่วย">
        <circle cx={50} cy={50} r={47} fill={CRUST} stroke={STROKE} strokeWidth={2} />
        <circle cx={50} cy={50} r={40} fill={CHEESE} stroke={STROKE} strokeWidth={1} />
        {[[38, 40], [60, 34], [50, 56], [66, 58], [34, 62]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={4.5} fill="#ef4444" stroke="#b91c1c" strokeWidth={0.8} />
        ))}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label={`พิซซ่าแบ่งเป็น ${slices} ชิ้น`}>
      {Array.from({ length: slices }, (_, i) => {
        const start = (360 / slices) * i;
        const end = (360 / slices) * (i + 1);
        const [x1, y1] = polar(50, 50, 47, start);
        const [x2, y2] = polar(50, 50, 47, end);
        const largeArc = end - start > 180 ? 1 : 0;
        const d = `M50 50 L ${x1.toFixed(2)} ${y1.toFixed(2)} A 47 47 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
        const [tx, ty] = polar(50, 50, 28, (start + end) / 2);
        return (
          <g key={i} onClick={() => onToggle(i)} className="cursor-pointer">
            <path d={d} fill={picked[i] ? PICKED : CHEESE} stroke={STROKE} strokeWidth={1.8} className="transition-colors" />
            <circle cx={tx} cy={ty} r={4} fill={picked[i] ? "#ffffff" : "#ef4444"} stroke={picked[i] ? "#e11d48" : "#b91c1c"} strokeWidth={0.8} />
          </g>
        );
      })}
    </svg>
  );
}

type PizzaState = { cutIndex: number; picked: boolean[] };

const INITIAL: PizzaState = { cutIndex: 0, picked: [false] };

export function PizzaCutStory() {
  const [state, setState] = useState<PizzaState>(INITIAL);

  const { cutIndex, picked } = state;
  const slices = CUT_STEPS[cutIndex];
  const pickedCount = picked.filter(Boolean).length;
  const canCut = cutIndex < CUT_STEPS.length - 1;

  function cut() {
    setState((s) => {
      if (s.cutIndex >= CUT_STEPS.length - 1) return s;
      const next = s.cutIndex + 1;
      return { cutIndex: next, picked: Array.from({ length: CUT_STEPS[next] }, () => false) };
    });
  }

  function toggle(i: number) {
    setState((s) =>
      s.cutIndex === 0 ? s : { ...s, picked: s.picked.map((v, idx) => (idx === i ? !v : v)) }
    );
  }

  function reset() {
    setState(INITIAL);
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-rose-500 px-4 py-2.5 text-white">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-white/25 text-sm font-extrabold">2</span>
        <h2 className="text-lg font-extrabold">แบ่งพิซซ่ากันเถอะ! 🍕</h2>
      </div>

      <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[minmax(0,320px)_1fr]">
        {/* ── พิซซ่า ── */}
        <div className="flex flex-col items-center gap-4">
          <div className="h-56 w-56 sm:h-64 sm:w-64">
            <ClickPizza slices={slices} picked={picked} onToggle={toggle} />
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={cut}
              disabled={!canCut}
              className={cn(
                "flex h-12 items-center gap-2 rounded-xl px-5 text-base font-extrabold text-white shadow-md transition active:scale-[0.97]",
                canCut ? "bg-rose-500 hover:bg-rose-600" : "cursor-not-allowed bg-slate-300"
              )}
            >
              <Utensils size={18} /> ตัดพิซซ่า!
            </button>
            <button
              onClick={reset}
              className="flex h-12 items-center gap-1.5 rounded-xl border-2 border-amber-300 bg-white px-4 text-sm font-extrabold text-amber-700 transition hover:bg-amber-50 active:scale-[0.97]"
            >
              <RotateCcw size={16} /> เริ่มใหม่
            </button>
          </div>
        </div>

        {/* ── เรื่องราว/ผลลัพธ์ ── */}
        <div className="space-y-4">
          {slices === 1 ? (
            <div className="rounded-2xl border-2 border-amber-100 bg-amber-50/60 p-5 text-center">
              <p className="text-lg font-extrabold text-amber-800 sm:text-xl">
                นี่คือพิซซ่า <span className="text-rose-600">1 หน่วยเต็ม</span> 🍕
              </p>
              <p className="mt-2 text-sm font-bold text-slate-600 sm:text-base">
                เพื่อน ๆ กำลังจะมากินด้วยกัน — กดปุ่ม <span className="text-rose-600">&ldquo;ตัดพิซซ่า!&rdquo;</span> เพื่อแบ่งเป็นชิ้นเท่า ๆ กัน
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-2xl border-2 border-amber-100 bg-amber-50/60 p-4 text-center">
                <p className="text-base font-extrabold text-amber-800 sm:text-lg">
                  ตอนนี้แบ่งเป็น <span className="text-2xl text-rose-600">{slices}</span> ชิ้น<span className="text-emerald-600">เท่า ๆ กัน</span>
                  {canCut && <span className="font-bold text-slate-500"> (ตัดเพิ่มได้อีก)</span>}
                </p>
                <p className="mt-1 text-sm font-bold text-slate-600 sm:text-base">
                  👆 ลองแตะชิ้นพิซซ่าเพื่อหยิบแจกเพื่อน แล้วดูตัวเลขด้านล่าง
                </p>
              </div>

              {/* เศษส่วนก่อตัวขึ้นเอง */}
              <div className="rounded-2xl border-2 border-rose-100 bg-white p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                  <FractionStack
                    top={<span className="text-rose-500">{pickedCount}</span>}
                    bottom={<span className="text-brand-600">{slices}</span>}
                    className="text-5xl font-extrabold sm:text-6xl"
                  />
                  <div className="space-y-2 text-sm font-extrabold sm:text-base">
                    <div className="rounded-lg bg-rose-50 px-4 py-2 text-rose-600">
                      ตัวเศษ = ชิ้นที่หยิบ ({pickedCount} ชิ้น)
                    </div>
                    <div className="rounded-lg bg-brand-50 px-4 py-2 text-brand-700">
                      ตัวส่วน = ชิ้นทั้งหมด ({slices} ชิ้น)
                    </div>
                  </div>
                </div>
                {pickedCount > 0 && (
                  <div className="mt-4 rounded-xl bg-gradient-to-r from-pink-500 to-fuchsia-500 px-4 py-2.5 text-center text-base font-extrabold text-white sm:text-lg">
                    อ่านว่า &ldquo;{pickedCount === slices ? `${readThaiFraction(pickedCount, slices)} = 1 หน่วยเต็ม` : readThaiFraction(pickedCount, slices)}&rdquo;
                  </div>
                )}
              </div>

              {pickedCount === 0 && (
                <p className="text-center text-sm font-bold text-slate-500">
                  ยังไม่ได้หยิบสักชิ้น — แตะชิ้นพิซซ่าดูสิ!
                </p>
              )}
            </>
          )}

          {/* นิยามโผล่เมื่อลงมือแล้ว */}
          {pickedCount > 0 && slices > 1 && (
            <div className="rounded-2xl border-2 border-emerald-100 bg-emerald-50/60 p-4 text-center">
              <p className="text-sm font-extrabold text-emerald-700 sm:text-base">
                💡 นี่แหละคือ <span className="underline decoration-wavy">เศษส่วน</span> — จำนวนที่บอกว่าเราเลือก
                <span className="text-rose-600"> {pickedCount} ส่วน</span> จาก 1 หน่วยที่แบ่งเป็น
                <span className="text-brand-700"> {slices} ส่วนเท่า ๆ กัน</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
