import Link from "next/link";
import { CheckCircle, Lock, MapPin, PlayCircle } from "lucide-react";
import { LessonCardImage } from "@/components/learning/LessonCardImage";
import { mockLessons } from "@/data/mockLessons";
import { cn } from "@/lib/cn";
import type { Lesson } from "@/types/lesson";

const lessonHref: Record<string, string> = {
  "intro-fraction":    "/lessons/fraction-intro",
  "read-write":        "/lessons/read-write",
  "picture-fraction":  "/lessons/fraction-from-image",
  "number-line":       "/lessons/number-line",
  "compare":           "/lessons/compare",
  "equivalent":        "/lessons/equivalent",
  "simplify-expand":   "/lessons/simplify-expand",
  "mixed-improper":    "/lessons/mixed-improper",
  "add-fractions":     "/lessons/add",
  "subtract-fractions":"/lessons/subtract",
  "multiply-fractions":"/lessons/multiply",
  "divide-fractions":  "/lessons/divide",
};

type ColorKey = Lesson["color"];

const cardBorder: Record<ColorKey, string> = {
  green:  "border-emerald-300",
  amber:  "border-amber-300",
  pink:   "border-pink-300",
  sky:    "border-sky-300",
  violet: "border-violet-300",
  slate:  "border-slate-200",
};

const badgeColor: Record<ColorKey, string> = {
  green:  "bg-emerald-500 text-white",
  amber:  "bg-amber-500   text-white",
  pink:   "bg-pink-500    text-white",
  sky:    "bg-sky-500     text-white",
  violet: "bg-violet-600  text-white",
  slate:  "bg-slate-400   text-white",
};

// Background color shown in the image area when no image file exists (emoji fallback bg)
const imgFallbackBg: Record<ColorKey, string> = {
  green:  "bg-emerald-100",
  amber:  "bg-amber-100",
  pink:   "bg-pink-100",
  sky:    "bg-sky-100",
  violet: "bg-violet-100",
  slate:  "bg-slate-100",
};

function IslandCard({ lesson }: { lesson: Lesson }) {
  const completed = lesson.status === "completed";
  const current   = lesson.status === "current";
  const locked    = lesson.status === "locked";
  const href      = lessonHref[lesson.id] ?? "#";

  // Fallback emoji background color
  const fallbackBg = current ? "bg-amber-100" : locked ? "bg-slate-100" : imgFallbackBg[lesson.color];

  const inner = (
    <div className="relative">
      {/* MapPin floating above card for current lesson */}
      {current && (
        <div className="absolute -top-9 left-1/2 z-10 -translate-x-1/2">
          <MapPin className="fill-amber-400 text-amber-500 drop-shadow-lg" size={36} />
        </div>
      )}

      {/* ── Card shell ── */}
      <div
        className={cn(
          "overflow-hidden rounded-2xl border-2 transition-all duration-200",
          // completed
          completed && [cardBorder[lesson.color], "shadow-md hover:-translate-y-1 hover:shadow-lg"],
          // current
          current && [
            "border-amber-400",
            "shadow-[0_0_28px_rgba(251,191,36,0.55)]",
            "ring-4 ring-amber-300/50",
            "hover:-translate-y-1",
          ],
          // locked
          locked && ["border-slate-200", "opacity-55", "cursor-not-allowed"],
        )}
      >
        {/* ── Full image (no cropping) + overlays ── */}
        <div className="relative">
          {/* Full image at natural aspect ratio */}
          <LessonCardImage
            lessonId={lesson.id}
            icon={lesson.icon}
            locked={locked}
            color={fallbackBg}
          />

          {/* Order badge — top-left over image */}
          <div
            className={cn(
              "absolute left-2 top-2 z-10 grid h-7 w-7 place-items-center rounded-full text-xs font-extrabold shadow-md",
              completed && badgeColor[lesson.color],
              current   && "bg-amber-400 text-amber-900",
              locked    && "bg-slate-300/90 text-slate-500",
            )}
          >
            {lesson.order}
          </div>

          {/* Stars + status — bottom of image (in the blank space user designed) */}
          <div className="absolute bottom-3 left-0 right-0 z-10 flex flex-col items-center gap-1">
            <div className="flex gap-0.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "text-base leading-none drop-shadow",
                    i < lesson.stars ? "text-amber-400" : "text-white/40",
                  )}
                >
                  ★
                </span>
              ))}
            </div>
            <div className="flex h-5 items-center justify-center">
              {completed && <CheckCircle size={17} className="text-emerald-400 drop-shadow" />}
              {current   && <PlayCircle  size={19} className="text-amber-400  drop-shadow" />}
              {locked    && <Lock        size={14} className="text-slate-300"               />}
            </div>
          </div>
        </div>

        {/* ── Title strip below image ── */}
        <div
          className={cn(
            "px-2 py-2 text-center",
            current ? "bg-amber-50" : locked ? "bg-slate-50/80" : "bg-white",
          )}
        >
          {/* Title */}
          <h3
            className={cn(
              "line-clamp-2 min-h-[2.25rem] text-[11px] font-extrabold leading-snug",
              completed && "text-slate-700",
              current   && "text-amber-900",
              locked    && "text-slate-400",
            )}
          >
            {lesson.title}
          </h3>

        </div>
      </div>
    </div>
  );

  if (locked) return inner;
  return <Link href={href} className="block">{inner}</Link>;
}

// Curved dashed SVG path connecting end of one row to start of next
function RowConnector() {
  // All rows go left→right, so path always U-turns from right side → down → left side
  return (
    <div className="relative mx-4 h-10">
      <svg
        viewBox="0 0 800 40"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 790 4 C 790 24 400 24 10 24 L 10 36"
          fill="none"
          stroke="rgba(255,255,255,0.82)"
          strokeWidth="4"
          strokeDasharray="12 8"
          strokeLinecap="round"
        />
        <polyline
          points="3,30 10,36 17,30"
          fill="none"
          stroke="rgba(255,255,255,0.92)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function LearningMap() {
  const lessons        = mockLessons.slice(0, 12);
  const row1           = lessons.slice(0, 4);
  const row2           = lessons.slice(4, 8);
  const row3           = lessons.slice(8, 12);
  const completedCount = mockLessons.filter((l) => l.status === "completed").length;
  const currentOrder   = mockLessons.find((l) => l.status === "current")?.order ?? 0;

  return (
    <div
      className="relative overflow-hidden rounded-3xl shadow-xl"
      style={{
        backgroundImage: "url('/images/lessons/background-map.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay to ensure text readability over background image */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-sky-900/30 via-sky-800/20 to-blue-900/40" />

      {/* ─── Main content ─── */}
      <div className="relative p-6">

        {/* Header */}
        <div className="mb-2 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-white drop-shadow">แผนที่การเรียนรู้</h2>
            <p className="mt-0.5 text-sm font-bold text-white/85">
              ผ่านด่าน 1–{completedCount} แล้ว · ด่าน {currentOrder} กำลังเรียน
            </p>
          </div>
          <div className="rounded-full bg-white/90 px-4 py-2 text-sm font-extrabold text-brand-700 shadow">
            {completedCount} / 12 ด่าน
          </div>
        </div>

        {/* Row 1 – pt-10 gives room for the MapPin that floats above the current card */}
        <div className="grid grid-cols-4 gap-4 pt-10">
          {row1.map((l) => <IslandCard key={l.id} lesson={l} />)}
        </div>

        <RowConnector />

        <div className="grid grid-cols-4 gap-4 pt-10">
          {row2.map((l) => <IslandCard key={l.id} lesson={l} />)}
        </div>

        <RowConnector />

        <div className="grid grid-cols-4 gap-4 pb-6 pt-10">
          {row3.map((l) => <IslandCard key={l.id} lesson={l} />)}
        </div>

      </div>
    </div>
  );
}
