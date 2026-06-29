"use client";

import { Card } from "@/components/ui/Card";
import { LessonActionBar } from "@/components/lessons/LessonActionBar";
import { LessonProgressHeader } from "@/components/lessons/LessonProgressHeader";
import { LessonStepper } from "@/components/lessons/LessonStepper";
import { CommonDenominatorCard } from "@/components/lessons/compare/CommonDenominatorCard";
import { CompareQuestionCard } from "@/components/lessons/compare/CompareQuestionCard";
import { ComparePracticeGrid } from "@/components/lessons/compare/ComparePracticeGrid";
import { NumberLineCompare } from "@/components/lessons/compare/NumberLineCompare";
import { VisualCompareSteps } from "@/components/lessons/compare/VisualCompareSteps";
import { compareHelperModes, compareMeta } from "@/data/lessonCompare";
import { LessonVideoCard } from "@/components/lessons/LessonVideoCard";
import { lessonVideos } from "@/data/lessonVideos";
import { LessonQuiz } from "@/components/lessons/LessonQuiz";
import { makeCompareQuestion } from "@/lib/quizGenerators";

function HelperModesCard() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">5</span>
          <h2 className="text-xl font-extrabold">เลือกวิธีช่วยคิด</h2>
        </div>
      </div>
      <div className="p-5">
        <p className="text-sm font-bold text-slate-600">เลือกวิธีที่ช่วยให้เข้าใจได้ง่ายที่สุด</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {compareHelperModes.map((mode) => (
            <button
              key={mode.id}
              className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-white px-4 py-3 text-left font-extrabold text-brand-900 transition hover:border-emerald-300 hover:bg-emerald-50"
            >
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-2xl">{mode.icon}</span>
              {mode.label}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}

const VIDEO_URL = lessonVideos["/lessons/compare"] ?? "";

const STEPS = [
  { id: 1, title: "ดูวิดีโอ",          icon: "📹" },
  { id: 2, title: "โจทย์เปรียบเทียบ",  icon: "📋" },
  { id: 3, title: "เปรียบเทียบด้วยภาพ", icon: "🖼️" },
  { id: 4, title: "บนเส้นจำนวน",       icon: "↔️" },
  { id: 5, title: "ทำส่วนเท่ากัน",      icon: "🍪" },
  { id: 6, title: "วิธีช่วยคิด",        icon: "💡" },
  { id: 7, title: "ฝึกทำ",             icon: "✏️" },
  { id: 8, title: "แบบทดสอบ",          icon: "🏆" },
];

const COMPONENTS = [
  () => <LessonVideoCard lessonPath="/lessons/compare" videoUrl={VIDEO_URL} title="วิดีโอ: เปรียบเทียบเศษส่วน" />,
  CompareQuestionCard, VisualCompareSteps, NumberLineCompare,
  CommonDenominatorCard, HelperModesCard, ComparePracticeGrid,
  () => (
    <LessonQuiz
      title="แบบทดสอบ: เปรียบเทียบเศษส่วน"
      gradient="bg-gradient-to-r from-emerald-600 to-green-500"
      makeQuestion={makeCompareQuestion}
      lessonSlug="compare"
    />
  ),
];

export function CompareContent() {
  return (
    <div className="space-y-5">
      <LessonProgressHeader meta={compareMeta} lessonSlug="compare" />
      <LessonStepper
        lessonSlug="compare"
        steps={STEPS}
        renderStep={(step) => {
          const Comp = COMPONENTS[step - 1];
          return Comp ? <Comp /> : null;
        }}
        renderAll={() => (
          <>
            <LessonVideoCard lessonPath="/lessons/compare" videoUrl={VIDEO_URL} title="วิดีโอ: เปรียบเทียบเศษส่วน" />
            <CompareQuestionCard />
            <VisualCompareSteps />
            <NumberLineCompare />
            <CommonDenominatorCard />
            <HelperModesCard />
            <ComparePracticeGrid />
            <LessonQuiz
              title="แบบทดสอบ: เปรียบเทียบเศษส่วน"
              gradient="bg-gradient-to-r from-emerald-600 to-green-500"
              makeQuestion={makeCompareQuestion}
      lessonSlug="compare"
            />
          </>
        )}
        footer={<LessonActionBar meta={compareMeta} practiceCount={10} />}
      />
    </div>
  );
}
