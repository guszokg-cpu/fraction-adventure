import { StepExplanationHero } from "@/components/lessons/fraction-from-image/StepExplanationHero";
import { ThreeStepCards } from "@/components/lessons/fraction-from-image/ThreeStepCards";
import { MoreFractionExamples } from "@/components/lessons/fraction-from-image/MoreFractionExamples";
import { FractionRememberCard } from "@/components/lessons/fraction-from-image/FractionRememberCard";
import { CommonMistakesCard } from "@/components/lessons/fraction-from-image/CommonMistakesCard";
import { QuickPracticeQuiz } from "@/components/lessons/fraction-from-image/QuickPracticeQuiz";
import { LessonSummaryCard } from "@/components/lessons/fraction-from-image/LessonSummaryCard";

export function StepExplanationSection() {
  return (
    <div className="space-y-8">
      <StepExplanationHero />
      <ThreeStepCards />
      <MoreFractionExamples />
      <FractionRememberCard />
      <CommonMistakesCard />
      <QuickPracticeQuiz />
      <LessonSummaryCard />
    </div>
  );
}
