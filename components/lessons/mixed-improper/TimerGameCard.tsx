import { FractionText } from "@/components/fractions/FractionText";
import { Card } from "@/components/ui/Card";

// 7/4 = 7 ÷ 4 = 1 remainder 3 → 1 3/4
export function TimerGameCard() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-r from-pink-600 to-fuchsia-600 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">10</span>
          <h2 className="text-xl font-extrabold">เกมจับเวลา</h2>
        </div>
      </div>
      <div className="p-5 text-center">
        {/* Timer circle */}
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-pink-200 bg-pink-50">
          <div>
            <div className="text-3xl font-extrabold leading-none text-pink-600">60</div>
            <div className="mt-0.5 text-xs font-bold text-pink-400">วินาที</div>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-pink-50/60 p-4">
          <p className="text-sm font-bold text-slate-600">แปลงให้ได้ภายในเวลา</p>
          <div className="mt-2 flex items-center justify-center gap-3">
            <FractionText numerator={7} denominator={4} className="text-3xl" toneClassName="text-pink-600" />
            <span className="text-xl font-extrabold text-slate-400">=</span>
            <div className="flex items-center gap-0.5">
              <span className="text-3xl font-extrabold text-fuchsia-600">1</span>
              <FractionText numerator={3} denominator={4} className="text-2xl" toneClassName="text-fuchsia-600" />
            </div>
          </div>
        </div>

        <button className="mt-4 rounded-xl bg-gradient-to-r from-pink-500 to-fuchsia-500 px-8 py-3 text-base font-extrabold text-white transition hover:opacity-90">
          เริ่มเกม
        </button>
      </div>
    </Card>
  );
}
