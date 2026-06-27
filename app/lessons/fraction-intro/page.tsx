import { AppShell } from "@/components/layout/AppShell";
import { FractionIntroContent } from "@/components/lessons/fraction-intro/FractionIntroContent";
import { LessonTipsCard } from "@/components/lessons/LessonTipsCard";
import { LessonMissionCard } from "@/components/lessons/LessonMissionCard";
import { fractionIntroExamples, fractionIntroMeta, fractionIntroMissions, fractionIntroTips } from "@/data/lessonFractionIntro";

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
          <LessonTipsCard tips={fractionIntroTips} examples={fractionIntroExamples} />
          <LessonMissionCard missions={fractionIntroMissions} />
        </div>
      }
    >
      <FractionIntroContent />
    </AppShell>
  );
}
