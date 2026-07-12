"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, Play, Flag, Timer, Trophy } from "lucide-react";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { cn } from "@/lib/cn";
import { randInt, shuffle } from "@/lib/randomFraction";

/* ── ค่าคงที่ ── */

const GOAL = 10; // ช่องถึงเส้นชัย

type VType = "pickup" | "moto" | "van" | "bus" | "super";
const VEHICLES: { id: VType; name: string; emoji: string }[] = [
  { id: "pickup", name: "กระบะ", emoji: "🛻" },
  { id: "moto", name: "มอเตอร์ไซค์", emoji: "🏍️" },
  { id: "van", name: "รถตู้", emoji: "🚐" },
  { id: "bus", name: "รถบัส", emoji: "🚌" },
  { id: "super", name: "ซุปเปอร์คาร์", emoji: "🏎️" },
];
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
const RIVAL = { type: "super" as VType, body: "#94a3b8", dark: "#475569" };

type Q = { a: number; b: number; den: number; opts: number[]; ans: number };

function genQ(level: 1 | 2): Q {
  const den = level === 1 ? [3, 4, 5][randInt(0, 2)] : [4, 5, 6, 8][randInt(0, 3)];
  let a = randInt(1, den - 1);
  let b = randInt(1, den - 1);
  if (level === 1 && a + b > den) b = randInt(1, den - a); // ผลรวม ≤ เต็ม
  const ans = a + b;
  const cands = [ans + 1, ans - 1, ans + 2, ans - 2, ans + den];
  const seen = new Set<number>([ans]);
  const ds: number[] = [];
  for (const c of cands) {
    if (c >= 1 && c <= 2 * den - 2 && !seen.has(c)) { seen.add(c); ds.push(c); }
    if (ds.length >= 2) break;
  }
  return { a, b, den, opts: shuffle([ans, ...ds]), ans };
}

/* ── เสียง (Web Audio ไม่ใช้ไฟล์) ── */

type SoundKind = "boost" | "wrong" | "start" | "win" | "lose" | "beep";

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
      case "boost": return sweep(300, 720, 0.28, "sawtooth", 0.06);
      case "wrong": return sweep(360, 120, 0.35, "sawtooth", 0.09);
      case "start": return tones([392, 523, 659, 784], 0.09, 0.14, "triangle", 0.14);
      case "win": return tones([523, 659, 784, 1047, 1319, 1568], 0.09, 0.17, "triangle", 0.15);
      case "lose": return tones([392, 330, 262, 196], 0.12, 0.2, "sawtooth", 0.09);
      case "beep": return tones([880], 0.05, 0.1, "square", 0.08);
    }
  }
  return { play, ensure };
}

/* ── เพลงแข่งรถ (ชิปทูน ไม่ใช้ไฟล์) ── */

const RC_LEAD = [76, 76, 0, 76, 0, 72, 76, 0, 79, 0, 0, 67, 0, 0, 72, 0, 67, 0, 64, 0, 69, 0, 71, 70, 69, 67, 76, 79, 81, 0, 79, 0];
const RC_BASS = [40, 47, 40, 47, 41, 48, 41, 48, 43, 50, 43, 50, 36, 43, 36, 43];

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
      const m = RC_LEAD[s];
      if (m) note(m, 0.14, "square", 0.028);
      if (s % 2 === 0) {
        const b = RC_BASS[s / 2];
        if (b) note(b, 0.28, "triangle", 0.05);
      }
    }, 165);
  }
  function stop() {
    if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
  }
  useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);
  return { start, stop };
}

/* ── รถหลายชนิด ── */

function Wheel({ cx, cy, r, driving }: { cx: number; cy: number; r: number; driving: boolean }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#1f2937" stroke="#0f172a" strokeWidth={1.5} />
      <circle cx={cx} cy={cy} r={r * 0.42} fill="#cbd5e1" />
      <g className={driving ? "rc-wheel" : undefined} style={{ transformOrigin: `${cx}px ${cy}px` }}>
        <line x1={cx - r * 0.82} y1={cy} x2={cx + r * 0.82} y2={cy} stroke="#e2e8f0" strokeWidth={1.4} />
        <line x1={cx} y1={cy - r * 0.82} x2={cx} y2={cy + r * 0.82} stroke="#e2e8f0" strokeWidth={1.4} />
      </g>
    </g>
  );
}

const GLASS = "#cffafe";

function Vehicle({ type, body, dark, driving, size = 50 }: { type: VType; body: string; dark: string; driving: boolean; size?: number }) {
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

/* ── ป้ายคำตอบ (เศษ/จำนวนคละ) ── */

function AnsValue({ num, den, tone }: { num: number; den: number; tone: string }) {
  if (num === den) return <span className={cn("text-3xl font-black", tone)}>1</span>;
  if (num < den) return <StackedFraction numerator={num} denominator={den} className="text-2xl sm:text-3xl" toneClassName={tone} />;
  return (
    <span className={cn("inline-flex items-center gap-1", tone)}>
      <span className="text-2xl font-black sm:text-3xl">1</span>
      <StackedFraction numerator={num - den} denominator={den} className="text-lg sm:text-xl" toneClassName={tone} />
    </span>
  );
}

/* ── แทร็กแข่ง 2 เลน ── */

function RaceTrack({ pType, pBody, pDark, playerPos, rivalPos, boosting }: {
  pType: VType; pBody: string; pDark: string; playerPos: number; rivalPos: number; boosting: boolean;
}) {
  const xOf = (pos: number) => 5 + (pos / GOAL) * 82;
  return (
    <div className="relative h-[168px] overflow-hidden rounded-2xl border-2 border-slate-400" style={{ background: "linear-gradient(180deg,#475569,#334155)" }}>
      {/* ขอบหญ้าบน/ล่าง */}
      <div className="absolute inset-x-0 top-0 h-3 bg-gradient-to-b from-emerald-500 to-emerald-600" />
      <div className="absolute inset-x-0 bottom-0 h-3 bg-gradient-to-t from-emerald-500 to-emerald-600" />
      {/* เส้นแบ่งเลน (ประ) */}
      <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2" style={{ background: "repeating-linear-gradient(90deg,#fbbf24 0 20px,transparent 20px 36px)" }} />
      {/* เส้นชัย */}
      <div className="absolute top-3 bottom-3 w-[10px]" style={{ left: `${xOf(GOAL) + 4}%`, background: "repeating-linear-gradient(180deg,#e5e7eb 0 6px,#111827 6px 12px)" }} />
      <div className="absolute z-[3]" style={{ left: `${xOf(GOAL) + 4}%`, top: 2, transform: "translateX(-30%)" }}><Flag size={16} className="text-white" /></div>

      {/* เลน AI (บน) */}
      <div className="absolute" style={{ left: `${xOf(rivalPos)}%`, top: "26%", transform: "translate(-50%,-50%)", transition: "left 0.5s ease-out" }}>
        <Vehicle type={RIVAL.type} body={RIVAL.body} dark={RIVAL.dark} driving size={44} />
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-1 text-[9px] font-extrabold text-white">AI</span>
      </div>
      {/* เลนผู้เล่น (ล่าง) */}
      <div className={cn(boosting && "rc-boost")} style={{ position: "absolute", left: `${xOf(playerPos)}%`, top: "72%", transform: "translate(-50%,-50%)", transition: "left 0.5s ease-out" }}>
        {boosting && <span className="absolute right-full top-1/2 mr-1 -translate-y-1/2 text-lg">💨</span>}
        <Vehicle type={pType} body={pBody} dark={pDark} driving size={48} />
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-emerald-600 px-1 text-[9px] font-extrabold text-white">เรา</span>
      </div>
    </div>
  );
}

/* ── เกมหลัก ── */

type Phase = "menu" | "race" | "win" | "lose";

export function AddRaceGame() {
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

  const [vehicleIdx, setVehicleIdx] = useState(4);
  const [colorIdx, setColorIdx] = useState(0);
  const [level, setLevel] = useState<1 | 2>(1);

  const [phase, setPhase] = useState<Phase>("menu");
  const [q, setQ] = useState<Q>(() => genQ(1));
  const [playerPos, setPlayerPos] = useState(0);
  const [rivalPos, setRivalPos] = useState(0);
  const [combo, setCombo] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [flash, setFlash] = useState<number | null>(null);
  const [boosting, setBoosting] = useState(false);

  const timeoutsRef = useRef<number[]>([]);
  const push = (id: number) => timeoutsRef.current.push(id);
  useEffect(() => () => timeoutsRef.current.forEach((t) => window.clearTimeout(t)), []);

  const pBody = COLORS[colorIdx].body;
  const pDark = COLORS[colorIdx].dark;
  const pType = VEHICLES[vehicleIdx].id;

  /* รถ AI วิ่งอัตโนมัติ */
  useEffect(() => {
    if (phase !== "race") return;
    const ms = level === 1 ? 2600 : 1850;
    const id = window.setInterval(() => setRivalPos((p) => Math.min(GOAL, p + 1)), ms);
    return () => window.clearInterval(id);
  }, [phase, level]);

  /* นาฬิกา */
  useEffect(() => {
    if (phase !== "race") return;
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  /* ตัดสินแพ้/ชนะ */
  useEffect(() => {
    if (phase === "race" && playerPos >= GOAL) { setPhase("win"); play("win"); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerPos, phase]);
  useEffect(() => {
    if (phase === "race" && rivalPos >= GOAL) { setPhase("lose"); play("lose"); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rivalPos, phase]);

  function startRace() {
    ensure(); play("start");
    setPlayerPos(0); setRivalPos(0); setCombo(0); setCorrect(0); setWrong(0); setElapsed(0);
    setFlash(null); setBoosting(false);
    setQ(genQ(level));
    setPhase("race");
  }

  function answer(idx: number) {
    if (phase !== "race") return;
    const val = q.opts[idx];
    if (val === q.ans) {
      play("boost");
      setCombo((c) => c + 1);
      setCorrect((c) => c + 1);
      setBoosting(true);
      push(window.setTimeout(() => setBoosting(false), 420));
      setPlayerPos((p) => Math.min(GOAL, p + 1));
      setQ(genQ(level));
    } else {
      play("wrong");
      setCombo(0);
      setWrong((w) => w + 1);
      setFlash(idx);
      push(window.setTimeout(() => setFlash(null), 350));
    }
  }

  const stars = elapsed <= 22 ? 3 : elapsed <= 32 ? 2 : 1;

  return (
    <div className="relative overflow-hidden rounded-2xl p-3 sm:p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-100 via-sky-50 to-emerald-50" />
      <style>{`
        @keyframes rcWheel { from { transform: rotate(0); } to { transform: rotate(360deg); } }
        .rc-wheel { animation: rcWheel 0.28s linear infinite; }
        @keyframes rcBoost { 0%,100% { filter: none; } 50% { filter: brightness(1.25); } }
        .rc-boost { animation: rcBoost 0.4s ease-out; }
        @keyframes rcPop { 0% { transform: scale(0.4); opacity: 0; } 60% { transform: scale(1.15); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        .rc-pop { animation: rcPop 0.4s ease-out forwards; }
      `}</style>

      <div className="relative space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-extrabold text-slate-800">🏎️ รถแข่งบวกเร็ว — เห็นโจทย์ ตอบเลย!</h3>
          <button onClick={() => setMuted((m) => !m)} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border-2 border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50" title={muted ? "เปิดเสียง" : "ปิดเสียง"}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {phase === "menu" ? (
          /* ── จอเริ่ม ── */
          <div className="space-y-4 rounded-2xl border-2 border-slate-200 bg-white/90 p-4 sm:p-6">
            <p className="text-center text-sm font-bold text-slate-500">ตอบถูก รถพุ่งไป 1 ช่อง · ตอบผิดอยู่กับที่ (รถ AI แซง!) · ถึงเส้นชัย {GOAL} ช่องก่อนชนะ 🏁</p>

            <div className="space-y-1.5">
              <p className="text-center text-sm font-extrabold text-slate-600">เลือกรถของเรา:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {VEHICLES.map((v, i) => (
                  <button key={v.id} onClick={() => setVehicleIdx(i)} title={v.name} className={cn("flex flex-col items-center gap-0.5 rounded-2xl border-2 px-2 py-1 transition", vehicleIdx === i ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200" : "border-slate-200 bg-white hover:border-emerald-300")}>
                    <Vehicle type={v.id} body={pBody} dark={pDark} driving={false} size={34} />
                    <span className="text-[10px] font-extrabold text-slate-600">{v.name}</span>
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                <span className="text-xs font-extrabold text-slate-500">สี:</span>
                {COLORS.map((c, i) => (
                  <button key={c.name} onClick={() => setColorIdx(i)} title={c.name} className={cn("h-6 w-6 rounded-full border-2 transition", colorIdx === i ? "border-slate-700 ring-2 ring-slate-300" : "border-white")} style={{ background: c.body }} />
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-extrabold text-slate-500">ระดับ:</span>
              {([[1, "ง่าย (ผลรวม ≤ 1)"], [2, "ยาก (มีเกิน 1 · AI เร็ว)"]] as [1 | 2, string][]).map(([lv, label]) => (
                <button key={lv} onClick={() => setLevel(lv)} className={cn("rounded-lg border-2 px-3 py-1 text-xs font-extrabold transition", level === lv ? "border-emerald-400 bg-emerald-100 text-emerald-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>{label}</button>
              ))}
            </div>

            <div className="flex justify-center">
              <button onClick={startRace} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
                <Play size={18} /> เริ่มแข่ง!
              </button>
            </div>
          </div>
        ) : phase === "win" || phase === "lose" ? (
          /* ── จอจบ ── */
          <div className={cn("space-y-4 rounded-2xl border-2 bg-white/90 p-6 text-center", phase === "win" ? "border-amber-300" : "border-slate-300")}>
            <div className="text-5xl">{phase === "win" ? "🏆🏎️" : "🚗💨"}</div>
            <h3 className="text-xl font-extrabold text-slate-800 sm:text-2xl">{phase === "win" ? "ชนะ! ถึงเส้นชัยก่อนรถ AI" : "รถ AI ถึงก่อน — สู้ใหม่!"}</h3>
            {phase === "win" && <p className="text-2xl">{"⭐".repeat(stars)}{"☆".repeat(3 - stars)}</p>}
            <p className="text-sm font-extrabold text-slate-500">⏱️ {elapsed} วิ · ✅ ถูก {correct} · ❌ พลาด {wrong}</p>
            <div className="flex justify-center gap-2">
              <button onClick={startRace} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 px-6 py-2.5 text-base font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
                <Play size={17} /> แข่งอีกรอบ
              </button>
              <button onClick={() => setPhase("menu")} className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-5 py-2.5 text-base font-extrabold text-slate-500 transition hover:bg-slate-50">
                เปลี่ยนรถ
              </button>
            </div>
          </div>
        ) : (
          /* ── กำลังแข่ง ── */
          <div className="space-y-3">
            {/* HUD */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 rounded-2xl bg-white/90 px-4 py-1.5 ring-1 ring-slate-200">
              <span className="flex items-center gap-1 text-sm font-extrabold text-emerald-700"><Trophy size={14} /> เรา {playerPos}/{GOAL}</span>
              <span className="text-sm font-extrabold text-slate-500">🤖 AI {rivalPos}/{GOAL}</span>
              {combo >= 3 && <span className="text-sm font-extrabold text-orange-500">🔥 x{combo}</span>}
              <span className="flex items-center gap-1 text-sm font-extrabold text-slate-500"><Timer size={13} /> {elapsed} วิ</span>
            </div>

            {/* แทร็ก */}
            <RaceTrack pType={pType} pBody={pBody} pDark={pDark} playerPos={playerPos} rivalPos={rivalPos} boosting={boosting} />

            {/* โจทย์ */}
            <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-rose-200 bg-white/95 px-5 py-3 shadow-sm">
              <StackedFraction numerator={q.a} denominator={q.den} className="text-3xl sm:text-4xl" toneClassName="text-emerald-600" />
              <span className="text-3xl font-black text-slate-400">+</span>
              <StackedFraction numerator={q.b} denominator={q.den} className="text-3xl sm:text-4xl" toneClassName="text-sky-600" />
              <span className="text-3xl font-black text-slate-400">=</span>
              <span className="grid h-12 w-12 place-items-center rounded-xl border-[3px] border-dashed border-rose-300 text-2xl font-black text-rose-400">?</span>
            </div>

            {/* ตัวเลือก */}
            <div className="grid grid-cols-3 gap-2.5">
              {q.opts.map((num, i) => (
                <button
                  key={i}
                  onClick={() => answer(i)}
                  className={cn(
                    "flex h-16 items-center justify-center rounded-2xl border-b-4 bg-white shadow transition active:scale-[0.97]",
                    flash === i ? "border-rose-500 bg-rose-100 ring-2 ring-rose-300" : "border-slate-300 hover:-translate-y-0.5 hover:border-rose-300",
                  )}
                >
                  <AnsValue num={num} den={q.den} tone={flash === i ? "text-rose-600" : "text-slate-800"} />
                </button>
              ))}
            </div>
            <p className="text-center text-xs font-extrabold text-slate-400">แตะคำตอบที่ถูกให้เร็วที่สุด — ตัวส่วนเท่าเดิม บวกแค่ตัวเศษ!</p>
          </div>
        )}
      </div>
    </div>
  );
}
