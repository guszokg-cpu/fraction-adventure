"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Volume2, VolumeX, FlaskConical, Target, ArrowRight, Pencil, Sprout } from "lucide-react";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { Frac, SvgFrac } from "@/components/lessons/Frac";
import { gcd } from "@/lib/fractionUtils";
import { cn } from "@/lib/cn";
import { randInt, shuffle } from "@/lib/randomFraction";

/* ── ค่าคงที่ ── */

const DEN_OPTIONS = [2, 3, 4, 5];
const MISSIONS_TOTAL = 8;
const SS = { shapeRendering: "crispEdges" as const };

/* ── เสียง ── */

type SoundKind = "plant" | "sow" | "correct" | "wrong" | "start" | "star" | "pop";

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
      case "plant": return tones([392, 523, 659], 0.06, 0.13, "triangle", 0.09);
      case "sow": return tones([523, 659, 784, 988], 0.05, 0.12, "sine", 0.08);
      case "pop": return tones([880], 0.04, 0.06, "sine", 0.05);
      case "correct": return tones([660, 990, 1319], 0.06, 0.1, "triangle", 0.14);
      case "wrong": return tones([220, 165], 0.11, 0.18, "sawtooth", 0.09);
      case "start": return tones([523, 659, 784], 0.07, 0.12, "triangle", 0.14);
      case "star": return tones([1047, 1319, 1568, 2093], 0.07, 0.14, "triangle", 0.14);
    }
  }
  return { play, ensure };
}

/* ── เพลงสวนชนบท (ชิปทูน ไม่ใช้ไฟล์) ── */

const GD_LEAD = [67, 0, 69, 71, 0, 72, 71, 69, 67, 0, 64, 0, 65, 67, 0, 0, 69, 0, 67, 65, 0, 64, 62, 0, 60, 64, 67, 0, 64, 0, 0, 0];
const GD_BASS = [48, 55, 48, 55, 53, 60, 53, 60, 41, 48, 41, 48, 43, 50, 43, 47];

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
      const m = GD_LEAD[s];
      if (m) note(m, 0.22, "triangle", 0.028);
      if (s % 2 === 0) {
        const b = GD_BASS[s / 2];
        if (b) note(b, 0.34, "sine", 0.05);
      }
    }, 205);
  }
  function stop() {
    if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
  }
  useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);
  return { start, stop };
}

/* ── ตัวละคร (คุณยาย/ชาวสวน) ── */

type PType = "grandma" | "grandpa" | "girl" | "boy";
type Person = { type: PType; name: string; skin: string; body: string; dark: string; hair: string };
const GARDENERS: Person[] = [
  { type: "grandma", name: "คุณยายมาลี", skin: "#e8c7a2", body: "#16a34a", dark: "#166534", hair: "#e5e5e5" },
  { type: "grandpa", name: "คุณตาบุญมี", skin: "#e0bd97", body: "#0891b2", dark: "#155e63", hair: "#f1f5f9" },
  { type: "girl", name: "น้องพลอย", skin: "#ffd9c9", body: "#ec4899", dark: "#9d2660", hair: "#3b2412" },
  { type: "boy", name: "น้องเจได", skin: "#f5cba3", body: "#f59e0b", dark: "#b45309", hair: "#1c1c1c" },
];

function PixelPerson({ p, mood, size = 84 }: { p: Person; mood: "normal" | "happy"; size?: number }) {
  return (
    <svg viewBox="0 0 40 58" width={size * 0.69} height={size} style={SS} role="img" aria-label={p.name}>
      {/* หมวกฟาง */}
      <path d="M6,14 Q6,9 20,9 Q34,9 34,14 L34,15 L6,15 Z" fill="#e0b968" stroke="#a67c34" strokeWidth={1.2} />
      <path d="M11,13 Q11,4 20,4 Q29,4 29,13 Z" fill="#eac886" stroke="#a67c34" strokeWidth={1.2} />
      <path d="M11,12 L29,12" stroke="#a67c34" strokeWidth={1} opacity={0.6} />
      {(p.type === "grandma" || p.type === "girl") && <><rect x={7} y={16} width={3.5} height={8} rx={1.7} fill={p.hair} /><rect x={29.5} y={16} width={3.5} height={8} rx={1.7} fill={p.hair} /></>}
      <rect x={11} y={13} width={18} height={16} rx={5} fill={p.skin} stroke="#00000022" strokeWidth={1} />
      <rect x={15} y={19} width={3} height={4} rx={1} fill="#1e293b" />
      <rect x={22} y={19} width={3} height={4} rx={1} fill="#1e293b" />
      {mood === "happy"
        ? <path d="M16,24 Q20,27 24,24" stroke="#1e293b" strokeWidth={1.5} fill="none" strokeLinecap="round" />
        : <path d="M16,24.5 Q20,26 24,24.5" stroke="#1e293b" strokeWidth={1.4} fill="none" strokeLinecap="round" />}
      <circle cx={14} cy={24} r={1.6} fill="#fb7185" opacity={0.5} />
      <circle cx={26} cy={24} r={1.6} fill="#fb7185" opacity={0.5} />
      <rect x={11} y={29} width={18} height={18} rx={3} fill={p.body} stroke="#00000022" strokeWidth={1.2} />
      <rect x={6} y={30} width={5} height={13} rx={2.5} fill={p.body} stroke="#00000022" strokeWidth={1} />
      <circle cx={8.5} cy={43} r={2.5} fill={p.skin} />
      <rect x={29} y={30} width={5} height={13} rx={2.5} fill={p.body} stroke="#00000022" strokeWidth={1} />
      <circle cx={31.5} cy={43} r={2.5} fill={p.skin} />
      <rect x={14} y={47} width={5.5} height={11} rx={2} fill={p.dark} />
      <rect x={20.5} y={47} width={5.5} height={11} rx={2} fill={p.dark} />
      <rect x={13} y={56} width={7} height={3.5} rx={1.5} fill="#4b2e17" />
      <rect x={20} y={56} width={7} height={3.5} rx={1.5} fill="#4b2e17" />
    </svg>
  );
}

/* ── ต้นผักในช่อง ── */

function CellArt({ x, y, w, h, kind }: { x: number; y: number; w: number; h: number; kind: "soil" | "veg" | "weed" }) {
  const cx = x + w / 2, cy = y + h / 2;
  const s = Math.min(w, h) / 40;
  if (kind === "soil") {
    return (
      <g opacity={0.6}>
        <line x1={x + 5} y1={cy - 3} x2={x + w - 5} y2={cy - 3} stroke="#7c4a24" strokeWidth={1} strokeDasharray="3 4" />
        <line x1={x + 5} y1={cy + 4} x2={x + w - 5} y2={cy + 4} stroke="#7c4a24" strokeWidth={1} strokeDasharray="3 4" />
      </g>
    );
  }
  if (kind === "veg") {
    // ผักกาดเขียว (กลุ่มใบ)
    return (
      <g transform={`translate(${cx},${cy + 3}) scale(${s})`}>
        <ellipse cx={0} cy={4} rx={9} ry={4} fill="#15803d" opacity={0.85} />
        <ellipse cx={-5} cy={-1} rx={5} ry={7} fill="#22c55e" />
        <ellipse cx={5} cy={-1} rx={5} ry={7} fill="#22c55e" />
        <ellipse cx={0} cy={-4} rx={5} ry={8} fill="#4ade80" />
        <path d="M0,-10 L0,3" stroke="#15803d" strokeWidth={1.3} />
      </g>
    );
  }
  // ผักบุ้ง (เถา + ดอกม่วง) — ช่องคำตอบ
  return (
    <g transform={`translate(${cx},${cy + 3}) scale(${s})`}>
      <path d="M-8,6 Q-4,-6 0,-2 Q4,-10 8,-3" fill="none" stroke="#047857" strokeWidth={2} strokeLinecap="round" />
      <ellipse cx={-6} cy={0} rx={3.5} ry={2.2} fill="#10b981" transform="rotate(-30 -6 0)" />
      <ellipse cx={2} cy={-4} rx={3.5} ry={2.2} fill="#34d399" transform="rotate(20 2 -4)" />
      <circle cx={7} cy={-6} r={3.6} fill="#a78bfa" />
      <circle cx={7} cy={-6} r={1.5} fill="#ede9fe" />
    </g>
  );
}

/* วางต้นผักแบบปูเต็มช่อง (รองรับช่องกว้าง/สูงในโหมดเศษส่วนเดี่ยว) */
function tileArt(cellX: number, cellY: number, cw: number, ch: number, kind: "veg" | "weed", key: string) {
  const ax = Math.max(1, Math.round(cw / 44));
  const ay = Math.max(1, Math.round(ch / 44));
  const sw = cw / ax, sh = ch / ay;
  const out = [];
  for (let j = 0; j < ay; j++)
    for (let i = 0; i < ax; i++)
      out.push(<CellArt key={`${key}-${i}-${j}`} x={cellX + i * sw} y={cellY + j * sh} w={sw} h={sh} kind={kind} />);
  return out;
}

/* ── แปลงผัก (โมเดลพื้นที่) ──
   display: "empty" ดินเปล่า · "a" = ปลูก plantNum/plantDen (คอลัมน์เดี่ยว) · "b" = ผักบุ้ง weedNum/weedDen (แถวเดี่ยว)
            "plant" = ตารางเต็ม ปลูกคอลัมน์ · "both" = ซ้อนทับ = คำตอบ */

type Display = "empty" | "a" | "b" | "plant" | "both";

function GardenPlot({ plantNum, plantDen, weedNum, weedDen, display }: {
  plantNum: number; plantDen: number; weedNum: number; weedDen: number; display: Display;
}) {
  const X = 20, Y = 54, W = 300, H = 208;
  const cols = display === "b" ? 1 : plantDen;
  const rows = display === "a" ? 1 : weedDen;
  const cw = W / cols, ch = H / rows;
  const showPlant = display === "a" || display === "plant" || display === "both";
  const showWeed = display === "b" || display === "both";
  const both = display === "both";

  const cellKind = (r: number, c: number): "soil" | "veg" | "weed" => {
    if (display === "empty") return "soil";
    if (display === "a") return c < plantNum ? "veg" : "soil";
    if (display === "b") return r < weedNum ? "weed" : "soil";
    if (display === "plant") return c < plantNum ? "veg" : "soil";
    // both
    if (c < plantNum) return r < weedNum ? "weed" : "veg";
    return "soil";
  };

  return (
    <svg viewBox="0 0 430 290" className="w-full" role="img" aria-label="แปลงผักคุณยาย">
      <style>{`
        @keyframes gdGrow { 0% { transform: scale(0); opacity: 0; } 70% { transform: scale(1.12); } 100% { transform: scale(1); opacity: 1; } }
        .gd-grow { transform-box: fill-box; transform-origin: center; animation: gdGrow 0.34s ease-out both; }
      `}</style>

      {/* ป้ายคอลัมน์ (ตัวตั้ง 🌱) */}
      {showPlant && <>
        <line x1={X} y1={44} x2={X + (display === "a" ? plantNum * cw : plantNum * (W / plantDen))} y2={44} stroke="#16a34a" strokeWidth={4} strokeLinecap="round" />
        <text x={X + (display === "a" ? plantNum * cw : plantNum * (W / plantDen)) / 2 - 14} y={38} fontSize={13} fontWeight={900} fill="#15803d" textAnchor="middle">🌱 ปลูก</text>
        <SvgFrac x={X + (display === "a" ? plantNum * cw : plantNum * (W / plantDen)) / 2 + 22} y={34} n={plantNum} d={plantDen} size={11} fill="#15803d" />
      </>}
      {/* ป้ายแถว (ตัวคูณ 🍃) */}
      {showWeed && <>
        <line x1={X + W + 8} y1={Y} x2={X + W + 8} y2={Y + weedNum * (H / weedDen)} stroke="#7c3aed" strokeWidth={4} strokeLinecap="round" />
        <g transform={`rotate(90 ${X + W + 14} ${Y + (weedNum * (H / weedDen)) / 2})`}>
          <text x={X + W + 14 - 20} y={Y + (weedNum * (H / weedDen)) / 2 - 4} fontSize={12} fontWeight={900} fill="#6d28d9" textAnchor="middle">🍃 ผักบุ้ง</text>
          <SvgFrac x={X + W + 14 + 26} y={Y + (weedNum * (H / weedDen)) / 2 - 8} n={weedNum} d={weedDen} size={10} fill="#6d28d9" />
        </g>
      </>}

      {/* ดินฐาน */}
      <rect x={X - 4} y={Y - 4} width={W + 8} height={H + 8} rx={8} fill="#8a5a2e" />
      <rect x={X} y={Y} width={W} height={H} fill="#a97142" />

      {/* ช่องตาราง */}
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => {
          const kind = cellKind(r, c);
          const cellX = X + c * cw, cellY = Y + r * ch;
          const fill = kind === "weed" ? "#065f46" : kind === "veg" ? "#3f6212" : "#a97142";
          return (
            <g key={`${r}-${c}`}>
              <rect x={cellX} y={cellY} width={cw} height={ch} fill={fill} stroke="#00000020" strokeWidth={0.6} style={{ transition: "fill 0.35s ease" }} />
              {kind === "soil"
                ? <CellArt x={cellX} y={cellY} w={cw} h={ch} kind="soil" />
                : <g className="gd-grow">{tileArt(cellX, cellY, cw, ch, kind, `${r}-${c}`)}</g>}
              {kind === "weed" && both && <rect x={cellX + 1} y={cellY + 1} width={cw - 2} height={ch - 2} fill="none" stroke="#a78bfa" strokeWidth={2} />}
            </g>
          );
        }),
      )}

      {/* เส้นแบ่งหนา */}
      {Array.from({ length: cols + 1 }, (_, c) => <line key={`v${c}`} x1={X + c * cw} y1={Y} x2={X + c * cw} y2={Y + H} stroke="#5b3a1e" strokeWidth={c === plantNum && cols === plantDen && showPlant ? 3 : 1.4} opacity={0.55} />)}
      {Array.from({ length: rows + 1 }, (_, r) => <line key={`h${r}`} x1={X} y1={Y + r * ch} x2={X + W} y2={Y + r * ch} stroke="#5b3a1e" strokeWidth={r === weedNum && rows === weedDen && showWeed ? 3 : 1.4} opacity={0.55} />)}

      {/* รั้วไม้บน */}
      <rect x={X - 4} y={Y - 9} width={W + 8} height={5} rx={2} fill="#b98a52" stroke="#7c5a30" strokeWidth={0.8} />
    </svg>
  );
}

/* ── ตัวเลือกเศษ ── */

function FracPicker({ label, num, den, setNum, setDen }: { label: string; num: number; den: number; setNum: (v: number) => void; setDen: (v: number) => void; }) {
  const btn = "h-7 w-7 rounded-lg border-2 border-slate-200 bg-white text-base font-extrabold text-slate-600 hover:bg-slate-50 active:scale-95 disabled:opacity-40";
  return (
    <div className="flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-2 py-1">
      <span className="text-xs font-extrabold text-slate-500">{label}</span>
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-1">
          <button onClick={() => setNum(Math.max(1, num - 1))} disabled={num <= 1} className={btn}>−</button>
          <span className="w-5 text-center text-lg font-extrabold text-emerald-600">{num}</span>
          <button onClick={() => setNum(Math.min(den - 1, num + 1))} disabled={num >= den - 1} className={btn}>+</button>
        </div>
        <span className="my-0.5 h-[2px] w-full rounded bg-slate-400" />
        <div className="flex items-center gap-1">
          {DEN_OPTIONS.map((d) => (
            <button key={d} onClick={() => setDen(d)} className={cn("h-6 w-6 rounded-md border text-sm font-extrabold transition", den === d ? "border-violet-500 bg-violet-100 text-violet-700" : "border-slate-200 bg-white text-slate-500")}>{d}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── เกมหลัก ── */

export function MultiplyGardenGame() {
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

  /* โจทย์: ปลูก plantNum/plantDen · ผักบุ้ง weedNum/weedDen ของที่ปลูก */
  const [plantNum, setPlantNum] = useState(3);
  const [plantDen, setPlantDen] = useState(4);
  const [weedNum, setWeedNum] = useState(2);
  const [weedDen, setWeedDen] = useState(3);
  /* มุมมองโหมดครู: แสดงเฉพาะตัวตั้ง / เฉพาะตัวคูณ / ซ้อนกัน */
  const [view, setView] = useState<"plant" | "weed" | "both">("both");

  /* ตัวละคร */
  const [ownerIdx, setOwnerIdx] = useState(0);
  const [ownerNames, setOwnerNames] = useState<string[]>(() => GARDENERS.map((o) => o.name));
  const [showNames, setShowNames] = useState(false);

  /* สถานะ */
  const [phase, setPhase] = useState<"empty" | "planted" | "done">("empty");
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

  const resNum = plantNum * weedNum;
  const resDen = plantDen * weedDen;
  const g = gcd(resNum, resDen);
  const rNum = resNum / g, rDen = resDen / g;
  const owner = { ...GARDENERS[ownerIdx], name: ownerNames[ownerIdx] };
  const done = mode === "lab" ? view === "both" : phase === "done";
  const showAnswer = done;
  /* แปลง view/phase → โหมดการแสดงผลของแปลง */
  const plotDisplay: Display = mode === "lab"
    ? (view === "plant" ? "a" : view === "weed" ? "b" : "both")
    : (phase === "empty" ? "empty" : phase === "planted" ? "plant" : "both");

  function resetPlot() { clearTimers(); setPhase("empty"); setProving(false); }
  function setupProblem(pN: number, pD: number, wN: number, wD: number) {
    setPlantNum(pN); setPlantDen(pD); setWeedNum(wN); setWeedDen(wD);
    resetPlot(); setGNum(0); setGDen(0); setFirstTry(true); setChecked(null); setView("both");
  }
  /* ปรับ den แล้วบีบ num ให้ < den */
  function setPlantDenSafe(d: number) { setupProblem(plantNum > d - 1 ? d - 1 : plantNum, d, weedNum, weedDen); }
  function setWeedDenSafe(d: number) { setupProblem(plantNum, plantDen, weedNum > d - 1 ? d - 1 : weedNum, d); }

  function pickView(v: "plant" | "weed" | "both") { ensure(); play(v === "weed" ? "sow" : "plant"); setView(v); }

  /* ภารกิจ: ปลูก+หว่านอัตโนมัติ แล้วเช็ก */
  function proveMission() {
    if (proving) return;
    ensure(); setProving(true);
    play("plant"); setPhase("planted");
    timeoutsRef.current.push(window.setTimeout(() => { play("sow"); setPhase("done"); }, 800));
    timeoutsRef.current.push(window.setTimeout(() => {
      setProving(false);
      const ok = gDen > 0 && gNum * resDen === resNum * gDen; // ยอมรับเศษส่วนที่เท่ากัน
      setChecked(ok);
      if (ok) { play("correct"); play("star"); setScore((s) => s + (firstTry ? 25 : 12)); }
      else play("wrong");
    }, 1500));
  }

  /* ภารกิจ flow */
  function randomProblem(): [number, number, number, number] {
    const pD = DEN_OPTIONS[randInt(0, DEN_OPTIONS.length - 1)];
    const wD = DEN_OPTIONS[randInt(0, DEN_OPTIONS.length - 1)];
    return [randInt(1, pD - 1), pD, randInt(1, wD - 1), wD];
  }
  function startMissions() {
    ensure(); play("start");
    setScore(0); setRound(1); setGameOver(false);
    setupProblem(3, 4, 2, 3);
    setMode("mission");
  }
  function nextMission() {
    if (round >= MISSIONS_TOTAL) { setGameOver(true); play("star"); return; }
    setRound((r) => r + 1);
    const [pN, pD, wN, wD] = randomProblem();
    setupProblem(pN, pD, wN, wD);
    setOwnerIdx((prev) => shuffle(GARDENERS.map((_, i) => i).filter((i) => i !== prev))[0] ?? prev);
  }

  const stars = score >= 170 ? 3 : score >= 100 ? 2 : 1;

  return (
    <div className="relative overflow-hidden rounded-2xl p-3 sm:p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-lime-100 via-green-50 to-emerald-50" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden text-2xl" aria-hidden>
        <span className="absolute left-4 top-4 opacity-40">🌻</span>
        <span className="absolute right-8 top-7 opacity-40">🦋</span>
        <span className="absolute bottom-8 right-6 opacity-30">🐝</span>
        <span className="absolute left-8 top-24 opacity-25">🌾</span>
      </div>

      <div className="relative space-y-3">
        {/* โหมด + ปิดเสียง */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex rounded-xl border-2 border-slate-200 bg-white p-1">
            <button onClick={() => { setMode("lab"); resetPlot(); }} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "lab" ? "bg-green-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <FlaskConical size={15} /> โหมดครู
            </button>
            <button onClick={startMissions} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "mission" ? "bg-emerald-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <Target size={15} /> โหมดทายก่อนปลูก
            </button>
          </div>
          <button onClick={() => setMuted((m) => !m)} className="grid h-9 w-9 place-items-center rounded-xl border-2 border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50" title={muted ? "เปิดเสียง" : "ปิดเสียง"}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {mode === "mission" && gameOver ? (
          <div className="space-y-4 rounded-2xl border-2 border-emerald-300 bg-white/90 p-6 text-center">
            <div className="text-5xl">🥬🏆</div>
            <h3 className="text-xl font-extrabold text-slate-800 sm:text-2xl">เก็บเกี่ยวครบทุกแปลง!</h3>
            <p className="text-2xl">{"⭐".repeat(stars)}{"☆".repeat(3 - stars)}</p>
            <p className="text-base font-extrabold text-emerald-700">🏅 คะแนนรวม {score}</p>
            <button onClick={startMissions} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
              <Play size={18} /> เล่นอีกครั้ง
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* แถบตั้งค่า (ครู) / สถานะ (ภารกิจ) */}
            {mode === "lab" ? (
              <div className="space-y-2 rounded-2xl border-2 border-green-200 bg-white/90 px-3 py-2">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="text-sm font-extrabold text-green-700">🧑‍🏫 ตั้งโจทย์:</span>
                  <FracPicker label="🌱 ปลูก" num={plantNum} den={plantDen} setNum={(v) => setupProblem(v, plantDen, weedNum, weedDen)} setDen={setPlantDenSafe} />
                  <span className="text-xl font-black text-slate-400">×</span>
                  <FracPicker label="🍃 ผักบุ้ง" num={weedNum} den={weedDen} setNum={(v) => setupProblem(plantNum, plantDen, v, weedDen)} setDen={setWeedDenSafe} />
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button onClick={() => setShowNames((v) => !v)} className={cn("flex items-center gap-1 rounded-lg border-2 px-2 py-1 text-xs font-extrabold transition", showNames ? "border-sky-400 bg-sky-100 text-sky-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
                    <Pencil size={13} /> แก้ชื่อ
                  </button>
                  <span className="mx-1 text-slate-300">|</span>
                  <span className="text-xs font-extrabold text-slate-500">ชาวสวน:</span>
                  {GARDENERS.map((o, i) => (
                    <button key={i} onClick={() => setOwnerIdx(i)} className={cn("rounded-lg border-2 p-0.5 transition", ownerIdx === i ? "border-green-400 bg-green-50" : "border-slate-200 bg-white")}>
                      <PixelPerson p={o} mood="normal" size={28} />
                    </button>
                  ))}
                </div>
                {showNames && (
                  <div className="flex flex-wrap items-center justify-center gap-2 border-t border-slate-100 pt-1.5">
                    <span className="text-sm font-extrabold text-sky-700">✏️ ชื่อชาวสวน:</span>
                    {GARDENERS.map((_, i) => (
                      <input key={i} value={ownerNames[i]} maxLength={12} onChange={(e) => setOwnerNames((ns) => { const nn = [...ns]; nn[i] = e.target.value; return nn; })} className="w-28 rounded-lg border-2 border-slate-200 bg-white px-2 py-1 text-sm font-extrabold text-slate-700 focus:border-sky-400 focus:outline-none" />
                    ))}
                    <button onClick={() => setOwnerNames(GARDENERS.map((o) => o.name))} className="rounded-lg border-2 border-slate-200 bg-white px-2 py-1 text-sm font-extrabold text-slate-500 hover:bg-slate-50">คืนค่าเดิม</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 rounded-2xl bg-white/90 px-4 py-2 ring-1 ring-emerald-200">
                <span className="text-base font-extrabold text-emerald-700">🎯 ข้อ {round}/{MISSIONS_TOTAL}</span>
                <span className="text-base font-extrabold text-green-600">🏅 {score}</span>
                <span className="text-xs font-extrabold text-slate-500">ทายก่อน แล้วปลูกพิสูจน์!</span>
              </div>
            )}

            {/* การ์ดโจทย์ */}
            <div className="rounded-2xl border-2 border-green-200 bg-white/95 px-4 py-3 text-center shadow-sm">
              <p className="text-base font-extrabold leading-relaxed text-slate-700 sm:text-lg">
                <span className="text-green-700">{owner.name}</span> ปลูกผักไป{" "}
                <span className="inline-flex translate-y-1.5"><StackedFraction numerator={plantNum} denominator={plantDen} className="text-lg" toneClassName="text-green-600" /></span>{" "}
                ของแปลง ในส่วนที่ปลูกมีผักบุ้งอยู่{" "}
                <span className="inline-flex translate-y-1.5"><StackedFraction numerator={weedNum} denominator={weedDen} className="text-lg" toneClassName="text-violet-600" /></span>{" "}
                <br className="sm:hidden" />ผักบุ้งคิดเป็นเท่าไรของแปลงทั้งหมด?
              </p>
            </div>

            {/* สมการใหญ่ */}
            <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-green-200 bg-white/95 px-5 py-2.5 shadow-sm">
              <StackedFraction numerator={weedNum} denominator={weedDen} className="text-3xl sm:text-4xl" toneClassName="text-violet-600" />
              <span className="text-3xl font-black text-slate-400">×</span>
              <StackedFraction numerator={plantNum} denominator={plantDen} className="text-3xl sm:text-4xl" toneClassName="text-green-600" />
              <span className="text-3xl font-black text-slate-400">=</span>
              {showAnswer ? (
                <span className="flex items-center gap-2">
                  <StackedFraction numerator={resNum} denominator={resDen} className="text-3xl sm:text-4xl" toneClassName={done ? "text-emerald-600" : "text-violet-500"} />
                  {g > 1 && <><span className="text-2xl font-black text-slate-400">=</span><StackedFraction numerator={rNum} denominator={rDen} className="text-3xl sm:text-4xl" toneClassName="text-emerald-700" /></>}
                </span>
              ) : (
                <span className="grid h-12 w-12 place-items-center rounded-xl border-[3px] border-dashed border-green-300 text-2xl font-black text-green-400">?</span>
              )}
            </div>

            {/* ฉาก: ชาวสวน + แปลง */}
            <div className="rounded-2xl border-2 border-green-200 bg-gradient-to-b from-lime-100/60 to-green-50/60 p-2">
              <div className="flex items-center gap-1">
                <div className="flex shrink-0 flex-col items-center">
                  <PixelPerson p={owner} mood={done ? "happy" : "normal"} size={76} />
                  <span className="mt-0.5 rounded-full bg-green-600 px-2 py-0.5 text-[11px] font-extrabold text-white">{owner.name}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <GardenPlot plantNum={plantNum} plantDen={plantDen} weedNum={weedNum} weedDen={weedDen} display={plotDisplay} />
                </div>
              </div>
            </div>

            {/* คำอธิบายผล */}
            {done && (
              <p className="text-center text-sm font-extrabold text-slate-600">
                แปลงถูกแบ่งเป็น <b className="text-green-700">{plantDen}</b> คอลัมน์ × <b className="text-violet-700">{weedDen}</b> แถว = <b>{resDen} ช่อง</b> ·
                ผักบุ้งอยู่ <b className="text-emerald-600">{plantNum}×{weedNum} = {resNum} ช่อง</b> →
                เป็น <Frac n={resNum} d={resDen} tone="text-emerald-600" />{g > 1 && <> = <Frac n={rNum} d={rDen} tone="text-emerald-700" /></>} ของแปลง
                {" "}<span className="text-rose-500">— เศษ×เศษ, ส่วน×ส่วน (ยิ่งแบ่งซ้อน ช่องยิ่งเล็กลง ส่วนจึงคูณกัน)</span>
              </p>
            )}

            {/* โหมดทายก่อนปลูก */}
            {mode === "mission" && phase === "empty" && checked === null && (
              <div className="space-y-2 rounded-2xl border-2 border-emerald-200 bg-white/90 p-3">
                <p className="text-center text-sm font-extrabold text-slate-600">🤔 ทายก่อน: ผักบุ้งเป็นเศษส่วนเท่าไรของแปลง? (พิมพ์ได้)</p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="inline-flex flex-col items-center rounded-xl border-2 border-emerald-300 bg-white px-3 py-1">
                    <input type="text" inputMode="numeric" value={gNum === 0 ? "" : String(gNum)} placeholder="?" onChange={(e) => { const v = parseInt(e.target.value.replace(/\D/g, ""), 10); setGNum(Number.isNaN(v) ? 0 : Math.min(99, v)); }} className="w-14 bg-transparent text-center text-2xl font-extrabold text-emerald-600 outline-none" aria-label="เศษคำตอบ" />
                    <span className="h-[3px] w-10 rounded bg-slate-400" />
                    <input type="text" inputMode="numeric" value={gDen === 0 ? "" : String(gDen)} placeholder="?" onChange={(e) => { const v = parseInt(e.target.value.replace(/\D/g, ""), 10); setGDen(Number.isNaN(v) ? 0 : Math.min(99, v)); }} onKeyDown={(e) => { if (e.key === "Enter") { setFirstTry(true); proveMission(); } }} className="w-14 bg-transparent text-center text-2xl font-extrabold text-slate-500 outline-none" aria-label="ส่วนคำตอบ" />
                  </span>
                  <span className="text-sm font-extrabold text-slate-400">ของแปลง</span>
                  <button onClick={() => { setFirstTry(true); proveMission(); }} className="ml-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 px-6 py-2.5 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                    <Sprout size={17} /> ปลูกพิสูจน์!
                  </button>
                </div>
                <p className="text-center text-xs font-bold text-slate-400">💡 ตัวส่วน = จำนวนช่องทั้งหมดเมื่อแบ่งทั้งแนวตั้งและแนวนอน</p>
              </div>
            )}

            {/* ผลทาย */}
            {mode === "mission" && checked !== null && (
              <div className={cn("rounded-2xl border-2 p-3 text-center", checked ? "border-emerald-300 bg-emerald-50" : "border-rose-300 bg-rose-50")}>
                <p className={cn("text-base font-extrabold", checked ? "text-emerald-700" : "text-rose-600")}>
                  {checked
                    ? <>🎉 ถูกต้อง! <Frac n={weedNum} d={weedDen} /> × <Frac n={plantNum} d={plantDen} /> = <Frac n={resNum} d={resDen} />{g > 1 && <> = <Frac n={rNum} d={rDen} /></>}</>
                    : <>ทาย <Frac n={gNum} d={gDen || "?"} /> — จริง ๆ คือ <Frac n={resNum} d={resDen} />{g > 1 && <> (= <Frac n={rNum} d={rDen} />)</>} · เศษ {weedNum}×{plantNum}={resNum}, ส่วน {weedDen}×{plantDen}={resDen}</>}
                </p>
                <button onClick={nextMission} className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 px-6 py-2 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                  {round >= MISSIONS_TOTAL ? "🏁 ดูสรุปผล" : <>แปลงต่อไป <ArrowRight size={16} /></>}
                </button>
              </div>
            )}

            {/* เลือกมุมมองการแสดงแปลง (โหมดครู) */}
            {mode === "lab" && (
              <div className="space-y-1.5">
                <p className="text-center text-xs font-extrabold text-slate-500">เลือกแสดงแปลงผัก:</p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button onClick={() => pickView("weed")} className={cn("inline-flex items-center gap-1.5 rounded-xl border-2 px-4 py-2 text-sm font-extrabold transition active:scale-95", view === "weed" ? "border-violet-500 bg-violet-100 text-violet-700 shadow" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
                    🍃 เฉพาะ <Frac n={weedNum} d={weedDen} />
                  </button>
                  <button onClick={() => pickView("plant")} className={cn("inline-flex items-center gap-1.5 rounded-xl border-2 px-4 py-2 text-sm font-extrabold transition active:scale-95", view === "plant" ? "border-green-500 bg-green-100 text-green-700 shadow" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
                    🌱 เฉพาะ <Frac n={plantNum} d={plantDen} />
                  </button>
                  <button onClick={() => pickView("both")} className={cn("inline-flex items-center gap-1.5 rounded-xl border-2 px-4 py-2 text-sm font-extrabold transition active:scale-95", view === "both" ? "border-emerald-600 bg-emerald-600 text-white shadow" : "border-emerald-300 bg-white text-emerald-600 hover:bg-emerald-50")}>
                    🥬 ซ้อนกัน = คำตอบ
                  </button>
                </div>
                {view !== "both" && (
                  <p className="text-center text-xs font-bold text-slate-500">
                    {view === "weed"
                      ? <>นี่คือ <Frac n={weedNum} d={weedDen} tone="text-violet-600" /> — แบ่งแปลงเป็น {weedDen} แถวแนวนอน แล้วแรเงา {weedNum} แถว</>
                      : <>นี่คือ <Frac n={plantNum} d={plantDen} tone="text-green-600" /> — แบ่งแปลงเป็น {plantDen} คอลัมน์แนวตั้ง แล้วแรเงา {plantNum} คอลัมน์</>}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
