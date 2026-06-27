"use client";

import { useEffect, useState, type ReactNode } from "react";
import { CheckCircle, XCircle, Shuffle, Lightbulb, ArrowRight, Flame, Trophy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Confetti } from "@/components/ui/Confetti";
import { cn } from "@/lib/cn";

export type PracticeOption = { num: number; den: number; correct: boolean };

type AccentKey = "blue" | "emerald" | "amber" | "violet" | "teal";

type Accent = {
  hover: string;
  optionText: string;
  qMark: string;
  hintBtn: string;
  hintPanel: string;
  nextBtn: string;
  chip: string;
};

const ACCENTS: Record<AccentKey, Accent> = {
  blue: {
    hover: "hover:border-blue-300 hover:bg-blue-50",
    optionText: "text-slate-800",
    qMark: "text-blue-400",
    hintBtn: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    hintPanel: "bg-blue-50 text-blue-800 ring-blue-100",
    nextBtn: "bg-blue-600 hover:bg-blue-700",
    chip: "bg-blue-50 text-blue-700",
  },
  emerald: {
    hover: "hover:border-emerald-300 hover:bg-emerald-50",
    optionText: "text-slate-800",
    qMark: "text-emerald-400",
    hintBtn: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
    hintPanel: "bg-emerald-50 text-emerald-800 ring-emerald-100",
    nextBtn: "bg-emerald-600 hover:bg-emerald-700",
    chip: "bg-emerald-50 text-emerald-700",
  },
  amber: {
    hover: "hover:border-amber-300 hover:bg-amber-50",
    optionText: "text-slate-800",
    qMark: "text-amber-400",
    hintBtn: "bg-amber-100 text-amber-700 hover:bg-amber-200",
    hintPanel: "bg-amber-50 text-amber-800 ring-amber-100",
    nextBtn: "bg-amber-500 hover:bg-amber-600",
    chip: "bg-amber-50 text-amber-700",
  },
  violet: {
    hover: "hover:border-violet-300 hover:bg-violet-50",
    optionText: "text-slate-800",
    qMark: "text-violet-400",
    hintBtn: "bg-violet-100 text-violet-700 hover:bg-violet-200",
    hintPanel: "bg-violet-50 text-violet-800 ring-violet-100",
    nextBtn: "bg-violet-600 hover:bg-violet-700",
    chip: "bg-violet-50 text-violet-700",
  },
  teal: {
    hover: "hover:border-teal-300 hover:bg-teal-50",
    optionText: "text-slate-800",
    qMark: "text-teal-400",
    hintBtn: "bg-teal-100 text-teal-700 hover:bg-teal-200",
    hintPanel: "bg-teal-50 text-teal-800 ring-teal-100",
    nextBtn: "bg-teal-600 hover:bg-teal-700",
    chip: "bg-teal-50 text-teal-700",
  },
};

type Props<P> = {
  badge: number;
  title: string;
  accent: AccentKey;
  gradient: string;
  makeProblem: () => P;
  getOptions: (p: P) => PracticeOption[];
  renderQuestion: (p: P) => ReactNode;
  renderOption: (opt: PracticeOption, state: "idle" | "correct" | "wrong") => ReactNode;
  /** คำใบ้เรียงจากเบาไปหนัก (ภาพ → วิธีคิด → ใกล้เฉลย) */
  getHints: (p: P) => ReactNode[];
  renderFeedback: (p: P, correct: boolean) => ReactNode;
};

export function PracticeShell<P>({
  badge,
  title,
  accent,
  gradient,
  makeProblem,
  getOptions,
  renderQuestion,
  renderOption,
  getHints,
  renderFeedback,
}: Props<P>) {
  const a = ACCENTS[accent];
  const [problem, setProblem] = useState<P | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [hints, setHints] = useState(0);
  const [stats, setStats] = useState({ correct: 0, total: 0, streak: 0, best: 0 });
  const [confetti, setConfetti] = useState(0);
  const [shake, setShake] = useState(0);

  useEffect(() => {
    setProblem(makeProblem());
    // makeProblem มาจาก module scope จึงเสถียร — รันครั้งเดียวพอ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function next() {
    setProblem(makeProblem());
    setSelected(null);
    setHints(0);
  }

  function answer(index: number, correct: boolean) {
    if (selected !== null) return;
    setSelected(index);
    setStats((s) => {
      const streak = correct ? s.streak + 1 : 0;
      return {
        correct: s.correct + (correct ? 1 : 0),
        total: s.total + 1,
        streak,
        best: Math.max(s.best, streak),
      };
    });
    if (correct) setConfetti((c) => c + 1);
    else setShake((s) => s + 1);
  }

  const answered = selected !== null;
  const isCorrect = answered && problem ? getOptions(problem)[selected!].correct : false;
  const hintList = problem ? getHints(problem) : [];
  const milestone = isCorrect && stats.correct > 0 && stats.correct % 5 === 0;
  const mascot = milestone ? "🏆" : answered ? (isCorrect ? "🤩" : "😮") : hints > 0 ? "🤔" : "🐻";

  return (
    <Card className="relative overflow-hidden p-0">
      <Confetti trigger={confetti} />

      {/* หัวการ์ด + สกอร์บอร์ด */}
      <div className={cn("px-4 py-2.5 text-white", gradient)}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-white/25 text-sm font-extrabold">{badge}</span>
            <h2 className="text-base font-extrabold sm:text-lg">{title}</h2>
          </div>
          <button
            onClick={next}
            className="flex items-center gap-1 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-extrabold transition hover:bg-white/30"
          >
            <Shuffle size={13} /> สุ่มใหม่
          </button>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-extrabold">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1">
            <CheckCircle size={12} /> ถูก {stats.correct}/{stats.total}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1">
            <Flame size={12} /> ต่อเนื่อง {stats.streak}
          </span>
          {stats.best >= 3 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1">
              <Trophy size={12} /> สถิติ {stats.best}
            </span>
          )}
          <span
            key={`${confetti}-${shake}`}
            className={cn(
              "ml-auto grid h-9 w-9 place-items-center rounded-full bg-white/25 text-xl leading-none",
              isCorrect && "fa-pop",
              answered && !isCorrect && "fa-shake",
            )}
            aria-hidden
          >
            {mascot}
          </span>
        </div>
      </div>

      <div className="p-4">
        {!problem ? (
          <div className="flex h-28 items-center justify-center text-sm text-slate-400">กำลังโหลด...</div>
        ) : (
          <>
            {/* โจทย์ */}
            <div
              key={stats.total + (answered ? "a" : "q")}
              className={cn(
                "flex flex-wrap items-center justify-center gap-3 text-2xl font-extrabold text-slate-900",
                !answered && "fa-rise",
              )}
            >
              {renderQuestion(problem)}
              {!answered && <span className={cn("text-3xl", a.qMark)}>?</span>}
            </div>

            {/* ตัวเลือก */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              {getOptions(problem).map((opt, i) => {
                const active = selected === i;
                const state: "idle" | "correct" | "wrong" = active ? (opt.correct ? "correct" : "wrong") : "idle";
                return (
                  <button
                    key={i}
                    onClick={() => answer(i, opt.correct)}
                    disabled={answered}
                    className={cn(
                      "flex min-h-[4.5rem] items-center justify-center rounded-xl border-2 transition",
                      !active && !answered && cn("border-slate-200 bg-white", a.hover),
                      !active && answered && "border-slate-100 bg-slate-50 opacity-50",
                      active && opt.correct && "border-emerald-400 bg-emerald-50 fa-pop",
                      active && !opt.correct && "border-rose-300 bg-rose-50 fa-shake",
                      // เผยคำตอบที่ถูกหลังตอบผิด
                      answered && !active && opt.correct && "border-emerald-300 bg-emerald-50/70 opacity-100",
                    )}
                  >
                    {renderOption(opt, state)}
                  </button>
                );
              })}
            </div>

            {/* คำใบ้ 3 ระดับ */}
            {!answered && (
              <div className="mt-4">
                {hintList.slice(0, hints).map((hint, i) => (
                  <div
                    key={i}
                    className={cn(
                      "fa-rise mb-2 flex flex-wrap items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold ring-1",
                      a.hintPanel,
                    )}
                  >
                    <Lightbulb size={14} className="shrink-0" />
                    <span className="opacity-70">คำใบ้ {i + 1}:</span>
                    {hint}
                  </div>
                ))}
                {hints < hintList.length && (
                  <button
                    onClick={() => setHints((h) => h + 1)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold transition",
                      hints === 0 && "fa-wiggle",
                      a.hintBtn,
                    )}
                  >
                    <Lightbulb size={13} /> ขอคำใบ้ ({hints}/{hintList.length})
                  </button>
                )}
              </div>
            )}

            {/* ฟีดแบ็ก */}
            {answered && (
              <div
                className={cn(
                  "fa-rise mt-4 flex flex-wrap items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-extrabold",
                  isCorrect ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600",
                )}
              >
                {isCorrect ? <CheckCircle size={16} /> : <XCircle size={16} />}
                {renderFeedback(problem, isCorrect)}
              </div>
            )}

            {/* หมุดหมายความสำเร็จ */}
            {milestone && (
              <div className="fa-rise mt-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-100 to-yellow-100 px-4 py-3 text-center text-sm font-extrabold text-amber-700">
                <Trophy size={18} /> เยี่ยมมาก! ทำถูกครบ {stats.correct} ข้อแล้ว ลุยต่อเลย!
              </div>
            )}

            {/* ปุ่มข้อถัดไป */}
            {answered && (
              <button
                onClick={next}
                className={cn(
                  "fa-rise mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-extrabold text-white transition",
                  a.nextBtn,
                )}
              >
                ข้อถัดไป <ArrowRight size={16} />
              </button>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
