import { FractionShape } from "@/components/fractions/FractionShape";
import { Card } from "@/components/ui/Card";
import { multiplyTypeOptions } from "@/data/lessonMultiply";
import { FractionStack, SectionHeader } from "@/components/lessons/multiply/MultiplyMath";

export function MultiplyTypeSelector() {
  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={1} title="เลือกประเภทการคูณ" />
      <div className="grid gap-4 p-4 xl:grid-cols-3">
        {multiplyTypeOptions.map((option) => (
          <div
            key={option.id}
            className="rounded-xl border border-orange-100 bg-gradient-to-br from-white to-orange-50/60 p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-orange-500 text-sm font-extrabold text-white">
                    {option.order}
                  </span>
                  <h3 className="text-lg font-extrabold text-brand-900">{option.title}</h3>
                </div>
                <div className="mt-3 flex items-center gap-3 text-2xl font-extrabold text-slate-950">
                  {option.id === "fraction" && (
                    <>
                      <FractionStack top={2} bottom={3} />
                      <span>×</span>
                      <FractionStack top={3} bottom={4} />
                    </>
                  )}
                  {option.id === "whole" && (
                    <>
                      <span>3</span>
                      <span>×</span>
                      <FractionStack top={2} bottom={5} />
                    </>
                  )}
                  {option.id === "mixed" && (
                    <>
                      <span>1</span>
                      <FractionStack top={1} bottom={2} />
                      <span>×</span>
                      <FractionStack top={2} bottom={3} />
                    </>
                  )}
                </div>
              </div>
              <FractionShape
                numerator={option.id === "fraction" ? 6 : 2}
                denominator={option.id === "fraction" ? 12 : 5}
                shape={option.id === "fraction" ? "grid" : "circle"}
                tone={option.tone}
                className="h-16 w-24 shrink-0"
              />
            </div>
            <div className="mt-4 inline-flex rounded-lg bg-orange-50 px-3 py-1.5 text-sm font-extrabold text-orange-700">
              {option.hint}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
