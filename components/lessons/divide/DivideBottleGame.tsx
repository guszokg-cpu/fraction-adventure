"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Play, RotateCcw, Volume2, VolumeX, FlaskConical, Target, ArrowRight, Eye, EyeOff, Pencil } from "lucide-react";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { cn } from "@/lib/cn";
import { randInt, shuffle } from "@/lib/randomFraction";

/* ── ค่าคงที่ ── */

const DEN_OPTIONS = [2, 3, 4, 5];
const MISSIONS_TOTAL = 8;
const SS = { shapeRendering: "crispEdges" as const };
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/* ── เสียง ── */

type SoundKind = "pour" | "cap" | "correct" | "wrong" | "start" | "star";

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
      case "pour": return sweep(320, 520, 0.35, "sine", 0.05);
      case "cap": return tones([1400, 1046], 0.04, 0.06, "square", 0.06);
      case "correct": return tones([660, 990, 1319], 0.06, 0.1, "triangle", 0.14);
      case "wrong": return tones([220, 165], 0.11, 0.18, "sawtooth", 0.09);
      case "start": return tones([523, 659, 784], 0.07, 0.12, "triangle", 0.14);
      case "star": return tones([1047, 1319, 1568, 2093], 0.07, 0.14, "triangle", 0.14);
    }
  }
  return { play, ensure };
}

/* ── เพลงโรงงานสดใส (ชิปทูน ไม่ใช้ไฟล์) ── */

const BT_LEAD = [64, 0, 64, 67, 0, 71, 0, 0, 69, 0, 67, 64, 0, 62, 0, 0, 60, 0, 64, 0, 67, 71, 0, 74, 72, 0, 71, 67, 64, 0, 0, 0];
const BT_BASS = [40, 47, 40, 47, 45, 52, 45, 52, 43, 50, 43, 50, 36, 43, 43, 40];

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
      const m = BT_LEAD[s];
      if (m) note(m, 0.2, "triangle", 0.028);
      if (s % 2 === 0) {
        const b = BT_BASS[s / 2];
        if (b) note(b, 0.32, "sine", 0.05);
      }
    }, 200);
  }
  function stop() {
    if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
  }
  useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);
  return { start, stop };
}

/* ── ตัวละคร (คนงานโรงบรรจุน้ำ) ── */

type Person = { name: string; skin: string; body: string; dark: string; hair: string };
const WORKERS: Person[] = [
  { name: "น้องฟ้า", skin: "#ffd9c9", body: "#0ea5e9", dark: "#0369a1", hair: "#3b2412" },
  { name: "น้องเอิร์ธ", skin: "#f5cba3", body: "#14b8a6", dark: "#0f766e", hair: "#1c1c1c" },
  { name: "ป้าน้ำ", skin: "#f0c9a0", body: "#6366f1", dark: "#4338ca", hair: "#4a2e18" },
  { name: "ลุงชล", skin: "#e0b487", body: "#0891b2", dark: "#155e63", hair: "#2d2013" },
];

function PixelWorker({ p, mood, size = 84 }: { p: Person; mood: "normal" | "happy"; size?: number }) {
  return (
    <svg viewBox="0 0 40 56" width={size * 0.71} height={size} style={SS} role="img" aria-label={p.name}>
      <path d="M9,12 Q9,3 20,3 Q31,3 31,12 L31,9 Q26,6 20,6 Q14,6 9,9 Z" fill={p.hair} />
      <rect x={8} y={9} width={24} height={4} rx={2} fill="#0284c7" opacity={0.85} />
      <rect x={11} y={7} width={18} height={17} rx={5} fill={p.skin} stroke="#00000022" strokeWidth={1} />
      <rect x={15} y={14} width={3} height={4} rx={1} fill="#1e293b" />
      <rect x={22} y={14} width={3} height={4} rx={1} fill="#1e293b" />
      {mood === "happy"
        ? <path d="M16,19 Q20,22 24,19" stroke="#1e293b" strokeWidth={1.5} fill="none" strokeLinecap="round" />
        : <path d="M16,19.5 Q20,21 24,19.5" stroke="#1e293b" strokeWidth={1.4} fill="none" strokeLinecap="round" />}
      <circle cx={14} cy={19} r={1.6} fill="#fb7185" opacity={0.5} />
      <circle cx={26} cy={19} r={1.6} fill="#fb7185" opacity={0.5} />
      <rect x={11} y={24} width={18} height={18} rx={3} fill={p.body} stroke="#00000022" strokeWidth={1.2} />
      <rect x={15} y={26} width={10} height={14} rx={1.5} fill="#fff" opacity={0.5} />
      <rect x={6} y={25} width={5} height={13} rx={2.5} fill={p.body} stroke="#00000022" strokeWidth={1} />
      <circle cx={8.5} cy={38} r={2.5} fill={p.skin} />
      <rect x={29} y={25} width={5} height={13} rx={2.5} fill={p.body} stroke="#00000022" strokeWidth={1} />
      <circle cx={31.5} cy={38} r={2.5} fill={p.skin} />
      <rect x={14} y={42} width={5.5} height={13} rx={2} fill={p.dark} />
      <rect x={20.5} y={42} width={5.5} height={13} rx={2} fill={p.dark} />
      <rect x={13} y={54} width={7} height={3.5} rx={1.5} fill="#334155" />
      <rect x={20} y={54} width={7} height={3.5} rx={1.5} fill="#334155" />
    </svg>
  );
}

/* ── ฉากแท็งก์ + ขวด ── */

function TankScene({ N, c, d, bottles, filled, animating }: {
  N: number; c: number; d: number; bottles: number; filled: number; animating: boolean;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const tankX = 40, tankW = 78, tankTop = 34, tankBot = 226, TH = tankBot - tankTop;
  const perBottle = c / d;
  const remaining = N - filled * perBottle;
  const valToY = (v: number) => tankBot - clamp(v / N, 0, 1) * TH;
  const waterY = valToY(remaining);
  const tapX = tankX + tankW + 6, tapY = tankBot - 20;

  return (
    <svg viewBox="0 0 560 262" className="w-full" role="img" aria-label="โรงบรรจุน้ำ">
      <defs>
        <linearGradient id={`w${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7dd3fc" /><stop offset="1" stopColor="#0284c7" /></linearGradient>
      </defs>
      <style>{`
        @keyframes btPop { 0% { transform: translateY(-6px) scale(0.7); opacity:0; } 100% { transform: translateY(0) scale(1); opacity:1; } }
        .bt-pop { transform-box: fill-box; transform-origin: bottom center; animation: btPop 0.3s ease-out both; }
        @keyframes btFlow { 0%,100% { opacity:.5; } 50% { opacity:1; } }
        .bt-flow { animation: btFlow 0.4s linear infinite; }
      `}</style>

      {/* พื้น */}
      <rect x={0} y={tankBot + 6} width={560} height={16} fill="#cbd5e1" />

      {/* แท็งก์น้ำ N ลิตร */}
      <rect x={tankX - 4} y={tankTop - 4} width={tankW + 8} height={TH + 8} rx={8} fill="#e0f2fe" opacity={0.5} stroke="#7dd3fc" strokeWidth={2} />
      <clipPath id={`c${uid}`}><rect x={tankX - 2} y={tankTop - 2} width={tankW + 4} height={TH + 4} rx={5} /></clipPath>
      <g clipPath={`url(#c${uid})`}>
        <rect x={tankX - 4} y={waterY} width={tankW + 8} height={tankBot - waterY} fill={`url(#w${uid})`} opacity={0.9} style={{ transition: "y 0.35s ease, height 0.35s ease" }} />
        <ellipse cx={tankX + tankW / 2} cy={waterY} rx={tankW / 2} ry={4} fill="#bae6fd" opacity={0.9} style={{ transition: "cy 0.35s ease" }} />
      </g>
      {/* ขีดลิตร */}
      {Array.from({ length: N * d + 1 }, (_, k) => {
        const v = k / d;
        const y = valToY(v);
        const major = k % d === 0;
        return (
          <g key={k}>
            <line x1={tankX} y1={y} x2={tankX + (major ? 14 : 7)} y2={y} stroke="#0369a1" strokeWidth={major ? 1.8 : 1} opacity={0.7} />
            {major && <text x={tankX - 4} y={y + 4} fontSize={10} fontWeight={900} fill="#0369a1" textAnchor="end">{k / d}</text>}
          </g>
        );
      })}
      <rect x={tankX - 4} y={tankTop - 4} width={tankW + 8} height={TH + 8} rx={8} fill="none" stroke="#0284c7" strokeWidth={2.5} />
      <text x={tankX + tankW / 2} y={tankTop - 10} fontSize={11} fontWeight={900} fill="#0369a1" textAnchor="middle">แท็งก์ {N} ล.</text>

      {/* ก๊อก */}
      <rect x={tankX + tankW - 2} y={tapY} width={14} height={7} rx={2} fill="#64748b" />
      <rect x={tapX + 10} y={tapY - 3} width={5} height={14} rx={2} fill="#94a3b8" />
      {/* สายน้ำเวลากรอก */}
      {animating && filled < bottles && (
        <line className="bt-flow" x1={tapX + 12} y1={tapY + 11} x2={tapX + 12} y2={tapY + 40} stroke="#38bdf8" strokeWidth={4} strokeLinecap="round" />
      )}

      {/* ป้ายขนาดขวด */}
      <text x={210} y={26} fontSize={12} fontWeight={900} fill="#0369a1">ขวดละ {c}/{d} ลิตร →</text>

      {/* ขวดที่กรอกแล้ว */}
      <text x={366} y={26} fontSize={12} fontWeight={900} fill="#0f766e">🧴 ได้:</text>
      {Array.from({ length: filled }, (_, i) => {
        const perRow = 6;
        const row = Math.floor(i / perRow);
        const col = i % perRow;
        const bx = 200 + col * 34;
        const by = 44 + row * 62;
        return (
          <g key={i} className={i === filled - 1 && animating ? "bt-pop" : undefined} transform={`translate(${bx},${by})`}>
            <rect x={8} y={-4} width={12} height={5} rx={1.5} fill="#0ea5e9" />
            <path d="M9,1 L19,1 L19,4 Q19,6 17,7 L17,44 Q17,48 14,48 Q11,48 11,44 L11,7 Q9,6 9,4 Z" fill="#bae6fd" stroke="#0284c7" strokeWidth={1.4} opacity={0.6} />
            <path d="M11,10 L17,10 L17,44 Q17,47 14,47 Q11,47 11,44 Z" fill="#38bdf8" />
          </g>
        );
      })}
      {filled > 0 && (
        <g>
          <circle cx={528} cy={40} r={17} fill="#0891b2" />
          <text x={528} y={45} fontSize={16} fontWeight={900} fill="#fff" textAnchor="middle">{filled}</text>
        </g>
      )}
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

export function DivideBottleGame() {
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

  /* โจทย์: น้ำ N ลิตร กรอกใส่ขวดละ c/d ลิตร */
  const [den, setDen] = useState(3);   // d
  const [cnum, setCnum] = useState(2); // c (ขวดละ c/d, c<d)
  const [liters, setLiters] = useState(4); // N
  const [reveal, setReveal] = useState(false);

  /* ตัวละคร */
  const [workerIdx, setWorkerIdx] = useState(0);
  const [workerNames, setWorkerNames] = useState<string[]>(() => WORKERS.map((o) => o.name));
  const [showNames, setShowNames] = useState(false);

  /* สถานะ */
  const [filled, setFilled] = useState(0);
  const [animating, setAnimating] = useState(false);
  const timeoutsRef = useRef<number[]>([]);
  useEffect(() => () => timeoutsRef.current.forEach((t) => window.clearTimeout(t)), []);

  /* ภารกิจ */
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [guess, setGuess] = useState(0);
  const [firstTry, setFirstTry] = useState(true);
  const [checked, setChecked] = useState<null | boolean>(null);
  const [gameOver, setGameOver] = useState(false);

  const bottles = (liters * den) / cnum;        // N ÷ c/d = N*d/c
  const worker = { ...WORKERS[workerIdx], name: workerNames[workerIdx] };
  const done = filled === bottles && bottles > 0;
  const showAnswer = done || (mode === "lab" && reveal);

  /* ลิตรที่ใช้ได้ (ให้ได้จำนวนขวดเต็ม และไม่เกิน 12 ขวด) */
  const validLiters = (c: number, dd: number) => {
    const out: number[] = [];
    for (let n = 1; n <= 9; n++) { if ((n * dd) % c === 0 && (n * dd) / c <= 12) out.push(n); }
    return out;
  };
  const litersOptions = validLiters(cnum, den);

  function resetFill() { setFilled(0); setAnimating(false); setChecked(null); }
  function setupProblem(nd: number, nc: number, nN: number) {
    const opts = validLiters(nc, nd);
    const N = opts.includes(nN) ? nN : (opts[Math.min(opts.length - 1, 2)] ?? opts[0] ?? 1);
    setDen(nd); setCnum(nc); setLiters(N);
    resetFill(); setGuess(0); setFirstTry(true); setReveal(false);
  }

  function fillOne() {
    if (animating || filled >= bottles) return;
    ensure(); setAnimating(true);
    play("pour");
    timeoutsRef.current.push(window.setTimeout(() => { play("cap"); setFilled((f) => f + 1); setAnimating(false); }, 380));
  }
  function fillAll(evalGuess = false) {
    if (animating) return;
    ensure();
    const remain = bottles - filled;
    if (remain <= 0) { if (evalGuess) evaluate(); return; }
    setAnimating(true);
    for (let i = 0; i < remain; i++) {
      timeoutsRef.current.push(window.setTimeout(() => { play("pour"); setFilled((f) => f + 1); play("cap"); }, i * 340));
    }
    timeoutsRef.current.push(window.setTimeout(() => { setAnimating(false); if (evalGuess) evaluate(); }, remain * 340 + 240));
  }
  function evaluate() {
    const ok = guess === bottles;
    setChecked(ok);
    if (ok) { play("correct"); play("star"); setScore((s) => s + (firstTry ? 25 : 12)); }
    else play("wrong");
  }

  /* ภารกิจ flow */
  function randomProblem(): [number, number, number] {
    const nd = DEN_OPTIONS[randInt(0, DEN_OPTIONS.length - 1)];
    const nc = randInt(1, nd - 1);
    const opts = validLiters(nc, nd);
    const N = opts[randInt(0, opts.length - 1)] ?? 2;
    return [nd, nc, N];
  }
  function startMissions() {
    ensure(); play("start");
    setScore(0); setRound(1); setGameOver(false);
    setupProblem(3, 2, 4);
    setMode("mission");
  }
  function nextMission() {
    if (round >= MISSIONS_TOTAL) { setGameOver(true); play("star"); return; }
    setRound((r) => r + 1);
    const [nd, nc, nN] = randomProblem();
    setupProblem(nd, nc, nN);
    setWorkerIdx((prev) => shuffle(WORKERS.map((_, i) => i).filter((i) => i !== prev))[0] ?? prev);
  }

  const stars = score >= 170 ? 3 : score >= 100 ? 2 : 1;

  return (
    <div className="relative overflow-hidden rounded-2xl p-3 sm:p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-100 via-sky-50 to-blue-50" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden text-2xl" aria-hidden>
        <span className="absolute left-4 top-4 opacity-40">💧</span>
        <span className="absolute right-8 top-7 opacity-40">🧴</span>
        <span className="absolute bottom-8 right-6 opacity-30">🫧</span>
      </div>

      <div className="relative space-y-3">
        {/* โหมด + ปิดเสียง */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex rounded-xl border-2 border-slate-200 bg-white p-1">
            <button onClick={() => { setMode("lab"); resetFill(); }} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "lab" ? "bg-cyan-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <FlaskConical size={15} /> โหมดครู
            </button>
            <button onClick={startMissions} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "mission" ? "bg-sky-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <Target size={15} /> โหมดทายก่อนกรอก
            </button>
          </div>
          <button onClick={() => setMuted((m) => !m)} className="grid h-9 w-9 place-items-center rounded-xl border-2 border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50" title={muted ? "เปิดเสียง" : "ปิดเสียง"}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {mode === "mission" && gameOver ? (
          <div className="space-y-4 rounded-2xl border-2 border-sky-300 bg-white/90 p-6 text-center">
            <div className="text-5xl">🧴🏆</div>
            <h3 className="text-xl font-extrabold text-slate-800 sm:text-2xl">ปิดโรงบรรจุน้ำวันนี้!</h3>
            <p className="text-2xl">{"⭐".repeat(stars)}{"☆".repeat(3 - stars)}</p>
            <p className="text-base font-extrabold text-sky-700">🏅 คะแนนรวม {score}</p>
            <button onClick={startMissions} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
              <Play size={18} /> เปิดโรงงานใหม่
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* แถบตั้งค่า (ครู) / สถานะ (ภารกิจ) */}
            {mode === "lab" ? (
              <div className="space-y-2 rounded-2xl border-2 border-cyan-200 bg-white/90 px-3 py-2">
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
                  <span className="text-sm font-extrabold text-cyan-700">🧑‍🏫 ตั้งโจทย์:</span>
                  <span className="text-xs font-extrabold text-slate-500">น้ำ</span>
                  {litersOptions.map((n) => (
                    <button key={n} onClick={() => setupProblem(den, cnum, n)} className={cn("rounded-lg border-2 px-2 py-0.5 text-sm font-extrabold transition", liters === n ? "border-cyan-500 bg-cyan-100 text-cyan-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>{n} ล.</button>
                  ))}
                  <span className="text-lg font-black text-slate-400">÷</span>
                  <span className="text-xs font-extrabold text-slate-500">ขวดละ</span>
                  <NumPicker label="" value={cnum} min={1} max={den - 1} onChange={(v) => setupProblem(den, v, liters)} color="text-violet-600" />
                  <span className="text-xs font-extrabold text-slate-400">/ {den} ล.</span>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="text-xs font-extrabold text-slate-500">ส่วนขวด</span>
                  {DEN_OPTIONS.map((dd) => (
                    <button key={dd} onClick={() => setupProblem(dd, Math.min(cnum, dd - 1), liters)} className={cn("h-7 w-7 rounded-lg border-2 text-sm font-extrabold transition", den === dd ? "border-violet-500 bg-violet-100 text-violet-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>{dd}</button>
                  ))}
                  <span className="mx-1 text-slate-300">|</span>
                  <button onClick={() => setReveal((v) => !v)} className={cn("flex items-center gap-1 rounded-lg border-2 px-2 py-1 text-xs font-extrabold transition", reveal ? "border-violet-400 bg-violet-100 text-violet-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
                    {reveal ? <EyeOff size={13} /> : <Eye size={13} />} เฉลย
                  </button>
                  <button onClick={() => setShowNames((v) => !v)} className={cn("flex items-center gap-1 rounded-lg border-2 px-2 py-1 text-xs font-extrabold transition", showNames ? "border-sky-400 bg-sky-100 text-sky-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
                    <Pencil size={13} /> แก้ชื่อ
                  </button>
                  <span className="mx-1 text-slate-300">|</span>
                  <span className="text-xs font-extrabold text-slate-500">คนงาน:</span>
                  {WORKERS.map((o, i) => (
                    <button key={i} onClick={() => setWorkerIdx(i)} className={cn("rounded-lg border-2 p-0.5 transition", workerIdx === i ? "border-cyan-400 bg-cyan-50" : "border-slate-200 bg-white")}>
                      <PixelWorker p={o} mood="normal" size={26} />
                    </button>
                  ))}
                </div>
                {showNames && (
                  <div className="flex flex-wrap items-center justify-center gap-2 border-t border-slate-100 pt-1.5">
                    <span className="text-sm font-extrabold text-sky-700">✏️ ชื่อคนงาน:</span>
                    {WORKERS.map((_, i) => (
                      <input key={i} value={workerNames[i]} maxLength={12} onChange={(ev) => setWorkerNames((ns) => { const nn = [...ns]; nn[i] = ev.target.value; return nn; })} className="w-24 rounded-lg border-2 border-slate-200 bg-white px-2 py-1 text-sm font-extrabold text-slate-700 focus:border-sky-400 focus:outline-none" />
                    ))}
                    <button onClick={() => setWorkerNames(WORKERS.map((o) => o.name))} className="rounded-lg border-2 border-slate-200 bg-white px-2 py-1 text-sm font-extrabold text-slate-500 hover:bg-slate-50">คืนค่าเดิม</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 rounded-2xl bg-white/90 px-4 py-2 ring-1 ring-sky-200">
                <span className="text-base font-extrabold text-sky-700">🎯 ข้อ {round}/{MISSIONS_TOTAL}</span>
                <span className="text-base font-extrabold text-cyan-600">🏅 {score}</span>
                <span className="text-xs font-extrabold text-slate-500">ได้กี่ขวด?</span>
              </div>
            )}

            {/* การ์ดโจทย์ */}
            <div className="rounded-2xl border-2 border-cyan-200 bg-white/95 px-4 py-3 text-center shadow-sm">
              <p className="text-base font-extrabold leading-relaxed text-slate-700 sm:text-lg">
                <span className="text-cyan-600">{worker.name}</span> มีน้ำ <span className="text-sky-600">{liters} ลิตร</span>
                กรอกใส่ขวดละ{" "}
                <span className="inline-flex translate-y-1.5"><StackedFraction numerator={cnum} denominator={den} className="text-lg" toneClassName="text-violet-600" /></span> ลิตร
                <br className="sm:hidden" /> จะได้กี่ขวด?
              </p>
            </div>

            {/* สมการใหญ่ */}
            <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-cyan-200 bg-white/95 px-5 py-2.5 shadow-sm">
              <span className="text-3xl font-black text-sky-600 sm:text-4xl">{liters}</span>
              <span className="text-3xl font-black text-slate-400">÷</span>
              <StackedFraction numerator={cnum} denominator={den} className="text-3xl sm:text-4xl" toneClassName="text-violet-600" />
              <span className="text-3xl font-black text-slate-400">=</span>
              {showAnswer ? (
                <span className={cn("text-4xl font-black sm:text-5xl", done ? "text-cyan-600" : "text-violet-500")}>{bottles} <span className="text-2xl">ขวด</span></span>
              ) : (
                <span className="grid h-12 w-12 place-items-center rounded-xl border-[3px] border-dashed border-cyan-300 text-2xl font-black text-cyan-400">?</span>
              )}
            </div>

            {/* ฉาก */}
            <div className="rounded-2xl border-2 border-cyan-200 bg-gradient-to-b from-sky-100/50 to-cyan-50/50 p-2">
              <div className="flex items-end gap-1">
                <div className="flex shrink-0 flex-col items-center pb-2">
                  <PixelWorker p={worker} mood={done ? "happy" : "normal"} size={72} />
                  <span className="mt-0.5 rounded-full bg-cyan-600 px-2 py-0.5 text-[11px] font-extrabold text-white">{worker.name}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <TankScene N={liters} c={cnum} d={den} bottles={bottles} filled={filled} animating={animating} />
                </div>
              </div>
            </div>

            {/* คำอธิบายผล */}
            {done && (
              <p className="text-center text-sm font-extrabold text-slate-600">
                น้ำ <b className="text-sky-600">{liters} ล.</b> แบ่งใส่ขวดละ <b className="text-violet-600">{cnum}/{den} ล.</b> ได้ <b className="text-cyan-600">{bottles} ขวด</b> →
                หารคือ &ldquo;ได้กี่ขวด&rdquo; = <span className="text-emerald-600">กลับตัวหลังแล้วคูณ</span>: {liters} × {den}/{cnum} = {liters * den}/{cnum} = <b className="text-cyan-600">{bottles}</b>
              </p>
            )}

            {/* โหมดทายก่อนกรอก */}
            {mode === "mission" && filled === 0 && !animating && checked === null && (
              <div className="space-y-2 rounded-2xl border-2 border-sky-200 bg-white/90 p-3">
                <p className="text-center text-sm font-extrabold text-slate-600">🤔 ทายก่อน: กรอกได้กี่ขวด? (พิมพ์ได้)</p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button onClick={() => setGuess((g) => Math.max(0, g - 1))} className="h-10 w-10 rounded-lg border-2 border-slate-200 bg-white text-xl font-extrabold text-slate-600 active:scale-95">−</button>
                  <div className="flex items-center gap-1 rounded-xl border-2 border-sky-300 bg-white px-2 py-1">
                    <input type="text" inputMode="numeric" value={guess === 0 ? "" : String(guess)} placeholder="0" onChange={(ev) => { const v = parseInt(ev.target.value.replace(/\D/g, ""), 10); setGuess(Number.isNaN(v) ? 0 : Math.min(99, v)); }} onKeyDown={(ev) => { if (ev.key === "Enter") { setFirstTry(true); fillAll(true); } }} className="w-16 bg-transparent text-center text-3xl font-extrabold text-sky-600 outline-none" aria-label="พิมพ์คำตอบ" />
                    <span className="text-sm font-extrabold text-slate-400">ขวด</span>
                  </div>
                  <button onClick={() => setGuess((g) => Math.min(99, g + 1))} className="h-10 w-10 rounded-lg border-2 border-slate-200 bg-white text-xl font-extrabold text-slate-600 active:scale-95">+</button>
                  <button onClick={() => { setFirstTry(true); fillAll(true); }} className="ml-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 px-6 py-2.5 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                    💧 กรอกพิสูจน์!
                  </button>
                </div>
                <p className="text-center text-xs font-bold text-slate-400">💡 นับว่ามีขวดละ {cnum}/{den} ล. อยู่กี่ขวดใน {liters} ล.</p>
              </div>
            )}

            {/* ผลทาย */}
            {mode === "mission" && checked !== null && (
              <div className={cn("rounded-2xl border-2 p-3 text-center", checked ? "border-emerald-300 bg-emerald-50" : "border-rose-300 bg-rose-50")}>
                <p className={cn("text-base font-extrabold", checked ? "text-emerald-700" : "text-rose-600")}>
                  {checked
                    ? `🎉 เก่งมาก! ${liters} ÷ ${cnum}/${den} = ${liters} × ${den}/${cnum} = ${bottles} ขวด`
                    : `ทาย ${guess} — จริง ๆ ได้ ${bottles} ขวด · กลับตัวหลังแล้วคูณ: ${liters} × ${den}/${cnum} = ${bottles}`}
                </p>
                <button onClick={nextMission} className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 px-6 py-2 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                  {round >= MISSIONS_TOTAL ? "🏁 ดูสรุปผล" : <>ข้อต่อไป <ArrowRight size={16} /></>}
                </button>
              </div>
            )}

            {/* ปุ่มควบคุม (โหมดครู) */}
            {mode === "lab" && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                {filled < bottles ? (
                  <>
                    <button onClick={fillOne} disabled={animating} className="inline-flex items-center gap-2 rounded-xl border-b-4 border-cyan-700 bg-gradient-to-b from-sky-500 to-cyan-600 px-5 py-2.5 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.97] active:border-b-2 disabled:opacity-50">
                      🧴 กรอก 1 ขวด
                    </button>
                    <button onClick={() => fillAll()} disabled={animating} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 px-5 py-2.5 text-base font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98] disabled:opacity-50">
                      💧 กรอกจนหมดแท็งก์
                    </button>
                    {filled > 0 && (
                      <button onClick={resetFill} disabled={animating} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-3 py-1.5 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50 disabled:opacity-50">
                        <RotateCcw size={14} /> เทคืน
                      </button>
                    )}
                  </>
                ) : (
                  <button onClick={resetFill} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-5 py-2 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50">
                    <RotateCcw size={15} /> เติมแท็งก์ใหม่
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
