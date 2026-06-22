import { AppShell } from "@/components/layout/AppShell";
import { FractionFromImageContent } from "@/components/lessons/fraction-from-image/FractionFromImageContent";
import { LessonMissionCard } from "@/components/lessons/LessonMissionCard";
import { LessonTipsCard } from "@/components/lessons/LessonTipsCard";
import {
  fractionFromImageExamples,
  fractionFromImageMissions,
  fractionFromImageTips
} from "@/data/lessonFractionFromImage";

export default function FractionFromImagePage() {
  return (
    <AppShell
      title="เศษส่วนจากภาพ"
      eyebrow="Lesson 4"
      description="มองภาพแล้วเขียนเป็นเศษส่วน"
      activePath="/lessons/fraction-from-image"
      aside={
        <div className="space-y-4">
          <LessonTipsCard tips={fractionFromImageTips} examples={fractionFromImageExamples} />
          <LessonMissionCard missions={fractionFromImageMissions} />
        </div>
      }
    >
      <FractionFromImageContent />
    </AppShell>
  );
}
