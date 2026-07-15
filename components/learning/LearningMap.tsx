import Link from "next/link";
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

/* ทุกบทเรียนเปิดให้เข้าได้เสมอ (ไม่มีระบบปลดล็อกด่าน) — ครูเลือกสอนบทไหนก็ได้ */
function IslandCard({ lesson }: { lesson: Lesson }) {
  const href = lessonHref[lesson.id] ?? "#";

  return (
    <Link href={href} className="group block focus:outline-none focus-visible:ring-4 focus-visible:ring-white/70 rounded-2xl">
      <div
        className={cn(
          "overflow-hidden rounded-2xl border-2 bg-white shadow-md transition-all duration-200",
          cardBorder[lesson.color],
          "hover:-translate-y-1 hover:shadow-xl group-focus-visible:-translate-y-1",
        )}
      >
        {/* รูปบทเรียน (ไม่ครอป) */}
        <div className="relative">
          <LessonCardImage
            lessonId={lesson.id}
            icon={lesson.icon}
            locked={false}
            color={imgFallbackBg[lesson.color]}
          />

          {/* เลขลำดับบทเรียน */}
          <div
            className={cn(
              "absolute left-2 top-2 z-10 grid h-7 w-7 place-items-center rounded-full text-xs font-extrabold shadow-md ring-2 ring-white/70",
              badgeColor[lesson.color],
            )}
          >
            {lesson.order}
          </div>
        </div>

        {/* ชื่อบทเรียน */}
        <div className="bg-white px-2 py-2 text-center">
          <h3 className="line-clamp-2 min-h-[2.25rem] text-[11px] font-extrabold leading-snug text-slate-700 group-hover:text-brand-700">
            {lesson.title}
          </h3>
        </div>
      </div>
    </Link>
  );
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
  const lessons = mockLessons.slice(0, 12);
  const row1    = lessons.slice(0, 4);
  const row2    = lessons.slice(4, 8);
  const row3    = lessons.slice(8, 12);

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
        <div className="mb-2 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-white drop-shadow">แผนที่การเรียนรู้</h2>
            <p className="mt-0.5 text-sm font-bold text-white/85">
              คลิกเลือกบทที่ต้องการสอนได้ทุกบท · เรียงตามลำดับเนื้อหา ป.4–ป.6
            </p>
          </div>
          <div className="shrink-0 rounded-full bg-white/90 px-4 py-2 text-sm font-extrabold text-brand-700 shadow">
            12 บทเรียน
          </div>
        </div>

        {/* Row 1 */}
        <div className="grid grid-cols-4 gap-4 pt-5">
          {row1.map((l) => <IslandCard key={l.id} lesson={l} />)}
        </div>

        <RowConnector />

        <div className="grid grid-cols-4 gap-4 pt-5">
          {row2.map((l) => <IslandCard key={l.id} lesson={l} />)}
        </div>

        <RowConnector />

        <div className="grid grid-cols-4 gap-4 pb-6 pt-5">
          {row3.map((l) => <IslandCard key={l.id} lesson={l} />)}
        </div>

      </div>
    </div>
  );
}
