"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Volume2, VolumeX, FlaskConical, Target, ArrowRight, Plus, Minus } from "lucide-react";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { Frac, SvgFrac } from "@/components/lessons/Frac";
import { cn } from "@/lib/cn";
import { randInt, shuffle } from "@/lib/randomFraction";

/* ── ค่าคงที่ ── */

const MISSIONS_TOTAL = 8;
const TEACHER_PAIRS: [number, number][] = [[2, 3], [2, 4], [3, 4], [2, 5], [3, 6], [4, 6], [2, 6], [4, 8]];
const L1_PAIRS: [number, number][] = [[2, 4], [3, 6], [2, 6], [4, 8], [2, 8], [4, 12], [6, 12]];
const L2_PAIRS: [number, number][] = [[2, 3], [3, 4], [2, 5], [4, 6]];

const gcd = (x: number, y: number): number => (y ? gcd(y, x % y) : x);
const lcm = (x: number, y: number) => (x * y) / gcd(x, y);
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** ตัวเลือกตัวส่วนร่วม: ค.ร.น. + ตัวใช้ได้ที่ใหญ่กว่า + กับดัก b+d + ตัวลวง */
function makeOptions(nb: number, nd: number): number[] {
  const L = lcm(nb, nd);
  const set = new Set<number>([L]);
  if ((nb + nd) % nb !== 0 || (nb + nd) % nd !== 0) set.add(nb + nd);
  [nb * nd, 2 * L].forEach((v) => { if (v % nb === 0 && v % nd === 0 && set.size < 4) set.add(v); });
  [L - 1, Math.max(nb, nd) + 1, nb * nd + 1, L + 3].forEach((v) => { if (v > 1 && (v % nb !== 0 || v % nd !== 0) && set.size < 4) set.add(v); });
  let pad = 5;
  while (set.size < 4) { set.add(L + pad); pad += 2; }
  return shuffle([...set]).slice(0, 4);
}

/* ── ตัวละครนักวิทยาศาสตร์น้อย ── */

type Hair = "short" | "ponytail" | "topknot" | "braids" | "bob";
const KIDS = [
  { name: "น้องภูมิ", skin: "#fcd9b8", hair: "#2d2013", hairStyle: "short" as Hair, shirt: "#f8fafc", accent: "#3b82f6" },
  { name: "น้องแนน", skin: "#ffe0c4", hair: "#3b2412", hairStyle: "ponytail" as Hair, shirt: "#f8fafc", accent: "#ef4444" },
  { name: "น้องเจได", skin: "#f5cba3", hair: "#1c1c1c", hairStyle: "topknot" as Hair, shirt: "#f8fafc", accent: "#f59e0b" },
  { name: "น้องพลอย", skin: "#ffd9c9", hair: "#4a2e18", hairStyle: "braids" as Hair, shirt: "#f8fafc", accent: "#ec4899" },
  { name: "น้องมายด์", skin: "#fbe3cf", hair: "#2b1d10", hairStyle: "bob" as Hair, shirt: "#f8fafc", accent: "#facc15" },
];
type Kid = typeof KIDS[number];
type Mood = "normal" | "think" | "happy" | "worried";

function SciKid({ kid, mood, size = 62 }: { kid: Kid; mood: Mood; size?: number }) {
  const happy = mood === "happy";
  const worried = mood === "worried";
  return (
    <svg viewBox="0 0 44 60" width={size * 0.72} height={size} role="img" aria-label={`นักวิทยาศาสตร์ ${kid.name}`}>
      {kid.hairStyle === "ponytail" && <ellipse cx={31} cy={14} rx={5} ry={7} fill={kid.hair} />}
      {kid.hairStyle === "braids" && <><ellipse cx={11} cy={16} rx={3.6} ry={7} fill={kid.hair} /><ellipse cx={33} cy={16} rx={3.6} ry={7} fill={kid.hair} /></>}
      <rect x={12} y={8} width={20} height={17} rx={5} fill={kid.skin} stroke="#00000022" strokeWidth={1} />
      {kid.hairStyle === "short" && <path d="M10,12 Q11,4 22,4 Q33,4 34,12 L34,10 Q30,7 22,7 Q14,7 10,10 Z" fill={kid.hair} />}
      {kid.hairStyle === "ponytail" && <><path d="M10,12 Q11,4 22,4 Q33,4 34,12 L34,9 Q30,6 22,6 Q14,6 10,9 Z" fill={kid.hair} /><rect x={26} y={5} width={4} height={3} rx={1.5} fill="#ef4444" /></>}
      {kid.hairStyle === "topknot" && <><path d="M10,13 Q11,6 22,6 Q33,6 34,13 L34,11 Q30,8.5 22,8.5 Q14,8.5 10,11 Z" fill={kid.hair} /><circle cx={22} cy={3} r={3.4} fill={kid.hair} /></>}
      {kid.hairStyle === "braids" && <path d="M10,12 Q11,4 22,4 Q33,4 34,12 L34,10 Q30,7 22,7 Q14,7 10,10 Z" fill={kid.hair} />}
      {kid.hairStyle === "bob" && <path d="M9.5,15 Q10,4 22,4 Q34,4 34.5,15 L33,15 Q32,8 22,8 Q12,8 11,15 Z" fill={kid.hair} />}
      {/* แว่นแล็บ */}
      <g stroke="#334155" strokeWidth={1.3} fill="rgba(186,230,253,0.55)">
        <rect x={15.5} y={13.5} width={5.5} height={5} rx={1.5} />
        <rect x={23} y={13.5} width={5.5} height={5} rx={1.5} />
        <line x1={21} y1={16} x2={23} y2={16} />
      </g>
      <circle cx={18.2} cy={16} r={1.1} fill="#1e293b" />
      <circle cx={25.8} cy={16} r={1.1} fill="#1e293b" />
      {happy && <><circle cx={15.5} cy={19.5} r={1.7} fill="#fca5a5" opacity={0.7} /><circle cx={28.5} cy={19.5} r={1.7} fill="#fca5a5" opacity={0.7} /></>}
      {happy
        ? <path d="M18,20.5 Q22,23 26,20.5" stroke="#1e293b" strokeWidth={1.5} fill="none" strokeLinecap="round" />
        : worried
          ? <path d="M19,21.5 Q22,20 25,21.5" stroke="#1e293b" strokeWidth={1.4} fill="none" strokeLinecap="round" />
          : <path d="M19,21 L25,21" stroke="#1e293b" strokeWidth={1.4} strokeLinecap="round" />}
      {/* เสื้อกาวน์ */}
      <rect x={13} y={25} width={18} height={17} rx={3} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={1.4} />
      <line x1={22} y1={25} x2={22} y2={42} stroke="#e2e8f0" strokeWidth={1} />
      <polygon points="20,25 22,29 24,25" fill={kid.accent} />
      <rect x={6} y={25} width={5} height={13} rx={2.5} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={1.2} />
      <circle cx={7.5} cy={38} r={2.6} fill={kid.skin} />
      <rect x={33} y={25} width={5} height={13} rx={2.5} fill="#f8fafc" stroke="#cbd5e1" strokeWidth={1.2} />
      <circle cx={35.5} cy={38} r={2.6} fill={kid.skin} />
      <rect x={15} y={41} width={5.5} height={14} rx={2} fill="#475569" />
      <rect x={23.5} y={41} width={5.5} height={14} rx={2} fill="#475569" />
      <rect x={14} y={54} width={7.5} height={4} rx={1.5} fill="#334155" />
      <rect x={22.5} y={54} width={7.5} height={4} rx={1.5} fill="#334155" />
    </svg>
  );
}

/* ── เสียง ── */

type SoundKind = "slice" | "creak" | "clink" | "balance" | "correct" | "wrong" | "start" | "star";

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
      case "slice": return tones([1400, 1700], 0.05, 0.06, "square", 0.05);
      case "creak": return sweep(300, 160, 0.35, "triangle", 0.06);
      case "clink": return tones([1568, 2093], 0.05, 0.09, "sine", 0.09);
      case "balance": return tones([784, 1047, 1319, 1568], 0.08, 0.2, "triangle", 0.13);
      case "correct": return tones([660, 990, 1319], 0.06, 0.1, "triangle", 0.14);
      case "wrong": return tones([220, 165], 0.11, 0.18, "sawtooth", 0.09);
      case "start": return tones([523, 659, 784], 0.07, 0.12, "triangle", 0.14);
      case "star": return tones([1047, 1319, 1568, 2093], 0.07, 0.14, "triangle", 0.14);
    }
  }
  return { play, ensure };
}

/* ── เพลงห้องแล็บ (ชิปทูน ไม่ใช้ไฟล์) ── */

const LB_LEAD = [69, 0, 71, 0, 72, 0, 71, 69, 67, 0, 69, 0, 71, 0, 0, 0, 72, 0, 74, 0, 76, 0, 74, 72, 71, 0, 69, 0, 67, 0, 0, 0];
const LB_BASS = [45, 45, 52, 52, 41, 41, 48, 48, 43, 43, 50, 50, 40, 40, 47, 47];

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
      const m = LB_LEAD[s];
      if (m) note(m, 0.18, "triangle", 0.028);
      if (s % 2 === 0) {
        const b = LB_BASS[s / 2];
        if (b) note(b, 0.2, "square", 0.03);
      }
    }, 200);
  }
  function stop() {
    if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
  }
  useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);
  return { start, stop };
}

/* ── แท่งเศษส่วน ── */

function FractionBar({ num, den, color, label }: { num: number; den: number; color: string; label: React.ReactNode }) {
  const cw = den > 8 ? 14 : 20;
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-[2px] rounded-lg border-2 border-slate-400 bg-white p-0.5">
        {Array.from({ length: den }, (_, i) => (
          <div key={i} className="bar-cell h-6 rounded-[2px] border border-slate-300" style={{ width: cw, background: i < num ? color : "#eef2f7" }} />
        ))}
      </div>
      <span className="text-sm font-extrabold" style={{ color }}>{label}</span>
    </div>
  );
}

/* ── เครื่องชั่งสมดุล ── */

const PX = 180, PY = 60, HALF = 120, STR = 30;

function Balance({ tilt, leftNum, rightNum, coins, n }: { tilt: number; leftNum: number; rightNum: number; coins: number; n: number }) {
  const rad = (tilt * Math.PI) / 180;
  const lx = PX - HALF * Math.cos(rad), ly = PY - HALF * Math.sin(rad);
  const rx = PX + HALF * Math.cos(rad), ry = PY + HALF * Math.sin(rad);
  const lpy = ly + STR, rpy = ry + STR;
  const coinCols = Math.min(coins, 6);
  return (
    <svg viewBox="0 0 360 200" className="w-full" role="img" aria-label="เครื่องชั่งสมดุล">
      {/* ฐาน + เสา */}
      <ellipse cx={PX} cy={188} rx={70} ry={7} fill="#00000012" />
      <polygon points={`${PX - 34},186 ${PX + 34},186 ${PX + 20},172 ${PX - 20},172`} fill="#94a3b8" stroke="#475569" strokeWidth={1.5} />
      <rect x={PX - 6} y={PY} width={12} height={116} fill="#cbd5e1" stroke="#64748b" strokeWidth={1.5} />
      {/* เข็มชี้กลาง (ตั้งตรง = สมดุล) */}
      <polygon points={`${PX},${PY - 20} ${PX - 4},${PY - 6} ${PX + 4},${PY - 6}`} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={1} />
      <g style={{ transformOrigin: `${PX}px ${PY}px`, transform: `rotate(${tilt}deg)`, transition: "transform 0.5s cubic-bezier(.34,1.4,.5,1)" }}>
        <polygon points={`${PX},${PY - 16} ${PX - 3},${PY - 4} ${PX + 3},${PY - 4}`} fill="#ef4444" />
      </g>

      {/* คาน */}
      <line x1={lx} y1={ly} x2={rx} y2={ry} stroke="#64748b" strokeWidth={7} strokeLinecap="round" style={{ transition: "all 0.5s cubic-bezier(.34,1.4,.5,1)" }} />
      <circle cx={PX} cy={PY} r={7} fill="#475569" />

      {/* เชือก + จานซ้าย */}
      <g style={{ transition: "all 0.5s cubic-bezier(.34,1.4,.5,1)" }}>
        <line x1={lx} y1={ly} x2={lx} y2={lpy} stroke="#94a3b8" strokeWidth={1.5} />
        <ellipse cx={lx} cy={lpy} rx={34} ry={7} fill="#bfdbfe" stroke="#3b82f6" strokeWidth={2} />
        <rect x={lx - 18} y={lpy - 26} width={36} height={22} rx={4} fill="#3b82f6" />
        <SvgFrac x={lx} y={lpy - 15} n={leftNum} d={n} size={11} fill="#fff" />
      </g>

      {/* เชือก + จานขวา (มีลูกตุ้ม) */}
      <g style={{ transition: "all 0.5s cubic-bezier(.34,1.4,.5,1)" }}>
        <line x1={rx} y1={ry} x2={rx} y2={rpy} stroke="#94a3b8" strokeWidth={1.5} />
        <ellipse cx={rx} cy={rpy} rx={34} ry={7} fill="#fbcfe8" stroke="#ec4899" strokeWidth={2} />
        <rect x={rx - 18} y={rpy - 26} width={36} height={22} rx={4} fill="#ec4899" />
        <SvgFrac x={rx} y={rpy - 15} n={rightNum} d={n} size={11} fill="#fff" />
        {/* ลูกตุ้มทอง 1/n */}
        {Array.from({ length: coins }, (_, i) => {
          const col = i % coinCols;
          const row = Math.floor(i / coinCols);
          return (
            <g key={i}>
              <circle cx={rx - (coinCols - 1) * 6 + col * 12} cy={rpy - 34 - row * 11} r={5} fill="#facc15" stroke="#a16207" strokeWidth={1.2} />
              <SvgFrac x={rx - (coinCols - 1) * 6 + col * 12} y={rpy - 34 - row * 11} n={1} d={n} size={4.5} fill="#a16207" />
            </g>
          );
        })}
      </g>
    </svg>
  );
}

/* ── เกมหลัก ── */

type Step = "choose" | "weigh" | "done";

export function SubtractBalanceGame() {
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

  const [charIdx, setCharIdx] = useState(2);

  /* โจทย์ */
  const [b, setB] = useState(2);
  const [d, setD] = useState(3);
  const [a, setA] = useState(1);
  const [c, setC] = useState(1);

  /* สถานะ */
  const [step, setStep] = useState<Step>("choose");
  const [n, setN] = useState<number | null>(null);
  const [options, setOptions] = useState<number[]>(() => makeOptions(2, 3));
  const [placed, setPlaced] = useState(0);
  const [denMsg, setDenMsg] = useState<string | null>(null);
  const [denFirstTry, setDenFirstTry] = useState(true);
  const [overshoot, setOvershoot] = useState(false);

  /* ภารกิจ */
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const timeoutsRef = useRef<number[]>([]);
  useEffect(() => () => timeoutsRef.current.forEach((t) => window.clearTimeout(t)), []);

  const validCommon = (x: number) => x % b === 0 && x % d === 0;
  const A = n ? a * (n / b) : 0;
  const C = n ? c * (n / d) : 0;
  const needed = A - C;
  const leftVal = a / b;
  const rightVal = n ? c / d + placed / n : c / d;
  const tilt = clamp((rightVal - leftVal) * 60, -13, 13); // ฝั่งหนักกว่าเอียงลง
  const char: Kid = KIDS[charIdx];

  function setupProblem(nb: number, nd: number, na: number, nc: number) {
    setB(nb); setD(nd); setA(na); setC(nc);
    setOptions(makeOptions(nb, nd));
    setN(null); setPlaced(0); setStep("choose");
    setDenMsg(null); setDenFirstTry(true); setOvershoot(false);
  }

  /* ปรับ a,c ให้ a/b > c/d เสมอ (โหมดครู) */
  function normalize(nb: number, nd: number, na: number, nc: number): [number, number] {
    const aMin = Math.max(1, Math.ceil((nb + 1) / nd));
    const A2 = clamp(na, Math.min(aMin, nb - 1), nb - 1);
    const maxC = Math.max(1, Math.floor((A2 * nd - 1) / nb));
    const C2 = clamp(nc, 1, Math.min(maxC, nd - 1));
    return [A2, C2];
  }
  function teacherSet(nb: number, nd: number, na: number, nc: number) {
    const [A2, C2] = normalize(nb, nd, na, nc);
    setupProblem(nb, nd, A2, C2);
  }

  function chooseDenom(x: number) {
    if (step !== "choose") return;
    ensure();
    if (validCommon(x)) {
      setN(x);
      const L = lcm(b, d);
      // แอนิเมชันซอยแท่ง
      play("slice");
      [120, 240, 360].forEach((ms) => timeoutsRef.current.push(window.setTimeout(() => play("slice"), ms)));
      setDenMsg(x === L ? `เยี่ยม! ${x} คือตัวส่วนร่วมที่น้อยที่สุด (ค.ร.น.)` : `ใช้ได้! ${x} หารด้วย ${b} และ ${d} ลงตัว — แต่ ${L} จะซอยน้อยกว่า ง่ายกว่านะ`);
      play("correct");
      if (mode === "mission" && denFirstTry) setScore((s) => s + 15);
      timeoutsRef.current.push(window.setTimeout(() => setStep("weigh"), 500));
    } else {
      setDenFirstTry(false);
      play("wrong");
      setDenMsg(x === b + d ? `❌ ${b}+${d}=${x} เอาตัวส่วนมาบวกกันไม่ได้! ต้องหาจำนวนที่ทั้ง ${b} และ ${d} หารลงตัว` : `❌ ${x} ยังหารด้วย ${b % x !== 0 && x % b !== 0 ? b : d} ไม่ลงตัว ลองใหม่`);
    }
  }

  function placeWeight() {
    if (step !== "weigh" || n === null) return;
    if (placed >= n) return;
    ensure(); play("clink");
    const np = placed + 1;
    setPlaced(np);
    if (np > needed) setOvershoot(true);
  }
  function removeWeight() {
    if (step !== "weigh" || placed <= 0) return;
    ensure(); play("clink");
    setPlaced((p) => p - 1);
  }

  /* ตรวจสมดุล */
  useEffect(() => {
    if (step === "weigh" && n !== null && placed === needed && needed > 0) {
      const id = window.setTimeout(() => {
        setStep("done");
        play("balance");
        if (mode === "mission" && !overshoot) setScore((s) => s + 10);
      }, 550);
      timeoutsRef.current.push(id);
      return () => window.clearTimeout(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placed, step, n]);

  /* ภารกิจ */
  function randomProblem(): [number, number, number, number] {
    const pool = round <= 4 ? L1_PAIRS : L2_PAIRS;
    const [nb, nd] = pool[randInt(0, pool.length - 1)];
    const aMin = Math.max(1, Math.ceil((nb + 1) / nd));
    const na = randInt(Math.min(aMin, nb - 1), nb - 1);
    const maxC = Math.max(1, Math.floor((na * nd - 1) / nb));
    const nc = randInt(1, Math.min(maxC, nd - 1));
    return [nb, nd, na, nc];
  }
  function startMissions() {
    ensure(); play("start");
    setScore(0); setRound(1); setGameOver(false);
    setupProblem(2, 3, 1, 1);
    setMode("mission");
  }
  function nextMission() {
    if (round >= MISSIONS_TOTAL) { setGameOver(true); play("star"); return; }
    setRound((r) => r + 1);
    const [nb, nd, na, nc] = randomProblem();
    setupProblem(nb, nd, na, nc);
  }

  const stars = score >= 170 ? 3 : score >= 120 ? 2 : 1;
  const mood: Mood = step === "done" ? "happy" : overshoot ? "worried" : step === "weigh" ? "normal" : "think";

  return (
    <div className="relative overflow-hidden rounded-2xl p-3 sm:p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-violet-100 via-indigo-50 to-sky-50" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden text-2xl" aria-hidden>
        <span className="absolute left-4 top-5 opacity-40">⚗️</span>
        <span className="absolute right-8 top-8 opacity-40">🔬</span>
        <span className="absolute bottom-8 left-8 opacity-30">🧪</span>
        <span className="absolute right-4 top-24 opacity-30">📐</span>
      </div>

      <div className="relative space-y-3">
        {/* โหมด + ปิดเสียง */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex rounded-xl border-2 border-slate-200 bg-white p-1">
            <button onClick={() => { setMode("lab"); setupProblem(b, d, a, c); }} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "lab" ? "bg-violet-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <FlaskConical size={15} /> โหมดครู
            </button>
            <button onClick={startMissions} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "mission" ? "bg-indigo-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <Target size={15} /> นักชั่งแห่งแล็บ
            </button>
          </div>
          <button onClick={() => setMuted((m) => !m)} className="grid h-9 w-9 place-items-center rounded-xl border-2 border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50" title={muted ? "เปิดเสียง" : "ปิดเสียง"}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {mode === "mission" && gameOver ? (
          <div className="space-y-4 rounded-2xl border-2 border-indigo-300 bg-white/90 p-6 text-center">
            <div className="text-5xl">⚖️🏆</div>
            <h3 className="text-xl font-extrabold text-slate-800 sm:text-2xl">จบภารกิจนักชั่งแห่งแล็บ!</h3>
            <p className="text-2xl">{"⭐".repeat(stars)}{"☆".repeat(3 - stars)}</p>
            <p className="text-base font-extrabold text-indigo-700">🏅 คะแนนรวม {score}</p>
            <button onClick={startMissions} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
              <Play size={18} /> เล่นอีกครั้ง
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* แถบตั้งค่า (ครู) / สถานะ (ภารกิจ) */}
            {mode === "lab" ? (
              <div className="space-y-2 rounded-2xl border-2 border-violet-200 bg-white/90 px-3 py-2">
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
                  <span className="text-sm font-extrabold text-violet-700">🧑‍🏫 คู่ตัวส่วน:</span>
                  {TEACHER_PAIRS.map(([pb, pd]) => (
                    <button key={`${pb}-${pd}`} onClick={() => teacherSet(pb, pd, a, c)} className={cn("rounded-lg border-2 px-2 py-1 text-xs font-extrabold transition", b === pb && d === pd ? "border-violet-500 bg-violet-100 text-violet-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
                      /{pb} , /{pd}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
                  <span className="text-xs font-extrabold text-slate-500">เศษซ้าย</span>
                  <button onClick={() => teacherSet(b, d, a - 1, c)} className="grid h-7 w-7 place-items-center rounded-lg border-2 border-slate-200 bg-white text-slate-600 hover:bg-slate-50"><Minus size={13} /></button>
                  <StackedFraction numerator={a} denominator={b} className="text-xl" toneClassName="text-blue-600" />
                  <button onClick={() => teacherSet(b, d, a + 1, c)} className="grid h-7 w-7 place-items-center rounded-lg border-2 border-slate-200 bg-white text-slate-600 hover:bg-slate-50"><Plus size={13} /></button>
                  <span className="text-lg font-black text-slate-400">−</span>
                  <span className="text-xs font-extrabold text-slate-500">เศษขวา</span>
                  <button onClick={() => teacherSet(b, d, a, c - 1)} className="grid h-7 w-7 place-items-center rounded-lg border-2 border-slate-200 bg-white text-slate-600 hover:bg-slate-50"><Minus size={13} /></button>
                  <StackedFraction numerator={c} denominator={d} className="text-xl" toneClassName="text-pink-600" />
                  <button onClick={() => teacherSet(b, d, a, c + 1)} className="grid h-7 w-7 place-items-center rounded-lg border-2 border-slate-200 bg-white text-slate-600 hover:bg-slate-50"><Plus size={13} /></button>
                  <span className="mx-1 text-slate-300">|</span>
                  <span className="text-xs font-extrabold text-slate-500">นักชั่ง:</span>
                  {KIDS.map((k, i) => (
                    <button key={i} onClick={() => setCharIdx(i)} className={cn("rounded-lg border-2 p-0.5 transition", charIdx === i ? "border-violet-400 bg-violet-50" : "border-slate-200 bg-white")}>
                      <SciKid kid={k} mood="normal" size={24} />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 rounded-2xl bg-white/90 px-4 py-2 ring-1 ring-indigo-200">
                <span className="text-base font-extrabold text-indigo-700">🥼 ข้อ {round}/{MISSIONS_TOTAL}</span>
                <span className="text-base font-extrabold text-violet-600">🏅 {score}</span>
                <span className="text-xs font-extrabold text-slate-500">ทำส่วนให้เท่า → ชั่งหาความต่าง</span>
              </div>
            )}

            {/* สมการใหญ่ */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 rounded-2xl border-2 border-violet-200 bg-white/95 px-4 py-2.5 shadow-sm">
              <StackedFraction numerator={a} denominator={b} className="text-2xl sm:text-3xl" toneClassName="text-blue-600" />
              <span className="text-2xl font-black text-slate-400">−</span>
              <StackedFraction numerator={c} denominator={d} className="text-2xl sm:text-3xl" toneClassName="text-pink-600" />
              <span className="text-2xl font-black text-slate-400">=</span>
              {n !== null ? (
                <>
                  <StackedFraction numerator={A} denominator={n} className="text-2xl sm:text-3xl" toneClassName="text-blue-600" />
                  <span className="text-2xl font-black text-slate-400">−</span>
                  <StackedFraction numerator={C} denominator={n} className="text-2xl sm:text-3xl" toneClassName="text-pink-600" />
                  <span className="text-2xl font-black text-slate-400">=</span>
                </>
              ) : null}
              {step === "done" ? (
                <StackedFraction numerator={needed} denominator={n ?? d} className="text-2xl sm:text-3xl" toneClassName="text-emerald-600" />
              ) : (
                <span className="grid h-11 w-11 place-items-center rounded-xl border-[3px] border-dashed border-violet-300 text-2xl font-black text-violet-400">?</span>
              )}
            </div>

            {/* แท่งเศษส่วน */}
            <div className="flex flex-col items-center gap-1.5 rounded-2xl border-2 border-violet-200 bg-white/90 px-3 py-2">
              {n === null ? (
                <>
                  <FractionBar num={a} den={b} color="#3b82f6" label={<StackedFraction numerator={a} denominator={b} className="text-base" toneClassName="text-blue-600" />} />
                  <FractionBar num={c} den={d} color="#ec4899" label={<StackedFraction numerator={c} denominator={d} className="text-base" toneClassName="text-pink-600" />} />
                  <p className="text-xs font-extrabold text-rose-500">🚫 ขีดไม่ตรงกัน — เทียบ/ลบไม่ได้! ต้องทำส่วนให้เท่าก่อน</p>
                </>
              ) : (
                <>
                  <FractionBar num={A} den={n} color="#3b82f6" label={<span className="inline-flex items-center gap-1 text-blue-600">= <Frac n={A} d={n} tone="text-blue-600" /> <span className="text-[10px] text-slate-400">(×{n / b})</span></span>} />
                  <FractionBar num={C} den={n} color="#ec4899" label={<span className="inline-flex items-center gap-1 text-pink-600">= <Frac n={C} d={n} tone="text-pink-600" /> <span className="text-[10px] text-slate-400">(×{n / d})</span></span>} />
                  <p className="text-xs font-extrabold text-emerald-600">✅ ขีดตรงกันแล้ว ({n} ช่องเท่ากัน) — พร้อมชั่งหาความต่าง!</p>
                </>
              )}
            </div>

            {/* จังหวะ 1: เลือกตัวส่วนร่วม */}
            {step === "choose" && (
              <div className="space-y-2 rounded-2xl border-2 border-violet-200 bg-white/90 p-3">
                <p className="text-center text-sm font-extrabold text-slate-600">🔧 จังหวะ 1: เลือกตัวส่วนร่วม — จำนวนที่ทั้ง <b className="text-blue-600">{b}</b> และ <b className="text-pink-600">{d}</b> หารลงตัว</p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {options.map((x) => (
                    <button key={x} onClick={() => chooseDenom(x)} className="grid h-12 w-12 place-items-center rounded-xl border-b-4 border-violet-300 bg-white text-2xl font-extrabold text-violet-700 shadow transition hover:-translate-y-0.5 hover:border-violet-500 active:translate-y-0">
                      {x}
                    </button>
                  ))}
                </div>
                {denMsg && <p className={cn("text-center text-xs font-extrabold", denMsg.startsWith("❌") ? "text-rose-600" : "text-emerald-600")}>{denMsg}</p>}
              </div>
            )}

            {/* จังหวะ 2 + สรุป: เครื่องชั่ง */}
            {(step === "weigh" || step === "done") && n !== null && (
              <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-b from-indigo-50 to-white p-2">
                {denMsg && step === "weigh" && <p className="text-center text-xs font-extrabold text-emerald-600">{denMsg}</p>}
                <div className="relative">
                  <Balance tilt={tilt} leftNum={A} rightNum={C} coins={placed} n={n} />
                  <div className="absolute bottom-0 left-1">
                    <SciKid kid={char} mood={mood} size={58} />
                  </div>
                </div>

                {step === "weigh" && (
                  <div className="space-y-2">
                    <p className="text-center text-sm font-extrabold text-slate-600">
                      {overshoot ? "⚠️ หนักไปแล้ว! เอาลูกตุ้มออกบ้าง" : placed === 0 ? `⚖️ จานซ้ายหนักกว่า — วางลูกตุ้ม 1/${n} ลงจานขวาจนสมดุล` : `วางแล้ว ${placed} ก้อน — ${leftVal > rightVal ? "ยังเบาไป เติมอีก" : "เกือบแล้ว!"}`}
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={removeWeight} disabled={placed <= 0} className="grid h-10 w-10 place-items-center rounded-xl border-2 border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"><Minus size={18} /></button>
                      <button onClick={placeWeight} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-2.5 text-base font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
                        🪙 วางลูกตุ้ม <Frac n={1} d={n} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* สรุปผล */}
            {step === "done" && n !== null && (
              <>
                <p className="flex flex-wrap items-center justify-center gap-1 text-center text-sm font-extrabold text-slate-600">
                  ⚖️ สมดุลแล้ว! เติม <b className="text-amber-600">{needed}</b> ก้อน = <Frac n={needed} d={n} tone="text-emerald-600" /> · <Frac n={a} d={b} /> − <Frac n={c} d={d} /> = <Frac n={A} d={n} /> − <Frac n={C} d={n} /> = <Frac n={needed} d={n} tone="text-emerald-600" />
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {mode === "mission" ? (
                    <button onClick={nextMission} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 px-6 py-2.5 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                      {round >= MISSIONS_TOTAL ? "🏁 ดูสรุปผล" : <>ข้อต่อไป <ArrowRight size={16} /></>}
                    </button>
                  ) : (
                    <>
                      <button onClick={() => setupProblem(b, d, a, c)} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50">
                        <RotateCcw size={15} /> เริ่มใหม่
                      </button>
                      <button onClick={() => { const [nb, nd, na, nc] = randomProblem(); teacherSet(nb, nd, na, nc); }} className="inline-flex items-center gap-1.5 rounded-xl bg-violet-500 px-4 py-2 text-sm font-extrabold text-white shadow transition hover:brightness-105">
                        โจทย์ใหม่ <ArrowRight size={15} />
                      </button>
                    </>
                  )}
                </div>
              </>
            )}

            {/* เริ่มใหม่ระหว่างชั่ง (ครู) */}
            {step === "weigh" && mode === "lab" && (
              <div className="flex justify-center">
                <button onClick={() => setupProblem(b, d, a, c)} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-4 py-1.5 text-xs font-extrabold text-slate-500 transition hover:bg-slate-50">
                  <RotateCcw size={14} /> เริ่มโจทย์นี้ใหม่
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
