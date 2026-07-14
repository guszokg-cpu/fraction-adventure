"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Play, RotateCcw, Volume2, VolumeX, FlaskConical, Target, ArrowRight, Eye, EyeOff, Pencil } from "lucide-react";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { cn } from "@/lib/cn";
import { randInt, shuffle } from "@/lib/randomFraction";

/* ── ค่าคงที่ ── */

const DEN_OPTIONS = [3, 4, 5, 6, 8];
const MISSIONS_TOTAL = 8;
const ENTER_X = 106; // นอกจอ (นักวิ่งวิ่งเข้ามา)
const STAND_X = 74;  // จุดยืนหน้าสถานี

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

/* ── ผู้ดูแลสถานี: เด็กนักเรียนสวมหมวกแก๊ปสตาฟ ── */

type Hair = "short" | "ponytail" | "topknot" | "braids" | "bob";
const STAFFS = [
  { name: "น้องภูมิ", skin: "#fcd9b8", hair: "#2d2013", hairStyle: "short" as Hair, accent: "#3b82f6" },
  { name: "น้องแนน", skin: "#ffe0c4", hair: "#3b2412", hairStyle: "ponytail" as Hair, accent: "#ef4444" },
  { name: "น้องเจได", skin: "#f5cba3", hair: "#1c1c1c", hairStyle: "topknot" as Hair, accent: "#f59e0b" },
  { name: "น้องพลอย", skin: "#ffd9c9", hair: "#4a2e18", hairStyle: "braids" as Hair, accent: "#ec4899" },
  { name: "น้องมายด์", skin: "#fbe3cf", hair: "#2b1d10", hairStyle: "bob" as Hair, accent: "#facc15" },
];
type Staff = typeof STAFFS[number];

function StaffKid({ kid, mood, size = 88 }: { kid: Staff; mood: "normal" | "happy"; size?: number }) {
  return (
    <svg viewBox="0 0 44 62" width={size * 0.71} height={size} role="img" aria-label={`สตาฟ ${kid.name}`}>
      <rect x={12} y={8} width={20} height={17} rx={5} fill={kid.skin} stroke="#00000022" strokeWidth={1} />
      <path d="M10,13 Q11,5 22,5 Q33,5 34,13 L34,11 Q30,8 22,8 Q14,8 10,11 Z" fill={kid.accent} />
      <path d="M28,10 Q36,10 36,15 L34,15 Q32,11 28,11 Z" fill={kid.accent} />
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
      <rect x={15} y={41} width={5.5} height={14} rx={2} fill="#334155" />
      <rect x={23.5} y={41} width={5.5} height={14} rx={2} fill="#334155" />
      <rect x={14} y={54} width={7.5} height={4} rx={1.5} fill="#fff" stroke="#cbd5e1" strokeWidth={1} />
      <rect x={22.5} y={54} width={7.5} height={4} rx={1.5} fill="#fff" stroke="#cbd5e1" strokeWidth={1} />
    </svg>
  );
}

/* ── นักวิ่งพิกเซล 5 คน (ติดเบอร์วิ่ง + เหงื่อ) ── */

type VType = "farmer" | "auntie" | "grandpa" | "boy" | "traveler";
const RUNNERS: { type: VType; name: string; skin: string; body: string; dark: string; hat: string; bib: string }[] = [
  { type: "farmer", name: "ลุงสมชาย", skin: "#e8b688", body: "#7c9a5c", dark: "#3f5228", hat: "#d4a24c", bib: "07" },
  { type: "auntie", name: "ป้าสมศรี", skin: "#f0c9a0", body: "#c15a5a", dark: "#7a2e2e", hat: "#8a5a2e", bib: "12" },
  { type: "grandpa", name: "คุณตาบุญมี", skin: "#e0bd97", body: "#5c6b8a", dark: "#2e3752", hat: "#e2e8f0", bib: "23" },
  { type: "boy", name: "หนูเอก", skin: "#f2cca5", body: "#4a7fb5", dark: "#254060", hat: "#f2cca5", bib: "05" },
  { type: "traveler", name: "พี่กล้า", skin: "#dcae82", body: "#6b7a3f", dark: "#3a4522", hat: "#4a5a2a", bib: "31" },
];
type Runner = typeof RUNNERS[number];
type VMood = "run" | "ask" | "worried" | "happy";

const SS = { shapeRendering: "crispEdges" as const };

function PixelRunner({ v, mood, size = 96, running = false, facing = 1 }: { v: Runner; mood: VMood; size?: number; running?: boolean; facing?: 1 | -1 }) {
  const happy = mood === "happy";
  const worried = mood === "worried";
  return (
    <svg viewBox="0 0 40 56" width={size * 0.71} height={size} style={{ ...SS, transform: facing === -1 ? "scaleX(-1)" : undefined }} className={cn(running && "pv-bob")} role="img" aria-label={`นักวิ่ง ${v.name}`}>
      <rect x={9} y={5} width={22} height={18} rx={5} fill={v.skin} stroke="#2a1c10" strokeWidth={1.6} />
      <rect x={13} y={13} width={3.5} height={4.5} rx={1} fill="#1e1207" />
      <rect x={23.5} y={13} width={3.5} height={4.5} rx={1} fill="#1e1207" />
      {happy
        ? <path d="M15,18.5 Q20,21.5 25,18.5" stroke="#1e1207" strokeWidth={1.6} fill="none" strokeLinecap="round" />
        : worried
          ? <path d="M15,20 Q20,17.5 25,20" stroke="#1e1207" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          : <path d="M16,19 L24,19" stroke="#1e1207" strokeWidth={1.5} strokeLinecap="round" />}
      {/* เหงื่อ */}
      {(worried || running) && <path d="M30,10 Q32,13 30,16 Q28,13 30,10 Z" fill="#7dd3fc" stroke="#0284c7" strokeWidth={0.6} className={running ? "pv-sweat" : undefined} />}
      {v.type === "farmer" && <>
        <path d="M6,10 Q6,6 20,6 Q34,6 34,10 L34,12 L6,12 Z" fill={v.hat} stroke="#2a1c10" strokeWidth={1.5} />
        <ellipse cx={20} cy={12} rx={17} ry={3} fill={v.hat} stroke="#2a1c10" strokeWidth={1.5} />
      </>}
      {v.type === "auntie" && <>
        <circle cx={20} cy={5} r={4.5} fill={v.dark} stroke="#2a1c10" strokeWidth={1.3} />
        <path d="M9,12 Q9,4 20,4 Q31,4 31,12 L31,10 Q26,7 20,7 Q14,7 9,10 Z" fill={v.dark} />
      </>}
      {v.type === "grandpa" && <path d="M9,11 Q9,3 20,3 Q31,3 31,11 L31,9 Q26,6 20,6 Q14,6 9,9 Z" fill="#e8e8e8" stroke="#2a1c10" strokeWidth={1} />}
      {v.type === "boy" && <>
        <path d="M10,11 Q10,3 20,3 Q30,3 30,11 L30,9 Q25,6 20,6 Q15,6 10,9 Z" fill="#5a3a1e" />
        <rect x={17} y={1} width={3} height={4} rx={1.2} fill="#22c55e" />
      </>}
      {v.type === "traveler" && <path d="M7,11 Q10,4 20,4 Q30,4 33,11 L33,13 L7,13 Z" fill={v.hat} stroke="#2a1c10" strokeWidth={1.5} />}
      {/* ลำตัว + เบอร์วิ่ง */}
      <rect x={10} y={23} width={20} height={18} rx={3} fill={v.body} stroke="#2a1c10" strokeWidth={1.6} />
      <rect x={13} y={27} width={14} height={11} rx={1.5} fill="#fff" stroke="#2a1c10" strokeWidth={1} />
      <g style={{ transform: facing === -1 ? "scaleX(-1)" : undefined, transformOrigin: "20px 35.5px" }}>
        <text x={20} y={35.5} fontSize={7} fontWeight={900} fill="#dc2626" textAnchor="middle">{v.bib}</text>
      </g>
      <g className={running ? "pv-arm1" : undefined} style={{ transformOrigin: "8px 25px" }}>
        <rect x={4} y={23} width={6} height={13} rx={2.5} fill={v.body} stroke="#2a1c10" strokeWidth={1.4} />
      </g>
      <g className={running ? "pv-arm2" : undefined} style={{ transformOrigin: "32px 25px" }}>
        <rect x={30} y={23} width={6} height={13} rx={2.5} fill={v.body} stroke="#2a1c10" strokeWidth={1.4} />
      </g>
      <g className={running ? "pv-leg1" : undefined} style={{ transformOrigin: "15px 41px" }}>
        <rect x={12} y={41} width={6.5} height={13} rx={2} fill={v.dark} stroke="#2a1c10" strokeWidth={1.3} />
      </g>
      <g className={running ? "pv-leg2" : undefined} style={{ transformOrigin: "25px 41px" }}>
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

/* ── ขวดน้ำ PET สมจริง (ใช้ร่วมกันทุกขวด — สูงเท่ากันเสมอ) ── */

const BODY_PATH = "M17.5,15 L17.5,20 C17.5,24.5 9,27 9,34 L9,95 Q9,102 16,102 L32,102 Q39,102 39,95 L39,34 C39,27 30.5,24.5 30.5,20 L30.5,15 Z";
const B_TOP = 30, B_BOT = 98; // ช่วงลำตัวที่นับเป็น "1 ขวดเต็ม"

function PetBottle({ den, level, size = 104, label }: { den: number; level: number; size?: number; label: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const frac = clamp(level / den, 0, 1);
  const waterY = B_BOT - frac * (B_BOT - B_TOP);
  return (
    <svg viewBox="0 0 48 110" width={size * 48 / 110} height={size} role="img" aria-label={label}>
      <defs>
        <linearGradient id={`w${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a8dcfa" />
          <stop offset="1" stopColor="#3aa9e8" />
        </linearGradient>
        <clipPath id={`c${uid}`}><path d={BODY_PATH} /></clipPath>
      </defs>
      {/* เงาพื้น */}
      <ellipse cx={24} cy={106} rx={16} ry={3.5} fill="#00000014" />
      {/* ตัวขวดโปร่งใส */}
      <path d={BODY_PATH} fill="#eaf6fe" opacity={0.55} />
      {/* น้ำ */}
      <g clipPath={`url(#c${uid})`}>
        <rect x={7} y={waterY} width={34} height={110 - waterY} fill={`url(#w${uid})`} opacity={0.92} style={{ transition: "y 0.5s ease, height 0.5s ease" }} />
        {level > 0 && <ellipse cx={24} cy={waterY} rx={15} ry={2.4} fill="#d6eefc" opacity={0.95} style={{ transition: "cy 0.5s ease" }} />}
      </g>
      {/* สันแบ่งระดับรอบขวด (โค้งเล็กน้อยให้ดูกลม) */}
      {Array.from({ length: den + 1 }, (_, k) => {
        const y = B_BOT - (k / den) * (B_BOT - B_TOP);
        return <path key={k} d={`M9,${y} Q24,${y + 2.2} 39,${y}`} stroke="#79b7d8" strokeWidth={1} fill="none" opacity={0.6} />;
      })}
      {/* โครงขวด */}
      <path d={BODY_PATH} fill="none" stroke="#5b9dc6" strokeWidth={1.8} />
      {/* ไฮไลต์แนวตั้ง (ผิวพลาสติกเงา) */}
      <path d="M12.5,38 Q11.5,66 12.5,92" stroke="#fff" strokeWidth={3} opacity={0.55} strokeLinecap="round" fill="none" />
      <path d="M35,40 Q35.8,66 35,90" stroke="#fff" strokeWidth={1.6} opacity={0.35} strokeLinecap="round" fill="none" />
      {/* แหวนคอขวด */}
      <rect x={15.5} y={14} width={17} height={3} rx={1.5} fill="#dbeafe" stroke="#93c5fd" strokeWidth={0.8} />
      {/* ฝาเกลียวขาว */}
      <rect x={14} y={2} width={20} height={12} rx={3} fill="#fafafa" stroke="#9ca3af" strokeWidth={1.4} />
      {[18, 22, 26, 30].map((x) => <line key={x} x1={x} y1={3.5} x2={x} y2={12.5} stroke="#d1d5db" strokeWidth={1} />)}
      <rect x={14} y={2} width={20} height={3.5} rx={1.8} fill="#fff" opacity={0.8} />
    </svg>
  );
}

function SealedBottle({ den, size = 104 }: { den: number; size?: number }) {
  return <PetBottle den={den} level={den} size={size} label="ขวดน้ำปิดฝา (เต็ม)" />;
}

function OpenBottle({ den, level, size = 104 }: { den: number; level: number; size?: number }) {
  return <PetBottle den={den} level={level} size={size} label={`ขวดเปิด ${level}/${den}`} />;
}

/* ── กระบอกของนักวิ่ง (มีเส้นเป้าสีแดง) ── */

function RunnerBottle({ den, level, target, size = 84 }: { den: number; level: number; target: number; size?: number }) {
  const H = 54, BOT = 74;
  const fillFrac = clamp(level / den, 0, 1);
  const waterY = BOT - fillFrac * H;
  const targetY = BOT - (target / den) * H;
  const reached = level >= target;
  return (
    <svg viewBox="0 0 40 78" width={size * 40 / 78} height={size} role="img" aria-label={`กระบอกนักวิ่ง ${level}/${den} เป้า ${target}/${den}`}>
      <ellipse cx={20} cy={75} rx={13} ry={3} fill="#00000015" />
      <clipPath id="rb-clip"><path d="M13,18 L27,18 L27,74 Q27,77 20,77 Q13,77 13,74 Z" /></clipPath>
      <g clipPath="url(#rb-clip)">
        <rect x={11} y={waterY} width={18} height={BOT - waterY + 4} fill="url(#rb-grad)" style={{ transition: "y 0.5s ease" }} />
      </g>
      <defs>
        <linearGradient id="rb-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#86efac" />
          <stop offset="1" stopColor="#16a34a" />
        </linearGradient>
      </defs>
      <path d="M12,7 L28,7 L28,12 Q28,15 24,17 L24,18 L16,18 L16,17 Q12,15 12,12 Z" fill="#94a3b8" stroke="#475569" strokeWidth={1.6} />
      <path d="M13,18 L27,18 L27,74 Q27,77 20,77 Q13,77 13,74 Z" fill="none" stroke="#475569" strokeWidth={2} />
      {Array.from({ length: den + 1 }, (_, k) => <line key={k} x1={12} y1={BOT - (k / den) * H} x2={28} y2={BOT - (k / den) * H} stroke="#334155" strokeWidth={1} strokeDasharray="2.5 2" opacity={0.35} />)}
      {/* เส้นเป้าสีแดง */}
      <line x1={9} y1={targetY} x2={31} y2={targetY} stroke="#dc2626" strokeWidth={2.4} strokeDasharray={reached ? undefined : "4 2"} />
      <polygon points={`9,${targetY} 4,${targetY - 3} 4,${targetY + 3}`} fill="#dc2626" />
      <rect x={14} y={20} width={2} height={14} rx={1} fill="#fff" opacity={0.4} />
    </svg>
  );
}

/* ── ช่องเลือกจำนวนคละ ── */

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

/* ── ฉากสถานีน้ำ ── */

type Phase = "queue" | "arriving" | "ready" | "dry" | "opened" | "pouring" | "leaving" | "done";

function StationScene({ staff, staffName, den, sealed, openLevel, den2, gotLevel, custX, custFacing, custRunning, cust, custName, custMood, staffMood, target, phase, poppedFx }: {
  staff: Staff; staffName: string; den: number; sealed: number; openLevel: number; den2: number; gotLevel: number;
  custX: number; custFacing: 1 | -1; custRunning: boolean; cust: Runner; custName: string; custMood: VMood; staffMood: "normal" | "happy";
  target: number; phase: Phase; poppedFx: boolean;
}) {
  return (
    <div className="relative h-[400px] overflow-hidden rounded-2xl border-2 border-sky-300" style={SS}>
      <style>{`
        @keyframes pvBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        .pv-bob { animation: pvBob 0.22s steps(2) infinite; }
        @keyframes pvLeg { 0%,100% { transform: rotate(-26deg); } 50% { transform: rotate(26deg); } }
        .pv-leg1 { animation: pvLeg 0.22s steps(2) infinite; }
        .pv-leg2 { animation: pvLeg 0.22s steps(2) infinite reverse; }
        @keyframes pvArm { 0%,100% { transform: rotate(20deg); } 50% { transform: rotate(-20deg); } }
        .pv-arm1 { animation: pvArm 0.22s steps(2) infinite; }
        .pv-arm2 { animation: pvArm 0.22s steps(2) infinite reverse; }
        @keyframes sweatDrop { 0% { transform: translateY(0); opacity: .9; } 100% { transform: translateY(6px); opacity: 0; } }
        .pv-sweat { animation: sweatDrop 0.6s ease-in infinite; }
        @keyframes fizzPop { 0% { transform: scale(0.2) rotate(0); opacity: 0; } 50% { transform: scale(1.3) rotate(-10deg); opacity: 1; } 100% { transform: scale(1) rotate(0); opacity: 0; } }
        .fx-pop { animation: fizzPop 0.7s ease-out forwards; }
        @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }
        .fx-shake { animation: shake 0.35s ease-in-out; }
      `}</style>
      {/* ฟ้า + ธงราว */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-100 to-emerald-50" />
      <div className="pointer-events-none absolute left-4 top-2 text-2xl opacity-60">☁️</div>
      <div className="pointer-events-none absolute right-6 top-3 text-xl opacity-50">☁️</div>
      <div className="pointer-events-none absolute inset-x-2 top-9 flex justify-between">
        {Array.from({ length: 14 }, (_, i) => <span key={i} className="h-3.5 w-3.5" style={{ background: ["#f87171", "#fbbf24", "#34d399", "#60a5fa"][i % 4], clipPath: "polygon(0 0,100% 0,50% 100%)" }} />)}
      </div>
      <div className="absolute left-1/2 top-1 -translate-x-1/2 rounded-lg border-2 border-sky-900 bg-sky-50 px-4 py-1 text-sm font-extrabold text-sky-900 shadow">🥤 สถานีน้ำ กม.5</div>

      {/* พื้นถนนวิ่ง */}
      <div className="absolute inset-x-0 bottom-0" style={{ height: 100, background: "linear-gradient(180deg,#94a3b8,#64748b)" }} />
      <div className="absolute inset-x-0" style={{ bottom: 48, height: 3, background: "repeating-linear-gradient(90deg,#fef08a 0 18px,transparent 18px 34px)" }} />
      <div className="absolute inset-x-0" style={{ bottom: 100, height: 4, background: "#4ade80" }} />

      {/* โต๊ะสถานี */}
      <div className="absolute inset-x-0" style={{ bottom: 134, height: 28, background: "linear-gradient(180deg,#c58a52,#8a5a2e)", borderTop: "3px solid #6b4423" }} />

      {/* ป้าย "มีน้ำ" ลอยเหนือขวด (ไม่ทับขวด) */}
      <div className="absolute z-[4] flex flex-col items-center" style={{ left: "23%", bottom: 288, transform: "translateX(-50%)" }}>
        <div className="flex items-center gap-1.5 rounded-xl border-2 border-sky-300 bg-white px-3 py-1 shadow">
          <span className="text-sm font-extrabold text-sky-800">มีน้ำ</span>
          <MixedNum w={sealed} n={openLevel} den={den} size="sm" tone="text-sky-800" />
          <span className="text-sm font-extrabold text-sky-800">ขวด</span>
        </div>
        <span className="h-2.5 w-2.5 -translate-y-1 rotate-45 border-b-2 border-r-2 border-sky-300 bg-white" />
      </div>

      {/* ขวดบนโต๊ะ (สูงเท่ากันทุกใบ) */}
      <div className="absolute z-[3] flex items-end gap-2.5" style={{ left: "6%", bottom: 162 }}>
        {Array.from({ length: sealed }, (_, i) => <SealedBottle key={i} den={den} size={104} />)}
        <OpenBottle den={den} level={openLevel} size={104} />
      </div>
      {poppedFx && <span className="fx-pop absolute z-[6] text-4xl" style={{ left: "16%", bottom: 220 }}>✨🍾</span>}

      {/* สตาฟ */}
      <div className="absolute z-[3] flex flex-col items-center" style={{ left: "5%", bottom: 6 }}>
        <StaffKid kid={staff} mood={staffMood} size={104} />
        <span className="rounded bg-white/85 px-1.5 text-sm font-extrabold text-slate-700">{staffName}</span>
      </div>

      {/* นักวิ่ง (ตัวใหญ่โดดเด่น) */}
      <div className="absolute z-[5] flex flex-col items-center" style={{ left: `${custX}%`, bottom: 40, transform: "translateX(-50%)", transition: custRunning ? "left 0.5s linear" : "none" }}>
        {custMood === "ask" && (
          <SpeechBubble tone="border-sky-300 text-sky-700">
            <span className="inline-flex items-center gap-1.5">ขอน้ำ <MixedNum w={0} n={target} den={den2} size="sm" tone="text-sky-700" /> ขวดจ้า! 🥵</span>
          </SpeechBubble>
        )}
        {custMood === "worried" && <SpeechBubble tone="border-amber-300 text-amber-700">น้ำยังไม่ถึงเลย! 😥</SpeechBubble>}
        {custMood === "happy" && <SpeechBubble tone="border-emerald-300 text-emerald-700">สดชื่นมากเลย ขอบใจนะ! 💦</SpeechBubble>}
        <PixelRunner v={cust} mood={custMood} size={124} running={custRunning} facing={custFacing} />
        <span className="rounded bg-white/85 px-1.5 text-sm font-extrabold text-slate-700">{custName}</span>
      </div>

      {/* กระบอกของนักวิ่ง (แยกฝั่ง ไม่ทับตัวละคร) */}
      {phase !== "queue" && phase !== "arriving" && (
        <div className={cn("absolute z-[4] flex flex-col items-center rounded-xl border-2 border-emerald-300 bg-white/95 px-2 pb-1 pt-0.5 shadow-lg", phase === "dry" && "fx-shake")} style={{ left: `${clamp(custX - 20, 42, 78)}%`, bottom: 46, transform: "translateX(-50%)", transition: custRunning ? "left 0.5s linear" : "none" }}>
          <span className="text-xs font-extrabold text-emerald-700">🎽 กระบอกน้ำ</span>
          <RunnerBottle den={den2} level={gotLevel} target={target} size={96} />
          <span className="flex items-center gap-1 text-xs font-extrabold text-emerald-700">
            มี {gotLevel > 0 ? <MixedNum w={0} n={gotLevel} den={den2} size="sm" tone="text-emerald-700" /> : "0"} · เป้า <MixedNum w={0} n={target} den={den2} size="sm" tone="text-rose-500" />
          </span>
        </div>
      )}
    </div>
  );
}

/* ── เกมหลัก ── */

export function SubtractBottleGame() {
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

  const [staffIdx, setStaffIdx] = useState(0);
  const [custIdx, setCustIdx] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [staffNames, setStaffNames] = useState<string[]>(() => STAFFS.map((s) => s.name));
  const [custNames, setCustNames] = useState<string[]>(() => RUNNERS.map((v) => v.name));
  const [showNames, setShowNames] = useState(false);

  /* โจทย์: W n1/den − w2 n2/den (บังคับ n2 > n1 เสมอ = ต้องยืม) */
  const [den, setDen] = useState(5);
  const [w1, setW1] = useState(2);
  const [n1, setN1] = useState(1);
  const [w2, setW2] = useState(0);
  const [n2, setN2] = useState(4);

  /* สถานะฉาก */
  const [phase, setPhase] = useState<Phase>("queue");
  const [sealed, setSealed] = useState(2);
  const [openLevel, setOpenLevel] = useState(1); // เศษในขวดเปิด (อาจเกิน den ตอนเปิดขวดใหม่แล้ว)
  const [gotLevel, setGotLevel] = useState(0);    // น้ำในกระบอกนักวิ่ง
  const [custX, setCustX] = useState(ENTER_X);
  const [custFacing, setCustFacing] = useState<1 | -1>(-1);
  const [custRunning, setCustRunning] = useState(false);
  const [custMood, setCustMood] = useState<VMood>("run");
  const [staffMood, setStaffMood] = useState<"normal" | "happy">("normal");
  const [poppedFx, setPoppedFx] = useState(false);
  const [openedOnce, setOpenedOnce] = useState(false);
  const timeoutsRef = useRef<number[]>([]);
  useEffect(() => () => timeoutsRef.current.forEach((t) => window.clearTimeout(t)), []);

  /* ภารกิจ */
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [medals, setMedals] = useState(0);
  const [gW, setGW] = useState(0);
  const [gN, setGN] = useState(0);
  const [guessLocked, setGuessLocked] = useState(false);
  const [firstTry, setFirstTry] = useState(true);
  const [checked, setChecked] = useState<null | boolean>(null);
  const [gameOver, setGameOver] = useState(false);

  const resW = w1 - w2 - 1;
  const resN = n1 + den - n2;
  const target = n2; // นักวิ่งขอ w2 + n2/den (w2 มักเป็น 0 ในโจทย์ยืม)
  const canAct = phase === "ready" || phase === "dry";
  const staff = STAFFS[staffIdx];
  const cust = RUNNERS[custIdx];
  const staffName = staffNames[staffIdx];
  const custName = custNames[custIdx];
  const done = phase === "done";

  function resetScene(nw1: number, nn1: number) {
    setSealed(nw1); setOpenLevel(nn1); setGotLevel(0);
    setPhase("queue"); setCustRunning(false); setCustMood("run");
    setCustX(ENTER_X); setCustFacing(-1); setStaffMood("normal");
    setChecked(null); setGuessLocked(false); setPoppedFx(false); setOpenedOnce(false);
  }
  function setupProblem(nd: number, nw1: number, nn1: number, nw2: number, nn2: number, keepCust = false) {
    setDen(nd); setW1(nw1); setN1(nn1); setW2(nw2); setN2(nn2);
    resetScene(nw1, nn1);
    setGW(0); setGN(0); setFirstTry(true);
    if (!keepCust) setCustIdx((prev) => shuffle(RUNNERS.map((_, i) => i).filter((i) => i !== prev))[0] ?? prev);
  }
  /* บังคับ n2 > n1 เสมอ (ต้องยืม) + w2 < w1 */
  function normalize(nd: number, nw1: number, nn1: number, nw2: number, nn2: number): [number, number, number, number] {
    const W1v = Math.max(1, nw1);
    const N2 = clamp(nn2, 1, nd - 1);
    const N1 = clamp(nn1, 0, N2 - 1);
    const W2v = clamp(nw2, 0, W1v - 1);
    return [W1v, N1, W2v, N2];
  }
  function teacherSet(nd: number, nw1: number, nn1: number, nw2: number, nn2: number) {
    const [W1v, N1, W2v, N2] = normalize(nd, nw1, nn1, nw2, nn2);
    setupProblem(nd, W1v, N1, W2v, N2, true);
  }

  function callRunner() {
    if (phase !== "queue") return;
    ensure();
    setPhase("arriving");
    const at = (fn: () => void, ms: number) => timeoutsRef.current.push(window.setTimeout(fn, ms));
    at(() => { setCustRunning(true); setCustFacing(-1); setCustX(STAND_X); play("step"); }, 60);
    at(() => { setCustRunning(false); setCustMood("ask"); play("bell"); setPhase("ready"); }, 700);
  }

  /* เทน้ำจากขวดเปิดลงกระบอก */
  function pourWater() {
    if (!canAct) return;
    ensure();
    if (openLevel <= 0 || gotLevel >= target) return;
    setPhase("pouring"); play("glug");
    const willReach = gotLevel + openLevel >= target;
    const moveAmt = willReach ? target - gotLevel : openLevel;
    timeoutsRef.current.push(window.setTimeout(() => {
      setGotLevel((v) => v + moveAmt);
      setOpenLevel((v) => v - moveAmt);
      if (willReach) {
        finishPour();
      } else {
        play("dry");
        setCustMood("worried"); setStaffMood("normal");
        setPhase("dry");
      }
    }, 500));
  }

  /* เปิดขวดใหม่: 1 ขวดปิด → เทลงขวดเปิด (den/den) */
  function openBottle() {
    if (phase !== "dry" || sealed <= 0) return;
    ensure(); play("popfizz");
    setPoppedFx(true);
    timeoutsRef.current.push(window.setTimeout(() => setPoppedFx(false), 700));
    setSealed((v) => v - 1);
    setOpenLevel((v) => v + den);
    setOpenedOnce(true);
    setPhase("ready");
  }

  function finishPour() {
    setCustMood("happy"); setStaffMood("happy"); play("gulp");
    setPhase("leaving");
    timeoutsRef.current.push(window.setTimeout(() => {
      setPhase("done"); setStaffMood("normal");
      if (mode === "mission") {
        const ok = gW === resW && gN === resN;
        setChecked(ok);
        if (ok) {
          play("correct");
          setScore((s) => s + (firstTry ? 25 : 12));
          setMedals((m) => m + 1);
        } else play("wrong");
      } else play("ding");
    }, 1000));
  }

  /* ภารกิจ flow — บังคับยืมเสมอ: n2 > n1 */
  function randomProblem(level: 1 | 2): [number, number, number, number, number] {
    const nd = DEN_OPTIONS[randInt(1, DEN_OPTIONS.length - 1)];
    const N2 = randInt(1, nd - 1);
    const N1 = randInt(0, N2 - 1);
    const W1v = randInt(1, 3);
    const W2v = level === 1 ? 0 : randInt(0, W1v - 1);
    return [nd, W1v, N1, W2v, N2];
  }
  function startMissions() {
    ensure(); play("start");
    setScore(0); setMedals(0); setRound(1); setGameOver(false);
    setupProblem(5, 2, 1, 0, 4);
    setMode("mission");
  }
  function nextMission() {
    if (round >= MISSIONS_TOTAL) { setGameOver(true); play("star"); return; }
    const nr = round + 1;
    setRound(nr);
    const [nd, nw1, nn1, nw2, nn2] = randomProblem(nr <= 4 ? 1 : 2);
    setupProblem(nd, nw1, nn1, nw2, nn2);
  }

  const stars = score >= 170 ? 3 : score >= 120 ? 2 : 1;

  return (
    <div className="relative overflow-hidden rounded-2xl p-3 sm:p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-50 via-emerald-50 to-lime-50" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden text-2xl" aria-hidden>
        <span className="absolute left-4 top-5 opacity-40">🏃</span>
        <span className="absolute right-8 top-8 opacity-40">🥤</span>
        <span className="absolute bottom-8 left-8 opacity-30">🏁</span>
        <span className="absolute right-4 top-24 opacity-30">💦</span>
      </div>

      <div className="relative space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex rounded-xl border-2 border-slate-200 bg-white p-1">
            <button onClick={() => { setMode("lab"); resetScene(w1, n1); }} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "lab" ? "bg-sky-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <FlaskConical size={15} /> โหมดครู
            </button>
            <button onClick={startMissions} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "mission" ? "bg-emerald-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <Target size={15} /> สถานีน้ำ กม.5
            </button>
          </div>
          <button onClick={() => setMuted((m) => !m)} className="grid h-9 w-9 place-items-center rounded-xl border-2 border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50" title={muted ? "เปิดเสียง" : "ปิดเสียง"}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {mode === "mission" && gameOver ? (
          <div className="space-y-4 rounded-2xl border-2 border-emerald-300 bg-white/90 p-6 text-center">
            <div className="text-5xl">🏆🏃</div>
            <h3 className="text-xl font-extrabold text-slate-800 sm:text-2xl">นักวิ่งทุกคนเข้าเส้นชัยแล้ว!</h3>
            <p className="text-2xl">{"⭐".repeat(stars)}{"☆".repeat(3 - stars)}</p>
            <p className="text-base font-extrabold text-emerald-700">🏅 คะแนนรวม {score} · 🥇 เหรียญ {medals}</p>
            <button onClick={startMissions} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-sky-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
              <Play size={18} /> จัดงานวิ่งอีกรอบ
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {mode === "lab" ? (
              <div className="space-y-2 rounded-2xl border-2 border-sky-200 bg-white/90 px-3 py-2">
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
                  <span className="text-sm font-extrabold text-sky-700">🧑‍🏫 มีน้ำ:</span>
                  <MixedPicker w={w1} n={n1} den={den} setW={(v) => teacherSet(den, v, n1, w2, n2)} setN={(v) => teacherSet(den, w1, v, w2, n2)} tone="text-sky-700" />
                  <span className="text-2xl font-black text-slate-400">−</span>
                  <span className="text-sm font-extrabold text-slate-500">ขอ:</span>
                  <MixedPicker w={w2} n={n2} den={den} setW={(v) => teacherSet(den, w1, n1, v, n2)} setN={(v) => teacherSet(den, w1, n1, w2, v)} tone="text-rose-500" />
                  <span className="mx-1 text-slate-300">|</span>
                  <span className="text-sm font-extrabold text-slate-500">ส่วน</span>
                  {DEN_OPTIONS.map((d) => (
                    <button key={d} onClick={() => teacherSet(d, w1, Math.min(n1, d - 2), w2, Math.min(n2, d - 1))} className={cn("h-8 w-8 rounded-lg border-2 text-base font-extrabold transition", den === d ? "border-sky-500 bg-sky-100 text-sky-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>{d}</button>
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
                  <span className="text-sm font-extrabold text-slate-500">สตาฟ:</span>
                  {STAFFS.map((k, i) => (
                    <button key={i} onClick={() => setStaffIdx(i)} className={cn("rounded-lg border-2 p-0.5 transition", staffIdx === i ? "border-sky-400 bg-sky-50" : "border-slate-200 bg-white")}>
                      <StaffKid kid={k} mood="normal" size={30} />
                    </button>
                  ))}
                  <span className="mx-1 text-slate-300">|</span>
                  <span className="text-sm font-extrabold text-slate-500">นักวิ่ง:</span>
                  {RUNNERS.map((v, i) => (
                    <button key={i} onClick={() => { setCustIdx(i); resetScene(w1, n1); }} className={cn("rounded-lg border-2 p-0.5 transition", custIdx === i ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-white")} style={SS}>
                      <PixelRunner v={v} mood="run" size={30} />
                    </button>
                  ))}
                </div>
                {showNames && (
                  <div className="space-y-1.5 border-t border-slate-100 pt-1.5">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <span className="text-sm font-extrabold text-sky-700">✏️ ชื่อสตาฟ:</span>
                      {STAFFS.map((_, i) => (
                        <input key={i} value={staffNames[i]} maxLength={12} onChange={(e) => setStaffNames((ns) => { const nn = [...ns]; nn[i] = e.target.value; return nn; })} className="w-24 rounded-lg border-2 border-slate-200 bg-white px-2 py-1 text-sm font-extrabold text-slate-700 focus:border-sky-400 focus:outline-none" />
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <span className="text-sm font-extrabold text-sky-700">✏️ ชื่อนักวิ่ง:</span>
                      {RUNNERS.map((_, i) => (
                        <input key={i} value={custNames[i]} maxLength={12} onChange={(e) => setCustNames((ns) => { const nn = [...ns]; nn[i] = e.target.value; return nn; })} className="w-24 rounded-lg border-2 border-slate-200 bg-white px-2 py-1 text-sm font-extrabold text-slate-700 focus:border-sky-400 focus:outline-none" />
                      ))}
                      <button onClick={() => { setStaffNames(STAFFS.map((s) => s.name)); setCustNames(RUNNERS.map((v) => v.name)); }} className="rounded-lg border-2 border-slate-200 bg-white px-2 py-1 text-sm font-extrabold text-slate-500 hover:bg-slate-50">คืนค่าเดิม</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 rounded-2xl bg-white/90 px-4 py-2 ring-1 ring-emerald-200">
                <span className="text-base font-extrabold text-emerald-700">🏁 นักวิ่งที่ {round}/{MISSIONS_TOTAL}</span>
                <span className="text-base font-extrabold text-sky-600">🏅 {score}</span>
                <span className="text-base font-extrabold text-amber-600">🥇 {medals}</span>
              </div>
            )}

            {/* สมการใหญ่ */}
            <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-sky-200 bg-white/95 px-5 py-3 shadow-sm">
              <MixedNum w={w1} n={n1} den={den} size="lg" tone="text-sky-700" />
              <span className="text-3xl font-black text-slate-400">−</span>
              <MixedNum w={w2} n={n2} den={den} size="lg" tone="text-rose-500" />
              <span className="text-3xl font-black text-slate-400">=</span>
              {done || (mode === "lab" && reveal) ? (
                <MixedNum w={resW} n={resN} den={den} size="lg" tone={done ? "text-emerald-600" : "text-violet-500"} />
              ) : (
                <span className="grid h-12 w-12 place-items-center rounded-xl border-[3px] border-dashed border-sky-300 text-2xl font-black text-sky-400">?</span>
              )}
            </div>

            {/* บรรทัดยืม (โผล่หลังเปิดขวดแล้วเท่านั้น) */}
            {openedOnce && (
              <div className="rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-2 text-center">
                <span className="flex flex-wrap items-center justify-center gap-1.5 text-base font-extrabold text-amber-700">
                  ยืม 1 เต็มมาแตก: <MixedNum w={w1} n={n1} den={den} size="sm" tone="text-amber-700" /> = <MixedNum w={w1 - 1} n={n1 + den} den={den} size="sm" tone="text-amber-700" />
                </span>
              </div>
            )}

            {/* ฉาก */}
            <StationScene
              staff={staff} staffName={staffName} den={den} sealed={sealed} openLevel={openLevel} den2={den}
              gotLevel={gotLevel} custX={custX} custFacing={custFacing} custRunning={custRunning}
              cust={cust} custName={custName} custMood={custMood} staffMood={staffMood}
              target={target} phase={phase} poppedFx={poppedFx}
            />

            {/* คำอธิบายผล */}
            {done && (
              <p className="flex flex-wrap items-center justify-center gap-1.5 text-center text-base font-extrabold text-slate-600">
                ให้น้ำ {custName} ไป <MixedNum w={w2} n={n2} den={den} size="sm" tone="text-rose-500" /> — เศษไม่พอ ต้องยืม 1 เต็มมาแตกเป็น {den}/{den} เหลือ <MixedNum w={resW} n={resN} den={den} size="sm" tone="text-emerald-600" /> ขวด
              </p>
            )}

            {/* โหมดภารกิจ: ทายก่อน */}
            {mode === "mission" && (phase === "queue" || ((phase === "arriving" || phase === "ready") && !guessLocked)) && (
              <div className="space-y-2 rounded-2xl border-2 border-emerald-200 bg-white/90 p-3">
                <p className="flex flex-wrap items-center justify-center gap-1.5 text-center text-base font-extrabold text-slate-600">
                  🤔 ทายก่อน: ให้น้ำ <MixedNum w={w2} n={n2} den={den} size="sm" tone="text-rose-500" /> แก่ {custName} แล้วจะเหลือเท่าไร?
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <MixedPicker w={gW} n={gN} den={den} setW={setGW} setN={setGN} tone="text-emerald-600" />
                  <button
                    onClick={() => {
                      setFirstTry(true); setGuessLocked(true);
                      if (phase === "queue") callRunner();
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-sky-500 px-6 py-2.5 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]"
                  >
                    ✅ ยืนยันคำตอบ แล้วเทน้ำเอง!
                  </button>
                </div>
              </div>
            )}

            {/* ปุ่มควบคุม (เท / เปิดขวด) */}
            {(mode === "lab" || guessLocked) && (phase === "ready" || phase === "dry" || phase === "pouring") && (
              <div className="space-y-1.5 rounded-2xl border-2 border-sky-200 bg-white/90 p-3">
                {phase === "dry" ? (
                  <>
                    <p className="text-center text-base font-extrabold text-rose-500">💧 น้ำในขวดเปิดไม่พอ! ({n1}/{den} {"<"} {n2}/{den}) ทำไงดี?</p>
                    <div className="flex justify-center">
                      <button onClick={openBottle} disabled={sealed <= 0} className="inline-flex animate-pulse items-center gap-2 rounded-xl border-b-4 border-amber-800 bg-gradient-to-b from-amber-400 to-amber-500 px-7 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.97] active:border-b-2 disabled:animate-none disabled:opacity-40">
                        🔓 เปิดขวดใหม่!
                      </button>
                    </div>
                  </>
                ) : phase === "pouring" ? (
                  <p className="text-center text-base font-extrabold text-slate-500">🫗 กำลังเท…</p>
                ) : (
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button onClick={pourWater} disabled={openLevel <= 0} className="inline-flex items-center gap-2 rounded-xl border-b-4 border-sky-700 bg-gradient-to-b from-sky-500 to-sky-600 px-7 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.97] active:border-b-2 disabled:opacity-40">
                      🫗 เทใส่กระบอก
                    </button>
                    {openLevel <= 0 && sealed > 0 && (
                      <button onClick={openBottle} className="inline-flex items-center gap-1.5 rounded-xl border-b-4 border-amber-800 bg-gradient-to-b from-amber-400 to-amber-500 px-4 py-2 text-sm font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.97] active:border-b-2">
                        🔓 เปิดขวดใหม่
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ผลทาย */}
            {mode === "mission" && checked !== null && (
              <div className={cn("rounded-2xl border-2 p-3 text-center", checked ? "border-emerald-300 bg-emerald-50" : "border-rose-300 bg-rose-50")}>
                <p className={cn("flex flex-wrap items-center justify-center gap-1.5 text-base font-extrabold", checked ? "text-emerald-700" : "text-rose-600")}>
                  {checked
                    ? <>🎉 ทายถูก! เหลือ <MixedNum w={resW} n={resN} den={den} size="sm" tone="text-emerald-700" /> ขวด</>
                    : <>ทาย <MixedNum w={gW} n={gN} den={den} size="sm" tone="text-rose-600" /> แต่เหลือจริง <MixedNum w={resW} n={resN} den={den} size="sm" tone="text-rose-600" /> — {gN === n2 - n1 ? "ห้ามสลับเศษ! ต้องยืม 1 เต็มมาแตกก่อน" : "อย่าลืมยืม 1 เต็มมาแตกเป็นเศษนะ"}</>}
                </p>
                <button onClick={nextMission} className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-sky-500 px-6 py-2 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                  {round >= MISSIONS_TOTAL ? "🏁 จบงานวิ่ง" : <>นักวิ่งคนต่อไป <ArrowRight size={16} /></>}
                </button>
              </div>
            )}

            {/* ปุ่มควบคุม (โหมดครู) */}
            {mode === "lab" && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                {phase === "queue" ? (
                  <button onClick={callRunner} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-emerald-500 px-6 py-2.5 text-base font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
                    🏃 เรียกนักวิ่งเข้าสถานี
                  </button>
                ) : phase === "done" ? (
                  <button onClick={() => resetScene(w1, n1)} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-5 py-2 text-base font-extrabold text-slate-500 transition hover:bg-slate-50">
                    <RotateCcw size={15} /> เริ่มใหม่
                  </button>
                ) : phase === "arriving" || phase === "leaving" ? (
                  <span className="text-base font-extrabold text-slate-500">🏃 นักวิ่งกำลังมา…</span>
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

type SoundKind = "bell" | "glug" | "dry" | "popfizz" | "gulp" | "step" | "ding" | "correct" | "wrong" | "start" | "star";

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
  function sweep(f1: number, f2: number, dur: number, type: OscillatorType, gain: number) {
    if (mutedRef.current) return;
    const ctx = ensure();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f1, t);
    osc.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur);
  }
  function burst(dur: number, gain: number) {
    if (mutedRef.current) return;
    const ctx = ensure();
    if (!ctx) return;
    const n = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, ctx.currentTime);
    src.connect(g).connect(ctx.destination);
    src.start();
  }
  function play(kind: SoundKind) {
    switch (kind) {
      case "bell": return tones([1568, 1976], 0.06, 0.14, "sine", 0.1);
      case "glug": return tones([500, 420, 500, 420], 0.09, 0.08, "sine", 0.06);
      case "dry": return sweep(400, 140, 0.4, "sawtooth", 0.08);
      case "popfizz": { burst(0.15, 0.15); return sweep(300, 1400, 0.3, "sine", 0.07); }
      case "gulp": return tones([392, 440, 494], 0.09, 0.14, "triangle", 0.11);
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

/* ── เพลงวิ่งมาราธอน (ชิปทูน ไม่ใช้ไฟล์) ── */

const MR_LEAD = [74, 0, 74, 76, 77, 0, 76, 74, 72, 0, 72, 74, 76, 0, 0, 0, 77, 0, 77, 79, 81, 0, 79, 77, 76, 0, 76, 74, 72, 0, 0, 0];
const MR_BASS = [43, 43, 50, 50, 45, 45, 52, 52, 41, 41, 48, 48, 43, 43, 50, 50];

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
      const m = MR_LEAD[s];
      if (m) note(m, 0.13, "square", 0.03);
      if (s % 2 === 0) {
        const b = MR_BASS[s / 2];
        if (b) note(b, 0.22, "triangle", 0.05);
      }
    }, 165);
  }
  function stop() {
    if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
  }
  useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);
  return { start, stop };
}
