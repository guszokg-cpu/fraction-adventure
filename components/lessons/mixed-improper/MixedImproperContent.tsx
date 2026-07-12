"use client";

import { LessonActionBar } from "@/components/lessons/LessonActionBar";
import { LessonProgressHeader } from "@/components/lessons/LessonProgressHeader";
import { LessonStepper } from "@/components/lessons/LessonStepper";
import { ConvertPracticeCard } from "@/components/lessons/mixed-improper/ConvertPracticeCard";
import { ImproperIntroBuilder } from "@/components/lessons/mixed-improper/ImproperIntroBuilder";
import { MatchMixedGameCard } from "@/components/lessons/mixed-improper/MatchMixedGameCard";
import { MixedNumberLineGame } from "@/components/lessons/mixed-improper/MixedNumberLineGame";
import { MixedSummaryCard } from "@/components/lessons/mixed-improper/MixedSummaryCard";
import { MixedTimerGameCard } from "@/components/lessons/mixed-improper/MixedTimerGameCard";
import { TwoWayConverterCard } from "@/components/lessons/mixed-improper/TwoWayConverterCard";
import { MixedGameHub } from "@/components/lessons/mixed-improper/MixedGameHub";
import { mixedImproperMeta } from "@/data/lessonMixedImproper";
import { LessonVideoCard } from "@/components/lessons/LessonVideoCard";
import { lessonVideos } from "@/data/lessonVideos";
import { LessonQuiz } from "@/components/lessons/LessonQuiz";
import { makeMixedImproperQuestion } from "@/lib/quizGenerators";

const VIDEO_URL = lessonVideos["/lessons/mixed-improper"] ?? "";

const STEPS = [
  { id: 1, title: "ดูวิดีโอ" },
  { id: 2, title: "รู้จักเศษเกิน" },
  { id: 3, title: "เครื่องแปลง 2 ทิศทาง" },
  { id: 4, title: "บนเส้นจำนวน" },
  { id: 5, title: "ฝึกแปลง" },
  { id: 6, title: "จับคู่" },
  { id: 7, title: "เกมจับเวลา" },
  { id: 8, title: "สรุปบทเรียน" },
  { id: 9, title: "แบบทดสอบ" },
  { id: 10, title: "โซนเกม" },
];

const COMPONENTS = [
  () => <LessonVideoCard lessonPath="/lessons/mixed-improper" videoUrl={VIDEO_URL} title="วิดีโอ: จำนวนคละและเศษเกิน" />,
  ImproperIntroBuilder, TwoWayConverterCard, MixedNumberLineGame,
  ConvertPracticeCard, MatchMixedGameCard, MixedTimerGameCard,
  MixedSummaryCard,
  () => (
    <LessonQuiz
      title="แบบทดสอบ: จำนวนคละและเศษเกิน"
      gradient="bg-gradient-to-r from-pink-600 to-fuchsia-600"
      makeQuestion={makeMixedImproperQuestion}
      lessonSlug="mixed-improper"
    />
  ),
  MixedGameHub,
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
            <ImproperIntroBuilder />
            <TwoWayConverterCard />
            <MixedNumberLineGame />
            <ConvertPracticeCard />
            <div className="grid gap-5 xl:grid-cols-2">
              <MatchMixedGameCard />
              <MixedTimerGameCard />
            </div>
            <MixedSummaryCard />
            <LessonQuiz
              title="แบบทดสอบ: จำนวนคละและเศษเกิน"
              gradient="bg-gradient-to-r from-pink-600 to-fuchsia-600"
              makeQuestion={makeMixedImproperQuestion}
              lessonSlug="mixed-improper"
            />
            <MixedGameHub />
          </>
        )}
        footer={<LessonActionBar meta={mixedImproperMeta} />}
      />
    </div>
  );
}
