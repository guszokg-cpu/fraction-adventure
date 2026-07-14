"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Volume2, VolumeX, FlaskConical, Target, ArrowRight, Eye, EyeOff, Pencil, Scissors } from "lucide-react";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { cn } from "@/lib/cn";
import { randInt, shuffle } from "@/lib/randomFraction";

/* ── ค่าคงที่ ── */

const MISSIONS_TOTAL = 8;
const SS = { shapeRendering: "crispEdges" as const };
const ALL_B = [2, 3, 4, 5, 6];

/* บริบท: เงิน (เหรียญละ 10 บาท) / จำนวนนักเรียน */
type CtxKey = "money" | "students";
const CONTEXTS: Record<CtxKey, { unit: number; unitWord: string; presets: number[] }> = {
  money: { unit: 10, unitWord: "บาท", presets: [40, 60, 80, 100, 120] },
  students: { unit: 1, unitWord: "คน", presets: [8, 12, 16, 20, 24] },
};
const divisorsOf = (tokens: number) => ALL_B.filter((x) => tokens % x === 0);

/* ── เสียง ── */

type SoundKind = "split" | "pick" | "unpick" | "correct" | "wrong" | "start" | "star" | "coin";

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
      case "split": return tones([300, 500, 700], 0.05, 0.12, "square", 0.06);
      case "pick": return tones([880, 1175], 0.05, 0.09, "triangle", 0.1);
      case "unpick": return tones([500, 380], 0.05, 0.09, "triangle", 0.07);
      case "coin": return tones([988, 1319, 1568], 0.05, 0.1, "square", 0.08);
      case "correct": return tones([660, 990, 1319], 0.06, 0.1, "triangle", 0.14);
      case "wrong": return tones([220, 165], 0.11, 0.18, "sawtooth", 0.09);
      case "start": return tones([523, 659, 784], 0.07, 0.12, "triangle", 0.14);
      case "star": return tones([1047, 1319, 1568, 2093], 0.07, 0.14, "triangle", 0.14);
    }
  }
  return { play, ensure };
}

/* ── เพลงกระเป๋าตังค์สดใส (ชิปทูน ไม่ใช้ไฟล์) ── */

const MN_LEAD = [76, 0, 79, 0, 81, 79, 76, 0, 74, 0, 77, 0, 79, 77, 74, 0, 72, 0, 76, 0, 79, 0, 84, 0, 81, 79, 76, 0, 72, 0, 0, 0];
const MN_BASS = [52, 59, 52, 59, 50, 57, 50, 57, 53, 60, 53, 60, 48, 55, 55, 52];

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
      const m = MN_LEAD[s];
      if (m) note(m, 0.2, "square", 0.022);
      if (s % 2 === 0) {
        const b = MN_BASS[s / 2];
        if (b) note(b, 0.32, "triangle", 0.05);
      }
    }, 200);
  }
  function stop() {
    if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
  }
  useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);
  return { start, stop };
}

/* ── ตัวเอก (เจ้าของเงิน / คุณครู) ── */

type PType = "girl" | "boy" | "teacher" | "grandma";
type Person = { type: PType; name: string; skin: string; body: string; dark: string; hair: string };
const OWNERS: Person[] = [
  { type: "girl", name: "น้องพลอย", skin: "#ffd9c9", body: "#ec4899", dark: "#9d2660", hair: "#3b2412" },
  { type: "boy", name: "น้องเจได", skin: "#f5cba3", body: "#2563eb", dark: "#1e3a8a", hair: "#1c1c1c" },
  { type: "teacher", name: "คุณครูแนน", skin: "#f0c9a0", body: "#7c3aed", dark: "#5b21b6", hair: "#2b1d10" },
  { type: "grandma", name: "คุณยายมาลี", skin: "#e8c7a2", body: "#0891b2", dark: "#155e63", hair: "#d4d4d8" },
];

function PixelPerson({ p, mood, size = 88 }: { p: Person; mood: "normal" | "happy"; size?: number }) {
  return (
    <svg viewBox="0 0 40 56" width={size * 0.71} height={size} style={SS} role="img" aria-label={p.name}>
      {p.type === "grandma" && <path d="M9,12 Q9,3 20,3 Q31,3 31,12 Q31,7 20,7 Q9,7 9,12 Z" fill={p.hair} />}
      {p.type === "girl" && <>
        <path d="M9,12 Q9,3 20,3 Q31,3 31,12 L31,9 Q26,6 20,6 Q14,6 9,9 Z" fill={p.hair} />
        <rect x={6} y={12} width={4} height={9} rx={2} fill={p.hair} /><rect x={30} y={12} width={4} height={9} rx={2} fill={p.hair} />
      </>}
      {p.type === "boy" && <path d="M10,11 Q10,3 20,3 Q30,3 30,11 L30,9 Q25,6 20,6 Q15,6 10,9 Z" fill={p.hair} />}
      {p.type === "teacher" && <path d="M9,11 Q9,3 20,3 Q31,3 31,11 L31,9 Q26,6 20,6 Q14,6 9,9 Z" fill={p.hair} />}
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

/* ── เหรียญ 10 บาท (วาดสมจริง) ── */

function Coin({ cx, cy, s = 1, on }: { cx: number; cy: number; s?: number; on: boolean }) {
  return (
    <g transform={`translate(${cx},${cy}) scale(${s})`}>
      <ellipse cx={0} cy={11} rx={9} ry={2.2} fill="#00000015" />
      <circle r={11} fill={on ? "url(#mn-gold-on)" : "url(#mn-gold)"} stroke={on ? "#a15c07" : "#c07d10"} strokeWidth={1.5} />
      <circle r={8.4} fill="none" stroke={on ? "#fde68a" : "#f2d891"} strokeWidth={0.9} opacity={0.8} />
      <text x={0} y={3.6} fontSize={9.5} fontWeight={900} fill={on ? "#6b3d05" : "#8a5a08"} textAnchor="middle">๑๐</text>
      <path d="M-5,-6 A11 11 0 0 1 6,-3.5" stroke="#fff" strokeWidth={1.6} fill="none" opacity={0.55} strokeLinecap="round" />
    </g>
  );
}

/* ── เด็กน้อยพิกเซลน่ารัก (โทเคนนักเรียน) ── */

const KID_HAIRS = ["#3b2412", "#1c1c1c", "#5b3a1e", "#2d2013"];
function KidToken({ cx, cy, s = 1, on, hair = "#3b2412" }: { cx: number; cy: number; s?: number; on: boolean; hair?: string }) {
  const shirt = on ? "#3b82f6" : "#cbd5e1";
  const shirtDark = on ? "#1d4ed8" : "#94a3b8";
  const legs = on ? "#1e3a8a" : "#64748b";
  return (
    <g transform={`translate(${cx},${cy}) scale(${s})`}>
      <ellipse cx={0} cy={15} rx={8.5} ry={2.2} fill="#00000012" />
      {/* ขา */}
      <rect x={-5} y={7} width={4} height={8} rx={1.8} fill={legs} />
      <rect x={1} y={7} width={4} height={8} rx={1.8} fill={legs} />
      <rect x={-5.5} y={14} width={5} height={2.6} rx={1.2} fill="#334155" />
      <rect x={0.5} y={14} width={5} height={2.6} rx={1.2} fill="#334155" />
      {/* แขน */}
      <rect x={-9} y={-2} width={3.4} height={8.5} rx={1.7} fill={shirt} stroke={shirtDark} strokeWidth={0.7} />
      <rect x={5.6} y={-2} width={3.4} height={8.5} rx={1.7} fill={shirt} stroke={shirtDark} strokeWidth={0.7} />
      <circle cx={-7.3} cy={6.5} r={1.8} fill="#f8cfa8" />
      <circle cx={7.3} cy={6.5} r={1.8} fill="#f8cfa8" />
      {/* ลำตัว/เสื้อ */}
      <path d="M-7,-3 Q-7,-4 -6,-4 L6,-4 Q7,-4 7,-3 L7.5,6 Q7.5,8 5.5,8 L-5.5,8 Q-7.5,8 -7.5,6 Z" fill={shirt} stroke={shirtDark} strokeWidth={0.9} />
      <path d="M0,-4 L-2,-1 L0,1 L2,-1 Z" fill="#fff" opacity={0.5} />
      {/* หัว */}
      <circle cx={0} cy={-10} r={6.2} fill="#f8cfa8" stroke="#00000016" strokeWidth={0.7} />
      {/* ผม */}
      <path d="M-6.2,-11 Q-6.5,-17.5 0,-17.5 Q6.5,-17.5 6.2,-11 Q6.2,-13.5 3.5,-14.2 Q1.8,-12.6 0,-13 Q-1.8,-12.6 -3.5,-14.2 Q-6.2,-13.5 -6.2,-11 Z" fill={hair} />
      {/* หน้าตา */}
      <circle cx={-2.3} cy={-10} r={1} fill="#1e293b" />
      <circle cx={2.3} cy={-10} r={1} fill="#1e293b" />
      <path d="M-2,-7 Q0,-5.4 2,-7" stroke="#1e293b" strokeWidth={0.9} fill="none" strokeLinecap="round" />
      <circle cx={-3.8} cy={-8} r={1.2} fill="#fb7185" opacity={0.45} />
      <circle cx={3.8} cy={-8} r={1.2} fill="#fb7185" opacity={0.45} />
    </g>
  );
}

/* จัดวางโทเคนในพื้นที่ (ปรับคอลัมน์/ขนาดอัตโนมัติตามจำนวน) */
function layoutTokens(count: number, areaW: number, areaH: number, cxCenter: number, topY: number) {
  const maxColsByW = Math.max(2, Math.floor(areaW / 20));
  const cols = Math.min(maxColsByW, Math.max(2, Math.ceil(Math.sqrt(count))));
  const rows = Math.ceil(count / cols);
  const cellW = areaW / cols;
  const cellH = Math.min(cellW * 1.15, areaH / rows);
  const s = Math.max(0.5, Math.min(1, Math.min(cellW, cellH * 0.9) / 24));
  return Array.from({ length: count }, (_, k) => {
    const row = Math.floor(k / cols);
    const col = k % cols;
    const rowCount = Math.min(cols, count - row * cols);
    return { x: cxCenter + (col - (rowCount - 1) / 2) * cellW, y: topY + cellH / 2 + row * cellH, s };
  });
}

/* ── แถบบาร์โมเดล + โทเคนใต้กอง ── */

function BarModel({ ctx, tokens, b, perGroup, perValue, split, selected, onToggle, accent }: {
  ctx: CtxKey; tokens: number; b: number; perGroup: number; perValue: number; split: boolean;
  selected: number[]; onToggle?: (g: number) => void; accent: string;
}) {
  const W = 560, PAD = 20, barY = 20, barH = 52, tokTop = barY + barH + 10, tokH = 152;
  const innerW = W - PAD * 2;
  const segW = innerW / b;
  const unitWord = CONTEXTS[ctx].unitWord;
  const renderToken = (key: number, x: number, y: number, s: number, on: boolean) =>
    ctx === "money"
      ? <Coin key={key} cx={x} cy={y} s={s} on={on} />
      : <KidToken key={key} cx={x} cy={y} s={s} on={on} hair={KID_HAIRS[key % KID_HAIRS.length]} />;

  return (
    <svg viewBox={`0 0 ${W} 250`} className="w-full" role="img" aria-label="แถบแสดงจำนวน">
      <defs>
        <radialGradient id="mn-gold" cx="0.4" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#fef3c7" /><stop offset="0.55" stopColor="#fcd34d" /><stop offset="1" stopColor="#d99a1c" />
        </radialGradient>
        <radialGradient id="mn-gold-on" cx="0.4" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#fffbeb" /><stop offset="0.5" stopColor="#fbbf24" /><stop offset="1" stopColor="#b45309" />
        </radialGradient>
      </defs>
      <style>{`
        @keyframes mnPop { 0% { transform: scale(0.4); opacity: 0; } 70% { transform: scale(1.08); } 100% { transform: scale(1); opacity: 1; } }
        .mn-pop { animation: mnPop 0.32s ease-out both; }
      `}</style>

      {!split ? (
        <>
          {/* แถบทั้งก้อน */}
          <rect x={PAD} y={barY} width={innerW} height={barH} rx={10} fill="#fef9c3" stroke="#eab308" strokeWidth={2.5} />
          <text x={W / 2} y={barY + barH / 2 + 7} fontSize={22} fontWeight={900} fill="#a16207" textAnchor="middle">
            {ctx === "money" ? `${tokens * 10} บาท` : `${tokens} คน`}
          </text>
          {/* โทเคนกองรวม */}
          {layoutTokens(tokens, innerW - 20, tokH - 16, W / 2, tokTop).map((p, i) => renderToken(i, p.x, p.y, p.s, false))}
          <text x={W / 2} y={244} fontSize={13} fontWeight={800} fill="#94a3b8" textAnchor="middle">ยังไม่แบ่ง — กด “แบ่งเป็น {b} กอง” ก่อน</text>
        </>
      ) : (
        <>
          {Array.from({ length: b }, (_, g) => {
            const x = PAD + g * segW;
            const on = selected.includes(g);
            const cxCenter = x + segW / 2;
            const positions = layoutTokens(perGroup, segW - 8, tokH, cxCenter, tokTop);
            return (
              <g key={g} className="mn-pop" style={{ cursor: onToggle ? "pointer" : "default" }} onClick={() => onToggle?.(g)}>
                {/* ช่องบาร์ */}
                <rect x={x + 2} y={barY} width={segW - 4} height={barH} rx={8} fill={on ? accent : "#fef9c3"} stroke={on ? accent : "#eab308"} strokeWidth={on ? 3 : 2} opacity={on ? 1 : 0.95} />
                <text x={cxCenter} y={barY + barH / 2 + 6} fontSize={segW < 100 ? 14 : 17} fontWeight={900} fill={on ? "#fff" : "#a16207"} textAnchor="middle">
                  {perValue} {unitWord}
                </text>
                {on && <text x={x + segW - 13} y={barY + 15} fontSize={13} textAnchor="middle">✓</text>}
                {/* พื้นหลังโซนโทเคนกอง (ให้เห็นขอบกอง) */}
                <rect x={x + 3} y={tokTop - 4} width={segW - 6} height={tokH + 8} rx={8} fill={on ? accent : "#fde68a"} opacity={on ? 0.1 : 0.14} />
                {/* โทเคนใต้กอง */}
                {positions.map((p, k) => renderToken(k, p.x, p.y, p.s, on))}
                {/* ป้ายกอง */}
                <text x={cxCenter} y={244} fontSize={12} fontWeight={800} fill={on ? "#0f766e" : "#94a3b8"} textAnchor="middle">กองที่ {g + 1}</text>
              </g>
            );
          })}
        </>
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

export function MultiplyMoneyGame() {
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
  const [context, setContext] = useState<CtxKey>("money");
  const [total, setTotal] = useState(60);   // N (บาท หรือ คน)
  const [den, setDen] = useState(3);        // b กอง
  const [num, setNum] = useState(2);        // a กองที่เอา
  const [reveal, setReveal] = useState(false);

  /* ตัวละคร + ชื่อ */
  const [ownerIdx, setOwnerIdx] = useState(0);
  const [ownerNames, setOwnerNames] = useState<string[]>(() => OWNERS.map((o) => o.name));
  const [showNames, setShowNames] = useState(false);

  /* สถานะการเล่น */
  const [split, setSplit] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const timeoutsRef = useRef<number[]>([]);
  const clearTimers = () => { timeoutsRef.current.forEach((t) => window.clearTimeout(t)); timeoutsRef.current = []; };
  useEffect(() => () => clearTimers(), []);

  /* ภารกิจ */
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [guess, setGuess] = useState(0);
  const [firstTry, setFirstTry] = useState(true);
  const [proving, setProving] = useState(false);
  const [checked, setChecked] = useState<null | boolean>(null);
  const [gameOver, setGameOver] = useState(false);

  const cfg = CONTEXTS[context];
  const stepN = cfg.unit;                                   // เงิน +10 / นักเรียน +1
  const minN = context === "money" ? 20 : 4;
  const maxN = context === "money" ? 300 : 40;
  const tokens = total / cfg.unit;         // จำนวนโทเคน
  const perGroupTokens = tokens / den;     // โทเคนต่อกอง
  const perValue = total / den;            // ค่าต่อกอง (บาท/คน)
  const answer = (total / den) * num;      // คำตอบ
  const accent = context === "money" ? "#059669" : "#2563eb";
  const owner = { ...OWNERS[ownerIdx], name: ownerNames[ownerIdx] };
  const validBs = divisorsOf(tokens);
  const done = split && selected.length === num;
  const showAnswer = done || (mode === "lab" && reveal);

  function resetPlay() { clearTimers(); setSplit(false); setSelected([]); }
  function setupProblem(nCtx: CtxKey, nTotal: number, nDen: number, nNum: number) {
    setContext(nCtx); setTotal(nTotal); setDen(nDen); setNum(nNum);
    resetPlay(); setGuess(0); setFirstTry(true); setChecked(null); setProving(false); setReveal(false);
  }

  /* เปลี่ยนบริบท → ตั้งค่าเริ่มที่ถูกต้อง */
  function switchContext(c: CtxKey) {
    const nTotal = c === "money" ? 60 : 12;
    setupProblem(c, nTotal, 3, 2);
  }
  /* เปลี่ยน N → ปรับ b ให้หารลงตัว */
  function changeTotal(nTotal: number) {
    const tks = nTotal / cfg.unit;
    const bs = divisorsOf(tks);
    const nDen = bs.includes(den) ? den : (bs[0] ?? 2);
    setupProblem(context, nTotal, nDen, Math.min(num, nDen - 1) || 1);
  }
  function changeDen(nDen: number) { setupProblem(context, total, nDen, Math.min(num, nDen - 1) || 1); }
  /* เดินจำนวนไปทางที่กำหนด ข้ามค่าที่แบ่งกองไม่ลงตัว (เช่น 70 = 7 เหรียญ เป็นจำนวนเฉพาะ) */
  function stepTotal(dir: 1 | -1) {
    let n = total;
    do { n += dir * stepN; } while (n >= minN && n <= maxN && divisorsOf(n / cfg.unit).length === 0);
    if (n < minN || n > maxN || divisorsOf(n / cfg.unit).length === 0) return;
    changeTotal(n);
  }

  function doSplit() {
    if (split) return;
    ensure(); play("split");
    setSplit(true);
  }
  function toggleGroup(g: number) {
    if (proving) return;
    ensure();
    setSelected((sel) => {
      if (sel.includes(g)) { play("unpick"); return sel.filter((x) => x !== g); }
      play(context === "money" ? "coin" : "pick");
      return [...sel, g];
    });
  }
  function revealAnswer() {
    clearTimers();
    setSplit(true);
    setSelected(Array.from({ length: num }, (_, i) => i));
  }

  /* ภารกิจ: แบ่งพิสูจน์อัตโนมัติ */
  function proveMission() {
    if (proving) return;
    ensure();
    setProving(true);
    play("split"); setSplit(true); setSelected([]);
    for (let i = 0; i < num; i++) {
      timeoutsRef.current.push(window.setTimeout(() => {
        play(context === "money" ? "coin" : "pick");
        setSelected((sel) => [...sel, i]);
      }, 500 + i * 450));
    }
    timeoutsRef.current.push(window.setTimeout(() => {
      setProving(false);
      const ok = guess === answer;
      setChecked(ok);
      if (ok) { play("correct"); play("coin"); setScore((s) => s + (firstTry ? 25 : 12)); setCoins((c) => c + den); }
      else play("wrong");
    }, 500 + num * 450 + 300));
  }

  /* ภารกิจ flow */
  function randomProblem(): [CtxKey, number, number, number] {
    const c: CtxKey = Math.random() < 0.5 ? "money" : "students";
    const q = randInt(1, c === "money" ? 3 : 4);   // โทเคนต่อกอง
    const b = randInt(2, 5);                        // จำนวนกอง
    const tks = b * q;
    const nTotal = tks * CONTEXTS[c].unit;
    const a = randInt(1, b - 1);
    return [c, nTotal, b, a];
  }
  function startMissions() {
    ensure(); play("start");
    setScore(0); setCoins(0); setRound(1); setGameOver(false);
    setupProblem("money", 60, 3, 2);
    setMode("mission");
  }
  function nextMission() {
    if (round >= MISSIONS_TOTAL) { setGameOver(true); play("star"); return; }
    setRound((r) => r + 1);
    const [c, nTotal, b, a] = randomProblem();
    setupProblem(c, nTotal, b, a);
    setOwnerIdx((prev) => shuffle(OWNERS.map((_, i) => i).filter((i) => i !== prev))[0] ?? prev);
  }

  const stars = score >= 170 ? 3 : score >= 100 ? 2 : 1;

  /* ข้อความโจทย์ */
  const storyEl = context === "money" ? (
    <>
      <span className="text-emerald-600">{owner.name}</span> มีเงิน <span className="text-amber-600">{total} บาท</span> ใช้ซื้อขนมไป{" "}
      <span className="inline-flex translate-y-1.5"><StackedFraction numerator={num} denominator={den} className="text-lg" toneClassName="text-violet-600" /></span>{" "}
      ของเงินทั้งหมด <br className="sm:hidden" />ใช้ไปกี่บาท?
    </>
  ) : (
    <>
      ห้องของ<span className="text-blue-600">{owner.name}</span> มีนักเรียน <span className="text-amber-600">{total} คน</span> เป็นผู้ชาย{" "}
      <span className="inline-flex translate-y-1.5"><StackedFraction numerator={num} denominator={den} className="text-lg" toneClassName="text-violet-600" /></span>{" "}
      ของทั้งห้อง <br className="sm:hidden" />มีนักเรียนชายกี่คน?
    </>
  );

  return (
    <div className="relative overflow-hidden rounded-2xl p-3 sm:p-4">
      <div className={cn("absolute inset-0 bg-gradient-to-b", context === "money" ? "from-emerald-100 via-green-50 to-teal-50" : "from-sky-100 via-blue-50 to-indigo-50")} />
      <div className="pointer-events-none absolute inset-0 overflow-hidden text-2xl" aria-hidden>
        <span className="absolute left-4 top-4 opacity-40">{context === "money" ? "🪙" : "🎒"}</span>
        <span className="absolute right-8 top-7 opacity-40">{context === "money" ? "💵" : "📚"}</span>
        <span className="absolute bottom-8 right-6 opacity-30">{context === "money" ? "🐷" : "✏️"}</span>
      </div>

      <div className="relative space-y-3">
        {/* โหมด + ปิดเสียง */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex rounded-xl border-2 border-slate-200 bg-white p-1">
            <button onClick={() => { setMode("lab"); resetPlay(); }} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "lab" ? "bg-emerald-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <FlaskConical size={15} /> โหมดครู
            </button>
            <button onClick={startMissions} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "mission" ? "bg-teal-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <Target size={15} /> โหมดทายก่อนแบ่ง
            </button>
          </div>
          <button onClick={() => setMuted((m) => !m)} className="grid h-9 w-9 place-items-center rounded-xl border-2 border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50" title={muted ? "เปิดเสียง" : "ปิดเสียง"}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {mode === "mission" && gameOver ? (
          <div className="space-y-4 rounded-2xl border-2 border-teal-300 bg-white/90 p-6 text-center">
            <div className="text-5xl">💰🏆</div>
            <h3 className="text-xl font-extrabold text-slate-800 sm:text-2xl">จบภารกิจนักแบ่งเงิน!</h3>
            <p className="text-2xl">{"⭐".repeat(stars)}{"☆".repeat(3 - stars)}</p>
            <p className="text-base font-extrabold text-teal-700">🏅 คะแนน {score} · 🪙 เหรียญ {coins}</p>
            <button onClick={startMissions} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
              <Play size={18} /> เล่นอีกครั้ง
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* แถบตั้งค่า (ครู) / สถานะ (ภารกิจ) */}
            {mode === "lab" ? (
              <div className="space-y-2 rounded-2xl border-2 border-emerald-200 bg-white/90 px-3 py-2">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="text-sm font-extrabold text-emerald-700">🧑‍🏫 บริบท:</span>
                  <button onClick={() => switchContext("money")} className={cn("flex items-center gap-1 rounded-lg border-2 px-3 py-1 text-sm font-extrabold transition", context === "money" ? "border-emerald-500 bg-emerald-100 text-emerald-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>💰 เงิน</button>
                  <button onClick={() => switchContext("students")} className={cn("flex items-center gap-1 rounded-lg border-2 px-3 py-1 text-sm font-extrabold transition", context === "students" ? "border-blue-500 bg-blue-100 text-blue-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>🎒 นักเรียน</button>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
                  <span className="text-xs font-extrabold text-slate-500">{context === "money" ? "เงินทั้งหมด" : "นักเรียนทั้งห้อง"}:</span>
                  {/* กำหนดจำนวนเอง */}
                  <div className="flex items-center gap-1 rounded-lg border-2 border-emerald-200 bg-emerald-50 px-1.5 py-0.5">
                    <button onClick={() => stepTotal(-1)} disabled={total <= minN} className="grid h-7 w-7 place-items-center rounded-md bg-white text-lg font-extrabold text-slate-600 shadow-sm active:scale-95 disabled:opacity-40">−</button>
                    <span className="w-16 text-center text-lg font-extrabold text-emerald-700">{total} <span className="text-xs">{cfg.unitWord}</span></span>
                    <button onClick={() => stepTotal(1)} disabled={total >= maxN} className="grid h-7 w-7 place-items-center rounded-md bg-white text-lg font-extrabold text-slate-600 shadow-sm active:scale-95 disabled:opacity-40">+</button>
                  </div>
                  <span className="text-xs font-extrabold text-slate-400">หรือเลือกด่วน:</span>
                  {cfg.presets.map((n) => (
                    <button key={n} onClick={() => changeTotal(n)} className={cn("rounded-lg border-2 px-2 py-1 text-sm font-extrabold transition", total === n ? "border-emerald-500 bg-emerald-100 text-emerald-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>{n}</button>
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5">
                  <span className="text-xs font-extrabold text-slate-500">แบ่งเป็น (กอง = ตัวส่วน):</span>
                  {ALL_B.map((d) => (
                    <button key={d} onClick={() => validBs.includes(d) && changeDen(d)} disabled={!validBs.includes(d)} className={cn("h-7 w-7 rounded-lg border-2 text-sm font-extrabold transition", den === d ? "border-emerald-500 bg-emerald-100 text-emerald-700" : validBs.includes(d) ? "border-slate-200 bg-white text-slate-500 hover:bg-slate-50" : "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed")}>{d}</button>
                  ))}
                  <span className="mx-1 text-slate-300">|</span>
                  <NumPicker label="เอากี่กอง (ตัวเศษ)" value={num} min={1} max={den - 1} onChange={(v) => setupProblem(context, total, den, v)} color="text-violet-600" />
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 border-t border-slate-100 pt-1.5">
                  <button onClick={() => setReveal((v) => { const nv = !v; if (nv) revealAnswer(); else resetPlay(); return nv; })} className={cn("flex items-center gap-1 rounded-lg border-2 px-2 py-1 text-xs font-extrabold transition", reveal ? "border-violet-400 bg-violet-100 text-violet-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
                    {reveal ? <EyeOff size={13} /> : <Eye size={13} />} เฉลย
                  </button>
                  <button onClick={() => setShowNames((v) => !v)} className={cn("flex items-center gap-1 rounded-lg border-2 px-2 py-1 text-xs font-extrabold transition", showNames ? "border-sky-400 bg-sky-100 text-sky-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
                    <Pencil size={13} /> แก้ชื่อ
                  </button>
                  <span className="mx-1 text-slate-300">|</span>
                  <span className="text-xs font-extrabold text-slate-500">ตัวละคร:</span>
                  {OWNERS.map((o, i) => (
                    <button key={i} onClick={() => setOwnerIdx(i)} className={cn("rounded-lg border-2 p-0.5 transition", ownerIdx === i ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-white")}>
                      <PixelPerson p={o} mood="normal" size={28} />
                    </button>
                  ))}
                </div>
                {showNames && (
                  <div className="flex flex-wrap items-center justify-center gap-2 border-t border-slate-100 pt-1.5">
                    <span className="text-sm font-extrabold text-sky-700">✏️ ชื่อตัวละคร:</span>
                    {OWNERS.map((_, i) => (
                      <input key={i} value={ownerNames[i]} maxLength={12} onChange={(e) => setOwnerNames((ns) => { const nn = [...ns]; nn[i] = e.target.value; return nn; })} className="w-28 rounded-lg border-2 border-slate-200 bg-white px-2 py-1 text-sm font-extrabold text-slate-700 focus:border-sky-400 focus:outline-none" />
                    ))}
                    <button onClick={() => setOwnerNames(OWNERS.map((o) => o.name))} className="rounded-lg border-2 border-slate-200 bg-white px-2 py-1 text-sm font-extrabold text-slate-500 hover:bg-slate-50">คืนค่าเดิม</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 rounded-2xl bg-white/90 px-4 py-2 ring-1 ring-teal-200">
                <span className="text-base font-extrabold text-teal-700">🎯 ข้อ {round}/{MISSIONS_TOTAL}</span>
                <span className="text-base font-extrabold text-emerald-600">🏅 {score}</span>
                <span className="text-base font-extrabold text-yellow-600">🪙 {coins}</span>
              </div>
            )}

            {/* การ์ดโจทย์ปัญหา */}
            <div className={cn("rounded-2xl border-2 bg-white/95 px-4 py-3 text-center shadow-sm", context === "money" ? "border-emerald-200" : "border-blue-200")}>
              <p className="text-base font-extrabold leading-relaxed text-slate-700 sm:text-lg">{storyEl}</p>
            </div>

            {/* สมการใหญ่ */}
            <div className={cn("flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 bg-white/95 px-5 py-2.5 shadow-sm", context === "money" ? "border-emerald-200" : "border-blue-200")}>
              <StackedFraction numerator={num} denominator={den} className="text-3xl sm:text-4xl" toneClassName="text-violet-600" />
              <span className="text-2xl font-black text-slate-400">ของ</span>
              <span className="text-3xl font-black text-amber-600 sm:text-4xl">{total}</span>
              <span className="text-3xl font-black text-slate-400">=</span>
              {showAnswer ? (
                <span className={cn("text-4xl font-black sm:text-5xl", done ? (context === "money" ? "text-emerald-600" : "text-blue-600") : "text-violet-500")}>{answer} <span className="text-2xl">{cfg.unitWord}</span></span>
              ) : (
                <span className="grid h-12 w-12 place-items-center rounded-xl border-[3px] border-dashed border-emerald-300 text-2xl font-black text-emerald-400">?</span>
              )}
            </div>

            {/* ฉาก: ตัวละคร + บาร์โมเดล */}
            <div className={cn("rounded-2xl border-2 p-2", context === "money" ? "border-emerald-200 bg-gradient-to-b from-emerald-100/50 to-green-50/50" : "border-blue-200 bg-gradient-to-b from-sky-100/50 to-blue-50/50")}>
              <div className="flex items-center gap-1">
                <div className="flex shrink-0 flex-col items-center">
                  <PixelPerson p={owner} mood={done ? "happy" : "normal"} size={72} />
                  <span className={cn("mt-0.5 rounded-full px-2 py-0.5 text-[11px] font-extrabold text-white", context === "money" ? "bg-emerald-600" : "bg-blue-600")}>{owner.name}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <BarModel ctx={context} tokens={tokens} b={den} perGroup={perGroupTokens} perValue={perValue} split={split} selected={selected} onToggle={mode === "lab" && !proving ? toggleGroup : undefined} accent={accent} />
                </div>
              </div>
            </div>

            {/* คำอธิบายผล */}
            {done && (
              <p className="text-center text-sm font-extrabold text-slate-600">
                แบ่ง {total} {cfg.unitWord} เป็น <b className="text-emerald-600">{den} กองเท่า ๆ กัน</b> → กองละ <b>{perValue}</b> {cfg.unitWord} →
                เอา <b className="text-violet-600">{num} กอง</b> = {num}×{perValue} = <b className={context === "money" ? "text-emerald-600" : "text-blue-600"}>{answer} {cfg.unitWord}</b>
                {" "}<span className="text-rose-500">(ต้องหารด้วย {den} ก่อน แล้วค่อยคูณ {num})</span>
              </p>
            )}

            {/* โหมดทายก่อนแบ่ง */}
            {mode === "mission" && !split && checked === null && (
              <div className={cn("space-y-2 rounded-2xl border-2 bg-white/90 p-3", context === "money" ? "border-emerald-200" : "border-blue-200")}>
                <p className="text-center text-sm font-extrabold text-slate-600">🤔 ทายก่อน: {context === "money" ? "ใช้เงินไปกี่บาท?" : "มีนักเรียนชายกี่คน?"}</p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button onClick={() => setGuess((g) => Math.max(0, g - 1))} className="h-10 w-10 rounded-lg border-2 border-slate-200 bg-white text-xl font-extrabold text-slate-600 active:scale-95">−</button>
                  <div className={cn("flex items-center gap-1 rounded-xl border-2 bg-white px-2 py-1", context === "money" ? "border-emerald-300" : "border-blue-300")}>
                    <input
                      type="text" inputMode="numeric" pattern="[0-9]*"
                      value={guess === 0 ? "" : String(guess)}
                      placeholder="0"
                      onChange={(e) => { const v = parseInt(e.target.value.replace(/\D/g, ""), 10); setGuess(Number.isNaN(v) ? 0 : Math.min(total, v)); }}
                      onKeyDown={(e) => { if (e.key === "Enter") { setFirstTry(true); proveMission(); } }}
                      className={cn("w-20 bg-transparent text-center text-3xl font-extrabold outline-none", context === "money" ? "text-emerald-600" : "text-blue-600")}
                      aria-label="พิมพ์คำตอบ"
                    />
                    <span className="text-sm font-extrabold text-slate-400">{cfg.unitWord}</span>
                  </div>
                  <button onClick={() => setGuess((g) => Math.min(total, g + 1))} className="h-10 w-10 rounded-lg border-2 border-slate-200 bg-white text-xl font-extrabold text-slate-600 active:scale-95">+</button>
                  <button onClick={() => { setFirstTry(true); proveMission(); }} className="ml-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500 px-6 py-2.5 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                    <Scissors size={17} /> แบ่งพิสูจน์!
                  </button>
                </div>
                <p className="text-center text-xs font-bold text-slate-400">พิมพ์ตัวเลขในช่อง หรือกด +/− ก็ได้ · กด Enter เพื่อพิสูจน์</p>
              </div>
            )}

            {/* ผลทาย */}
            {mode === "mission" && checked !== null && (
              <div className={cn("rounded-2xl border-2 p-3 text-center", checked ? "border-emerald-300 bg-emerald-50" : "border-rose-300 bg-rose-50")}>
                <p className={cn("text-base font-extrabold", checked ? "text-emerald-700" : "text-rose-600")}>
                  {checked
                    ? `🎉 เก่งมาก! ${total} ÷ ${den} = ${perValue} → ×${num} = ${answer} ${cfg.unitWord}`
                    : `ทาย ${guess} ${cfg.unitWord} — จริง ๆ คือ ${answer} ${cfg.unitWord} · ${guess === total * num ? `ลืมหาร! ต้องแบ่ง ${den} กองก่อน` : guess === perValue ? `นั่นแค่ 1 กอง ต้องเอา ${num} กอง` : guess === total - answer ? "นั่นคือส่วนที่เหลือ" : `${total}÷${den}=${perValue} แล้ว×${num}`}`}
                </p>
                <button onClick={nextMission} className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500 px-6 py-2 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                  {round >= MISSIONS_TOTAL ? "🏁 ดูสรุปผล" : <>ข้อต่อไป <ArrowRight size={16} /></>}
                </button>
              </div>
            )}

            {/* ปุ่มควบคุม (โหมดครู) */}
            {mode === "lab" && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                {!split ? (
                  <button onClick={doSplit} className="inline-flex items-center gap-2 rounded-xl border-b-4 border-emerald-700 bg-gradient-to-b from-emerald-500 to-emerald-600 px-6 py-2.5 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.97] active:border-b-2">
                    <Scissors size={17} /> แบ่งเป็น {den} กองเท่า ๆ กัน
                  </button>
                ) : (
                  <>
                    <span className="rounded-full bg-white px-3 py-1 text-sm font-extrabold text-slate-600 shadow-sm ring-1 ring-emerald-200">
                      {done ? `✅ เลือก ${num} กองแล้ว!` : `คลิกเลือก ${num} กอง (เลือกแล้ว ${selected.length})`}
                    </span>
                    <button onClick={resetPlay} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-3 py-1.5 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50">
                      <RotateCcw size={14} /> เริ่มใหม่
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
