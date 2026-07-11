"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Volume2, VolumeX, FlaskConical, Target, Scissors, CheckCircle2, XCircle } from "lucide-react";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { cn } from "@/lib/cn";
import { randInt } from "@/lib/randomFraction";

/* ── ค่าคงที่ ── */

type Frac = { num: number; den: number };

const DEN_OPTIONS = [2, 3, 4, 5, 6];
const MULT_OPTIONS = [1, 2, 3, 4];
const MISSIONS_TOTAL = 8;

/* สีขอบแยกฝั่ง (ช็อกโกแลตสีน้ำตาลเดียวกันทั้งคู่ — ต่างกันแค่กรอบ) */
const SIDE = {
  left: { trim: "#059669", trimLight: "#6ee7b7", badge: "#047857", text: "text-emerald-700" },
  right: { trim: "#0284c7", trimLight: "#7dd3fc", badge: "#0369a1", text: "text-sky-700" },
};

/* ── คณิตศาสตร์ ── */

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
function simplify(num: number, den: number): Frac {
  const g = gcd(num, den) || 1;
  return { num: num / g, den: den / g };
}
const matches = (leftNum: number, leftDen: number, rightFilled: number, rightDen: number) => rightFilled * leftDen === leftNum * rightDen;

function randomFrac(): Frac {
  const den = DEN_OPTIONS[randInt(0, DEN_OPTIONS.length - 1)];
  return { num: randInt(1, den - 1), den };
}

/* ── เสียง ── */

type SoundKind = "cut" | "fill" | "unfill" | "prove" | "correct" | "wrong" | "star" | "start";

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
  function noiseClick(dur: number) {
    if (mutedRef.current) return;
    const ctx = ensure();
    if (!ctx) return;
    const bufSize = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.14, ctx.currentTime);
    src.connect(g).connect(ctx.destination);
    src.start();
  }
  function play(kind: SoundKind) {
    switch (kind) {
      case "cut": return noiseClick(0.09);
      case "fill": return tones([494], 0.01, 0.08, "square", 0.07);
      case "unfill": return tones([311], 0.01, 0.07, "square", 0.05);
      case "prove": return tones([392, 494, 587], 0.08, 0.14, "triangle", 0.12);
      case "correct": return tones([660, 990, 1319], 0.06, 0.1, "triangle", 0.14);
      case "wrong": return tones([220, 165], 0.11, 0.2, "sawtooth", 0.1);
      case "star": return tones([1047, 1319, 1568, 2093], 0.07, 0.14, "triangle", 0.14);
      case "start": return tones([523, 659, 784], 0.07, 0.12, "triangle", 0.14);
    }
  }
  return { play, ensure };
}

/* ── เพลงโรงงาน (ชิปทูนสนุก ๆ ไม่ใช้ไฟล์) ── */

const FAC_LEAD = [67, 71, 74, 71, 67, 64, 62, 64, 67, 67, 71, 74, 76, 74, 71, 67, 69, 72, 76, 72, 69, 67, 65, 67, 69, 71, 72, 71, 69, 67, 65, 62];
const FAC_BASS = [40, 47, 43, 47, 38, 45, 41, 41, 43, 50, 40, 47, 41, 48, 41, 41];

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
      const m = FAC_LEAD[s];
      if (m) note(m, 0.16, "square", 0.028);
      if (s % 2 === 0) {
        const b = FAC_BASS[s / 2];
        if (b) note(b, 0.28, "triangle", 0.05);
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

/* ── แท่งช็อกโกแลต 3 มิติ (กล่องทรงสี่เหลี่ยม + ร่องแบ่งก้อน) ── */

function ChocBar3D({ den, filled, side, interactive, onToggle, resultState }: {
  den: number; filled: boolean[]; side: "left" | "right"; interactive: boolean; onToggle?: (i: number) => void;
  resultState: "idle" | "correct" | "wrong";
}) {
  const s = SIDE[side];
  const L = 10, R = 290, T = 30, B = 110, DX = 16, DY = 10;
  const W = R - L;
  const cellW = W / den;
  const gid = `choc-${side}`;
  return (
    <svg viewBox="0 0 316 168" className="w-full" role="img" aria-label={`แท่งช็อกโกแลต ${side === "left" ? "ซ้าย" : "ขวา"} แบ่ง ${den} ส่วน`}>
      <defs>
        <linearGradient id={`${gid}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#92400e" />
          <stop offset="1" stopColor="#5c2c0c" />
        </linearGradient>
        <linearGradient id={`${gid}-top`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#a3673a" />
          <stop offset="1" stopColor="#7c4a24" />
        </linearGradient>
      </defs>
      <style>{`
        .choc-pop { animation: chocPop 0.25s ease-out; }
        @keyframes chocPop { 0% { transform: scale(0.7); } 60% { transform: scale(1.12); } 100% { transform: scale(1); } }
        .choc-shake { animation: chocShake 0.4s ease-in-out; }
        @keyframes chocShake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
      `}</style>

      {/* เงาใต้แท่ง */}
      <ellipse cx={(L + R + DX) / 2} cy={B + 16} rx={150} ry={6} fill="#00000012" />

      <g className={resultState === "wrong" ? "choc-shake" : undefined}>
        {/* ผิวบน + ด้านข้าง (มุมมองสามมิติ) */}
        <polygon points={`${L},${T} ${R},${T} ${R + DX},${T - DY} ${L + DX},${T - DY}`} fill={`url(#${gid}-top)`} stroke={s.trim} strokeWidth={2} />
        <polygon points={`${R},${T} ${R + DX},${T - DY} ${R + DX},${B - DY} ${R},${B}`} fill="#4a2510" stroke={s.trim} strokeWidth={2} />

        {/* หน้าแท่ง แบ่งเป็นก้อนตามตัวส่วน */}
        <rect x={L} y={T} width={W} height={B - T} fill="#fde8cc" stroke={s.trim} strokeWidth={3} rx={3} />
        {Array.from({ length: den }, (_, i) => {
          const x = L + i * cellW;
          const isFilled = filled[i];
          return (
            <g key={i} onClick={interactive && onToggle ? () => onToggle(i) : undefined} className={cn(interactive && "cursor-pointer", isFilled && "choc-pop")} style={{ transformOrigin: `${x + cellW / 2}px ${(T + B) / 2}px` }}>
              <rect x={x + 1.5} y={T + 1.5} width={cellW - 3} height={B - T - 3} fill={isFilled ? `url(#${gid}-fill)` : "#fde8cc"} stroke={isFilled ? "#3f1d08" : "#d9b98a"} strokeWidth={1.2} strokeDasharray={isFilled ? undefined : "3 2"} rx={2} />
              {isFilled && <ellipse cx={x + cellW * 0.32} cy={T + (B - T) * 0.28} rx={Math.max(3, cellW * 0.16)} ry={3} fill="#fff" opacity={0.28} />}
              {interactive && !isFilled && <text x={x + cellW / 2} y={(T + B) / 2 + 4} fontSize={Math.min(13, cellW * 0.4)} textAnchor="middle" fill="#c99a63" opacity={0.7}>+</text>}
            </g>
          );
        })}
        {/* เส้นแบ่งก้อน */}
        {Array.from({ length: den - 1 }, (_, i) => {
          const x = L + (i + 1) * cellW;
          return <line key={i} x1={x} y1={T} x2={x} y2={B} stroke="#3f1d08" strokeWidth={1} opacity={0.35} />;
        })}
      </g>

      {/* ผลลัพธ์การพิสูจน์ */}
      {resultState !== "idle" && (
        <g transform={`translate(${(L + R) / 2 + DX / 2}, ${T - DY - 14})`}>
          <circle r={13} fill={resultState === "correct" ? "#dcfce7" : "#fee2e2"} stroke={resultState === "correct" ? "#16a34a" : "#dc2626"} strokeWidth={2.5} />
        </g>
      )}
    </svg>
  );
}

/* ── แถบเทียบความยาว (เฉลย/พิสูจน์) ── */

function CompareStrip({ leftNum, leftDen, rightFilled, rightDen }: { leftNum: number; leftDen: number; rightFilled: number; rightDen: number }) {
  const leftPct = (leftNum / leftDen) * 100;
  const rightPct = (rightFilled / rightDen) * 100;
  return (
    <div className="mx-auto max-w-sm space-y-1.5">
      <div className="flex items-center gap-2">
        <span className="w-14 shrink-0 text-right text-xs font-extrabold text-emerald-700">ซ้าย</span>
        <div className="h-5 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${leftPct}%` }} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-14 shrink-0 text-right text-xs font-extrabold text-sky-700">ขวา</span>
        <div className="h-5 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-sky-500 transition-all duration-500" style={{ width: `${rightPct}%` }} />
        </div>
      </div>
    </div>
  );
}

/* ── ตัวเลือกเศษส่วน (มาตรฐานเดียวกับเกมอื่น: แถวบน=เศษ แถวล่าง=ส่วน ลบซ้าย บวกขวา) ── */

function FracPicker({ f, onChange }: { f: Frac; onChange: (f: Frac) => void }) {
  function step(part: "num" | "den", d: number) {
    if (part === "den") {
      const den = Math.max(2, Math.min(6, f.den + d));
      onChange({ den, num: Math.min(f.num, den - 1) });
    } else {
      onChange({ ...f, num: Math.max(1, Math.min(f.den - 1, f.num + d)) });
    }
  }
  const btn = "h-8 w-8 rounded-lg border-2 border-slate-200 bg-white text-base font-extrabold text-slate-600 transition hover:bg-slate-50 active:scale-95";
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center justify-center gap-2">
        <span className="w-8 text-right text-[10px] font-extrabold text-slate-400">เศษ</span>
        <button onClick={() => step("num", -1)} className={btn}>−</button>
        <span className="w-10 text-center text-3xl font-extrabold leading-none text-emerald-700">{f.num}</span>
        <button onClick={() => step("num", 1)} className={btn}>+</button>
        <span className="w-8" aria-hidden />
      </div>
      <div className="h-[3px] w-12 rounded bg-emerald-700" />
      <div className="flex items-center justify-center gap-2">
        <span className="w-8 text-right text-[10px] font-extrabold text-slate-400">ส่วน</span>
        <button onClick={() => step("den", -1)} className={btn}>−</button>
        <span className="w-10 text-center text-3xl font-extrabold leading-none text-emerald-700">{f.den}</span>
        <button onClick={() => step("den", 1)} className={btn}>+</button>
        <span className="w-8" aria-hidden />
      </div>
    </div>
  );
}

/* ── เกมหลัก ── */

export function FractionChocFactory() {
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

  const [leftFrac, setLeftFrac] = useState<Frac>({ num: 2, den: 3 });
  const [mult, setMult] = useState(2);
  const rightDen = leftFrac.den * mult;
  const [filled, setFilled] = useState<boolean[]>(() => Array(leftFrac.den * mult).fill(false));
  const [result, setResult] = useState<"idle" | "correct" | "wrong">("idle");
  const [proving, setProving] = useState(false);

  const leftFilled = Array.from({ length: leftFrac.den }, (_, i) => i < leftFrac.num);
  const filledCount = filled.filter(Boolean).length;
  const isMatch = matches(leftFrac.num, leftFrac.den, filledCount, rightDen);
  const simplifiedRight = simplify(filledCount || 1, rightDen);

  /* โหมดภารกิจ */
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [attempted, setAttempted] = useState(false);
  const [done, setDone] = useState(false);

  function resetRight(den: number) {
    setFilled(Array(den).fill(false));
    setResult("idle");
  }

  function changeLeft(f: Frac) {
    setLeftFrac(f);
    resetRight(f.den * mult);
  }
  function changeMult(m: number) {
    setMult(m);
    resetRight(leftFrac.den * m);
    play("cut");
  }
  function toggleCell(i: number) {
    if (proving) return;
    setFilled((arr) => {
      const next = [...arr];
      next[i] = !next[i];
      play(next[i] ? "fill" : "unfill");
      return next;
    });
    setResult("idle");
  }

  function prove() {
    if (proving) return;
    play("prove");
    setProving(true);
    window.setTimeout(() => {
      setProving(false);
      const ok = matches(leftFrac.num, leftFrac.den, filled.filter(Boolean).length, rightDen);
      setResult(ok ? "correct" : "wrong");
      play(ok ? "correct" : "wrong");
      if (mode === "mission") {
        setAttempted(true);
        if (ok) {
          const ns = streak + 1;
          setStreak(ns);
          setScore((sc) => sc + 10 + Math.min(15, (ns - 1) * 5));
          play(ns >= 3 ? "star" : "correct");
        } else {
          setStreak(0);
        }
      }
    }, 700);
  }

  function startMissions() {
    ensure();
    play("start");
    setScore(0); setStreak(0); setRound(1); setDone(false); setAttempted(false);
    const f = randomFrac();
    setLeftFrac(f);
    setMult(2);
    resetRight(f.den * 2);
    setMode("mission");
  }

  function nextRound() {
    if (round >= MISSIONS_TOTAL) { setDone(true); play("star"); return; }
    const n = round + 1;
    setRound(n);
    const f = randomFrac();
    setLeftFrac(f);
    setMult(2);
    resetRight(f.den * 2);
    setAttempted(false);
  }

  function retrySame() {
    setResult("idle");
    setAttempted(false);
  }

  return (
    <div className="relative overflow-hidden rounded-2xl p-3 sm:p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden text-xl" aria-hidden>
        <span className="absolute left-5 top-8 opacity-40">🍫</span>
        <span className="absolute right-8 top-16 opacity-30">🏭</span>
        <span className="absolute bottom-10 left-8 opacity-30">🍬</span>
        <span className="absolute bottom-14 right-6 opacity-40">✨</span>
      </div>

      <div className="relative space-y-3">
        {/* โหมด + ปิดเสียง */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex rounded-xl border-2 border-slate-200 bg-white p-1">
            <button onClick={() => setMode("lab")} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "lab" ? "bg-amber-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <FlaskConical size={15} /> โหมดครู
            </button>
            <button onClick={startMissions} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "mission" ? "bg-orange-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <Target size={15} /> โหมดภารกิจ
            </button>
          </div>
          <button onClick={() => setMuted((m) => !m)} className="grid h-9 w-9 place-items-center rounded-xl border-2 border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50" title={muted ? "เปิดเสียง" : "ปิดเสียง"}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {/* ═══ โหมดครู ═══ */}
        {mode === "lab" && (
          <div className="space-y-3">
            <div className="rounded-2xl bg-amber-50 px-4 py-2 text-center text-sm font-extrabold text-amber-700 ring-1 ring-amber-200">
              🧑‍🏫 ตั้งเศษส่วนแท่งซ้าย แล้วใช้เครื่องตัดแท่งขวาให้ได้ <u>ปริมาณเท่ากันแต่ชื่อต่างกัน</u> — กด &quot;พิสูจน์!&quot; เพื่อตรวจ
            </div>

            <div className="flex justify-center">
              <FracPicker f={leftFrac} onChange={changeLeft} />
            </div>

            {/* เครื่องตัด */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="flex items-center gap-1.5 text-sm font-extrabold text-slate-600"><Scissors size={15} /> เครื่องตัดแท่งขวา:</span>
              {MULT_OPTIONS.map((m) => (
                <button key={m} onClick={() => changeMult(m)} className={cn("rounded-lg border-2 px-3 py-1.5 text-sm font-extrabold transition", mult === m ? "border-sky-400 bg-sky-100 text-sky-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
                  ×{m}
                </button>
              ))}
              <span className="text-xs font-bold text-slate-400">({leftFrac.den} × {mult} = {rightDen} ก้อน)</span>
            </div>

            {/* แท่งช็อกโกแลตคู่ */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <p className="text-center text-sm font-extrabold text-emerald-700">แท่งซ้าย (ครูกำหนด)</p>
                <ChocBar3D den={leftFrac.den} filled={leftFilled} side="left" interactive={false} resultState="idle" />
                <p className="text-center text-xs font-bold text-slate-500">ระบายอยู่แล้ว {leftFrac.num}/{leftFrac.den} ก้อน</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-center text-sm font-extrabold text-sky-700">แท่งขวา (แตะเพื่อระบาย)</p>
                <ChocBar3D den={rightDen} filled={filled} side="right" interactive={!proving} onToggle={toggleCell} resultState={result} />
                <p className="text-center text-xs font-bold text-slate-500">ระบายแล้ว {filledCount}/{rightDen} ก้อน</p>
              </div>
            </div>

            {/* ปุ่มพิสูจน์ */}
            <div className="text-center">
              <button onClick={prove} disabled={proving} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98] disabled:opacity-60">
                {proving ? "⏳ กำลังพิสูจน์..." : "🔍 พิสูจน์!"}
              </button>
            </div>

            {/* ผลลัพธ์ */}
            {result !== "idle" && (
              <div className={cn("space-y-2 rounded-2xl border-2 p-3 text-center", result === "correct" ? "border-emerald-300 bg-emerald-50" : "border-rose-200 bg-rose-50")}>
                <p className={cn("flex items-center justify-center gap-2 text-lg font-extrabold", result === "correct" ? "text-emerald-700" : "text-rose-600")}>
                  {result === "correct" ? <><CheckCircle2 size={20} /> เท่ากันเป๊ะ! ✨</> : <><XCircle size={20} /> ยังไม่เท่ากัน ลองปรับดูใหม่</>}
                </p>
                {result === "correct" && (
                  <p className="flex flex-wrap items-center justify-center gap-2 text-base font-extrabold text-slate-700">
                    <StackedFraction numerator={leftFrac.num} denominator={leftFrac.den} className="text-xl" toneClassName="text-emerald-700" />
                    <span>×{mult}</span>
                    <span>=</span>
                    <StackedFraction numerator={filledCount} denominator={rightDen} className="text-xl" toneClassName="text-sky-700" />
                    {simplifiedRight.den !== rightDen && <span className="text-sm font-bold text-slate-400">(ย่อได้เป็น {simplifiedRight.num}/{simplifiedRight.den})</span>}
                  </p>
                )}
                <CompareStrip leftNum={leftFrac.num} leftDen={leftFrac.den} rightFilled={filledCount} rightDen={rightDen} />
              </div>
            )}
          </div>
        )}

        {/* ═══ โหมดภารกิจ ═══ */}
        {mode === "mission" && !done && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 rounded-2xl bg-white/85 px-4 py-2 ring-1 ring-orange-200">
              <span className="text-base font-extrabold text-orange-700">🎯 ข้อ {round}/{MISSIONS_TOTAL}</span>
              <span className="text-base font-extrabold text-amber-700">🏅 {score}</span>
              {streak >= 2 && <span className="text-base font-extrabold text-rose-600">🔥 x{streak}</span>}
            </div>

            <div className="mx-auto flex max-w-lg flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-orange-300 bg-white/90 px-4 py-3 text-center">
              <span className="text-2xl">🏭</span>
              <span className="text-base font-extrabold text-slate-700 sm:text-lg">ทำแท่งขวาให้เท่ากับแท่งซ้าย:</span>
              <StackedFraction numerator={leftFrac.num} denominator={leftFrac.den} className="text-2xl" toneClassName="text-emerald-700" />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="flex items-center gap-1.5 text-sm font-extrabold text-slate-600"><Scissors size={15} /> เครื่องตัด:</span>
              {MULT_OPTIONS.map((m) => (
                <button key={m} onClick={() => changeMult(m)} className={cn("rounded-lg border-2 px-3 py-1.5 text-sm font-extrabold transition", mult === m ? "border-sky-400 bg-sky-100 text-sky-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
                  ×{m}
                </button>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <p className="text-center text-sm font-extrabold text-emerald-700">แท่งซ้าย (โจทย์)</p>
                <ChocBar3D den={leftFrac.den} filled={leftFilled} side="left" interactive={false} resultState="idle" />
              </div>
              <div className="space-y-1.5">
                <p className="text-center text-sm font-extrabold text-sky-700">แท่งขวา (แตะเพื่อระบาย)</p>
                <ChocBar3D den={rightDen} filled={filled} side="right" interactive={!proving} onToggle={toggleCell} resultState={result} />
                <p className="text-center text-xs font-bold text-slate-500">ระบายแล้ว {filledCount}/{rightDen} ก้อน</p>
              </div>
            </div>

            {!attempted || result !== "correct" ? (
              <div className="space-y-2 text-center">
                <button onClick={prove} disabled={proving} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98] disabled:opacity-60">
                  {proving ? "⏳ กำลังพิสูจน์..." : "🔍 พิสูจน์!"}
                </button>
                {result === "wrong" && (
                  <div className="space-y-2">
                    <p className="flex items-center justify-center gap-2 text-base font-extrabold text-rose-600"><XCircle size={18} /> ยังไม่เท่ากัน ลองปรับก้อนที่ระบายดูใหม่</p>
                    <button onClick={retrySame} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-rose-300 bg-white px-5 py-2 text-sm font-extrabold text-rose-600 transition hover:bg-rose-50">
                      <RotateCcw size={15} /> ลองใหม่
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-3 text-center">
                <p className="flex items-center justify-center gap-2 text-lg font-extrabold text-emerald-700"><CheckCircle2 size={20} /> เท่ากันเป๊ะ! ✨</p>
                <CompareStrip leftNum={leftFrac.num} leftDen={leftFrac.den} rightFilled={filledCount} rightDen={rightDen} />
                <button onClick={nextRound} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-2.5 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                  {round >= MISSIONS_TOTAL ? "🏁 ดูสรุปผล" : "🍫 ข้อถัดไป"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══ สรุปผลภารกิจ ═══ */}
        {mode === "mission" && done && (
          <div className="space-y-4 rounded-2xl border-2 border-amber-300 bg-white/90 p-6 text-center">
            <div className="text-5xl">🍫🏆</div>
            <h3 className="text-xl font-extrabold text-slate-800 sm:text-2xl">จบภารกิจโรงงานช็อกโกแลต!</h3>
            <p className="text-base font-extrabold text-amber-700 sm:text-lg">🏅 คะแนนรวม {score}</p>
            <p className="text-sm font-bold text-slate-500">
              {score >= 110 ? "🌟🌟🌟 นายช่างโรงงานตัวจริง!" : score >= 60 ? "🌟🌟 เก่งมาก อีกนิดเดียวเพอร์เฟกต์!" : "🌟 ฝึกอีกนิด แล้วจะตัดช็อกโกแลตแม่นขึ้น!"}
            </p>
            <button onClick={startMissions} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
              <Play size={18} /> เล่นอีกครั้ง
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
