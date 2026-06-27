import { FractionShape } from "@/components/fractions/FractionShape";
import { Card } from "@/components/ui/Card";
import { FractionStack, SectionHeader } from "@/components/lessons/subtract/SubtractMath";

const tools = ["วงกลม", "แท่ง", "ตาราง", "เส้นจำนวน", "พิซซ่า"];

export function SubtractToolsCard() {
  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={7} title="เครื่องช่วยคิด" />
      <div className="p-4">
        <div className="flex flex-wrap gap-2">
          {tools.map((tool, index) => (
            <button
              key={tool}
              className={`rounded-lg border px-3 py-2 text-sm font-extrabold ${
                index === 1
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              {tool}
            </button>
          ))}
        </div>
        <div className="mt-4 rounded-xl bg-white p-4 ring-1 ring-emerald-100">
          <div className="mb-3 text-center text-lg font-extrabold text-brand-900">
            ตัวอย่าง: <FractionStack top={5} bottom={6} /> - <FractionStack top={2} bottom={6} />
          </div>
          <FractionShape numerator={3} denominator={6} shape="bar" tone="emerald" className="mx-auto h-12 w-full max-w-sm" />
          <div className="mt-3 text-center text-2xl font-extrabold text-emerald-700">
            เหลือ <FractionStack top={3} bottom={6} /> = <FractionStack top={1} bottom={2} />
          </div>
        </div>
      </div>
    </Card>
  );
}
