"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { RunnerSVG, type Custom } from "@/components/lessons/compare/RaceTrackGame";
import { cn } from "@/lib/cn";
import { randInt } from "@/lib/randomFraction";

/* ── ชนิดข้อมูล ── */

type Frac = { num: number; den: number };
type Sign = ">" | "=" | "<";
type Screen = "start" | "play" | "clear" | "win";
type Phase = "ask" | "anim" | "result";

const SIGNS: Sign[] = [">", "=", "<"];
const GATES_PER_FLOOR = 4;
const DENS = [3, 4, 5, 6, 8, 10, 12];

/* นักผจญภัยประจำเกม (ใช้ตัวการ์ตูนจากเกมวิ่ง) */
const HERO: Custom = { skin: "#fcd7b8", hair: "spiky", hairColor: "#5b3a1e", shirt: "#22c55e" };

/* ── 4 ชั้นของหอคอย ── */

const FLOORS = [
  {
    name: "ป่ามหัศจรรย์", emoji: "🌲", hint: "ตัวส่วนเท่ากัน — ดูตัวเศษได้เลย",
    bg: "from-emerald-100 via-green-50 to-lime-50", banner: "bg-emerald-600",
    stone: "#4d7c0f", stoneLight: "#84cc16", decor: ["🌲", "🍄", "🦋", "🌷"],
  },
  {
    name: "ถ้ำคริสตัล", emoji: "💎", hint: "ตัวเศษเท่ากัน — ตัวส่วนน้อยกว่า ชิ้นใหญ่กว่า",
    bg: "from-violet-200 via-indigo-100 to-purple-50", banner: "bg-violet-600",
    stone: "#6d28d9", stoneLight: "#a78bfa", decor: ["💎", "🔮", "✨", "🪨"],
  },
  {
    name: "ปล่องภูเขาไฟ", emoji: "🌋", hint: "ต่างกันทั้งคู่ — ทำตัวส่วนให้เท่ากันก่อน",
    bg: "from-orange-200 via-amber-100 to-rose-100", banner: "bg-orange-600",
    stone: "#9a3412", stoneLight: "#fb923c", decor: ["🌋", "🔥", "🪨", "🦎"],
  },
  {
    name: "ปราสาทเมฆ", emoji: "☁️", hint: "คละทุกแบบ — ระวัง! มีข้อที่เท่ากันด้วย",
    bg: "from-sky-200 via-blue-100 to-white", banner: "bg-sky-600",
    stone: "#0369a1", stoneLight: "#7dd3fc", decor: ["☁️", "🌈", "🕊️", "⭐"],
  },
];

/* ── คณิต ── */

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
const lcm = (a: number, b: number) => (a * b) / gcd(a, b);

function cmp(l: Frac, r: Frac): Sign {
  const a = l.num * r.den;
  const b = r.num * l.den;
  return a > b ? ">" : a < b ? "<" : "=";
}

/* ── สุ่มโจทย์ตามชั้น (gold = ประตูทองข้อสุดท้าย ยากขึ้น) ── */

function genQ(floor: number, gold: boolean): { l: Frac; r: Frac } {
  if (floor === 1) {
    const den = gold ? [10, 12][randInt(0, 1)] : [4, 6, 8][randInt(0, 2)];
    const n1 = randInt(1, den - 1);
    let n2 = gold ? Math.min(den - 1, Math.max(1, n1 + (randInt(0, 1) === 0 ? 1 : -1))) : randInt(1, den - 1);
    if (n2 === n1) n2 = n1 === den - 1 ? n1 - 1 : n1 + 1;
    return { l: { num: n1, den }, r: { num: n2, den } };
  }
  if (floor === 2) {
    const num = gold ? randInt(2, 5) : randInt(1, 4);
    const opts = DENS.filter((d) => d > num);
    const i1 = randInt(0, opts.length - 1);
    let i2 = gold ? Math.min(opts.length - 1, Math.max(0, i1 + (randInt(0, 1) === 0 ? 1 : -1))) : randInt(0, opts.length - 1);
    if (i2 === i1) i2 = (i1 + 1) % opts.length;
    return { l: { num, den: opts[i1] }, r: { num, den: opts[i2] } };
  }
  if (floor === 3) {
    let best: { l: Frac; r: Frac } | null = null;
    for (let t = 0; t < 60; t++) {
      const d1 = DENS[randInt(1, DENS.length - 1)];
      let d2 = DENS[randInt(1, DENS.length - 1)];
      if (d2 === d1) d2 = DENS[(DENS.indexOf(d1) + 1) % DENS.length];
      const l = { num: randInt(1, d1 - 1), den: d1 };
      const r = { num: randInt(1, d2 - 1), den: d2 };
      if (l.num === r.num || cmp(l, r) === "=") continue;
      best = { l, r };
      // ประตูทอง: เอาคู่ที่ค่าใกล้กัน (ต้องคิดจริง)
      if (!gold || Math.abs(l.num * r.den - r.num * l.den) <= Math.max(2, (d1 * d2) / 10)) return best;
    }
    return best ?? { l: { num: 2, den: 3 }, r: { num: 3, den: 5 } };
  }
  // ชั้น 4: 40% เจอคู่เท่ากัน (เศษส่วนเทียบเท่า) ที่เหลือคละชั้น 1-3
  if (randInt(1, 10) <= 4) {
    const bases: Frac[] = [
      { num: 1, den: 2 }, { num: 1, den: 3 }, { num: 2, den: 3 },
      { num: 1, den: 4 }, { num: 3, den: 4 }, { num: 2, den: 5 }, { num: 3, den: 5 },
    ];
    const b = bases[randInt(0, bases.length - 1)];
    const k = randInt(2, Math.max(2, Math.floor(12 / b.den)));
    const eqf = { num: b.num * k, den: b.den * k };
    return randInt(0, 1) === 0 ? { l: b, r: eqf } : { l: eqf, r: b };
  }
  return genQ(randInt(1, 3), gold);
}

/* ── เสียงเอฟเฟกต์ ── */

type SoundKind = "open" | "wrong" | "star" | "clear" | "win" | "start" | "pick";

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
      case "open": sweep(180, 520, 0.3, "triangle", 0.09); return tones([784, 1047, 1319], 0.09, 0.16, "triangle", 0.12);
      case "wrong": return tones([150, 98], 0.13, 0.25, "sawtooth", 0.13);
      case "star": return tones([1047, 1319, 1568], 0.07, 0.14, "triangle", 0.14);
      case "clear": return tones([523, 659, 784, 1047, 784, 1047, 1319], 0.09, 0.16, "triangle", 0.15);
      case "win": return tones([523, 659, 784, 1047, 1319, 1568, 2093], 0.11, 0.24, "triangle", 0.16);
      case "start": return tones([523, 784, 1047], 0.08, 0.12, "triangle", 0.14);
      case "pick": return tones([880], 0.01, 0.06, "square", 0.05);
    }
  }
  return { play, ensure };
}

/* ── เพลงชิปทูนผจญภัย (แต่งใหม่ ไม่ใช้ไฟล์) ── */

const ADV_LEAD = [72, 74, 76, 79, 76, 74, 72, 69, 71, 72, 74, 76, 74, 72, 71, 67, 72, 74, 76, 79, 81, 79, 76, 74, 76, 77, 79, 81, 79, 76, 74, 72];
const ADV_BASS = [48, 52, 55, 52, 43, 47, 50, 47, 45, 52, 48, 55, 43, 50, 47, 43];

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
      const m = ADV_LEAD[s];
      if (m) note(m, 0.17, "square", 0.028);
      if (s % 2 === 0) {
        const b = ADV_BASS[s / 2];
        if (b) note(b, 0.3, "triangle", 0.05);
      }
    }, 210);
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

/* ── ประตูวิเศษ SVG ── */

function GateSVG({ sign, state, stone, stoneLight, gold }: {
  sign: Sign; state: "idle" | "open" | "reveal" | "dim"; stone: string; stoneLight: string; gold: boolean;
}) {
  const open = state === "open" || state === "reveal";
  const frameFill = gold ? "#b45309" : stone;
  const frameLight = gold ? "#fbbf24" : stoneLight;
  return (
    <svg viewBox="0 0 120 170" className={cn("w-full transition-opacity duration-300", state === "dim" && "opacity-40")} role="img" aria-label={`ประตูเครื่องหมาย ${sign}`}>
      {/* กรอบหินโค้ง */}
      <path d="M 8 168 L 8 62 Q 8 8 60 8 Q 112 8 112 62 L 112 168 Z" fill={frameFill} />
      <path d="M 8 168 L 8 62 Q 8 8 60 8 Q 112 8 112 62 L 112 168 Z" fill="none" stroke={frameLight} strokeWidth="3" />
      {/* ก้อนหินประดับ */}
      <circle cx="22" cy="52" r="4" fill={frameLight} opacity="0.7" />
      <circle cx="98" cy="52" r="4" fill={frameLight} opacity="0.7" />
      <circle cx="60" cy="16" r="4.5" fill={gold ? "#fde68a" : frameLight} />
      {/* ช่องประตูด้านใน */}
      <path d="M 20 168 L 20 66 Q 20 22 60 22 Q 100 22 100 66 L 100 168 Z" fill={open ? "url(#gateLight)" : "#1e1b31"} />
      {open && (
        <>
          {/* ลำแสงพุ่งออก */}
          <path d="M 60 90 L 30 168 L 90 168 Z" fill="#fff7cf" opacity="0.55" />
          <circle cx="60" cy="80" r="16" fill="#fffbeb" opacity="0.9" />
        </>
      )}
      {/* บานประตูไม้ (ปิดอยู่) */}
      {!open && (
        <g>
          <path d="M 24 168 L 24 68 Q 24 26 60 26 Q 96 26 96 68 L 96 168 Z" fill={gold ? "#d97706" : "#8a5a2b"} />
          <path d="M 24 168 L 24 68 Q 24 26 60 26 Q 96 26 96 68 L 96 168 Z" fill="none" stroke={gold ? "#92400e" : "#6b4423"} strokeWidth="2.5" />
          <line x1="60" y1="27" x2="60" y2="168" stroke={gold ? "#92400e" : "#6b4423"} strokeWidth="2" />
          <line x1="26" y1="100" x2="94" y2="100" stroke={gold ? "#92400e" : "#6b4423"} strokeWidth="1.6" opacity="0.7" />
          <line x1="26" y1="140" x2="94" y2="140" stroke={gold ? "#92400e" : "#6b4423"} strokeWidth="1.6" opacity="0.7" />
          <circle cx="72" cy="104" r="3.5" fill="#fbbf24" stroke="#92400e" strokeWidth="1" />
        </g>
      )}
      {/* ป้ายเครื่องหมายทอง */}
      <circle cx="60" cy="64" r="21" fill={open ? "#fef3c7" : "#fbbf24"} stroke="#92400e" strokeWidth="3" />
      <text x="60" y="76" fontSize="34" textAnchor="middle" fontWeight={900} fill={open ? "#b45309" : "#78350f"}>{sign}</text>
      {/* วงแหวนเฉลย */}
      {state === "reveal" && <path d="M 8 168 L 8 62 Q 8 8 60 8 Q 112 8 112 62 L 112 168 Z" fill="none" stroke="#f59e0b" strokeWidth="6" className="gate-pulse" />}
      <defs>
        <radialGradient id="gateLight" cx="0.5" cy="0.45" r="0.8">
          <stop offset="0" stopColor="#fffbeb" />
          <stop offset="0.6" stopColor="#fde68a" />
          <stop offset="1" stopColor="#f59e0b" />
        </radialGradient>
      </defs>
    </svg>
  );
}

/* ── แถบเทียบ (เฉลย) ── */

function MiniBars({ l, r }: { l: Frac; r: Frac }) {
  const row = (f: Frac, fill: string, ring: string, tone: string) => (
    <div className="flex items-center gap-2">
      <StackedFraction numerator={f.num} denominator={f.den} className="w-9 shrink-0 text-sm" toneClassName={tone} />
      <div className={cn("flex h-6 flex-1 overflow-hidden rounded-lg border-2 bg-white", ring)}>
        {Array.from({ length: f.den }, (_, i) => (
          <div key={i} className={cn("flex-1 border-r border-slate-300/60 last:border-r-0", i < f.num && fill)} />
        ))}
      </div>
    </div>
  );
  return (
    <div className="mx-auto max-w-sm space-y-1">
      {row(l, "bg-emerald-400", "border-emerald-400", "text-emerald-700")}
      {row(r, "bg-sky-400", "border-sky-400", "text-sky-700")}
    </div>
  );
}

function explainText(l: Frac, r: Frac): string {
  const s = cmp(l, r);
  if (s === "=") {
    const [small, big] = l.den < r.den ? [l, r] : [r, l];
    return `เท่ากันพอดี! ${small.num}/${small.den} คูณบน-ล่างด้วย ${big.den / small.den} ได้ ${big.num}/${big.den}`;
  }
  if (l.den === r.den) return `ตัวส่วนเท่ากัน ดูตัวเศษ: ${l.num} ${s} ${r.num}`;
  if (l.num === r.num) return `ตัวเศษเท่ากัน — ตัวส่วนน้อยกว่า ชิ้นใหญ่กว่า (ส่วน ${l.den} เทียบ ส่วน ${r.den})`;
  const L = lcm(l.den, r.den);
  return `ทำส่วนให้เท่ากัน (${L}): ${l.num * (L / l.den)}/${L} ${s} ${r.num * (L / r.den)}/${L}`;
}

/* ── หอคอยแสดงความคืบหน้า ── */

function TowerMap({ floor, stars }: { floor: number; stars: number[] }) {
  return (
    <div className="hidden w-24 shrink-0 flex-col-reverse items-center gap-1 sm:flex">
      {FLOORS.map((f, i) => {
        const n = i + 1;
        const current = n === floor;
        return (
          <div key={f.name} className={cn("relative w-full rounded-xl border-2 px-1.5 py-2 text-center transition", current ? "border-amber-400 bg-amber-50 shadow" : n < floor || stars[i] > 0 ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white/70")}>
            <div className="text-lg leading-none">{f.emoji}</div>
            <div className="mt-0.5 text-[9px] font-extrabold text-slate-500">ชั้น {n}</div>
            <div className="text-[10px] leading-none text-amber-500">{stars[i] > 0 ? "★".repeat(stars[i]) : "☆☆☆"}</div>
            {current && <span className="absolute -left-2 top-1/2 -translate-y-1/2 text-sm">🧭</span>}
          </div>
        );
      })}
      <div className="text-[10px] font-extrabold text-slate-400">🏰 หอคอย</div>
    </div>
  );
}

/* ── เกมหลัก ── */

export function FractionGateGame() {
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  useEffect(() => { mutedRef.current = muted; }, [muted]);
  const ctxRef = useRef<AudioContext | null>(null);
  const { play, ensure } = useSound(mutedRef, ctxRef);
  const bgm = useChiptune(mutedRef, ctxRef);

  const [screen, setScreen] = useState<Screen>("start");
  const [floor, setFloor] = useState(1);
  const [gate, setGate] = useState(0); // 0..3
  const [hearts, setHearts] = useState(3);
  const [mistakes, setMistakes] = useState(0);
  const [stars, setStars] = useState<number[]>([0, 0, 0, 0]);
  const [score, setScore] = useState(0);
  const [q, setQ] = useState<{ l: Frac; r: Frac }>(() => genQ(1, false));
  const [phase, setPhase] = useState<Phase>("ask");
  const [picked, setPicked] = useState<Sign | null>(null);

  const theme = FLOORS[floor - 1];
  const isGold = gate === GATES_PER_FLOOR - 1;
  const answer = cmp(q.l, q.r);

  /* เพลง: เล่นระหว่างผจญภัย */
  useEffect(() => {
    if (screen === "play" || screen === "clear") bgm.start();
    else bgm.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  function enterFloor(f: number) {
    setFloor(f);
    setGate(0);
    setHearts(3);
    setMistakes(0);
    setQ(genQ(f, false));
    setPhase("ask");
    setPicked(null);
    setScreen("play");
  }

  function startAdventure() {
    ensure();
    play("start");
    setStars([0, 0, 0, 0]);
    setScore(0);
    enterFloor(1);
  }

  function advance() {
    if (gate < GATES_PER_FLOOR - 1) {
      const g = gate + 1;
      setGate(g);
      setQ(genQ(floor, g === GATES_PER_FLOOR - 1));
      setPhase("ask");
      setPicked(null);
    } else {
      // ผ่านชั้น! ให้ดาวตามความแม่น
      const st = mistakes === 0 ? 3 : mistakes === 1 ? 2 : 1;
      setStars((arr) => arr.map((v, i) => (i === floor - 1 ? Math.max(v, st) : v)));
      play(floor === 4 ? "win" : "clear");
      setScreen(floor === 4 ? "win" : "clear");
    }
  }

  function pick(s: Sign) {
    if (phase !== "ask") return;
    setPicked(s);
    if (s === answer) {
      setScore((sc) => sc + (isGold ? 20 : 10));
      play("open");
      setPhase("anim");
      window.setTimeout(() => advance(), 1250);
    } else {
      setHearts((h) => h - 1);
      setMistakes((m) => m + 1);
      play("wrong");
      setPhase("result");
    }
  }

  const gateState = (s: Sign): "idle" | "open" | "reveal" | "dim" => {
    if (phase === "anim") return s === answer ? "open" : "dim";
    if (phase === "result") return s === answer ? "reveal" : s === picked ? "dim" : "dim";
    return "idle";
  };

  const totalStars = stars.reduce((a, b) => a + b, 0);
  const heroLeft = picked ? `${(SIGNS.indexOf(picked) * 33.33) + 16.67}%` : "50%";

  return (
    <div className="relative overflow-hidden rounded-2xl p-3 sm:p-4">
      {/* ฉากหลังเปลี่ยนตามชั้น */}
      <div className={cn("absolute inset-0 bg-gradient-to-b transition-colors duration-700", theme.bg)} />
      <div className="pointer-events-none absolute inset-0 overflow-hidden text-2xl" aria-hidden>
        <span className="absolute left-4 top-10 opacity-50">{theme.decor[0]}</span>
        <span className="absolute right-6 top-20 opacity-40">{theme.decor[1]}</span>
        <span className="absolute bottom-24 left-8 opacity-40">{theme.decor[2]}</span>
        <span className="absolute bottom-10 right-10 opacity-50">{theme.decor[3]}</span>
      </div>
      <style>{`
        @keyframes gatePulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
        .gate-pulse { animation: gatePulse 0.9s ease-in-out infinite; }
        @keyframes walkIn { 0% { transform: translate(-50%, 0) scale(1); opacity: 1; } 100% { transform: translate(-50%, -85px) scale(0.35); opacity: 0; } }
        .hero-walk { animation: walkIn 1.1s ease-in forwards; }
        @keyframes starPop { 0% { transform: scale(0); } 70% { transform: scale(1.3); } 100% { transform: scale(1); } }
        .star-pop { display: inline-block; animation: starPop 0.5s ease-out backwards; }
      `}</style>

      <div className="relative space-y-3">
        {/* แถบบน: เลือกชั้น + ปิดเสียง */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {FLOORS.map((f, i) => (
              <button key={f.name} onClick={() => { ensure(); enterFloor(i + 1); }} title={`ชั้น ${i + 1} ${f.name}`} className={cn("rounded-lg border-2 px-2 py-1 text-xs font-extrabold transition", screen !== "start" && floor === i + 1 ? "border-amber-400 bg-amber-100 text-amber-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
                {f.emoji} ชั้น {i + 1}
              </button>
            ))}
          </div>
          <button onClick={() => setMuted((m) => !m)} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border-2 border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50" title={muted ? "เปิดเสียง" : "ปิดเสียง"}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {/* ═══ หน้าเริ่ม ═══ */}
        {screen === "start" && (
          <div className="space-y-4 rounded-2xl border-2 border-violet-200 bg-white/85 p-6 text-center">
            <div className="flex items-end justify-center gap-2 text-5xl">
              <RunnerSVG c={HERO} running={false} className="h-20 w-14" />
              <span>🏰</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 sm:text-2xl">หอคอยประตูมหัศจรรย์</h3>
            <p className="mx-auto max-w-md text-sm font-bold text-slate-500 sm:text-base">
              ปีนหอคอย 4 ชั้นไปเปิดหีบสมบัติ! แต่ละชั้นมีประตู 4 ด่าน — ดูเศษส่วนสองตัวแล้ว<b>เดินเข้าประตูเครื่องหมาย {">"} {"="} {"<"} ที่ถูกต้อง</b>
            </p>
            <div className="mx-auto flex max-w-md flex-wrap justify-center gap-2 text-xs font-extrabold text-slate-600">
              <span className="rounded-full bg-emerald-100 px-3 py-1">🌲💎🌋☁️ 4 ชั้น 4 ธีม</span>
              <span className="rounded-full bg-rose-100 px-3 py-1">❤️ ชั้นละ 3 หัวใจ</span>
              <span className="rounded-full bg-amber-100 px-3 py-1">⭐ เก็บดาวสูงสุด 12 ดวง</span>
              <span className="rounded-full bg-yellow-100 px-3 py-1">🌟 ประตูทองคะแนน x2</span>
            </div>
            {totalStars > 0 && <p className="text-sm font-extrabold text-amber-600">⭐ ดาวสะสม {totalStars}/12</p>}
            <button onClick={startAdventure} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
              <Play size={20} /> เริ่มผจญภัย!
            </button>
          </div>
        )}

        {/* ═══ กำลังเล่น ═══ */}
        {screen === "play" && (
          <div className="flex gap-3">
            <TowerMap floor={floor} stars={stars} />
            <div className="min-w-0 flex-1 space-y-3">
              {/* ป้ายชั้น + สถานะ */}
              <div className={cn("flex flex-wrap items-center justify-between gap-2 rounded-2xl px-4 py-2 text-white", theme.banner)}>
                <span className="text-sm font-extrabold sm:text-base">{theme.emoji} ชั้น {floor} — {theme.name}</span>
                <span className="text-xs font-bold opacity-90">{theme.hint}</span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 rounded-2xl bg-white/80 px-4 py-2 ring-1 ring-slate-200">
                <span className="text-base font-extrabold text-amber-700">🏅 {score}</span>
                <span className="text-base tracking-wider">{Array.from({ length: 3 }, (_, i) => (i < hearts ? "❤️" : "🤍")).join("")}</span>
                <span className="flex items-center gap-1 text-sm font-extrabold text-slate-500">
                  {Array.from({ length: GATES_PER_FLOOR }, (_, i) => (
                    <span key={i} className={cn(i < gate ? "opacity-100" : i === gate ? "animate-pulse" : "opacity-30")}>{i === GATES_PER_FLOOR - 1 ? "🌟" : "🚪"}</span>
                  ))}
                  <span className="ml-1">ประตู {gate + 1}/{GATES_PER_FLOOR}</span>
                </span>
                {isGold && <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-extrabold text-yellow-700">🌟 ประตูทอง คะแนน x2!</span>}
              </div>

              {/* โจทย์ */}
              <div className="mx-auto flex max-w-md items-center justify-center gap-3 rounded-2xl border-2 border-slate-200 bg-white/90 px-5 py-3 shadow-sm">
                <StackedFraction numerator={q.l.num} denominator={q.l.den} className="text-3xl sm:text-4xl" toneClassName="text-emerald-700" />
                <span className="grid h-11 w-11 place-items-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-xl font-extrabold text-slate-400">?</span>
                <StackedFraction numerator={q.r.num} denominator={q.r.den} className="text-3xl sm:text-4xl" toneClassName="text-sky-700" />
              </div>
              <p className="text-center text-sm font-extrabold text-slate-600 sm:text-base">
                {phase === "ask" ? "👆 เดินเข้าประตูเครื่องหมายที่ถูกต้อง!" : phase === "anim" ? "✨ ประตูเปิดแล้ว! เดินหน้าต่อ..." : "❌ ประตูผิด! ดูเฉลยแล้วไปต่อ"}
              </p>

              {/* ประตู 3 บาน + นักผจญภัย */}
              <div className="relative mx-auto max-w-xl">
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  {SIGNS.map((s) => (
                    <button key={s} onClick={() => { play("pick"); pick(s); }} disabled={phase !== "ask"} className={cn("transition", phase === "ask" && "hover:-translate-y-1.5 active:scale-95")}>
                      <GateSVG sign={s} state={gateState(s)} stone={theme.stone} stoneLight={theme.stoneLight} gold={isGold} />
                    </button>
                  ))}
                </div>
                {/* นักผจญภัย */}
                <div
                  className={cn("pointer-events-none absolute -bottom-2", phase === "anim" && "hero-walk")}
                  style={{ left: heroLeft, transform: "translateX(-50%)", transition: "left 0.25s ease-out" }}
                >
                  <RunnerSVG c={HERO} running={phase === "anim"} className="h-16 w-12 drop-shadow-md sm:h-20 sm:w-14" />
                </div>
              </div>

              {/* เฉลยเมื่อผิด */}
              {phase === "result" && (
                <div className="space-y-2 rounded-2xl border-2 border-rose-200 bg-white/90 p-3">
                  <p className="text-center text-sm font-extrabold text-rose-600">
                    คำตอบคือประตู <span className="mx-1 rounded-lg bg-amber-100 px-2 py-0.5 text-base text-amber-700">{answer}</span> — {explainText(q.l, q.r)}
                  </p>
                  <MiniBars l={q.l} r={q.r} />
                  <div className="text-center">
                    {hearts > 0 ? (
                      <button onClick={advance} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 px-6 py-2.5 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                        🚶 เดินต่อ
                      </button>
                    ) : (
                      <button onClick={() => enterFloor(floor)} className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-2.5 text-base font-extrabold text-white shadow transition hover:bg-rose-700 active:scale-[0.98]">
                        <RotateCcw size={17} /> หัวใจหมด — ลองชั้นนี้ใหม่
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ ผ่านชั้น ═══ */}
        {screen === "clear" && (
          <div className="space-y-4 rounded-2xl border-2 border-emerald-200 bg-white/90 p-6 text-center">
            <div className="text-5xl">{theme.emoji}✨</div>
            <h3 className="text-xl font-extrabold text-slate-800 sm:text-2xl">ผ่านชั้น {floor} — {theme.name}!</h3>
            <div className="text-4xl">
              {Array.from({ length: 3 }, (_, i) => (
                <span key={i} className="star-pop" style={{ animationDelay: `${i * 0.25}s` }}>{i < stars[floor - 1] ? "⭐" : "☆"}</span>
              ))}
            </div>
            <p className="text-sm font-bold text-slate-500">{stars[floor - 1] === 3 ? "ไม่พลาดเลย สุดยอด!" : stars[floor - 1] === 2 ? "เกือบเพอร์เฟกต์!" : "ผ่านแล้ว! ลองกลับมาเก็บ 3 ดาวนะ"}</p>
            <button onClick={() => { play("star"); enterFloor(floor + 1); }} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
              ⬆️ ขึ้นชั้น {floor + 1} — {FLOORS[floor].emoji} {FLOORS[floor].name}
            </button>
          </div>
        )}

        {/* ═══ ชนะเกม ═══ */}
        {screen === "win" && (
          <div className="space-y-4 rounded-2xl border-2 border-amber-300 bg-gradient-to-b from-amber-50 to-white p-6 text-center">
            <div className="text-6xl">🧰✨</div>
            <h3 className="text-2xl font-extrabold text-amber-700">เปิดหีบสมบัติสำเร็จ!</h3>
            <p className="text-base font-extrabold text-slate-700">
              ได้รับฉายา: <span className="rounded-full bg-violet-100 px-3 py-1 text-violet-700">🏆 {totalStars >= 12 ? "จอมเวทเครื่องหมายระดับตำนาน" : totalStars >= 9 ? "นักผจญภัยเครื่องหมายชั้นครู" : "นักผจญภัยเศษส่วนผู้กล้า"}</span>
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-base font-extrabold">
              <span className="text-amber-700">⭐ ดาวรวม {totalStars}/12</span>
              <span className="text-emerald-700">🏅 คะแนน {score}</span>
            </div>
            <div className="flex justify-center gap-2 text-2xl">
              {FLOORS.map((f, i) => (
                <span key={f.name} className="rounded-xl bg-white px-2 py-1 shadow ring-1 ring-slate-200">
                  {f.emoji}<span className="ml-1 text-sm text-amber-500">{"★".repeat(stars[i])}</span>
                </span>
              ))}
            </div>
            {totalStars < 12 && <p className="text-xs font-bold text-slate-400">ยังเก็บดาวไม่ครบ — กดเลือกชั้นด้านบนเพื่อกลับไปเก็บ 3 ดาวได้เลย!</p>}
            <button onClick={startAdventure} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
              <RotateCcw size={18} /> ผจญภัยใหม่ทั้งหมด
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
