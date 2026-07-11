"use client";

import { LessonActionBar } from "@/components/lessons/LessonActionBar";
import { LessonProgressHeader } from "@/components/lessons/LessonProgressHeader";
import { LessonStepper } from "@/components/lessons/LessonStepper";
import { EquivalentBuildCard } from "@/components/lessons/equivalent/EquivalentBuildCard";
import { EquivalentConceptCard } from "@/components/lessons/equivalent/EquivalentConceptCard";
import { EquivalentCrossCheckCard } from "@/components/lessons/equivalent/EquivalentCrossCheckCard";
import { EquivalentPracticeCard } from "@/components/lessons/equivalent/EquivalentPracticeCard";
import { EquivalentPracticeGrid } from "@/components/lessons/equivalent/EquivalentPracticeGrid";
import { EquivalentSummaryCard } from "@/components/lessons/equivalent/EquivalentSummaryCard";
import { EquivalentVisualCompareCard } from "@/components/lessons/equivalent/EquivalentVisualCompareCard";
import { EquivalentGameHub } from "@/components/lessons/equivalent/EquivalentGameHub";
import { equivalentLessonMeta } from "@/data/lessonEquivalent";
import { LessonVideoCard } from "@/components/lessons/LessonVideoCard";
import { lessonVideos } from "@/data/lessonVideos";
import { LessonQuiz } from "@/components/lessons/LessonQuiz";
import { makeEquivalentQuestion } from "@/lib/quizGenerators";

const VIDEO_URL = lessonVideos["/lessons/equivalent"] ?? "";

const STEPS = [
  { id: 1, title: "ดูวิดีโอ" },
  { id: 2, title: "แนวคิดเศษส่วนเท่ากัน" },
  { id: 3, title: "เปรียบเทียบด้วยภาพ" },
  { id: 4, title: "สร้างเศษส่วนเท่ากัน (คูณ–หาร)" },
  { id: 5, title: "ตรวจด้วยคูณไขว้" },
  { id: 6, title: "ฝึกทำ" },
  { id: 7, title: "สรุปบทเรียน" },
  { id: 8, title: "แบบทดสอบ" },
  { id: 9, title: "โซนเกม" },
];

const COMPONENTS = [
  () => <LessonVideoCard lessonPath="/lessons/equivalent" videoUrl={VIDEO_URL} title="วิดีโอ: เศษส่วนที่เท่ากัน" />,
  EquivalentConceptCard, EquivalentVisualCompareCard, EquivalentBuildCard,
  EquivalentCrossCheckCard,
  EquivalentPracticeCard,
  EquivalentSummaryCard,
  () => (
    <LessonQuiz
      title="แบบทดสอบ: เศษส่วนที่เท่ากัน"
      gradient="bg-gradient-to-r from-teal-600 to-violet-500"
      makeQuestion={makeEquivalentQuestion}
      lessonSlug="equivalent"
    />
  ),
  EquivalentGameHub,
];

export function EquivalentLessonContent() {
  return (
    <div className="space-y-5">
      <LessonProgressHeader meta={equivalentLessonMeta} lessonSlug="equivalent" />
      <LessonStepper
        lessonSlug="equivalent"
        steps={STEPS}
        renderStep={(step) => {
          const Comp = COMPONENTS[step - 1];
          return Comp ? <Comp /> : null;
        }}
        renderAll={() => (
          <>
            <LessonVideoCard lessonPath="/lessons/equivalent" videoUrl={VIDEO_URL} title="วิดีโอ: เศษส่วนที่เท่ากัน" />
            <div className="grid gap-5 xl:grid-cols-2">
              <EquivalentConceptCard />
              <EquivalentVisualCompareCard />
            </div>
            <EquivalentBuildCard />
            <EquivalentCrossCheckCard />
            <EquivalentPracticeCard />
            <EquivalentPracticeGrid />
            <EquivalentSummaryCard />
            <LessonQuiz
              title="แบบทดสอบ: เศษส่วนที่เท่ากัน"
              gradient="bg-gradient-to-r from-teal-600 to-violet-500"
              makeQuestion={makeEquivalentQuestion}
              lessonSlug="equivalent"
            />
            <EquivalentGameHub />
          </>
        )}
        footer={<LessonActionBar meta={equivalentLessonMeta} />}
      />
    </div>
  );
}
