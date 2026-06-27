import { FractionShape } from "@/components/fractions/FractionShape";
import { Card } from "@/components/ui/Card";
import { FractionStack, SectionHeader } from "@/components/lessons/multiply/MultiplyMath";

const tools = ["ตาราง", "วงกลม", "แท่ง", "พิซซ่า", "เส้นจำนวน"];

export function MultiplyToolsCard() {
  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={7} title="เลือกเครื่องมือช่วยคิด" />
      <div className="p-4">
        <div className="flex flex-wrap gap-2">
          {tools.map((tool, index) => (
            <button
              key={tool}
              className={`rounded-lg border px-3 py-2 text-sm font-extrabold ${
                index === 0
                  ? "border-orange-500 bg-orange-50 text-orange-700"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              {tool}
            </button>
          ))}
        </div>
        <div className="mt-4 rounded-xl bg-white p-4 ring-1 ring-orange-100">
          <div className="mb-3 text-center text-lg font-extrabold text-brand-900">
            ตัวอย่างภาพ: <FractionStack top={1} bottom={2} /> × <FractionStack top={1} bottom={4} />
          </div>
          <FractionShape numerator={1} denominator={8} shape="grid" tone="violet" className="mx-auto h-28 w-28" />
        </div>
      </div>
    </Card>
  );
}
