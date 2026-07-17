"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Volume2, VolumeX, FlaskConical, Target, Eye, EyeOff, ChefHat, ArrowRight } from "lucide-react";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { Frac } from "@/components/lessons/Frac";
import { cn } from "@/lib/cn";
import { randInt } from "@/lib/randomFraction";

/* ── ค่าคงที่ ── */

type Order = { num: number; den: number };
const DEN_OPTIONS = [2, 3, 4, 5, 6];
const MISSIONS_TOTAL = 8;
const CUSTOMERS = ["🐰", "🐱", "🐼", "🦊", "🐨", "🐸", "🐧", "🐹"];
const TOPPINGS = ["🍅", "🫑", "🍄", "🧀"];

function pickDen(level: 1 | 2 | 3): number {
  return DEN_OPTIONS[level === 1 ? randInt(0, 1) : level === 2 ? randInt(0, 3) : randInt(0, DEN_OPTIONS.length - 1)];
}

function randomOrder(level: 1 | 2 | 3): Order {
  const den = pickDen(level);
  // เศษเกินแท้ ๆ: num > den, ให้มีเศษเหลือด้วย (ส่วนใหญ่)
  const wholes = randInt(1, level === 1 ? 2 : 3);
  const rem = randInt(level === 1 ? 1 : 0, den - 1);
  const num = wholes * den + rem;
  return { num: Math.max(den + 1, num), den };
}

/* ── โจทย์โหมดเปิดร้าน (สลับ A: เลือกจานถูก / B: เลือกขนาดชิ้น) ── */

type Plating = { whole: number; rem: number; den: number };
type Challenge =
  | { kind: "pick"; order: Order; options: Plating[]; answer: number }
  | { kind: "size"; mixed: { whole: number; num: number; den: number } };

const platingValue = (p: Plating) => p.whole * p.den + p.rem;

function genChallenge(round: number, level: 1 | 2 | 3): Challenge {
  // ต้นเกมเน้น A, ตั้งแต่ข้อ 4 แทรก B สลับ
  const useSize = round >= 4 && round % 2 === 0;
  if (useSize) {
    const den = pickDen(level);
    const whole = randInt(1, level === 1 ? 2 : 3);
    const num = randInt(1, den - 1);
    return { kind: "size", mixed: { whole, num, den } };
  }
  let order = randomOrder(level);
  if (order.num % order.den === 0) order = { ...order, num: order.num + 1 };
  const den = order.den;
  const W = Math.floor(order.num / den);
  const R = order.num % den;
  const correct: Plating = { whole: W, rem: R, den };
  const cands: Plating[] = [
    { whole: W + 1, rem: R, den },
    { whole: W, rem: R + 1 < den ? R + 1 : R - 1, den },
    { whole: Math.max(0, W - 1), rem: R, den },
    { whole: W, rem: R >= 1 ? R - 1 : R + 1, den },
    { whole: W + 1, rem: 0, den },
  ];
  const opts: Plating[] = [correct];
  for (const c of cands) {
    if (opts.length >= 4) break;
    if (c.rem < 0 || c.rem >= den || c.whole < 0) continue;
    if (opts.some((o) => platingValue(o) === platingValue(c))) continue;
    opts.push(c);
  }
  for (let i = opts.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [opts[i], opts[j]] = [opts[j], opts[i]];
  }
  return { kind: "pick", order, options: opts, answer: opts.findIndex((o) => platingValue(o) === order.num) };
}

/* ── เสียง ── */

type SoundKind = "pack" | "close" | "correct" | "wrong" | "bell" | "star" | "start";

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
  function play(kind: SoundKind) {
    switch (kind) {
      case "pack": return tones([620], 0.01, 0.06, "square", 0.06);
      case "close": return tones([440, 660], 0.06, 0.12, "triangle", 0.12);
      case "correct": return tones([660, 990, 1319], 0.06, 0.1, "triangle", 0.14);
      case "wrong": return tones([220, 165], 0.11, 0.18, "sawtooth", 0.09);
      case "bell": return tones([1047, 1568], 0.08, 0.18, "sine", 0.12);
      case "star": return tones([1047, 1319, 1568, 2093], 0.07, 0.14, "triangle", 0.14);
      case "start": return tones([523, 659, 784], 0.07, 0.12, "triangle", 0.14);
    }
  }
  return { play, ensure };
}

/* ── เพลงร้านอาหาร (ชิปทูน ไม่ใช้ไฟล์) ── */

const PZ_LEAD = [72, 0, 71, 72, 74, 72, 71, 69, 67, 0, 69, 71, 72, 0, 0, 0, 74, 0, 72, 74, 76, 74, 72, 71, 69, 71, 72, 74, 72, 0, 0, 0];
const PZ_BASS = [48, 55, 52, 55, 53, 60, 57, 60, 41, 48, 45, 48, 43, 50, 47, 50];

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
      const m = PZ_LEAD[s];
      if (m) note(m, 0.16, "square", 0.026);
      if (s % 2 === 0) {
        const b = PZ_BASS[s / 2];
        if (b) note(b, 0.28, "triangle", 0.05);
      }
    }, 200);
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

/* ── รูปพิซซ่า (แบ่ง den ชิ้น เติม filled ชิ้น) ── */

function wedgePath(cx: number, cy: number, r: number, a0: number, a1: number) {
  const p = (a: number) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  return `M${cx},${cy} L${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 0 1 ${x1.toFixed(2)},${y1.toFixed(2)} Z`;
}

/* หน้าพิซซ่าบนชิ้น (เปปเปอโรนี + ผัก) — กระจายตามมุมชิ้น */
function SliceToppings({ cx, cy, r, i, den, seed }: { cx: number; cy: number; r: number; i: number; den: number; seed: number }) {
  const am = ((i + 0.5) / den) * Math.PI * 2 - Math.PI / 2;
  const spread = (Math.PI / den) * 0.55;
  const pts = [
    { rad: 0.5, off: -spread * 0.6, kind: 0 },
    { rad: 0.72, off: spread * 0.7, kind: (i + seed) % 3 },
    { rad: 0.38, off: spread * 0.5, kind: (i + seed + 1) % 3 },
  ];
  return (
    <g>
      {pts.map((p, k) => {
        const a = am + p.off;
        const px = cx + r * p.rad * Math.cos(a);
        const py = cy + r * p.rad * Math.sin(a);
        const pr = r * 0.13;
        if (p.kind === 0) return <g key={k}><circle cx={px} cy={py} r={pr} fill="#c0392b" stroke="#8e2a1e" strokeWidth={0.8} /><circle cx={px - pr * 0.3} cy={py - pr * 0.3} r={pr * 0.3} fill="#e05a48" /></g>;
        if (p.kind === 1) return <circle key={k} cx={px} cy={py} r={pr * 0.75} fill="#2f6d3b" stroke="#1e4a27" strokeWidth={0.8} />;
        return <g key={k}><circle cx={px} cy={py} r={pr * 0.7} fill="#3a2418" /><circle cx={px} cy={py} r={pr * 0.32} fill="#d9a566" /></g>;
      })}
    </g>
  );
}

function Pizza({ den, filled, r = 46, closed = false, topping = 0 }: { den: number; filled: number; r?: number; closed?: boolean; topping?: number }) {
  const pad = Math.round(r * 0.28);
  const cx = r + pad, cy = r + pad;
  const size = cx * 2;
  const angle = (i: number) => (i / den) * Math.PI * 2 - Math.PI / 2;
  const seed = topping;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label={closed ? "กล่องพิซซ่าเต็ม 1 ถาด" : `พิซซ่าแบ่ง ${den} ชิ้น เติม ${filled} ชิ้น`}>
      {/* กล่องกระดาษ */}
      <rect x={2} y={2} width={size - 4} height={size - 4} rx={r * 0.16} fill={closed ? "#c98a4e" : "#e6c79a"} stroke="#8a5a2b" strokeWidth={2.5} />
      <rect x={pad * 0.55} y={pad * 0.55} width={size - pad * 1.1} height={size - pad * 1.1} rx={r * 0.12} fill="none" stroke="#a8703a" strokeWidth={1.2} strokeDasharray="4 3" opacity={0.6} />
      {/* พื้นกล่อง (ถาดว่าง) */}
      <circle cx={cx} cy={cy} r={r + 2} fill="#d9b483" stroke="#a8703a" strokeWidth={1.5} />

      {/* ขอบแป้ง (crust) — วงนอกทั้งวง */}
      <circle cx={cx} cy={cy} r={r} fill="#E0A458" stroke="#9a5a1e" strokeWidth={2.5} />
      {/* หน้าชีสวงใน */}
      <circle cx={cx} cy={cy} r={r * 0.82} fill="#F4B740" />

      {/* ชิ้นที่เติมแล้ว: ชีสเข้ม + ซอส + หน้า / ชิ้นว่าง: โชว์พื้นกล่อง */}
      {Array.from({ length: den }, (_, i) => {
        const a0 = angle(i), a1 = angle(i + 1);
        const on = i < filled;
        return (
          <path
            key={i}
            d={wedgePath(cx, cy, r * 0.82, a0, a1)}
            fill={on ? "#F6C85A" : "#d9b483"}
            stroke="none"
          />
        );
      })}
      {/* ขอบแป้งชิ้นที่เติม (ให้เห็นขอบหนา) */}
      {Array.from({ length: den }, (_, i) => {
        if (i >= filled) return null;
        const a0 = angle(i), a1 = angle(i + 1);
        return <path key={i} d={wedgePath(cx, cy, r, a0, a1)} fill="none" stroke="#c47b2a" strokeWidth={r * 0.14} opacity={0.35} />;
      })}
      {/* หน้าพิซซ่าบนชิ้นที่เติม */}
      {Array.from({ length: den }, (_, i) => (i < filled ? <SliceToppings key={i} cx={cx} cy={cy} r={r * 0.82} i={i} den={den} seed={seed} /> : null))}

      {/* เส้นแบ่งชิ้น — วาดทุกชิ้นเสมอ (เห็นในกล่องด้วย) */}
      {Array.from({ length: den }, (_, i) => {
        const a = angle(i);
        return <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)} stroke="#9a5a1e" strokeWidth={1.8} strokeDasharray="3 2" opacity={0.8} />;
      })}
      {/* ขอบแป้งวงนอกทับอีกชั้นให้คม */}
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#9a5a1e" strokeWidth={2.5} />

      {/* กล่องปิด = ป้ายเช็คมุม */}
      {closed && (
        <g>
          <circle cx={size - pad * 0.9} cy={pad * 0.9} r={r * 0.24} fill="#22c55e" stroke="#15803d" strokeWidth={1.5} />
          <text x={size - pad * 0.9} y={pad * 0.9 + r * 0.1} fontSize={r * 0.3} textAnchor="middle" fill="#fff">✓</text>
        </g>
      )}
    </svg>
  );
}

/* ── จานที่จัดเสร็จ (สำหรับตัวเลือกโหมด A) ── */

function PlatingView({ p, topping, r = 22 }: { p: Plating; topping: number; r?: number }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1">
      {Array.from({ length: p.whole }, (_, i) => <Pizza key={i} den={p.den} filled={p.den} closed r={r} />)}
      {p.rem > 0 && <Pizza den={p.den} filled={p.rem} r={r} topping={topping} />}
      {p.whole === 0 && p.rem === 0 && <span className="px-3 py-4 text-xs font-bold text-slate-400">(ไม่มีพิซซ่า)</span>}
    </div>
  );
}

/* ── ช่องกรอกจำนวนคละ ── */

function MixedInput({ whole, num, den, onWhole, onNum, disabled }: { whole: number; num: number; den: number; onWhole: (d: number) => void; onNum: (d: number) => void; disabled: boolean }) {
  const box = "grid place-items-center rounded-xl border-2 border-pink-300 bg-white text-3xl font-extrabold text-pink-700";
  const btn = "h-7 w-7 rounded-lg border-2 border-slate-200 bg-white text-base font-extrabold text-slate-600 transition hover:bg-slate-50 active:scale-95 disabled:opacity-40";
  return (
    <div className="flex items-center justify-center gap-3">
      {/* จำนวนเต็ม */}
      <div className="flex flex-col items-center gap-1">
        <button onClick={() => onWhole(1)} disabled={disabled} className={btn}>+</button>
        <div className={cn(box, "h-16 w-14")}>{whole}</div>
        <button onClick={() => onWhole(-1)} disabled={disabled} className={btn}>−</button>
        <span className="text-[10px] font-extrabold text-slate-400">กล่องเต็ม</span>
      </div>
      {/* เศษส่วน */}
      <div className="flex flex-col items-center gap-1">
        <button onClick={() => onNum(1)} disabled={disabled} className={btn}>+</button>
        <div className={cn(box, "h-11 w-14 text-2xl")}>{num}</div>
        <div className="h-[3px] w-12 rounded bg-pink-700" />
        <div className={cn(box, "h-11 w-14 text-2xl border-slate-200 text-slate-400")}>{den}</div>
        <button onClick={() => onNum(-1)} disabled={disabled} className={btn}>−</button>
        <span className="text-[10px] font-extrabold text-slate-400">เศษเหลือ / ช่อง</span>
      </div>
    </div>
  );
}

/* ── เกมหลัก ── */

type Phase = "pack" | "answer" | "done";

export function MixedPizzaGame() {
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

  const [level, setLevel] = useState<1 | 2 | 3>(1);
  const [reveal, setReveal] = useState(false);
  const [order, setOrder] = useState<Order>({ num: 7, den: 3 });
  const [packed, setPacked] = useState(0);
  const [phase, setPhase] = useState<Phase>("pack");
  const [ansWhole, setAnsWhole] = useState(0);
  const [ansNum, setAnsNum] = useState(0);
  const [checked, setChecked] = useState<null | boolean>(null);
  const [custIdx, setCustIdx] = useState(0);
  const timeoutsRef = useRef<number[]>([]);
  useEffect(() => () => timeoutsRef.current.forEach((t) => window.clearTimeout(t)), []);

  /* ภารกิจ (โหมดเปิดร้าน — A เลือกจานถูก / B เลือกขนาดชิ้น) */
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [firstTry, setFirstTry] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [pickSel, setPickSel] = useState<number | null>(null);
  const [sizeDen, setSizeDen] = useState<number | null>(null);
  const [sizeTotal, setSizeTotal] = useState(0);
  const [mResult, setMResult] = useState<null | boolean>(null);
  const [mDone, setMDone] = useState(false);

  const fullBoxes = Math.floor(packed / order.den);
  const curBox = packed % order.den;
  const loose = order.num - packed;
  const correctWhole = Math.floor(order.num / order.den);
  const correctNum = order.num % order.den;

  function resetOrder(o: Order) {
    setOrder(o);
    setPacked(0);
    setPhase("pack");
    setAnsWhole(0);
    setAnsNum(0);
    setChecked(null);
    setFirstTry(true);
    setCustIdx(randInt(0, CUSTOMERS.length - 1));
  }

  function packOne() {
    if (phase !== "pack" || loose <= 0) return;
    const np = packed + 1;
    setPacked(np);
    if (np % order.den === 0) play("close");
    else play("pack");
    if (np >= order.num) {
      timeoutsRef.current.push(window.setTimeout(() => setPhase("answer"), 350));
    }
  }

  function packAll() {
    if (phase !== "pack") return;
    setPacked(order.num);
    play("close");
    timeoutsRef.current.push(window.setTimeout(() => setPhase("answer"), 350));
  }

  function check() {
    if (phase !== "answer") return;
    const ok = ansWhole === correctWhole && ansNum === correctNum;
    setChecked(ok);
    if (ok) {
      play("correct");
      if (mode === "mission") setScore((s) => s + (firstTry ? 25 : 12));
      timeoutsRef.current.push(window.setTimeout(() => setPhase("done"), 500));
    } else {
      play("wrong");
      setFirstTry(false);
      timeoutsRef.current.push(window.setTimeout(() => setChecked(null), 900));
    }
  }

  /* ภารกิจ flow */
  function loadRound(r: number) {
    setChallenge(genChallenge(r, level));
    setPickSel(null);
    setSizeDen(null);
    setSizeTotal(0);
    setMResult(null);
    setMDone(false);
    setFirstTry(true);
    setCustIdx(randInt(0, CUSTOMERS.length - 1));
  }
  function startMissions() {
    ensure();
    play("start");
    setScore(0); setRound(1); setGameOver(false);
    loadRound(1);
    setMode("mission");
  }
  function nextCustomer() {
    // โหมดครูใช้ปุ่มนี้เพื่อสุ่มออเดอร์ใหม่
    if (mode === "lab") { play("bell"); resetOrder(randomOrder(level)); return; }
    if (round >= MISSIONS_TOTAL) { setGameOver(true); play("star"); return; }
    const nr = round + 1;
    setRound(nr);
    play("bell");
    loadRound(nr);
  }

  function scoreRight() {
    setScore((s) => s + (firstTry ? 25 : 12));
  }
  function pickPlating(idx: number) {
    if (!challenge || challenge.kind !== "pick" || mDone) return;
    setPickSel(idx);
    const ok = idx === challenge.answer;
    setMResult(ok);
    if (ok) {
      play("correct");
      scoreRight();
      timeoutsRef.current.push(window.setTimeout(() => setMDone(true), 550));
    } else {
      play("wrong");
      setFirstTry(false);
      timeoutsRef.current.push(window.setTimeout(() => { setMResult(null); setPickSel(null); }, 950));
    }
  }
  function checkSize() {
    if (!challenge || challenge.kind !== "size" || mDone) return;
    const { whole, num, den } = challenge.mixed;
    const total = whole * den + num;
    const ok = sizeDen === den && sizeTotal === total;
    setMResult(ok);
    if (ok) {
      play("correct");
      scoreRight();
      timeoutsRef.current.push(window.setTimeout(() => setMDone(true), 550));
    } else {
      play("wrong");
      setFirstTry(false);
      timeoutsRef.current.push(window.setTimeout(() => setMResult(null), 950));
    }
  }

  const stars = score >= 170 ? 3 : score >= 100 ? 2 : 1;

  return (
    <div className="relative overflow-hidden rounded-2xl p-3 sm:p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-50 via-orange-50 to-rose-50" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden text-xl" aria-hidden>
        <span className="absolute left-4 top-6 opacity-25">🍕</span>
        <span className="absolute right-6 top-10 opacity-25">🧑‍🍳</span>
        <span className="absolute bottom-8 right-10 opacity-20">🍴</span>
      </div>
      <style>{`
        @keyframes packPop { 0% { transform: scale(0.4); opacity: 0; } 60% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }
        .pack-pop { animation: packPop 0.3s ease-out; }
        @keyframes wiggle { 0%,100% { transform: rotate(0); } 30% { transform: rotate(-6deg); } 70% { transform: rotate(6deg); } }
        .wiggle { animation: wiggle 0.5s ease-in-out; }
      `}</style>

      <div className="relative space-y-3">
        {/* โหมด + ปิดเสียง */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex rounded-xl border-2 border-slate-200 bg-white p-1">
            <button onClick={() => { setMode("lab"); resetOrder(order); }} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "lab" ? "bg-orange-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <FlaskConical size={15} /> โหมดครู
            </button>
            <button onClick={startMissions} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "mission" ? "bg-rose-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <Target size={15} /> โหมดร้านเปิด
            </button>
          </div>
          <button onClick={() => setMuted((m) => !m)} className="grid h-9 w-9 place-items-center rounded-xl border-2 border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50" title={muted ? "เปิดเสียง" : "ปิดเสียง"}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {mode === "mission" && gameOver ? (
          <div className="space-y-4 rounded-2xl border-2 border-rose-300 bg-white/90 p-6 text-center">
            <div className="text-5xl">🍕🏆</div>
            <h3 className="text-xl font-extrabold text-slate-800 sm:text-2xl">ปิดร้านแล้ว! ขายหมดทุกออเดอร์</h3>
            <p className="text-2xl">{"⭐".repeat(stars)}{"☆".repeat(3 - stars)}</p>
            <p className="text-base font-extrabold text-rose-700">🏅 คะแนนรวม {score}</p>
            <button onClick={startMissions} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
              <Play size={18} /> เปิดร้านอีกรอบ
            </button>
          </div>
        ) : mode === "mission" && challenge ? (
          <div className="space-y-3">
            {/* สถานะภารกิจ */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 rounded-2xl bg-white/85 px-4 py-2 ring-1 ring-rose-200">
              <span className="text-base font-extrabold text-rose-700">🎯 ลูกค้าคนที่ {round}/{MISSIONS_TOTAL}</span>
              <span className="text-base font-extrabold text-orange-700">🏅 {score}</span>
              <span className={cn("rounded-full px-2 py-0.5 text-xs font-extrabold", challenge.kind === "pick" ? "bg-sky-100 text-sky-700" : "bg-violet-100 text-violet-700")}>
                {challenge.kind === "pick" ? "🍽️ เลือกจานที่ถูก" : "🔪 ตัดเองให้พอดี"}
              </span>
            </div>

            {mDone ? (
              <div className="space-y-3 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 text-center">
                <div className="text-4xl">🐻🍕🎉</div>
                <p className="text-lg font-extrabold text-emerald-700">เชฟหมี: &quot;ถูกต้อง! ส่งให้ลูกค้าได้เลย&quot;</p>
                {challenge.kind === "pick" ? (
                  <p className="flex flex-wrap items-center justify-center gap-2 text-base font-extrabold text-slate-700">
                    <StackedFraction numerator={challenge.order.num} denominator={challenge.order.den} className="text-xl" toneClassName="text-orange-700" />
                    <span className="text-slate-400">= ({challenge.order.num} ÷ {challenge.order.den}) =</span>
                    <span className="inline-flex items-center gap-1 text-2xl text-emerald-700">
                      {Math.floor(challenge.order.num / challenge.order.den)}
                      {challenge.order.num % challenge.order.den > 0 && <StackedFraction numerator={challenge.order.num % challenge.order.den} denominator={challenge.order.den} className="text-lg" toneClassName="text-emerald-700" />}
                    </span>
                  </p>
                ) : (
                  <p className="flex flex-wrap items-center justify-center gap-2 text-base font-extrabold text-slate-700">
                    <span className="inline-flex items-center gap-1 text-xl text-violet-700">
                      {challenge.mixed.whole}
                      <StackedFraction numerator={challenge.mixed.num} denominator={challenge.mixed.den} className="text-base" toneClassName="text-violet-700" />
                    </span>
                    <span className="text-slate-400">= ({challenge.mixed.whole}×{challenge.mixed.den}+{challenge.mixed.num}) =</span>
                    <StackedFraction numerator={challenge.mixed.whole * challenge.mixed.den + challenge.mixed.num} denominator={challenge.mixed.den} className="text-xl" toneClassName="text-emerald-700" />
                  </p>
                )}
                <button onClick={nextCustomer} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 px-6 py-2.5 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                  {round >= MISSIONS_TOTAL ? "🏁 ปิดร้าน ดูสรุป" : <>ลูกค้าคนต่อไป <ArrowRight size={16} /></>}
                </button>
              </div>
            ) : challenge.kind === "pick" ? (
              <>
                {/* ลูกค้าสั่งเป็นเศษเกิน */}
                <div className="flex items-center gap-3 rounded-2xl border-2 border-teal-200 bg-white/90 p-3">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-teal-100 text-3xl ring-2 ring-teal-300">{CUSTOMERS[custIdx]}</span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-1.5 text-sm font-extrabold text-slate-700">
                      &quot;ขอพิซซ่า <StackedFraction numerator={challenge.order.num} denominator={challenge.order.den} className="text-lg" toneClassName="text-orange-700" /> ถาด — จัดใส่กล่องแบบไหนถึงถูก?&quot;
                    </p>
                    <p className="mt-0.5 text-xs font-bold text-slate-500">แตะจานที่จัด <b>กล่องเต็มกับชิ้นที่เหลือ</b> ให้ครบพอดี (ถาดละ {challenge.order.den} ชิ้น)</p>
                  </div>
                </div>
                {/* ตัวเลือกจาน */}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {challenge.options.map((p, i) => {
                    const isAns = i === challenge.answer;
                    const chosen = pickSel === i;
                    return (
                      <button
                        key={i}
                        onClick={() => pickPlating(i)}
                        disabled={mResult === true}
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-2xl border-2 bg-white p-2 transition",
                          mResult === null ? "border-slate-200 hover:border-rose-400 hover:shadow-md active:scale-[0.98]" : isAns ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-300" : chosen ? "border-rose-400 bg-rose-50" : "border-slate-200 opacity-60",
                        )}
                      >
                        <PlatingView p={p} topping={custIdx % TOPPINGS.length} />
                        <span className="text-xs font-extrabold text-slate-500">{p.whole} กล่อง{p.rem > 0 ? ` + เหลือ ${p.rem}` : " (พอดี)"}</span>
                      </button>
                    );
                  })}
                </div>
                {mResult === false && <p className="text-center text-sm font-extrabold text-rose-600">❌ ยังไม่พอดี — ลองแปลง {challenge.order.num}/{challenge.order.den} เป็นจำนวนคละก่อนเลือก</p>}
              </>
            ) : (
              <>
                {/* โหมด B: ลูกค้าสั่งเป็นจำนวนคละ ให้เลือกขนาดชิ้น + จำนวนชิ้นรวม */}
                <div className="flex items-center gap-3 rounded-2xl border-2 border-teal-200 bg-white/90 p-3">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-teal-100 text-3xl ring-2 ring-teal-300">{CUSTOMERS[custIdx]}</span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-1.5 text-sm font-extrabold text-slate-700">
                      &quot;ขอพิซซ่า
                      <span className="inline-flex items-center gap-1 text-lg text-violet-700">
                        {challenge.mixed.whole}
                        <StackedFraction numerator={challenge.mixed.num} denominator={challenge.mixed.den} className="text-base" toneClassName="text-violet-700" />
                      </span>
                      ถาด — ตัดเป็นชิ้นเท่ากันหมดให้หน่อย&quot;
                    </p>
                    <p className="mt-0.5 text-xs font-bold text-slate-500">ต้องตัด<b>ถาดละกี่ชิ้น</b> และได้<b>ทั้งหมดกี่ชิ้น</b>?</p>
                  </div>
                </div>
                {/* ขั้น 1: เลือกมีด (ตัวส่วน) */}
                <div className="rounded-2xl border-2 border-violet-200 bg-white/90 p-3">
                  <p className="mb-2 text-center text-sm font-extrabold text-violet-700">🔪 ขั้น 1: เลือกมีด — ตัดถาดละกี่ชิ้น?</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {DEN_OPTIONS.map((d) => (
                      <button key={d} onClick={() => mResult === true ? null : setSizeDen(d)} className={cn("h-10 w-10 rounded-xl border-2 text-lg font-extrabold transition", sizeDen === d ? "border-violet-500 bg-violet-100 text-violet-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>{d}</button>
                    ))}
                  </div>
                </div>
                {/* ขั้น 2: จำนวนชิ้นรวม */}
                <div className="rounded-2xl border-2 border-pink-200 bg-white/90 p-3">
                  <p className="mb-2 text-center text-sm font-extrabold text-pink-700">🍕 ขั้น 2: ได้ทั้งหมดกี่ชิ้น?</p>
                  <div className="flex items-center justify-center gap-3">
                    <button onClick={() => setSizeTotal((t) => Math.max(0, t - 1))} disabled={mResult === true} className="h-9 w-9 rounded-lg border-2 border-slate-200 bg-white text-lg font-extrabold text-slate-600 disabled:opacity-40">−</button>
                    <span className="grid h-14 w-16 place-items-center rounded-xl border-2 border-pink-300 bg-white text-3xl font-extrabold text-pink-700">{sizeTotal}</span>
                    <button onClick={() => setSizeTotal((t) => Math.min(30, t + 1))} disabled={mResult === true} className="h-9 w-9 rounded-lg border-2 border-slate-200 bg-white text-lg font-extrabold text-slate-600 disabled:opacity-40">+</button>
                    <span className="text-sm font-extrabold text-slate-400">ชิ้น</span>
                  </div>
                </div>
                {mResult === false && <p className="text-center text-sm font-extrabold text-rose-600">❌ ยังไม่ใช่ — จำนวนชิ้นทั้งหมด = จำนวนเต็ม × ชิ้นต่อถาด + เศษ</p>}
                <div className="flex justify-center">
                  <button onClick={checkSize} disabled={sizeDen === null || mResult === true} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 px-8 py-2.5 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98] disabled:opacity-50">
                    <ChefHat size={18} /> เช็คกับเชฟหมี
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* แถบครู: ตั้งออเดอร์ */}
            <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-orange-200 bg-white/85 px-3 py-2">
              <span className="text-sm font-extrabold text-orange-700">🧑‍🏫 ตั้งออเดอร์:</span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => resetOrder({ ...order, num: Math.max(order.den + 1, order.num - 1) })} className="h-7 w-7 rounded-lg border-2 border-slate-200 bg-white font-extrabold text-slate-600">−</button>
                <StackedFraction numerator={order.num} denominator={order.den} className="text-2xl" toneClassName="text-orange-700" />
                <button onClick={() => resetOrder({ ...order, num: Math.min(order.den * 4, order.num + 1) })} className="h-7 w-7 rounded-lg border-2 border-slate-200 bg-white font-extrabold text-slate-600">+</button>
              </div>
              <span className="mx-1 text-slate-300">|</span>
              <span className="text-xs font-extrabold text-slate-500">ถาดละ</span>
              {DEN_OPTIONS.map((d) => (
                <button key={d} onClick={() => resetOrder({ num: Math.max(d + 1, Math.min(d * 4, order.num)), den: d })} className={cn("h-7 w-7 rounded-lg border-2 text-sm font-extrabold transition", order.den === d ? "border-orange-500 bg-orange-100 text-orange-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>{d}</button>
              ))}
              <button onClick={() => setReveal((v) => !v)} className={cn("ml-1 flex items-center gap-1 rounded-lg border-2 px-2 py-1 text-xs font-extrabold transition", reveal ? "border-violet-400 bg-violet-100 text-violet-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
                {reveal ? <EyeOff size={13} /> : <Eye size={13} />} เฉลย
              </button>
            </div>

            {/* ลูกค้า + ออเดอร์ */}
            <div className="flex items-center gap-3 rounded-2xl border-2 border-teal-200 bg-white/90 p-3">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-teal-100 text-3xl ring-2 ring-teal-300">{CUSTOMERS[custIdx]}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold text-slate-700">
                  &quot;ขอพิซซ่า <b className="text-orange-700">{order.num} ชิ้น</b> ตัดถาดละ <b className="text-orange-700">{order.den} ชิ้น</b> นะจ๊ะ&quot;
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs font-bold text-slate-500">
                  ใบสั่ง: <StackedFraction numerator={order.num} denominator={order.den} className="text-sm" toneClassName="text-slate-600" /> ถาด — จัดใส่กล่องให้หน่อย!
                </p>
              </div>
            </div>

            {/* พื้นที่เล่น */}
            {phase === "pack" && (
              <div className="space-y-3 rounded-2xl border-2 border-orange-200 bg-white/90 p-3">
                <p className="text-center text-sm font-extrabold text-slate-600">🍕 แตะชิ้นพิซซ่าเพื่อแพ็กลงกล่อง (กล่องเต็ม {order.den} ชิ้น = 1 ถาด)</p>

                {/* กล่องที่ปิดแล้ว + กล่องกำลังแพ็ก */}
                <div className="flex flex-wrap items-end justify-center gap-3">
                  {Array.from({ length: fullBoxes }, (_, i) => (
                    <div key={i} className="pack-pop flex flex-col items-center">
                      <Pizza den={order.den} filled={order.den} closed r={44} />
                      <span className="text-[11px] font-extrabold text-emerald-600">ถาดที่ {i + 1} ✔</span>
                    </div>
                  ))}
                  <div className="flex flex-col items-center">
                    <div className={cn(curBox > 0 && "wiggle")}>
                      <Pizza den={order.den} filled={curBox} r={56} topping={custIdx % TOPPINGS.length} />
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-orange-600">กำลังแพ็ก <Frac n={curBox} d={order.den} /></span>
                  </div>
                </div>

                {/* ถาดชิ้นที่เหลือ (แตะได้) */}
                {loose > 0 ? (
                  <div className="space-y-1.5">
                    <p className="text-center text-xs font-bold text-slate-400">เหลืออีก {loose} ชิ้น — แตะทีละชิ้น</p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {Array.from({ length: loose }, (_, i) => (
                        <button key={i} onClick={packOne} className="transition hover:-translate-y-1 active:scale-90" aria-label="แพ็กชิ้นพิซซ่า">
                          <svg viewBox="0 0 34 34" width={34} height={34}>
                            <path d={wedgePath(17, 30, 26, -Math.PI * 0.72, -Math.PI * 0.28)} fill="#F0997B" stroke="#993C1D" strokeWidth={1.6} />
                            <text x={17} y={20} fontSize={10} textAnchor="middle">{TOPPINGS[custIdx % TOPPINGS.length]}</text>
                          </svg>
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-center">
                      <button onClick={packAll} className="rounded-xl border-2 border-orange-300 bg-orange-50 px-4 py-1.5 text-sm font-extrabold text-orange-700 transition hover:bg-orange-100">⚡ แพ็กทั้งหมดเลย</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-sm font-extrabold text-emerald-600">✅ แพ็กครบแล้ว! ไปเขียนจำนวนคละกัน →</p>
                )}
              </div>
            )}

            {phase === "answer" && (
              <div className="space-y-3 rounded-2xl border-2 border-pink-200 bg-white/90 p-4">
                {/* สรุปภาพ */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {Array.from({ length: fullBoxes }, (_, i) => <Pizza key={i} den={order.den} filled={order.den} closed r={40} />)}
                  {correctNum > 0 && <Pizza den={order.den} filled={correctNum} r={48} topping={custIdx % TOPPINGS.length} />}
                </div>
                <p className="text-center text-sm font-extrabold text-slate-600">
                  ได้ <b className="text-emerald-600">{fullBoxes} กล่องเต็ม</b>{correctNum > 0 && <> + เหลือ <b className="text-orange-600">{correctNum} ชิ้น</b> (ไม่พอเต็มกล่อง)</>} → เขียนเป็นจำนวนคละ:
                </p>

                <MixedInput
                  whole={ansWhole} num={ansNum} den={order.den}
                  onWhole={(d) => setAnsWhole((w) => Math.max(0, Math.min(order.den * 4, w + d)))}
                  onNum={(d) => setAnsNum((n) => Math.max(0, Math.min(order.den - 1, n + d)))}
                  disabled={checked === true}
                />

                {reveal && mode === "lab" && (
                  <p className="flex flex-wrap items-center justify-center gap-1 text-center text-sm font-extrabold text-violet-600">
                    เฉลย: {order.num} ÷ {order.den} = {correctWhole} เศษ {correctNum} → {correctWhole}{correctNum > 0 && <Frac n={correctNum} d={order.den} />}
                  </p>
                )}

                {checked === false && <p className="text-center text-sm font-extrabold text-rose-600">❌ ยังไม่ตรง ลองนับกล่องเต็มกับชิ้นที่เหลืออีกที</p>}

                <div className="flex justify-center">
                  <button onClick={check} disabled={checked === true} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 px-8 py-2.5 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98] disabled:opacity-60">
                    <ChefHat size={18} /> เช็คกับเชฟหมี
                  </button>
                </div>
              </div>
            )}

            {phase === "done" && (
              <div className="space-y-3 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 text-center">
                <div className="text-4xl">🐻🍕🎉</div>
                <p className="text-lg font-extrabold text-emerald-700">เชฟหมี: &quot;เยี่ยม! ส่งให้ลูกค้าได้เลย&quot;</p>
                <p className="flex flex-wrap items-center justify-center gap-2 text-base font-extrabold text-slate-700">
                  <StackedFraction numerator={order.num} denominator={order.den} className="text-xl" toneClassName="text-orange-700" />
                  <span className="text-slate-400">=</span>
                  <span className="text-slate-500">({order.num} ÷ {order.den})</span>
                  <span className="text-slate-400">=</span>
                  <span className="inline-flex items-center gap-1 text-2xl text-emerald-700">
                    {correctWhole}
                    {correctNum > 0 && <StackedFraction numerator={correctNum} denominator={order.den} className="text-lg" toneClassName="text-emerald-700" />}
                  </span>
                </p>
                <div className="flex justify-center gap-2">
                  {mode === "mission" ? (
                    <button onClick={nextCustomer} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 px-6 py-2.5 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                      {round >= MISSIONS_TOTAL ? "🏁 ปิดร้าน ดูสรุป" : <>ลูกค้าคนต่อไป <ArrowRight size={16} /></>}
                    </button>
                  ) : (
                    <>
                      <button onClick={() => resetOrder(order)} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50">
                        <RotateCcw size={15} /> ทำออเดอร์นี้อีกครั้ง
                      </button>
                      <button onClick={nextCustomer} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-5 py-2 text-sm font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                        ออเดอร์ใหม่ <ArrowRight size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
