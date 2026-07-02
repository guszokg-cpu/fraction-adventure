"use client";

import { LessonActionBar } from "@/components/lessons/LessonActionBar";
import { LessonProgressHeader } from "@/components/lessons/LessonProgressHeader";
import { LessonStepper } from "@/components/lessons/LessonStepper";
import { ImageFractionQuestion } from "@/components/lessons/fraction-from-image/ImageFractionQuestion";
import { StepExplanationSection } from "@/components/lessons/fraction-from-image/StepExplanationSection";
import { MultipleRepresentationsSection } from "@/components/lessons/fraction-from-image/MultipleRepresentationsSection";
import { ColorFractionBuilder } from "@/components/lessons/fraction-from-image/ColorFractionBuilder";
import { DrawFractionChallenge } from "@/components/lessons/fraction-from-image/DrawFractionChallenge";
import { fractionFromImageMeta } from "@/data/lessonFractionFromImage";
import { LessonQuiz } from "@/components/lessons/LessonQuiz";
import { makeFractionFromImageQuestion } from "@/lib/quizGenerators";

const STEPS = [
  { id: 1, title: "ดูภาพตอบคำถาม" },
  { id: 2, title: "อธิบายทีละขั้น" },
  { id: 3, title: "หลายรูปแบบ" },
  { id: 4, title: "ระบายสีเอง" },
  { id: 5, title: "กิจกรรมฝึกทักษะ" },
  { id: 6, title: "แบบทดสอบ" },
];

const COMPONENTS = [
  ImageFractionQuestion, StepExplanationSection, MultipleRepresentationsSection, ColorFractionBuilder, DrawFractionChallenge,
  () => (
    <LessonQuiz
      title="แบบทดสอบ: อ่านเศษส่วนจากภาพ"
      gradient="bg-gradient-to-r from-sky-600 to-blue-500"
      makeQuestion={makeFractionFromImageQuestion}
      lessonSlug="fraction-from-image"
    />
  ),
];

export function FractionFromImageContent() {
  return (
    <div className="space-y-5">
      <LessonProgressHeader meta={fractionFromImageMeta} lessonSlug="fraction-from-image" />
      <LessonStepper
        lessonSlug="fraction-from-image"
        steps={STEPS}
        renderStep={(step) => {
          const Comp = COMPONENTS[step - 1];
          return Comp ? <Comp /> : null;
        }}
        renderAll={() => (
          <>
            <ImageFractionQuestion />
            <StepExplanationSection />
            <MultipleRepresentationsSection />
            <ColorFractionBuilder />
            <DrawFractionChallenge />
            <LessonQuiz
              title="แบบทดสอบ: อ่านเศษส่วนจากภาพ"
              gradient="bg-gradient-to-r from-sky-600 to-blue-500"
              makeQuestion={makeFractionFromImageQuestion}
      lessonSlug="fraction-from-image"
            />
          </>
        )}
        footer={<LessonActionBar meta={fractionFromImageMeta} />}
      />
    </div>
  );
}
