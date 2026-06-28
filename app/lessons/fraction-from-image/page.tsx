import { AppShell } from "@/components/layout/AppShell";
import { FractionFromImageContent } from "@/components/lessons/fraction-from-image/FractionFromImageContent";
import { LessonMissionCard } from "@/components/lessons/LessonMissionCard";
import { LessonTipsCard } from "@/components/lessons/LessonTipsCard";
import { LessonTipsImageWrapper } from "@/components/lessons/shared/LessonTipsImageWrapper";
import { LessonWorksheetsPanel } from "@/components/lessons/shared/LessonWorksheetsPanel";
import {
  fractionFromImageExamples,
  fractionFromImageMeta,
  fractionFromImageMissions,
  fractionFromImageTips
} from "@/data/lessonFractionFromImage";

export default function FractionFromImagePage() {
  return (
    <AppShell
      title="เศษส่วนจากภาพ"
      eyebrow="Lesson 3"
      description="มองภาพแล้วเขียนเป็นเศษส่วน"
      activePath="/lessons/fraction-from-image"
      heroImage={fractionFromImageMeta.heroImage}
      themeColor={fractionFromImageMeta.themeColor}
      aside={
        <div className="space-y-4">
          <LessonTipsImageWrapper lessonSlug="fraction-from-image">
            <LessonTipsCard tips={fractionFromImageTips} examples={fractionFromImageExamples} />
          </LessonTipsImageWrapper>
          <LessonMissionCard missions={fractionFromImageMissions} />
          <LessonWorksheetsPanel lessonSlug="fraction-from-image" />
        </div>
      }
    >
      <FractionFromImageContent />
    </AppShell>
  );
}
