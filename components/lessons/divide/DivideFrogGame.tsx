"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Volume2, VolumeX, FlaskConical, Target, ArrowRight, Eye, EyeOff, Pencil } from "lucide-react";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { gcd } from "@/lib/fractionUtils";
import { cn } from "@/lib/cn";
import { randInt, shuffle } from "@/lib/randomFraction";

/* ── ค่าคงที่ ── */

const DEN_OPTIONS = [2, 3, 4, 6];      // ค.ร.น. ไม่เกิน 12 → เส้นจำนวนอ่านง่าย
const MISSIONS_TOTAL = 8;
const SS = { shapeRendering: "crispEdges" as const };
const lcm = (x: number, y: number) => (x * y) / gcd(x, y);

const FROGS = [
  { name: "เจ้าเขียว", body: "#22c55e", dark: "#15803d", belly: "#bbf7d0" },
  { name: "เจ้าฟ้า", body: "#38bdf8", dark: "#0369a1", belly: "#e0f2fe" },
  { name: "เจ้าส้ม", body: "#fb923c", dark: "#c2410c", belly: "#ffedd5" },
  { name: "เจ้าม่วง", body: "#a78bfa", dark: "#6d28d9", belly: "#ede9fe" },
];

/* ── เสียง ── */

type SoundKind = "hop" | "splash" | "correct" | "wrong" | "start" | "star";

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
      case "hop": return sweep(400, 900, 0.18, "sine", 0.07);
      case "splash": return tones([1200, 800], 0.04, 0.07, "triangle", 0.06);
      case "correct": return tones([660, 990, 1319], 0.06, 0.1, "triangle", 0.14);
      case "wrong": return tones([220, 165], 0.11, 0.18, "sawtooth", 0.09);
      case "start": return tones([523, 659, 784], 0.07, 0.12, "triangle", 0.14);
      case "star": return tones([1047, 1319, 1568, 2093], 0.07, 0.14, "triangle", 0.14);
    }
  }
  return { play, ensure };
}

/* ── เพลงบ่อน้ำสนุก (ชิปทูน ไม่ใช้ไฟล์) ── */

const FG_LEAD = [64, 0, 67, 0, 69, 67, 64, 0, 62, 0, 64, 0, 60, 0, 0, 0, 67, 0, 69, 71, 0, 69, 67, 0, 64, 67, 64, 62, 60, 0, 0, 0];
const FG_BASS = [40, 47, 40, 47, 43, 50, 43, 50, 45, 52, 45, 52, 40, 47, 47, 40];

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
      const m = FG_LEAD[s];
      if (m) note(m, 0.2, "square", 0.024);
      if (s % 2 === 0) {
        const b = FG_BASS[s / 2];
        if (b) note(b, 0.32, "triangle", 0.05);
      }
    }, 205);
  }
  function stop() {
    if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
  }
  useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);
  return { start, stop };
}

/* ── กบ ── */

function Frog({ f, happy }: { f: typeof FROGS[number]; happy: boolean }) {
  return (
    <g>
      {/* ขาหลัง */}
      <ellipse cx={-9} cy={2} rx={5} ry={3.5} fill={f.dark} />
      <ellipse cx={9} cy={2} rx={5} ry={3.5} fill={f.dark} />
      {/* ตัว */}
      <ellipse cx={0} cy={0} rx={13} ry={10} fill={f.body} stroke={f.dark} strokeWidth={1.6} />
      <ellipse cx={0} cy={3} rx={8} ry={5.5} fill={f.belly} opacity={0.9} />
      {/* ตา */}
      <circle cx={-5.5} cy={-9} r={4.5} fill={f.body} stroke={f.dark} strokeWidth={1.2} />
      <circle cx={5.5} cy={-9} r={4.5} fill={f.body} stroke={f.dark} strokeWidth={1.2} />
      <circle cx={-5.5} cy={-9.5} r={2.6} fill="#fff" />
      <circle cx={5.5} cy={-9.5} r={2.6} fill="#fff" />
      <circle cx={-5} cy={-9.5} r={1.4} fill="#1e293b" />
      <circle cx={6} cy={-9.5} r={1.4} fill="#1e293b" />
      {/* ปาก */}
      {happy
        ? <path d="M-5,1 Q0,6 5,1" stroke={f.dark} strokeWidth={1.4} fill="none" strokeLinecap="round" />
        : <path d="M-4,1.5 Q0,4 4,1.5" stroke={f.dark} strokeWidth={1.3} fill="none" strokeLinecap="round" />}
      {/* ขาหน้า */}
      <ellipse cx={-7} cy={8} rx={3.5} ry={2.2} fill={f.dark} />
      <ellipse cx={7} cy={8} rx={3.5} ry={2.2} fill={f.dark} />
    </g>
  );
}

/* ── ฉากเส้นจำนวน + กบ ── */

function PondScene({ a, b, c, d, L, hops, whole, rem, animating, frog }: {
  a: number; b: number; c: number; d: number; L: number; hops: number; whole: number; rem: number; animating: boolean; frog: typeof FROGS[number];
}) {
  const X0 = 46, X1 = 522, LW = X1 - X0, lineY = 158;
  const jump = c / d;                      // ขนาด 1 ก้าว (หน่วย)
  const targetVal = a / b;
  const toX = (v: number) => X0 + v * LW;
  const totalHops = whole + (rem > 0 ? 1 : 0);
  const landing = (i: number) => (i <= whole ? Math.min(i * jump, targetVal) : targetVal);
  const pos = landing(Math.min(hops, totalHops));

  return (
    <svg viewBox="0 0 560 210" className="w-full" role="img" aria-label="เส้นจำนวนกบกระโดด">
      <style>{`
        @keyframes fgHop { 0% { transform: translateY(0); } 45% { transform: translateY(-26px); } 100% { transform: translateY(0); } }
        .fg-hop { animation: fgHop 0.42s ease-in-out; }
      `}</style>

      {/* ท้องฟ้า/บ่อ */}
      <rect x={0} y={lineY + 14} width={560} height={44} fill="#bae6fd" opacity={0.5} />

      {/* เส้นจำนวน */}
      <line x1={X0} y1={lineY} x2={X1} y2={lineY} stroke="#334155" strokeWidth={3} />
      <polygon points={`${X1},${lineY} ${X1 - 8},${lineY - 4} ${X1 - 8},${lineY + 4}`} fill="#334155" />

      {/* ขีดตัวส่วนร่วม (ทุก 1/L) */}
      {Array.from({ length: L + 1 }, (_, k) => {
        const x = toX(k / L);
        const major = k === 0 || k === L;
        return (
          <g key={k}>
            <line x1={x} y1={lineY - (major ? 12 : 7)} x2={x} y2={lineY + (major ? 12 : 7)} stroke={major ? "#334155" : "#94a3b8"} strokeWidth={major ? 2.5 : 1.2} />
            {major && <text x={x} y={lineY + 27} fontSize={12} fontWeight={900} fill="#334155" textAnchor="middle">{k === 0 ? "0" : "1"}</text>}
          </g>
        );
      })}
      <text x={X1 - 4} y={lineY + 44} fontSize={10} fontWeight={800} fill="#64748b" textAnchor="end">ขีดละ 1/{L} (ตัวส่วนร่วม)</text>

      {/* ธงเป้าหมาย a/b */}
      <line x1={toX(targetVal)} y1={lineY - 12} x2={toX(targetVal)} y2={lineY - 54} stroke="#dc2626" strokeWidth={2.5} />
      <polygon points={`${toX(targetVal)},${lineY - 54} ${toX(targetVal) + 26},${lineY - 47} ${toX(targetVal)},${lineY - 40}`} fill="#dc2626" />
      <text x={toX(targetVal) + 2} y={lineY - 58} fontSize={12} fontWeight={900} fill="#dc2626" textAnchor="middle">{a}/{b}</text>

      {/* ใบบัวจุดลง */}
      {Array.from({ length: Math.min(hops, totalHops) + 1 }, (_, i) => {
        const x = toX(landing(i));
        return <ellipse key={i} cx={x} cy={lineY + 8} rx={11} ry={4} fill="#16a34a" opacity={0.5} />;
      })}

      {/* เส้นโค้งการกระโดดที่ทำไปแล้ว */}
      {Array.from({ length: Math.min(hops, totalHops) }, (_, i) => {
        const x1 = toX(landing(i)), x2 = toX(landing(i + 1));
        const partial = i === whole;   // ก้าวสุดท้ายไม่เต็มก้าว
        return (
          <g key={`arc${i}`}>
            <path d={`M ${x1} ${lineY - 4} Q ${(x1 + x2) / 2} ${lineY - 46} ${x2} ${lineY - 4}`} fill="none" stroke={partial ? "#f59e0b" : frog.dark} strokeWidth={2} strokeDasharray={partial ? "4 3" : "5 4"} opacity={0.75} />
            <text x={(x1 + x2) / 2} y={lineY - 30} fontSize={10} fontWeight={900} fill={partial ? "#b45309" : frog.dark} textAnchor="middle">{partial ? `${rem}/${c * (L / d)}` : `${c}/${d}`}</text>
          </g>
        );
      })}

      {/* กบ */}
      <g style={{ transform: `translate(${toX(pos)}px, ${lineY - 6}px)`, transition: "transform 0.42s ease-in-out" }}>
        <g className={animating ? "fg-hop" : undefined}>
          <Frog f={frog} happy={hops >= totalHops && totalHops > 0} />
        </g>
      </g>

      {/* ป้ายขนาดก้าว */}
      <g transform={`translate(${X0}, 22)`}>
        <rect x={0} y={0} width={132} height={22} rx={7} fill="#fff" stroke={frog.dark} strokeWidth={1.6} />
        <text x={66} y={15} fontSize={11} fontWeight={900} fill={frog.dark} textAnchor="middle">🐸 ก้าวละ {c}/{d} = {c * (L / d)}/{L}</text>
      </g>
    </svg>
  );
}

/* ── ตัวเลือกเศษส่วน ── */

function FracPicker({ label, num, den, maxNum, setNum, setDen, tone }: { label: string; num: number; den: number; maxNum: number; setNum: (v: number) => void; setDen: (v: number) => void; tone: string }) {
  const btn = "h-7 w-7 rounded-lg border-2 border-slate-200 bg-white text-base font-extrabold text-slate-600 hover:bg-slate-50 active:scale-95 disabled:opacity-40";
  return (
    <div className="flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-2 py-1">
      <span className="text-xs font-extrabold text-slate-500">{label}</span>
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-1">
          <button onClick={() => setNum(Math.max(1, num - 1))} disabled={num <= 1} className={btn}>−</button>
          <span className={cn("w-5 text-center text-lg font-extrabold", tone)}>{num}</span>
          <button onClick={() => setNum(Math.min(maxNum, num + 1))} disabled={num >= maxNum} className={btn}>+</button>
        </div>
        <span className="my-0.5 h-[2px] w-full rounded bg-slate-400" />
        <div className="flex items-center gap-1">
          {DEN_OPTIONS.map((dd) => (
            <button key={dd} onClick={() => setDen(dd)} className={cn("h-6 w-6 rounded-md border text-sm font-extrabold transition", den === dd ? "border-violet-500 bg-violet-100 text-violet-700" : "border-slate-200 bg-white text-slate-500")}>{dd}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── เกมหลัก ── */

export function DivideFrogGame() {
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

  /* โจทย์: a/b ÷ c/d */
  const [a, setA] = useState(2);
  const [b, setB] = useState(3);
  const [c, setC] = useState(1);
  const [d, setD] = useState(4);
  const [reveal, setReveal] = useState(false);

  /* กบ */
  const [frogIdx, setFrogIdx] = useState(0);
  const [frogNames, setFrogNames] = useState<string[]>(() => FROGS.map((f) => f.name));
  const [showNames, setShowNames] = useState(false);

  /* สถานะ */
  const [hops, setHops] = useState(0);
  const [animating, setAnimating] = useState(false);
  const timeoutsRef = useRef<number[]>([]);
  useEffect(() => () => timeoutsRef.current.forEach((t) => window.clearTimeout(t)), []);

  /* ภารกิจ */
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [gNum, setGNum] = useState(0);
  const [gDen, setGDen] = useState(0);
  const [firstTry, setFirstTry] = useState(true);
  const [checked, setChecked] = useState<null | boolean>(null);
  const [gameOver, setGameOver] = useState(false);

  const L = lcm(b, d);
  const A = (a * L) / b;          // ตัวเศษบนตัวส่วนร่วม
  const C = (c * L) / d;          // ก้าวละ C ขีด
  const qNum = a * d, qDen = b * c;                 // a/b × d/c
  const qg = gcd(qNum, qDen);
  const rqNum = qNum / qg, rqDen = qDen / qg;       // ผลลัพธ์ย่อแล้ว
  const whole = Math.floor(A / C);
  const rem = A % C;                                 // เศษที่เหลือ (ขีด) จากก้าวสุดท้าย
  const rg = rem > 0 ? gcd(rem, C) : 1;
  const totalHops = whole + (rem > 0 ? 1 : 0);
  const frog = { ...FROGS[frogIdx], name: frogNames[frogIdx] };
  const done = hops >= totalHops && totalHops > 0;
  const showAnswer = done || (mode === "lab" && reveal);

  function resetHops() { setHops(0); setAnimating(false); setChecked(null); }
  function setupProblem(na: number, nb: number, nc: number, nd: number) {
    setA(na); setB(nb); setC(nc); setD(nd);
    resetHops(); setGNum(0); setGDen(0); setFirstTry(true); setReveal(false);
  }
  function setBSafe(nb: number) { setupProblem(Math.min(a, nb), nb, c, d); }
  function setDSafe(nd: number) { setupProblem(a, b, Math.min(c, nd - 1) || 1, nd); }

  function hopOne() {
    if (animating || hops >= totalHops) return;
    ensure(); setAnimating(true);
    play("hop");
    setHops((h) => h + 1);
    timeoutsRef.current.push(window.setTimeout(() => { play("splash"); setAnimating(false); }, 430));
  }
  function hopAll(evalGuess = false) {
    if (animating) return;
    ensure();
    const remain = totalHops - hops;
    if (remain <= 0) { if (evalGuess) evaluate(); return; }
    setAnimating(true);
    for (let i = 0; i < remain; i++) {
      timeoutsRef.current.push(window.setTimeout(() => { play("hop"); setHops((h) => h + 1); }, i * 460));
    }
    timeoutsRef.current.push(window.setTimeout(() => { setAnimating(false); play("splash"); if (evalGuess) evaluate(); }, remain * 460 + 260));
  }
  function evaluate() {
    const ok = gDen > 0 && gNum * qDen === qNum * gDen;   // ยอมรับเศษส่วนที่เท่ากัน
    setChecked(ok);
    if (ok) { play("correct"); play("star"); setScore((s) => s + (firstTry ? 25 : 12)); }
    else play("wrong");
  }

  /* ภารกิจ flow */
  function randomProblem(): [number, number, number, number] {
    const nb = DEN_OPTIONS[randInt(0, DEN_OPTIONS.length - 1)];
    const nd = DEN_OPTIONS[randInt(0, DEN_OPTIONS.length - 1)];
    return [randInt(1, nb), nb, randInt(1, nd - 1), nd];
  }
  function startMissions() {
    ensure(); play("start");
    setScore(0); setRound(1); setGameOver(false);
    setupProblem(2, 3, 1, 4);
    setMode("mission");
  }
  function nextMission() {
    if (round >= MISSIONS_TOTAL) { setGameOver(true); play("star"); return; }
    setRound((r) => r + 1);
    const [na, nb, nc, nd] = randomProblem();
    setupProblem(na, nb, nc, nd);
    setFrogIdx((prev) => shuffle(FROGS.map((_, i) => i).filter((i) => i !== prev))[0] ?? prev);
  }

  const stars = score >= 170 ? 3 : score >= 100 ? 2 : 1;
  const mixedWhole = Math.floor(rqNum / rqDen);
  const mixedNum = rqNum % rqDen;

  return (
    <div className="relative overflow-hidden rounded-2xl p-3 sm:p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-lime-100 via-green-50 to-emerald-50" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden text-2xl" aria-hidden>
        <span className="absolute left-4 top-4 opacity-40">🪷</span>
        <span className="absolute right-8 top-7 opacity-40">🌿</span>
        <span className="absolute bottom-8 right-6 opacity-30">🦟</span>
      </div>

      <div className="relative space-y-3">
        {/* โหมด + ปิดเสียง */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex rounded-xl border-2 border-slate-200 bg-white p-1">
            <button onClick={() => { setMode("lab"); resetHops(); }} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "lab" ? "bg-green-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <FlaskConical size={15} /> โหมดครู
            </button>
            <button onClick={startMissions} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "mission" ? "bg-lime-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <Target size={15} /> โหมดทายก่อนกระโดด
            </button>
          </div>
          <button onClick={() => setMuted((m) => !m)} className="grid h-9 w-9 place-items-center rounded-xl border-2 border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50" title={muted ? "เปิดเสียง" : "ปิดเสียง"}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {mode === "mission" && gameOver ? (
          <div className="space-y-4 rounded-2xl border-2 border-lime-300 bg-white/90 p-6 text-center">
            <div className="text-5xl">🐸🏆</div>
            <h3 className="text-xl font-extrabold text-slate-800 sm:text-2xl">กบข้ามบ่อครบทุกด่าน!</h3>
            <p className="text-2xl">{"⭐".repeat(stars)}{"☆".repeat(3 - stars)}</p>
            <p className="text-base font-extrabold text-lime-700">🏅 คะแนนรวม {score}</p>
            <button onClick={startMissions} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-lime-600 to-green-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
              <Play size={18} /> เล่นอีกครั้ง
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* แถบตั้งค่า (ครู) / สถานะ (ภารกิจ) */}
            {mode === "lab" ? (
              <div className="space-y-2 rounded-2xl border-2 border-green-200 bg-white/90 px-3 py-2">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="text-sm font-extrabold text-green-700">🧑‍🏫 ตั้งโจทย์:</span>
                  <FracPicker label="🚩 ไปถึง" num={a} den={b} maxNum={b} setNum={(v) => setupProblem(v, b, c, d)} setDen={setBSafe} tone="text-rose-600" />
                  <span className="text-xl font-black text-slate-400">÷</span>
                  <FracPicker label="🐸 ก้าวละ" num={c} den={d} maxNum={d - 1} setNum={(v) => setupProblem(a, b, v, d)} setDen={setDSafe} tone="text-green-600" />
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button onClick={() => setReveal((v) => !v)} className={cn("flex items-center gap-1 rounded-lg border-2 px-2 py-1 text-xs font-extrabold transition", reveal ? "border-violet-400 bg-violet-100 text-violet-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
                    {reveal ? <EyeOff size={13} /> : <Eye size={13} />} เฉลย
                  </button>
                  <button onClick={() => setShowNames((v) => !v)} className={cn("flex items-center gap-1 rounded-lg border-2 px-2 py-1 text-xs font-extrabold transition", showNames ? "border-sky-400 bg-sky-100 text-sky-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
                    <Pencil size={13} /> แก้ชื่อ
                  </button>
                  <span className="mx-1 text-slate-300">|</span>
                  <span className="text-xs font-extrabold text-slate-500">กบ:</span>
                  {FROGS.map((f, i) => (
                    <button key={i} onClick={() => setFrogIdx(i)} className={cn("grid h-8 w-8 place-items-center rounded-lg border-2 transition", frogIdx === i ? "border-green-500 bg-green-50" : "border-slate-200 bg-white")}>
                      <svg viewBox="-16 -14 32 26" width={24} height={20} style={SS}><Frog f={f} happy={false} /></svg>
                    </button>
                  ))}
                </div>
                {showNames && (
                  <div className="flex flex-wrap items-center justify-center gap-2 border-t border-slate-100 pt-1.5">
                    <span className="text-sm font-extrabold text-sky-700">✏️ ชื่อกบ:</span>
                    {FROGS.map((_, i) => (
                      <input key={i} value={frogNames[i]} maxLength={12} onChange={(ev) => setFrogNames((ns) => { const nn = [...ns]; nn[i] = ev.target.value; return nn; })} className="w-24 rounded-lg border-2 border-slate-200 bg-white px-2 py-1 text-sm font-extrabold text-slate-700 focus:border-sky-400 focus:outline-none" />
                    ))}
                    <button onClick={() => setFrogNames(FROGS.map((f) => f.name))} className="rounded-lg border-2 border-slate-200 bg-white px-2 py-1 text-sm font-extrabold text-slate-500 hover:bg-slate-50">คืนค่าเดิม</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 rounded-2xl bg-white/90 px-4 py-2 ring-1 ring-lime-200">
                <span className="text-base font-extrabold text-lime-700">🎯 ข้อ {round}/{MISSIONS_TOTAL}</span>
                <span className="text-base font-extrabold text-green-600">🏅 {score}</span>
                <span className="text-xs font-extrabold text-slate-500">กระโดดกี่ก้าว?</span>
              </div>
            )}

            {/* การ์ดโจทย์ */}
            <div className="rounded-2xl border-2 border-green-200 bg-white/95 px-4 py-3 text-center shadow-sm">
              <p className="text-base font-extrabold leading-relaxed text-slate-700 sm:text-lg">
                <span className="text-green-700">{frog.name}</span> กระโดดทีละ{" "}
                <span className="inline-flex translate-y-1.5"><StackedFraction numerator={c} denominator={d} className="text-lg" toneClassName="text-green-600" /></span>{" "}
                จาก 0 ไปให้ถึง{" "}
                <span className="inline-flex translate-y-1.5"><StackedFraction numerator={a} denominator={b} className="text-lg" toneClassName="text-rose-600" /></span>{" "}
                <br className="sm:hidden" />ต้องกระโดดกี่ก้าว?
              </p>
            </div>

            {/* สมการใหญ่ */}
            <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-green-200 bg-white/95 px-5 py-2.5 shadow-sm">
              <StackedFraction numerator={a} denominator={b} className="text-3xl sm:text-4xl" toneClassName="text-rose-600" />
              <span className="text-3xl font-black text-slate-400">÷</span>
              <StackedFraction numerator={c} denominator={d} className="text-3xl sm:text-4xl" toneClassName="text-green-600" />
              <span className="text-3xl font-black text-slate-400">=</span>
              {showAnswer ? (
                <span className="flex items-center gap-2">
                  <StackedFraction numerator={rqNum} denominator={rqDen} className="text-3xl sm:text-4xl" toneClassName={done ? "text-green-600" : "text-violet-500"} />
                  {rqDen > 1 && rqNum > rqDen && (
                    <>
                      <span className="text-2xl font-black text-slate-400">=</span>
                      <span className="inline-flex items-center gap-1 text-green-700">
                        <span className="text-4xl font-black">{mixedWhole}</span>
                        {mixedNum > 0 && <StackedFraction numerator={mixedNum} denominator={rqDen} className="text-xl" toneClassName="text-green-700" />}
                      </span>
                    </>
                  )}
                  <span className="text-xl font-extrabold text-slate-500">ก้าว</span>
                </span>
              ) : (
                <span className="grid h-12 w-12 place-items-center rounded-xl border-[3px] border-dashed border-green-300 text-2xl font-black text-green-400">?</span>
              )}
            </div>

            {/* ฉาก */}
            <div className="rounded-2xl border-2 border-green-200 bg-gradient-to-b from-lime-100/50 to-green-50/50 p-2">
              <PondScene a={a} b={b} c={c} d={d} L={L} hops={hops} whole={whole} rem={rem} animating={animating} frog={frog} />
              <div className="-mt-1 text-center">
                <span className="rounded-full bg-white px-3 py-0.5 text-sm font-extrabold text-slate-600 shadow-sm ring-1 ring-green-200">
                  กระโดดแล้ว {Math.min(hops, whole)} ก้าวเต็ม{hops > whole && rem > 0 ? ` + อีก ${rem / rg}/${C / rg} ก้าว` : ""} · เป้า {a}/{b} = {A}/{L}
                </span>
              </div>
            </div>

            {/* คำอธิบายผล */}
            {done && (
              <p className="text-center text-sm font-extrabold text-slate-600">
                ทำส่วนให้เท่ากัน: <b className="text-rose-600">{a}/{b} = {A}/{L}</b> · ก้าวละ <b className="text-green-600">{c}/{d} = {C}/{L}</b> →
                เอาตัวเศษหารกัน <b>{A} ÷ {C} = {rqNum}/{rqDen}</b>
                {rqNum > rqDen && <> = <b className="text-green-700">{mixedWhole}{mixedNum > 0 ? ` ${mixedNum}/${rqDen}` : ""}</b></>} ก้าว
                {" "}<span className="text-emerald-600">— หรือกลับตัวหลังแล้วคูณ: {a}/{b} × {d}/{c} = {qNum}/{qDen}</span>
              </p>
            )}

            {/* โหมดทายก่อนกระโดด */}
            {mode === "mission" && hops === 0 && !animating && checked === null && (
              <div className="space-y-2 rounded-2xl border-2 border-lime-200 bg-white/90 p-3">
                <p className="text-center text-sm font-extrabold text-slate-600">🤔 ทายก่อน: กระโดดกี่ก้าว? (ตอบเป็นเศษส่วนได้ เช่น 8/3)</p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="inline-flex flex-col items-center rounded-xl border-2 border-lime-300 bg-white px-3 py-1">
                    <input type="text" inputMode="numeric" value={gNum === 0 ? "" : String(gNum)} placeholder="?" onChange={(ev) => { const v = parseInt(ev.target.value.replace(/\D/g, ""), 10); setGNum(Number.isNaN(v) ? 0 : Math.min(99, v)); }} className="w-14 bg-transparent text-center text-2xl font-extrabold text-lime-700 outline-none" aria-label="เศษคำตอบ" />
                    <span className="h-[3px] w-10 rounded bg-slate-400" />
                    <input type="text" inputMode="numeric" value={gDen === 0 ? "" : String(gDen)} placeholder="?" onChange={(ev) => { const v = parseInt(ev.target.value.replace(/\D/g, ""), 10); setGDen(Number.isNaN(v) ? 0 : Math.min(99, v)); }} onKeyDown={(ev) => { if (ev.key === "Enter") { setFirstTry(true); hopAll(true); } }} className="w-14 bg-transparent text-center text-2xl font-extrabold text-slate-500 outline-none" aria-label="ส่วนคำตอบ" />
                  </span>
                  <span className="text-sm font-extrabold text-slate-400">ก้าว</span>
                  <button onClick={() => { setFirstTry(true); hopAll(true); }} className="ml-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-lime-600 to-green-500 px-6 py-2.5 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                    🐸 กระโดดพิสูจน์!
                  </button>
                </div>
                <p className="text-center text-xs font-bold text-slate-400">💡 ถ้าเป็นจำนวนเต็มใส่ส่วนเป็น 1 (เช่น 4/1) · ทำส่วนให้เท่ากันแล้วหารตัวเศษ</p>
              </div>
            )}

            {/* ผลทาย */}
            {mode === "mission" && checked !== null && (
              <div className={cn("rounded-2xl border-2 p-3 text-center", checked ? "border-emerald-300 bg-emerald-50" : "border-rose-300 bg-rose-50")}>
                <p className={cn("text-base font-extrabold", checked ? "text-emerald-700" : "text-rose-600")}>
                  {checked
                    ? `🎉 ถูกต้อง! ${a}/${b} ÷ ${c}/${d} = ${a}/${b} × ${d}/${c} = ${rqNum}/${rqDen}${rqNum > rqDen ? ` = ${mixedWhole}${mixedNum > 0 ? ` ${mixedNum}/${rqDen}` : ""}` : ""} ก้าว`
                    : `ทาย ${gNum}/${gDen || "?"} — จริง ๆ คือ ${rqNum}/${rqDen}${rqNum > rqDen ? ` (= ${mixedWhole}${mixedNum > 0 ? ` ${mixedNum}/${rqDen}` : ""})` : ""} ก้าว · กลับตัวหลังแล้วคูณ ${a}/${b} × ${d}/${c}`}
                </p>
                <button onClick={nextMission} className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-lime-600 to-green-500 px-6 py-2 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                  {round >= MISSIONS_TOTAL ? "🏁 ดูสรุปผล" : <>ด่านต่อไป <ArrowRight size={16} /></>}
                </button>
              </div>
            )}

            {/* ปุ่มควบคุม (โหมดครู) */}
            {mode === "lab" && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                {hops < totalHops ? (
                  <>
                    <button onClick={hopOne} disabled={animating} className="inline-flex items-center gap-2 rounded-xl border-b-4 border-green-700 bg-gradient-to-b from-green-500 to-green-600 px-5 py-2.5 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.97] active:border-b-2 disabled:opacity-50">
                      🐸 กระโดด 1 ก้าว
                    </button>
                    <button onClick={() => hopAll()} disabled={animating} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-lime-600 to-green-500 px-5 py-2.5 text-base font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98] disabled:opacity-50">
                      🚩 กระโดดถึงเป้า
                    </button>
                    {hops > 0 && (
                      <button onClick={resetHops} disabled={animating} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-3 py-1.5 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50 disabled:opacity-50">
                        <RotateCcw size={14} /> กลับจุดเริ่ม
                      </button>
                    )}
                  </>
                ) : (
                  <button onClick={resetHops} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-5 py-2 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50">
                    <RotateCcw size={15} /> กระโดดใหม่
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
