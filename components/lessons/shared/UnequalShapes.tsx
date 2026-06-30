/**
 * ภาพ "แบ่งไม่เท่ากัน" สำหรับสอนว่าเศษส่วนต้องแบ่งเป็นส่วนเท่า ๆ กันก่อน
 * (FractionShape ทำได้เฉพาะการแบ่งเท่ากัน จึงต้องมีชุดนี้แยกไว้)
 */

const STROKE = "#94a3b8"; // slate-400
const FILL_A = "#fb923c"; // orange-400
const FILL_B = "#fed7aa"; // orange-200

type Props = { className?: string };

function polar(deg: number) {
  const a = ((deg - 90) * Math.PI) / 180;
  return [50 + 46 * Math.cos(a), 50 + 46 * Math.sin(a)] as const;
}

export function UnequalCircle({ className }: Props) {
  const angles = [0, 150, 240, 300, 360];
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="วงกลมแบ่งไม่เท่ากัน">
      {angles.slice(0, -1).map((start, i) => {
        const end = angles[i + 1];
        const [x1, y1] = polar(start);
        const [x2, y2] = polar(end);
        const large = end - start > 180 ? 1 : 0;
        const d = `M50 50 L ${x1.toFixed(2)} ${y1.toFixed(2)} A 46 46 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
        return <path key={i} d={d} fill={i % 2 ? FILL_B : FILL_A} stroke={STROKE} strokeWidth={1.5} />;
      })}
    </svg>
  );
}

export function UnequalBar({ className }: Props) {
  const widths = [12, 38, 22, 28];
  let acc = 0;
  const rects = widths.map((w, i) => {
    const start = acc;
    acc += w;
    return (
      <rect key={i} x={start} y={0} width={w} height={30} fill={i % 2 ? FILL_B : FILL_A} stroke={STROKE} strokeWidth={1.2} />
    );
  });
  return (
    <svg viewBox="0 0 100 30" className={className} role="img" aria-label="แท่งแบ่งไม่เท่ากัน">
      {rects}
    </svg>
  );
}

export function UnequalGrid({ className }: Props) {
  const cells = [
    { x: 0, y: 0, w: 60, h: 40 },
    { x: 60, y: 0, w: 40, h: 40 },
    { x: 0, y: 40, w: 38, h: 60 },
    { x: 38, y: 40, w: 62, h: 60 },
  ];
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="ตารางแบ่งไม่เท่ากัน">
      {cells.map((c, i) => (
        <rect key={i} x={c.x} y={c.y} width={c.w} height={c.h} fill={i % 2 ? FILL_B : FILL_A} stroke={STROKE} strokeWidth={1.4} />
      ))}
    </svg>
  );
}
