"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Check, Maximize2, Minimize2, List, X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { ExtraContentBlocks } from "@/components/lessons/ExtraContentBlocks";
import { isStepHiddenApi } from "@/lib/extraContentApi";

export type StepDef = {
  id: number;
  title: string;
  icon?: string;
};

type LessonStepperProps = {
  steps: StepDef[];
  renderStep: (step: number) => ReactNode;
  renderAll: () => ReactNode;
  footer: ReactNode;
  lessonSlug?: string;
};

const DEFAULT_ICONS = ["📹", "📖", "🖼️", "📏", "🧩", "💡", "✏️", "🏆", "⭐", "🎮"];

export function LessonStepper({ steps, renderStep, renderAll, footer, lessonSlug }: LessonStepperProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [visited, setVisited] = useState<Set<number>>(new Set([1]));
  const [showAll, setShowAll] = useState(false);
  const [isFullView, setIsFullView] = useState(false);
  const [stepHidden, setStepHidden] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  function updateArrows() {
    const el = stripRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  // Track overflow so side arrows show only when there is more to scroll
  useEffect(() => {
    if (isFullView || showAll) return;
    updateArrows();
    const el = stripRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [isFullView, showAll, steps.length]);

  // Keep the active step card centered in the strip (only scrolls the strip, not the page)
  useEffect(() => {
    if (isFullView || showAll) return;
    const el = stripRef.current;
    const card = cardRefs.current[currentStep - 1];
    if (!el || !card) return;
    const delta = card.getBoundingClientRect().left - el.getBoundingClientRect().left - (el.clientWidth - card.clientWidth) / 2;
    el.scrollBy({ left: delta, behavior: "smooth" });
  }, [currentStep, isFullView, showAll]);

  function scrollStrip(dir: -1 | 1) {
    stripRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  }

  useEffect(() => {
    if (!lessonSlug) return;
    let cancelled = false;
    async function check() {
      const hidden = await isStepHiddenApi(lessonSlug!, currentStep);
      if (!cancelled) setStepHidden(hidden);
    }
    check();
    const id = setInterval(check, 2000);
    return () => { cancelled = true; clearInterval(id); };
  }, [lessonSlug, currentStep]);

  // Lock body scroll when in full-view mode
  useEffect(() => {
    document.body.style.overflow = isFullView ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isFullView]);

  function goTo(step: number) {
    setCurrentStep(step);
    setVisited((prev) => new Set(prev).add(step));
    if (!isFullView) {
      contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  const progressPct = Math.round((visited.size / steps.length) * 100);
  const currentStepDef = steps[currentStep - 1];

  /* ── Shared footer nav (used inside both normal & fullview card) ── */
  function FooterNav() {
    const pct = Math.round((currentStep / steps.length) * 100);
    return (
      <div className="flex items-center justify-between gap-2 border-t border-pink-100 bg-white px-4 py-3 md:gap-3 md:px-5 md:py-4">

        {/* Back */}
        <button
          disabled={currentStep <= 1}
          onClick={() => goTo(currentStep - 1)}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition-all md:px-5 md:py-3",
            currentStep <= 1
              ? "cursor-not-allowed bg-slate-100 text-slate-300"
              : "bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 hover:-translate-x-0.5 hover:shadow-md"
          )}
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">ย้อนกลับ</span>
        </button>

        {/* Center control card */}
        <div className="flex flex-1 justify-center">
          <div className="flex w-full max-w-[640px] items-center gap-2.5 rounded-2xl border border-pink-200 bg-pink-50/70 px-3 py-2.5 shadow-sm md:gap-4 md:px-5 md:py-3">

            {/* Star */}
            <span className="shrink-0 text-xl leading-none md:text-2xl" aria-hidden>⭐</span>

            {/* Step label */}
            <span className="shrink-0 text-sm font-extrabold text-pink-500 md:text-xl">
              ขั้นที่ {currentStep}/{steps.length}
            </span>

            {/* Progress bar + percent */}
            <div className="flex flex-1 items-center gap-2">
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-pink-200/80 md:h-3">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-pink-400 to-violet-500 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="shrink-0 text-xs font-extrabold text-pink-500 md:text-sm">
                {pct}%
              </span>
            </div>

            {/* Fullview pill */}
            <button
              onClick={() => setIsFullView((v) => !v)}
              title={isFullView ? "ออกจากเต็มจอ" : "ดูเต็มจอ"}
              className="flex shrink-0 items-center gap-1.5 rounded-xl border border-pink-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-pink-500 transition hover:border-pink-300 hover:bg-pink-100 hover:text-pink-600 md:px-3 md:text-xs"
            >
              {isFullView ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              <span className="hidden sm:inline">{isFullView ? "ย่อ" : "เต็มจอ"}</span>
            </button>
          </div>
        </div>

        {/* Next */}
        <button
          disabled={currentStep >= steps.length}
          onClick={() => goTo(currentStep + 1)}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition-all md:px-5 md:py-3",
            currentStep >= steps.length
              ? "cursor-not-allowed bg-slate-100 text-slate-300"
              : "bg-gradient-to-r from-pink-500 to-violet-600 text-white shadow-md shadow-violet-300/40 hover:translate-x-0.5 hover:shadow-lg hover:shadow-violet-300/50"
          )}
        >
          <span className="hidden sm:inline">ถัดไป</span>
          <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <>
      {/* ─── Step Navigator ─── (hidden when fullview) */}
      {!isFullView && (
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm">

          {/* Header */}
          <div className="mb-5 flex items-center justify-between">
            <p className="text-base font-semibold text-slate-600">
              ขั้นที่{" "}
              <span className="text-2xl font-extrabold text-violet-600">{currentStep}</span>
              <span className="text-slate-400"> / {steps.length}</span>
            </p>
            <button
              onClick={() => setShowAll((v) => !v)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:border-violet-300 hover:text-violet-600"
            >
              {showAll ? <X size={15} /> : <List size={15} />}
              {showAll ? "ซ่อนดูทั้งหมด" : "ดูทั้งหมด"}
            </button>
          </div>

          {/* Step cards — horizontal scroll with side arrows */}
          <div className="relative">
            {/* Left arrow */}
            {canLeft && (
              <>
                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-white to-transparent" />
                <button
                  onClick={() => scrollStrip(-1)}
                  aria-label="เลื่อนดูขั้นก่อนหน้า"
                  className="absolute left-0 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition hover:border-violet-300 hover:text-violet-600 active:scale-95"
                >
                  <ChevronLeft size={22} />
                </button>
              </>
            )}
            {/* Right arrow */}
            {canRight && (
              <>
                <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-white to-transparent" />
                <button
                  onClick={() => scrollStrip(1)}
                  aria-label="เลื่อนดูขั้นถัดไป"
                  className="absolute right-0 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition hover:border-violet-300 hover:text-violet-600 active:scale-95"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}
            <div
              ref={stripRef}
              className="flex items-center overflow-x-auto pb-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-200"
            >
            {steps.map((s, idx) => {
              const isCurrent = s.id === currentStep;
              const isDone = visited.has(s.id) && !isCurrent;
              const isNew = !visited.has(s.id) && !isCurrent;
              const icon = s.icon ?? DEFAULT_ICONS[(s.id - 1) % DEFAULT_ICONS.length];

              return (
                <div key={s.id} className="flex shrink-0 items-center">

                  {/* Card */}
                  <button
                    ref={(el) => { cardRefs.current[idx] = el; }}
                    onClick={() => goTo(s.id)}
                    className={cn(
                      "flex w-[148px] flex-col items-center gap-2.5 rounded-xl border-2 px-3 py-4 text-center transition-all duration-200 hover:-translate-y-0.5",
                      isCurrent && "border-pink-300 bg-pink-50/60 shadow-[0_0_0_4px_rgba(244,114,182,0.10)] hover:shadow-[0_4px_16px_rgba(244,114,182,0.20)]",
                      isDone && "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm",
                      isNew && "border-slate-200 bg-white hover:border-violet-200 hover:shadow-sm"
                    )}
                  >
                    {/* Number circle */}
                    <div className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold",
                      isCurrent && "bg-gradient-to-br from-pink-500 to-violet-600 text-white shadow-[0_4px_12px_rgba(168,85,247,0.35)]",
                      isDone && "bg-slate-800 text-white",
                      isNew && "bg-slate-100 text-slate-500"
                    )}>
                      {isDone ? <Check size={15} strokeWidth={3} /> : s.id}
                    </div>

                    {/* Emoji icon */}
                    <span className="text-2xl leading-none" aria-hidden>
                      {icon}
                    </span>

                    {/* Title */}
                    <span className={cn(
                      "text-[12px] font-semibold leading-snug",
                      isCurrent && "text-slate-800",
                      isDone && "text-slate-700",
                      isNew && "text-slate-500"
                    )}>
                      {s.title}
                    </span>

                    {/* Status badge */}
                    {isCurrent && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-pink-200 bg-pink-50 px-2.5 py-[3px] text-[10px] font-bold text-pink-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-pink-500" />
                        กำลังเรียน
                      </span>
                    )}
                    {isDone && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-[3px] text-[10px] font-bold text-emerald-600">
                        <Check size={10} strokeWidth={3} />
                        เรียนแล้ว
                      </span>
                    )}
                    {isNew && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-[3px] text-[10px] font-semibold text-slate-400">
                        ยังไม่ได้เรียน
                      </span>
                    )}
                  </button>

                  {/* Connector line */}
                  {idx < steps.length - 1 && (
                    <div className={cn(
                      "mx-2 h-px w-5 shrink-0 rounded-full transition-colors duration-300",
                      isDone ? "bg-emerald-300" : "bg-slate-200"
                    )} />
                  )}

                </div>
              );
            })}
            </div>
          </div>
        </div>
      )}

      {/* ─── Lesson Content Card ─── */}
      {showAll && !isFullView ? (
        <div className="space-y-5">{renderAll()}</div>
      ) : (
        <div ref={contentRef} className={cn(
          "flex flex-col bg-white transition-all duration-300",
          isFullView
            ? "fixed inset-0 z-[9999] h-screen w-screen overflow-hidden rounded-none bg-slate-50 shadow-none"
            : "overflow-hidden rounded-2xl border border-slate-200 shadow-sm"
        )}>

          {/* FullView top bar — visible only when fullscreen */}
          {isFullView && (
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-3 shadow-sm lg:px-10">
              <div className="flex items-center gap-2 overflow-x-auto">
                {steps.map((s) => {
                  const isCurrent = s.id === currentStep;
                  const isDone = visited.has(s.id) && !isCurrent;
                  return (
                    <button
                      key={s.id}
                      onClick={() => goTo(s.id)}
                      className={cn(
                        "shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-bold transition",
                        isCurrent && "bg-gradient-to-r from-pink-500 to-violet-600 text-white shadow-sm",
                        isDone && "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
                        !isCurrent && !isDone && "bg-slate-100 text-slate-400"
                      )}
                    >
                      {isDone ? "✓" : s.id}. {s.title}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setIsFullView(false)}
                className="ml-6 flex shrink-0 items-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-2 text-sm font-bold text-slate-600 transition hover:bg-red-50 hover:text-red-600"
              >
                <Minimize2 size={14} />
                ออกจากเต็มจอ
              </button>
            </div>
          )}

          {/* Content area */}
          <div className={cn(
            isFullView
              ? "flex-1 overflow-y-auto p-6 lg:p-10"
              : "min-h-[70vh] p-5 md:p-6 lg:p-8"
          )}>
            {stepHidden ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-slate-400">
                <span className="text-5xl">🙈</span>
                <p className="text-base font-bold">เนื้อหาหลักถูกซ่อนโดยแอดมิน</p>
              </div>
            ) : (
              renderStep(currentStep)
            )}
            {lessonSlug && (
              <ExtraContentBlocks lessonSlug={lessonSlug} stepIndex={currentStep} />
            )}
          </div>

          {/* Footer nav */}
          <div className="shrink-0">
            <FooterNav />
          </div>
        </div>
      )}

      {!isFullView && footer}
    </>
  );
}
