import { Card } from "@/components/ui/Card";
import { FractionStack, NumberLineEquivalent, SectionHeader } from "@/components/lessons/equivalent/EquivalentMath";

export function EquivalentNumberLineCard() {
  return (
    <Card className="overflow-hidden p-0">
      <SectionHeader number={6} title="พิสูจน์ด้วยเส้นจำนวน" />
      <div className="p-4">
        <NumberLineEquivalent />
        <p className="mt-4 flex flex-wrap items-center justify-center gap-1 text-center text-sm font-bold text-slate-600">
          <span className="inline-flex items-center gap-1 font-extrabold text-violet-700">
            <FractionStack top={1} bottom={2} className="text-sm" />
            ,&nbsp;<FractionStack top={2} bottom={4} className="text-sm" />
            &nbsp;และ&nbsp;<FractionStack top={3} bottom={6} className="text-sm" />
          </span>
          <span>อยู่ตำแหน่งเดียวกันบนเส้นจำนวน จึงมีค่าเท่ากัน</span>
        </p>
      </div>
    </Card>
  );
}
