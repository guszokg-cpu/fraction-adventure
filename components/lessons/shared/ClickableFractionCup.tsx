"use client";

type Props = {
  denominator: number;
  filled: boolean[];
  onToggle: (index: number) => void;
  color: string;
  className?: string;
};

/** แก้วน้ำทรงสี่เหลี่ยม แบ่งเป็นชั้นแนวนอน คลิกแต่ละชั้นเพื่อเติม/ยกเลิกน้ำได้ (ชั้นที่ 0 อยู่ล่างสุด) */
export function ClickableFractionCup({ denominator, filled, onToggle, color, className }: Props) {
  const left = 22;
  const right = 78;
  const topY = 10;
  const botY = 94;
  const width = right - left;
  const height = botY - topY;
  const layerH = height / denominator;

  const layers = Array.from({ length: denominator }, (_, i) => {
    const isFilled = filled[i] ?? false;
    const y = botY - (i + 1) * layerH;
    return (
      <rect
        key={i}
        x={left}
        y={y}
        width={width}
        height={layerH}
        fill={isFilled ? color : "#eff6ff"}
        stroke="#1d4ed8"
        strokeWidth={1}
        onClick={() => onToggle(i)}
        className="cursor-pointer transition-colors duration-150 hover:opacity-80"
      />
    );
  });

  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label={`แก้วน้ำแบ่ง ${denominator} ชั้น คลิกเพื่อเติม`}>
      {layers}
      <path
        d={`M${left - 2} ${topY} L${left - 2} ${botY + 2} L${right + 2} ${botY + 2} L${right + 2} ${topY}`}
        fill="none"
        stroke="#5b6b8c"
        strokeWidth={2.6}
        strokeLinejoin="round"
        pointerEvents="none"
      />
      <line x1={left - 4} y1={topY} x2={right + 4} y2={topY} stroke="#5b6b8c" strokeWidth={2.6} strokeLinecap="round" pointerEvents="none" />
    </svg>
  );
}
