"use client";

import { Card } from "@/components/ui/Card";
import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionStack } from "@/components/fractions/FractionStack";
import { LessonProgressHeader } from "@/components/lessons/LessonProgressHeader";
import { LessonActionBar } from "@/components/lessons/LessonActionBar";
import { LessonStepper } from "@/components/lessons/LessonStepper";
import { FractionBuilder } from "@/components/lessons/fraction-intro/FractionBuilder";
import { ThreeImportantSteps } from "@/components/lessons/fraction-intro/ThreeImportantSteps";
import { InteractiveFractionExamples } from "@/components/lessons/fraction-intro/InteractiveFractionExamples";
import { FractionWorldCard } from "@/components/lessons/fraction-intro/FractionWorldCard";
import { EqualPartsSection } from "@/components/lessons/fraction-intro/EqualPartsSection";
import { FractionMeaningQuiz } from "@/components/lessons/fraction-intro/FractionMeaningQuiz";
import { LessonVideoCard } from "@/components/lessons/LessonVideoCard";
import { fractionIntroMeta } from "@/data/lessonFractionIntro";
import { lessonVideos } from "@/data/lessonVideos";
import { LessonQuiz } from "@/components/lessons/LessonQuiz";
import { makeFractionIntroQuestion } from "@/lib/quizGenerators";

function ConceptCard() {
  return (
    <Card>
      <div className="inline-flex rounded-full bg-brand-100 px-4 py-1 text-sm font-extrabold text-brand-700">
        ความหมายของเศษส่วน
      </div>
      <h2 className="mt-3 text-2xl font-extrabold text-brand-900">เศษส่วนคืออะไร?</h2>
      <p className="mt-2 text-base font-bold leading-relaxed text-slate-600">
        เศษส่วนคือจำนวนที่บอกว่าเราเลือกบางส่วนจาก 1 หน่วยที่ถูกแบ่งออกเป็นส่วนเท่า ๆ กัน
        เช่น พิซซ่า 1 ถาด แบ่งเป็น 4 ชิ้นเท่ากัน แล้วเลือก 3 ชิ้น เขียนเป็น 3/4
      </p>
      <div className="mt-5 grid items-center gap-6 md:grid-cols-[200px_1fr]">
        <FractionShape numerator={3} denominator={4} tone="accent" className="mx-auto h-44 w-44" />
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="text-7xl font-extrabold leading-none text-slate-300">
              <FractionStack top={<span className="text-rose-500">3</span>} bottom={<span className="text-brand-600">4</span>} />
            </div>
            <div className="space-y-3 text-sm font-bold">
              <div className="rounded-lg bg-rose-50 px-4 py-2 text-rose-600">
                ตัวเศษ = ส่วนที่เลือก (ระบาย)
              </div>
              <div className="rounded-lg bg-brand-50 px-4 py-2 text-brand-700">
                ตัวส่วน = ส่วนทั้งหมดที่แบ่งเท่า ๆ กัน
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700">
            3/4 หมายถึง เลือก 3 ส่วน จากทั้งหมด 4 ส่วนที่เท่ากัน
          </div>
        </div>
      </div>
    </Card>
  );
}

const VIDEO_URL = lessonVideos["/lessons/fraction-intro"] ?? "";

const STEPS = [
  { id: 1, title: "ดูวิดีโอ" },
  { id: 2, title: "เศษส่วนคืออะไร" },
  { id: 3, title: "3 ขั้นตอนสำคัญ" },
  { id: 4, title: "ตัวอย่างที่พบบ่อย" },
  { id: 5, title: "สร้างเศษส่วน" },
  { id: 6, title: "เศษส่วนรอบตัวเรา" },
  { id: 7, title: "แบ่งเท่า vs ไม่เท่า" },
  { id: 8, title: "ควิซ" },
  { id: 9, title: "แบบทดสอบ" },
];

const COMPONENTS = [
  () => <LessonVideoCard lessonPath="/lessons/fraction-intro" videoUrl={VIDEO_URL} title="วิดีโอ: รู้จักเศษส่วน" />,
  ConceptCard, ThreeImportantSteps, InteractiveFractionExamples,
  FractionBuilder, FractionWorldCard, EqualPartsSection,
  FractionMeaningQuiz,
  () => (
    <LessonQuiz
      title="แบบทดสอบ: รู้จักเศษส่วน"
      gradient="bg-gradient-to-r from-brand-700 to-indigo-500"
      makeQuestion={makeFractionIntroQuestion}
      lessonSlug="fraction-intro"
    />
  ),
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
            <ConceptCard />
            <ThreeImportantSteps />
            <InteractiveFractionExamples />
            <FractionBuilder />
            <FractionWorldCard />
            <EqualPartsSection />
            <FractionMeaningQuiz />
            <LessonQuiz
              title="แบบทดสอบ: รู้จักเศษส่วน"
              gradient="bg-gradient-to-r from-brand-700 to-indigo-500"
              makeQuestion={makeFractionIntroQuestion}
              lessonSlug="fraction-intro"
            />
          </>
        )}
        footer={<LessonActionBar meta={fractionIntroMeta} />}
      />
    </div>
  );
}
