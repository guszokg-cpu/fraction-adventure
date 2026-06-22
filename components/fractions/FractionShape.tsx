import { cn } from "@/lib/cn";
import type { FractionShapeKind, FractionTone } from "@/types/lessonContent";

type FractionShapeProps = {
  numerator: number;
  denominator: number;
  shape?: FractionShapeKind;
  tone?: FractionTone;
  className?: string;
};

const toneFill: Record<FractionTone, string> = {
  accent: "#facc15",
  emerald: "#34d399",
  violet: "#a78bfa",
  sky: "#38bdf8",
  pink: "#f472b6"
};

const EMPTY_FILL = "#ffffff";
const STROKE = "#312e81";

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
}

function CircleShape({ numerator, denominator, fill }: { numerator: number; denominator: number; fill: string }) {
  const slices = Array.from({ length: denominator }, (_, i) => {
    const start = (360 / denominator) * i;
    const end = (360 / denominator) * (i + 1);
    const [x1, y1] = polar(50, 50, 46, start);
    const [x2, y2] = polar(50, 50, 46, end);
    const largeArc = end - start > 180 ? 1 : 0;
    const path = `M50 50 L ${x1.toFixed(2)} ${y1.toFixed(2)} A 46 46 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
    return <path key={i} d={path} fill={i < numerator ? fill : EMPTY_FILL} stroke={STROKE} strokeWidth={1.5} />;
  });

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label={`${numerator} ส่วนจาก ${denominator}`}>
      {slices}
    </svg>
  );
}

function BarShape({ numerator, denominator, fill }: { numerator: number; denominator: number; fill: string }) {
  const width = 100 / denominator;
  const cells = Array.from({ length: denominator }, (_, i) => (
    <rect
      key={i}
      x={i * width}
      y={0}
      width={width}
      height={26}
      fill={i < numerator ? fill : EMPTY_FILL}
      stroke={STROKE}
      strokeWidth={1.2}
    />
  ));

  return (
    <svg viewBox="0 0 100 26" className="h-full w-full" role="img" aria-label={`${numerator} ส่วนจาก ${denominator}`}>
      {cells}
    </svg>
  );
}

function GridShape({ numerator, denominator, fill }: { numerator: number; denominator: number; fill: string }) {
  const cols = Math.ceil(Math.sqrt(denominator));
  const rows = Math.ceil(denominator / cols);
  const cells = Array.from({ length: denominator }, (_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return (
      <rect
        key={i}
        x={col * 24}
        y={row * 24}
        width={24}
        height={24}
        fill={i < numerator ? fill : EMPTY_FILL}
        stroke={STROKE}
        strokeWidth={1.2}
      />
    );
  });

  return (
    <svg
      viewBox={`0 0 ${cols * 24} ${rows * 24}`}
      className="h-full w-full"
      role="img"
      aria-label={`${numerator} ส่วนจาก ${denominator}`}
    >
      {cells}
    </svg>
  );
}

export function FractionShape({ numerator, denominator, shape = "circle", tone = "emerald", className }: FractionShapeProps) {
  const fill = toneFill[tone];
  const safeDenominator = Math.max(1, denominator);
  const safeNumerator = Math.min(Math.max(0, numerator), safeDenominator);

  return (
    <div className={cn("grid place-items-center", className)}>
      {shape === "circle" && <CircleShape numerator={safeNumerator} denominator={safeDenominator} fill={fill} />}
      {shape === "bar" && <BarShape numerator={safeNumerator} denominator={safeDenominator} fill={fill} />}
      {shape === "grid" && <GridShape numerator={safeNumerator} denominator={safeDenominator} fill={fill} />}
    </div>
  );
}
