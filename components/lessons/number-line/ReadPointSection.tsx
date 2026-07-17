"use client";

import { useState } from "react";
import { ArrowRight, Check, RefreshCw, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FractionStack } from "@/components/fractions/FractionStack";
import { NumberLineStrip } from "@/components/lessons/number-line/NumberLineStrip";
import { Frac } from "@/components/lessons/Frac";
import { cn } from "@/lib/cn";
import { randInt, shuffle } from "@/lib/randomFraction";

// พิกัดต้องตรงกับ NumberLineStrip เพื่อให้ป้ายนับช่องวางตรงตำแหน่ง
const LEFT = 26;
const RIGHT = 294;
const USABLE = RIGHT - LEFT;
const LINE_Y = 58;

/** เส้นจำนวนประกอบการสอน 3 ขั้น — ไฮไลต์ตามขั้นที่เลือก */
function WalkthroughLine({ denominator, marker, stage }: { denominator: number; marker: number; stage: number }) {
  const ticks = Array.from({ length: denominator + 1 }, (_, i) => LEFT + (i / denominator) * USABLE);

  return (
    <svg viewBox="0 0 320 96" className="h-full w-full" role="img" aria-label={`เส้นจำนวนสอนอ่านจุด ${marker} ส่วน ${denominator}`}>
      {/* เส้นหลัก */}
      <line x1={LEFT - 12} y1={LINE_Y} x2={RIGHT + 12} y2={LINE_Y} stroke="#334155" strokeWidth={2.4} strokeLinecap="round" />
      <polygon points={`${LEFT - 12},${LINE_Y} ${LEFT - 4},${LINE_Y - 4.5} ${LEFT - 4},${LINE_Y + 4.5}`} fill="#334155" />
      <polygon points={`${RIGHT + 12},${LINE_Y} ${RIGHT + 4},${LINE_Y - 4.5} ${RIGHT + 4},${LINE_Y + 4.5}`} fill="#334155" />

      {/* ขั้นที่ 2: ไฮไลต์ระยะจาก 0 ถึงจุด */}
      {stage >= 2 && (
        <line x1={ticks[0]} y1={LINE_Y} x2={ticks[marker]} y2={LINE_Y} stroke="#10b981" strokeWidth={5} strokeLinecap="round" />
      )}

      {/* ขั้นที่ 1: ป้ายนับช่องเหนือแต่ละช่อง */}
      {stage >= 1 &&
        Array.from({ length: denominator }, (_, i) => {
          const mid = (ticks[i] + ticks[i + 1]) / 2;
          const counted = stage >= 2 && i < marker;
          return (
            <g key={i}>
              <circle cx={mid} cy={30} r={9.5} fill={counted ? "#10b981" : "#f59e0b"} />
              <text x={mid} y={34} textAnchor="middle" fontSize={10} fontWeight={800} fill="#ffffff">
                {i + 1}
              </text>
            </g>
          );
        })}

      {/* ขีดและป้ายตัวเลข */}
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

      {/* จุดที่ต้องอ่าน — แสดงเสมอ */}
      <circle cx={ticks[marker]} cy={LINE_Y} r={7} fill="#8b5cf6" stroke="#ffffff" strokeWidth={2.4} />
    </svg>
  );
}

const WALKTHROUGH_STEPS = [
  { id: 1, label: "นับช่องทั้งหมด" },
  { id: 2, label: "นับช่องถึงจุด" },
  { id: 3, label: "เขียนเศษส่วน" },
];

/** โจทย์ฝึกข้อแรกตายตัว (กัน hydration mismatch) — ข้อถัด ๆ ไปสุ่มจริงเมื่อผู้เรียนกดปุ่ม */
const FIRST_PRACTICE = { numerator: 2, denominator: 5, choices: ["2/5", "3/5", "1/5", "4/5"] };

function makePractice(): { numerator: number; denominator: number; choices: string[] } {
  const denominator = randInt(3, 9);
  const numerator = randInt(1, denominator - 1);
  const correct = `${numerator}/${denominator}`;
  const candidates = shuffle([
    `${denominator - numerator}/${denominator}`,
    `${numerator + 1}/${denominator}`,
    `${Math.max(1, numerator - 1)}/${denominator}`,
    `${numerator}/${denominator + 1}`,
    `${numerator}/${denominator + 2}`,
  ]);
  const wrongs: string[] = [];
  for (const c of candidates) {
    if (c !== correct && !wrongs.includes(c)) wrongs.push(c);
    if (wrongs.length === 3) break;
  }
  return { numerator, denominator, choices: shuffle([correct, ...wrongs]) };
}

export function ReadPointSection() {
  // ส่วนสอน 3 ขั้น
  const [example, setExample] = useState({ numerator: 3, denominator: 4 });
  const [stage, setStage] = useState(1);

  // ส่วนฝึกอ่านจุด
  const [practice, setPractice] = useState(FIRST_PRACTICE);
  const [selected, setSelected] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);

  const practiceCorrect = `${practice.numerator}/${practice.denominator}`;
  const isRight = selected === practiceCorrect;

  function randomExample() {
    const denominator = randInt(3, 8);
    setExample({ numerator: randInt(1, denominator - 1), denominator });
    setStage(1);
  }

  function chooseAnswer(choice: string) {
    if (selected) return;
    setSelected(choice);
    setStreak((s) => (choice === practiceCorrect ? s + 1 : 0));
  }

  function nextPractice() {
    setPractice(makePractice());
    setSelected(null);
  }

  return (
    <div className="space-y-6">
      {/* ── ส่วนสอน: อ่านจุดใน 3 ขั้น ── */}
      <Card className="overflow-hidden rounded-3xl p-0 shadow-sm">
        <div className="flex items-center gap-3 bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-5 text-white">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20 text-lg font-extrabold">
            2
          </span>
          <div>
            <h2 className="text-2xl font-extrabold">อ่านจุดบนเส้นจำนวน</h2>
            <p className="mt-0.5 text-sm font-bold text-violet-100">อ่านได้ใน 3 ขั้นง่าย ๆ ลองกดดูทีละขั้นเลย</p>
          </div>
        </div>

        <div className="space-y-5 p-6">
          {/* ปุ่มเลือกขั้น */}
          <div className="flex flex-wrap gap-2">
            {WALKTHROUGH_STEPS.map((s) => (
              <button
                key={s.id}
                onClick={() => setStage(s.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl border-2 px-4 py-2 text-sm font-extrabold transition",
                  stage === s.id
                    ? "border-violet-600 bg-violet-600 text-white"
                    : stage > s.id
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-500 hover:border-violet-200"
                )}
              >
                {stage > s.id && <Check size={14} />}
                ขั้นที่ {s.id} {s.label}
              </button>
            ))}
            <button
              onClick={randomExample}
              className="ml-auto flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-500 transition hover:bg-slate-50"
            >
              <RefreshCw size={13} />
              สุ่มตัวอย่างใหม่
            </button>
          </div>

          {/* เส้นจำนวนพร้อมไฮไลต์ */}
          <div className="rounded-2xl border border-violet-100 bg-violet-50/40 p-4">
            <WalkthroughLine denominator={example.denominator} marker={example.numerator} stage={stage} />
          </div>

          {/* คำอธิบายของขั้นปัจจุบัน */}
          <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl bg-amber-50 px-5 py-4 text-center text-base font-bold text-amber-700">
            {stage === 1 && (
              <span>
                นับช่องทั้งหมดระหว่าง 0 กับ 1 → ได้ <span className="text-lg font-extrabold">{example.denominator} ช่อง</span> นี่คือ{" "}
                <span className="rounded-lg bg-white px-2 py-0.5">ตัวส่วน</span>
              </span>
            )}
            {stage === 2 && (
              <span>
                นับช่องจาก 0 มาจนถึงจุดสีม่วง → ได้ <span className="text-lg font-extrabold">{example.numerator} ช่อง</span> นี่คือ{" "}
                <span className="rounded-lg bg-white px-2 py-0.5">ตัวเศษ</span>
              </span>
            )}
            {stage === 3 && (
              <>
                <span>เขียนตัวเศษไว้ข้างบน ตัวส่วนไว้ข้างล่าง → จุดนี้คือ</span>
                <FractionStack top={example.numerator} bottom={example.denominator} className="text-2xl font-extrabold text-violet-700" />
              </>
            )}
          </div>

          {stage < 3 && (
            <div className="flex justify-center">
              <button
                onClick={() => setStage((s) => Math.min(3, s + 1))}
                className="flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-extrabold text-white transition hover:bg-violet-700 active:scale-[0.98]"
              >
                ขั้นถัดไป
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* ── ส่วนฝึก: ลองอ่านจุดเอง ── */}
      <Card className="rounded-3xl shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-extrabold text-brand-900">✏️ ลองอ่านจุดเอง</h3>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-600">
            ⭐ ตอบถูกติดต่อกัน {streak} ข้อ
          </span>
        </div>
        <p className="mt-1 text-sm font-bold text-slate-500">จุดบนเส้นนี้คือเศษส่วนใด? (โจทย์สุ่มใหม่ทุกข้อ)</p>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
          <NumberLineStrip
            denominator={practice.denominator}
            marker={practice.numerator}
            tone="violet"
            showFractionLabels={false}
            showMarkerLabel={false}
            className="mx-auto h-24 w-full max-w-xl"
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {practice.choices.map((choice) => {
            const [top, bottom] = choice.split("/").map(Number);
            const chosen = selected === choice;
            const right = choice === practiceCorrect;
            return (
              <button
                key={choice}
                onClick={() => chooseAnswer(choice)}
                disabled={selected !== null}
                className={cn(
                  "flex items-center justify-center rounded-xl border-2 py-3 transition",
                  !selected && "border-slate-200 bg-white hover:border-violet-300 hover:bg-violet-50",
                  selected && !chosen && !right && "border-slate-100 bg-slate-50 opacity-40",
                  chosen && right && "border-emerald-400 bg-emerald-50",
                  chosen && !right && "border-rose-400 bg-rose-50",
                  selected && right && !chosen && "border-emerald-300 bg-emerald-50/70"
                )}
              >
                <FractionStack top={top} bottom={bottom} className="text-xl font-extrabold text-brand-900" />
              </button>
            );
          })}
        </div>

        {selected && (
          <div
            className={cn(
              "mt-4 flex items-start gap-2 rounded-xl px-4 py-3 text-sm font-bold",
              isRight ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"
            )}
          >
            {isRight ? <Check size={17} className="mt-0.5 shrink-0" /> : <X size={17} className="mt-0.5 shrink-0" />}
            <span>
              {isRight ? "ถูกต้อง! เก่งมาก 🎉 " : "ยังไม่ถูก — "}
              เส้นแบ่งเป็น {practice.denominator} ช่องเท่ากัน จุดอยู่ห่างจาก 0 ไป {practice.numerator} ช่อง จึงเป็น{" "}
              <Frac n={practice.numerator} d={practice.denominator} />
            </span>
          </div>
        )}

        {selected && (
          <button
            onClick={nextPractice}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-extrabold text-white transition hover:bg-violet-700 active:scale-[0.98]"
          >
            ข้อถัดไป
            <ArrowRight size={16} />
          </button>
        )}
      </Card>
    </div>
  );
}
