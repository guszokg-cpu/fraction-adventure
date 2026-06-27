import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionText } from "@/components/fractions/FractionText";
import { Card } from "@/components/ui/Card";

export function ImproperIntroCard() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-r from-pink-600 to-fuchsia-600 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">1</span>
          <h2 className="text-xl font-extrabold">รู้จักเศษเกิน</h2>
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-center justify-center gap-2">
          <FractionText numerator={5} denominator={4} className="text-4xl" toneClassName="text-pink-600" />
          <span className="text-xl font-extrabold text-brand-900">คืออะไร?</span>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-pink-50/60 p-4">
          <div className="flex flex-col items-center gap-1">
            <FractionShape numerator={4} denominator={4} tone="accent" className="h-16 w-16" />
            <FractionText numerator={4} denominator={4} className="text-lg" toneClassName="text-pink-600" />
          </div>
          <span className="text-2xl font-extrabold text-slate-400">+</span>
          <div className="flex flex-col items-center gap-1">
            <FractionShape numerator={1} denominator={4} tone="accent" className="h-16 w-16" />
            <FractionText numerator={1} denominator={4} className="text-lg" toneClassName="text-pink-600" />
          </div>
          <span className="text-2xl font-extrabold text-slate-400">=</span>
          <FractionText numerator={5} denominator={4} className="text-4xl" toneClassName="text-pink-600" />
        </div>

        <p className="mt-2 flex items-center justify-center gap-1 text-center text-sm font-bold text-slate-600">
          <FractionText numerator={4} denominator={4} className="text-base" toneClassName="text-pink-600" /> = 1 หน่วย
        </p>

        <div className="mt-3 rounded-xl bg-gradient-to-r from-pink-500 to-fuchsia-500 p-4 text-white">
          <div className="flex items-center justify-center gap-2">
            <FractionText numerator={5} denominator={4} className="text-2xl" toneClassName="text-white" />
            <span className="text-base font-extrabold">มากกว่า 1 หน่วย</span>
          </div>
          <p className="mt-1 text-center text-sm font-bold opacity-90">เรียกว่า &ldquo;เศษเกิน&rdquo;</p>
        </div>
      </div>
    </Card>
  );
}
