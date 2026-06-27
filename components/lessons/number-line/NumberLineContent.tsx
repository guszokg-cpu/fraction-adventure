"use client";

import { Card } from "@/components/ui/Card";
import { FractionStack } from "@/components/fractions/FractionStack";
import { LessonActionBar } from "@/components/lessons/LessonActionBar";
import { LessonProgressHeader } from "@/components/lessons/LessonProgressHeader";
import { LessonStepper } from "@/components/lessons/LessonStepper";
import { LessonVideoCard } from "@/components/lessons/LessonVideoCard";
import { lessonVideos } from "@/data/lessonVideos";
import { NumberLineBuilder } from "@/components/lessons/number-line/NumberLineBuilder";
import { NumberLineQuestion } from "@/components/lessons/number-line/NumberLineQuestion";
import { NumberLineStrip } from "@/components/lessons/number-line/NumberLineStrip";
import {
  numberLineActivities,
  numberLineExampleStrips,
  numberLineMeta,
  numberLineSteps
} from "@/data/lessonNumberLine";
import { LessonQuiz } from "@/components/lessons/LessonQuiz";
import { makeNumberLineQuestion } from "@/lib/quizGenerators";

function StepByStepCard() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">2</span>
          <h2 className="text-xl font-extrabold">อธิบายทีละขั้น (ตัวอย่าง 3/4)</h2>
        </div>
      </div>
      <div className="p-5">
        <div className="rounded-2xl bg-violet-50/60 p-4">
          <NumberLineStrip denominator={4} marker={3} tone="violet" className="mx-auto h-32 w-full max-w-2xl" />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {numberLineSteps.map((step) => (
            <div key={step.id} className="rounded-xl border border-brand-100 bg-white p-4">
              <div className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-sm font-extrabold text-brand-700">
                {step.badge}
              </div>
              <h3 className="mt-3 text-lg font-extrabold text-brand-900">{step.title}</h3>
              <p className="mt-2 text-sm font-bold leading-relaxed text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-center text-base font-extrabold text-emerald-700">
          สรุป: แบ่ง 0 ถึง 1 ออกเป็น 4 ช่อง แล้วนับไป 3 ช่อง จะได้ตำแหน่งของ 3/4
        </div>
      </div>
    </Card>
  );
}

function ExampleStripsCard() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-r from-sky-600 to-blue-600 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">3</span>
          <h2 className="text-xl font-extrabold">เศษส่วนบนเส้นจำนวน หลายค่า</h2>
        </div>
      </div>
      <div className="p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {numberLineExampleStrips.map((example) => (
            <div key={example.id} className="rounded-xl border border-brand-100 bg-white p-4">
              <div className="flex items-center justify-between">
                <FractionStack
                  top={example.numerator}
                  bottom={example.denominator}
                  className="text-2xl font-extrabold text-brand-900"
                />
              </div>
              <NumberLineStrip
                denominator={example.denominator}
                marker={example.numerator}
                tone={example.tone}
                className="mt-1 h-28 w-full"
              />
              <p className="mt-1 text-sm font-bold leading-relaxed text-slate-600">{example.caption}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-center text-sm font-bold text-amber-700">
          ยิ่งตัวเศษมากเมื่อเทียบกับตัวส่วน จุดยิ่งอยู่ใกล้เลข 1 มากขึ้น
        </div>
      </div>
    </Card>
  );
}

function ActivitiesCard() {
  return (
    <Card>
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-extrabold text-brand-900">กิจกรรมฝึกทักษะ</h2>
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-600">prototype</span>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {numberLineActivities.map((activity) => (
          <div key={activity.id} className="rounded-xl border border-brand-100 bg-white p-4 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-teal-50 text-3xl">
              {activity.icon}
            </div>
            <div className="mt-3 font-extrabold text-brand-900">{activity.title}</div>
            <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-500">{activity.desc}</p>
            <button className="mt-3 inline-flex h-9 items-center justify-center rounded-lg bg-brand-50 px-4 text-sm font-bold text-brand-600">
              เริ่มเล่น
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}

const VIDEO_URL = lessonVideos["/lessons/number-line"] ?? "";

const STEPS = [
  { id: 1, title: "ดูวิดีโอ" },
  { id: 2, title: "คำถามชวนคิด" },
  { id: 3, title: "อธิบายทีละขั้น" },
  { id: 4, title: "ตัวอย่างหลายค่า" },
  { id: 5, title: "สร้างเส้นจำนวน" },
  { id: 6, title: "กิจกรรมฝึกทักษะ" },
  { id: 7, title: "แบบทดสอบ" },
];

const COMPONENTS = [
  () => <LessonVideoCard lessonPath="/lessons/number-line" videoUrl={VIDEO_URL} title="วิดีโอ: เศษส่วนบนเส้นจำนวน" />,
  NumberLineQuestion, StepByStepCard, ExampleStripsCard,
  NumberLineBuilder, ActivitiesCard,
  () => (
    <LessonQuiz
      title="แบบทดสอบ: เศษส่วนบนเส้นจำนวน"
      gradient="bg-gradient-to-r from-violet-600 to-purple-500"
      makeQuestion={makeNumberLineQuestion}
    />
  ),
];

export function NumberLineContent() {
  return (
    <div className="space-y-5">
      <LessonProgressHeader meta={numberLineMeta} />
      <LessonStepper
        steps={STEPS}
        renderStep={(step) => {
          const Comp = COMPONENTS[step - 1];
          return Comp ? <Comp /> : null;
        }}
        renderAll={() => (
          <>
            <LessonVideoCard lessonPath="/lessons/number-line" videoUrl={VIDEO_URL} title="วิดีโอ: เศษส่วนบนเส้นจำนวน" />
            <NumberLineQuestion />

            <StepByStepCard />
            <ExampleStripsCard />
            <NumberLineBuilder />
            <ActivitiesCard />
            <LessonQuiz
              title="แบบทดสอบ: เศษส่วนบนเส้นจำนวน"
              gradient="bg-gradient-to-r from-violet-600 to-purple-500"
              makeQuestion={makeNumberLineQuestion}
            />
          </>
        )}
        footer={<LessonActionBar meta={numberLineMeta} practiceCount={10} />}
      />
    </div>
  );
}
