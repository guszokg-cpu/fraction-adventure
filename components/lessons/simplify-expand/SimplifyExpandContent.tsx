"use client";

import { LessonActionBar } from "@/components/lessons/LessonActionBar";
import { LessonProgressHeader } from "@/components/lessons/LessonProgressHeader";
import { LessonStepper } from "@/components/lessons/LessonStepper";
import { ConnectPairsCard } from "@/components/lessons/simplify-expand/ConnectPairsCard";
import { EquivalentGeneratorCard } from "@/components/lessons/simplify-expand/EquivalentGeneratorCard";
import { ExpandFractionCard } from "@/components/lessons/simplify-expand/ExpandFractionCard";
import { FractionDetectiveCard } from "@/components/lessons/simplify-expand/FractionDetectiveCard";
import { LowestTermCard } from "@/components/lessons/simplify-expand/LowestTermCard";
import { SimplifyFractionCard } from "@/components/lessons/simplify-expand/SimplifyFractionCard";
import { SimplifyPracticeGrid } from "@/components/lessons/simplify-expand/SimplifyPracticeGrid";
import { SpeedSimplifyCard } from "@/components/lessons/simplify-expand/SpeedSimplifyCard";
import { ZoomEquivalentCard } from "@/components/lessons/simplify-expand/ZoomEquivalentCard";
import { simplifyExpandMeta } from "@/data/lessonSimplifyExpand";
import { LessonQuiz } from "@/components/lessons/LessonQuiz";
import { makeSimplifyQuestion } from "@/lib/quizGenerators";

const STEPS = [
  { id: 1, title: "ขยายเศษส่วน" },
  { id: 2, title: "ย่อเศษส่วน" },
  { id: 3, title: "ซูมเศษส่วนเท่ากัน" },
  { id: 4, title: "สร้างเศษส่วนเท่ากัน" },
  { id: 5, title: "เศษส่วนอย่างต่ำ" },
  { id: 6, title: "นักสืบเศษส่วน" },
  { id: 7, title: "จับคู่" },
  { id: 8, title: "ย่อเร็ว" },
  { id: 9, title: "แบบทดสอบ" },
];

const COMPONENTS = [
  ExpandFractionCard, SimplifyFractionCard, ZoomEquivalentCard,
  EquivalentGeneratorCard, LowestTermCard, FractionDetectiveCard,
  ConnectPairsCard, SpeedSimplifyCard,
  () => (
    <LessonQuiz
      title="แบบทดสอบ: ย่อและขยายเศษส่วน"
      gradient="bg-gradient-to-r from-indigo-600 to-blue-500"
      makeQuestion={makeSimplifyQuestion}
      lessonSlug="simplify-expand"
    />
  ),
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
            <div className="grid gap-5 xl:grid-cols-2">
              <ExpandFractionCard />
              <SimplifyFractionCard />
            </div>
            <ZoomEquivalentCard />
            <EquivalentGeneratorCard />
            <LowestTermCard />
            <div className="grid gap-5 xl:grid-cols-2">
              <FractionDetectiveCard />
              <ConnectPairsCard />
            </div>
            <SpeedSimplifyCard />
            <SimplifyPracticeGrid />
            <LessonQuiz
              title="แบบทดสอบ: ย่อและขยายเศษส่วน"
              gradient="bg-gradient-to-r from-indigo-600 to-blue-500"
              makeQuestion={makeSimplifyQuestion}
      lessonSlug="simplify-expand"
            />
          </>
        )}
        footer={<LessonActionBar meta={simplifyExpandMeta} />}
      />
    </div>
  );
}
