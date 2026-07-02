"use client";

import { useState } from "react";
import { RotateCcw, Undo2, Zap } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FractionStack } from "@/components/fractions/FractionStack";
import { cn } from "@/lib/cn";

// พิกัดฉากบึงบัว (viewBox เดียวกันทั้ง SVG และตัวกบที่วางซ้อน)
const VB_W = 320;
const VB_H = 108;
const LEFT = 26;
const RIGHT = 294;
const USABLE = RIGHT - LEFT;
const LINE_Y = 66;

const PAD_OPTIONS = [3, 4, 5, 6];

function PondScene({ denominator, jumps }: { denominator: number; jumps: number }) {
  const ticks = Array.from({ length: denominator + 1 }, (_, i) => LEFT + (i / denominator) * USABLE);
  const frogLeftPct = (ticks[jumps] / VB_W) * 100;
  const frogTopPct = (LINE_Y / VB_H) * 100;

  return (
    <div className="relative w-full" style={{ aspectRatio: `${VB_W} / ${VB_H}` }}>
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="absolute inset-0 h-full w-full" role="img" aria-label={`กบอยู่ที่ ${jumps} ส่วน ${denominator} บนเส้นจำนวน`}>
        {/* ผิวน้ำ */}
        <rect x={6} y={LINE_Y - 8} width={VB_W - 12} height={44} rx={14} fill="#bae6fd" />
        <ellipse cx={70} cy={LINE_Y + 22} rx={26} ry={4} fill="#7dd3fc" opacity={0.5} />
        <ellipse cx={230} cy={LINE_Y + 26} rx={32} ry={4} fill="#7dd3fc" opacity={0.5} />

        {/* เส้นจำนวนหลัก */}
        <line x1={LEFT - 12} y1={LINE_Y} x2={RIGHT + 12} y2={LINE_Y} stroke="#0369a1" strokeWidth={2.4} strokeLinecap="round" />

        {/* ระยะที่กระโดดมาแล้ว */}
        {jumps > 0 && (
          <line x1={ticks[0]} y1={LINE_Y} x2={ticks[jumps]} y2={LINE_Y} stroke="#10b981" strokeWidth={4.5} strokeLinecap="round" />
        )}

        {ticks.map((x, i) => (
          <g key={i}>
            {/* ใบบัวประจำขีด */}
            <ellipse
              cx={x}
              cy={LINE_Y}
              rx={11}
              ry={5.5}
              fill={i <= jumps ? "#4ade80" : "#86efac"}
              stroke="#16a34a"
              strokeWidth={1.2}
            />
            {i === 0 || i === denominator ? (
              <text x={x} y={LINE_Y + 30} textAnchor="middle" fontSize={13} fontWeight={800} fill="#1e1b4b">
                {i / denominator}
              </text>
            ) : (
              <g>
                <text x={x} y={LINE_Y + 22} textAnchor="middle" fontSize={8.5} fontWeight={700} fill="#334155">
                  {i}
                </text>
                <line x1={x - 4.5} y1={LINE_Y + 25} x2={x + 4.5} y2={LINE_Y + 25} stroke="#334155" strokeWidth={1} />
                <text x={x} y={LINE_Y + 35} textAnchor="middle" fontSize={8.5} fontWeight={700} fill="#334155">
                  {denominator}
                </text>
              </g>
            )}
          </g>
        ))}

        {/* ธงเส้นชัยที่เลข 1 */}
        <text x={RIGHT + 2} y={LINE_Y - 20} fontSize={14} aria-hidden>
          🚩
        </text>
      </svg>

      {/* กบ — วางซ้อนบน SVG เลื่อนนุ่ม ๆ ด้วย CSS transition */}
      <div
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-[88%] text-2xl transition-all duration-300 ease-out sm:text-3xl"
        style={{ left: `${frogLeftPct}%`, top: `${frogTopPct}%` }}
        aria-hidden
      >
        🐸
      </div>
    </div>
  );
}

export function FrogJumpIntro() {
  const [denominator, setDenominator] = useState(4);
  const [jumps, setJumps] = useState(0);

  const atStart = jumps === 0;
  const atGoal = jumps === denominator;

  function choosePads(d: number) {
    setDenominator(d);
    setJumps(0);
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden rounded-3xl p-0 shadow-sm">
        <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-5 text-white">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20 text-lg font-extrabold">
            1
          </span>
          <div>
            <h2 className="text-2xl font-extrabold">รู้จักเส้นจำนวน</h2>
            <p className="mt-0.5 text-sm font-bold text-emerald-100">
              พาน้องกบกระโดดข้ามบึงบัว แล้วดูว่าเศษส่วนบอกตำแหน่งได้อย่างไร
            </p>
          </div>
          <span className="ml-auto hidden text-4xl sm:block" aria-hidden>
            🐸
          </span>
        </div>

        <div className="space-y-5 p-6">
          <div className="rounded-2xl bg-amber-50 px-5 py-3 text-center text-base font-bold text-amber-700">
            เส้นจำนวน คือเส้นตรงที่ใช้บอกตำแหน่งของจำนวน — ระหว่าง 0 กับ 1 ยังมีเศษส่วนซ่อนอยู่เต็มเลย!
          </div>

          {/* เลือกจำนวนช่อง */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-extrabold text-slate-600">แบ่งบึงเป็นกี่ช่อง:</span>
            {PAD_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => choosePads(d)}
                className={cn(
                  "h-10 w-10 rounded-xl border-2 text-sm font-extrabold transition",
                  d === denominator
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300"
                )}
              >
                {d}
              </button>
            ))}
          </div>

          {/* ฉากบึงบัว */}
          <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4 sm:p-6">
            <PondScene denominator={denominator} jumps={jumps} />
          </div>

          {/* ปุ่มควบคุมกบ */}
          <div className="flex flex-wrap justify-center gap-2.5">
            <button
              onClick={() => setJumps((j) => Math.min(denominator, j + 1))}
              disabled={atGoal}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-6 py-3 text-base font-extrabold text-white transition hover:bg-emerald-700 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Zap size={18} />
              กระโดด!
            </button>
            <button
              onClick={() => setJumps((j) => Math.max(0, j - 1))}
              disabled={atStart}
              className="flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Undo2 size={16} />
              ถอยกลับ
            </button>
            <button
              onClick={() => setJumps(0)}
              disabled={atStart}
              className="flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-5 py-3 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw size={16} />
              เริ่มใหม่
            </button>
          </div>

          {/* สถานะปัจจุบัน */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-extrabold text-slate-500">ตอนนี้กบอยู่ที่</span>
              <FractionStack top={jumps} bottom={denominator} className="text-4xl font-extrabold text-emerald-600" />
            </div>
            <div
              className={cn(
                "rounded-xl px-4 py-3 text-center text-sm font-bold",
                atGoal ? "bg-emerald-50 text-emerald-700" : atStart ? "bg-slate-50 text-slate-500" : "bg-sky-50 text-sky-700"
              )}
            >
              {atGoal
                ? `🎉 ถึงฝั่งแล้ว! กระโดดครบ ${denominator} ช่อง จากทั้งหมด ${denominator} ช่อง = 1 เต็มพอดี`
                : atStart
                  ? "กบยังอยู่ที่ 0 กดปุ่ม “กระโดด!” ให้กบออกเดินทางเลย"
                  : `กบกระโดดมาแล้ว ${jumps} ช่อง จากทั้งหมด ${denominator} ช่องที่เท่ากัน`}
            </div>
          </div>

          {/* สิ่งที่ได้เรียนรู้ */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-sky-50 p-4">
              <p className="text-sm font-extrabold text-sky-700">🔢 ตัวส่วน (ตัวล่าง)</p>
              <p className="mt-1 text-sm font-bold text-sky-700">
                คือจำนวนช่องทั้งหมดที่แบ่งระหว่าง 0 กับ 1 — บึงนี้แบ่งเป็น {denominator} ช่อง
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-4">
              <p className="text-sm font-extrabold text-emerald-700">🐸 ตัวเศษ (ตัวบน)</p>
              <p className="mt-1 text-sm font-bold text-emerald-700">
                คือจำนวนช่องที่กระโดดมาแล้วจาก 0 — ตอนนี้กบกระโดดมา {jumps} ช่อง
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
