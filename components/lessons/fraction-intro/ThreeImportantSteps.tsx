import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionStack } from "@/components/fractions/FractionStack";
import { UnequalCircle, UnequalBar, UnequalGrid } from "@/components/lessons/shared/UnequalShapes";
import { FrameZoomProvider, ZoomFrame, SlideshowButton } from "@/components/lessons/shared/FrameZoom";
import { FractionSameValueExamples } from "@/components/lessons/fraction-intro/FractionSameValueExamples";
import { EqualPartsCheck } from "@/components/lessons/fraction-intro/EqualPartsCheck";
import { QuickFractionQuiz } from "@/components/lessons/fraction-intro/QuickFractionQuiz";
import { CreateFractionMiniTool } from "@/components/lessons/fraction-intro/CreateFractionMiniTool";
import type { FractionShapeKind } from "@/types/lessonContent";

const WHOLE_UNITS: { shape: FractionShapeKind; label: string }[] = [
  { shape: "pizza", label: "พิซซ่า 1 ถาด" },
  { shape: "chocolate", label: "ช็อกโกแลต 1 แผ่น" },
  { shape: "glass", label: "น้ำ 1 แก้ว" },
];

const SUMMARY = [
  "เริ่มจากของเต็ม 1 หน่วย",
  "แบ่งเป็นส่วนเท่า ๆ กัน",
  "นับส่วนที่เลือกเป็นตัวเศษ",
  "นับส่วนทั้งหมดเป็นตัวส่วน",
];

export function ThreeImportantSteps() {
  return (
    <FrameZoomProvider>
      <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-xl font-extrabold text-white shadow-md">
            3
          </span>
          <div>
            <h2 className="text-2xl font-extrabold text-brand-900">3 ขั้นตอนสำคัญ</h2>
            <p className="text-sm font-bold text-slate-500">
              3 ขั้นตอนที่จะช่วยให้เราเข้าใจเศษส่วนได้ง่ายขึ้น
            </p>
          </div>
        </div>
        <SlideshowButton />
      </div>

      {/* ── ขั้นที่ 1 และ 2 ── */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* ขั้นที่ 1 */}
        <ZoomFrame id="step1" title="ขั้นที่ 1 — เริ่มจาก 1 หน่วย">
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-rose-500 text-sm font-extrabold text-white">1</span>
            <h3 className="text-lg font-extrabold text-brand-900">เริ่มจาก 1 หน่วย</h3>
          </div>
          <p className="mt-2 text-sm font-bold leading-relaxed text-slate-600">
            เศษส่วนคือการแบ่ง &ldquo;1 หน่วยเต็ม&rdquo; ออกเป็นส่วนเท่า ๆ กัน
          </p>
          <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50/40 p-3">
            <div className="text-center text-xs font-extrabold text-rose-500">ตัวอย่าง 1 หน่วยเต็ม</div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {WHOLE_UNITS.map((u) => (
                <div key={u.shape} className="flex flex-col items-center rounded-lg bg-white p-2 text-center shadow-sm">
                  <FractionShape numerator={1} denominator={1} shape={u.shape} tone="accent" className="h-16 w-16" />
                  <div className="mt-1 text-[11px] font-bold text-slate-600">{u.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-xs font-bold text-amber-700">
            <span>⭐</span> ก่อนจะเป็นเศษส่วน ต้องรู้ก่อนว่าอะไรคือ 1 หน่วยเต็ม
          </div>
        </section>
        </ZoomFrame>

        {/* ขั้นที่ 2 */}
        <ZoomFrame id="step2" title="ขั้นที่ 2 — แบ่งเป็นส่วนเท่า ๆ กัน">
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-violet-500 text-sm font-extrabold text-white">2</span>
            <h3 className="text-lg font-extrabold text-brand-900">แบ่งเป็นส่วนเท่า ๆ กัน</h3>
          </div>
          <p className="mt-2 text-sm font-bold leading-relaxed text-slate-600">
            ทุกส่วนต้องมีขนาดเท่ากัน จึงจะเขียนเป็นเศษส่วนได้
          </p>

          <div className="mt-4 space-y-2.5">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
              <div className="text-center text-xs font-extrabold text-emerald-700">แบ่งเท่ากัน ✅</div>
              <div className="mt-2 flex items-center justify-around gap-2">
                <FractionShape numerator={1} denominator={4} shape="circle" tone="violet" className="h-14 w-14" />
                <FractionShape numerator={1} denominator={3} shape="bar" tone="emerald" className="h-8 w-20" />
                <FractionShape numerator={1} denominator={9} shape="grid" tone="sky" className="h-14 w-14" />
              </div>
            </div>
            <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3">
              <div className="text-center text-xs font-extrabold text-rose-600">แบ่งไม่เท่ากัน ❌</div>
              <div className="mt-2 flex items-center justify-around gap-2">
                <UnequalCircle className="h-14 w-14" />
                <UnequalBar className="h-8 w-20" />
                <UnequalGrid className="h-14 w-14" />
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-xs font-bold text-amber-700">
            <span>⭐</span> ถ้าแบ่งไม่เท่ากัน ยังเขียนเป็นเศษส่วนที่ถูกต้องไม่ได้
          </div>
        </section>
        </ZoomFrame>
      </div>

      {/* ── ขั้นที่ 3 (ไฮไลต์) ── */}
      <ZoomFrame id="step3" title="ขั้นที่ 3 — นับส่วนที่เลือก">
      <section className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-soft">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-500 text-sm font-extrabold text-white">3</span>
          <h3 className="text-lg font-extrabold text-brand-900">นับส่วนที่เลือก</h3>
        </div>
        <p className="mt-2 text-sm font-bold text-slate-600">นับจำนวนส่วนที่เลือก และจำนวนส่วนทั้งหมด</p>

        <div className="mt-4 flex flex-col items-center justify-center gap-6 md:flex-row md:gap-10">
          <FractionShape numerator={3} denominator={4} shape="circle" tone="emerald" className="h-36 w-36" />

          <div className="flex flex-col items-center leading-none">
            <span className="text-6xl font-extrabold text-emerald-600">3</span>
            <span className="my-2 h-1.5 w-16 rounded-full bg-amber-400" />
            <span className="text-6xl font-extrabold text-sky-600">4</span>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5">
              <div className="text-sm font-extrabold text-emerald-700">ตัวเศษ (3)</div>
              <div className="text-xs font-bold text-emerald-600">จำนวนส่วนที่เลือก</div>
            </div>
            <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5">
              <div className="text-sm font-extrabold text-sky-700">ตัวส่วน (4)</div>
              <div className="text-xs font-bold text-sky-600">จำนวนส่วนทั้งหมด</div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 rounded-xl bg-amber-50 px-4 py-3 text-center text-sm font-bold text-amber-700">
          <span>⭐</span>
          <FractionStack top={3} bottom={4} className="text-base" />
          หมายถึง เลือก 3 ส่วน จากทั้งหมด 4 ส่วนที่เท่ากัน
        </div>
      </section>
      </ZoomFrame>

      {/* ── ภาพต่างกัน แต่เป็นเศษส่วนได้เหมือนกัน ── */}
      <ZoomFrame id="same" title="ภาพต่างกัน แต่เป็นเศษส่วนได้เหมือนกัน">
        <FractionSameValueExamples />
      </ZoomFrame>

      {/* ── ถูกหรือผิด + ลองตอบเร็ว ── */}
      <div className="grid gap-5 lg:grid-cols-2">
        <ZoomFrame id="equal" title="ถูกหรือผิด? แบ่งเท่ากันไหม">
          <EqualPartsCheck />
        </ZoomFrame>
        <QuickFractionQuiz />
      </div>

      {/* ── ลองสร้างเศษส่วนเอง ── */}
      <CreateFractionMiniTool />

      {/* ── จำให้แม่น! ── */}
      <ZoomFrame id="summary" title="จำให้แม่น!">
      <section className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-violet-50 p-5 shadow-soft">
        <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-extrabold text-amber-700">
              <span>💡</span> จำให้แม่น!
            </h3>
            <ol className="mt-3 space-y-2">
              {SUMMARY.map((text, i) => (
                <li key={i} className="flex items-center gap-2.5 rounded-xl bg-white/70 px-3 py-2 text-sm font-bold text-slate-700">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-violet-500 text-xs font-extrabold text-white">
                    {i + 1}
                  </span>
                  {text}
                </li>
              ))}
            </ol>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="max-w-[200px] rounded-2xl rounded-br-none bg-white px-4 py-3 text-center text-sm font-bold text-slate-600 shadow-sm">
              ทุกส่วนต้องเท่ากันก่อนนะ เราจึงจะเขียนเป็นเศษส่วนได้!
            </div>
            <span className="text-6xl" aria-hidden>
              🐻
            </span>
          </div>
        </div>
      </section>
      </ZoomFrame>
      </div>
    </FrameZoomProvider>
  );
}
