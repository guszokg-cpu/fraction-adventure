"use client";

/* ─────────────────────────────────────────────────────────────
   ฉากหลังหมู่บ้านไทยสไตล์ Cozy Thailand (SVG วาดเอง ใช้ซ้ำได้ทุกเกม)
   วางเป็น layer หลังฉากเกม: <ThaiBackdrop variant="village" />
   มี 3 บรรยากาศ: village (ท่ารถ) · noodle (ร้านริมทาง) · checkpoint (ชนบท/นาข้าว)
   ───────────────────────────────────────────────────────────── */

type Variant = "village" | "noodle" | "checkpoint";

/* ── ชิ้นส่วนประกอบฉาก ── */

function Cloud({ x, y, s = 1, drift = 0 }: { x: number; y: number; s?: number; drift?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} className="tsc-cloud" style={{ animationDelay: `${drift}s` }}>
      <ellipse cx={0} cy={0} rx={26} ry={11} fill="#ffffff" opacity={0.9} />
      <ellipse cx={18} cy={-6} rx={16} ry={9} fill="#ffffff" opacity={0.85} />
      <ellipse cx={-18} cy={-4} rx={14} ry={8} fill="#ffffff" opacity={0.85} />
    </g>
  );
}

function CoconutTree({ x, y, s = 1, flip = false }: { x: number; y: number; s?: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`}>
      {/* ลำต้นโค้ง */}
      <path d="M0,0 C4,-28 2,-58 14,-84" stroke="#8a6a42" strokeWidth={7} fill="none" strokeLinecap="round" />
      <path d="M0,0 C4,-28 2,-58 14,-84" stroke="#a9895c" strokeWidth={3.4} fill="none" strokeLinecap="round" strokeDasharray="2.5 5" />
      {/* ใบ */}
      {[-80, -45, -12, 24, 58, 92].map((deg, i) => (
        <path key={i} d="M14,-84 Q34,-96 56,-88 Q36,-84 24,-76 Z" fill={i % 2 ? "#3e8e4f" : "#57a866"}
          transform={`rotate(${deg} 14 -84)`} />
      ))}
      {/* ลูกมะพร้าว */}
      <circle cx={10} cy={-80} r={4.5} fill="#7c5a30" />
      <circle cx={19} cy={-78} r={4.5} fill="#8f6a3a" />
      {/* พุ่มหญ้าโคน */}
      <ellipse cx={0} cy={2} rx={14} ry={5} fill="#6aa86f" />
    </g>
  );
}

function BananaTree({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <path d="M0,0 L0,-34" stroke="#7ba05a" strokeWidth={6} strokeLinecap="round" />
      {[[-58, "#4f9e5a"], [-20, "#63b06e"], [16, "#4f9e5a"], [52, "#63b06e"]].map(([deg, c], i) => (
        <path key={i} d="M0,-34 Q16,-52 34,-50 Q18,-40 8,-30 Z" fill={c as string} transform={`rotate(${deg} 0 -34)`} />
      ))}
      <ellipse cx={0} cy={1} rx={10} ry={4} fill="#6aa86f" />
    </g>
  );
}

/* เรือนไทยใต้ถุนสูง หลังคาจั่ว */
function ThaiHouse({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {/* เสาใต้ถุน */}
      {[8, 30, 58, 80].map((px) => <rect key={px} x={px} y={-26} width={5} height={26} fill="#6d4e2a" />)}
      {/* ตัวเรือนไม้ */}
      <rect x={2} y={-58} width={90} height={34} rx={2} fill="#a9713d" stroke="#7c4f24" strokeWidth={1.6} />
      <rect x={2} y={-58} width={90} height={7} fill="#c08a52" opacity={0.8} />
      {/* หน้าต่าง */}
      <rect x={14} y={-50} width={14} height={18} rx={1.5} fill="#5d3d1e" />
      <rect x={62} y={-50} width={14} height={18} rx={1.5} fill="#5d3d1e" />
      <rect x={40} y={-52} width={16} height={28} rx={1.5} fill="#4d3117" />
      {/* หลังคาจั่ว + กาแล */}
      <path d="M-6,-58 L47,-92 L100,-58 L88,-58 L47,-84 L6,-58 Z" fill="#a63a2e" stroke="#7c261e" strokeWidth={1.6} />
      <path d="M-6,-58 L47,-92 L100,-58" fill="none" stroke="#7c261e" strokeWidth={3} strokeLinecap="round" />
      <path d="M41,-90 L47,-99 M53,-90 L47,-99" stroke="#7c261e" strokeWidth={2.4} strokeLinecap="round" />
      {/* บันได */}
      <path d="M86,-24 L98,0 M92,-24 L104,0" stroke="#6d4e2a" strokeWidth={3} />
    </g>
  );
}

/* วัดไทย: เจดีย์ทอง + หลังคาซ้อน */
function Temple({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {/* โบสถ์ */}
      <rect x={-34} y={-40} width={68} height={40} fill="#f5efdf" stroke="#cbb98a" strokeWidth={1.4} />
      <rect x={-9} y={-30} width={18} height={30} rx={2} fill="#8a5a28" />
      <path d="M-44,-40 L0,-64 L44,-40 L34,-40 L0,-58 L-34,-40 Z" fill="#c23a2a" stroke="#8f261a" strokeWidth={1.4} />
      <path d="M-32,-52 L0,-72 L32,-52 L24,-52 L0,-66 L-24,-52 Z" fill="#d9482f" stroke="#8f261a" strokeWidth={1.2} />
      <path d="M0,-72 L0,-84 M-3,-80 L0,-84 L3,-80" stroke="#e8b83a" strokeWidth={2.4} strokeLinecap="round" fill="none" />
      {/* เจดีย์ */}
      <g transform="translate(58,0)">
        <rect x={-13} y={-16} width={26} height={16} fill="#e8ce8a" stroke="#bfa050" strokeWidth={1.2} />
        <path d="M-13,-16 L-8,-30 L8,-30 L13,-16 Z" fill="#f0d896" stroke="#bfa050" strokeWidth={1.2} />
        <path d="M-8,-30 Q0,-58 0,-70 Q0,-58 8,-30 Z" fill="#e8b83a" stroke="#bf8f2a" strokeWidth={1.2} />
        <circle cx={0} cy={-71} r={2.4} fill="#f5d76a" />
      </g>
    </g>
  );
}

/* ศาลาไทย (ป้ายรอรถ) */
function Sala({ x, y, s = 1, sign }: { x: number; y: number; s?: number; sign?: string }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <rect x={4} y={-42} width={5} height={42} fill="#7c5a30" />
      <rect x={63} y={-42} width={5} height={42} fill="#7c5a30" />
      <rect x={0} y={-50} width={72} height={9} rx={2} fill="#b0722f" />
      <path d="M-8,-50 L36,-72 L80,-50 L70,-50 L36,-66 L2,-50 Z" fill="#a63a2e" stroke="#7c261e" strokeWidth={1.5} />
      <rect x={10} y={-20} width={52} height={5} rx={2} fill="#9a6a3a" />
      {sign && (
        <g>
          <rect x={14} y={-40} width={44} height={13} rx={3} fill="#2f5f8f" stroke="#1e3f60" strokeWidth={1.2} />
          <text x={36} y={-30.5} fontSize={8} fontWeight={900} fill="#fff" textAnchor="middle">{sign}</text>
        </g>
      )}
    </g>
  );
}

/* แปลงนาข้าว */
function RicePaddy({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={60} ry={13} fill="#b8d48a" stroke="#8fb35e" strokeWidth={1.4} />
      {[-40, -20, 0, 20, 40].map((px) => (
        <g key={px}>
          <path d={`M${px},4 L${px - 3},-8 M${px},4 L${px},-10 M${px},4 L${px + 3},-8`} stroke="#5f8f3a" strokeWidth={1.8} strokeLinecap="round" />
          <circle cx={px} cy={-9} r={1.5} fill="#e8ce6a" />
        </g>
      ))}
    </g>
  );
}

function FlowerBush({ x, y, s = 1, tone = "#f472b6" }: { x: number; y: number; s?: number; tone?: string }) {
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <ellipse cx={0} cy={0} rx={16} ry={9} fill="#4f9e5a" />
      <ellipse cx={-9} cy={-4} rx={9} ry={7} fill="#63b06e" />
      <ellipse cx={9} cy={-4} rx={9} ry={7} fill="#57a866" />
      {[[-10, -6], [0, -9], [9, -5]].map(([fx, fy], i) => (
        <circle key={i} cx={fx} cy={fy} r={2.6} fill={tone} stroke="#fff" strokeWidth={0.8} />
      ))}
    </g>
  );
}

/* โคมไฟกระดาษแขวน (ร้านอาหาร) */
function Lantern({ x, y, tone = "#e35d3a", delay = 0 }: { x: number; y: number; tone?: string; delay?: number }) {
  return (
    <g transform={`translate(${x},${y})`} className="tsc-sway" style={{ animationDelay: `${delay}s`, transformOrigin: `${0}px ${-14}px` }}>
      <line x1={0} y1={-14} x2={0} y2={-6} stroke="#7c4f24" strokeWidth={1.4} />
      <ellipse cx={0} cy={4} rx={8} ry={10} fill={tone} stroke="#00000025" strokeWidth={1} />
      <ellipse cx={-2.5} cy={2} rx={2.5} ry={6} fill="#ffffff44" />
      <rect x={-3} y={13} width={6} height={3} rx={1} fill="#e8b83a" />
    </g>
  );
}

/* ── ฉากหลังหลัก ── */

export function ThaiBackdrop({ variant }: { variant: Variant }) {
  return (
    <svg viewBox="0 0 800 300" preserveAspectRatio="xMidYMax slice" className="absolute inset-0 h-full w-full" aria-hidden>
      <defs>
        <linearGradient id={`tsc-sky-${variant}`} x1="0" y1="0" x2="0" y2="1">
          {variant === "noodle" ? (
            <>
              <stop offset="0" stopColor="#ffe3bd" />
              <stop offset="0.7" stopColor="#ffd9a8" />
              <stop offset="1" stopColor="#f8ecd4" />
            </>
          ) : (
            <>
              <stop offset="0" stopColor="#bfe3f5" />
              <stop offset="0.75" stopColor="#e4f2e8" />
              <stop offset="1" stopColor="#f8f0d8" />
            </>
          )}
        </linearGradient>
      </defs>
      <style>{`
        @keyframes tscCloud { 0%,100% { transform: translateX(0); } 50% { transform: translateX(16px); } }
        .tsc-cloud { animation: tscCloud 9s ease-in-out infinite; }
        @keyframes tscSway { 0%,100% { transform: rotate(-5deg); } 50% { transform: rotate(5deg); } }
        .tsc-sway { animation: tscSway 2.6s ease-in-out infinite; }
      `}</style>

      {/* ท้องฟ้า */}
      <rect x={0} y={0} width={800} height={300} fill={`url(#tsc-sky-${variant})`} />
      <Cloud x={130} y={44} s={1} />
      <Cloud x={430} y={30} s={0.8} drift={2} />
      <Cloud x={680} y={56} s={1.1} drift={4.5} />

      {/* ภูเขาไกล */}
      <path d="M0,190 Q90,120 190,178 Q260,132 360,182 L360,300 L0,300 Z" fill="#a8cfa4" opacity={0.75} />
      <path d="M300,196 Q420,116 540,186 Q640,136 800,192 L800,300 L300,300 Z" fill="#8fbe95" opacity={0.75} />

      {variant === "village" && (
        <>
          <Temple x={640} y={210} s={0.9} />
          <ThaiHouse x={60} y={214} s={0.85} />
          <CoconutTree x={230} y={216} s={0.95} />
          <CoconutTree x={585} y={218} s={0.75} flip />
          <BananaTree x={745} y={218} s={0.9} />
          <Sala x={330} y={216} s={1} sign="ป้ายรถสองแถว" />
          <FlowerBush x={190} y={222} s={1} />
          <FlowerBush x={475} y={224} s={0.9} tone="#facc15" />
        </>
      )}

      {variant === "noodle" && (
        <>
          <ThaiHouse x={620} y={212} s={0.8} />
          <BananaTree x={70} y={218} s={1.05} />
          <BananaTree x={755} y={216} s={0.85} />
          <CoconutTree x={140} y={214} s={0.85} />
          {/* ราวโคมไฟหน้าร้าน */}
          <line x1={160} y1={30} x2={660} y2={30} stroke="#7c4f24" strokeWidth={3} />
          <Lantern x={215} y={44} />
          <Lantern x={340} y={44} tone="#e8b83a" delay={0.6} />
          <Lantern x={470} y={44} delay={1.2} />
          <Lantern x={600} y={44} tone="#e8b83a" delay={1.8} />
          <FlowerBush x={690} y={224} s={1} />
        </>
      )}

      {variant === "checkpoint" && (
        <>
          <RicePaddy x={120} y={218} s={1} />
          <RicePaddy x={680} y={222} s={0.9} />
          <CoconutTree x={260} y={214} s={0.9} />
          <CoconutTree x={560} y={216} s={0.8} flip />
          <ThaiHouse x={660} y={208} s={0.7} />
          <FlowerBush x={370} y={224} s={0.9} tone="#facc15" />
        </>
      )}

      {/* พื้นถนนดินลูกรัง */}
      <rect x={0} y={228} width={800} height={72} fill="#dcbb8a" />
      <rect x={0} y={228} width={800} height={6} fill="#c9a26a" />
      <ellipse cx={170} cy={262} rx={26} ry={4} fill="#c9a26a" opacity={0.7} />
      <ellipse cx={470} cy={276} rx={34} ry={5} fill="#c9a26a" opacity={0.6} />
      <ellipse cx={680} cy={256} rx={22} ry={4} fill="#c9a26a" opacity={0.7} />
    </svg>
  );
}
