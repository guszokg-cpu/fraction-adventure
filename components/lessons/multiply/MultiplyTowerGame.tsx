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

type CtxKey = "height" | "volume";
const CONTEXTS: Record<CtxKey, { unit: string; item: string; verb: string }> = {
  height: { unit: "เมตร", item: "กล่อง", verb: "ซ้อน" },
  volume: { unit: "ลิตร", item: "ขวด", verb: "เท" },
};

/* ── เสียง ── */

type SoundKind = "place" | "tick" | "correct" | "wrong" | "start" | "star" | "pour";

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
      case "place": return tones([180, 130], 0.05, 0.13, "square", 0.09);
      case "pour": return sweep(500, 260, 0.5, "sawtooth", 0.05);
      case "tick": return tones([1400], 0.03, 0.04, "square", 0.05);
      case "correct": return tones([660, 990, 1319], 0.06, 0.1, "triangle", 0.14);
      case "wrong": return tones([220, 165], 0.11, 0.18, "sawtooth", 0.09);
      case "start": return tones([523, 659, 784], 0.07, 0.12, "triangle", 0.14);
      case "star": return tones([1047, 1319, 1568, 2093], 0.07, 0.14, "triangle", 0.14);
    }
  }
  return { play, ensure };
}

/* ── เพลงลานก่อสร้างสนุก ๆ (ชิปทูน ไม่ใช้ไฟล์) ── */

const TW_LEAD = [60, 0, 64, 67, 0, 64, 60, 0, 62, 0, 65, 69, 0, 65, 62, 0, 67, 0, 72, 0, 71, 69, 67, 0, 64, 67, 60, 0, 0, 0, 0, 0];
const TW_BASS = [36, 43, 36, 43, 38, 45, 38, 45, 41, 48, 41, 48, 36, 43, 43, 36];

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
      const m = TW_LEAD[s];
      if (m) note(m, 0.2, "square", 0.024);
      if (s % 2 === 0) {
        const b = TW_BASS[s / 2];
        if (b) note(b, 0.32, "triangle", 0.055);
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
      {w > 0 && n === 0 && null}
    </span>
  );
}

/* ── ตัวละครพิกเซล (ช่างก่อสร้าง) ── */

type Person = { name: string; skin: string; body: string; dark: string; hat: string };
const WORKERS: Person[] = [
  { name: "น้องช่างต้น", skin: "#f5cba3", body: "#f97316", dark: "#c2410c", hat: "#facc15" },
  { name: "น้องมิว", skin: "#ffd9c9", body: "#0ea5e9", dark: "#0369a1", hat: "#f472b6" },
  { name: "ลุงสมพงษ์", skin: "#e0b487", body: "#16a34a", dark: "#166534", hat: "#fb923c" },
  { name: "ป้านิด", skin: "#f0c9a0", body: "#8b5cf6", dark: "#6d28d9", hat: "#fde047" },
];

function PixelWorker({ p, mood, size = 84 }: { p: Person; mood: "normal" | "happy"; size?: number }) {
  return (
    <svg viewBox="0 0 40 58" width={size * 0.69} height={size} style={SS} role="img" aria-label={p.name}>
      {/* หมวกนิรภัย */}
      <path d="M8,14 Q8,6 20,6 Q32,6 32,14 Z" fill={p.hat} stroke="#00000022" strokeWidth={1} />
      <rect x={6} y={13} width={28} height={3} rx={1.5} fill={p.hat} stroke="#00000022" strokeWidth={0.8} />
      <rect x={18.5} y={6} width={3} height={8} fill="#00000018" />
      {/* หน้า */}
      <rect x={11} y={15} width={18} height={16} rx={5} fill={p.skin} stroke="#00000022" strokeWidth={1} />
      <rect x={15} y={21} width={3} height={4} rx={1} fill="#1e293b" />
      <rect x={22} y={21} width={3} height={4} rx={1} fill="#1e293b" />
      {mood === "happy"
        ? <path d="M16,26 Q20,29 24,26" stroke="#1e293b" strokeWidth={1.5} fill="none" strokeLinecap="round" />
        : <path d="M16,26.5 Q20,28 24,26.5" stroke="#1e293b" strokeWidth={1.4} fill="none" strokeLinecap="round" />}
      <circle cx={14} cy={26} r={1.6} fill="#fb7185" opacity={0.5} />
      <circle cx={26} cy={26} r={1.6} fill="#fb7185" opacity={0.5} />
      {/* ตัว (เสื้อกั๊กสะท้อนแสง) */}
      <rect x={11} y={31} width={18} height={17} rx={3} fill={p.body} stroke="#00000022" strokeWidth={1.2} />
      <rect x={13} y={33} width={4} height={14} fill="#fde047" opacity={0.85} />
      <rect x={23} y={33} width={4} height={14} fill="#fde047" opacity={0.85} />
      <rect x={6} y={32} width={5} height={12} rx={2.5} fill={p.body} stroke="#00000022" strokeWidth={1} />
      <circle cx={8.5} cy={44} r={2.5} fill={p.skin} />
      <rect x={29} y={32} width={5} height={12} rx={2.5} fill={p.body} stroke="#00000022" strokeWidth={1} />
      <circle cx={31.5} cy={44} r={2.5} fill={p.skin} />
      <rect x={14} y={48} width={5.5} height={10} rx={2} fill={p.dark} />
      <rect x={20.5} y={48} width={5.5} height={10} rx={2} fill={p.dark} />
      <rect x={13} y={56} width={7} height={3} rx={1.5} fill="#3f3f46" />
      <rect x={20} y={56} width={7} height={3} rx={1.5} fill="#3f3f46" />
    </svg>
  );
}

/* ── ฉากหอคอย + ไม้บรรทัด / แท็งก์น้ำ ── */

function TowerScene({ ctx, whole, fracNum, fracDen, count, placed, maxScale, animating }: {
  ctx: CtxKey; whole: number; fracNum: number; fracDen: number; count: number; placed: number; maxScale: number; animating: boolean;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const baseY = 288, top = 40, MH = baseY - top;
  const perBox = whole + fracNum / fracDen;
  const cur = placed * perBox;
  const valToY = (v: number) => baseY - clamp(v / maxScale, 0, 1) * MH;

  const TW = 78, TX = ctx === "height" ? 42 : 40;   // ตำแหน่ง/กว้างของหอคอย/แท็งก์
  const DX = 15, DY = 9;
  const rulerX = 214;

  return (
    <svg viewBox="0 0 320 312" className="w-full" role="img" aria-label={ctx === "height" ? "หอคอยกล่อง" : "แท็งก์น้ำ"}>
      <defs>
        <linearGradient id={`sky${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e0f2fe" /><stop offset="1" stopColor="#f0f9ff" /></linearGradient>
        <linearGradient id={`water${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7dd3fc" /><stop offset="1" stopColor="#0284c7" /></linearGradient>
      </defs>
      <style>{`
        @keyframes twDrop { 0% { transform: translateY(-40px); opacity: 0; } 70% { transform: translateY(3px); } 100% { transform: translateY(0); opacity: 1; } }
        .tw-drop { animation: twDrop 0.4s cubic-bezier(.5,1.3,.6,1) both; }
      `}</style>

      <rect x={0} y={0} width={320} height={312} fill={`url(#sky${uid})`} />
      {/* พื้น */}
      <rect x={0} y={baseY} width={320} height={24} fill="#cbb28a" />
      <rect x={0} y={baseY} width={320} height={4} fill="#a8916c" />

      {/* ── ไม้บรรทัดยักษ์ (วัดเป็นหน่วย) ── */}
      <rect x={rulerX} y={top} width={30} height={MH} rx={3} fill="#fde68a" stroke="#ca8a04" strokeWidth={2} />
      {Array.from({ length: maxScale * fracDen + 1 }, (_, k) => {
        const v = k / fracDen;
        const y = valToY(v);
        const major = k % fracDen === 0;
        return (
          <g key={k}>
            <line x1={rulerX} y1={y} x2={rulerX + (major ? 16 : 8)} y2={y} stroke="#a16207" strokeWidth={major ? 2 : 1} />
            {major && <text x={rulerX + 34} y={y + 4} fontSize={11} fontWeight={900} fill="#a16207">{k / fracDen}</text>}
          </g>
        );
      })}
      <text x={rulerX + 15} y={top - 6} fontSize={10} fontWeight={800} fill="#a16207" textAnchor="middle">{ctx === "height" ? "เมตร" : "ลิตร"}</text>

      {ctx === "height" ? (
        /* ── หอคอยกล่อง ── */
        <>
          {Array.from({ length: placed }, (_, i) => {
            const y1 = valToY((i + 1) * perBox);   // ยอดกล่อง
            const y0 = valToY(i * perBox);          // ฐานกล่อง
            const h = y0 - y1;
            const shade = i % 2 === 0 ? { f: "#d9a066", t: "#ecc79a", s: "#b07d43" } : { f: "#cf9457", t: "#e3ba8a", s: "#a86f38" };
            return (
              <g key={i} className={i === placed - 1 && animating ? "tw-drop" : undefined}>
                <polygon points={`${TX},${y1} ${TX + DX},${y1 - DY} ${TX + TW + DX},${y1 - DY} ${TX + TW},${y1}`} fill={shade.t} stroke="#7c5a30" strokeWidth={1.2} />
                <polygon points={`${TX + TW},${y1} ${TX + TW + DX},${y1 - DY} ${TX + TW + DX},${y1 - DY + h} ${TX + TW},${y1 + h}`} fill={shade.s} stroke="#7c5a30" strokeWidth={1.2} />
                <rect x={TX} y={y1} width={TW} height={h} fill={shade.f} stroke="#7c5a30" strokeWidth={1.2} />
                {/* เทปกาว */}
                <rect x={TX + TW / 2 - 5} y={y1} width={10} height={h} fill="#e8c98f" opacity={0.6} />
                <line x1={TX} y1={y1 + h / 2} x2={TX + TW} y2={y1 + h / 2} stroke="#b07d43" strokeWidth={1} opacity={0.5} />
              </g>
            );
          })}
          {/* ป้ายกล่องแรก */}
          {placed > 0 && (
            <text x={TX + TW / 2} y={valToY(perBox / 2) + 3} fontSize={9} fontWeight={900} fill="#5b3a1e" textAnchor="middle" opacity={0.8}>1 ใบ</text>
          )}
        </>
      ) : (
        /* ── แท็งก์น้ำ ── */
        <>
          <rect x={TX - 4} y={top} width={TW + DX + 8} height={MH} rx={6} fill="#e0f2fe" opacity={0.4} stroke="#7dd3fc" strokeWidth={2} />
          <clipPath id={`tank${uid}`}><rect x={TX - 2} y={top + 2} width={TW + DX + 4} height={MH - 4} rx={4} /></clipPath>
          <g clipPath={`url(#tank${uid})`}>
            <rect x={TX - 4} y={valToY(cur)} width={TW + DX + 8} height={baseY - valToY(cur)} fill={`url(#water${uid})`} opacity={0.9} style={{ transition: "y 0.4s ease, height 0.4s ease" }} />
            <ellipse cx={TX + (TW + DX) / 2} cy={valToY(cur)} rx={(TW + DX) / 2} ry={4} fill="#bae6fd" opacity={0.9} style={{ transition: "cy 0.4s ease" }} />
          </g>
          <rect x={TX - 4} y={top} width={TW + DX + 8} height={MH} rx={6} fill="none" stroke="#0284c7" strokeWidth={2.5} />
        </>
      )}

      {/* เส้นชี้ระดับปัจจุบัน */}
      {placed > 0 && (
        <g style={{ transition: "all 0.4s ease" }}>
          <line x1={TX - 6} y1={valToY(cur)} x2={rulerX} y2={valToY(cur)} stroke="#dc2626" strokeWidth={2} strokeDasharray="5 3" />
          <polygon points={`${rulerX - 2},${valToY(cur)} ${rulerX - 9},${valToY(cur) - 4} ${rulerX - 9},${valToY(cur) + 4}`} fill="#dc2626" />
        </g>
      )}
    </svg>
  );
}

/* ── ตัวเลือกจำนวนคละ ── */

function MixedPicker({ whole, num, den, setWhole, setNum, setDen }: { whole: number; num: number; den: number; setWhole: (v: number) => void; setNum: (v: number) => void; setDen: (v: number) => void; }) {
  const btn = "h-7 w-7 rounded-lg border-2 border-slate-200 bg-white text-base font-extrabold text-slate-600 hover:bg-slate-50 active:scale-95 disabled:opacity-40";
  return (
    <div className="flex items-center gap-1.5 rounded-xl border-2 border-orange-200 bg-white px-2 py-1">
      <div className="flex items-center gap-1">
        <button onClick={() => setWhole(Math.max(0, whole - 1))} disabled={whole <= 0} className={btn}>−</button>
        <span className="w-5 text-center text-2xl font-extrabold text-orange-600">{whole}</span>
        <button onClick={() => setWhole(Math.min(3, whole + 1))} disabled={whole >= 3} className={btn}>+</button>
      </div>
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-1">
          <button onClick={() => setNum(Math.max(1, num - 1))} disabled={num <= 1} className={btn}>−</button>
          <span className="w-5 text-center text-lg font-extrabold text-emerald-600">{num}</span>
          <button onClick={() => setNum(Math.min(den - 1, num + 1))} disabled={num >= den - 1} className={btn}>+</button>
        </div>
        <span className="my-0.5 h-[2px] w-full rounded bg-slate-400" />
        <div className="flex items-center gap-1">
          {DEN_OPTIONS.map((d) => (
            <button key={d} onClick={() => setDen(d)} className={cn("h-6 w-6 rounded-md border text-sm font-extrabold transition", den === d ? "border-violet-500 bg-violet-100 text-violet-700" : "border-slate-200 bg-white text-slate-500")}>{d}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

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

export function MultiplyTowerGame() {
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

  /* โจทย์: กล่องละ whole num/den × count ใบ */
  const [context, setContext] = useState<CtxKey>("height");
  const [whole, setWhole] = useState(1);
  const [fnum, setFnum] = useState(1);
  const [fden, setFden] = useState(4);
  const [count, setCount] = useState(3);
  const [reveal, setReveal] = useState(false);

  /* ตัวละคร */
  const [workerIdx, setWorkerIdx] = useState(0);
  const [workerNames, setWorkerNames] = useState<string[]>(() => WORKERS.map((w) => w.name));
  const [showNames, setShowNames] = useState(false);

  /* สถานะ */
  const [placed, setPlaced] = useState(0);
  const [animating, setAnimating] = useState(false);
  const timeoutsRef = useRef<number[]>([]);
  useEffect(() => () => timeoutsRef.current.forEach((t) => window.clearTimeout(t)), []);

  /* ภารกิจ */
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [gWhole, setGWhole] = useState(0);
  const [gNum, setGNum] = useState(0);
  const [firstTry, setFirstTry] = useState(true);
  const [checked, setChecked] = useState<null | boolean>(null);
  const [gameOver, setGameOver] = useState(false);

  const cfg = CONTEXTS[context];
  const perImp = whole * fden + fnum;              // เศษเกินต่อใบ
  const totalImp = count * perImp;
  const totalWhole = Math.floor(totalImp / fden);
  const totalNum = totalImp % fden;
  const wholeProduct = whole * count;              // ส่วนเต็ม × จำนวน
  const fracImp = count * fnum;                    // เศษ × จำนวน (ยังไม่ทด)
  const perBoxVal = whole + fnum / fden;
  const maxScale = Math.max(1, Math.ceil(count * perBoxVal));
  const worker = { ...WORKERS[workerIdx], name: workerNames[workerIdx] };
  const done = placed === count && count > 0;
  const showAnswer = done || (mode === "lab" && reveal);

  function resetStack() { setPlaced(0); setAnimating(false); setChecked(null); }
  function setupProblem(c: CtxKey, w: number, fn: number, fd: number, n: number) {
    setContext(c); setWhole(w); setFnum(fn); setFden(fd); setCount(n);
    resetStack(); setGWhole(0); setGNum(0); setFirstTry(true); setReveal(false);
  }
  function setDenSafe(d: number) { setupProblem(context, whole, fnum > d - 1 ? d - 1 : fnum, d, count); }

  function placeOne() {
    if (animating || placed >= count) return;
    ensure(); setAnimating(true);
    play(context === "height" ? "place" : "pour");
    setPlaced((p) => p + 1);
    timeoutsRef.current.push(window.setTimeout(() => { play("tick"); setAnimating(false); }, 430));
  }
  function placeAll(evalGuess = false) {
    if (animating) return;
    ensure();
    const remain = count - placed;
    if (remain <= 0) { if (evalGuess) evaluate(); return; }
    setAnimating(true);
    for (let i = 0; i < remain; i++) {
      timeoutsRef.current.push(window.setTimeout(() => {
        play(context === "height" ? "place" : "pour");
        setPlaced((p) => p + 1);
        play("tick");
      }, i * 400));
    }
    timeoutsRef.current.push(window.setTimeout(() => { setAnimating(false); if (evalGuess) evaluate(); }, remain * 400 + 260));
  }
  function evaluate() {
    const ok = gWhole === totalWhole && gNum === totalNum;
    setChecked(ok);
    if (ok) { play("correct"); play("star"); setScore((s) => s + (firstTry ? 25 : 12)); }
    else play("wrong");
  }

  /* ภารกิจ flow */
  function randomProblem(): [CtxKey, number, number, number, number] {
    const c: CtxKey = Math.random() < 0.5 ? "height" : "volume";
    const fd = DEN_OPTIONS[randInt(0, DEN_OPTIONS.length - 1)];
    return [c, randInt(1, 2), randInt(1, fd - 1), fd, randInt(2, 5)];
  }
  function startMissions() {
    ensure(); play("start");
    setScore(0); setRound(1); setGameOver(false);
    setupProblem("height", 1, 1, 4, 3);
    setMode("mission");
  }
  function nextMission() {
    if (round >= MISSIONS_TOTAL) { setGameOver(true); play("star"); return; }
    setRound((r) => r + 1);
    const [c, w, fn, fd, n] = randomProblem();
    setupProblem(c, w, fn, fd, n);
    setWorkerIdx((prev) => shuffle(WORKERS.map((_, i) => i).filter((i) => i !== prev))[0] ?? prev);
  }

  const stars = score >= 170 ? 3 : score >= 100 ? 2 : 1;
  const curWhole = Math.floor((placed * perImp) / fden);
  const curNum = (placed * perImp) % fden;

  return (
    <div className="relative overflow-hidden rounded-2xl p-3 sm:p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-orange-100 via-amber-50 to-yellow-50" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden text-2xl" aria-hidden>
        <span className="absolute left-4 top-4 opacity-40">🏗️</span>
        <span className="absolute right-8 top-7 opacity-40">📦</span>
        <span className="absolute bottom-8 right-6 opacity-30">🔧</span>
      </div>

      <div className="relative space-y-3">
        {/* โหมด + ปิดเสียง */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex rounded-xl border-2 border-slate-200 bg-white p-1">
            <button onClick={() => { setMode("lab"); resetStack(); }} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "lab" ? "bg-orange-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <FlaskConical size={15} /> โหมดครู
            </button>
            <button onClick={startMissions} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "mission" ? "bg-amber-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <Target size={15} /> โหมดทายก่อน{context === "height" ? "ซ้อน" : "เท"}
            </button>
          </div>
          <button onClick={() => setMuted((m) => !m)} className="grid h-9 w-9 place-items-center rounded-xl border-2 border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50" title={muted ? "เปิดเสียง" : "ปิดเสียง"}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {mode === "mission" && gameOver ? (
          <div className="space-y-4 rounded-2xl border-2 border-amber-300 bg-white/90 p-6 text-center">
            <div className="text-5xl">📦🏆</div>
            <h3 className="text-xl font-extrabold text-slate-800 sm:text-2xl">สร้างหอคอยครบทุกหลัง!</h3>
            <p className="text-2xl">{"⭐".repeat(stars)}{"☆".repeat(3 - stars)}</p>
            <p className="text-base font-extrabold text-amber-700">🏅 คะแนนรวม {score}</p>
            <button onClick={startMissions} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
              <Play size={18} /> เล่นอีกครั้ง
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* แถบตั้งค่า (ครู) / สถานะ (ภารกิจ) */}
            {mode === "lab" ? (
              <div className="space-y-2 rounded-2xl border-2 border-orange-200 bg-white/90 px-3 py-2">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="text-sm font-extrabold text-orange-700">🧑‍🏫 บริบท:</span>
                  <button onClick={() => setupProblem("height", whole, fnum, fden, count)} className={cn("rounded-lg border-2 px-3 py-1 text-sm font-extrabold transition", context === "height" ? "border-orange-500 bg-orange-100 text-orange-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>📦 กล่องสูง (เมตร)</button>
                  <button onClick={() => setupProblem("volume", whole, fnum, fden, count)} className={cn("rounded-lg border-2 px-3 py-1 text-sm font-extrabold transition", context === "volume" ? "border-sky-500 bg-sky-100 text-sky-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>🧴 ขวดน้ำ (ลิตร)</button>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
                  <span className="text-sm font-extrabold text-slate-500">{context === "height" ? "กล่องละ" : "ขวดละ"}:</span>
                  <MixedPicker whole={whole} num={fnum} den={fden} setWhole={(v) => setupProblem(context, v, fnum, fden, count)} setNum={(v) => setupProblem(context, whole, v, fden, count)} setDen={setDenSafe} />
                  <span className="text-lg font-black text-slate-400">×</span>
                  <NumPicker label="จำนวน" value={count} min={2} max={6} onChange={(v) => setupProblem(context, whole, fnum, fden, v)} color="text-amber-600" />
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button onClick={() => setReveal((v) => !v)} className={cn("flex items-center gap-1 rounded-lg border-2 px-2 py-1 text-xs font-extrabold transition", reveal ? "border-violet-400 bg-violet-100 text-violet-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
                    {reveal ? <EyeOff size={13} /> : <Eye size={13} />} เฉลย
                  </button>
                  <button onClick={() => setShowNames((v) => !v)} className={cn("flex items-center gap-1 rounded-lg border-2 px-2 py-1 text-xs font-extrabold transition", showNames ? "border-sky-400 bg-sky-100 text-sky-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
                    <Pencil size={13} /> แก้ชื่อ
                  </button>
                  <span className="mx-1 text-slate-300">|</span>
                  <span className="text-xs font-extrabold text-slate-500">ช่าง:</span>
                  {WORKERS.map((w, i) => (
                    <button key={i} onClick={() => setWorkerIdx(i)} className={cn("rounded-lg border-2 p-0.5 transition", workerIdx === i ? "border-orange-400 bg-orange-50" : "border-slate-200 bg-white")}>
                      <PixelWorker p={w} mood="normal" size={28} />
                    </button>
                  ))}
                </div>
                {showNames && (
                  <div className="flex flex-wrap items-center justify-center gap-2 border-t border-slate-100 pt-1.5">
                    <span className="text-sm font-extrabold text-sky-700">✏️ ชื่อช่าง:</span>
                    {WORKERS.map((_, i) => (
                      <input key={i} value={workerNames[i]} maxLength={12} onChange={(e) => setWorkerNames((ns) => { const nn = [...ns]; nn[i] = e.target.value; return nn; })} className="w-28 rounded-lg border-2 border-slate-200 bg-white px-2 py-1 text-sm font-extrabold text-slate-700 focus:border-sky-400 focus:outline-none" />
                    ))}
                    <button onClick={() => setWorkerNames(WORKERS.map((w) => w.name))} className="rounded-lg border-2 border-slate-200 bg-white px-2 py-1 text-sm font-extrabold text-slate-500 hover:bg-slate-50">คืนค่าเดิม</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 rounded-2xl bg-white/90 px-4 py-2 ring-1 ring-amber-200">
                <span className="text-base font-extrabold text-amber-700">🎯 ข้อ {round}/{MISSIONS_TOTAL}</span>
                <span className="text-base font-extrabold text-orange-600">🏅 {score}</span>
                <span className="text-xs font-extrabold text-slate-500">ทายความสูงรวมก่อน!</span>
              </div>
            )}

            {/* การ์ดโจทย์ */}
            <div className="rounded-2xl border-2 border-orange-200 bg-white/95 px-4 py-3 text-center shadow-sm">
              <p className="text-base font-extrabold leading-relaxed text-slate-700 sm:text-lg">
                <span className="text-orange-600">{worker.name}</span> {context === "height" ? "มีกล่องสูง" : "มีขวดน้ำจุ"}{" "}
                <span className="inline-flex translate-y-1.5"><MixedNum w={whole} n={fnum} den={fden} size="sm" tone="text-orange-600" /></span> {cfg.unit}{" "}
                {cfg.verb} {count} {cfg.item} <br className="sm:hidden" />
                {context === "height" ? "หอคอยสูงรวมกี่เมตร?" : "ได้น้ำทั้งหมดกี่ลิตร?"}
              </p>
            </div>

            {/* สมการใหญ่ */}
            <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-orange-200 bg-white/95 px-5 py-2.5 shadow-sm">
              <MixedNum w={whole} n={fnum} den={fden} size="md" tone="text-orange-600" />
              <span className="text-3xl font-black text-slate-400">×</span>
              <span className="text-3xl font-black text-amber-600 sm:text-4xl">{count}</span>
              <span className="text-3xl font-black text-slate-400">=</span>
              {showAnswer ? (
                <MixedNum w={totalWhole} n={totalNum} den={fden} size="lg" tone={done ? "text-orange-600" : "text-violet-500"} />
              ) : (
                <span className="grid h-12 w-12 place-items-center rounded-xl border-[3px] border-dashed border-orange-300 text-2xl font-black text-orange-400">?</span>
              )}
            </div>

            {/* ฉาก: ช่าง + หอคอย/แท็งก์ */}
            <div className="rounded-2xl border-2 border-orange-200 bg-gradient-to-b from-amber-100/50 to-orange-50/50 p-2">
              <div className="flex items-end gap-1">
                <div className="flex shrink-0 flex-col items-center pb-2">
                  <PixelWorker p={worker} mood={done ? "happy" : "normal"} size={76} />
                  <span className="mt-0.5 rounded-full bg-orange-600 px-2 py-0.5 text-[11px] font-extrabold text-white">{worker.name}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <TowerScene ctx={context} whole={whole} fracNum={fnum} fracDen={fden} count={count} placed={placed} maxScale={maxScale} animating={animating} />
                  <div className="-mt-1 text-center">
                    <span className="rounded-full bg-white px-3 py-0.5 text-sm font-extrabold text-slate-600 shadow-sm ring-1 ring-orange-200">
                      {cfg.verb}แล้ว {placed}/{count} {cfg.item} · ระดับ <span className="inline-flex translate-y-1"><MixedNum w={curWhole} n={curNum} den={fden} size="sm" tone="text-orange-600" /></span> {cfg.unit}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* คำอธิบายผล */}
            {done && (
              <p className="text-center text-sm font-extrabold text-slate-600">
                {count} {cfg.item} ใบละ <b className="text-orange-600">{whole} {fnum}/{fden}</b> {cfg.unit} →
                ส่วนเต็ม <b>{whole}×{count} = {wholeProduct}</b>, ส่วนเศษ <b className="text-emerald-600">{fnum}×{count} = {fracImp}/{fden}</b>
                {fracImp >= fden && <> = <b>{Math.floor(fracImp / fden)} {fracImp % fden > 0 ? `${fracImp % fden}/${fden}` : ""}</b></>} →
                รวม <b className="text-orange-600">{totalWhole}{totalNum > 0 ? ` ${totalNum}/${fden}` : ""}</b> {cfg.unit}
                {" "}<span className="text-rose-500">— อย่าลืมคูณเศษของทุก{cfg.item}!</span>
              </p>
            )}

            {/* โหมดทายก่อน */}
            {mode === "mission" && placed === 0 && !animating && checked === null && (
              <div className="space-y-2 rounded-2xl border-2 border-amber-200 bg-white/90 p-3">
                <p className="text-center text-sm font-extrabold text-slate-600">🤔 ทายก่อน: {context === "height" ? "หอคอยสูงรวมกี่เมตร?" : "ได้น้ำกี่ลิตร?"} (พิมพ์ได้)</p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <div className="flex items-center gap-2 rounded-xl border-2 border-orange-200 bg-orange-50 px-3 py-1.5">
                    <span className="text-xs font-extrabold text-slate-500">จำนวนเต็ม</span>
                    <input type="text" inputMode="numeric" value={gWhole === 0 ? "" : String(gWhole)} placeholder="0" onChange={(e) => { const v = parseInt(e.target.value.replace(/\D/g, ""), 10); setGWhole(Number.isNaN(v) ? 0 : Math.min(99, v)); }} className="w-12 bg-transparent text-center text-2xl font-extrabold text-orange-600 outline-none" aria-label="จำนวนเต็มคำตอบ" />
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border-2 border-emerald-200 bg-emerald-50 px-3 py-1.5">
                    <span className="text-xs font-extrabold text-slate-500">เศษ</span>
                    <span className="inline-flex flex-col items-center">
                      <input type="text" inputMode="numeric" value={gNum === 0 ? "" : String(gNum)} placeholder="?" onChange={(e) => { const v = parseInt(e.target.value.replace(/\D/g, ""), 10); setGNum(Number.isNaN(v) ? 0 : Math.min(fden - 1, v)); }} onKeyDown={(e) => { if (e.key === "Enter") { setFirstTry(true); placeAll(true); } }} className="w-10 bg-transparent text-center text-xl font-extrabold text-emerald-600 outline-none" aria-label="เศษคำตอบ" />
                      <span className="h-[3px] w-6 rounded bg-emerald-600" />
                      <span className="text-xl font-extrabold text-slate-400">{fden}</span>
                    </span>
                  </div>
                  <button onClick={() => { setFirstTry(true); placeAll(true); }} className="ml-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 px-6 py-2.5 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                    📦 {cfg.verb}พิสูจน์!
                  </button>
                </div>
              </div>
            )}

            {/* ผลทาย */}
            {mode === "mission" && checked !== null && (
              <div className={cn("rounded-2xl border-2 p-3 text-center", checked ? "border-emerald-300 bg-emerald-50" : "border-rose-300 bg-rose-50")}>
                <p className={cn("text-base font-extrabold", checked ? "text-emerald-700" : "text-rose-600")}>
                  {checked
                    ? `🎉 เก่งมาก! ${whole} ${fnum}/${fden} × ${count} = ${totalWhole}${totalNum > 0 ? ` ${totalNum}/${fden}` : ""} ${cfg.unit}`
                    : `ทาย ${gWhole}${gNum > 0 ? ` ${gNum}/${fden}` : ""} — จริง ๆ คือ ${totalWhole}${totalNum > 0 ? ` ${totalNum}/${fden}` : ""} ${cfg.unit} · ${gWhole === wholeProduct && gNum === 0 ? "ลืมคูณเศษของทุกใบ!" : `ส่วนเต็ม ${whole}×${count}, เศษ ${fnum}×${count}=${fracImp}/${fden}`}`}
                </p>
                <button onClick={nextMission} className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 px-6 py-2 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                  {round >= MISSIONS_TOTAL ? "🏁 ดูสรุปผล" : <>ข้อต่อไป <ArrowRight size={16} /></>}
                </button>
              </div>
            )}

            {/* ปุ่มควบคุม (โหมดครู) */}
            {mode === "lab" && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                {placed < count ? (
                  <>
                    <button onClick={placeOne} disabled={animating} className="inline-flex items-center gap-2 rounded-xl border-b-4 border-orange-700 bg-gradient-to-b from-amber-500 to-orange-600 px-5 py-2.5 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.97] active:border-b-2 disabled:opacity-50">
                      {context === "height" ? "📦 วางกล่อง 1 ใบ" : "🧴 เทน้ำ 1 ขวด"}
                    </button>
                    <button onClick={() => placeAll()} disabled={animating} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-5 py-2.5 text-base font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98] disabled:opacity-50">
                      {context === "height" ? "🏗️ วางครบทุกใบ" : "💧 เทครบทุกขวด"}
                    </button>
                    {placed > 0 && (
                      <button onClick={resetStack} disabled={animating} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-3 py-1.5 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50 disabled:opacity-50">
                        <RotateCcw size={14} /> รื้อใหม่
                      </button>
                    )}
                  </>
                ) : (
                  <button onClick={resetStack} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-5 py-2 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50">
                    <RotateCcw size={15} /> เริ่มใหม่อีกครั้ง
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
