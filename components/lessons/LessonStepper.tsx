"use client";

import { useState, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Check } from "lucide-react";
import { cn } from "@/lib/cn";

export type StepDef = {
  id: number;
  title: string;
};

type LessonStepperProps = {
  steps: StepDef[];
  renderStep: (step: number) => ReactNode;
  renderAll: () => ReactNode;
  footer: ReactNode;
};

export function LessonStepper({ steps, renderStep, renderAll, footer }: LessonStepperProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [visited, setVisited] = useState<Set<number>>(new Set([1]));
  const [showAll, setShowAll] = useState(false);

  function goTo(step: number) {
    setCurrentStep(step);
    setVisited((prev) => new Set(prev).add(step));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <>
      {/* ─── Step Navigator ─── */}
      <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-700">
            ขั้นที่ {currentStep} / {steps.length}
          </h3>
          <button
            onClick={() => setShowAll((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-200"
          >
            {showAll ? <EyeOff size={14} /> : <Eye size={14} />}
            {showAll ? "ซ่อนดูทั้งหมด" : "ดูทั้งหมด"}
          </button>
        </div>

        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
          {steps.map((s) => {
            const isCurrent = s.id === currentStep;
            const isDone = visited.has(s.id) && !isCurrent;
            return (
              <button
                key={s.id}
                onClick={() => goTo(s.id)}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-[11px] font-bold transition",
                  isCurrent && "bg-pink-500 text-white shadow-md shadow-pink-200",
                  isDone && "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
                  !isCurrent && !isDone && "bg-slate-50 text-slate-400 ring-1 ring-slate-100"
                )}
              >
                {isDone && <Check size={12} className="text-emerald-500" />}
                <span className="whitespace-nowrap">{s.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── เนื้อหา ─── */}
      {showAll ? (
        renderAll()
      ) : (
        <>
          <div className="mx-auto max-w-2xl">
            {renderStep(currentStep)}
          </div>

          {/* ─── ปุ่มย้อน/ถัดไป ─── */}
          <div className="flex items-center justify-between">
            <button
              disabled={currentStep <= 1}
              onClick={() => goTo(currentStep - 1)}
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold transition",
                currentStep <= 1
                  ? "cursor-not-allowed bg-slate-100 text-slate-300"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              <ArrowLeft size={16} />
              ย้อนกลับ
            </button>

            <span className="text-xs font-bold text-slate-400">
              {currentStep} / {steps.length}
            </span>

            <button
              disabled={currentStep >= steps.length}
              onClick={() => goTo(currentStep + 1)}
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold transition",
                currentStep >= steps.length
                  ? "cursor-not-allowed bg-slate-100 text-slate-300"
                  : "bg-pink-500 text-white shadow-md shadow-pink-200 hover:bg-pink-600"
              )}
            >
              ถัดไป
              <ArrowRight size={16} />
            </button>
          </div>
        </>
      )}

      {footer}
    </>
  );
}
