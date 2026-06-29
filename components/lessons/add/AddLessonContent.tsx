"use client";

import { LessonActionBar } from "@/components/lessons/LessonActionBar";
import { LessonProgressHeader } from "@/components/lessons/LessonProgressHeader";
import { LessonStepper } from "@/components/lessons/LessonStepper";
import { LessonSummary } from "@/components/lessons/LessonSummary";
import { AddPracticeCard } from "@/components/lessons/add/AddPracticeCard";
import { AddPracticeGrid } from "@/components/lessons/add/AddPracticeGrid";
import { AddToolsCard } from "@/components/lessons/add/AddToolsCard";
import { AddTypeSelector } from "@/components/lessons/add/AddTypeSelector";
import { AddVisualModelCard } from "@/components/lessons/add/AddVisualModelCard";
import { DifferentDenominatorAddCard } from "@/components/lessons/add/DifferentDenominatorAddCard";
import { MixedNumberAddCard } from "@/components/lessons/add/MixedNumberAddCard";
import { SameDenominatorAddCard } from "@/components/lessons/add/SameDenominatorAddCard";
import { addLessonMeta } from "@/data/lessonAdd";
import { LessonVideoCard } from "@/components/lessons/LessonVideoCard";
import { lessonVideos } from "@/data/lessonVideos";
import { LessonQuiz } from "@/components/lessons/LessonQuiz";
import { makeAddQuestion } from "@/lib/quizGenerators";

const VIDEO_URL = lessonVideos["/lessons/add"] ?? "";

const STEPS = [
  { id: 1, title: "ดูวิดีโอ" },
  { id: 2, title: "ประเภทการบวก" },
  { id: 3, title: "ตัวส่วนเท่ากัน" },
  { id: 4, title: "ตัวส่วนต่างกัน" },
  { id: 5, title: "จำนวนคละ" },
  { id: 6, title: "ดูภาพประกอบ" },
  { id: 7, title: "เครื่องมือช่วย" },
  { id: 8, title: "ฝึกทำ" },
  { id: 9, title: "สรุปบทเรียน" },
  { id: 10, title: "แบบทดสอบ" },
];

const COMPONENTS = [
  () => <LessonVideoCard lessonPath="/lessons/add" videoUrl={VIDEO_URL} title="วิดีโอ: บวกเศษส่วน" />,
  AddTypeSelector, SameDenominatorAddCard, DifferentDenominatorAddCard,
  MixedNumberAddCard, AddVisualModelCard, AddToolsCard, AddPracticeCard,
  () => (
    <LessonSummary
      gradient="bg-gradient-to-r from-blue-700 to-sky-500"
      mascot="➕"
      points={[
        "ตัวส่วนเท่ากัน → บวกเฉพาะตัวเศษ ตัวส่วนคงเดิม",
        "ตัวส่วนต่างกัน → ทำให้เท่ากันก่อนแล้วค่อยบวก",
        "จำนวนคละ → บวกจำนวนเต็มกับเศษส่วนแยกกัน",
        "ตรวจคำตอบให้เป็นเศษส่วนอย่างต่ำเสมอ",
      ]}
    />
  ),
  () => (
    <LessonQuiz
      title="แบบทดสอบ: บวกเศษส่วน"
      gradient="bg-gradient-to-r from-blue-700 to-sky-500"
      makeQuestion={makeAddQuestion}
      lessonSlug="add"
    />
  ),
];

export function AddLessonContent() {
  return (
    <div className="space-y-5">
      <LessonProgressHeader meta={addLessonMeta} lessonSlug="add" />
      <LessonStepper
        lessonSlug="add"
        steps={STEPS}
        renderStep={(step) => {
          const Comp = COMPONENTS[step - 1];
          return Comp ? <Comp /> : null;
        }}
        renderAll={() => (
          <>
            <LessonVideoCard lessonPath="/lessons/add" videoUrl={VIDEO_URL} title="วิดีโอ: บวกเศษส่วน" />
            <AddTypeSelector />
            <div className="grid gap-5 xl:grid-cols-2">
              <SameDenominatorAddCard />
              <DifferentDenominatorAddCard />
            </div>
            <div className="grid gap-5 xl:grid-cols-2">
              <MixedNumberAddCard />
              <AddVisualModelCard />
            </div>
            <div className="grid gap-5 xl:grid-cols-2">
              <AddToolsCard />
              <AddPracticeCard />
            </div>
            <AddPracticeGrid />
            <LessonSummary
              gradient="bg-gradient-to-r from-blue-700 to-sky-500"
              mascot="➕"
              points={[
                "ตัวส่วนเท่ากัน → บวกเฉพาะตัวเศษ ตัวส่วนคงเดิม",
                "ตัวส่วนต่างกัน → ทำให้เท่ากันก่อนแล้วค่อยบวก",
                "จำนวนคละ → บวกจำนวนเต็มกับเศษส่วนแยกกัน",
                "ตรวจคำตอบให้เป็นเศษส่วนอย่างต่ำเสมอ",
              ]}
            />
            <LessonQuiz
              title="แบบทดสอบ: บวกเศษส่วน"
              gradient="bg-gradient-to-r from-blue-700 to-sky-500"
              makeQuestion={makeAddQuestion}
      lessonSlug="add"
            />
          </>
        )}
        footer={<LessonActionBar meta={addLessonMeta} />}
      />
    </div>
  );
}
