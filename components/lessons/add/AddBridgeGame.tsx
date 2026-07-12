"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, FlaskConical, Swords, Eye, RotateCcw, Dice5, ArrowRight } from "lucide-react";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { cn } from "@/lib/cn";
import { randInt, shuffle } from "@/lib/randomFraction";

/* ── ค่าคงที่ ── */

const TEAM_GOAL = 4;
const START_LEFT = 9;   // ตำแหน่งตัวละครบนหน้าผาซ้าย (%)
const END_LEFT = 91;    // ตำแหน่งบนหน้าผาขวา (%)
const GAP_L = 18;       // ขอบเหวซ้าย (%)
const SPAN = 64;        // ความกว้างเหว (%) — ขอบขวา = 82%
const DECK = 96;        // ระดับพื้นสะพาน (px จากล่าง)

/* ตัวละครบล็อก 5 ตัว (สไตล์เดียวกับเกมอื่น) */
const CHARS = [
  { name: "เรดดี้", body: "#ef4444", dark: "#b91c1c", skin: "#fde68a", hat: "antenna" as const },
  { name: "บลูโบ", body: "#3b82f6", dark: "#1d4ed8", skin: "#fde68a", hat: "cap" as const },
  { name: "เหมียวทอง", body: "#f59e0b", dark: "#b45309", skin: "#fef3c7", hat: "ears" as const },
  { name: "ไวโอ", body: "#a855f7", dark: "#7e22ce", skin: "#e9d5ff", hat: "antenna" as const },
  { name: "ไดโนะ", body: "#22c55e", dark: "#15803d", skin: "#bbf7d0", hat: "spikes" as const },
];

type Plank = { id: number; num: number };
type Mode = "teacher" | "duel";
type Phase = "pick" | "cross" | "ok" | "short" | "long";

/* ── โจทย์ ── */

function pickDen(level: 1 | 2): number {
  return level === 1 ? [4, 5, 6][randInt(0, 2)] : [6, 8, 10][randInt(0, 2)];
}

/**
 * สร้างกองแผ่นไม้ — เลขเศษ "ไม่ซ้ำกันเลย" + มีตัวลวง
 * ใส่คู่คำตอบที่ต่างค่ากัน (a≠b, a+b=T) ก่อน แล้วเติมตัวลวงจากเศษที่เหลือ [1..den-1]
 * เศษที่ต่างกันมีได้มากสุด den-1 แบบ จำนวนแผ่นจึงปรับตามตัวส่วน (สูงสุด 5)
 */
function genPool(den: number, T: number): Plank[] {
  let a = randInt(1, T - 1);
  while (a === T - a) a = randInt(1, T - 1); // คู่ต้องต่างค่ากัน (เลี่ยงครึ่ง-ครึ่ง)
  const b = T - a;
  const used = new Set([a, b]);
  const avail: number[] = [];
  for (let n = 1; n <= den - 1; n++) if (!used.has(n)) avail.push(n);
  const size = Math.min(5, den - 1);
  const decoys = shuffle(avail).slice(0, Math.max(0, size - 2));
  return shuffle([a, b, ...decoys]).map((n, i) => ({ id: i + 1, num: n }));
}

/* ── เสียง (Web Audio ไม่ใช้ไฟล์) ── */

type SoundKind = "place" | "step" | "cross" | "win" | "wrong" | "start";

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
      case "place": return tones([523, 784], 0.05, 0.12, "square", 0.09);
      case "step": return tones([180, 150], 0.05, 0.05, "square", 0.05);
      case "cross": return sweep(320, 620, 0.35, "triangle", 0.06);
      case "win": return tones([523, 659, 784, 1047, 1319, 1568], 0.09, 0.16, "triangle", 0.15);
      case "wrong": return sweep(420, 130, 0.45, "sawtooth", 0.09);
      case "start": return tones([392, 523, 659], 0.07, 0.12, "triangle", 0.13);
    }
  }
  return { play, ensure };
}

/* ── เพลงผจญภัย (ชิปทูน ไม่ใช้ไฟล์) ── */

const AV_LEAD = [67, 72, 71, 72, 74, 0, 72, 0, 71, 67, 69, 71, 72, 0, 0, 0, 67, 74, 72, 74, 76, 0, 74, 0, 72, 76, 79, 0, 76, 74, 72, 0];
const AV_BASS = [43, 50, 47, 50, 41, 48, 45, 48, 43, 50, 47, 50, 38, 45, 43, 45];

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
      const m = AV_LEAD[s];
      if (m) note(m, 0.17, "triangle", 0.03);
      if (s % 2 === 0) {
        const b = AV_BASS[s / 2];
        if (b) note(b, 0.3, "sine", 0.055);
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

/* ── ตัวละครบล็อก (สไตล์ Roblox) ── */

function BlockChar({ c, walking, size = 56 }: { c: typeof CHARS[number]; walking: boolean; size?: number }) {
  return (
    <svg viewBox="0 0 44 60" width={size * 0.73} height={size} className={cn(walking && "brg-walk")} role="img" aria-label={`ตัวละคร ${c.name}`}>
      {c.hat === "antenna" && <><line x1={22} y1={2} x2={22} y2={7} stroke={c.dark} strokeWidth={2} /><circle cx={22} cy={2} r={2.5} fill={c.dark} /></>}
      {c.hat === "cap" && <path d="M10,9 Q22,1 34,9 L36,11 L8,11 Z" fill={c.dark} />}
      {c.hat === "ears" && <><path d="M11,10 L14,2 L18,9 Z" fill={c.body} stroke={c.dark} strokeWidth={1.5} /><path d="M33,10 L30,2 L26,9 Z" fill={c.body} stroke={c.dark} strokeWidth={1.5} /></>}
      {c.hat === "spikes" && <><path d="M14,9 L17,3 L20,9 Z" fill={c.dark} /><path d="M20,9 L23,2 L26,9 Z" fill={c.dark} /><path d="M26,9 L29,3 L32,9 Z" fill={c.dark} /></>}
      <rect x={12} y={8} width={20} height={16} rx={3} fill={c.skin} stroke={c.dark} strokeWidth={2} />
      <rect x={17} y={13} width={3.5} height={5} rx={1} fill="#1e293b" />
      <rect x={24} y={13} width={3.5} height={5} rx={1} fill="#1e293b" />
      <path d="M18,20 Q22,22.5 26,20" stroke="#1e293b" strokeWidth={1.6} fill="none" strokeLinecap="round" />
      <rect x={13} y={25} width={18} height={17} rx={3} fill={c.body} stroke={c.dark} strokeWidth={2} />
      <rect x={19} y={29} width={6} height={6} rx={1.5} fill="#fff" opacity={0.75} />
      <g className={walking ? "brg-arm" : undefined} style={{ transformOrigin: "10px 27px" }}>
        <rect x={7} y={25} width={5} height={14} rx={2.5} fill={c.body} stroke={c.dark} strokeWidth={1.6} />
      </g>
      <g className={walking ? "brg-arm2" : undefined} style={{ transformOrigin: "34px 27px" }}>
        <rect x={32} y={25} width={5} height={14} rx={2.5} fill={c.body} stroke={c.dark} strokeWidth={1.6} />
      </g>
      <g className={walking ? "brg-leg" : undefined} style={{ transformOrigin: "17px 43px" }}>
        <rect x={14.5} y={42} width={6} height={15} rx={2.5} fill={c.dark} />
      </g>
      <g className={walking ? "brg-leg2" : undefined} style={{ transformOrigin: "27px 43px" }}>
        <rect x={23.5} y={42} width={6} height={15} rx={2.5} fill={c.dark} />
      </g>
    </svg>
  );
}

/* ── แผ่นไม้ในกอง ── */

function PlankButton({ p, den, order, disabled, onClick }: { p: Plank; den: number; order: number | null; disabled: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ width: 48 + p.num * 20 }}
      className={cn(
        "relative flex h-14 shrink-0 items-center justify-center rounded-lg border-b-[5px] transition",
        order !== null
          ? "border-amber-800 ring-2 ring-emerald-400 ring-offset-1"
          : "border-amber-800 hover:-translate-y-0.5 active:translate-y-0",
        disabled && order === null && "cursor-not-allowed opacity-40",
      )}
    >
      <span className="absolute inset-0 rounded-lg" style={{ background: "repeating-linear-gradient(90deg,#c98a3c 0 7px,#b9792f 7px 14px)" }} />
      <span className="absolute inset-x-1 top-1 h-1 rounded bg-white/25" />
      {order !== null && (
        <span className="absolute -left-2 -top-2 z-10 grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-xs font-black text-white shadow ring-2 ring-white">{order}</span>
      )}
      <StackedFraction numerator={p.num} denominator={den} className="relative z-[1] text-lg drop-shadow" toneClassName="text-white" />
    </button>
  );
}

/* ── ช่องเติมเศษในสมการ ── */

function AddendSlot({ v, den, tone }: { v: number | null; den: number; tone: string }) {
  if (v === null)
    return (
      <span className="inline-flex flex-col items-center rounded-lg border-2 border-dashed border-slate-300 px-2 py-0.5 leading-none">
        <span className="text-2xl font-black text-slate-300">?</span>
        <span className="my-0.5 h-0.5 w-5 rounded bg-slate-300" />
        <span className="text-lg font-black text-slate-400">{den}</span>
      </span>
    );
  return <StackedFraction numerator={v} denominator={den} className="text-2xl sm:text-3xl" toneClassName={tone} />;
}

/* ── ฉากสะพานข้ามเหว ── */

function BridgeScene({ den, T, selNums, char, charLeft, crossing, phase }: {
  den: number; T: number; selNums: number[]; char: typeof CHARS[number]; charLeft: number; crossing: boolean; phase: Phase;
}) {
  const U = SPAN / T; // ความกว้างต่อ 1 ขีด (%)
  const sum = selNums.reduce((s, n) => s + n, 0);
  const tones = ["#d97706", "#0284c7"]; // แผ่นที่ 1 / 2
  const darks = ["#92400e", "#075985"];
  let run = 0;
  const laid = selNums.map((n, i) => { const left = GAP_L + run * U; run += n; return { n, left, width: n * U, tone: tones[i], dark: darks[i] }; });
  const remainW = Math.max(0, (T - sum)) * U;

  return (
    <div className="relative h-[250px] overflow-hidden rounded-2xl border-2 border-amber-300">
      {/* ฟ้า + ภูเขาไกล */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-200 to-indigo-100" />
      <div className="brg-cloud pointer-events-none absolute top-4 text-3xl opacity-70">☁️</div>
      <div className="brg-cloud2 pointer-events-none absolute top-10 text-2xl opacity-50">☁️</div>
      <div className="pointer-events-none absolute right-6 top-3 text-2xl opacity-80">🦅</div>
      <div className="absolute inset-x-0" style={{ bottom: DECK, height: 60, background: "linear-gradient(180deg,transparent, #a7b5c9 90%)", clipPath: "polygon(0 100%,12% 40%,26% 75%,44% 25%,62% 65%,80% 30%,100% 70%,100% 100%)", opacity: 0.5 }} />

      {/* เหวลึก (ระหว่างหน้าผา) */}
      <div className="absolute inset-x-0 bottom-0" style={{ height: DECK, background: "linear-gradient(180deg,#334155,#0f172a)" }}>
        <div className="absolute inset-x-0 top-6 text-center text-xl opacity-30">🌫️</div>
      </div>

      {/* หน้าผาซ้าย/ขวา */}
      {([["left", 0], ["right", 0]] as const).map(([side]) => (
        <div key={side} className="absolute bottom-0 z-[2]" style={{ [side]: 0, width: `${GAP_L}%`, height: DECK } as React.CSSProperties}>
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#8b5e34,#5b3d20)" }} />
          <div className="absolute inset-0 opacity-40" style={{ background: "repeating-linear-gradient(115deg,#00000022 0 6px,transparent 6px 16px)" }} />
          <div className="absolute inset-x-0 top-0 h-3 bg-gradient-to-b from-emerald-500 to-emerald-600" />
          <div className="absolute inset-x-0 top-0 h-1.5 bg-emerald-400" />
        </div>
      ))}

      {/* ธงเป้าหมายบนหน้าผาขวา */}
      <div className="absolute z-[3] text-2xl" style={{ left: "88%", bottom: DECK, transform: "translateX(-50%)" }}>
        {phase === "ok" ? "🎉" : "🚩"}
      </div>

      {/* ขีดแบ่งเหว (T ขีด) */}
      {Array.from({ length: T + 1 }, (_, k) => (
        <div key={k} className="absolute z-[3] w-[2px]" style={{ left: `${GAP_L + k * U}%`, bottom: DECK, height: 12, background: "rgba(255,255,255,0.55)" }} />
      ))}

      {/* ช่องเหวที่ยังขาด */}
      {sum < T && (
        <div
          className={cn("absolute z-[3] rounded", phase === "short" ? "opacity-90" : "opacity-45")}
          style={{ left: `${GAP_L + sum * U}%`, width: `${remainW}%`, bottom: DECK - 7, height: 14, background: "repeating-linear-gradient(45deg,#ef4444 0 8px,#fca5a5 8px 16px)" }}
        />
      )}

      {/* แผ่นไม้ที่วางแล้ว */}
      {laid.map((pl, i) => (
        <div
          key={i}
          className="absolute z-[4] flex items-center justify-center rounded-sm border-b-4 transition-all duration-300"
          style={{ left: `${pl.left}%`, width: `${pl.width}%`, bottom: DECK - 7, height: 15, background: `repeating-linear-gradient(90deg,${pl.tone} 0 7px,${pl.dark} 7px 14px)`, borderColor: pl.dark }}
        >
          <span className="text-[11px] font-black text-white/95 drop-shadow">{pl.n}/{den}</span>
        </div>
      ))}

      {/* ตัวละคร */}
      <div
        className="absolute z-[5]"
        style={{ left: `${charLeft}%`, bottom: DECK, transform: "translateX(-50%)", transition: crossing ? "left 1.6s linear" : "none" }}
      >
        <BlockChar c={char} walking={crossing} size={66} />
      </div>

      {/* ป้ายผล */}
      {phase === "ok" && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <span className="brg-pop rounded-2xl bg-emerald-500 px-7 py-2.5 text-3xl font-black text-white shadow-xl ring-4 ring-emerald-200">ข้ามได้! 🎉</span>
        </div>
      )}
      {phase === "short" && (
        <div className="pointer-events-none absolute inset-x-0 top-3 grid place-items-center">
          <span className="brg-pop rounded-xl bg-rose-500 px-5 py-2 text-xl font-black text-white shadow-lg">สะพานสั้นไป! 😮</span>
        </div>
      )}
      {phase === "long" && (
        <div className="pointer-events-none absolute inset-x-0 top-3 grid place-items-center">
          <span className="brg-pop rounded-xl bg-orange-500 px-5 py-2 text-xl font-black text-white shadow-lg">ยาวเกินพอดี! 😅</span>
        </div>
      )}
    </div>
  );
}

/* ── เกมหลัก ── */

export function AddBridgeGame() {
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

  const [mode, setMode] = useState<Mode>("teacher");
  const [charIdx, setCharIdx] = useState(4);
  const [teamChars, setTeamChars] = useState<[number, number]>([0, 1]);
  const [level, setLevel] = useState<1 | 2>(1);

  /* โจทย์ปัจจุบัน */
  const [den, setDen] = useState(5);
  const [target, setTarget] = useState(3);
  const [pool, setPool] = useState<Plank[]>(() => genPool(5, 3));
  const [selected, setSelected] = useState<number[]>([]);
  const [phase, setPhase] = useState<Phase>("pick");
  const [charLeft, setCharLeft] = useState(START_LEFT);
  const [crossing, setCrossing] = useState(false);

  /* แข่ง 2 ทีม */
  const [started, setStarted] = useState(false);
  const [team, setTeam] = useState(0);
  const [score, setScore] = useState<[number, number]>([0, 0]);
  const [winner, setWinner] = useState<number | null>(null);

  const timeoutsRef = useRef<number[]>([]);
  const push = (id: number) => timeoutsRef.current.push(id);
  useEffect(() => () => timeoutsRef.current.forEach((t) => window.clearTimeout(t)), []);

  const selPlanks = selected.map((id) => pool.find((p) => p.id === id)!).filter(Boolean);
  const selNums = selPlanks.map((p) => p.num);
  const sum = selNums.reduce((s, n) => s + n, 0);
  const activeChar = mode === "duel" ? CHARS[teamChars[team]] : CHARS[charIdx];

  function loadProblem(nd: number, nT: number) {
    setDen(nd); setTarget(nT); setPool(genPool(nd, nT));
    setSelected([]); setPhase("pick"); setCharLeft(START_LEFT); setCrossing(false);
  }
  function resetTry() {
    setSelected([]); setPhase("pick"); setCharLeft(START_LEFT); setCrossing(false);
  }

  function toggle(id: number) {
    if (phase !== "pick") return;
    setSelected((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id);
      if (cur.length >= 2) return cur;
      play("place");
      return [...cur, id];
    });
  }

  function cross() {
    if (phase !== "pick" || selected.length !== 2) return;
    ensure();
    const s = sum;
    const U = SPAN / target;
    setPhase("cross"); setCrossing(true); play("cross");
    [280, 560, 840, 1120, 1400].forEach((d) => push(window.setTimeout(() => play("step"), d)));
    const reached = s === target ? END_LEFT : s < target ? Math.min(GAP_L + s * U, 80) : END_LEFT;
    setCharLeft(reached);
    push(window.setTimeout(() => {
      setCrossing(false);
      if (s === target) {
        setPhase("ok"); play("win");
        if (mode === "duel") {
          const ns = Math.min(TEAM_GOAL, score[team] + 1);
          const next: [number, number] = [...score];
          next[team] = ns;
          setScore(next);
          if (ns >= TEAM_GOAL) setWinner(team);
          else scheduleNext();
        }
      } else {
        setPhase(s < target ? "short" : "long"); play("wrong");
        if (mode === "duel") scheduleNext();
      }
    }, 1650));
  }

  function scheduleNext() {
    push(window.setTimeout(() => {
      setTeam((t) => 1 - t);
      const nd = pickDen(level);
      loadProblem(nd, randInt(3, nd));
    }, 1700));
  }

  function reveal() {
    if (phase !== "pick") return;
    for (let i = 0; i < pool.length; i++)
      for (let j = i + 1; j < pool.length; j++)
        if (pool[i].num + pool[j].num === target) {
          setSelected([pool[i].id, pool[j].id]);
          push(window.setTimeout(() => cross(), 400));
          return;
        }
  }

  function startDuel() {
    ensure(); play("start");
    setMode("duel"); setStarted(true); setWinner(null);
    setScore([0, 0]); setTeam(0);
    const nd = pickDen(level);
    loadProblem(nd, randInt(3, nd));
  }

  const canCross = phase === "pick" && selected.length === 2;

  return (
    <div className="relative overflow-hidden rounded-2xl p-3 sm:p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-100 via-amber-50 to-lime-50" />
      <style>{`
        @keyframes brgBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        .brg-walk { animation: brgBob 0.25s ease-in-out infinite; }
        @keyframes brgLeg { 0%,100% { transform: rotate(-26deg); } 50% { transform: rotate(26deg); } }
        .brg-leg { animation: brgLeg 0.25s ease-in-out infinite; }
        .brg-leg2 { animation: brgLeg 0.25s ease-in-out infinite reverse; }
        @keyframes brgArm { 0%,100% { transform: rotate(22deg); } 50% { transform: rotate(-22deg); } }
        .brg-arm { animation: brgArm 0.25s ease-in-out infinite; }
        .brg-arm2 { animation: brgArm 0.25s ease-in-out infinite reverse; }
        @keyframes brgPop { 0% { transform: scale(0.3) rotate(-8deg); opacity: 0; } 55% { transform: scale(1.2) rotate(3deg); opacity: 1; } 100% { transform: scale(1) rotate(0); opacity: 1; } }
        .brg-pop { animation: brgPop 0.5s ease-out forwards; }
        @keyframes brgCloud { from { left: -14%; } to { left: 108%; } }
        .brg-cloud { animation: brgCloud 40s linear infinite; }
        .brg-cloud2 { animation: brgCloud 56s linear infinite; animation-delay: -25s; }
      `}</style>

      <div className="relative space-y-3">
        {/* โหมด + ปิดเสียง */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex rounded-xl border-2 border-slate-200 bg-white p-1">
            <button onClick={() => { setMode("teacher"); setStarted(false); setWinner(null); resetTry(); }} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "teacher" ? "bg-amber-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <FlaskConical size={15} /> โหมดครู
            </button>
            <button onClick={() => { setMode("duel"); setStarted(false); setWinner(null); resetTry(); }} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "duel" ? "bg-emerald-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <Swords size={15} /> แข่ง 2 ทีม
            </button>
          </div>
          <button onClick={() => setMuted((m) => !m)} className="grid h-9 w-9 place-items-center rounded-xl border-2 border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50" title={muted ? "เปิดเสียง" : "ปิดเสียง"}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {mode === "duel" && winner !== null ? (
          /* ── จอชนะ ── */
          <div className="space-y-4 rounded-2xl border-2 border-emerald-300 bg-white/90 p-6 text-center">
            <div className="text-5xl">🌉🏆</div>
            <h3 className="text-xl font-extrabold text-slate-800 sm:text-2xl">{winner === 0 ? "🔴 ทีมแดง" : "🔵 ทีมน้ำเงิน"} ข้ามครบ {TEAM_GOAL} เหวก่อน — ชนะ!</h3>
            <div className="flex items-center justify-center"><BlockChar c={CHARS[teamChars[winner]]} walking size={72} /></div>
            <button onClick={startDuel} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
              <Swords size={18} /> แข่งอีกครั้ง
            </button>
          </div>
        ) : mode === "duel" && !started ? (
          /* ── จอตั้งค่าแข่ง ── */
          <div className="space-y-4 rounded-2xl border-2 border-emerald-200 bg-white/90 p-4 sm:p-6">
            <p className="text-center text-sm font-bold text-slate-500">ผลัดกันเลือกแผ่นไม้ 2 แผ่นบวกให้ข้ามเหวพอดี — ข้ามได้ +1 เหว ทีมไหนครบ {TEAM_GOAL} เหวก่อนชนะ!</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {([0, 1] as const).map((ti) => (
                <div key={ti} className={cn("space-y-1 rounded-2xl border-2 p-2", ti === 0 ? "border-rose-200" : "border-sky-200")}>
                  <p className={cn("text-center text-xs font-extrabold", ti === 0 ? "text-rose-600" : "text-sky-600")}>{ti === 0 ? "🔴 นักผจญภัยทีมแดง" : "🔵 นักผจญภัยทีมน้ำเงิน"}</p>
                  <div className="flex flex-wrap justify-center gap-1">
                    {CHARS.map((c, i) => (
                      <button key={i} onClick={() => setTeamChars((tc) => { const nt: [number, number] = [...tc]; nt[ti] = i; return nt; })} className={cn("rounded-xl border-2 p-1 transition", teamChars[ti] === i ? (ti === 0 ? "border-rose-400 bg-rose-50" : "border-sky-400 bg-sky-50") : "border-slate-200 bg-white")}>
                        <BlockChar c={c} walking={false} size={36} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-extrabold text-slate-500">ความยาก:</span>
              {([[1, "ง่าย (ส่วน 4-6)"], [2, "ยาก (ส่วน 6-10)"]] as [1 | 2, string][]).map(([lv, label]) => (
                <button key={lv} onClick={() => setLevel(lv)} className={cn("rounded-lg border-2 px-3 py-1 text-xs font-extrabold transition", level === lv ? "border-emerald-400 bg-emerald-100 text-emerald-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>{label}</button>
              ))}
            </div>
            <div className="flex justify-center">
              <button onClick={startDuel} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
                <Swords size={18} /> เริ่มแข่ง!
              </button>
            </div>
          </div>
        ) : (
          /* ── กระดานเล่น (ครู + แข่ง) ── */
          <div className="space-y-3">
            {/* แถบตั้งค่าครู / สกอร์ทีม */}
            {mode === "teacher" ? (
              <div className="space-y-2 rounded-2xl border-2 border-amber-200 bg-white/90 px-3 py-2">
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
                  <span className="text-sm font-extrabold text-amber-700">🧑‍🏫 ความยาวเหว:</span>
                  <button onClick={() => loadProblem(den, Math.max(3, target - 1))} className="h-8 w-8 rounded-lg border-2 border-slate-200 bg-white text-lg font-extrabold text-slate-600 hover:bg-slate-50 active:scale-95">−</button>
                  <StackedFraction numerator={target} denominator={den} className="text-2xl" toneClassName="text-amber-700" />
                  <button onClick={() => loadProblem(den, Math.min(den, target + 1))} className="h-8 w-8 rounded-lg border-2 border-slate-200 bg-white text-lg font-extrabold text-slate-600 hover:bg-slate-50 active:scale-95">+</button>
                  <span className="mx-1 text-slate-300">|</span>
                  <span className="text-xs font-extrabold text-slate-500">ส่วน (ขีดเหว)</span>
                  {[4, 5, 6, 8, 10].map((d) => (
                    <button key={d} onClick={() => loadProblem(d, Math.min(d, Math.max(3, target)))} className={cn("h-7 w-7 rounded-lg border-2 text-sm font-extrabold transition", den === d ? "border-amber-500 bg-amber-100 text-amber-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>{d}</button>
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button onClick={() => loadProblem(den, target)} className="flex items-center gap-1.5 rounded-lg border-2 border-slate-200 bg-white px-3 py-1 text-xs font-extrabold text-slate-500 transition hover:bg-slate-50">
                    <Dice5 size={14} /> สุ่มแผ่นไม้ใหม่
                  </button>
                  <button onClick={reveal} disabled={phase !== "pick"} className="flex items-center gap-1.5 rounded-lg border-2 border-violet-300 bg-violet-50 px-3 py-1 text-xs font-extrabold text-violet-700 transition hover:bg-violet-100 disabled:opacity-40">
                    <Eye size={14} /> เฉลย (วางคู่ถูก)
                  </button>
                  <span className="mx-1 text-slate-300">|</span>
                  <span className="text-xs font-extrabold text-slate-500">นักผจญภัย:</span>
                  {CHARS.map((c, i) => (
                    <button key={i} onClick={() => setCharIdx(i)} className={cn("rounded-lg border-2 p-0.5 transition", charIdx === i ? "border-amber-400 bg-amber-50" : "border-slate-200 bg-white")}>
                      <BlockChar c={c} walking={false} size={26} />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {([0, 1] as const).map((ti) => (
                  <div key={ti} className={cn("rounded-2xl border-2 px-2 py-1.5 text-center transition", ti === 0 ? "border-rose-300" : "border-sky-300", team === ti && "ring-2", team === ti && (ti === 0 ? "ring-rose-300" : "ring-sky-300"))}>
                    <p className={cn("text-xs font-extrabold", ti === 0 ? "text-rose-600" : "text-sky-600")}>{ti === 0 ? "🔴 แดง" : "🔵 น้ำเงิน"} · {CHARS[teamChars[ti]].name} {team === ti && "◀ ตาเธอ"}</p>
                    <div className="mt-0.5 flex items-center justify-center gap-1">
                      {Array.from({ length: TEAM_GOAL }, (_, i) => (
                        <span key={i} className={cn("grid h-4 w-4 place-items-center rounded-full text-[9px] ring-1", i < score[ti] ? (ti === 0 ? "bg-rose-500 ring-rose-600" : "bg-sky-500 ring-sky-600") : "bg-slate-100 ring-slate-300")}>{i < score[ti] ? "🌉" : ""}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* สมการ */}
            <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-amber-200 bg-white/95 px-5 py-2.5 shadow-sm">
              <AddendSlot v={selNums[0] ?? null} den={den} tone="text-amber-600" />
              <span className="text-3xl font-black text-slate-400">+</span>
              <AddendSlot v={selNums[1] ?? null} den={den} tone="text-sky-600" />
              <span className="text-3xl font-black text-slate-400">=</span>
              <span className="flex flex-col items-center">
                <span className="text-[10px] font-extrabold text-slate-400">ความยาวเหว</span>
                <StackedFraction numerator={target} denominator={den} className="text-3xl sm:text-4xl" toneClassName="text-emerald-600" />
              </span>
              {(phase === "ok" || phase === "short" || phase === "long") && selected.length === 2 && (
                <span className={cn("rounded-full px-3 py-1 text-sm font-extrabold text-white shadow", sum === target ? "bg-emerald-500" : sum < target ? "bg-rose-500" : "bg-orange-500")}>
                  {sum === target ? "พอดี ✓" : `รวม ${sum}/${den}`}
                </span>
              )}
            </div>

            {/* ฉาก */}
            <BridgeScene den={den} T={target} selNums={selNums} char={activeChar} charLeft={charLeft} crossing={crossing} phase={phase} />

            {/* กองแผ่นไม้ */}
            <div>
              <p className="mb-1.5 text-center text-xs font-extrabold text-slate-500">🪵 เลือกแผ่นไม้ 2 แผ่นให้บวกกันยาวพอดีเหว (แตะซ้ำเพื่อยกเลิก)</p>
              <div className="flex flex-wrap items-end justify-center gap-2.5">
                {pool.map((p) => {
                  const idx = selected.indexOf(p.id);
                  return <PlankButton key={p.id} p={p} den={den} order={idx >= 0 ? idx + 1 : null} disabled={phase !== "pick" || (idx < 0 && selected.length >= 2)} onClick={() => toggle(p.id)} />;
                })}
              </div>
            </div>

            {/* ปุ่มควบคุม */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {phase === "pick" ? (
                <button onClick={cross} disabled={!canCross} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-7 py-2.5 text-base font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98] disabled:opacity-40">
                  🚶 ข้ามเหว!
                </button>
              ) : phase === "cross" ? (
                <span className="text-sm font-extrabold text-slate-500">กำลังเดินข้าม…</span>
              ) : mode === "teacher" ? (
                <>
                  {phase === "ok"
                    ? <p className="w-full text-center text-sm font-extrabold text-emerald-600">✅ {selNums[0]}/{den} + {selNums[1]}/{den} = {target}/{den} — ตัวส่วนเท่าเดิม บวกแค่ตัวเศษ!</p>
                    : <p className="w-full text-center text-sm font-extrabold text-rose-600">{sum < target ? `ยังขาดอีก ${target - sum}/${den} — ลองแผ่นที่ยาวกว่านี้` : `เกินมา ${sum - target}/${den} — ลองแผ่นที่สั้นลง`}</p>}
                  <button onClick={resetTry} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50">
                    <RotateCcw size={15} /> ลองใหม่
                  </button>
                  <button onClick={() => loadProblem(pickDen(level), randInt(3, pickDen(level)))} className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-sm font-extrabold text-white shadow transition hover:brightness-105">
                    โจทย์ใหม่ <ArrowRight size={15} />
                  </button>
                </>
              ) : (
                <span className="text-sm font-extrabold text-slate-500">{phase === "ok" ? "🌉 ข้ามได้! สลับให้อีกทีม…" : "❌ ยังไม่พอดี — สลับให้อีกทีม…"}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
