"use client";

type Props = {
  denominator: number;
  filled: boolean[];
  onToggle: (index: number) => void;
  color: string;
  className?: string;
};

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
}

/** วงกลมแบ่งเป็นส่วน ๆ ที่คลิกแต่ละชิ้นเพื่อระบาย/ยกเลิกระบายได้ */
export function ClickableFractionCircle({ denominator, filled, onToggle, color, className }: Props) {
  const slices = Array.from({ length: denominator }, (_, i) => {
    const start = (360 / denominator) * i;
    const end = (360 / denominator) * (i + 1);
    const [x1, y1] = polar(50, 50, 46, start);
    const [x2, y2] = polar(50, 50, 46, end);
    const largeArc = end - start > 180 ? 1 : 0;
    const d =
      denominator === 1
        ? "M50 4 A46 46 0 1 1 49.99 4 Z"
        : `M50 50 L ${x1.toFixed(2)} ${y1.toFixed(2)} A 46 46 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
    const isFilled = filled[i] ?? false;
    return (
      <path
        key={i}
        d={d}
        fill={isFilled ? color : "#ffffff"}
        stroke="#312e81"
        strokeWidth={1.5}
        onClick={() => onToggle(i)}
        className="cursor-pointer transition-colors duration-150 hover:opacity-80"
      />
    );
  });

  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label={`วงกลมแบ่ง ${denominator} ส่วน คลิกเพื่อระบาย`}>
      {slices}
    </svg>
  );
}
