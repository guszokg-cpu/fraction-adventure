"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Trophy, Volume2, VolumeX, Eye } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FractionText } from "@/components/fractions/FractionText";
import { Frac } from "@/components/lessons/Frac";
import { cn } from "@/lib/cn";
import { generateDrawChallenge, toMixedNumber, type FractionKind } from "@/lib/fractionUtils";
import { randInt, shuffle } from "@/lib/randomFraction";

const PRACTICE_COUNT = 10;
const MAX_HEARTS = 3;
const GEM_CHANCE = 0.15;
const STAR_GOALS: [number, number, number] = [10, 18, 28];

/* ── หีบสมบัติ 3 ใบ ── */

type ChestVariant = "green" | "orange" | "purple";

type Chest = {
  kind: FractionKind;
  title: string;
  hint: string;
  variant: ChestVariant;
  cardBg: string;
  cardRing: string;
  text: string;
};

const CHESTS: Chest[] = [
  { kind: "proper", title: "เศษส่วนแท้", hint: "ตัวเศษ < ตัวส่วน", variant: "green", cardBg: "bg-emerald-50", cardRing: "ring-emerald-200 hover:ring-emerald-400", text: "text-emerald-700" },
  { kind: "improper", title: "เศษเกิน", hint: "ตัวเศษ ≥ ตัวส่วน", variant: "orange", cardBg: "bg-orange-50", cardRing: "ring-orange-200 hover:ring-orange-400", text: "text-orange-600" },
  { kind: "mixed", title: "จำนวนคละ", hint: "จำนวนเต็ม + เศษส่วนแท้", variant: "purple", cardBg: "bg-violet-50", cardRing: "ring-violet-200 hover:ring-violet-400", text: "text-violet-700" },
];

const KIND_LABEL: Record<FractionKind, string> = { proper: "เศษส่วนแท้", improper: "เศษเกิน", mixed: "จำนวนคละ" };

/* ── การ์ดเศษส่วน ── */

type GameCard = { id: string; kind: FractionKind; whole: number; numerator: number; denominator: number; gem: boolean };

let cardSeq = 1;

function makeCard(kind: FractionKind, gem = false): GameCard {
  const c = generateDrawChallenge([kind]);
  if (kind === "mixed") {
    const m = toMixedNumber(c.numerator, c.denominator);
    return { id: `card-${cardSeq++}`, kind, whole: m.whole, numerator: m.numerator, denominator: m.denominator, gem };
  }
  return { id: `card-${cardSeq++}`, kind, whole: 0, numerator: c.numerator, denominator: c.denominator, gem };
}

function makeDeck(): GameCard[] {
  const kinds: FractionKind[] = ["proper", "proper", "proper", "improper", "improper", "improper", "mixed", "mixed", "mixed", "mixed"];
  return shuffle(kinds).slice(0, PRACTICE_COUNT).map((k) => makeCard(k));
}

function randomMineCard(): GameCard {
  const kinds: FractionKind[] = ["proper", "improper", "mixed"];
  return makeCard(kinds[randInt(0, kinds.length - 1)], Math.random() < GEM_CHANCE);
}

function reasonFor(c: GameCard): string {
  if (c.kind === "proper") return `${c.numerator}/${c.denominator} เป็นเศษส่วนแท้ เพราะ ${c.numerator} น้อยกว่า ${c.denominator}`;
  if (c.kind === "improper") {
    if (c.numerator === c.denominator) return `${c.numerator}/${c.denominator} เป็นเศษเกิน เพราะตัวเศษเท่ากับตัวส่วน และมีค่าเท่ากับ 1`;
    return `${c.numerator}/${c.denominator} เป็นเศษเกิน เพราะ ${c.numerator} มากกว่า ${c.denominator}`;
  }
  return `${c.whole} ${c.numerator}/${c.denominator} เป็นจำนวนคละ เพราะมีจำนวนเต็ม ${c.whole} นำหน้า`;
}

function starsFor(score: number): number {
  const [a, b, c] = STAR_GOALS;
  return score >= c ? 3 : score >= b ? 2 : score >= a ? 1 : 0;
}

/* ── ระบบเสียง (Web Audio API) ── */

type SoundKind = "coin" | "gem" | "wrong" | "combo" | "depth" | "miss" | "over";

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
      case "coin": return tones([784, 1047, 1319], 0.05, 0.09, "triangle", 0.14);
      case "gem": return tones([1047, 1319, 1568, 2093], 0.05, 0.1, "triangle", 0.15);
      case "combo": return tones([659, 880, 1047, 1319], 0.05, 0.11, "triangle", 0.15);
      case "depth": return tones([392, 523, 659, 784, 1047], 0.07, 0.13, "triangle", 0.16);
      case "wrong": return tones([200, 130], 0.11, 0.16, "sawtooth", 0.12);
      case "miss": return tones([330, 220, 165], 0.1, 0.18, "sawtooth", 0.13);
      case "over": return tones([392, 311, 233], 0.14, 0.22, "sawtooth", 0.14);
    }
  }
  return { play, ensure };
}

/* ════════════════ SVG ART ════════════════ */

/** หีบสมบัติแบบภาพวาด: ฝาโค้งคาดทอง ฝังเพชรกลางฝา */
function ChestSVG({ variant, open, className }: { variant: ChestVariant; open: boolean; className?: string }) {
  const P = {
    green: { lidA: "#4ade80", lidB: "#15803d", bodyA: "#166534", bodyB: "#14532d", gem: "#34d399", gemD: "#059669" },
    orange: { lidA: "#fb923c", lidB: "#c2410c", bodyA: "#9a3412", bodyB: "#7c2d12", gem: "#fb923c", gemD: "#ea580c" },
    purple: { lidA: "#a78bfa", lidB: "#6d28d9", bodyA: "#5b21b6", bodyB: "#4c1d95", gem: "#a78bfa", gemD: "#7c3aed" },
  }[variant];
  const uid = variant;
  return (
    <svg viewBox="0 0 120 100" className={className} role="img" aria-label={`หีบสมบัติสี${variant}`}>
      <defs>
        <linearGradient id={`lid-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={P.lidA} />
          <stop offset="1" stopColor={P.lidB} />
        </linearGradient>
        <linearGradient id={`body-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={P.bodyA} />
          <stop offset="1" stopColor={P.bodyB} />
        </linearGradient>
        <linearGradient id={`gold-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fde68a" />
          <stop offset="0.5" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#b45309" />
        </linearGradient>
      </defs>

      {/* ตัวหีบ */}
      <rect x="12" y="46" width="96" height="46" rx="7" fill={`url(#body-${uid})`} stroke="#3f2d10" strokeWidth="2" />
      {/* ลายไม้ */}
      <line x1="38" y1="48" x2="38" y2="90" stroke="#00000030" strokeWidth="2" />
      <line x1="60" y1="48" x2="60" y2="90" stroke="#00000030" strokeWidth="2" />
      <line x1="82" y1="48" x2="82" y2="90" stroke="#00000030" strokeWidth="2" />
      {/* ขอบทองล่าง */}
      <rect x="12" y="84" width="96" height="8" rx="4" fill={`url(#gold-${uid})`} stroke="#78350f" strokeWidth="1.5" />
      {/* มุมทอง */}
      <rect x="12" y="46" width="10" height="12" rx="3" fill={`url(#gold-${uid})`} />
      <rect x="98" y="46" width="10" height="12" rx="3" fill={`url(#gold-${uid})`} />
      {/* แผ่นล็อกทอง */}
      <rect x="50" y="46" width="20" height="16" rx="4" fill={`url(#gold-${uid})`} stroke="#78350f" strokeWidth="1.5" />
      <circle cx="60" cy="53" r="3" fill="#78350f" />

      {/* ฝาหีบ (เปิดได้) */}
      <g style={{ transform: open ? "translateY(-10px) rotate(-22deg)" : "none", transformOrigin: "14px 46px", transition: "transform .3s ease" }}>
        <path d="M12,46 L12,30 Q12,10 34,10 L86,10 Q108,10 108,30 L108,46 Z" fill={`url(#lid-${uid})`} stroke="#3f2d10" strokeWidth="2" />
        {/* คาดทองขอบฝา */}
        <rect x="12" y="38" width="96" height="9" rx="4" fill={`url(#gold-${uid})`} stroke="#78350f" strokeWidth="1.5" />
        {/* สายรัดทอง */}
        <rect x="28" y="11" width="9" height="30" rx="3" fill={`url(#gold-${uid})`} opacity="0.95" />
        <rect x="83" y="11" width="9" height="30" rx="3" fill={`url(#gold-${uid})`} opacity="0.95" />
        {/* เพชรกลางฝา */}
        <polygon points="60,16 70,25 60,36 50,25" fill={P.gem} stroke={P.gemD} strokeWidth="2" />
        <polygon points="60,19 66,25 60,32 54,25" fill="#ffffff" opacity="0.45" />
      </g>

      {/* ประกายเมื่อเปิด */}
      {open && (
        <>
          <circle cx="30" cy="8" r="2.5" fill="#fde047" />
          <circle cx="90" cy="6" r="2" fill="#fde047" />
          <circle cx="60" cy="2" r="2" fill="#fef9c3" />
        </>
      )}
    </svg>
  );
}

/** รถรางไม้ล้อเหล็ก */
function CartSVG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 150 78" className={className} role="img" aria-label="รถรางเหมือง">
      <defs>
        <linearGradient id="cart-wood" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b45309" />
          <stop offset="1" stopColor="#713f12" />
        </linearGradient>
        <linearGradient id="cart-metal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#94a3b8" />
          <stop offset="1" stopColor="#475569" />
        </linearGradient>
      </defs>
      {/* ขอบเหล็กบน */}
      <rect x="10" y="8" width="130" height="12" rx="5" fill="url(#cart-metal)" stroke="#1e293b" strokeWidth="2" />
      <circle cx="24" cy="14" r="2.2" fill="#e2e8f0" />
      <circle cx="75" cy="14" r="2.2" fill="#e2e8f0" />
      <circle cx="126" cy="14" r="2.2" fill="#e2e8f0" />
      {/* ตัวถังไม้ */}
      <path d="M16,20 L134,20 L120,58 L30,58 Z" fill="url(#cart-wood)" stroke="#451a03" strokeWidth="2.5" />
      <line x1="22" y1="32" x2="128" y2="32" stroke="#451a03" strokeWidth="2" opacity="0.55" />
      <line x1="27" y1="45" x2="123" y2="45" stroke="#451a03" strokeWidth="2" opacity="0.55" />
      {/* ล้อ */}
      <circle cx="48" cy="66" r="11" fill="#292524" stroke="#78716c" strokeWidth="3" />
      <circle cx="48" cy="66" r="4" fill="#a8a29e" />
      <circle cx="102" cy="66" r="11" fill="#292524" stroke="#78716c" strokeWidth="3" />
      <circle cx="102" cy="66" r="4" fill="#a8a29e" />
    </svg>
  );
}

/** คริสตัลเรืองแสง */
function CrystalSVG({ color, className }: { color: "purple" | "blue"; className?: string }) {
  const c = color === "purple" ? ["#c084fc", "#7c3aed"] : ["#67e8f9", "#0891b2"];
  return (
    <svg viewBox="0 0 60 50" className={className} style={{ filter: `drop-shadow(0 0 6px ${c[0]})` }} aria-hidden>
      <polygon points="18,50 10,26 20,10 28,28" fill={c[0]} stroke={c[1]} strokeWidth="2" />
      <polygon points="34,50 28,22 40,4 46,26" fill={c[0]} stroke={c[1]} strokeWidth="2" />
      <polygon points="48,50 44,32 54,22 58,36" fill={c[0]} stroke={c[1]} strokeWidth="2" />
      <polygon points="30,24 40,8 42,24" fill="#ffffff" opacity="0.4" />
    </svg>
  );
}

/** โคมไฟแขวนเรืองแสง */
function Lantern({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none flex flex-col items-center", className)} aria-hidden>
      <div className="h-4 w-0.5 bg-stone-500" />
      <div className="h-1.5 w-4 rounded-t bg-stone-700" />
      <div
        className="h-7 w-5 rounded-b-lg rounded-t-sm border-2 border-stone-700 bg-gradient-to-b from-yellow-200 via-amber-400 to-amber-500"
        style={{ boxShadow: "0 0 22px 9px rgba(251,191,36,0.55)" }}
      />
    </div>
  );
}

/** กองทองที่พื้น */
function GoldPile({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 22" className={cn("pointer-events-none", className)} aria-hidden>
      <circle cx="14" cy="15" r="7" fill="#fbbf24" stroke="#b45309" strokeWidth="1.5" />
      <circle cx="28" cy="13" r="8" fill="#fcd34d" stroke="#b45309" strokeWidth="1.5" />
      <circle cx="42" cy="15" r="7" fill="#fbbf24" stroke="#b45309" strokeWidth="1.5" />
      <circle cx="22" cy="8" r="6" fill="#fde68a" stroke="#b45309" strokeWidth="1.5" />
      <circle cx="35" cy="7" r="5" fill="#fcd34d" stroke="#b45309" strokeWidth="1.5" />
    </svg>
  );
}

/** เสาค้ำไม้ในเหมือง */
function MineBeam({ side }: { side: "left" | "right" }) {
  return (
    <div className={cn("pointer-events-none absolute bottom-0 top-0 w-4 bg-gradient-to-b from-amber-800 to-amber-950 shadow-lg", side === "left" ? "left-6" : "right-6")} aria-hidden>
      <div className="absolute inset-x-0 top-0 h-2 bg-amber-950" />
    </div>
  );
}

/* ── แสดงเศษส่วนบนการ์ด ── */

function CardFace({ card }: { card: GameCard }) {
  if (card.kind === "mixed") {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-4xl font-extrabold leading-none text-amber-950 sm:text-5xl">{card.whole}</span>
        <FractionText numerator={card.numerator} denominator={card.denominator} toneClassName="text-amber-950" className="text-2xl sm:text-3xl" />
      </div>
    );
  }
  return <FractionText numerator={card.numerator} denominator={card.denominator} toneClassName="text-amber-950" className="text-5xl sm:text-6xl" />;
}

/* ── นกฮูกใส่หมวกช่างเหมือง ── */

function MinerOwl({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-block", className)} aria-hidden>
      <span className="text-4xl sm:text-5xl">🦉</span>
      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-xl sm:text-2xl">⛑️</span>
    </span>
  );
}

/* ── เกมหลัก ── */

type Mode = "practice" | "mine";
type Result = { card: GameCard; correct: boolean };
type CartPhase = "riding" | "delivered" | "missed";
type CartState = { card: GameCard; id: number; phase: CartPhase; toKind?: FractionKind };

let cartSeq = 1;

export function TreasureSortGame() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [phase, setPhase] = useState<"select" | "playing" | "over">("select");

  const [deck, setDeck] = useState<GameCard[]>([]);
  const [pos, setPos] = useState(0);
  const [cart, setCart] = useState<CartState | null>(null);

  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [depth, setDepth] = useState(1);
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [best, setBest] = useState(0);
  const [chestCounts, setChestCounts] = useState<Record<FractionKind, number>>({ proper: 0, improper: 0, mixed: 0 });
  const [log, setLog] = useState<Result[]>([]);
  const [scoredKind, setScoredKind] = useState<{ kind: FractionKind; gem: boolean } | null>(null);
  const [owl, setOwl] = useState<{ tone: "good" | "bad" | "idle"; text: string }>({ tone: "idle", text: "" });
  const [revealed, setRevealed] = useState(false);
  const [muted, setMuted] = useState(false);
  const [depthFlash, setDepthFlash] = useState(false);

  const mutedRef = useRef(false);
  const cartRef = useRef<CartState | null>(null);
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const { play, ensure } = useSound(mutedRef);

  useEffect(() => { mutedRef.current = muted; }, [muted]);
  useEffect(() => { cartRef.current = cart; }, [cart]);

  /* เพลงประกอบระหว่างเล่น — เล่นวนเฉพาะช่วง playing */
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!bgmRef.current) {
      const audio = new Audio("/sounds/mine-cart-adventure.mp3");
      audio.loop = true;
      audio.volume = 0.35;
      bgmRef.current = audio;
    }
    const bgm = bgmRef.current;
    if (phase === "playing" && !muted) {
      void bgm.play().catch(() => {});
    } else {
      bgm.pause();
      if (phase !== "playing") bgm.currentTime = 0;
    }
  }, [phase, muted]);

  useEffect(() => () => bgmRef.current?.pause(), []);

  useEffect(() => {
    if (!scoredKind) return;
    const id = window.setTimeout(() => setScoredKind(null), 550);
    return () => window.clearTimeout(id);
  }, [scoredKind]);

  useEffect(() => {
    if (!depthFlash) return;
    const id = window.setTimeout(() => setDepthFlash(false), 1200);
    return () => window.clearTimeout(id);
  }, [depthFlash]);

  const rideDuration = Math.max(2.6, 6.2 - (depth - 1) * 0.5);

  function startMode(m: Mode) {
    ensure();
    setMode(m);
    setPhase("playing");
    setScore(0);
    setCombo(0);
    setDepth(1);
    setHearts(MAX_HEARTS);
    setChestCounts({ proper: 0, improper: 0, mixed: 0 });
    setLog([]);
    setRevealed(false);
    setScoredKind(null);
    if (m === "practice") {
      const d = makeDeck();
      setDeck(d);
      setPos(0);
      setCart({ card: d[0], id: cartSeq++, phase: "riding" });
      setOwl({ tone: "idle", text: "รถรางจอดรออยู่ — ดูการ์ดแล้วแตะหีบให้ถูกประเภทนะ" });
    } else {
      setCart({ card: randomMineCard(), id: cartSeq++, phase: "riding" });
      setOwl({ tone: "idle", text: "รถรางกำลังวิ่ง! แตะหีบให้ทันก่อนตกเหว" });
    }
  }

  function spawnNext(nextScore: number) {
    if (mode === "practice") {
      const nextPos = pos + 1;
      if (nextPos >= deck.length) { setPhase("over"); play("depth"); return; }
      setPos(nextPos);
      setCart({ card: deck[nextPos], id: cartSeq++, phase: "riding" });
      setRevealed(false);
      setOwl({ tone: "idle", text: "การ์ดต่อไป — แตะหีบให้ถูกนะ" });
      return;
    }
    const newDepth = Math.floor(nextScore / 5) + 1;
    if (newDepth > depth) { setDepth(newDepth); setDepthFlash(true); play("depth"); }
    setCart({ card: randomMineCard(), id: cartSeq++, phase: "riding" });
  }

  function choose(kind: FractionKind) {
    const c = cartRef.current;
    if (!c || c.phase !== "riding") return;
    const card = c.card;
    const correct = kind === card.kind;

    if (mode === "practice") {
      setLog((prev) => (prev.some((r) => r.card.id === card.id) ? prev : [...prev, { card, correct }]));
    }

    if (!correct) {
      setCombo(0);
      play("wrong");
      setOwl({ tone: "bad", text: `ยังไม่ใช่ — ${reasonFor(card)}` });
      return;
    }

    const gain = card.gem ? 3 : 1;
    const nextScore = score + gain;
    const nextCombo = combo + 1;
    setScore(nextScore);
    setCombo(nextCombo);
    setChestCounts((cc) => ({ ...cc, [kind]: cc[kind] + 1 }));
    setScoredKind({ kind, gem: card.gem });
    setCart({ ...c, phase: "delivered", toKind: kind });
    play(card.gem ? "gem" : nextCombo >= 3 ? "combo" : "coin");
    setOwl({ tone: "good", text: `${card.gem ? "💎 เพชร! " : ""}${reasonFor(card)}` });
    window.setTimeout(() => spawnNext(nextScore), 480);
  }

  function handleRideEnd(id: number) {
    const c = cartRef.current;
    if (!c || c.id !== id || c.phase !== "riding" || mode !== "mine") return;
    setCart({ ...c, phase: "missed" });
    setCombo(0);
    const left = hearts - 1;
    setHearts(left);
    setOwl({ tone: "bad", text: `หลุดไป! ${reasonFor(c.card)}` });
    if (left <= 0) {
      play("over");
      window.setTimeout(() => { setBest((b) => Math.max(b, score)); setPhase("over"); }, 700);
    } else {
      play("miss");
      window.setTimeout(() => spawnNext(score), 700);
    }
  }

  function reset() {
    setPhase("select");
    setMode(null);
    setCart(null);
    setRevealed(false);
  }

  const earnedStars = starsFor(score);
  const moving = mode === "mine";

  return (
    <Card className="overflow-hidden p-0">
      <style>{`
        @keyframes ride { from { left: -24%; } to { left: 108%; } }
        @keyframes deliver { 0% { transform: translateY(0) scale(1); opacity: 1; } 100% { transform: translateY(70px) scale(0.25); opacity: 0; } }
        @keyframes shake-card { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
        @keyframes cart-bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
        @keyframes twinkle { 0%,100%{opacity:.9} 50%{opacity:.3} }
      `}</style>

      {/* Header ทอง */}
      <div className="flex items-center justify-between bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 px-4 py-2.5 text-white shadow-[inset_0_-3px_0_rgba(120,53,15,0.35)]">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-sm font-extrabold text-amber-600 shadow">7</span>
          <h2 className="text-lg font-extrabold drop-shadow-sm sm:text-xl">รถรางเหมืองสมบัติ ⛏️</h2>
        </div>
        <div className="flex items-center gap-2">
          {mode === "mine" && best > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-white/25 px-3 py-1 text-xs font-extrabold">
              <Trophy size={13} /> สูงสุด {best}
            </span>
          )}
          <button onClick={() => setMuted((m) => !m)} aria-label={muted ? "เปิดเสียง" : "ปิดเสียง"} className="grid h-9 w-9 place-items-center rounded-full bg-white/25 transition hover:bg-white/40">
            {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-b from-amber-50/80 to-orange-50/60 p-4 sm:p-6">
        {/* ── เลือกโหมด ── */}
        {phase === "select" && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <MinerOwl />
              <div className="rounded-2xl border-2 border-amber-300 bg-white px-4 py-2 text-sm font-extrabold text-slate-700 shadow-sm sm:text-base">
                รถรางบรรทุกการ์ดเศษส่วนวิ่งเข้าเหมือง! แตะหีบให้ถูกประเภทเพื่อเก็บสมบัติ
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {CHESTS.map((c) => (
                <div key={c.kind} className={cn("flex flex-col items-center rounded-2xl p-3 text-center ring-2", c.cardBg, c.cardRing.split(" ")[0])}>
                  <ChestSVG variant={c.variant} open={false} className="h-16 w-20" />
                  <span className={cn("mt-1 text-base font-extrabold", c.text)}>{c.title}</span>
                  <p className="text-xs font-bold text-slate-500">{c.hint}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <button onClick={() => startMode("practice")} className="group flex flex-col items-center gap-1.5 rounded-2xl border-2 border-emerald-200 bg-gradient-to-b from-emerald-50 to-white p-5 transition hover:border-emerald-400 active:scale-[0.98]">
                <span className="text-4xl transition group-hover:scale-110">🎓</span>
                <span className="text-lg font-extrabold text-emerald-800">โหมดฝึก</span>
                <span className="text-xs font-bold text-slate-500">รถจอดรอ · มีคำใบ้ · ตอบผิดได้ · 10 ใบ</span>
                <span className="mt-1 flex items-center gap-1 rounded-xl bg-emerald-600 px-4 py-1.5 text-sm font-extrabold text-white group-hover:bg-emerald-700"><Play size={14} /> เริ่มฝึก</span>
              </button>
              <button onClick={() => startMode("mine")} className="group flex flex-col items-center gap-1.5 rounded-2xl border-2 border-amber-300 bg-gradient-to-b from-amber-50 to-white p-5 transition hover:border-amber-500 active:scale-[0.98]">
                <span className="text-4xl transition group-hover:scale-110">⛏️</span>
                <span className="text-lg font-extrabold text-amber-800">โหมดเหมืองจริง</span>
                <span className="text-xs font-bold text-slate-500">รถวิ่ง · หัวใจ 3 · ไต่ชั้นเร็วขึ้น · เพชร ×3</span>
                <span className="mt-1 flex items-center gap-1 rounded-xl bg-amber-600 px-4 py-1.5 text-sm font-extrabold text-white group-hover:bg-amber-700"><Play size={14} /> ลงเหมือง</span>
              </button>
            </div>
          </div>
        )}

        {/* ── กำลังเล่น ── */}
        {phase === "playing" && cart && mode && (
          <div className="space-y-3">
            {/* แถบสถานะแคปซูล */}
            <div className="mx-auto flex max-w-xl flex-wrap items-center justify-center gap-x-4 gap-y-1 rounded-full bg-white px-6 py-2 shadow-sm ring-1 ring-amber-200">
              {moving ? (
                <>
                  <span className="text-lg tracking-wider sm:text-xl" aria-label={`หัวใจเหลือ ${hearts}`}>
                    {Array.from({ length: MAX_HEARTS }, (_, i) => (i < hearts ? "❤️" : "🖤")).join("")}
                  </span>
                  <span className="h-5 w-px bg-amber-200" />
                  <span className="flex items-center gap-1.5 text-xl font-extrabold text-amber-700 sm:text-2xl">🪙 {score}</span>
                  <span className="h-5 w-px bg-amber-200" />
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-800">⛏️ ชั้น {depth}</span>
                  {combo >= 2 && <span className="text-base font-extrabold text-orange-600">🔥x{combo}</span>}
                </>
              ) : (
                <>
                  <span className="text-lg font-extrabold text-amber-700 sm:text-xl">ข้อ {Math.min(pos + 1, PRACTICE_COUNT)}/{PRACTICE_COUNT}</span>
                  <span className="h-5 w-px bg-amber-200" />
                  <span className="text-lg font-extrabold text-emerald-700 sm:text-xl">ถูก 🪙 {score}</span>
                </>
              )}
            </div>

            {/* รางดาวโลหะ (เหมือง) */}
            {moving && (
              <div className="relative mx-auto h-7 max-w-2xl px-3">
                <div className="absolute inset-x-3 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-slate-300" />
                <div className="absolute left-3 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-[width] duration-300" style={{ width: `calc(${Math.min(100, (score / STAR_GOALS[2]) * 100)}% - 0px)` }} />
                <span className="absolute left-3 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-400" />
                {STAR_GOALS.map((g, i) => (
                  <span key={i} className={cn("absolute top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl drop-shadow", score >= g ? "" : "opacity-50 grayscale")} style={{ left: `calc(${(g / STAR_GOALS[2]) * 100}% * (100% - 24px) / 100% + 12px)`, insetInlineStart: `${(g / STAR_GOALS[2]) * 94 + 3}%` }}>⭐</span>
                ))}
              </div>
            )}

            {/* นกฮูกหมวกช่าง + กล่องคำพูด */}
            <div className="mx-auto flex max-w-2xl items-center gap-2">
              <MinerOwl className="shrink-0" />
              <div className={cn("flex-1 rounded-2xl border-2 px-4 py-2 text-sm font-extrabold shadow-sm sm:text-base",
                owl.tone === "good" ? "border-emerald-300 bg-emerald-50 text-emerald-800" :
                owl.tone === "bad" ? "border-rose-300 bg-rose-50 text-rose-700" :
                "border-amber-300 bg-white text-slate-700")}>
                {owl.text}
              </div>
            </div>

            {/* ═══ ฉากเหมือง ═══ */}
            <div className="relative h-60 overflow-hidden rounded-2xl border-4 border-amber-900/50 shadow-inner sm:h-72"
              style={{ background: "radial-gradient(ellipse 120% 90% at 50% -10%, #57534e 0%, #3b3028 45%, #231a12 100%)" }}>

              {/* เพดานหิน */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-6"
                style={{ background: "radial-gradient(14px 10px at 10% 0, #1c1410 60%, transparent 61%), radial-gradient(18px 12px at 30% 0, #1c1410 60%, transparent 61%), radial-gradient(15px 11px at 50% 0, #1c1410 60%, transparent 61%), radial-gradient(19px 12px at 72% 0, #1c1410 60%, transparent 61%), radial-gradient(14px 10px at 92% 0, #1c1410 60%, transparent 61%)" }} />

              {/* เสาค้ำไม้ */}
              <MineBeam side="left" />
              <MineBeam side="right" />

              {/* โคมไฟ */}
              <Lantern className="absolute left-14 top-0" />
              <Lantern className="absolute right-14 top-0" />

              {/* คริสตัล + กองทอง */}
              <CrystalSVG color="purple" className="absolute bottom-9 left-1 h-12 w-14" />
              <CrystalSVG color="blue" className="absolute bottom-9 right-1 h-14 w-16" />
              <GoldPile className="absolute bottom-9 left-16 h-6 w-16 opacity-90" />
              <GoldPile className="absolute bottom-9 right-16 h-5 w-14 opacity-80" />

              {/* หิ่งห้อยแสง */}
              <span className="pointer-events-none absolute left-1/4 top-8 h-1.5 w-1.5 rounded-full bg-yellow-200" style={{ animation: "twinkle 2.2s infinite" }} />
              <span className="pointer-events-none absolute right-1/3 top-12 h-1 w-1 rounded-full bg-yellow-100" style={{ animation: "twinkle 3.1s .8s infinite" }} />
              <span className="pointer-events-none absolute left-2/3 top-6 h-1 w-1 rounded-full bg-amber-200" style={{ animation: "twinkle 2.7s .4s infinite" }} />

              {depthFlash && (
                <div className="absolute inset-0 z-30 grid place-items-center">
                  <div className="animate-bounce rounded-2xl bg-gradient-to-b from-amber-400 to-orange-500 px-6 py-3 text-2xl font-extrabold text-white shadow-2xl sm:text-3xl">⛏️ ชั้นที่ {depth}!</div>
                </div>
              )}

              {/* รางรถไฟ */}
              <div className="absolute inset-x-0 bottom-2 flex justify-between px-1">
                {Array.from({ length: 16 }, (_, i) => <div key={i} className="h-2.5 w-3.5 rounded-sm bg-gradient-to-b from-amber-900 to-amber-950" />)}
              </div>
              <div className="absolute inset-x-0 bottom-6 h-1 bg-gradient-to-b from-slate-300 to-slate-500 shadow" />
              <div className="absolute inset-x-0 bottom-3.5 h-1 bg-gradient-to-b from-slate-400 to-slate-600" />
              {/* เหวปลายราง */}
              <div className="absolute bottom-0 right-0 top-0 w-8 bg-gradient-to-l from-black/90 to-transparent" />

              {/* รถราง + การ์ด */}
              <div
                key={cart.id}
                onAnimationEnd={(e) => { if (e.animationName === "ride") handleRideEnd(cart.id); }}
                className="absolute bottom-5 z-10 flex flex-col items-center"
                style={
                  moving && cart.phase === "riding"
                    ? { animation: `ride ${rideDuration}s linear forwards` }
                    : { left: "50%", transform: "translateX(-50%)" }
                }
              >
                {/* การ์ดเศษส่วน (เสียบอยู่ในรถ) */}
                <div
                  className={cn(
                    "relative z-0 -mb-7 flex min-h-[6.5rem] min-w-[7.5rem] items-center justify-center rounded-xl border-[5px] bg-white px-3 pb-6 pt-3 shadow-[0_6px_0_rgba(120,53,15,0.5),0_10px_18px_rgba(0,0,0,0.5)] sm:min-h-[7.5rem] sm:min-w-[8.5rem]",
                    cart.card.gem ? "border-cyan-400 ring-4 ring-cyan-300/60" : "border-amber-500"
                  )}
                  style={
                    cart.phase === "delivered" ? { animation: "deliver 0.48s ease-in forwards" } :
                    owl.tone === "bad" && cart.phase === "riding" ? { animation: "shake-card 0.35s" } : undefined
                  }
                >
                  {cart.card.gem && <span className="absolute -top-4 text-lg">💎</span>}
                  <CardFace card={cart.card} />
                </div>
                {/* ตัวรถ SVG */}
                <div className="relative z-10" style={moving && cart.phase === "riding" ? { animation: "cart-bob 0.6s ease-in-out infinite" } : undefined}>
                  <CartSVG className="h-16 w-32 sm:h-20 sm:w-40" />
                </div>
              </div>
            </div>

            {/* ═══ หีบ 3 ใบ ═══ */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {CHESTS.map((c) => {
                const scored = scoredKind?.kind === c.kind;
                const revealMe = revealed && cart.card.kind === c.kind;
                return (
                  <button
                    key={c.kind}
                    onClick={() => choose(c.kind)}
                    disabled={cart.phase !== "riding"}
                    className={cn(
                      "group relative flex flex-col items-center rounded-2xl p-2.5 text-center ring-2 transition active:scale-95 sm:p-3",
                      c.cardBg, c.cardRing,
                      revealMe && "ring-4 ring-amber-400",
                      scored && "animate-bounce"
                    )}
                  >
                    <span className="pointer-events-none absolute left-2 top-2 text-xs opacity-60">✦</span>
                    <span className="pointer-events-none absolute right-3 top-5 text-[10px] opacity-50">✦</span>
                    <ChestSVG variant={c.variant} open={!!scored} className="h-20 w-24 drop-shadow transition group-hover:scale-105 sm:h-24 sm:w-28" />
                    {scored && <span className="absolute top-0 left-1/2 -translate-x-1/2 animate-ping text-xl">{scoredKind?.gem ? "💎" : "🪙"}</span>}
                    <span className={cn("mt-1 text-base font-extrabold sm:text-lg", c.text)}>{c.title}</span>
                    {!moving && <span className="text-[10px] font-bold text-slate-500 sm:text-xs">{c.hint}</span>}
                    {revealMe && <span className="mt-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-700">✓ ใส่หีบนี้</span>}
                    <span className="mt-1 rounded-full bg-white/80 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-700 shadow-sm">🪙 {chestCounts[c.kind]}</span>
                  </button>
                );
              })}
            </div>

            {/* ปุ่มควบคุม */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {!moving && (
                <button onClick={() => { setRevealed(true); setOwl({ tone: "idle", text: `คำใบ้: ${reasonFor(cart.card)}` }); }} disabled={cart.phase !== "riding" || revealed}
                  className="flex items-center gap-1.5 rounded-xl border-2 border-amber-300 bg-white px-4 py-2 text-sm font-extrabold text-amber-700 transition hover:bg-amber-50 disabled:opacity-40">
                  <Eye size={15} /> ดูเฉลย
                </button>
              )}
              <button onClick={reset} className="flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50">
                <RotateCcw size={15} /> เริ่มใหม่
              </button>
            </div>
          </div>
        )}

        {/* ── จบเกม ── */}
        {phase === "over" && mode && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-gradient-to-b from-amber-100 to-yellow-50 px-4 py-5 text-center ring-1 ring-amber-200">
              {moving && (
                <div className="mb-2 flex items-center justify-center gap-2">
                  {[0, 1, 2].map((i) => <span key={i} className={cn("text-4xl sm:text-5xl", i < earnedStars ? "" : "opacity-25 grayscale")}>⭐</span>)}
                </div>
              )}
              <p className="text-2xl font-extrabold text-amber-700 sm:text-3xl">
                {moving ? "💔 รถรางตกเหว!" : "🏆 จัดสมบัติครบแล้ว!"}
              </p>
              <p className="mt-1 text-base font-bold text-amber-600 sm:text-lg">
                {moving ? `เก็บสมบัติได้ ${score} เหรียญ · ลงลึกถึงชั้น ${depth}${score > best ? " — สถิติใหม่! 🎉" : ""}` : `ตอบถูก ${score}/${PRACTICE_COUNT} ข้อ`}
              </p>
            </div>

            {!moving && log.length > 0 && (
              <div className="overflow-hidden rounded-2xl border-2 border-amber-100 bg-white">
                <div className="bg-amber-500/10 px-4 py-2 text-sm font-extrabold text-amber-700">📜 ตารางเฉลย</div>
                <div className="divide-y divide-amber-50">
                  {log.map((r, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-2 text-sm">
                      <span className="w-6 shrink-0 text-center">{r.correct ? "✅" : "📖"}</span>
                      <span className="inline-flex w-16 shrink-0 items-center gap-1 font-extrabold text-slate-800">{r.card.kind === "mixed" ? `${r.card.whole} ` : ""}<Frac n={r.card.numerator} d={r.card.denominator} /></span>
                      <span className="w-24 shrink-0 font-bold text-slate-600">{KIND_LABEL[r.card.kind]}</span>
                      <span className="flex-1 text-xs font-bold text-slate-500">{reasonFor(r.card)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-2">
              <button onClick={() => startMode(mode)} className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-6 py-2.5 text-sm font-extrabold text-white shadow transition hover:bg-amber-700 active:scale-[0.98] sm:text-base">
                <RotateCcw size={16} /> เล่นอีกครั้ง
              </button>
              <button onClick={reset} className="rounded-xl border-2 border-amber-300 bg-white px-6 py-2.5 text-sm font-extrabold text-amber-700 transition hover:bg-amber-50 active:scale-[0.98] sm:text-base">
                เปลี่ยนโหมด
              </button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
