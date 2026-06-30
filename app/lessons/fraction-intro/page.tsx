import { AppShell } from "@/components/layout/AppShell";
import { FractionIntroContent } from "@/components/lessons/fraction-intro/FractionIntroContent";
import { FractionExamplesMiniQuiz } from "@/components/lessons/fraction-intro/FractionExamplesMiniQuiz";
import { LessonTipsCard } from "@/components/lessons/LessonTipsCard";
import { LessonTipsImageWrapper } from "@/components/lessons/shared/LessonTipsImageWrapper";
import { LessonWorksheetsPanel } from "@/components/lessons/shared/LessonWorksheetsPanel";
import { fractionIntroExamples, fractionIntroMeta, fractionIntroTips } from "@/data/lessonFractionIntro";

export default function FractionIntroPage() {
  return (
    <AppShell
      title="รู้จักเศษส่วน"
      eyebrow="Lesson 1"
      description="เศษส่วนคือส่วนหนึ่งของ 1 หน่วยที่แบ่งเท่า ๆ กัน"
      activePath="/lessons/fraction-intro"
      heroImage={fractionIntroMeta.heroImage}
      themeColor={fractionIntroMeta.themeColor}
      aside={
        <div className="space-y-4">
          <LessonTipsImageWrapper lessonSlug="fraction-intro">
            <LessonTipsCard tips={fractionIntroTips} examples={fractionIntroExamples} />
          </LessonTipsImageWrapper>
          <FractionExamplesMiniQuiz />
          <LessonWorksheetsPanel lessonSlug="fraction-intro" />
        </div>
      }
    >
      <FractionIntroContent />
    </AppShell>
  );
}
