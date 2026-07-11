"use client";

import { LessonActionBar } from "@/components/lessons/LessonActionBar";
import { LessonProgressHeader } from "@/components/lessons/LessonProgressHeader";
import { LessonStepper } from "@/components/lessons/LessonStepper";
import { AddPracticeCard } from "@/components/lessons/add/AddPracticeCard";
import { AddSummaryCard } from "@/components/lessons/add/AddSummaryCard";
import { DiffDenAddCard } from "@/components/lessons/add/DiffDenAddCard";
import { MakeOneGameCard } from "@/components/lessons/add/MakeOneGameCard";
import { MixedAddCard } from "@/components/lessons/add/MixedAddCard";
import { SameDenAddCard } from "@/components/lessons/add/SameDenAddCard";
import { addLessonMeta } from "@/data/lessonAdd";
import { LessonVideoCard } from "@/components/lessons/LessonVideoCard";
import { lessonVideos } from "@/data/lessonVideos";
import { LessonQuiz } from "@/components/lessons/LessonQuiz";
import { makeAddQuestion } from "@/lib/quizGenerators";

const VIDEO_URL = lessonVideos["/lessons/add"] ?? "";

const STEPS = [
  { id: 1, title: "ดูวิดีโอ" },
  { id: 2, title: "ส่วนเท่ากัน: บวกได้เลย" },
  { id: 3, title: "ส่วนต่างกัน: ทำส่วนให้เท่าก่อน" },
  { id: 4, title: "บวกจำนวนคละ" },
  { id: 5, title: "เกมเติมให้เต็ม 1" },
  { id: 6, title: "ฝึกทำ" },
  { id: 7, title: "สรุปบทเรียน" },
  { id: 8, title: "แบบทดสอบ" },
];

const COMPONENTS = [
  () => <LessonVideoCard lessonPath="/lessons/add" videoUrl={VIDEO_URL} title="วิดีโอ: บวกเศษส่วน" />,
  SameDenAddCard, DiffDenAddCard, MixedAddCard,
  MakeOneGameCard, AddPracticeCard,
  AddSummaryCard,
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
            <SameDenAddCard />
            <DiffDenAddCard />
            <MixedAddCard />
            <div className="grid gap-5 xl:grid-cols-2">
              <MakeOneGameCard />
              <AddPracticeCard />
            </div>
            <AddSummaryCard />
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
