"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Volume2, VolumeX, FlaskConical, Target, ArrowRight, Zap } from "lucide-react";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { Frac } from "@/components/lessons/Frac";
import { cn } from "@/lib/cn";
import { randInt } from "@/lib/randomFraction";

/* ─────────────────────────────────────────────
   โรงชาร์จหุ่นยนต์ 🤖 — สร้างเศษส่วนด้วยแถบแบตเตอรี่
   แบตแบ่งเป็น b ช่องเท่ากัน คลิกเติมพลังทีละช่อง
   ชาร์จให้ได้ a/b พอดี → หุ่นยนต์ตาสว่าง เต้นดีใจ
   เกิน → ไฟช็อตควันขึ้น! (สอนว่าตัวเศษเกินเป้าไม่ได้)
   ───────────────────────────────────────────── */

const MISSIONS_TOTAL = 8;
const DENS = [2, 3, 4, 5, 6, 8, 10];

type SoundKind = "charge" | "uncharge" | "dance" | "zap" | "correct" | "wrong" | "start" | "star";

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
      case "charge": return tones([523, 659], 0.04, 0.08, "square", 0.07);
      case "uncharge": return tones([440, 349], 0.04, 0.08, "square", 0.05);
      case "dance": return tones([523, 659, 784, 1047, 784, 1047], 0.07, 0.12, "square", 0.08);
      case "zap": return tones([120, 90, 150, 80], 0.05, 0.1, "sawtooth", 0.08);
      case "correct": return tones([660, 990, 1319], 0.06, 0.1, "triangle", 0.14);
      case "wrong": return tones([220, 165], 0.11, 0.18, "sawtooth", 0.09);
      case "start": return tones([523, 659, 784], 0.07, 0.12, "triangle", 0.14);
      case "star": return tones([1047, 1319, 1568, 2093], 0.07, 0.14, "triangle", 0.14);
    }
  }
  return { play, ensure };
}

/* เพลงโรงงานหุ่นยนต์ (โทนอิเล็กทรอนิกส์) */
const RB_LEAD = [60, 0, 60, 63, 0, 65, 0, 63, 60, 0, 60, 67, 0, 65, 63, 0, 60, 0, 60, 63, 0, 65, 0, 67, 70, 67, 65, 63, 60, 0, 0, 0];
const RB_BASS = [36, 43, 36, 43, 39, 46, 39, 46, 41, 48, 41, 48, 36, 43, 46, 36];

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
      const m = RB_LEAD[s];
      if (m) note(m, 0.16, "square", 0.02);
      if (s % 2 === 0) {
        const b = RB_BASS[s / 2];
        if (b) note(b, 0.3, "triangle", 0.05);
      }
    }, 190);
  }
  function stop() { if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; } }
  useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);
  return { start, stop };
}

const ROBOT_COLORS = [
  { name: "บอตฟ้า", body: "#38bdf8", dark: "#0369a1", light: "#bae6fd" },
  { name: "บอตชมพู", body: "#f472b6", dark: "#be185d", light: "#fbcfe8" },
  { name: "บอตเขียว", body: "#4ade80", dark: "#15803d", light: "#bbf7d0" },
  { name: "บอตส้ม", body: "#fb923c", dark: "#c2410c", light: "#fed7aa" },
];

/* ── หุ่นยนต์ ── */
function Robot({ c, mood, power, size = 150 }: { c: typeof ROBOT_COLORS[number]; mood: "sleep" | "ok" | "dance" | "zap"; power: number; size?: number }) {
  const eyesOn = power > 0 && mood !== "sleep";
  return (
    <svg viewBox="0 0 100 118" width={size * 0.85} height={size} className={mood === "dance" ? "rb-dance" : mood === "zap" ? "rb-shake" : undefined} role="img" aria-label={c.name}>
      {/* เสาอากาศ */}
      <line x1={50} y1={14} x2={50} y2={4} stroke={c.dark} strokeWidth={2.5} />
      <circle cx={50} cy={4} r={3.5} fill={mood === "dance" ? "#facc15" : c.body} stroke={c.dark} strokeWidth={1.2} className={mood === "dance" ? "rb-blink" : undefined} />
      {/* หัว */}
      <rect x={26} y={14} width={48} height={34} rx={9} fill={c.body} stroke={c.dark} strokeWidth={2.4} />
      <rect x={32} y={20} width={36} height={22} rx={6} fill="#0f172a" />
      {/* ตา */}
      {mood === "zap" ? (
        <>
          <path d="M39,28 l4,4 M43,28 l-4,4" stroke="#f43f5e" strokeWidth={2} strokeLinecap="round" />
          <path d="M57,28 l4,4 M61,28 l-4,4" stroke="#f43f5e" strokeWidth={2} strokeLinecap="round" />
        </>
      ) : eyesOn ? (
        <>
          <circle cx={41} cy={30} r={4.5} fill={mood === "dance" ? "#fde047" : "#4ade80"} className={mood === "dance" ? "rb-blink" : undefined} />
          <circle cx={59} cy={30} r={4.5} fill={mood === "dance" ? "#fde047" : "#4ade80"} className={mood === "dance" ? "rb-blink" : undefined} />
          {mood === "dance" && <path d="M42,38 Q50,43 58,38" stroke="#fde047" strokeWidth={2} fill="none" strokeLinecap="round" />}
        </>
      ) : (
        <>
          <line x1={37} y1={30} x2={45} y2={30} stroke="#475569" strokeWidth={2.4} strokeLinecap="round" />
          <line x1={55} y1={30} x2={63} y2={30} stroke="#475569" strokeWidth={2.4} strokeLinecap="round" />
        </>
      )}
      {/* หู */}
      <rect x={18} y={24} width={8} height={14} rx={3} fill={c.light} stroke={c.dark} strokeWidth={1.6} />
      <rect x={74} y={24} width={8} height={14} rx={3} fill={c.light} stroke={c.dark} strokeWidth={1.6} />
      {/* ตัว */}
      <rect x={30} y={52} width={40} height={36} rx={7} fill={c.body} stroke={c.dark} strokeWidth={2.4} />
      {/* หน้าปัดพลังงานที่อก */}
      <rect x={38} y={58} width={24} height={14} rx={3} fill="#0f172a" />
      <rect x={40} y={60} width={20 * Math.min(1, power)} height={10} rx={2} fill={power >= 1 ? "#4ade80" : "#fbbf24"} style={{ transition: "width .3s" }} />
      <circle cx={50} cy={80} r={3.5} fill={c.light} stroke={c.dark} strokeWidth={1.2} />
      {/* แขน */}
      <g className={mood === "dance" ? "rb-armL" : undefined} style={{ transformOrigin: "28px 56px" }}>
        <rect x={20} y={54} width={10} height={22} rx={4.5} fill={c.light} stroke={c.dark} strokeWidth={1.8} />
      </g>
      <g className={mood === "dance" ? "rb-armR" : undefined} style={{ transformOrigin: "72px 56px" }}>
        <rect x={70} y={54} width={10} height={22} rx={4.5} fill={c.light} stroke={c.dark} strokeWidth={1.8} />
      </g>
      {/* ขา */}
      <rect x={35} y={88} width={11} height={18} rx={4} fill={c.light} stroke={c.dark} strokeWidth={1.8} />
      <rect x={54} y={88} width={11} height={18} rx={4} fill={c.light} stroke={c.dark} strokeWidth={1.8} />
      <rect x={31} y={105} width={17} height={7} rx={3} fill={c.dark} />
      <rect x={52} y={105} width={17} height={7} rx={3} fill={c.dark} />
      {/* ควันตอนช็อต */}
      {mood === "zap" && <>
        <circle cx={30} cy={10} r={5} fill="#94a3b8" opacity={0.6} />
        <circle cx={70} cy={8} r={6} fill="#94a3b8" opacity={0.5} />
        <text x={78} y={16} fontSize={12}>💥</text>
      </>}
    </svg>
  );
}

export function IntroRobotChargeGame() {
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

  const [den, setDen] = useState(4);
  const [target, setTarget] = useState(3);
  const [filled, setFilled] = useState(0);
  const [state, setState] = useState<"charging" | "done" | "zap">("charging");
  const [robotIdx, setRobotIdx] = useState(0);
  const [zapFlash, setZapFlash] = useState(0);   // รีเพลย์อนิเมชันสายฟ้า
  const timeoutsRef = useRef<number[]>([]);
  useEffect(() => () => timeoutsRef.current.forEach((t) => window.clearTimeout(t)), []);

  /* ภารกิจ */
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [firstTry, setFirstTry] = useState(true);
  const [gameOver, setGameOver] = useState(false);

  const robot = ROBOT_COLORS[robotIdx];

  function setup(nd: number, nt: number) {
    timeoutsRef.current.forEach((t) => window.clearTimeout(t));
    setDen(nd); setTarget(nt);
    setFilled(0); setState("charging"); setFirstTry(true);
  }

  function chargeTo(i: number) {
    if (state === "done") return;
    ensure();
    const next = i + 1 === filled ? i : i + 1;   // คลิกช่องสุดท้ายที่เต็ม = ถอยกลับ
    play(next > filled ? "charge" : "uncharge");
    setFilled(next);
    setState("charging");
    if (next > filled) {
      setZapFlash((z) => z + 1);   // ยิงสายฟ้าจากแบต → หุ่นทุกครั้งที่เติมเพิ่ม
    }
  }

  function powerOn() {
    if (state === "done") return;
    ensure();
    if (filled === target) {
      setState("done");
      play("correct"); play("dance");
      if (mode === "mission") setScore((s) => s + (firstTry ? 25 : 10));
    } else {
      setState("zap");
      play("zap"); play("wrong");
      setFirstTry(false);
      timeoutsRef.current.push(window.setTimeout(() => setState("charging"), 900));
    }
  }

  function startMissions() {
    ensure(); play("start");
    setScore(0); setRound(1); setGameOver(false);
    const nd = DENS[randInt(1, DENS.length - 2)];
    setup(nd, randInt(1, nd - 1));
    setRobotIdx(randInt(0, ROBOT_COLORS.length - 1));
    setMode("mission");
  }
  function nextMission() {
    if (round >= MISSIONS_TOTAL) { setGameOver(true); play("star"); return; }
    setRound((r) => r + 1);
    const nd = DENS[randInt(1, DENS.length - 2)];
    setup(nd, randInt(1, nd - 1));
    setRobotIdx((p) => (p + 1) % ROBOT_COLORS.length);
  }

  const stars = score >= 170 ? 3 : score >= 100 ? 2 : 1;
  const done = state === "done";
  const mood = done ? "dance" : state === "zap" ? "zap" : filled > 0 ? "ok" : "sleep";

  return (
    <div className="relative overflow-hidden rounded-2xl p-3 sm:p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-200 via-sky-50 to-cyan-50" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden text-2xl" aria-hidden>
        <span className="absolute left-4 top-4 opacity-40">⚡</span>
        <span className="absolute right-8 top-7 opacity-40">🔋</span>
        <span className="absolute bottom-8 right-6 opacity-30">🔧</span>
      </div>

      <div className="relative space-y-3">
        <style>{`
          @keyframes rbDance { 0%,100% { transform: rotate(-4deg) translateY(0); } 50% { transform: rotate(4deg) translateY(-6px); } }
          .rb-dance { animation: rbDance 0.5s ease-in-out infinite; transform-origin: bottom center; }
          @keyframes rbShake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
          .rb-shake { animation: rbShake 0.14s linear 5; }
          @keyframes rbBlink { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
          .rb-blink { animation: rbBlink 0.4s linear infinite; }
          @keyframes rbArmL { 0%,100% { transform: rotate(10deg); } 50% { transform: rotate(-45deg); } }
          .rb-armL { animation: rbArmL 0.5s ease-in-out infinite; }
          @keyframes rbArmR { 0%,100% { transform: rotate(-10deg); } 50% { transform: rotate(45deg); } }
          .rb-armR { animation: rbArmR 0.5s ease-in-out infinite; }
          @keyframes rbZap { 0% { opacity: 0; stroke-dasharray: 6 120; stroke-dashoffset: 130; } 25% { opacity: 1; } 100% { opacity: 0; stroke-dasharray: 6 120; stroke-dashoffset: 0; } }
          .rb-zapflow { animation: rbZap 0.5s ease-out both; }
          @keyframes rbCellPop { 0% { transform: scale(0.3); opacity: 0; } 60% { transform: scale(1.35); } 100% { transform: scale(1); opacity: 1; } }
          .rb-cellpop { animation: rbCellPop 0.32s cubic-bezier(.4,1.6,.5,1) both; }
        `}</style>

        <div className="flex items-center justify-between gap-2">
          <div className="flex rounded-xl border-2 border-slate-200 bg-white p-1">
            <button onClick={() => { setMode("lab"); setup(den, target); }} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "lab" ? "bg-sky-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <FlaskConical size={15} /> โหมดครู
            </button>
            <button onClick={startMissions} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "mission" ? "bg-cyan-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <Target size={15} /> โหมดช่างชาร์จ
            </button>
          </div>
          <button onClick={() => setMuted((m) => !m)} className="grid h-9 w-9 place-items-center rounded-xl border-2 border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50" title={muted ? "เปิดเสียง" : "ปิดเสียง"}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {mode === "mission" && gameOver ? (
          <div className="space-y-4 rounded-2xl border-2 border-cyan-300 bg-white/90 p-6 text-center">
            <div className="text-5xl">🤖🏆</div>
            <h3 className="text-xl font-extrabold text-slate-800 sm:text-2xl">ชาร์จหุ่นยนต์ครบทุกตัว!</h3>
            <p className="text-2xl">{"⭐".repeat(stars)}{"☆".repeat(3 - stars)}</p>
            <p className="text-base font-extrabold text-cyan-700">🏅 คะแนนรวม {score}</p>
            <button onClick={startMissions} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
              <Play size={18} /> เข้ากะใหม่
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* ตั้งค่า / สถานะ */}
            {mode === "lab" ? (
              <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-sky-200 bg-white/90 px-3 py-2">
                <span className="text-sm font-extrabold text-sky-700">🧑‍🏫 ช่องแบต (ตัวส่วน):</span>
                {DENS.map((d) => (
                  <button key={d} onClick={() => setup(d, Math.min(target, d - 1) || 1)} className={cn("h-8 w-8 rounded-lg border-2 text-base font-extrabold transition", den === d ? "border-sky-500 bg-sky-100 text-sky-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>{d}</button>
                ))}
                <span className="mx-1 text-slate-300">|</span>
                <span className="text-sm font-extrabold text-cyan-700">⚡ เป้าชาร์จ (ตัวเศษ):</span>
                <button onClick={() => setup(den, Math.max(1, target - 1))} className="h-8 w-8 rounded-lg border-2 border-slate-200 bg-white text-lg font-extrabold text-slate-600 active:scale-95">−</button>
                <span className="w-6 text-center text-2xl font-extrabold text-cyan-600">{target}</span>
                <button onClick={() => setup(den, Math.min(den - 1, target + 1))} className="h-8 w-8 rounded-lg border-2 border-slate-200 bg-white text-lg font-extrabold text-slate-600 active:scale-95">+</button>
                <span className="mx-1 text-slate-300">|</span>
                <span className="text-xs font-extrabold text-slate-500">หุ่น:</span>
                {ROBOT_COLORS.map((r, i) => (
                  <button key={i} onClick={() => setRobotIdx(i)} className={cn("h-6 w-6 rounded-full border-2 transition", robotIdx === i ? "scale-110 border-slate-700" : "border-white")} style={{ background: r.body }} title={r.name} />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 rounded-2xl bg-white/90 px-4 py-2 ring-1 ring-cyan-200">
                <span className="text-base font-extrabold text-cyan-700">🎯 หุ่นตัวที่ {round}/{MISSIONS_TOTAL}</span>
                <span className="text-base font-extrabold text-sky-600">🏅 {score}</span>
              </div>
            )}

            {/* โจทย์ */}
            <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-sky-200 bg-white/95 px-5 py-2.5 shadow-sm">
              <span className="text-base font-extrabold text-slate-700 sm:text-lg">{robot.name}ต้องการพลังงาน</span>
              <StackedFraction numerator={target} denominator={den} className="text-3xl sm:text-4xl" toneClassName="text-cyan-600" />
              <span className="text-base font-extrabold text-slate-700 sm:text-lg">ก้อนพอดี — ห้ามขาด ห้ามเกิน!</span>
            </div>

            {/* ฉาก: หุ่นยนต์ + แบต */}
            <div className="rounded-2xl border-2 border-sky-200 bg-gradient-to-b from-slate-100/70 to-sky-50/70 p-3">
              <div className="flex flex-wrap items-center justify-center gap-5">
                <div className="relative flex shrink-0 flex-col items-center">
                  <Robot c={robot} mood={mood} power={filled / den} size={150} />
                  <span className="mt-0.5 rounded-full bg-sky-600 px-2 py-0.5 text-[11px] font-extrabold text-white">{robot.name}</span>
                  {/* สายฟ้าวิ่งจากแบต (ขวา) เข้าตัวหุ่น (ซ้าย) ทุกครั้งที่เติมพลัง */}
                  {zapFlash > 0 && (
                    <svg key={zapFlash} viewBox="0 0 120 40" className="pointer-events-none absolute -right-16 top-1/2 z-10 h-8 w-24 -translate-y-1/2" aria-hidden style={{ overflow: "visible" }}>
                      <polyline className="rb-zapflow" points="118,20 96,10 80,26 60,8 44,28 26,12 4,20" fill="none" stroke="#fde047" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
                      <polyline className="rb-zapflow" points="118,20 96,10 80,26 60,8 44,28 26,12 4,20" fill="none" stroke="#fff" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                {/* แบตเตอรี่ยักษ์ */}
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center">
                    <div className="flex overflow-hidden rounded-xl border-4 border-slate-600 bg-white" style={{ width: den <= 6 ? den * 52 : den * 38 }}>
                      {Array.from({ length: den }, (_, i) => {
                        const isOn = i < filled;
                        return (
                          <button key={i} onClick={() => chargeTo(i)} disabled={done}
                            className={cn("relative h-20 flex-1 border-r-2 border-slate-300 transition-colors last:border-r-0", isOn ? "bg-gradient-to-b from-lime-300 to-green-500" : "bg-slate-100 hover:bg-sky-100")}
                            aria-label={`ช่องที่ ${i + 1}`}>
                            {isOn && <Zap key={filled} size={16} className="rb-cellpop absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow" fill="#fff" />}
                          </button>
                        );
                      })}
                    </div>
                    <div className="h-8 w-3 rounded-r-md bg-slate-600" />
                  </div>
                  <span className="rounded-full bg-white px-4 py-1 text-sm font-extrabold text-slate-600 shadow-sm ring-1 ring-sky-200">
                    เติมแล้ว <b className="text-green-600">{filled}</b> จาก <b className="text-sky-700">{den}</b> ช่อง
                    {filled > 0 && <> = <Frac n={filled} d={den} tone="text-cyan-600" /></>}
                  </span>
                  {!done && (
                    <button onClick={powerOn} className="inline-flex items-center gap-2 rounded-xl border-b-4 border-cyan-700 bg-gradient-to-b from-cyan-500 to-cyan-600 px-8 py-2.5 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.97] active:border-b-2">
                      ⚡ เปิดสวิตช์!
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ผล */}
            {(done || state === "zap") && (
              <div className={cn("rounded-2xl border-2 p-3 text-center", done ? "border-emerald-300 bg-emerald-50" : "border-rose-300 bg-rose-50")}>
                <p className={cn("text-base font-extrabold", done ? "text-emerald-700" : "text-rose-600")}>
                  {done
                    ? <>🎉 {robot.name}เต้นเลย! ชาร์จ <b>{target}</b> ช่อง จากแบต <b>{den}</b> ช่อง = <Frac n={target} d={den} /> พอดีเป๊ะ</>
                    : <>💥 ช็อต! ตอนนี้ <Frac n={filled} d={den} /> แต่หุ่นต้องการ <Frac n={target} d={den} /> — {filled > target ? "พลังเกิน เอาออกบ้าง" : "พลังไม่พอ เติมเพิ่ม"}</>}
                </p>
                {done && (
                  mode === "mission" ? (
                    <button onClick={nextMission} className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-500 px-6 py-2 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                      {round >= MISSIONS_TOTAL ? "🏁 ดูสรุปผล" : <>หุ่นตัวต่อไป <ArrowRight size={16} /></>}
                    </button>
                  ) : (
                    <button onClick={() => setup(den, target)} className="mt-2 inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-5 py-2 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50">
                      <RotateCcw size={15} /> ชาร์จใหม่
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
