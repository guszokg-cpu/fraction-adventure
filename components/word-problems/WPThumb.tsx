import { SvgFrac } from "@/components/lessons/Frac";
import type { WPId } from "@/data/wordProblems";

/* ภาพตัวอย่างโจทย์ (วาดด้วย SVG — ไม่ใช้ไฟล์รูป) ขนาด 320×190 */

function Thumb1() {
  // เปรียบเทียบ & เรียงลำดับ — แท่งเวลา 4 คน + เน้นลำดับที่ 3
  const rows = [
    { w: 96, c: "#f472b6", r: 4 },
    { w: 150, c: "#38bdf8", r: 2 },
    { w: 132, c: "#fb923c", r: 3 },
    { w: 74, c: "#a78bfa", r: 5 },
  ];
  return (
    <svg viewBox="0 0 320 190" className="h-full w-full" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ตัวอย่างโจทย์เปรียบเทียบและเรียงลำดับ">
      <rect width="320" height="190" fill="#f5f3ff" />
      <rect x="14" y="14" width="150" height="26" rx="13" fill="#7c3aed" />
      <text x="30" y="32" fontSize="14" fontWeight="800" fill="#fff">อันดับที่ 3 ?</text>
      <SvgFrac x={280} y={30} n={2} d={15} size={18} fill="#7c3aed" />
      {rows.map((b, i) => {
        const y = 62 + i * 30;
        const highlight = i === 2;
        return (
          <g key={i}>
            <circle cx={28} cy={y} r={11} fill={highlight ? "#7c3aed" : "#c4b5fd"} />
            <text x={28} y={y + 4} fontSize="12" fontWeight="800" fill="#fff" textAnchor="middle">{i + 1}</text>
            <rect x={46} y={y - 9} width={b.w} height={18} rx={9} fill={b.c} opacity={highlight ? 1 : 0.85} />
            {highlight && <rect x={46} y={y - 9} width={b.w} height={18} rx={9} fill="none" stroke="#7c3aed" strokeWidth={3} />}
          </g>
        );
      })}
    </svg>
  );
}

function Thumb2() {
  // เรียงลำดับ + ตรวจข้อความ — แท่งสีเชือกเรียงยาว→สั้น + เครื่องหมายถูก
  const ropes = [
    { w: 176, c: "#38bdf8" },
    { w: 156, c: "#22c55e" },
    { w: 132, c: "#f1f5f9" },
    { w: 116, c: "#1f2937" },
    { w: 70, c: "#ef4444" },
  ];
  return (
    <svg viewBox="0 0 320 190" className="h-full w-full" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ตัวอย่างโจทย์เรียงลำดับและตรวจข้อความ">
      <rect width="320" height="190" fill="#f0f9ff" />
      <rect x="14" y="14" width="168" height="26" rx="13" fill="#0284c7" />
      <text x="30" y="32" fontSize="14" fontWeight="800" fill="#fff">ข้อความไหนถูก?</text>
      {ropes.map((b, i) => {
        const y = 60 + i * 25;
        return (
          <g key={i}>
            <text x={30} y={y + 4} fontSize="12" fontWeight="800" fill="#0369a1" textAnchor="middle">{i + 1}</text>
            <rect x={44} y={y - 8} width={b.w} height={16} rx={8} fill={b.c} stroke="#00000018" strokeWidth={1} />
          </g>
        );
      })}
      <circle cx={286} cy={30} r={16} fill="#22c55e" />
      <path d="M278 30 l6 6 l10 -12" fill="none" stroke="#fff" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Thumb3() {
  // เลือกลำดับทั้งชุด — จุดสีต่อด้วยลูกศร + เศษส่วนใต้จุด
  const dots = [
    { c: "#f1f5f9", n: 11, d: 12, mix: 0 },
    { c: "#1f2937", n: 1, d: 6, mix: 2 },
    { c: "#ef4444", n: 7, d: 3, mix: 0 },
  ];
  const cx = [70, 160, 250];
  return (
    <svg viewBox="0 0 320 190" className="h-full w-full" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ตัวอย่างโจทย์เลือกลำดับที่ถูก">
      <rect width="320" height="190" fill="#ecfdf5" />
      <rect x="14" y="14" width="176" height="26" rx="13" fill="#059669" />
      <text x="30" y="32" fontSize="14" fontWeight="800" fill="#fff">เรียงน้อย → มาก</text>
      {[0, 1].map((i) => (
        <g key={i}>
          <line x1={cx[i] + 30} y1={92} x2={cx[i + 1] - 30} y2={92} stroke="#34d399" strokeWidth={4} strokeLinecap="round" />
          <path d={`M${cx[i + 1] - 34} 86 l8 6 l-8 6`} fill="none" stroke="#34d399" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      ))}
      {dots.map((d, i) => (
        <g key={i}>
          <circle cx={cx[i]} cy={92} r={26} fill={d.c} stroke="#00000022" strokeWidth={2} />
          {d.mix > 0 && <text x={cx[i] - 20} y={97} fontSize="16" fontWeight="900" fill="#334155">{d.mix}</text>}
          <SvgFrac x={cx[i] + (d.mix > 0 ? 8 : 0)} y={92} n={d.n} d={d.d} size={13} fill={d.c === "#1f2937" ? "#e5e7eb" : "#334155"} />
        </g>
      ))}
      <circle cx={286} cy={30} r={15} fill="#059669" />
      <path d="M279 30 l5 6 l9 -11" fill="none" stroke="#fff" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Thumb4() {
  // เปรียบเทียบคู่ — สองแก้วเทียบกันด้วยเครื่องหมาย > + เครื่องหมายถูก
  const rows = [
    { c: "#a78bfa", w: 150 },
    { c: "#38bdf8", w: 118 },
    { c: "#fb923c", w: 146 },
    { c: "#34d399", w: 128 },
  ];
  return (
    <svg viewBox="0 0 320 190" className="h-full w-full" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ตัวอย่างโจทย์เปรียบเทียบคู่">
      <rect width="320" height="190" fill="#fffbeb" />
      <rect x="14" y="14" width="150" height="26" rx="13" fill="#d97706" />
      <text x="30" y="32" fontSize="14" fontWeight="800" fill="#fff">ข้อไหนถูก?</text>
      {rows.map((b, i) => {
        const y = 58 + i * 27;
        return (
          <g key={i}>
            <circle cx={28} cy={y} r={6} fill={b.c} />
            <rect x={42} y={y - 8} width={b.w} height={16} rx={8} fill={b.c} opacity={0.9} />
            <SvgFrac x={220 + (i % 2) * 8} y={y} n={20 + i * 3} d={8 + i * 4} size={11} fill="#92400e" />
          </g>
        );
      })}
      <g>
        <rect x="244" y="66" width="60" height="58" rx="12" fill="#fde68a" />
        <text x="274" y="102" fontSize="30" fontWeight="900" fill="#b45309" textAnchor="middle">&gt;</text>
      </g>
      <circle cx={286} cy={30} r={15} fill="#16a34a" />
      <path d="M279 30 l5 6 l9 -11" fill="none" stroke="#fff" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Thumb5() {
  // หาส่วนที่เหลือ — แปลงที่ดินแบ่งเป็นไม้ผล (11/25) กับยางพารา (14/25 = ?)
  return (
    <svg viewBox="0 0 320 190" className="h-full w-full" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ตัวอย่างโจทย์หาพื้นที่ส่วนที่เหลือ">
      <rect width="320" height="190" fill="#fff1f2" />
      <rect x="14" y="14" width="176" height="26" rx="13" fill="#e11d48" />
      <text x="30" y="32" fontSize="14" fontWeight="800" fill="#fff">หาพื้นที่ที่เหลือ</text>
      <text x="290" y="32" fontSize="13" fontWeight="800" fill="#9f1239" textAnchor="end">12</text>
      <SvgFrac x={305} y={28} n={1} d={2} size={11} fill="#9f1239" />
      {/* แปลงที่ดิน */}
      <g>
        <rect x="28" y="58" width="264" height="104" rx="10" fill="#fff" stroke="#fecdd3" strokeWidth="2" />
        {/* ไม้ผล ~44% */}
        <rect x="28" y="58" width="116" height="104" rx="10" fill="#34d399" />
        <rect x="120" y="58" width="24" height="104" fill="#34d399" />
        <text x="86" y="104" fontSize="13" fontWeight="800" fill="#065f46" textAnchor="middle">ไม้ผล</text>
        <SvgFrac x={86} y={124} n={11} d={25} size={13} fill="#065f46" />
        {/* ยางพารา ~56% */}
        <text x="220" y="100" fontSize="13" fontWeight="800" fill="#92400e" textAnchor="middle">ยางพารา</text>
        <SvgFrac x={205} y={122} n={14} d={25} size={13} fill="#92400e" />
        <text x="243" y="127" fontSize="20" fontWeight="900" fill="#b45309">= ?</text>
      </g>
    </svg>
  );
}

function Thumb6() {
  // เติมเลขให้มากที่สุด — ช่อง a/b − c/d + ดาวค่ามากสุด
  const box = (x: number, y: number, txt: string, filled: boolean) => (
    <g>
      <rect x={x} y={y} width="34" height="34" rx="7" fill={filled ? "#fff" : "#ecfeff"} stroke={filled ? "#0891b2" : "#a5f3fc"} strokeWidth="2.5" strokeDasharray={filled ? "0" : "4 3"} />
      <text x={x + 17} y={y + 24} fontSize="19" fontWeight="900" fill={filled ? "#0e7490" : "#67e8f9"} textAnchor="middle">{txt}</text>
    </g>
  );
  return (
    <svg viewBox="0 0 320 190" className="h-full w-full" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ตัวอย่างโจทย์เติมเลขให้ผลลัพธ์มากที่สุด">
      <rect width="320" height="190" fill="#ecfeff" />
      <rect x="14" y="14" width="186" height="26" rx="13" fill="#0891b2" />
      <text x="30" y="32" fontSize="14" fontWeight="800" fill="#fff">ทำให้มากที่สุด!</text>
      {/* เลขที่ให้ */}
      <g>
        {[2, 3, 4, 5, 6].map((d, i) => (
          <g key={i}>
            <circle cx={224 + (i % 3) * 30} cy={54 + Math.floor(i / 3) * 30} r={12} fill="#22d3ee" />
            <text x={224 + (i % 3) * 30} y={59 + Math.floor(i / 3) * 30} fontSize="13" fontWeight="900" fill="#fff" textAnchor="middle">{d}</text>
          </g>
        ))}
      </g>
      {/* นิพจน์ */}
      {box(40, 78, "6", true)}
      <line x1={38} y1={124} x2={76} y2={124} stroke="#334155" strokeWidth="3.5" strokeLinecap="round" />
      {box(40, 130, "2", true)}
      <text x="98" y="130" fontSize="26" fontWeight="900" fill="#334155">−</text>
      {box(120, 78, "3", true)}
      <line x1={118} y1={124} x2={156} y2={124} stroke="#334155" strokeWidth="3.5" strokeLinecap="round" />
      {box(120, 130, "5", true)}
      <text x="170" y="130" fontSize="24" fontWeight="900" fill="#334155">=</text>
      <g>
        <rect x="196" y="104" width="54" height="42" rx="10" fill="#a7f3d0" />
        <text x="214" y="132" fontSize="20" fontWeight="900" fill="#065f46">2</text>
        <SvgFrac x={235} y={125} n={2} d={5} size={13} fill="#065f46" />
      </g>
    </svg>
  );
}

function Thumb7() {
  // หาความจุถัง — ถังมีระดับตอนแรก/เหลือ กับช่วงที่ตวงออก 40 ลิตร
  const x = 40, w = 92, top = 46, bot = 168; // กรอบถัง
  const H = bot - top;
  const beforeY = bot - 0.60 * H; // 3/5
  const afterY = bot - 0.44 * H;  // 11/25
  return (
    <svg viewBox="0 0 320 190" className="h-full w-full" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ตัวอย่างโจทย์หาความจุถัง">
      <rect width="320" height="190" fill="#f0fdfa" />
      <rect x="14" y="14" width="176" height="26" rx="13" fill="#0d9488" />
      <text x="30" y="32" fontSize="14" fontWeight="800" fill="#fff">หาความจุถัง = ?</text>
      {/* ถัง */}
      <rect x={x} y={top} width={w} height={H} rx="10" fill="#fff" stroke="#5eead4" strokeWidth="3" />
      {/* น้ำมันเหลือ */}
      <rect x={x + 3} y={afterY} width={w - 6} height={bot - afterY - 3} rx="6" fill="#fbbf24" />
      {/* ช่วงตวงออก (hatch แดง) */}
      <rect x={x + 3} y={beforeY} width={w - 6} height={afterY - beforeY} fill="#fca5a5" />
      {/* เส้นระดับ */}
      <line x1={x} y1={beforeY} x2={x + w + 96} y2={beforeY} stroke="#14b8a6" strokeWidth="2" strokeDasharray="4 3" />
      <line x1={x} y1={afterY} x2={x + w + 96} y2={afterY} stroke="#d97706" strokeWidth="2" strokeDasharray="4 3" />
      {/* ป้าย */}
      <g>
        <text x={x + w + 12} y={beforeY - 4} fontSize="12" fontWeight="800" fill="#0f766e">ตอนแรก</text>
        <SvgFrac x={x + w + 78} y={beforeY - 8} n={3} d={5} size={12} fill="#0f766e" />
        <text x={x + w + 12} y={afterY + 14} fontSize="12" fontWeight="800" fill="#b45309">เหลือ</text>
        <SvgFrac x={x + w + 62} y={afterY + 10} n={11} d={25} size={12} fill="#b45309" />
      </g>
      {/* ป้ายตวงออก */}
      <rect x={x + w + 14} y={(beforeY + afterY) / 2 - 10} width="96" height="20" rx="10" fill="#ef4444" />
      <text x={x + w + 62} y={(beforeY + afterY) / 2 + 4} fontSize="12" fontWeight="800" fill="#fff" textAnchor="middle">ตวงออก 40 ล.</text>
    </svg>
  );
}

function Thumb8() {
  // ซ่อมถนน — ถนนแบ่งช่วง วันแรก(2/5)/วันสอง(1/2)/เหลือ(1/10 = ?)
  const x = 26, w = 268, y = 78, h = 40;
  const w1 = w * 0.40, w2 = w * 0.50, w3 = w * 0.10;
  return (
    <svg viewBox="0 0 320 190" className="h-full w-full" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ตัวอย่างโจทย์ซ่อมถนนหาที่เหลือ">
      <rect width="320" height="190" fill="#eef2ff" />
      <rect x="14" y="14" width="196" height="26" rx="13" fill="#4f46e5" />
      <text x="30" y="32" fontSize="14" fontWeight="800" fill="#fff">เหลืออีกกี่ กม.?</text>
      <text x="294" y="32" fontSize="13" fontWeight="800" fill="#3730a3" textAnchor="end">2</text>
      <SvgFrac x={308} y={28} n={1} d={4} size={11} fill="#3730a3" />
      {/* ถนน */}
      <g>
        <rect x={x} y={y} width={w1} height={h} fill="#60a5fa" />
        <rect x={x + w1} y={y} width={w2} height={h} fill="#a78bfa" />
        <rect x={x + w1 + w2} y={y} width={w3} height={h} fill="#fb7185" />
        <rect x={x} y={y} width={w} height={h} rx="6" fill="none" stroke="#334155" strokeWidth="2.5" />
        <line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} stroke="#fff" strokeWidth="2.5" strokeDasharray="12 10" />
      </g>
      {/* ป้าย */}
      <g fontSize="12" fontWeight="800">
        <text x={x + w1 / 2} y={y + h + 18} fill="#2563eb" textAnchor="middle">วันแรก</text>
        <SvgFrac x={x + w1 / 2} y={y + h + 32} n={2} d={5} size={12} fill="#2563eb" />
        <text x={x + w1 + w2 / 2} y={y + h + 18} fill="#7c3aed" textAnchor="middle">วันสอง</text>
        <SvgFrac x={x + w1 + w2 / 2} y={y + h + 32} n={1} d={2} size={12} fill="#7c3aed" />
        <text x={x + w1 + w2 + w3 / 2 + 6} y={y - 8} fill="#e11d48" textAnchor="middle">เหลือ?</text>
      </g>
    </svg>
  );
}

function Thumb9() {
  // เศษส่วนของที่เหลือ — 2 แถบ: ทั้งหมด(เช้า/ที่เหลือ) → ซูมที่เหลือ(บ่าย/เหลือ)
  const x = 26, w = 210;
  return (
    <svg viewBox="0 0 320 190" className="h-full w-full" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ตัวอย่างโจทย์เศษส่วนของที่เหลือ">
      <rect width="320" height="190" fill="#fdf4ff" />
      <rect x="14" y="14" width="176" height="26" rx="13" fill="#c026d3" />
      <text x="30" y="32" fontSize="14" fontWeight="800" fill="#fff">บ่ายขายได้กี่ กก.?</text>
      {/* แถบ 1: ทั้งหมด 90 */}
      <text x={x} y={62} fontSize="11" fontWeight="800" fill="#64748b">ทั้งหมด 90 กก.</text>
      <g>
        <rect x={x} y={68} width={w * 0.20} height={26} fill="#fbbf24" />
        <rect x={x + w * 0.20} y={68} width={w * 0.80} height={26} fill="#cbd5e1" />
        <rect x={x} y={68} width={w} height={26} rx="5" fill="none" stroke="#334155" strokeWidth="2" />
        <text x={x + w * 0.10} y={85} fontSize="10" fontWeight="800" fill="#fff" textAnchor="middle">เช้า</text>
        <text x={x + w * 0.60} y={85} fontSize="10" fontWeight="800" fill="#475569" textAnchor="middle">เหลือ 72</text>
      </g>
      {/* ลูกศรลง */}
      <path d={`M${x + w * 0.60} 98 l0 14 l-5 -5 m5 5 l5 -5`} stroke="#c026d3" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* แถบ 2: ซูมที่เหลือ 72 */}
      <text x={x} y={128} fontSize="11" fontWeight="800" fill="#a21caf">ที่เหลือ 72 กก. (บ่ายขาย 2/3 ของนี่)</text>
      <g>
        <rect x={x} y={134} width={w * 0.667} height={30} fill="#e879f9" />
        <rect x={x + w * 0.667} y={134} width={w * 0.333} height={30} fill="#cbd5e1" />
        <rect x={x} y={134} width={w} height={30} rx="5" fill="none" stroke="#a21caf" strokeWidth="2" />
        <text x={x + w * 0.33} y={149} fontSize="11" fontWeight="800" fill="#fff" textAnchor="middle">บ่าย =</text>
        <text x={x + w * 0.33} y={161} fontSize="12" fontWeight="900" fill="#fff" textAnchor="middle">?</text>
      </g>
    </svg>
  );
}

export function WPThumb({ id }: { id: WPId }) {
  if (id === "compare-order") return <Thumb1 />;
  if (id === "rank-statement") return <Thumb2 />;
  if (id === "order-choice") return <Thumb3 />;
  if (id === "compare-statement") return <Thumb4 />;
  if (id === "remainder-area") return <Thumb5 />;
  if (id === "max-expression") return <Thumb6 />;
  if (id === "find-whole") return <Thumb7 />;
  if (id === "remaining-work") return <Thumb8 />;
  return <Thumb9 />;
}
