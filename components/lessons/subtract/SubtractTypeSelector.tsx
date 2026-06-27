import { FractionShape } from "@/components/fractions/FractionShape";
import { Card } from "@/components/ui/Card";
import { subtractTypeOptions } from "@/data/lessonSubtract";
import { FractionStack, SectionHeader } from "@/components/lessons/subtract/SubtractMath";

export function SubtractTypeSelector() {
  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={1} title="เลือกประเภทการลบ" />
      <div className="grid gap-4 p-4 xl:grid-cols-3">
        {subtractTypeOptions.map((option) => (
          <div
            key={option.id}
            className="rounded-xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/60 p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-600 text-sm font-extrabold text-white">
                    {option.order}
                  </span>
                  <h3 className="text-lg font-extrabold text-brand-900">{option.title}</h3>
                </div>
                <div className="mt-3 flex items-center gap-3 text-2xl font-extrabold text-slate-950">
                  {option.id === "same" && (
                    <>
                      <FractionStack top={4} bottom={5} />
                      <span>-</span>
                      <FractionStack top={2} bottom={5} />
                    </>
                  )}
                  {option.id === "different" && (
                    <>
                      <FractionStack top={3} bottom={4} />
                      <span>-</span>
                      <FractionStack top={1} bottom={2} />
                    </>
                  )}
                  {option.id === "mixed" && (
                    <>
                      <span>2</span>
                      <FractionStack top={3} bottom={4} />
                      <span>-</span>
                      <span>1</span>
                      <FractionStack top={1} bottom={4} />
                    </>
                  )}
                </div>
              </div>
              <FractionShape
                numerator={option.id === "same" ? 4 : 1}
                denominator={option.id === "same" ? 5 : 2}
                shape={option.id === "different" ? "circle" : "bar"}
                tone={option.tone}
                className="h-16 w-24 shrink-0"
              />
            </div>
            <div className="mt-4 inline-flex rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-extrabold text-emerald-700">
              {option.hint}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
