import { Card } from "@/components/ui/Card";
import { LessonActionBar } from "@/components/lessons/LessonActionBar";
import { LessonProgressHeader } from "@/components/lessons/LessonProgressHeader";
import { CommonDenominatorCard } from "@/components/lessons/compare/CommonDenominatorCard";
import { CompareQuestionCard } from "@/components/lessons/compare/CompareQuestionCard";
import { ComparePracticeGrid } from "@/components/lessons/compare/ComparePracticeGrid";
import { NumberLineCompare } from "@/components/lessons/compare/NumberLineCompare";
import { VisualCompareSteps } from "@/components/lessons/compare/VisualCompareSteps";
import { compareHelperModes, compareMeta } from "@/data/lessonCompare";

export function CompareContent() {
  return (
    <div className="space-y-5">
      <LessonProgressHeader meta={compareMeta} />

      <CompareQuestionCard />

      <VisualCompareSteps />

      <NumberLineCompare />

      <CommonDenominatorCard />

      <Card className="overflow-hidden p-0">
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-5 py-3 text-white">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">5</span>
            <h2 className="text-xl font-extrabold">เลือกวิธีช่วยคิด</h2>
          </div>
        </div>
        <div className="p-5">
          <p className="text-sm font-bold text-slate-600">เลือกวิธีที่ช่วยให้เข้าใจได้ง่ายที่สุด</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {compareHelperModes.map((mode) => (
              <button
                key={mode.id}
                className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-white px-4 py-3 text-left font-extrabold text-brand-900 transition hover:border-emerald-300 hover:bg-emerald-50"
              >
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-2xl">{mode.icon}</span>
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <ComparePracticeGrid />

      <LessonActionBar meta={compareMeta} practiceCount={10} />
    </div>
  );
}
