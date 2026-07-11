"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Timer, Trophy, Volume2, VolumeX } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionStack } from "@/components/fractions/FractionStack";
import { randInt, shuffle } from "@/lib/randomFraction";
import { cn } from "@/lib/cn";
import type { FractionShapeKind, FractionTone } from "@/types/lessonContent";

const DURATION = 90; // 1:30 นาที
const MAX_BAITS = 3;
const GOLD_CHANCE = 0.18;
const FRENZY_AT = 20; // เหลือ 20 วิ → โหมดเดือด

/* ── ระดับความยาก + เป้าหมายดาว [⭐, ⭐⭐, ⭐⭐⭐] ── */

type LevelId = "easy" | "mid" | "hard";

type Level = {
  id: LevelId;
  label: string;
  stars: string;
  emoji: string;
  dens: number[];
  maxFish: number;
  minDur: number;
  maxDur: number;
  goals: [number, number, number];
  hint: string;
};

const LEVELS: Level[] = [
  { id: "easy", label: "บ่อลูกกบ", stars: "⭐", emoji: "🐣", dens: [2, 3, 4], maxFish: 4, minDur: 15, maxDur: 19, goals: [6, 10, 15], hint: "ปลาว่ายช้า · เศษส่วนง่าย" },
  { id: "mid", label: "บ่อชาวประมง", stars: "⭐⭐", emoji: "🎣", dens: [3, 4, 5, 6, 8], maxFish: 5, minDur: 11, maxDur: 15, goals: [8, 13, 18], hint: "ปลาไวขึ้น · หลายตัวส่วน" },
  { id: "hard", label: "ทะเลลึก", stars: "⭐⭐⭐", emoji: "🌊", dens: [5, 6, 8, 10, 12], maxFish: 6, minDur: 8, maxDur: 12, goals: [10, 16, 22], hint: "ปลาเร็ว · มีตัวลวงหลอกตา" },
];

function starsFor(level: Level, score: number): number {
  const [a, b, c] = level.goals;
  return score >= c ? 3 : score >= b ? 2 : score >= a ? 1 : 0;
}

/* ── ชนิดข้อมูล ── */

type Frac = { num: number; den: number };
type Target = Frac & { shape: FractionShapeKind; tone: FractionTone };

type Fish = {
  id: number;
  num: number;
  den: number;
  lane: number; // top เป็น %
  dir: "ltr" | "rtl";
  duration: number;
  emoji: string;
  golden: boolean;
};

const SHAPES: FractionShapeKind[] = ["pizza", "circle", "bar", "grid", "chocolate", "watermelon"];
const TONES: FractionTone[] = ["accent", "emerald", "violet", "sky", "pink"];
const FISH_EMOJIS = ["🐟", "🐠", "🐡"];
/** ตำแหน่งแนวตั้งของปลา (%) — เว้นด้านล่างไว้ให้ป้ายเศษส่วนไม่โดนขอบบ่อตัด */
const LANES = [5, 20, 35, 50, 65];

function makeTarget(level: Level): Target {
  const den = level.dens[randInt(0, level.dens.length - 1)];
  return {
    num: randInt(1, den - 1),
    den,
    shape: SHAPES[randInt(0, SHAPES.length - 1)],
    tone: TONES[randInt(0, TONES.length - 1)],
  };
}

/** เศษส่วนลวง — ค่าต้องไม่เท่าเป้าหมาย */
function makeDecoy(level: Level, target: Target): Frac {
  const candidates: Frac[] = [
    { num: target.den, den: target.num }, // สลับบน-ล่าง
    { num: target.den - target.num, den: target.den }, // นับส่วนที่เหลือ
    { num: Math.min(target.num + 1, target.den - 1), den: target.den },
    { num: Math.max(1, target.num - 1), den: target.den },
  ];
  const den = level.dens[randInt(0, level.dens.length - 1)];
  candidates.push({ num: randInt(1, den - 1), den });
  const ok = shuffle(candidates).find(
    (c) => c.num >= 1 && c.den >= 2 && Math.abs(c.num / c.den - target.num / target.den) > 1e-9
  );
  return ok ?? { num: 1, den: target.den + 1 };
}

/* ── ระบบเสียง (Web Audio API — ไม่เพิ่มไลบรารี) ── */

type SoundKind = "catch" | "gold" | "wrong" | "star" | "win" | "lose" | "tick";

function useSound(mutedRef: React.MutableRefObject<boolean>) {
  const ctxRef = useRef<AudioContext | null>(null);

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
      case "catch": return tones([660, 990], 0.07, 0.1, "sine", 0.13);
      case "gold": return tones([784, 1047, 1319, 1568], 0.06, 0.11, "triangle", 0.15);
      case "wrong": return tones([200, 130], 0.11, 0.18, "sawtooth", 0.12);
      case "star": return tones([523, 659, 784, 1047], 0.08, 0.14, "triangle", 0.16);
      case "win": return tones([523, 659, 784, 1047, 1319, 1047, 1319], 0.1, 0.16, "triangle", 0.17);
      case "lose": return tones([392, 311, 233], 0.14, 0.22, "sawtooth", 0.14);
      case "tick": return tones([1046], 0, 0.05, "square", 0.09);
    }
  }

  return { play, ensure };
}

/* ── เกมหลัก ── */

export function FishingPondGame() {
  const [level, setLevel] = useState<Level | null>(null);
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [target, setTarget] = useState<Target | null>(null);
  const [fishes, setFishes] = useState<Fish[]>([]);
  const [score, setScore] = useState(0);
  const [baits, setBaits] = useState(MAX_BAITS);
  const [streak, setStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [best, setBest] = useState<Record<LevelId, number>>({ easy: 0, mid: 0, hard: 0 });
  const [toast, setToast] = useState<{ kind: "catch" | "gold" | "wrong" | "star"; text: string } | null>(null);
  const [muted, setMuted] = useState(false);

  const idRef = useRef(1);
  const mutedRef = useRef(false);
  const frenzyRef = useRef(false);
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const { play, ensure } = useSound(mutedRef);

  const finished = !running && (timeLeft === 0 || gameOver) && level !== null;
  const frenzy = running && timeLeft <= FRENZY_AT;

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  /* เพลงประกอบระหว่างตกปลา — เล่นวน ปรับตามสถานะเล่น/ปิดเสียง */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!bgmRef.current) {
      const audio = new Audio("/sounds/fraction-fishing.mp3");
      audio.loop = true;
      audio.volume = 0.35;
      bgmRef.current = audio;
    }
    const bgm = bgmRef.current;
    if (running && !muted) {
      void bgm.play().catch(() => {});
    } else {
      bgm.pause();
      if (!running) bgm.currentTime = 0;
    }
  }, [running, muted]);

  /* หยุดเพลงเมื่อออกจากขั้นนี้ */
  useEffect(() => () => bgmRef.current?.pause(), []);

  useEffect(() => {
    frenzyRef.current = timeLeft <= FRENZY_AT;
  }, [timeLeft]);

  function spawnFish(lv: Level, frac: Frac, opts?: { golden?: boolean }): Fish {
    const golden = opts?.golden ?? false;
    const factor = frenzyRef.current ? 0.62 : 1; // โหมดเดือด: ปลาว่ายเร็วขึ้น
    const dur = randInt(lv.minDur, lv.maxDur) * factor;
    return {
      id: idRef.current++,
      num: frac.num,
      den: frac.den,
      lane: LANES[randInt(0, LANES.length - 1)],
      dir: Math.random() < 0.5 ? "ltr" : "rtl",
      duration: golden ? Math.max(4, dur * 0.6) : dur,
      emoji: golden ? "🐠" : FISH_EMOJIS[randInt(0, FISH_EMOJIS.length - 1)],
      golden,
    };
  }

  /** เริ่มโจทย์ใหม่ + ปล่อยปลาเป้าหมายลงบ่อเสมอ */
  function newRound(lv: Level, keep: Fish[]) {
    const t = makeTarget(lv);
    const goldChance = frenzyRef.current ? GOLD_CHANCE + 0.12 : GOLD_CHANCE;
    const school = [...keep, spawnFish(lv, t, { golden: Math.random() < goldChance })];
    while (school.length < lv.maxFish) school.push(spawnFish(lv, makeDecoy(lv, t)));
    setTarget(t);
    setFishes(school);
  }

  function start(lv: Level) {
    ensure(); // ปลุก AudioContext ด้วย gesture ของผู้ใช้
    frenzyRef.current = false;
    setLevel(lv);
    setScore(0);
    setBaits(MAX_BAITS);
    setStreak(0);
    setGameOver(false);
    setTimeLeft(DURATION);
    setRunning(true);
    newRound(lv, []);
  }

  /* นาฬิกา */
  useEffect(() => {
    if (!running) return;
    if (timeLeft <= 0) {
      setRunning(false);
      if (level) {
        setBest((b) => ({ ...b, [level.id]: Math.max(b[level.id], score) }));
        play(starsFor(level, score) > 0 ? "win" : "lose");
      }
      return;
    }
    if (timeLeft <= 10) play("tick");
    const id = window.setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, timeLeft]);

  /* เติมปลาลวงให้บ่อไม่ว่าง */
  useEffect(() => {
    if (!running || !level || !target) return;
    const id = window.setInterval(() => {
      setFishes((cur) => (cur.length >= level.maxFish ? cur : [...cur, spawnFish(level, makeDecoy(level, target))]));
    }, 1600);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, level, target]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 850);
    return () => window.clearTimeout(id);
  }, [toast]);

  function catchFish(f: Fish) {
    if (!running || !level || !target) return;
    const hit = Math.abs(f.num / f.den - target.num / target.den) < 1e-9;
    if (!hit) {
      setStreak(0);
      const left = baits - 1;
      setBaits(left);
      if (left <= 0) {
        setRunning(false);
        setGameOver(true);
        setBest((b) => ({ ...b, [level.id]: Math.max(b[level.id], score) }));
        setToast({ kind: "wrong", text: "🪱 เหยื่อหมด!" });
        play("lose");
      } else {
        setToast({ kind: "wrong", text: "❌ ไม่ใช่! เสียเหยื่อ" });
        play("wrong");
      }
      return;
    }
    const gain = f.golden ? 3 : 1;
    const newScore = score + gain;
    const gotStar = starsFor(level, newScore) > starsFor(level, score);
    setScore(newScore);
    setStreak((s) => s + 1);
    if (gotStar) {
      setToast({ kind: "star", text: `⭐ ได้ ${starsFor(level, newScore)} ดาว!` });
      play("star");
    } else {
      setToast(f.golden ? { kind: "gold", text: "🌟 ปลาทอง! +3" } : { kind: "catch", text: "🎉 จับได้! +1" });
      play(f.golden ? "gold" : "catch");
    }
    newRound(level, fishes.filter((x) => x.id !== f.id && Math.abs(x.num / x.den - target.num / target.den) > 1e-9).slice(0, level.maxFish - 1));
  }

  /** ปลาว่ายพ้นจอ — ถ้าเป็นปลาเป้าหมายตัวสุดท้าย ปล่อยตัวใหม่ทันที */
  function escaped(f: Fish) {
    setFishes((cur) => {
      const rest = cur.filter((x) => x.id !== f.id);
      if (!level || !target || !running) return rest;
      const stillHasTarget = rest.some((x) => Math.abs(x.num / x.den - target.num / target.den) < 1e-9);
      return stillHasTarget ? rest : [...rest, spawnFish(level, target, { golden: Math.random() < GOLD_CHANCE })];
    });
  }

  const earnedStars = level ? starsFor(level, score) : 0;

  return (
    <Card className="overflow-hidden p-0">
      {/* keyframes ว่ายน้ำ */}
      <style>{`
        @keyframes swim-ltr { from { left: -20%; } to { left: 104%; } }
        @keyframes swim-rtl { from { left: 104%; } to { left: -20%; } }
        @keyframes bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
        @keyframes pop-star { 0% { transform: scale(0.3); opacity: 0; } 50% { transform: scale(1.25); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
      `}</style>

      <div className="flex items-center justify-between bg-gradient-to-r from-cyan-600 to-sky-500 px-4 py-2.5 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white/25 text-sm font-extrabold">10</span>
          <h2 className="text-lg font-extrabold">บ่อปลาเศษส่วน 🎣</h2>
        </div>
        <div className="flex items-center gap-2">
          {level && best[level.id] > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold">
              <Trophy size={13} /> สูงสุด {best[level.id]}
            </span>
          )}
          <button
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? "เปิดเสียง" : "ปิดเสียง"}
            className="grid h-8 w-8 place-items-center rounded-full bg-white/20 transition hover:bg-white/30"
          >
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>

      <div className="space-y-4 p-4 sm:p-6">
        {/* ── เลือกบ่อ ── */}
        {!running && !finished && (
          <div className="space-y-4">
            <p className="text-center text-base font-extrabold text-slate-700 sm:text-lg">
              🎣 ดูภาพโจทย์ แล้วจับปลาที่คาบเศษส่วนตรงกัน ให้ได้ตามเป้าหมายดาวใน 1:30 นาที!
            </p>
            <p className="text-center text-sm font-bold text-rose-500">
              ⚠️ มีเหยื่อ 🪱🪱🪱 — จับผิดเกิน 3 ครั้ง เกมจบ! · 🌟 ปลาทอง ×3 · 20 วิสุดท้าย “โหมดเดือด” ปลาว่ายเร็วขึ้น!
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {LEVELS.map((lv) => (
                <button
                  key={lv.id}
                  onClick={() => start(lv)}
                  className="group flex flex-col items-center gap-1.5 rounded-2xl border-2 border-cyan-200 bg-gradient-to-b from-cyan-50 to-white p-5 transition hover:border-sky-400 hover:from-sky-50 active:scale-[0.97]"
                >
                  <span className="text-4xl transition group-hover:scale-110">{lv.emoji}</span>
                  <span className="text-lg font-extrabold text-cyan-800">{lv.label}</span>
                  <span className="text-sm">{lv.stars}</span>
                  <span className="text-xs font-bold text-slate-500">{lv.hint}</span>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-extrabold text-amber-700 ring-1 ring-amber-200">
                    เป้าหมาย ⭐{lv.goals[0]} · ⭐⭐{lv.goals[1]} · ⭐⭐⭐{lv.goals[2]} ตัว
                  </span>
                  {best[lv.id] > 0 && (
                    <span className="text-[11px] font-extrabold text-cyan-600">🏆 สถิติ {best[lv.id]} ตัว</span>
                  )}
                  <span className="mt-1 flex items-center gap-1 rounded-xl bg-cyan-600 px-4 py-1.5 text-sm font-extrabold text-white group-hover:bg-sky-500">
                    <Play size={14} /> ลงเรือ!
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── จบเกม ── */}
        {finished && level && (
          <div className="space-y-3">
            <div className={cn("rounded-2xl px-4 py-5 text-center", gameOver ? "bg-rose-100" : "bg-emerald-100")}>
              {/* ดาวที่ได้ */}
              <div className="mb-2 flex items-center justify-center gap-2">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={cn("text-4xl sm:text-5xl", i < earnedStars ? "" : "opacity-25 grayscale")}
                    style={i < earnedStars ? { animation: `pop-star 0.4s ${i * 0.15}s both` } : undefined}
                  >
                    ⭐
                  </span>
                ))}
              </div>
              <p className={cn("text-xl font-extrabold sm:text-2xl", gameOver ? "text-rose-600" : "text-emerald-700")}>
                {gameOver ? "🪱 เหยื่อหมดแล้ว!" : "⏰ หมดเวลา!"} จับปลาได้ {score} ตัว
              </p>
              <p className={cn("mt-1 text-sm font-bold sm:text-base", gameOver ? "text-rose-500" : "text-emerald-600")}>
                {earnedStars === 3
                  ? "🏆 สุดยอดจอมตกปลา! ครบ 3 ดาวแล้ว!"
                  : earnedStars > 0
                  ? `เยี่ยม! อีก ${level.goals[earnedStars] - score} ตัวก็ได้ ${earnedStars + 1} ดาวแล้ว`
                  : `ยังไม่ถึงเป้า — ทำอีก ${level.goals[0] - score} ตัวก็ได้ดาวแรก สู้ ๆ!`}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => start(level)}
                className="flex items-center gap-1.5 rounded-xl bg-cyan-600 px-6 py-2.5 text-sm font-extrabold text-white shadow transition hover:bg-cyan-700 active:scale-[0.98] sm:text-base"
              >
                <RotateCcw size={16} /> เล่นอีกครั้ง
              </button>
              <button
                onClick={() => {
                  setLevel(null);
                  setTimeLeft(DURATION);
                  setGameOver(false);
                }}
                className="rounded-xl border-2 border-cyan-300 bg-white px-6 py-2.5 text-sm font-extrabold text-cyan-700 transition hover:bg-cyan-50 active:scale-[0.98] sm:text-base"
              >
                เปลี่ยนบ่อ
              </button>
            </div>
          </div>
        )}

        {/* ── กำลังเล่น ── */}
        {running && level && target && (
          <div className="space-y-3">
            {/* แถบสถานะ */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-xl bg-cyan-50 px-4 py-2.5">
              <span className={cn("flex items-center gap-1.5 text-xl font-extrabold sm:text-2xl", timeLeft <= 10 ? "animate-pulse text-rose-600" : "text-cyan-700")}>
                <Timer size={22} /> {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
              </span>
              <span className="text-xl font-extrabold text-emerald-700 sm:text-2xl">🪣 {score}</span>
              <span className="text-lg sm:text-xl" aria-label={`เหยื่อเหลือ ${baits}`}>
                {Array.from({ length: MAX_BAITS }, (_, i) => (i < baits ? "🪱" : "▫️")).join("")}
              </span>
              {streak >= 3 && <span className="text-lg font-extrabold text-amber-600">🔥 {streak}</span>}
            </div>

            {/* แถบความคืบหน้าเป้าหมายดาว */}
            <div className="px-1">
              <div className="relative h-4 rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-[width] duration-300"
                  style={{ width: `${Math.min(100, (score / level.goals[2]) * 100)}%` }}
                />
                {level.goals.map((g, i) => (
                  <span
                    key={i}
                    className={cn(
                      "absolute -top-1 -translate-x-1/2 text-lg leading-none transition",
                      score >= g ? "" : "grayscale opacity-40"
                    )}
                    style={{ left: `${(g / level.goals[2]) * 100}%` }}
                    title={`${g} ตัว = ${i + 1} ดาว`}
                  >
                    ⭐
                  </span>
                ))}
              </div>
              <p className="mt-1.5 text-center text-xs font-bold text-slate-500">
                {earnedStars >= 3
                  ? "🏆 ครบ 3 ดาวแล้ว! ตกต่อให้ทำลายสถิติ"
                  : `เป้าถัดไป: อีก ${level.goals[earnedStars] - score} ตัว → ${earnedStars + 1} ดาว`}
              </p>
            </div>

            {/* โจทย์ */}
            <div className="flex items-center justify-center gap-4 rounded-2xl border-2 border-amber-200 bg-amber-50/70 px-4 py-3">
              <div className={cn(target.shape === "bar" ? "h-10 w-32" : "h-20 w-20")}>
                <FractionShape numerator={target.num} denominator={target.den} shape={target.shape} tone={target.tone} className="h-full w-full" />
              </div>
              <p className="text-base font-extrabold text-amber-800 sm:text-lg">
                ภาพนี้คือเศษส่วนอะไร?<br />
                <span className="text-sm font-bold text-amber-600 sm:text-base">จับปลาที่คาบคำตอบ! 🎣</span>
              </p>
            </div>

            {/* บ่อน้ำ */}
            <div
              className={cn(
                "relative h-[340px] overflow-hidden rounded-2xl border-4 bg-gradient-to-b transition-colors sm:h-[380px]",
                frenzy ? "border-orange-400 from-orange-200 via-cyan-400 to-blue-700" : "border-cyan-200 from-sky-300 via-cyan-400 to-blue-600"
              )}
            >
              {/* แถบโหมดเดือด */}
              {frenzy && (
                <div className="absolute inset-x-0 top-0 z-20 animate-pulse bg-gradient-to-r from-orange-500 to-rose-500 py-1 text-center text-sm font-extrabold text-white">
                  🔥 โหมดเดือด! ปลาว่ายเร็ว + ปลาทองเยอะขึ้น
                </div>
              )}
              {/* แสงผิวน้ำ */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/40 to-transparent" />
              {/* พื้นทราย + ของตกแต่ง */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-amber-200/80 to-transparent" />
              <span className="pointer-events-none absolute bottom-1 left-3 text-3xl">🪸</span>
              <span className="pointer-events-none absolute bottom-1 right-5 text-3xl">🌿</span>
              <span className="pointer-events-none absolute bottom-2 left-1/3 text-2xl">🐚</span>
              <span className="pointer-events-none absolute right-10 top-2 text-2xl">🪷</span>
              <span className="pointer-events-none absolute left-8 top-3 text-xl">🪷</span>
              {/* ฟองอากาศ */}
              <span className="pointer-events-none absolute bottom-16 left-1/4 animate-pulse text-lg opacity-60">🫧</span>
              <span className="pointer-events-none absolute bottom-28 right-1/4 animate-pulse text-sm opacity-50">🫧</span>

              {/* ปลา */}
              {fishes.map((f) => (
                <button
                  key={f.id}
                  onClick={() => catchFish(f)}
                  onAnimationEnd={() => escaped(f)}
                  className="absolute z-10 flex flex-col items-center transition-transform active:scale-90"
                  style={{
                    top: `${f.lane}%`,
                    animation: `${f.dir === "ltr" ? "swim-ltr" : "swim-rtl"} ${f.duration}s linear forwards`,
                  }}
                >
                  <span
                    className={cn("text-4xl drop-shadow-md sm:text-5xl", f.dir === "rtl" ? "" : "-scale-x-100")}
                    style={{ animation: "bob 2.2s ease-in-out infinite", ...(f.golden ? { filter: "drop-shadow(0 0 8px rgba(251,191,36,0.95)) hue-rotate(25deg) saturate(2)" } : {}) }}
                  >
                    {f.emoji}
                  </span>
                  <span
                    className={cn(
                      "-mt-1 rounded-lg px-2 py-0.5 shadow-md ring-2",
                      f.golden ? "bg-amber-100 ring-amber-400" : "bg-white/95 ring-cyan-100"
                    )}
                  >
                    <FractionStack top={f.num} bottom={f.den} className={cn("text-sm font-extrabold sm:text-base", f.golden ? "text-amber-700" : "text-slate-800")} />
                  </span>
                </button>
              ))}

              {/* ป้ายผลลัพธ์ */}
              {toast && (
                <div className="pointer-events-none absolute inset-0 z-30 grid place-items-center">
                  <div
                    className={cn(
                      "rounded-2xl px-8 py-4 text-2xl font-extrabold text-white shadow-2xl sm:text-3xl",
                      toast.kind === "wrong"
                        ? "bg-rose-500/95"
                        : toast.kind === "star"
                        ? "bg-gradient-to-r from-violet-500 to-fuchsia-500"
                        : toast.kind === "gold"
                        ? "bg-gradient-to-r from-amber-400 to-orange-400"
                        : "bg-emerald-500/95"
                    )}
                  >
                    {toast.text}
                  </div>
                </div>
              )}
            </div>

            <p className="text-center text-sm font-bold text-slate-500">
              ปลาทอง 🌟 ว่ายเร็วแต่ได้ 3 แต้ม — ถ้าปลาเป้าหมายหนีไป เดี๋ยวตัวใหม่ว่ายมาเอง ใจเย็น ๆ
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
