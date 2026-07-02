"use client";

type Props = {
  denominator: number;
  filled: boolean[];
  onToggle: (index: number) => void;
  color: string;
  className?: string;
};

/** แท่งสี่เหลี่ยมแนวตั้ง แบ่งเป็นช่อง ๆ ที่คลิกแต่ละช่องเพื่อระบาย/ยกเลิกระบายได้ */
export function ClickableFractionVerticalBar({ denominator, filled, onToggle, color, className }: Props) {
  const height = 100 / denominator;
  const cells = Array.from({ length: denominator }, (_, i) => {
    const isFilled = filled[i] ?? false;
    return (
      <rect
        key={i}
        x={0}
        y={i * height}
        width={40}
        height={height}
        fill={isFilled ? color : "#ffffff"}
        stroke="#312e81"
        strokeWidth={1.2}
        onClick={() => onToggle(i)}
        className="cursor-pointer transition-colors duration-150 hover:opacity-80"
      />
    );
  });

  return (
    <svg viewBox="0 0 40 100" className={className} role="img" aria-label={`แท่งแนวตั้งแบ่ง ${denominator} ส่วน คลิกเพื่อระบาย`}>
      {cells}
    </svg>
  );
}
