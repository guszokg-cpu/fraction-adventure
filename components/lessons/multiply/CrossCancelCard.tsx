import { Card } from "@/components/ui/Card";
import { FractionStack, SectionHeader } from "@/components/lessons/multiply/MultiplyMath";

export function CrossCancelCard() {
  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={4} title="ตัดทอนก่อนคูณ" />
      <div className="p-4">
        <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
          <div className="rounded-xl bg-white p-4 text-center ring-1 ring-orange-100">
            <div className="text-3xl font-extrabold text-slate-950">
              <FractionStack top={2} bottom={3} /> × <FractionStack top={9} bottom={10} />
            </div>
            <div className="mt-3 text-sm font-extrabold text-rose-600">ตัด 9 กับ 3 ด้วย 3</div>
          </div>
          <div className="text-center text-3xl font-extrabold text-orange-600">→</div>
          <div className="rounded-xl bg-orange-50 p-4 text-center ring-1 ring-orange-100">
            <div className="text-3xl font-extrabold text-slate-950">
              <FractionStack top={2} bottom={1} /> × <FractionStack top={3} bottom={10} />
            </div>
            <div className="mt-3 text-xl font-extrabold text-emerald-700">
              = <FractionStack top={6} bottom={10} /> = <FractionStack top={3} bottom={5} />
            </div>
          </div>
        </div>
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-center text-sm font-bold text-amber-700">
          ตัดทอนก่อนคูณช่วยให้เลขเล็กลง และควรย่อคำตอบให้เป็นอย่างต่ำ
        </p>
      </div>
    </Card>
  );
}
