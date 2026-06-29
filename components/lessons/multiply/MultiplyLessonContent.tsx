"use client";

import { LessonActionBar } from "@/components/lessons/LessonActionBar";
import { LessonProgressHeader } from "@/components/lessons/LessonProgressHeader";
import { LessonStepper } from "@/components/lessons/LessonStepper";
import { LessonSummary } from "@/components/lessons/LessonSummary";
import { AreaModelCard } from "@/components/lessons/multiply/AreaModelCard";
import { CrossCancelCard } from "@/components/lessons/multiply/CrossCancelCard";
import { MixedMultiplyCard } from "@/components/lessons/multiply/MixedMultiplyCard";
import { MultiplyPracticeCard } from "@/components/lessons/multiply/MultiplyPracticeCard";
import { MultiplyPracticeGrid } from "@/components/lessons/multiply/MultiplyPracticeGrid";
import { MultiplyStepsCard } from "@/components/lessons/multiply/MultiplyStepsCard";
import { MultiplyTimerCard } from "@/components/lessons/multiply/MultiplyTimerCard";
import { MultiplyToolsCard } from "@/components/lessons/multiply/MultiplyToolsCard";
import { MultiplyTypeSelector } from "@/components/lessons/multiply/MultiplyTypeSelector";
import { WholeNumberMultiplyCard } from "@/components/lessons/multiply/WholeNumberMultiplyCard";
import { multiplyLessonMeta } from "@/data/lessonMultiply";
import { LessonVideoCard } from "@/components/lessons/LessonVideoCard";
import { lessonVideos } from "@/data/lessonVideos";
import { LessonQuiz } from "@/components/lessons/LessonQuiz";
import { makeMultiplyQuestion } from "@/lib/quizGenerators";

const VIDEO_URL = lessonVideos["/lessons/multiply"] ?? "";

const STEPS = [
  { id: 1, title: "ดูวิดีโอ" },
  { id: 2, title: "ประเภทการคูณ" },
  { id: 3, title: "โมเดลพื้นที่" },
  { id: 4, title: "ขั้นตอนการคูณ" },
  { id: 5, title: "ตัดทอนก่อนคูณ" },
  { id: 6, title: "คูณจำนวนเต็ม" },
  { id: 7, title: "จำนวนคละ" },
  { id: 8, title: "เครื่องมือช่วย" },
  { id: 9, title: "ฝึกทำ" },
  { id: 10, title: "เกมจับเวลา" },
  { id: 11, title: "สรุปบทเรียน" },
  { id: 12, title: "แบบทดสอบ" },
];

const COMPONENTS = [
  () => <LessonVideoCard lessonPath="/lessons/multiply" videoUrl={VIDEO_URL} title="วิดีโอ: คูณเศษส่วน" />,
  MultiplyTypeSelector, AreaModelCard, MultiplyStepsCard,
  CrossCancelCard, WholeNumberMultiplyCard, MixedMultiplyCard,
  MultiplyToolsCard, MultiplyPracticeCard, MultiplyTimerCard,
  () => (
    <LessonSummary
      gradient="bg-gradient-to-r from-orange-600 to-amber-400"
      mascot="✖️"
      points={[
        "คูณเศษกับเศษ และส่วนกับส่วน",
        "ตัดทอนก่อนคูณช่วยให้ตัวเลขเล็กลง",
        "จำนวนเต็มมองเป็นตัวส่วนเท่ากับ 1",
        "ทำผลลัพธ์ให้เป็นเศษส่วนอย่างต่ำ",
      ]}
    />
  ),
  () => (
    <LessonQuiz
      title="แบบทดสอบ: คูณเศษส่วน"
      gradient="bg-gradient-to-r from-orange-600 to-amber-400"
      makeQuestion={makeMultiplyQuestion}
      lessonSlug="multiply"
    />
  ),
];

export function MultiplyLessonContent() {
  return (
    <div className="space-y-5">
      <LessonProgressHeader meta={multiplyLessonMeta} lessonSlug="multiply" />
      <LessonStepper
        lessonSlug="multiply"
        steps={STEPS}
        renderStep={(step) => {
          const Comp = COMPONENTS[step - 1];
          return Comp ? <Comp /> : null;
        }}
        renderAll={() => (
          <>
            <LessonVideoCard lessonPath="/lessons/multiply" videoUrl={VIDEO_URL} title="วิดีโอ: คูณเศษส่วน" />
            <MultiplyTypeSelector />
            <div className="grid gap-5 xl:grid-cols-2">
              <AreaModelCard />
              <MultiplyStepsCard />
            </div>
            <div className="grid gap-5 xl:grid-cols-3">
              <CrossCancelCard />
              <WholeNumberMultiplyCard />
              <MixedMultiplyCard />
            </div>
            <div className="grid gap-5 xl:grid-cols-3">
              <MultiplyToolsCard />
              <MultiplyPracticeCard />
              <MultiplyTimerCard />
            </div>
            <MultiplyPracticeGrid />
            <LessonSummary
              gradient="bg-gradient-to-r from-orange-600 to-amber-400"
              mascot="✖️"
              points={[
                "คูณเศษกับเศษ และส่วนกับส่วน",
                "ตัดทอนก่อนคูณช่วยให้ตัวเลขเล็กลง",
                "จำนวนเต็มมองเป็นตัวส่วนเท่ากับ 1",
                "ทำผลลัพธ์ให้เป็นเศษส่วนอย่างต่ำ",
              ]}
            />
            <LessonQuiz
              title="แบบทดสอบ: คูณเศษส่วน"
              gradient="bg-gradient-to-r from-orange-600 to-amber-400"
              makeQuestion={makeMultiplyQuestion}
      lessonSlug="multiply"
            />
          </>
        )}
        footer={<LessonActionBar meta={multiplyLessonMeta} />}
      />
    </div>
  );
}
