"use client";

import { LessonActionBar } from "@/components/lessons/LessonActionBar";
import { LessonProgressHeader } from "@/components/lessons/LessonProgressHeader";
import { LessonStepper } from "@/components/lessons/LessonStepper";
import { LessonSummary } from "@/components/lessons/LessonSummary";
import { BorrowSubtractCard } from "@/components/lessons/subtract/BorrowSubtractCard";
import { DifferentDenominatorSubtractCard } from "@/components/lessons/subtract/DifferentDenominatorSubtractCard";
import { MixedNumberSubtractCard } from "@/components/lessons/subtract/MixedNumberSubtractCard";
import { SameDenominatorSubtractCard } from "@/components/lessons/subtract/SameDenominatorSubtractCard";
import { SubtractPracticeCard } from "@/components/lessons/subtract/SubtractPracticeCard";
import { SubtractPracticeGrid } from "@/components/lessons/subtract/SubtractPracticeGrid";
import { SubtractTimerCard } from "@/components/lessons/subtract/SubtractTimerCard";
import { SubtractToolsCard } from "@/components/lessons/subtract/SubtractToolsCard";
import { SubtractTypeSelector } from "@/components/lessons/subtract/SubtractTypeSelector";
import { SubtractVisualCard } from "@/components/lessons/subtract/SubtractVisualCard";
import { subtractLessonMeta } from "@/data/lessonSubtract";
import { LessonVideoCard } from "@/components/lessons/LessonVideoCard";
import { lessonVideos } from "@/data/lessonVideos";
import { LessonQuiz } from "@/components/lessons/LessonQuiz";
import { makeSubtractQuestion } from "@/lib/quizGenerators";

const VIDEO_URL = lessonVideos["/lessons/subtract"] ?? "";

const STEPS = [
  { id: 1, title: "ดูวิดีโอ" },
  { id: 2, title: "ประเภทการลบ" },
  { id: 3, title: "ตัวส่วนเท่ากัน" },
  { id: 4, title: "ตัวส่วนต่างกัน" },
  { id: 5, title: "ดูภาพประกอบ" },
  { id: 6, title: "จำนวนคละ" },
  { id: 7, title: "การยืม" },
  { id: 8, title: "เครื่องมือช่วย" },
  { id: 9, title: "ฝึกทำ" },
  { id: 10, title: "เกมจับเวลา" },
  { id: 11, title: "สรุปบทเรียน" },
  { id: 12, title: "แบบทดสอบ" },
];

const COMPONENTS = [
  () => <LessonVideoCard lessonPath="/lessons/subtract" videoUrl={VIDEO_URL} title="วิดีโอ: ลบเศษส่วน" />,
  SubtractTypeSelector, SameDenominatorSubtractCard, DifferentDenominatorSubtractCard,
  SubtractVisualCard, MixedNumberSubtractCard, BorrowSubtractCard,
  SubtractToolsCard, SubtractPracticeCard, SubtractTimerCard,
  () => (
    <LessonSummary
      gradient="bg-gradient-to-r from-emerald-700 to-green-500"
      mascot="➖"
      points={[
        "ตัวส่วนเท่ากัน → ลบเฉพาะตัวเศษ ตัวส่วนคงเดิม",
        "ตัวส่วนต่างกัน → ทำให้เท่ากันก่อนแล้วค่อยลบ",
        "ถ้าตัวเศษไม่พอลบ ให้ยืมจากจำนวนเต็ม",
        "จำนวนคละ → ลบจำนวนเต็มและเศษส่วนแยกกัน",
      ]}
    />
  ),
  () => (
    <LessonQuiz
      title="แบบทดสอบ: ลบเศษส่วน"
      gradient="bg-gradient-to-r from-emerald-700 to-green-500"
      makeQuestion={makeSubtractQuestion}
    />
  ),
];

export function SubtractLessonContent() {
  return (
    <div className="space-y-5">
      <LessonProgressHeader meta={subtractLessonMeta} />
      <LessonStepper
        steps={STEPS}
        renderStep={(step) => {
          const Comp = COMPONENTS[step - 1];
          return Comp ? <Comp /> : null;
        }}
        renderAll={() => (
          <>
            <LessonVideoCard lessonPath="/lessons/subtract" videoUrl={VIDEO_URL} title="วิดีโอ: ลบเศษส่วน" />
            <SubtractTypeSelector />
            <div className="grid gap-5 xl:grid-cols-2">
              <SameDenominatorSubtractCard />
              <DifferentDenominatorSubtractCard />
            </div>
            <div className="grid gap-5 xl:grid-cols-2">
              <SubtractVisualCard />
              <MixedNumberSubtractCard />
            </div>
            <div className="grid gap-5 xl:grid-cols-2">
              <BorrowSubtractCard />
              <SubtractToolsCard />
            </div>
            <div className="grid gap-5 xl:grid-cols-2">
              <SubtractPracticeCard />
              <SubtractTimerCard />
            </div>
            <SubtractPracticeGrid />
            <LessonSummary
              gradient="bg-gradient-to-r from-emerald-700 to-green-500"
              mascot="➖"
              points={[
                "ตัวส่วนเท่ากัน → ลบเฉพาะตัวเศษ ตัวส่วนคงเดิม",
                "ตัวส่วนต่างกัน → ทำให้เท่ากันก่อนแล้วค่อยลบ",
                "ถ้าตัวเศษไม่พอลบ ให้ยืมจากจำนวนเต็ม",
                "จำนวนคละ → ลบจำนวนเต็มและเศษส่วนแยกกัน",
              ]}
            />
            <LessonQuiz
              title="แบบทดสอบ: ลบเศษส่วน"
              gradient="bg-gradient-to-r from-emerald-700 to-green-500"
              makeQuestion={makeSubtractQuestion}
            />
          </>
        )}
        footer={<LessonActionBar meta={subtractLessonMeta} practiceCount={10} />}
      />
    </div>
  );
}
