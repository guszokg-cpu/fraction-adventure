"use client";

import { LessonActionBar } from "@/components/lessons/LessonActionBar";
import { LessonProgressHeader } from "@/components/lessons/LessonProgressHeader";
import { LessonStepper } from "@/components/lessons/LessonStepper";
import { ConvertToImproperQuiz } from "@/components/lessons/mixed-improper/ConvertToImproperQuiz";
import { ConvertToMixedQuiz } from "@/components/lessons/mixed-improper/ConvertToMixedQuiz";
import { ImproperIntroCard } from "@/components/lessons/mixed-improper/ImproperIntroCard";
import { ImproperToMixedCard } from "@/components/lessons/mixed-improper/ImproperToMixedCard";
import { MatchPairsCard } from "@/components/lessons/mixed-improper/MatchPairsCard";
import { MixedConverterCard } from "@/components/lessons/mixed-improper/MixedConverterCard";
import { MixedNumberLineCard } from "@/components/lessons/mixed-improper/MixedNumberLineCard";
import { MixedPracticeGrid } from "@/components/lessons/mixed-improper/MixedPracticeGrid";
import { MixedToImproperCard } from "@/components/lessons/mixed-improper/MixedToImproperCard";
import { TimerGameCard } from "@/components/lessons/mixed-improper/TimerGameCard";
import { VisualQuizCard } from "@/components/lessons/mixed-improper/VisualQuizCard";
import { mixedImproperMeta } from "@/data/lessonMixedImproper";
import { LessonVideoCard } from "@/components/lessons/LessonVideoCard";
import { lessonVideos } from "@/data/lessonVideos";
import { LessonQuiz } from "@/components/lessons/LessonQuiz";
import { makeMixedImproperQuestion } from "@/lib/quizGenerators";

const VIDEO_URL = lessonVideos["/lessons/mixed-improper"] ?? "";

const STEPS = [
  { id: 1, title: "ดูวิดีโอ" },
  { id: 2, title: "รู้จักเศษเกิน" },
  { id: 3, title: "เศษเกิน → จำนวนคละ" },
  { id: 4, title: "จำนวนคละ → เศษเกิน" },
  { id: 5, title: "เครื่องแปลง" },
  { id: 6, title: "บนเส้นจำนวน" },
  { id: 7, title: "ดูภาพตอบคำถาม" },
  { id: 8, title: "แปลงเศษเกิน" },
  { id: 9, title: "แปลงจำนวนคละ" },
  { id: 10, title: "ลากจับคู่" },
  { id: 11, title: "เกมจับเวลา" },
  { id: 12, title: "แบบทดสอบ" },
];

const COMPONENTS = [
  () => <LessonVideoCard lessonPath="/lessons/mixed-improper" videoUrl={VIDEO_URL} title="วิดีโอ: จำนวนคละและเศษเกิน" />,
  ImproperIntroCard, ImproperToMixedCard, MixedToImproperCard,
  MixedConverterCard, MixedNumberLineCard, VisualQuizCard,
  ConvertToMixedQuiz, ConvertToImproperQuiz, MatchPairsCard, TimerGameCard,
  () => (
    <LessonQuiz
      title="แบบทดสอบ: จำนวนคละและเศษเกิน"
      gradient="bg-gradient-to-r from-orange-600 to-amber-500"
      makeQuestion={makeMixedImproperQuestion}
      lessonSlug="mixed-improper"
    />
  ),
];

export function MixedImproperContent() {
  return (
    <div className="space-y-5">
      <LessonProgressHeader meta={mixedImproperMeta} lessonSlug="mixed-improper" />
      <LessonStepper
        lessonSlug="mixed-improper"
        steps={STEPS}
        renderStep={(step) => {
          const Comp = COMPONENTS[step - 1];
          return Comp ? <Comp /> : null;
        }}
        renderAll={() => (
          <>
            <LessonVideoCard lessonPath="/lessons/mixed-improper" videoUrl={VIDEO_URL} title="วิดีโอ: จำนวนคละและเศษเกิน" />
            <div className="grid gap-5 xl:grid-cols-3">
              <ImproperIntroCard />
              <ImproperToMixedCard />
              <MixedToImproperCard />
            </div>
            <div className="grid gap-5 xl:grid-cols-3">
              <MixedConverterCard />
              <MixedNumberLineCard />
              <VisualQuizCard />
            </div>
            <div className="grid gap-5 xl:grid-cols-2">
              <ConvertToMixedQuiz />
              <ConvertToImproperQuiz />
            </div>
            <div className="grid gap-5 xl:grid-cols-2">
              <MatchPairsCard />
              <TimerGameCard />
            </div>
            <MixedPracticeGrid />
            <LessonQuiz
              title="แบบทดสอบ: จำนวนคละและเศษเกิน"
              gradient="bg-gradient-to-r from-orange-600 to-amber-500"
              makeQuestion={makeMixedImproperQuestion}
      lessonSlug="mixed-improper"
            />
          </>
        )}
        footer={<LessonActionBar meta={mixedImproperMeta} />}
      />
    </div>
  );
}
