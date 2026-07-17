"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Volume2, VolumeX, FlaskConical, Target, ArrowRight, Shirt } from "lucide-react";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { ThaiAvatar, AvatarPicker, usePlayerAvatar, randomAvatar, type AvatarConfig } from "@/components/avatar/ThaiAvatar";
import { FRAC_TYPES, TYPE_INFO, makeFraction, randomType, type FracType, type TypedFraction } from "@/lib/fractionTypes";
import { ThaiBackdrop } from "@/components/games/ThaiScenery";
import { cn } from "@/lib/cn";
import { randInt } from "@/lib/randomFraction";

/* ─────────────────────────────────────────────
   รถสองแถวสายเศษส่วน 🛺
   ผู้โดยสาร (จิบิไทยสุ่มหน้าตา) ถือป้ายเศษส่วนเดินมา
   เด็กเลือกส่งขึ้นรถให้ถูกสาย: แท้ / เกิน / คละ
   ผู้เล่นเป็น "กระเป๋ารถ" — แต่งตัวเองได้
   ───────────────────────────────────────────── */

const MISSIONS_TOTAL = 8;

type SoundKind = "horn" | "board" | "correct" | "wrong" | "start" | "star";

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
      case "horn": return tones([440, 554], 0.08, 0.16, "square", 0.08);
      case "board": return tones([523, 659, 784], 0.05, 0.09, "triangle", 0.1);
      case "correct": return tones([660, 990, 1319], 0.06, 0.1, "triangle", 0.14);
      case "wrong": return tones([220, 165], 0.11, 0.18, "sawtooth", 0.09);
      case "start": return tones([523, 659, 784], 0.07, 0.12, "triangle", 0.14);
      case "star": return tones([1047, 1319, 1568, 2093], 0.07, 0.14, "triangle", 0.14);
    }
  }
  return { play, ensure };
}

/* เพลงท่ารถสนุก ๆ */
const BUS_LEAD = [67, 0, 67, 64, 67, 0, 72, 0, 71, 0, 67, 64, 62, 0, 0, 0, 67, 0, 67, 64, 67, 0, 74, 0, 72, 71, 69, 67, 72, 0, 0, 0];
const BUS_BASS = [43, 50, 43, 50, 48, 55, 48, 55, 47, 54, 47, 54, 43, 50, 48, 43];

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
      const m = BUS_LEAD[s];
      if (m) note(m, 0.18, "square", 0.024);
      if (s % 2 === 0) {
        const b = BUS_BASS[s / 2];
        if (b) note(b, 0.3, "triangle", 0.05);
      }
    }, 195);
  }
  function stop() { if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; } }
  useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);
  return { start, stop };
}

/* ── ป้ายเศษส่วนที่ผู้โดยสารถือ ── */
function FractionSign({ f }: { f: TypedFraction }) {
  return (
    <div className="flex items-center gap-1 rounded-xl border-2 border-slate-300 bg-white px-2.5 py-1 shadow-md">
      {f.whole > 0 && <span className="text-xl font-black text-slate-800">{f.whole}</span>}
      <StackedFraction numerator={f.num} denominator={f.den} className="text-base" toneClassName="text-slate-800" />
    </div>
  );
}

/* ── รถสองแถว (ล้อหมุน + ควันตอนวิ่งออก) ── */
const BUS_CAP = 3;

function Wheel({ cx, cy, r, spinning }: { cx: number; cy: number; r: number; spinning: boolean }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#1e293b" />
      <g className={spinning ? "tb-spin" : undefined} style={{ transformOrigin: `${cx}px ${cy}px` }}>
        <circle cx={cx} cy={cy} r={r * 0.45} fill="#94a3b8" />
        <line x1={cx - r * 0.8} y1={cy} x2={cx + r * 0.8} y2={cy} stroke="#cbd5e1" strokeWidth={1.6} />
        <line x1={cx} y1={cy - r * 0.8} x2={cx} y2={cy + r * 0.8} stroke="#cbd5e1" strokeWidth={1.6} />
      </g>
    </g>
  );
}

function Songthaew({ type, boarded, wrongShake, driving }: { type: FracType; boarded: AvatarConfig[]; wrongShake: boolean; driving: boolean }) {
  const info = TYPE_INFO[type];
  return (
    <svg viewBox="0 0 150 100" className={cn("w-full", wrongShake && "tb-shake")} role="img" aria-label={`รถสาย${info.label}`} style={{ overflow: "visible" }}>
      {/* ควันท่อไอเสียตอนออกตัว */}
      {driving && (
        <g className="tb-smoke">
          <circle cx={2} cy={70} r={5} fill="#94a3b8" opacity={0.6} />
          <circle cx={-7} cy={64} r={7} fill="#94a3b8" opacity={0.45} />
          <circle cx={-17} cy={58} r={9} fill="#94a3b8" opacity={0.3} />
        </g>
      )}
      {/* เงาใต้รถ */}
      <ellipse cx={78} cy={90} rx={68} ry={5} fill="#000000" opacity={0.14} />
      {/* ตัวถัง */}
      <rect x={8} y={30} width={118} height={44} rx={6} fill={info.color} stroke="#00000030" strokeWidth={2} />
      <rect x={8} y={30} width={118} height={12} rx={6} fill="#ffffff2e" />
      {/* หลังคา */}
      <rect x={4} y={22} width={126} height={12} rx={5} fill={info.color} stroke="#00000030" strokeWidth={2} />
      <rect x={4} y={22} width={126} height={5} rx={2.5} fill="#ffffff44" />
      {/* ห้องคนขับ */}
      <path d="M126,34 L142,40 Q146,42 146,48 L146,68 Q146,74 140,74 L126,74 Z" fill={info.color} stroke="#00000030" strokeWidth={2} />
      <path d="M128,38 L139,42.5 Q141,43.5 141,46 L141,52 L128,52 Z" fill="#bfe3f2" stroke="#00000022" strokeWidth={1.2} />
      {/* ห้องโดยสาร: เบาะยาวสองแถว + ผู้โดยสารนั่ง (แผงข้างรถบังช่วงขา) */}
      <rect x={14} y={35} width={106} height={33} rx={4} fill="#241a12" opacity={0.32} />
      {/* พนักพิงเบาะ */}
      <rect x={16} y={39} width={102} height={7} rx={2.5} fill="#9a6a3a" />
      <rect x={16} y={39} width={102} height={2.5} rx={1.2} fill="#c9975f" />
      {/* ผู้โดยสารนั่ง (ครึ่งตัวโผล่พ้นแผงข้างรถ) */}
      {boarded.slice(-BUS_CAP).map((p, i) => (
        <g key={i} transform={`translate(${20 + i * 33}, 28) scale(0.31)`}>
          <ThaiAvatarInline a={p} />
        </g>
      ))}
      {/* เบาะนั่ง + แผงข้างรถ (บังขา = ดูเหมือนนั่งจริง) */}
      <rect x={14} y={56} width={106} height={4} rx={2} fill="#6b4a26" />
      <rect x={8} y={59} width={118} height={15} rx={3} fill={info.color} />
      <rect x={8} y={59} width={118} height={15} rx={3} fill="#00000018" />
      <rect x={8} y={59.5} width={118} height={3} fill="#ffffff2c" />
      {/* เสารั้บหลังคา */}
      <rect x={13} y={34} width={3} height={26} fill={info.color} stroke="#00000025" strokeWidth={0.8} />
      <rect x={65} y={34} width={3} height={26} fill={info.color} stroke="#00000025" strokeWidth={0.8} />
      <rect x={118} y={34} width={3} height={26} fill={info.color} stroke="#00000025" strokeWidth={0.8} />
      {/* ป้ายสาย */}
      <rect x={30} y={8} width={76} height={15} rx={7} fill="#fff" stroke={info.color} strokeWidth={2.4} />
      <text x={68} y={19} fontSize={10.5} fontWeight={900} fill={info.color} textAnchor="middle">สาย{info.label}</text>
      {/* ป้ายนับที่นั่ง */}
      <circle cx={120} cy={16} r={9} fill={info.color} stroke="#fff" strokeWidth={2} />
      <text x={120} y={19.5} fontSize={9} fontWeight={900} fill="#fff" textAnchor="middle">{boarded.length}/{BUS_CAP}</text>
      {/* ล้อ */}
      <Wheel cx={36} cy={78} r={10} spinning={driving} />
      <Wheel cx={104} cy={78} r={10} spinning={driving} />
      <Wheel cx={134} cy={78} r={9} spinning={driving} />
    </svg>
  );
}

/* avatar สำหรับใช้ใน <svg> */
function ThaiAvatarInline({ a }: { a: AvatarConfig }) {
  return (
    <foreignObject width={82} height={124}>
      <ThaiAvatar a={a} size={122} mood="happy" />
    </foreignObject>
  );
}

export function TypesBusGame() {
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

  /* ผู้เล่น (กระเป๋ารถ) — แต่งตัวได้ */
  const [player, setPlayer] = usePlayerAvatar();
  const [showDress, setShowDress] = useState(false);

  /* ผู้โดยสารปัจจุบัน + สถานะเดิน/ขึ้นรถ/รถออก */
  const [seed, setSeed] = useState(() => randInt(1, 9999));
  const [frac, setFrac] = useState<TypedFraction>(() => makeFraction("proper"));
  const [picked, setPicked] = useState<FracType | null>(null);
  const [boarded, setBoarded] = useState<Record<FracType, AvatarConfig[]>>({ proper: [], improper: [], mixed: [] });
  const [walk, setWalk] = useState<"enter" | "stand" | "board" | "gone">("enter");
  const [departing, setDeparting] = useState<FracType | null>(null);
  const [busKey, setBusKey] = useState<Record<FracType, number>>({ proper: 0, improper: 0, mixed: 0 });
  const timeoutsRef = useRef<number[]>([]);
  useEffect(() => () => timeoutsRef.current.forEach((t) => window.clearTimeout(t)), []);
  const passenger = randomAvatar(seed);

  /* ภารกิจ */
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [firstTry, setFirstTry] = useState(true);
  const [gameOver, setGameOver] = useState(false);

  const correct = frac.type;
  const solved = picked === correct;

  function nextPassenger(type?: FracType) {
    setSeed(randInt(1, 99999));
    setFrac(makeFraction(type ?? randomType()));
    setPicked(null);
    setFirstTry(true);
    setWalk("enter");
    timeoutsRef.current.push(window.setTimeout(() => setWalk("stand"), 1150));
  }

  /* เดินเข้าฉากตอนเริ่มครั้งแรก */
  useEffect(() => {
    timeoutsRef.current.push(window.setTimeout(() => setWalk("stand"), 1150));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pickBus(t: FracType) {
    if (solved || walk === "enter" || walk === "board") return;
    ensure();
    setPicked(t);
    if (t === correct) {
      play("correct");
      if (mode === "mission") setScore((s) => s + (firstTry ? 25 : 10));
      /* เดินไปขึ้นรถ */
      setWalk("board");
      const snap = passenger;
      timeoutsRef.current.push(window.setTimeout(() => {
        play("board");
        setWalk("gone");
        setBoarded((b) => {
          const next = { ...b, [t]: [...b[t], snap] };
          /* ครบ 3 คน → รถออก! */
          if (next[t].length >= BUS_CAP) {
            timeoutsRef.current.push(window.setTimeout(() => {
              play("horn");
              setDeparting(t);
              timeoutsRef.current.push(window.setTimeout(() => {
                setBoarded((b2) => ({ ...b2, [t]: [] }));
                setBusKey((k) => ({ ...k, [t]: k[t] + 1 }));
                setDeparting(null);
              }, 1350));
            }, 550));
          }
          return next;
        });
      }, 950));
    } else {
      play("horn"); play("wrong");
      setFirstTry(false);
    }
  }

  function startMissions() {
    ensure(); play("start");
    setScore(0); setRound(1); setGameOver(false);
    setBoarded({ proper: [], improper: [], mixed: [] });
    nextPassenger();
    setMode("mission");
  }
  function nextMission() {
    if (round >= MISSIONS_TOTAL) { setGameOver(true); play("star"); return; }
    setRound((r) => r + 1);
    nextPassenger();
  }

  const stars = score >= 170 ? 3 : score >= 100 ? 2 : 1;

  return (
    <div className="relative overflow-hidden rounded-2xl p-3 sm:p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-100 via-amber-50 to-orange-50" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden text-2xl" aria-hidden>
        <span className="absolute left-4 top-4 opacity-40">🛺</span>
        <span className="absolute right-8 top-7 opacity-40">🚏</span>
        <span className="absolute bottom-8 right-6 opacity-30">🌴</span>
      </div>

      <div className="relative space-y-3">
        <style>{`
          @keyframes tbShake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-3px); } 75% { transform: translateX(3px); } }
          .tb-shake { animation: tbShake 0.15s linear 4; }
          @keyframes tbSpin { to { transform: rotate(360deg); } }
          .tb-spin { animation: tbSpin 0.4s linear infinite; }
          @keyframes tbSmoke { 0% { opacity: 1; transform: translateX(0); } 100% { opacity: 0; transform: translateX(-22px); } }
          .tb-smoke { animation: tbSmoke 0.7s linear infinite; }
          @keyframes tbWalkIn { from { transform: translateX(-190px); } to { transform: translateX(0); } }
          .tb-walkin { animation: tbWalkIn 1.15s linear both; }
          @keyframes tbWalkBoard { 0% { transform: translateX(0); opacity: 1; } 85% { opacity: 1; } 100% { transform: translateX(180px) translateY(26px) scale(0.8); opacity: 0; } }
          .tb-board { animation: tbWalkBoard 0.95s ease-in both; }
          .tb-gone { opacity: 0; }
          @keyframes tbBusOut { 0% { transform: translateX(0); } 100% { transform: translateX(150%); opacity: 0.3; } }
          .tb-busout { animation: tbBusOut 1.3s cubic-bezier(.5,0,.8,.4) both; }
          @keyframes tbBusIn { from { transform: translateX(-150%); } to { transform: translateX(0); } }
          .tb-busin { animation: tbBusIn 0.9s cubic-bezier(.2,.6,.4,1) both; }
        `}</style>

        <div className="flex items-center justify-between gap-2">
          <div className="flex rounded-xl border-2 border-slate-200 bg-white p-1">
            <button onClick={() => { setMode("lab"); nextPassenger(frac.type); }} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "lab" ? "bg-orange-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <FlaskConical size={15} /> โหมดครู
            </button>
            <button onClick={startMissions} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "mission" ? "bg-amber-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <Target size={15} /> โหมดกระเป๋ารถ
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowDress((v) => !v)} className={cn("flex items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 text-sm font-extrabold transition", showDress ? "border-violet-400 bg-violet-100 text-violet-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
              <Shirt size={15} /> แต่งตัว
            </button>
            <button onClick={() => setMuted((m) => !m)} className="grid h-9 w-9 place-items-center rounded-xl border-2 border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50" title={muted ? "เปิดเสียง" : "ปิดเสียง"}>
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>
        </div>

        {showDress && <AvatarPicker value={player} onChange={setPlayer} title="กระเป๋ารถของฉัน" />}

        {mode === "mission" && gameOver ? (
          <div className="space-y-4 rounded-2xl border-2 border-amber-300 bg-white/90 p-6 text-center">
            <div className="text-5xl">🛺🏆</div>
            <h3 className="text-xl font-extrabold text-slate-800 sm:text-2xl">ส่งผู้โดยสารครบทุกคน!</h3>
            <p className="text-2xl">{"⭐".repeat(stars)}{"☆".repeat(3 - stars)}</p>
            <p className="text-base font-extrabold text-amber-700">🏅 คะแนนรวม {score}</p>
            <button onClick={startMissions} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
              <Play size={18} /> เข้ากะใหม่
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* ตั้งค่า / สถานะ */}
            {mode === "lab" ? (
              <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-orange-200 bg-white/90 px-3 py-2">
                <span className="text-sm font-extrabold text-orange-700">🧑‍🏫 สุ่มผู้โดยสารถือ:</span>
                {FRAC_TYPES.map((t) => (
                  <button key={t} onClick={() => nextPassenger(t)} className="rounded-lg border-2 px-2.5 py-1 text-xs font-extrabold transition" style={{ borderColor: TYPE_INFO[t].color, color: TYPE_INFO[t].color, background: frac.type === t && !picked ? TYPE_INFO[t].bg : "#fff" }}>
                    {TYPE_INFO[t].label}
                  </button>
                ))}
                <button onClick={() => nextPassenger()} className="rounded-lg border-2 border-slate-200 bg-white px-2.5 py-1 text-xs font-extrabold text-slate-500 hover:bg-slate-50">🎲 สุ่มเอง</button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 rounded-2xl bg-white/90 px-4 py-2 ring-1 ring-amber-200">
                <span className="text-base font-extrabold text-amber-700">🎯 คนที่ {round}/{MISSIONS_TOTAL}</span>
                <span className="text-base font-extrabold text-orange-600">🏅 {score}</span>
              </div>
            )}

            {/* โจทย์ */}
            <div className="rounded-2xl border-2 border-orange-200 bg-white/95 px-4 py-2.5 text-center shadow-sm">
              <p className="text-base font-extrabold text-slate-700 sm:text-lg">
                ผู้โดยสารถือป้ายเศษส่วนมา — ช่วยกระเป๋ารถส่งขึ้น<span className="text-orange-600">รถให้ถูกสาย</span>!
              </p>
            </div>

            {/* ฉาก: ผู้โดยสาร + กระเป๋ารถ (ฉากหมู่บ้านไทย Cozy) */}
            <div className="relative overflow-hidden rounded-2xl border-2 border-orange-200 p-3">
              <ThaiBackdrop variant="village" />
              <div className="relative z-10">
              <div className="flex items-end justify-center gap-6 overflow-hidden">
                <div key={seed} className={cn("flex flex-col items-center gap-1",
                  walk === "enter" && "tb-walkin", walk === "board" && "tb-board", walk === "gone" && "tb-gone")}>
                  <FractionSign f={frac} />
                  <ThaiAvatar a={passenger} mood={solved ? "happy" : picked ? "sad" : "normal"} size={150}
                    walking={walk === "enter" || walk === "board"} />
                  <span className="rounded-full bg-slate-700 px-2 py-0.5 text-[11px] font-extrabold text-white">ผู้โดยสาร</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="rounded-xl border-2 border-amber-300 bg-white px-2.5 py-1 text-xs font-extrabold text-amber-700 shadow-sm">
                    {solved ? "เชิญขึ้นรถเลยครับ! 🙏" : picked ? "สายนั้นไม่ใช่นะ ลองใหม่!" : walk === "enter" ? "สวัสดีครับ~" : "ขึ้นสายไหนดีครับ?"}
                  </span>
                  <ThaiAvatar a={player} mood={solved ? "happy" : "normal"} size={150} />
                  <span className="rounded-full bg-amber-600 px-2 py-0.5 text-[11px] font-extrabold text-white">กระเป๋ารถ (ฉัน)</span>
                </div>
              </div>

              {/* 3 รถ — ครบ 3 คนรถออก แล้วคันใหม่เข้าแทน */}
              <div className="mt-2 grid grid-cols-3 gap-2 overflow-hidden">
                {FRAC_TYPES.map((t) => (
                  <button key={t} onClick={() => pickBus(t)} disabled={solved}
                    className={cn("rounded-2xl border-2 bg-white/80 p-1.5 transition",
                      solved && t === correct ? "border-emerald-400 bg-emerald-50 shadow-lg" :
                      picked === t && t !== correct ? "border-rose-300 bg-rose-50" :
                      "border-slate-200 hover:border-amber-400 hover:shadow-md active:scale-95")}>
                    <div key={busKey[t]} className={cn(departing === t ? "tb-busout" : busKey[t] > 0 && "tb-busin")}>
                      <Songthaew type={t} boarded={boarded[t]} wrongShake={picked === t && t !== correct} driving={departing === t} />
                    </div>
                    <p className="mt-0.5 text-center text-[11px] font-extrabold" style={{ color: TYPE_INFO[t].color }}>{TYPE_INFO[t].hint}</p>
                  </button>
                ))}
              </div>
              {departing && (
                <p className="mt-1 text-center text-sm font-extrabold text-amber-700">📣 ปี๊นๆ! รถสาย{TYPE_INFO[departing].label}รับครบ {BUS_CAP} คน ออกรถ!</p>
              )}
              </div>
            </div>

            {/* ผล */}
            {picked !== null && (
              <div className={cn("rounded-2xl border-2 p-3 text-center", solved ? "border-emerald-300 bg-emerald-50" : "border-rose-300 bg-rose-50")}>
                <p className={cn("flex flex-wrap items-center justify-center gap-1 text-base font-extrabold", solved ? "text-emerald-700" : "text-rose-600")}>
                  {solved
                    ? <>🎉 ถูกต้อง! {frac.whole > 0 && <b>{frac.whole}</b>}<StackedFraction numerator={frac.num} denominator={frac.den} className="text-sm" toneClassName="text-emerald-700" /> เป็น<b>{TYPE_INFO[correct].label}</b> — {TYPE_INFO[correct].hint}</>
                    : <>ยังไม่ใช่ — ดูดี ๆ: {correct === "mixed" ? "มีจำนวนเต็มควบอยู่ = จำนวนคละ" : correct === "proper" ? `ตัวเศษ ${frac.num} < ตัวส่วน ${frac.den} = เศษส่วนแท้` : `ตัวเศษ ${frac.num} ≥ ตัวส่วน ${frac.den} = เศษเกิน`}</>}
                </p>
                {solved && (
                  mode === "mission" ? (
                    <button onClick={nextMission} className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 px-6 py-2 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                      {round >= MISSIONS_TOTAL ? "🏁 ดูสรุปผล" : <>ผู้โดยสารคนต่อไป <ArrowRight size={16} /></>}
                    </button>
                  ) : (
                    <button onClick={() => nextPassenger()} className="mt-2 inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-5 py-2 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50">
                      🎲 ผู้โดยสารคนใหม่
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
