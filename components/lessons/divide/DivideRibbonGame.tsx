"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Volume2, VolumeX, FlaskConical, Target, ArrowRight, Eye, EyeOff, Pencil, Scissors } from "lucide-react";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { cn } from "@/lib/cn";
import { randInt, shuffle } from "@/lib/randomFraction";

/* ── ค่าคงที่ ── */

const DEN_OPTIONS = [2, 3, 4, 5, 6];
const K_OPTIONS = [2, 3, 4];        // ซอยแต่ละช่อง 1/b เป็น k ชิ้น → ชิ้นละ 1/(bk)
const MISSIONS_TOTAL = 8;
const SS = { shapeRendering: "crispEdges" as const };

const RIBBON_COLORS = [
  { main: "#ef4444", dark: "#b91c1c", light: "#fca5a5" },
  { main: "#ec4899", dark: "#9d174d", light: "#f9a8d4" },
  { main: "#8b5cf6", dark: "#6d28d9", light: "#c4b5fd" },
  { main: "#0ea5e9", dark: "#0369a1", light: "#7dd3fc" },
];

/* ── เสียง ── */

type SoundKind = "snip" | "tick" | "correct" | "wrong" | "start" | "star";

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
      case "snip": return tones([1600, 900], 0.035, 0.06, "square", 0.06);
      case "tick": return tones([1300], 0.03, 0.04, "square", 0.05);
      case "correct": return tones([660, 990, 1319], 0.06, 0.1, "triangle", 0.14);
      case "wrong": return tones([220, 165], 0.11, 0.18, "sawtooth", 0.09);
      case "start": return tones([523, 659, 784], 0.07, 0.12, "triangle", 0.14);
      case "star": return tones([1047, 1319, 1568, 2093], 0.07, 0.14, "triangle", 0.14);
    }
  }
  return { play, ensure };
}

/* ── เพลงร้านน่ารัก (ชิปทูน ไม่ใช้ไฟล์) ── */

const RB_LEAD = [76, 0, 74, 72, 0, 74, 76, 0, 79, 0, 76, 0, 72, 0, 0, 0, 74, 0, 72, 71, 0, 72, 74, 0, 76, 79, 76, 0, 72, 0, 0, 0];
const RB_BASS = [45, 52, 45, 52, 43, 50, 43, 50, 48, 55, 48, 55, 41, 48, 48, 45];

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
      if (m) note(m, 0.2, "triangle", 0.028);
      if (s % 2 === 0) {
        const b = RB_BASS[s / 2];
        if (b) note(b, 0.32, "sine", 0.05);
      }
    }, 205);
  }
  function stop() {
    if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
  }
  useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);
  return { start, stop };
}

/* ── ตัวละคร (เจ้าของร้านริบบิ้น) ── */

type Person = { name: string; skin: string; body: string; dark: string; hair: string };
const OWNERS: Person[] = [
  { name: "พี่ริน", skin: "#ffd9c9", body: "#ec4899", dark: "#9d174d", hair: "#3b2412" },
  { name: "น้องมิ้นต์", skin: "#f5cba3", body: "#0ea5e9", dark: "#0369a1", hair: "#1c1c1c" },
  { name: "ป้าแดง", skin: "#f0c9a0", body: "#ef4444", dark: "#b91c1c", hair: "#4a2e18" },
  { name: "ลุงเก่ง", skin: "#e0b487", body: "#16a34a", dark: "#166534", hair: "#2d2013" },
];

function PixelOwner({ p, mood, size = 84 }: { p: Person; mood: "normal" | "happy"; size?: number }) {
  return (
    <svg viewBox="0 0 40 56" width={size * 0.71} height={size} style={SS} role="img" aria-label={p.name}>
      <path d="M9,12 Q9,3 20,3 Q31,3 31,12 L31,9 Q26,6 20,6 Q14,6 9,9 Z" fill={p.hair} />
      <rect x={11} y={7} width={18} height={17} rx={5} fill={p.skin} stroke="#00000022" strokeWidth={1} />
      <rect x={15} y={14} width={3} height={4} rx={1} fill="#1e293b" />
      <rect x={22} y={14} width={3} height={4} rx={1} fill="#1e293b" />
      {mood === "happy"
        ? <path d="M16,19 Q20,22 24,19" stroke="#1e293b" strokeWidth={1.5} fill="none" strokeLinecap="round" />
        : <path d="M16,19.5 Q20,21 24,19.5" stroke="#1e293b" strokeWidth={1.4} fill="none" strokeLinecap="round" />}
      <circle cx={14} cy={19} r={1.6} fill="#fb7185" opacity={0.5} />
      <circle cx={26} cy={19} r={1.6} fill="#fb7185" opacity={0.5} />
      {/* ผ้ากันเปื้อนร้าน */}
      <rect x={11} y={24} width={18} height={18} rx={3} fill={p.body} stroke="#00000022" strokeWidth={1.2} />
      <rect x={15} y={26} width={10} height={14} rx={1.5} fill="#fff" opacity={0.8} />
      <rect x={6} y={25} width={5} height={13} rx={2.5} fill={p.body} stroke="#00000022" strokeWidth={1} />
      <circle cx={8.5} cy={38} r={2.5} fill={p.skin} />
      <rect x={29} y={25} width={5} height={13} rx={2.5} fill={p.body} stroke="#00000022" strokeWidth={1} />
      <circle cx={31.5} cy={38} r={2.5} fill={p.skin} />
      <rect x={14} y={42} width={5.5} height={13} rx={2} fill={p.dark} />
      <rect x={20.5} y={42} width={5.5} height={13} rx={2} fill={p.dark} />
      <rect x={13} y={54} width={7} height={3.5} rx={1.5} fill="#334155" />
      <rect x={20} y={54} width={7} height={3.5} rx={1.5} fill="#334155" />
    </svg>
  );
}

/* ── ฉากตัดริบบิ้น ── */

function RibbonScene({ num, den, e, pieces, sep, color, animating }: {
  num: number; den: number; e: number; pieces: number; sep: number; color: typeof RIBBON_COLORS[number]; animating: boolean;
}) {
  const X0 = 44, RW = 476, rY = 92, rH = 34;   // ริบบิ้นเต็มสเกล 1 เมตร
  const pieceW = RW / e;                         // ความกว้าง 1/e เมตร (px)
  const remaining = pieces - sep;
  const remLen = remaining * pieceW;
  const totalLen = pieces * pieceW;              // = (num/den)*RW
  const cutX = X0 + remLen;                      // ตำแหน่งกรรไกร (ปลายขวาของริบบิ้นที่เหลือ)

  const Ribbon = ({ x, w, key: kk }: { x: number; w: number; key?: number }) => (
    <g key={kk}>
      <rect x={x} y={rY} width={w} height={rH} rx={3} fill={color.main} stroke={color.dark} strokeWidth={1.6} />
      <rect x={x} y={rY + 3} width={w} height={5} rx={2} fill={color.light} opacity={0.7} />
      <rect x={x} y={rY + rH - 6} width={w} height={4} rx={2} fill={color.dark} opacity={0.35} />
    </g>
  );

  return (
    <svg viewBox="0 0 560 250" className="w-full" role="img" aria-label="โต๊ะตัดริบบิ้น">
      <style>{`
        @keyframes rbFall { 0% { transform: translateY(-8px) rotate(0); opacity:.4; } 100% { transform: translateY(0) rotate(0); opacity:1; } }
        .rb-fall { animation: rbFall 0.3s ease-out both; }
        @keyframes rbSnip { 0%,100% { transform: rotate(0); } 50% { transform: rotate(-14deg); } }
        .rb-snip { animation: rbSnip 0.3s ease-in-out; transform-origin: center; }
      `}</style>

      {/* โต๊ะไม้ */}
      <rect x={20} y={rY + rH + 6} width={524} height={12} rx={3} fill="#c9975f" />
      <rect x={20} y={rY + rH + 6} width={524} height={3} fill="#e0b880" opacity={0.6} />

      {/* ไม้บรรทัด (เมตร) */}
      <rect x={X0} y={rY - 30} width={RW} height={20} rx={3} fill="#fde68a" stroke="#ca8a04" strokeWidth={1.6} />
      {Array.from({ length: den + 1 }, (_, k) => {
        const x = X0 + (k / den) * RW;
        return (
          <g key={`mj${k}`}>
            <line x1={x} y1={rY - 30} x2={x} y2={rY - 14} stroke="#a16207" strokeWidth={2} />
            <text x={x} y={rY - 33} fontSize={10} fontWeight={900} fill="#a16207" textAnchor="middle">{k === 0 ? "0" : k === den ? "1 ม." : `${k}/${den}`}</text>
          </g>
        );
      })}
      {/* ขีดย่อยตำแหน่งตัด (ทุก 1/e) */}
      {Array.from({ length: e + 1 }, (_, k) => {
        if (k % (e / den) === 0) return null;
        const x = X0 + (k / e) * RW;
        return <line key={`mn${k}`} x1={x} y1={rY - 22} x2={x} y2={rY - 12} stroke="#ca8a04" strokeWidth={1} />;
      })}

      {/* เส้นความยาวริบบิ้นทั้งหมด (จาง) */}
      <rect x={X0} y={rY} width={totalLen} height={rH} rx={3} fill="none" stroke={color.dark} strokeWidth={1} strokeDasharray="3 3" opacity={0.3} />

      {/* ริบบิ้นที่เหลือ (ยังไม่ตัด) + รอยประที่จะตัด */}
      {remaining > 0 && (
        <>
          <Ribbon x={X0} w={remLen} />
          {Array.from({ length: remaining }, (_, i) => i + 1).slice(0, remaining - 1).map((i) => {
            const x = X0 + i * pieceW;
            return <line key={`cut${i}`} x1={x} y1={rY - 2} x2={x} y2={rY + rH + 2} stroke="#fff" strokeWidth={1.4} strokeDasharray="3 3" opacity={0.8} />;
          })}
          {/* กรรไกร */}
          <g transform={`translate(${cutX - 8}, ${rY - 12})`} className={animating ? "rb-snip" : undefined}>
            <text fontSize={22}>✂️</text>
          </g>
        </>
      )}

      {/* ป้ายบอกขนาดริบบิ้นที่เหลือ */}
      {remaining > 0 && (
        <text x={X0 + remLen / 2} y={rY + rH + 30} fontSize={11} fontWeight={800} fill={color.dark} textAnchor="middle">
          ริบบิ้น {remaining}/{e} ม. (เหลือ)
        </text>
      )}

      {/* ถาดชิ้นที่ตัดแล้ว */}
      <text x={44} y={196} fontSize={12} fontWeight={900} fill="#475569">🧺 ตัดได้:</text>
      {Array.from({ length: sep }, (_, i) => {
        const perRow = 12;
        const row = Math.floor(i / perRow);
        const col = i % perRow;
        const bx = 120 + col * (pieceW + 6);
        const by = 188 + row * 20;
        return (
          <g key={`p${i}`} className={i === sep - 1 && animating ? "rb-fall" : undefined}>
            <rect x={bx} y={by} width={Math.max(10, pieceW)} height={13} rx={2} fill={color.main} stroke={color.dark} strokeWidth={1.2} />
            <rect x={bx} y={by + 1.5} width={Math.max(10, pieceW)} height={3} rx={1.5} fill={color.light} opacity={0.7} />
          </g>
        );
      })}
      {sep > 0 && (
        <g>
          <circle cx={528} cy={200} r={17} fill="#16a34a" />
          <text x={528} y={205} fontSize={16} fontWeight={900} fill="#fff" textAnchor="middle">{sep}</text>
        </g>
      )}
    </svg>
  );
}

/* ── ตัวเลือกจำนวน ── */

function NumPicker({ label, value, min, max, onChange, color }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void; color: string }) {
  const btn = "h-8 w-8 rounded-lg border-2 border-slate-200 bg-white text-lg font-extrabold text-slate-600 hover:bg-slate-50 active:scale-95 disabled:opacity-40";
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs font-extrabold text-slate-500">{label}</span>
      <button onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} className={btn}>−</button>
      <span className={cn("w-8 text-center text-2xl font-extrabold", color)}>{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} className={btn}>+</button>
    </div>
  );
}

/* ── เกมหลัก ── */

export function DivideRibbonGame() {
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

  /* โจทย์: ริบบิ้น num/den เมตร ตัดชิ้นละ 1/e (e = den*k) */
  const [den, setDen] = useState(4);
  const [num, setNum] = useState(3);
  const [k, setK] = useState(2);
  const [colorIdx, setColorIdx] = useState(0);
  const [reveal, setReveal] = useState(false);

  /* ตัวละคร */
  const [ownerIdx, setOwnerIdx] = useState(0);
  const [ownerNames, setOwnerNames] = useState<string[]>(() => OWNERS.map((o) => o.name));
  const [showNames, setShowNames] = useState(false);

  /* สถานะ */
  const [sep, setSep] = useState(0);      // จำนวนชิ้นที่ตัดแยกแล้ว
  const [animating, setAnimating] = useState(false);
  const timeoutsRef = useRef<number[]>([]);
  useEffect(() => () => timeoutsRef.current.forEach((t) => window.clearTimeout(t)), []);

  /* ภารกิจ */
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [guess, setGuess] = useState(0);
  const [firstTry, setFirstTry] = useState(true);
  const [checked, setChecked] = useState<null | boolean>(null);
  const [gameOver, setGameOver] = useState(false);

  const e = den * k;              // ตัวส่วนของชิ้น
  const pieces = num * k;         // คำตอบ = num/den ÷ 1/e = num*e/den = num*k
  const color = RIBBON_COLORS[colorIdx];
  const owner = { ...OWNERS[ownerIdx], name: ownerNames[ownerIdx] };
  const done = sep === pieces && pieces > 0;
  const showAnswer = done || (mode === "lab" && reveal);

  function resetCuts() { setSep(0); setAnimating(false); setChecked(null); }
  function setupProblem(nd: number, nn: number, nk: number, ci = colorIdx) {
    setDen(nd); setNum(nn); setK(nk); setColorIdx(ci);
    resetCuts(); setGuess(0); setFirstTry(true); setReveal(false);
  }

  function cutOne() {
    if (animating || sep >= pieces) return;
    ensure(); setAnimating(true);
    play("snip");
    setSep((s) => s + 1);
    timeoutsRef.current.push(window.setTimeout(() => { play("tick"); setAnimating(false); }, 340));
  }
  function cutAll(evalGuess = false) {
    if (animating) return;
    ensure();
    const remain = pieces - sep;
    if (remain <= 0) { if (evalGuess) evaluate(); return; }
    setAnimating(true);
    for (let i = 0; i < remain; i++) {
      timeoutsRef.current.push(window.setTimeout(() => { play("snip"); setSep((s) => s + 1); }, i * 300));
    }
    timeoutsRef.current.push(window.setTimeout(() => { setAnimating(false); if (evalGuess) evaluate(); }, remain * 300 + 240));
  }
  function evaluate() {
    const ok = guess === pieces;
    setChecked(ok);
    if (ok) { play("correct"); play("star"); setScore((s) => s + (firstTry ? 25 : 12)); }
    else play("wrong");
  }

  /* ภารกิจ flow */
  function randomProblem(): [number, number, number, number] {
    const nd = DEN_OPTIONS[randInt(0, DEN_OPTIONS.length - 1)];
    const nn = randInt(1, nd);
    const nk = K_OPTIONS[randInt(0, K_OPTIONS.length - 1)];
    return [nd, nn, nk, randInt(0, RIBBON_COLORS.length - 1)];
  }
  function startMissions() {
    ensure(); play("start");
    setScore(0); setRound(1); setGameOver(false);
    setupProblem(4, 3, 2, 0);
    setMode("mission");
  }
  function nextMission() {
    if (round >= MISSIONS_TOTAL) { setGameOver(true); play("star"); return; }
    setRound((r) => r + 1);
    const [nd, nn, nk, ci] = randomProblem();
    setupProblem(nd, nn, nk, ci);
    setOwnerIdx((prev) => shuffle(OWNERS.map((_, i) => i).filter((i) => i !== prev))[0] ?? prev);
  }

  const stars = score >= 170 ? 3 : score >= 100 ? 2 : 1;

  return (
    <div className="relative overflow-hidden rounded-2xl p-3 sm:p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-rose-100 via-pink-50 to-fuchsia-50" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden text-2xl" aria-hidden>
        <span className="absolute left-4 top-4 opacity-40">🎀</span>
        <span className="absolute right-8 top-7 opacity-40">✂️</span>
        <span className="absolute bottom-8 right-6 opacity-30">🧵</span>
      </div>

      <div className="relative space-y-3">
        {/* โหมด + ปิดเสียง */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex rounded-xl border-2 border-slate-200 bg-white p-1">
            <button onClick={() => { setMode("lab"); resetCuts(); }} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "lab" ? "bg-pink-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <FlaskConical size={15} /> โหมดครู
            </button>
            <button onClick={startMissions} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "mission" ? "bg-fuchsia-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <Target size={15} /> โหมดทายก่อนตัด
            </button>
          </div>
          <button onClick={() => setMuted((m) => !m)} className="grid h-9 w-9 place-items-center rounded-xl border-2 border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50" title={muted ? "เปิดเสียง" : "ปิดเสียง"}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {mode === "mission" && gameOver ? (
          <div className="space-y-4 rounded-2xl border-2 border-fuchsia-300 bg-white/90 p-6 text-center">
            <div className="text-5xl">🎀🏆</div>
            <h3 className="text-xl font-extrabold text-slate-800 sm:text-2xl">ปิดร้านริบบิ้นวันนี้!</h3>
            <p className="text-2xl">{"⭐".repeat(stars)}{"☆".repeat(3 - stars)}</p>
            <p className="text-base font-extrabold text-fuchsia-700">🏅 คะแนนรวม {score}</p>
            <button onClick={startMissions} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
              <Play size={18} /> เปิดร้านใหม่
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* แถบตั้งค่า (ครู) / สถานะ (ภารกิจ) */}
            {mode === "lab" ? (
              <div className="space-y-2 rounded-2xl border-2 border-pink-200 bg-white/90 px-3 py-2">
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
                  <span className="text-sm font-extrabold text-pink-700">🧑‍🏫 ตั้งโจทย์:</span>
                  <NumPicker label="ริบบิ้นยาว" value={num} min={1} max={den} onChange={(v) => setupProblem(den, v, k)} color="text-pink-600" />
                  <span className="text-xs font-extrabold text-slate-400">/ {den} ม.</span>
                  <span className="text-xs font-extrabold text-slate-500">ส่วน</span>
                  {DEN_OPTIONS.map((d) => (
                    <button key={d} onClick={() => setupProblem(d, Math.min(num, d), k)} className={cn("h-7 w-7 rounded-lg border-2 text-sm font-extrabold transition", den === d ? "border-pink-500 bg-pink-100 text-pink-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>{d}</button>
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="text-xs font-extrabold text-slate-500">ตัดชิ้นละ:</span>
                  {K_OPTIONS.map((kk) => (
                    <button key={kk} onClick={() => setupProblem(den, num, kk)} className={cn("inline-flex items-center gap-1 rounded-lg border-2 px-2 py-1 text-sm font-extrabold transition", k === kk ? "border-violet-500 bg-violet-100 text-violet-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
                      <span className="inline-flex translate-y-0.5"><StackedFraction numerator={1} denominator={den * kk} className="text-xs" toneClassName="text-current" /></span> ม.
                    </button>
                  ))}
                  <span className="mx-1 text-slate-300">|</span>
                  <button onClick={() => setReveal((v) => !v)} className={cn("flex items-center gap-1 rounded-lg border-2 px-2 py-1 text-xs font-extrabold transition", reveal ? "border-violet-400 bg-violet-100 text-violet-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
                    {reveal ? <EyeOff size={13} /> : <Eye size={13} />} เฉลย
                  </button>
                  <button onClick={() => setShowNames((v) => !v)} className={cn("flex items-center gap-1 rounded-lg border-2 px-2 py-1 text-xs font-extrabold transition", showNames ? "border-sky-400 bg-sky-100 text-sky-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
                    <Pencil size={13} /> แก้ชื่อ
                  </button>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="text-xs font-extrabold text-slate-500">สีริบบิ้น:</span>
                  {RIBBON_COLORS.map((c, i) => (
                    <button key={i} onClick={() => setColorIdx(i)} className={cn("h-6 w-6 rounded-full border-2 transition", colorIdx === i ? "border-slate-700 scale-110" : "border-white")} style={{ background: c.main }} />
                  ))}
                  <span className="mx-1 text-slate-300">|</span>
                  <span className="text-xs font-extrabold text-slate-500">เจ้าของร้าน:</span>
                  {OWNERS.map((o, i) => (
                    <button key={i} onClick={() => setOwnerIdx(i)} className={cn("rounded-lg border-2 p-0.5 transition", ownerIdx === i ? "border-pink-400 bg-pink-50" : "border-slate-200 bg-white")}>
                      <PixelOwner p={o} mood="normal" size={26} />
                    </button>
                  ))}
                </div>
                {showNames && (
                  <div className="flex flex-wrap items-center justify-center gap-2 border-t border-slate-100 pt-1.5">
                    <span className="text-sm font-extrabold text-sky-700">✏️ ชื่อเจ้าของร้าน:</span>
                    {OWNERS.map((_, i) => (
                      <input key={i} value={ownerNames[i]} maxLength={12} onChange={(ev) => setOwnerNames((ns) => { const nn = [...ns]; nn[i] = ev.target.value; return nn; })} className="w-24 rounded-lg border-2 border-slate-200 bg-white px-2 py-1 text-sm font-extrabold text-slate-700 focus:border-sky-400 focus:outline-none" />
                    ))}
                    <button onClick={() => setOwnerNames(OWNERS.map((o) => o.name))} className="rounded-lg border-2 border-slate-200 bg-white px-2 py-1 text-sm font-extrabold text-slate-500 hover:bg-slate-50">คืนค่าเดิม</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 rounded-2xl bg-white/90 px-4 py-2 ring-1 ring-fuchsia-200">
                <span className="text-base font-extrabold text-fuchsia-700">🎯 ข้อ {round}/{MISSIONS_TOTAL}</span>
                <span className="text-base font-extrabold text-pink-600">🏅 {score}</span>
                <span className="text-xs font-extrabold text-slate-500">ตัดริบบิ้นได้กี่ชิ้น?</span>
              </div>
            )}

            {/* การ์ดโจทย์ */}
            <div className="rounded-2xl border-2 border-pink-200 bg-white/95 px-4 py-3 text-center shadow-sm">
              <p className="text-base font-extrabold leading-relaxed text-slate-700 sm:text-lg">
                <span className="text-pink-600">{owner.name}</span> มีริบบิ้นยาว{" "}
                <span className="inline-flex translate-y-1.5"><StackedFraction numerator={num} denominator={den} className="text-lg" toneClassName="text-pink-600" /></span> เมตร
                ตัดเป็นชิ้นละ{" "}
                <span className="inline-flex translate-y-1.5"><StackedFraction numerator={1} denominator={e} className="text-lg" toneClassName="text-violet-600" /></span> เมตร
                <br className="sm:hidden" /> จะตัดได้กี่ชิ้น?
              </p>
            </div>

            {/* สมการใหญ่ */}
            <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-pink-200 bg-white/95 px-5 py-2.5 shadow-sm">
              <StackedFraction numerator={num} denominator={den} className="text-3xl sm:text-4xl" toneClassName="text-pink-600" />
              <span className="text-3xl font-black text-slate-400">÷</span>
              <StackedFraction numerator={1} denominator={e} className="text-3xl sm:text-4xl" toneClassName="text-violet-600" />
              <span className="text-3xl font-black text-slate-400">=</span>
              {showAnswer ? (
                <span className={cn("text-4xl font-black sm:text-5xl", done ? "text-pink-600" : "text-violet-500")}>{pieces} <span className="text-2xl">ชิ้น</span></span>
              ) : (
                <span className="grid h-12 w-12 place-items-center rounded-xl border-[3px] border-dashed border-pink-300 text-2xl font-black text-pink-400">?</span>
              )}
            </div>

            {/* ฉาก */}
            <div className="rounded-2xl border-2 border-pink-200 bg-gradient-to-b from-rose-100/50 to-pink-50/50 p-2">
              <div className="flex items-end gap-1">
                <div className="flex shrink-0 flex-col items-center pb-3">
                  <PixelOwner p={owner} mood={done ? "happy" : "normal"} size={72} />
                  <span className="mt-0.5 rounded-full bg-pink-600 px-2 py-0.5 text-[11px] font-extrabold text-white">{owner.name}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <RibbonScene num={num} den={den} e={e} pieces={pieces} sep={sep} color={color} animating={animating} />
                </div>
              </div>
            </div>

            {/* คำอธิบายผล */}
            {done && (
              <p className="text-center text-sm font-extrabold text-slate-600">
                ริบบิ้น <b className="text-pink-600">{num}/{den} ม.</b> มีชิ้นละ <b className="text-violet-600">1/{e} ม.</b> อยู่ <b className="text-pink-600">{pieces} ชิ้น</b> →
                หารคือ &ldquo;มีกี่ชิ้น&rdquo; = <span className="text-emerald-600">กลับตัวหลังแล้วคูณ</span>: {num}/{den} × {e}/1 = {num * e}/{den} = <b className="text-pink-600">{pieces}</b>
              </p>
            )}

            {/* โหมดทายก่อนตัด */}
            {mode === "mission" && sep === 0 && !animating && checked === null && (
              <div className="space-y-2 rounded-2xl border-2 border-fuchsia-200 bg-white/90 p-3">
                <p className="text-center text-sm font-extrabold text-slate-600">🤔 ทายก่อน: ตัดได้กี่ชิ้น? (พิมพ์ได้)</p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button onClick={() => setGuess((g) => Math.max(0, g - 1))} className="h-10 w-10 rounded-lg border-2 border-slate-200 bg-white text-xl font-extrabold text-slate-600 active:scale-95">−</button>
                  <div className="flex items-center gap-1 rounded-xl border-2 border-fuchsia-300 bg-white px-2 py-1">
                    <input type="text" inputMode="numeric" value={guess === 0 ? "" : String(guess)} placeholder="0" onChange={(ev) => { const v = parseInt(ev.target.value.replace(/\D/g, ""), 10); setGuess(Number.isNaN(v) ? 0 : Math.min(99, v)); }} onKeyDown={(ev) => { if (ev.key === "Enter") { setFirstTry(true); cutAll(true); } }} className="w-16 bg-transparent text-center text-3xl font-extrabold text-fuchsia-600 outline-none" aria-label="พิมพ์คำตอบ" />
                    <span className="text-sm font-extrabold text-slate-400">ชิ้น</span>
                  </div>
                  <button onClick={() => setGuess((g) => Math.min(99, g + 1))} className="h-10 w-10 rounded-lg border-2 border-slate-200 bg-white text-xl font-extrabold text-slate-600 active:scale-95">+</button>
                  <button onClick={() => { setFirstTry(true); cutAll(true); }} className="ml-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-500 px-6 py-2.5 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                    <Scissors size={17} /> ตัดพิสูจน์!
                  </button>
                </div>
                <p className="text-center text-xs font-bold text-slate-400">💡 นับว่ามีชิ้นละ 1/{e} ม. อยู่กี่ชิ้นใน {num}/{den} ม.</p>
              </div>
            )}

            {/* ผลทาย */}
            {mode === "mission" && checked !== null && (
              <div className={cn("rounded-2xl border-2 p-3 text-center", checked ? "border-emerald-300 bg-emerald-50" : "border-rose-300 bg-rose-50")}>
                <p className={cn("text-base font-extrabold", checked ? "text-emerald-700" : "text-rose-600")}>
                  {checked
                    ? `🎉 เก่งมาก! ${num}/${den} ÷ 1/${e} = ${num}/${den} × ${e} = ${pieces} ชิ้น`
                    : `ทาย ${guess} — จริง ๆ ได้ ${pieces} ชิ้น · กลับตัวหลังแล้วคูณ: ${num}/${den} × ${e} = ${pieces}`}
                </p>
                <button onClick={nextMission} className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-500 px-6 py-2 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                  {round >= MISSIONS_TOTAL ? "🏁 ดูสรุปผล" : <>ข้อต่อไป <ArrowRight size={16} /></>}
                </button>
              </div>
            )}

            {/* ปุ่มควบคุม (โหมดครู) */}
            {mode === "lab" && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                {sep < pieces ? (
                  <>
                    <button onClick={cutOne} disabled={animating} className="inline-flex items-center gap-2 rounded-xl border-b-4 border-pink-700 bg-gradient-to-b from-pink-500 to-pink-600 px-5 py-2.5 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.97] active:border-b-2 disabled:opacity-50">
                      <Scissors size={17} /> ตัด 1 ชิ้น
                    </button>
                    <button onClick={() => cutAll()} disabled={animating} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-500 px-5 py-2.5 text-base font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98] disabled:opacity-50">
                      ✂️ ตัดจนหมด
                    </button>
                    {sep > 0 && (
                      <button onClick={resetCuts} disabled={animating} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-3 py-1.5 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50 disabled:opacity-50">
                        <RotateCcw size={14} /> ต่อคืน
                      </button>
                    )}
                  </>
                ) : (
                  <button onClick={resetCuts} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-5 py-2 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50">
                    <RotateCcw size={15} /> ริบบิ้นม้วนใหม่
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
