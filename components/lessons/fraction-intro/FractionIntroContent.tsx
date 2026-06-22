import { Card } from "@/components/ui/Card";
import { FractionShape } from "@/components/fractions/FractionShape";
import { LessonProgressHeader } from "@/components/lessons/LessonProgressHeader";
import { LessonActionBar } from "@/components/lessons/LessonActionBar";
import { FractionBuilder } from "@/components/lessons/fraction-intro/FractionBuilder";
import { FractionMeaningQuiz } from "@/components/lessons/fraction-intro/FractionMeaningQuiz";
import { fractionIntroExamples, fractionIntroMeta, fractionMeaningSteps } from "@/data/lessonFractionIntro";

function UnequalCircle() {
  // ภาพประกอบการแบ่งที่ไม่เท่ากัน (ใช้ illustrate หลักการเท่านั้น)
  const angles = [0, 150, 240, 300, 360];
  const stroke = "#312e81";
  const fills = ["#fcd34d", "#ffffff", "#fcd34d", "#ffffff"];

  function polar(angleDeg: number) {
    const a = ((angleDeg - 90) * Math.PI) / 180;
    return [50 + 46 * Math.cos(a), 50 + 46 * Math.sin(a)] as const;
  }

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label="การแบ่งที่ไม่เท่ากัน">
      {angles.slice(0, -1).map((start, i) => {
        const end = angles[i + 1];
        const [x1, y1] = polar(start);
        const [x2, y2] = polar(end);
        const largeArc = end - start > 180 ? 1 : 0;
        const path = `M50 50 L ${x1.toFixed(2)} ${y1.toFixed(2)} A 46 46 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
        return <path key={i} d={path} fill={fills[i]} stroke={stroke} strokeWidth={1.5} />;
      })}
    </svg>
  );
}

export function FractionIntroContent() {
  return (
    <div className="space-y-5">
      <LessonProgressHeader meta={fractionIntroMeta} />

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
              <div className="text-7xl font-extrabold leading-none text-brand-900">
                <span className="text-rose-500">3</span>
                <span className="mx-1 text-slate-300">/</span>
                <span className="text-brand-600">4</span>
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

      <div className="grid gap-5 md:grid-cols-3">
        {fractionMeaningSteps.map((step) => (
          <Card key={step.id}>
            <div className="grid h-11 w-11 place-items-center rounded-full bg-brand-600 text-lg font-extrabold text-white">
              {step.icon}
            </div>
            <h3 className="mt-3 text-lg font-extrabold text-brand-900">{step.title}</h3>
            <p className="mt-2 text-sm font-bold leading-relaxed text-slate-600">{step.description}</p>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="text-xl font-extrabold text-brand-900">ตัวอย่างที่พบบ่อย</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {fractionIntroExamples.map((example) => (
            <div key={example.id} className="rounded-xl border border-brand-100 bg-white p-4 text-center">
              <FractionShape
                numerator={example.numerator}
                denominator={example.denominator}
                tone={example.tone}
                className="mx-auto h-28 w-28"
              />
              <div className="mt-3 text-3xl font-extrabold text-brand-900">
                {example.numerator}/{example.denominator}
              </div>
              <div className="text-sm font-bold text-slate-600">{example.label}</div>
            </div>
          ))}
        </div>
      </Card>

      <FractionBuilder />

      <div className="grid gap-5 md:grid-cols-2">
        <Card className="border-2 border-emerald-200">
          <div className="flex items-center gap-2 text-lg font-extrabold text-emerald-700">
            <span>✅</span> แบ่งเท่า ๆ กัน
          </div>
          <div className="mt-4 flex items-center gap-5">
            <FractionShape numerator={1} denominator={4} tone="accent" className="h-28 w-28" />
            <div>
              <p className="text-sm font-bold text-slate-600">
                แต่ละส่วนมีขนาดเท่ากันพอดี จึงเขียนเป็นเศษส่วนได้
              </p>
              <div className="mt-2 text-3xl font-extrabold text-brand-900">1/4</div>
              <div className="text-sm font-bold text-emerald-600">อ่านว่า เศษหนึ่งส่วนสี่</div>
            </div>
          </div>
        </Card>

        <Card className="border-2 border-rose-200">
          <div className="flex items-center gap-2 text-lg font-extrabold text-rose-600">
            <span>⚠️</span> แบ่งไม่เท่ากัน
          </div>
          <div className="mt-4 flex items-center gap-5">
            <div className="h-28 w-28">
              <UnequalCircle />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-600">
                แต่ละส่วนขนาดไม่เท่ากัน ยังเขียนเป็นเศษส่วนไม่ได้
              </p>
              <div className="mt-2 text-3xl font-extrabold text-rose-500">?</div>
              <div className="text-sm font-bold text-rose-500">เพราะไม่ใช่การแบ่งเท่า ๆ กัน</div>
            </div>
          </div>
        </Card>
      </div>

      <FractionMeaningQuiz />

      <LessonActionBar meta={fractionIntroMeta} />
    </div>
  );
}
