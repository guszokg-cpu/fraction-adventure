import { CheckCircle, Timer } from "lucide-react";
import { FractionText } from "@/components/fractions/FractionText";
import { Card } from "@/components/ui/Card";
import { speedSamples } from "@/data/lessonSimplifyExpand";

export function SpeedSimplifyCard() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">8</span>
          <h2 className="text-xl font-extrabold">ภารกิจย่อเร็ว (60 วินาที)</h2>
        </div>
      </div>

      <div className="p-5">
        <div className="flex flex-wrap items-center justify-center gap-3 rounded-xl bg-orange-50/70 px-4 py-3">
          <Timer className="text-orange-500" size={26} />
          <span className="text-2xl font-extrabold text-orange-600">60 วินาที</span>
          <span className="text-sm font-bold text-slate-500">ย่อให้ได้มากที่สุดก่อนหมดเวลา</span>
        </div>

        <div className="mt-4 space-y-3">
          {speedSamples.map((sample) => (
            <div
              key={sample.id}
              className="flex items-center justify-between rounded-xl border border-orange-100 bg-white px-5 py-3"
            >
              <div className="flex items-center gap-3 text-xl font-extrabold text-brand-900">
                <FractionText numerator={sample.from.numerator} denominator={sample.from.denominator} className="text-xl" toneClassName="text-orange-600" />
                <span>=</span>
                <FractionText numerator={sample.to.numerator} denominator={sample.to.denominator} className="text-xl" toneClassName="text-emerald-600" />
              </div>
              <CheckCircle className="text-emerald-500" size={22} />
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
