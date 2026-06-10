import { ContinueLessonCard } from "@/components/learning/ContinueLessonCard";
import { LearningMap } from "@/components/learning/LearningMap";
import { QuickActions } from "@/components/learning/QuickActions";

export function DashboardOverview() {
  return (
    <div className="space-y-5">
      <ContinueLessonCard />
      <LearningMap />
      <QuickActions />
    </div>
  );
}
