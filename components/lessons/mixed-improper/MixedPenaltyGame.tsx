"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, User, Users, Timer } from "lucide-react";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { cn } from "@/lib/cn";
import { randInt } from "@/lib/randomFraction";

/* ── ค่าคงที่ ── */

type Mixed = { whole: number; num: number; den: number };
const SHOTS_TOTAL = 10;
const TEAM_GOAL = 5;

/* ตัวละครบล็อก 5 ตัว */
const CHARS = [
  { name: "เรดดี้", body: "#ef4444", dark: "#b91c1c", skin: "#fde68a", hat: "antenna" as const },
  { name: "บลูโบ", body: "#3b82f6", dark: "#1d4ed8", skin: "#fde68a", hat: "cap" as const },
  { name: "เหมียวทอง", body: "#f59e0b", dark: "#b45309", skin: "#fef3c7", hat: "ears" as const },
  { name: "ไวโอ", body: "#a855f7", dark: "#7e22ce", skin: "#e9d5ff", hat: "antenna" as const },
  { name: "ไดโนะ", body: "#22c55e", dark: "#15803d", skin: "#bbf7d0", hat: "spikes" as const },
];

type Dir = "toImp" | "toMix";
type Question = {
  dir: Dir;
  m: Mixed;
  options: { whole: number; num: number; den: number }[]; // whole=0 → เศษเกิน
  answer: number;
};

function pickDen(level: 1 | 2): number {
  return level === 1 ? [2, 3][randInt(0, 1)] : [2, 3, 4, 5, 6][randInt(0, 4)];
}

function genQuestion(dirSetting: Dir | "random", level: 1 | 2): Question {
  const dir: Dir = dirSetting === "random" ? (randInt(0, 1) === 0 ? "toImp" : "toMix") : dirSetting;
  const den = pickDen(level);
  const m: Mixed = { whole: randInt(1, 3), num: randInt(1, den - 1), den };
  const total = m.whole * m.den + m.num;
  let opts: { whole: number; num: number; den: number }[];
  let correctKey: string;
  if (dir === "toImp") {
    const correct = { whole: 0, num: total, den };
    const cands = [
      { whole: 0, num: m.whole + m.num, den },
      { whole: 0, num: m.whole * m.den, den },
      { whole: 0, num: total + 1, den },
      { whole: 0, num: total - 1, den },
      { whole: 0, num: total + m.den, den },
    ].filter((c) => c.num > 0 && c.num !== total);
    const seen = new Set<number>([total]);
    const ds: typeof cands = [];
    for (const c of cands) { if (!seen.has(c.num)) { seen.add(c.num); ds.push(c); } if (ds.length >= 2) break; }
    opts = [correct, ...ds.slice(0, 2)];
    correctKey = `0-${total}`;
  } else {
    const correct = { whole: m.whole, num: m.num, den };
    const cands = [
      { whole: m.whole + 1, num: m.num, den },
      { whole: Math.max(1, m.whole - 1), num: m.num, den },
      { whole: m.num, num: Math.min(m.whole, den - 1), den },
      { whole: m.whole, num: m.num + 1 <= den - 1 ? m.num + 1 : m.num - 1, den },
    ].filter((c) => c.num >= 1 && c.num < den && !(c.whole === m.whole && c.num === m.num));
    const seen = new Set<string>([`${m.whole}-${m.num}`]);
    const ds: typeof cands = [];
    for (const c of cands) { const k = `${c.whole}-${c.num}`; if (!seen.has(k)) { seen.add(k); ds.push(c); } if (ds.length >= 2) break; }
    opts = [correct, ...ds.slice(0, 2)];
    correctKey = `${m.whole}-${m.num}`;
  }
  for (let i = opts.length - 1; i > 0; i--) { const j = randInt(0, i); [opts[i], opts[j]] = [opts[j], opts[i]]; }
  const answer = opts.findIndex((o) => `${o.whole}-${o.num}` === correctKey);
  return { dir, m, options: opts, answer };
}

/* ── เสียง ── */

type SoundKind = "run" | "kick" | "goal" | "miss" | "cheer" | "start" | "win" | "wrong";

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
  function burst(dur: number, gain: number) {
    if (mutedRef.current) return;
    const ctx = ensure();
    if (!ctx) return;
    const n = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, ctx.currentTime);
    src.connect(g).connect(ctx.destination);
    src.start();
  }
  function play(kind: SoundKind) {
    switch (kind) {
      case "run": return tones([170, 150, 170], 0.12, 0.05, "square", 0.05);
      case "kick": return burst(0.08, 0.2);
      case "goal": return tones([784, 1047, 1319, 1568], 0.06, 0.13, "triangle", 0.15);
      case "miss": return sweep(500, 150, 0.5, "sawtooth", 0.09);
      case "cheer": return tones([523, 659, 784, 659, 784, 1047], 0.07, 0.12, "square", 0.06);
      case "start": return tones([523, 659, 784], 0.07, 0.12, "triangle", 0.14);
      case "win": return tones([523, 659, 784, 1047, 1319, 1568], 0.09, 0.17, "triangle", 0.15);
      case "wrong": return tones([220, 165], 0.11, 0.18, "sawtooth", 0.09);
    }
  }
  return { play, ensure };
}

/* ── เพลงสนามบอล (ชิปทูน ไม่ใช้ไฟล์) ── */

const PN_LEAD = [72, 72, 74, 76, 0, 76, 74, 72, 69, 0, 69, 71, 72, 0, 0, 0, 74, 74, 76, 77, 0, 77, 76, 74, 71, 0, 71, 72, 74, 0, 0, 0];
const PN_BASS = [48, 55, 48, 55, 45, 52, 45, 52, 50, 57, 50, 57, 43, 50, 43, 50];

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
      const mNote = PN_LEAD[s];
      if (mNote) note(mNote, 0.16, "square", 0.027);
      if (s % 2 === 0) {
        const b = PN_BASS[s / 2];
        if (b) note(b, 0.3, "triangle", 0.05);
      }
    }, 190);
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

function BlockChar({ c, walking, size = 56, facing = 1 }: { c: typeof CHARS[number]; walking: boolean; size?: number; facing?: 1 | -1 }) {
  return (
    <svg viewBox="0 0 44 60" width={size * 0.73} height={size} className={cn(walking && "char-walk")} style={{ transform: facing === -1 ? "scaleX(-1)" : undefined }} role="img" aria-label={`ตัวละคร ${c.name}`}>
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
      <g className={walking ? "arm-swing" : undefined} style={{ transformOrigin: "10px 27px" }}>
        <rect x={7} y={25} width={5} height={14} rx={2.5} fill={c.body} stroke={c.dark} strokeWidth={1.6} />
      </g>
      <g className={walking ? "arm-swing2" : undefined} style={{ transformOrigin: "34px 27px" }}>
        <rect x={32} y={25} width={5} height={14} rx={2.5} fill={c.body} stroke={c.dark} strokeWidth={1.6} />
      </g>
      <g className={walking ? "leg-swing" : undefined} style={{ transformOrigin: "17px 43px" }}>
        <rect x={14.5} y={42} width={6} height={15} rx={2.5} fill={c.dark} />
      </g>
      <g className={walking ? "leg-swing2" : undefined} style={{ transformOrigin: "27px 43px" }}>
        <rect x={23.5} y={42} width={6} height={15} rx={2.5} fill={c.dark} />
      </g>
    </svg>
  );
}

/* ── ลูกฟุตบอล ── */

function Ball({ size = 26, spinning }: { size?: number; spinning?: boolean }) {
  return (
    <svg viewBox="0 0 30 30" width={size} height={size} className={cn(spinning && "ball-spin")} role="img" aria-label="ลูกฟุตบอล">
      <circle cx={15} cy={15} r={13.5} fill="#fff" stroke="#1e293b" strokeWidth={1.6} />
      <polygon points="15,9 20,12.5 18,18 12,18 10,12.5" fill="#1e293b" />
      <path d="M15,1.5 L15,9 M20,12.5 L27,10 M18,18 L22,24 M12,18 L8,24 M10,12.5 L3,10" stroke="#1e293b" strokeWidth={1.4} fill="none" />
    </svg>
  );
}

/* ── ป้ายคำตอบ ── */

function AnsLabel({ o, tone }: { o: { whole: number; num: number; den: number }; tone: string }) {
  if (o.whole === 0) return <StackedFraction numerator={o.num} denominator={o.den} className="text-xl sm:text-2xl" toneClassName={tone} />;
  return (
    <span className={cn("inline-flex items-center gap-1 text-xl font-extrabold sm:text-2xl", tone)}>
      {o.whole}
      <StackedFraction numerator={o.num} denominator={o.den} className="text-sm sm:text-base" toneClassName={tone} />
    </span>
  );
}

/* ── เกมหลัก ── */

type Phase = "ask" | "run" | "fly" | "goal" | "miss";
type Mode = "solo" | "team";

export function MixedPenaltyGame() {
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

  /* ตั้งค่า */
  const [mode, setMode] = useState<Mode>("solo");
  const [dirSetting, setDirSetting] = useState<Dir | "random">("random");
  const [level, setLevel] = useState<1 | 2>(1);
  const [charIdx, setCharIdx] = useState(0);
  const [teamChars, setTeamChars] = useState<[number, number]>([0, 1]);

  /* สถานะ */
  const [started, setStarted] = useState(false);
  const [over, setOver] = useState(false);
  const [q, setQ] = useState<Question>(() => genQuestion("random", 1));
  const [phase, setPhase] = useState<Phase>("ask");
  const [picked, setPicked] = useState<number | null>(null);
  const [shot, setShot] = useState(0);
  const [goals, setGoals] = useState(0);
  const [combo, setCombo] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [team, setTeam] = useState(0);
  const [teamGoals, setTeamGoals] = useState<[number, number]>([0, 0]);
  const [teamWinner, setTeamWinner] = useState<number | null>(null);
  const timeoutsRef = useRef<number[]>([]);
  useEffect(() => () => timeoutsRef.current.forEach((t) => window.clearTimeout(t)), []);

  useEffect(() => {
    if (!started || over || mode !== "solo") return;
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, [started, over, mode]);

  const activeChar = mode === "solo" ? CHARS[charIdx] : CHARS[teamChars[team]];

  /* ตำแหน่ง (เปอร์เซ็นต์/พิกเซลในฉาก) */
  const ZONE_X = [51, 69, 87];       // จุดกึ่งกลางช่องโกล 3 ช่อง (โกลกิน 42%..96%)
  const charX = phase === "ask" ? 4 : 11;       // วิ่งเข้าหาบอลตอนเตะ
  const ballFlying = phase === "fly" || phase === "goal" || phase === "miss";
  const ballX = !ballFlying ? 15 : phase === "miss" ? 100 : picked !== null ? ZONE_X[picked] : 15;
  const ballBottom = !ballFlying ? 42 : phase === "miss" ? 250 : 118;
  const ballScale = !ballFlying ? 1 : phase === "miss" ? 0.7 : 0.68; // บอลเล็กลงเมื่อพุ่งลึกเข้าไป

  function newQuestion() {
    setQ(genQuestion(dirSetting, level));
    setPhase("ask");
    setPicked(null);
  }

  function start(m2: Mode) {
    ensure();
    play("start");
    setMode(m2);
    setShot(0); setGoals(0); setCombo(0); setElapsed(0);
    setTeam(0); setTeamGoals([0, 0]); setTeamWinner(null);
    setOver(false);
    setQ(genQuestion(dirSetting, level));
    setPhase("ask");
    setPicked(null);
    setStarted(true);
  }

  function shoot(idx: number) {
    if (phase !== "ask" || over) return;
    setPicked(idx);
    setPhase("run");
    play("run");
    const ok = idx === q.answer;
    // วิ่งเข้าบอล → เตะ → บอลลอย
    timeoutsRef.current.push(window.setTimeout(() => {
      play("kick");
      setPhase("fly");
    }, 450));
    timeoutsRef.current.push(window.setTimeout(() => {
      if (ok) {
        setPhase("goal");
        play("goal");
        timeoutsRef.current.push(window.setTimeout(() => play("cheer"), 250));
        setCombo((c) => c + 1);
        if (mode === "solo") {
          setGoals((g) => g + 1);
          const ns = shot + 1;
          setShot(ns);
          if (ns >= SHOTS_TOTAL) {
            timeoutsRef.current.push(window.setTimeout(() => { setOver(true); play("win"); }, 1100));
            return;
          }
          timeoutsRef.current.push(window.setTimeout(() => newQuestion(), 1400));
        } else {
          setTeamGoals((tg) => {
            const nt: [number, number] = [...tg];
            nt[team] = Math.min(TEAM_GOAL, nt[team] + 1);
            if (nt[team] >= TEAM_GOAL) { setTeamWinner(team); play("win"); }
            return nt;
          });
          timeoutsRef.current.push(window.setTimeout(() => { setTeam((t) => 1 - t); newQuestion(); }, 1400));
        }
      } else {
        setPhase("miss");
        play("miss");
        setCombo(0);
        if (mode === "solo") {
          const ns = shot + 1;
          setShot(ns);
          if (ns >= SHOTS_TOTAL) {
            timeoutsRef.current.push(window.setTimeout(() => { setOver(true); play("wrong"); }, 1100));
            return;
          }
          timeoutsRef.current.push(window.setTimeout(() => newQuestion(), 1500));
        } else {
          timeoutsRef.current.push(window.setTimeout(() => { setTeam((t) => 1 - t); newQuestion(); }, 1500));
        }
      }
    }, 1150));
  }

  const stars = goals >= 9 ? 3 : goals >= 7 ? 2 : 1;

  return (
    <div className="relative overflow-hidden rounded-2xl p-3 sm:p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-100 via-emerald-50 to-lime-50" />
      <style>{`
        @keyframes charWalkBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        .char-walk { animation: charWalkBob 0.25s ease-in-out infinite; }
        @keyframes legSwing { 0%,100% { transform: rotate(-26deg); } 50% { transform: rotate(26deg); } }
        .leg-swing { animation: legSwing 0.25s ease-in-out infinite; }
        .leg-swing2 { animation: legSwing 0.25s ease-in-out infinite reverse; }
        @keyframes armSwing { 0%,100% { transform: rotate(22deg); } 50% { transform: rotate(-22deg); } }
        .arm-swing { animation: armSwing 0.25s ease-in-out infinite; }
        .arm-swing2 { animation: armSwing 0.25s ease-in-out infinite reverse; }
        @keyframes ballSpin { from { transform: rotate(0); } to { transform: rotate(360deg); } }
        .ball-spin { animation: ballSpin 0.4s linear infinite; }
        @keyframes netShake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-3px); } 50% { transform: translateX(3px); } 75% { transform: translateX(-2px); } }
        .net-shake { animation: netShake 0.4s ease-in-out; }
        @keyframes goalPop { 0% { transform: scale(0.3) rotate(-8deg); opacity: 0; } 55% { transform: scale(1.25) rotate(3deg); opacity: 1; } 100% { transform: scale(1) rotate(0); opacity: 1; } }
        .goal-pop { animation: goalPop 0.5s ease-out forwards; }
        @keyframes cloudA { from { left: -12%; } to { left: 105%; } }
        .cloud-a { animation: cloudA 34s linear infinite; }
        .cloud-b { animation: cloudA 48s linear infinite; animation-delay: -20s; }
        .cloud-c { animation: cloudA 60s linear infinite; animation-delay: -40s; }
      `}</style>

      <div className="relative space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-extrabold text-emerald-800">⚽ เตะบอลจำนวนคละ — เลือกช่องโกลที่ถูก แล้วซัดเลย!</h3>
          <button onClick={() => setMuted((m) => !m)} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border-2 border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50" title={muted ? "เปิดเสียง" : "ปิดเสียง"}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {!started || over || teamWinner !== null ? (
          /* ── จอเริ่ม / จบ ── */
          <div className="space-y-4 rounded-2xl border-2 border-emerald-200 bg-white/90 p-4 sm:p-6">
            {over && mode === "solo" ? (
              <div className="space-y-2 text-center">
                <div className="text-5xl">{goals >= 7 ? "⚽🏆" : "⚽💨"}</div>
                <h3 className="text-xl font-extrabold text-slate-800">จบ {SHOTS_TOTAL} ลูก — ยิงเข้า {goals} ประตู!</h3>
                <p className="text-2xl">{"⭐".repeat(stars)}{"☆".repeat(3 - stars)}</p>
                <p className="text-sm font-extrabold text-slate-500">⏱️ ใช้เวลา {elapsed} วิ</p>
              </div>
            ) : teamWinner !== null ? (
              <div className="space-y-2 text-center">
                <div className="text-5xl">⚽🏆</div>
                <h3 className="text-xl font-extrabold text-slate-800">{teamWinner === 0 ? "🔴 ทีมแดง" : "🔵 ทีมน้ำเงิน"} ยิงครบ {TEAM_GOAL} ประตูก่อน — ชนะ!</h3>
                <div className="flex items-center justify-center">
                  <BlockChar c={CHARS[teamChars[teamWinner]]} walking size={64} />
                </div>
              </div>
            ) : (
              <p className="text-center text-sm font-bold text-slate-500">
                โจทย์สลับ 2 ทาง: เศษเกิน ↔ จำนวนคละ — เลือกช่องโกลที่ถูก บอลพุ่งเสียบตาข่าย GOAL! · เลือกผิด บอลแฉลบออกนอกโกล 💨
              </p>
            )}

            {/* เลือกตัวละคร */}
            {mode === "solo" ? (
              <div className="space-y-1.5">
                <p className="text-center text-sm font-extrabold text-slate-600">เลือกนักเตะ:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {CHARS.map((c, i) => (
                    <button key={i} onClick={() => setCharIdx(i)} className={cn("flex flex-col items-center gap-0.5 rounded-2xl border-2 p-2 transition", charIdx === i ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200" : "border-slate-200 bg-white hover:border-emerald-300")}>
                      <BlockChar c={c} walking={charIdx === i} size={48} />
                      <span className="text-[11px] font-extrabold text-slate-600">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {([0, 1] as const).map((ti) => (
                  <div key={ti} className={cn("space-y-1 rounded-2xl border-2 p-2", ti === 0 ? "border-rose-200" : "border-sky-200")}>
                    <p className={cn("text-center text-xs font-extrabold", ti === 0 ? "text-rose-600" : "text-sky-600")}>{ti === 0 ? "🔴 นักเตะทีมแดง" : "🔵 นักเตะทีมน้ำเงิน"}</p>
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
            )}

            {/* ตั้งค่า */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-extrabold text-slate-500">โจทย์:</span>
              {([["random", "🔀 สุ่มสองทาง"], ["toImp", "คละ→เกิน"], ["toMix", "เกิน→คละ"]] as [Dir | "random", string][]).map(([d, label]) => (
                <button key={d} onClick={() => setDirSetting(d)} className={cn("rounded-lg border-2 px-2.5 py-1 text-xs font-extrabold transition", dirSetting === d ? "border-emerald-400 bg-emerald-100 text-emerald-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>{label}</button>
              ))}
              <span className="mx-1 text-slate-300">|</span>
              <span className="text-xs font-extrabold text-slate-500">ความยาก:</span>
              {([[1, "ง่าย (ส่วน 2-3)"], [2, "ยาก (ส่วน 2-6)"]] as [1 | 2, string][]).map(([lv, label]) => (
                <button key={lv} onClick={() => setLevel(lv)} className={cn("rounded-lg border-2 px-2.5 py-1 text-xs font-extrabold transition", level === lv ? "border-emerald-400 bg-emerald-100 text-emerald-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>{label}</button>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              <button onClick={() => start("solo")} onMouseEnter={() => setMode("solo")} className={cn("inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-base font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]", mode === "solo" ? "bg-gradient-to-r from-emerald-600 to-lime-500" : "bg-slate-400")}>
                <User size={17} /> {over || teamWinner !== null ? "ยิงเดี่ยวอีกครั้ง" : `ยิงเดี่ยว ${SHOTS_TOTAL} ลูก`}
              </button>
              <button onClick={() => start("team")} onMouseEnter={() => setMode("team")} className={cn("inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-base font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]", mode === "team" ? "bg-gradient-to-r from-rose-600 to-orange-500" : "bg-slate-400")}>
                <Users size={17} /> 2 ทีมดวลจุดโทษ
              </button>
            </div>
          </div>
        ) : (
          /* ── กำลังเล่น ── */
          <div className="space-y-3">
            {/* แถบสถานะ */}
            {mode === "solo" ? (
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 rounded-2xl bg-white/85 px-4 py-2 ring-1 ring-emerald-200">
                <span className="text-sm font-extrabold text-emerald-700">⚽ ลูกที่ {Math.min(shot + 1, SHOTS_TOTAL)}/{SHOTS_TOTAL}</span>
                <span className="text-sm font-extrabold text-amber-600">🥅 เข้า {goals}</span>
                {combo >= 2 && <span className="text-sm font-extrabold text-orange-500">🔥 x{combo}</span>}
                <span className="flex items-center gap-1 text-sm font-extrabold text-slate-500"><Timer size={14} /> {elapsed} วิ</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {([0, 1] as const).map((ti) => (
                  <div key={ti} className={cn("rounded-2xl border-2 px-2 py-1.5 text-center transition", ti === 0 ? "border-rose-300" : "border-sky-300", team === ti && "ring-2", team === ti && (ti === 0 ? "ring-rose-300" : "ring-sky-300"))}>
                    <p className={cn("text-xs font-extrabold", ti === 0 ? "text-rose-600" : "text-sky-600")}>{ti === 0 ? "🔴 แดง" : "🔵 น้ำเงิน"} · {CHARS[teamChars[ti]].name} {team === ti && "◀ ตาเธอ"}</p>
                    <div className="mt-0.5 flex items-center justify-center gap-1">
                      {Array.from({ length: TEAM_GOAL }, (_, i) => (
                        <span key={i} className={cn("grid h-4 w-4 place-items-center rounded-full text-[9px] ring-1", i < teamGoals[ti] ? (ti === 0 ? "bg-rose-500 ring-rose-600" : "bg-sky-500 ring-sky-600") : "bg-slate-100 ring-slate-300")}>{i < teamGoals[ti] ? "⚽" : ""}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* โจทย์ (ใหญ่ อ่านง่ายบนทีวี) */}
            <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-emerald-200 bg-white/95 px-5 py-2.5 shadow-sm">
              <span className="text-lg font-extrabold text-slate-700 sm:text-xl">⚽ เตะเข้าช่องที่เท่ากับ</span>
              {q.dir === "toImp" ? (
                <span className="inline-flex items-center gap-1.5 text-3xl font-black text-emerald-700 sm:text-4xl">
                  {q.m.whole}
                  <StackedFraction numerator={q.m.num} denominator={q.m.den} className="text-2xl sm:text-3xl" toneClassName="text-emerald-700" />
                </span>
              ) : (
                <StackedFraction numerator={q.m.whole * q.m.den + q.m.num} denominator={q.m.den} className="text-3xl sm:text-4xl" toneClassName="text-emerald-700" />
              )}
              <span className="rounded-full bg-emerald-600 px-3 py-1 text-sm font-extrabold text-white shadow">{q.dir === "toImp" ? "→ เศษเกิน" : "→ จำนวนคละ"}</span>
            </div>

            {/* ── สนามบอล 2.5D ── */}
            <div className="relative h-[300px] overflow-hidden rounded-2xl border-2 border-emerald-300 sm:h-[340px]">
              {/* ฟ้า + แดด + เมฆ */}
              <div className="absolute inset-x-0 top-0 h-[42%] bg-gradient-to-b from-sky-400 via-sky-300 to-sky-200" />
              <div className="pointer-events-none absolute right-6 top-3 h-10 w-10 rounded-full bg-yellow-300 shadow-[0_0_24px_8px_rgba(253,224,71,0.55)]" />
              <div className="cloud-a pointer-events-none absolute top-3 text-4xl opacity-80">☁️</div>
              <div className="cloud-b pointer-events-none absolute top-14 text-3xl opacity-60">☁️</div>
              <div className="cloud-c pointer-events-none absolute top-7 text-2xl opacity-45">☁️</div>

              {/* อัฒจันทร์ + ป้ายสปอนเซอร์ (ฉากหลัง) */}
              <div className="absolute inset-x-0 top-[26%] h-[10%]" style={{ background: "repeating-radial-gradient(circle at 6px 6px, #64748b 0 2.5px, #475569 2.5px 12px)" }} />
              <div className="absolute inset-x-0 top-[36%] flex h-[7%] items-center justify-around overflow-hidden bg-white/90 text-[10px] font-black tracking-wider text-emerald-700 ring-1 ring-slate-300 sm:text-xs">
                <span>⚽ FRACTION CUP</span><span>เศษส่วน FC</span><span>2 = 2/2 + 2/2</span><span>⚽ FRACTION CUP</span>
              </div>

              {/* สนามหญ้า perspective (ลายทางสอบเข้าหาขอบฟ้า) */}
              <div className="absolute inset-x-0 bottom-0 h-[57%] overflow-hidden">
                <div
                  className="absolute bottom-0 left-1/2 h-[130%] w-[240%] -translate-x-1/2"
                  style={{
                    background: "repeating-linear-gradient(90deg, #4ade80 0 110px, #2fc46f 110px 220px)",
                    transform: "translateX(-50%) perspective(320px) rotateX(42deg)",
                    transformOrigin: "bottom center",
                  }}
                />
                {/* เส้นเขตโทษ (perspective) */}
                <svg viewBox="0 0 700 190" preserveAspectRatio="none" className="absolute inset-0 h-full w-full opacity-80">
                  <path d="M40,190 L120,30 L680,30 L700,150" fill="none" stroke="#ffffff" strokeWidth={4} strokeLinejoin="round" />
                  <path d="M180,190 L230,72 L560,72 L610,190" fill="none" stroke="#ffffff" strokeWidth={3.5} strokeLinejoin="round" opacity={0.9} />
                  <ellipse cx={150} cy={166} rx={11} ry={5} fill="#ffffff" opacity={0.95} />
                </svg>
              </div>

              {/* เงาใต้โกล */}
              <div className="absolute bottom-[34px] right-[1%] h-5 w-[58%] rounded-full bg-black/25 blur-[6px]" />

              {/* ═══ โกล 3D: โครงหลัง + ตาข่ายลึก + เสาหน้า ═══ */}
              <div className={cn("absolute bottom-[42px] right-[4%] h-[178px] w-[54%] sm:h-[196px]", phase === "goal" && "net-shake")}>
                <svg viewBox="0 0 340 200" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
                  {/* แผงตาข่ายหลัง (เล็กกว่า อยู่ลึก) */}
                  <rect x={34} y={12} width={272} height={126} fill="rgba(255,255,255,0.10)" stroke="#e2e8f0" strokeWidth={3} />
                  {/* ตาข่ายหลัง */}
                  {Array.from({ length: 12 }, (_, i) => <line key={`bv${i}`} x1={34 + (i + 1) * 21} y1={12} x2={34 + (i + 1) * 21} y2={138} stroke="rgba(255,255,255,0.6)" strokeWidth={1.1} />)}
                  {Array.from({ length: 5 }, (_, i) => <line key={`bh${i}`} x1={34} y1={12 + (i + 1) * 21} x2={306} y2={12 + (i + 1) * 21} stroke="rgba(255,255,255,0.6)" strokeWidth={1.1} />)}
                  {/* แผงตาข่ายหลังคา (จากคานหน้าสอบไปโครงหลัง) */}
                  <polygon points="6,34 334,34 306,12 34,12" fill="rgba(255,255,255,0.14)" />
                  {Array.from({ length: 13 }, (_, i) => { const fx = 6 + i * (328 / 12); const bx = 34 + i * (272 / 12); return <line key={`tv${i}`} x1={fx} y1={34} x2={bx} y2={12} stroke="rgba(255,255,255,0.55)" strokeWidth={1} />; })}
                  <line x1={20} y1={23} x2={320} y2={23} stroke="rgba(255,255,255,0.5)" strokeWidth={1} />
                  {/* แผงตาข่ายข้างซ้าย/ขวา */}
                  <polygon points="6,34 34,12 34,138 6,196" fill="rgba(255,255,255,0.13)" />
                  <polygon points="334,34 306,12 306,138 334,196" fill="rgba(255,255,255,0.13)" />
                  {Array.from({ length: 5 }, (_, i) => { const fy = 34 + (i + 1) * (162 / 6); const by = 12 + (i + 1) * (126 / 6); return (<g key={`s${i}`}><line x1={6} y1={fy} x2={34} y2={by} stroke="rgba(255,255,255,0.5)" strokeWidth={1} /><line x1={334} y1={fy} x2={306} y2={by} stroke="rgba(255,255,255,0.5)" strokeWidth={1} /></g>); })}
                  {/* โครงหลังล่าง */}
                  <line x1={6} y1={196} x2={34} y2={138} stroke="#e2e8f0" strokeWidth={3} />
                  <line x1={334} y1={196} x2={306} y2={138} stroke="#e2e8f0" strokeWidth={3} />
                  <line x1={34} y1={138} x2={306} y2={138} stroke="#e2e8f0" strokeWidth={3} />
                  {/* เสาหน้า + คาน (หนา ขาว มีแรเงาให้กลม) */}
                  <rect x={0} y={28} width={12} height={172} rx={5} fill="#ffffff" stroke="#94a3b8" strokeWidth={1.5} />
                  <rect x={2.5} y={30} width={3} height={168} rx={1.5} fill="#cbd5e1" opacity={0.8} />
                  <rect x={328} y={28} width={12} height={172} rx={5} fill="#ffffff" stroke="#94a3b8" strokeWidth={1.5} />
                  <rect x={330.5} y={30} width={3} height={168} rx={1.5} fill="#cbd5e1" opacity={0.8} />
                  <rect x={0} y={26} width={340} height={12} rx={5} fill="#ffffff" stroke="#94a3b8" strokeWidth={1.5} />
                  <rect x={2} y={28.5} width={336} height={3} rx={1.5} fill="#cbd5e1" opacity={0.8} />
                </svg>

                {/* ช่องเป้าหมาย 3 ช่อง (มีมิติ ป้ายลอย+เงา) */}
                <div className="absolute inset-x-[4%] bottom-[2%] top-[19%] flex">
                  {q.options.map((o, i) => {
                    const isAns = i === q.answer;
                    const show = phase !== "ask" && picked === i;
                    return (
                      <button
                        key={i}
                        onClick={() => shoot(i)}
                        disabled={phase !== "ask"}
                        data-zone={i}
                        data-correct={isAns ? "1" : "0"}
                        className={cn(
                          "group relative flex flex-1 items-center justify-center transition",
                          phase === "ask" && "cursor-pointer",
                          show && isAns && "bg-emerald-300/40",
                          show && !isAns && "bg-rose-300/35",
                        )}
                      >
                        {/* กรอบเป้าเส้นประ */}
                        <span className={cn("pointer-events-none absolute inset-[7%] rounded-xl border-[3px] border-dashed transition", show && isAns ? "border-emerald-300" : show && !isAns ? "border-rose-300" : "border-white/70 group-hover:border-amber-300 group-hover:shadow-[inset_0_0_18px_rgba(253,224,71,0.45)]")} />
                        {/* ป้ายคำตอบลอย มีความหนา + เงาตก */}
                        <span className={cn(
                          "relative rounded-xl border-b-4 bg-white px-3 py-1.5 shadow-[0_8px_14px_rgba(0,0,0,0.3)] ring-1 transition group-hover:-translate-y-1",
                          show && isAns ? "border-emerald-500 ring-emerald-300" : show && !isAns ? "border-rose-400 ring-rose-300" : "border-slate-300 ring-slate-200",
                        )}>
                          <AnsLabel o={o} tone={show && isAns ? "text-emerald-700" : show && !isAns ? "text-rose-600" : "text-slate-800"} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* เงานักเตะ */}
              <div className="absolute h-3.5 w-16 rounded-full bg-black/25 blur-[3px]" style={{ left: `calc(${charX}% + 8px)`, bottom: 30, transition: phase === "run" ? "left 0.45s ease-in" : "none" }} />
              {/* นักเตะ (ใหญ่ขึ้น) */}
              <div className="absolute z-10" style={{ left: `${charX}%`, bottom: 34, transition: phase === "run" ? "left 0.45s ease-in" : "none" }}>
                <BlockChar c={activeChar} walking={phase === "run"} size={88} />
              </div>

              {/* เงาลูกบอล (จางลงตอนลอย) */}
              <div className="absolute h-3 w-10 rounded-full bg-black/30 blur-[3px] transition-all duration-500" style={{ left: `calc(${ballX}% - 2px)`, bottom: 30, opacity: ballFlying ? 0.1 : 0.6, transform: ballFlying ? "scale(0.6)" : "scale(1)" }} />
              {/* ลูกบอล (ใหญ่ขึ้น เล็กลงเมื่อพุ่งลึก) */}
              <div
                className="absolute z-10"
                style={{
                  left: `${ballX}%`,
                  bottom: ballBottom,
                  transform: `scale(${ballScale})`,
                  transition: ballFlying ? "left 0.55s cubic-bezier(.3,.6,.6,1), bottom 0.55s cubic-bezier(.2,1.4,.7,1), transform 0.55s ease-out" : "none",
                }}
              >
                <Ball size={38} spinning={ballFlying} />
              </div>

              {/* ผลลัพธ์ */}
              {phase === "goal" && (
                <div className="pointer-events-none absolute inset-0 grid place-items-center">
                  <span className="goal-pop rounded-2xl bg-amber-400 px-8 py-2.5 text-4xl font-black text-white shadow-xl ring-4 ring-amber-200">GOAL! 🎉</span>
                </div>
              )}
              {phase === "miss" && (
                <div className="pointer-events-none absolute inset-0 grid place-items-center">
                  <span className="goal-pop rounded-2xl bg-slate-700 px-6 py-2.5 text-3xl font-black text-white shadow-xl">ออกนอกโกล! 💨</span>
                </div>
              )}
            </div>

            {phase === "miss" && <p className="text-center text-sm font-extrabold text-rose-600">❌ ช่องนั้นยังไม่ถูก {mode === "team" ? "— เสียตาให้อีกทีม" : "— ลูกต่อไปสู้ใหม่!"}</p>}
            {phase === "goal" && <p className="text-center text-sm font-extrabold text-emerald-600">✅ เสียบตาข่าย! สุดยอด</p>}
          </div>
        )}
      </div>
    </div>
  );
}
