import { LessonActionBar } from "@/components/lessons/LessonActionBar";
import { LessonProgressHeader } from "@/components/lessons/LessonProgressHeader";
import { ConvertToImproperQuiz } from "@/components/lessons/mixed-improper/ConvertToImproperQuiz";
import { ConvertToMixedQuiz } from "@/components/lessons/mixed-improper/ConvertToMixedQuiz";
import { ImproperIntroCard } from "@/components/lessons/mixed-improper/ImproperIntroCard";
import { ImproperToMixedCard } from "@/components/lessons/mixed-improper/ImproperToMixedCard";
import { MatchPairsCard } from "@/components/lessons/mixed-improper/MatchPairsCard";
import { MixedConverterCard } from "@/components/lessons/mixed-improper/MixedConverterCard";
import { MixedNumberLineCard } from "@/components/lessons/mixed-improper/MixedNumberLineCard";
import { MixedPracticeGrid } from "@/components/lessons/mixed-improper/MixedPracticeGrid";
import { MixedToImproperCard } from "@/components/lessons/mixed-improper/MixedToImproperCard";
import { TimerGameCard } from "@/components/lessons/mixed-improper/TimerGameCard";
import { VisualQuizCard } from "@/components/lessons/mixed-improper/VisualQuizCard";
import { mixedImproperMeta } from "@/data/lessonMixedImproper";

export function MixedImproperContent() {
  return (
    <div className="space-y-5">
      <LessonProgressHeader meta={mixedImproperMeta} />

      {/* Row 1: การ์ด 1–3 */}
      <div className="grid gap-5 xl:grid-cols-3">
        <ImproperIntroCard />
        <ImproperToMixedCard />
        <MixedToImproperCard />
      </div>

      {/* Row 2: การ์ด 4–6 */}
      <div className="grid gap-5 xl:grid-cols-3">
        <MixedConverterCard />
        <MixedNumberLineCard />
        <VisualQuizCard />
      </div>

      {/* Row 3: การ์ด 7–8 */}
      <div className="grid gap-5 xl:grid-cols-2">
        <ConvertToMixedQuiz />
        <ConvertToImproperQuiz />
      </div>

      {/* Row 4: การ์ด 9–10 */}
      <div className="grid gap-5 xl:grid-cols-2">
        <MatchPairsCard />
        <TimerGameCard />
      </div>

      <MixedPracticeGrid />

      <LessonActionBar meta={mixedImproperMeta} practiceCount={10} />
    </div>
  );
}
