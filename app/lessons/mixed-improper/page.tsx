import { AppShell } from "@/components/layout/AppShell";
import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionText } from "@/components/fractions/FractionText";
import { LessonMissionCard } from "@/components/lessons/LessonMissionCard";
import { MixedImproperContent } from "@/components/lessons/mixed-improper/MixedImproperContent";
import { MixedTipsPanel } from "@/components/lessons/mixed-improper/MixedTipsPanel";
import { LessonTipsImageWrapper } from "@/components/lessons/shared/LessonTipsImageWrapper";
import { LessonWorksheetsPanel } from "@/components/lessons/shared/LessonWorksheetsPanel";
import { Card } from "@/components/ui/Card";
import { mixedImproperMeta, mixedImproperMissions } from "@/data/lessonMixedImproper";

export default function MixedImproperPage() {
  return (
    <AppShell
      title="จำนวนคละและเศษเกิน"
      eyebrow="Lesson 8"
      description="เมื่อมีมากกว่า 1 หน่วย"
      activePath="/lessons/mixed-improper"
      heroImage={mixedImproperMeta.heroImage}
      themeColor={mixedImproperMeta.themeColor}
      aside={
        <div className="space-y-4">
          <LessonTipsImageWrapper lessonSlug="mixed-improper">
            <MixedTipsPanel />
          </LessonTipsImageWrapper>
          <LessonMissionCard missions={mixedImproperMissions} />

          {/* กล่อง มากกว่า 1 หน่วย */}
          <Card className="overflow-hidden p-0">
            <div className="bg-gradient-to-r from-pink-500 to-fuchsia-500 px-5 py-3 text-white">
              <h2 className="text-lg font-extrabold">มากกว่า 1 หน่วย</h2>
            </div>
            <div className="space-y-3 p-4">
              {/* 3/4 < 1 */}
              <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-3">
                <FractionShape numerator={3} denominator={4} tone="emerald" className="h-12 w-12 shrink-0" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <FractionText numerator={3} denominator={4} className="text-lg" toneClassName="text-emerald-600" />
                    <span className="text-sm font-bold text-slate-600">น้อยกว่า 1</span>
                  </div>
                  <p className="mt-0.5 text-xs font-bold text-slate-500">ตัวเศษ &lt; ตัวส่วน</p>
                </div>
              </div>
              {/* 5/4 > 1 */}
              <div className="flex items-center gap-3 rounded-xl bg-pink-50 p-3">
                <div className="flex shrink-0 gap-0.5">
                  <FractionShape numerator={4} denominator={4} tone="accent" className="h-10 w-10" />
                  <FractionShape numerator={1} denominator={4} tone="accent" className="h-10 w-10" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <FractionText numerator={5} denominator={4} className="text-lg" toneClassName="text-pink-600" />
                    <span className="text-sm font-bold text-slate-600">มากกว่า 1</span>
                  </div>
                  <p className="mt-0.5 text-xs font-bold text-slate-500">ตัวเศษ &gt; ตัวส่วน</p>
                </div>
              </div>
            </div>
          </Card>
          <LessonWorksheetsPanel lessonSlug="mixed-improper" />
        </div>
      }
    >
      <MixedImproperContent />
    </AppShell>
  );
}
