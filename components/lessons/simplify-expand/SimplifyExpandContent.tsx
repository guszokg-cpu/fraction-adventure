"use client";

import { LessonActionBar } from "@/components/lessons/LessonActionBar";
import { LessonProgressHeader } from "@/components/lessons/LessonProgressHeader";
import { LessonStepper } from "@/components/lessons/LessonStepper";
import { LessonVideoCard } from "@/components/lessons/LessonVideoCard";
import { EquivalentFamilyCard } from "@/components/lessons/simplify-expand/EquivalentFamilyCard";
import { GcdShortcutCard } from "@/components/lessons/simplify-expand/GcdShortcutCard";
import { IsLowestGameCard } from "@/components/lessons/simplify-expand/IsLowestGameCard";
import { MatchFamilyGameCard } from "@/components/lessons/simplify-expand/MatchFamilyGameCard";
import { SimplifyLabCard } from "@/components/lessons/simplify-expand/SimplifyLabCard";
import { SimplifySummaryCard } from "@/components/lessons/simplify-expand/SimplifySummaryCard";
import { SpeedSimplifyGameCard } from "@/components/lessons/simplify-expand/SpeedSimplifyGameCard";
import { SimplifyGameHub } from "@/components/lessons/simplify-expand/SimplifyGameHub";
import { simplifyExpandMeta } from "@/data/lessonSimplifyExpand";
import { lessonVideos } from "@/data/lessonVideos";
import { LessonQuiz } from "@/components/lessons/LessonQuiz";
import { makeSimplifyQuestion } from "@/lib/quizGenerators";

const VIDEO_URL = lessonVideos["/lessons/simplify-expand"] ?? "";

const STEPS = [
  { id: 1, title: "ดูวิดีโอ" },
  { id: 2, title: "ครอบครัวเศษส่วนเท่ากัน" },
  { id: 3, title: "ห้องทดลองย่อ" },
  { id: 4, title: "ทางลัด ห.ร.ม." },
  { id: 5, title: "อย่างต่ำหรือยัง?" },
  { id: 6, title: "จับคู่ครอบครัว" },
  { id: 7, title: "ย่อเร็ว 60 วิ" },
  { id: 8, title: "สรุปบทเรียน" },
  { id: 9, title: "แบบทดสอบ" },
  { id: 10, title: "โซนเกม" },
];

const COMPONENTS = [
  () => <LessonVideoCard lessonPath="/lessons/simplify-expand" videoUrl={VIDEO_URL} title="วิดีโอ: เศษส่วนอย่างต่ำ" />,
  EquivalentFamilyCard, SimplifyLabCard, GcdShortcutCard,
  IsLowestGameCard, MatchFamilyGameCard, SpeedSimplifyGameCard,
  SimplifySummaryCard,
  () => (
    <LessonQuiz
      title="แบบทดสอบ: เศษส่วนอย่างต่ำ"
      gradient="bg-gradient-to-r from-orange-500 to-amber-500"
      makeQuestion={makeSimplifyQuestion}
      lessonSlug="simplify-expand"
    />
  ),
  SimplifyGameHub,
];

export function SimplifyExpandContent() {
  return (
    <div className="space-y-5">
      <LessonProgressHeader meta={simplifyExpandMeta} lessonSlug="simplify-expand" />
      <LessonStepper
        lessonSlug="simplify-expand"
        steps={STEPS}
        renderStep={(step) => {
          const Comp = COMPONENTS[step - 1];
          return Comp ? <Comp /> : null;
        }}
        renderAll={() => (
          <>
            <LessonVideoCard lessonPath="/lessons/simplify-expand" videoUrl={VIDEO_URL} title="วิดีโอ: เศษส่วนอย่างต่ำ" />
            <EquivalentFamilyCard />
            <SimplifyLabCard />
            <GcdShortcutCard />
            <div className="grid gap-5 xl:grid-cols-2">
              <IsLowestGameCard />
              <MatchFamilyGameCard />
            </div>
            <SpeedSimplifyGameCard />
            <SimplifySummaryCard />
            <LessonQuiz
              title="แบบทดสอบ: เศษส่วนอย่างต่ำ"
              gradient="bg-gradient-to-r from-orange-500 to-amber-500"
              makeQuestion={makeSimplifyQuestion}
              lessonSlug="simplify-expand"
            />
            <SimplifyGameHub />
          </>
        )}
        footer={<LessonActionBar meta={simplifyExpandMeta} />}
      />
    </div>
  );
}
