import { LessonActionBar } from "@/components/lessons/LessonActionBar";
import { LessonProgressHeader } from "@/components/lessons/LessonProgressHeader";
import { ConnectPairsCard } from "@/components/lessons/simplify-expand/ConnectPairsCard";
import { EquivalentGeneratorCard } from "@/components/lessons/simplify-expand/EquivalentGeneratorCard";
import { ExpandFractionCard } from "@/components/lessons/simplify-expand/ExpandFractionCard";
import { FractionDetectiveCard } from "@/components/lessons/simplify-expand/FractionDetectiveCard";
import { LowestTermCard } from "@/components/lessons/simplify-expand/LowestTermCard";
import { SimplifyFractionCard } from "@/components/lessons/simplify-expand/SimplifyFractionCard";
import { SimplifyPracticeGrid } from "@/components/lessons/simplify-expand/SimplifyPracticeGrid";
import { SpeedSimplifyCard } from "@/components/lessons/simplify-expand/SpeedSimplifyCard";
import { ZoomEquivalentCard } from "@/components/lessons/simplify-expand/ZoomEquivalentCard";
import { simplifyExpandMeta } from "@/data/lessonSimplifyExpand";

export function SimplifyExpandContent() {
  return (
    <div className="space-y-5">
      <LessonProgressHeader meta={simplifyExpandMeta} />

      <div className="grid gap-5 xl:grid-cols-2">
        <ExpandFractionCard />
        <SimplifyFractionCard />
      </div>

      <ZoomEquivalentCard />

      <EquivalentGeneratorCard />

      <LowestTermCard />

      <div className="grid gap-5 xl:grid-cols-2">
        <FractionDetectiveCard />
        <ConnectPairsCard />
      </div>

      <SpeedSimplifyCard />

      <SimplifyPracticeGrid />

      <LessonActionBar meta={simplifyExpandMeta} practiceCount={10} />
    </div>
  );
}
