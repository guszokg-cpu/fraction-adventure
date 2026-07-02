"use client";

import { useState } from "react";
import { Check, RefreshCw, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FractionStack } from "@/components/fractions/FractionStack";
import { cn } from "@/lib/cn";
import { randInt } from "@/lib/randomFraction";

// พิกัดเดียวกับ NumberLineStrip เพื่อความสม่ำเสมอของภาพ
const LEFT = 26;
const RIGHT = 294;
const USABLE = RIGHT - LEFT;
const LINE_Y = 64;

const POINT_COLORS = ["#ec4899", "#0ea5e9", "#f59e0b"];

type LinePoint = { numerator: number; color: string };

/** เส้นจำนวนที่วางได้หลายจุดพร้อมกัน — ป้ายเศษส่วนสลับสูงต่ำกันไม่ให้ทับกัน */
function MultiPointLine({ denominator, points }: { denominator: number; points: LinePoint[] }) {
  const ticks = Array.from({ length: denominator + 1 }, (_, i) => LEFT + (i / denominator) * USABLE);
  const sorted = [...points].sort((a, b) => a.numerator - b.numerator);

  return (
    <svg viewBox="0 0 320 104" className="h-full w-full" role="img" aria-label={`เส้นจำนวนแสดง ${points.length} จุด`}>
      <line x1={LEFT - 12} y1={LINE_Y} x2={RIGHT + 12} y2={LINE_Y} stroke="#334155" strokeWidth={2.4} strokeLinecap="round" />
      <polygon points={`${LEFT - 12},${LINE_Y} ${LEFT - 4},${LINE_Y - 4.5} ${LEFT - 4},${LINE_Y + 4.5}`} fill="#334155" />
      <polygon points={`${RIGHT + 12},${LINE_Y} ${RIGHT + 4},${LINE_Y - 4.5} ${RIGHT + 4},${LINE_Y + 4.5}`} fill="#334155" />

      {ticks.map((x, i) => {
        const isWhole = i === 0 || i === denominator;
        return (
          <g key={i}>
            <line
              x1={x}
              y1={LINE_Y - (isWhole ? 11 : 6)}
              x2={x}
              y2={LINE_Y + (isWhole ? 11 : 6)}
              stroke={isWhole ? "#334155" : "#94a3b8"}
              strokeWidth={isWhole ? 2.2 : 1.4}
            />
            {isWhole && (
              <text x={x} y={LINE_Y + 28} textAnchor="middle" fontSize={13} fontWeight={800} fill="#1e1b4b">
                {i / denominator}
              </text>
            )}
          </g>
        );
      })}

      {sorted.map((p, idx) => {
        const x = ticks[p.numerator];
        const high = idx % 2 === 0;
        const bubbleTop = high ? 2 : 24;
        return (
          <g key={p.numerator}>
            <line x1={x} y1={LINE_Y} x2={x} y2={bubbleTop + 27} stroke={p.color} strokeWidth={2} strokeDasharray="3 3" />
            <rect x={x - 11} y={bubbleTop} width={22} height={26} rx={6} fill={p.color} />
            <text x={x} y={bubbleTop + 10} textAnchor="middle" fontSize={9} fontWeight={800} fill="#ffffff">
              {p.numerator}
            </text>
            <line x1={x - 6} y1={bubbleTop + 13} x2={x + 6} y2={bubbleTop + 13} stroke="#ffffff" strokeWidth={1} />
            <text x={x} y={bubbleTop + 24} textAnchor="middle" fontSize={9} fontWeight={800} fill="#ffffff">
              {denominator}
            </text>
            <circle cx={x} cy={LINE_Y} r={7} fill={p.color} stroke="#ffffff" strokeWidth={2.4} />
          </g>
        );
      })}
    </svg>
  );
}

const DENOMINATOR_OPTIONS = [4, 5, 6, 8];
const MAX_POINTS = 3;

export function MultiPointCompare() {
  // ── โซนทดลองวางหลายจุด ──
  const [denominator, setDenominator] = useState(6);
  const [selectedNums, setSelectedNums] = useState<number[]>([2, 5]);

  // ── มินิเกม "จุดไหนโตกว่า" — ค่าเริ่มต้นตายตัว (กัน hydration mismatch) สุ่มจริงเมื่อกดปุ่ม ──
  const [duel, setDuel] = useState({ denominator: 5, a: 2, b: 4 });
  const [picked, setPicked] = useState<number | null>(null);

  const points: LinePoint[] = selectedNums.map((n, i) => ({ numerator: n, color: POINT_COLORS[i] }));
  const sortedNums = [...selectedNums].sort((a, b) => a - b);

  function chooseDenominator(d: number) {
    setDenominator(d);
    setSelectedNums((prev) => prev.filter((n) => n < d).slice(0, MAX_POINTS));
  }

  function togglePoint(n: number) {
    setSelectedNums((prev) => {
      if (prev.includes(n)) return prev.filter((v) => v !== n);
      if (prev.length >= MAX_POINTS) return prev;
      return [...prev, n];
    });
  }

  function newDuel() {
    const d = randInt(4, 8);
    const a = randInt(1, d - 1);
    let b = randInt(1, d - 1);
    let tries = 0;
    while (b === a && tries++ < 20) b = randInt(1, d - 1);
    if (b === a) b = a === 1 ? 2 : a - 1;
    setDuel({ denominator: d, a, b });
    setPicked(null);
  }

  const duelMax = Math.max(duel.a, duel.b);
  const duelMin = Math.min(duel.a, duel.b);
  const duelPoints: LinePoint[] = [
    { numerator: duel.a, color: POINT_COLORS[0] },
    { numerator: duel.b, color: POINT_COLORS[1] },
  ];

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden rounded-3xl p-0 shadow-sm">
        <div className="flex items-center gap-3 bg-gradient-to-r from-sky-600 to-indigo-500 px-6 py-5 text-white">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20 text-lg font-extrabold">
            4
          </span>
          <div>
            <h2 className="text-2xl font-extrabold">เทียบหลายจุดบนเส้นเดียว</h2>
            <p className="mt-0.5 text-sm font-bold text-sky-100">วางหลายเศษส่วนพร้อมกัน แล้วดูว่าใครอยู่ซ้าย ใครอยู่ขวา</p>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <div className="rounded-2xl bg-amber-50 px-5 py-3 text-center text-base font-bold text-amber-700">
            เคล็ดลับสำคัญ: บนเส้นจำนวน จุดที่อยู่ขวากว่า มีค่ามากกว่าเสมอ!
          </div>

          {/* เลือกตัวส่วน */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-extrabold text-slate-600">แบ่งเส้นเป็นกี่ช่อง:</span>
            {DENOMINATOR_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => chooseDenominator(d)}
                className={cn(
                  "h-10 w-10 rounded-xl border-2 text-sm font-extrabold transition",
                  d === denominator
                    ? "border-sky-600 bg-sky-600 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-sky-300"
                )}
              >
                {d}
              </button>
            ))}
          </div>

          {/* เลือกจุด (สูงสุด 3) */}
          <div>
            <div className="flex items-center gap-2 text-sm font-extrabold text-slate-600">
              เลือกเศษส่วนมาวางบนเส้น
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-500">
                เลือกได้สูงสุด {MAX_POINTS} จุด — คลิกซ้ำเพื่อเอาออก
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {Array.from({ length: denominator - 1 }, (_, i) => i + 1).map((n) => {
                const idx = selectedNums.indexOf(n);
                const active = idx >= 0;
                return (
                  <button
                    key={n}
                    onClick={() => togglePoint(n)}
                    className={cn(
                      "flex h-14 w-12 items-center justify-center rounded-xl border-2 transition",
                      active ? "text-white" : "border-slate-200 bg-white text-brand-900 hover:border-sky-300"
                    )}
                    style={active ? { backgroundColor: POINT_COLORS[idx], borderColor: POINT_COLORS[idx] } : undefined}
                  >
                    <FractionStack top={n} bottom={denominator} className="text-sm font-extrabold" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* เส้นจำนวนหลายจุด */}
          <div className="rounded-2xl border border-sky-100 bg-sky-50/40 p-4">
            {points.length === 0 ? (
              <p className="py-8 text-center text-sm font-bold text-slate-400">ยังไม่มีจุดบนเส้น — ลองเลือกเศษส่วนด้านบนดูสิ</p>
            ) : (
              <MultiPointLine denominator={denominator} points={points} />
            )}
          </div>

          {/* สรุปการเปรียบเทียบ */}
          {sortedNums.length >= 2 && (
            <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl bg-emerald-50 px-5 py-4 text-emerald-700">
              <span className="text-sm font-extrabold">เรียงจากน้อยไปมาก:</span>
              {sortedNums.map((n, i) => (
                <span key={n} className="flex items-center gap-2">
                  {i > 0 && <span className="text-lg font-extrabold">&lt;</span>}
                  <FractionStack top={n} bottom={denominator} className="text-lg font-extrabold" />
                </span>
              ))}
              <span className="w-full text-center text-xs font-bold sm:w-auto">← ยิ่งอยู่ขวา ยิ่งมีค่ามาก</span>
            </div>
          )}
        </div>
      </Card>

      {/* ── มินิเกม: จุดไหนโตกว่า ── */}
      <Card className="rounded-3xl shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-extrabold text-brand-900">⚖️ จุดไหนโตกว่า?</h3>
          <button
            onClick={newDuel}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-500 transition hover:bg-slate-50"
          >
            <RefreshCw size={13} />
            สุ่มคู่ใหม่
          </button>
        </div>
        <p className="mt-1 text-sm font-bold text-slate-500">ดูตำแหน่งบนเส้น แล้วตอบว่าเศษส่วนใดมีค่ามากกว่า</p>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
          <MultiPointLine denominator={duel.denominator} points={duelPoints} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {[duel.a, duel.b].map((n, i) => {
            const chosen = picked === n;
            const right = n === duelMax;
            return (
              <button
                key={i}
                onClick={() => picked === null && setPicked(n)}
                disabled={picked !== null}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl border-2 py-4 transition",
                  !picked && "border-slate-200 bg-white hover:border-sky-300 hover:bg-sky-50",
                  picked !== null && !chosen && !right && "border-slate-100 bg-slate-50 opacity-40",
                  chosen && right && "border-emerald-400 bg-emerald-50",
                  chosen && !right && "border-rose-400 bg-rose-50",
                  picked !== null && right && !chosen && "border-emerald-300 bg-emerald-50/70"
                )}
              >
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: POINT_COLORS[i] }} />
                <FractionStack top={n} bottom={duel.denominator} className="text-2xl font-extrabold text-brand-900" />
              </button>
            );
          })}
        </div>

        {picked !== null && (
          <div
            className={cn(
              "mt-4 flex items-start gap-2 rounded-xl px-4 py-3 text-sm font-bold",
              picked === duelMax ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"
            )}
          >
            {picked === duelMax ? <Check size={17} className="mt-0.5 shrink-0" /> : <X size={17} className="mt-0.5 shrink-0" />}
            <span>
              {picked === duelMax ? "ถูกต้อง! " : "ยังไม่ใช่ — "}
              {duelMax}/{duel.denominator} อยู่ขวากว่า {duelMin}/{duel.denominator} บนเส้นจำนวน จึงมีค่ามากกว่า
            </span>
          </div>
        )}
      </Card>
    </div>
  );
}
