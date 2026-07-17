"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Volume2, VolumeX, FlaskConical, Target, Eye, EyeOff, ArrowRight } from "lucide-react";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { Frac, SvgFrac } from "@/components/lessons/Frac";
import { cn } from "@/lib/cn";
import { randInt } from "@/lib/randomFraction";

/* ── ค่าคงที่ ── */

const DEN_OPTIONS = [2, 3, 4, 5, 6, 8, 10];
const DRAIN_PRESETS = [3, 10, 30, 60];
const MISSIONS_TOTAL = 8;

/* ── เสียง ── */

type SoundKind = "pour" | "drip" | "ding" | "correct" | "wrong" | "start" | "star" | "lift" | "bubble";

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
      case "pour": return sweep(420, 200, 0.8, "sawtooth", 0.05);
      case "drip": return tones([880, 660], 0.05, 0.1, "sine", 0.08);
      case "ding": return tones([1047, 1319], 0.07, 0.16, "sine", 0.13);
      case "lift": return sweep(260, 180, 0.3, "triangle", 0.07);
      case "correct": return tones([660, 990, 1319], 0.06, 0.1, "triangle", 0.14);
      case "wrong": return tones([220, 165], 0.11, 0.18, "sawtooth", 0.09);
      case "start": return tones([523, 659, 784], 0.07, 0.12, "triangle", 0.14);
      case "star": return tones([1047, 1319, 1568, 2093], 0.07, 0.14, "triangle", 0.14);
      case "bubble": return tones([1200], 0.05, 0.07, "sine", 0.04);
    }
  }
  return { play, ensure };
}

/* ── เพลงใต้ทะเล (ชิปทูน ไม่ใช้ไฟล์) ── */

const AQ_LEAD = [64, 0, 67, 69, 71, 0, 69, 67, 64, 0, 62, 64, 62, 0, 0, 0, 60, 0, 64, 67, 69, 0, 67, 0, 71, 0, 69, 67, 64, 0, 0, 0];
const AQ_BASS = [45, 52, 45, 52, 41, 48, 41, 48, 43, 50, 43, 50, 40, 47, 40, 47];

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
      const m = AQ_LEAD[s];
      if (m) note(m, 0.22, "triangle", 0.03);
      if (s % 2 === 0) {
        const b = AQ_BASS[s / 2];
        if (b) note(b, 0.34, "sine", 0.05);
      }
    }, 210);
  }
  function stop() {
    if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
  }
  useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);
  return { start, stop };
}

/* ── ปลา ── */

function Fish({ cx, cy, color, dark, flip, dur }: { cx: number; cy: number; color: string; dark: string; flip: boolean; dur: number }) {
  return (
    <g style={{ transform: `translate(${cx}px, ${cy}px)`, transition: `transform ${dur}s linear` }}>
      <g transform={flip ? "scale(-1,1)" : undefined} className="fj-fish">
        <ellipse cx={0} cy={0} rx={12} ry={8} fill={color} stroke={dark} strokeWidth={1.4} />
        <polygon className="fj-tail" points="10,0 20,-7 20,7" fill={color} stroke={dark} strokeWidth={1.2} style={{ transformOrigin: "10px 0" }} />
        <path d="M-3,-6 Q0,-10 4,-6" fill="none" stroke={dark} strokeWidth={1} />
        <circle cx={-6} cy={-2} r={1.9} fill="#1e293b" />
        <circle cx={-6.7} cy={-2.7} r={0.7} fill="#fff" />
      </g>
    </g>
  );
}

/* ── โหลปลา 3D ── */

const JAR_W = 128, JAR_H = 176, JAR_DX = 18, JAR_DY = 12;

function FishJar({ x, y, level, den, boldTick, dur, showLabels }: {
  x: number; y: number; level: number; den: number; boldTick: number | null; dur: number; showLabels: boolean;
}) {
  const L = x, R = x + JAR_W, T = y, B = y + JAR_H;
  const waterY = B - level * JAR_H;
  const empty = level <= 0.001;
  /* ตำแหน่งปลา — ตามระดับน้ำ (อยู่ใต้ผิวน้ำเสมอ ไม่ต่ำกว่าก้นโหล) */
  const fishY = (depth: number) => Math.min(waterY + depth, B - 20);
  return (
    <g>
      {/* เงา + ผนังหลัง (ความลึก) */}
      <ellipse cx={(L + R + JAR_DX) / 2} cy={B + 10} rx={86} ry={6} fill="#00000015" />
      <polygon points={`${R},${T} ${R + JAR_DX},${T - JAR_DY} ${R + JAR_DX},${B - JAR_DY} ${R},${B}`} fill="#bae6fd" opacity={0.16} stroke="#64748b" strokeWidth={1.6} />

      {/* น้ำ + ปลา (คลิปในหน้าตู้) */}
      <clipPath id="fj-clip"><rect x={L + 2} y={T + 2} width={JAR_W - 4} height={JAR_H - 3} /></clipPath>
      <g clipPath="url(#fj-clip)">
        <rect x={L + 2} y={waterY} width={JAR_W - 4} height={B - waterY} fill="url(#fj-water)" opacity={0.9} style={{ transition: `y ${dur}s linear, height ${dur}s linear` }} />
        {/* ฟองอากาศ */}
        {[[30, 0.4], [64, 1.1], [92, 0.7]].map(([px, delay], i) => (
          <circle key={i} className="fj-bubble" cx={L + (px as number)} cy={B - 10} r={2.4} fill="#fff" opacity={0.55} style={{ animationDelay: `${delay}s` }} />
        ))}
        {/* สาหร่ายก้นโหล */}
        <path d={`M${L + 22},${B} q-4,-24 3,-40 q6,14 0,40`} fill="#34d399" opacity={0.75} />
        <path d={`M${L + 34},${B} q4,-18 -2,-30 q-5,12 2,30`} fill="#10b981" opacity={0.7} />
        {/* ปลา 2 ตัว */}
        <Fish cx={L + 44} cy={fishY(30)} color="#fb923c" dark="#ea580c" flip={false} dur={dur} />
        <Fish cx={L + 86} cy={fishY(58)} color="#facc15" dark="#ca8a04" flip dur={dur} />
      </g>

      {/* ผิวน้ำ 3D เลื่อนตามระดับ */}
      <g style={{ transform: `translateY(${waterY}px)`, transition: `transform ${dur}s linear, opacity 0.3s`, opacity: level > 0 ? 1 : 0 }}>
        <polygon points={`${L + 2},0 ${R - 2},0 ${R - 2 + JAR_DX * 0.85},${-JAR_DY * 0.85} ${L + 2 + JAR_DX * 0.85},${-JAR_DY * 0.85}`} fill="#bae6fd" opacity={0.95} stroke="#fff" strokeWidth={1.2} />
        <line x1={L + 2} y1={0} x2={R - 2} y2={0} stroke="#fff" strokeWidth={1.5} opacity={0.85} />
      </g>

      {/* ขีดแบ่ง + ป้าย */}
      {Array.from({ length: den + 1 }, (_, k) => {
        const ty = B - (k / den) * JAR_H;
        const bold = k === boldTick;
        return (
          <g key={k}>
            <line x1={L + 3} y1={ty} x2={R - 3} y2={ty} stroke="#0369a1" strokeWidth={bold ? 3 : 1.4} strokeDasharray="6 4" opacity={bold ? 0.95 : 0.4} />
            {showLabels && (
              k === 0 || k === den
                ? <text x={R + JAR_DX + 4} y={ty + 3.5} fontSize={den > 8 ? 8 : 10} fontWeight={800} fill="#0369a1" opacity={bold ? 1 : 0.55}>{k === 0 ? "0" : "เต็ม"}</text>
                : <g opacity={bold ? 1 : 0.55}><SvgFrac x={R + JAR_DX + 12} y={ty + 1} n={k} d={den} size={den > 8 ? 7 : 8.5} fill="#0369a1" /></g>
            )}
          </g>
        );
      })}

      {/* กรอบแก้วด้านหน้า */}
      <rect x={L} y={T} width={JAR_W} height={JAR_H} fill="none" stroke="#475569" strokeWidth={2.4} rx={3} />
      <rect x={L + 7} y={T + 10} width={6} height={JAR_H - 34} rx={3} fill="#fff" opacity={0.28} />

      {/* ก๊อกระบายด้านล่างขวา */}
      <rect x={R - 4} y={B - 30} width={16} height={9} rx={2} fill="#64748b" stroke="#334155" strokeWidth={1.2} />
      <rect x={R + 8} y={B - 34} width={5} height={16} rx={2} fill="#94a3b8" stroke="#334155" strokeWidth={1} />

      {/* หน้าตกใจตอนน้ำหมด */}
      {empty && <text x={L + JAR_W / 2} y={T + JAR_H / 2} fontSize={26} textAnchor="middle">😵</text>}

      {/* ป้ายชื่อ */}
      <rect x={L + JAR_W / 2 - 32} y={B + 15} width={64} height={19} rx={7} fill="#0284c7" />
      <text x={L + JAR_W / 2} y={B + 28.5} fontSize={11.5} fontWeight={900} fill="#fff" textAnchor="middle">โหลปลา</text>
    </g>
  );
}

/* ── ถังรับน้ำที่เทออก ── */

function Bucket({ x, y, w, h, level, dur }: { x: number; y: number; w: number; h: number; level: number; dur: number }) {
  const topW = w, botW = w * 0.78;
  const inset = (topW - botW) / 2;
  const L = x, R = x + w, T = y, B = y + h;
  const waterTop = B - Math.min(1, level) * (h - 8);
  return (
    <g>
      <ellipse cx={x + w / 2} cy={B + 6} rx={w / 2} ry={5} fill="#00000012" />
      {/* น้ำในถัง */}
      <clipPath id="fj-bucket-clip">
        <polygon points={`${L},${T} ${R},${T} ${R - inset},${B} ${L + inset},${B}`} />
      </clipPath>
      <g clipPath="url(#fj-bucket-clip)">
        <rect x={L} y={waterTop} width={w} height={B - waterTop} fill="url(#fj-water)" opacity={0.85} style={{ transition: `y ${dur}s linear, height ${dur}s linear` }} />
        <ellipse cx={x + w / 2} cy={waterTop} rx={w / 2 - 2} ry={4} fill="#bae6fd" opacity={0.9} style={{ transition: `cy ${dur}s linear` }} />
      </g>
      {/* ผนังถัง */}
      <polygon points={`${L},${T} ${R},${T} ${R - inset},${B} ${L + inset},${B}`} fill="none" stroke="#64748b" strokeWidth={2.4} />
      <ellipse cx={x + w / 2} cy={T} rx={w / 2} ry={6} fill="none" stroke="#64748b" strokeWidth={2.4} />
      <text x={x + w / 2} y={B + 20} fontSize={11} fontWeight={900} fill="#64748b" textAnchor="middle">น้ำที่เทออก</text>
    </g>
  );
}

/* ── ฉากตู้ปลา ── */

function TankScene({ den, jar, bucket, pouring, dur }: { den: number; jar: number; bucket: number; pouring: boolean; dur: number }) {
  const JX = 46, JY = 78;
  const BX = 388, BY = 168, BW = 128, BH = 118;
  const tapX = JX + JAR_W + 10, tapY = JY + JAR_H - 26;
  const bucketCx = BX + BW / 2;
  const bucketLevel = bucket / den;
  const bucketSurfaceY = BY + (BH - 8) - Math.min(1, bucketLevel) * (BH - 8);

  return (
    <svg viewBox="0 20 560 330" className="w-full" role="img" aria-label="โหลปลาน้ำลด">
      <defs>
        <linearGradient id="fj-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7dd3fc" />
          <stop offset="1" stopColor="#0ea5e9" />
        </linearGradient>
        <linearGradient id="fj-wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b07a45" />
          <stop offset="1" stopColor="#8a5a2e" />
        </linearGradient>
      </defs>
      <style>{`
        @keyframes fjTail { 0%,100% { transform: rotate(-12deg); } 50% { transform: rotate(12deg); } }
        .fj-tail { animation: fjTail 0.5s ease-in-out infinite; }
        @keyframes fjSwim { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
        .fj-fish { animation: fjSwim 1.4s ease-in-out infinite; }
        @keyframes fjBubble { 0% { transform: translateY(0); opacity: .6; } 100% { transform: translateY(-70px); opacity: 0; } }
        .fj-bubble { animation: fjBubble 2.4s linear infinite; }
        @keyframes fjStream { 0% { opacity: .55; } 50% { opacity: .95; } 100% { opacity: .55; } }
        .fj-stream { animation: fjStream 0.45s linear infinite; }
        @keyframes fjSplash { 0% { transform: translateY(0); opacity: .9; } 100% { transform: translateY(7px); opacity: 0; } }
        .fj-splash { animation: fjSplash 0.6s ease-out infinite; }
      `}</style>

      {/* โต๊ะไม้ */}
      <rect x={0} y={JY + JAR_H + 40} width={560} height={16} rx={5} fill="url(#fj-wood)" stroke="#6b4423" strokeWidth={1.5} />
      <rect x={0} y={JY + JAR_H + 44} width={560} height={2.5} fill="#c9975f" opacity={0.5} />

      {/* ถัง */}
      <Bucket x={BX} y={BY} w={BW} h={BH} level={bucketLevel} dur={dur} />

      {/* โหลปลา */}
      <FishJar x={JX} y={JY} level={jar / den} den={den} boldTick={jar} dur={dur} showLabels />

      {/* สายน้ำจากก๊อก → ถัง */}
      {pouring && (
        <g>
          <path className="fj-stream" d={`M ${tapX + 12} ${tapY + 4} Q ${(tapX + bucketCx) / 2} ${tapY + 60} ${bucketCx} ${bucketSurfaceY - 4}`} stroke="url(#fj-water)" strokeWidth={9} fill="none" strokeLinecap="round" />
          <circle className="fj-splash" cx={bucketCx} cy={bucketSurfaceY - 2} r={4} fill="#bae6fd" />
        </g>
      )}
    </svg>
  );
}

/* ── ตัวเลือกเศษ (แถวเดียว) ── */

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

export function SubtractFishJarGame() {
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

  /* โจทย์ */
  const [den, setDen] = useState(5);
  const [a, setA] = useState(4); // น้ำเริ่มต้น
  const [b, setB] = useState(2); // เทออก
  const [drainSecs, setDrainSecs] = useState(3);
  const [reveal, setReveal] = useState(false);

  /* ระดับน้ำจริง */
  const [jar, setJar] = useState(4);
  const [pouring, setPouring] = useState(false);
  const [dur, setDur] = useState(0.4);
  const [drainN, setDrainN] = useState(1);
  const timeoutsRef = useRef<number[]>([]);
  useEffect(() => () => timeoutsRef.current.forEach((t) => window.clearTimeout(t)), []);

  /* ภารกิจ */
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [guess, setGuess] = useState(0);
  const [firstTry, setFirstTry] = useState(true);
  const [checked, setChecked] = useState<null | boolean>(null);
  const [gameOver, setGameOver] = useState(false);

  const result = a - b;
  const bucket = a - jar;
  const finalJar = a - b;
  const movable = jar - finalJar;
  const done = jar === finalJar && jar !== a;
  const atStart = jar === a;

  function resetLevels(na: number) {
    setJar(na);
    setPouring(false);
    setChecked(null);
  }
  function setupProblem(nd: number, na: number, nb: number) {
    setDen(nd); setA(na); setB(nb);
    resetLevels(na);
    setGuess(0); setFirstTry(true);
    setDrainN(1);
  }

  /* เทน้ำออก n ส่วน */
  function drainParts(n: number, evalGuess = false) {
    if (pouring) return;
    const moved = Math.min(n, jar - finalJar);
    if (moved <= 0) return;
    ensure();
    const d = Math.max(0.7, (drainSecs * moved) / den);
    setDur(d);
    setPouring(true);
    play("lift");
    timeoutsRef.current.push(window.setTimeout(() => {
      play("pour");
      const reps = Math.min(6, Math.max(1, Math.floor(d / 1.2)));
      for (let i = 1; i < reps; i++) timeoutsRef.current.push(window.setTimeout(() => play("drip"), i * 1000));
      setJar((v) => v - moved);
    }, 640));
    timeoutsRef.current.push(window.setTimeout(() => {
      setPouring(false);
      play("ding");
      if (evalGuess) {
        const ok = guess === result;
        setChecked(ok);
        if (ok) { play("correct"); setScore((s) => s + (firstTry ? 25 : 12)); }
        else play("wrong");
      }
    }, 640 + d * 1000 + 200));
  }

  /* ภารกิจ flow */
  function randomProblem(): [number, number, number] {
    const nd = DEN_OPTIONS[randInt(1, DEN_OPTIONS.length - 2)];
    const na = randInt(2, nd);
    const nb = randInt(1, na - 1); // เหลือน้ำอย่างน้อย 1 ขีด (ปลาต้องอยู่ได้)
    return [nd, na, nb];
  }
  function startMissions() {
    ensure(); play("start");
    setScore(0); setRound(1); setGameOver(false);
    setupProblem(5, 4, 2);
    setMode("mission");
  }
  function nextMission() {
    if (round >= MISSIONS_TOTAL) { setGameOver(true); play("star"); return; }
    setRound((r) => r + 1);
    const [nd, na, nb] = randomProblem();
    setupProblem(nd, na, nb);
  }

  const stars = score >= 170 ? 3 : score >= 100 ? 2 : 1;

  return (
    <div className="relative overflow-hidden rounded-2xl p-3 sm:p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-100 via-sky-50 to-blue-50" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden text-2xl" aria-hidden>
        <span className="absolute left-4 top-5 opacity-40">🐠</span>
        <span className="absolute right-8 top-8 opacity-40">🫧</span>
        <span className="absolute bottom-8 left-8 opacity-30">🐚</span>
        <span className="absolute right-4 top-24 opacity-30">🌊</span>
      </div>

      <div className="relative space-y-3">
        {/* โหมด + ปิดเสียง */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex rounded-xl border-2 border-slate-200 bg-white p-1">
            <button onClick={() => { setMode("lab"); resetLevels(a); }} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "lab" ? "bg-sky-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <FlaskConical size={15} /> โหมดครู
            </button>
            <button onClick={startMissions} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "mission" ? "bg-cyan-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <Target size={15} /> โหมดทายก่อนเท
            </button>
          </div>
          <button onClick={() => setMuted((m) => !m)} className="grid h-9 w-9 place-items-center rounded-xl border-2 border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50" title={muted ? "เปิดเสียง" : "ปิดเสียง"}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {mode === "mission" && gameOver ? (
          <div className="space-y-4 rounded-2xl border-2 border-cyan-300 bg-white/90 p-6 text-center">
            <div className="text-5xl">🐠🏆</div>
            <h3 className="text-xl font-extrabold text-slate-800 sm:text-2xl">จบภารกิจนักดูแลตู้ปลา!</h3>
            <p className="text-2xl">{"⭐".repeat(stars)}{"☆".repeat(3 - stars)}</p>
            <p className="text-base font-extrabold text-cyan-700">🏅 คะแนนรวม {score}</p>
            <button onClick={startMissions} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
              <Play size={18} /> เล่นอีกครั้ง
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* แถบตั้งค่า (ครู) / สถานะ (ภารกิจ) */}
            {mode === "lab" ? (
              <div className="space-y-2 rounded-2xl border-2 border-sky-200 bg-white/90 px-3 py-2">
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
                  <span className="text-sm font-extrabold text-sky-700">🧑‍🏫 ตั้งโจทย์:</span>
                  <NumPicker label="น้ำมี" value={a} min={1} max={den} onChange={(v) => setupProblem(den, v, Math.min(b, v))} color="text-sky-600" />
                  <span className="text-xl font-black text-slate-400">−</span>
                  <NumPicker label="เทออก" value={b} min={1} max={a} onChange={(v) => setupProblem(den, a, v)} color="text-rose-500" />
                  <span className="mx-1 text-slate-300">|</span>
                  <span className="text-xs font-extrabold text-slate-500">ส่วน (ขีดโหล)</span>
                  {DEN_OPTIONS.map((d) => (
                    <button key={d} onClick={() => setupProblem(d, Math.min(a, d), Math.min(b, Math.min(a, d)))} className={cn("h-7 w-7 rounded-lg border-2 text-sm font-extrabold transition", den === d ? "border-sky-500 bg-sky-100 text-sky-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>{d}</button>
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="text-xs font-extrabold text-slate-500">⏱️ เวลาเท:</span>
                  {DRAIN_PRESETS.map((s) => (
                    <button key={s} onClick={() => setDrainSecs(s)} className={cn("rounded-lg border-2 px-2 py-0.5 text-xs font-extrabold transition", drainSecs === s ? "border-cyan-500 bg-cyan-100 text-cyan-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>{s}วิ</button>
                  ))}
                  <input type="range" min={1} max={60} value={drainSecs} onChange={(e) => setDrainSecs(+e.target.value)} className="w-24 accent-cyan-600" />
                  <span className="w-9 text-xs font-extrabold text-cyan-700">{drainSecs}วิ</span>
                  <button onClick={() => setReveal((v) => !v)} className={cn("flex items-center gap-1 rounded-lg border-2 px-2 py-1 text-xs font-extrabold transition", reveal ? "border-violet-400 bg-violet-100 text-violet-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
                    {reveal ? <EyeOff size={13} /> : <Eye size={13} />} เฉลย
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 rounded-2xl bg-white/90 px-4 py-2 ring-1 ring-cyan-200">
                <span className="text-base font-extrabold text-cyan-700">🎯 ข้อ {round}/{MISSIONS_TOTAL}</span>
                <span className="text-base font-extrabold text-sky-700">🏅 {score}</span>
                <span className="text-xs font-extrabold text-slate-500">ทายผลก่อน แล้วเทพิสูจน์!</span>
              </div>
            )}

            {/* สมการใหญ่ */}
            <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-sky-200 bg-white/95 px-5 py-2.5 shadow-sm">
              <StackedFraction numerator={a} denominator={den} className="text-3xl sm:text-4xl" toneClassName="text-sky-600" />
              <span className="text-3xl font-black text-slate-400">−</span>
              <StackedFraction numerator={b} denominator={den} className="text-3xl sm:text-4xl" toneClassName="text-rose-500" />
              <span className="text-3xl font-black text-slate-400">=</span>
              {done || (mode === "lab" && reveal) ? (
                <StackedFraction numerator={result} denominator={den} className="text-3xl sm:text-4xl" toneClassName={done ? "text-cyan-600" : "text-violet-500"} />
              ) : (
                <span className="grid h-12 w-12 place-items-center rounded-xl border-[3px] border-dashed border-sky-300 text-2xl font-black text-sky-400">?</span>
              )}
            </div>

            {/* ฉากตู้ปลา */}
            <div className="rounded-2xl border-2 border-sky-200 bg-gradient-to-b from-sky-100/70 to-cyan-50/70 p-2">
              <TankScene den={den} jar={jar} bucket={bucket} pouring={pouring} dur={dur} />
            </div>

            {/* คำอธิบายผล */}
            {done && (
              <p className="flex flex-wrap items-center justify-center gap-1 text-center text-sm font-extrabold text-slate-600">
                {result === 0
                  ? <>น้ำหมดโหล! <Frac n={0} d={den} tone="text-rose-600" /> — เติมน้ำให้ปลาด่วน 🐠</>
                  : <>เทออกไป <Frac n={b} d={den} tone="text-rose-500" /> เหลือน้ำที่ขีด <Frac n={result} d={den} tone="text-cyan-600" /> — ตัวส่วนไม่เปลี่ยน (ขีดโหลเท่าเดิม) เอาแค่ตัวเศษมาลบกัน!</>}
              </p>
            )}

            {/* โหมดทายก่อนเท */}
            {mode === "mission" && atStart && !pouring && (
              <div className="space-y-2 rounded-2xl border-2 border-cyan-200 bg-white/90 p-3">
                <p className="text-center text-sm font-extrabold text-slate-600">🤔 ทายก่อน: เทน้ำออกแล้วเหลือน้ำถึงขีดไหน?</p>
                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => setGuess((g) => Math.max(0, g - 1))} className="h-9 w-9 rounded-lg border-2 border-slate-200 bg-white text-lg font-extrabold text-slate-600 active:scale-95">−</button>
                  <span className="inline-flex flex-col items-center rounded-xl border-2 border-cyan-300 bg-white px-4 py-1">
                    <span className="text-2xl font-extrabold text-cyan-600">{guess}</span>
                    <span className="h-[3px] w-8 rounded bg-cyan-600" />
                    <span className="text-2xl font-extrabold text-slate-400">{den}</span>
                  </span>
                  <button onClick={() => setGuess((g) => Math.min(den, g + 1))} className="h-9 w-9 rounded-lg border-2 border-slate-200 bg-white text-lg font-extrabold text-slate-600 active:scale-95">+</button>
                  <button onClick={() => { setFirstTry(true); drainParts(den, true); }} className="ml-3 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-500 px-6 py-2.5 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                    🚰 เทพิสูจน์!
                  </button>
                </div>
              </div>
            )}

            {/* ผลทาย */}
            {mode === "mission" && checked !== null && (
              <div className={cn("rounded-2xl border-2 p-3 text-center", checked ? "border-emerald-300 bg-emerald-50" : "border-rose-300 bg-rose-50")}>
                <p className={cn("flex flex-wrap items-center justify-center gap-1 text-base font-extrabold", checked ? "text-emerald-700" : "text-rose-600")}>
                  {checked ? <>🎉 ทายถูก! <Frac n={a} d={den} /> − <Frac n={b} d={den} /> = <Frac n={result} d={den} /></> : <>ทาย <Frac n={guess} d={den} /> แต่เหลือจริง <Frac n={result} d={den} /> — {guess === a + b ? "นี่คือการบวก! เราเทออกนะ" : guess === b ? "นั่นคือน้ำที่เทออก ไม่ใช่ที่เหลือ" : "ลองข้อต่อไป!"}</>}
                </p>
                <button onClick={nextMission} className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-500 px-6 py-2 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                  {round >= MISSIONS_TOTAL ? "🏁 ดูสรุปผล" : <>ข้อต่อไป <ArrowRight size={16} /></>}
                </button>
              </div>
            )}

            {/* ปุ่มควบคุมการเท (โหมดครู) */}
            {mode === "lab" && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                {movable > 0 ? (
                  <>
                    <button onClick={() => drainParts(den)} disabled={pouring} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 px-6 py-2.5 text-base font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98] disabled:opacity-50">
                      🚰 เททั้งหมด
                    </button>
                    <span className="mx-1 text-slate-300">|</span>
                    <span className="text-xs font-extrabold text-slate-500">เททีละ</span>
                    <button onClick={() => setDrainN((n) => Math.max(1, n - 1))} className="h-8 w-8 rounded-lg border-2 border-slate-200 bg-white text-base font-extrabold text-slate-600 active:scale-95">−</button>
                    <span className="w-6 text-center text-lg font-extrabold text-sky-700">{Math.min(drainN, movable)}</span>
                    <button onClick={() => setDrainN((n) => Math.min(movable, n + 1))} className="h-8 w-8 rounded-lg border-2 border-slate-200 bg-white text-base font-extrabold text-slate-600 active:scale-95">+</button>
                    <span className="text-xs font-extrabold text-slate-500">ส่วน</span>
                    <button onClick={() => drainParts(drainN)} disabled={pouring} className="inline-flex items-center gap-1.5 rounded-xl border-b-4 border-cyan-700 bg-gradient-to-b from-cyan-500 to-cyan-600 px-4 py-2 text-sm font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.97] active:border-b-2 disabled:opacity-50">
                      ▶ เท
                    </button>
                    {!atStart && (
                      <button onClick={() => resetLevels(a)} disabled={pouring} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-3 py-1.5 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50 disabled:opacity-50">
                        <RotateCcw size={14} /> เติมน้ำใหม่
                      </button>
                    )}
                  </>
                ) : (
                  <button onClick={() => resetLevels(a)} disabled={pouring} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-5 py-2 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50 disabled:opacity-50">
                    <RotateCcw size={15} /> เติมน้ำใหม่อีกครั้ง
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
