"use client";

import { useEffect, useState } from "react";
import { Flag, Lightbulb, Minus, Play, Plus, RotateCcw, Shuffle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { cn } from "@/lib/cn";
import { randInt } from "@/lib/randomFraction";

type Racer = { numerator: number; denominator: number };
type Winner = "turtle" | "rabbit" | "equal";

const DENOMINATOR_CHOICES = [2, 3, 4, 5, 6, 8, 10];
const MAX_DEN = 10;

/** เปรียบเทียบเศษส่วนด้วยการคูณไขว้ (แม่นยำ ไม่พึ่งทศนิยม) */
function compareFractions(aNum: number, aDen: number, bNum: number, bDen: number): Winner {
  const l = aNum * bDen;
  const r = bNum * aDen;
  if (l > r) return "turtle";
  if (l < r) return "rabbit";
  return "equal";
}

function randomFraction(): Racer {
  const denominator = DENOMINATOR_CHOICES[randInt(0, DENOMINATOR_CHOICES.length - 1)];
  const numerator = randInt(1, denominator); // ไม่สุ่ม 0 เพื่อให้ภาพน่าสนใจ
  return { numerator, denominator };
}

// ── พิกัด SVG ของเส้นจำนวน (viewBox กว้างเพื่อความคมชัดบนจอ TV) ──
const VBW = 1000;
const VBH = 170;
const X0 = 60;
const X1 = 900;
const USABLE = X1 - X0;
const AXIS_Y = 100;

/** ปุ่มปรับค่าคู่ (− / +) ขนาดใหญ่ กดง่ายบนจอ TV */
function BigStepper({
  label,
  onDec,
  onInc,
  decDisabled,
  incDisabled,
  color,
}: {
  label: string;
  onDec: () => void;
  onInc: () => void;
  decDisabled: boolean;
  incDisabled: boolean;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm font-extrabold text-slate-500 sm:text-base">{label}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={onDec}
          disabled={decDisabled}
          aria-label={`ลด${label}`}
          className={cn("grid h-12 w-12 place-items-center rounded-xl text-white shadow-sm transition active:scale-95 disabled:opacity-30 sm:h-14 sm:w-14", color)}
        >
          <Minus size={26} strokeWidth={3} />
        </button>
        <button
          onClick={onInc}
          disabled={incDisabled}
          aria-label={`เพิ่ม${label}`}
          className={cn("grid h-12 w-12 place-items-center rounded-xl text-white shadow-sm transition active:scale-95 disabled:opacity-30 sm:h-14 sm:w-14", color)}
        >
          <Plus size={26} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}

function RacerCard({
  emoji,
  name,
  racer,
  onChange,
  cardClass,
  fractionColor,
  buttonColor,
}: {
  emoji: string;
  name: string;
  racer: Racer;
  onChange: (r: Racer) => void;
  cardClass: string;
  fractionColor: string;
  buttonColor: string;
}) {
  function setNum(n: number) {
    onChange({ ...racer, numerator: Math.max(0, Math.min(n, racer.denominator)) });
  }
  function setDen(d: number) {
    const dd = Math.max(2, Math.min(d, MAX_DEN));
    onChange({ denominator: dd, numerator: Math.min(racer.numerator, dd) });
  }

  return (
    <div className={cn("rounded-3xl border-2 p-5 shadow-sm sm:p-6", cardClass)}>
      <div className="flex items-center justify-center gap-3">
        <span className="text-4xl sm:text-5xl" aria-hidden>{emoji}</span>
        <span className="text-xl font-extrabold text-slate-700 sm:text-2xl">{name}</span>
      </div>

      <div className="my-4 flex justify-center">
        <StackedFraction numerator={racer.numerator} denominator={racer.denominator} className="text-6xl sm:text-7xl" toneClassName={fractionColor} />
      </div>

      <div className="space-y-2.5">
        <BigStepper
          label="ตัวเศษ"
          onDec={() => setNum(racer.numerator - 1)}
          onInc={() => setNum(racer.numerator + 1)}
          decDisabled={racer.numerator <= 0}
          incDisabled={racer.numerator >= racer.denominator}
          color={buttonColor}
        />
        <BigStepper
          label="ตัวส่วน"
          onDec={() => setDen(racer.denominator - 1)}
          onInc={() => setDen(racer.denominator + 1)}
          decDisabled={racer.denominator <= 2}
          incDisabled={racer.denominator >= MAX_DEN}
          color={buttonColor}
        />
      </div>
    </div>
  );
}

/** เส้นจำนวน 0→1 แบ่งตามตัวส่วนของผู้แข่งขันหนึ่งคน พร้อม tick + label + ตัวละคร */
function RaceLine({
  racer,
  started,
  animate,
  axisColor,
  labelColor,
  emoji,
}: {
  racer: Racer;
  started: boolean;
  animate: boolean;
  axisColor: string;
  labelColor: string;
  emoji: string;
}) {
  const { numerator, denominator } = racer;
  const ticks = Array.from({ length: denominator + 1 }, (_, i) => X0 + (i / denominator) * USABLE);
  const targetPct = ((X0 + (numerator / denominator) * USABLE) / VBW) * 100;
  const startPct = (X0 / VBW) * 100;

  return (
    <div className="relative w-full" style={{ aspectRatio: `${VBW} / ${VBH}` }}>
      <svg viewBox={`0 0 ${VBW} ${VBH}`} className="absolute inset-0 h-full w-full" role="img" aria-label={`เส้นจำนวน 0 ถึง 1 แบ่ง ${denominator} ส่วน`}>
        {/* แกนหลัก */}
        <line x1={X0} y1={AXIS_Y} x2={X1} y2={AXIS_Y} stroke={axisColor} strokeWidth={4} strokeLinecap="round" />

        {!started ? (
          <text x={(X0 + X1) / 2} y={AXIS_Y - 24} textAnchor="middle" fontSize={30} fontWeight={800} fill="#94a3b8">
            กดเริ่มแข่งเพื่อดูตำแหน่ง
          </text>
        ) : (
          <>
            {/* ระยะที่วิ่งมาแล้ว 0 → numerator */}
            <line x1={ticks[0]} y1={AXIS_Y} x2={ticks[numerator]} y2={AXIS_Y} stroke={axisColor} strokeWidth={8} strokeLinecap="round" opacity={0.35} />

            {ticks.map((x, i) => {
              const isEnd = i === 0 || i === denominator;
              const isHere = i === numerator;
              return (
                <g key={i}>
                  <line x1={x} y1={AXIS_Y - (isEnd ? 20 : 12)} x2={x} y2={AXIS_Y + (isEnd ? 20 : 12)} stroke={isEnd ? "#1e293b" : "#94a3b8"} strokeWidth={isEnd ? 4 : 2.5} />
                  {isEnd ? (
                    <text x={x} y={AXIS_Y + 52} textAnchor="middle" fontSize={42} fontWeight={800} fill="#0f172a">
                      {i / denominator}
                    </text>
                  ) : (
                    <g>
                      <text x={x} y={AXIS_Y + 40} textAnchor="middle" fontSize={24} fontWeight={800} fill={isHere ? labelColor : "#64748b"}>{i}</text>
                      <line x1={x - 11} y1={AXIS_Y + 46} x2={x + 11} y2={AXIS_Y + 46} stroke={isHere ? labelColor : "#94a3b8"} strokeWidth={2} />
                      <text x={x} y={AXIS_Y + 66} textAnchor="middle" fontSize={24} fontWeight={800} fill={isHere ? labelColor : "#64748b"}>{denominator}</text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* จุดตำแหน่งตัวละคร + เส้นชี้ */}
            <line x1={ticks[numerator]} y1={AXIS_Y} x2={ticks[numerator]} y2={AXIS_Y - 44} stroke={axisColor} strokeWidth={3} strokeDasharray="4 4" />
            <circle cx={ticks[numerator]} cy={AXIS_Y} r={11} fill={axisColor} stroke="#fff" strokeWidth={3} />
          </>
        )}
      </svg>

      {/* ตัวละคร overlay — เลื่อนจากเส้นสตาร์ทไปตำแหน่งของตัวเอง */}
      {started && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-[130%] text-3xl transition-all duration-[1000ms] ease-out sm:text-4xl"
          style={{ left: `${animate ? targetPct : startPct}%`, top: `${(AXIS_Y / VBH) * 100}%` }}
          aria-hidden
        >
          {emoji}
        </div>
      )}
    </div>
  );
}

const DEFAULT_TURTLE: Racer = { numerator: 5, denominator: 8 };
const DEFAULT_RABBIT: Racer = { numerator: 4, denominator: 5 };

export function RaceNumberLine() {
  const [turtle, setTurtle] = useState<Racer>(DEFAULT_TURTLE);
  const [rabbit, setRabbit] = useState<Racer>(DEFAULT_RABBIT);
  const [hasStarted, setHasStarted] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [showExplanation, setShowExplanation] = useState(true);

  // เริ่ม transition หลัง render เฟรมแรกของสถานะ started เพื่อให้ตัวละครวิ่งจาก 0
  useEffect(() => {
    if (!hasStarted) {
      setAnimate(false);
      return;
    }
    const id = window.setTimeout(() => setAnimate(true), 60);
    return () => window.clearTimeout(id);
  }, [hasStarted, turtle, rabbit]);

  const winner = compareFractions(turtle.numerator, turtle.denominator, rabbit.numerator, rabbit.denominator);
  const sign = winner === "turtle" ? ">" : winner === "rabbit" ? "<" : "=";

  function changeTurtle(r: Racer) {
    setTurtle(r);
    setHasStarted(false);
  }
  function changeRabbit(r: Racer) {
    setRabbit(r);
    setHasStarted(false);
  }
  function randomize() {
    setTurtle(randomFraction());
    setRabbit(randomFraction());
    setHasStarted(false);
  }
  function reset() {
    setTurtle(DEFAULT_TURTLE);
    setRabbit(DEFAULT_RABBIT);
    setHasStarted(false);
  }

  return (
    <Card className="overflow-hidden rounded-3xl p-0 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-green-500 px-6 py-5 text-white">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20 text-lg font-extrabold">4</span>
        <div>
          <h2 className="text-2xl font-extrabold sm:text-3xl">แข่งกันบนเส้นจำนวน</h2>
          <p className="mt-0.5 text-sm font-bold text-emerald-100 sm:text-base">ปรับเศษส่วน แล้วดูว่าใครไปได้ไกลกว่ากันบนเส้นจำนวนจาก 0 ถึง 1</p>
        </div>
      </div>

      <div className="space-y-6 bg-gradient-to-b from-sky-50/40 to-white p-5 sm:p-6">
        {/* แผงปรับเศษส่วน + ปุ่มกลาง */}
        <div className="grid items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr]">
          <RacerCard emoji="🐢" name="นักวิ่งเต่า" racer={turtle} onChange={changeTurtle} cardClass="border-emerald-200 bg-emerald-50/60" fractionColor="text-emerald-600" buttonColor="bg-emerald-500 hover:bg-emerald-600" />

          <div className="flex flex-col items-center justify-center gap-3">
            <button
              onClick={() => setHasStarted(true)}
              className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-500 px-8 py-5 text-2xl font-extrabold text-white shadow-lg shadow-emerald-300/40 transition hover:brightness-105 active:scale-[0.98] sm:px-10 sm:py-6 sm:text-3xl"
            >
              <Flag size={30} /> เริ่มแข่ง
            </button>
            <div className="flex flex-wrap justify-center gap-2">
              <button onClick={randomize} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50">
                <Shuffle size={15} /> สุ่มโจทย์ใหม่
              </button>
              <button onClick={reset} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50">
                <RotateCcw size={15} /> รีเซต
              </button>
              <button onClick={() => setShowExplanation((v) => !v)} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50">
                <Lightbulb size={15} /> {showExplanation ? "ซ่อนวิธีคิด" : "แสดงวิธีคิด"}
              </button>
            </div>
          </div>

          <RacerCard emoji="🐰" name="นักวิ่งกระต่าย" racer={rabbit} onChange={changeRabbit} cardClass="border-pink-200 bg-pink-50/60" fractionColor="text-pink-600" buttonColor="bg-pink-500 hover:bg-pink-600" />
        </div>

        {/* พื้นที่เส้นจำนวน */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-stretch gap-3">
            <div className="flex-1 space-y-5">
              {/* เต่า */}
              <div className="flex items-center gap-3">
                <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-extrabold text-emerald-700 sm:text-base">🐢 เต่า</span>
                <div className="flex-1">
                  <RaceLine racer={turtle} started={hasStarted} animate={animate} axisColor="#10b981" labelColor="#059669" emoji="🐢" />
                </div>
              </div>
              {/* กระต่าย */}
              <div className="flex items-center gap-3">
                <span className="shrink-0 rounded-full bg-pink-100 px-3 py-1.5 text-sm font-extrabold text-pink-700 sm:text-base">🐰 กระต่าย</span>
                <div className="flex-1">
                  <RaceLine racer={rabbit} started={hasStarted} animate={animate} axisColor="#ec4899" labelColor="#db2777" emoji="🐰" />
                </div>
              </div>
            </div>

            {/* เส้นชัย */}
            <div className="flex shrink-0 flex-col items-center justify-center gap-1 border-l-4 border-rose-400 pl-2">
              <span className="text-2xl" aria-hidden>🚩</span>
              <span className="text-xs font-extrabold text-rose-500 sm:text-sm" style={{ writingMode: "vertical-rl" }}>เส้นชัย</span>
            </div>
          </div>
        </div>

        {/* ผลการแข่งขัน + วิธีคิด */}
        {hasStarted && (
          <div className={cn("grid gap-4", showExplanation ? "lg:grid-cols-2" : "")}>
            {/* การ์ดผลลัพธ์ */}
            <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 p-6 text-center shadow-sm">
              <span className="text-5xl" aria-hidden>🏆</span>
              <div className="flex items-center justify-center gap-4">
                <StackedFraction numerator={turtle.numerator} denominator={turtle.denominator} className="text-4xl sm:text-5xl" toneClassName="text-emerald-600" />
                <span className="text-4xl font-extrabold text-amber-600 sm:text-5xl">{sign}</span>
                <StackedFraction numerator={rabbit.numerator} denominator={rabbit.denominator} className="text-4xl sm:text-5xl" toneClassName="text-pink-600" />
              </div>
              <p className="text-2xl font-extrabold text-amber-700 sm:text-3xl">
                {winner === "turtle" ? "🐢 เต่าชนะ!" : winner === "rabbit" ? "🐰 กระต่ายชนะ!" : "เสมอกัน!"}
              </p>
            </div>

            {/* การ์ดวิธีคิด */}
            {showExplanation && (
              <div className="rounded-3xl border-2 border-sky-100 bg-sky-50/60 p-6 shadow-sm">
                <div className="flex items-center gap-2 text-lg font-extrabold text-sky-700 sm:text-xl">💡 วิธีคิด</div>
                <ol className="mt-3 space-y-3">
                  <li className="flex gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sky-500 text-sm font-extrabold text-white">1</span>
                    <div className="text-sm font-bold text-slate-600 sm:text-base">
                      ดูจำนวนส่วนทั้งหมด
                      <div className="text-xs font-bold text-slate-500 sm:text-sm">เส้นของเต่าแบ่งเป็น {turtle.denominator} ส่วน · เส้นของกระต่ายแบ่งเป็น {rabbit.denominator} ส่วน</div>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sky-500 text-sm font-extrabold text-white">2</span>
                    <div className="text-sm font-bold text-slate-600 sm:text-base">
                      ดูตำแหน่งบนเส้นจำนวน
                      <div className="text-xs font-bold text-slate-500 sm:text-sm">เต่าอยู่ที่ {turtle.numerator}/{turtle.denominator} · กระต่ายอยู่ที่ {rabbit.numerator}/{rabbit.denominator}</div>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sky-500 text-sm font-extrabold text-white">3</span>
                    <div className="text-sm font-bold text-slate-600 sm:text-base">
                      จุดที่อยู่ทางขวามากกว่า มีค่ามากกว่า
                      <div className="text-xs font-bold text-slate-500 sm:text-sm">
                        {winner === "equal"
                          ? `ทั้งคู่อยู่ตำแหน่งเดียวกัน จึงมีค่าเท่ากัน`
                          : `จุดของ${winner === "turtle" ? "เต่า" : "กระต่าย"}อยู่ทางขวามากกว่า จึงมีค่ามากกว่า → ${winner === "turtle" ? turtle.numerator : rabbit.numerator}/${winner === "turtle" ? turtle.denominator : rabbit.denominator} มากกว่า ${winner === "turtle" ? rabbit.numerator : turtle.numerator}/${winner === "turtle" ? rabbit.denominator : turtle.denominator}`}
                      </div>
                    </div>
                  </li>
                </ol>
              </div>
            )}
          </div>
        )}

        {/* คำแนะนำท้าย */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-center text-sm font-bold text-emerald-700">
          ⭐ ลองปรับเศษส่วน แล้วแข่งกันอีกครั้งดูนะ!
        </div>
      </div>
    </Card>
  );
}
