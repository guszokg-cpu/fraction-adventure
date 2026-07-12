"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, FlaskConical, Car as CarIcon, Eye, EyeOff, RotateCcw, Dice5, ArrowRight, Play, MapPin } from "lucide-react";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { cn } from "@/lib/cn";
import { randInt, shuffle } from "@/lib/randomFraction";

/* ── ค่าคงที่ ── */

const MISSIONS_TOTAL = 8;
const ROAD_L = 7;   // จุดออกตัว (%)
const ROAD_R = 90;  // เส้นชัย (%)
const ROAD_Y = 64;  // ระดับพื้นถนน (px จากล่าง)

/* ชนิดรถให้เลือก */
type VType = "pickup" | "moto" | "van" | "bus" | "super";
const VEHICLES: { id: VType; name: string; emoji: string }[] = [
  { id: "pickup", name: "กระบะ", emoji: "🛻" },
  { id: "moto", name: "มอเตอร์ไซค์", emoji: "🏍️" },
  { id: "van", name: "รถตู้", emoji: "🚐" },
  { id: "bus", name: "รถบัส", emoji: "🚌" },
  { id: "super", name: "ซุปเปอร์คาร์", emoji: "🏎️" },
];
/* สีรถให้เลือก */
const COLORS = [
  { name: "แดง", body: "#ef4444", dark: "#b91c1c" },
  { name: "ส้ม", body: "#f97316", dark: "#c2410c" },
  { name: "เหลือง", body: "#f5b60a", dark: "#b45309" },
  { name: "เขียว", body: "#22c55e", dark: "#15803d" },
  { name: "ฟ้า", body: "#3b82f6", dark: "#1d4ed8" },
  { name: "ม่วง", body: "#a855f7", dark: "#7e22ce" },
  { name: "ชมพู", body: "#ec4899", dark: "#be185d" },
  { name: "ดำ", body: "#334155", dark: "#0f172a" },
];

/** ตัวหารของ total ในช่วง [lo,hi] (จำนวนช่องที่แบ่งแล้วลงตัว) */
function divisorsInRange(total: number, lo = 3, hi = 12): number[] {
  const ds: number[] = [];
  for (let d = lo; d <= hi; d++) if (total % d === 0) ds.push(d);
  return ds.length ? ds : [5];
}

type Option = { id: number; num: number };
type KmOption = { id: number; km: number };
type Mode = "teacher" | "solo" | "distance";
type Phase = "pick" | "drive" | "arrive" | "short" | "over";
type Ask = "driven" | "remaining";

/* เส้นทางจริง — total หารด้วย den ลงตัวเสมอ (กม./ช่อง เป็นจำนวนเต็ม) */
const ROUTES = [
  { from: "บ้าน", to: "เชียงใหม่", emoji: "🏔️", total: 800, unit: "กม.", den: 5 },   // 160/ช่อง
  { from: "บ้าน", to: "ภูเก็ต", emoji: "🏖️", total: 900, unit: "กม.", den: 6 },      // 150
  { from: "บ้าน", to: "ขอนแก่น", emoji: "🌾", total: 400, unit: "กม.", den: 4 },     // 100
  { from: "โรงเรียน", to: "สวนสัตว์", emoji: "🦁", total: 60, unit: "กม.", den: 5 },  // 12
  { from: "จุดสตาร์ท", to: "เส้นชัยวิ่ง", emoji: "🏁", total: 800, unit: "ม.", den: 8 }, // 100 ม.
];
const DRIVERS = ["ครูธิติ", "ครูแนน", "ครูบอล", "น้องพลอย", "น้องข้าวปั้น"];

/* ── โจทย์ ── */

function pickDen(level: 1 | 2): number {
  return level === 1 ? [4, 5, 6][randInt(0, 2)] : [6, 8, 10][randInt(0, 2)];
}

/** ตัวเลือกระยะที่เหลือ — มีคำตอบถูก (den-a) + ตัวลวง เลขไม่ซ้ำกันเลย */
function genOptions(den: number, a: number): Option[] {
  const needed = den - a;
  const avail: number[] = [];
  for (let n = 1; n <= den - 1; n++) if (n !== needed) avail.push(n);
  const count = Math.min(4, den - 1);
  const decoys = shuffle(avail).slice(0, Math.max(0, count - 1));
  return shuffle([needed, ...decoys]).map((n, i) => ({ id: i + 1, num: n }));
}

/** ตัวเลือกระยะทางจริง (กม./ม.) — คำตอบถูก + ตัวลวงที่เด็กมักพลาด (อีกส่วน/ระยะรวม/คลาดไป 1 ช่อง) */
function genKmOptions(correct: number, step: number, total: number): KmOption[] {
  const pool = [total - correct, total, correct + step, correct - step, correct + 2 * step];
  const seen = new Set<number>([correct]);
  const decoys: number[] = [];
  for (const v of pool) {
    if (v > 0 && !seen.has(v)) { seen.add(v); decoys.push(v); }
    if (decoys.length >= 3) break;
  }
  return shuffle([correct, ...decoys]).map((km, i) => ({ id: i + 1, km }));
}

/* ── เสียง (Web Audio ไม่ใช้ไฟล์) ── */

type SoundKind = "vroom" | "select" | "honk" | "arrive" | "wrong" | "start";

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
  function play(kind: SoundKind) {
    switch (kind) {
      case "vroom": return sweep(140, 380, 1.1, "sawtooth", 0.05);
      case "select": return tones([523, 784], 0.05, 0.11, "square", 0.08);
      case "honk": return tones([440, 392], 0.09, 0.16, "square", 0.09);
      case "arrive": return tones([523, 659, 784, 1047, 1319], 0.09, 0.16, "triangle", 0.15);
      case "wrong": return sweep(400, 120, 0.45, "sawtooth", 0.09);
      case "start": return tones([392, 523, 659], 0.07, 0.12, "triangle", 0.13);
    }
  }
  return { play, ensure };
}

/* ── เพลงขับรถ (ชิปทูน ไม่ใช้ไฟล์) ── */

const CR_LEAD = [72, 0, 72, 74, 76, 0, 74, 72, 76, 0, 79, 0, 77, 76, 74, 0, 72, 0, 72, 74, 76, 0, 77, 79, 81, 0, 79, 76, 72, 0, 0, 0];
const CR_BASS = [48, 55, 48, 55, 53, 60, 53, 60, 50, 57, 50, 57, 43, 50, 47, 50];

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
      const m = CR_LEAD[s];
      if (m) note(m, 0.16, "square", 0.028);
      if (s % 2 === 0) {
        const b = CR_BASS[s / 2];
        if (b) note(b, 0.3, "triangle", 0.05);
      }
    }, 195);
  }
  function stop() {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }
  useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);
  return { start, stop };
}

/* ── รถหลายชนิด (เลือกแบบ + สีได้) ── */

function Wheel({ cx, cy, r, driving }: { cx: number; cy: number; r: number; driving: boolean }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#1f2937" stroke="#0f172a" strokeWidth={1.5} />
      <circle cx={cx} cy={cy} r={r * 0.42} fill="#cbd5e1" />
      <g className={driving ? "cj-wheel" : undefined} style={{ transformOrigin: `${cx}px ${cy}px` }}>
        <line x1={cx - r * 0.82} y1={cy} x2={cx + r * 0.82} y2={cy} stroke="#e2e8f0" strokeWidth={1.4} />
        <line x1={cx} y1={cy - r * 0.82} x2={cx} y2={cy + r * 0.82} stroke="#e2e8f0" strokeWidth={1.4} />
      </g>
    </g>
  );
}

const GLASS = "#cffafe";

function Vehicle({ type, body, dark, driving, size = 54 }: { type: VType; body: string; dark: string; driving: boolean; size?: number }) {
  const common = { fill: body, stroke: dark };
  if (type === "pickup") {
    return (
      <svg viewBox="0 0 112 60" width={size * 112 / 60} height={size} role="img" aria-label="รถกระบะ">
        <rect x={6} y={34} width={56} height={11} rx={2} {...common} strokeWidth={2.5} />
        <rect x={6} y={20} width={5} height={16} rx={2} {...common} strokeWidth={2} />
        <path d="M60,44 L60,16 Q60,14 62,14 L92,14 Q98,14 102,26 L104,44 Z" {...common} strokeWidth={2.5} strokeLinejoin="round" />
        <path d="M68,26 Q69,19 76,19 L88,19 Q93,20 96,26 Z" fill={GLASS} stroke={dark} strokeWidth={1.3} />
        <circle cx={104} cy={38} r={3} fill="#fde68a" stroke="#f59e0b" strokeWidth={1} />
        <Wheel cx={30} cy={48} r={10} driving={driving} />
        <Wheel cx={88} cy={48} r={10} driving={driving} />
      </svg>
    );
  }
  if (type === "moto") {
    return (
      <svg viewBox="0 0 96 60" width={size * 96 / 60} height={size} role="img" aria-label="มอเตอร์ไซค์">
        <path d="M22,46 L48,34 L70,46" fill="none" stroke={dark} strokeWidth={3} strokeLinecap="round" />
        <path d="M48,34 L58,22" stroke={dark} strokeWidth={3} strokeLinecap="round" />
        <path d="M54,22 L70,20" stroke={dark} strokeWidth={3} strokeLinecap="round" />
        <rect x={32} y={30} width={22} height={7} rx={3} {...common} strokeWidth={1.5} />
        <rect x={40} y={13} width={13} height={18} rx={4} {...common} strokeWidth={2} />
        <circle cx={46} cy={11} r={6} fill="#f8b56a" stroke={dark} strokeWidth={2} />
        <circle cx={70} cy={44} r={3} fill="#fde68a" stroke="#f59e0b" strokeWidth={1} />
        <Wheel cx={22} cy={46} r={13} driving={driving} />
        <Wheel cx={74} cy={46} r={13} driving={driving} />
      </svg>
    );
  }
  if (type === "van") {
    return (
      <svg viewBox="0 0 106 60" width={size * 106 / 60} height={size} role="img" aria-label="รถตู้">
        <path d="M8,14 L82,14 Q96,15 100,26 L100,45 L8,45 Z" {...common} strokeWidth={2.5} strokeLinejoin="round" />
        <rect x={16} y={18} width={26} height={13} rx={2} fill={GLASS} stroke={dark} strokeWidth={1.3} />
        <rect x={46} y={18} width={22} height={13} rx={2} fill={GLASS} stroke={dark} strokeWidth={1.3} />
        <path d="M84,18 Q92,19 96,26 L84,26 Z" fill={GLASS} stroke={dark} strokeWidth={1.3} />
        <circle cx={99} cy={39} r={3} fill="#fde68a" stroke="#f59e0b" strokeWidth={1} />
        <Wheel cx={30} cy={48} r={10} driving={driving} />
        <Wheel cx={82} cy={48} r={10} driving={driving} />
      </svg>
    );
  }
  if (type === "bus") {
    return (
      <svg viewBox="0 0 128 60" width={size * 128 / 60} height={size} role="img" aria-label="รถบัส">
        <rect x={6} y={12} width={116} height={33} rx={7} {...common} strokeWidth={2.5} />
        {[16, 40, 64, 88].map((x) => <rect key={x} x={x} y={18} width={19} height={13} rx={2} fill={GLASS} stroke={dark} strokeWidth={1.2} />)}
        <rect x={110} y={18} width={9} height={20} rx={2} fill={GLASS} stroke={dark} strokeWidth={1.2} />
        <rect x={6} y={37} width={116} height={4} fill={dark} opacity={0.5} />
        <circle cx={120} cy={40} r={2.6} fill="#fde68a" stroke="#f59e0b" strokeWidth={1} />
        <Wheel cx={34} cy={48} r={10} driving={driving} />
        <Wheel cx={100} cy={48} r={10} driving={driving} />
      </svg>
    );
  }
  // supercar
  return (
    <svg viewBox="0 0 118 56" width={size * 118 / 56} height={size} role="img" aria-label="ซุปเปอร์คาร์">
      <rect x={2} y={24} width={12} height={4} rx={1.5} {...common} strokeWidth={1.5} />
      <path d="M6,40 L18,30 Q40,19 66,19 L82,20 Q102,24 112,36 L114,42 Q114,44 111,44 L8,44 Q5,44 6,40 Z" {...common} strokeWidth={2.5} strokeLinejoin="round" />
      <path d="M40,30 Q46,22 62,22 L74,23 Q84,25 90,31 Z" fill={GLASS} stroke={dark} strokeWidth={1.3} />
      <circle cx={110} cy={38} r={2.6} fill="#fde68a" stroke="#f59e0b" strokeWidth={1} />
      <Wheel cx={32} cy={44} r={11} driving={driving} />
      <Wheel cx={88} cy={44} r={11} driving={driving} />
    </svg>
  );
}

/* ── ช่องเติมเศษในสมการ ── */

function AddendSlot({ v, den, tone }: { v: number | null; den: number; tone: string }) {
  if (v === null)
    return (
      <span className="inline-flex flex-col items-center rounded-lg border-2 border-dashed border-slate-300 px-2 py-0.5 leading-none">
        <span className="text-2xl font-black text-slate-300">?</span>
        <span className="my-0.5 h-0.5 w-5 rounded bg-slate-300" />
        <span className="text-lg font-black text-slate-400">{den}</span>
      </span>
    );
  return <StackedFraction numerator={v} denominator={den} className="text-2xl sm:text-3xl" toneClassName={tone} />;
}

/* ── ฉากถนนสู่เส้นชัย ── */

function RoadScene({ den, leg1, carPos, vType, vBody, vDark, phase, driving, kmLabels, signLabel, arriveLabel }: {
  den: number; leg1: number; carPos: number; vType: VType; vBody: string; vDark: string; phase: Phase; driving: boolean;
  kmLabels?: string[]; signLabel?: string; arriveLabel?: string;
}) {
  const posOf = (d: number) => ROAD_L + (d / den) * (ROAD_R - ROAD_L);
  const legPos = posOf(leg1);

  return (
    <div className="relative h-[210px] overflow-hidden rounded-2xl border-2 border-slate-300">
      {/* ฟ้า + ทิวเขา + เมฆ */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-200 to-emerald-100" />
      <div className="cj-cloud pointer-events-none absolute top-4 text-3xl opacity-70">☁️</div>
      <div className="cj-cloud2 pointer-events-none absolute top-9 text-2xl opacity-50">☁️</div>
      <div className="absolute inset-x-0" style={{ bottom: ROAD_Y + 18, height: 44, background: "linear-gradient(180deg,transparent,#86c98e 85%)", clipPath: "polygon(0 100%,16% 45%,34% 80%,52% 35%,72% 72%,88% 40%,100% 75%,100% 100%)", opacity: 0.55 }} />

      {/* หญ้าข้างทาง */}
      <div className="absolute inset-x-0 bottom-0" style={{ height: ROAD_Y + 12, background: "linear-gradient(180deg,#6ab86f,#4d9e57)" }} />

      {/* ถนน */}
      <div className="absolute inset-x-0" style={{ bottom: ROAD_Y - 30, height: 42, background: "linear-gradient(180deg,#4b5563,#374151)" }} />
      <div className="absolute inset-x-0" style={{ bottom: ROAD_Y - 31, height: 3, background: "#facc15", opacity: 0.85 }} />

      {/* แถบระยะที่ขับไปแล้ว (odometer) */}
      <div
        className="absolute rounded-r"
        style={{ left: `${ROAD_L}%`, width: `${Math.max(0, carPos - ROAD_L)}%`, bottom: ROAD_Y - 21, height: 8, background: "linear-gradient(90deg,#34d399,#10b981)", transition: driving ? "width 1.3s cubic-bezier(.35,.1,.4,1)" : "none" }}
      />

      {/* หลักกิโล (den ช่อง) + ป้ายระยะจริง */}
      {Array.from({ length: den + 1 }, (_, k) => (
        <div key={k}>
          <div className="absolute" style={{ left: `${posOf(k)}%`, bottom: ROAD_Y - 12, transform: "translateX(-50%)" }}>
            <div className="mx-auto w-[2px]" style={{ height: 9, background: "rgba(255,255,255,0.75)" }} />
          </div>
          {kmLabels && (
            <div className="absolute z-[2] whitespace-nowrap text-[8px] font-extrabold text-emerald-900/80" style={{ left: `${posOf(k)}%`, bottom: 4, transform: "translateX(-50%)" }}>{kmLabels[k]}</div>
          )}
        </div>
      ))}

      {/* ป้ายบอกจุดเที่ยวแรก */}
      <div className="absolute z-[3] flex flex-col items-center" style={{ left: `${legPos}%`, bottom: ROAD_Y + 10, transform: "translateX(-50%)" }}>
        <span className="whitespace-nowrap rounded-md bg-slate-800 px-1.5 py-0.5 text-[10px] font-extrabold text-white shadow">{signLabel ?? `ไปแล้ว ${leg1}/${den}`}</span>
        <span className="h-3 w-[2px] bg-slate-700" />
      </div>

      {/* เส้นชัย */}
      <div className="absolute z-[3] flex flex-col items-center" style={{ left: `${ROAD_R}%`, bottom: ROAD_Y - 12, transform: "translateX(-50%)" }}>
        <span className="text-2xl">🏁</span>
        <div className="w-[3px]" style={{ height: 20, background: "repeating-linear-gradient(180deg,#111 0 4px,#fff 4px 8px)" }} />
      </div>
      <div className="absolute z-[2] text-[10px] font-extrabold text-emerald-800" style={{ left: `${ROAD_L}%`, bottom: ROAD_Y + 12, transform: "translateX(-50%)" }}>ออกตัว</div>

      {/* รถ */}
      <div className="absolute z-[5]" style={{ left: `${carPos}%`, bottom: ROAD_Y - 14, transform: "translateX(-50%)", transition: driving ? "left 1.3s cubic-bezier(.35,.1,.4,1)" : "none" }}>
        <Vehicle type={vType} body={vBody} dark={vDark} driving={driving} size={52} />
      </div>

      {/* ป้ายผล */}
      {phase === "arrive" && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <span className="cj-pop rounded-2xl bg-emerald-500 px-7 py-2.5 text-3xl font-black text-white shadow-xl ring-4 ring-emerald-200">{arriveLabel ?? "ถึงเส้นชัย! 🏁"}</span>
        </div>
      )}
      {phase === "short" && (
        <div className="pointer-events-none absolute inset-x-0 top-3 grid place-items-center">
          <span className="cj-pop rounded-xl bg-rose-500 px-5 py-2 text-xl font-black text-white shadow-lg">ยังไม่ถึง! 🚧</span>
        </div>
      )}
      {phase === "over" && (
        <div className="pointer-events-none absolute inset-x-0 top-3 grid place-items-center">
          <span className="cj-pop rounded-xl bg-orange-500 px-5 py-2 text-xl font-black text-white shadow-lg">เลยเส้นชัย! 💨</span>
        </div>
      )}
    </div>
  );
}

/* ── เกมหลัก ── */

export function AddJourneyGame() {
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

  const [mode, setMode] = useState<Mode>("teacher");
  const [level, setLevel] = useState<1 | 2>(1);
  const [vehicleIdx, setVehicleIdx] = useState(0);
  const [colorIdx, setColorIdx] = useState(0);

  /* โจทย์ */
  const [den, setDen] = useState(5);
  const [leg1, setLeg1] = useState(2);
  const [options, setOptions] = useState<Option[]>(() => genOptions(5, 2));
  const [picked, setPicked] = useState<number | null>(null); // id ตัวเลือก
  const [phase, setPhase] = useState<Phase>("pick");
  const [carPos, setCarPos] = useState(ROAD_L + (2 / 5) * (ROAD_R - ROAD_L));
  const [driving, setDriving] = useState(false);

  /* โหมดเล่น */
  const [started, setStarted] = useState(false);
  const [over, setOver] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);

  /* โหมดระยะจริง */
  const [place, setPlace] = useState<{ from: string; to: string; emoji: string }>({ from: ROUTES[0].from, to: ROUTES[0].to, emoji: ROUTES[0].emoji });
  const [total, setTotal] = useState(ROUTES[0].total);
  const [unit, setUnit] = useState(ROUTES[0].unit);
  const [ask, setAsk] = useState<Ask>("remaining");
  const [driver, setDriver] = useState(DRIVERS[0]);
  const [kmOptions, setKmOptions] = useState<KmOption[]>(() => genKmOptions(480, 160, 800));
  const [kmPick, setKmPick] = useState<number | null>(null);
  const [showKm, setShowKm] = useState(false);

  const timeoutsRef = useRef<number[]>([]);
  const push = (id: number) => timeoutsRef.current.push(id);
  useEffect(() => () => timeoutsRef.current.forEach((t) => window.clearTimeout(t)), []);

  const posOf = (d: number) => ROAD_L + (d / den) * (ROAD_R - ROAD_L);
  const pickedNum = picked !== null ? options.find((o) => o.id === picked)?.num ?? null : null;
  const needed = den - leg1;
  const vBody = COLORS[colorIdx].body;
  const vDark = COLORS[colorIdx].dark;
  const vType = VEHICLES[vehicleIdx].id;

  /* ค่าจากโหมดระยะจริง */
  const kmStep = total / den;
  const startSeg = ask === "remaining" ? leg1 : 0;
  const targetSeg = ask === "remaining" ? den : leg1;
  const correctKm = (targetSeg - startSeg) * kmStep;
  const pickedKm = kmPick !== null ? kmOptions.find((o) => o.id === kmPick)?.km ?? null : null;
  const denOptions = divisorsInRange(total, 3, 12);

  function loadProblem(nd: number, na: number) {
    setDen(nd); setLeg1(na); setOptions(genOptions(nd, na));
    setPicked(null); setPhase("pick"); setDriving(false);
    setCarPos(ROAD_L + (na / nd) * (ROAD_R - ROAD_L));
  }
  function resetTry() {
    setPicked(null); setPhase("pick"); setDriving(false);
    setCarPos(posOf(leg1));
  }

  function choose(id: number) {
    if (phase !== "pick") return;
    setPicked((cur) => (cur === id ? null : id));
    play("select");
  }

  function drive() {
    if (phase !== "pick" || pickedNum === null) return;
    ensure();
    const total = leg1 + pickedNum;
    setPhase("drive"); setDriving(true);
    play("vroom");
    setCarPos(posOf(Math.min(total, den + 0.6)));
    push(window.setTimeout(() => {
      setDriving(false);
      if (total === den) {
        setPhase("arrive"); play("arrive");
        if (mode === "solo") {
          setScore((s) => s + (combo >= 2 ? 25 : 20));
          setCombo((c) => c + 1);
          push(window.setTimeout(nextMission, 1500));
        }
      } else {
        setPhase(total < den ? "short" : "over"); play("wrong");
        if (mode === "solo") {
          setCombo(0);
          push(window.setTimeout(nextMission, 1700));
        }
      }
    }, 1350));
  }

  function reveal() {
    if (phase !== "pick") return;
    const ans = options.find((o) => o.num === needed);
    if (ans) { setPicked(ans.id); push(window.setTimeout(drive, 400)); }
  }

  function startSolo() {
    ensure(); play("start");
    setMode("solo"); setStarted(true); setOver(false);
    setScore(0); setRound(1); setCombo(0);
    const nd = pickDen(level);
    loadProblem(nd, randInt(1, nd - 1));
  }
  function nextMission() {
    setRound((r) => {
      if (r >= MISSIONS_TOTAL) { setOver(true); play("arrive"); return r; }
      const nd = pickDen(level);
      loadProblem(nd, randInt(1, nd - 1));
      return r + 1;
    });
  }

  /* ── โหมดระยะจริง (กม./ม.) ── */
  /** คำนวณตัวเลือก + วางรถต้นทาง (เรียกทุกครั้งที่โจทย์เปลี่ยน) */
  function rebuild(nTotal: number, nDen: number, nA: number, nAsk: Ask) {
    const step = nTotal / nDen;
    const start = nAsk === "remaining" ? nA : 0;
    const target = nAsk === "remaining" ? nDen : nA;
    const correct = (target - start) * step;
    setKmOptions(genKmOptions(correct, step, nTotal));
    setKmPick(null); setPhase("pick"); setDriving(false); setShowKm(false);
    setCarPos(ROAD_L + (start / nDen) * (ROAD_R - ROAD_L));
  }
  function selectRoute(rt: typeof ROUTES[number]) {
    const a = randInt(1, rt.den - 1);
    setPlace({ from: rt.from, to: rt.to, emoji: rt.emoji });
    setTotal(rt.total); setUnit(rt.unit); setDen(rt.den); setLeg1(a);
    rebuild(rt.total, rt.den, a, ask);
  }
  function changeTotal(delta: number) {
    const nt = Math.max(20, total + delta);
    const divs = divisorsInRange(nt, 3, 12);
    const nDen = divs.includes(den) ? den : divs.reduce((best, d) => (Math.abs(d - den) < Math.abs(best - den) ? d : best), divs[0]);
    const nA = Math.min(leg1, nDen - 1);
    setTotal(nt); setDen(nDen); setLeg1(nA);
    setPlace({ from: "บ้าน", to: "จุดหมาย", emoji: "🎯" });
    rebuild(nt, nDen, nA, ask);
  }
  function changeCustomDen(nDen: number) {
    const nA = Math.min(leg1, nDen - 1);
    setDen(nDen); setLeg1(nA);
    rebuild(total, nDen, nA, ask);
  }
  function changeDriven(delta: number) {
    const nA = Math.max(1, Math.min(den - 1, leg1 + delta));
    setLeg1(nA);
    rebuild(total, den, nA, ask);
  }
  function changeAsk(q: Ask) {
    setAsk(q);
    rebuild(total, den, leg1, q);
  }
  function toggleUnit() {
    setUnit((u) => (u === "กม." ? "ม." : "กม."));
    setPlace({ from: "บ้าน", to: "จุดหมาย", emoji: "🎯" });
  }
  function startDistance() {
    ensure();
    setMode("distance");
    const rt = ROUTES[randInt(0, ROUTES.length - 1)];
    const a = randInt(1, rt.den - 1);
    const q: Ask = randInt(0, 1) === 0 ? "remaining" : "driven";
    setPlace({ from: rt.from, to: rt.to, emoji: rt.emoji });
    setTotal(rt.total); setUnit(rt.unit); setDen(rt.den); setLeg1(a); setAsk(q);
    setDriver(DRIVERS[randInt(0, DRIVERS.length - 1)]);
    rebuild(rt.total, rt.den, a, q);
  }
  function chooseKm(id: number) {
    if (phase !== "pick") return;
    setKmPick((cur) => (cur === id ? null : id));
    play("select");
  }
  function driveDistance() {
    if (phase !== "pick" || pickedKm === null) return;
    ensure();
    const landing = startSeg + pickedKm / kmStep;
    setPhase("drive"); setDriving(true); play("vroom");
    setCarPos(posOf(Math.min(landing, den + 0.6)));
    push(window.setTimeout(() => {
      setDriving(false);
      if (Math.abs(landing - targetSeg) < 1e-6) { setPhase("arrive"); play("arrive"); }
      else { setPhase(landing < targetSeg ? "short" : "over"); play("wrong"); }
    }, 1350));
  }
  function resetDistanceTry() {
    setKmPick(null); setPhase("pick"); setDriving(false);
    setCarPos(posOf(startSeg));
  }
  function revealKm() {
    if (phase !== "pick") return;
    const ans = kmOptions.find((o) => o.km === correctKm);
    if (ans) { setKmPick(ans.id); push(window.setTimeout(driveDistance, 400)); }
  }

  const stars = score >= 170 ? 3 : score >= 110 ? 2 : 1;
  const canDrive = phase === "pick" && pickedNum !== null;
  const canDriveKm = phase === "pick" && pickedKm !== null;
  const kmLabels = Array.from({ length: den + 1 }, (_, k) => String(k * kmStep));

  /* ตัวเลือกชนิดรถ + สี (ใช้ร่วมทุกโหมด) */
  const vehiclePicker = (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
      <span className="text-xs font-extrabold text-slate-500">🚗 รถ:</span>
      {VEHICLES.map((v, i) => (
        <button key={v.id} onClick={() => setVehicleIdx(i)} title={v.name} className={cn("grid h-8 w-8 place-items-center rounded-lg border-2 text-lg transition", vehicleIdx === i ? "border-slate-500 bg-slate-100" : "border-slate-200 bg-white hover:bg-slate-50")}>{v.emoji}</button>
      ))}
      <span className="mx-1 text-slate-300">|</span>
      <span className="text-xs font-extrabold text-slate-500">สี:</span>
      {COLORS.map((c, i) => (
        <button key={c.name} onClick={() => setColorIdx(i)} title={c.name} className={cn("h-6 w-6 rounded-full border-2 transition", colorIdx === i ? "border-slate-700 ring-2 ring-slate-300" : "border-white")} style={{ background: c.body }} />
      ))}
    </div>
  );

  return (
    <div className="relative overflow-hidden rounded-2xl p-3 sm:p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-100 via-emerald-50 to-lime-50" />
      <style>{`
        @keyframes cjWalkBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        .cj-walk { animation: cjWalkBob 0.3s ease-in-out infinite; }
        @keyframes cjWheel { from { transform: rotate(0); } to { transform: rotate(360deg); } }
        .cj-wheel { animation: cjWheel 0.35s linear infinite; }
        @keyframes cjPop { 0% { transform: scale(0.3) rotate(-8deg); opacity: 0; } 55% { transform: scale(1.2) rotate(3deg); opacity: 1; } 100% { transform: scale(1) rotate(0); opacity: 1; } }
        .cj-pop { animation: cjPop 0.5s ease-out forwards; }
        @keyframes cjCloud { from { left: -14%; } to { left: 108%; } }
        .cj-cloud { animation: cjCloud 42s linear infinite; }
        .cj-cloud2 { animation: cjCloud 58s linear infinite; animation-delay: -25s; }
      `}</style>

      <div className="relative space-y-3">
        {/* โหมด + ปิดเสียง */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex rounded-xl border-2 border-slate-200 bg-white p-1">
            <button onClick={() => { setMode("teacher"); setStarted(false); setOver(false); resetTry(); }} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "teacher" ? "bg-indigo-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <FlaskConical size={15} /> โหมดครู
            </button>
            <button onClick={startSolo} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "solo" ? "bg-emerald-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <CarIcon size={15} /> โหมดเล่น
            </button>
            <button onClick={startDistance} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "distance" ? "bg-teal-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <MapPin size={15} /> ระยะจริง
            </button>
          </div>
          <button onClick={() => setMuted((m) => !m)} className="grid h-9 w-9 place-items-center rounded-xl border-2 border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50" title={muted ? "เปิดเสียง" : "ปิดเสียง"}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {mode === "solo" && over ? (
          /* ── จอจบ ── */
          <div className="space-y-4 rounded-2xl border-2 border-emerald-300 bg-white/90 p-6 text-center">
            <div className="text-5xl">🏁🏆</div>
            <h3 className="text-xl font-extrabold text-slate-800 sm:text-2xl">จบทริป {MISSIONS_TOTAL} ด่าน!</h3>
            <p className="text-2xl">{"⭐".repeat(stars)}{"☆".repeat(3 - stars)}</p>
            <p className="text-base font-extrabold text-emerald-700">🏅 คะแนนรวม {score}</p>
            <button onClick={startSolo} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
              <Play size={18} /> ขับอีกรอบ
            </button>
          </div>
        ) : mode === "distance" ? (
          /* ── โหมดระยะจริง (กม./ม.) ── */
          <div className="space-y-3">
            {/* ตั้งค่าครู */}
            <div className="space-y-2 rounded-2xl border-2 border-teal-200 bg-white/90 px-3 py-2">
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                <span className="text-xs font-extrabold text-teal-700">🗺️ เส้นทางสำเร็จรูป:</span>
                {ROUTES.map((rt, i) => (
                  <button key={i} onClick={() => selectRoute(rt)} className={cn("rounded-lg border-2 px-2 py-1 text-xs font-extrabold transition", place.to === rt.to && total === rt.total ? "border-teal-500 bg-teal-100 text-teal-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
                    {rt.emoji} {rt.to} · {rt.total}{rt.unit}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
                <span className="text-xs font-extrabold text-teal-700">🛠️ กำหนดเอง — ระยะรวม:</span>
                <button onClick={() => changeTotal(unit === "ม." ? -50 : -50)} className="h-7 w-7 rounded-lg border-2 border-slate-200 bg-white text-base font-extrabold text-slate-600 hover:bg-slate-50 active:scale-95">−</button>
                <span className="min-w-[64px] text-center text-base font-extrabold text-teal-700">{total} {unit}</span>
                <button onClick={() => changeTotal(50)} className="h-7 w-7 rounded-lg border-2 border-slate-200 bg-white text-base font-extrabold text-slate-600 hover:bg-slate-50 active:scale-95">+</button>
                <button onClick={toggleUnit} className="rounded-lg border-2 border-slate-200 bg-white px-2 py-1 text-xs font-extrabold text-slate-500 transition hover:bg-slate-50">สลับ กม./ม.</button>
                <span className="mx-1 text-slate-300">|</span>
                <span className="text-xs font-extrabold text-slate-500">แบ่งช่อง:</span>
                {denOptions.map((d) => (
                  <button key={d} onClick={() => changeCustomDen(d)} className={cn("h-7 w-7 rounded-lg border-2 text-sm font-extrabold transition", den === d ? "border-teal-500 bg-teal-100 text-teal-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>{d}</button>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
                <span className="text-xs font-extrabold text-teal-700">ขับไปแล้ว:</span>
                <button onClick={() => changeDriven(-1)} className="h-7 w-7 rounded-lg border-2 border-slate-200 bg-white text-base font-extrabold text-slate-600 hover:bg-slate-50 active:scale-95">−</button>
                <StackedFraction numerator={leg1} denominator={den} className="text-xl" toneClassName="text-teal-700" />
                <button onClick={() => changeDriven(1)} className="h-7 w-7 rounded-lg border-2 border-slate-200 bg-white text-base font-extrabold text-slate-600 hover:bg-slate-50 active:scale-95">+</button>
                <span className="mx-1 text-slate-300">|</span>
                <span className="text-xs font-extrabold text-slate-500">คำถาม:</span>
                {([["remaining", "เหลืออีกกี่?"], ["driven", "ไปแล้วกี่?"]] as [Ask, string][]).map(([q, label]) => (
                  <button key={q} onClick={() => changeAsk(q)} className={cn("rounded-lg border-2 px-2 py-1 text-xs font-extrabold transition", ask === q ? "border-teal-400 bg-teal-100 text-teal-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>{label}</button>
                ))}
                <span className="mx-1 text-slate-300">|</span>
                <button onClick={startDistance} className="flex items-center gap-1 rounded-lg border-2 border-slate-200 bg-white px-2 py-1 text-xs font-extrabold text-slate-500 transition hover:bg-slate-50">
                  <Dice5 size={13} /> สุ่มโจทย์
                </button>
                <button onClick={revealKm} disabled={phase !== "pick"} className="flex items-center gap-1 rounded-lg border-2 border-violet-300 bg-violet-50 px-2 py-1 text-xs font-extrabold text-violet-700 transition hover:bg-violet-100 disabled:opacity-40">
                  <Eye size={13} /> เฉลย
                </button>
              </div>
              {vehiclePicker}
            </div>

            {/* การ์ดโจทย์ */}
            <div className="rounded-2xl border-2 border-teal-200 bg-white/95 px-4 py-3 text-center shadow-sm">
              <p className="text-sm font-extrabold text-slate-700 sm:text-base">
                🚗 ขับรถจาก 🏠 {place.from} ไป {place.emoji} {place.to} ระยะทาง <b className="text-teal-700">{total} {unit}</b>
              </p>
              <p className="mt-1 text-sm font-extrabold text-slate-700 sm:text-base">
                {driver} ขับไปแล้ว <b className="text-indigo-600">{leg1}/{den}</b> ของระยะทางทั้งหมด —{" "}
                <span className="text-rose-600">{ask === "remaining" ? `ต้องขับต่ออีกกี่ ${unit}?` : `ขับไปแล้วกี่ ${unit}?`}</span>
              </p>
              <p className="mt-1 text-xs font-bold text-slate-400">💡 1 ส่วน = {total} ÷ {den} = {showKm ? `${kmStep} ${unit}` : "?"} ต่อช่อง</p>
            </div>

            {/* ปุ่มแสดง/ซ่อนระยะแต่ละช่วง */}
            <div className="flex justify-center">
              <button onClick={() => setShowKm((s) => !s)} className={cn("inline-flex items-center gap-1.5 rounded-full border-2 px-4 py-1 text-xs font-extrabold transition", showKm ? "border-teal-400 bg-teal-50 text-teal-700" : "border-slate-300 bg-white text-slate-500 hover:bg-slate-50")}>
                {showKm ? <EyeOff size={13} /> : <Eye size={13} />} {showKm ? "ซ่อนระยะแต่ละช่วง" : "แสดงระยะแต่ละช่วง"}
              </button>
            </div>

            {/* ฉากถนน (ป้าย กม.จริง — ซ่อน/แสดงได้) */}
            <RoadScene
              den={den}
              leg1={leg1}
              carPos={carPos}
              vType={vType}
              vBody={vBody}
              vDark={vDark}
              phase={phase}
              driving={driving}
              kmLabels={showKm ? kmLabels : undefined}
              signLabel={ask === "remaining" ? `ขับแล้ว ${leg1}/${den}` : `📍 ${leg1}/${den} ของทาง`}
              arriveLabel={ask === "remaining" ? `ถึง ${place.to}! 🏁` : "ถึงจุดหมาย! 📍"}
            />

            {/* ตัวเลือก กม. */}
            <div>
              <p className="mb-1.5 text-center text-xs font-extrabold text-slate-500">📏 แตะระยะที่คิดว่าถูก แล้วออกรถพิสูจน์</p>
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                {kmOptions.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => chooseKm(o.id)}
                    disabled={phase !== "pick"}
                    className={cn(
                      "flex h-12 min-w-[72px] items-center justify-center rounded-xl border-b-4 bg-white px-3 text-lg font-extrabold shadow transition",
                      kmPick === o.id ? "border-teal-500 text-teal-600 ring-2 ring-teal-300" : "border-slate-300 text-slate-700 hover:-translate-y-0.5",
                      phase !== "pick" && kmPick !== o.id && "opacity-50",
                    )}
                  >
                    {o.km} {unit}
                  </button>
                ))}
              </div>
            </div>

            {/* ปุ่มควบคุม */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {phase === "pick" ? (
                <button onClick={driveDistance} disabled={!canDriveKm} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500 px-7 py-2.5 text-base font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98] disabled:opacity-40">
                  🚗 ออกรถ!
                </button>
              ) : phase === "drive" ? (
                <span className="text-sm font-extrabold text-slate-500">รถกำลังวิ่ง…</span>
              ) : (
                <>
                  {phase === "arrive"
                    ? <p className="w-full text-center text-sm font-extrabold text-emerald-600">✅ {ask === "remaining" ? `เหลือ ${den - leg1}/${den} ของ ${total} = ${den - leg1} × ${kmStep} = ${correctKm} ${unit}` : `ไปแล้ว ${leg1}/${den} ของ ${total} = ${leg1} × ${kmStep} = ${correctKm} ${unit}`}</p>
                    : <p className="w-full text-center text-sm font-extrabold text-rose-600">ยังไม่ใช่ — คำตอบที่ถูกคือ {correctKm} {unit} (กด “ลองใหม่” หรือดู “เฉลย”)</p>}
                  <button onClick={resetDistanceTry} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50">
                    <RotateCcw size={15} /> ลองใหม่
                  </button>
                  <button onClick={startDistance} className="inline-flex items-center gap-1.5 rounded-xl bg-teal-500 px-4 py-2 text-sm font-extrabold text-white shadow transition hover:brightness-105">
                    โจทย์ใหม่ <ArrowRight size={15} />
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* แถบตั้งค่าครู / สถานะเล่น */}
            {mode === "teacher" ? (
              <div className="space-y-2 rounded-2xl border-2 border-indigo-200 bg-white/90 px-3 py-2">
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
                  <span className="text-sm font-extrabold text-indigo-700">🧑‍🏫 ขับไปแล้ว:</span>
                  <button onClick={() => loadProblem(den, Math.max(1, leg1 - 1))} className="h-8 w-8 rounded-lg border-2 border-slate-200 bg-white text-lg font-extrabold text-slate-600 hover:bg-slate-50 active:scale-95">−</button>
                  <StackedFraction numerator={leg1} denominator={den} className="text-2xl" toneClassName="text-indigo-700" />
                  <button onClick={() => loadProblem(den, Math.min(den - 1, leg1 + 1))} className="h-8 w-8 rounded-lg border-2 border-slate-200 bg-white text-lg font-extrabold text-slate-600 hover:bg-slate-50 active:scale-95">+</button>
                  <span className="mx-1 text-slate-300">|</span>
                  <span className="text-xs font-extrabold text-slate-500">ส่วน (ช่องถนน)</span>
                  {[4, 5, 6, 8, 10].map((d) => (
                    <button key={d} onClick={() => loadProblem(d, Math.min(d - 1, leg1))} className={cn("h-7 w-7 rounded-lg border-2 text-sm font-extrabold transition", den === d ? "border-indigo-500 bg-indigo-100 text-indigo-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>{d}</button>
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button onClick={() => loadProblem(den, leg1)} className="flex items-center gap-1.5 rounded-lg border-2 border-slate-200 bg-white px-3 py-1 text-xs font-extrabold text-slate-500 transition hover:bg-slate-50">
                    <Dice5 size={14} /> สุ่มตัวเลือกใหม่
                  </button>
                  <button onClick={reveal} disabled={phase !== "pick"} className="flex items-center gap-1.5 rounded-lg border-2 border-violet-300 bg-violet-50 px-3 py-1 text-xs font-extrabold text-violet-700 transition hover:bg-violet-100 disabled:opacity-40">
                    <Eye size={14} /> เฉลย
                  </button>
                </div>
                {vehiclePicker}
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 rounded-2xl bg-white/90 px-4 py-2 ring-1 ring-emerald-200">
                <span className="text-base font-extrabold text-emerald-700">🗺️ ด่าน {Math.min(round, MISSIONS_TOTAL)}/{MISSIONS_TOTAL}</span>
                <span className="text-base font-extrabold text-amber-600">🏅 {score}</span>
                {combo >= 2 && <span className="text-base font-extrabold text-orange-500">🔥 x{combo}</span>}
              </div>
            )}

            {/* สมการ */}
            <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-indigo-200 bg-white/95 px-5 py-2.5 shadow-sm">
              <StackedFraction numerator={leg1} denominator={den} className="text-2xl sm:text-3xl" toneClassName="text-indigo-600" />
              <span className="text-3xl font-black text-slate-400">+</span>
              <AddendSlot v={pickedNum} den={den} tone="text-emerald-600" />
              <span className="text-3xl font-black text-slate-400">=</span>
              <span className="flex flex-col items-center">
                <span className="text-4xl font-black text-emerald-600 sm:text-5xl">1</span>
                <span className="text-[10px] font-extrabold text-slate-400">เต็มทาง</span>
              </span>
              {(phase === "arrive" || phase === "short" || phase === "over") && pickedNum !== null && (
                <span className={cn("rounded-full px-3 py-1 text-sm font-extrabold text-white shadow", leg1 + pickedNum === den ? "bg-emerald-500" : leg1 + pickedNum < den ? "bg-rose-500" : "bg-orange-500")}>
                  {leg1 + pickedNum === den ? "ครบ 1 ✓" : `รวม ${leg1 + pickedNum}/${den}`}
                </span>
              )}
            </div>

            {/* ฉากถนน */}
            <RoadScene den={den} leg1={leg1} carPos={carPos} vType={vType} vBody={vBody} vDark={vDark} phase={phase} driving={driving} />

            {/* ตัวเลือกระยะ */}
            <div>
              <p className="mb-1.5 text-center text-xs font-extrabold text-slate-500">🚗 เลือกระยะที่เหลือ ให้รถถึงเส้นชัยพอดี (รวมกันได้ 1 เต็มทาง)</p>
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                {options.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => choose(o.id)}
                    disabled={phase !== "pick"}
                    className={cn(
                      "flex h-16 w-16 items-center justify-center rounded-xl border-b-4 bg-white shadow transition",
                      picked === o.id ? "border-emerald-500 ring-2 ring-emerald-300" : "border-slate-300 hover:-translate-y-0.5",
                      phase !== "pick" && picked !== o.id && "opacity-50",
                    )}
                  >
                    <StackedFraction numerator={o.num} denominator={den} className="text-xl" toneClassName={picked === o.id ? "text-emerald-600" : "text-slate-700"} />
                  </button>
                ))}
              </div>
            </div>

            {/* ปุ่มควบคุม */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {phase === "pick" ? (
                <button onClick={drive} disabled={!canDrive} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-7 py-2.5 text-base font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98] disabled:opacity-40">
                  🚗 ออกรถ!
                </button>
              ) : phase === "drive" ? (
                <span className="text-sm font-extrabold text-slate-500">รถกำลังวิ่ง…</span>
              ) : mode === "teacher" ? (
                <>
                  {phase === "arrive"
                    ? <p className="w-full text-center text-sm font-extrabold text-emerald-600">✅ {leg1}/{den} + {needed}/{den} = {den}/{den} = 1 เต็มทาง! (ตัวส่วนเท่าเดิม บวกแค่ตัวเศษ)</p>
                    : <p className="w-full text-center text-sm font-extrabold text-rose-600">{leg1 + (pickedNum ?? 0) < den ? `ยังขาดอีก ${den - leg1 - (pickedNum ?? 0)}/${den} ถึงจะครบ 1` : `เลยไป ${leg1 + (pickedNum ?? 0) - den}/${den} — เกิน 1 เต็มทาง`}</p>}
                  <button onClick={resetTry} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50">
                    <RotateCcw size={15} /> ลองใหม่
                  </button>
                  <button onClick={() => loadProblem(pickDen(level), randInt(1, pickDen(level) - 1))} className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-500 px-4 py-2 text-sm font-extrabold text-white shadow transition hover:brightness-105">
                    โจทย์ใหม่ <ArrowRight size={15} />
                  </button>
                </>
              ) : (
                <span className="text-sm font-extrabold text-slate-500">{phase === "arrive" ? "🏁 ถึงเส้นชัย! ไปด่านต่อไป…" : "❌ ยังไม่พอดี — ไปด่านต่อไป…"}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
