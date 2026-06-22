import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionText } from "@/components/fractions/FractionText";
import { Card } from "@/components/ui/Card";

export function ImproperToMixedCard() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-r from-pink-600 to-fuchsia-600 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">2</span>
          <h2 className="text-xl font-extrabold">เศษเกิน → จำนวนคละ</h2>
        </div>
        <p className="mt-0.5 text-sm font-bold opacity-90">ตัวอย่าง 5/4</p>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-3 gap-2">
          {/* Step 1 */}
          <div className="rounded-xl border border-pink-100 bg-pink-50/50 p-3 text-center">
            <div className="mb-2 rounded-lg bg-pink-500 px-2 py-0.5 text-xs font-extrabold text-white">ขั้นที่ 1</div>
            <div className="flex items-center justify-center gap-1">
              <FractionText numerator={4} denominator={4} className="text-sm" toneClassName="text-pink-600" />
              <span className="text-xs font-bold text-slate-400">+</span>
              <FractionText numerator={1} denominator={4} className="text-sm" toneClassName="text-pink-600" />
            </div>
            <div className="mt-2 flex justify-center gap-1">
              <FractionShape numerator={4} denominator={4} tone="accent" className="h-10 w-10" />
              <FractionShape numerator={1} denominator={4} tone="pink" className="h-10 w-10" />
            </div>
          </div>

          {/* Step 2 */}
          <div className="rounded-xl border border-pink-100 bg-pink-50/50 p-3 text-center">
            <div className="mb-2 rounded-lg bg-fuchsia-500 px-2 py-0.5 text-xs font-extrabold text-white">ขั้นที่ 2</div>
            <div className="flex items-center justify-center gap-1">
              <FractionText numerator={4} denominator={4} className="text-sm" toneClassName="text-fuchsia-600" />
              <span className="text-xs font-bold text-slate-400">=</span>
              <span className="text-xl font-extrabold text-fuchsia-600">1</span>
            </div>
            <p className="mt-1 text-xs font-bold text-slate-500">เหลืออีก</p>
            <FractionText numerator={1} denominator={4} className="text-sm" toneClassName="text-pink-600" />
          </div>

          {/* Step 3 */}
          <div className="rounded-xl border border-fuchsia-100 bg-fuchsia-50/50 p-3 text-center">
            <div className="mb-2 rounded-lg bg-violet-500 px-2 py-0.5 text-xs font-extrabold text-white">ขั้นที่ 3</div>
            <p className="text-xs font-bold text-slate-600">สรุป</p>
            <div className="mt-1 flex items-center justify-center gap-0.5">
              <span className="text-2xl font-extrabold text-fuchsia-600">1</span>
              <FractionText numerator={1} denominator={4} className="text-xl" toneClassName="text-fuchsia-600" />
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-pink-500 to-fuchsia-500 p-3 text-white">
          <FractionText numerator={5} denominator={4} className="text-2xl" toneClassName="text-white" />
          <span className="text-xl font-extrabold">=</span>
          <div className="flex items-center gap-0.5">
            <span className="text-3xl font-extrabold">1</span>
            <FractionText numerator={1} denominator={4} className="text-2xl" toneClassName="text-white" />
          </div>
        </div>
      </div>
    </Card>
  );
}
