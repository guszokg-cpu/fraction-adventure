"use client";

import { LessonActionBar } from "@/components/lessons/LessonActionBar";
import { LessonProgressHeader } from "@/components/lessons/LessonProgressHeader";
import { LessonStepper } from "@/components/lessons/LessonStepper";
import { FrogJumpIntro } from "@/components/lessons/number-line/FrogJumpIntro";
import { ReadPointSection } from "@/components/lessons/number-line/ReadPointSection";
import { NumberLineBuilder } from "@/components/lessons/number-line/NumberLineBuilder";
import { MultiPointCompare } from "@/components/lessons/number-line/MultiPointCompare";
import { NumberLineGame } from "@/components/lessons/number-line/NumberLineGame";
import { numberLineMeta } from "@/data/lessonNumberLine";
import { LessonQuiz } from "@/components/lessons/LessonQuiz";
import { makeNumberLineQuestion } from "@/lib/quizGenerators";

const STEPS = [
  { id: 1, title: "รู้จักเส้นจำนวน", icon: "🐸" },
  { id: 2, title: "อ่านจุดบนเส้น", icon: "🔍" },
  { id: 3, title: "สร้างเส้นจำนวน", icon: "📏" },
  { id: 4, title: "เทียบหลายจุด", icon: "⚖️" },
  { id: 5, title: "เกมกระโดดหาจุด", icon: "🎮" },
  { id: 6, title: "แบบทดสอบ", icon: "💡" },
];

const COMPONENTS = [
  FrogJumpIntro, ReadPointSection, NumberLineBuilder, MultiPointCompare, NumberLineGame,
  () => (
    <LessonQuiz
      title="แบบทดสอบ: เศษส่วนบนเส้นจำนวน"
      gradient="bg-gradient-to-r from-violet-600 to-purple-500"
      makeQuestion={makeNumberLineQuestion}
      lessonSlug="number-line"
    />
  ),
];

export function NumberLineContent() {
  return (
    <div className="space-y-5">
      <LessonProgressHeader meta={numberLineMeta} lessonSlug="number-line" />
      <LessonStepper
        lessonSlug="number-line"
        steps={STEPS}
        renderStep={(step) => {
          const Comp = COMPONENTS[step - 1];
          return Comp ? <Comp /> : null;
        }}
        renderAll={() => (
          <>
            <FrogJumpIntro />
            <ReadPointSection />
            <NumberLineBuilder />
            <MultiPointCompare />
            <NumberLineGame />
            <LessonQuiz
              title="แบบทดสอบ: เศษส่วนบนเส้นจำนวน"
              gradient="bg-gradient-to-r from-violet-600 to-purple-500"
              makeQuestion={makeNumberLineQuestion}
              lessonSlug="number-line"
            />
          </>
        )}
        footer={<LessonActionBar meta={numberLineMeta} />}
      />
    </div>
  );
}
