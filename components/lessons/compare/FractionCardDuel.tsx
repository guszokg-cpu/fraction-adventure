"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Volume2, VolumeX, Trophy, Swords, GraduationCap } from "lucide-react";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { cn } from "@/lib/cn";
import { randInt } from "@/lib/randomFraction";

/* ── ชนิดข้อมูล ── */

type Frac = { num: number; den: number };
type CardT = { id: number; frac: Frac; tone: number };
type Round = { kind: "normal"; cards: CardT[] } | { kind: "boss"; boss: Frac; cards: CardT[] };
type Phase = "flip" | "pick" | "result";

const DENS = [3, 4, 5, 6, 8, 10, 12];
const QTIME = 15;
const LEVEL_LABELS: Record<number, string> = { 1: "การ์ด 2 ใบ ตัวส่วนเท่ากัน", 2: "การ์ด 3 ใบ", 3: "การ์ด 4 ใบ คละหมด!" };

/* สีการ์ด 4 ตระกูล (ทับทิม/ไพลิน/มรกต/อำพัน) */
const CARD_TONES = [
  { inner: "from-rose-400 via-rose-500 to-pink-600", bar: "bg-rose-400", ring: "border-rose-400", text: "text-rose-700" },
  { inner: "from-sky-400 via-blue-500 to-indigo-600", bar: "bg-sky-400", ring: "border-sky-400", text: "text-sky-700" },
  { inner: "from-emerald-400 via-emerald-500 to-teal-600", bar: "bg-emerald-400", ring: "border-emerald-400", text: "text-emerald-700" },
  { inner: "from-amber-400 via-orange-400 to-orange-600", bar: "bg-amber-400", ring: "border-amber-400", text: "text-amber-700" },
];

/* ── คณิต ── */

const gt = (a: Frac, b: Frac) => a.num * b.den > b.num * a.den;
const eq = (a: Frac, b: Frac) => a.num * b.den === b.num * a.den;

function maxCard(cards: CardT[]): CardT {
  return cards.reduce((m, c) => (gt(c.frac, m.frac) ? c : m), cards[0]);
}

/* ── สุ่มโจทย์ ── */

let cardSeq = 1;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function uniquePush(list: Frac[], f: Frac) {
  if (f.num >= f.den || f.num < 1) return;
  if (list.some((x) => eq(x, f))) return;
  list.push(f);
}

function genNormal(level: number): Round {
  const fr: Frac[] = [];
  if (level === 1) {
    const den = DENS[randInt(1, 4)];
    while (fr.length < 2) uniquePush(fr, { num: randInt(1, den - 1), den });
  } else if (level === 2) {
    if (randInt(0, 1) === 0) {
      const den = DENS[randInt(2, 5)];
      while (fr.length < 3) uniquePush(fr, { num: randInt(1, den - 1), den });
    } else {
      const num = randInt(1, 3);
      const opts = DENS.filter((d) => d > num);
      while (fr.length < 3) uniquePush(fr, { num, den: opts[randInt(0, opts.length - 1)] });
    }
  } else {
    let guard = 0;
    while (fr.length < 4 && guard++ < 200) {
      const den = DENS[randInt(0, DENS.length - 1)];
      uniquePush(fr, { num: randInt(1, den - 1), den });
    }
  }
  const tones = shuffle([0, 1, 2, 3]);
  return { kind: "normal", cards: shuffle(fr).map((f, i) => ({ id: cardSeq++, frac: f, tone: tones[i % 4] })) };
}

function genBoss(): Round {
  // บอสถือค่ากลาง ๆ — มือเรา 3 ใบ ไม่มีใบไหนเท่าบอส และมีอย่างน้อย 1 ใบชนะ
  for (let t = 0; t < 100; t++) {
    const bd = DENS[randInt(1, 4)];
    const boss = { num: randInt(Math.ceil(bd / 4), Math.floor((bd * 3) / 4)), den: bd };
    if (boss.num < 1 || boss.num >= bd) continue;
    const hand: Frac[] = [];
    let guard = 0;
    while (hand.length < 3 && guard++ < 200) {
      const den = DENS[randInt(0, DENS.length - 1)];
      const f = { num: randInt(1, den - 1), den };
      if (eq(f, boss)) continue;
      uniquePush(hand, f);
    }
    if (hand.length === 3 && hand.some((f) => gt(f, boss))) {
      const tones = shuffle([0, 1, 2, 3]);
      return { kind: "boss", boss, cards: shuffle(hand).map((f, i) => ({ id: cardSeq++, frac: f, tone: tones[i % 4] })) };
    }
  }
  return { kind: "boss", boss: { num: 1, den: 2 }, cards: [
    { id: cardSeq++, frac: { num: 3, den: 4 }, tone: 0 },
    { id: cardSeq++, frac: { num: 1, den: 4 }, tone: 1 },
    { id: cardSeq++, frac: { num: 1, den: 3 }, tone: 2 },
  ] };
}

/* ── เอฟเฟกต์เสียง ── */

type SoundKind = "flip" | "correct" | "wrong" | "combo" | "boss" | "bossWin" | "levelup" | "over" | "start" | "tick";

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
      case "flip": return sweep(260, 1040, 0.18, "triangle", 0.09);
      case "correct": return tones([660, 990, 1319], 0.06, 0.1, "triangle", 0.14);
      case "wrong": return tones([200, 130], 0.11, 0.18, "sawtooth", 0.12);
      case "combo": return tones([659, 880, 1047, 1319], 0.05, 0.11, "triangle", 0.15);
      case "boss": return tones([196, 185, 196, 147], 0.16, 0.32, "sawtooth", 0.09);
      case "bossWin": return tones([523, 659, 784, 1047, 1319, 1568], 0.08, 0.16, "triangle", 0.15);
      case "levelup": return tones([523, 659, 784, 1047, 1319], 0.07, 0.13, "triangle", 0.15);
      case "over": return tones([392, 330, 262, 196], 0.14, 0.2, "triangle", 0.13);
      case "start": return tones([523, 659, 784, 1047], 0.07, 0.12, "triangle", 0.14);
      case "tick": return tones([1318], 0.01, 0.05, "square", 0.05);
    }
  }
  return { play, ensure };
}

/* ── เพลงชิปทูน 8-bit (แต่งเองด้วย Web Audio — ไม่ใช้ไฟล์) ── */

// โน้ต MIDI (0 = เงียบ) — ท่อนปกติ: สดใสคีย์ C เมเจอร์ / ท่อนบอส: ตึงเครียดคีย์ A ไมเนอร์
const LEAD = [76, 79, 81, 79, 76, 74, 72, 74, 76, 76, 79, 76, 74, 72, 69, 72, 74, 77, 81, 77, 74, 72, 71, 72, 74, 76, 77, 76, 74, 72, 71, 67];
const BASS = [48, 55, 45, 52, 41, 48, 43, 43, 50, 57, 47, 54, 43, 50, 43, 43];
const BOSS_LEAD = [69, 0, 69, 71, 72, 71, 69, 68, 69, 0, 69, 71, 72, 74, 72, 71, 69, 0, 69, 71, 72, 71, 69, 68, 64, 65, 67, 68, 69, 68, 67, 64];
const BOSS_BASS = [45, 45, 41, 41, 43, 43, 44, 44, 45, 45, 41, 41, 43, 44, 45, 45];

function useChiptune(mutedRef: React.MutableRefObject<boolean>, ctxRef: React.MutableRefObject<AudioContext | null>) {
  const timerRef = useRef<number | null>(null);
  const stepRef = useRef(0);
  const bossRef = useRef(false);

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
      const lead = bossRef.current ? BOSS_LEAD : LEAD;
      const bass = bossRef.current ? BOSS_BASS : BASS;
      const m = lead[s];
      if (m) note(m, 0.16, "square", 0.03);
      if (s % 2 === 0) {
        const b = bass[s / 2];
        if (b) note(b, 0.28, "triangle", 0.05);
      }
    }, 200);
  }
  function stop() {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }
  function setBoss(b: boolean) { bossRef.current = b; }
  useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);
  return { start, stop, setBoss };
}

/* ── วงกลมพายบนหน้าการ์ด ── */

function CardPie({ frac }: { frac: Frac }) {
  const cx = 21, cy = 21, r = 17;
  const slices = Array.from({ length: frac.den }, (_, i) => {
    const a0 = (-90 + (i * 360) / frac.den) * (Math.PI / 180);
    const a1 = (-90 + ((i + 1) * 360) / frac.den) * (Math.PI / 180);
    const large = 360 / frac.den > 180 ? 1 : 0;
    const d = `M ${cx} ${cy} L ${cx + r * Math.cos(a0)} ${cy + r * Math.sin(a0)} A ${r} ${r} 0 ${large} 1 ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)} Z`;
    return { d, filled: i < frac.num };
  });
  return (
    <svg viewBox="0 0 42 42" className="h-10 w-10 sm:h-11 sm:w-11" aria-hidden>
      {slices.map((s, i) => (
        <path key={i} d={s.d} fill={s.filled ? "#ffffff" : "rgba(255,255,255,0.22)"} stroke="rgba(255,255,255,0.75)" strokeWidth="1" />
      ))}
    </svg>
  );
}

/* ── การ์ด (พลิก 3 มิติ) ── */

function DuelCard({ card, flipped, delay, state, onPick, disabled }: {
  card: CardT; flipped: boolean; delay: number; state: "idle" | "win" | "lose" | "dim"; onPick: () => void; disabled: boolean;
}) {
  const tone = CARD_TONES[card.tone];
  return (
    <button
      onClick={onPick}
      disabled={disabled}
      className={cn(
        "group relative transition-transform duration-300 [perspective:700px]",
        !disabled && "hover:-translate-y-2 active:scale-95",
        state === "win" && "-translate-y-2 scale-105",
        state === "lose" && "card-shake",
        state === "dim" && "opacity-50",
      )}
    >
      <div
        className="relative h-40 w-28 transition-transform duration-700 [transform-style:preserve-3d] sm:h-44 sm:w-32"
        style={{ transform: flipped ? "rotateY(0deg)" : "rotateY(180deg)", transitionDelay: `${delay}ms` }}
      >
        {/* หน้าการ์ด */}
        <div className={cn("absolute inset-0 rounded-2xl bg-gradient-to-b from-yellow-200 via-amber-400 to-yellow-600 p-[3px] shadow-lg [backface-visibility:hidden]", state === "win" && "shadow-[0_0_26px_rgba(251,191,36,0.9)]")}>
          <div className={cn("relative flex h-full w-full flex-col items-center justify-center gap-1.5 overflow-hidden rounded-[13px] bg-gradient-to-b", tone.inner)}>
            <span className="pointer-events-none absolute left-1.5 top-1 text-[10px] text-white/70">✦</span>
            <span className="pointer-events-none absolute right-1.5 top-1 text-[10px] text-white/70">✦</span>
            <span className="pointer-events-none absolute bottom-1 left-1.5 text-[10px] text-white/70">✦</span>
            <span className="pointer-events-none absolute bottom-1 right-1.5 text-[10px] text-white/70">✦</span>
            <StackedFraction numerator={card.frac.num} denominator={card.frac.den} className="text-2xl drop-shadow sm:text-3xl" toneClassName="text-white" />
            <CardPie frac={card.frac} />
          </div>
        </div>
        {/* หลังการ์ด */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-yellow-200 via-amber-400 to-yellow-600 p-[3px] shadow-lg [backface-visibility:hidden]" style={{ transform: "rotateY(180deg)" }}>
          <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[13px] bg-gradient-to-br from-violet-700 via-indigo-800 to-slate-900">
            <span className="pointer-events-none absolute left-2 top-2 text-xs text-amber-300/80">⭐</span>
            <span className="pointer-events-none absolute right-2 top-5 text-[10px] text-amber-200/60">✦</span>
            <span className="pointer-events-none absolute bottom-3 left-3 text-[10px] text-amber-200/60">✦</span>
            <span className="pointer-events-none absolute bottom-2 right-2 text-xs text-amber-300/80">🌙</span>
            <span className="grid h-12 w-12 place-items-center rounded-full border-2 border-amber-300 text-xl font-black text-amber-300">?</span>
          </div>
        </div>
      </div>
      {/* วงแหวนเฉลย */}
      {state === "win" && <span className="pointer-events-none absolute -inset-1 rounded-3xl border-4 border-amber-300" />}
    </button>
  );
}

/* ── แถบเทียบค่า (เฉลย) ── */

function DuelBars({ cards, boss }: { cards: CardT[]; boss?: Frac }) {
  const winner = maxCard(cards);
  const row = (f: Frac, barCls: string, label: React.ReactNode, highlight: boolean) => (
    <div className={cn("flex items-center gap-2 rounded-xl px-2 py-1", highlight && "bg-amber-100/70 ring-1 ring-amber-300")}>
      <span className="w-7 text-center text-base">{label}</span>
      <StackedFraction numerator={f.num} denominator={f.den} className="w-9 shrink-0 text-sm" toneClassName="text-slate-700" />
      <div className="flex h-6 flex-1 overflow-hidden rounded-lg border-2 border-slate-300 bg-white">
        {Array.from({ length: f.den }, (_, i) => (
          <div key={i} className={cn("flex-1 border-r border-slate-300/60 last:border-r-0", i < f.num && barCls)} />
        ))}
      </div>
    </div>
  );
  return (
    <div className="mx-auto max-w-md space-y-1">
      {boss && row(boss, "bg-slate-600", "🐉", false)}
      {[...cards].sort((a, b) => b.frac.num * a.frac.den - a.frac.num * b.frac.den).map((c) => (
        <div key={c.id}>{row(c.frac, CARD_TONES[c.tone].bar, boss ? (gt(c.frac, boss) ? "⚔️" : "✖") : c.id === winner.id ? "🥇" : "", boss ? gt(c.frac, boss) : c.id === winner.id)}</div>
      ))}
    </div>
  );
}

/* ── เกมหลัก ── */

export function FractionCardDuel() {
  const [mode, setMode] = useState<"duel" | "practice">("duel");
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  useEffect(() => { mutedRef.current = muted; }, [muted]);
  const ctxRef = useRef<AudioContext | null>(null);
  const { play, ensure } = useSound(mutedRef, ctxRef);
  const bgm = useChiptune(mutedRef, ctxRef);

  const [started, setStarted] = useState(false);
  const [over, setOver] = useState(false);
  const [round, setRound] = useState(1);
  const [data, setData] = useState<Round>(() => genNormal(1));
  const [phase, setPhase] = useState<Phase>("flip");
  const [flipped, setFlipped] = useState(false);
  const [chosen, setChosen] = useState<number | null>(null);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QTIME);
  const [pLevel, setPLevel] = useState(1);
  const prevLevelRef = useRef(1);

  const level = correctCount >= 8 ? 3 : correctCount >= 4 ? 2 : 1;
  const isBossRound = data.kind === "boss";
  const active = mode === "practice" || (started && !over);

  /* เพลงประกอบ: เล่นระหว่างเกม + สลับท่อนบอสอัตโนมัติ */
  useEffect(() => {
    if (active) bgm.start();
    else bgm.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
  useEffect(() => {
    bgm.setBoss(isBossRound);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBossRound]);

  /* ลำดับพลิกการ์ดเมื่อขึ้นตาใหม่ */
  useEffect(() => {
    setFlipped(false);
    setChosen(null);
    setPhase("flip");
    const t1 = window.setTimeout(() => { setFlipped(true); play("flip"); if (data.kind === "boss") play("boss"); }, 300);
    const t2 = window.setTimeout(() => { setPhase("pick"); setTimeLeft(QTIME); }, 300 + 750 + data.cards.length * 120);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  function isCorrectPick(id: number | null): boolean {
    if (id === null) return false;
    const card = data.cards.find((c) => c.id === id);
    if (!card) return false;
    return data.kind === "boss" ? gt(card.frac, data.boss) : card.id === maxCard(data.cards).id;
  }

  function handlePick(id: number | null) {
    if (phase !== "pick") return;
    setChosen(id);
    setPhase("result");
    const ok = isCorrectPick(id);
    if (mode === "practice") {
      play(ok ? "correct" : "wrong");
      return;
    }
    if (ok) {
      const nc = combo + 1;
      setCombo(nc);
      setCorrectCount((c) => c + 1);
      setScore((sc) => sc + (data.kind === "boss" ? 30 : 10) + Math.min(20, (nc - 1) * 5));
      play(data.kind === "boss" ? "bossWin" : nc >= 3 ? "combo" : "correct");
    } else {
      setCombo(0);
      setLives((lv) => lv - 1);
      play("wrong");
    }
  }
  const pickRef = useRef(handlePick);
  useEffect(() => { pickRef.current = handlePick; });

  /* จับเวลา (เฉพาะโหมดดวล) */
  useEffect(() => {
    if (!(mode === "duel" && started && !over && phase === "pick")) return;
    const id = window.setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => window.clearInterval(id);
  }, [mode, started, over, phase, round]);
  useEffect(() => {
    if (mode !== "duel" || !started || over || phase !== "pick") return;
    if (timeLeft === 0) pickRef.current(null);
    else if (timeLeft <= 3) play("tick");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, mode, started, over, phase]);

  function nextRound() {
    const r = round + 1;
    setRound(r);
    if (mode === "practice") { setData(genNormal(pLevel)); return; }
    const lv = correctCount >= 8 ? 3 : correctCount >= 4 ? 2 : 1;
    if (lv > prevLevelRef.current) play("levelup");
    prevLevelRef.current = lv;
    setData(r % 5 === 0 ? genBoss() : genNormal(lv));
  }

  function start() {
    ensure();
    play("start");
    setLives(3); setScore(0); setCombo(0); setCorrectCount(0); setOver(false);
    prevLevelRef.current = 1;
    setRound(1);
    setData(genNormal(1));
    setStarted(true);
  }

  function finish() {
    setBest((b) => Math.max(b, score));
    setOver(true);
    play("over");
  }

  const ok = isCorrectPick(chosen);
  const cardState = (c: CardT): "idle" | "win" | "lose" | "dim" => {
    if (phase !== "result") return "idle";
    const isWinCard = data.kind === "boss" ? gt(c.frac, data.boss) : c.id === maxCard(data.cards).id;
    if (isWinCard) return "win";
    if (c.id === chosen) return "lose";
    return "dim";
  };

  return (
    <div className="relative overflow-hidden rounded-2xl p-3 sm:p-4">
      {/* พื้นหลังสังเวียน: ปกติ=ม่วงอบอุ่น / บอส=มืดทะมึน */}
      <div className={cn("absolute inset-0 transition-colors duration-700", isBossRound && phase !== "result" && active ? "bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900" : "bg-gradient-to-b from-violet-100 via-fuchsia-50 to-amber-50")} />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <span className="absolute left-6 top-8 text-amber-400/60">✦</span>
        <span className="absolute right-10 top-14 text-violet-400/60">✦</span>
        <span className="absolute bottom-10 left-12 text-fuchsia-400/50">✦</span>
        <span className="absolute bottom-16 right-8 text-amber-400/60">✦</span>
      </div>
      <style>{`
        @keyframes cardShake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-7px); } 40% { transform: translateX(7px); } 60% { transform: translateX(-5px); } 80% { transform: translateX(5px); } }
        .card-shake { animation: cardShake 0.45s ease-in-out; }
        @keyframes bossIn { 0% { transform: translateY(-24px) scale(0.8); opacity: 0; } 60% { transform: translateY(4px) scale(1.05); } 100% { transform: translateY(0) scale(1); opacity: 1; } }
      `}</style>

      <div className="relative space-y-4">
        {/* แถบโหมด + ปิดเสียง */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex rounded-xl border-2 border-slate-200 bg-white p-1">
            <button onClick={() => { setMode("duel"); setStarted(false); setOver(false); }} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "duel" ? "bg-fuchsia-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <Swords size={15} /> โหมดดวล
            </button>
            <button onClick={() => { setMode("practice"); setRound(1); setData(genNormal(pLevel)); }} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "practice" ? "bg-violet-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <GraduationCap size={15} /> โหมดฝึกซ้อม
            </button>
          </div>
          <button onClick={() => setMuted((m) => !m)} className="grid h-9 w-9 place-items-center rounded-xl border-2 border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50" title={muted ? "เปิดเสียง" : "ปิดเสียง"}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {/* ═══ หน้าเริ่ม (โหมดดวล) ═══ */}
        {mode === "duel" && !started && (
          <div className="space-y-4 rounded-2xl border-2 border-fuchsia-200 bg-white/85 p-6 text-center">
            <div className="text-5xl">🃏⚔️🐉</div>
            <h3 className="text-xl font-extrabold text-slate-800 sm:text-2xl">ดวลการ์ดเศษส่วน</h3>
            <p className="mx-auto max-w-md text-sm font-bold text-slate-500 sm:text-base">
              การ์ดพลิกเปิดพร้อมกัน — แตะ <b>ใบที่ค่ามากที่สุด</b> ให้ทันเวลา! ทุก 5 ตา <b>มังกรบอส</b> จะมาท้าดวล 🐉
            </p>
            <div className="mx-auto flex max-w-md flex-wrap justify-center gap-2 text-xs font-extrabold text-slate-600">
              <span className="rounded-full bg-amber-100 px-3 py-1">⏱ ตาละ {QTIME} วิ</span>
              <span className="rounded-full bg-rose-100 px-3 py-1">❤️ พลาดได้ 3 ครั้ง</span>
              <span className="rounded-full bg-violet-100 px-3 py-1">🐉 รอบบอสทุก 5 ตา (+30)</span>
              <span className="rounded-full bg-orange-100 px-3 py-1">🔥 คอมโบสะสมคะแนน</span>
            </div>
            {best > 0 && <p className="flex items-center justify-center gap-1.5 text-sm font-extrabold text-amber-600"><Trophy size={15} /> คะแนนสูงสุด {best}</p>}
            <button onClick={start} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
              <Play size={20} /> เริ่มดวล!
            </button>
          </div>
        )}

        {/* ═══ จบเกม ═══ */}
        {mode === "duel" && started && over && (
          <div className="space-y-4 rounded-2xl border-2 border-amber-200 bg-white/85 p-6 text-center">
            <div className="text-5xl">🏆🃏</div>
            <h3 className="text-xl font-extrabold text-slate-800 sm:text-2xl">จบการดวล — เก่งมาก!</h3>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-base font-extrabold sm:text-lg">
              <span className="text-amber-700">🏅 คะแนน {score}</span>
              <span className="text-emerald-700">✅ ชนะ {correctCount} ตา</span>
              <span className="flex items-center gap-1 text-slate-500"><Trophy size={16} /> สูงสุด {Math.max(best, score)}</span>
            </div>
            <p className="text-sm font-bold text-slate-500">
              {score >= 150 ? "🌟🌟🌟 จอมยุทธ์การ์ดตัวจริง!" : score >= 80 ? "🌟🌟 ฝีมือใกล้ระดับเซียนแล้ว!" : "🌟 ฝึกอีกนิด เดี๋ยวก็อ่านการ์ดขาด!"}
            </p>
            <button onClick={start} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
              <RotateCcw size={18} /> ดวลอีกครั้ง
            </button>
          </div>
        )}

        {/* ═══ กระดานดวล (โหมดดวลที่เริ่มแล้ว / โหมดฝึกซ้อม) ═══ */}
        {active && !(mode === "duel" && !started) && (
          <div className="space-y-3">
            {/* แถบสถานะ */}
            {mode === "duel" ? (
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 rounded-2xl bg-white/80 px-4 py-2.5 ring-1 ring-amber-200">
                <span className="text-lg font-extrabold text-amber-700 sm:text-xl">🏅 {score}</span>
                <span className="flex items-center gap-1.5 text-sm font-extrabold text-slate-600">
                  ⏱ {timeLeft} วิ
                  <span className="inline-block h-2 w-16 overflow-hidden rounded-full bg-slate-200 align-middle">
                    <span className={cn("block h-full rounded-full transition-all", timeLeft > 5 ? "bg-emerald-500" : "bg-rose-500")} style={{ width: `${(timeLeft / QTIME) * 100}%` }} />
                  </span>
                </span>
                <span className="text-base tracking-wider">{Array.from({ length: 3 }, (_, i) => (i < lives ? "❤️" : "🤍")).join("")}</span>
                <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-extrabold text-violet-700">⛰ ระดับ {level} — {LEVEL_LABELS[level]}</span>
                {combo >= 2 && <span className="text-base font-extrabold text-orange-600">🔥 x{combo}</span>}
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-white/80 px-4 py-2 ring-1 ring-violet-200">
                <span className="text-sm font-extrabold text-violet-700">🎓 ฝึกซ้อม — ไม่มีเวลา ไม่มีหัวใจ เฉลยละเอียดทุกตา</span>
                <div className="flex gap-1">
                  {[1, 2, 3].map((lv) => (
                    <button key={lv} onClick={() => { setPLevel(lv); setData(genNormal(lv)); }} className={cn("rounded-lg border-2 px-2.5 py-1 text-xs font-extrabold transition", pLevel === lv && data.kind === "normal" ? "border-violet-400 bg-violet-100 text-violet-700" : "border-slate-200 bg-white text-slate-400 hover:bg-slate-50")}>
                      ระดับ {lv}
                    </button>
                  ))}
                  <button onClick={() => setData(genBoss())} className={cn("rounded-lg border-2 px-2.5 py-1 text-xs font-extrabold transition", data.kind === "boss" ? "border-rose-400 bg-rose-100 text-rose-700" : "border-slate-200 bg-white text-slate-400 hover:bg-slate-50")}>
                    🐉 รอบบอส
                  </button>
                </div>
              </div>
            )}

            {/* บอส */}
            {data.kind === "boss" && (
              <div className="mx-auto max-w-lg rounded-2xl border-2 border-rose-400/60 bg-slate-900/90 p-3 text-center" style={{ animation: "bossIn 0.6s ease-out" }}>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-5xl sm:text-6xl">🐉</span>
                  <div className="text-left">
                    <p className="text-xs font-extrabold text-rose-300">มังกรบอสปรากฏตัว!</p>
                    <p className="text-sm font-extrabold text-white sm:text-base">&quot;จงเลือกการ์ดที่ <u>ชนะข้า</u> ถ้าทำได้!&quot;</p>
                  </div>
                  <div className="rounded-xl bg-gradient-to-b from-slate-600 to-slate-800 p-[3px] shadow-lg">
                    <div className="flex h-24 w-[4.5rem] flex-col items-center justify-center gap-1 rounded-lg bg-gradient-to-b from-slate-700 to-slate-900">
                      <StackedFraction numerator={data.boss.num} denominator={data.boss.den} className="text-lg" toneClassName="text-rose-300" />
                      <CardPie frac={data.boss} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* คำสั่ง */}
            <p className={cn("text-center text-base font-extrabold sm:text-lg", isBossRound && phase !== "result" ? "text-amber-300" : "text-slate-700")}>
              {phase === "flip" ? "🃏 เปิดการ์ด..." : phase === "pick" ? (isBossRound ? "⚔️ เลือกการ์ดที่มากกว่าของบอส!" : "👆 แตะการ์ดที่ค่ามากที่สุด!") : ok ? "✅ ถูกต้อง! เก่งมาก" : chosen === null ? "⏰ หมดเวลา!" : "❌ ยังไม่ใช่ใบนั้น"}
            </p>

            {/* การ์ด */}
            <div className="flex flex-wrap items-center justify-center gap-3 py-2 sm:gap-4">
              {data.cards.map((c, i) => (
                <DuelCard key={c.id} card={c} flipped={flipped} delay={i * 120} state={cardState(c)} onPick={() => handlePick(c.id)} disabled={phase !== "pick"} />
              ))}
            </div>

            {/* เฉลย */}
            {phase === "result" && (
              <div className="space-y-3 rounded-2xl border-2 border-emerald-200 bg-emerald-50/80 p-3">
                <p className="text-center text-sm font-extrabold text-emerald-700">
                  💡 {data.kind === "boss" ? <>การ์ดที่ชนะบอส (มากกว่า <b>{data.boss.num}/{data.boss.den}</b>) คือแถวที่มี ⚔️</> : <>เรียงจากมากไปน้อย — ใบ 🥇 คือคำตอบ</>}
                </p>
                <DuelBars cards={data.cards} boss={data.kind === "boss" ? data.boss : undefined} />
                <div className="text-center">
                  {mode === "duel" && lives <= 0 ? (
                    <button onClick={finish} className="inline-flex items-center gap-2 rounded-xl bg-slate-700 px-6 py-2.5 text-base font-extrabold text-white shadow transition hover:bg-slate-800 active:scale-[0.98]">
                      🏁 ดูสรุปผล
                    </button>
                  ) : (
                    <button onClick={nextRound} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-500 px-6 py-2.5 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                      🃏 ตาต่อไป
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
