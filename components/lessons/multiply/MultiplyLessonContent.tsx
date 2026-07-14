"use client";

import { LessonActionBar } from "@/components/lessons/LessonActionBar";
import { LessonProgressHeader } from "@/components/lessons/LessonProgressHeader";
import { LessonStepper } from "@/components/lessons/LessonStepper";
import { AreaMultiplyCard } from "@/components/lessons/multiply/AreaMultiplyCard";
import { CrossCancelCard } from "@/components/lessons/multiply/CrossCancelCard";
import { MultiplyPracticeCard } from "@/components/lessons/multiply/MultiplyPracticeCard";
import { MultiplyStepsCard } from "@/components/lessons/multiply/MultiplyStepsCard";
import { MultiplySummaryCard } from "@/components/lessons/multiply/MultiplySummaryCard";
import { MultiplyTimerGameCard } from "@/components/lessons/multiply/MultiplyTimerGameCard";
import { WholeMixedMultiplyCard } from "@/components/lessons/multiply/WholeMixedMultiplyCard";
import { MultiplyGameHub } from "@/components/lessons/multiply/MultiplyGameHub";
import { multiplyLessonMeta } from "@/data/lessonMultiply";
import { LessonVideoCard } from "@/components/lessons/LessonVideoCard";
import { lessonVideos } from "@/data/lessonVideos";
import { LessonQuiz } from "@/components/lessons/LessonQuiz";
import { makeMultiplyQuestion } from "@/lib/quizGenerators";

const VIDEO_URL = lessonVideos["/lessons/multiply"] ?? "";

const STEPS = [
  { id: 1, title: "ดูวิดีโอ" },
  { id: 2, title: "โมเดลพื้นที่" },
  { id: 3, title: "ขั้นตอนการคูณ" },
  { id: 4, title: "ตัดทอนก่อนคูณ" },
  { id: 5, title: "จำนวนเต็ม & จำนวนคละ" },
  { id: 6, title: "เกมจับเวลา" },
  { id: 7, title: "ฝึกทำ" },
  { id: 8, title: "สรุปบทเรียน" },
  { id: 9, title: "แบบทดสอบ" },
  { id: 10, title: "โซนเกม" },
];

const COMPONENTS = [
  () => <LessonVideoCard lessonPath="/lessons/multiply" videoUrl={VIDEO_URL} title="วิดีโอ: คูณเศษส่วน" />,
  AreaMultiplyCard, MultiplyStepsCard, CrossCancelCard,
  WholeMixedMultiplyCard, MultiplyTimerGameCard, MultiplyPracticeCard,
  MultiplySummaryCard,
  () => (
    <LessonQuiz
      title="แบบทดสอบ: คูณเศษส่วน"
      gradient="bg-gradient-to-r from-orange-600 to-amber-400"
      makeQuestion={makeMultiplyQuestion}
      lessonSlug="multiply"
    />
  ),
  MultiplyGameHub,
];

export function MultiplyLessonContent() {
  return (
    <div className="space-y-5">
      <LessonProgressHeader meta={multiplyLessonMeta} lessonSlug="multiply" />
      <LessonStepper
        lessonSlug="multiply"
        steps={STEPS}
        renderStep={(step) => {
          const Comp = COMPONENTS[step - 1];
          return Comp ? <Comp /> : null;
        }}
        renderAll={() => (
          <>
            <LessonVideoCard lessonPath="/lessons/multiply" videoUrl={VIDEO_URL} title="วิดีโอ: คูณเศษส่วน" />
            <AreaMultiplyCard />
            <MultiplyStepsCard />
            <CrossCancelCard />
            <WholeMixedMultiplyCard />
            <div className="grid gap-5 xl:grid-cols-2">
              <MultiplyTimerGameCard />
              <MultiplyPracticeCard />
            </div>
            <MultiplySummaryCard />
            <LessonQuiz
              title="แบบทดสอบ: คูณเศษส่วน"
              gradient="bg-gradient-to-r from-orange-600 to-amber-400"
              makeQuestion={makeMultiplyQuestion}
              lessonSlug="multiply"
            />
            <MultiplyGameHub />
          </>
        )}
        footer={<LessonActionBar meta={multiplyLessonMeta} />}
      />
    </div>
  );
}
