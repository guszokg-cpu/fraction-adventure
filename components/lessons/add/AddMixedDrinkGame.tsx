"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Volume2, VolumeX, FlaskConical, Target, Eye, EyeOff, ArrowRight, Plus } from "lucide-react";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { cn } from "@/lib/cn";
import { randInt } from "@/lib/randomFraction";

/* ── ค่าคงที่ ── */

const DEN_OPTIONS = [3, 4, 5, 6, 8];
const FILL_PRESETS = [3, 10, 30];
const MISSIONS_TOTAL = 8;

/* พาเลตน้ำ (สี + ชื่อเริ่มต้น) */
type Drink = { key: string; name: string; top: string; bot: string; surf: string; dark: string };
const DRINKS: Drink[] = [
  { key: "red", name: "น้ำแดง", top: "#fb7185", bot: "#e11d48", surf: "#fecdd3", dark: "#9f1239" },
  { key: "milk", name: "นม", top: "#ffffff", bot: "#e2e8f0", surf: "#ffffff", dark: "#94a3b8" },
  { key: "orange", name: "น้ำส้ม", top: "#fdba74", bot: "#ea580c", surf: "#fed7aa", dark: "#9a3412" },
  { key: "green", name: "น้ำเขียว", top: "#86efac", bot: "#16a34a", surf: "#bbf7d0", dark: "#166534" },
  { key: "grape", name: "น้ำองุ่น", top: "#d8b4fe", bot: "#7c3aed", surf: "#e9d5ff", dark: "#5b21b6" },
  { key: "blue", name: "น้ำบลู", top: "#93c5fd", bot: "#2563eb", surf: "#bfdbfe", dark: "#1e40af" },
  { key: "pink", name: "น้ำชมพู", top: "#f9a8d4", bot: "#db2777", surf: "#fbcfe8", dark: "#9d174d" },
  { key: "yellow", name: "น้ำเลม่อน", top: "#fde047", bot: "#ca8a04", surf: "#fef08a", dark: "#854d0e" },
  { key: "cocoa", name: "โกโก้", top: "#d6a878", bot: "#92400e", surf: "#e7cba9", dark: "#78350f" },
];

/* ── เสียง ── */

type SoundKind = "pour" | "ding" | "correct" | "wrong" | "start" | "star" | "add";

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
      case "pour": return sweep(520, 260, 0.8, "sawtooth", 0.05);
      case "ding": return tones([1047, 1319], 0.07, 0.16, "sine", 0.13);
      case "add": return tones([784, 1047, 1319], 0.06, 0.12, "triangle", 0.13);
      case "correct": return tones([660, 990, 1319], 0.06, 0.1, "triangle", 0.14);
      case "wrong": return tones([220, 165], 0.11, 0.18, "sawtooth", 0.09);
      case "start": return tones([523, 659, 784], 0.07, 0.12, "triangle", 0.14);
      case "star": return tones([1047, 1319, 1568, 2093], 0.07, 0.14, "triangle", 0.14);
    }
  }
  return { play, ensure };
}

/* ── เพลงบาร์น้ำผลไม้ (ชิปทูน ไม่ใช้ไฟล์) ── */

const MX_LEAD = [72, 76, 79, 76, 72, 0, 71, 72, 74, 71, 67, 71, 74, 0, 0, 0, 69, 72, 76, 72, 69, 0, 67, 69, 71, 72, 74, 76, 72, 0, 0, 0];
const MX_BASS = [48, 55, 52, 55, 45, 52, 48, 52, 41, 48, 45, 48, 43, 50, 47, 50];

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
      const m = MX_LEAD[s];
      if (m) note(m, 0.16, "square", 0.028);
      if (s % 2 === 0) {
        const b = MX_BASS[s / 2];
        if (b) note(b, 0.3, "triangle", 0.05);
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

/* ── แก้วน้ำ 3D ── */

const G_W = 92, G_H = 150, G_DX = 13, G_DY = 8;

function Glass({ x, y, level, den, drink, gid, dur, name, showLabels, dim }: {
  x: number; y: number; level: number; den: number; drink: Drink; gid: string; dur: number; name: string; showLabels: boolean; dim?: boolean;
}) {
  const L = x, R = x + G_W, T = y, B = y + G_H;
  const waterY = B - level * G_H;
  return (
    <g opacity={dim ? 0.55 : 1}>
      <defs>
        <linearGradient id={`${gid}-g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={drink.top} />
          <stop offset="1" stopColor={drink.bot} />
        </linearGradient>
        <clipPath id={`${gid}-clip`}>
          <path d={`M${L + 2},${T + 2} L${R - 2},${T + 2} L${R - 6},${B - 2} Q${R - 8},${B + 8} ${(L + R) / 2},${B + 8} Q${L + 8},${B + 8} ${L + 6},${B - 2} Z`} />
        </clipPath>
      </defs>
      {/* เงา + ผนังหลัง */}
      <ellipse cx={(L + R + G_DX) / 2} cy={B + 12} rx={64} ry={5} fill="#00000015" />
      <polygon points={`${R},${T} ${R + G_DX},${T - G_DY} ${R + G_DX},${B - G_DY - 6} ${R - 6},${B - 6}`} fill={drink.top} opacity={0.12} stroke="#94a3b8" strokeWidth={1.4} />
      {/* น้ำ */}
      <g clipPath={`url(#${gid}-clip)`}>
        <rect x={L - 4} y={waterY} width={G_W + 8} height={B - waterY + 12} fill={`url(#${gid}-g)`} opacity={0.95} style={{ transition: `y ${dur}s linear, height ${dur}s linear` }} />
      </g>
      {/* ผิวน้ำ */}
      <g style={{ transform: `translateY(${waterY}px)`, transition: `transform ${dur}s linear, opacity 0.3s`, opacity: level > 0 ? 1 : 0 }}>
        <polygon points={`${L + 3},0 ${R - 3},0 ${R - 3 + G_DX * 0.8},${-G_DY * 0.8} ${L + 3 + G_DX * 0.8},${-G_DY * 0.8}`} fill={drink.surf} opacity={0.97} stroke="#fff" strokeWidth={1} />
        <line x1={L + 3} y1={0} x2={R - 3} y2={0} stroke="#fff" strokeWidth={1.4} opacity={0.85} />
      </g>
      {/* ขีดแบ่ง + ป้าย */}
      {Array.from({ length: den + 1 }, (_, k) => {
        const ty = B - (k / den) * G_H;
        const bold = k === Math.round(level * den);
        return (
          <g key={k}>
            <line x1={L + 4} y1={ty} x2={R - 4} y2={ty} stroke={drink.dark} strokeWidth={bold && level > 0 ? 2.6 : 1.2} strokeDasharray="5 4" opacity={bold && level > 0 ? 0.9 : 0.4} />
            {showLabels && (
              <text x={R + G_DX + 3} y={ty + 3.5} fontSize={den > 6 ? 8 : 9.5} fontWeight={800} fill={drink.dark} opacity={0.6}>
                {k === 0 ? "0" : k === den ? "เต็ม" : `${k}/${den}`}
              </text>
            )}
          </g>
        );
      })}
      {/* กรอบแก้ว */}
      <path d={`M${L},${T} L${R},${T} L${R - 6},${B} Q${R - 8},${B + 10} ${(L + R) / 2},${B + 10} Q${L + 8},${B + 10} ${L + 6},${B} Z`} fill="none" stroke="#475569" strokeWidth={2.4} />
      <path d={`M${L + 8},${T + 10} L${L + 12},${B - 14}`} stroke="#fff" strokeWidth={4} opacity={0.32} strokeLinecap="round" />
      {/* ป้ายชื่อน้ำ */}
      <rect x={(L + R) / 2 - 44} y={B + 15} width={88} height={20} rx={7} fill={drink.bot} />
      <text x={(L + R) / 2} y={B + 29} fontSize={11} fontWeight={900} fill={drink.key === "milk" ? "#475569" : "#fff"} textAnchor="middle">{name}</text>
    </g>
  );
}

/* ── ฉากผสมน้ำ ── */

function DrinkScene({ den, gA, gB, g1, g2, glass2, drinkA, drinkB, drinkMix, nameA, nameB, nameMix, pouring, dur, adding }: {
  den: number; gA: number; gB: number; g1: number; g2: number; glass2: boolean;
  drinkA: Drink; drinkB: Drink; drinkMix: Drink; nameA: string; nameB: string; nameMix: string;
  pouring: boolean; dur: number; adding: boolean;
}) {
  const AX = 14, BX = 120, R1X = 300, R2X = 428, GY = 150;
  const surf1 = GY + G_H - (g1 / den) * G_H;
  const surf2 = GY + G_H - (g2 / den) * G_H;
  return (
    <svg viewBox="0 -18 560 372" className="w-full" role="img" aria-label="ผสมน้ำสองแก้ว">
      <style>{`
        .mx-stream { animation: mxStream 0.5s linear infinite; }
        @keyframes mxStream { 0% { opacity: .6; } 50% { opacity: .95; } 100% { opacity: .6; } }
      `}</style>
      {/* โต๊ะ */}
      <rect x={0} y={GY + G_H + 40} width={560} height={15} rx={5} fill="#a06a3a" stroke="#6b4423" strokeWidth={1.5} />

      {/* แก้วต้นทาง A, B */}
      <Glass x={AX} y={GY} level={gA / den} den={den} drink={drinkA} gid="dA" dur={dur} name={nameA} showLabels={false} dim={pouring} />
      <Glass x={BX} y={GY} level={gB / den} den={den} drink={drinkB} gid="dB" dur={dur} name={nameB} showLabels={false} dim={pouring} />

      {/* แก้วรับที่ 2 (โผล่เมื่อกดเพิ่ม) */}
      {glass2 && <Glass x={R2X} y={GY} level={g2 / den} den={den} drink={drinkMix} gid="d2" dur={dur} name={nameMix} showLabels />}

      {/* สายน้ำ A→แก้ว1, B→แก้ว1 (ตอนเทรวม) */}
      {pouring && !adding && (
        <g>
          <path className="mx-stream" d={`M ${AX + G_W / 2} ${GY + 6} Q ${AX + 120} ${GY - 8} ${R1X + G_W / 2 - 8} ${surf1 - 4}`} stroke={drinkA.bot} strokeWidth={8} fill="none" strokeLinecap="round" />
          <path className="mx-stream" d={`M ${BX + G_W / 2} ${GY + 6} Q ${BX + 90} ${GY - 4} ${R1X + G_W / 2 + 8} ${surf1 - 4}`} stroke={drinkB.bot} strokeWidth={8} fill="none" strokeLinecap="round" />
        </g>
      )}
      {/* สายน้ำล้นจากแก้ว1→แก้ว2 (ตอนเพิ่มแก้ว) */}
      {pouring && adding && (
        <path className="mx-stream" d={`M ${R1X + G_W - 4} ${GY + 6} Q ${R1X + G_W + 30} ${GY - 6} ${R2X + G_W / 2} ${surf2 - 4}`} stroke={drinkMix.bot} strokeWidth={8} fill="none" strokeLinecap="round" />
      )}

      {/* แก้วรับที่ 1 (วาดหลังสายน้ำ) */}
      <Glass x={R1X} y={GY} level={g1 / den} den={den} drink={drinkMix} gid="d1" dur={dur} name={nameMix} showLabels />
    </svg>
  );
}

/* ── ตัวเลือกเศษ ── */

function NumPicker({ label, value, max, onChange, color }: { label: string; value: number; max: number; onChange: (v: number) => void; color: string }) {
  const btn = "h-7 w-7 rounded-lg border-2 border-slate-200 bg-white text-base font-extrabold text-slate-600 hover:bg-slate-50 active:scale-95";
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs font-extrabold text-slate-500">{label}</span>
      <button onClick={() => onChange(Math.max(1, value - 1))} className={btn}>−</button>
      <span className={cn("w-6 text-center text-xl font-extrabold", color)}>{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))} className={btn}>+</button>
    </div>
  );
}

/* ── แถวตั้งค่าน้ำ (สี + ชื่อ) ── */

function DrinkConfig({ label, drink, name, onDrink, onName }: { label: string; drink: Drink; name: string; onDrink: (d: Drink) => void; onName: (s: string) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-2 py-1.5">
      <span className="text-xs font-extrabold text-slate-500">{label}</span>
      <input
        value={name}
        onChange={(e) => onName(e.target.value.slice(0, 10))}
        className="w-20 rounded-lg border-2 border-slate-200 px-2 py-0.5 text-xs font-extrabold text-slate-700 focus:border-orange-400 focus:outline-none"
        placeholder="ชื่อน้ำ"
      />
      <div className="flex gap-1">
        {DRINKS.map((d) => (
          <button
            key={d.key}
            onClick={() => onDrink(d)}
            className={cn("h-6 w-6 rounded-full border-2 transition hover:scale-110", drink.key === d.key ? "border-slate-700 ring-2 ring-slate-300" : "border-white")}
            style={{ background: `linear-gradient(${d.top}, ${d.bot})` }}
            title={d.name}
            aria-label={d.name}
          />
        ))}
      </div>
    </div>
  );
}

/* ── เกมหลัก ── */

type Stage = "setup" | "pour1" | "needGlass" | "pour2" | "done";

export function AddMixedDrinkGame() {
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

  /* โจทย์ */
  const [den, setDen] = useState(5);
  const [a, setA] = useState(3);
  const [b, setB] = useState(4);
  const [fillSecs, setFillSecs] = useState(3);
  const [reveal, setReveal] = useState(false);
  const [drinkA, setDrinkA] = useState<Drink>(DRINKS[0]);   // แดง
  const [drinkB, setDrinkB] = useState<Drink>(DRINKS[1]);   // นม
  const [drinkMix, setDrinkMix] = useState<Drink>(DRINKS[6]); // ชมพู
  const [nameA, setNameA] = useState("น้ำแดง");
  const [nameB, setNameB] = useState("นม");
  const [nameMix, setNameMix] = useState("น้ำชมพู");

  /* ระดับน้ำ (จำนวนส่วน) */
  const [gA, setGA] = useState(3);
  const [gB, setGB] = useState(4);
  const [g1, setG1] = useState(0);
  const [g2, setG2] = useState(0);
  const [glass2, setGlass2] = useState(false);
  const [stage, setStage] = useState<Stage>("setup");
  const [dur, setDur] = useState(0.4);
  const timeoutsRef = useRef<number[]>([]);
  useEffect(() => () => timeoutsRef.current.forEach((t) => window.clearTimeout(t)), []);

  /* ภารกิจ */
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [guessWhole, setGuessWhole] = useState(0);
  const [guessNum, setGuessNum] = useState(0);
  const [guessDen, setGuessDen] = useState(0);
  const [firstTry, setFirstTry] = useState(true);
  const [checked, setChecked] = useState<null | boolean>(null);
  const [gameOver, setGameOver] = useState(false);

  const sum = a + b;
  const overflow = sum > den;
  const whole = Math.floor(sum / den);
  const rem = sum % den;

  function reset(nd: number, na: number, nb: number) {
    setDen(nd); setA(na); setB(nb);
    setGA(na); setGB(nb); setG1(0); setG2(0);
    setGlass2(false); setStage("setup");
    setChecked(null); setGuessWhole(0); setGuessNum(0); setGuessDen(0); setFirstTry(true);
  }

  /* เทรวม A+B → แก้ว 1 (เต็มได้แค่ den) */
  function pourMix(evalGuess = false) {
    if (stage !== "setup") return;
    ensure();
    const into1 = Math.min(sum, den);
    const d = Math.max(0.7, (fillSecs * into1) / den);
    setDur(d);
    setStage("pour1");
    play("pour");
    const reps = Math.min(6, Math.max(1, Math.floor(d / 1.2)));
    for (let i = 1; i < reps; i++) timeoutsRef.current.push(window.setTimeout(() => play("pour"), i * 1100));
    timeoutsRef.current.push(window.setTimeout(() => { setGA(0); setGB(0); setG1(into1); }, 120));
    timeoutsRef.current.push(window.setTimeout(() => {
      play("ding");
      if (sum > den) {
        setStage("needGlass"); // ล้น! รอเพิ่มแก้ว
      } else {
        setStage("done");
        if (evalGuess) finishGuess();
      }
    }, 120 + d * 1000 + 200));
  }

  /* เพิ่มแก้วที่ 2 แล้วเทส่วนที่ล้นลงไป */
  function addGlass(evalGuess = false) {
    if (stage !== "needGlass") return;
    setGlass2(true);
    play("add");
    const d = Math.max(0.7, (fillSecs * rem) / den);
    setDur(d);
    timeoutsRef.current.push(window.setTimeout(() => { setStage("pour2"); play("pour"); setG2(rem); }, 260));
    timeoutsRef.current.push(window.setTimeout(() => {
      setStage("done");
      play("ding");
      if (evalGuess) finishGuess();
    }, 260 + d * 1000 + 200));
  }

  function finishGuess() {
    const ok = guessWhole === whole && guessNum === rem && guessDen === den;
    setChecked(ok);
    if (ok) { play("correct"); setScore((s) => s + (firstTry ? 25 : 12)); }
    else play("wrong");
  }

  /* ภารกิจ */
  const missionGuessedRef = useRef(false);
  function randomMixedProblem(): [number, number, number] {
    const nd = DEN_OPTIONS[randInt(1, DEN_OPTIONS.length - 1)];
    const na = randInt(2, nd - 1);
    const nb = randInt(nd - na + 1, nd - 1); // บังคับ a+b>den (ได้จำนวนคละ)
    return [nd, na, Math.max(1, nb)];
  }
  function startMissions() {
    ensure(); play("start");
    setScore(0); setRound(1); setGameOver(false);
    missionGuessedRef.current = false;
    reset(5, 3, 4);
    setMode("mission");
  }
  function nextMission() {
    if (round >= MISSIONS_TOTAL) { setGameOver(true); play("star"); return; }
    setRound((r) => r + 1);
    missionGuessedRef.current = false;
    const [nd, na, nb] = randomMixedProblem();
    reset(nd, na, nb);
  }
  /* ในโหมดภารกิจ ทายก่อน แล้วกดเทพิสูจน์: เทรวม→(ถ้าล้น)เพิ่มแก้วอัตโนมัติ→เช็ค */
  function proveGuess() {
    missionGuessedRef.current = true;
    pourMix(false);
  }
  useEffect(() => {
    if (mode === "mission" && missionGuessedRef.current && stage === "needGlass") {
      timeoutsRef.current.push(window.setTimeout(() => addGlass(true), 700));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, mode]);

  const stars = score >= 170 ? 3 : score >= 100 ? 2 : 1;
  const pouring = stage === "pour1" || stage === "pour2";

  return (
    <div className="relative overflow-hidden rounded-2xl p-3 sm:p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-pink-100 via-rose-50 to-amber-50" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden text-2xl" aria-hidden>
        <span className="absolute left-4 top-5 opacity-40">🥤</span>
        <span className="absolute right-8 top-8 opacity-40">🍹</span>
        <span className="absolute bottom-8 left-8 opacity-30">🧋</span>
      </div>

      <div className="relative space-y-3">
        {/* โหมด + ปิดเสียง */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex rounded-xl border-2 border-slate-200 bg-white p-1">
            <button onClick={() => { setMode("lab"); reset(den, a, b); }} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "lab" ? "bg-rose-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <FlaskConical size={15} /> โหมดครู
            </button>
            <button onClick={startMissions} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "mission" ? "bg-pink-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <Target size={15} /> โหมดทายจำนวนคละ
            </button>
          </div>
          <button onClick={() => setMuted((m) => !m)} className="grid h-9 w-9 place-items-center rounded-xl border-2 border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50" title={muted ? "เปิดเสียง" : "ปิดเสียง"}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {mode === "mission" && gameOver ? (
          <div className="space-y-4 rounded-2xl border-2 border-pink-300 bg-white/90 p-6 text-center">
            <div className="text-5xl">🥤🏆</div>
            <h3 className="text-xl font-extrabold text-slate-800 sm:text-2xl">จบภารกิจบาร์เทนเดอร์น้อย!</h3>
            <p className="text-2xl">{"⭐".repeat(stars)}{"☆".repeat(3 - stars)}</p>
            <p className="text-base font-extrabold text-pink-700">🏅 คะแนนรวม {score}</p>
            <button onClick={startMissions} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
              <Play size={18} /> เล่นอีกครั้ง
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* ตั้งค่า (ครู) */}
            {mode === "lab" ? (
              <div className="space-y-2 rounded-2xl border-2 border-rose-200 bg-white/90 px-3 py-2">
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
                  <span className="text-sm font-extrabold text-rose-700">🧑‍🏫 โจทย์:</span>
                  <NumPicker label="แก้ว A" value={a} max={den - 1} onChange={(v) => reset(den, v, b)} color="text-rose-500" />
                  <span className="text-lg font-black text-slate-400">+</span>
                  <NumPicker label="แก้ว B" value={b} max={den - 1} onChange={(v) => reset(den, a, v)} color="text-sky-500" />
                  <span className="mx-1 text-slate-300">|</span>
                  <span className="text-xs font-extrabold text-slate-500">ขีดแก้ว</span>
                  {DEN_OPTIONS.map((d) => (
                    <button key={d} onClick={() => reset(d, Math.min(a, d - 1), Math.min(b, d - 1))} className={cn("h-7 w-7 rounded-lg border-2 text-sm font-extrabold transition", den === d ? "border-rose-500 bg-rose-100 text-rose-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>{d}</button>
                  ))}
                  {sum <= den && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-700">💡 ตั้งให้ A+B เกินขีดเต็ม จะได้จำนวนคละ</span>}
                </div>
                {/* ตั้งค่าน้ำ */}
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <DrinkConfig label="🥤A" drink={drinkA} name={nameA} onDrink={setDrinkA} onName={setNameA} />
                  <DrinkConfig label="🥤B" drink={drinkB} name={nameB} onDrink={setDrinkB} onName={setNameB} />
                  <DrinkConfig label="🥤ผสม" drink={drinkMix} name={nameMix} onDrink={setDrinkMix} onName={setNameMix} />
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="text-xs font-extrabold text-slate-500">⏱️ เวลาเท:</span>
                  {FILL_PRESETS.map((s) => (
                    <button key={s} onClick={() => setFillSecs(s)} className={cn("rounded-lg border-2 px-2 py-0.5 text-xs font-extrabold transition", fillSecs === s ? "border-rose-500 bg-rose-100 text-rose-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>{s}วิ</button>
                  ))}
                  <input type="range" min={1} max={60} value={fillSecs} onChange={(e) => setFillSecs(+e.target.value)} className="w-24 accent-rose-600" />
                  <span className="w-9 text-xs font-extrabold text-rose-700">{fillSecs}วิ</span>
                  <button onClick={() => setReveal((v) => !v)} className={cn("flex items-center gap-1 rounded-lg border-2 px-2 py-1 text-xs font-extrabold transition", reveal ? "border-violet-400 bg-violet-100 text-violet-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
                    {reveal ? <EyeOff size={13} /> : <Eye size={13} />} เฉลย
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 rounded-2xl bg-white/90 px-4 py-2 ring-1 ring-pink-200">
                <span className="text-base font-extrabold text-pink-700">🎯 ข้อ {round}/{MISSIONS_TOTAL}</span>
                <span className="text-base font-extrabold text-rose-700">🏅 {score}</span>
                <span className="text-xs font-extrabold text-slate-500">ทายจำนวนคละก่อน แล้วเทพิสูจน์!</span>
              </div>
            )}

            {/* สมการ */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 rounded-2xl border-2 border-rose-200 bg-white/95 px-5 py-2.5 shadow-sm">
              <StackedFraction numerator={a} denominator={den} className="text-3xl sm:text-4xl" toneClassName="text-rose-500" />
              <span className="text-3xl font-black text-slate-400">+</span>
              <StackedFraction numerator={b} denominator={den} className="text-3xl sm:text-4xl" toneClassName="text-sky-500" />
              <span className="text-3xl font-black text-slate-400">=</span>
              {stage === "done" || (mode === "lab" && reveal) ? (
                <span className="flex items-center gap-2">
                  <StackedFraction numerator={sum} denominator={den} className="text-2xl sm:text-3xl" toneClassName="text-slate-400" />
                  <span className="text-2xl font-black text-slate-400">=</span>
                  <span className="inline-flex items-center gap-1 text-3xl font-black text-pink-600 sm:text-4xl">
                    {whole}
                    {rem > 0 && <StackedFraction numerator={rem} denominator={den} className="text-xl sm:text-2xl" toneClassName="text-pink-600" />}
                    <span className="ml-1 text-lg font-extrabold text-slate-500">แก้ว</span>
                  </span>
                </span>
              ) : (
                <span className="grid h-12 w-12 place-items-center rounded-xl border-[3px] border-dashed border-rose-300 text-2xl font-black text-rose-400">?</span>
              )}
            </div>

            {/* ฉาก */}
            <div className="rounded-2xl border-2 border-rose-200 bg-gradient-to-b from-rose-50/70 to-amber-50/60 p-2">
              <DrinkScene den={den} gA={gA} gB={gB} g1={g1} g2={g2} glass2={glass2} drinkA={drinkA} drinkB={drinkB} drinkMix={drinkMix} nameA={nameA} nameB={nameB} nameMix={nameMix} pouring={pouring} dur={dur} adding={stage === "pour2"} />
            </div>

            {/* คำอธิบายผล */}
            {stage === "done" && (
              <p className="text-center text-sm font-extrabold text-slate-600">
                {overflow
                  ? <>รวมได้ <b className="text-slate-500">{sum}/{den}</b> = <b className="text-pink-600">{whole} แก้วเต็ม{rem > 0 ? ` กับอีก ${rem}/${den} แก้ว` : ""}</b> — น้ำเกิน 1 แก้ว ต้องใช้แก้วที่ 2!</>
                  : <>รวมได้ <b className="text-pink-600">{sum}/{den} แก้ว</b> (ยังไม่เต็มแก้ว)</>}
              </p>
            )}

            {/* ── โหมดครู: ปุ่มควบคุม ── */}
            {mode === "lab" && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                {stage === "setup" && (
                  <button onClick={() => pourMix()} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-500 px-8 py-2.5 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
                    🫗 เทรวมสองแก้ว!
                  </button>
                )}
                {stage === "needGlass" && (
                  <button onClick={() => addGlass()} className="inline-flex animate-pulse items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-7 py-2.5 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
                    <Plus size={18} /> น้ำล้น! เพิ่มแก้วที่ 2
                  </button>
                )}
                {stage === "done" && (
                  <button onClick={() => reset(den, a, b)} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-5 py-2 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50">
                    <RotateCcw size={15} /> เริ่มใหม่
                  </button>
                )}
                {pouring && <span className="text-sm font-extrabold text-slate-400">กำลังเท...</span>}
              </div>
            )}

            {/* ── โหมดภารกิจ: ทายจำนวนคละ ── */}
            {mode === "mission" && stage === "setup" && (
              <div className="space-y-2 rounded-2xl border-2 border-pink-200 bg-white/90 p-3">
                <p className="text-center text-sm font-extrabold text-slate-600">🤔 ทายก่อน: รวมแล้วได้กี่แก้วเต็ม กับเศษเท่าไหร่?</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="flex flex-col items-center">
                    <button onClick={() => setGuessWhole((v) => Math.min(2, v + 1))} className="h-7 w-8 rounded border-2 border-slate-200 bg-white font-extrabold text-slate-600">+</button>
                    <span className="text-2xl font-extrabold text-pink-600">{guessWhole}</span>
                    <button onClick={() => setGuessWhole((v) => Math.max(0, v - 1))} className="h-7 w-8 rounded border-2 border-slate-200 bg-white font-extrabold text-slate-600">−</button>
                    <span className="text-[10px] font-extrabold text-slate-400">แก้วเต็ม</span>
                  </div>
                  <span className="text-lg font-black text-slate-400">กับ</span>
                  <div className="flex flex-col items-center gap-0.5">
                    {/* ตัวเศษ (เติมเอง) */}
                    <div className="flex items-center gap-1">
                      <button onClick={() => setGuessNum((v) => Math.max(0, v - 1))} className="h-6 w-6 rounded border-2 border-slate-200 bg-white text-sm font-extrabold text-slate-600">−</button>
                      <span className="grid h-8 w-9 place-items-center rounded-lg border-2 border-pink-300 bg-white text-xl font-extrabold text-pink-600">{guessNum}</span>
                      <button onClick={() => setGuessNum((v) => Math.min(11, v + 1))} className="h-6 w-6 rounded border-2 border-slate-200 bg-white text-sm font-extrabold text-slate-600">+</button>
                    </div>
                    <span className="h-[3px] w-10 rounded bg-pink-500" />
                    {/* ตัวส่วน (เติมเอง — ไม่ใส่คำตอบให้) */}
                    <div className="flex items-center gap-1">
                      <button onClick={() => setGuessDen((v) => Math.max(0, v - 1))} className="h-6 w-6 rounded border-2 border-slate-200 bg-white text-sm font-extrabold text-slate-600">−</button>
                      <span className={cn("grid h-8 w-9 place-items-center rounded-lg border-2 bg-white text-xl font-extrabold", guessDen === 0 ? "border-dashed border-orange-300 text-orange-300" : "border-slate-300 text-slate-600")}>{guessDen || "?"}</span>
                      <button onClick={() => setGuessDen((v) => Math.min(12, v + 1))} className="h-6 w-6 rounded border-2 border-slate-200 bg-white text-sm font-extrabold text-slate-600">+</button>
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-400">แก้ว (เติมตัวส่วนเองด้วย!)</span>
                  </div>
                  <button onClick={proveGuess} className="ml-3 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 px-6 py-2.5 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                    🫗 เทพิสูจน์!
                  </button>
                </div>
              </div>
            )}
            {mode === "mission" && stage !== "setup" && checked === null && (
              <p className="text-center text-sm font-extrabold text-slate-400">กำลังเทพิสูจน์...</p>
            )}
            {mode === "mission" && checked !== null && (
              <div className={cn("rounded-2xl border-2 p-3 text-center", checked ? "border-emerald-300 bg-emerald-50" : "border-rose-300 bg-rose-50")}>
                <p className={cn("text-base font-extrabold", checked ? "text-emerald-700" : "text-rose-600")}>
                  {checked ? `🎉 ทายถูก! ${sum}/${den} = ${whole} กับ ${rem}/${den} แก้ว` : `ยังไม่ตรง — รวมจริงได้ ${whole} แก้วกับ ${rem}/${den}`}
                </p>
                <button onClick={nextMission} className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 px-6 py-2 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                  {round >= MISSIONS_TOTAL ? "🏁 ดูสรุปผล" : <>ข้อต่อไป <ArrowRight size={16} /></>}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
