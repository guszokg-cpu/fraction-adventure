import { FractionText } from "@/components/fractions/FractionText";
import { Card } from "@/components/ui/Card";

// 5/4 = 4R1 → 1 1/4   7/3 = 6R1 → 2 1/3   9/2 = 8R1 → 4 1/2
const PAIRS = [
  {
    left: { num: 5, den: 4 },
    right: { whole: 1, num: 1, den: 4 },
    textColor: "text-pink-600",
    borderColor: "border-pink-300",
    lineColor: "#ec4899"
  },
  {
    left: { num: 7, den: 3 },
    right: { whole: 2, num: 1, den: 3 },
    textColor: "text-fuchsia-600",
    borderColor: "border-fuchsia-300",
    lineColor: "#c026d3"
  },
  {
    left: { num: 9, den: 2 },
    right: { whole: 4, num: 1, den: 2 },
    textColor: "text-violet-600",
    borderColor: "border-violet-300",
    lineColor: "#7c3aed"
  }
];

export function MatchPairsCard() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-r from-pink-600 to-fuchsia-600 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">9</span>
          <h2 className="text-xl font-extrabold">ลากจับคู่</h2>
        </div>
      </div>
      <div className="p-5">
        <p className="mb-4 text-sm font-bold text-slate-600">จับคู่เศษเกินกับจำนวนคละที่มีค่าเท่ากัน</p>
        <div className="space-y-4">
          {PAIRS.map((p, i) => (
            <div key={i} className="flex items-center gap-2">
              {/* Left: improper fraction */}
              <div
                className={`flex w-20 items-center justify-center rounded-xl border-2 py-2 ${p.borderColor}`}
              >
                <FractionText
                  numerator={p.left.num}
                  denominator={p.left.den}
                  className="text-xl"
                  toneClassName={p.textColor}
                />
              </div>

              {/* Dashed connecting line */}
              <div className="flex-1 overflow-hidden" style={{ height: "4px" }}>
                <svg className="h-full w-full" viewBox="0 0 80 4" preserveAspectRatio="none">
                  <line x1={0} y1={2} x2={80} y2={2} stroke={p.lineColor} strokeWidth={2} strokeDasharray="5 3" />
                </svg>
              </div>

              {/* Right: mixed number */}
              <div
                className={`flex w-24 items-center justify-center gap-0.5 rounded-xl border-2 py-2 ${p.borderColor}`}
              >
                <span className={`text-xl font-extrabold ${p.textColor}`}>{p.right.whole}</span>
                <FractionText
                  numerator={p.right.num}
                  denominator={p.right.den}
                  className="text-xl"
                  toneClassName={p.textColor}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
