import { FractionShape } from "@/components/fractions/FractionShape";
import { Card } from "@/components/ui/Card";
import { divideTypeOptions } from "@/data/lessonDivide";
import { FractionStack, SectionHeader } from "@/components/lessons/divide/DivideMath";

export function DivideTypeSelector() {
  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={1} title="เลือกประเภทการหาร" />
      <div className="grid gap-4 p-4 xl:grid-cols-3">
        {divideTypeOptions.map((option) => (
          <div
            key={option.id}
            className="rounded-xl border border-violet-100 bg-gradient-to-br from-white to-violet-50/60 p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-violet-600 text-sm font-extrabold text-white">
                    {option.order}
                  </span>
                  <h3 className="text-lg font-extrabold text-brand-900">{option.title}</h3>
                </div>
                <div className="mt-3 flex items-center gap-3 text-2xl font-extrabold text-slate-950">
                  {option.id === "fraction" && (
                    <>
                      <FractionStack top={1} bottom={2} />
                      <span>÷</span>
                      <FractionStack top={1} bottom={4} />
                    </>
                  )}
                  {option.id === "whole" && (
                    <>
                      <span>2</span>
                      <span>÷</span>
                      <FractionStack top={1} bottom={4} />
                    </>
                  )}
                  {option.id === "mixed" && (
                    <>
                      <span>1</span>
                      <FractionStack top={1} bottom={2} />
                      <span>÷</span>
                      <FractionStack top={1} bottom={4} />
                    </>
                  )}
                </div>
              </div>
              <FractionShape
                numerator={option.id === "whole" ? 3 : 1}
                denominator={option.id === "whole" ? 4 : 2}
                shape={option.id === "whole" ? "circle" : "bar"}
                tone={option.tone}
                className="h-16 w-24 shrink-0"
              />
            </div>
            <div className="mt-4 inline-flex rounded-lg bg-violet-50 px-3 py-1.5 text-sm font-extrabold text-violet-700">
              {option.hint}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
