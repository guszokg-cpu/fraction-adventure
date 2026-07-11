"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Timer, Trophy, Volume2, VolumeX, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FractionStack } from "@/components/fractions/FractionStack";
import { gcd } from "@/lib/fractionUtils";
import { randInt, shuffle } from "@/lib/randomFraction";
import { cn } from "@/lib/cn";

const DURATION = 180; // 3 นาที — เดินต่อเนื่องตลอดการไต่ระดับ

/* ── ระดับความยาก ── */

type TickMode = "helped" | "plain" | "minimal";
type LevelId = "easy" | "mid" | "hard";

type Level = {
  id: LevelId;
  label: string;
  stars: string;
  emoji: string;
  size: number;
  dens: number[];
  ticks: TickMode;
  hint: string;
  /** อนุญาตให้มีค่าซ้ำบนกระดาน — เลือกช่องที่ทำบิงโกได้ไวสุดเอง */
  dup?: boolean;
};

const MAX_HEARTS = 3;
const DUP_COUNT = 6;

const LEVELS: Level[] = [
  {
    id: "easy",
    label: "ลูกอ๊อด",
    stars: "⭐",
    emoji: "🐣",
    size: 3,
    dens: [2, 3, 4, 5, 6],
    ticks: "helped",
    hint: "กระดาน 3×3 · มีขีดช่วยครบ",
  },
  {
    id: "mid",
    label: "กบน้อย",
    stars: "⭐⭐",
    emoji: "🐸",
    size: 4,
    dens: [3, 4, 5, 6, 8, 10],
    ticks: "plain",
    hint: "กระดาน 4×4 · มีขีดแต่ต้องนับเอง",
  },
  {
    id: "hard",
    label: "ราชากบ",
    stars: "⭐⭐⭐",
    emoji: "👑",
    size: 5,
    dens: [4, 5, 6, 8, 9, 10, 12],
    ticks: "minimal",
    hint: "กระดาน 5×5 · มีเลขซ้ำ เลือกช่องที่บิงโกไวสุด!",
    dup: true,
  },
];

function levelIndex(lv: Level): number {
  return LEVELS.findIndex((l) => l.id === lv.id);
}

/* ── สร้างกระดาน ── */

type Cell = { num: number; den: number; value: number };

function buildBoard(level: Level): Cell[] {
  const seen = new Set<string>();
  const pool: Cell[] = [];
  for (const den of level.dens) {
    for (let n = 1; n < den; n++) {
      const g = gcd(n, den);
      const key = `${n / g}/${den / g}`;
      if (seen.has(key)) continue;
      seen.add(key);
      pool.push({ num: n / g, den: den / g, value: n / den });
    }
  }
  const total = level.size * level.size;
  if (!level.dup) return shuffle(pool).slice(0, total);

  // โหมดเลขซ้ำ: สุ่มค่าไม่ซ้ำมาส่วนหนึ่ง แล้วเติมตัวซ้ำเข้าไปให้เต็มกระดาน
  const uniques = shuffle(pool).slice(0, total - DUP_COUNT);
  const dups = Array.from({ length: DUP_COUNT }, () => uniques[randInt(0, uniques.length - 1)]);
  return shuffle([...uniques, ...dups]);
}

/** หาไลน์บิงโกที่ครบแล้ว (แถว/หลัก/ทแยง) — คืน index ของช่องในไลน์เหล่านั้น */
function findBingoLines(marked: boolean[], size: number): { count: number; cells: Set<number> } {
  const lines: number[][] = [];
  for (let r = 0; r < size; r++) lines.push(Array.from({ length: size }, (_, c) => r * size + c));
  for (let c = 0; c < size; c++) lines.push(Array.from({ length: size }, (_, r) => r * size + c));
  lines.push(Array.from({ length: size }, (_, i) => i * size + i));
  lines.push(Array.from({ length: size }, (_, i) => i * size + (size - 1 - i)));

  const done = lines.filter((line) => line.every((i) => marked[i]));
  const cells = new Set<number>();
  for (const line of done) for (const i of line) cells.add(i);
  return { count: done.length, cells };
}

/* ── ระบบเสียง (Web Audio API — ไม่เพิ่มไลบรารี) ── */

type SoundKind = "mark" | "wrong" | "bingo" | "levelup" | "win" | "lose" | "tick";

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
      case "mark": return tones([660, 990], 0.07, 0.1, "sine", 0.13);
      case "wrong": return tones([200, 130], 0.11, 0.18, "sawtooth", 0.12);
      case "bingo": return tones([523, 659, 784, 1047, 1319, 1047, 1319], 0.09, 0.15, "triangle", 0.16);
      case "levelup": return tones([392, 523, 659, 784], 0.08, 0.13, "triangle", 0.15);
      case "win": return tones([523, 659, 784, 1047, 1319, 1568, 1319, 1568], 0.1, 0.16, "triangle", 0.17);
      case "lose": return tones([392, 311, 233], 0.14, 0.22, "sawtooth", 0.14);
      case "tick": return tones([1046], 0, 0.05, "square", 0.1);
    }
  }

  return { play, ensure };
}

/* ── เส้นจำนวนเป้าหมาย: กบเกาะบนจุด ── */

function TargetLine({ target, mode }: { target: Cell; mode: TickMode }) {
  const pct = target.value * 100;
  const ticks: number[] =
    mode === "minimal"
      ? [0, 0.5, 1]
      : Array.from({ length: target.den + 1 }, (_, i) => i / target.den);
  // ขีดอ้างอิงจาง ๆ ทุก 10% (ไม่บอกตัวส่วนจริง) ช่วยให้กะตำแหน่งได้แม่นขึ้นในโหมด minimal
  const minorTicks = mode === "minimal" ? [10, 20, 30, 40, 60, 70, 80, 90] : [];

  return (
    <div className="rounded-2xl border-2 border-violet-200 bg-gradient-to-b from-violet-50 to-white px-6 pb-3 pt-10 sm:px-10">
      <div className="relative h-10">
        {/* กบชี้ตำแหน่ง */}
        <div
          className="absolute -top-9 -translate-x-1/2 text-3xl transition-[left] duration-500 ease-out"
          style={{ left: `${pct}%` }}
        >
          <span className="inline-block animate-bounce drop-shadow-md">🐸</span>
        </div>

        {/* เส้นหลัก */}
        <div className="absolute left-0 right-0 top-4 h-1.5 rounded-full bg-violet-700" />

        {/* ขีดอ้างอิงจาง ๆ (โหมด minimal เท่านั้น) — ช่วยกะตำแหน่งแบบไม้บรรทัดไม่มีเลข */}
        {minorTicks.map((t) => (
          <div key={`minor-${t}`} className="absolute top-1.5 h-4 w-px -translate-x-1/2 bg-violet-300/70" style={{ left: `${t}%` }} />
        ))}

        {/* ขีดแบ่ง */}
        {ticks.map((t) => {
          const isTarget = mode === "helped" && Math.abs(t - target.value) < 1e-9;
          return (
            <div key={t} className="absolute top-0 -translate-x-1/2" style={{ left: `${t * 100}%` }}>
              <div
                className={cn(
                  "mx-auto w-1 rounded-full",
                  isTarget ? "h-9 animate-pulse bg-amber-400" : "h-9 bg-violet-700",
                  t !== 0 && t !== 1 && !isTarget && "h-7 mt-1 w-0.5 bg-violet-400"
                )}
              />
            </div>
          );
        })}

        {/* จุดเป้าหมาย */}
        <div
          className="absolute top-4 h-4 w-4 -translate-x-1/2 -translate-y-[5px] rounded-full border-2 border-amber-500 bg-yellow-300 shadow-[0_0_10px_3px_rgba(250,204,21,0.7)] transition-[left] duration-500 ease-out"
          style={{ left: `${pct}%` }}
        />

        {/* ป้าย 0 กับ 1 */}
        <div className="absolute left-0 top-10 -translate-x-1/2 text-lg font-extrabold text-violet-900">0</div>
        <div className="absolute right-0 top-10 translate-x-1/2 text-lg font-extrabold text-violet-900">1</div>
      </div>
      <p className="mt-6 text-center text-sm font-extrabold text-violet-700 sm:text-base">
        🐸 กบเกาะอยู่ที่เศษส่วนอะไร? หาบนกระดานแล้วแตะเลย!
      </p>
      {mode === "minimal" && (
        <p className="mt-1 text-center text-xs font-bold text-violet-400">
          ใช้ขีดจาง ๆ ช่วยกะ — ทุกขีดห่างกัน 10% ของเส้น
        </p>
      )}
    </div>
  );
}

/* ── เกมหลัก ── */

export function NumberLineBingo() {
  const [level, setLevel] = useState<Level | null>(null);
  const [board, setBoard] = useState<Cell[]>([]);
  const [marked, setMarked] = useState<boolean[]>([]);
  const [target, setTarget] = useState<Cell | null>(null);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [running, setRunning] = useState(false);
  const [cleared, setCleared] = useState(false); // บิงโกแล้ว รอกดไปต่อ
  const [won, setWon] = useState(false); // ผ่านด่านสุดท้าย
  const [passed, setPassed] = useState(0); // จำนวนด่านที่ผ่าน
  const [stamps, setStamps] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [gameOver, setGameOver] = useState(false);
  const [best, setBest] = useState(0);
  const [wrongIdx, setWrongIdx] = useState<number | null>(null);
  const [showWrong, setShowWrong] = useState(false);
  const [muted, setMuted] = useState(false);

  const mutedRef = useRef(false);
  const { play, ensure } = useSound(mutedRef);

  const finished = !running && !cleared && (timeLeft === 0 || gameOver || won) && level !== null;
  const bingoCells = level ? findBingoLines(marked, level.size).cells : new Set<number>();
  const nextLevel = level ? LEVELS[levelIndex(level) + 1] : undefined;

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  /* นาฬิกา + เสียงนับถอยหลัง 10 วิสุดท้าย */
  useEffect(() => {
    if (!running) return;
    if (timeLeft <= 0) {
      setRunning(false);
      setBest((b) => Math.max(b, passed));
      play("lose");
      return;
    }
    if (timeLeft <= 10) play("tick");
    const id = window.setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, timeLeft]);

  useEffect(() => {
    if (wrongIdx === null) return;
    const id = window.setTimeout(() => setWrongIdx(null), 350);
    return () => window.clearTimeout(id);
  }, [wrongIdx]);

  useEffect(() => {
    if (!showWrong) return;
    const id = window.setTimeout(() => setShowWrong(false), 1000);
    return () => window.clearTimeout(id);
  }, [showWrong]);

  function pickTarget(m: boolean[], b: Cell[]): Cell {
    const open = b.map((_, i) => i).filter((i) => !m[i]);
    return b[open[randInt(0, open.length - 1)]];
  }

  function start(lv: Level) {
    ensure(); // ปลุก AudioContext ด้วย gesture ของผู้ใช้
    const b = buildBoard(lv);
    const m = b.map(() => false);
    setLevel(lv);
    setBoard(b);
    setMarked(m);
    setTarget(pickTarget(m, b));
    setTimeLeft(DURATION);
    setPassed(0);
    setStamps(0);
    setStreak(0);
    setHearts(MAX_HEARTS);
    setCleared(false);
    setWon(false);
    setGameOver(false);
    setRunning(true);
  }

  /** กดปุ่มไปต่อ → ด่านยากขึ้น (นาฬิกาเดินต่อ เติมหัวใจใหม่) */
  function goNext() {
    if (!nextLevel) return;
    const b = buildBoard(nextLevel);
    const m = b.map(() => false);
    setLevel(nextLevel);
    setBoard(b);
    setMarked(m);
    setTarget(pickTarget(m, b));
    setHearts(MAX_HEARTS);
    setStreak(0);
    setCleared(false);
    setRunning(true);
    play("levelup");
  }

  function tap(i: number) {
    if (!running || cleared || !level || !target || marked[i]) return;
    // เทียบด้วย "ค่า" — โหมดเลขซ้ำจะมีหลายช่องถูก เลือกช่องที่บิงโกไวสุดได้เอง
    if (board[i].value !== target.value) {
      setWrongIdx(i);
      setShowWrong(true);
      setStreak(0);
      const left = hearts - 1;
      setHearts(left);
      if (left <= 0) {
        setRunning(false);
        setGameOver(true);
        setBest((b) => Math.max(b, passed));
        play("lose");
      } else {
        play("wrong");
      }
      return;
    }
    const nextMarked = marked.map((v, idx) => (idx === i ? true : v));
    const prevLines = findBingoLines(marked, level.size).count;
    const nowLines = findBingoLines(nextMarked, level.size).count;
    setStamps((s) => s + 1);
    setStreak((s) => s + 1);

    if (nowLines > prevLines) {
      // บิงโก! หยุดด่าน ให้กดไปต่อ
      setMarked(nextMarked);
      setRunning(false);
      const nowPassed = passed + 1;
      setPassed(nowPassed);
      play("bingo");
      if (levelIndex(level) >= LEVELS.length - 1) {
        setWon(true);
        setBest((b) => Math.max(b, nowPassed));
      } else {
        setCleared(true);
      }
      return;
    }

    play("mark");
    setMarked(nextMarked);
    setTarget(pickTarget(nextMarked, board));
  }

  const gridCols =
    level?.size === 3 ? "grid-cols-3" : level?.size === 4 ? "grid-cols-4" : "grid-cols-5";
  const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <Card className="overflow-hidden p-0">
      <style>{`
        @keyframes pop-in { 0% { transform: scale(0.4); opacity: 0; } 60% { transform: scale(1.1); opacity: 1; } 100% { transform: scale(1); } }
      `}</style>

      <div className="flex items-center justify-between bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-2.5 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white/25 text-sm font-extrabold">7</span>
          <h2 className="text-lg font-extrabold">บิงโกเส้นจำนวน 🎯</h2>
        </div>
        <div className="flex items-center gap-2">
          {best > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold">
              <Trophy size={13} /> ผ่านสูงสุด {best} ด่าน
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
        {/* ── เลือกด่านเริ่มต้น ── */}
        {!running && !cleared && !finished && (
          <div className="space-y-4">
            <p className="text-center text-base font-extrabold text-slate-700 sm:text-lg">
              กบเกาะบนเส้นจำนวน — หาเศษส่วนบนกระดานให้ทัน! บิงโกให้ได้เพื่อ<span className="text-fuchsia-600">ไต่ระดับ</span>ให้ครบ 3 ด่านใน 3 นาที
            </p>
            <p className="text-center text-sm font-bold text-rose-500">
              ⚠️ หัวใจ ❤️❤️❤️ ตอบผิดเกิน 3 ครั้ง เกมจบ! · ⏱️ นาฬิกาเดินต่อเนื่องทุกด่าน — รีบให้ทัน!
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {LEVELS.map((lv, i) => (
                <button
                  key={lv.id}
                  onClick={() => start(lv)}
                  className="group flex flex-col items-center gap-1.5 rounded-2xl border-2 border-violet-200 bg-white p-5 transition hover:border-fuchsia-400 hover:bg-fuchsia-50 active:scale-[0.97]"
                >
                  <span className="text-4xl transition group-hover:scale-110">{lv.emoji}</span>
                  <span className="text-lg font-extrabold text-violet-800">
                    ด่าน {i + 1}: {lv.label}
                  </span>
                  <span className="text-sm">{lv.stars}</span>
                  <span className="text-xs font-bold text-slate-500">{lv.hint}</span>
                  <span className="mt-1 flex items-center gap-1 rounded-xl bg-violet-600 px-4 py-1.5 text-sm font-extrabold text-white group-hover:bg-fuchsia-500">
                    <Play size={14} /> เริ่มด่านนี้
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── จบเกม (ชนะครบ / หัวใจหมด / หมดเวลา) ── */}
        {finished && level && (
          <div className="space-y-3">
            <div className={cn("rounded-2xl px-4 py-5 text-center", won ? "bg-amber-100" : gameOver ? "bg-rose-100" : "bg-sky-100")}>
              <p className={cn("text-2xl font-extrabold sm:text-3xl", won ? "text-amber-600" : gameOver ? "text-rose-600" : "text-sky-700")}>
                {won ? "🏆 แชมป์บิงโก!" : gameOver ? "💔 หัวใจหมดแล้ว!" : "⏰ หมดเวลา!"}
              </p>
              <p className={cn("mt-1 text-base font-bold sm:text-lg", won ? "text-amber-700" : gameOver ? "text-rose-500" : "text-sky-600")}>
                {won
                  ? `ผ่านครบทั้ง 3 ด่าน! เหลือเวลา ${clock(timeLeft)} · ประทับตรา ${stamps} ช่อง`
                  : `ผ่านไป ${passed} ด่าน · ประทับตรา ${stamps} ช่อง${gameOver ? " — รอบหน้าดูตำแหน่งกบให้ดีก่อนแตะนะ" : " — เกือบแล้ว รีบอีกนิด!"}`}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => start(LEVELS[0])}
                className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-extrabold text-white shadow transition hover:bg-violet-700 active:scale-[0.98] sm:text-base"
              >
                <RotateCcw size={16} /> เริ่มใหม่ตั้งแต่ด่าน 1
              </button>
              <button
                onClick={() => {
                  setLevel(null);
                  setTimeLeft(DURATION);
                  setWon(false);
                  setGameOver(false);
                }}
                className="rounded-xl border-2 border-violet-300 bg-white px-6 py-2.5 text-sm font-extrabold text-violet-700 transition hover:bg-violet-50 active:scale-[0.98] sm:text-base"
              >
                เลือกด่านเริ่มต้น
              </button>
            </div>
          </div>
        )}

        {/* ── กำลังเล่น / บิงโกแล้วรอไปต่อ ── */}
        {(running || cleared) && level && (
          <div className="relative space-y-4">
            {/* แถบสถานะ */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-xl bg-violet-50 px-4 py-2.5">
              <span
                className={cn(
                  "flex items-center gap-1.5 text-xl font-extrabold sm:text-2xl",
                  timeLeft <= 10 && running ? "animate-pulse text-rose-600" : "text-violet-700"
                )}
              >
                <Timer size={22} /> {clock(timeLeft)}
              </span>
              <span className="rounded-full bg-white px-3 py-1 text-sm font-extrabold text-violet-600">
                ด่าน {levelIndex(level) + 1}/3 · {level.emoji} {level.label}
              </span>
              <span className="text-lg tracking-wide sm:text-xl" aria-label={`หัวใจเหลือ ${hearts}`}>
                {Array.from({ length: MAX_HEARTS }, (_, i) => (i < hearts ? "❤️" : "🖤")).join("")}
              </span>
              {streak >= 3 && <span className="text-lg font-extrabold text-amber-600">🔥 {streak}</span>}
            </div>

            {/* เส้นจำนวน + กบ */}
            {target && <TargetLine target={target} mode={level.ticks} />}

            {/* กระดานบิงโก */}
            <div className={cn("mx-auto grid max-w-xl gap-1.5 sm:gap-2", gridCols)}>
              {board.map((cell, i) => {
                const isMarked = marked[i];
                const inBingo = bingoCells.has(i);
                return (
                  <button
                    key={`${cell.num}/${cell.den}-${i}`}
                    onClick={() => tap(i)}
                    disabled={isMarked || cleared}
                    className={cn(
                      "relative flex aspect-square items-center justify-center rounded-xl border-2 transition",
                      !isMarked && !cleared && "border-violet-200 bg-white hover:border-fuchsia-400 hover:bg-fuchsia-50 active:scale-95",
                      !isMarked && cleared && "border-violet-100 bg-white",
                      isMarked && !inBingo && "border-fuchsia-300 bg-fuchsia-100",
                      isMarked && inBingo && "border-amber-400 bg-amber-100 shadow-[0_0_10px_2px_rgba(251,191,36,0.5)]",
                      wrongIdx === i && "animate-pulse border-rose-400 bg-rose-100"
                    )}
                  >
                    <FractionStack
                      top={cell.num}
                      bottom={cell.den}
                      className={cn(
                        "font-extrabold",
                        level.size === 5 ? "text-base sm:text-xl" : level.size === 4 ? "text-lg sm:text-2xl" : "text-2xl sm:text-3xl",
                        isMarked ? "opacity-15" : "text-violet-800"
                      )}
                    />
                    {/* ตราประทับกบ/ดาว */}
                    {isMarked && (
                      <span className="absolute inset-0 grid place-items-center">
                        <span
                          className={cn(
                            "grid aspect-square w-[68%] -rotate-6 place-items-center rounded-full shadow-md ring-4",
                            level.size === 5 ? "text-2xl sm:text-3xl" : "text-3xl sm:text-4xl",
                            inBingo
                              ? "bg-gradient-to-br from-amber-200 to-orange-300 ring-amber-100"
                              : "bg-gradient-to-br from-lime-200 to-emerald-300 ring-white"
                          )}
                        >
                          <span className="drop-shadow-sm">{inBingo ? "🌟" : "🐸"}</span>
                        </span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ป้ายตอบผิด */}
            {showWrong && running && (
              <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
                <div className="rounded-2xl bg-rose-500/95 px-8 py-4 text-center text-white shadow-2xl">
                  <p className="text-2xl font-extrabold sm:text-3xl">❌ ยังไม่ใช่!</p>
                  <p className="mt-1 text-sm font-bold sm:text-base">
                    ดูตำแหน่งกบอีกครั้ง — เหลือ {Array.from({ length: MAX_HEARTS }, (_, i) => (i < hearts ? "❤️" : "🖤")).join("")}
                  </p>
                </div>
              </div>
            )}

            {/* บิงโก! → ปุ่มไปต่อ */}
            {cleared && nextLevel && (
              <div className="absolute inset-0 z-20 grid place-items-center p-3">
                <div className="w-full max-w-sm rounded-3xl bg-gradient-to-b from-amber-400 to-orange-500 p-6 text-center text-white shadow-2xl" style={{ animation: "pop-in 0.4s both" }}>
                  <p className="text-4xl font-extrabold sm:text-5xl">🎉 บิงโก!</p>
                  <p className="mt-2 text-base font-bold sm:text-lg">
                    ผ่านด่าน {levelIndex(level) + 1} {level.emoji} {level.label} แล้ว!
                  </p>
                  <div className="mt-3 rounded-xl bg-white/20 px-4 py-2 text-sm font-extrabold sm:text-base">
                    ด่านต่อไป: {nextLevel.emoji} {nextLevel.label} {nextLevel.stars}
                    <div className="text-xs font-bold text-white/80">{nextLevel.hint}</div>
                  </div>
                  <button
                    onClick={goNext}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 text-lg font-extrabold text-orange-600 shadow-lg transition hover:bg-amber-50 active:scale-95"
                  >
                    ไปต่อ! <ArrowRight size={20} />
                  </button>
                  <p className="mt-2 text-xs font-bold text-white/80">⏱️ เหลือเวลา {clock(timeLeft)} — นาฬิกาจะเดินต่อทันทีที่กด</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
