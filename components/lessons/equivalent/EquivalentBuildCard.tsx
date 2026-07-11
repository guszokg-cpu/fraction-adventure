"use client";

import { useState } from "react";
import { Check, RefreshCw, Shuffle, Trophy, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionStack, SectionHeader } from "@/components/lessons/equivalent/EquivalentMath";
import { cn } from "@/lib/cn";
import { gcd } from "@/lib/fractionUtils";
import { randInt, shuffle } from "@/lib/randomFraction";

type Fraction = { numerator: number; denominator: number };
type Mode = "expand" | "reduce";
type ChainStep = Fraction & { divisor?: number };

const FACTORS = [2, 3, 4, 5];
const MAX_CHAIN = 4;

const BASES: Fraction[] = [
  { numerator: 1, denominator: 2 },
  { numerator: 1, denominator: 3 },
  { numerator: 2, denominator: 3 },
  { numerator: 1, denominator: 4 },
  { numerator: 3, denominator: 4 },
  { numerator: 2, denominator: 5 },
  { numerator: 3, denominator: 5 },
];

function crossEqual(a: Fraction, b: Fraction) {
  return a.numerator * b.denominator === b.numerator * a.denominator;
}

/* ---------- โจทย์ท้าทาย ---------- */

type Challenge =
  | { kind: "missing"; base: Fraction; m: number; missing: "num" | "den"; answer: number; choices: number[] }
  | { kind: "reduce"; shown: Fraction; answer: Fraction; choices: Fraction[] };

function makeMissingChallenge(): Challenge {
  const base = BASES[randInt(0, BASES.length - 1)];
  const m = randInt(2, 4);
  const missing: "num" | "den" = Math.random() < 0.5 ? "num" : "den";
  const answer = missing === "num" ? base.numerator * m : base.denominator * m;
  const trapAdd = missing === "num" ? base.numerator + m : base.denominator + m;
  const candidates = [answer, trapAdd, answer + (missing === "num" ? base.denominator : base.numerator), answer - 1];
  const choices: number[] = [];
  for (const c of candidates) {
    if (c < 1 || choices.includes(c)) continue;
    choices.push(c);
    if (choices.length === 3) break;
  }
  while (choices.length < 3) {
    const c = answer + randInt(1, 6);
    if (!choices.includes(c)) choices.push(c);
  }
  return { kind: "missing", base, m, missing, answer, choices: shuffle(choices) };
}

function makeReduceChallenge(): Challenge {
  const answer = BASES[randInt(0, BASES.length - 1)];
  const g = randInt(2, 4);
  const shown = { numerator: answer.numerator * g, denominator: answer.denominator * g };
  const candidates: Fraction[] = [
    { numerator: answer.numerator + 1, denominator: answer.denominator + 1 },
    { numerator: shown.numerator / 2, denominator: shown.denominator / 2 },
    { numerator: answer.numerator, denominator: answer.denominator + 1 },
    { numerator: answer.numerator + 1, denominator: answer.denominator + 2 },
  ];
  const wrongs: Fraction[] = [];
  for (const c of candidates) {
    if (!Number.isInteger(c.numerator) || !Number.isInteger(c.denominator)) continue;
    if (c.numerator < 1 || c.denominator < 2) continue;
    if (crossEqual(c, answer)) continue;
    if (wrongs.some((w) => w.numerator === c.numerator && w.denominator === c.denominator)) continue;
    wrongs.push(c);
    if (wrongs.length === 2) break;
  }
  return { kind: "reduce", shown, answer, choices: shuffle([answer, ...wrongs]) };
}

function makeChallenge(): Challenge {
  return Math.random() < 0.5 ? makeMissingChallenge() : makeReduceChallenge();
}

/* ---------- ชิ้นส่วนแสดงผล ---------- */

function FactorCol({ symbol, value, className }: { symbol: string; value: number; className?: string }) {
  return (
    <span className={cn("inline-flex flex-col items-center gap-2 align-middle text-xl font-extrabold sm:text-2xl", className)}>
      <span>
        {symbol}
        {value}
      </span>
      <span>
        {symbol}
        {value}
      </span>
    </span>
  );
}

function BarRow({ label, frac, tone }: { label: string; frac: Fraction; tone: "emerald" | "accent" }) {
  const textColor = tone === "emerald" ? "text-emerald-700" : "text-amber-600";
  return (
    <div className="grid grid-cols-[3.5rem_1fr_4.5rem] items-center gap-3">
      <span className="text-center text-sm font-extrabold text-slate-500">{label}</span>
      <FractionShape numerator={frac.numerator} denominator={frac.denominator} shape="bar" tone={tone} className="h-12 w-full sm:h-14" />
      <FractionStack top={frac.numerator} bottom={frac.denominator} className={cn("justify-self-center text-2xl sm:text-3xl", textColor)} />
    </div>
  );
}

function StepBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-xl font-extrabold text-slate-600 transition hover:bg-slate-200 active:scale-95"
    >
      {children}
    </button>
  );
}

/* ---------- การ์ดหลัก ---------- */

export function EquivalentBuildCard() {
  const [mode, setMode] = useState<Mode>("expand");

  // โหมดขยาย (คูณ)
  const [eNum, setENum] = useState(1);
  const [eDen, setEDen] = useState(2);
  const [factor, setFactor] = useState(2);

  // โหมดย่อ (หาร) — เก็บสายการหารเป็นทอด ๆ
  const [chain, setChain] = useState<ChainStep[]>([{ numerator: 8, denominator: 12 }]);

  // โจทย์ท้าทาย
  const [challenge, setChallenge] = useState<Challenge>(() => makeChallenge());
  const [picked, setPicked] = useState<number | null>(null);

  const expandResult = { numerator: eNum * factor, denominator: eDen * factor };
  const current = chain[chain.length - 1];
  const isLowest = gcd(current.numerator, current.denominator) === 1;

  function divisorAvail(d: number) {
    return current.numerator % d === 0 && current.denominator % d === 0;
  }

  function setStart(n: number, d: number) {
    const den = Math.min(20, Math.max(2, d));
    const num = Math.min(den, Math.max(1, n));
    setChain([{ numerator: num, denominator: den }]);
  }

  function applyDivide(d: number) {
    if (!divisorAvail(d) || chain.length >= MAX_CHAIN) return;
    setChain((prev) => {
      const cur = prev[prev.length - 1];
      return [...prev, { numerator: cur.numerator / d, denominator: cur.denominator / d, divisor: d }];
    });
  }

  function randomReducible() {
    const b = BASES[randInt(0, BASES.length - 1)];
    const maxG = Math.floor(20 / b.denominator);
    const g = randInt(2, Math.max(2, Math.min(4, maxG)));
    setChain([{ numerator: b.numerator * g, denominator: b.denominator * g }]);
  }

  const answered = picked !== null;

  function isChoiceCorrect(i: number) {
    if (challenge.kind === "missing") return challenge.choices[i] === challenge.answer;
    const c = challenge.choices[i];
    return c.numerator === challenge.answer.numerator && c.denominator === challenge.answer.denominator;
  }

  const pickedCorrect = answered && isChoiceCorrect(picked);

  function nextChallenge() {
    setChallenge(makeChallenge());
    setPicked(null);
  }

  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={3} title="สร้างเศษส่วนที่เท่ากัน: ขยายและย่อ" />
      <div className="space-y-6 p-5 sm:p-6">
        {/* สลับโหมด */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setMode("expand")}
            className={cn(
              "flex h-12 items-center justify-center gap-2 rounded-xl text-base font-extrabold transition sm:text-lg",
              mode === "expand" ? "bg-emerald-600 text-white shadow-md" : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            )}
          >
            × ขยาย (คูณ)
          </button>
          <button
            onClick={() => setMode("reduce")}
            className={cn(
              "flex h-12 items-center justify-center gap-2 rounded-xl text-base font-extrabold transition sm:text-lg",
              mode === "reduce" ? "bg-amber-500 text-white shadow-md" : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            )}
          >
            ÷ ย่อ (หาร)
          </button>
        </div>

        {mode === "expand" ? (
          <div className="space-y-5">
            {/* ตั้งค่าเศษส่วนตั้งต้น */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-500">เศษ</span>
                <StepBtn onClick={() => setENum((n) => Math.max(1, n - 1))}>−</StepBtn>
                <span className="w-9 text-center text-3xl font-extrabold text-emerald-700">{eNum}</span>
                <StepBtn onClick={() => setENum((n) => Math.min(eDen, n + 1))}>+</StepBtn>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-500">ส่วน</span>
                <StepBtn
                  onClick={() => {
                    const nd = Math.max(2, eDen - 1);
                    setEDen(nd);
                    setENum((n) => Math.min(n, nd));
                  }}
                >
                  −
                </StepBtn>
                <span className="w-9 text-center text-3xl font-extrabold text-emerald-700">{eDen}</span>
                <StepBtn onClick={() => setEDen((d) => Math.min(6, d + 1))}>+</StepBtn>
              </div>
            </div>

            {/* เลือกตัวคูณ */}
            <div className="flex items-center justify-center gap-2">
              {FACTORS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFactor(f)}
                  className={cn(
                    "h-12 w-16 rounded-xl text-xl font-extrabold transition",
                    factor === f ? "bg-emerald-600 text-white shadow-md" : "border border-slate-200 bg-white text-slate-500 hover:bg-emerald-50"
                  )}
                >
                  ×{f}
                </button>
              ))}
            </div>

            {/* สมการ */}
            <div className="flex items-center justify-center gap-4 rounded-2xl bg-emerald-50 px-4 py-4">
              <FractionStack top={eNum} bottom={eDen} className="text-3xl text-emerald-800 sm:text-4xl" />
              <FactorCol symbol="×" value={factor} className="text-emerald-600" />
              <span className="text-3xl font-extrabold text-slate-400 sm:text-4xl">=</span>
              <FractionStack top={expandResult.numerator} bottom={expandResult.denominator} className="text-3xl text-emerald-800 sm:text-4xl" />
            </div>

            {/* บาร์ก่อน/หลัง ยาวเท่ากันเสมอ */}
            <div className="space-y-3">
              <BarRow label="ก่อน" frac={{ numerator: eNum, denominator: eDen }} tone="emerald" />
              <BarRow label="หลัง" frac={expandResult} tone="emerald" />
            </div>

            <p className="text-center text-sm font-bold text-slate-600 sm:text-base">
              แบ่งถี่ขึ้น {factor} เท่า แต่พื้นที่ระบายเท่าเดิม — <span className="text-emerald-700">ค่าไม่เปลี่ยน</span>
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* ตั้งค่าเศษส่วนเริ่มต้น */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-500">เศษ</span>
                <StepBtn onClick={() => setStart(chain[0].numerator - 1, chain[0].denominator)}>−</StepBtn>
                <span className="w-9 text-center text-3xl font-extrabold text-amber-600">{chain[0].numerator}</span>
                <StepBtn onClick={() => setStart(chain[0].numerator + 1, chain[0].denominator)}>+</StepBtn>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-500">ส่วน</span>
                <StepBtn onClick={() => setStart(chain[0].numerator, chain[0].denominator - 1)}>−</StepBtn>
                <span className="w-9 text-center text-3xl font-extrabold text-amber-600">{chain[0].denominator}</span>
                <StepBtn onClick={() => setStart(chain[0].numerator, chain[0].denominator + 1)}>+</StepBtn>
              </div>
              <button
                onClick={randomReducible}
                className="flex h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50"
              >
                <Shuffle size={15} /> สุ่มเศษส่วนให้ย่อ
              </button>
            </div>

            {/* เลือกตัวหาร — ปุ่มจางคือหารไม่ลงตัว */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-2">
                {FACTORS.map((d) => (
                  <button
                    key={d}
                    onClick={() => applyDivide(d)}
                    disabled={!divisorAvail(d) || chain.length >= MAX_CHAIN}
                    className={cn(
                      "h-12 w-16 rounded-xl text-xl font-extrabold transition",
                      divisorAvail(d) && chain.length < MAX_CHAIN
                        ? "bg-amber-500 text-white shadow-md hover:bg-amber-600 active:scale-95"
                        : "cursor-not-allowed border border-slate-200 bg-white text-slate-300"
                    )}
                  >
                    ÷{d}
                  </button>
                ))}
              </div>
              <p className="text-center text-xs font-bold text-slate-400">
                ปุ่มจาง = หารไม่ลงตัว (ต้องหารทั้งเศษและส่วนได้ลงตัวพร้อมกัน)
              </p>
            </div>

            {/* สมการสายการหาร */}
            <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-amber-50 px-4 py-4">
              {chain.map((step, i) => (
                <span key={i} className="flex items-center gap-3">
                  {i > 0 && (
                    <>
                      <FactorCol symbol="÷" value={step.divisor ?? 1} className="text-amber-600" />
                      <span className="text-3xl font-extrabold text-slate-400">=</span>
                    </>
                  )}
                  <FractionStack top={step.numerator} bottom={step.denominator} className="text-3xl text-amber-700 sm:text-4xl" />
                </span>
              ))}
            </div>

            {/* บาร์แต่ละทอด ยาวเท่ากันเสมอ */}
            <div className="space-y-3">
              {chain.map((step, i) => (
                <BarRow key={i} label={i === 0 ? "เริ่ม" : `÷${step.divisor}`} frac={step} tone="accent" />
              ))}
            </div>

            {/* สถานะ: ย่อได้อีก / อย่างต่ำแล้ว */}
            {isLowest ? (
              <div className="flex items-center justify-center gap-2 rounded-xl bg-yellow-100 px-4 py-3 text-base font-extrabold text-yellow-700 sm:text-lg">
                <Trophy size={22} className="shrink-0" /> เป็นเศษส่วนอย่างต่ำแล้ว!
              </div>
            ) : (
              <div className="rounded-xl bg-amber-50 px-4 py-3 text-center text-sm font-extrabold text-amber-700 sm:text-base">
                ยังย่อได้อีก — กดปุ่มหารต่อได้เลย!
              </div>
            )}

            {chain.length > 1 && (
              <div className="flex justify-center">
                <button
                  onClick={() => setChain((prev) => [prev[0]])}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-500 transition hover:bg-slate-50 sm:text-sm"
                >
                  <RefreshCw size={13} /> เริ่มใหม่
                </button>
              </div>
            )}
          </div>
        )}

        {/* โจทย์ท้าทาย */}
        <div className="rounded-2xl border-2 border-slate-200 bg-slate-50/60 p-4 sm:p-5">
          <p className="text-center text-base font-extrabold text-slate-700 sm:text-lg">
            {challenge.kind === "missing" ? "เติมตัวที่หายไป" : "ย่อให้เป็นเศษส่วนอย่างต่ำ"}
          </p>

          <div className="mt-3 flex items-center justify-center gap-4 rounded-xl bg-white px-4 py-4 ring-1 ring-slate-100">
            {challenge.kind === "missing" ? (
              <>
                <FractionStack top={challenge.base.numerator} bottom={challenge.base.denominator} className="text-3xl text-sky-700 sm:text-4xl" />
                <span className="text-3xl font-extrabold text-slate-400 sm:text-4xl">=</span>
                <FractionStack
                  top={challenge.missing === "num" ? "?" : challenge.base.numerator * challenge.m}
                  bottom={challenge.missing === "den" ? "?" : challenge.base.denominator * challenge.m}
                  className="text-3xl text-violet-700 sm:text-4xl"
                />
              </>
            ) : (
              <>
                <FractionStack top={challenge.shown.numerator} bottom={challenge.shown.denominator} className="text-3xl text-sky-700 sm:text-4xl" />
                <span className="text-3xl font-extrabold text-slate-400 sm:text-4xl">=</span>
                <FractionStack top="?" bottom="?" className="text-3xl text-violet-700 sm:text-4xl" />
              </>
            )}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {challenge.choices.map((choice, i) => {
              const correct = isChoiceCorrect(i);
              const isPicked = picked === i;
              return (
                <button
                  key={i}
                  onClick={() => !answered && setPicked(i)}
                  disabled={answered}
                  className={cn(
                    "flex min-h-14 items-center justify-center rounded-2xl border-2 bg-white p-3 transition",
                    !answered && "border-slate-200 hover:border-violet-300 hover:bg-violet-50",
                    answered && correct && "border-emerald-400 bg-emerald-50",
                    answered && !correct && isPicked && "border-rose-400 bg-rose-50",
                    answered && !correct && !isPicked && "border-slate-100 opacity-60"
                  )}
                >
                  {challenge.kind === "missing" ? (
                    <span className="text-2xl font-extrabold text-slate-700 sm:text-3xl">{choice as number}</span>
                  ) : (
                    <FractionStack
                      top={(choice as Fraction).numerator}
                      bottom={(choice as Fraction).denominator}
                      className="text-2xl text-slate-700 sm:text-3xl"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {answered && (
            <div
              className={cn(
                "mt-4 flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-center text-sm font-bold sm:text-base",
                pickedCorrect ? "bg-emerald-100 text-emerald-700" : "bg-rose-50 text-rose-600"
              )}
            >
              {pickedCorrect ? <Check size={18} className="shrink-0" /> : <X size={18} className="shrink-0" />}
              {challenge.kind === "missing" ? (
                <span className="flex flex-wrap items-center justify-center gap-1.5">
                  {pickedCorrect ? "ถูกต้อง!" : "ยังไม่ถูก —"} คูณทั้งเศษและส่วนด้วย {challenge.m} จึงได้
                  <FractionStack
                    top={challenge.base.numerator * challenge.m}
                    bottom={challenge.base.denominator * challenge.m}
                    className="text-lg"
                  />
                </span>
              ) : (
                <span className="flex flex-wrap items-center justify-center gap-1.5">
                  {pickedCorrect ? "ถูกต้อง!" : "ยังไม่ถูก —"} หารทั้งเศษและส่วนด้วย{" "}
                  {challenge.shown.numerator / challenge.answer.numerator} จึงได้
                  <FractionStack top={challenge.answer.numerator} bottom={challenge.answer.denominator} className="text-lg" />
                </span>
              )}
            </div>
          )}

          <div className="mt-3 flex justify-center">
            <button
              onClick={nextChallenge}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-slate-500 transition hover:bg-slate-50 sm:text-sm"
            >
              <Shuffle size={13} /> ข้อใหม่
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
