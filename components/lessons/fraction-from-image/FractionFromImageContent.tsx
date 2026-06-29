"use client";

import { Card } from "@/components/ui/Card";
import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionText } from "@/components/fractions/FractionText";
import { LessonActionBar } from "@/components/lessons/LessonActionBar";
import { LessonProgressHeader } from "@/components/lessons/LessonProgressHeader";
import { LessonStepper } from "@/components/lessons/LessonStepper";
import { ColorYourOwn } from "@/components/lessons/fraction-from-image/ColorYourOwn";
import { ImageFractionQuestion } from "@/components/lessons/fraction-from-image/ImageFractionQuestion";
import {
  fractionFromImageActivities,
  fractionFromImageMeta,
  imageFractionSteps
} from "@/data/lessonFractionFromImage";
import { LessonQuiz } from "@/components/lessons/LessonQuiz";
import { makeFractionFromImageQuestion } from "@/lib/quizGenerators";

const sameFractionExamples = [
  { id: "circle", label: "วงกลม", shape: "circle" as const, icon: "⚪" },
  { id: "bar", label: "แท่ง", shape: "bar" as const, icon: "▭" },
  { id: "grid", label: "ตาราง", shape: "grid" as const, icon: "▦" },
  { id: "pizza", label: "พิซซ่า", shape: "circle" as const, icon: "🍕" }
];

function StepsCard() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">2</span>
          <h2 className="text-xl font-extrabold">อธิบายทีละขั้น</h2>
        </div>
      </div>
      <div className="grid gap-4 p-5 md:grid-cols-3">
        {imageFractionSteps.map((step) => (
          <div key={step.id} className="rounded-xl border border-brand-100 bg-white p-4">
            <div className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-sm font-extrabold text-brand-700">
              {step.badge}
            </div>
            <h3 className="mt-3 text-lg font-extrabold text-brand-900">{step.title}</h3>
            <p className="mt-2 text-sm font-bold leading-relaxed text-slate-600">{step.description}</p>
          </div>
        ))}
      </div>
      <div className="mx-5 mb-5 rounded-xl bg-emerald-50 px-4 py-3 text-center text-base font-extrabold text-emerald-700">
        สรุป: ระบายสี 3 ส่วน จากทั้งหมด 4 ส่วน จึงเขียนได้เป็น 3/4
      </div>
    </Card>
  );
}

function ShapesCard() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-r from-sky-600 to-blue-600 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">3</span>
          <h2 className="text-xl font-extrabold">เศษส่วนเดียวกัน หลายรูปแบบ</h2>
        </div>
      </div>
      <div className="p-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {sameFractionExamples.map((example) => (
            <div key={example.id} className="rounded-xl border border-brand-100 bg-white p-4 text-center">
              <div className="mb-2 text-3xl">{example.icon}</div>
              <FractionShape
                numerator={3}
                denominator={4}
                shape={example.shape}
                tone={example.id === "pizza" ? "accent" : "pink"}
                className="mx-auto h-28 w-32"
              />
              <div className="mt-3 text-sm font-extrabold text-brand-700">{example.label}</div>
              <div className="mt-1 flex justify-center text-3xl">
                <FractionText numerator={3} denominator={4} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-1 rounded-xl bg-amber-50 px-4 py-3 text-center text-sm font-bold text-amber-700">
          แม้ภาพต่างกัน แต่ถ้าระบาย 3 จาก 4 ส่วนเท่ากัน ก็เขียนเป็น
          <FractionText numerator={3} denominator={4} className="text-base" toneClassName="text-amber-700" />
          เหมือนกัน
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
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-600">
          prototype
        </span>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {fractionFromImageActivities.map((activity) => (
          <div key={activity.id} className="rounded-xl border border-brand-100 bg-white p-4 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-sky-50 text-3xl">
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

const STEPS = [
  { id: 1, title: "ดูภาพตอบคำถาม" },
  { id: 2, title: "อธิบายทีละขั้น" },
  { id: 3, title: "หลายรูปแบบ" },
  { id: 4, title: "ระบายสีเอง" },
  { id: 5, title: "กิจกรรมฝึกทักษะ" },
  { id: 6, title: "แบบทดสอบ" },
];

const COMPONENTS = [
  ImageFractionQuestion, StepsCard, ShapesCard, ColorYourOwn, ActivitiesCard,
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
            <StepsCard />
            <ShapesCard />
            <ColorYourOwn />
            <ActivitiesCard />
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
