"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Volume2, VolumeX, FlaskConical, Target, ArrowRight, Eye, EyeOff, Pencil } from "lucide-react";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { cn } from "@/lib/cn";
import { randInt, shuffle } from "@/lib/randomFraction";

/* ── ค่าคงที่ ── */

const DEN_OPTIONS = [2, 3, 4, 5, 6, 8];
const MISSIONS_TOTAL = 8;
const ENTER_X = 106; // นอกจอด้านขวา (ลูกค้าเดินเข้ามา)
const STAND_X = 71;  // จุดยืนหน้าเคาน์เตอร์ (เห็นเต็มตัว)

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/* ── จำนวนคละ (เศษส่วนแบบตั้ง) ── */

function MixedNum({ w, n, den, size = "md", tone }: { w: number; n: number; den: number; size?: "sm" | "md" | "lg"; tone: string }) {
  const wholeCls = size === "lg" ? "text-4xl sm:text-5xl" : size === "md" ? "text-3xl" : "text-xl";
  const fracCls = size === "lg" ? "text-xl sm:text-2xl" : size === "md" ? "text-lg" : "text-sm";
  if (w === 0 && n === 0) return <span className={cn("font-black", wholeCls, tone)}>0</span>;
  return (
    <span className={cn("inline-flex items-center gap-1.5", tone)}>
      {w > 0 && <span className={cn("font-black", wholeCls)}>{w}</span>}
      {n > 0 && <StackedFraction numerator={n} denominator={den} className={fracCls} toneClassName={tone} />}
    </span>
  );
}

/* ── ผู้ขาย: เด็กนักเรียนสวมหมวกเชฟ ── */

type Hair = "short" | "ponytail" | "topknot" | "braids" | "bob";
const SELLERS = [
  { name: "น้องภูมิ", skin: "#fcd9b8", hair: "#2d2013", hairStyle: "short" as Hair, accent: "#3b82f6" },
  { name: "น้องแนน", skin: "#ffe0c4", hair: "#3b2412", hairStyle: "ponytail" as Hair, accent: "#ef4444" },
  { name: "น้องเจได", skin: "#f5cba3", hair: "#1c1c1c", hairStyle: "topknot" as Hair, accent: "#f59e0b" },
  { name: "น้องพลอย", skin: "#ffd9c9", hair: "#4a2e18", hairStyle: "braids" as Hair, accent: "#ec4899" },
  { name: "น้องมายด์", skin: "#fbe3cf", hair: "#2b1d10", hairStyle: "bob" as Hair, accent: "#facc15" },
];
type Seller = typeof SELLERS[number];

function ChefKid({ kid, mood, size = 88 }: { kid: Seller; mood: "normal" | "happy"; size?: number }) {
  return (
    <svg viewBox="0 0 44 62" width={size * 0.71} height={size} role="img" aria-label={`ผู้ขาย ${kid.name}`}>
      <rect x={12} y={8} width={20} height={17} rx={5} fill={kid.skin} stroke="#00000022" strokeWidth={1} />
      <rect x={13} y={1} width={18} height={9} rx={4} fill="#fff" stroke="#cbd5e1" strokeWidth={1.3} />
      <rect x={13} y={7} width={18} height={4} fill="#fff" stroke="#cbd5e1" strokeWidth={1.3} />
      {kid.hairStyle === "ponytail" && <rect x={29} y={16} width={4} height={7} rx={2} fill={kid.hair} />}
      <rect x={17} y={14.5} width={3} height={4} rx={1} fill="#1e293b" />
      <rect x={24} y={14.5} width={3} height={4} rx={1} fill="#1e293b" />
      {mood === "happy"
        ? <path d="M18,20.5 Q22,23 26,20.5" stroke="#1e293b" strokeWidth={1.5} fill="none" strokeLinecap="round" />
        : <path d="M18,20 Q22,22 26,20" stroke="#1e293b" strokeWidth={1.4} fill="none" strokeLinecap="round" />}
      <rect x={13} y={25} width={18} height={17} rx={3} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={1.4} />
      <rect x={17} y={28} width={10} height={11} rx={1.5} fill={kid.accent} opacity={0.85} />
      <rect x={6} y={25} width={5} height={13} rx={2.5} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={1.2} />
      <circle cx={7.5} cy={38} r={2.6} fill={kid.skin} />
      <rect x={33} y={25} width={5} height={13} rx={2.5} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={1.2} />
      <circle cx={35.5} cy={38} r={2.6} fill={kid.skin} />
      <rect x={15} y={41} width={5.5} height={14} rx={2} fill="#8a5a2e" />
      <rect x={23.5} y={41} width={5.5} height={14} rx={2} fill="#8a5a2e" />
      <rect x={14} y={54} width={7.5} height={4} rx={1.5} fill="#334155" />
      <rect x={22.5} y={54} width={7.5} height={4} rx={1.5} fill="#334155" />
    </svg>
  );
}

/* ── ลูกค้าพิกเซล 5 คน ── */

type VType = "farmer" | "auntie" | "grandpa" | "boy" | "traveler";
const VILLAGERS: { type: VType; name: string; skin: string; body: string; dark: string; hat: string }[] = [
  { type: "farmer", name: "ลุงสมชาย", skin: "#e8b688", body: "#7c9a5c", dark: "#3f5228", hat: "#d4a24c" },
  { type: "auntie", name: "ป้าสมศรี", skin: "#f0c9a0", body: "#c15a5a", dark: "#7a2e2e", hat: "#8a5a2e" },
  { type: "grandpa", name: "คุณตาบุญมี", skin: "#e0bd97", body: "#5c6b8a", dark: "#2e3752", hat: "#e2e8f0" },
  { type: "boy", name: "หนูเอก", skin: "#f2cca5", body: "#4a7fb5", dark: "#254060", hat: "#f2cca5" },
  { type: "traveler", name: "พี่กล้า", skin: "#dcae82", body: "#6b7a3f", dark: "#3a4522", hat: "#4a5a2a" },
];
type Villager = typeof VILLAGERS[number];
type VMood = "walk" | "ask" | "happy";

const SS = { shapeRendering: "crispEdges" as const };

function PixelVillager({ v, mood, size = 96, walking = false, facing = 1 }: { v: Villager; mood: VMood; size?: number; walking?: boolean; facing?: 1 | -1 }) {
  const happy = mood === "happy";
  return (
    <svg viewBox="0 0 40 56" width={size * 0.71} height={size} style={{ ...SS, transform: facing === -1 ? "scaleX(-1)" : undefined }} className={cn(walking && "pv-bob")} role="img" aria-label={`ชาวบ้าน ${v.name}`}>
      <rect x={9} y={5} width={22} height={18} rx={5} fill={v.skin} stroke="#2a1c10" strokeWidth={1.6} />
      <rect x={13} y={13} width={3.5} height={4.5} rx={1} fill="#1e1207" />
      <rect x={23.5} y={13} width={3.5} height={4.5} rx={1} fill="#1e1207" />
      {happy
        ? <path d="M15,18.5 Q20,21.5 25,18.5" stroke="#1e1207" strokeWidth={1.6} fill="none" strokeLinecap="round" />
        : <path d="M16,19 L24,19" stroke="#1e1207" strokeWidth={1.5} strokeLinecap="round" />}
      {v.type === "farmer" && <>
        <path d="M6,10 Q6,6 20,6 Q34,6 34,10 L34,12 L6,12 Z" fill={v.hat} stroke="#2a1c10" strokeWidth={1.5} />
        <ellipse cx={20} cy={12} rx={17} ry={3} fill={v.hat} stroke="#2a1c10" strokeWidth={1.5} />
      </>}
      {v.type === "auntie" && <>
        <circle cx={20} cy={5} r={4.5} fill={v.dark} stroke="#2a1c10" strokeWidth={1.3} />
        <path d="M9,12 Q9,4 20,4 Q31,4 31,12 L31,10 Q26,7 20,7 Q14,7 9,10 Z" fill={v.dark} />
      </>}
      {v.type === "grandpa" && <>
        <path d="M9,11 Q9,3 20,3 Q31,3 31,11 L31,9 Q26,6 20,6 Q14,6 9,9 Z" fill="#e8e8e8" stroke="#2a1c10" strokeWidth={1} />
        <path d="M14,22 Q20,25 26,22" stroke="#e8e8e8" strokeWidth={2} fill="none" strokeLinecap="round" />
      </>}
      {v.type === "boy" && <>
        <path d="M10,11 Q10,3 20,3 Q30,3 30,11 L30,9 Q25,6 20,6 Q15,6 10,9 Z" fill="#5a3a1e" />
        <rect x={17} y={1} width={3} height={4} rx={1.2} fill="#22c55e" />
      </>}
      {v.type === "traveler" && <path d="M7,11 Q10,4 20,4 Q30,4 33,11 L33,13 L7,13 Z" fill={v.hat} stroke="#2a1c10" strokeWidth={1.5} />}
      <rect x={10} y={23} width={20} height={18} rx={3} fill={v.body} stroke="#2a1c10" strokeWidth={1.6} />
      {v.type === "farmer" && <rect x={14} y={27} width={12} height={10} rx={1} fill="#c9a26b" opacity={0.5} />}
      {v.type === "auntie" && <rect x={13} y={31} width={14} height={9} rx={1} fill="#fdf6ec" opacity={0.85} />}
      {v.type === "traveler" && <rect x={22} y={25} width={9} height={13} rx={2} fill="#3a4522" stroke="#2a1c10" strokeWidth={1.3} />}
      <g className={walking ? "pv-arm1" : undefined} style={{ transformOrigin: "8px 25px" }}>
        <rect x={4} y={23} width={6} height={13} rx={2.5} fill={v.body} stroke="#2a1c10" strokeWidth={1.4} />
      </g>
      <g className={walking ? "pv-arm2" : undefined} style={{ transformOrigin: "32px 25px" }}>
        <rect x={30} y={23} width={6} height={13} rx={2.5} fill={v.body} stroke="#2a1c10" strokeWidth={1.4} />
      </g>
      {v.type === "grandpa" && <line x1={9} y1={40} x2={7} y2={53} stroke="#8a5a2e" strokeWidth={2} strokeLinecap="round" />}
      <g className={walking ? "pv-leg1" : undefined} style={{ transformOrigin: "15px 41px" }}>
        <rect x={12} y={41} width={6.5} height={13} rx={2} fill={v.dark} stroke="#2a1c10" strokeWidth={1.3} />
      </g>
      <g className={walking ? "pv-leg2" : undefined} style={{ transformOrigin: "25px 41px" }}>
        <rect x={21.5} y={41} width={6.5} height={13} rx={2} fill={v.dark} stroke="#2a1c10" strokeWidth={1.3} />
      </g>
    </svg>
  );
}

/* ── บอลลูนคำพูด ── */

function SpeechBubble({ children, tone }: { children: React.ReactNode; tone: string }) {
  return (
    <div className={cn("relative whitespace-nowrap rounded-xl border-2 bg-white px-3 py-1.5 text-sm font-extrabold shadow-md", tone)}>
      {children}
      <span className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b-2 border-r-2 bg-white" style={{ borderColor: "inherit" }} />
    </div>
  );
}

/* ── เค้ก 3D (มองเฉียง มีความหนา ครีม สตรอว์เบอร์รี แบ่งชิ้นชัด) ── */

function Strawberry({ x, y, r = 4 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <path d={`M${x - r},${y - r * 0.4} Q${x - r},${y + r * 1.5} ${x},${y + r * 1.7} Q${x + r},${y + r * 1.5} ${x + r},${y - r * 0.4} Q${x},${y - r} ${x - r},${y - r * 0.4} Z`} fill="#ef4444" stroke="#b91c1c" strokeWidth={0.7} />
      <path d={`M${x - r * 0.9},${y - r * 0.4} L${x - r * 0.2},${y - r * 1.5} L${x + r * 0.2},${y - r * 0.7} L${x + r * 0.9},${y - r * 1.5} L${x + r * 0.9},${y - r * 0.4} Z`} fill="#22c55e" stroke="#15803d" strokeWidth={0.5} />
      {[[-0.35, 0.25], [0.35, 0.35], [0, 0.8], [-0.4, 0.9], [0.4, 0.9]].map(([dx, dy], i) => <circle key={i} cx={x + dx * r} cy={y + dy * r} r={0.55} fill="#fef3c7" />)}
    </g>
  );
}

function Cake3D({ den, have, size = 100, whole = false, showLabel = true }: { den: number; have: number; size?: number; whole?: boolean; showLabel?: boolean }) {
  const W = 132, H = 116;
  const cx = 66, cy = 42, rx = 56, ry = 25, h = 32;
  const pt = (k: number) => { const a = (k / den) * 2 * Math.PI - Math.PI / 2; return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)] as const; };
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={size} height={size * H / W} role="img" aria-label={whole ? "เค้กเต็มก้อน" : `เค้ก ${have}/${den} ส่วน`}>
      <ellipse cx={cx} cy={cy + h + 9} rx={rx * 0.9} ry={7} fill="#00000015" />
      {/* ด้านข้าง: สปันจ์ + ชั้นแยม */}
      <path d={`M${cx - rx},${cy} L${cx - rx},${cy + h} A${rx},${ry} 0 0 0 ${cx + rx},${cy + h} L${cx + rx},${cy} A${rx},${ry} 0 0 1 ${cx - rx},${cy} Z`} fill="#f3c65a" stroke="#b45309" strokeWidth={2} />
      <path d={`M${cx - rx},${cy + h * 0.44} A${rx},${ry} 0 0 0 ${cx + rx},${cy + h * 0.44} L${cx + rx},${cy + h * 0.66} A${rx},${ry} 0 0 1 ${cx - rx},${cy + h * 0.66} Z`} fill="#f472b6" opacity={0.92} />
      {/* ครีมย้อยขอบบน */}
      <path d={`M${cx - rx},${cy} A${rx},${ry} 0 0 0 ${cx + rx},${cy} L${cx + rx},${cy + 5} Q${cx + rx * 0.55},${cy + 13} ${cx + rx * 0.15},${cy + 6} Q${cx - rx * 0.25},${cy + 13} ${cx - rx * 0.6},${cy + 6} Q${cx - rx * 0.88},${cy + 12} ${cx - rx},${cy + 5} Z`} fill="#fffaf0" stroke="#ead7b6" strokeWidth={0.8} />
      {/* หน้าเค้ก */}
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#ffe9a6" stroke="#b45309" strokeWidth={2} />
      {/* หน้าเค้กแบ่งชิ้น — ชิ้นที่ขาย/หายเป็นช่องว่างเส้นประชัด */}
      {Array.from({ length: den }, (_, i) => {
        const [x1, y1] = pt(i);
        const [x2, y2] = pt(i + 1);
        const filled = whole || i < have;
        return <path key={i} d={`M${cx},${cy} L${x1},${y1} A${rx},${ry} 0 0 1 ${x2},${y2} Z`} fill={filled ? "#ffdd78" : "#eee0c4"} stroke={filled ? "#d98a1e" : "#b7995f"} strokeWidth={filled ? 1.1 : 1.5} strokeDasharray={filled ? undefined : "4 3"} opacity={filled ? 1 : 0.92} />;
      })}
      {/* ครีม + สตรอว์เบอร์รี วางเฉพาะชิ้นที่มีจริง */}
      {Array.from({ length: whole ? den : have }, (_, i) => {
        const a = ((i + 0.5) / den) * 2 * Math.PI - Math.PI / 2;
        const sx = cx + rx * 0.5 * Math.cos(a);
        const sy = cy + ry * 0.5 * Math.sin(a);
        return <g key={i}><circle cx={sx} cy={sy} r={4.6} fill="#fff" stroke="#ead7b6" strokeWidth={0.7} /><Strawberry x={sx} y={sy - 3} r={3.3} /></g>;
      })}
      {/* ป้ายเศษ */}
      {showLabel && !whole && (
        <g><rect x={cx - 15} y={cy + h - 3} width={30} height={15} rx={4} fill="#fff" stroke="#b45309" strokeWidth={1.2} /><text x={cx} y={cy + h + 8} fontSize={11} fontWeight={900} fill="#b45309" textAnchor="middle">{have}/{den}</text></g>
      )}
    </svg>
  );
}

/* ── ฉากร้านขนม ── */

function ShopScene({ seller, sellerName, den, haveW, haveN, custX, custFacing, custWalking, cust, custName, custMood, sellerMood, askW, askN, gotW, gotN, arrived, fly, showArrow }: {
  seller: Seller; sellerName: string; den: number; haveW: number; haveN: number;
  custX: number; custFacing: 1 | -1; custWalking: boolean; cust: Villager; custName: string; custMood: VMood; sellerMood: "normal" | "happy";
  askW: number; askN: number; gotW: number; gotN: number; arrived: boolean; fly: { key: number; type: "whole" | "slice" } | null; showArrow: boolean;
}) {
  return (
    <div className="relative h-[360px] overflow-hidden rounded-2xl border-2 border-amber-300" style={SS}>
      <style>{`
        @keyframes pvBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        .pv-bob { animation: pvBob 0.28s steps(2) infinite; }
        @keyframes pvLeg { 0%,100% { transform: rotate(-18deg); } 50% { transform: rotate(18deg); } }
        .pv-leg1 { animation: pvLeg 0.28s steps(2) infinite; }
        .pv-leg2 { animation: pvLeg 0.28s steps(2) infinite reverse; }
        @keyframes pvArm { 0%,100% { transform: rotate(14deg); } 50% { transform: rotate(-14deg); } }
        .pv-arm1 { animation: pvArm 0.28s steps(2) infinite; }
        .pv-arm2 { animation: pvArm 0.28s steps(2) infinite reverse; }
        @keyframes cakeFly { 0% { transform: translate(0,0) scale(1) rotate(0); opacity: 1; } 80% { opacity: 1; } 100% { transform: translate(210px,-4px) scale(0.5) rotate(22deg); opacity: 0; } }
        .cake-fly { animation: cakeFly 0.5s ease-in forwards; }
        @keyframes arrowPulse { 0%,100% { transform: translateX(0); opacity: .6; } 50% { transform: translateX(6px); opacity: 1; } }
        .arrow-pulse { animation: arrowPulse 0.8s ease-in-out infinite; }
        @keyframes sparkle { 0% { transform: scale(0.3); opacity: 0; } 50% { opacity: 1; } 100% { transform: scale(1.3); opacity: 0; } }
        .sparkle { animation: sparkle 0.6s ease-out forwards; }
      `}</style>
      {/* ฟ้า */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-sky-100 to-amber-50" />
      <div className="pointer-events-none absolute left-4 top-2 text-2xl opacity-60">☁️</div>
      <div className="pointer-events-none absolute right-6 top-3 text-xl opacity-50">☁️</div>
      {/* กันสาดลายชมพู + ป้าย */}
      <div className="absolute inset-x-0 top-9" style={{ height: 26, background: "repeating-linear-gradient(90deg,#f9a8c4 0 20px,#fff 20px 40px)", clipPath: "polygon(0 0,100% 0,100% 45%,95% 100%,90% 45%,85% 100%,80% 45%,75% 100%,70% 45%,65% 100%,60% 45%,55% 100%,50% 45%,45% 100%,40% 45%,35% 100%,30% 45%,25% 100%,20% 45%,15% 100%,10% 45%,5% 100%,0 45%)" }} />
      <div className="absolute left-1/2 top-1 -translate-x-1/2 rounded-lg border-2 border-amber-900 bg-amber-50 px-4 py-1 text-base font-extrabold text-amber-900 shadow">🎂 ร้านขนม</div>
      {/* ผนังร้าน (เต็มถึงเคาน์เตอร์) */}
      <div className="absolute inset-x-0" style={{ top: 35, bottom: 100, background: "linear-gradient(180deg,#f7eee2,#eddcc6)" }} />
      {/* บัวไม้ล่างผนัง */}
      <div className="absolute inset-x-0" style={{ bottom: 100, height: 20, background: "linear-gradient(180deg,#c58a52,#a06636)", borderTop: "2px solid #7c4a1e" }} />
      {/* โคมไฟแขวน */}
      {[28, 72].map((x) => (
        <div key={x} className="absolute flex flex-col items-center" style={{ top: 35, left: `${x}%`, transform: "translateX(-50%)" }}>
          <div className="h-3 w-[2px] bg-slate-500" />
          <div className="h-4 w-7 rounded-b-[14px] bg-gradient-to-b from-amber-200 to-amber-500 shadow-[0_3px_8px_rgba(251,191,36,0.55)]" />
        </div>
      ))}
      {/* หน้าต่างมองออกไปข้างนอก */}
      <div className="absolute overflow-hidden rounded-md border-[5px] border-amber-800 shadow" style={{ top: 52, left: "3.5%", width: 60, height: 48, background: "linear-gradient(180deg,#bfe3f7,#e8f6ff)" }}>
        <div className="absolute bottom-0 h-3 w-full bg-emerald-300/60" />
        <div className="absolute left-2 top-2 h-3.5 w-3.5 rounded-full bg-white/70" />
        <div className="absolute left-1/2 top-0 h-full w-[3px] -translate-x-1/2 bg-amber-800" />
        <div className="absolute left-0 top-1/2 h-[3px] w-full -translate-y-1/2 bg-amber-800" />
      </div>
      {/* ชั้นวางขนม + ขนม */}
      <div className="absolute flex items-end justify-center gap-2 text-xl" style={{ top: 46, left: "24%", width: "38%" }}>🧁🍰🥧🧁🍩</div>
      <div className="absolute rounded-sm" style={{ top: 68, left: "23%", width: "40%", height: 7, background: "linear-gradient(180deg,#a86f3e,#7c4a1e)", boxShadow: "0 3px 4px #00000022" }} />
      {/* กระดานเมนู */}
      <div className="absolute flex flex-col items-center rounded-md border-[3px] border-amber-900 bg-emerald-800 px-1 py-1 shadow" style={{ top: 50, right: "4%", width: 60, height: 48 }}>
        <span className="text-[9px] font-extrabold text-amber-100">เมนู 🍰</span>
        <div className="mt-1 w-full space-y-1 px-1.5">
          <div className="h-[2px] w-full rounded bg-white/45" />
          <div className="h-[2px] w-4/5 rounded bg-white/45" />
          <div className="h-[2px] w-full rounded bg-white/45" />
        </div>
      </div>

      {/* เคาน์เตอร์ */}
      <div className="absolute inset-x-0" style={{ bottom: 78, height: 30, background: "linear-gradient(180deg,#c58a52,#8a5a2e)", borderTop: "4px solid #6b4423" }} />
      {/* พื้น */}
      <div className="absolute inset-x-0 bottom-0" style={{ height: 78, background: "linear-gradient(180deg,#e6c79a,#d4a768)" }} />

      {/* จานหมุน + เค้ก (ก้อนเต็มด้านหลัง + เค้กหั่นก้อนหลักอยู่หน้า) */}
      <div className="absolute z-[3]" style={{ left: "38%", bottom: 90, transform: "translateX(-50%)" }}>
        <div className="relative flex flex-col items-center">
          {haveW > 0 && (
            <div className="flex justify-center gap-0.5" style={{ marginBottom: haveN > 0 ? -40 : 0 }}>
              {Array.from({ length: haveW }, (_, i) => <Cake3D key={i} den={den} have={den} whole size={78} showLabel={false} />)}
            </div>
          )}
          {haveN > 0 && <div className="relative z-10"><Cake3D den={den} have={haveN} size={124} showLabel={false} /></div>}
          {haveW === 0 && haveN === 0 && <span className="pb-6 text-3xl">🫙</span>}
        </div>
        <div className="mx-auto -mt-2 h-3.5 rounded-[50%] bg-gradient-to-b from-pink-200 to-pink-300 shadow" style={{ width: 150 }} />
      </div>
      {/* ป้ายเหลือ */}
      <div className="absolute z-[4] flex items-center gap-1.5 rounded-xl border-2 border-emerald-300 bg-white px-3 py-1 shadow" style={{ left: "38%", bottom: 70, transform: "translateX(-50%)" }}>
        <span className="text-sm font-extrabold text-emerald-700">{arrived ? "เหลือ" : "มีทั้งหมด"}</span>
        <MixedNum w={haveW} n={haveN} den={den} size="sm" tone="text-emerald-700" />
        <span className="text-sm font-extrabold text-emerald-700">ก้อน</span>
      </div>

      {/* ลูกศร ขาย → */}
      {showArrow && (
        <div className="absolute z-[4] flex flex-col items-center" style={{ left: "55%", bottom: 160, transform: "translateX(-50%)" }}>
          <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-extrabold text-white shadow">ขาย {askW}{askN > 0 ? ` ${askN}/${den}` : ""}</span>
          <span className="arrow-pulse text-3xl text-rose-500">➜</span>
        </div>
      )}

      {/* เค้กบิน */}
      {fly && (
        <div key={fly.key} className="cake-fly pointer-events-none absolute z-[6]" style={{ left: "46%", bottom: 108 }}>
          {fly.type === "whole" ? <Cake3D den={den} have={den} whole size={70} showLabel={false} /> : <Cake3D den={den} have={1} size={70} showLabel={false} />}
        </div>
      )}

      {/* คนขาย */}
      <div className="absolute z-[3] flex flex-col items-center" style={{ left: "6%", bottom: 8 }}>
        <ChefKid kid={seller} mood={sellerMood} size={92} />
        <span className="rounded bg-white/85 px-1.5 text-sm font-extrabold text-slate-700">{sellerName}</span>
      </div>

      {/* ลูกค้า */}
      <div className="absolute z-[5] flex flex-col items-center" style={{ left: `${custX}%`, bottom: 8, transform: "translateX(-50%)", transition: custWalking ? "left 0.55s linear" : "none" }}>
        {custMood === "ask" && arrived && (
          <SpeechBubble tone="border-sky-300 text-sky-700">
            <span className="inline-flex items-center gap-1.5">ขอซื้อ <MixedNum w={askW} n={askN} den={den} size="sm" tone="text-sky-700" /> ก้อนจ้า 🙏</span>
          </SpeechBubble>
        )}
        {custMood === "happy" && <SpeechBubble tone="border-emerald-300 text-emerald-700">ขอบคุณมากจ้า! 😊</SpeechBubble>}
        <PixelVillager v={cust} mood={custMood} size={100} walking={custWalking} facing={custFacing} />
        <span className="rounded bg-white/85 px-1.5 text-sm font-extrabold text-slate-700">{custName}</span>
      </div>

      {/* ถาดออร์เดอร์ หน้าลูกค้า */}
      {arrived && (
        <div className="absolute z-[4] flex flex-col items-center rounded-xl border-2 border-amber-300 bg-white/95 px-2 pb-1 pt-0.5 shadow-lg" style={{ left: `${clamp(custX - 14, 50, 80)}%`, bottom: 22, transform: "translateX(-50%)", transition: custWalking ? "left 0.55s linear" : "none" }}>
          <span className="text-[11px] font-extrabold text-amber-700">🧾 ออร์เดอร์</span>
          <div className="relative flex min-h-[40px] items-end justify-center gap-0.5 rounded-lg bg-amber-50 px-1.5" style={{ minWidth: 64 }}>
            {Array.from({ length: gotW }, (_, i) => <Cake3D key={i} den={den} have={den} whole size={40} showLabel={false} />)}
            {gotN > 0 && <Cake3D den={den} have={gotN} size={44} showLabel={false} />}
            {gotW === 0 && gotN === 0 && <span className="pb-2 text-[10px] font-bold text-amber-400">ยังไม่มี</span>}
            {custMood === "happy" && <span className="sparkle absolute -right-1 -top-1 text-lg">✨</span>}
          </div>
          <span className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-700">ได้รับ <MixedNum w={gotW} n={gotN} den={den} size="sm" tone="text-emerald-700" /> ก้อน</span>
        </div>
      )}
    </div>
  );
}

/* ── ช่องเลือกจำนวนคละ (เศษส่วนแบบตั้ง) ── */

function MixedPicker({ w, n, den, setW, setN, tone }: { w: number; n: number; den: number; setW: (v: number) => void; setN: (v: number) => void; tone: string }) {
  const btn = "h-9 w-9 rounded-lg border-2 border-slate-200 bg-white text-lg font-extrabold text-slate-600 hover:bg-slate-50 active:scale-95";
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        <button onClick={() => setW(Math.max(0, w - 1))} className={btn}>−</button>
        <span className={cn("w-9 text-center text-3xl font-black", tone)}>{w}</span>
        <button onClick={() => setW(w + 1)} className={btn}>+</button>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={() => setN(Math.max(0, n - 1))} className={btn}>−</button>
        <span className="inline-flex flex-col items-center rounded-lg border-2 border-slate-200 bg-white px-2.5 py-0.5">
          <span className={cn("text-xl font-extrabold", tone)}>{n}</span>
          <span className={cn("h-[3px] w-6 rounded bg-current", tone)} />
          <span className="text-xl font-extrabold text-slate-400">{den}</span>
        </span>
        <button onClick={() => setN(Math.min(den - 1, n + 1))} className={btn}>+</button>
      </div>
    </div>
  );
}

/* ── เกมหลัก ── */

type Phase = "queue" | "arriving" | "give" | "leaving" | "done";

export function SubtractCakeShopGame() {
  const [mode, setMode] = useState<"lab" | "mission">("lab");
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  useEffect(() => { mutedRef.current = muted; }, [muted]);
  const ctxRef = useRef<AudioContext | null>(null);
  const { play, ensure } = useSound(mutedRef, ctxRef);
  const bgm = useChiptune(mutedRef, ctxRef);
  useEffect(() => {
    bgm.start();
    return () => bgm.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [sellerIdx, setSellerIdx] = useState(0);
  const [custIdx, setCustIdx] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [sellerNames, setSellerNames] = useState<string[]>(() => SELLERS.map((s) => s.name));
  const [custNames, setCustNames] = useState<string[]>(() => VILLAGERS.map((v) => v.name));
  const [showNames, setShowNames] = useState(false);

  /* โจทย์: W1 n1/den − W2 n2/den (n2 ≤ n1 ไม่ต้องยืม) */
  const [den, setDen] = useState(4);
  const [w1, setW1] = useState(2);
  const [n1, setN1] = useState(3);
  const [w2, setW2] = useState(1);
  const [n2, setN2] = useState(1);

  /* สถานะฉาก (จำนวนเต็มล้วน ไม่ใช้ float) */
  const [phase, setPhase] = useState<Phase>("queue");
  const [haveW, setHaveW] = useState(2);
  const [haveN, setHaveN] = useState(3);
  const [gotW, setGotW] = useState(0);
  const [gotN, setGotN] = useState(0);
  const [custX, setCustX] = useState(ENTER_X);
  const [custFacing, setCustFacing] = useState<1 | -1>(-1);
  const [custWalking, setCustWalking] = useState(false);
  const [custMood, setCustMood] = useState<VMood>("walk");
  const [sellerMood, setSellerMood] = useState<"normal" | "happy">("normal");
  const [blockMsg, setBlockMsg] = useState<string | null>(null);
  const [fly, setFly] = useState<{ key: number; type: "whole" | "slice" } | null>(null);
  const [flying, setFlying] = useState(false);
  const timeoutsRef = useRef<number[]>([]);
  useEffect(() => () => timeoutsRef.current.forEach((t) => window.clearTimeout(t)), []);

  /* ภารกิจ */
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [gW, setGW] = useState(0);
  const [gN, setGN] = useState(0);
  const [guessLocked, setGuessLocked] = useState(false);
  const [firstTry, setFirstTry] = useState(true);
  const [checked, setChecked] = useState<null | boolean>(null);
  const [gameOver, setGameOver] = useState(false);

  const resW = w1 - w2;
  const resN = n1 - n2;
  const done = phase === "done";
  const canGive = phase === "give" && (mode === "lab" || guessLocked);
  const seller = SELLERS[sellerIdx];
  const cust = VILLAGERS[custIdx];
  const sellerName = sellerNames[sellerIdx];
  const custName = custNames[custIdx];

  function resetScene(nw1: number, nn1: number) {
    setHaveW(nw1); setHaveN(nn1);
    setGotW(0); setGotN(0);
    setPhase("queue"); setCustWalking(false); setCustMood("walk");
    setCustX(ENTER_X); setCustFacing(-1); setSellerMood("normal");
    setChecked(null); setBlockMsg(null); setGuessLocked(false);
    setFly(null); setFlying(false);
  }
  function setupProblem(nd: number, nw1: number, nn1: number, nw2: number, nn2: number, keepCust = false) {
    setDen(nd); setW1(nw1); setN1(nn1); setW2(nw2); setN2(nn2);
    resetScene(nw1, nn1);
    setGW(0); setGN(0); setFirstTry(true);
    if (!keepCust) setCustIdx((prev) => shuffle(VILLAGERS.map((_, i) => i).filter((i) => i !== prev))[0] ?? prev);
  }
  function normalize(nd: number, nw1: number, nn1: number, nw2: number, nn2: number): [number, number, number, number] {
    const N1 = clamp(nn1, 0, nd - 1);
    const W1v = Math.max(0, nw1);
    const N2 = clamp(nn2, 0, N1);
    const W2v = clamp(nw2, 0, N2 === N1 && N1 > 0 ? W1v : W1v);
    return [W1v, N1, Math.min(W2v, W1v), N2];
  }
  function teacherSet(nd: number, nw1: number, nn1: number, nw2: number, nn2: number) {
    const [W1v, N1, W2v, N2] = normalize(nd, nw1, nn1, nw2, nn2);
    setupProblem(nd, W1v, N1, W2v, N2, true);
  }

  /* ลูกค้าเดินเข้ามา */
  function callCustomer() {
    if (phase !== "queue") return;
    ensure();
    setPhase("arriving");
    const at = (fn: () => void, ms: number) => timeoutsRef.current.push(window.setTimeout(fn, ms));
    at(() => { setCustWalking(true); setCustFacing(-1); setCustX(STAND_X); play("step"); }, 60);
    at(() => { setCustWalking(false); setCustMood("ask"); play("bell"); setPhase("give"); }, 700);
  }

  /* เด็กคลิกให้ขนมเอง */
  function flashBlock(msg: string) {
    play("wrong");
    setBlockMsg(msg);
    timeoutsRef.current.push(window.setTimeout(() => setBlockMsg(null), 1600));
  }
  function giveWhole() {
    if (!canGive || flying) return;
    if (gotW >= w2) { flashBlock(w2 === 0 ? `${custName}ไม่ได้ขอก้อนเต็มนะ` : "ก้อนเต็มครบแล้ว! ให้เกินไม่ได้นะ"); return; }
    ensure(); play("pop");
    setFlying(true);
    setHaveW((v) => v - 1);
    setFly({ key: Date.now(), type: "whole" });
    const nw = gotW + 1;
    timeoutsRef.current.push(window.setTimeout(() => {
      setGotW(nw); setFly(null); setFlying(false); play("coin");
      checkComplete(nw, gotN);
    }, 480));
  }
  function giveSlice() {
    if (!canGive || flying) return;
    if (gotN >= n2) { flashBlock(n2 === 0 ? `${custName}ไม่ได้ขอชิ้นเค้กนะ` : "ชิ้นเค้กครบแล้ว! ให้เกินไม่ได้นะ"); return; }
    ensure(); play("pop");
    setFlying(true);
    setHaveN((v) => v - 1);
    setFly({ key: Date.now(), type: "slice" });
    const nn = gotN + 1;
    timeoutsRef.current.push(window.setTimeout(() => {
      setGotN(nn); setFly(null); setFlying(false); play("coin");
      checkComplete(gotW, nn);
    }, 480));
  }
  function checkComplete(nw: number, nn: number) {
    if (nw !== w2 || nn !== n2) return;
    setPhase("leaving");
    const at = (fn: () => void, ms: number) => timeoutsRef.current.push(window.setTimeout(fn, ms));
    at(() => { setCustMood("happy"); setSellerMood("happy"); play("coin"); }, 300);
    at(() => {
      setPhase("done");
      setSellerMood("normal");
      if (mode === "mission") {
        const ok = gW === resW && gN === resN;
        setChecked(ok);
        if (ok) { play("correct"); setScore((s) => s + (firstTry ? 25 : 12)); setCoins((c) => c + 1); }
        else play("wrong");
      } else play("ding");
    }, 1100);
  }

  /* ภารกิจ flow */
  function randomProblem(): [number, number, number, number, number] {
    const nd = DEN_OPTIONS[randInt(1, DEN_OPTIONS.length - 1)];
    const N1 = randInt(1, nd - 1);
    const N2 = randInt(0, N1);
    const W1v = randInt(1, 3);
    const W2v = N2 === N1 ? randInt(0, Math.max(0, W1v - 1)) : randInt(0, W1v);
    if (W2v === 0 && N2 === 0) return [nd, W1v, N1, 1, Math.min(1, N1)];
    return [nd, W1v, N1, W2v, N2];
  }
  function startMissions() {
    ensure(); play("start");
    setScore(0); setCoins(0); setRound(1); setGameOver(false);
    setupProblem(4, 2, 3, 1, 1);
    setMode("mission");
  }
  function nextMission() {
    if (round >= MISSIONS_TOTAL) { setGameOver(true); play("star"); return; }
    setRound((r) => r + 1);
    const [nd, nw1, nn1, nw2, nn2] = randomProblem();
    setupProblem(nd, nw1, nn1, nw2, nn2);
  }

  const stars = score >= 170 ? 3 : score >= 120 ? 2 : 1;

  return (
    <div className="relative overflow-hidden rounded-2xl p-3 sm:p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden text-2xl" aria-hidden>
        <span className="absolute left-4 top-5 opacity-40">🎂</span>
        <span className="absolute right-8 top-8 opacity-40">🏡</span>
        <span className="absolute bottom-8 left-8 opacity-30">🌾</span>
        <span className="absolute right-4 top-24 opacity-30">🌳</span>
      </div>

      <div className="relative space-y-3">
        {/* โหมด + ปิดเสียง */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex rounded-xl border-2 border-slate-200 bg-white p-1">
            <button onClick={() => { setMode("lab"); resetScene(w1, n1); }} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "lab" ? "bg-amber-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <FlaskConical size={15} /> โหมดครู
            </button>
            <button onClick={startMissions} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "mission" ? "bg-orange-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <Target size={15} /> เปิดร้านวันหยุด
            </button>
          </div>
          <button onClick={() => setMuted((m) => !m)} className="grid h-9 w-9 place-items-center rounded-xl border-2 border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50" title={muted ? "เปิดเสียง" : "ปิดเสียง"}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {mode === "mission" && gameOver ? (
          <div className="space-y-4 rounded-2xl border-2 border-orange-300 bg-white/90 p-6 text-center">
            <div className="text-5xl">🎂🏆</div>
            <h3 className="text-xl font-extrabold text-slate-800 sm:text-2xl">ปิดร้านแล้ว วันนี้ขายดีมาก!</h3>
            <p className="text-2xl">{"⭐".repeat(stars)}{"☆".repeat(3 - stars)}</p>
            <p className="text-base font-extrabold text-orange-700">🏅 คะแนนรวม {score} · 🪙 รายได้ {coins} เหรียญ</p>
            <button onClick={startMissions} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
              <Play size={18} /> เปิดร้านอีกวัน
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {mode === "lab" ? (
              <div className="space-y-2 rounded-2xl border-2 border-amber-200 bg-white/90 px-3 py-2">
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
                  <span className="text-sm font-extrabold text-amber-700">🧑‍🏫 มีอยู่:</span>
                  <MixedPicker w={w1} n={n1} den={den} setW={(v) => teacherSet(den, v, n1, w2, n2)} setN={(v) => teacherSet(den, w1, v, w2, Math.min(n2, v))} tone="text-amber-700" />
                  <span className="text-2xl font-black text-slate-400">−</span>
                  <span className="text-sm font-extrabold text-slate-500">ขาย:</span>
                  <MixedPicker w={w2} n={n2} den={den} setW={(v) => teacherSet(den, w1, n1, v, n2)} setN={(v) => teacherSet(den, w1, n1, w2, v)} tone="text-rose-500" />
                  <span className="mx-1 text-slate-300">|</span>
                  <span className="text-sm font-extrabold text-slate-500">ส่วน</span>
                  {DEN_OPTIONS.map((d) => (
                    <button key={d} onClick={() => teacherSet(d, w1, Math.min(n1, d - 1), w2, Math.min(n2, d - 1))} className={cn("h-8 w-8 rounded-lg border-2 text-base font-extrabold transition", den === d ? "border-amber-500 bg-amber-100 text-amber-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>{d}</button>
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button onClick={() => setReveal((v) => !v)} className={cn("flex items-center gap-1 rounded-lg border-2 px-2 py-1 text-sm font-extrabold transition", reveal ? "border-violet-400 bg-violet-100 text-violet-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
                    {reveal ? <EyeOff size={14} /> : <Eye size={14} />} เฉลย
                  </button>
                  <button onClick={() => setShowNames((v) => !v)} className={cn("flex items-center gap-1 rounded-lg border-2 px-2 py-1 text-sm font-extrabold transition", showNames ? "border-sky-400 bg-sky-100 text-sky-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
                    <Pencil size={13} /> แก้ชื่อ
                  </button>
                  <span className="mx-1 text-slate-300">|</span>
                  <span className="text-sm font-extrabold text-slate-500">คนขาย:</span>
                  {SELLERS.map((k, i) => (
                    <button key={i} onClick={() => setSellerIdx(i)} className={cn("rounded-lg border-2 p-0.5 transition", sellerIdx === i ? "border-amber-400 bg-amber-50" : "border-slate-200 bg-white")}>
                      <ChefKid kid={k} mood="normal" size={30} />
                    </button>
                  ))}
                  <span className="mx-1 text-slate-300">|</span>
                  <span className="text-sm font-extrabold text-slate-500">ลูกค้า:</span>
                  {VILLAGERS.map((v, i) => (
                    <button key={i} onClick={() => { setCustIdx(i); resetScene(w1, n1); }} className={cn("rounded-lg border-2 p-0.5 transition", custIdx === i ? "border-orange-400 bg-orange-50" : "border-slate-200 bg-white")} style={SS}>
                      <PixelVillager v={v} mood="walk" size={30} />
                    </button>
                  ))}
                </div>
                {showNames && (
                  <div className="space-y-1.5 border-t border-slate-100 pt-1.5">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <span className="text-sm font-extrabold text-sky-700">✏️ ชื่อคนขาย:</span>
                      {SELLERS.map((_, i) => (
                        <input key={i} value={sellerNames[i]} maxLength={12} onChange={(e) => setSellerNames((ns) => { const nn = [...ns]; nn[i] = e.target.value; return nn; })} className="w-24 rounded-lg border-2 border-slate-200 bg-white px-2 py-1 text-sm font-extrabold text-slate-700 focus:border-sky-400 focus:outline-none" />
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <span className="text-sm font-extrabold text-sky-700">✏️ ชื่อลูกค้า:</span>
                      {VILLAGERS.map((_, i) => (
                        <input key={i} value={custNames[i]} maxLength={12} onChange={(e) => setCustNames((ns) => { const nn = [...ns]; nn[i] = e.target.value; return nn; })} className="w-24 rounded-lg border-2 border-slate-200 bg-white px-2 py-1 text-sm font-extrabold text-slate-700 focus:border-sky-400 focus:outline-none" />
                      ))}
                      <button onClick={() => { setSellerNames(SELLERS.map((s) => s.name)); setCustNames(VILLAGERS.map((v) => v.name)); }} className="rounded-lg border-2 border-slate-200 bg-white px-2 py-1 text-sm font-extrabold text-slate-500 hover:bg-slate-50">คืนค่าเดิม</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 rounded-2xl bg-white/90 px-4 py-2 ring-1 ring-orange-200">
                <span className="text-base font-extrabold text-orange-700">🛎️ คิว {round}/{MISSIONS_TOTAL}</span>
                <span className="text-base font-extrabold text-amber-600">🏅 {score}</span>
                <span className="text-base font-extrabold text-yellow-600">🪙 {coins}</span>
              </div>
            )}

            {/* สมการใหญ่ (จำนวนคละแบบตั้ง) */}
            <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-amber-200 bg-white/95 px-5 py-3 shadow-sm">
              <MixedNum w={w1} n={n1} den={den} size="lg" tone="text-amber-700" />
              <span className="text-3xl font-black text-slate-400">−</span>
              <MixedNum w={w2} n={n2} den={den} size="lg" tone="text-rose-500" />
              <span className="text-3xl font-black text-slate-400">=</span>
              {done || (mode === "lab" && reveal) ? (
                <MixedNum w={resW} n={resN} den={den} size="lg" tone={done ? "text-orange-600" : "text-violet-500"} />
              ) : (
                <span className="grid h-12 w-12 place-items-center rounded-xl border-[3px] border-dashed border-amber-300 text-2xl font-black text-amber-400">?</span>
              )}
            </div>

            {/* ฉากร้าน */}
            <ShopScene
              seller={seller} sellerName={sellerName} den={den} haveW={haveW} haveN={haveN}
              custX={custX} custFacing={custFacing} custWalking={custWalking}
              cust={cust} custName={custName} custMood={custMood} sellerMood={sellerMood}
              askW={w2} askN={n2} gotW={gotW} gotN={gotN} arrived={phase !== "queue" && phase !== "arriving"}
              fly={fly} showArrow={phase === "give" || phase === "leaving"}
            />

            {/* ข้อความเตือนให้เกิน */}
            {blockMsg && <p className="text-center text-base font-extrabold text-rose-500">⚠️ {blockMsg}</p>}

            {/* คำอธิบายผล */}
            {done && (
              <p className="flex flex-wrap items-center justify-center gap-1.5 text-center text-base font-extrabold text-slate-600">
                ขายให้ {custName} ไป <MixedNum w={w2} n={n2} den={den} size="sm" tone="text-rose-500" /> เหลือ <MixedNum w={resW} n={resN} den={den} size="sm" tone="text-orange-600" /> ก้อน — เต็มลบเต็ม ({w1}−{w2}={resW}) เศษลบเศษ ({n1}−{n2}={resN})
              </p>
            )}

            {/* โหมดภารกิจ: ทายก่อน */}
            {mode === "mission" && (phase === "queue" || ((phase === "arriving" || phase === "give") && !guessLocked)) && (
              <div className="space-y-2 rounded-2xl border-2 border-orange-200 bg-white/90 p-3">
                <p className="flex flex-wrap items-center justify-center gap-1.5 text-center text-base font-extrabold text-slate-600">
                  🤔 ทายก่อน: ขาย <MixedNum w={w2} n={n2} den={den} size="sm" tone="text-rose-500" /> ให้ {custName} แล้วจะเหลือเท่าไร?
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <MixedPicker w={gW} n={gN} den={den} setW={setGW} setN={setGN} tone="text-orange-600" />
                  <button
                    onClick={() => {
                      setFirstTry(true); setGuessLocked(true);
                      if (phase === "queue") callCustomer();
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-2.5 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]"
                  >
                    ✅ ยืนยันคำตอบ แล้วจัดขนมเอง!
                  </button>
                </div>
              </div>
            )}

            {/* ปุ่มให้ขนม (เด็กคลิกเอง) */}
            {canGive && (
              <div className="space-y-1.5 rounded-2xl border-2 border-amber-200 bg-white/90 p-3">
                <p className="flex flex-wrap items-center justify-center gap-1.5 text-center text-base font-extrabold text-slate-600">
                  🫳 หยิบขนมให้ {custName} — ขอ <MixedNum w={w2} n={n2} den={den} size="sm" tone="text-sky-700" /> ก้อน
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button onClick={giveWhole} disabled={flying || (haveW <= 0 && gotW < w2)} className="inline-flex items-center gap-2 rounded-xl border-b-4 border-amber-800 bg-gradient-to-b from-amber-500 to-amber-600 px-6 py-2.5 text-base font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.97] active:border-b-2 disabled:opacity-40">
                    🎂 ให้เค้กทั้งก้อน <span className="rounded-full bg-white/25 px-2 text-sm">{gotW}/{w2}</span>
                  </button>
                  <button onClick={giveSlice} disabled={flying || (haveN <= 0 && gotN < n2)} className="inline-flex items-center gap-2 rounded-xl border-b-4 border-orange-800 bg-gradient-to-b from-orange-500 to-orange-600 px-6 py-2.5 text-base font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.97] active:border-b-2 disabled:opacity-40">
                    🍰 ให้ทีละชิ้น (1/{den}) <span className="rounded-full bg-white/25 px-2 text-sm">{gotN}/{n2}</span>
                  </button>
                </div>
              </div>
            )}

            {/* ผลทาย */}
            {mode === "mission" && checked !== null && (
              <div className={cn("rounded-2xl border-2 p-3 text-center", checked ? "border-emerald-300 bg-emerald-50" : "border-rose-300 bg-rose-50")}>
                <p className={cn("flex flex-wrap items-center justify-center gap-1.5 text-base font-extrabold", checked ? "text-emerald-700" : "text-rose-600")}>
                  {checked
                    ? <>🎉 ทายถูก! เหลือ <MixedNum w={resW} n={resN} den={den} size="sm" tone="text-emerald-700" /> ก้อน</>
                    : <>ทาย <MixedNum w={gW} n={gN} den={den} size="sm" tone="text-rose-600" /> แต่เหลือจริง <MixedNum w={resW} n={resN} den={den} size="sm" tone="text-rose-600" /> — {gN === n1 ? "อย่าลืมขายชิ้นเค้กด้วยนะ!" : "เต็มลบเต็ม เศษลบเศษ นะ"}</>}
                </p>
                <button onClick={nextMission} className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-2 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                  {round >= MISSIONS_TOTAL ? "🏁 ปิดร้าน" : <>คิวต่อไป <ArrowRight size={16} /></>}
                </button>
              </div>
            )}

            {/* ปุ่มควบคุม (โหมดครู) */}
            {mode === "lab" && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                {phase === "queue" ? (
                  <button onClick={callCustomer} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 px-6 py-2.5 text-base font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
                    🔔 เรียกลูกค้าเข้าร้าน
                  </button>
                ) : phase === "done" ? (
                  <button onClick={() => resetScene(w1, n1)} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-5 py-2 text-base font-extrabold text-slate-500 transition hover:bg-slate-50">
                    <RotateCcw size={15} /> เริ่มใหม่
                  </button>
                ) : phase === "arriving" || phase === "leaving" ? (
                  <span className="text-base font-extrabold text-slate-500">🚶 ลูกค้ากำลังเดิน…</span>
                ) : null}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── เสียง ── */

type SoundKind = "bell" | "pop" | "coin" | "step" | "ding" | "correct" | "wrong" | "start" | "star";

function useSound(mutedRef: React.MutableRefObject<boolean>, ctxRef: React.MutableRefObject<AudioContext | null>) {
  function ensure(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AC) ctxRef.current = new AC();
    }
    if (ctxRef.current?.state === "suspended") void ctxRef.current.resume();
    return ctxRef.current;
  }
  function tones(freqs: number[], step: number, dur: number, type: OscillatorType, gain: number) {
    if (mutedRef.current) return;
    const ctx = ensure();
    if (!ctx) return;
    let t = ctx.currentTime;
    for (const f of freqs) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(gain, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur);
      t += step;
    }
  }
  function play(kind: SoundKind) {
    switch (kind) {
      case "bell": return tones([1568, 1976], 0.06, 0.14, "sine", 0.1);
      case "pop": return tones([700, 900], 0.03, 0.06, "square", 0.06);
      case "coin": return tones([1319, 1568, 2093], 0.05, 0.1, "triangle", 0.11);
      case "step": return tones([180, 150], 0.04, 0.04, "square", 0.04);
      case "ding": return tones([1047, 1319], 0.07, 0.16, "sine", 0.13);
      case "correct": return tones([660, 990, 1319], 0.06, 0.1, "triangle", 0.14);
      case "wrong": return tones([220, 165], 0.11, 0.18, "sawtooth", 0.09);
      case "start": return tones([523, 659, 784], 0.07, 0.12, "triangle", 0.14);
      case "star": return tones([1047, 1319, 1568, 2093], 0.07, 0.14, "triangle", 0.14);
    }
  }
  return { play, ensure };
}

/* ── เพลงหมู่บ้าน RPG (ชิปทูน ไม่ใช้ไฟล์) ── */

const VL_LEAD = [67, 71, 74, 71, 67, 0, 69, 71, 72, 0, 71, 69, 67, 0, 0, 0, 65, 69, 72, 69, 65, 0, 67, 69, 71, 0, 69, 67, 65, 0, 0, 0];
const VL_BASS = [43, 50, 43, 50, 45, 52, 45, 52, 40, 47, 40, 47, 41, 48, 41, 48];

function useChiptune(mutedRef: React.MutableRefObject<boolean>, ctxRef: React.MutableRefObject<AudioContext | null>) {
  const timerRef = useRef<number | null>(null);
  const stepRef = useRef(0);
  function note(midi: number, dur: number, type: OscillatorType, gain: number) {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(440 * Math.pow(2, (midi - 69) / 12), t);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur);
  }
  function start() {
    if (timerRef.current) return;
    if (typeof window !== "undefined" && !ctxRef.current) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AC) ctxRef.current = new AC();
    }
    if (ctxRef.current?.state === "suspended") void ctxRef.current.resume();
    stepRef.current = 0;
    timerRef.current = window.setInterval(() => {
      const s = stepRef.current;
      stepRef.current = (s + 1) % 32;
      if (mutedRef.current || !ctxRef.current) return;
      const m = VL_LEAD[s];
      if (m) note(m, 0.24, "triangle", 0.03);
      if (s % 2 === 0) {
        const b = VL_BASS[s / 2];
        if (b) note(b, 0.4, "sine", 0.05);
      }
    }, 230);
  }
  function stop() {
    if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
  }
  useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);
  return { start, stop };
}
