import { cn } from "@/lib/cn";
import type { FractionTone } from "@/types/lessonContent";

type NumberLineStripProps = {
  /** จำนวนช่องต่อ 1 หน่วย (ตัวส่วน) */
  denominator: number;
  /** ตำแหน่งจุดที่ไฮไลต์ นับเป็นจำนวนช่องจาก 0 (ตัวเศษ) */
  marker?: number;
  /** ช่วงจำนวนเต็มที่แสดง 0 ถึง units (ค่าเริ่มต้น 1) */
  units?: number;
  /** แสดงป้ายเศษส่วนใต้ขีดย่อยหรือไม่ */
  showFractionLabels?: boolean;
  /** แสดงป้ายเศษส่วนเหนือจุดที่ไฮไลต์หรือไม่ */
  showMarkerLabel?: boolean;
  tone?: FractionTone;
  className?: string;
};

const toneColor: Record<FractionTone, string> = {
  accent: "#f59e0b",
  emerald: "#10b981",
  violet: "#8b5cf6",
  sky: "#0ea5e9",
  pink: "#ec4899"
};

const LEFT = 26;
const RIGHT = 294;
const USABLE = RIGHT - LEFT;
const BASE_Y = 46;

export function NumberLineStrip({
  denominator,
  marker,
  units = 1,
  showFractionLabels = true,
  showMarkerLabel = true,
  tone = "sky",
  className
}: NumberLineStripProps) {
  const safeDenominator = Math.max(1, denominator);
  const segments = safeDenominator * Math.max(1, units);
  const color = toneColor[tone];

  const ticks = Array.from({ length: segments + 1 }, (_, i) => {
    const x = LEFT + (i / segments) * USABLE;
    const isWhole = i % safeDenominator === 0;
    return { i, x, isWhole };
  });

  const hasMarker = typeof marker === "number" && marker >= 0 && marker <= segments;
  const markerX = hasMarker ? LEFT + ((marker as number) / segments) * USABLE : 0;

  return (
    <svg
      viewBox="0 0 320 82"
      className={cn("h-full w-full", className)}
      role="img"
      aria-label={hasMarker ? `จุด ${marker} ส่วน ${safeDenominator} บนเส้นจำนวน` : "เส้นจำนวน"}
    >
      {/* เส้นหลักพร้อมหัวลูกศรสองด้าน */}
      <line x1={LEFT - 14} y1={BASE_Y} x2={RIGHT + 14} y2={BASE_Y} stroke="#334155" strokeWidth={2.4} strokeLinecap="round" />
      <polygon points={`${LEFT - 14},${BASE_Y} ${LEFT - 6},${BASE_Y - 4.5} ${LEFT - 6},${BASE_Y + 4.5}`} fill="#334155" />
      <polygon points={`${RIGHT + 14},${BASE_Y} ${RIGHT + 6},${BASE_Y - 4.5} ${RIGHT + 6},${BASE_Y + 4.5}`} fill="#334155" />

      {ticks.map(({ i, x, isWhole }) => {
        const tickHalf = isWhole ? 11 : 6;
        const showLabel = isWhole || showFractionLabels;
        return (
          <g key={i}>
            <line
              x1={x}
              y1={BASE_Y - tickHalf}
              x2={x}
              y2={BASE_Y + tickHalf}
              stroke={isWhole ? "#334155" : "#94a3b8"}
              strokeWidth={isWhole ? 2.2 : 1.4}
            />
            {showLabel &&
              (isWhole ? (
                <text x={x} y={BASE_Y + 26} textAnchor="middle" fontSize={13} fontWeight={800} fill="#1e1b4b">
                  {i / safeDenominator}
                </text>
              ) : (
                <g>
                  <text x={x} y={BASE_Y + 16} textAnchor="middle" fontSize={9} fontWeight={700} fill="#64748b">
                    {i}
                  </text>
                  <line x1={x - 5} y1={BASE_Y + 19} x2={x + 5} y2={BASE_Y + 19} stroke="#94a3b8" strokeWidth={1} />
                  <text x={x} y={BASE_Y + 30} textAnchor="middle" fontSize={9} fontWeight={700} fill="#64748b">
                    {safeDenominator}
                  </text>
                </g>
              ))}
          </g>
        );
      })}

      {hasMarker && (
        <g>
          <line x1={markerX} y1={BASE_Y} x2={markerX} y2={30} stroke={color} strokeWidth={2} strokeDasharray="3 3" />
          {showMarkerLabel && (
            <g>
              <rect x={markerX - 11} y={1} width={22} height={26} rx={6} fill={color} />
              <text x={markerX} y={11} textAnchor="middle" fontSize={9} fontWeight={800} fill="#ffffff">
                {marker}
              </text>
              <line x1={markerX - 6} y1={14} x2={markerX + 6} y2={14} stroke="#ffffff" strokeWidth={1} />
              <text x={markerX} y={25} textAnchor="middle" fontSize={9} fontWeight={800} fill="#ffffff">
                {safeDenominator}
              </text>
            </g>
          )}
          <circle cx={markerX} cy={BASE_Y} r={7} fill={color} stroke="#ffffff" strokeWidth={2.4} />
        </g>
      )}
    </svg>
  );
}
