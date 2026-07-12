"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Swords, School, RotateCcw } from "lucide-react";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { cn } from "@/lib/cn";
import { randInt } from "@/lib/randomFraction";

/* ── ค่าคงที่ ── */

type Val = { whole: number; num: number; den: number }; // whole=0 → เศษเกินล้วน
const valueOf = (v: Val) => (v.whole * v.den + v.num) / v.den;

const CHARS = [
  { name: "เรดดี้", body: "#ef4444", dark: "#b91c1c", skin: "#fde68a", hat: "antenna" as const },
  { name: "บลูโบ", body: "#3b82f6", dark: "#1d4ed8", skin: "#fde68a", hat: "cap" as const },
  { name: "เหมียวทอง", body: "#f59e0b", dark: "#b45309", skin: "#fef3c7", hat: "ears" as const },
  { name: "ไวโอ", body: "#a855f7", dark: "#7e22ce", skin: "#e9d5ff", hat: "antenna" as const },
  { name: "ไดโนะ", body: "#22c55e", dark: "#15803d", skin: "#bbf7d0", hat: "spikes" as const },
];

type QKind = "toImp" | "toMix" | "compare" | "equal";
const SKILL_LABEL: Record<QKind, string> = {
  toImp: "แปลงเป็นเศษเกิน",
  toMix: "แปลงเป็นจำนวนคละ",
  compare: "เปรียบเทียบมากกว่า/น้อยกว่า",
  equal: "ตัดสินว่าเท่ากันหรือไม่",
};

type Opt = { kind: "val" | "text"; val?: Val; text?: string };
type Question = {
  kind: QKind;
  prompt: "mixed" | "improper" | "compare" | "equal";
  m?: Val;         // สำหรับ toImp (แสดงจำนวนคละ) / toMix (แสดงเศษเกิน)
  a?: Val; b?: Val; // สำหรับ compare / equal
  options: Opt[];
  answer: number;
};

function pickDen(level: 1 | 2): number {
  return level === 1 ? [2, 3, 4][randInt(0, 2)] : [2, 3, 4, 5, 6][randInt(0, 4)];
}
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) { const j = randInt(0, i); [arr[i], arr[j]] = [arr[j], arr[i]]; }
  return arr;
}

function genQuestion(level: 1 | 2): Question {
  const kind: QKind = (["toImp", "toMix", "compare", "equal"] as QKind[])[randInt(0, 3)];

  if (kind === "toImp") {
    const den = pickDen(level);
    const whole = randInt(1, 3), num = randInt(1, den - 1), total = whole * den + num;
    const correct: Opt = { kind: "val", val: { whole: 0, num: total, den } };
    const cands: Val[] = [
      { whole: 0, num: whole + num, den },
      { whole: 0, num: whole * den, den },
      { whole: 0, num: total + 1, den },
      { whole: 0, num: total - 1, den },
    ].filter((c) => c.num > 0 && c.num !== total);
    const seen = new Set([total]);
    const ds: Opt[] = [];
    for (const c of cands) { if (!seen.has(c.num)) { seen.add(c.num); ds.push({ kind: "val", val: c }); } if (ds.length >= 2) break; }
    const options = shuffle([correct, ...ds.slice(0, 2)]);
    return { kind, prompt: "mixed", m: { whole, num, den }, options, answer: options.findIndex((o) => o.val!.num === total) };
  }

  if (kind === "toMix") {
    const den = pickDen(level);
    const whole = randInt(1, 3), num = randInt(1, den - 1), total = whole * den + num;
    const correct: Opt = { kind: "val", val: { whole, num, den } };
    const cands: Val[] = [
      { whole: whole + 1, num, den },
      { whole: Math.max(1, whole - 1), num, den },
      { whole: num, num: Math.min(whole, den - 1), den },
      { whole, num: num + 1 < den ? num + 1 : num - 1, den },
    ].filter((c) => c.num >= 1 && c.num < den && !(c.whole === whole && c.num === num));
    const seen = new Set([`${whole}-${num}`]);
    const ds: Opt[] = [];
    for (const c of cands) { const k = `${c.whole}-${c.num}`; if (!seen.has(k)) { seen.add(k); ds.push({ kind: "val", val: c }); } if (ds.length >= 2) break; }
    const options = shuffle([correct, ...ds.slice(0, 2)]);
    return { kind, prompt: "improper", m: { whole: 0, num: total, den }, options, answer: options.findIndex((o) => o.val!.whole === whole && o.val!.num === num) };
  }

  if (kind === "compare") {
    const mk = (): Val => {
      const den = pickDen(level);
      const whole = randInt(1, 3), num = randInt(1, den - 1), total = whole * den + num;
      return randInt(0, 1) === 0 ? { whole: 0, num: total, den } : { whole, num, den };
    };
    let a = mk(), b = mk(), guard = 0;
    while (valueOf(a) === valueOf(b) && guard++ < 30) b = mk();
    const options: Opt[] = [{ kind: "val", val: a }, { kind: "val", val: b }];
    return { kind, prompt: "compare", a, b, options, answer: valueOf(a) > valueOf(b) ? 0 : 1 };
  }

  // equal
  const den = pickDen(level);
  const whole = randInt(1, 3), num = randInt(1, den - 1), total = whole * den + num;
  const a: Val = { whole: 0, num: total, den };
  const wantEqual = randInt(0, 1) === 0;
  let b: Val;
  if (wantEqual) b = { whole, num, den };
  else {
    const shift = randInt(0, 1) === 0 ? 1 : -1;
    b = { whole: Math.max(1, whole + shift), num, den };
    if (valueOf(b) === valueOf(a)) b = { whole: whole + 1, num, den };
  }
  const options: Opt[] = [{ kind: "text", text: "✅ เท่ากัน" }, { kind: "text", text: "❌ ไม่เท่า" }];
  const isEqual = valueOf(a) === valueOf(b);
  return { kind, prompt: "equal", a, b, options, answer: isEqual ? 0 : 1 };
}

/* ── เสียง ── */

type SoundKind = "slash" | "hit" | "crit" | "fire" | "hurt" | "roar" | "start" | "win" | "lose";

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
  function noise(dur: number, gain: number) {
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
      case "slash": return sweep(1400, 500, 0.14, "square", 0.08);
      case "hit": return tones([392, 523], 0.05, 0.1, "square", 0.11);
      case "crit": return tones([523, 784, 1047, 1319], 0.05, 0.11, "square", 0.13);
      case "fire": return noise(0.4, 0.16);
      case "hurt": return tones([300, 200], 0.09, 0.15, "sawtooth", 0.1);
      case "roar": return sweep(240, 90, 0.6, "sawtooth", 0.14);
      case "start": return tones([392, 523, 659], 0.08, 0.13, "triangle", 0.14);
      case "win": return tones([523, 659, 784, 1047, 1319, 1568], 0.09, 0.18, "triangle", 0.15);
      case "lose": return tones([392, 330, 262, 196], 0.14, 0.24, "sawtooth", 0.12);
    }
  }
  return { play, ensure };
}

/* ── เพลงต่อสู้ (ชิปทูน ไม่ใช้ไฟล์) ── */

const BT_LEAD = [69, 0, 69, 72, 71, 0, 69, 67, 69, 0, 71, 72, 74, 0, 0, 0, 68, 0, 68, 71, 69, 0, 68, 66, 64, 0, 66, 68, 69, 0, 0, 0];
const BT_BASS = [45, 45, 52, 45, 41, 41, 48, 41, 43, 43, 50, 43, 40, 40, 47, 40];

function useChiptune(mutedRef: React.MutableRefObject<boolean>, ctxRef: React.MutableRefObject<AudioContext | null>, fastRef: React.MutableRefObject<boolean>) {
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
  function tick() {
    const s = stepRef.current;
    stepRef.current = (s + 1) % 32;
    if (mutedRef.current || !ctxRef.current) return;
    const m = BT_LEAD[s];
    if (m) note(m, 0.15, "square", 0.028);
    if (s % 2 === 0) { const b = BT_BASS[s / 2]; if (b) note(b, 0.26, "triangle", 0.055); }
  }
  function schedule() {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(tick, fastRef.current ? 140 : 190);
  }
  function start() {
    if (typeof window !== "undefined" && !ctxRef.current) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AC) ctxRef.current = new AC();
    }
    if (ctxRef.current?.state === "suspended") void ctxRef.current.resume();
    stepRef.current = 0;
    schedule();
  }
  function stop() {
    if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
  }
  useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);
  return { start, stop, schedule };
}

/* ── ตัวละครบล็อก (ฮีโร่) ── */

function BlockChar({ c, walking, size = 56, facing = 1 }: { c: typeof CHARS[number]; walking: boolean; size?: number; facing?: 1 | -1 }) {
  return (
    <svg viewBox="0 0 44 60" width={size * 0.73} height={size} className={cn(walking && "char-walk")} style={{ transform: facing === -1 ? "scaleX(-1)" : undefined }} role="img" aria-label={`ตัวละคร ${c.name}`}>
      {c.hat === "antenna" && <><line x1={22} y1={2} x2={22} y2={7} stroke={c.dark} strokeWidth={2} /><circle cx={22} cy={2} r={2.5} fill={c.dark} /></>}
      {c.hat === "cap" && <path d="M10,9 Q22,1 34,9 L36,11 L8,11 Z" fill={c.dark} />}
      {c.hat === "ears" && <><path d="M11,10 L14,2 L18,9 Z" fill={c.body} stroke={c.dark} strokeWidth={1.5} /><path d="M33,10 L30,2 L26,9 Z" fill={c.body} stroke={c.dark} strokeWidth={1.5} /></>}
      {c.hat === "spikes" && <><path d="M14,9 L17,3 L20,9 Z" fill={c.dark} /><path d="M20,9 L23,2 L26,9 Z" fill={c.dark} /><path d="M26,9 L29,3 L32,9 Z" fill={c.dark} /></>}
      <rect x={12} y={8} width={20} height={16} rx={3} fill={c.skin} stroke={c.dark} strokeWidth={2} />
      <rect x={17} y={13} width={3.5} height={5} rx={1} fill="#1e293b" />
      <rect x={24} y={13} width={3.5} height={5} rx={1} fill="#1e293b" />
      <path d="M18,20 Q22,22.5 26,20" stroke="#1e293b" strokeWidth={1.6} fill="none" strokeLinecap="round" />
      <rect x={13} y={25} width={18} height={17} rx={3} fill={c.body} stroke={c.dark} strokeWidth={2} />
      <rect x={19} y={29} width={6} height={6} rx={1.5} fill="#fff" opacity={0.75} />
      {/* ดาบในมือขวา */}
      <g transform="translate(34,20)">
        <rect x={0} y={-14} width={3} height={20} rx={1.5} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={0.8} />
        <rect x={-2} y={5} width={7} height={3} rx={1} fill="#a16207" />
      </g>
      <g className={walking ? "arm-swing" : undefined} style={{ transformOrigin: "10px 27px" }}>
        <rect x={7} y={25} width={5} height={14} rx={2.5} fill={c.body} stroke={c.dark} strokeWidth={1.6} />
      </g>
      <g className={walking ? "leg-swing" : undefined} style={{ transformOrigin: "17px 43px" }}>
        <rect x={14.5} y={42} width={6} height={15} rx={2.5} fill={c.dark} />
      </g>
      <g className={walking ? "leg-swing2" : undefined} style={{ transformOrigin: "27px 43px" }}>
        <rect x={23.5} y={42} width={6} height={15} rx={2.5} fill={c.dark} />
      </g>
    </svg>
  );
}

/* ── มังกรบอส ── */

function Dragon({ enraged, hurt, size = 168 }: { enraged: boolean; hurt: boolean; size?: number }) {
  const body = enraged ? "#e0362f" : "#7c3aed";
  const body2 = enraged ? "#b91c1c" : "#6d28d9";
  const belly = enraged ? "#f9c8a8" : "#d6ccf7";
  const dark = enraged ? "#7f1d1d" : "#4c1d95";
  const wing = enraged ? "#c62828" : "#7c3aed";
  const wingMem = enraged ? "#f0a58a" : "#b8a7ee";
  const spike = enraged ? "#8f1a17" : "#5b21b6";
  const horn = "#eef2f7";
  const gid = enraged ? "dr-r" : "dr-p";
  const eye = enraged ? "#fde047" : "#38bdf8";
  return (
    <svg viewBox="0 0 190 156" width={size} height={size * 0.82} className={cn(hurt && "boss-hurt", "boss-idle")} role="img" aria-label={`มังกรบอส${enraged ? " (โกรธ)" : ""} หันหน้าเข้าหาฮีโร่`}>
      <defs>
        <clipPath id={`${gid}-body`}><ellipse cx={112} cy={104} rx={48} ry={38} /></clipPath>
        <radialGradient id={`${gid}-bg`} cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stopColor={body} />
          <stop offset="1" stopColor={body2} />
        </radialGradient>
      </defs>

      {/* ── หาง (โค้งไปด้านขวา) ── */}
      <path d="M150,112 Q184,110 184,80 Q178,90 166,88 Q160,74 178,66 Q158,62 150,82 Q140,100 130,108 Z" fill={body} stroke={dark} strokeWidth={3} strokeLinejoin="round" />
      <path d="M178,66 l10,-10 l-2,14 Z" fill={spike} stroke={dark} strokeWidth={1.5} strokeLinejoin="round" />

      {/* ── ปีก (ด้านหลัง) ── */}
      <g className="wing-flap">
        <path d="M118,64 Q160,20 182,38 Q164,44 166,56 Q182,60 174,74 Q162,70 162,82 Q176,88 166,100 Q140,84 116,86 Z" fill={wing} stroke={dark} strokeWidth={2.5} strokeLinejoin="round" />
        <path d="M124,72 L180,40 M132,80 L170,58 M140,84 L166,78" stroke={wingMem} strokeWidth={2} fill="none" opacity={0.85} />
        <path d="M118,66 Q150,60 166,80" fill={wingMem} opacity={0.35} />
      </g>

      {/* ── ลำตัว ── */}
      <ellipse cx={112} cy={104} rx={48} ry={38} fill={`url(#${gid}-bg)`} stroke={dark} strokeWidth={3} />
      {/* เกล็ดลำตัว */}
      <g clipPath={`url(#${gid}-body)`}>
        {[0, 1, 2, 3].map((r) => Array.from({ length: 7 }, (_, c) => (
          <path key={`${r}-${c}`} d={`M${74 + c * 12 + (r % 2) * 6},${86 + r * 12} q6,7 12,0`} stroke={dark} strokeWidth={1} fill="none" opacity={0.18} />
        )))}
      </g>
      {/* แผ่นท้อง (ด้านหน้าซ้าย) */}
      <path d="M74,98 Q64,118 74,136 Q92,142 104,134 Q92,120 90,100 Q80,96 74,98 Z" fill={belly} stroke={dark} strokeWidth={1.5} />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M${74 + i},${106 + i * 8} q9,5 19,1`} stroke={dark} strokeWidth={1.1} fill="none" opacity={0.35} />)}

      {/* ── หนามสันหลัง (คอ→หาง) ── */}
      {[[70, 76], [82, 66], [96, 62], [110, 62], [124, 66], [138, 76]].map(([x, y], i) => (
        <path key={i} d={`M${x - 7},${y + 8} L${x},${y - 7} L${x + 7},${y + 8} Z`} fill={spike} stroke={dark} strokeWidth={1} strokeLinejoin="round" />
      ))}

      {/* ── ขาหลัง ── */}
      <ellipse cx={128} cy={120} rx={21} ry={19} fill={body2} stroke={dark} strokeWidth={2.5} />
      <rect x={124} y={128} width={18} height={16} rx={5} fill={body2} stroke={dark} strokeWidth={2} />
      {[0, 1, 2].map((i) => <path key={i} d={`M${125 + i * 6},144 l2.5,6 l2.5,-6 Z`} fill="#e5e7eb" stroke={dark} strokeWidth={1} />)}

      {/* ── คอ ── */}
      <path d="M74,66 Q64,88 84,100 Q98,88 92,66 Z" fill={body} stroke={dark} strokeWidth={3} strokeLinejoin="round" />

      {/* ── ขาหน้า (ใกล้ฮีโร่) ── */}
      <rect x={80} y={126} width={15} height={18} rx={5} fill={body} stroke={dark} strokeWidth={2} />
      {[0, 1, 2].map((i) => <path key={i} d={`M${80 + i * 5.5},144 l2.5,6 l2.5,-6 Z`} fill="#e5e7eb" stroke={dark} strokeWidth={1} />)}

      {/* ── หัว (หันหน้าไปทางซ้าย เข้าหาฮีโร่) ── */}
      <g>
        {/* frill/ครีบหลังหัว */}
        <path d="M78,50 l12,-5 l-7,11 l12,-1 l-11,10 Z" fill={spike} stroke={dark} strokeWidth={1} strokeLinejoin="round" />
        {/* เขา 2 อัน โค้งไปข้างหลัง */}
        <path d="M62,40 Q74,22 88,18 Q80,32 74,46 Z" fill={horn} stroke={dark} strokeWidth={1.5} strokeLinejoin="round" />
        <path d="M54,42 Q60,26 70,20 Q66,34 64,48 Z" fill={horn} stroke={dark} strokeWidth={1.5} strokeLinejoin="round" />
        {/* หัว + ปากยื่น */}
        <path d="M80,48 Q70,32 50,38 Q30,42 16,56 Q11,61 15,68 L34,70 Q30,76 40,80 Q54,82 68,78 Q82,74 82,60 Z" fill={`url(#${gid}-bg)`} stroke={dark} strokeWidth={3} strokeLinejoin="round" />
        {/* เกล็ดแก้ม */}
        <path d="M56,54 q5,6 11,1 M58,64 q5,5 10,1" stroke={dark} strokeWidth={1} fill="none" opacity={0.25} />
        {/* จมูก + รูจมูก */}
        <ellipse cx={22} cy={58} rx={8} ry={6.5} fill={belly} stroke={dark} strokeWidth={1.2} />
        <ellipse cx={19} cy={57} rx={2} ry={1.5} fill={dark} />
        {/* ตา + คิ้วโกรธ */}
        <circle cx={46} cy={54} r={8} fill="#fff" stroke={dark} strokeWidth={1.5} />
        <circle cx={43} cy={55} r={4} fill={eye} />
        <circle cx={41.5} cy={53.5} r={1.3} fill="#0f172a" />
        <path d="M36,45 Q46,44 54,49" stroke={dark} strokeWidth={3.5} fill="none" strokeLinecap="round" />
        {/* ปากอ้า + เขี้ยว */}
        <path d="M15,66 Q34,74 60,71" stroke={dark} strokeWidth={2.2} fill="none" strokeLinecap="round" />
        {[18, 28, 40, 52].map((x, i) => <path key={i} d={`M${x},66 l2,7 l3,-6`} fill="#fff" stroke={dark} strokeWidth={0.8} />)}
      </g>
    </svg>
  );
}

/* ── ป้าย/ตัวเลือกค่า ── */

function ValView({ v, className, tone }: { v: Val; className?: string; tone?: string }) {
  if (v.whole === 0) return <StackedFraction numerator={v.num} denominator={v.den} className={className} toneClassName={tone} />;
  return (
    <span className={cn("inline-flex items-center gap-1 font-black", className, tone)}>
      {v.whole}
      <StackedFraction numerator={v.num} denominator={v.den} className="text-[0.6em]" toneClassName={tone} />
    </span>
  );
}

/* ── เกมหลัก ── */

type Phase = "ask" | "attack" | "hurt" | "win" | "lose";
type Mode = "adventure" | "classroom";

export function DragonBossGame() {
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  useEffect(() => { mutedRef.current = muted; }, [muted]);
  const ctxRef = useRef<AudioContext | null>(null);
  const fastRef = useRef(false);
  const { play, ensure } = useSound(mutedRef, ctxRef);
  const bgm = useChiptune(mutedRef, ctxRef, fastRef);
  useEffect(() => {
    bgm.start();
    return () => bgm.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [mode, setMode] = useState<Mode>("adventure");
  const [charIdx, setCharIdx] = useState(0);
  const hero = CHARS[charIdx];

  const [started, setStarted] = useState(false);
  const [maxHp, setMaxHp] = useState(10);
  const [hp, setHp] = useState(10);
  const [hearts, setHearts] = useState(3);
  const [combo, setCombo] = useState(0);
  const [q, setQ] = useState<Question>(() => genQuestion(1));
  const [phase, setPhase] = useState<Phase>("ask");
  const [picked, setPicked] = useState<number | null>(null);
  const [dmgPop, setDmgPop] = useState<string | null>(null);
  const [stat, setStat] = useState<Record<QKind, { ok: number; total: number }>>({
    toImp: { ok: 0, total: 0 }, toMix: { ok: 0, total: 0 }, compare: { ok: 0, total: 0 }, equal: { ok: 0, total: 0 },
  });
  const timeoutsRef = useRef<number[]>([]);
  useEffect(() => () => timeoutsRef.current.forEach((t) => window.clearTimeout(t)), []);

  const enraged = hp <= Math.floor(maxHp / 2);
  useEffect(() => {
    fastRef.current = enraged && started && phase !== "win" && phase !== "lose";
    bgm.schedule();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enraged, started, phase]);

  const level: 1 | 2 = enraged ? 2 : 1;

  function start(m: Mode) {
    ensure(); play("start");
    const mh = m === "classroom" ? 12 : 10;
    setMode(m);
    setMaxHp(mh); setHp(mh); setHearts(3); setCombo(0);
    setStat({ toImp: { ok: 0, total: 0 }, toMix: { ok: 0, total: 0 }, compare: { ok: 0, total: 0 }, equal: { ok: 0, total: 0 } });
    setQ(genQuestion(1));
    setPhase("ask"); setPicked(null); setDmgPop(null);
    setStarted(true);
  }

  function answer(idx: number) {
    if (phase !== "ask") return;
    setPicked(idx);
    const ok = idx === q.answer;
    setStat((s) => ({ ...s, [q.kind]: { ok: s[q.kind].ok + (ok ? 1 : 0), total: s[q.kind].total + 1 } }));
    if (ok) {
      const crit = combo >= 2;
      const dmg = crit ? 2 : 1;
      setCombo((c) => c + 1);
      setPhase("attack");
      play("slash");
      timeoutsRef.current.push(window.setTimeout(() => {
        play(crit ? "crit" : "hit");
        setDmgPop(crit ? `CRIT! -${dmg} ⚔️` : `-${dmg}`);
        setHp((h) => {
          const nh = Math.max(0, h - dmg);
          if (nh <= 0) { timeoutsRef.current.push(window.setTimeout(() => { setPhase("win"); play("win"); }, 700)); }
          else { timeoutsRef.current.push(window.setTimeout(() => { setDmgPop(null); setQ(genQuestion(nh <= Math.floor(maxHp / 2) ? 2 : 1)); setPhase("ask"); setPicked(null); }, 950)); }
          return nh;
        });
      }, 500));
    } else {
      setCombo(0);
      setPhase("hurt");
      play("fire");
      timeoutsRef.current.push(window.setTimeout(() => play("hurt"), 300));
      if (mode === "adventure") {
        setHearts((hh) => {
          const nh = hh - 1;
          if (nh <= 0) { timeoutsRef.current.push(window.setTimeout(() => { setPhase("lose"); play("lose"); }, 800)); }
          else { timeoutsRef.current.push(window.setTimeout(() => { setQ(genQuestion(level)); setPhase("ask"); setPicked(null); }, 1400)); }
          return nh;
        });
      } else {
        timeoutsRef.current.push(window.setTimeout(() => { setPicked(null); setPhase("ask"); }, 1400));
      }
    }
  }

  const weakSkills = (Object.keys(stat) as QKind[]).filter((k) => stat[k].total >= 2 && stat[k].ok / stat[k].total < 0.6);
  const bestSkills = (Object.keys(stat) as QKind[]).filter((k) => stat[k].total >= 2 && stat[k].ok / stat[k].total === 1);

  return (
    <div className="relative overflow-hidden rounded-2xl p-3 sm:p-4">
      <div className={cn("absolute inset-0 transition-colors duration-700", enraged && started ? "bg-gradient-to-b from-rose-200 via-orange-100 to-amber-50" : "bg-gradient-to-b from-indigo-200 via-violet-100 to-fuchsia-50")} />
      <style>{`
        @keyframes charWalkBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        .char-walk { animation: charWalkBob 0.25s ease-in-out infinite; }
        @keyframes legSwing { 0%,100% { transform: rotate(-26deg); } 50% { transform: rotate(26deg); } }
        .leg-swing { animation: legSwing 0.25s ease-in-out infinite; }
        .leg-swing2 { animation: legSwing 0.25s ease-in-out infinite reverse; }
        @keyframes armSwing { 0%,100% { transform: rotate(22deg); } 50% { transform: rotate(-22deg); } }
        .arm-swing { animation: armSwing 0.25s ease-in-out infinite; }
        @keyframes bossIdle { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        .boss-idle { animation: bossIdle 2.4s ease-in-out infinite; }
        @keyframes bossHurt { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-8px) rotate(-3deg); } 60% { transform: translateX(8px) rotate(3deg); } }
        .boss-hurt { animation: bossHurt 0.4s ease-in-out; }
        @keyframes wingFlap { 0%,100% { transform: rotate(0); } 50% { transform: rotate(-12deg); } }
        .wing-flap { transform-origin: 120px 66px; animation: wingFlap 1.6s ease-in-out infinite; }
        @keyframes heroLunge { 0% { transform: translateX(0); } 40% { transform: translateX(190px) scale(1.05); } 60% { transform: translateX(190px); } 100% { transform: translateX(0); } }
        .hero-lunge { animation: heroLunge 0.95s ease-in-out; }
        @keyframes slashFx { 0% { transform: scale(0.3) rotate(-30deg); opacity: 0; } 40% { transform: scale(1.3) rotate(10deg); opacity: 1; } 100% { transform: scale(1) rotate(20deg); opacity: 0; } }
        .slash-fx { animation: slashFx 0.5s ease-out; }
        @keyframes firePlume { 0% { transform: scaleX(0) translateX(0); opacity: 0; } 30% { opacity: 1; } 100% { transform: scaleX(1) translateX(-10px); opacity: 0; } }
        .fire-fx { transform-origin: right center; animation: firePlume 1.2s ease-out; }
        @keyframes dmgFloat { 0% { transform: translateY(0) scale(0.6); opacity: 0; } 30% { transform: translateY(-8px) scale(1.15); opacity: 1; } 100% { transform: translateY(-32px) scale(1); opacity: 0; } }
        .dmg-float { animation: dmgFloat 0.95s ease-out; }
        @keyframes cloudA { from { left: -12%; } to { left: 105%; } }
        .cloud-a { animation: cloudA 40s linear infinite; }
        .cloud-b { animation: cloudA 56s linear infinite; animation-delay: -24s; }
      `}</style>

      <div className="relative space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-extrabold text-violet-800">🐉 ศึกบอสมังกรเศษส่วน — ตอบถูกฟาดบอส!</h3>
          <button onClick={() => setMuted((m) => !m)} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border-2 border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50" title={muted ? "เปิดเสียง" : "ปิดเสียง"}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {!started || phase === "win" || phase === "lose" ? (
          /* ── จอเริ่ม / จบ ── */
          <div className="space-y-4 rounded-2xl border-2 border-violet-200 bg-white/90 p-4 sm:p-6">
            {phase === "win" ? (
              <div className="space-y-2 text-center">
                <div className="text-5xl">🐉💥🎉</div>
                <h3 className="text-xl font-extrabold text-slate-800 sm:text-2xl">ล้มบอสมังกรสำเร็จ!</h3>
                <div className="flex items-center justify-center"><BlockChar c={hero} walking size={64} /></div>
              </div>
            ) : phase === "lose" ? (
              <div className="space-y-2 text-center">
                <div className="text-5xl">😵‍💫🔥</div>
                <h3 className="text-xl font-extrabold text-slate-800 sm:text-2xl">โดนมังกรพ่นไฟหมดพลัง... สู้ใหม่!</h3>
              </div>
            ) : (
              <p className="text-center text-sm font-bold text-slate-500">
                ด่านสุดท้ายของบท! รวมทุกทักษะ: แปลงเกิน↔คละ · เปรียบเทียบ · เท่ากันหรือไม่ — ตอบถูกฟาดบอส คอมโบ 3 ขึ้นไป = คริติคอลแรงx2!
              </p>
            )}

            {(phase === "win" || phase === "lose") && (
              <div className="mx-auto max-w-sm space-y-1 rounded-2xl bg-slate-50 p-3 text-sm">
                <p className="text-center font-extrabold text-slate-600">📊 สรุปทักษะ</p>
                {(Object.keys(stat) as QKind[]).filter((k) => stat[k].total > 0).map((k) => (
                  <div key={k} className="flex items-center justify-between">
                    <span className="font-bold text-slate-600">{SKILL_LABEL[k]}</span>
                    <span className={cn("font-extrabold", stat[k].ok === stat[k].total ? "text-emerald-600" : stat[k].ok / stat[k].total < 0.6 ? "text-rose-600" : "text-amber-600")}>{stat[k].ok}/{stat[k].total}</span>
                  </div>
                ))}
                {weakSkills.length > 0 && <p className="pt-1 text-center text-xs font-extrabold text-rose-600">ควรฝึกเพิ่ม: {weakSkills.map((k) => SKILL_LABEL[k]).join(", ")}</p>}
                {weakSkills.length === 0 && bestSkills.length > 0 && <p className="pt-1 text-center text-xs font-extrabold text-emerald-600">เก่งมาก! แม่นทุกทักษะที่เจอ 🌟</p>}
              </div>
            )}

            {/* เลือกฮีโร่ */}
            <div className="space-y-1.5">
              <p className="text-center text-sm font-extrabold text-slate-600">เลือกฮีโร่:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {CHARS.map((c, i) => (
                  <button key={i} onClick={() => setCharIdx(i)} className={cn("flex flex-col items-center gap-0.5 rounded-2xl border-2 p-2 transition", charIdx === i ? "border-violet-500 bg-violet-50 ring-2 ring-violet-200" : "border-slate-200 bg-white hover:border-violet-300")}>
                    <BlockChar c={c} walking={charIdx === i} size={48} />
                    <span className="text-[11px] font-extrabold text-slate-600">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              <button onClick={() => start("adventure")} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-2.5 text-base font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
                <Swords size={17} /> {started ? "ท้าดวลอีกครั้ง" : "ผจญภัยเดี่ยว (❤️3)"}
              </button>
              <button onClick={() => start("classroom")} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-2.5 text-base font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
                <School size={17} /> ทั้งห้องช่วยกัน (ไม่มีหัวใจ)
              </button>
            </div>
          </div>
        ) : (
          /* ── กำลังสู้ ── */
          <div className="space-y-3">
            {/* HP บอส */}
            <div className="rounded-2xl border-2 border-violet-200 bg-white/90 px-3 py-2">
              <div className="flex items-center justify-between text-xs font-extrabold">
                <span className={enraged ? "text-rose-600" : "text-violet-700"}>🐉 มังกร{enraged ? " (โกรธ! 🔥)" : ""}</span>
                <span className="text-slate-500">HP {hp}/{maxHp}</span>
              </div>
              <div className="mt-1 h-3 w-full overflow-hidden rounded-full bg-slate-200">
                <div className={cn("h-full rounded-full transition-all duration-500", enraged ? "bg-gradient-to-r from-rose-500 to-orange-500" : "bg-gradient-to-r from-violet-500 to-fuchsia-500")} style={{ width: `${(hp / maxHp) * 100}%` }} />
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                {mode === "adventure" ? (
                  <span className="text-sm font-extrabold text-rose-500">{"❤️".repeat(Math.max(0, hearts))}{"🖤".repeat(Math.max(0, 3 - hearts))}</span>
                ) : (
                  <span className="text-xs font-extrabold text-emerald-600">🏫 ทั้งห้องช่วยกัน — ผลัดกันตอบ</span>
                )}
                {combo >= 2 && <span className="text-sm font-extrabold text-orange-500">🔥 คอมโบ x{combo}{combo >= 2 ? " (คริต!)" : ""}</span>}
              </div>
            </div>

            {/* เวทีต่อสู้ */}
            <div className="relative h-[210px] overflow-hidden rounded-2xl border-2 border-violet-300 bg-gradient-to-b from-sky-200 to-emerald-100">
              <div className="cloud-a pointer-events-none absolute top-3 text-3xl opacity-70">☁️</div>
              <div className="cloud-b pointer-events-none absolute top-12 text-2xl opacity-50">☁️</div>
              <div className="absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-b from-emerald-400 to-emerald-500" />
              <div className="absolute inset-x-0 bottom-[33%] h-1.5 bg-emerald-600/40" />

              {/* ฮีโร่ */}
              <div className="absolute bottom-[42px] left-[8%]">
                <div className="absolute -bottom-2 left-1 h-3 w-16 rounded-full bg-black/25 blur-[3px]" />
                <div className={cn(phase === "attack" && "hero-lunge")}>
                  <BlockChar c={hero} walking={phase === "attack"} size={92} />
                </div>
              </div>
              {/* ฟันดาบ */}
              {phase === "attack" && <div className="slash-fx pointer-events-none absolute bottom-[90px] right-[26%] text-5xl">⚔️</div>}

              {/* บอส */}
              <div className="absolute bottom-[36px] right-[4%]">
                <div className="absolute bottom-0 left-2 h-4 w-28 rounded-full bg-black/25 blur-[4px]" />
                <Dragon enraged={enraged} hurt={phase === "attack"} size={158} />
                {dmgPop && <div className="dmg-float pointer-events-none absolute right-8 top-2 rounded-lg bg-amber-400 px-2 py-0.5 text-lg font-black text-white shadow ring-2 ring-amber-200">{dmgPop}</div>}
              </div>
              {/* ไฟมังกร */}
              {phase === "hurt" && (
                <div className="fire-fx pointer-events-none absolute bottom-[70px] right-[30%] flex items-center gap-1 text-4xl">
                  🔥🔥🔥
                </div>
              )}
            </div>

            {/* โจทย์ */}
            <div className="rounded-2xl border-2 border-violet-200 bg-white/95 px-4 py-3 text-center shadow-sm">
              <span className="mb-1 inline-block rounded-full bg-violet-100 px-3 py-0.5 text-xs font-extrabold text-violet-700">{SKILL_LABEL[q.kind]}</span>
              {q.kind === "toImp" && (
                <p className="flex flex-wrap items-center justify-center gap-2 text-lg font-extrabold text-slate-700 sm:text-xl">
                  ฟาดด้วยเศษเกินของ <ValView v={q.m!} className="text-3xl text-violet-700 sm:text-4xl" tone="text-violet-700" />
                </p>
              )}
              {q.kind === "toMix" && (
                <p className="flex flex-wrap items-center justify-center gap-2 text-lg font-extrabold text-slate-700 sm:text-xl">
                  ฟาดด้วยจำนวนคละของ <ValView v={q.m!} className="text-3xl text-violet-700 sm:text-4xl" tone="text-violet-700" />
                </p>
              )}
              {q.kind === "compare" && <p className="text-lg font-extrabold text-slate-700 sm:text-xl">แตะฝั่งที่<b className="text-violet-700">มากกว่า</b> เพื่อฟาดบอส!</p>}
              {q.kind === "equal" && (
                <p className="flex flex-wrap items-center justify-center gap-2 text-lg font-extrabold text-slate-700 sm:text-xl">
                  <ValView v={q.a!} className="text-2xl text-violet-700 sm:text-3xl" tone="text-violet-700" />
                  <span className="text-slate-400">กับ</span>
                  <ValView v={q.b!} className="text-2xl text-fuchsia-700 sm:text-3xl" tone="text-fuchsia-700" />
                  <span className="text-slate-400">เท่ากันไหม?</span>
                </p>
              )}
            </div>

            {/* ตัวเลือก */}
            <div className={cn("mx-auto grid max-w-lg gap-2 sm:gap-3", q.options.length === 2 ? "grid-cols-2" : "grid-cols-3")}>
              {q.options.map((o, i) => {
                const isAns = i === q.answer;
                const show = picked !== null;
                return (
                  <button
                    key={i}
                    onClick={() => answer(i)}
                    disabled={phase !== "ask"}
                    data-opt={i}
                    data-correct={isAns ? "1" : "0"}
                    className={cn(
                      "flex items-center justify-center rounded-2xl border-b-4 bg-white py-4 shadow transition",
                      phase === "ask" ? "border-slate-300 hover:-translate-y-0.5 hover:border-violet-400 active:scale-[0.97]" : isAns ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-300" : picked === i ? "border-rose-500 bg-rose-50" : "border-slate-300 opacity-50",
                    )}
                  >
                    {o.kind === "text"
                      ? <span className="text-xl font-black text-slate-700 sm:text-2xl">{o.text}</span>
                      : <ValView v={o.val!} className="text-2xl text-slate-800 sm:text-3xl" tone={show && isAns ? "text-emerald-700" : "text-slate-800"} />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
