import { FractionShape } from "@/components/fractions/FractionShape";
import { Card } from "@/components/ui/Card";
import { addTypeOptions } from "@/data/lessonAdd";
import { FractionStack, SectionHeader } from "@/components/lessons/add/FractionMath";

export function AddTypeSelector() {
  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={1} title="เลือกประเภทการบวก" />
      <div className="grid gap-4 p-4 xl:grid-cols-3">
        {addTypeOptions.map((option) => (
          <div
            key={option.id}
            className="rounded-xl border border-blue-100 bg-gradient-to-br from-white to-sky-50/60 p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-blue-600 text-sm font-extrabold text-white">
                    {option.order}
                  </span>
                  <h3 className="text-lg font-extrabold text-brand-900">{option.title}</h3>
                </div>
                <div className="mt-3 flex items-center gap-3 text-2xl font-extrabold text-slate-950">
                  {option.id === "same" && (
                    <>
                      <FractionStack top={2} bottom={5} />
                      <span>+</span>
                      <FractionStack top={1} bottom={5} />
                    </>
                  )}
                  {option.id === "different" && (
                    <>
                      <FractionStack top={1} bottom={2} />
                      <span>+</span>
                      <FractionStack top={1} bottom={3} />
                    </>
                  )}
                  {option.id === "mixed" && (
                    <>
                      <span>1</span>
                      <FractionStack top={1} bottom={4} />
                      <span>+</span>
                      <span>2</span>
                      <FractionStack top={1} bottom={4} />
                    </>
                  )}
                </div>
              </div>
              <FractionShape
                numerator={option.id === "different" ? 1 : 3}
                denominator={option.id === "different" ? 3 : 5}
                shape={option.id === "different" ? "circle" : "bar"}
                tone={option.tone}
                className="h-16 w-24 shrink-0"
              />
            </div>
            <div className="mt-4 inline-flex rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-extrabold text-blue-700">
              {option.hint}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
