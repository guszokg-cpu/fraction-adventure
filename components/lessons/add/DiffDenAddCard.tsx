"use client";

import { useState } from "react";
import { ArrowRight, RotateCcw, Shuffle, Trophy } from "lucide-react";
import { FractionShape } from "@/components/fractions/FractionShape";
import { Card } from "@/components/ui/Card";
import { FractionInput } from "@/components/ui/FractionInput";
import { LcmLadder, ProportionBar, TwoSegmentBar } from "@/components/lessons/shared/DiffDenVisuals";
import { FractionStack, SectionHeader, TwoToneBar } from "@/components/lessons/add/FractionMath";
import { cn } from "@/lib/cn";
import { gcd } from "@/lib/fractionUtils";
import { randInt } from "@/lib/randomFraction";

type Problem = { na: number; da: number; nb: number; db: number };

/** คู่ตัวส่วนที่ ค.ร.น. ≤ 12 และผลบวกไม่เกิน 1 เต็ม */
const DEN_PAIRS: [number, number][] = [
  [2, 3], [2, 4], [2, 5], [3, 4], [3, 6], [4, 6], [2, 6], [4, 8], [2, 8],
];

function lcm(a: number, b: number) {
  return (a * b) / gcd(a, b);
}

function makeProblem(): Problem {
  for (let guard = 0; guard < 50; guard++) {
    const [da, db] = DEN_PAIRS[randInt(0, DEN_PAIRS.length - 1)];
    const l = lcm(da, db);
    const na = randInt(1, da - 1);
    const nb = randInt(1, db - 1);
    if (na * (l / da) + nb * (l / db) <= l) return { na, da, nb, db };
  }
  return { na: 1, da: 2, nb: 1, db: 3 };
}

/** แถวพหุคูณของตัวส่วน — ไฮไลต์ ค.ร.น. */
function MultiplesRow({ den, l, color }: { den: number; l: number; color: string }) {
  const items = Array.from({ length: Math.floor(l / den) }, (_, i) => den * (i + 1));
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-24 text-sm font-extrabold text-slate-500">พหุคูณของ {den}:</span>
      {items.map((v) => (
        <span
          key={v}
          className={cn(
            "grid h-9 w-9 place-items-center rounded-lg text-base font-extrabold",
            v === l ? cn("text-white shadow-md", color) : "bg-slate-100 text-slate-500"
          )}
        >
          {v}
        </span>
      ))}
    </div>
  );
}

export function DiffDenAddCard() {
  const [problem, setProblem] = useState<Problem>({ na: 1, da: 2, nb: 1, db: 3 });
  const [stage, setStage] = useState(0);

  const { na, da, nb, db } = problem;
  const l = lcm(da, db);
  const ka = l / da;
  const kb = l / db;
  const ca = na * ka;
  const cb = nb * kb;
  const sum = ca + cb;
  const g = gcd(sum, l);
  const hasReduce = g > 1;
  const maxStage = hasReduce ? 3 : 2;

  // ตัวส่วนต้องมากกว่า 1 เท่านั้น — นอกนั้นพิมพ์ได้ทุกค่า
  const warning: string | null = da < 2 || db < 2 ? "ตัวส่วนต้องมากกว่า 1" : null;
  const valid = warning === null;

  // ถ้าพหุคูณสั้นพอ แสดงเป็นแถวพหุคูณ; ถ้ายาวเกินไปสลับไปวิธีหารสั้น
  const showMultiples = l / da <= 6 && l / db <= 6;
  // ถ้าตัวส่วนเล็กพอและผลไม่เกิน 1 ใช้แท่งแบ่งช่อง; ไม่งั้นใช้แท่งสัดส่วนต่อเนื่อง
  const smallBars = l <= 20 && sum <= l;

  function editFraction(part: "a" | "b", n: number, d: number) {
    setProblem((p) => (part === "a" ? { ...p, na: n, da: d } : { ...p, nb: n, db: d }));
    setStage(0);
  }

  function randomize() {
    let next = makeProblem();
    let tries = 0;
    while (next.na === na && next.da === da && next.nb === nb && next.db === db && tries++ < 10) {
      next = makeProblem();
    }
    setProblem(next);
    setStage(0);
  }

  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={2} title="ตัวส่วนต่างกัน: ทำส่วนให้เท่าก่อน" />
      <div className="space-y-5 p-5 sm:p-6">
        {/* โจทย์ */}
        <div className="flex items-center justify-center gap-4 rounded-2xl bg-blue-50 px-4 py-4">
          <FractionStack top={na} bottom={da} className="text-3xl text-sky-600 sm:text-4xl" />
          <span className="text-3xl font-extrabold text-slate-400 sm:text-4xl">+</span>
          <FractionStack top={nb} bottom={db} className="text-3xl text-violet-600 sm:text-4xl" />
          <span className="text-3xl font-extrabold text-slate-400 sm:text-4xl">=</span>
          {valid && stage >= 2 ? (
            <FractionStack top={sum} bottom={l} className="text-3xl text-blue-700 sm:text-4xl" />
          ) : (
            <span className="text-3xl font-extrabold text-slate-300 sm:text-4xl">?</span>
          )}
        </div>

        {/* พิมพ์โจทย์เอง หรือ สุ่ม */}
        <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 p-3 sm:p-4">
          <span className="text-sm font-extrabold text-slate-500">พิมพ์โจทย์เอง:</span>
          <FractionInput
            numerator={na}
            denominator={da}
            onChange={(n, d) => editFraction("a", n, d)}
            size="md"
            maxNumerator={99}
            maxDenominator={99}
            colorClass="border-sky-300 focus:border-sky-500 focus:ring-sky-100 bg-sky-500"
          />
          <span className="text-2xl font-extrabold text-slate-400">+</span>
          <FractionInput
            numerator={nb}
            denominator={db}
            onChange={(n, d) => editFraction("b", n, d)}
            size="md"
            maxNumerator={99}
            maxDenominator={99}
            colorClass="border-violet-300 focus:border-violet-500 focus:ring-violet-100 bg-violet-500"
          />
          <button
            onClick={randomize}
            className="flex h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50"
          >
            <Shuffle size={15} /> สุ่มโจทย์
          </button>
        </div>

        {!valid && (
          <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-bold text-amber-700 sm:text-base">
            ⚠️ {warning}
          </div>
        )}

        {valid && (
          <>
            {/* ขั้นที่ 1: หา ค.ร.น. */}
            <div className="rounded-2xl border-2 border-sky-200 bg-white p-4 sm:p-5">
              <p className="flex items-center gap-2 text-base font-extrabold text-sky-700 sm:text-lg">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-sky-500 text-sm text-white">1</span>
                หา ค.ร.น. ของ {da} และ {db}
              </p>
              {showMultiples ? (
                <>
                  <div className="mt-3 space-y-2">
                    <MultiplesRow den={da} l={l} color="bg-sky-500" />
                    <MultiplesRow den={db} l={l} color="bg-violet-500" />
                  </div>
                  <p className="mt-2 text-center text-sm font-bold text-slate-600">
                    เจอกันครั้งแรกที่ <span className="text-lg font-extrabold text-blue-700">{l}</span> → ใช้ {l} เป็นตัวส่วนร่วม
                  </p>
                </>
              ) : (
                <div className="mt-3">
                  <LcmLadder a={da} b={db} badgeClass="bg-blue-600" resultClass="text-blue-700" />
                </div>
              )}
            </div>

            {/* ขั้นที่ 2: แปลงให้ส่วนเท่ากัน */}
            {stage >= 1 && (
              <div className="rounded-2xl border-2 border-violet-200 bg-white p-4 sm:p-5">
                <p className="flex items-center gap-2 text-base font-extrabold text-violet-700 sm:text-lg">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-violet-500 text-sm text-white">2</span>
                  ทำทั้งสองตัวให้เป็นส่วน {l}
                </p>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 text-center">
                    <div className="flex items-center justify-center gap-2 text-xl font-extrabold sm:text-2xl">
                      <FractionStack top={na} bottom={da} className="text-sky-600" />
                      <span className="flex flex-col items-center gap-1.5 text-base text-sky-500">
                        <span>×{ka}</span>
                        <span>×{ka}</span>
                      </span>
                      <span className="text-slate-400">=</span>
                      <FractionStack top={ca} bottom={l} className="text-sky-600" />
                    </div>
                    {smallBars ? (
                      <FractionShape numerator={ca} denominator={l} shape="bar" tone="sky" className="h-9 w-full" />
                    ) : (
                      <ProportionBar num={ca} den={l} barClass="bg-sky-400" className="h-9 w-full" />
                    )}
                  </div>
                  <div className="space-y-2 text-center">
                    <div className="flex items-center justify-center gap-2 text-xl font-extrabold sm:text-2xl">
                      <FractionStack top={nb} bottom={db} className="text-violet-600" />
                      <span className="flex flex-col items-center gap-1.5 text-base text-violet-500">
                        <span>×{kb}</span>
                        <span>×{kb}</span>
                      </span>
                      <span className="text-slate-400">=</span>
                      <FractionStack top={cb} bottom={l} className="text-violet-600" />
                    </div>
                    {smallBars ? (
                      <FractionShape numerator={cb} denominator={l} shape="bar" tone="violet" className="h-9 w-full" />
                    ) : (
                      <ProportionBar num={cb} den={l} barClass="bg-violet-400" className="h-9 w-full" />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ขั้นที่ 3: บวกตัวเศษ */}
            {stage >= 2 && (
              <div className="rounded-2xl border-2 border-blue-200 bg-white p-4 sm:p-5">
                <p className="flex items-center gap-2 text-base font-extrabold text-blue-700 sm:text-lg">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-blue-600 text-sm text-white">3</span>
                  ส่วนเท่ากันแล้ว บวกตัวเศษได้เลย
                </p>
                <div className="mt-3 flex items-center justify-center gap-3 text-2xl font-extrabold sm:text-3xl">
                  <FractionStack top={ca} bottom={l} className="text-sky-600" />
                  <span className="text-slate-400">+</span>
                  <FractionStack top={cb} bottom={l} className="text-violet-600" />
                  <span className="text-slate-400">=</span>
                  <FractionStack top={sum} bottom={l} className="text-blue-700" />
                </div>
                <div className="mx-auto mt-3 max-w-xl">
                  {smallBars ? (
                    <TwoToneBar a={ca} b={cb} denominator={l} className="h-11 w-full sm:h-12" />
                  ) : (
                    <TwoSegmentBar first={ca} second={cb} den={l} firstClass="bg-sky-400" secondClass="bg-violet-400" className="h-11 w-full sm:h-12" />
                  )}
                </div>
                {sum > l && (
                  <p className="mt-2 text-center text-sm font-bold text-amber-600">ผลบวกเกิน 1 เต็ม (เป็นเศษเกิน) — เขียนเป็นจำนวนคละได้</p>
                )}
              </div>
            )}

            {/* ขั้นที่ 4: ย่อ (ถ้าย่อได้) */}
            {stage >= 3 && hasReduce && (
              <div className="rounded-2xl border-2 border-emerald-200 bg-white p-4 sm:p-5">
                <p className="flex items-center gap-2 text-base font-extrabold text-emerald-700 sm:text-lg">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-600 text-sm text-white">4</span>
                  อย่าลืมย่อให้เป็นอย่างต่ำ
                </p>
                <div className="mt-3 flex items-center justify-center gap-3 text-2xl font-extrabold sm:text-3xl">
                  <FractionStack top={sum} bottom={l} className="text-blue-700" />
                  <span className="flex flex-col items-center gap-1.5 text-base text-emerald-600">
                    <span>÷{g}</span>
                    <span>÷{g}</span>
                  </span>
                  <span className="text-slate-400">=</span>
                  <FractionStack top={sum / g} bottom={l / g} className="text-emerald-700" />
                  <Trophy size={26} className="text-yellow-500" />
                </div>
              </div>
            )}

            {stage >= maxStage && !hasReduce && (
              <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-base font-extrabold text-emerald-700 sm:text-lg">
                <Trophy size={20} className="shrink-0 text-yellow-500" /> คำตอบเป็นเศษส่วนอย่างต่ำแล้ว ไม่ต้องย่อ
              </div>
            )}

            {/* ปุ่มควบคุม */}
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {stage < maxStage && (
                <button
                  onClick={() => setStage((s) => s + 1)}
                  className="flex h-12 items-center gap-1.5 rounded-xl bg-blue-600 px-6 text-base font-extrabold text-white shadow-md transition hover:bg-blue-700 active:scale-[0.98]"
                >
                  ขั้นถัดไป <ArrowRight size={18} />
                </button>
              )}
              {stage > 0 && (
                <button
                  onClick={() => setStage(0)}
                  className="flex h-12 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50"
                >
                  <RotateCcw size={15} /> ดูใหม่ตั้งแต่ต้น
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
