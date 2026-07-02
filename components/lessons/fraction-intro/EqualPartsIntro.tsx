import { Card } from "@/components/ui/Card";
import { FractionShape } from "@/components/fractions/FractionShape";
import { readThaiFraction } from "@/lib/thaiNumber";

export function EqualPartsIntro() {
  return (
    <Card className="rounded-2xl">
      <div className="grid items-center gap-6 md:grid-cols-[220px_1fr]">
        <FractionShape numerator={1} denominator={4} shape="circle" tone="violet" className="mx-auto h-44 w-44" />
        <div className="space-y-4">
          <p className="text-lg font-bold leading-relaxed text-slate-700">
            การแบ่งเท่า ๆ กัน คือการแบ่ง 1 หน่วยออกเป็นหลายส่วน โดยทุกส่วนมีขนาดเท่ากัน
          </p>
          <p className="text-lg font-bold leading-relaxed text-slate-700">
            เมื่อทุกส่วนเท่ากัน เราจึงเขียนเป็นเศษส่วนได้
          </p>
          <div className="flex items-center gap-4 rounded-xl bg-violet-50 px-5 py-4">
            <div className="flex flex-col items-center leading-none text-brand-700">
              <span className="text-4xl font-extrabold">1</span>
              <span className="my-1 h-1 w-8 rounded-full bg-brand-400" />
              <span className="text-4xl font-extrabold">4</span>
            </div>
            <div className="text-base font-bold text-violet-700">
              อ่านว่า &ldquo;{readThaiFraction(1, 4)}&rdquo;
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
