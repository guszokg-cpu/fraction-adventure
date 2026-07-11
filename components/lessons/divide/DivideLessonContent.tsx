"use client";

import { LessonActionBar } from "@/components/lessons/LessonActionBar";
import { LessonProgressHeader } from "@/components/lessons/LessonProgressHeader";
import { LessonStepper } from "@/components/lessons/LessonStepper";
import { DivideLabCard } from "@/components/lessons/divide/DivideLabCard";
import { DividePracticeCard } from "@/components/lessons/divide/DividePracticeCard";
import { DivideStepsCard } from "@/components/lessons/divide/DivideStepsCard";
import { DivideSummaryCard } from "@/components/lessons/divide/DivideSummaryCard";
import { DivideTimerGameCard } from "@/components/lessons/divide/DivideTimerGameCard";
import { WholeMixedDivideCard } from "@/components/lessons/divide/WholeMixedDivideCard";
import { divideLessonMeta } from "@/data/lessonDivide";
import { LessonVideoCard } from "@/components/lessons/LessonVideoCard";
import { lessonVideos } from "@/data/lessonVideos";
import { LessonQuiz } from "@/components/lessons/LessonQuiz";
import { makeDivideQuestion } from "@/lib/quizGenerators";

const VIDEO_URL = lessonVideos["/lessons/divide"] ?? "";

const STEPS = [
  { id: 1, title: "ดูวิดีโอ" },
  { id: 2, title: "ห้องทดลอง: มีกี่ชิ้น" },
  { id: 3, title: "กลับแล้วคูณ" },
  { id: 4, title: "จำนวนเต็ม & จำนวนคละ" },
  { id: 5, title: "เกมจับเวลา" },
  { id: 6, title: "ฝึกทำ" },
  { id: 7, title: "สรุปบทเรียน" },
  { id: 8, title: "แบบทดสอบ" },
];

const COMPONENTS = [
  () => <LessonVideoCard lessonPath="/lessons/divide" videoUrl={VIDEO_URL} title="วิดีโอ: หารเศษส่วน" />,
  DivideLabCard, DivideStepsCard, WholeMixedDivideCard,
  DivideTimerGameCard, DividePracticeCard,
  DivideSummaryCard,
  () => (
    <LessonQuiz
      title="แบบทดสอบ: หารเศษส่วน"
      gradient="bg-gradient-to-r from-violet-700 to-purple-500"
      makeQuestion={makeDivideQuestion}
      lessonSlug="divide"
    />
  ),
];

export function DivideLessonContent() {
  return (
    <div className="space-y-5">
      <LessonProgressHeader meta={divideLessonMeta} lessonSlug="divide" />
      <LessonStepper
        lessonSlug="divide"
        steps={STEPS}
        renderStep={(step) => {
          const Comp = COMPONENTS[step - 1];
          return Comp ? <Comp /> : null;
        }}
        renderAll={() => (
          <>
            <LessonVideoCard lessonPath="/lessons/divide" videoUrl={VIDEO_URL} title="วิดีโอ: หารเศษส่วน" />
            <DivideLabCard />
            <DivideStepsCard />
            <WholeMixedDivideCard />
            <div className="grid gap-5 xl:grid-cols-2">
              <DivideTimerGameCard />
              <DividePracticeCard />
            </div>
            <DivideSummaryCard />
            <LessonQuiz
              title="แบบทดสอบ: หารเศษส่วน"
              gradient="bg-gradient-to-r from-violet-700 to-purple-500"
              makeQuestion={makeDivideQuestion}
              lessonSlug="divide"
            />
          </>
        )}
        footer={<LessonActionBar meta={divideLessonMeta} />}
      />
    </div>
  );
}
