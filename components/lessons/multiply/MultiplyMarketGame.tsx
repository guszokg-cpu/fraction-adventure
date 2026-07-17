"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Play, RotateCcw, Volume2, VolumeX, FlaskConical, Target, ArrowRight, Eye, EyeOff, Pencil } from "lucide-react";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { Frac } from "@/components/lessons/Frac";
import { cn } from "@/lib/cn";
import { randInt, shuffle } from "@/lib/randomFraction";

/* ── ค่าคงที่ ── */

const DEN_OPTIONS = [2, 3, 4, 5, 6, 8];
const MISSIONS_TOTAL = 8;
const SS = { shapeRendering: "crispEdges" as const };
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/* สินค้าในตลาด (สลับบริบทได้) */
const PRODUCTS = [
  { key: "sugar", name: "น้ำตาลทราย", emoji: "🍬", sack: "#fef3c7", band: "#f59e0b", grain: "#fde68a" },
  { key: "rice", name: "ข้าวสาร", emoji: "🌾", sack: "#f1f5f9", band: "#a16207", grain: "#e2e8f0" },
  { key: "flour", name: "แป้งสาลี", emoji: "🥖", sack: "#faf5ff", band: "#a855f7", grain: "#f3e8ff" },
  { key: "driedfish", name: "ปลาแห้ง", emoji: "🐟", sack: "#fed7aa", band: "#c2410c", grain: "#fdba74" },
];

/* ── เสียง ── */

type SoundKind = "place" | "tick" | "correct" | "wrong" | "start" | "star" | "coin" | "pick";

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
  function thud(freq: number, dur: number, gain: number) {
    if (mutedRef.current) return;
    const ctx = ensure();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, t + dur);
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur);
  }
  function play(kind: SoundKind) {
    switch (kind) {
      case "place": return thud(180, 0.22, 0.14);
      case "tick": return tones([1400], 0.03, 0.04, "square", 0.05);
      case "pick": return tones([740, 988], 0.05, 0.09, "triangle", 0.09);
      case "correct": return tones([660, 990, 1319], 0.06, 0.1, "triangle", 0.14);
      case "wrong": return tones([220, 165], 0.11, 0.18, "sawtooth", 0.09);
      case "start": return tones([523, 659, 784], 0.07, 0.12, "triangle", 0.14);
      case "star": return tones([1047, 1319, 1568, 2093], 0.07, 0.14, "triangle", 0.14);
      case "coin": return tones([988, 1319], 0.06, 0.12, "square", 0.09);
    }
  }
  return { play, ensure };
}

/* ── เพลงตลาดสดใส (ชิปทูน ไม่ใช้ไฟล์) ── */

const MK_LEAD = [72, 0, 76, 79, 0, 76, 72, 0, 74, 0, 77, 81, 0, 77, 74, 0, 71, 0, 74, 79, 0, 74, 71, 0, 72, 76, 72, 0, 67, 0, 0, 0];
const MK_BASS = [48, 55, 48, 55, 50, 57, 50, 57, 47, 55, 47, 55, 48, 52, 48, 43];

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
      const m = MK_LEAD[s];
      if (m) note(m, 0.2, "square", 0.024);
      if (s % 2 === 0) {
        const b = MK_BASS[s / 2];
        if (b) note(b, 0.32, "triangle", 0.05);
      }
    }, 200);
  }
  function stop() {
    if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
  }
  useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);
  return { start, stop };
}

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

/* ── ตัวละครพิกเซล (แม่ค้า/ลูกค้า) ── */

type PType = "auntie" | "grandma" | "boy" | "girl" | "man";
type Person = { type: PType; name: string; skin: string; body: string; dark: string; hair: string };

const SELLERS: Person[] = [
  { type: "auntie", name: "แม่ค้าสมศรี", skin: "#f0c9a0", body: "#e11d48", dark: "#9f1239", hair: "#2b1d10" },
  { type: "man", name: "พ่อค้าสมชาย", skin: "#e0b487", body: "#0891b2", dark: "#155e63", hair: "#1c1c1c" },
  { type: "grandma", name: "ยายมาลี", skin: "#eec6a0", body: "#7c3aed", dark: "#5b21b6", hair: "#d4d4d8" },
];
const CUSTOMERS: Person[] = [
  { type: "girl", name: "น้องพลอย", skin: "#ffd9c9", body: "#ec4899", dark: "#9d2660", hair: "#3b2412" },
  { type: "boy", name: "น้องเจได", skin: "#f5cba3", body: "#2563eb", dark: "#1e3a8a", hair: "#1c1c1c" },
  { type: "man", name: "ลุงวิรัช", skin: "#dcae82", body: "#16a34a", dark: "#166534", hair: "#2d2013" },
  { type: "grandma", name: "ยายบุญมา", skin: "#e8c7a2", body: "#f59e0b", dark: "#b45309", hair: "#e5e5e5" },
];

function PixelPerson({ p, mood, size = 92, apron = false }: { p: Person; mood: "normal" | "happy"; size?: number; apron?: boolean }) {
  return (
    <svg viewBox="0 0 40 56" width={size * 0.71} height={size} style={SS} role="img" aria-label={p.name}>
      {/* ผม/หมวก */}
      {p.type === "auntie" && <path d="M9,11 Q9,3 20,3 Q31,3 31,11 L31,9 Q26,6 20,6 Q14,6 9,9 Z" fill={p.hair} />}
      {p.type === "grandma" && <path d="M9,12 Q9,3 20,3 Q31,3 31,12 Q31,7 20,7 Q9,7 9,12 Z" fill={p.hair} />}
      {p.type === "girl" && <>
        <path d="M9,12 Q9,3 20,3 Q31,3 31,12 L31,9 Q26,6 20,6 Q14,6 9,9 Z" fill={p.hair} />
        <rect x={6} y={12} width={4} height={9} rx={2} fill={p.hair} /><rect x={30} y={12} width={4} height={9} rx={2} fill={p.hair} />
      </>}
      {p.type === "boy" && <path d="M10,11 Q10,3 20,3 Q30,3 30,11 L30,9 Q25,6 20,6 Q15,6 10,9 Z" fill={p.hair} />}
      {p.type === "man" && <path d="M10,10 Q10,3 20,3 Q30,3 30,10 L30,9 Q25,6 20,6 Q15,6 10,9 Z" fill={p.hair} />}
      {/* หน้า */}
      <rect x={11} y={7} width={18} height={17} rx={5} fill={p.skin} stroke="#00000022" strokeWidth={1} />
      <rect x={15} y={14} width={3} height={4} rx={1} fill="#1e293b" />
      <rect x={22} y={14} width={3} height={4} rx={1} fill="#1e293b" />
      {mood === "happy"
        ? <path d="M16,19 Q20,22 24,19" stroke="#1e293b" strokeWidth={1.5} fill="none" strokeLinecap="round" />
        : <path d="M16,19.5 Q20,21 24,19.5" stroke="#1e293b" strokeWidth={1.4} fill="none" strokeLinecap="round" />}
      <circle cx={14} cy={19} r={1.6} fill="#fb7185" opacity={0.5} />
      <circle cx={26} cy={19} r={1.6} fill="#fb7185" opacity={0.5} />
      {/* ตัว */}
      <rect x={11} y={24} width={18} height={18} rx={3} fill={p.body} stroke="#00000022" strokeWidth={1.2} />
      {apron && <><rect x={14} y={26} width={12} height={15} rx={1.5} fill="#fff" opacity={0.85} /><rect x={14} y={26} width={12} height={2.5} fill={p.dark} /></>}
      {/* แขน */}
      <rect x={6} y={25} width={5} height={13} rx={2.5} fill={p.body} stroke="#00000022" strokeWidth={1} />
      <circle cx={8.5} cy={38} r={2.5} fill={p.skin} />
      <rect x={29} y={25} width={5} height={13} rx={2.5} fill={p.body} stroke="#00000022" strokeWidth={1} />
      <circle cx={31.5} cy={38} r={2.5} fill={p.skin} />
      {/* ขา */}
      <rect x={14} y={42} width={5.5} height={13} rx={2} fill={p.dark} />
      <rect x={20.5} y={42} width={5.5} height={13} rx={2} fill={p.dark} />
      <rect x={13} y={54} width={7} height={3.5} rx={1.5} fill="#334155" />
      <rect x={20} y={54} width={7} height={3.5} rx={1.5} fill="#334155" />
    </svg>
  );
}

/* ── ถุงสินค้า (มีป้ายน้ำหนัก a/b) ── */

function Sack({ prod, a, b, size = 54, showWeight = true }: { prod: typeof PRODUCTS[number]; a: number; b: number; size?: number; showWeight?: boolean }) {
  return (
    <svg viewBox="0 0 46 50" width={size * 0.92} height={size} role="img" aria-label={`ถุง${prod.name} ${a}/${b} กก.`}>
      {/* ปากถุงมัด */}
      <path d="M17,7 Q23,2 29,7 L27,12 L19,12 Z" fill={prod.band} />
      <ellipse cx={23} cy={7} rx={5} ry={2} fill={prod.grain} stroke={prod.band} strokeWidth={1} />
      {/* ตัวถุง */}
      <path d="M11,13 Q23,9 35,13 L37,44 Q23,49 9,44 Z" fill={prod.sack} stroke={prod.band} strokeWidth={1.8} />
      <path d="M11,13 Q23,17 35,13" fill="none" stroke={prod.band} strokeWidth={1.2} opacity={0.6} />
      {/* แถบป้าย */}
      <rect x={11} y={24} width={24} height={13} rx={2} fill="#fff" stroke={prod.band} strokeWidth={1.2} opacity={0.95} />
      {showWeight ? (
        <>
          <text x={17} y={34} fontSize={10} fontWeight={900} fill={prod.band} textAnchor="middle">{a}</text>
          <line x1={20} y1={26} x2={20} y2={35} stroke={prod.band} strokeWidth={1.2} transform="rotate(20 20 30.5)" />
          <text x={25} y={35} fontSize={10} fontWeight={900} fill={prod.band} textAnchor="middle">{b}</text>
          <text x={31} y={33} fontSize={5.5} fontWeight={800} fill={prod.band} textAnchor="middle">กก.</text>
        </>
      ) : (
        <text x={23} y={33} fontSize={13} textAnchor="middle">{prod.emoji}</text>
      )}
    </svg>
  );
}

/* ── เครื่องชั่งสปริงหน้าปัดเข็มหมุน ── */

function DialScale({ placed, a, b, prod, dialMax, animating }: {
  placed: number; a: number; b: number; prod: typeof PRODUCTS[number]; dialMax: number; animating: boolean;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const cx = 140, cy = 250, R = 78;                 // จุดหมุนเข็ม + รัศมีหน้าปัด
  const value = (placed * a) / b;                    // น้ำหนักปัจจุบัน (กก.)
  const f = clamp(value / dialMax, 0, 1);
  const needleDeg = -90 + f * 180;                   // -90°=ซ้าย(0) → +90°=ขวา(max)
  // จุดบนส่วนโค้งจากค่า v
  const pt = (v: number, rad: number) => {
    const r = (-90 + (v / dialMax) * 180) * Math.PI / 180;
    return [cx + rad * Math.sin(r), cy - rad * Math.cos(r)];
  };
  const panY = 118;                                  // ระดับจานชั่ง
  return (
    <svg viewBox="0 40 560 300" className="w-full" role="img" aria-label="เครื่องชั่งน้ำหนัก">
      <defs>
        <linearGradient id={`body${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e2e8f0" /><stop offset="1" stopColor="#94a3b8" />
        </linearGradient>
        <radialGradient id={`dial${uid}`} cx="0.5" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#f1f5f9" />
        </radialGradient>
      </defs>
      <style>{`
        @keyframes mkDrop { 0% { transform: translateY(-46px); opacity: 0; } 70% { transform: translateY(3px); } 100% { transform: translateY(0); opacity: 1; } }
        .mk-drop { animation: mkDrop 0.42s cubic-bezier(.5,1.4,.6,1) both; }
        @keyframes mkShine { 0%,100% { opacity: .25; } 50% { opacity: .6; } }
      `}</style>

      {/* เงาพื้น */}
      <ellipse cx={cx} cy={318} rx={116} ry={11} fill="#00000015" />

      {/* ฐาน + เสา */}
      <rect x={cx - 96} y={306} width={192} height={13} rx={6} fill={`url(#body${uid})`} stroke="#64748b" strokeWidth={1.6} />
      {/* ตัวเครื่อง (กล่องหน้าปัด) */}
      <rect x={cx - 96} y={182} width={192} height={128} rx={16} fill={`url(#body${uid})`} stroke="#64748b" strokeWidth={2.4} />

      {/* เสาจับจาน */}
      <rect x={cx - 6} y={panY + 6} width={12} height={64} rx={4} fill="#cbd5e1" stroke="#64748b" strokeWidth={1.6} />

      {/* หน้าปัด */}
      <circle cx={cx} cy={cy} r={R + 6} fill="#1e293b" />
      <circle cx={cx} cy={cy} r={R} fill={`url(#dial${uid})`} stroke="#cbd5e1" strokeWidth={2} />
      {/* ส่วนโค้งสเกล */}
      <path d={`M ${cx - R + 12} ${cy} A ${R - 12} ${R - 12} 0 0 1 ${cx + R - 12} ${cy}`} fill="none" stroke="#e2e8f0" strokeWidth={7} />
      {/* โซนไฮไลต์ที่คำตอบ (ค่าจริง) */}
      {(() => {
        const target = (placed * a) / b;
        const [sx, sy] = pt(0, R - 12);
        const [ex, ey] = pt(Math.min(target, dialMax), R - 12);
        if (target <= 0.001) return null;
        const large = (target / dialMax) > 0.5 ? 1 : 0;
        return <path d={`M ${sx} ${sy} A ${R - 12} ${R - 12} 0 ${large} 1 ${ex} ${ey}`} fill="none" stroke={prod.band} strokeWidth={7} strokeLinecap="round" opacity={0.85} style={{ transition: "all 0.45s ease" }} />;
      })()}
      {/* ขีดจำนวนเต็ม + ตัวเลข กก. */}
      {Array.from({ length: dialMax + 1 }, (_, k) => {
        const [ox, oy] = pt(k, R - 4);
        const [ix, iy] = pt(k, R - 16);
        const [lx, ly] = pt(k, R - 27);
        return (
          <g key={k}>
            <line x1={ix} y1={iy} x2={ox} y2={oy} stroke="#475569" strokeWidth={2.2} />
            <text x={lx} y={ly + 3.5} fontSize={11} fontWeight={900} fill="#475569" textAnchor="middle">{k}</text>
          </g>
        );
      })}
      {/* ขีดย่อยเศษ (ทุก 1/b) */}
      {Array.from({ length: dialMax * b + 1 }, (_, k) => {
        if (k % b === 0) return null;
        const [ox, oy] = pt(k / b, R - 4);
        const [ix, iy] = pt(k / b, R - 11);
        return <line key={`m${k}`} x1={ix} y1={iy} x2={ox} y2={oy} stroke="#94a3b8" strokeWidth={1} />;
      })}
      {/* หน่วย */}
      <text x={cx} y={cy - 26} fontSize={9} fontWeight={800} fill="#94a3b8" textAnchor="middle">กิโลกรัม</text>

      {/* เข็มชี้ */}
      <g style={{ transform: `rotate(${needleDeg}deg)`, transformOrigin: `${cx}px ${cy}px`, transition: `transform ${animating ? 0.42 : 0.3}s cubic-bezier(.5,1.2,.5,1)` }}>
        <polygon points={`${cx - 3},${cy} ${cx + 3},${cy} ${cx + 1},${cy - R + 8} ${cx - 1},${cy - R + 8}`} fill="#dc2626" />
        <rect x={cx - 3} y={cy - 1} width={16} height={2.4} rx={1} fill="#dc2626" opacity={0.7} />
      </g>
      <circle cx={cx} cy={cy} r={7} fill="#334155" stroke="#fff" strokeWidth={1.6} />
      <circle cx={cx} cy={cy} r={2.5} fill="#94a3b8" />

      {/* จานชั่ง */}
      <ellipse cx={cx} cy={panY + 4} rx={92} ry={17} fill="#cbd5e1" stroke="#64748b" strokeWidth={2} />
      <ellipse cx={cx} cy={panY} rx={92} ry={17} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={2} />
      <ellipse cx={cx} cy={panY - 1} rx={80} ry={13} fill="#f1f5f9" opacity={0.7} />

      {/* ถุงที่วางบนจาน (ซ้อนกอง) — ตำแหน่งใช้ SVG transform, ปล่อยให้ CSS animation จัดการแค่ตกลงมา */}
      <g>
        {Array.from({ length: placed }, (_, i) => {
          const perRow = 3;
          const row = Math.floor(i / perRow);
          const col = i % perRow;
          const rowCount = Math.min(perRow, placed - row * perRow);
          const bx = cx + (col - (rowCount - 1) / 2) * 30 - 19;
          const by = panY - 4 - row * 28 - 40;
          return (
            <g key={i} transform={`translate(${bx}, ${by})`}>
              <g className="mk-drop">
                <Sack prod={prod} a={a} b={b} size={42} showWeight={false} />
              </g>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

/* ── ตัวเลือกจำนวน ── */

function NumPicker({ label, value, min, max, onChange, color }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void; color: string }) {
  const btn = "h-8 w-8 rounded-lg border-2 border-slate-200 bg-white text-lg font-extrabold text-slate-600 hover:bg-slate-50 active:scale-95 disabled:opacity-40";
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs font-extrabold text-slate-500">{label}</span>
      <button onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} className={btn}>−</button>
      <span className={cn("w-8 text-center text-2xl font-extrabold", color)}>{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} className={btn}>+</button>
    </div>
  );
}

/* ── เกมหลัก ── */

export function MultiplyMarketGame() {
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

  /* โจทย์: n ถุง ถุงละ a/b กก. */
  const [den, setDen] = useState(4);   // b
  const [per, setPer] = useState(3);   // a (เศษต่อถุง, a<b)
  const [bags, setBags] = useState(3); // n
  const [prodIdx, setProdIdx] = useState(0);
  const [reveal, setReveal] = useState(false);

  /* ตัวละคร + ชื่อ */
  const [sellerIdx, setSellerIdx] = useState(0);
  const [custIdx, setCustIdx] = useState(0);
  const [sellerNames, setSellerNames] = useState<string[]>(() => SELLERS.map((s) => s.name));
  const [custNames, setCustNames] = useState<string[]>(() => CUSTOMERS.map((c) => c.name));
  const [showNames, setShowNames] = useState(false);

  /* สถานะเครื่องชั่ง */
  const [placed, setPlaced] = useState(0);
  const [animating, setAnimating] = useState(false);
  const timeoutsRef = useRef<number[]>([]);
  useEffect(() => () => timeoutsRef.current.forEach((t) => window.clearTimeout(t)), []);

  /* ภารกิจ */
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [guessW, setGuessW] = useState(0);
  const [guessN, setGuessN] = useState(0);
  const [firstTry, setFirstTry] = useState(true);
  const [checked, setChecked] = useState<null | boolean>(null);
  const [gameOver, setGameOver] = useState(false);

  const prod = PRODUCTS[prodIdx];
  const seller = { ...SELLERS[sellerIdx], name: sellerNames[sellerIdx] };
  const cust = { ...CUSTOMERS[custIdx], name: custNames[custIdx] };

  const totalNumRaw = bags * per;              // na
  const totalWhole = Math.floor(totalNumRaw / den);
  const totalNum = totalNumRaw % den;
  const dialMax = Math.max(1, Math.ceil(totalNumRaw / den));
  const done = placed === bags && bags > 0;
  const showAnswer = done || (mode === "lab" && reveal);

  function resetScale() { setPlaced(0); setAnimating(false); setChecked(null); }
  function setupProblem(nb: number, na: number, nn: number, pi = prodIdx) {
    setBags(nb); setPer(na); setDen(nn); setProdIdx(pi);
    resetScale(); setGuessW(0); setGuessN(0); setFirstTry(true);
  }

  /* วางถุงทีละใบ */
  function placeOne() {
    if (animating || placed >= bags) return;
    ensure();
    setAnimating(true);
    play("place");
    setPlaced((p) => p + 1);
    timeoutsRef.current.push(window.setTimeout(() => { play("tick"); setAnimating(false); }, 430));
  }

  /* วางที่เหลือทั้งหมด (ทีละใบต่อเนื่อง) แล้วเช็ก (โหมดภารกิจ) */
  function placeAll(evalGuess = false) {
    if (animating) return;
    ensure();
    const remain = bags - placed;
    if (remain <= 0) { if (evalGuess) evaluate(); return; }
    setAnimating(true);
    for (let i = 0; i < remain; i++) {
      timeoutsRef.current.push(window.setTimeout(() => {
        play("place");
        setPlaced((p) => p + 1);
        play("tick");
      }, i * 360));
    }
    timeoutsRef.current.push(window.setTimeout(() => {
      setAnimating(false);
      if (evalGuess) evaluate();
    }, remain * 360 + 260));
  }

  function evaluate() {
    const ok = guessW === totalWhole && guessN === totalNum;
    setChecked(ok);
    if (ok) { play("correct"); play("coin"); setScore((s) => s + (firstTry ? 25 : 12)); setCoins((c) => c + bags); }
    else play("wrong");
  }

  /* ภารกิจ flow */
  function randomProblem(): [number, number, number, number] {
    const nd = DEN_OPTIONS[randInt(1, DEN_OPTIONS.length - 1)];
    const na = randInt(1, nd - 1);           // a<b (เศษต่อถุง)
    const nb = randInt(2, 6);                 // n ถุง
    const pi = randInt(0, PRODUCTS.length - 1);
    return [nb, na, nd, pi];
  }
  function startMissions() {
    ensure(); play("start");
    setScore(0); setCoins(0); setRound(1); setGameOver(false);
    setupProblem(3, 3, 4, 0);
    setMode("mission");
  }
  function nextMission() {
    if (round >= MISSIONS_TOTAL) { setGameOver(true); play("star"); return; }
    setRound((r) => r + 1);
    const [nb, na, nd, pi] = randomProblem();
    setupProblem(nb, na, nd, pi);
    setCustIdx((prev) => shuffle(CUSTOMERS.map((_, i) => i).filter((i) => i !== prev))[0] ?? prev);
  }

  const stars = score >= 170 ? 3 : score >= 100 ? 2 : 1;
  const curNumRaw = placed * per;
  const curWhole = Math.floor(curNumRaw / den);
  const curNum = curNumRaw % den;

  return (
    <div className="relative overflow-hidden rounded-2xl p-3 sm:p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-100 via-orange-50 to-yellow-50" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden text-2xl" aria-hidden>
        <span className="absolute left-4 top-4 opacity-40">🧺</span>
        <span className="absolute right-8 top-7 opacity-40">🍎</span>
        <span className="absolute bottom-8 right-6 opacity-30">🥬</span>
        <span className="absolute left-8 top-24 opacity-30">🍊</span>
      </div>

      <div className="relative space-y-3">
        {/* โหมด + ปิดเสียง */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex rounded-xl border-2 border-slate-200 bg-white p-1">
            <button onClick={() => { setMode("lab"); resetScale(); }} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "lab" ? "bg-amber-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <FlaskConical size={15} /> โหมดครู
            </button>
            <button onClick={startMissions} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "mission" ? "bg-orange-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <Target size={15} /> โหมดทายก่อนชั่ง
            </button>
          </div>
          <button onClick={() => setMuted((m) => !m)} className="grid h-9 w-9 place-items-center rounded-xl border-2 border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50" title={muted ? "เปิดเสียง" : "ปิดเสียง"}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {mode === "mission" && gameOver ? (
          <div className="space-y-4 rounded-2xl border-2 border-orange-300 bg-white/90 p-6 text-center">
            <div className="text-5xl">⚖️🏆</div>
            <h3 className="text-xl font-extrabold text-slate-800 sm:text-2xl">ปิดแผงตลาดวันนี้!</h3>
            <p className="text-2xl">{"⭐".repeat(stars)}{"☆".repeat(3 - stars)}</p>
            <p className="text-base font-extrabold text-orange-700">🏅 คะแนน {score} · 🪙 เหรียญ {coins}</p>
            <button onClick={startMissions} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
              <Play size={18} /> เปิดแผงใหม่
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* แถบตั้งค่า (ครู) / สถานะ (ภารกิจ) */}
            {mode === "lab" ? (
              <div className="space-y-2 rounded-2xl border-2 border-amber-200 bg-white/90 px-3 py-2">
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
                  <span className="text-sm font-extrabold text-amber-700">🧑‍🏫 ตั้งโจทย์:</span>
                  <NumPicker label="ซื้อ (ถุง)" value={bags} min={1} max={8} onChange={(v) => setupProblem(v, per, den)} color="text-orange-600" />
                  <span className="text-xl font-black text-slate-400">×</span>
                  <NumPicker label="ถุงละ" value={per} min={1} max={den - 1} onChange={(v) => setupProblem(bags, v, den)} color="text-emerald-600" />
                  <span className="mx-1 text-slate-300">|</span>
                  <span className="text-xs font-extrabold text-slate-500">ส่วน</span>
                  {DEN_OPTIONS.map((d) => (
                    <button key={d} onClick={() => setupProblem(bags, Math.min(per, d - 1), d)} className={cn("h-7 w-7 rounded-lg border-2 text-sm font-extrabold transition", den === d ? "border-amber-500 bg-amber-100 text-amber-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>{d}</button>
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="text-xs font-extrabold text-slate-500">สินค้า:</span>
                  {PRODUCTS.map((p, i) => (
                    <button key={p.key} onClick={() => setupProblem(bags, per, den, i)} className={cn("flex items-center gap-1 rounded-lg border-2 px-2 py-1 text-xs font-extrabold transition", prodIdx === i ? "border-amber-500 bg-amber-100 text-amber-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
                      <span>{p.emoji}</span>{p.name}
                    </button>
                  ))}
                  <span className="mx-1 text-slate-300">|</span>
                  <button onClick={() => setReveal((v) => !v)} className={cn("flex items-center gap-1 rounded-lg border-2 px-2 py-1 text-xs font-extrabold transition", reveal ? "border-violet-400 bg-violet-100 text-violet-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
                    {reveal ? <EyeOff size={13} /> : <Eye size={13} />} เฉลย
                  </button>
                  <button onClick={() => setShowNames((v) => !v)} className={cn("flex items-center gap-1 rounded-lg border-2 px-2 py-1 text-xs font-extrabold transition", showNames ? "border-sky-400 bg-sky-100 text-sky-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
                    <Pencil size={13} /> แก้ชื่อ
                  </button>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="text-xs font-extrabold text-slate-500">แม่ค้า:</span>
                  {SELLERS.map((s, i) => (
                    <button key={i} onClick={() => setSellerIdx(i)} className={cn("rounded-lg border-2 p-0.5 transition", sellerIdx === i ? "border-amber-400 bg-amber-50" : "border-slate-200 bg-white")}>
                      <PixelPerson p={s} mood="normal" size={28} apron />
                    </button>
                  ))}
                  <span className="mx-1 text-slate-300">|</span>
                  <span className="text-xs font-extrabold text-slate-500">ลูกค้า:</span>
                  {CUSTOMERS.map((c, i) => (
                    <button key={i} onClick={() => setCustIdx(i)} className={cn("rounded-lg border-2 p-0.5 transition", custIdx === i ? "border-orange-400 bg-orange-50" : "border-slate-200 bg-white")}>
                      <PixelPerson p={c} mood="normal" size={28} />
                    </button>
                  ))}
                </div>
                {showNames && (
                  <div className="space-y-1.5 border-t border-slate-100 pt-1.5">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <span className="text-sm font-extrabold text-sky-700">✏️ ชื่อแม่ค้า:</span>
                      {SELLERS.map((_, i) => (
                        <input key={i} value={sellerNames[i]} maxLength={12} onChange={(e) => setSellerNames((ns) => { const nn = [...ns]; nn[i] = e.target.value; return nn; })} className="w-28 rounded-lg border-2 border-slate-200 bg-white px-2 py-1 text-sm font-extrabold text-slate-700 focus:border-sky-400 focus:outline-none" />
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <span className="text-sm font-extrabold text-sky-700">✏️ ชื่อลูกค้า:</span>
                      {CUSTOMERS.map((_, i) => (
                        <input key={i} value={custNames[i]} maxLength={12} onChange={(e) => setCustNames((ns) => { const nn = [...ns]; nn[i] = e.target.value; return nn; })} className="w-28 rounded-lg border-2 border-slate-200 bg-white px-2 py-1 text-sm font-extrabold text-slate-700 focus:border-sky-400 focus:outline-none" />
                      ))}
                      <button onClick={() => { setSellerNames(SELLERS.map((s) => s.name)); setCustNames(CUSTOMERS.map((c) => c.name)); }} className="rounded-lg border-2 border-slate-200 bg-white px-2 py-1 text-sm font-extrabold text-slate-500 hover:bg-slate-50">คืนค่าเดิม</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 rounded-2xl bg-white/90 px-4 py-2 ring-1 ring-orange-200">
                <span className="text-base font-extrabold text-orange-700">🛒 คิว {round}/{MISSIONS_TOTAL}</span>
                <span className="text-base font-extrabold text-amber-600">🏅 {score}</span>
                <span className="text-base font-extrabold text-yellow-600">🪙 {coins}</span>
              </div>
            )}

            {/* การ์ดโจทย์ปัญหา (แบบข้อสอบ) */}
            <div className="rounded-2xl border-2 border-orange-200 bg-white/95 px-4 py-3 text-center shadow-sm">
              <p className="text-base font-extrabold leading-relaxed text-slate-700 sm:text-lg">
                <span className="text-orange-600">{cust.name}</span> ซื้อ<span className="text-amber-700">{prod.name}</span> {bags} ถุง
                ถุงละ <span className="inline-flex translate-y-1.5"><MixedNum w={0} n={per} den={den} size="sm" tone="text-emerald-600" /></span> กิโลกรัม
                <br className="sm:hidden" /> ได้{prod.name}ทั้งหมดกี่กิโลกรัม?
              </p>
            </div>

            {/* สมการใหญ่ */}
            <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-amber-200 bg-white/95 px-5 py-2.5 shadow-sm">
              <span className="text-3xl font-black text-orange-600 sm:text-4xl">{bags}</span>
              <span className="text-3xl font-black text-slate-400">×</span>
              <StackedFraction numerator={per} denominator={den} className="text-3xl sm:text-4xl" toneClassName="text-emerald-600" />
              <span className="text-3xl font-black text-slate-400">=</span>
              {showAnswer ? (
                <MixedNum w={totalWhole} n={totalNum} den={den} size="lg" tone={done ? "text-amber-600" : "text-violet-500"} />
              ) : (
                <span className="grid h-12 w-12 place-items-center rounded-xl border-[3px] border-dashed border-amber-300 text-2xl font-black text-amber-400">?</span>
              )}
            </div>

            {/* ฉากตลาด: แม่ค้า + เครื่องชั่ง + ลูกค้า */}
            <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-b from-orange-100/60 to-amber-50/60 p-2">
              <div className="relative">
                {/* หลังคาแผงลายทาง */}
                <div className="flex h-5 overflow-hidden rounded-t-xl">
                  {Array.from({ length: 14 }, (_, i) => (
                    <div key={i} className="flex-1" style={{ background: i % 2 ? "#f97316" : "#fde68a" }} />
                  ))}
                </div>
                <div className="relative flex items-end justify-between px-1 pt-1">
                  {/* แม่ค้า */}
                  <div className="flex shrink-0 flex-col items-center">
                    <PixelPerson p={seller} mood={done ? "happy" : "normal"} size={78} apron />
                    <span className="mt-0.5 rounded-full bg-amber-600 px-2 py-0.5 text-[11px] font-extrabold text-white">{seller.name}</span>
                  </div>
                  {/* เครื่องชั่ง */}
                  <div className="min-w-0 flex-1">
                    <DialScale placed={placed} a={per} b={den} prod={prod} dialMax={dialMax} animating={animating} />
                    {/* อ่านค่าน้ำหนักปัจจุบัน */}
                    <div className="-mt-1 flex items-center justify-center gap-2">
                      <span className="rounded-full bg-white px-3 py-0.5 text-sm font-extrabold text-slate-600 shadow-sm ring-1 ring-amber-200">
                        วางแล้ว {placed}/{bags} ถุง · เข็มชี้ <span className="inline-flex translate-y-1"><MixedNum w={curWhole} n={curNum} den={den} size="sm" tone="text-amber-600" /></span> กก.
                      </span>
                    </div>
                  </div>
                  {/* ลูกค้า */}
                  <div className="flex shrink-0 flex-col items-center">
                    <PixelPerson p={cust} mood={done ? "happy" : "normal"} size={78} />
                    <span className="mt-0.5 rounded-full bg-orange-600 px-2 py-0.5 text-[11px] font-extrabold text-white">{cust.name}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* คำอธิบายผล */}
            {done && (
              <p className="text-center text-sm font-extrabold text-slate-600">
                วาง {bags} ถุง ถุงละ <Frac n={per} d={den} tone="text-emerald-600" /> กก. →
                เอาตัวเศษมารวมกัน {bags} ครั้ง = <Frac n={totalNumRaw} d={den} tone="text-amber-600" />
                {totalNum === 0 ? <> = <b className="text-amber-600">{totalWhole}</b> กก.</> : totalWhole > 0 ? <> = <span className="text-amber-600"><b>{totalWhole}</b> กับ <Frac n={totalNum} d={den} tone="text-amber-600" /></span> กก.</> : <> กก.</>}
                {" "}— <span className="text-rose-500">ตัวส่วนไม่คูณ!</span> ทุกถุงยังแบ่ง {den} เท่าเท่าเดิม
              </p>
            )}

            {/* โหมดทายก่อนชั่ง */}
            {mode === "mission" && placed === 0 && !animating && checked === null && (
              <div className="space-y-2 rounded-2xl border-2 border-orange-200 bg-white/90 p-3">
                <p className="text-center text-sm font-extrabold text-slate-600">🤔 ทายก่อน: ได้{prod.name}ทั้งหมดกี่กิโลกรัม?</p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <div className="flex items-center gap-2 rounded-xl border-2 border-orange-200 bg-orange-50 px-3 py-1.5">
                    <span className="text-xs font-extrabold text-slate-500">จำนวนเต็ม</span>
                    <button onClick={() => setGuessW((g) => Math.max(0, g - 1))} className="h-8 w-8 rounded-lg border-2 border-slate-200 bg-white text-lg font-extrabold text-slate-600 active:scale-95">−</button>
                    <span className="w-7 text-center text-2xl font-extrabold text-orange-600">{guessW}</span>
                    <button onClick={() => setGuessW((g) => Math.min(12, g + 1))} className="h-8 w-8 rounded-lg border-2 border-slate-200 bg-white text-lg font-extrabold text-slate-600 active:scale-95">+</button>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border-2 border-emerald-200 bg-emerald-50 px-3 py-1.5">
                    <span className="text-xs font-extrabold text-slate-500">เศษ</span>
                    <button onClick={() => setGuessN((g) => Math.max(0, g - 1))} className="h-8 w-8 rounded-lg border-2 border-slate-200 bg-white text-lg font-extrabold text-slate-600 active:scale-95">−</button>
                    <span className="inline-flex flex-col items-center px-1">
                      <span className="text-xl font-extrabold text-emerald-600">{guessN}</span>
                      <span className="h-[3px] w-6 rounded bg-emerald-600" />
                      <span className="text-xl font-extrabold text-slate-400">{den}</span>
                    </span>
                    <button onClick={() => setGuessN((g) => Math.min(den - 1, g + 1))} className="h-8 w-8 rounded-lg border-2 border-slate-200 bg-white text-lg font-extrabold text-slate-600 active:scale-95">+</button>
                  </div>
                  <button onClick={() => { setFirstTry(true); placeAll(true); }} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-2.5 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                    ⚖️ ชั่งพิสูจน์!
                  </button>
                </div>
              </div>
            )}

            {/* ผลทาย */}
            {mode === "mission" && checked !== null && (
              <div className={cn("rounded-2xl border-2 p-3 text-center", checked ? "border-emerald-300 bg-emerald-50" : "border-rose-300 bg-rose-50")}>
                <p className={cn("text-base font-extrabold", checked ? "text-emerald-700" : "text-rose-600")}>
                  {checked
                    ? <>🎉 เก่งมาก! {bags} × <Frac n={per} d={den} /> = <Frac n={totalNumRaw} d={den} />{totalNum === 0 ? <> = {totalWhole} กก.</> : totalWhole > 0 ? <> = {totalWhole} กับ <Frac n={totalNum} d={den} /> กก.</> : <> กก.</>}</>
                    : <>ทาย {guessW > 0 ? guessW + " " : ""}<Frac n={guessN} d={den} /> — จริง ๆ คือ {totalWhole > 0 ? totalWhole + " " : ""}<Frac n={totalNum} d={den} /> กก. (เอาเศษ {per} มารวม {bags} ครั้ง = <Frac n={totalNumRaw} d={den} />)</>}
                </p>
                <button onClick={nextMission} className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-2 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                  {round >= MISSIONS_TOTAL ? "🏁 ดูสรุปผล" : <>ลูกค้าคนต่อไป <ArrowRight size={16} /></>}
                </button>
              </div>
            )}

            {/* ปุ่มควบคุม (โหมดครู) */}
            {mode === "lab" && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                {placed < bags ? (
                  <>
                    <button onClick={placeOne} disabled={animating} className="inline-flex items-center gap-2 rounded-xl border-b-4 border-orange-700 bg-gradient-to-b from-amber-500 to-orange-600 px-5 py-2.5 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.97] active:border-b-2 disabled:opacity-50">
                      <Sack prod={prod} a={per} b={den} size={26} showWeight={false} /> วางถุงลงตาชั่ง
                    </button>
                    <button onClick={() => placeAll()} disabled={animating} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-5 py-2.5 text-base font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98] disabled:opacity-50">
                      ⚖️ วางครบทุกถุง
                    </button>
                    {placed > 0 && (
                      <button onClick={resetScale} disabled={animating} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-3 py-1.5 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50 disabled:opacity-50">
                        <RotateCcw size={14} /> ยกออก
                      </button>
                    )}
                  </>
                ) : (
                  <button onClick={resetScale} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-5 py-2 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50">
                    <RotateCcw size={15} /> ชั่งใหม่อีกครั้ง
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
