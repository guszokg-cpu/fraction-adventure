"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Volume2, VolumeX, FlaskConical, Zap, Eye, EyeOff, Users, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { Frac } from "@/components/lessons/Frac";
import { cn } from "@/lib/cn";
import { randInt } from "@/lib/randomFraction";

/* ── ค่าคงที่ ── */

type Mixed = { whole: number; num: number; den: number };
const DEN_OPTIONS = [2, 3, 4, 5, 6];
const MISSIONS_TOTAL = 8;
const TEAM_WIN = 5;

const FRUITS = [
  { emoji: "🍊", name: "น้ำส้ม", juice: "#fb923c", dark: "#c2410c", light: "#fed7aa" },
  { emoji: "🍇", name: "น้ำองุ่น", juice: "#a78bfa", dark: "#6d28d9", light: "#ddd6fe" },
  { emoji: "🍓", name: "น้ำสตรอว์เบอร์รี", juice: "#f87171", dark: "#b91c1c", light: "#fecaca" },
  { emoji: "🍉", name: "น้ำแตงโม", juice: "#fb7185", dark: "#be123c", light: "#fecdd3" },
  { emoji: "🍍", name: "น้ำสับปะรด", juice: "#facc15", dark: "#a16207", light: "#fef08a" },
];

function pickDen(level: 1 | 2 | 3): number {
  return DEN_OPTIONS[level === 1 ? randInt(0, 1) : level === 2 ? randInt(0, 3) : randInt(0, DEN_OPTIONS.length - 1)];
}
function randomMixed(level: 1 | 2 | 3): Mixed {
  const den = pickDen(level);
  return { whole: randInt(1, level === 1 ? 2 : 3), num: randInt(1, den - 1), den };
}
const improperNum = (m: Mixed) => m.whole * m.den + m.num;

/* ── เสียง ── */

type SoundKind = "pour" | "glass" | "correct" | "wrong" | "bell" | "star" | "start" | "win";

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
      case "pour": return sweep(700, 300, 0.35, "sawtooth", 0.07);
      case "glass": return tones([1319, 1760], 0.05, 0.1, "sine", 0.1);
      case "correct": return tones([660, 990, 1319], 0.06, 0.1, "triangle", 0.14);
      case "wrong": return tones([220, 165], 0.11, 0.18, "sawtooth", 0.09);
      case "bell": return tones([1047, 1568], 0.08, 0.18, "sine", 0.12);
      case "star": return tones([1047, 1319, 1568, 2093], 0.07, 0.14, "triangle", 0.14);
      case "start": return tones([523, 659, 784], 0.07, 0.12, "triangle", 0.14);
      case "win": return tones([523, 659, 784, 1047, 1319, 1568], 0.09, 0.17, "triangle", 0.15);
    }
  }
  return { play, ensure };
}

/* ── เพลงโรงงาน (ชิปทูน ไม่ใช้ไฟล์) ── */

const JF_LEAD = [64, 67, 71, 72, 71, 67, 64, 0, 62, 65, 69, 71, 69, 65, 62, 0, 60, 64, 67, 72, 71, 69, 67, 64, 65, 67, 69, 71, 72, 0, 0, 0];
const JF_BASS = [40, 47, 43, 47, 38, 45, 41, 45, 36, 43, 40, 43, 41, 48, 43, 48];

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
      const m = JF_LEAD[s];
      if (m) note(m, 0.16, "square", 0.026);
      if (s % 2 === 0) {
        const b = JF_BASS[s / 2];
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

/* ── ขวดน้ำผลไม้ ── */

function Bottle({ fill, fruit, r = 1, tappable, onTap, dim }: { fill: number; fruit: typeof FRUITS[number]; r?: number; tappable?: boolean; onTap?: () => void; dim?: boolean }) {
  const w = 40 * r, h = 78 * r;
  const bodyTop = 26 * r, bodyBot = 72 * r;
  const level = bodyBot - (bodyBot - bodyTop) * fill;
  const svg = (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} role="img" aria-label={`ขวด${fruit.name} เต็ม ${Math.round(fill * 100)}%`}>
      <defs>
        <clipPath id={`bcl-${fruit.dark}-${r}`}>
          <path d={`M${13 * r},${bodyTop} Q${13 * r},${22 * r} ${16 * r},${20 * r} L${16 * r},${10 * r} Q${16 * r},${6 * r} ${20 * r},${6 * r} Q${24 * r},${6 * r} ${24 * r},${10 * r} L${24 * r},${20 * r} Q${27 * r},${22 * r} ${27 * r},${bodyTop} L${27 * r},${bodyBot} Q${27 * r},${75 * r} ${20 * r},${75 * r} Q${13 * r},${75 * r} ${13 * r},${bodyBot} Z`} />
        </clipPath>
      </defs>
      {/* ฝา */}
      <rect x={15 * r} y={2 * r} width={10 * r} height={6 * r} rx={2 * r} fill={fruit.dark} />
      {/* ตัวขวด */}
      <path d={`M${13 * r},${bodyTop} Q${13 * r},${22 * r} ${16 * r},${20 * r} L${16 * r},${10 * r} Q${16 * r},${6 * r} ${20 * r},${6 * r} Q${24 * r},${6 * r} ${24 * r},${10 * r} L${24 * r},${20 * r} Q${27 * r},${22 * r} ${27 * r},${bodyTop} L${27 * r},${bodyBot} Q${27 * r},${75 * r} ${20 * r},${75 * r} Q${13 * r},${75 * r} ${13 * r},${bodyBot} Z`} fill="#fff" stroke="#cbd5e1" strokeWidth={1.5 * r} opacity={dim ? 0.5 : 1} />
      {/* น้ำ */}
      <g clipPath={`url(#bcl-${fruit.dark}-${r})`}>
        <rect x={0} y={level} width={w} height={h} fill={fruit.juice} opacity={dim ? 0.4 : 0.92} />
        <rect x={0} y={level} width={w} height={2.5 * r} fill={fruit.light} opacity={dim ? 0.4 : 0.9} />
      </g>
      <rect x={14 * r} y={30 * r} width={4 * r} height={30 * r} rx={2 * r} fill="#fff" opacity={0.35} />
      {/* ฉลากผลไม้ */}
      <text x={20 * r} y={52 * r} fontSize={13 * r} textAnchor="middle">{fruit.emoji}</text>
    </svg>
  );
  if (tappable) {
    return (
      <button onClick={onTap} className="transition hover:-translate-y-1 active:scale-90" aria-label={`เทขวด${fruit.name}`}>
        {svg}
      </button>
    );
  }
  return svg;
}

/* ── แก้วน้ำ ── */

function Glass({ fruit, r = 1 }: { fruit: typeof FRUITS[number]; r?: number }) {
  const w = 26 * r, h = 32 * r;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} role="img" aria-label={`แก้ว${fruit.name}`} className="glass-pop">
      <path d={`M${5 * r},${5 * r} L${21 * r},${5 * r} L${19 * r},${29 * r} Q${19 * r},${30 * r} ${18 * r},${30 * r} L${8 * r},${30 * r} Q${7 * r},${30 * r} ${7 * r},${29 * r} Z`} fill="#fff" stroke="#cbd5e1" strokeWidth={1.2 * r} />
      <path d={`M${6 * r},${11 * r} L${20 * r},${11 * r} L${18.7 * r},${28.5 * r} Q${18.7 * r},${29.3 * r} ${18 * r},${29.3 * r} L${8 * r},${29.3 * r} Q${7.3 * r},${29.3 * r} ${7.3 * r},${28.5 * r} Z`} fill={fruit.juice} opacity={0.9} />
      <rect x={7 * r} y={11 * r} width={13 * r} height={2 * r} fill={fruit.light} />
      <rect x={9 * r} y={2 * r} width={2.5 * r} height={12 * r} rx={1 * r} fill={fruit.dark} transform={`rotate(12 ${10 * r} ${8 * r})`} />
    </svg>
  );
}

/* ── ตัวเลือกจำนวนคละ (โหมดครู) ── */

function MixedPicker({ m, onChange }: { m: Mixed; onChange: (m: Mixed) => void }) {
  const btn = "h-6 w-6 rounded border-2 border-slate-200 bg-white text-sm font-extrabold text-slate-600 hover:bg-slate-50 active:scale-95";
  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col items-center gap-0.5">
        <button onClick={() => onChange({ ...m, whole: Math.min(3, m.whole + 1) })} className={btn}>+</button>
        <span className="text-2xl font-extrabold text-lime-700">{m.whole}</span>
        <button onClick={() => onChange({ ...m, whole: Math.max(1, m.whole - 1) })} className={btn}>−</button>
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <button onClick={() => onChange({ ...m, num: Math.min(m.den - 1, m.num + 1) })} className={btn}>+</button>
        <span className="text-xl font-extrabold text-lime-700">{m.num}</span>
        <div className="h-[3px] w-8 rounded bg-lime-700" />
        <span className="text-xl font-extrabold text-slate-400">{m.den}</span>
        <button onClick={() => onChange({ ...m, num: Math.max(1, m.num - 1) })} className={btn}>−</button>
      </div>
      <span className="mx-1 text-slate-300">|</span>
      <span className="text-xs font-extrabold text-slate-500">ขวดละ</span>
      {DEN_OPTIONS.map((d) => (
        <button key={d} onClick={() => onChange({ whole: m.whole, den: d, num: Math.min(m.num, d - 1) })} className={cn("h-7 w-7 rounded-lg border-2 text-sm font-extrabold transition", m.den === d ? "border-lime-500 bg-lime-100 text-lime-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>{d}</button>
      ))}
    </div>
  );
}

/* ── ตัวเลือกเศษเกิน (num/den) ── */

function ImproperInput({ num, den, onNum, disabled }: { num: number; den: number; onNum: (d: number) => void; disabled: boolean }) {
  const btn = "h-8 w-8 rounded-lg border-2 border-slate-200 bg-white text-lg font-extrabold text-slate-600 hover:bg-slate-50 active:scale-95 disabled:opacity-40";
  const box = "grid place-items-center rounded-xl border-2 border-lime-300 bg-white font-extrabold text-lime-700";
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-2">
        <span className="w-8 text-right text-[10px] font-extrabold text-slate-400">แก้วรวม</span>
        <button onClick={() => onNum(-1)} disabled={disabled} className={btn}>−</button>
        <div className={cn(box, "h-12 w-14 text-3xl")}>{num}</div>
        <button onClick={() => onNum(1)} disabled={disabled} className={btn}>+</button>
        <span className="w-8" aria-hidden />
      </div>
      <div className="h-[3px] w-12 rounded bg-lime-700" />
      <div className="flex items-center gap-2">
        <span className="w-8" aria-hidden />
        <span className="w-8" aria-hidden />
        <div className={cn(box, "h-12 w-14 text-3xl border-slate-200 text-slate-400")}>{den}</div>
        <span className="w-8" aria-hidden />
        <span className="w-8 text-left text-[10px] font-extrabold text-slate-400">แก้ว/ขวด</span>
      </div>
    </div>
  );
}

/* ── แถวแก้วที่ผลิต (จัดกลุ่มตามขวด: den + den + num) ── */

function GlassRows({ groups, fruit }: { groups: number[]; fruit: typeof FRUITS[number] }) {
  return (
    <div className="flex flex-wrap items-end justify-center gap-x-4 gap-y-2">
      {groups.map((g, gi) => (
        <div key={gi} className="flex flex-col items-center gap-0.5">
          <div className="flex items-end gap-0.5">
            {Array.from({ length: g }, (_, i) => <Glass key={i} fruit={fruit} r={0.9} />)}
          </div>
          <span className="text-[10px] font-extrabold text-slate-400">{g} แก้ว</span>
        </div>
      ))}
    </div>
  );
}

/* ── เกมหลัก ── */

type Phase = "pour" | "answer" | "done";
type Mode = "lab" | "solo" | "team";

export function MixedJuiceGame() {
  const [mode, setMode] = useState<Mode>("lab");
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
  const [m, setM] = useState<Mixed>({ whole: 2, num: 1, den: 3 });
  const [fruitIdx, setFruitIdx] = useState(0);
  const fruit = FRUITS[fruitIdx];

  /* เฟสเท (โหมดครู) */
  const [phase, setPhase] = useState<Phase>("pour");
  const [pouredBottles, setPouredBottles] = useState(0);
  const [pouredFrac, setPouredFrac] = useState(false);
  const [ansNum, setAnsNum] = useState(0);
  const [checked, setChecked] = useState<null | boolean>(null);
  const [badge, setBadge] = useState<string | null>(null);
  const timeoutsRef = useRef<number[]>([]);
  useEffect(() => () => timeoutsRef.current.forEach((t) => window.clearTimeout(t)), []);

  /* โหมดโรงงานเร่งด่วน (solo) */
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [firstTry, setFirstTry] = useState(true);
  const [gameOver, setGameOver] = useState(false);

  /* โหมด 2 ทีม */
  const [teamFill, setTeamFill] = useState<[number, number]>([0, 0]);
  const [team, setTeam] = useState(0);
  const [teamOpts, setTeamOpts] = useState<number[]>([]); // ตัวเลือก numerator
  const [teamWinner, setTeamWinner] = useState<number | null>(null);
  const [teamPick, setTeamPick] = useState<number | null>(null);

  const total = improperNum(m);
  const glasses = pouredBottles * m.den + (pouredFrac ? m.num : 0);
  const groups = [...Array.from({ length: pouredBottles }, () => m.den), ...(pouredFrac ? [m.num] : [])];
  const allPoured = pouredBottles >= m.whole && pouredFrac;

  function resetPour(mm: Mixed, keepFruit = false) {
    setM(mm);
    setPouredBottles(0);
    setPouredFrac(false);
    setAnsNum(0);
    setChecked(null);
    setBadge(null);
    setPhase("pour");
    setFirstTry(true);
    if (!keepFruit) setFruitIdx(randInt(0, FRUITS.length - 1));
  }

  function pourBottle() {
    if (phase !== "pour" || pouredBottles >= m.whole) return;
    setPouredBottles((b) => b + 1);
    play("pour");
    timeoutsRef.current.push(window.setTimeout(() => play("glass"), 220));
    setBadge(`1 ขวด = ${m.den}/${m.den} = ${m.den} แก้ว!`);
    timeoutsRef.current.push(window.setTimeout(() => setBadge(null), 1100));
  }
  function pourFrac() {
    if (phase !== "pour" || pouredFrac || pouredBottles < m.whole) return;
    setPouredFrac(true);
    play("pour");
    timeoutsRef.current.push(window.setTimeout(() => play("glass"), 220));
    setBadge(`เศษ ${m.num}/${m.den} = ${m.num} แก้ว`);
    timeoutsRef.current.push(window.setTimeout(() => setBadge(null), 1100));
  }
  function pourAll() {
    if (phase !== "pour") return;
    setPouredBottles(m.whole);
    setPouredFrac(true);
    play("pour");
  }
  useEffect(() => {
    if (phase === "pour" && allPoured) {
      timeoutsRef.current.push(window.setTimeout(() => setPhase("answer"), 500));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPoured, phase]);

  function checkAnswer() {
    if (phase !== "answer") return;
    const ok = ansNum === total;
    setChecked(ok);
    if (ok) {
      play("correct");
      if (mode === "solo") setScore((s) => s + (firstTry ? 25 : 12));
      timeoutsRef.current.push(window.setTimeout(() => setPhase("done"), 500));
    } else {
      play("wrong");
      setFirstTry(false);
      timeoutsRef.current.push(window.setTimeout(() => setChecked(null), 900));
    }
  }

  /* solo flow */
  function startSolo() {
    ensure(); play("start");
    setScore(0); setRound(1); setGameOver(false);
    resetPour(randomMixed(level));
    setMode("solo");
  }
  function nextOrder() {
    if (mode === "lab") { play("bell"); resetPour(randomMixed(level)); return; }
    if (round >= MISSIONS_TOTAL) { setGameOver(true); play("star"); return; }
    setRound((r) => r + 1);
    play("bell");
    resetPour(randomMixed(level));
  }

  /* team flow */
  function genTeamOpts(mm: Mixed): number[] {
    const correct = improperNum(mm);
    const cands = new Set<number>([correct]);
    cands.add(mm.whole + mm.num); // ลืมคูณ
    cands.add(mm.whole * mm.den); // ลืมบวกเศษ
    cands.add(correct + 1);
    cands.add(correct - 1);
    cands.add((mm.whole + 1) * mm.den + mm.num);
    const arr = Array.from(cands).filter((x) => x > 0);
    // เอา correct + สุ่มอีก 3
    const others = arr.filter((x) => x !== correct);
    for (let i = others.length - 1; i > 0; i--) { const j = randInt(0, i); [others[i], others[j]] = [others[j], others[i]]; }
    const opts = [correct, ...others.slice(0, 3)];
    for (let i = opts.length - 1; i > 0; i--) { const j = randInt(0, i); [opts[i], opts[j]] = [opts[j], opts[i]]; }
    return opts;
  }
  function startTeam() {
    ensure(); play("start");
    setTeamFill([0, 0]); setTeam(0); setTeamWinner(null); setTeamPick(null);
    const mm = randomMixed(level);
    setM(mm); setFruitIdx(randInt(0, FRUITS.length - 1));
    setTeamOpts(genTeamOpts(mm));
    setChecked(null);
    setMode("team");
  }
  function teamNext() {
    const mm = randomMixed(level);
    setM(mm); setFruitIdx(randInt(0, FRUITS.length - 1));
    setTeamOpts(genTeamOpts(mm));
    setChecked(null); setTeamPick(null);
  }
  function teamAnswer(val: number) {
    if (teamWinner !== null || checked !== null) return;
    const correct = improperNum(m);
    setTeamPick(val);
    const ok = val === correct;
    setChecked(ok);
    if (ok) {
      play("correct");
      setTeamFill((f) => {
        const nf: [number, number] = [...f];
        nf[team] = Math.min(TEAM_WIN, nf[team] + 1);
        if (nf[team] >= TEAM_WIN) { setTeamWinner(team); play("win"); }
        return nf;
      });
      timeoutsRef.current.push(window.setTimeout(() => { if (teamFill[team] + 1 < TEAM_WIN) teamNext(); }, 1000));
    } else {
      play("wrong");
      timeoutsRef.current.push(window.setTimeout(() => { setTeam((t) => 1 - t); setChecked(null); setTeamPick(null); }, 1100));
    }
  }

  const stars = score >= 170 ? 3 : score >= 100 ? 2 : 1;

  return (
    <div className="relative overflow-hidden rounded-2xl p-3 sm:p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-lime-50 via-emerald-50 to-teal-50" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden text-xl" aria-hidden>
        <span className="absolute left-4 top-6 opacity-25">🏭</span>
        <span className="absolute right-6 top-12 opacity-25">🧃</span>
        <span className="absolute bottom-10 right-10 opacity-20">🍹</span>
      </div>
      <style>{`
        @keyframes glassPop { 0% { transform: translateY(8px) scale(0.6); opacity: 0; } 60% { transform: translateY(-2px) scale(1.1); } 100% { transform: translateY(0) scale(1); opacity: 1; } }
        .glass-pop { animation: glassPop 0.34s ease-out; }
        @keyframes badgePop { 0% { transform: scale(0.5); opacity: 0; } 30% { transform: scale(1.1); opacity: 1; } 85% { opacity: 1; } 100% { transform: scale(1); opacity: 0; } }
        .badge-pop { animation: badgePop 1.1s ease-out; }
        @keyframes pourFlow { 0% { transform: scaleY(0); } 50% { transform: scaleY(1); } 100% { transform: scaleY(0); } }
        .pour-flow { transform-origin: top; animation: pourFlow 0.5s ease-in-out; }
      `}</style>

      <div className="relative space-y-3">
        {/* โหมด + ปิดเสียง */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap rounded-xl border-2 border-slate-200 bg-white p-1">
            <button onClick={() => { setMode("lab"); resetPour(m, true); }} className={cn("flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-extrabold transition", mode === "lab" ? "bg-lime-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <FlaskConical size={15} /> โหมดครู
            </button>
            <button onClick={startSolo} className={cn("flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-extrabold transition", mode === "solo" ? "bg-emerald-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <Zap size={15} /> โรงงานเร่งด่วน
            </button>
            <button onClick={startTeam} className={cn("flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-extrabold transition", mode === "team" ? "bg-rose-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <Users size={15} /> 2 ทีมแข่ง
            </button>
          </div>
          <button onClick={() => setMuted((mm) => !mm)} className="grid h-9 w-9 place-items-center rounded-xl border-2 border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50" title={muted ? "เปิดเสียง" : "ปิดเสียง"}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {/* ═══ โหมด 2 ทีม ═══ */}
        {mode === "team" ? (
          <div className="space-y-3">
            {/* ถังส่งของ 2 ทีม */}
            <div className="grid grid-cols-2 gap-2">
              {([0, 1] as const).map((ti) => (
                <div key={ti} className={cn("rounded-2xl border-2 p-2 text-center transition", ti === 0 ? "border-rose-300" : "border-sky-300", team === ti && teamWinner === null && "ring-2", team === ti && teamWinner === null && (ti === 0 ? "ring-rose-300" : "ring-sky-300"))}>
                  <p className={cn("text-sm font-extrabold", ti === 0 ? "text-rose-600" : "text-sky-600")}>{ti === 0 ? "🔴 ทีมแดง" : "🔵 ทีมน้ำเงิน"} {team === ti && teamWinner === null && "◀ ตาเธอ"}</p>
                  <div className="mt-1 flex items-center justify-center gap-1">
                    {Array.from({ length: TEAM_WIN }, (_, i) => (
                      <span key={i} className={cn("h-4 w-4 rounded-full ring-1 transition", i < teamFill[ti] ? (ti === 0 ? "bg-rose-500 ring-rose-600" : "bg-sky-500 ring-sky-600") : "bg-slate-100 ring-slate-300")} />
                    ))}
                  </div>
                  <p className="mt-0.5 text-[11px] font-bold text-slate-400">ส่งน้ำครบ {TEAM_WIN} ออเดอร์ = ชนะ</p>
                </div>
              ))}
            </div>

            {teamWinner !== null ? (
              <div className="space-y-3 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-6 text-center">
                <div className="text-5xl">🚚🧃🏆</div>
                <h3 className="text-xl font-extrabold text-slate-800 sm:text-2xl">{teamWinner === 0 ? "🔴 ทีมแดง" : "🔵 ทีมน้ำเงิน"} ส่งน้ำครบก่อน — ชนะ!</h3>
                <button onClick={startTeam} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-orange-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
                  <RotateCcw size={18} /> แข่งใหม่
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 rounded-2xl border-2 border-teal-200 bg-white/90 p-3">
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-teal-100 text-3xl ring-2 ring-teal-300">🐵</span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-1.5 text-sm font-extrabold text-slate-700">
                      &quot;{fruit.emoji} {fruit.name}
                      <span className="inline-flex items-center gap-1 text-lg text-lime-700">
                        {m.whole}<StackedFraction numerator={m.num} denominator={m.den} className="text-base" toneClassName="text-lime-700" />
                      </span>
                      ขวด = กี่แก้ว? (ขวดละ {m.den})&quot;
                    </p>
                    <p className="mt-0.5 text-xs font-bold text-slate-500">ตอบถูก = ส่งน้ำ 1 ออเดอร์ · ตอบผิด = เสียตาให้อีกทีม</p>
                  </div>
                </div>
                <div className="mx-auto grid max-w-md grid-cols-2 gap-2 sm:gap-3">
                  {teamOpts.map((opt, i) => {
                    const correct = improperNum(m);
                    const isAns = opt === correct;
                    const chosen = teamPick === opt;
                    return (
                      <button
                        key={i}
                        onClick={() => teamAnswer(opt)}
                        disabled={checked !== null}
                        className={cn("flex items-center justify-center rounded-2xl border-b-4 bg-white py-3 shadow transition",
                          checked === null ? "border-slate-300 hover:-translate-y-0.5 active:scale-[0.97]" : isAns ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-300" : chosen ? "border-rose-500 bg-rose-50" : "border-slate-300 opacity-50")}
                      >
                        <StackedFraction numerator={opt} denominator={m.den} className="text-2xl" toneClassName={team === 0 ? "text-rose-600" : "text-sky-600"} />
                      </button>
                    );
                  })}
                </div>
                {checked === false && <p className="text-center text-sm font-extrabold text-rose-600">❌ ยังไม่ใช่ — {m.whole}×{m.den}+{m.num} = {improperNum(m)} · เสียตาให้อีกทีม</p>}
                {checked === true && <p className="text-center text-sm font-extrabold text-emerald-600">✅ ถูกต้อง! {m.whole}×{m.den}+{m.num} = {improperNum(m)} แก้ว</p>}
              </>
            )}
          </div>
        ) : mode === "solo" && gameOver ? (
          /* ═══ สรุปโรงงานเร่งด่วน ═══ */
          <div className="space-y-4 rounded-2xl border-2 border-emerald-300 bg-white/90 p-6 text-center">
            <div className="text-5xl">🧃🏆</div>
            <h3 className="text-xl font-extrabold text-slate-800 sm:text-2xl">ปิดกะแล้ว! ส่งน้ำครบทุกออเดอร์</h3>
            <p className="text-2xl">{"⭐".repeat(stars)}{"☆".repeat(3 - stars)}</p>
            <p className="text-base font-extrabold text-emerald-700">🏅 คะแนนรวม {score}</p>
            <button onClick={startSolo} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-lime-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
              <Play size={18} /> เปิดกะใหม่
            </button>
          </div>
        ) : (
          /* ═══ โหมดครู + โรงงานเร่งด่วน (เฟสเท) ═══ */
          <div className="space-y-3">
            {mode === "lab" ? (
              <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-lime-200 bg-white/85 px-3 py-2">
                <span className="text-sm font-extrabold text-lime-700">🧑‍🏫 ตั้งออเดอร์:</span>
                <MixedPicker m={m} onChange={(mm) => resetPour(mm, true)} />
                <button onClick={() => setReveal((v) => !v)} className={cn("flex items-center gap-1 rounded-lg border-2 px-2 py-1 text-xs font-extrabold transition", reveal ? "border-violet-400 bg-violet-100 text-violet-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
                  {reveal ? <EyeOff size={13} /> : <Eye size={13} />} เฉลย
                </button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 rounded-2xl bg-white/85 px-4 py-2 ring-1 ring-emerald-200">
                <span className="text-base font-extrabold text-emerald-700">🎯 ออเดอร์ที่ {round}/{MISSIONS_TOTAL}</span>
                <span className="text-base font-extrabold text-lime-700">🏅 {score}</span>
              </div>
            )}

            {/* ลูกค้า + ออเดอร์ */}
            <div className="flex items-center gap-3 rounded-2xl border-2 border-teal-200 bg-white/90 p-3">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-teal-100 text-3xl ring-2 ring-teal-300">🐵</span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-1.5 text-sm font-extrabold text-slate-700">
                  &quot;ปาร์ตี้ขอ {fruit.emoji} {fruit.name} เป็นแก้ว! ในคลังมี
                  <span className="inline-flex items-center gap-1 text-lg text-lime-700">
                    {m.whole}<StackedFraction numerator={m.num} denominator={m.den} className="text-base" toneClassName="text-lime-700" />
                  </span>
                  ขวด (ขวดละ {m.den} แก้ว) — รินได้กี่แก้ว?&quot;
                </p>
              </div>
            </div>

            {/* เฟสเท */}
            {phase === "pour" && (
              <div className="space-y-3 rounded-2xl border-2 border-lime-200 bg-white/90 p-3">
                <p className="text-center text-sm font-extrabold text-slate-600">🫗 แตะขวดเพื่อเทลงเครื่อง — ดูว่าได้กี่แก้ว! (ขวดเต็ม = {m.den}/{m.den} = {m.den} แก้ว)</p>

                {/* คลังขวด */}
                <div className="flex flex-wrap items-end justify-center gap-2">
                  {Array.from({ length: m.whole }, (_, i) => (
                    <Bottle key={i} fill={i < pouredBottles ? 0 : 1} fruit={fruit} r={1} tappable={i === pouredBottles && phase === "pour"} onTap={pourBottle} dim={i < pouredBottles} />
                  ))}
                  {/* ขวดเศษ */}
                  <div className="relative">
                    <Bottle fill={pouredFrac ? 0 : m.num / m.den} fruit={fruit} r={1} tappable={pouredBottles >= m.whole && !pouredFrac} onTap={pourFrac} dim={pouredFrac} />
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-lime-100 px-1 text-[9px] font-extrabold text-lime-700">{m.num}/{m.den} ขวด</span>
                  </div>
                </div>

                {/* เครื่องจักร + ป้าย */}
                <div className="relative flex flex-col items-center">
                  <div className="text-2xl">⚙️🏭⚙️</div>
                  {badge && <div className="badge-pop absolute -top-6 rounded-full bg-lime-500 px-3 py-1 text-sm font-extrabold text-white shadow-lg">{badge}</div>}
                </div>

                {/* ถาดแก้ว */}
                {glasses > 0 && (
                  <div className="rounded-xl border-2 border-dashed border-lime-200 bg-lime-50/50 p-2">
                    <GlassRows groups={groups} fruit={fruit} />
                    <p className="mt-1 text-center text-sm font-extrabold text-lime-700">รวม {glasses} แก้ว</p>
                  </div>
                )}

                {!allPoured && (
                  <div className="flex justify-center">
                    <button onClick={pourAll} className="rounded-xl border-2 border-lime-300 bg-lime-50 px-4 py-1.5 text-sm font-extrabold text-lime-700 transition hover:bg-lime-100">⚡ เทหมดเลย</button>
                  </div>
                )}
              </div>
            )}

            {phase === "answer" && (
              <div className="space-y-3 rounded-2xl border-2 border-emerald-200 bg-white/90 p-4">
                <div className="rounded-xl border-2 border-dashed border-lime-200 bg-lime-50/50 p-2">
                  <GlassRows groups={groups} fruit={fruit} />
                </div>
                <p className="text-center text-sm font-extrabold text-slate-600">
                  ได้ทั้งหมด <b className="text-emerald-600">{total} แก้ว</b> — เขียนเป็น<b>เศษเกิน</b> (แก้วทั้งหมด / แก้วต่อขวด):
                </p>
                <ImproperInput num={ansNum} den={m.den} onNum={(d) => setAnsNum((n) => Math.max(0, Math.min(m.den * 4, n + d)))} disabled={checked === true} />

                {reveal && mode === "lab" && (
                  <p className="flex flex-wrap items-center justify-center gap-1 text-center text-sm font-extrabold text-violet-600">เฉลย: {m.whole}×{m.den}+{m.num} = {total} → <Frac n={total} d={m.den} /></p>
                )}
                {checked === false && <p className="text-center text-sm font-extrabold text-rose-600">❌ ยังไม่ตรง ลองนับแก้วทั้งหมดอีกที (ขวดละ {m.den} แก้ว)</p>}

                <div className="flex justify-center">
                  <button onClick={checkAnswer} disabled={checked === true} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-lime-500 px-8 py-2.5 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98] disabled:opacity-60">
                    🐵 เช็คกับลิงเจ้าของสวน
                  </button>
                </div>
              </div>
            )}

            {phase === "done" && (
              <div className="space-y-3 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 text-center">
                <div className="text-4xl">🐵🧃🎉</div>
                <p className="text-lg font-extrabold text-emerald-700">ลิงเจ้าของสวน: &quot;เยี่ยม! ยกไปปาร์ตี้ได้เลย&quot;</p>
                <p className="flex flex-wrap items-center justify-center gap-2 text-base font-extrabold text-slate-700">
                  <span className="inline-flex items-center gap-1 text-xl text-lime-700">
                    {m.whole}<StackedFraction numerator={m.num} denominator={m.den} className="text-base" toneClassName="text-lime-700" />
                  </span>
                  <span className="text-slate-400">= ({m.whole}×{m.den}+{m.num}) =</span>
                  <StackedFraction numerator={total} denominator={m.den} className="text-2xl" toneClassName="text-emerald-700" />
                </p>
                <div className="flex justify-center gap-2">
                  {mode === "solo" ? (
                    <button onClick={nextOrder} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-lime-500 px-6 py-2.5 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                      {round >= MISSIONS_TOTAL ? "🏁 ปิดกะ ดูสรุป" : <>ออเดอร์ต่อไป <ArrowRight size={16} /></>}
                    </button>
                  ) : (
                    <>
                      <button onClick={() => resetPour(m, true)} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50">
                        <RotateCcw size={15} /> ทำอีกครั้ง
                      </button>
                      <button onClick={nextOrder} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-lime-600 to-emerald-500 px-5 py-2 text-sm font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
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
