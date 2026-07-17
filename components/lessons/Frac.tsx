import { cn } from "@/lib/cn";

/**
 * เศษส่วนแบบตั้ง (ตัวเศษบน · เส้นคั่น · ตัวส่วนล่าง) สำหรับแทรกกลางประโยค
 * ขนาดปรับตามตัวอักษรรอบข้างเอง และจัดกึ่งกลางแนวตั้งให้พอดีบรรทัด
 *
 * ใช้แทนการเขียน {a}/{b} แบบเฉียง ซึ่งไม่ใช่รูปเศษส่วนที่ถูกต้อง
 * (ตัวนับ เช่น "ข้อ 3/8" หรือ "วางแล้ว 2/5 ถุง" ไม่ต้องใช้ตัวนี้)
 */
export function Frac({
  n,
  d,
  className,
  tone,
}: {
  n: number | string;
  d: number | string;
  className?: string;
  tone?: string;
}) {
  return (
    <span
      className={cn("mx-0.5 inline-flex translate-y-[0.1em] flex-col items-center align-middle leading-none", tone, className)}
      role="math"
      aria-label={`เศษส่วน ${n} ส่วน ${d}`}
    >
      <span className="text-[0.78em] font-extrabold">{n}</span>
      <span className="my-[0.09em] h-[0.09em] w-[1.15em] rounded-full bg-current" />
      <span className="text-[0.78em] font-extrabold">{d}</span>
    </span>
  );
}

/**
 * เศษส่วนแบบตั้งสำหรับวาดใน <svg> (ใช้ <span> ไม่ได้)
 * x,y = จุดกึ่งกลางของเศษส่วน
 */
export function SvgFrac({
  x,
  y,
  n,
  d,
  size = 11,
  fill = "#334155",
}: {
  x: number;
  y: number;
  n: number | string;
  d: number | string;
  size?: number;
  fill?: string;
}) {
  const half = size * 0.62;
  return (
    <g role="math" aria-label={`เศษส่วน ${n} ส่วน ${d}`}>
      <text x={x} y={y - half * 0.28} fontSize={size} fontWeight={900} fill={fill} textAnchor="middle">{n}</text>
      <line x1={x - size * 0.42} y1={y} x2={x + size * 0.42} y2={y} stroke={fill} strokeWidth={Math.max(1, size * 0.1)} strokeLinecap="round" />
      <text x={x} y={y + half * 1.28} fontSize={size} fontWeight={900} fill={fill} textAnchor="middle">{d}</text>
    </g>
  );
}
