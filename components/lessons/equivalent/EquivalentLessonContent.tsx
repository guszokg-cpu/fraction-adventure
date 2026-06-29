"use client";

import { LessonActionBar } from "@/components/lessons/LessonActionBar";
import { LessonProgressHeader } from "@/components/lessons/LessonProgressHeader";
import { LessonStepper } from "@/components/lessons/LessonStepper";
import { LessonSummary } from "@/components/lessons/LessonSummary";
import { EquivalentBuildCard } from "@/components/lessons/equivalent/EquivalentBuildCard";
import { EquivalentConceptCard } from "@/components/lessons/equivalent/EquivalentConceptCard";
import { EquivalentExplorerCard } from "@/components/lessons/equivalent/EquivalentExplorerCard";
import { EquivalentNumberLineCard } from "@/components/lessons/equivalent/EquivalentNumberLineCard";
import { EquivalentPracticeCard } from "@/components/lessons/equivalent/EquivalentPracticeCard";
import { EquivalentPracticeGrid } from "@/components/lessons/equivalent/EquivalentPracticeGrid";
import { EquivalentReduceCard } from "@/components/lessons/equivalent/EquivalentReduceCard";
import { EquivalentVisualCompareCard } from "@/components/lessons/equivalent/EquivalentVisualCompareCard";
import { equivalentLessonMeta } from "@/data/lessonEquivalent";
import { LessonVideoCard } from "@/components/lessons/LessonVideoCard";
import { lessonVideos } from "@/data/lessonVideos";
import { LessonQuiz } from "@/components/lessons/LessonQuiz";
import { makeEquivalentQuestion } from "@/lib/quizGenerators";

const VIDEO_URL = lessonVideos["/lessons/equivalent"] ?? "";

const STEPS = [
  { id: 1, title: "ดูวิดีโอ" },
  { id: 2, title: "แนวคิดเศษส่วนเท่ากัน" },
  { id: 3, title: "เปรียบเทียบด้วยภาพ" },
  { id: 4, title: "สร้างเศษส่วนเท่ากัน" },
  { id: 5, title: "ย่อเศษส่วน" },
  { id: 6, title: "สำรวจเพิ่มเติม" },
  { id: 7, title: "บนเส้นจำนวน" },
  { id: 8, title: "ฝึกทำ" },
  { id: 9, title: "สรุปบทเรียน" },
  { id: 10, title: "แบบทดสอบ" },
];

const COMPONENTS = [
  () => <LessonVideoCard lessonPath="/lessons/equivalent" videoUrl={VIDEO_URL} title="วิดีโอ: เศษส่วนที่เท่ากัน" />,
  EquivalentConceptCard, EquivalentVisualCompareCard, EquivalentBuildCard,
  EquivalentReduceCard, EquivalentExplorerCard, EquivalentNumberLineCard,
  EquivalentPracticeCard,
  () => (
    <LessonSummary
      gradient="bg-gradient-to-r from-teal-600 to-violet-500"
      mascot="🔁"
      points={[
        "คูณบนล่างด้วยจำนวนเดียวกัน ค่าไม่เปลี่ยน",
        "หารบนล่างด้วยจำนวนเดียวกัน คือการย่อ",
        "เศษส่วนที่เท่ากันอยู่ตำแหน่งเดียวกันบนเส้นจำนวน",
        "ใช้การคูณไขว้ตรวจว่าเท่ากันหรือไม่",
      ]}
    />
  ),
  () => (
    <LessonQuiz
      title="แบบทดสอบ: เศษส่วนที่เท่ากัน"
      gradient="bg-gradient-to-r from-teal-600 to-violet-500"
      makeQuestion={makeEquivalentQuestion}
      lessonSlug="equivalent"
    />
  ),
];

export function EquivalentLessonContent() {
  return (
    <div className="space-y-5">
      <LessonProgressHeader meta={equivalentLessonMeta} lessonSlug="equivalent" />
      <LessonStepper
        lessonSlug="equivalent"
        steps={STEPS}
        renderStep={(step) => {
          const Comp = COMPONENTS[step - 1];
          return Comp ? <Comp /> : null;
        }}
        renderAll={() => (
          <>
            <LessonVideoCard lessonPath="/lessons/equivalent" videoUrl={VIDEO_URL} title="วิดีโอ: เศษส่วนที่เท่ากัน" />
            <div className="grid gap-5 xl:grid-cols-2">
              <EquivalentConceptCard />
              <EquivalentVisualCompareCard />
            </div>
            <div className="grid gap-5 xl:grid-cols-2">
              <EquivalentBuildCard />
              <EquivalentReduceCard />
            </div>
            <div className="grid gap-5 xl:grid-cols-2">
              <EquivalentExplorerCard />
              <EquivalentNumberLineCard />
            </div>
            <EquivalentPracticeCard />
            <EquivalentPracticeGrid />
            <LessonSummary
              gradient="bg-gradient-to-r from-teal-600 to-violet-500"
              mascot="🔁"
              points={[
                "คูณบนล่างด้วยจำนวนเดียวกัน ค่าไม่เปลี่ยน",
                "หารบนล่างด้วยจำนวนเดียวกัน คือการย่อ",
                "เศษส่วนที่เท่ากันอยู่ตำแหน่งเดียวกันบนเส้นจำนวน",
                "ใช้การคูณไขว้ตรวจว่าเท่ากันหรือไม่",
              ]}
            />
            <LessonQuiz
              title="แบบทดสอบ: เศษส่วนที่เท่ากัน"
              gradient="bg-gradient-to-r from-teal-600 to-violet-500"
              makeQuestion={makeEquivalentQuestion}
      lessonSlug="equivalent"
            />
          </>
        )}
        footer={<LessonActionBar meta={equivalentLessonMeta} />}
      />
    </div>
  );
}
