"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Volume2, VolumeX, FlaskConical, Target, ArrowRight } from "lucide-react";
import { Frac } from "@/components/lessons/Frac";
import { cn } from "@/lib/cn";
import { randInt } from "@/lib/randomFraction";

/* ─────────────────────────────────────────────
   ครัวเค้กแม่มดน้อย 🧁 — "ส่วนแบ่งต้องเท่ากัน"
   แม่มดเสกเค้กมา 3 ถาด (ตัดคนละแบบ) เด็กเลือกถาดที่แบ่ง "เท่ากันจริง"
   ตอบถูก → คาถาสำเร็จ เค้กเรืองแสง / ตอบผิด → ควันปุ๋ย เค้กเบี้ยวโชว์เหตุผล
   ───────────────────────────────────────────── */

const MISSIONS_TOTAL = 8;
const DENS = [2, 3, 4, 5, 6, 8];

type SoundKind = "magic" | "poof" | "correct" | "wrong" | "start" | "star";

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
      case "magic": return tones([880, 1175, 1568, 2093], 0.05, 0.14, "triangle", 0.08);
      case "poof": return tones([300, 220, 160], 0.06, 0.14, "sawtooth", 0.06);
      case "correct": return tones([660, 990, 1319], 0.06, 0.1, "triangle", 0.14);
      case "wrong": return tones([220, 165], 0.11, 0.18, "sawtooth", 0.09);
      case "start": return tones([523, 659, 784], 0.07, 0.12, "triangle", 0.14);
      case "star": return tones([1047, 1319, 1568, 2093], 0.07, 0.14, "triangle", 0.14);
    }
  }
  return { play, ensure };
}

/* เพลงครัวแม่มด (ชิปทูนโทนลึกลับน่ารัก) */
const WC_LEAD = [69, 0, 72, 0, 76, 72, 69, 0, 71, 0, 74, 0, 77, 74, 71, 0, 69, 0, 72, 76, 0, 79, 76, 72, 74, 71, 68, 0, 69, 0, 0, 0];
const WC_BASS = [45, 52, 45, 52, 47, 54, 47, 54, 45, 52, 45, 52, 44, 51, 47, 45];

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
      const m = WC_LEAD[s];
      if (m) note(m, 0.22, "triangle", 0.026);
      if (s % 2 === 0) {
        const b = WC_BASS[s / 2];
        if (b) note(b, 0.34, "sine", 0.05);
      }
    }, 215);
  }
  function stop() { if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; } }
  useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);
  return { start, stop };
}

/* ── แม่มดน้อย (SVG) ── */
function LittleWitch({ mood, size = 96 }: { mood: "normal" | "happy" | "oops"; size?: number }) {
  return (
    <svg viewBox="0 0 60 78" width={size * 0.77} height={size} role="img" aria-label="แม่มดน้อย" style={{ overflow: "visible" }}>
      <style>{`
        @keyframes wcFloat { 0%,100% { transform: translateY(0) rotate(-1.5deg); } 50% { transform: translateY(-3px) rotate(1.5deg); } }
        @keyframes wcWave { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(-22deg); } }
        @keyframes wcTip { 0%,100% { opacity: .4; r: 1.6px; } 50% { opacity: 1; r: 3px; } }
        .wc-float { animation: wcFloat 2.4s ease-in-out infinite; }
        .wc-wave { animation: wcWave 1.1s ease-in-out infinite; }
        .wc-tip { animation: wcTip 1.1s ease-in-out infinite; }
      `}</style>
      <g className="wc-float">
      {/* หมวกแม่มด */}
      <path d="M14,26 Q30,20 46,26 L48,29 Q30,34 12,29 Z" fill="#6d28d9" stroke="#4c1d95" strokeWidth={1.4} />
      <path d="M22,26 Q26,8 34,4 Q34,16 40,26 Z" fill="#7c3aed" stroke="#4c1d95" strokeWidth={1.4} />
      <circle cx={34} cy={5} r={2.5} fill="#facc15" />
      <rect x={24} y={22} width={14} height={4} rx={1} fill="#facc15" opacity={0.9} />
      {/* ผม */}
      <path d="M17,30 Q15,44 18,50 L22,48 Q20,38 21,31 Z" fill="#b45309" />
      <path d="M43,30 Q45,44 42,50 L38,48 Q40,38 39,31 Z" fill="#b45309" />
      {/* หน้า */}
      <circle cx={30} cy={36} r={11} fill="#ffe0c4" stroke="#00000018" strokeWidth={1} />
      <circle cx={26} cy={35} r={1.6} fill="#1e293b" />
      <circle cx={34} cy={35} r={1.6} fill="#1e293b" />
      {mood === "happy" && <path d="M25,40 Q30,44 35,40" stroke="#1e293b" strokeWidth={1.6} fill="none" strokeLinecap="round" />}
      {mood === "normal" && <path d="M26,40.5 Q30,42.5 34,40.5" stroke="#1e293b" strokeWidth={1.5} fill="none" strokeLinecap="round" />}
      {mood === "oops" && <ellipse cx={30} cy={41.5} rx={2.6} ry={3.2} fill="#1e293b" />}
      <circle cx={23} cy={39} r={2} fill="#fb7185" opacity={0.5} />
      <circle cx={37} cy={39} r={2} fill="#fb7185" opacity={0.5} />
      {/* ชุด */}
      <path d="M20,48 L40,48 L45,72 L15,72 Z" fill="#7c3aed" stroke="#4c1d95" strokeWidth={1.4} />
      <path d="M26,48 L34,48 L33,60 L27,60 Z" fill="#a78bfa" />
      {/* แขน + ไม้กายสิทธิ์ (โบกร่ายเวทตลอด) */}
      <rect x={12} y={50} width={9} height={4.5} rx={2.2} fill="#7c3aed" transform="rotate(24 12 50)" />
      <g className="wc-wave" style={{ transformOrigin: "42px 52px" }}>
        <rect x={40} y={48} width={11} height={4.5} rx={2.2} fill="#7c3aed" transform="rotate(-32 40 48)" />
        <line x1={50} y1={42} x2={57} y2={34} stroke="#92400e" strokeWidth={2.5} strokeLinecap="round" />
        <path d="M57,34 l1.8,-4 1.2,4.2 4.2,1 -4,1.8 1,4.2 -3.2-3 -3.8,2 1.8-3.9 -3-3.1 Z" fill="#facc15" transform="scale(0.62) translate(35 20)" />
        <circle className="wc-tip" cx={58} cy={33} r={2.2} fill="#fde047" opacity={0.9} />
      </g>
      {/* รองเท้า */}
      <ellipse cx={22} cy={74} rx={6} ry={2.8} fill="#3b0764" />
      <ellipse cx={38} cy={74} rx={6} ry={2.8} fill="#3b0764" />
      </g>
    </svg>
  );
}

/* ── เค้กกลมแบ่งชิ้น (เท่า/ไม่เท่า) ── */
function CakeCircle({ den, equal, seed, size = 128, glow, chosenWrong }: {
  den: number; equal: boolean; seed: number; size?: number; glow?: boolean; chosenWrong?: boolean;
}) {
  const R = 56, CX = 64, CY = 64;
  /* มุมตัด: เท่ากัน = ทุกชิ้น 360/den · ไม่เท่ากัน = สุ่มเพี้ยนแบบ deterministic จาก seed */
  const angles: number[] = [];
  if (equal) {
    for (let i = 0; i <= den; i++) angles.push((i * 360) / den);
  } else {
    let acc = 0;
    const weights: number[] = [];
    for (let i = 0; i < den; i++) weights.push(1 + (((seed * 37 + i * 61) % 90) / 100) * (i % 2 === 0 ? 1.15 : -0.62));
    const total = weights.reduce((a, b) => a + b, 0);
    angles.push(0);
    for (let i = 0; i < den; i++) { acc += (weights[i] / total) * 360; angles.push(acc); }
  }
  const pt = (deg: number, r: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)];
  };
  const FILLS = ["#fbcfe8", "#fde68a", "#bfdbfe", "#bbf7d0", "#ddd6fe", "#fed7aa", "#fecaca", "#a7f3d0"];
  return (
    <svg viewBox="0 0 128 128" width={size} height={size} role="img" aria-label={equal ? "เค้กแบ่งเท่ากัน" : "เค้กแบ่งไม่เท่ากัน"}>
      {glow && <circle cx={CX} cy={CY} r={R + 5} fill="none" stroke="#facc15" strokeWidth={4} opacity={0.85} />}
      {chosenWrong && <circle cx={CX} cy={CY} r={R + 5} fill="none" stroke="#f43f5e" strokeWidth={4} strokeDasharray="6 5" opacity={0.9} />}
      <circle cx={CX} cy={CY + 3} r={R} fill="#00000018" />
      {Array.from({ length: den }, (_, i) => {
        const a0 = angles[i], a1 = angles[i + 1];
        const [x0, y0] = pt(a0, R);
        const [x1, y1] = pt(a1, R);
        const large = a1 - a0 > 180 ? 1 : 0;
        return (
          <path key={i} d={`M ${CX} ${CY} L ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1} Z`}
            fill={FILLS[i % FILLS.length]} stroke="#9d5b2b" strokeWidth={2} />
        );
      })}
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="#7c3f14" strokeWidth={3} />
      {/* เชอร์รี่กลาง */}
      <circle cx={CX} cy={CY} r={4.5} fill="#ef4444" stroke="#991b1b" strokeWidth={1} />
    </svg>
  );
}

type Tray = { equal: boolean; seed: number };

function makeTrays(): { trays: Tray[]; correct: number } {
  const correct = randInt(0, 2);
  const trays: Tray[] = [0, 1, 2].map((i) => ({ equal: i === correct, seed: randInt(1, 999) }));
  return { trays, correct };
}

export function IntroWitchCakeGame() {
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
  const [{ trays, correct }, setBoard] = useState(() => makeTrays());
  const [picked, setPicked] = useState<number | null>(null);
  const [boardId, setBoardId] = useState(0);   // เพิ่มทุกครั้งที่เสกถาดใหม่ → รีเพลย์อนิเมชันโผล่

  /* ภารกิจ */
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [firstTry, setFirstTry] = useState(true);
  const [gameOver, setGameOver] = useState(false);

  const solved = picked === correct;

  function newBoard(nd = den) {
    ensure(); play("magic");
    setDen(nd);
    setBoard(makeTrays());
    setPicked(null);
    setFirstTry(true);
    setBoardId((b) => b + 1);
  }

  function pick(i: number) {
    if (solved) return;
    ensure();
    setPicked(i);
    if (i === correct) {
      play("magic"); play("correct");
      if (mode === "mission") setScore((s) => s + (firstTry ? 25 : 10));
    } else {
      play("poof"); play("wrong");
      setFirstTry(false);
    }
  }

  function startMissions() {
    ensure(); play("start");
    setScore(0); setRound(1); setGameOver(false);
    newBoard(DENS[randInt(0, DENS.length - 1)]);
    setMode("mission");
  }
  function nextMission() {
    if (round >= MISSIONS_TOTAL) { setGameOver(true); play("star"); return; }
    setRound((r) => r + 1);
    newBoard(DENS[randInt(0, DENS.length - 1)]);
  }

  const stars = score >= 170 ? 3 : score >= 100 ? 2 : 1;
  const order = ["ถาดซ้าย", "ถาดกลาง", "ถาดขวา"];

  return (
    <div className="relative overflow-hidden rounded-2xl p-3 sm:p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-violet-100 via-purple-50 to-fuchsia-50" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden text-2xl" aria-hidden>
        <span className="absolute left-4 top-4 opacity-40">🔮</span>
        <span className="absolute right-8 top-7 opacity-40">✨</span>
        <span className="absolute bottom-8 right-6 opacity-30">🦇</span>
      </div>

      <div className="relative space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex rounded-xl border-2 border-slate-200 bg-white p-1">
            <button onClick={() => { setMode("lab"); newBoard(); }} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "lab" ? "bg-violet-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <FlaskConical size={15} /> โหมดครู
            </button>
            <button onClick={startMissions} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "mission" ? "bg-fuchsia-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <Target size={15} /> โหมดฝึกคาถา
            </button>
          </div>
          <button onClick={() => setMuted((m) => !m)} className="grid h-9 w-9 place-items-center rounded-xl border-2 border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50" title={muted ? "เปิดเสียง" : "ปิดเสียง"}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {mode === "mission" && gameOver ? (
          <div className="space-y-4 rounded-2xl border-2 border-fuchsia-300 bg-white/90 p-6 text-center">
            <div className="text-5xl">🧁🏆</div>
            <h3 className="text-xl font-extrabold text-slate-800 sm:text-2xl">จบคอร์สคาถาแบ่งเค้ก!</h3>
            <p className="text-2xl">{"⭐".repeat(stars)}{"☆".repeat(3 - stars)}</p>
            <p className="text-base font-extrabold text-fuchsia-700">🏅 คะแนนรวม {score}</p>
            <button onClick={startMissions} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
              <Play size={18} /> เรียนคาถาอีกครั้ง
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* แถบตั้งค่า / สถานะ */}
            {mode === "lab" ? (
              <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-violet-200 bg-white/90 px-3 py-2">
                <span className="text-sm font-extrabold text-violet-700">🧑‍🏫 แบ่งเค้กเป็นกี่ชิ้น:</span>
                {DENS.map((d) => (
                  <button key={d} onClick={() => newBoard(d)} className={cn("h-8 w-8 rounded-lg border-2 text-base font-extrabold transition", den === d ? "border-violet-500 bg-violet-100 text-violet-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>{d}</button>
                ))}
                <button onClick={() => newBoard()} className="ml-2 inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-3 py-1.5 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50">
                  <RotateCcw size={14} /> เสกถาดใหม่
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 rounded-2xl bg-white/90 px-4 py-2 ring-1 ring-fuchsia-200">
                <span className="text-base font-extrabold text-fuchsia-700">🎯 คาถาที่ {round}/{MISSIONS_TOTAL}</span>
                <span className="text-base font-extrabold text-violet-600">🏅 {score}</span>
              </div>
            )}

            {/* โจทย์ */}
            <div className="rounded-2xl border-2 border-violet-200 bg-white/95 px-4 py-3 text-center shadow-sm">
              <p className="text-base font-extrabold leading-relaxed text-slate-700 sm:text-lg">
                แม่มดน้อยเสกเค้กมา 3 ถาด ตัดเป็น <span className="text-violet-700">{den} ชิ้น</span> เหมือนกัน —
                แต่มีถาดเดียวที่แบ่ง<span className="text-fuchsia-600">เท่ากันจริง ๆ</span> ช่วยชี้ให้หน่อย!
              </p>
              <p className="mt-1 text-xs font-bold text-slate-400">💡 เศษส่วนจะเกิดได้ ต้องแบ่งทุกชิ้นให้ &ldquo;เท่ากัน&rdquo; ก่อนเสมอ</p>
            </div>

            {/* ฉาก: แม่มด + 3 ถาด */}
            <div className="rounded-2xl border-2 border-violet-200 bg-gradient-to-b from-purple-100/60 to-violet-50/60 p-3">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <div className="flex shrink-0 flex-col items-center">
                  <LittleWitch mood={solved ? "happy" : picked !== null ? "oops" : "normal"} size={110} />
                  <span className="mt-0.5 rounded-full bg-violet-600 px-2 py-0.5 text-[11px] font-extrabold text-white">แม่มดมิว</span>
                </div>
                <div className="grid flex-1 grid-cols-3 gap-2 sm:gap-4" style={{ minWidth: 300 }}>
                  <style>{`
                    @keyframes wcTrayPop { 0% { transform: scale(0.2) rotate(-18deg); opacity: 0; } 65% { transform: scale(1.12) rotate(4deg); } 100% { transform: scale(1) rotate(0); opacity: 1; } }
                    @keyframes wcSpark { 0% { transform: scale(0) rotate(0); opacity: 0; } 30% { opacity: 1; } 100% { transform: scale(1.6) rotate(60deg); opacity: 0; } }
                    .wc-tray { animation: wcTrayPop 0.42s cubic-bezier(.4,1.5,.5,1) both; }
                    .wc-spark { animation: wcSpark 0.6s ease-out both; }
                  `}</style>
                  {trays.map((t, i) => (
                    <button key={`${boardId}-${i}`} onClick={() => pick(i)} disabled={solved}
                      className={cn("wc-tray group relative flex flex-col items-center gap-1 rounded-2xl border-2 bg-white/80 p-2 transition sm:p-3",
                        solved && i === correct ? "border-amber-400 bg-amber-50 shadow-lg" :
                        picked === i && i !== correct ? "border-rose-300 bg-rose-50" :
                        "border-violet-200 hover:border-violet-400 hover:shadow-md active:scale-95")}
                      style={{ animationDelay: `${i * 0.13}s` }}>
                      {/* ประกายเวทมนตร์ตอนถาดโผล่ */}
                      {!solved && picked === null && (
                        <span className="pointer-events-none absolute inset-0 z-10 overflow-visible" aria-hidden>
                          {[[18, 20, 0], [80, 16, 0.15], [50, 78, 0.28], [86, 70, 0.1]].map(([x, y, d], k) => (
                            <span key={k} className="wc-spark absolute text-lg" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${(i * 0.13) + (d as number)}s` }}>✨</span>
                          ))}
                        </span>
                      )}
                      <CakeCircle den={den} equal={t.equal} seed={t.seed} size={116}
                        glow={solved && i === correct} chosenWrong={picked === i && i !== correct} />
                      <span className="text-xs font-extrabold text-slate-500">{order[i]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ผลลัพธ์ */}
            {picked !== null && (
              <div className={cn("rounded-2xl border-2 p-3 text-center", solved ? "border-emerald-300 bg-emerald-50" : "border-rose-300 bg-rose-50")}>
                <p className={cn("text-base font-extrabold", solved ? "text-emerald-700" : "text-rose-600")}>
                  {solved
                    ? <>✨ คาถาสำเร็จ! ถาดนี้ทุกชิ้น<b>เท่ากัน</b> — 1 ชิ้น = <Frac n={1} d={den} /> ของเค้กพอดี</>
                    : <>💨 ปุ๋ง! ถาดนั้นชิ้น<b>ไม่เท่ากัน</b> — บางชิ้นใหญ่ บางชิ้นเล็ก จึงเรียก <Frac n={1} d={den} /> ไม่ได้ ลองใหม่!</>}
                </p>
                {solved && (
                  mode === "mission" ? (
                    <button onClick={nextMission} className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-500 px-6 py-2 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                      {round >= MISSIONS_TOTAL ? "🏁 ดูสรุปผล" : <>คาถาต่อไป <ArrowRight size={16} /></>}
                    </button>
                  ) : (
                    <button onClick={() => newBoard()} className="mt-2 inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-5 py-2 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50">
                      <RotateCcw size={15} /> เสกถาดใหม่
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
