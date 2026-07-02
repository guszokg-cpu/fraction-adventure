"use client";

import { useState } from "react";
import { Lightbulb, Eye, CheckCircle, ArrowRight, Shuffle, Play } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { randInt } from "@/lib/randomFraction";
import { countColoredParts, generateDrawChallenge, type DrawChallenge, type FractionKind } from "@/lib/fractionUtils";
import { ShapeSelector, SHAPE_OPTIONS, type ShapeKind } from "@/components/lessons/fraction-from-image/ShapeSelector";
import { FractionWorkspace } from "@/components/lessons/fraction-from-image/FractionWorkspace";
import { FractionKindSelector } from "@/components/lessons/fraction-from-image/FractionKindSelector";
import { ChallengePromptCard } from "@/components/lessons/fraction-from-image/ChallengePromptCard";
import { DrawChallengeResult } from "@/components/lessons/fraction-from-image/DrawChallengeResult";

const TOTAL_QUESTIONS = 5;

const COLOR_OPTIONS = [
  { id: "pink", label: "ชมพู", hex: "#f472b6" },
  { id: "violet", label: "ม่วง", hex: "#a78bfa" },
  { id: "amber", label: "เหลือง", hex: "#fbbf24" },
  { id: "sky", label: "ฟ้า", hex: "#38bdf8" },
  { id: "emerald", label: "เขียว", hex: "#34d399" },
] as const;

function emptyGrid(shapeCount: number, denominator: number): boolean[][] {
  return Array.from({ length: shapeCount }, () => Array.from({ length: denominator }, () => false));
}

/** เติมสีตัวอย่างแบบง่าย ไล่จากรูปแรกจนครบจำนวนที่โจทย์ต้องการ — ใช้โชว์เป็นเฉลยตัวอย่าง */
function buildSampleAnswer(challenge: DrawChallenge): boolean[][] {
  let remaining = challenge.numerator;
  return Array.from({ length: challenge.shapeCount }, () =>
    Array.from({ length: challenge.denominator }, () => {
      if (remaining > 0) {
        remaining -= 1;
        return true;
      }
      return false;
    })
  );
}

function wrongFeedback(coloredTotal: number, target: number): string {
  const diff = target - coloredTotal;
  if (diff > 0) return `ยังไม่ถูก คุณระบายไป ${coloredTotal} ส่วน แต่โจทย์ต้องการ ${target} ส่วน ลองระบายเพิ่มอีก ${diff} ส่วนนะ`;
  return `ยังไม่ถูก คุณระบายไป ${coloredTotal} ส่วน แต่โจทย์ต้องการ ${target} ส่วน ลองลดลง ${-diff} ส่วนนะ`;
}

type Phase = "setup" | "question" | "result";

export function DrawFractionChallenge() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [allowedKinds, setAllowedKinds] = useState<FractionKind[]>(["proper", "improper", "mixed"]);

  const [questionIndex, setQuestionIndex] = useState(0);
  const [challenge, setChallenge] = useState<DrawChallenge | null>(null);
  const [shape, setShape] = useState<ShapeKind>("circle");
  const [colorId, setColorId] = useState<(typeof COLOR_OPTIONS)[number]["id"]>("pink");
  const [coloredParts, setColoredParts] = useState<boolean[][]>([]);
  const [checked, setChecked] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [answeredCorrectly, setAnsweredCorrectly] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);

  const colorHex = COLOR_OPTIONS.find((c) => c.id === colorId)!.hex;
  const coloredTotal = coloredParts.length ? countColoredParts(coloredParts) : 0;
  const isCorrect = challenge ? coloredTotal === challenge.numerator : false;

  function loadQuestion(index: number) {
    const next = generateDrawChallenge(allowedKinds);
    setChallenge(next);
    setColoredParts(emptyGrid(next.shapeCount, next.denominator));
    setQuestionIndex(index);
    setChecked(false);
    setRevealed(false);
    setAnsweredCorrectly(false);
    setHint(null);
  }

  function startSet() {
    setScore(0);
    setResults([]);
    loadQuestion(0);
    setPhase("question");
  }

  function toggleCell(shapeIndex: number, partIndex: number) {
    if (revealed) return;
    setColoredParts((prev) => {
      const next = prev.map((row) => [...row]);
      next[shapeIndex][partIndex] = !next[shapeIndex][partIndex];
      return next;
    });
    setChecked(false);
    setHint(null);
  }

  function checkAnswer() {
    setChecked(true);
    if (!revealed && isCorrect && !answeredCorrectly) {
      setScore((s) => s + 1);
      setAnsweredCorrectly(true);
    }
  }

  function showHint() {
    if (!challenge) return;
    const diff = challenge.numerator - coloredTotal;
    if (diff > 0) setHint(`ยังระบายไม่พอ ต้องระบายเพิ่มอีก ${diff} ส่วนนะ`);
    else if (diff < 0) setHint(`ระบายเกินไปแล้ว ต้องลดลง ${-diff} ส่วนนะ`);
    else setHint("ตอนนี้จำนวนที่ระบายตรงกับโจทย์แล้ว ลองกด “ตรวจคำตอบ” ดูสิ!");
  }

  function showSampleAnswer() {
    if (!challenge) return;
    setColoredParts(buildSampleAnswer(challenge));
    setRevealed(true);
    setChecked(true);
    setHint(null);
  }

  function nextQuestion() {
    setResults((r) => [...r, answeredCorrectly]);
    const next = questionIndex + 1;
    if (next >= TOTAL_QUESTIONS) {
      setPhase("result");
      return;
    }
    loadQuestion(next);
  }

  function restart() {
    setPhase("setup");
  }

  // ── หน้าตั้งค่า ──
  if (phase === "setup") {
    return (
      <Card className="overflow-hidden rounded-3xl p-0 shadow-sm">
        <div className="flex items-center gap-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-5 text-white">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20 text-lg font-extrabold">
            5
          </span>
          <div>
            <h2 className="text-2xl font-extrabold">สร้างภาพจากโจทย์เศษส่วน</h2>
            <p className="mt-0.5 text-sm font-bold text-violet-100">
              เลือกชนิดโจทย์ แล้วลองสร้างภาพให้ตรงกับเศษส่วนที่กำหนด
            </p>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <div>
            <div className="mb-2 text-sm font-extrabold text-slate-600">เลือกชนิดโจทย์ (เลือกได้มากกว่า 1 ชนิด)</div>
            <FractionKindSelector value={allowedKinds} onChange={setAllowedKinds} />
          </div>

          <button
            onClick={startSet}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3.5 text-base font-extrabold text-white transition hover:bg-violet-700 active:scale-[0.98]"
          >
            <Play size={18} />
            เริ่มทำโจทย์ ({TOTAL_QUESTIONS} ข้อ)
          </button>
        </div>
      </Card>
    );
  }

  // ── หน้าสรุปคะแนน ──
  if (phase === "result") {
    return (
      <Card className="rounded-3xl">
        <DrawChallengeResult score={score} total={TOTAL_QUESTIONS} results={results} onRestart={restart} />
      </Card>
    );
  }

  // ── หน้าโจทย์ ──
  if (!challenge) return null;

  const showNextPrimary = checked && (isCorrect || revealed);

  return (
    <Card className="overflow-hidden rounded-3xl p-0 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-5 text-white">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20 text-lg font-extrabold">
            5
          </span>
          <h2 className="text-2xl font-extrabold">สร้างภาพจากโจทย์เศษส่วน</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/20 px-3.5 py-1.5 text-sm font-extrabold">
            ข้อที่ {questionIndex + 1} จาก {TOTAL_QUESTIONS}
          </span>
          <span className="rounded-full bg-white/20 px-3.5 py-1.5 text-sm font-extrabold">⭐ คะแนน {score}/{TOTAL_QUESTIONS}</span>
        </div>
      </div>

      <div className="space-y-5 p-6">
        <ChallengePromptCard challenge={challenge} />

        <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
          {/* ── แผงควบคุม ── */}
          <div className="space-y-4">
            <ShapeSelector value={shape} onChange={setShape} />
            <button
              onClick={() => setShape(SHAPE_OPTIONS[randInt(0, SHAPE_OPTIONS.length - 1)].id)}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-extrabold text-slate-500 transition hover:bg-slate-50"
            >
              <Shuffle size={13} />
              สุ่มรูปทรงให้ที
            </button>

            <div>
              <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">เลือกสีระบาย</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setColorId(c.id)}
                    aria-label={`สี${c.label}`}
                    title={c.label}
                    className={cn(
                      "h-9 w-9 rounded-full border-2 transition",
                      colorId === c.id ? "scale-110 border-slate-700 shadow-sm" : "border-white shadow"
                    )}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ── พื้นที่ระบายสี ── */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
              <FractionWorkspace
                shape={shape}
                denominator={challenge.denominator}
                coloredParts={coloredParts}
                colorHex={colorHex}
                onToggle={toggleCell}
              />
            </div>

            {hint && (
              <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">💡 {hint}</div>
            )}

            {checked && (
              <div
                className={cn(
                  "rounded-xl px-4 py-3 text-sm font-bold",
                  revealed
                    ? "bg-sky-50 text-sky-700"
                    : isCorrect
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-500"
                )}
              >
                {revealed
                  ? "นี่คือตัวอย่างคำตอบที่ถูกต้อง ลองสังเกตดูนะ"
                  : isCorrect
                    ? "ถูกต้อง! เก่งมาก 🎉"
                    : wrongFeedback(coloredTotal, challenge.numerator)}
              </div>
            )}

            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={showHint}
                disabled={revealed}
                className="flex items-center gap-1.5 rounded-xl border-2 border-amber-200 bg-white px-4 py-2.5 text-sm font-extrabold text-amber-600 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Lightbulb size={16} />
                ขอคำใบ้
              </button>
              <button
                onClick={showSampleAnswer}
                disabled={revealed}
                className="flex items-center gap-1.5 rounded-xl border-2 border-sky-200 bg-white px-4 py-2.5 text-sm font-extrabold text-sky-600 transition hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Eye size={16} />
                ดูเฉลยตัวอย่าง
              </button>
              <button
                onClick={checkAnswer}
                disabled={revealed}
                className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <CheckCircle size={16} />
                ตรวจคำตอบ
              </button>
            </div>

            <div className="flex justify-end">
              {showNextPrimary ? (
                <button
                  onClick={nextQuestion}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-extrabold text-white transition hover:bg-emerald-700 active:scale-[0.98]"
                >
                  {questionIndex + 1 >= TOTAL_QUESTIONS ? "ดูผลคะแนน" : "ข้อถัดไป"}
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button onClick={nextQuestion} className="text-sm font-bold text-slate-400 underline hover:text-slate-600">
                  ข้ามข้อนี้ไปก่อน
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
