import { FractionShape } from "@/components/fractions/FractionShape";
import { Card } from "@/components/ui/Card";
import { FractionStack, SectionHeader } from "@/components/lessons/add/FractionMath";

const tools = ["วงกลม", "แท่ง", "ตาราง", "เส้นจำนวน", "พิซซ่า"];

export function AddToolsCard() {
  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={6} title="เครื่องช่วยคิด" />
      <div className="p-4">
        <div className="flex flex-wrap gap-2">
          {tools.map((tool, index) => (
            <button
              key={tool}
              className={`rounded-lg border px-3 py-2 text-sm font-extrabold ${
                index === 1
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              {tool}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-xl bg-white p-4 ring-1 ring-blue-100">
          <div className="mb-3 text-center text-lg font-extrabold text-brand-900">
            ตัวอย่าง: <FractionStack top={2} bottom={3} /> + <FractionStack top={1} bottom={6} />
          </div>
          <FractionShape numerator={5} denominator={6} shape="bar" tone="emerald" className="mx-auto h-12 w-full max-w-sm" />
          <div className="mt-3 text-center text-2xl font-extrabold text-pink-600">
            = <FractionStack top={5} bottom={6} />
          </div>
        </div>
      </div>
    </Card>
  );
}
