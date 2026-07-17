"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Volume2, VolumeX, FlaskConical, Target, Eye, EyeOff, ArrowRight, ArrowLeftRight } from "lucide-react";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { Frac, SvgFrac } from "@/components/lessons/Frac";
import { cn } from "@/lib/cn";
import { randInt } from "@/lib/randomFraction";

/* ── ค่าคงที่ ── */

const DEN_OPTIONS = [2, 3, 4, 5, 6, 8, 10];
const FILL_PRESETS = [3, 10, 30, 60];
const MISSIONS_TOTAL = 8;
type Dir = "AtoB" | "BtoA";

/* ── เสียง ── */

type SoundKind = "pour" | "ding" | "correct" | "wrong" | "start" | "star" | "lift";

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
      case "pour": return sweep(500, 260, 0.8, "sawtooth", 0.05);
      case "ding": return tones([1047, 1319], 0.07, 0.16, "sine", 0.13);
      case "lift": return sweep(300, 520, 0.3, "triangle", 0.08);
      case "correct": return tones([660, 990, 1319], 0.06, 0.1, "triangle", 0.14);
      case "wrong": return tones([220, 165], 0.11, 0.18, "sawtooth", 0.09);
      case "start": return tones([523, 659, 784], 0.07, 0.12, "triangle", 0.14);
      case "star": return tones([1047, 1319, 1568, 2093], 0.07, 0.14, "triangle", 0.14);
    }
  }
  return { play, ensure };
}

/* ── เพลงฟาร์มส้ม (ชิปทูน ไม่ใช้ไฟล์) ── */

const OJ_LEAD = [64, 66, 68, 71, 68, 66, 64, 0, 61, 64, 66, 68, 66, 64, 61, 0, 59, 61, 64, 66, 64, 61, 59, 61, 64, 0, 66, 68, 71, 0, 0, 0];
const OJ_BASS = [40, 47, 44, 47, 37, 44, 40, 44, 35, 42, 38, 42, 40, 47, 44, 47];

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
      const m = OJ_LEAD[s];
      if (m) note(m, 0.17, "triangle", 0.032);
      if (s % 2 === 0) {
        const b = OJ_BASS[s / 2];
        if (b) note(b, 0.3, "sine", 0.055);
      }
    }, 205);
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

/* ── โหลน้ำส้ม 3D ใบเดียว ── */

const JAR_W = 116, JAR_H = 158, JAR_DX = 16, JAR_DY = 10;

function Jar({ x, y, level, den, boldTick, gid, dur, showLabels, badge }: {
  x: number; y: number; level: number; den: number; boldTick: number | null; gid: string; dur: number; showLabels: boolean; badge: string;
}) {
  const L = x, R = x + JAR_W, T = y, B = y + JAR_H;
  const waterY = B - level * JAR_H;
  return (
    <g>
      {/* เงา + ผนังหลัง (ความลึก) */}
      <ellipse cx={(L + R + JAR_DX) / 2} cy={B + 9} rx={80} ry={5} fill="#00000015" />
      <line x1={L + JAR_DX} y1={T - JAR_DY} x2={L + JAR_DX} y2={B - JAR_DY} stroke="#94a3b8" strokeWidth={1.4} opacity={0.4} />
      <line x1={L + JAR_DX} y1={B - JAR_DY} x2={R + JAR_DX} y2={B - JAR_DY} stroke="#94a3b8" strokeWidth={1.4} opacity={0.4} />
      {/* ผนังกระจกด้านขวา (โปร่ง เห็นทะลุ) */}
      <polygon points={`${R},${T} ${R + JAR_DX},${T - JAR_DY} ${R + JAR_DX},${B - JAR_DY} ${R},${B}`} fill="#bae6fd" opacity={0.16} stroke="#64748b" strokeWidth={1.6} />

      {/* น้ำส้ม (คลิปในหน้าตู้) */}
      <clipPath id={`${gid}-clip`}><rect x={L + 2} y={T + 2} width={JAR_W - 4} height={JAR_H - 3} /></clipPath>
      <g clipPath={`url(#${gid}-clip)`}>
        <rect x={L + 2} y={waterY} width={JAR_W - 4} height={B - waterY} fill="url(#oj-grad)" opacity={0.94} style={{ transition: `y ${dur}s linear, height ${dur}s linear` }} />
        {[[28, 26], [62, 54], [90, 36], [46, 82], [80, 100], [24, 116]].map(([px, py], i) => (
          <circle key={i} cx={L + px} cy={B - py} r={2.2} fill="#fff7ed" opacity={0.5} style={{ transition: `opacity ${dur}s` }} />
        ))}
      </g>
      {/* ผิวน้ำ 3D เลื่อนตามระดับ */}
      <g style={{ transform: `translateY(${waterY}px)`, transition: `transform ${dur}s linear, opacity 0.3s`, opacity: level > 0 ? 1 : 0 }}>
        <polygon points={`${L + 2},0 ${R - 2},0 ${R - 2 + JAR_DX * 0.85},${-JAR_DY * 0.85} ${L + 2 + JAR_DX * 0.85},${-JAR_DY * 0.85}`} fill="#ffc766" opacity={0.95} stroke="#fff" strokeWidth={1.2} />
        <line x1={L + 2} y1={0} x2={R - 2} y2={0} stroke="#fff" strokeWidth={1.5} opacity={0.85} />
      </g>

      {/* ขีดแบ่ง + ป้าย (ป้ายเฉพาะโหลที่ไม่ได้ยก เพื่อไม่ให้เกะกะ) */}
      {Array.from({ length: den + 1 }, (_, k) => {
        const ty = B - (k / den) * JAR_H;
        const bold = k === boldTick;
        return (
          <g key={k}>
            <line x1={L + 3} y1={ty} x2={R - 3} y2={ty} stroke="#b45309" strokeWidth={bold ? 3 : 1.4} strokeDasharray="6 4" opacity={bold ? 0.95 : 0.42} />
            {showLabels && (
              k === 0 || k === den
                ? <text x={R + JAR_DX + 4} y={ty + 3.5} fontSize={den > 8 ? 8 : 10} fontWeight={800} fill="#b45309" opacity={bold ? 1 : 0.55}>{k === 0 ? "0" : "เต็ม"}</text>
                : <g opacity={bold ? 1 : 0.55}><SvgFrac x={R + JAR_DX + 12} y={ty + 1} n={k} d={den} size={den > 8 ? 7 : 8.5} fill="#b45309" /></g>
            )}
          </g>
        );
      })}

      {/* กรอบแก้วด้านหน้า (บางใส ไม่ทับน้ำ) */}
      <rect x={L} y={T} width={JAR_W} height={JAR_H} fill="none" stroke="#475569" strokeWidth={2.4} rx={2} />
      <rect x={L + 7} y={T + 10} width={6} height={JAR_H - 34} rx={3} fill="#fff" opacity={0.28} />

      {/* ป้ายชื่อโหล */}
      <rect x={L + JAR_W / 2 - 30} y={B + 13} width={60} height={19} rx={7} fill={badge === "A" ? "#059669" : "#0284c7"} />
      <text x={L + JAR_W / 2} y={B + 26.5} fontSize={11.5} fontWeight={900} fill="#fff" textAnchor="middle">โหล {badge}</text>
    </g>
  );
}

/* ── ฉากเทรวมน้ำส้ม ── */

function JuiceScene({ den, jarA, jarB, dir, pouring, dur }: {
  den: number; jarA: number; jarB: number; dir: Dir; pouring: boolean; dur: number;
}) {
  /* ตำแหน่งฐานสองโหล (viewBox มีที่ว่างด้านบนให้โหลยกโดยไม่หลุดเฟรม) */
  const AX = 40, BX = 372, JY = 150;   // มุมซ้ายบนของโหล A, B
  const srcIsA = dir === "AtoB";

  /* โหลต้นทางยกขึ้นเล็กน้อย + เอียงเข้าหาปลายทาง (คงอยู่ในเฟรม) */
  const tilt = pouring ? (srcIsA ? 15 : -15) : 0;
  const lift = pouring ? -30 : 0;
  const shift = pouring ? (srcIsA ? 120 : -120) : 0;
  const srcBaseX = srcIsA ? AX : BX;
  const pivotX = srcBaseX + JAR_W / 2;
  const pivotY = JY + JAR_H;

  /* ปลายรินโดยประมาณ (หลังยก/เอียง) + ผิวน้ำโหลปลายทาง */
  const tgtX = srcIsA ? BX : AX;
  const tgtLevel = (srcIsA ? jarB : jarA) / den;
  const tgtCx = tgtX + JAR_W / 2;
  const tgtSurfaceY = JY + JAR_H - tgtLevel * JAR_H;
  const spoutX = srcIsA ? pivotX + shift + 58 : pivotX + shift - 58;
  const spoutY = JY + lift + 18;

  return (
    <svg viewBox="0 -40 560 400" className="w-full" role="img" aria-label={`เทน้ำส้ม โหล ${srcIsA ? "A ลง B" : "B ลง A"}`}>
      <defs>
        <linearGradient id="oj-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffb347" />
          <stop offset="1" stopColor="#f97316" />
        </linearGradient>
        <linearGradient id="oj-wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b07a45" />
          <stop offset="1" stopColor="#8a5a2e" />
        </linearGradient>
      </defs>
      <style>{`
        .oj-stream2 { animation: ojStream2 0.5s linear infinite; }
        @keyframes ojStream2 { 0% { opacity: .6; } 50% { opacity: .95; } 100% { opacity: .6; } }
        .oj-splash2 { animation: ojSplash2 0.65s ease-out infinite; }
        @keyframes ojSplash2 { 0% { transform: translateY(0); opacity: .9; } 100% { transform: translateY(8px); opacity: 0; } }
      `}</style>

      {/* โต๊ะไม้ */}
      <rect x={0} y={JY + JAR_H + 34} width={560} height={16} rx={5} fill="url(#oj-wood)" stroke="#6b4423" strokeWidth={1.5} />
      <rect x={0} y={JY + JAR_H + 38} width={560} height={2.5} fill="#c9975f" opacity={0.5} />

      {/* โหลปลายทาง (อยู่กับที่ ป้ายขีดอยู่) */}
      {srcIsA
        ? <Jar x={BX} y={JY} level={jarB / den} den={den} boldTick={jarB} gid="jarB" dur={dur} showLabels badge="B" />
        : <Jar x={AX} y={JY} level={jarA / den} den={den} boldTick={jarA} gid="jarA" dur={dur} showLabels badge="A" />}

      {/* สายน้ำส้มจากปากโหลต้นทาง → โหลปลายทาง */}
      {pouring && (
        <g>
          <path className="oj-stream2" d={`M ${spoutX} ${spoutY} Q ${(spoutX + tgtCx) / 2} ${spoutY + 6} ${tgtCx} ${tgtSurfaceY - 4}`} stroke="url(#oj-grad)" strokeWidth={11} fill="none" strokeLinecap="round" />
          <circle className="oj-splash2" cx={tgtCx} cy={tgtSurfaceY - 2} r={4.5} fill="#ffd9a1" />
        </g>
      )}

      {/* โหลต้นทาง (ยก+เอียงเล็กน้อย ไม่ทับกรอบ ไม่หลุดเฟรม) */}
      <g style={{ transform: `translate(${shift}px, ${lift}px) rotate(${tilt}deg)`, transformOrigin: `${pivotX}px ${pivotY}px`, transition: "transform 0.7s cubic-bezier(.45,.05,.35,1.1)" }}>
        {srcIsA
          ? <Jar x={AX} y={JY} level={jarA / den} den={den} boldTick={jarA} gid="jarAs" dur={dur} showLabels={!pouring} badge="A" />
          : <Jar x={BX} y={JY} level={jarB / den} den={den} boldTick={jarB} gid="jarBs" dur={dur} showLabels={!pouring} badge="B" />}
      </g>
    </svg>
  );
}

/* ── ตัวเลือกเศษ (แถวเดียว) ── */

function NumPicker({ label, value, max, onChange, color }: { label: string; value: number; max: number; onChange: (v: number) => void; color: string }) {
  const btn = "h-8 w-8 rounded-lg border-2 border-slate-200 bg-white text-lg font-extrabold text-slate-600 hover:bg-slate-50 active:scale-95";
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs font-extrabold text-slate-500">{label}</span>
      <button onClick={() => onChange(Math.max(1, value - 1))} className={btn}>−</button>
      <span className={cn("w-8 text-center text-2xl font-extrabold", color)}>{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))} className={btn}>+</button>
    </div>
  );
}

/* ── เกมหลัก ── */

export function AddJuiceTankGame() {
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
  const [a, setA] = useState(2);
  const [b, setB] = useState(1);
  const [fillSecs, setFillSecs] = useState(3);
  const [reveal, setReveal] = useState(false);
  const [dir, setDir] = useState<Dir>("AtoB");

  /* ระดับน้ำ "จริง" ในแต่ละโหล (0..den) — เปลี่ยนเมื่อเท */
  const [jarA, setJarA] = useState(2);
  const [jarB, setJarB] = useState(1);
  const [pouring, setPouring] = useState(false);
  const [dur, setDur] = useState(0.4);
  const [pourN, setPourN] = useState(1);
  const timeoutsRef = useRef<number[]>([]);
  useEffect(() => () => timeoutsRef.current.forEach((t) => window.clearTimeout(t)), []);

  /* ภารกิจ */
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [guess, setGuess] = useState(0);
  const [firstTry, setFirstTry] = useState(true);
  const [checked, setChecked] = useState<null | boolean>(null);
  const [gameOver, setGameOver] = useState(false);

  const sum = a + b;
  const overflow = sum > den;
  const srcLevel = dir === "AtoB" ? jarA : jarB;
  const tgtLevel = dir === "AtoB" ? jarB : jarA;
  const movable = Math.min(srcLevel, den - tgtLevel);
  const combined = movable === 0 && (jarA !== a || jarB !== b); // เทไปแล้วจนหมดที่จะเทได้
  const atStart = jarA === a && jarB === b;

  function resetLevels(na: number, nb: number) {
    setJarA(na); setJarB(nb);
    setPouring(false);
    setChecked(null);
  }
  function setupProblem(nd: number, na: number, nb: number) {
    setDen(nd); setA(na); setB(nb);
    resetLevels(na, nb);
    setGuess(0); setFirstTry(true);
    setPourN(1);
  }

  /* เทน้ำ n ส่วนจากต้นทาง→ปลายทาง (n มากไป = เททั้งหมดเท่าที่ได้) */
  function pourParts(n: number, evalGuess = false) {
    if (pouring) return;
    const moved = Math.min(n, srcLevel, den - tgtLevel);
    if (moved <= 0) return;
    ensure();
    const d = Math.max(0.7, (fillSecs * moved) / den);
    setDur(d);
    setPouring(true);
    play("lift");
    timeoutsRef.current.push(window.setTimeout(() => {
      play("pour");
      const reps = Math.min(6, Math.max(1, Math.floor(d / 1.2)));
      for (let i = 1; i < reps; i++) timeoutsRef.current.push(window.setTimeout(() => play("pour"), i * 1100));
      // อัปเดตระดับ (เริ่ม transition)
      if (dir === "AtoB") { setJarA((v) => v - moved); setJarB((v) => v + moved); }
      else { setJarB((v) => v - moved); setJarA((v) => v + moved); }
    }, 720));
    timeoutsRef.current.push(window.setTimeout(() => {
      setPouring(false);
      play("ding");
      if (evalGuess) {
        const ok = guess === sum;
        setChecked(ok);
        if (ok) { play("correct"); setScore((s) => s + (firstTry ? 25 : 12)); }
        else play("wrong");
      }
    }, 720 + d * 1000 + 200));
  }

  function changeDir(nd: Dir) {
    if (pouring) return;
    setDir(nd);
    resetLevels(a, b); // เปลี่ยนทิศ = ตั้งต้นใหม่
  }

  /* ภารกิจ flow */
  function randomProblem(): [number, number, number] {
    const nd = DEN_OPTIONS[randInt(1, DEN_OPTIONS.length - 2)];
    const na = randInt(1, nd - 1);
    const allowOver = round > 4;
    const nb = allowOver ? randInt(1, nd - 1) : randInt(1, Math.max(1, nd - na));
    return [nd, na, nb];
  }
  function startMissions() {
    ensure(); play("start");
    setScore(0); setRound(1); setGameOver(false);
    setDir("AtoB");
    setupProblem(5, 2, 1);
    setMode("mission");
  }
  function nextMission() {
    if (round >= MISSIONS_TOTAL) { setGameOver(true); play("star"); return; }
    setRound((r) => r + 1);
    const [nd, na, nb] = randomProblem();
    setupProblem(nd, na, nb);
  }

  const stars = score >= 170 ? 3 : score >= 100 ? 2 : 1;
  const tgtName = dir === "AtoB" ? "B" : "A";

  return (
    <div className="relative overflow-hidden rounded-2xl p-3 sm:p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-100 via-orange-50 to-yellow-50" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden text-2xl" aria-hidden>
        <span className="absolute left-4 top-5 opacity-40">🍊</span>
        <span className="absolute right-8 top-8 opacity-40">🌳</span>
        <span className="absolute bottom-8 left-8 opacity-30">🧃</span>
        <span className="absolute right-4 top-24 opacity-30">☀️</span>
      </div>

      <div className="relative space-y-3">
        {/* โหมด + ปิดเสียง */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex rounded-xl border-2 border-slate-200 bg-white p-1">
            <button onClick={() => { setMode("lab"); resetLevels(a, b); }} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "lab" ? "bg-orange-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <FlaskConical size={15} /> โหมดครู
            </button>
            <button onClick={startMissions} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "mission" ? "bg-amber-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <Target size={15} /> โหมดทายก่อนเท
            </button>
          </div>
          <button onClick={() => setMuted((m) => !m)} className="grid h-9 w-9 place-items-center rounded-xl border-2 border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50" title={muted ? "เปิดเสียง" : "ปิดเสียง"}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {mode === "mission" && gameOver ? (
          <div className="space-y-4 rounded-2xl border-2 border-amber-300 bg-white/90 p-6 text-center">
            <div className="text-5xl">🍊🏆</div>
            <h3 className="text-xl font-extrabold text-slate-800 sm:text-2xl">จบภารกิจนักคั้นน้ำส้ม!</h3>
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
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
                  <span className="text-sm font-extrabold text-orange-700">🧑‍🏫 ตั้งโจทย์:</span>
                  <NumPicker label="โหล A" value={a} max={den - 1} onChange={(v) => setupProblem(den, v, b)} color="text-emerald-600" />
                  <span className="text-xl font-black text-slate-400">+</span>
                  <NumPicker label="โหล B" value={b} max={den - 1} onChange={(v) => setupProblem(den, a, v)} color="text-sky-600" />
                  <span className="mx-1 text-slate-300">|</span>
                  <span className="text-xs font-extrabold text-slate-500">ส่วน (ขีดโหล)</span>
                  {DEN_OPTIONS.map((d) => (
                    <button key={d} onClick={() => setupProblem(d, Math.min(a, d - 1), Math.min(b, d - 1))} className={cn("h-7 w-7 rounded-lg border-2 text-sm font-extrabold transition", den === d ? "border-orange-500 bg-orange-100 text-orange-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>{d}</button>
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {/* เลือกทิศเท */}
                  <button onClick={() => changeDir(dir === "AtoB" ? "BtoA" : "AtoB")} className="flex items-center gap-1.5 rounded-lg border-2 border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700 transition hover:bg-emerald-100">
                    <ArrowLeftRight size={14} /> เท: {dir === "AtoB" ? "A → B" : "B → A"}
                  </button>
                  <span className="mx-1 text-slate-300">|</span>
                  <span className="text-xs font-extrabold text-slate-500">⏱️ เวลาเท:</span>
                  {FILL_PRESETS.map((s) => (
                    <button key={s} onClick={() => setFillSecs(s)} className={cn("rounded-lg border-2 px-2 py-0.5 text-xs font-extrabold transition", fillSecs === s ? "border-amber-500 bg-amber-100 text-amber-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>{s}วิ</button>
                  ))}
                  <input type="range" min={1} max={60} value={fillSecs} onChange={(e) => setFillSecs(+e.target.value)} className="w-24 accent-amber-600" />
                  <span className="w-9 text-xs font-extrabold text-amber-700">{fillSecs}วิ</span>
                  <button onClick={() => setReveal((v) => !v)} className={cn("flex items-center gap-1 rounded-lg border-2 px-2 py-1 text-xs font-extrabold transition", reveal ? "border-violet-400 bg-violet-100 text-violet-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
                    {reveal ? <EyeOff size={13} /> : <Eye size={13} />} เฉลย
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 rounded-2xl bg-white/90 px-4 py-2 ring-1 ring-amber-200">
                <span className="text-base font-extrabold text-amber-700">🎯 ข้อ {round}/{MISSIONS_TOTAL}</span>
                <span className="text-base font-extrabold text-orange-700">🏅 {score}</span>
                <span className="text-xs font-extrabold text-slate-500">ทายผลก่อน แล้วเทพิสูจน์!</span>
              </div>
            )}

            {/* สมการใหญ่ */}
            <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-orange-200 bg-white/95 px-5 py-2.5 shadow-sm">
              <StackedFraction numerator={a} denominator={den} className="text-3xl sm:text-4xl" toneClassName="text-emerald-600" />
              <span className="text-3xl font-black text-slate-400">+</span>
              <StackedFraction numerator={b} denominator={den} className="text-3xl sm:text-4xl" toneClassName="text-sky-600" />
              <span className="text-3xl font-black text-slate-400">=</span>
              {combined || (mode === "lab" && reveal) ? (
                <span className="flex items-center gap-2">
                  <StackedFraction numerator={sum} denominator={den} className="text-3xl sm:text-4xl" toneClassName={combined ? "text-orange-600" : "text-violet-500"} />
                  {overflow && combined && (
                    <>
                      <span className="text-xl font-black text-slate-400">=</span>
                      <span className="inline-flex items-center gap-1 text-2xl font-black text-rose-600 sm:text-3xl">
                        1<StackedFraction numerator={sum - den} denominator={den} className="text-xl sm:text-2xl" toneClassName="text-rose-600" />
                      </span>
                    </>
                  )}
                </span>
              ) : (
                <span className="grid h-12 w-12 place-items-center rounded-xl border-[3px] border-dashed border-orange-300 text-2xl font-black text-orange-400">?</span>
              )}
            </div>

            {/* ฉากโหล */}
            <div className="rounded-2xl border-2 border-orange-200 bg-gradient-to-b from-sky-100/70 to-amber-50/70 p-2">
              <JuiceScene den={den} jarA={jarA} jarB={jarB} dir={dir} pouring={pouring} dur={dur} />
            </div>

            {/* คำอธิบายผล */}
            {combined && (
              <p className="text-center text-sm font-extrabold text-slate-600">
                {overflow
                  ? <span className="inline-flex flex-wrap items-center justify-center gap-1">โหล {tgtName} เต็ม 🈵 แล้วยังเหลืออีก <Frac n={sum - den} d={den} tone="text-rose-600" /> → รวม = <span className="inline-flex items-center gap-1 text-rose-600"><b>1</b> กับ <Frac n={sum - den} d={den} tone="text-rose-600" /></span> (เกิน 1 โหล!)</span>
                  : <span className="inline-flex flex-wrap items-center justify-center gap-1">น้ำส้มรวมกันที่ขีด <Frac n={sum} d={den} tone="text-orange-600" /> พอดี — ตัวส่วนไม่เปลี่ยน (ขีดโหลเท่าเดิม) เอาแค่ตัวเศษมาบวกกัน!</span>}
              </p>
            )}

            {/* โหมดทายก่อนเท */}
            {mode === "mission" && atStart && !pouring && (
              <div className="space-y-2 rounded-2xl border-2 border-pink-200 bg-white/90 p-3">
                <p className="text-center text-sm font-extrabold text-slate-600">🤔 ทายก่อน: เทรวมแล้วน้ำส้มจะถึงขีดไหน?</p>
                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => setGuess((g) => Math.max(0, g - 1))} className="h-9 w-9 rounded-lg border-2 border-slate-200 bg-white text-lg font-extrabold text-slate-600 active:scale-95">−</button>
                  <span className="inline-flex flex-col items-center rounded-xl border-2 border-pink-300 bg-white px-4 py-1">
                    <span className="text-2xl font-extrabold text-pink-600">{guess}</span>
                    <span className="h-[3px] w-8 rounded bg-pink-600" />
                    <span className="text-2xl font-extrabold text-slate-400">{den}</span>
                  </span>
                  <button onClick={() => setGuess((g) => Math.min(den * 2, g + 1))} className="h-9 w-9 rounded-lg border-2 border-slate-200 bg-white text-lg font-extrabold text-slate-600 active:scale-95">+</button>
                  <button onClick={() => { if (guess > 0) pourParts(den, true); }} disabled={guess === 0} className="ml-3 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 px-6 py-2.5 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98] disabled:opacity-50">
                    🫗 เทพิสูจน์!
                  </button>
                </div>
              </div>
            )}

            {/* ผลทาย */}
            {mode === "mission" && checked !== null && (
              <div className={cn("rounded-2xl border-2 p-3 text-center", checked ? "border-emerald-300 bg-emerald-50" : "border-rose-300 bg-rose-50")}>
                <p className={cn("flex flex-wrap items-center justify-center gap-1 text-base font-extrabold", checked ? "text-emerald-700" : "text-rose-600")}>
                  {checked ? <>🎉 ทายถูก! <Frac n={a} d={den} /> + <Frac n={b} d={den} /> = <Frac n={sum} d={den} /></> : <>ทาย <Frac n={guess} d={den} /> แต่รวมจริงได้ <Frac n={sum} d={den} /> — ลองข้อต่อไป!</>}
                </p>
                <button onClick={nextMission} className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 px-6 py-2 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                  {round >= MISSIONS_TOTAL ? "🏁 ดูสรุปผล" : <>ข้อต่อไป <ArrowRight size={16} /></>}
                </button>
              </div>
            )}

            {/* ปุ่มควบคุมการเท (โหมดครู) */}
            {mode === "lab" && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                {movable > 0 ? (
                  <>
                    <button onClick={() => pourParts(den)} disabled={pouring} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-2.5 text-base font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98] disabled:opacity-50">
                      🫗 เททั้งหมด
                    </button>
                    <span className="mx-1 text-slate-300">|</span>
                    <span className="text-xs font-extrabold text-slate-500">เททีละ</span>
                    <button onClick={() => setPourN((n) => Math.max(1, n - 1))} className="h-8 w-8 rounded-lg border-2 border-slate-200 bg-white text-base font-extrabold text-slate-600 active:scale-95">−</button>
                    <span className="w-6 text-center text-lg font-extrabold text-orange-700">{Math.min(pourN, movable)}</span>
                    <button onClick={() => setPourN((n) => Math.min(movable, n + 1))} className="h-8 w-8 rounded-lg border-2 border-slate-200 bg-white text-base font-extrabold text-slate-600 active:scale-95">+</button>
                    <span className="text-xs font-extrabold text-slate-500">ส่วน</span>
                    <button onClick={() => pourParts(pourN)} disabled={pouring} className="inline-flex items-center gap-1.5 rounded-xl border-b-4 border-emerald-700 bg-gradient-to-b from-emerald-500 to-emerald-600 px-4 py-2 text-sm font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.97] active:border-b-2 disabled:opacity-50">
                      ▶ เท
                    </button>
                    {!atStart && (
                      <button onClick={() => resetLevels(a, b)} disabled={pouring} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-3 py-1.5 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50 disabled:opacity-50">
                        <RotateCcw size={14} /> เริ่มใหม่
                      </button>
                    )}
                  </>
                ) : (
                  <button onClick={() => resetLevels(a, b)} disabled={pouring} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-5 py-2 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50 disabled:opacity-50">
                    <RotateCcw size={15} /> เทใหม่อีกครั้ง
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
