import { FractionText } from "@/components/fractions/FractionText";
import { Card } from "@/components/ui/Card";
import { connectPairs } from "@/data/lessonSimplifyExpand";

const lineColors = ["#f97316", "#10b981", "#8b5cf6"];

export function ConnectPairsCard() {
  const rowCount = connectPairs.length;

  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">7</span>
          <h2 className="text-xl font-extrabold">ลากเส้นเชื่อม</h2>
        </div>
      </div>

      <div className="p-5">
        <div className="relative grid grid-cols-[1fr_72px_1fr] items-center gap-y-4">
          {/* คอลัมน์ซ้าย */}
          <div className="flex flex-col gap-4">
            {connectPairs.map((pair) => (
              <div
                key={`left-${pair.id}`}
                className="flex h-16 items-center justify-center rounded-xl border border-orange-200 bg-white"
              >
                <FractionText numerator={pair.left.numerator} denominator={pair.left.denominator} className="text-2xl" toneClassName="text-orange-600" />
              </div>
            ))}
          </div>

          {/* เส้นเชื่อม (static) */}
          <svg viewBox="0 0 72 240" className="h-full w-full" aria-hidden="true">
            {connectPairs.map((_, index) => {
              const y = ((index + 0.5) / rowCount) * 240;
              return <line key={index} x1={0} y1={y} x2={72} y2={y} stroke={lineColors[index % lineColors.length]} strokeWidth={3} strokeLinecap="round" />;
            })}
          </svg>

          {/* คอลัมน์ขวา */}
          <div className="flex flex-col gap-4">
            {connectPairs.map((pair) => (
              <div
                key={`right-${pair.id}`}
                className="flex h-16 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50/50"
              >
                <FractionText numerator={pair.right.numerator} denominator={pair.right.denominator} className="text-2xl" toneClassName="text-emerald-600" />
              </div>
            ))}
          </div>
        </div>

        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-center text-sm font-bold text-amber-700">
          แต่ละคู่มีค่าเท่ากัน เพราะขยายมาจากเศษส่วนเดียวกัน
        </p>
      </div>
    </Card>
  );
}
