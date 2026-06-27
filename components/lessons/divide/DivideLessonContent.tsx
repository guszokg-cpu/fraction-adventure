"use client";

import { LessonActionBar } from "@/components/lessons/LessonActionBar";
import { LessonProgressHeader } from "@/components/lessons/LessonProgressHeader";
import { LessonStepper } from "@/components/lessons/LessonStepper";
import { LessonSummary } from "@/components/lessons/LessonSummary";
import { DividePracticeCard } from "@/components/lessons/divide/DividePracticeCard";
import { DividePracticeGrid } from "@/components/lessons/divide/DividePracticeGrid";
import { DivideStepsCard } from "@/components/lessons/divide/DivideStepsCard";
import { DivideTimerCard } from "@/components/lessons/divide/DivideTimerCard";
import { DivideTypeSelector } from "@/components/lessons/divide/DivideTypeSelector";
import { FractionLabCard } from "@/components/lessons/divide/FractionLabCard";
import { LiveExperimentCard } from "@/components/lessons/divide/LiveExperimentCard";
import { MixedDivideCard } from "@/components/lessons/divide/MixedDivideCard";
import { MultiplyVsDivideCard } from "@/components/lessons/divide/MultiplyVsDivideCard";
import { WholeNumberDivideCard } from "@/components/lessons/divide/WholeNumberDivideCard";
import { WhyFlipCard } from "@/components/lessons/divide/WhyFlipCard";
import { divideLessonMeta } from "@/data/lessonDivide";
import { LessonVideoCard } from "@/components/lessons/LessonVideoCard";
import { lessonVideos } from "@/data/lessonVideos";
import { LessonQuiz } from "@/components/lessons/LessonQuiz";
import { makeDivideQuestion } from "@/lib/quizGenerators";

const VIDEO_URL = lessonVideos["/lessons/divide"] ?? "";

const STEPS = [
  { id: 1, title: "ดูวิดีโอ" },
  { id: 2, title: "ประเภทการหาร" },
  { id: 3, title: "ห้องทดลอง" },
  { id: 4, title: "ขั้นตอนการหาร" },
  { id: 5, title: "ทำไมต้องกลับ" },
  { id: 6, title: "หารด้วยจำนวนเต็ม" },
  { id: 7, title: "จำนวนคละ" },
  { id: 8, title: "ทดลองสด" },
  { id: 9, title: "คูณ vs หาร" },
  { id: 10, title: "ฝึกทำ" },
  { id: 11, title: "เกมจับเวลา" },
  { id: 12, title: "สรุปบทเรียน" },
  { id: 13, title: "แบบทดสอบ" },
];

const COMPONENTS = [
  () => <LessonVideoCard lessonPath="/lessons/divide" videoUrl={VIDEO_URL} title="วิดีโอ: หารเศษส่วน" />,
  DivideTypeSelector, FractionLabCard, DivideStepsCard,
  WhyFlipCard, WholeNumberDivideCard, MixedDivideCard,
  LiveExperimentCard, MultiplyVsDivideCard, DividePracticeCard, DivideTimerCard,
  () => (
    <LessonSummary
      gradient="bg-gradient-to-r from-violet-700 to-purple-500"
      mascot="➗"
      points={[
        "การหาร = คงตัวหน้า กลับตัวหลัง แล้วคูณ",
        "เศษส่วนที่กลับหัว–ท้ายเรียกว่า ส่วนกลับ",
        "หารด้วยจำนวนเต็ม = คูณด้วย 1 ส่วนจำนวนนั้น",
        "ทำผลลัพธ์ให้เป็นเศษส่วนอย่างต่ำ",
      ]}
    />
  ),
  () => (
    <LessonQuiz
      title="แบบทดสอบ: หารเศษส่วน"
      gradient="bg-gradient-to-r from-violet-700 to-purple-500"
      makeQuestion={makeDivideQuestion}
    />
  ),
];

export function DivideLessonContent() {
  return (
    <div className="space-y-5">
      <LessonProgressHeader meta={divideLessonMeta} />
      <LessonStepper
        steps={STEPS}
        renderStep={(step) => {
          const Comp = COMPONENTS[step - 1];
          return Comp ? <Comp /> : null;
        }}
        renderAll={() => (
          <>
            <LessonVideoCard lessonPath="/lessons/divide" videoUrl={VIDEO_URL} title="วิดีโอ: หารเศษส่วน" />
            <DivideTypeSelector />
            <div className="grid gap-5 xl:grid-cols-2">
              <FractionLabCard />
              <DivideStepsCard />
            </div>
            <div className="grid gap-5 xl:grid-cols-2">
              <WhyFlipCard />
              <WholeNumberDivideCard />
            </div>
            <div className="grid gap-5 xl:grid-cols-2">
              <MixedDivideCard />
              <LiveExperimentCard />
            </div>
            <div className="grid gap-5 xl:grid-cols-3">
              <MultiplyVsDivideCard />
              <DividePracticeCard />
              <DivideTimerCard />
            </div>
            <DividePracticeGrid />
            <LessonSummary
              gradient="bg-gradient-to-r from-violet-700 to-purple-500"
              mascot="➗"
              points={[
                "การหาร = คงตัวหน้า กลับตัวหลัง แล้วคูณ",
                "เศษส่วนที่กลับหัว–ท้ายเรียกว่า ส่วนกลับ",
                "หารด้วยจำนวนเต็ม = คูณด้วย 1 ส่วนจำนวนนั้น",
                "ทำผลลัพธ์ให้เป็นเศษส่วนอย่างต่ำ",
              ]}
            />
            <LessonQuiz
              title="แบบทดสอบ: หารเศษส่วน"
              gradient="bg-gradient-to-r from-violet-700 to-purple-500"
              makeQuestion={makeDivideQuestion}
            />
          </>
        )}
        footer={<LessonActionBar meta={divideLessonMeta} practiceCount={10} />}
      />
    </div>
  );
}
