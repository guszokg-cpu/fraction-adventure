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

/* ---------- รูปทรงของจริงรอบตัว ---------- */

function PizzaShape({ numerator, denominator }: { numerator: number; denominator: number }) {
  const cx = 50;
  const cy = 50;
  const R = 44;
  const slices = Array.from({ length: denominator }, (_, i) => {
    const start = (360 / denominator) * i;
    const end = (360 / denominator) * (i + 1);
    const [x1, y1] = polar(cx, cy, R, start);
    const [x2, y2] = polar(cx, cy, R, end);
    const largeArc = end - start > 180 ? 1 : 0;
    const filled = i < numerator;
    const path = `M${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
    const mid = (start + end) / 2;
    const [px, py] = polar(cx, cy, R * 0.55, mid);
    return (
      <g key={i}>
        <path d={path} fill={filled ? "#f7c948" : "#fdf0d5"} stroke="#c8821e" strokeWidth={1.2} />
        {filled && <circle cx={px} cy={py} r={3.4} fill="#d1453b" />}
      </g>
    );
  });

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label={`พิซซา ${numerator} ส่วนจาก ${denominator}`}>
      <circle cx={cx} cy={cy} r={48} fill="#e3a857" stroke="#b9772f" strokeWidth={2} />
      {slices}
    </svg>
  );
}

function WatermelonShape({ numerator, denominator }: { numerator: number; denominator: number }) {
  const cx = 50;
  const cy = 10;
  const R = 38;
  function pt(r: number, deg: number) {
    const a = (deg * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
  }
  function semi(r: number) {
    const [x1, y1] = pt(r, 0);
    const [x2, y2] = pt(r, 180);
    return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
  }
  const wedges = Array.from({ length: denominator }, (_, i) => {
    const start = (180 / denominator) * i;
    const end = (180 / denominator) * (i + 1);
    const [x1, y1] = pt(R, start);
    const [x2, y2] = pt(R, end);
    const filled = i < numerator;
    const path = `M${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
    const mid = (start + end) / 2;
    const [sx, sy] = pt(R * 0.6, mid);
    return (
      <g key={i}>
        <path d={path} fill={filled ? "#fb6b7e" : "#ffd7dc"} stroke="#f4a9b3" strokeWidth={0.7} />
        {filled && <ellipse cx={sx} cy={sy} rx={1.3} ry={2.3} fill="#3b2b20" transform={`rotate(${mid + 90} ${sx} ${sy})`} />}
      </g>
    );
  });

  return (
    <svg viewBox="0 0 100 56" className="h-full w-full" role="img" aria-label={`แตงโม ${numerator} ส่วนจาก ${denominator}`}>
      <path d={semi(44)} fill="#3f9b46" />
      <path d={semi(41)} fill="#eafaf0" />
      {wedges}
    </svg>
  );
}

function GlassShape({ numerator, denominator }: { numerator: number; denominator: number }) {
  // ทรงสี่เหลี่ยมมุมฉาก: ด้านตรงทุกด้าน น้ำแต่ละชั้นจึงมีขนาดเท่ากันพอดี
  const left = 30;
  const right = 70;
  const topY = 14;
  const botY = 92;
  const W = right - left;
  const H = botY - topY;

  const waterTopY = botY - (H * numerator) / denominator;

  const lines = Array.from({ length: denominator - 1 }, (_, i) => {
    const y = botY - (H * (i + 1)) / denominator;
    return (
      <line key={i} x1={left} y1={y} x2={right} y2={y} stroke="#93c5fd" strokeWidth={0.8} strokeDasharray="2 2" />
    );
  });

  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label={`แก้วน้ำ ${numerator} ส่วนจาก ${denominator}`}>
      {numerator > 0 && <rect x={left} y={waterTopY} width={W} height={botY - waterTopY} fill="#5bc4f1" />}
      {numerator > 0 && <rect x={left} y={waterTopY} width={W} height={2.4} fill="#8fdcf7" />}
      {lines}
      {/* โครงแก้วทรงสี่เหลี่ยม */}
      <path
        d={`M${left} ${topY} L${left} ${botY} L${right} ${botY} L${right} ${topY}`}
        fill="none"
        stroke="#5b6b8c"
        strokeWidth={2.6}
        strokeLinejoin="round"
      />
      <line x1={left - 2} y1={topY} x2={right + 2} y2={topY} stroke="#5b6b8c" strokeWidth={2.6} strokeLinecap="round" />
    </svg>
  );
}

function ChocolateShape({ numerator, denominator }: { numerator: number; denominator: number }) {
  const cols = Math.ceil(Math.sqrt(denominator));
  const rows = Math.ceil(denominator / cols);
  const S = 24;
  const cells = Array.from({ length: denominator }, (_, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = col * S;
    const y = row * S;
    const filled = i < numerator;
    if (filled) {
      return (
        <g key={i}>
          <rect x={x} y={y} width={S} height={S} fill="#6f4424" stroke="#3a2412" strokeWidth={1.4} />
          <rect x={x + 3} y={y + 3} width={S - 9} height={S - 11} fill="#86552f" />
        </g>
      );
    }
    return <rect key={i} x={x} y={y} width={S} height={S} fill="#efe9df" stroke="#cdbfb0" strokeWidth={1.4} />;
  });

  return (
    <svg
      viewBox={`0 0 ${cols * S} ${rows * S}`}
      className="h-full w-full"
      role="img"
      aria-label={`ช็อกโกแลต ${numerator} ส่วนจาก ${denominator}`}
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
      {shape === "pizza" && <PizzaShape numerator={safeNumerator} denominator={safeDenominator} />}
      {shape === "watermelon" && <WatermelonShape numerator={safeNumerator} denominator={safeDenominator} />}
      {shape === "glass" && <GlassShape numerator={safeNumerator} denominator={safeDenominator} />}
      {shape === "chocolate" && <ChocolateShape numerator={safeNumerator} denominator={safeDenominator} />}
    </div>
  );
}
