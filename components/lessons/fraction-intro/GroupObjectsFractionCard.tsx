"use client";

import { useEffect, useRef, useState } from "react";
import { Users, FlaskConical, Target, RotateCcw, Check, X, ArrowRight, Play, Volume2, VolumeX } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Frac } from "@/components/lessons/Frac";
import { cn } from "@/lib/cn";
import { randInt } from "@/lib/randomFraction";

/* ─────────────────────────────────────────────
   เศษส่วนของกลุ่มสิ่งของ (set model) 🪷🐟🥚
   ต่างจากเศษส่วนแบบพื้นที่ (แบ่งวัตถุชิ้นเดียว) — ที่นี่นับจาก "กลุ่มวัตถุแยกชิ้น"
   ตัวส่วน = จำนวนทั้งหมด · ตัวเศษ = จำนวนที่เลือก/เข้าเกณฑ์
   โหมดครู (แตะเลือกอิสระ) + โหมดฝึกคำนวณ (เลือกให้ตรงโจทย์ / อ่านแล้วเขียนเศษส่วน)
   ───────────────────────────────────────────── */

type Category = { emoji: string; label: string; unit: string; verb: string };

const CATEGORIES: Category[] = [
  { emoji: "🪷", label: "ดอกบัว", unit: "ดอก", verb: "บานอยู่" },
  { emoji: "🐟", label: "ปลา", unit: "ตัว", verb: "ว่ายอยู่ในหนอง" },
  { emoji: "🥚", label: "ไข่", unit: "ฟอง", verb: "อยู่ในตะกร้า" },
  { emoji: "🧒", label: "นักเรียน", unit: "คน", verb: "ยืนอยู่หน้าแถว" },
  { emoji: "🪙", label: "เหรียญบาท", unit: "เหรียญ", verb: "อยู่ในกระปุก" },
  { emoji: "🍬", label: "ลูกอม", unit: "เม็ด", verb: "อยู่ในถุง" },
  { emoji: "✏️", label: "ดินสอ", unit: "แท่ง", verb: "อยู่ในกล่อง" },
  { emoji: "🍊", label: "ส้ม", unit: "ผล", verb: "อยู่ในตะกร้า" },
  { emoji: "🚗", label: "รถยนต์", unit: "คัน", verb: "จอดอยู่ในลาน" },
  { emoji: "🐔", label: "ไก่", unit: "ตัว", verb: "อยู่ในเล้า" },
];

const TOTAL_OPTIONS = [4, 5, 6, 8, 10];
const MISSIONS_TOTAL = 8;
type SoundKind = "tap" | "correct" | "wrong" | "star";

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
      case "tap": return tones([720], 0, 0.06, "sine", 0.06);
      case "correct": return tones([660, 990, 1319], 0.06, 0.1, "triangle", 0.14);
      case "wrong": return tones([220, 165], 0.11, 0.18, "sawtooth", 0.09);
      case "star": return tones([1047, 1319, 1568, 2093], 0.07, 0.14, "triangle", 0.14);
    }
  }
  return { play, ensure };
}

function ObjectGrid({ emoji, total, selected, selectable, onToggle }: {
  emoji: string; total: number; selected: Set<number>; selectable: boolean; onToggle?: (i: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2.5 rounded-2xl bg-white/70 p-4">
      {Array.from({ length: total }, (_, i) => {
        const on = selected.has(i);
        const Tag = selectable ? "button" : "div";
        return (
          <Tag
            key={i}
            {...(selectable ? { onClick: () => onToggle?.(i), type: "button" } : {})}
            className={cn(
              "grid h-12 w-12 place-items-center rounded-xl border-2 text-2xl transition sm:h-14 sm:w-14 sm:text-3xl",
              selectable && "active:scale-90",
              on ? "border-emerald-400 bg-emerald-100 shadow-sm" : "border-slate-200 bg-white",
              selectable && !on && "hover:border-brand-300 hover:bg-brand-50"
            )}
          >
            {emoji}
          </Tag>
        );
      })}
    </div>
  );
}

function NumBox({ value, className }: { value: number; className?: string }) {
  return <span className={cn("inline-grid h-9 min-w-9 place-items-center rounded-lg border-2 border-slate-300 bg-white px-1.5 text-lg font-black text-slate-700", className)}>{value}</span>;
}

type QType = "select" | "read";
type Round = { catIdx: number; total: number; target: number; qType: QType };

function randRound(): Round {
  const catIdx = randInt(0, CATEGORIES.length - 1);
  const total = TOTAL_OPTIONS[randInt(0, TOTAL_OPTIONS.length - 1)];
  const target = randInt(1, total - 1);
  const qType: QType = Math.random() < 0.5 ? "select" : "read";
  return { catIdx, total, target, qType };
}

export function GroupObjectsFractionCard() {
  const [mode, setMode] = useState<"lab" | "quiz">("lab");
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  useEffect(() => { mutedRef.current = muted; }, [muted]);
  const ctxRef = useRef<AudioContext | null>(null);
  const { play, ensure } = useSound(mutedRef, ctxRef);

  /* โหมดครู */
  const [catIdx, setCatIdx] = useState(0);
  const [total, setTotal] = useState(5);
  const [selected, setSelected] = useState<Set<number>>(new Set([0, 1, 2]));
  const cat = CATEGORIES[catIdx];

  function setLab(ci: number, t: number) {
    setCatIdx(ci); setTotal(t); setSelected(new Set());
  }
  function toggle(i: number) {
    ensure(); play("tap");
    setSelected((prev) => {
      const nx = new Set(prev);
      if (nx.has(i)) nx.delete(i); else nx.add(i);
      return nx;
    });
  }

  /* โหมดฝึกคำนวณ */
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [firstTry, setFirstTry] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [q, setQ] = useState<Round>(() => randRound());
  const [qSelected, setQSelected] = useState<Set<number>>(new Set());
  const [readPreset, setReadPreset] = useState<Set<number>>(new Set());
  const [an, setAn] = useState(0);
  const [ad, setAd] = useState(1);
  const [checked, setChecked] = useState<{ ok: boolean } | null>(null);
  const qCat = CATEGORIES[q.catIdx];

  function newRound() {
    const r = randRound();
    setQ(r);
    setQSelected(new Set());
    setChecked(null);
    setFirstTry(true);
    if (r.qType === "read") {
      const s = new Set<number>();
      while (s.size < r.target) s.add(randInt(0, r.total - 1));
      setReadPreset(s);
    }
    setAn(0); setAd(r.total);
  }
  function startQuiz() {
    ensure(); play("tap");
    setScore(0); setRound(1); setGameOver(false);
    newRound();
    setMode("quiz");
  }
  function nextRound() {
    if (round >= MISSIONS_TOTAL) { setGameOver(true); play("star"); return; }
    setRound((r) => r + 1);
    newRound();
  }
  function toggleQ(i: number) {
    if (checked?.ok) return;
    ensure(); play("tap");
    setQSelected((prev) => {
      const nx = new Set(prev);
      if (nx.has(i)) nx.delete(i); else nx.add(i);
      return nx;
    });
    setChecked(null);
  }
  function checkSelect() {
    ensure();
    const ok = qSelected.size === q.target;
    if (ok) { play("correct"); setScore((s) => s + (firstTry ? 25 : 10)); }
    else { play("wrong"); setFirstTry(false); }
    setChecked({ ok });
  }
  function checkRead() {
    ensure();
    const ok = an === q.target && ad === q.total;
    if (ok) { play("correct"); setScore((s) => s + (firstTry ? 25 : 10)); }
    else { play("wrong"); setFirstTry(false); }
    setChecked({ ok });
  }

  const stars = score >= 170 ? 3 : score >= 100 ? 2 : 1;

  return (
    <Card className="space-y-4 border-2 border-emerald-100 bg-gradient-to-b from-emerald-50/60 to-white">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500 text-white shadow"><Users size={18} /></span>
          <div>
            <h3 className="text-base font-extrabold text-slate-800 sm:text-lg">เศษส่วนของกลุ่มสิ่งของ</h3>
            <p className="text-xs font-bold text-slate-400">นับจากกลุ่มวัตถุแยกชิ้น เช่น ดอกบัว 3 จาก 5 ดอก = <Frac n={3} d={5} /></p>
          </div>
        </div>
        <button onClick={() => setMuted((m) => !m)} className="grid h-9 w-9 place-items-center rounded-xl border-2 border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50" title={muted ? "เปิดเสียง" : "ปิดเสียง"}>
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>

      <div className="flex rounded-xl border-2 border-slate-200 bg-white p-1">
        <button onClick={() => setMode("lab")} className={cn("flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "lab" ? "bg-emerald-500 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
          <FlaskConical size={15} /> โหมดครู
        </button>
        <button onClick={startQuiz} className={cn("flex-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "quiz" ? "bg-amber-500 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
          <Target size={15} /> โหมดฝึกคำนวณ
        </button>
      </div>

      {mode === "lab" ? (
        <div className="space-y-3">
          <div className="space-y-2 rounded-2xl border-2 border-emerald-200 bg-white/90 px-3 py-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-extrabold text-emerald-700">สิ่งของ:</span>
              {CATEGORIES.map((c, i) => (
                <button key={i} onClick={() => setLab(i, total)} className={cn("inline-flex items-center gap-1 rounded-lg border-2 px-2 py-1 text-sm font-extrabold transition", catIdx === i ? "border-emerald-400 bg-emerald-100 text-emerald-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
                  <span>{c.emoji}</span> {c.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-extrabold text-emerald-700">ทั้งหมดกี่{cat.unit}:</span>
              {TOTAL_OPTIONS.map((t) => (
                <button key={t} onClick={() => setLab(catIdx, t)} className={cn("h-8 w-8 rounded-lg border-2 text-base font-extrabold transition", total === t ? "border-emerald-400 bg-emerald-100 text-emerald-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>{t}</button>
              ))}
              <button onClick={() => setSelected(new Set())} className="ml-2 inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-3 py-1.5 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50">
                <RotateCcw size={14} /> ล้างที่เลือก
              </button>
            </div>
          </div>

          <p className="text-center text-sm font-bold text-slate-500 sm:text-base">
            {cat.label}{cat.verb}ทั้งหมด <b className="text-slate-700">{total}</b> {cat.unit} — แตะเลือกทีละ{cat.unit}
          </p>

          <ObjectGrid emoji={cat.emoji} total={total} selected={selected} selectable onToggle={toggle} />

          <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-3 text-center">
            <p className="text-base font-extrabold text-emerald-800 sm:text-lg">
              {cat.label}ที่เลือก {selected.size} จาก {total} {cat.unit} = <Frac n={selected.size} d={total} className="text-emerald-700" /> ของ{cat.label}ทั้งหมด
            </p>
            <p className="mt-1 text-xs font-bold text-emerald-600/80">ตัวเศษ = จำนวนที่เลือก · ตัวส่วน = จำนวนทั้งหมด</p>
          </div>
        </div>
      ) : gameOver ? (
        <div className="space-y-4 rounded-2xl border-2 border-amber-300 bg-white/90 p-6 text-center">
          <div className="text-5xl">🪷🏆</div>
          <h3 className="text-xl font-extrabold text-slate-800 sm:text-2xl">จบภารกิจนับกลุ่มสิ่งของ!</h3>
          <p className="text-2xl">{"⭐".repeat(stars)}{"☆".repeat(3 - stars)}</p>
          <p className="text-base font-extrabold text-amber-700">🏅 คะแนนรวม {score}</p>
          <button onClick={startQuiz} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
            <Play size={18} /> เล่นอีกครั้ง
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 rounded-2xl bg-white/90 px-4 py-2 ring-1 ring-amber-200">
            <span className="text-base font-extrabold text-amber-600">🎯 ข้อ {round}/{MISSIONS_TOTAL}</span>
            <span className="text-base font-extrabold text-emerald-600">🏅 {score}</span>
          </div>

          {q.qType === "select" ? (
            <>
              <p className="text-center text-base font-extrabold leading-relaxed text-slate-700">
                {qCat.label}{qCat.verb}ทั้งหมด <b className="text-amber-600">{q.total}</b> {qCat.unit} — แตะเลือกให้ได้ <b className="text-emerald-600">{q.target}</b> {qCat.unit}
              </p>
              <ObjectGrid emoji={qCat.emoji} total={q.total} selected={qSelected} selectable={!checked?.ok} onToggle={toggleQ} />
              <p className="text-center text-sm font-bold text-slate-400">ตอนนี้เลือกไว้ {qSelected.size} {qCat.unit}</p>
            </>
          ) : (
            <>
              <p className="text-center text-base font-extrabold leading-relaxed text-slate-700">
                {qCat.label}{qCat.verb}ทั้งหมด <b className="text-amber-600">{q.total}</b> {qCat.unit} — ที่แรเงาไว้คือส่วนที่สนใจ อ่านแล้วเขียนเป็นเศษส่วน
              </p>
              <ObjectGrid emoji={qCat.emoji} total={q.total} selected={readPreset} selectable={false} />
              <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl bg-white/80 p-3">
                <span className="text-sm font-extrabold text-slate-600">ตอบ:</span>
                <input type="number" value={an} min={0} onChange={(e) => { setAn(Math.max(0, +e.target.value || 0)); setChecked(null); }}
                  className="w-16 rounded-lg border-2 border-slate-200 px-2 py-1 text-center text-lg font-bold outline-none focus:border-emerald-400" />
                <span className="text-xl font-black text-slate-400">/</span>
                <input type="number" value={ad} min={1} onChange={(e) => { setAd(Math.max(1, +e.target.value || 1)); setChecked(null); }}
                  className="w-16 rounded-lg border-2 border-slate-200 px-2 py-1 text-center text-lg font-bold outline-none focus:border-emerald-400" />
              </div>
            </>
          )}

          {!checked?.ok && (
            <div className="flex justify-center">
              <button onClick={q.qType === "select" ? checkSelect : checkRead} className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 px-5 py-2 text-sm font-extrabold text-white shadow transition hover:brightness-105 active:scale-95">
                ✅ ตรวจคำตอบ
              </button>
            </div>
          )}

          {checked && (
            <div className={cn("rounded-2xl border-2 p-3 text-center", checked.ok ? "border-emerald-300 bg-emerald-50" : "border-rose-300 bg-rose-50")}>
              <p className={cn("flex items-center justify-center gap-1.5 text-base font-extrabold", checked.ok ? "text-emerald-700" : "text-rose-600")}>
                {checked.ok
                  ? <><Check size={18} /> ถูกต้อง! {qCat.label} {q.target} จาก {q.total} {qCat.unit} = <NumBox value={q.target} className="mx-1" />⁄<NumBox value={q.total} className="mx-1" /></>
                  : <><X size={18} /> ยังไม่ใช่ ลองดูใหม่นะ</>}
              </p>
              {checked.ok && (
                <button onClick={nextRound} className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 px-6 py-2 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                  {round >= MISSIONS_TOTAL ? "🏁 ดูสรุปผล" : <>ข้อต่อไป <ArrowRight size={16} /></>}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
