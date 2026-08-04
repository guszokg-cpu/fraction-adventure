"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Volume2, VolumeX, FlaskConical, Target, ArrowRight, Scissors, Undo2 } from "lucide-react";
import { Frac } from "@/components/lessons/Frac";
import { cn } from "@/lib/cn";
import { randInt } from "@/lib/randomFraction";

/* ─────────────────────────────────────────────
   พับกระดาษแบ่งเท่า ๆ กัน ✂️📄
   เลือกกระดาษ (จัตุรัส/ผืนผ้า) เลือกสี → กด "พับครึ่ง" พับจริงเห็นอนิเมชัน
   กางออกเห็น "รอยพับ" เป็นเส้นประ → ใช้กรรไกรตัดตามรอย ได้ส่วนเท่า ๆ กัน
   แตะเลือกชิ้นเพื่อระบายสี = ตัวเศษ / จำนวนชิ้นทั้งหมด = ตัวส่วน
   โหมดครู (สาธิตอิสระ) + โหมดสุ่มถามตอบ (8 ข้อ ทำตามโจทย์)
   ───────────────────────────────────────────── */

const MISSIONS_TOTAL = 8;

type Axis = "v" | "h" | "d";
type Shape = "square" | "rect";
type SoundKind = "fold" | "cut" | "correct" | "wrong" | "start" | "star";

/* จุดตัดแบ่งสามเหลี่ยม (พับติดมุม) — step1: พับทแยง 1 ที = 2 สามเหลี่ยม
   step2: พับซ้ำครึ่งสามเหลี่ยมเดิม = 4 สามเหลี่ยม (บน/ขวา/ล่าง/ซ้าย) */
function diagPolys(step: 1 | 2, w: number, h: number) {
  if (step === 1) {
    return [
      { pts: `0,0 ${w},0 ${w},${h}`, cx: (2 * w) / 3, cy: h / 3 },   // A: บนขวา
      { pts: `0,0 0,${h} ${w},${h}`, cx: w / 3, cy: (2 * h) / 3 },   // B: ล่างซ้าย
    ];
  }
  const cx0 = w / 2, cy0 = h / 2;
  return [
    { pts: `0,0 ${w},0 ${cx0},${cy0}`, cx: w / 2, cy: h / 6 },              // บน
    { pts: `${w},0 ${w},${h} ${cx0},${cy0}`, cx: (5 * w) / 6, cy: h / 2 },   // ขวา
    { pts: `${w},${h} 0,${h} ${cx0},${cy0}`, cx: w / 2, cy: (5 * h) / 6 },   // ล่าง
    { pts: `0,${h} 0,0 ${cx0},${cy0}`, cx: w / 6, cy: h / 2 },              // ซ้าย
  ];
}

const COLORS = [
  { name: "ชมพู", fill: "#f9a8d4", deep: "#ec4899" },
  { name: "เหลือง", fill: "#fde047", deep: "#eab308" },
  { name: "ฟ้า", fill: "#93c5fd", deep: "#3b82f6" },
  { name: "เขียว", fill: "#86efac", deep: "#22c55e" },
  { name: "ส้ม", fill: "#fdba74", deep: "#f97316" },
  { name: "ม่วง", fill: "#d8b4fe", deep: "#a855f7" },
];

const BASE: Record<Shape, { w: number; h: number; label: string; emoji: string }> = {
  square: { w: 204, h: 204, label: "จัตุรัส", emoji: "🟧" },
  rect: { w: 296, h: 176, label: "ผืนผ้า", emoji: "🟦" },
};

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
      case "fold": return tones([520, 380, 300], 0.05, 0.12, "sine", 0.09);
      case "cut": return tones([1400, 900, 1400, 900], 0.055, 0.06, "square", 0.05);
      case "correct": return tones([660, 990, 1319], 0.06, 0.1, "triangle", 0.14);
      case "wrong": return tones([220, 165], 0.11, 0.18, "sawtooth", 0.09);
      case "start": return tones([523, 659, 784], 0.07, 0.12, "triangle", 0.14);
      case "star": return tones([1047, 1319, 1568, 2093], 0.07, 0.14, "triangle", 0.14);
    }
  }
  return { play, ensure };
}

export function IntroPaperFoldGame() {
  const [mode, setMode] = useState<"lab" | "quiz">("lab");
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  useEffect(() => { mutedRef.current = muted; }, [muted]);
  const ctxRef = useRef<AudioContext | null>(null);
  const { play, ensure } = useSound(mutedRef, ctxRef);

  /* ── กระดาษ ── */
  const [shape, setShape] = useState<Shape>("rect");
  const [colorIdx, setColorIdx] = useState(0);
  const [folds, setFolds] = useState<Axis[]>([]);        // ทบที่พับอยู่ตอนนี้ (เรียงลำดับ)
  const [maxV, setMaxV] = useState(0);                    // รอยพับแนวตั้งสูงสุดที่เคยพับ (ครั้ง)
  const [maxH, setMaxH] = useState(0);
  const [maxD, setMaxD] = useState(0);                    // รอยพับติดมุมสูงสุดที่เคยพับ (0-2)
  const [anim, setAnim] = useState<{ axis: Axis; dir: "in" | "out"; step?: 1 | 2 } | null>(null);
  const [cutting, setCutting] = useState(false);
  const [cut, setCut] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const timerRef = useRef<number | null>(null);
  useEffect(() => () => { if (timerRef.current) window.clearTimeout(timerRef.current); }, []);

  /* ── โหมดถามตอบ ── */
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [firstTry, setFirstTry] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [target, setTarget] = useState({ den: 4, num: 1 });
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: React.ReactNode } | null>(null);

  const color = COLORS[colorIdx];
  const base = BASE[shape];
  const vCount = folds.filter((f) => f === "v").length;
  const hCount = folds.filter((f) => f === "h").length;
  const dCount = folds.filter((f) => f === "d").length;
  const curW = base.w / Math.pow(2, vCount);
  const curH = base.h / Math.pow(2, hCount);
  const cols = Math.pow(2, maxV);
  const rows = Math.pow(2, maxH);
  const pieces = maxD > 0 ? (maxD === 1 ? 2 : 4) : cols * rows;
  const layers = Math.pow(2, folds.length);
  const isOpen = folds.length === 0;
  const hasCrease = maxV + maxH > 0 || maxD > 0;
  const busy = anim !== null || cutting;
  const gridLocked = maxD > 0;       // เคยพับติดมุมแล้ว ห้ามพับตาราง จนกว่าจะเปลี่ยนกระดาษใหม่
  const diagLocked = maxV + maxH > 0; // เคยพับตารางแล้ว ห้ามพับติดมุม

  function newPaper(ns: Shape = shape, nc: number = colorIdx) {
    // ยกเลิกตัวจับเวลาพับ/ตัดที่ค้างอยู่ก่อนเสมอ กันไม่ให้ setTimeout เก่ามาสั่งงานทับสถานะกระดาษใหม่ทีหลัง
    if (timerRef.current) { window.clearTimeout(timerRef.current); timerRef.current = null; }
    setAnim(null);
    setShape(ns); setColorIdx(nc);
    setFolds([]); setMaxV(0); setMaxH(0); setMaxD(0);
    setCut(false); setCutting(false);
    setSelected(new Set());
    setFeedback(null);
  }

  function doFold(axis: Axis) {
    if (busy || cut) return;
    if (axis === "d") {
      if (dCount >= 2 || diagLocked) return;
      ensure(); play("fold");
      const step = (dCount + 1) as 1 | 2;
      setAnim({ axis, dir: "in", step });
      timerRef.current = window.setTimeout(() => {
        setFolds((f) => [...f, axis]);
        setMaxD((m) => Math.max(m, dCount + 1));
        setAnim(null);
      }, 520);
      return;
    }
    const cnt = axis === "v" ? vCount : hCount;
    if (cnt >= 2 || gridLocked) return;
    ensure(); play("fold");
    setAnim({ axis, dir: "in" });
    timerRef.current = window.setTimeout(() => {
      setFolds((f) => [...f, axis]);
      if (axis === "v") setMaxV((m) => Math.max(m, vCount + 1));
      else setMaxH((m) => Math.max(m, hCount + 1));
      setAnim(null);
    }, 500);
  }

  function doUnfold() {
    if (busy || cut || folds.length === 0) return;
    ensure(); play("fold");
    const last = folds[folds.length - 1];
    const step = last === "d" ? (dCount as 1 | 2) : undefined;
    setFolds((f) => f.slice(0, -1));            // กางก่อน (กระดาษกว้างขึ้น) แล้วเล่นอนิเมชันปิดท้าย
    setAnim({ axis: last, dir: "out", step });
    timerRef.current = window.setTimeout(() => setAnim(null), 520);
  }

  function doCut() {
    if (busy || cut || !isOpen || !hasCrease) return;
    ensure(); play("cut");
    setCutting(true);
    timerRef.current = window.setTimeout(() => {
      setCutting(false);
      setCut(true);
    }, 750);
  }

  function togglePiece(i: number) {
    if (!cut) return;
    ensure();
    setSelected((prev) => {
      const nx = new Set(prev);
      if (nx.has(i)) nx.delete(i); else nx.add(i);
      return nx;
    });
    setFeedback(null);
  }

  /* ── ควบคุมโหมดถามตอบ ── */
  function randTarget() {
    const den = [2, 4, 8][randInt(0, 2)];
    return { den, num: randInt(1, den - 1) };
  }
  function startQuiz() {
    ensure(); play("start");
    setScore(0); setRound(1); setGameOver(false); setFirstTry(true);
    setTarget(randTarget());
    newPaper(["square", "rect"][randInt(0, 1)] as Shape, randInt(0, COLORS.length - 1));
    setMode("quiz");
  }
  function nextRound() {
    if (round >= MISSIONS_TOTAL) { setGameOver(true); play("star"); return; }
    setRound((r) => r + 1);
    setFirstTry(true);
    setTarget(randTarget());
    newPaper(["square", "rect"][randInt(0, 1)] as Shape, randInt(0, COLORS.length - 1));
  }
  function checkAnswer() {
    ensure();
    if (!cut) {
      play("wrong"); setFirstTry(false);
      setFeedback({ ok: false, msg: <>ยังไม่ได้ตัดกระดาษเลย — พับ ➜ กางออก ➜ ✂️ ตัดตามรอยพับก่อนนะ</> });
      return;
    }
    if (pieces !== target.den) {
      play("wrong"); setFirstTry(false);
      setFeedback({ ok: false, msg: <>ตอนนี้ตัดได้ <b>{pieces} ส่วน</b> แต่โจทย์ต้องการ <b>{target.den} ส่วน</b> — กด &ldquo;กระดาษใหม่&rdquo; แล้วลองพับใหม่</> });
      return;
    }
    if (selected.size !== target.num) {
      play("wrong"); setFirstTry(false);
      setFeedback({ ok: false, msg: <>แบ่งครบ {target.den} ส่วนแล้ว แต่เลือกไว้ <b>{selected.size} ส่วน</b> — โจทย์ให้เลือก <b>{target.num} ส่วน</b></> });
      return;
    }
    play("correct");
    setScore((s) => s + (firstTry ? 25 : 10));
    setFeedback({ ok: true, msg: <>เก่งมาก! เลือก {target.num} ส่วน จากทั้งหมด {target.den} ส่วนเท่า ๆ กัน = <Frac n={target.num} d={target.den} /> พอดี</> });
  }

  const stars = score >= 170 ? 3 : score >= 100 ? 2 : 1;
  const solvedQuiz = feedback?.ok === true;

  /* ตำแหน่งเส้นรอยพับ (แสดงตอนกางสุด) */
  const vLines = Array.from({ length: cols - 1 }, (_, i) => ((i + 1) / cols) * base.w);
  const hLines = Array.from({ length: rows - 1 }, (_, i) => ((i + 1) / rows) * base.h);

  /* เรขาคณิตพับติดมุม: step1 = พับทแยงหลัก (0,0)-(w,h) · step2 = พับซ้ำจากมุม (w,0) ผ่านศูนย์กลาง
     origin/ทิศพับ อ้างอิงกรอบเต็ม base.w × base.h เสมอ (ใช้ clip-path ตัดรูปแทนการย่อกล่อง) */
  const W = base.w, H = base.h;
  const DIAG_STEP: Record<1 | 2, { flapClip: string; restClip: string; origin: string; dx: number; dy: number }> = {
    1: {
      flapClip: `polygon(0px 0px, 0px ${H}px, ${W}px ${H}px)`,      // B: ล่างซ้าย (ตัวพับ)
      restClip: `polygon(0px 0px, ${W}px 0px, ${W}px ${H}px)`,      // A: บนขวา (ที่เหลือหลังพับ)
      origin: "50% 50%", dx: W, dy: H,
    },
    2: {
      flapClip: `polygon(0px 0px, ${W}px 0px, ${W / 2}px ${H / 2}px)`,        // บน (ตัวพับ)
      restClip: `polygon(${W}px 0px, ${W}px ${H}px, ${W / 2}px ${H / 2}px)`,  // ขวา (ที่เหลือหลังพับ)
      origin: "75% 25%", dx: -W, dy: H,
    },
  };
  const diagCutPieces = maxD > 0 ? diagPolys(maxD === 1 ? 1 : 2, W, H) : [];

  return (
    <div className="relative overflow-hidden rounded-2xl p-3 sm:p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-rose-50 via-amber-50 to-sky-50" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden text-2xl" aria-hidden>
        <span className="absolute left-4 top-4 opacity-40">📄</span>
        <span className="absolute right-8 top-6 opacity-40">✂️</span>
        <span className="absolute bottom-7 left-8 opacity-30">📐</span>
      </div>

      <style>{`
        @keyframes pfFoldInV { from { transform: perspective(760px) rotateY(0deg); } to { transform: perspective(760px) rotateY(-179deg); } }
        @keyframes pfFoldOutV { from { transform: perspective(760px) rotateY(-179deg); } to { transform: perspective(760px) rotateY(0deg); } }
        @keyframes pfFoldInH { from { transform: perspective(760px) rotateX(0deg); } to { transform: perspective(760px) rotateX(179deg); } }
        @keyframes pfFoldOutH { from { transform: perspective(760px) rotateX(179deg); } to { transform: perspective(760px) rotateX(0deg); } }
        @keyframes pfFoldInD { from { transform: perspective(900px) rotate3d(var(--dx), var(--dy), 0, 0deg); } to { transform: perspective(900px) rotate3d(var(--dx), var(--dy), 0, 179deg); } }
        @keyframes pfFoldOutD { from { transform: perspective(900px) rotate3d(var(--dx), var(--dy), 0, 179deg); } to { transform: perspective(900px) rotate3d(var(--dx), var(--dy), 0, 0deg); } }
        @keyframes pfScissor { 0% { top: -14%; opacity: 0; } 12% { opacity: 1; } 100% { top: 104%; opacity: 1; } }
        @keyframes pfScissorH { 0% { left: -12%; opacity: 0; } 12% { opacity: 1; } 100% { left: 104%; opacity: 1; } }
        @keyframes pfScissorD { 0% { top: -10%; left: -10%; opacity: 0; } 12% { opacity: 1; } 100% { top: 104%; left: 104%; opacity: 1; } }
        @keyframes pfPiecePop { 0% { transform: scale(1); } 55% { transform: scale(1.06); } 100% { transform: scale(1); } }
        @keyframes pfPiecePopTri { 0% { transform: scale(0.6); opacity: 0; } 60% { transform: scale(1.02); opacity: 1; } 100% { transform: scale(0.9); opacity: 1; } }
        .pf-svg-piece { transform-box: fill-box; transform-origin: center; }
      `}</style>

      <div className="relative space-y-3">
        {/* แถบโหมด + เสียง */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex rounded-xl border-2 border-slate-200 bg-white p-1">
            <button onClick={() => { setMode("lab"); newPaper(); }} disabled={busy} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition disabled:opacity-40", mode === "lab" ? "bg-rose-500 text-white shadow" : "text-slate-500 enabled:hover:bg-slate-50")}>
              <FlaskConical size={15} /> โหมดครู
            </button>
            <button onClick={startQuiz} disabled={busy} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition disabled:opacity-40", mode === "quiz" ? "bg-amber-500 text-white shadow" : "text-slate-500 enabled:hover:bg-slate-50")}>
              <Target size={15} /> โหมดสุ่มถามตอบ
            </button>
          </div>
          <button onClick={() => setMuted((m) => !m)} className="grid h-9 w-9 place-items-center rounded-xl border-2 border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50" title={muted ? "เปิดเสียง" : "ปิดเสียง"}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {mode === "quiz" && gameOver ? (
          <div className="space-y-4 rounded-2xl border-2 border-amber-300 bg-white/90 p-6 text-center">
            <div className="text-5xl">✂️🏆</div>
            <h3 className="text-xl font-extrabold text-slate-800 sm:text-2xl">จบภารกิจพับกระดาษ!</h3>
            <p className="text-2xl">{"⭐".repeat(stars)}{"☆".repeat(3 - stars)}</p>
            <p className="text-base font-extrabold text-amber-700">🏅 คะแนนรวม {score}</p>
            <button onClick={startQuiz} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
              <Play size={18} /> เล่นอีกครั้ง
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* แถบตั้งค่า (ครู) / โจทย์ (ถามตอบ) */}
            {mode === "lab" ? (
              <div className="space-y-2 rounded-2xl border-2 border-rose-200 bg-white/90 px-3 py-2">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="text-sm font-extrabold text-rose-600">🧑‍🏫 กระดาษ:</span>
                  {(Object.keys(BASE) as Shape[]).map((s) => (
                    <button key={s} onClick={() => newPaper(s)} disabled={busy} className={cn("inline-flex items-center gap-1 rounded-lg border-2 px-2.5 py-1 text-sm font-extrabold transition disabled:opacity-40", shape === s ? "border-rose-400 bg-rose-100 text-rose-600" : "border-slate-200 bg-white text-slate-500 enabled:hover:bg-slate-50")}>
                      {BASE[s].emoji} {BASE[s].label}
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-extrabold text-rose-600">สี:</span>
                  {COLORS.map((c, i) => (
                    <button key={i} onClick={() => newPaper(shape, i)} disabled={busy} title={c.name}
                      className={cn("h-7 w-7 rounded-lg border-2 transition disabled:opacity-40 enabled:active:scale-90", colorIdx === i ? "scale-110 border-slate-700 shadow" : "border-slate-200")}
                      style={{ background: c.fill }} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-1 rounded-2xl border-2 border-amber-200 bg-white/95 px-4 py-2.5 text-center">
                <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
                  <span className="text-base font-extrabold text-amber-600">🎯 ข้อ {round}/{MISSIONS_TOTAL}</span>
                  <span className="text-base font-extrabold text-rose-500">🏅 {score}</span>
                </div>
                <p className="text-base font-extrabold leading-relaxed text-slate-700">
                  พับกระดาษ ➜ กางออก ➜ ✂️ ตัดให้ได้ <span className="text-amber-600">{target.den} ส่วนเท่า ๆ กัน</span> แล้วแตะเลือกให้ได้ <span className="mx-0.5 inline-flex align-middle text-rose-500"><Frac n={target.num} d={target.den} /></span> ของแผ่น
                </p>
              </div>
            )}

            {/* คำใบ้สั้น */}
            <div className="rounded-2xl border-2 border-sky-200 bg-white/95 px-4 py-2 text-center">
              <p className="text-xs font-bold text-slate-400 sm:text-sm">
                💡 พับครึ่ง 1 ครั้ง = 2 ส่วน · พับต่ออีกครั้ง = 4 ส่วน · พับได้ทั้งแนวตั้ง แนวนอน หรือ<b className="text-rose-500">ติดมุม (ได้สามเหลี่ยม)</b> — แบ่งกี่วิธีก็ได้ ขอแค่ทุกส่วน <b className="text-sky-600">เท่ากัน</b>
              </p>
            </div>

            {/* ── เวทีกระดาษ ── */}
            <div className="rounded-2xl border-2 border-rose-200 bg-gradient-to-b from-amber-50/70 to-rose-50/60 p-3">
              <div className="grid place-items-center" style={{ minHeight: base.h + 46 }}>
                {!cut ? (
                  /* กระดาษ (ยังไม่ตัด) */
                  <div className="relative" style={{ width: curW, height: curH }}>
                    {/* เงา */}
                    <div className="absolute rounded-sm" style={{ left: 4, top: 5, width: curW, height: curH, background: "#00000022", clipPath: dCount > 0 ? DIAG_STEP[dCount as 1 | 2].restClip : undefined }} />
                    {/* เนื้อกระดาษ (ตัดรูปตามรอยพับติดมุมถ้ามี) */}
                    <div className="absolute inset-0 rounded-sm" style={{
                      background: color.fill, boxShadow: "inset 0 0 0 2.5px #00000026",
                      clipPath: dCount > 0 ? DIAG_STEP[dCount as 1 | 2].restClip : undefined,
                    }}>
                      {/* รอยพับตาราง (เห็นตอนกางสุด) */}
                      {isOpen && vLines.map((x, i) => (
                        <div key={`v${i}`} className="absolute top-0 h-full border-l-2 border-dashed" style={{ left: (x / base.w) * curW, borderColor: "#00000055" }} />
                      ))}
                      {isOpen && hLines.map((y, i) => (
                        <div key={`h${i}`} className="absolute left-0 w-full border-t-2 border-dashed" style={{ top: (y / base.h) * curH, borderColor: "#00000055" }} />
                      ))}
                      {/* รอยพับติดมุม (เห็นตอนกางสุด) */}
                      {isOpen && maxD >= 1 && (
                        <svg className="pointer-events-none absolute inset-0" width={curW} height={curH} viewBox={`0 0 ${base.w} ${base.h}`}>
                          <line x1={0} y1={0} x2={base.w} y2={base.h} stroke="#00000055" strokeWidth={2} strokeDasharray="6 5" />
                          {maxD >= 2 && <line x1={base.w} y1={0} x2={0} y2={base.h} stroke="#00000055" strokeWidth={2} strokeDasharray="6 5" />}
                        </svg>
                      )}
                    </div>
                    {/* แผ่นพับ (อนิเมชัน) */}
                    {anim && anim.axis === "v" && (
                      <div className="absolute rounded-sm" style={{
                        left: anim.dir === "in" ? curW / 2 : curW / 2, top: 0, width: curW / 2, height: curH,
                        background: `linear-gradient(90deg, ${color.fill}, ${color.deep}55)`,
                        boxShadow: "inset 0 0 0 2px #00000030",
                        transformOrigin: "left center",
                        animation: `${anim.dir === "in" ? "pfFoldInV" : "pfFoldOutV"} 0.5s ease-in-out both`,
                      }} />
                    )}
                    {anim && anim.axis === "h" && (
                      <div className="absolute rounded-sm" style={{
                        left: 0, top: curH / 2, width: curW, height: curH / 2,
                        background: `linear-gradient(180deg, ${color.fill}, ${color.deep}55)`,
                        boxShadow: "inset 0 0 0 2px #00000030",
                        transformOrigin: "center top",
                        animation: `${anim.dir === "in" ? "pfFoldInH" : "pfFoldOutH"} 0.5s ease-in-out both`,
                      }} />
                    )}
                    {anim && anim.axis === "d" && anim.step && (
                      <div className="absolute inset-0" style={{
                        clipPath: DIAG_STEP[anim.step].flapClip,
                        background: `linear-gradient(135deg, ${color.fill}, ${color.deep}55)`,
                        boxShadow: "inset 0 0 0 2px #00000030",
                        transformOrigin: DIAG_STEP[anim.step].origin,
                        ["--dx" as string]: DIAG_STEP[anim.step].dx,
                        ["--dy" as string]: DIAG_STEP[anim.step].dy,
                        animation: `${anim.dir === "in" ? "pfFoldInD" : "pfFoldOutD"} 0.52s ease-in-out both`,
                      } as React.CSSProperties} />
                    )}
                    {/* กรรไกรวิ่งตัด */}
                    {cutting && (maxD > 0 ? (
                      <span className="absolute z-10 text-2xl" style={{ animation: "pfScissorD 0.72s linear both", transform: "rotate(-45deg)" }}>✂️</span>
                    ) : maxV > 0 ? (
                      <span className="absolute z-10 text-2xl" style={{ left: `calc(50% - 13px)`, animation: "pfScissor 0.72s linear both" }}>✂️</span>
                    ) : (
                      <span className="absolute z-10 text-2xl" style={{ top: `calc(50% - 15px)`, animation: "pfScissorH 0.72s linear both", transform: "rotate(-90deg)" }}>✂️</span>
                    ))}
                    {/* ป้ายชั้น */}
                    {!isOpen && (
                      <span className="absolute -right-2 -top-2 rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-extrabold text-white shadow">ซ้อน {layers} ชั้น</span>
                    )}
                  </div>
                ) : maxD > 0 ? (
                  /* ชิ้นสามเหลี่ยมที่ตัดแล้ว (พับติดมุม) */
                  <svg width={base.w} height={base.h} viewBox={`0 0 ${base.w} ${base.h}`}>
                    {diagCutPieces.map((p, i) => (
                      <g key={i} className="pf-svg-piece cursor-pointer" style={{ animation: "pfPiecePopTri 0.4s ease-out both", animationDelay: `${i * 0.06}s` }}
                        onClick={() => togglePiece(i)} role="button" tabIndex={0}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") togglePiece(i); }}>
                        <polygon points={p.pts} fill={selected.has(i) ? color.deep : color.fill} stroke="#00000026" strokeWidth={2.5} />
                        {selected.has(i) && <text x={p.cx} y={p.cy + 6} textAnchor="middle" fontSize={20} fontWeight={900} fill="#fff">✓</text>}
                      </g>
                    ))}
                  </svg>
                ) : (
                  /* ชิ้นสี่เหลี่ยมที่ตัดแล้ว (พับตาราง) */
                  <div className="grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 10 }}>
                    {Array.from({ length: pieces }, (_, i) => (
                      <button key={i} onClick={() => togglePiece(i)}
                        className="relative rounded-sm transition active:scale-95"
                        style={{
                          width: base.w / cols, height: base.h / rows,
                          background: selected.has(i) ? color.deep : color.fill,
                          boxShadow: "inset 0 0 0 2.5px #00000026, 2px 3px 0 #00000022",
                          animation: "pfPiecePop 0.35s ease-out both",
                          animationDelay: `${i * 0.04}s`,
                        }}>
                        {selected.has(i) && <span className="absolute inset-0 grid place-items-center text-lg font-black text-white drop-shadow">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* สถานะใต้เวที */}
              <p className="mt-1 text-center text-sm font-extrabold text-slate-500">
                {cut ? (
                  <>✂️ ตัดได้ <b className="text-rose-500">{pieces} ส่วนเท่า ๆ กัน</b> — แตะเลือกแล้วได้ <span className="mx-1 inline-flex align-middle text-rose-600"><Frac n={selected.size} d={pieces} /></span> ของแผ่น</>
                ) : !isOpen ? (
                  <>📄 พับอยู่ {folds.length} ทบ (ซ้อน {layers} ชั้น) — กางออกเพื่อดูรอยพับ</>
                ) : hasCrease ? (
                  <>เห็นรอยพับแล้ว! ตอนนี้แบ่งเป็น <b className="text-sky-600">{pieces} ส่วนเท่า ๆ กัน</b> — ใช้กรรไกรตัดได้เลย</>
                ) : (
                  <>กระดาษ{base.label}สี{color.name} 1 แผ่น — ลองกดพับดูสิ!</>
                )}
              </p>
            </div>

            {/* ── ปุ่มควบคุม ── */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button onClick={() => doFold("v")} disabled={busy || cut || vCount >= 2 || gridLocked}
                className="inline-flex items-center gap-1.5 rounded-xl border-2 border-rose-300 bg-white px-3 py-2 text-sm font-extrabold text-rose-600 transition enabled:hover:bg-rose-50 enabled:active:scale-95 disabled:opacity-40">
                ↔️ พับครึ่ง ซ้าย-ขวา
              </button>
              <button onClick={() => doFold("h")} disabled={busy || cut || hCount >= 2 || gridLocked}
                className="inline-flex items-center gap-1.5 rounded-xl border-2 border-rose-300 bg-white px-3 py-2 text-sm font-extrabold text-rose-600 transition enabled:hover:bg-rose-50 enabled:active:scale-95 disabled:opacity-40">
                ↕️ พับครึ่ง บน-ล่าง
              </button>
              <button onClick={() => doFold("d")} disabled={busy || cut || dCount >= 2 || diagLocked}
                className="inline-flex items-center gap-1.5 rounded-xl border-2 border-fuchsia-300 bg-white px-3 py-2 text-sm font-extrabold text-fuchsia-600 transition enabled:hover:bg-fuchsia-50 enabled:active:scale-95 disabled:opacity-40">
                ↘️ พับติดมุม (สามเหลี่ยม)
              </button>
              <button onClick={doUnfold} disabled={busy || cut || folds.length === 0}
                className="inline-flex items-center gap-1.5 rounded-xl border-2 border-sky-300 bg-white px-3 py-2 text-sm font-extrabold text-sky-600 transition enabled:hover:bg-sky-50 enabled:active:scale-95 disabled:opacity-40">
                <Undo2 size={15} /> กางออก
              </button>
              <button onClick={doCut} disabled={busy || cut || !isOpen || !hasCrease}
                className="inline-flex items-center gap-1.5 rounded-xl border-2 border-amber-400 bg-amber-400/90 px-3 py-2 text-sm font-extrabold text-white shadow transition enabled:hover:brightness-105 enabled:active:scale-95 disabled:opacity-40">
                <Scissors size={15} /> ตัดตามรอยพับ
              </button>
              <button onClick={() => newPaper()} disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm font-extrabold text-slate-500 transition enabled:hover:bg-slate-50 enabled:active:scale-95 disabled:opacity-40">
                <RotateCcw size={15} /> กระดาษใหม่
              </button>
              {mode === "quiz" && !solvedQuiz && (
                <button onClick={checkAnswer} disabled={busy}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 px-4 py-2 text-sm font-extrabold text-white shadow transition enabled:hover:brightness-105 enabled:active:scale-95 disabled:opacity-40">
                  ✅ ตรวจคำตอบ
                </button>
              )}
            </div>

            {/* สรุปเศษส่วนที่เลือก (โหมดครู) */}
            {mode === "lab" && cut && selected.size > 0 && (
              <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-3 text-center">
                <p className="text-base font-extrabold text-emerald-700">
                  ระบายสี {selected.size} ส่วน จากทั้งหมด {pieces} ส่วนเท่า ๆ กัน = <Frac n={selected.size} d={pieces} /> ของกระดาษ
                  <span className="ml-2 text-xs font-bold text-emerald-500">(ตัวเศษ = ส่วนที่เลือก · ตัวส่วน = ส่วนทั้งหมด)</span>
                </p>
              </div>
            )}

            {/* ผลตรวจ (โหมดถามตอบ) */}
            {mode === "quiz" && feedback && (
              <div className={cn("rounded-2xl border-2 p-3 text-center", feedback.ok ? "border-emerald-300 bg-emerald-50" : "border-rose-300 bg-rose-50")}>
                <p className={cn("text-base font-extrabold", feedback.ok ? "text-emerald-700" : "text-rose-600")}>
                  {feedback.ok ? "🎉 " : "💨 "}{feedback.msg}
                </p>
                {feedback.ok && (
                  <button onClick={nextRound} className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 px-6 py-2 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                    {round >= MISSIONS_TOTAL ? "🏁 ดูสรุปผล" : <>ข้อต่อไป <ArrowRight size={16} /></>}
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
