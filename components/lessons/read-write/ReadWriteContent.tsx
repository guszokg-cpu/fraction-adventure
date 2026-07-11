"use client";

import { LessonActionBar } from "@/components/lessons/LessonActionBar";
import { LessonProgressHeader } from "@/components/lessons/LessonProgressHeader";
import { LessonStepper } from "@/components/lessons/LessonStepper";
import { TypesOverviewSection } from "@/components/lessons/fraction-types/TypesOverviewSection";
import { ProperFractionSection } from "@/components/lessons/fraction-types/ProperFractionSection";
import { ImproperFractionSection } from "@/components/lessons/fraction-types/ImproperFractionSection";
import { MixedNumberSection } from "@/components/lessons/fraction-types/MixedNumberSection";
import { ClassifyActivity } from "@/components/lessons/fraction-types/ClassifyActivity";
import { TreasureSortGame } from "@/components/lessons/fraction-types/TreasureSortGame";
import { readWriteMeta } from "@/data/lessonReadWrite";
import { LessonQuiz } from "@/components/lessons/LessonQuiz";
import { makeFractionTypesQuestion } from "@/lib/quizGenerators";

const STEPS = [
  { id: 1, title: "ภาพรวม", icon: "🏠" },
  { id: 2, title: "เศษส่วนแท้", icon: "🟢" },
  { id: 3, title: "เศษเกิน", icon: "🟠" },
  { id: 4, title: "จำนวนคละ", icon: "🟣" },
  { id: 5, title: "แยกประเภท", icon: "🧩" },
  { id: 6, title: "แบบฝึกทักษะ", icon: "✏️" },
  { id: 7, title: "เกม", icon: "🎮" },
];

const COMPONENTS = [
  TypesOverviewSection, ProperFractionSection, ImproperFractionSection, MixedNumberSection, ClassifyActivity,
  () => (
    <LessonQuiz
      title="แบบฝึกทักษะ: ประเภทของเศษส่วน"
      gradient="bg-gradient-to-r from-sky-600 to-blue-500"
      makeQuestion={makeFractionTypesQuestion}
      lessonSlug="read-write"
    />
  ),
  TreasureSortGame,
];

export function ReadWriteContent() {
  return (
    <div className="space-y-5">
      <LessonProgressHeader meta={readWriteMeta} lessonSlug="read-write" />
      <LessonStepper
        lessonSlug="read-write"
        steps={STEPS}
        renderStep={(step) => {
          const Comp = COMPONENTS[step - 1];
          return Comp ? <Comp /> : null;
        }}
        renderAll={() => (
          <>
            <TypesOverviewSection />
            <ProperFractionSection />
            <ImproperFractionSection />
            <MixedNumberSection />
            <ClassifyActivity />
            <LessonQuiz
              title="แบบฝึกทักษะ: ประเภทของเศษส่วน"
              gradient="bg-gradient-to-r from-sky-600 to-blue-500"
              makeQuestion={makeFractionTypesQuestion}
              lessonSlug="read-write"
            />
            <TreasureSortGame />
          </>
        )}
        footer={<LessonActionBar meta={readWriteMeta} />}
      />
    </div>
  );
}
