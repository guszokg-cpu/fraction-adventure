import { cn } from "@/lib/cn";

/** ขั้นการหารสั้นเพื่อหา ค.ร.น. — หารด้วยจำนวนเฉพาะที่หารลงตัวอย่างน้อยหนึ่งตัว จนเหลือ 1 ทั้งคู่ */
function ladderRows(a: number, b: number) {
  const rows: { divisor: number; beforeA: number; beforeB: number; afterA: number; afterB: number }[] = [];
  let x = a;
  let y = b;
  let d = 2;
  let guard = 0;
  while ((x > 1 || y > 1) && guard++ < 500) {
    if (x % d === 0 || y % d === 0) {
      const na = x % d === 0 ? x / d : x;
      const nb = y % d === 0 ? y / d : y;
      rows.push({ divisor: d, beforeA: x, beforeB: y, afterA: na, afterB: nb });
      x = na;
      y = nb;
    } else {
      d++;
    }
  }
  return rows;
}

/** แสดงวิธีหารสั้นหา ค.ร.น. (ใช้เมื่อพหุคูณยาวเกินไป) */
export function LcmLadder({ a, b, badgeClass, resultClass }: { a: number; b: number; badgeClass: string; resultClass: string }) {
  const rows = ladderRows(a, b);
  const lcm = rows.reduce((p, r) => p * r.divisor, 1);
  const last = rows[rows.length - 1];

  return (
    <div className="space-y-3">
      <p className="text-center text-sm font-bold text-slate-500">พหุคูณยาวเกินไป — ใช้วิธี &ldquo;หารสั้น&rdquo; หา ค.ร.น. แทน</p>
      <div className="mx-auto w-fit">
        {rows.map((r, i) => (
          <div key={i} className="flex items-stretch">
            <span className={cn("grid h-9 w-9 place-items-center rounded-lg text-base font-extrabold text-white", badgeClass)}>
              {r.divisor}
            </span>
            <span className="ml-1 grid w-14 place-items-center border-l-4 border-slate-300 text-lg font-extrabold text-slate-700">
              {r.beforeA}
            </span>
            <span className="grid w-14 place-items-center text-lg font-extrabold text-slate-700">{r.beforeB}</span>
          </div>
        ))}
        {last && (
          <div className="flex items-stretch">
            <span className="h-9 w-9" />
            <span className={cn("ml-1 grid w-14 place-items-center border-l-4 border-slate-300 text-lg font-extrabold", resultClass)}>
              {last.afterA}
            </span>
            <span className={cn("grid w-14 place-items-center text-lg font-extrabold", resultClass)}>{last.afterB}</span>
          </div>
        )}
      </div>
      <p className="text-center text-sm font-bold text-slate-600">
        ค.ร.น. = {rows.map((r) => r.divisor).join(" × ")} = <span className={cn("text-lg font-extrabold", resultClass)}>{lcm}</span>
      </p>
    </div>
  );
}

/** แท่งสัดส่วนต่อเนื่อง (ไม่แบ่งช่อง) — ใช้เมื่อตัวส่วนใหญ่จนแบ่งช่องไม่ไหว */
export function ProportionBar({ num, den, barClass, className }: { num: number; den: number; barClass: string; className?: string }) {
  const pct = Math.max(0, Math.min(1, num / den)) * 100;
  return (
    <div className={cn("overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200", className)}>
      <div className={cn("h-full rounded-lg transition-all", barClass)} style={{ width: `${pct}%` }} />
    </div>
  );
}

/** แท่งสัดส่วนต่อเนื่องสองสี (ส่วนแรก + ส่วนที่สอง) เทียบกับทั้งหมด */
export function TwoSegmentBar({
  first,
  second,
  den,
  firstClass,
  secondClass,
  className,
}: {
  first: number;
  second: number;
  den: number;
  firstClass: string;
  secondClass: string;
  className?: string;
}) {
  const f = Math.max(0, Math.min(first, den)) / den;
  const remaining = den - Math.min(first, den);
  const s = Math.max(0, Math.min(second, remaining)) / den;
  return (
    <div className={cn("flex overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200", className)}>
      <div className={cn("h-full", firstClass)} style={{ width: `${f * 100}%` }} />
      <div className={cn("h-full", secondClass)} style={{ width: `${s * 100}%` }} />
    </div>
  );
}
