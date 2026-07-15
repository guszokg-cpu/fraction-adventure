"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Volume2, VolumeX, FlaskConical, Target, ArrowRight, Eye, EyeOff, Pencil, Scissors } from "lucide-react";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { gcd } from "@/lib/fractionUtils";
import { cn } from "@/lib/cn";
import { randInt, shuffle } from "@/lib/randomFraction";

/* ── ค่าคงที่ ── */

const DEN_OPTIONS = [2, 3, 4, 5, 6];
const MISSIONS_TOTAL = 8;
const SS = { shapeRendering: "crispEdges" as const };

const KID_COLORS = ["#f472b6", "#38bdf8", "#facc15", "#4ade80", "#a78bfa"];
const KID_DARK = ["#be185d", "#0369a1", "#a16207", "#15803d", "#6d28d9"];

/* ── เสียง ── */

type SoundKind = "cut" | "give" | "tick" | "correct" | "wrong" | "start" | "star";

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
      case "cut": return tones([1500, 800], 0.035, 0.06, "square", 0.06);
      case "give": return tones([740, 988, 1319], 0.05, 0.1, "triangle", 0.09);
      case "tick": return tones([1300], 0.03, 0.04, "square", 0.05);
      case "correct": return tones([660, 990, 1319], 0.06, 0.1, "triangle", 0.14);
      case "wrong": return tones([220, 165], 0.11, 0.18, "sawtooth", 0.09);
      case "start": return tones([523, 659, 784], 0.07, 0.12, "triangle", 0.14);
      case "star": return tones([1047, 1319, 1568, 2093], 0.07, 0.14, "triangle", 0.14);
    }
  }
  return { play, ensure };
}

/* ── เพลงงานปาร์ตี้สดใส (ชิปทูน ไม่ใช้ไฟล์) ── */

const CK_LEAD = [72, 72, 74, 72, 77, 76, 0, 0, 72, 72, 74, 72, 79, 77, 0, 0, 72, 72, 84, 81, 77, 76, 74, 0, 82, 82, 81, 77, 79, 77, 0, 0];
const CK_BASS = [48, 55, 48, 55, 53, 60, 53, 60, 48, 55, 55, 52, 53, 60, 55, 48];

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
      const m = CK_LEAD[s];
      if (m) note(m, 0.18, "square", 0.024);
      if (s % 2 === 0) {
        const b = CK_BASS[s / 2];
        if (b) note(b, 0.3, "triangle", 0.05);
      }
    }, 195);
  }
  function stop() {
    if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
  }
  useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);
  return { start, stop };
}

/* ── ตัวละคร ── */

type Person = { name: string; skin: string; body: string; dark: string; hair: string };
const HOSTS: Person[] = [
  { name: "น้องพลอย", skin: "#ffd9c9", body: "#ec4899", dark: "#9d174d", hair: "#3b2412" },
  { name: "น้องเจได", skin: "#f5cba3", body: "#2563eb", dark: "#1e3a8a", hair: "#1c1c1c" },
  { name: "คุณครูแนน", skin: "#f0c9a0", body: "#7c3aed", dark: "#5b21b6", hair: "#2b1d10" },
  { name: "ลุงใจดี", skin: "#e0b487", body: "#16a34a", dark: "#166534", hair: "#2d2013" },
];

function PixelKid({ p, mood, size = 84 }: { p: Person; mood: "normal" | "happy"; size?: number }) {
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
      <rect x={11} y={24} width={18} height={18} rx={3} fill={p.body} stroke="#00000022" strokeWidth={1.2} />
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

/* หัวเด็กสีสัน (ผู้รับเค้ก) */
function KidHead({ color, dark, size = 40 }: { color: string; dark: string; size?: number }) {
  return (
    <svg viewBox="0 0 28 30" width={size} height={size * 30 / 28} style={SS} role="img" aria-label="เพื่อน">
      <ellipse cx={14} cy={27} rx={9} ry={2} fill="#00000010" />
      <path d="M6,11 Q6,3 14,3 Q22,3 22,11 L22,9 Q18,6 14,6 Q10,6 6,9 Z" fill="#3b2412" />
      <circle cx={14} cy={12} r={7} fill="#f8cfa8" stroke="#00000018" strokeWidth={0.8} />
      <circle cx={11.5} cy={12} r={1.1} fill="#1e293b" />
      <circle cx={16.5} cy={12} r={1.1} fill="#1e293b" />
      <path d="M11.5,15 Q14,17 16.5,15" stroke="#1e293b" strokeWidth={1} fill="none" strokeLinecap="round" />
      <circle cx={10} cy={14} r={1.3} fill="#fb7185" opacity={0.45} />
      <circle cx={18} cy={14} r={1.3} fill="#fb7185" opacity={0.45} />
      <path d="M7,22 Q14,18 21,22 L21,27 Q14,29 7,27 Z" fill={color} stroke={dark} strokeWidth={1.2} />
    </svg>
  );
}

/* ── ถาดเค้ก (เศษ a/b, ซอย n แถวแบ่งให้เพื่อน) ── */

function CakePan({ a, b, n, phase }: { a: number; b: number; n: number; phase: "whole" | "cut" | "shared" }) {
  const X = 24, Y = 30, W = 396, H = 150;
  const cellW = W / b;
  const rows = phase === "whole" ? 1 : n;
  const cellH = H / rows;
  const cut = phase !== "whole";
  const shared = phase === "shared";

  return (
    <svg viewBox="0 0 444 210" className="w-full" role="img" aria-label="ถาดเค้ก">
      <style>{`
        @keyframes ckPop { 0% { opacity: 0; transform: scale(0.6); } 100% { opacity: 1; transform: scale(1); } }
        .ck-pop { transform-box: fill-box; transform-origin: center; animation: ckPop 0.3s ease-out both; }
      `}</style>

      {/* จานรอง */}
      <rect x={X - 10} y={Y - 8} width={W + 20} height={H + 24} rx={12} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={2} />
      <ellipse cx={X + W / 2} cy={Y + H + 14} rx={W / 2} ry={5} fill="#00000010" />

      {/* ช่องเค้ก */}
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: b }, (_, c) => {
          const isCake = c < a;
          const cx = X + c * cellW, cy = Y + r * cellH;
          if (!isCake) {
            return <rect key={`${r}-${c}`} x={cx} y={cy} width={cellW} height={cellH} fill="#f1f5f9" stroke="#cbd5e1" strokeWidth={1} strokeDasharray="4 3" />;
          }
          const tint = shared ? KID_COLORS[r % KID_COLORS.length] : "#fde68a";
          return (
            <g key={`${r}-${c}`} className={shared ? "ck-pop" : undefined}>
              {/* เนื้อเค้ก */}
              <rect x={cx} y={cy} width={cellW} height={cellH} fill="#e9c9a0" stroke="#b98a52" strokeWidth={1} />
              <rect x={cx} y={cy + cellH * 0.45} width={cellW} height={cellH * 0.14} fill="#c98a5a" opacity={0.5} />
              {/* หน้าครีม (แถวบนสุด หรือทุกชิ้นเมื่อแบ่ง) */}
              <rect x={cx + 1} y={cy + 1} width={cellW - 2} height={Math.min(10, cellH * 0.4)} rx={3} fill={tint} opacity={shared ? 0.9 : 1} stroke={shared ? KID_DARK[r % KID_DARK.length] : "#f59e0b"} strokeWidth={1} style={{ transition: "fill 0.3s" }} />
              {/* สตรอว์เบอร์รี */}
              {(!cut || cellH > 26) && <g><circle cx={cx + cellW / 2} cy={cy + 6} r={3} fill="#ef4444" /><circle cx={cx + cellW / 2 - 1} cy={cy + 5} r={0.7} fill="#fff" /></g>}
              {shared && <text x={cx + cellW / 2} y={cy + cellH - 5} fontSize={9} fontWeight={900} fill={KID_DARK[r % KID_DARK.length]} textAnchor="middle">{r + 1}</text>}
            </g>
          );
        }),
      )}

      {/* เส้นแบ่งคอลัมน์ (b ส่วนของก้อน) */}
      {Array.from({ length: b + 1 }, (_, c) => (
        <line key={`v${c}`} x1={X + c * cellW} y1={Y} x2={X + c * cellW} y2={Y + H} stroke={c === a ? "#b45309" : "#c98a5a"} strokeWidth={c === a ? 2.5 : 1} opacity={c === a ? 0.9 : 0.5} />
      ))}
      {/* เส้นซอยแถว (n คน) */}
      {cut && Array.from({ length: n + 1 }, (_, r) => (
        <line key={`h${r}`} x1={X} y1={Y + r * cellH} x2={X + a * cellW} y2={Y + r * cellH} stroke="#fff" strokeWidth={2} opacity={0.9} />
      ))}

      {/* ป้ายบอก a/b */}
      <text x={X + (a * cellW) / 2} y={Y - 12} fontSize={12} fontWeight={900} fill="#b45309" textAnchor="middle">🍰 เค้ก {a}/{b} ก้อน</text>
      {a < b && <text x={X + a * cellW + ((b - a) * cellW) / 2} y={Y - 12} fontSize={11} fontWeight={800} fill="#94a3b8" textAnchor="middle">(ว่าง)</text>}
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

export function DivideCakeShareGame() {
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

  /* โจทย์: เค้ก a/b ก้อน แบ่งให้ n คน */
  const [den, setDen] = useState(4);
  const [num, setNum] = useState(3);
  const [kids, setKids] = useState(3);
  const [reveal, setReveal] = useState(false);

  /* ตัวละคร */
  const [hostIdx, setHostIdx] = useState(0);
  const [hostNames, setHostNames] = useState<string[]>(() => HOSTS.map((o) => o.name));
  const [kidNames, setKidNames] = useState<string[]>(["น้องเอ", "น้องบี", "น้องซี", "น้องดี", "น้องอี"]);
  const [showNames, setShowNames] = useState(false);

  /* สถานะ */
  const [phase, setPhase] = useState<"whole" | "cut" | "shared">("whole");
  const timeoutsRef = useRef<number[]>([]);
  const clearTimers = () => { timeoutsRef.current.forEach((t) => window.clearTimeout(t)); timeoutsRef.current = []; };
  useEffect(() => () => clearTimers(), []);

  /* ภารกิจ */
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [gNum, setGNum] = useState(0);
  const [gDen, setGDen] = useState(0);
  const [firstTry, setFirstTry] = useState(true);
  const [proving, setProving] = useState(false);
  const [checked, setChecked] = useState<null | boolean>(null);
  const [gameOver, setGameOver] = useState(false);

  const resNum = num;                    // แต่ละคนได้ num ชิ้นเล็ก
  const resDen = den * kids;             // ชิ้นเล็กละ 1/(den*kids)
  const g = gcd(resNum, resDen);
  const rNum = resNum / g, rDen = resDen / g;
  const host = { ...HOSTS[hostIdx], name: hostNames[hostIdx] };
  const done = phase === "shared";
  const showAnswer = done || (mode === "lab" && reveal);

  function resetShare() { clearTimers(); setPhase("whole"); setProving(false); }
  function setupProblem(nd: number, nn: number, nk: number) {
    setDen(nd); setNum(nn); setKids(nk);
    resetShare(); setGNum(0); setGDen(0); setFirstTry(true); setChecked(null); setReveal(false);
  }

  function doCut() { if (phase !== "whole") return; ensure(); play("cut"); setPhase("cut"); }
  function doShare() { if (phase !== "cut") return; ensure(); play("give"); setPhase("shared"); }
  function revealAnswer() { clearTimers(); setPhase("shared"); }

  function proveMission() {
    if (proving) return;
    ensure(); setProving(true);
    play("cut"); setPhase("cut");
    timeoutsRef.current.push(window.setTimeout(() => { play("give"); setPhase("shared"); }, 750));
    timeoutsRef.current.push(window.setTimeout(() => {
      setProving(false);
      const ok = gDen > 0 && gNum * resDen === resNum * gDen;   // ยอมรับเศษที่เท่ากัน
      setChecked(ok);
      if (ok) { play("correct"); play("star"); setScore((s) => s + (firstTry ? 25 : 12)); }
      else play("wrong");
    }, 1450));
  }

  /* ภารกิจ flow */
  function randomProblem(): [number, number, number] {
    const nd = DEN_OPTIONS[randInt(0, DEN_OPTIONS.length - 1)];
    return [nd, randInt(1, nd), randInt(2, 5)];
  }
  function startMissions() {
    ensure(); play("start");
    setScore(0); setRound(1); setGameOver(false);
    setupProblem(4, 3, 3);
    setMode("mission");
  }
  function nextMission() {
    if (round >= MISSIONS_TOTAL) { setGameOver(true); play("star"); return; }
    setRound((r) => r + 1);
    const [nd, nn, nk] = randomProblem();
    setupProblem(nd, nn, nk);
    setHostIdx((prev) => shuffle(HOSTS.map((_, i) => i).filter((i) => i !== prev))[0] ?? prev);
  }

  const stars = score >= 170 ? 3 : score >= 100 ? 2 : 1;

  return (
    <div className="relative overflow-hidden rounded-2xl p-3 sm:p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-100 via-yellow-50 to-orange-50" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden text-2xl" aria-hidden>
        <span className="absolute left-4 top-4 opacity-40">🎉</span>
        <span className="absolute right-8 top-7 opacity-40">🎂</span>
        <span className="absolute bottom-8 right-6 opacity-30">🍓</span>
      </div>

      <div className="relative space-y-3">
        {/* โหมด + ปิดเสียง */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex rounded-xl border-2 border-slate-200 bg-white p-1">
            <button onClick={() => { setMode("lab"); resetShare(); }} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "lab" ? "bg-amber-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <FlaskConical size={15} /> โหมดครู
            </button>
            <button onClick={startMissions} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "mission" ? "bg-orange-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <Target size={15} /> โหมดทายก่อนแบ่ง
            </button>
          </div>
          <button onClick={() => setMuted((m) => !m)} className="grid h-9 w-9 place-items-center rounded-xl border-2 border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50" title={muted ? "เปิดเสียง" : "ปิดเสียง"}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {mode === "mission" && gameOver ? (
          <div className="space-y-4 rounded-2xl border-2 border-orange-300 bg-white/90 p-6 text-center">
            <div className="text-5xl">🎂🏆</div>
            <h3 className="text-xl font-extrabold text-slate-800 sm:text-2xl">แบ่งเค้กครบทุกงาน!</h3>
            <p className="text-2xl">{"⭐".repeat(stars)}{"☆".repeat(3 - stars)}</p>
            <p className="text-base font-extrabold text-orange-700">🏅 คะแนนรวม {score}</p>
            <button onClick={startMissions} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
              <Play size={18} /> เล่นอีกครั้ง
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* แถบตั้งค่า (ครู) / สถานะ (ภารกิจ) */}
            {mode === "lab" ? (
              <div className="space-y-2 rounded-2xl border-2 border-amber-200 bg-white/90 px-3 py-2">
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
                  <span className="text-sm font-extrabold text-amber-700">🧑‍🏫 ตั้งโจทย์:</span>
                  <NumPicker label="เค้ก" value={num} min={1} max={den} onChange={(v) => setupProblem(den, v, kids)} color="text-amber-600" />
                  <span className="text-xs font-extrabold text-slate-400">/ {den} ก้อน</span>
                  <span className="text-xs font-extrabold text-slate-500">ส่วน</span>
                  {DEN_OPTIONS.map((d) => (
                    <button key={d} onClick={() => setupProblem(d, Math.min(num, d), kids)} className={cn("h-7 w-7 rounded-lg border-2 text-sm font-extrabold transition", den === d ? "border-amber-500 bg-amber-100 text-amber-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>{d}</button>
                  ))}
                  <span className="mx-1 text-slate-300">|</span>
                  <span className="text-lg font-black text-slate-400">÷</span>
                  <NumPicker label="เพื่อน (คน)" value={kids} min={2} max={5} onChange={(v) => setupProblem(den, num, v)} color="text-orange-600" />
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button onClick={() => setReveal((v) => { const nv = !v; if (nv) revealAnswer(); else resetShare(); return nv; })} className={cn("flex items-center gap-1 rounded-lg border-2 px-2 py-1 text-xs font-extrabold transition", reveal ? "border-violet-400 bg-violet-100 text-violet-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
                    {reveal ? <EyeOff size={13} /> : <Eye size={13} />} เฉลย
                  </button>
                  <button onClick={() => setShowNames((v) => !v)} className={cn("flex items-center gap-1 rounded-lg border-2 px-2 py-1 text-xs font-extrabold transition", showNames ? "border-sky-400 bg-sky-100 text-sky-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
                    <Pencil size={13} /> แก้ชื่อ
                  </button>
                  <span className="mx-1 text-slate-300">|</span>
                  <span className="text-xs font-extrabold text-slate-500">เจ้าภาพ:</span>
                  {HOSTS.map((o, i) => (
                    <button key={i} onClick={() => setHostIdx(i)} className={cn("rounded-lg border-2 p-0.5 transition", hostIdx === i ? "border-amber-400 bg-amber-50" : "border-slate-200 bg-white")}>
                      <PixelKid p={o} mood="normal" size={26} />
                    </button>
                  ))}
                </div>
                {showNames && (
                  <div className="space-y-1.5 border-t border-slate-100 pt-1.5">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <span className="text-sm font-extrabold text-sky-700">✏️ เจ้าภาพ:</span>
                      {HOSTS.map((_, i) => (
                        <input key={i} value={hostNames[i]} maxLength={12} onChange={(ev) => setHostNames((ns) => { const nn = [...ns]; nn[i] = ev.target.value; return nn; })} className="w-24 rounded-lg border-2 border-slate-200 bg-white px-2 py-1 text-sm font-extrabold text-slate-700 focus:border-sky-400 focus:outline-none" />
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <span className="text-sm font-extrabold text-sky-700">✏️ เพื่อน:</span>
                      {kidNames.map((nm, i) => (
                        <input key={i} value={nm} maxLength={10} onChange={(ev) => setKidNames((ns) => { const nn = [...ns]; nn[i] = ev.target.value; return nn; })} className="w-20 rounded-lg border-2 border-slate-200 bg-white px-2 py-1 text-sm font-extrabold text-slate-700 focus:border-sky-400 focus:outline-none" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 rounded-2xl bg-white/90 px-4 py-2 ring-1 ring-orange-200">
                <span className="text-base font-extrabold text-orange-700">🎯 ข้อ {round}/{MISSIONS_TOTAL}</span>
                <span className="text-base font-extrabold text-amber-600">🏅 {score}</span>
                <span className="text-xs font-extrabold text-slate-500">คนละเท่าไร?</span>
              </div>
            )}

            {/* การ์ดโจทย์ */}
            <div className="rounded-2xl border-2 border-amber-200 bg-white/95 px-4 py-3 text-center shadow-sm">
              <p className="text-base font-extrabold leading-relaxed text-slate-700 sm:text-lg">
                <span className="text-amber-600">{host.name}</span> มีเค้ก{" "}
                <span className="inline-flex translate-y-1.5"><StackedFraction numerator={num} denominator={den} className="text-lg" toneClassName="text-amber-600" /></span> ก้อน
                แบ่งให้เพื่อน <span className="text-orange-600">{kids} คน</span>เท่า ๆ กัน <br className="sm:hidden" />คนละกี่ส่วนของก้อน?
              </p>
            </div>

            {/* สมการใหญ่ */}
            <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-amber-200 bg-white/95 px-5 py-2.5 shadow-sm">
              <StackedFraction numerator={num} denominator={den} className="text-3xl sm:text-4xl" toneClassName="text-amber-600" />
              <span className="text-3xl font-black text-slate-400">÷</span>
              <span className="text-3xl font-black text-orange-600 sm:text-4xl">{kids}</span>
              <span className="text-3xl font-black text-slate-400">=</span>
              {showAnswer ? (
                <span className="flex items-center gap-2">
                  <StackedFraction numerator={resNum} denominator={resDen} className="text-3xl sm:text-4xl" toneClassName={done ? "text-orange-600" : "text-violet-500"} />
                  {g > 1 && <><span className="text-2xl font-black text-slate-400">=</span><StackedFraction numerator={rNum} denominator={rDen} className="text-3xl sm:text-4xl" toneClassName="text-orange-700" /></>}
                </span>
              ) : (
                <span className="grid h-12 w-12 place-items-center rounded-xl border-[3px] border-dashed border-amber-300 text-2xl font-black text-amber-400">?</span>
              )}
            </div>

            {/* ฉาก: เจ้าภาพ + เค้ก */}
            <div className="rounded-2xl border-2 border-amber-200 bg-gradient-to-b from-yellow-100/50 to-amber-50/50 p-2">
              <div className="flex items-center gap-1">
                <div className="flex shrink-0 flex-col items-center">
                  <PixelKid p={host} mood={done ? "happy" : "normal"} size={72} />
                  <span className="mt-0.5 rounded-full bg-amber-600 px-2 py-0.5 text-[11px] font-extrabold text-white">{host.name}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <CakePan a={num} b={den} n={kids} phase={phase} />
                </div>
              </div>
              {/* เพื่อน n คน + ส่วนที่ได้ */}
              {done && (
                <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
                  {Array.from({ length: kids }, (_, i) => (
                    <div key={i} className="flex items-center gap-1 rounded-xl border-2 px-2 py-1" style={{ borderColor: KID_COLORS[i % KID_COLORS.length], background: `${KID_COLORS[i % KID_COLORS.length]}18` }}>
                      <KidHead color={KID_COLORS[i % KID_COLORS.length]} dark={KID_DARK[i % KID_DARK.length]} size={30} />
                      <span className="text-xs font-extrabold text-slate-600">{kidNames[i]}</span>
                      <span className="inline-flex translate-y-0.5"><StackedFraction numerator={rNum} denominator={rDen} className="text-sm" toneClassName="text-slate-700" /></span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* คำอธิบายผล */}
            {done && (
              <p className="text-center text-sm font-extrabold text-slate-600">
                ซอยเค้กแต่ละส่วนออกเป็น <b className="text-orange-600">{kids}</b> แถว → ได้ชิ้นเล็กชิ้นละ <b>1/{resDen}</b> ก้อน ·
                แต่ละคนได้ <b className="text-amber-600">{num} ชิ้น = {resNum}/{resDen}</b>{g > 1 && <> = <b className="text-orange-700">{rNum}/{rDen}</b></>} ก้อน
                {" "}<span className="text-rose-500">— หารด้วยจำนวนคน = ตัวส่วนคูณ {kids} ({num}/{den} × 1/{kids})</span>
              </p>
            )}

            {/* โหมดทายก่อนแบ่ง */}
            {mode === "mission" && phase === "whole" && checked === null && (
              <div className="space-y-2 rounded-2xl border-2 border-orange-200 bg-white/90 p-3">
                <p className="text-center text-sm font-extrabold text-slate-600">🤔 ทายก่อน: แต่ละคนได้กี่ส่วนของก้อน? (พิมพ์เศษ/ส่วน)</p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="inline-flex flex-col items-center rounded-xl border-2 border-orange-300 bg-white px-3 py-1">
                    <input type="text" inputMode="numeric" value={gNum === 0 ? "" : String(gNum)} placeholder="?" onChange={(ev) => { const v = parseInt(ev.target.value.replace(/\D/g, ""), 10); setGNum(Number.isNaN(v) ? 0 : Math.min(99, v)); }} className="w-14 bg-transparent text-center text-2xl font-extrabold text-orange-600 outline-none" aria-label="เศษคำตอบ" />
                    <span className="h-[3px] w-10 rounded bg-slate-400" />
                    <input type="text" inputMode="numeric" value={gDen === 0 ? "" : String(gDen)} placeholder="?" onChange={(ev) => { const v = parseInt(ev.target.value.replace(/\D/g, ""), 10); setGDen(Number.isNaN(v) ? 0 : Math.min(99, v)); }} onKeyDown={(ev) => { if (ev.key === "Enter") { setFirstTry(true); proveMission(); } }} className="w-14 bg-transparent text-center text-2xl font-extrabold text-slate-500 outline-none" aria-label="ส่วนคำตอบ" />
                  </span>
                  <span className="text-sm font-extrabold text-slate-400">ก้อน</span>
                  <button onClick={() => { setFirstTry(true); proveMission(); }} className="ml-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-2.5 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                    <Scissors size={17} /> แบ่งพิสูจน์!
                  </button>
                </div>
                <p className="text-center text-xs font-bold text-slate-400">💡 ซอยแต่ละส่วน (1/{den}) ออกเป็น {kids} คน → ชิ้นเล็ก 1/{resDen}</p>
              </div>
            )}

            {/* ผลทาย */}
            {mode === "mission" && checked !== null && (
              <div className={cn("rounded-2xl border-2 p-3 text-center", checked ? "border-emerald-300 bg-emerald-50" : "border-rose-300 bg-rose-50")}>
                <p className={cn("text-base font-extrabold", checked ? "text-emerald-700" : "text-rose-600")}>
                  {checked
                    ? `🎉 ถูกต้อง! ${num}/${den} ÷ ${kids} = ${resNum}/${resDen}${g > 1 ? ` = ${rNum}/${rDen}` : ""} ก้อน`
                    : `ทาย ${gNum}/${gDen || "?"} — จริง ๆ คือ ${resNum}/${resDen}${g > 1 ? ` (= ${rNum}/${rDen})` : ""} · แบ่ง ${kids} คน → ตัวส่วนคูณ ${kids}`}
                </p>
                <button onClick={nextMission} className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-2 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                  {round >= MISSIONS_TOTAL ? "🏁 ดูสรุปผล" : <>งานต่อไป <ArrowRight size={16} /></>}
                </button>
              </div>
            )}

            {/* ปุ่มควบคุม (โหมดครู) */}
            {mode === "lab" && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                {phase === "whole" && (
                  <button onClick={doCut} className="inline-flex items-center gap-2 rounded-xl border-b-4 border-amber-700 bg-gradient-to-b from-amber-500 to-amber-600 px-6 py-2.5 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.97] active:border-b-2">
                    <Scissors size={17} /> ① ซอยแบ่ง {kids} คน
                  </button>
                )}
                {phase === "cut" && (
                  <>
                    <button onClick={doShare} className="inline-flex items-center gap-2 rounded-xl border-b-4 border-orange-700 bg-gradient-to-b from-orange-500 to-orange-600 px-6 py-2.5 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.97] active:border-b-2">
                      🤝 ② แจกให้เพื่อน
                    </button>
                    <button onClick={resetShare} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-3 py-1.5 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50">
                      <RotateCcw size={14} /> เริ่มใหม่
                    </button>
                  </>
                )}
                {phase === "shared" && (
                  <button onClick={resetShare} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-5 py-2 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50">
                    <RotateCcw size={15} /> เค้กก้อนใหม่
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
