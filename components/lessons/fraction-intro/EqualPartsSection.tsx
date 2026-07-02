import { EqualPartsIntro } from "@/components/lessons/fraction-intro/EqualPartsIntro";
import { EqualPartsCorrectExamples } from "@/components/lessons/fraction-intro/EqualPartsCorrectExamples";
import { EqualPartsIncorrectExamples } from "@/components/lessons/fraction-intro/EqualPartsIncorrectExamples";
import { EqualPartsCompare } from "@/components/lessons/fraction-intro/EqualPartsCompare";
import { EqualPartsInteractiveTool } from "@/components/lessons/fraction-intro/EqualPartsInteractiveTool";
import { EqualPartsQuickPractice } from "@/components/lessons/fraction-intro/EqualPartsQuickPractice";
import { EqualPartsSummary } from "@/components/lessons/fraction-intro/EqualPartsSummary";

export function EqualPartsSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-brand-900">แบ่งเท่า ๆ กัน</h2>
        <p className="mt-1 text-base font-bold text-slate-500">ก่อนเขียนเศษส่วน ทุกส่วนต้องมีขนาดเท่ากัน</p>
      </div>

      <EqualPartsIntro />
      <EqualPartsCorrectExamples />
      <EqualPartsIncorrectExamples />
      <EqualPartsCompare />
      <EqualPartsInteractiveTool />
      <EqualPartsQuickPractice />
      <EqualPartsSummary />
    </div>
  );
}
