"use client";

import { LessonActionBar } from "@/components/lessons/LessonActionBar";
import { LessonProgressHeader } from "@/components/lessons/LessonProgressHeader";
import { LessonStepper } from "@/components/lessons/LessonStepper";
import { VisualCompareBattle } from "@/components/lessons/compare/VisualCompareBattle";
import { ThreeTricks } from "@/components/lessons/compare/ThreeTricks";
import { RaceNumberLine } from "@/components/lessons/compare/RaceNumberLine";
import { EqualizeMachine } from "@/components/lessons/compare/EqualizeMachine";
import { CompareSandbox } from "@/components/lessons/compare/CompareSandbox";
import { CompareGame } from "@/components/lessons/compare/CompareGame";
import { compareMeta } from "@/data/lessonCompare";
import { LessonVideoCard } from "@/components/lessons/LessonVideoCard";
import { lessonVideos } from "@/data/lessonVideos";
import { LessonQuiz } from "@/components/lessons/LessonQuiz";
import { makeCompareQuestion } from "@/lib/quizGenerators";

const VIDEO_URL = lessonVideos["/lessons/compare"] ?? "";

const STEPS = [
  { id: 1, title: "ดูวิดีโอ", icon: "📹" },
  { id: 2, title: "ใครกินเยอะกว่า", icon: "🍕" },
  { id: 3, title: "3 เคล็ดลับ", icon: "💡" },
  { id: 4, title: "แข่งวิ่ง", icon: "🏁" },
  { id: 5, title: "ทำส่วนเท่ากัน", icon: "⚙️" },
  { id: 6, title: "ห้องทดลอง", icon: "🔬" },
  { id: 7, title: "เกมฝึกทักษะ", icon: "🎮" },
  { id: 8, title: "แบบทดสอบ", icon: "🏆" },
];

const COMPONENTS = [
  () => <LessonVideoCard lessonPath="/lessons/compare" videoUrl={VIDEO_URL} title="วิดีโอ: เปรียบเทียบเศษส่วน" />,
  VisualCompareBattle, ThreeTricks, RaceNumberLine, EqualizeMachine, CompareSandbox, CompareGame,
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
            <VisualCompareBattle />
            <ThreeTricks />
            <RaceNumberLine />
            <EqualizeMachine />
            <CompareSandbox />
            <CompareGame />
            <LessonQuiz
              title="แบบทดสอบ: เปรียบเทียบเศษส่วน"
              gradient="bg-gradient-to-r from-emerald-600 to-green-500"
              makeQuestion={makeCompareQuestion}
              lessonSlug="compare"
            />
          </>
        )}
        footer={<LessonActionBar meta={compareMeta} />}
      />
    </div>
  );
}
