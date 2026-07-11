"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Check, Cog, Minus, Plus, RotateCcw, Shuffle, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { cn } from "@/lib/cn";
import { gcd } from "@/lib/fractionUtils";
import { randInt } from "@/lib/randomFraction";

function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}

const SIGNS = [">", "=", "<"] as const;
type Sign = (typeof SIGNS)[number];

type Fraction = { numerator: number; denominator: number };

const DEFAULT_LEFT: Fraction = { numerator: 1, denominator: 2 };
const DEFAULT_RIGHT: Fraction = { numerator: 2, denominator: 3 };

/** ปุ่มปรับค่าตัวใหญ่ เหมาะกับจอทีวี */
function BigStepper({
  label,
  value,
  min,
  max,
  onChange,
  color,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-xl bg-white px-3 py-2">
      <span className="text-sm font-extrabold text-slate-500 sm:text-base">{label}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(value - 1)}
          disabled={value <= min}
          aria-label={`ลด${label}`}
          className={cn("grid h-11 w-11 place-items-center rounded-xl text-white shadow-sm transition active:scale-95 disabled:opacity-30", color)}
        >
          <Minus size={22} strokeWidth={3} />
        </button>
        <span className="w-8 text-center text-xl font-extrabold text-slate-700">{value}</span>
        <button
          onClick={() => onChange(value + 1)}
          disabled={value >= max}
          aria-label={`เพิ่ม${label}`}
          className={cn("grid h-11 w-11 place-items-center rounded-xl text-white shadow-sm transition active:scale-95 disabled:opacity-30", color)}
        >
          <Plus size={22} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}

function Picker({
  fraction,
  onChange,
  color,
  buttonColor,
}: {
  fraction: Fraction;
  onChange: (f: Fraction) => void;
  color: string;
  buttonColor: string;
}) {
  function setNum(n: number) {
    onChange({ ...fraction, numerator: Math.max(1, Math.min(n, fraction.denominator - 1)) });
  }
  function setDen(d: number) {
    const dd = Math.max(2, Math.min(d, 6));
    onChange({ denominator: dd, numerator: Math.min(fraction.numerator, dd - 1) });
  }
  return (
    <div className="flex flex-col items-center gap-3">
      <StackedFraction numerator={fraction.numerator} denominator={fraction.denominator} className="text-5xl sm:text-6xl" toneClassName={color} />
      <div className="w-full space-y-2">
        <BigStepper label="ตัวเศษ" value={fraction.numerator} min={1} max={fraction.denominator - 1} onChange={setNum} color={buttonColor} />
        <BigStepper label="ตัวส่วน" value={fraction.denominator} min={2} max={6} onChange={setDen} color={buttonColor} />
      </div>
    </div>
  );
}

/** แถวตัวเลขที่ตัวส่วนคูณได้ — ไฮไลต์ตัวเลขที่ตรงกันตัวแรก (คือตัวส่วนร่วมที่ใช้) */
function MultiplesRow({ denominator, commonDen, colorText, colorRing }: { denominator: number; commonDen: number; colorText: string; colorRing: string }) {
  const count = commonDen / denominator;
  const items = Array.from({ length: count }, (_, i) => denominator * (i + 1));
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className={cn("mr-1 text-sm font-extrabold", colorText)}>ส่วน {denominator} นับเพิ่มทีละ {denominator}:</span>
      {items.map((v) => {
        const match = v === commonDen;
        return (
          <span
            key={v}
            className={cn(
              "grid h-9 min-w-9 place-items-center rounded-lg px-2 text-sm font-extrabold transition",
              match ? cn("text-white shadow", colorRing) : "bg-slate-100 text-slate-500"
            )}
          >
            {v}
          </span>
        );
      })}
    </div>
  );
}

/** แท่งแนวตั้งเดียว แบ่งชั้นตามตัวส่วน เติมสีจากล่างขึ้น เส้นแบ่งเห็นชัดทุกช่อง
    กรอบสูงเท่ากันเสมอ (แทนค่า "1 ทั้งหมด") — เศษส่วนที่ค่าเท่ากันต้องระบายสูงเท่ากันด้วย */
function VerticalBar({ fraction, fillHex }: { fraction: Fraction; fillHex: string }) {
  const pct = (fraction.numerator / fraction.denominator) * 100;
  return (
    <div className="relative h-56 w-16 sm:h-64 sm:w-20">
      <div className="absolute inset-0 overflow-hidden rounded-xl border-4 border-slate-700 bg-white shadow-inner">
        <div
          className="absolute inset-x-0 bottom-0 transition-[height] duration-700 ease-out"
          style={{ height: `${pct}%`, backgroundColor: fillHex }}
        />
        <div className="absolute inset-0 flex flex-col-reverse">
          {Array.from({ length: fraction.denominator }, (_, i) => (
            <div key={i} className="flex-1 border-t-2 border-slate-500 last:border-t-0" />
          ))}
        </div>
      </div>
    </div>
  );
}

/** คู่แท่ง "ก่อน → หลัง" ของฝั่งเดียว แสดงว่าแบ่งชั้นเพิ่มขึ้นแต่พื้นที่สีเท่าเดิม
    กำกับตัวคูณ ×factor ไว้ข้างตัวเศษและตัวส่วน ให้เห็นชัดว่าคูณทั้งคู่ด้วยเลขเดียวกัน */
function BeforeAfterBar({
  original,
  converted,
  factor,
  colorText,
  fillHex,
}: {
  original: Fraction;
  converted: Fraction;
  factor: number;
  colorText: string;
  fillHex: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-3 rounded-xl border border-slate-100 bg-white p-4">
      <div className="flex items-end gap-3 sm:gap-4">
        <div className="flex flex-col items-center gap-1.5">
          <VerticalBar fraction={original} fillHex={fillHex} />
          <div className="flex items-center gap-1.5">
            <StackedFraction numerator={original.numerator} denominator={original.denominator} className="text-xl" toneClassName={colorText} />
            <span className="flex flex-col items-center justify-center text-sm font-extrabold leading-none text-rose-500">
              <span>×{factor}</span>
              <span className="my-1.5 h-0.5 w-0" />
              <span>×{factor}</span>
            </span>
          </div>
          <span className="text-[11px] font-bold text-slate-400">ก่อนแปลง</span>
        </div>
        <ArrowRight size={26} className="mb-8 shrink-0 text-slate-400" />
        <div className="flex flex-col items-center gap-1.5">
          <VerticalBar fraction={converted} fillHex={fillHex} />
          <StackedFraction numerator={converted.numerator} denominator={converted.denominator} className="text-xl" toneClassName={colorText} />
          <span className="text-[11px] font-bold text-slate-400">หลังแปลง</span>
        </div>
      </div>
    </div>
  );
}

export function EqualizeMachine() {
  const [left, setLeft] = useState<Fraction>(DEFAULT_LEFT);
  const [right, setRight] = useState<Fraction>(DEFAULT_RIGHT);
  const [stage, setStage] = useState(0); // 0=ทาย 1=หาส่วนร่วม 2=แปลง 3=เทียบ
  const [guess, setGuess] = useState<Sign | null>(null);

  const commonDen = lcm(left.denominator, right.denominator);
  const leftFactor = commonDen / left.denominator;
  const rightFactor = commonDen / right.denominator;
  const leftNewNum = left.numerator * leftFactor;
  const rightNewNum = right.numerator * rightFactor;
  const answer: Sign = leftNewNum > rightNewNum ? ">" : leftNewNum < rightNewNum ? "<" : "=";
  const isCorrect = guess === answer;

  useEffect(() => {
    setStage(0);
    setGuess(null);
  }, [left, right]);

  function changeLeft(f: Fraction) {
    setLeft(f);
  }
  function changeRight(f: Fraction) {
    setRight(f);
  }

  function randomize() {
    const d1 = randInt(2, 6);
    const d2 = randInt(2, 6);
    setLeft({ denominator: d1, numerator: randInt(1, d1 - 1) });
    setRight({ denominator: d2, numerator: randInt(1, d2 - 1) });
  }

  function chooseGuess(sign: Sign) {
    if (guess) return;
    setGuess(sign);
  }

  function runMachine() {
    if (!guess) return;
    setStage(1);
  }

  function viewAgain() {
    setStage(0);
    setGuess(null);
  }

  return (
    <Card className="overflow-hidden rounded-3xl p-0 shadow-sm">
      <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-green-500 px-6 py-5 text-white">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20 text-lg font-extrabold">5</span>
        <div>
          <h2 className="text-2xl font-extrabold sm:text-3xl">เครื่องทำส่วนเท่ากัน</h2>
          <p className="mt-0.5 text-sm font-bold text-emerald-100 sm:text-base">วิธีที่ใช้ได้ทุกโจทย์ — ทำตัวส่วนให้เท่ากันก่อน แล้วเทียบตัวเศษ</p>
        </div>
      </div>

      <div className="space-y-5 bg-gradient-to-b from-emerald-50/40 to-white p-5 sm:p-6">
        {/* เลือกโจทย์ */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border-2 border-sky-200 bg-sky-50/60 p-4">
            <Picker fraction={left} onChange={changeLeft} color="text-sky-600" buttonColor="bg-sky-500 hover:bg-sky-600" />
          </div>
          <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/60 p-4">
            <Picker fraction={right} onChange={changeRight} color="text-emerald-600" buttonColor="bg-emerald-500 hover:bg-emerald-600" />
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={randomize}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50"
          >
            <Shuffle size={15} /> สุ่มโจทย์ใหม่
          </button>
        </div>

        {/* ทายก่อน */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center">
          <p className="text-base font-bold text-slate-600 sm:text-lg">ทายก่อน: เศษส่วนไหนมากกว่ากัน?</p>
          <div className="mt-3 flex items-center justify-center gap-3">
            {SIGNS.map((sign) => {
              const active = guess === sign;
              return (
                <button
                  key={sign}
                  onClick={() => chooseGuess(sign)}
                  disabled={guess !== null}
                  aria-label={`เลือกเครื่องหมาย ${sign}`}
                  className={cn(
                    "grid h-16 w-16 place-items-center rounded-2xl border-2 text-3xl font-extrabold transition sm:h-20 sm:w-20 sm:text-4xl",
                    !guess && "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50",
                    guess && !active && "border-slate-100 bg-slate-50 text-slate-300",
                    active && "border-emerald-400 bg-emerald-500 text-white"
                  )}
                >
                  {sign}
                </button>
              );
            })}
          </div>
          {!guess && <p className="mt-2 text-xs font-bold text-slate-400">เลือกคำตอบที่คิดไว้ก่อน แล้วค่อยกด “เดินเครื่อง” เพื่อดูวิธีตรวจสอบ</p>}
        </div>

        {/* จอเครื่อง */}
        {guess && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
            {stage === 0 && (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <Cog size={36} className="text-slate-300" />
                <p className="text-sm font-bold text-slate-500">กดปุ่ม “เดินเครื่อง” เพื่อตรวจคำตอบที่ทายไว้</p>
              </div>
            )}

            {stage >= 1 && (
              <div className="space-y-4">
                {/* ขั้น 1: หาส่วนร่วม */}
                <div className="rounded-xl bg-white p-4">
                  <div className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-700">
                    ขั้นที่ 1 — หาตัวเลขที่เป็นส่วนร่วมกันได้
                  </div>
                  <div className="mt-3 space-y-2">
                    <MultiplesRow denominator={left.denominator} commonDen={commonDen} colorText="text-sky-600" colorRing="bg-sky-500" />
                    <MultiplesRow denominator={right.denominator} commonDen={commonDen} colorText="text-emerald-600" colorRing="bg-emerald-500" />
                  </div>
                  <p className="mt-3 text-sm font-bold text-slate-600">
                    ตัวเลขแรกที่ตรงกันคือ <span className="text-lg font-extrabold text-amber-600">{commonDen}</span> — เรียกว่า{" "}
                    <span className="font-extrabold">ตัวส่วนร่วมน้อยที่สุด (ค.ร.น.)</span>
                  </p>
                </div>

                {/* ขั้น 2: แปลง */}
                {stage >= 2 && (
                  <div className="rounded-xl bg-white p-4">
                    <div className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-extrabold text-sky-700">
                      ขั้นที่ 2 — คูณให้ตัวส่วนเป็น {commonDen} ทั้งคู่
                    </div>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                      <BeforeAfterBar
                        original={left}
                        converted={{ numerator: leftNewNum, denominator: commonDen }}
                        factor={leftFactor}
                        colorText="text-sky-600"
                        fillHex="#38bdf8"
                      />
                      <BeforeAfterBar
                        original={right}
                        converted={{ numerator: rightNewNum, denominator: commonDen }}
                        factor={rightFactor}
                        colorText="text-emerald-600"
                        fillHex="#34d399"
                      />
                    </div>
                    <p className="mt-3 text-center text-xs font-bold text-slate-400">
                      แบ่งชั้นเพิ่มขึ้น แต่พื้นที่สีเท่าเดิม — ค่าของเศษส่วนไม่เปลี่ยน (คูณ {leftFactor} และ {rightFactor} ทั้งเศษและส่วน)
                    </p>
                  </div>
                )}

                {/* ขั้น 3: เทียบ */}
                {stage >= 3 && (
                  <div className="rounded-xl bg-emerald-50 p-4">
                    <div className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-700">ขั้นที่ 3 — เทียบตัวเศษ</div>
                    <p className="mt-2 text-sm font-bold text-emerald-700">
                      ตัวส่วนเท่ากันแล้ว ({commonDen}) จึงเทียบตัวเศษ: {leftNewNum} {answer === ">" ? "มากกว่า" : answer === "<" ? "น้อยกว่า" : "เท่ากับ"} {rightNewNum}
                    </p>
                    <div className="mt-3 flex items-center justify-center gap-3">
                      <StackedFraction numerator={left.numerator} denominator={left.denominator} className="text-2xl" toneClassName="text-sky-600" />
                      <span className="text-3xl font-extrabold text-emerald-700">{answer}</span>
                      <StackedFraction numerator={right.numerator} denominator={right.denominator} className="text-2xl" toneClassName="text-emerald-600" />
                    </div>

                    <div
                      className={cn(
                        "mt-4 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold sm:text-base",
                        isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-rose-50 text-rose-600"
                      )}
                    >
                      {isCorrect ? <Check size={19} className="shrink-0" /> : <X size={19} className="shrink-0" />}
                      {isCorrect ? "ที่ทายไว้ถูกต้องแล้ว!" : `ที่ทายไว้ยังไม่ถูก คำตอบจริงคือ ${answer}`}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ปุ่มควบคุม */}
        {guess && (
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {stage < 3 ? (
              <button
                onClick={stage === 0 ? runMachine : () => setStage((s) => s + 1)}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-base font-extrabold text-white transition hover:bg-emerald-700 active:scale-[0.98]"
              >
                <Cog size={18} /> {stage === 0 ? "เดินเครื่อง" : "ขั้นถัดไป"}
              </button>
            ) : (
              <button
                onClick={viewAgain}
                className="flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-5 py-2.5 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50"
              >
                <RotateCcw size={15} /> ทายข้อใหม่
              </button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
