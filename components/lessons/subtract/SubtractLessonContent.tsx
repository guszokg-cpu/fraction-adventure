"use client";

import { LessonActionBar } from "@/components/lessons/LessonActionBar";
import { LessonProgressHeader } from "@/components/lessons/LessonProgressHeader";
import { LessonStepper } from "@/components/lessons/LessonStepper";
import { DiffDenSubtractCard } from "@/components/lessons/subtract/DiffDenSubtractCard";
import { MixedSubtractCard } from "@/components/lessons/subtract/MixedSubtractCard";
import { SameDenSubtractCard } from "@/components/lessons/subtract/SameDenSubtractCard";
import { SubtractPracticeCard } from "@/components/lessons/subtract/SubtractPracticeCard";
import { SubtractSummaryCard } from "@/components/lessons/subtract/SubtractSummaryCard";
import { SubtractTimerGameCard } from "@/components/lessons/subtract/SubtractTimerGameCard";
import { subtractLessonMeta } from "@/data/lessonSubtract";
import { LessonVideoCard } from "@/components/lessons/LessonVideoCard";
import { lessonVideos } from "@/data/lessonVideos";
import { LessonQuiz } from "@/components/lessons/LessonQuiz";
import { makeSubtractQuestion } from "@/lib/quizGenerators";

const VIDEO_URL = lessonVideos["/lessons/subtract"] ?? "";

const STEPS = [
  { id: 1, title: "ดูวิดีโอ" },
  { id: 2, title: "ส่วนเท่ากัน: ลบได้เลย" },
  { id: 3, title: "ส่วนต่างกัน: ทำส่วนให้เท่าก่อน" },
  { id: 4, title: "ลบจำนวนคละ + การยืม" },
  { id: 5, title: "เกมจับเวลา" },
  { id: 6, title: "ฝึกทำ" },
  { id: 7, title: "สรุปบทเรียน" },
  { id: 8, title: "แบบทดสอบ" },
];

const COMPONENTS = [
  () => <LessonVideoCard lessonPath="/lessons/subtract" videoUrl={VIDEO_URL} title="วิดีโอ: ลบเศษส่วน" />,
  SameDenSubtractCard, DiffDenSubtractCard, MixedSubtractCard,
  SubtractTimerGameCard, SubtractPracticeCard,
  SubtractSummaryCard,
  () => (
    <LessonQuiz
      title="แบบทดสอบ: ลบเศษส่วน"
      gradient="bg-gradient-to-r from-emerald-700 to-green-500"
      makeQuestion={makeSubtractQuestion}
      lessonSlug="subtract"
    />
  ),
];

export function SubtractLessonContent() {
  return (
    <div className="space-y-5">
      <LessonProgressHeader meta={subtractLessonMeta} lessonSlug="subtract" />
      <LessonStepper
        lessonSlug="subtract"
        steps={STEPS}
        renderStep={(step) => {
          const Comp = COMPONENTS[step - 1];
          return Comp ? <Comp /> : null;
        }}
        renderAll={() => (
          <>
            <LessonVideoCard lessonPath="/lessons/subtract" videoUrl={VIDEO_URL} title="วิดีโอ: ลบเศษส่วน" />
            <SameDenSubtractCard />
            <DiffDenSubtractCard />
            <MixedSubtractCard />
            <div className="grid gap-5 xl:grid-cols-2">
              <SubtractTimerGameCard />
              <SubtractPracticeCard />
            </div>
            <SubtractSummaryCard />
            <LessonQuiz
              title="แบบทดสอบ: ลบเศษส่วน"
              gradient="bg-gradient-to-r from-emerald-700 to-green-500"
              makeQuestion={makeSubtractQuestion}
              lessonSlug="subtract"
            />
          </>
        )}
        footer={<LessonActionBar meta={subtractLessonMeta} />}
      />
    </div>
  );
}
