"use client";

import { LessonProgressHeader } from "@/components/lessons/LessonProgressHeader";
import { LessonActionBar } from "@/components/lessons/LessonActionBar";
import { LessonStepper } from "@/components/lessons/LessonStepper";
import { PizzaCutStory } from "@/components/lessons/fraction-intro/PizzaCutStory";
import { ThreeImportantSteps } from "@/components/lessons/fraction-intro/ThreeImportantSteps";
import { InteractiveFractionExamples } from "@/components/lessons/fraction-intro/InteractiveFractionExamples";
import { RealWorldChallengeCard } from "@/components/lessons/fraction-intro/RealWorldChallengeCard";
import { EqualPartsCourtCard } from "@/components/lessons/fraction-intro/EqualPartsCourtCard";
import { IntroTimerGameCard } from "@/components/lessons/fraction-intro/IntroTimerGameCard";
import { IntroSummaryCard } from "@/components/lessons/fraction-intro/IntroSummaryCard";
import { IntroGameHub } from "@/components/lessons/fraction-intro/IntroGameHub";
import { LessonVideoCard } from "@/components/lessons/LessonVideoCard";
import { fractionIntroMeta } from "@/data/lessonFractionIntro";
import { lessonVideos } from "@/data/lessonVideos";
import { LessonQuiz } from "@/components/lessons/LessonQuiz";
import { makeFractionIntroQuestion } from "@/lib/quizGenerators";

const VIDEO_URL = lessonVideos["/lessons/fraction-intro"] ?? "";

const STEPS = [
  { id: 1, title: "ดูวิดีโอ" },
  { id: 2, title: "แบ่งพิซซ่ากันเถอะ" },
  { id: 3, title: "3 ขั้นตอนสำคัญ" },
  { id: 4, title: "ห้องทดลองเศษส่วน" },
  { id: 5, title: "เศษส่วนรอบตัวเรา" },
  { id: 6, title: "ศาลเศษส่วน" },
  { id: 7, title: "เกมจับเวลา" },
  { id: 8, title: "สรุปบทเรียน" },
  { id: 9, title: "แบบทดสอบ" },
  { id: 10, title: "โซนเกม" },
];

const COMPONENTS = [
  () => <LessonVideoCard lessonPath="/lessons/fraction-intro" videoUrl={VIDEO_URL} title="วิดีโอ: รู้จักเศษส่วน" />,
  PizzaCutStory, ThreeImportantSteps, InteractiveFractionExamples,
  RealWorldChallengeCard, EqualPartsCourtCard, IntroTimerGameCard,
  IntroSummaryCard,
  () => (
    <LessonQuiz
      title="แบบทดสอบ: รู้จักเศษส่วน"
      gradient="bg-gradient-to-r from-brand-700 to-indigo-500"
      makeQuestion={makeFractionIntroQuestion}
      lessonSlug="fraction-intro"
    />
  ),
  IntroGameHub,
];

export function FractionIntroContent() {
  return (
    <div className="space-y-5">
      <LessonProgressHeader meta={fractionIntroMeta} lessonSlug="fraction-intro" />
      <LessonStepper
        lessonSlug="fraction-intro"
        steps={STEPS}
        renderStep={(step) => {
          const Comp = COMPONENTS[step - 1];
          return Comp ? <Comp /> : null;
        }}
        renderAll={() => (
          <>
            <LessonVideoCard lessonPath="/lessons/fraction-intro" videoUrl={VIDEO_URL} title="วิดีโอ: รู้จักเศษส่วน" />
            <PizzaCutStory />
            <ThreeImportantSteps />
            <InteractiveFractionExamples />
            <div className="grid gap-5 xl:grid-cols-2">
              <RealWorldChallengeCard />
              <EqualPartsCourtCard />
            </div>
            <IntroTimerGameCard />
            <IntroSummaryCard />
            <LessonQuiz
              title="แบบทดสอบ: รู้จักเศษส่วน"
              gradient="bg-gradient-to-r from-brand-700 to-indigo-500"
              makeQuestion={makeFractionIntroQuestion}
              lessonSlug="fraction-intro"
            />
            <IntroGameHub />
          </>
        )}
        footer={<LessonActionBar meta={fractionIntroMeta} />}
      />
    </div>
  );
}
