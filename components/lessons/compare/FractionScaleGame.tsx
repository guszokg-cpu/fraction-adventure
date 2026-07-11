"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Shuffle, Volume2, VolumeX, Eye, EyeOff, Trophy, Swords, GraduationCap, Upload, Save } from "lucide-react";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { cn } from "@/lib/cn";
import { randInt } from "@/lib/randomFraction";

/* ── ชนิดข้อมูล ── */

type Frac = { num: number; den: number };
type Side = "left" | "right" | "equal";
type Phase = "ask" | "weighing" | "result";

type Item = { emoji?: string; img?: string; name: string };

/** สิ่งของที่ครูอัปโหลดเอง — บันทึกใน localStorage ไว้ใช้สอนครั้งหน้า */
type CustomItem = { id: number; name: string; img: string };
const CUSTOM_ITEMS_KEY = "scale-custom-items";

/** ของในชีวิตประจำวันสำหรับโหมดครู — ทุกชิ้นน้ำหนักจริงไม่เกิน 2-3 กก. */
const REAL_ITEMS: Item[] = [
  { emoji: "🍎", name: "แอปเปิล" },
  { emoji: "🍌", name: "กล้วยหอม" },
  { emoji: "🍊", name: "ส้ม" },
  { emoji: "🥭", name: "มะม่วง" },
  { emoji: "🍇", name: "องุ่น" },
  { emoji: "🍍", name: "สับปะรด" },
  { emoji: "🥩", name: "เนื้อหมู" },
  { emoji: "🍗", name: "น่องไก่" },
  { emoji: "🐟", name: "ปลาทู" },
  { emoji: "🥚", name: "ไข่ไก่" },
  { emoji: "🍚", name: "ข้าวสาร" },
  { emoji: "🥕", name: "แครอท" },
  { emoji: "🍅", name: "มะเขือเทศ" },
  { emoji: "🥬", name: "ผักกาด" },
  { emoji: "🍞", name: "ขนมปัง" },
  { emoji: "🧃", name: "น้ำผลไม้" },
];

const ITEMS: Item[] = [
  { emoji: "💎", name: "เพชรวิเศษ" },
  { emoji: "✨", name: "ผงดาว" },
  { emoji: "🔮", name: "ลูกแก้วมนตรา" },
  { emoji: "🧪", name: "น้ำยาวิเศษ" },
  { emoji: "🍄", name: "เห็ดยักษ์" },
  { emoji: "🪶", name: "ขนนกฟีนิกซ์" },
  { emoji: "🌙", name: "เศษจันทรา" },
  { emoji: "⭐", name: "ดาวตก" },
  { emoji: "🍯", name: "น้ำผึ้งทอง" },
  { emoji: "🌈", name: "หยดสายรุ้ง" },
  { emoji: "🪄", name: "ไม้กายสิทธิ์" },
  { emoji: "🫧", name: "ฟองมนตร์" },
];

const CUSTOMERS = [
  { emoji: "🧙‍♀️", name: "แม่มดมิรา" },
  { emoji: "🤴", name: "เจ้าชายภูผา" },
  { emoji: "👸", name: "เจ้าหญิงดารา" },
  { emoji: "🧝‍♀️", name: "เอลฟ์ใบไม้" },
  { emoji: "🐉", name: "มังกรจิ๋ว" },
  { emoji: "🧚", name: "ภูตน้อยนีร" },
  { emoji: "🦄", name: "ยูนิคอร์น" },
  { emoji: "🧛‍♂️", name: "ท่านเคานต์" },
  { emoji: "🧞", name: "ยักษ์จีนี่" },
  { emoji: "🐻", name: "หมีน้ำผึ้ง" },
];

type Customer = (typeof CUSTOMERS)[number];
type Question = { l: Frac; r: Frac; li: Item; ri: Item; cust: Customer };

const DENS = [3, 4, 5, 6, 8, 10, 12];
const QTIME = 25;
const LEVEL_LABELS: Record<number, string> = { 1: "ตัวส่วนเท่ากัน", 2: "ตัวเศษเท่ากัน", 3: "ท้าทาย! ต่างกันทั้งคู่" };

/* ── คณิตศาสตร์ ── */

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
const lcm = (a: number, b: number) => (a * b) / gcd(a, b);

/** จัดรูปน้ำหนักกรัม: จำนวนเต็มใส่จุลภาค, ทศนิยมปัด 1 ตำแหน่ง */
const fmtW = (n: number) => (Number.isInteger(n) ? n.toLocaleString("th-TH") : n.toFixed(1));

function cmp(l: Frac, r: Frac): Side {
  const a = l.num * r.den;
  const b = r.num * l.den;
  return a > b ? "left" : a < b ? "right" : "equal";
}

/* ── สุ่มโจทย์ตามระดับ ── */

function genFracs(level: number): { l: Frac; r: Frac } {
  if (level === 1) {
    const den = DENS[randInt(0, 4)];
    const n1 = randInt(1, den - 1);
    let n2 = randInt(1, den - 1);
    if (n2 === n1) n2 = n1 === den - 1 ? n1 - 1 : n1 + 1;
    return { l: { num: n1, den }, r: { num: n2, den } };
  }
  if (level === 2) {
    const num = randInt(1, 4);
    const opts = DENS.filter((d) => d > num);
    const d1 = opts[randInt(0, opts.length - 1)];
    let d2 = opts[randInt(0, opts.length - 1)];
    if (d2 === d1) d2 = opts[(opts.indexOf(d1) + 1) % opts.length];
    return { l: { num, den: d1 }, r: { num, den: d2 } };
  }
  // ระดับ 3: มีโอกาส 1 ใน 4 เจอคู่ที่เท่ากัน (เศษส่วนเทียบเท่า)
  if (randInt(1, 4) === 1) {
    const bases: Frac[] = [
      { num: 1, den: 2 }, { num: 1, den: 3 }, { num: 2, den: 3 },
      { num: 1, den: 4 }, { num: 3, den: 4 }, { num: 2, den: 5 }, { num: 3, den: 5 },
    ];
    const b = bases[randInt(0, bases.length - 1)];
    const k = randInt(2, Math.max(2, Math.floor(12 / b.den)));
    const eq = { num: b.num * k, den: b.den * k };
    return randInt(0, 1) === 0 ? { l: b, r: eq } : { l: eq, r: b };
  }
  for (let t = 0; t < 20; t++) {
    const d1 = DENS[randInt(0, DENS.length - 1)];
    let d2 = DENS[randInt(0, DENS.length - 1)];
    if (d2 === d1) d2 = DENS[(DENS.indexOf(d1) + 1) % DENS.length];
    const l = { num: randInt(1, d1 - 1), den: d1 };
    const r = { num: randInt(1, d2 - 1), den: d2 };
    if (l.num !== r.num && cmp(l, r) !== "equal") return { l, r };
  }
  return { l: { num: 1, den: 2 }, r: { num: 3, den: 4 } };
}

function genQuestion(level: number): Question {
  const { l, r } = genFracs(level);
  const i = randInt(0, ITEMS.length - 1);
  let j = randInt(0, ITEMS.length - 1);
  if (j === i) j = (j + 1) % ITEMS.length;
  return { l, r, li: ITEMS[i], ri: ITEMS[j], cust: CUSTOMERS[randInt(0, CUSTOMERS.length - 1)] };
}

/* ── ระบบเสียง ── */

type SoundKind = "clink" | "correct" | "wrong" | "combo" | "levelup" | "over" | "start";

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
      case "clink": return tones([1568, 1175, 1397], 0.08, 0.1, "square", 0.05);
      case "correct": return tones([660, 990, 1319], 0.06, 0.1, "triangle", 0.14);
      case "wrong": return tones([200, 130], 0.11, 0.18, "sawtooth", 0.12);
      case "combo": return tones([659, 880, 1047, 1319], 0.05, 0.11, "triangle", 0.15);
      case "levelup": return tones([523, 659, 784, 1047, 1319], 0.07, 0.13, "triangle", 0.15);
      case "over": return tones([392, 330, 262, 196], 0.14, 0.2, "triangle", 0.13);
      case "start": return tones([523, 784, 1047], 0.08, 0.12, "triangle", 0.14);
    }
  }
  return { play, ensure };
}

/* ── เศษส่วนแบบ SVG (ใช้ในตาชั่ง) ── */

function SvgFrac({ x, y, num, den, color, size = 26 }: { x: number; y: number; num: number; den: number; color: string; size?: number }) {
  const gap = size * 1.16;
  return (
    <g textAnchor="middle" fontWeight={900}>
      <text x={x} y={y} fontSize={size} fill={color}>{num}</text>
      <line x1={x - size * 0.62} y1={y + size * 0.28} x2={x + size * 0.62} y2={y + size * 0.28} stroke={color} strokeWidth={size * 0.12} strokeLinecap="round" />
      <text x={x} y={y + gap} fontSize={size} fill={color}>{den}</text>
    </g>
  );
}

/* ── จานตาชั่ง 1 ข้าง — สิ่งของใหญ่เด่น นั่งกลางถาดชัดเจน ── */

function Pan({ x, drop, item, frac, tone, weight }: { x: number; drop: number; item: Item; frac: Frac; tone: Side; weight?: string | null }) {
  const isLeft = tone === "left";
  const ringColor = isLeft ? "#10b981" : "#3b82f6";
  return (
    // จานห้อยจากปลายคาน (คานอยู่ที่ y=130) — drop คือระยะจมลง/ลอยขึ้นตามน้ำหนัก
    <g style={{ transform: `translate(${x}px, ${130 + drop}px)`, transition: "transform 0.9s cubic-bezier(.34,1.3,.5,1)" }}>
      <line x1={0} y1={0} x2={-58} y2={100} stroke="#b45309" strokeWidth={2.8} />
      <line x1={0} y1={0} x2={58} y2={100} stroke="#b45309" strokeWidth={2.8} />
      <circle cx={0} cy={0} r={5} fill="#92400e" />

      {/* ป้ายเศษส่วนลอยอยู่ด้านบน (แยกจากถาด) — ตัวหนา อ่านง่าย */}
      <g>
        <rect x={-38} y={8} width={76} height={62} rx={14} fill={isLeft ? "#ecfdf5" : "#eff6ff"} stroke={ringColor} strokeWidth={3} />
        <SvgFrac x={0} y={35} num={frac.num} den={frac.den} color={isLeft ? "#047857" : "#1d4ed8"} size={26} />
      </g>

      {/* ถาดชั่ง — กว้างและลึกขึ้น รองรับของชัดเจน */}
      <path d="M -74 96 Q 0 128 74 96 L 65 112 Q 0 142 -65 112 Z" fill="url(#scaleGold)" stroke="#b45309" strokeWidth={2} />
      <ellipse cx={0} cy={98} rx={74} ry={10} fill="#fde68a" stroke="#b45309" strokeWidth={2.5} />

      {/* เงาใต้สิ่งของ ให้มีมิติ "นั่งอยู่บนถาด" */}
      <ellipse cx={0} cy={122} rx={34} ry={8} fill="#000" opacity={0.16} />

      {/* สิ่งของวางกึ่งกลางถาด — ใหญ่เด่น เป็นพระเอกของฝั่ง */}
      {item.img ? (
        <g>
          <clipPath id={`panimg-${tone}`}>
            <circle cx={0} cy={100} r={38} />
          </clipPath>
          <circle cx={0} cy={100} r={41} fill="#fff" stroke={ringColor} strokeWidth={3} />
          <image href={item.img} x={-38} y={62} width={76} height={76} preserveAspectRatio="xMidYMid slice" clipPath={`url(#panimg-${tone})`} />
        </g>
      ) : (
        <text x={0} y={116} fontSize={62} textAnchor="middle">{item.emoji}</text>
      )}

      <text x={0} y={162} fontSize={16} textAnchor="middle" fontWeight={800} fill="#475569">{item.name}</text>
      {weight && (
        <text x={0} y={182} fontSize={15} textAnchor="middle" fontWeight={800} fill={isLeft ? "#059669" : "#2563eb"}>= {weight} กรัม</text>
      )}
    </g>
  );
}

/* ── ตาชั่งทอง ── */

function BalanceScale({ l, r, li, ri, tilt, showQ, verdict, wl = null, wr = null }: {
  l: Frac; r: Frac; li: Item; ri: Item; tilt: number; showQ: boolean; verdict: Side | null; wl?: string | null; wr?: string | null;
}) {
  const rad = (tilt * Math.PI) / 180;
  const dropL = -Math.sin(rad) * 180;
  const dropR = Math.sin(rad) * 180;
  const sym = verdict === "left" ? ">" : verdict === "right" ? "<" : "=";
  return (
    <svg viewBox="0 0 680 360" className="mx-auto w-full max-w-4xl" role="img" aria-label="ตาชั่งเปรียบเทียบเศษส่วน">
      <style>{`
        .scale-q { animation: qpulse 1.2s ease-in-out infinite; transform-origin: 340px 46px; }
        @keyframes qpulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.14); } }
        .spark { animation: sparkle 2.4s ease-in-out infinite; }
        @keyframes sparkle { 0%,100% { opacity: 0.12; } 50% { opacity: 0.75; } }
      `}</style>
      <defs>
        <linearGradient id="scaleGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fcd34d" />
          <stop offset="0.5" stopColor="#f59e0b" />
          <stop offset="1" stopColor="#d97706" />
        </linearGradient>
      </defs>

      {/* ประกายดาวจาง ๆ ไม่แย่งซีน */}
      <text x={54} y={44} fontSize={14} fill="#f59e0b" className="spark">✦</text>
      <text x={628} y={220} fontSize={13} fill="#0ea5e9" className="spark" style={{ animationDelay: "1.2s" }}>✦</text>

      {/* ฐาน + เสา */}
      <ellipse cx={340} cy={345} rx={140} ry={7} fill="#0000000f" />
      <rect x={258} y={328} width={164} height={14} rx={7} fill="url(#scaleGold)" stroke="#b45309" strokeWidth={2} />
      <path d="M 278 328 L 402 328 L 378 290 L 302 290 Z" fill="url(#scaleGold)" stroke="#b45309" strokeWidth={2} />
      <rect x={332} y={132} width={16} height={162} rx={5} fill="url(#scaleGold)" stroke="#b45309" strokeWidth={2} />
      <circle cx={340} cy={222} r={7} fill="#fde68a" stroke="#b45309" strokeWidth={1.5} />

      {/* คาน (หมุนตามผล) */}
      <g style={{ transform: `rotate(${tilt}deg)`, transformOrigin: "340px 130px", transition: "transform 0.9s cubic-bezier(.34,1.3,.5,1)" }}>
        <rect x={152} y={124} width={376} height={13} rx={6.5} fill="url(#scaleGold)" stroke="#b45309" strokeWidth={2} />
        <path d="M340,107 l10,10 -10,10 -10,-10 Z" fill="#38bdf8" stroke="#0284c7" strokeWidth={1.5} />
        <circle cx={150} cy={130} r={5.5} fill="#92400e" />
        <circle cx={530} cy={130} r={5.5} fill="#92400e" />
      </g>
      <circle cx={340} cy={130} r={10} fill="#d97706" stroke="#92400e" strokeWidth={2} />

      {/* จานสองข้าง */}
      <Pan x={150} drop={dropL} item={li} frac={l} tone="left" weight={wl} />
      <Pan x={530} drop={dropR} item={ri} frac={r} tone="right" weight={wr} />

      {/* ป้ายกลาง: ? ระหว่างรอ / เครื่องหมายหลังชั่ง */}
      {showQ ? (
        <g className="scale-q">
          <circle cx={340} cy={46} r={19} fill="#fff" stroke="#f59e0b" strokeWidth={3} />
          <text x={340} y={54} fontSize={22} textAnchor="middle" fontWeight={800} fill="#d97706">?</text>
        </g>
      ) : verdict ? (
        <g>
          <circle cx={340} cy={46} r={19} fill="#fff7ed" stroke="#f59e0b" strokeWidth={3} />
          <text x={340} y={55} fontSize={24} textAnchor="middle" fontWeight={900} fill="#c2410c">{sym}</text>
        </g>
      ) : null}
    </svg>
  );
}

/* ── พ่อมดฮูก ── */

function OwlWizard({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 150" className={className} role="img" aria-label="พ่อมดฮูก">
      <path d="M28,72 Q18,120 30,140 L90,140 Q102,120 92,72 Z" fill="#6d28d9" />
      <ellipse cx="60" cy="95" rx="36" ry="43" fill="#b45309" />
      <ellipse cx="60" cy="107" rx="23" ry="26" fill="#fde68a" />
      <path d="M48,100 q6,6 12,0 q6,6 12,0" stroke="#f59e0b" fill="none" strokeWidth="1.6" />
      <ellipse cx="25" cy="96" rx="10" ry="21" fill="#92400e" transform="rotate(14 25 96)" />
      <ellipse cx="95" cy="90" rx="10" ry="21" fill="#92400e" transform="rotate(-28 95 90)" />
      <line x1="100" y1="72" x2="114" y2="50" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
      <text x="114" y="48" fontSize="12" textAnchor="middle">✨</text>
      <path d="M32,54 l7,-13 8,11 Z" fill="#92400e" />
      <path d="M88,54 l-7,-13 -8,11 Z" fill="#92400e" />
      <circle cx="47" cy="72" r="13.5" fill="#fff" stroke="#78350f" strokeWidth="3" />
      <circle cx="73" cy="72" r="13.5" fill="#fff" stroke="#78350f" strokeWidth="3" />
      <circle cx="47" cy="74" r="5.5" fill="#1e293b" />
      <circle cx="49" cy="72" r="1.8" fill="#fff" />
      <circle cx="73" cy="74" r="5.5" fill="#1e293b" />
      <circle cx="75" cy="72" r="1.8" fill="#fff" />
      <path d="M56,84 L64,84 L60,93 Z" fill="#f97316" />
      <path d="M28,54 Q60,44 92,54 L60,4 Z" fill="#7c3aed" />
      <ellipse cx="60" cy="54" rx="35" ry="8" fill="#8b5cf6" />
      <text x="70" y="30" fontSize="11">⭐</text>
      <ellipse cx="48" cy="139" rx="8" ry="4.5" fill="#f59e0b" />
      <ellipse cx="72" cy="139" rx="8" ry="4.5" fill="#f59e0b" />
    </svg>
  );
}

/* ── แท่งเทียบเศษส่วน ── */

function CompareBars({ l, r }: { l: Frac; r: Frac }) {
  const row = (f: Frac, fill: string, ring: string, tone: string) => (
    <div className="flex items-center gap-2">
      <StackedFraction numerator={f.num} denominator={f.den} className="w-9 shrink-0 text-sm" toneClassName={tone} />
      <div className={cn("flex h-7 flex-1 overflow-hidden rounded-lg border-2 bg-white", ring)}>
        {Array.from({ length: f.den }, (_, i) => (
          <div key={i} className={cn("flex-1 border-r border-slate-300/70 last:border-r-0", i < f.num && fill)} />
        ))}
      </div>
    </div>
  );
  return (
    <div className="mx-auto max-w-md space-y-1.5">
      {row(l, "bg-emerald-400", "border-emerald-400", "text-emerald-700")}
      {row(r, "bg-sky-400", "border-sky-400", "text-sky-700")}
    </div>
  );
}

/* ── แผงเฉลยวิธีคิด ── */

function symOf(w: Side) { return w === "left" ? ">" : w === "right" ? "<" : "="; }

function Explanation({ l, r, totalW }: { l: Frac; r: Frac; totalW: number }) {
  const w = cmp(l, r);
  const sym = symOf(w);
  const wl = (l.num / l.den) * totalW;
  const wr = (r.num / r.den) * totalW;
  const chip = "flex items-center gap-1.5 rounded-xl bg-white px-2.5 py-1.5 shadow-sm ring-1 ring-slate-200";
  const arrow = <span className="text-xl font-extrabold text-emerald-500">→</span>;

  let caseLabel: string;
  let chain: React.ReactNode;

  if (l.den === r.den) {
    caseLabel = "ตัวส่วนเท่ากัน — ดูตัวเศษได้เลย";
    chain = (
      <>
        <span className={chip}>ตัวเศษ <b className="text-emerald-700">{l.num}</b> {sym} <b className="text-sky-700">{r.num}</b></span>
        {arrow}
      </>
    );
  } else if (l.num === r.num) {
    caseLabel = "ตัวเศษเท่ากัน — ตัวส่วนน้อยกว่า ชิ้นใหญ่กว่า";
    chain = (
      <>
        <span className={chip}>แบ่ง <b className="text-emerald-700">{l.den}</b> ส่วน vs แบ่ง <b className="text-sky-700">{r.den}</b> ส่วน</span>
        {arrow}
      </>
    );
  } else {
    const L = lcm(l.den, r.den);
    const l2 = { num: l.num * (L / l.den), den: L };
    const r2 = { num: r.num * (L / r.den), den: L };
    caseLabel = "ทำตัวส่วนให้เท่ากันก่อน";
    chain = (
      <>
        {l.den !== L && (
          <span className={chip}>
            <StackedFraction numerator={l.num} denominator={l.den} className="text-base" toneClassName="text-emerald-700" />
            <span className="font-extrabold text-slate-500">=</span>
            <StackedFraction numerator={l2.num} denominator={l2.den} className="text-base" toneClassName="text-emerald-700" />
          </span>
        )}
        {r.den !== L && (
          <span className={chip}>
            <StackedFraction numerator={r.num} denominator={r.den} className="text-base" toneClassName="text-sky-700" />
            <span className="font-extrabold text-slate-500">=</span>
            <StackedFraction numerator={r2.num} denominator={r2.den} className="text-base" toneClassName="text-sky-700" />
          </span>
        )}
        {arrow}
        <span className={chip}>
          <StackedFraction numerator={l2.num} denominator={l2.den} className="text-base" toneClassName="text-emerald-700" />
          <span className="text-lg font-extrabold text-rose-600">{sym}</span>
          <StackedFraction numerator={r2.num} denominator={r2.den} className="text-base" toneClassName="text-sky-700" />
        </span>
        {arrow}
      </>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border-2 border-emerald-200 bg-emerald-50/60 p-3 sm:p-4">
      <p className="text-center text-sm font-extrabold text-emerald-700 sm:text-base">💡 วิธีคิด: {caseLabel}</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {chain}
        <span className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-white shadow">
          <span className="text-sm font-extrabold">ดังนั้น</span>
          <StackedFraction numerator={l.num} denominator={l.den} className="text-base" toneClassName="text-white" />
          <span className="text-lg font-extrabold">{sym}</span>
          <StackedFraction numerator={r.num} denominator={r.den} className="text-base" toneClassName="text-white" />
        </span>
      </div>
      <CompareBars l={l} r={r} />
      <p className="rounded-xl bg-amber-50 px-3 py-2 text-center text-xs font-bold text-slate-600 ring-1 ring-amber-200 sm:text-sm">
        🧮 คิดเป็นน้ำหนักจริง (เต็มถุง {fmtW(totalW)} กรัม):{" "}
        <b className="text-emerald-700">ซ้าย {fmtW(wl)} กรัม</b> {sym} <b className="text-sky-700">ขวา {fmtW(wr)} กรัม</b>
      </p>
      {l.den !== r.den && l.num !== r.num && (
        <p className="text-center text-xs font-bold text-slate-500">
          ⚡ ทางลัดคูณไขว้: {l.num}×{r.den} = {l.num * r.den} และ {r.num}×{l.den} = {r.num * l.den} → {l.num * r.den} {sym} {r.num * l.den}
        </p>
      )}
    </div>
  );
}

/* ── ตัวเลือกเศษส่วน (โหมดครู) ── */

function FracPicker({ f, onChange, tone }: { f: Frac; onChange: (f: Frac) => void; tone: "left" | "right" }) {
  const col = tone === "left" ? "text-emerald-700" : "text-sky-700";
  function step(part: "num" | "den", d: number) {
    if (part === "den") {
      const den = Math.max(2, Math.min(12, f.den + d));
      onChange({ den, num: Math.min(f.num, den) });
    } else {
      onChange({ ...f, num: Math.max(1, Math.min(f.den, f.num + d)) });
    }
  }
  const btn = "h-8 w-8 rounded-lg border-2 border-slate-200 bg-white text-base font-extrabold text-slate-600 transition hover:bg-slate-50 active:scale-95";
  return (
    // แถวบนคุมตัวเศษ แถวล่างคุมตัวส่วน — ลบอยู่ซ้าย บวกอยู่ขวา เสมอ
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center justify-center gap-2">
        <span className="w-8 text-right text-[10px] font-extrabold text-slate-400">เศษ</span>
        <button onClick={() => step("num", -1)} className={btn}>−</button>
        <span className={cn("w-10 text-center text-3xl font-extrabold leading-none", col)}>{f.num}</span>
        <button onClick={() => step("num", 1)} className={btn}>+</button>
        <span className="w-8" aria-hidden />
      </div>
      <div className={cn("h-[3px] w-12 rounded bg-current", col)} />
      <div className="flex items-center justify-center gap-2">
        <span className="w-8 text-right text-[10px] font-extrabold text-slate-400">ส่วน</span>
        <button onClick={() => step("den", -1)} className={btn}>−</button>
        <span className={cn("w-10 text-center text-3xl font-extrabold leading-none", col)}>{f.den}</span>
        <button onClick={() => step("den", 1)} className={btn}>+</button>
        <span className="w-8" aria-hidden />
      </div>
    </div>
  );
}

/** ตั้งน้ำหนักเต็มถุง (กรัม) — พิมพ์เองได้ + ปุ่มลัด */
function WeightPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <span className="text-sm font-extrabold text-slate-600">🎒 น้ำหนักเต็มถุง</span>
      <input
        type="number"
        min={1}
        max={100000}
        value={value}
        onChange={(e) => onChange(Math.max(1, Math.min(100000, Number(e.target.value) || 1)))}
        className="w-24 rounded-xl border-2 border-slate-200 bg-white px-2 py-1.5 text-center text-sm font-extrabold text-slate-700 outline-none focus:border-amber-400"
      />
      <span className="text-sm font-extrabold text-slate-600">กรัม</span>
      {[500, 1000, 2000].map((w) => (
        <button key={w} onClick={() => onChange(w)} className={cn("rounded-lg border-2 px-2.5 py-1 text-xs font-extrabold transition", value === w ? "border-amber-400 bg-amber-100 text-amber-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
          {w >= 1000 ? `${w / 1000} กก.` : `${w} ก.`}
        </button>
      ))}
    </div>
  );
}

/** เลือกสิ่งของ: อีโมจิในตัว (key "b:i") หรือรูปที่ครูอัปโหลด (key "c:id") */
function ItemPicker({ sel, onSelect, customs, items }: { sel: string; onSelect: (k: string) => void; customs: CustomItem[]; items: Item[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-1">
      {items.map((it, i) => (
        <button key={it.emoji} onClick={() => onSelect(`b:${i}`)} title={it.name} className={cn("grid h-8 w-8 place-items-center rounded-lg border-2 text-base transition", sel === `b:${i}` ? "border-violet-400 bg-violet-50" : "border-slate-100 bg-white hover:border-slate-300")}>
          {it.emoji}
        </button>
      ))}
      {customs.map((c) => (
        <button key={c.id} onClick={() => onSelect(`c:${c.id}`)} title={c.name} className={cn("grid h-8 w-8 place-items-center overflow-hidden rounded-lg border-2 transition", sel === `c:${c.id}` ? "border-amber-400 ring-1 ring-amber-300" : "border-slate-100 hover:border-slate-300")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={c.img} alt={c.name} className="h-full w-full object-cover" />
        </button>
      ))}
    </div>
  );
}

/* ── ฉากหลังตลาดเทศกาล (SVG/CSS ล้วน — ไม่มีไฟล์ภายนอก ไม่หน่วง) ── */

function MarketBackdrop() {
  // จุดธงบนเส้นโค้งธงราว (เส้นโค้งกำลังสอง P0(0,78) C(400,150) P1(800,78))
  const flagPts = Array.from({ length: 9 }, (_, k) => {
    const t = (k + 1) / 10;
    return {
      x: 2 * (1 - t) * t * 400 + t * t * 800,
      y: (1 - t) * (1 - t) * 78 + 2 * (1 - t) * t * 150 + t * t * 78,
    };
  });
  const flagColors = ["#f472b6", "#fbbf24", "#34d399", "#60a5fa", "#a78bfa"];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* ท้องฟ้ายามเย็นอุ่น ๆ */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-100 via-orange-50/70 to-sky-50" />
      <style>{`
        .mb-sway { animation: mb-sway 7s ease-in-out infinite; transform-origin: 400px 70px; }
        @keyframes mb-sway { 0%,100% { transform: rotate(-1.1deg); } 50% { transform: rotate(1.1deg); } }
        .mb-glow { animation: mb-glow 3.2s ease-in-out infinite; }
        @keyframes mb-glow { 0%,100% { opacity: .3; } 50% { opacity: .75; } }
        .mb-cloud { animation: mb-cloud 55s linear infinite; }
        .mb-cloud2 { animation: mb-cloud 78s linear infinite; animation-delay: -35s; }
        @keyframes mb-cloud { from { transform: translateX(-150px); } to { transform: translateX(920px); } }
      `}</style>

      {/* ผ้าใบร้าน + ธงราว + โคมไฟ (เกาะขอบบน) */}
      <svg className="absolute inset-x-0 top-0 w-full" viewBox="0 0 800 230">
        {/* เมฆลอยช้า ๆ */}
        <g className="mb-cloud" opacity="0.5" fill="#fff">
          <ellipse cx="0" cy="150" rx="46" ry="16" />
          <ellipse cx="32" cy="140" rx="30" ry="13" />
        </g>
        <g className="mb-cloud2" opacity="0.38" fill="#fff">
          <ellipse cx="0" cy="196" rx="38" ry="13" />
          <ellipse cx="-26" cy="188" rx="24" ry="10" />
        </g>
        {/* ผ้าใบลายทางขอบหยัก */}
        <g opacity="0.8">
          {Array.from({ length: 10 }, (_, i) => (
            <g key={i}>
              <rect x={i * 80} y={0} width={80} height={40} fill={i % 2 === 0 ? "#f87171" : "#fff7ed"} />
              <path d={`M ${i * 80} 39 a 40 40 0 0 0 80 0 z`} fill={i % 2 === 0 ? "#f87171" : "#fff7ed"} />
            </g>
          ))}
        </g>
        {/* ธงราวสามเหลี่ยม แกว่งเบา ๆ */}
        <g className="mb-sway">
          <path d="M0 78 Q 400 150 800 78" fill="none" stroke="#b45309" strokeWidth="2" opacity="0.55" />
          {flagPts.map((p, k) => (
            <path key={k} d={`M ${p.x - 11} ${p.y} L ${p.x + 11} ${p.y} L ${p.x} ${p.y + 21} Z`} fill={flagColors[k % flagColors.length]} opacity="0.85" />
          ))}
        </g>
        {/* โคมไฟแขวน ไฟวิบวับสลับจังหวะ */}
        {[{ x: 130, len: 30, d: "0s" }, { x: 400, len: 48, d: "1.1s" }, { x: 670, len: 30, d: "2.2s" }].map((L) => (
          <g key={L.x}>
            <line x1={L.x} y1={62} x2={L.x} y2={62 + L.len} stroke="#92400e" strokeWidth="2" />
            <circle className="mb-glow" cx={L.x} cy={62 + L.len + 13} r={17} fill="#fcd34d" style={{ animationDelay: L.d }} />
            <rect x={L.x - 8} y={62 + L.len} width={16} height={24} rx={7} fill="#f59e0b" stroke="#b45309" strokeWidth="2" />
            <rect x={L.x - 4} y={62 + L.len - 4} width={8} height={5} rx={2} fill="#92400e" />
          </g>
        ))}
      </svg>

      {/* ลังผลไม้ + พุ่มไม้ (เกาะขอบล่าง จาง ๆ) */}
      <svg className="absolute inset-x-0 bottom-0 w-full" viewBox="0 0 800 120">
        <rect x="0" y="96" width="800" height="24" fill="#fbbf24" opacity="0.22" />
        <g opacity="0.35">
          <rect x="18" y="58" width="70" height="44" rx="4" fill="#e0b060" stroke="#a16207" strokeWidth="2.5" />
          <rect x="30" y="24" width="70" height="42" rx="4" fill="#d6a35c" stroke="#a16207" strokeWidth="2.5" />
          <circle cx="48" cy="24" r="9" fill="#fb923c" />
          <circle cx="66" cy="20" r="9" fill="#fb923c" />
          <circle cx="84" cy="24" r="9" fill="#f87171" />
        </g>
        <g opacity="0.32">
          <ellipse cx="756" cy="96" rx="46" ry="26" fill="#4ade80" />
          <ellipse cx="716" cy="106" rx="30" ry="18" fill="#22c55e" />
          <circle cx="748" cy="86" r="5" fill="#fb7185" />
          <circle cx="770" cy="98" r="5" fill="#fb7185" />
        </g>
      </svg>
    </div>
  );
}

/* ── เกมหลัก ── */

export function FractionScaleGame() {
  const [mode, setMode] = useState<"battle" | "teach">("battle");
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  useEffect(() => { mutedRef.current = muted; }, [muted]);
  const { play, ensure } = useSound(mutedRef);

  /* น้ำหนักเต็มถุง (กรัม) — ใช้ร่วมทั้งสองโหมด แปลงเศษส่วนเป็นน้ำหนักจริง */
  const [totalW, setTotalW] = useState(1000);
  const wOf = (f: Frac) => (f.num / f.den) * totalW;

  /* ── โหมดแข่งขัน ── */
  const [started, setStarted] = useState(false);
  const [over, setOver] = useState(false);

  /* เพลงพื้นหลัง — เล่นระหว่างเล่นจริง (โหมดแข่งขันที่เริ่มแล้วยังไม่จบ หรือกำลังอยู่โหมดครู) */
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!bgmRef.current) {
      const audio = new Audio("/sounds/little-shop-of-numbers.mp3");
      audio.loop = true;
      audio.volume = 0.28;
      bgmRef.current = audio;
    }
    const bgm = bgmRef.current;
    const shouldPlay = !muted && ((mode === "battle" && started && !over) || mode === "teach");
    if (shouldPlay) void bgm.play().catch(() => {});
    else bgm.pause();
  }, [mode, muted, started, over]);
  useEffect(() => () => bgmRef.current?.pause(), []);
  const [q, setQ] = useState<Question>(() => genQuestion(1));
  const [phase, setPhase] = useState<Phase>("ask");
  const [chosen, setChosen] = useState<Side | null>(null);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [round, setRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(QTIME);
  const prevLevelRef = useRef(1);

  const level = correctCount >= 8 ? 3 : correctCount >= 4 ? 2 : 1;
  const win = cmp(q.l, q.r);
  const ok = chosen === win;

  function handleAnswer(s: Side | null) {
    setChosen(s);
    setPhase("weighing");
    play("clink");
    window.setTimeout(() => {
      if (s === cmp(q.l, q.r)) {
        const nc = combo + 1;
        setCombo(nc);
        setCorrectCount((c) => c + 1);
        setScore((sc) => sc + 10 + Math.min(20, (nc - 1) * 5));
        play(nc >= 3 ? "combo" : "correct");
      } else {
        setCombo(0);
        setLives((lv) => lv - 1);
        play("wrong");
      }
      setPhase("result");
    }, 950);
  }
  const answerRef = useRef(handleAnswer);
  useEffect(() => { answerRef.current = handleAnswer; });

  /* จับเวลา: นับเฉพาะตอนรอคำตอบ */
  useEffect(() => {
    if (!(mode === "battle" && started && !over && phase === "ask")) return;
    const id = window.setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => window.clearInterval(id);
  }, [mode, started, over, phase, round]);
  useEffect(() => {
    if (mode === "battle" && started && !over && phase === "ask" && timeLeft === 0) answerRef.current(null);
  }, [timeLeft, mode, started, over, phase]);

  function start() {
    ensure();
    play("start");
    setLives(3); setScore(0); setCombo(0); setCorrectCount(0); setRound(1); setOver(false);
    prevLevelRef.current = 1;
    setQ(genQuestion(1));
    setChosen(null);
    setPhase("ask");
    setTimeLeft(QTIME);
    setStarted(true);
  }

  function next() {
    const lv = correctCount >= 8 ? 3 : correctCount >= 4 ? 2 : 1;
    if (lv > prevLevelRef.current) play("levelup");
    prevLevelRef.current = lv;
    setQ(genQuestion(lv));
    setChosen(null);
    setPhase("ask");
    setTimeLeft(QTIME);
    setRound((n) => n + 1);
  }

  function finish() {
    setBest((b) => Math.max(b, score));
    setOver(true);
    play("over");
  }

  /* ── โหมดครู ── */
  const [tl, setTl] = useState<Frac>({ num: 3, den: 4 });
  const [tr, setTr] = useState<Frac>({ num: 5, den: 8 });
  const [tliKey, setTliKey] = useState("b:0");
  const [triKey, setTriKey] = useState("b:1");
  const [tRevealed, setTRevealed] = useState(false);
  const [teachLevel, setTeachLevel] = useState(3);

  /* คลังสิ่งของที่ครูอัปโหลด — โหลด/บันทึกกับ localStorage */
  const [customs, setCustoms] = useState<CustomItem[]>([]);
  const [draftImg, setDraftImg] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CUSTOM_ITEMS_KEY);
      if (raw) setCustoms(JSON.parse(raw) as CustomItem[]);
    } catch { /* ข้อมูลเสีย ให้เริ่มคลังว่าง */ }
  }, []);
  function saveCustoms(list: CustomItem[]) {
    setCustoms(list);
    try { localStorage.setItem(CUSTOM_ITEMS_KEY, JSON.stringify(list)); } catch { /* พื้นที่เต็ม */ }
  }
  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      // ย่อรูปเหลือด้านยาวสุด 128px ก่อนเก็บ — กัน localStorage เต็ม
      const im = new window.Image();
      im.onload = () => {
        const s = Math.min(1, 128 / Math.max(im.width, im.height));
        const c = document.createElement("canvas");
        c.width = Math.max(1, Math.round(im.width * s));
        c.height = Math.max(1, Math.round(im.height * s));
        const ctx = c.getContext("2d");
        if (!ctx) { setDraftImg(reader.result as string); return; }
        ctx.drawImage(im, 0, 0, c.width, c.height);
        setDraftImg(c.toDataURL("image/jpeg", 0.85));
      };
      im.src = reader.result as string;
    };
    reader.readAsDataURL(f);
    e.target.value = "";
  }
  function addCustom() {
    if (!draftImg || !draftName.trim()) return;
    const item: CustomItem = { id: Date.now(), name: draftName.trim(), img: draftImg };
    saveCustoms([...customs, item]);
    setDraftImg(null);
    setDraftName("");
    setTliKey(`c:${item.id}`); // เลือกให้เลยฝั่งซ้าย
  }
  function removeCustom(id: number) {
    saveCustoms(customs.filter((c) => c.id !== id));
    if (tliKey === `c:${id}`) setTliKey("b:0");
    if (triKey === `c:${id}`) setTriKey("b:1");
  }
  function resolveItem(key: string): Item {
    if (key.startsWith("c:")) {
      const c = customs.find((x) => x.id === Number(key.slice(2)));
      if (c) return { img: c.img, name: c.name };
    }
    // โหมดครูใช้ของในชีวิตประจำวัน (REAL_ITEMS)
    const i = Number(key.slice(2));
    return REAL_ITEMS[Number.isFinite(i) ? Math.min(REAL_ITEMS.length - 1, Math.max(0, i)) : 0];
  }
  const liItem = resolveItem(tliKey);
  const riItem = resolveItem(triKey);

  function teachReveal() {
    ensure();
    setTRevealed(true);
    play("clink");
    window.setTimeout(() => play("correct"), 900);
  }
  function teachRandom() {
    const { l, r } = genFracs(teachLevel);
    setTl(l); setTr(r);
    setTliKey(`b:${randInt(0, REAL_ITEMS.length - 1)}`);
    setTriKey(`b:${randInt(0, REAL_ITEMS.length - 1)}`);
    setTRevealed(false);
  }

  const battleTilt = phase === "ask" ? 0 : win === "left" ? -9 : win === "right" ? 9 : 0;
  const teachTilt = !tRevealed ? 0 : cmp(tl, tr) === "left" ? -9 : cmp(tl, tr) === "right" ? 9 : 0;

  const answerBtn = (side: Side, label: string, color: string) => (
    <button
      onClick={() => phase === "ask" && handleAnswer(side)}
      disabled={phase !== "ask"}
      className={cn(
        "rounded-2xl border-b-4 px-4 py-3 text-sm font-extrabold text-white shadow-lg transition sm:px-6 sm:text-lg",
        color,
        phase === "ask" ? "hover:brightness-105 active:scale-[0.97] active:border-b-2" : "opacity-90",
        phase === "result" && side === win && "ring-4 ring-amber-300",
        phase === "result" && chosen === side && side !== win && "opacity-40 grayscale",
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="relative overflow-hidden rounded-2xl p-3 sm:p-4">
      <MarketBackdrop />
      <div className="relative space-y-4">
      <style>{`
        @keyframes custIn { 0% { transform: translateY(-14px) scale(0.9); opacity: 0; } 60% { transform: translateY(3px) scale(1.02); } 100% { transform: translateY(0) scale(1); opacity: 1; } }
      `}</style>

      {/* แถบเลือกโหมด + ปิดเสียง */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex rounded-xl border-2 border-slate-200 bg-white p-1">
          <button onClick={() => setMode("battle")} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "battle" ? "bg-sky-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
            <Swords size={15} /> โหมดแข่งขัน
          </button>
          <button onClick={() => setMode("teach")} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "teach" ? "bg-violet-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
            <GraduationCap size={15} /> โหมดครูใช้สอน
          </button>
        </div>
        <button onClick={() => setMuted((m) => !m)} className="grid h-9 w-9 place-items-center rounded-xl border-2 border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50" title={muted ? "เปิดเสียง" : "ปิดเสียง"}>
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>

      {/* ═══════ โหมดแข่งขัน ═══════ */}
      {mode === "battle" && !started && (
        <div className="space-y-4 rounded-2xl border-2 border-sky-200 bg-white/80 p-6 text-center">
          <div className="flex items-end justify-center gap-3">
            <OwlWizard className="h-28 w-24" />
            <span className="text-5xl">⚖️</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-800 sm:text-2xl">ศึกตาชั่งเศษส่วน</h3>
          <p className="mx-auto max-w-md text-sm font-bold text-slate-500 sm:text-base">
            ช่วยพ่อมดฮูกชั่งของวิเศษให้ลูกค้า! ดูเศษส่วนสองฝั่งแล้วทายว่า <b>ฝั่งไหนหนักกว่า</b> ก่อนตาชั่งจะเฉลย
          </p>
          <div className="mx-auto flex max-w-md flex-wrap justify-center gap-2 text-xs font-extrabold text-slate-600">
            <span className="rounded-full bg-amber-100 px-3 py-1">⏱ ข้อละ {QTIME} วิ</span>
            <span className="rounded-full bg-rose-100 px-3 py-1">❤️ พลาดได้ 3 ครั้ง</span>
            <span className="rounded-full bg-violet-100 px-3 py-1">⛰ 3 ระดับ ยากขึ้นเรื่อย ๆ</span>
            <span className="rounded-full bg-orange-100 px-3 py-1">🔥 ตอบถูกติดกันได้คอมโบ</span>
          </div>
          <WeightPicker value={totalW} onChange={setTotalW} />
          <p className="text-xs font-bold text-slate-400">ตั้งน้ำหนักเต็มถุงได้เอง — หลังตอบจะเฉลยเป็นน้ำหนักจริง เช่น 3/10 ของ 1,000 กรัม = 300 กรัม</p>
          {best > 0 && <p className="flex items-center justify-center gap-1.5 text-sm font-extrabold text-amber-600"><Trophy size={15} /> คะแนนสูงสุด {best}</p>}
          <button onClick={start} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
            <Play size={20} /> เริ่มเกม!
          </button>
        </div>
      )}

      {mode === "battle" && started && over && (
        <div className="space-y-4 rounded-2xl border-2 border-amber-200 bg-white/80 p-6 text-center">
          <OwlWizard className="mx-auto h-28 w-24" />
          <h3 className="text-xl font-extrabold text-slate-800 sm:text-2xl">🏁 ปิดร้านแล้ว — เก่งมาก!</h3>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-base font-extrabold sm:text-lg">
            <span className="text-amber-700">🏅 คะแนน {score}</span>
            <span className="text-emerald-700">✅ บริการลูกค้าสำเร็จ {correctCount} ครั้ง</span>
            <span className="flex items-center gap-1 text-slate-500"><Trophy size={16} /> สูงสุด {Math.max(best, score)}</span>
          </div>
          <p className="text-sm font-bold text-slate-500">
            {score >= 150 ? "🌟🌟🌟 สุดยอดผู้ช่วยพ่อมด!" : score >= 80 ? "🌟🌟 เก่งมาก ใกล้เป็นมืออาชีพแล้ว!" : "🌟 ฝึกอีกนิด เดี๋ยวก็ชั่งแม่นแน่นอน!"}
          </p>
          <button onClick={start} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
            <RotateCcw size={18} /> เล่นอีกครั้ง
          </button>
        </div>
      )}

      {mode === "battle" && started && !over && (
        <div className="space-y-3">
          {/* แถบสถานะ */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 rounded-2xl bg-amber-50 px-4 py-2.5 ring-1 ring-amber-200">
            <span className="text-lg font-extrabold text-amber-700 sm:text-xl">🏅 {score}</span>
            <span className="flex items-center gap-1.5 text-sm font-extrabold text-slate-600">
              ⏱ {timeLeft} วิ
              <span className="inline-block h-2 w-16 overflow-hidden rounded-full bg-slate-200 align-middle">
                <span className={cn("block h-full rounded-full transition-all", timeLeft > 8 ? "bg-emerald-500" : "bg-rose-500")} style={{ width: `${(timeLeft / QTIME) * 100}%` }} />
              </span>
            </span>
            <span className="text-base tracking-wider">{Array.from({ length: 3 }, (_, i) => (i < lives ? "❤️" : "🤍")).join("")}</span>
            <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-extrabold text-violet-700">⛰ ระดับ {level} — {LEVEL_LABELS[level]}</span>
            {combo >= 2 && <span className="text-base font-extrabold text-orange-600">🔥 x{combo}</span>}
          </div>

          {/* ลูกค้า */}
          <div key={round} className="mx-auto flex max-w-2xl items-center gap-3 rounded-2xl border-2 border-violet-200 bg-white/80 px-4 py-2.5" style={{ animation: "custIn 0.5s ease-out" }}>
            <span className="text-4xl sm:text-5xl">{q.cust.emoji}</span>
            <div className="min-w-0">
              <p className="text-xs font-extrabold text-violet-500">{q.cust.name} · ลูกค้าคนที่ {round}</p>
              <p className="text-sm font-extrabold text-slate-700 sm:text-base">
                ช่วยชั่งหน่อย~ {q.li.emoji} {q.li.name} กับ {q.ri.emoji} {q.ri.name} <u>ฝั่งไหนหนักกว่ากัน?</u>{" "}
                <span className="whitespace-nowrap rounded-full bg-amber-100 px-2 py-0.5 text-xs font-extrabold text-amber-700">🎒 ถุงละ {fmtW(totalW)} กรัม</span>
              </p>
            </div>
          </div>

          {/* ตาชั่ง + ฮูก */}
          <div className="relative">
            <BalanceScale l={q.l} r={q.r} li={q.li} ri={q.ri} tilt={battleTilt} showQ={phase === "ask"} verdict={phase === "result" ? win : null} wl={phase === "result" ? fmtW(wOf(q.l)) : null} wr={phase === "result" ? fmtW(wOf(q.r)) : null} />
            <OwlWizard className="absolute bottom-0 left-0 hidden h-24 w-20 sm:block" />
            {phase === "weighing" && <p className="absolute inset-x-0 bottom-1 text-center text-sm font-extrabold text-amber-600">⚖️ กำลังชั่ง...</p>}
          </div>

          {/* ปุ่มตอบ */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {answerBtn("left", "⬅️ ฝั่งซ้ายหนักกว่า", "border-emerald-700 bg-gradient-to-b from-emerald-500 to-emerald-600")}
            {answerBtn("equal", "⚖️ เท่ากัน", "border-amber-600 bg-gradient-to-b from-amber-400 to-amber-500")}
            {answerBtn("right", "ฝั่งขวาหนักกว่า ➡️", "border-sky-700 bg-gradient-to-b from-sky-500 to-sky-600")}
          </div>

          {/* ผล + เฉลย */}
          {phase === "result" && (
            <div className="space-y-3">
              <p className={cn("text-center text-lg font-extrabold sm:text-xl", ok ? "text-emerald-600" : "text-rose-600")}>
                {ok ? "✅ ถูกต้อง! เก่งมาก" : chosen === null ? "⏰ หมดเวลา!" : "❌ ยังไม่ใช่"}
                {!ok && <span className="ml-2 text-slate-600">คำตอบคือ {win === "left" ? "ฝั่งซ้ายหนักกว่า" : win === "right" ? "ฝั่งขวาหนักกว่า" : "เท่ากัน"}</span>}
              </p>
              <Explanation l={q.l} r={q.r} totalW={totalW} />
              <div className="text-center">
                {lives <= 0 ? (
                  <button onClick={finish} className="inline-flex items-center gap-2 rounded-xl bg-slate-700 px-6 py-2.5 text-base font-extrabold text-white shadow transition hover:bg-slate-800 active:scale-[0.98]">
                    🏁 ดูสรุปผล
                  </button>
                ) : (
                  <button onClick={next} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-2.5 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                    🛎️ ลูกค้าคนถัดไป
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════ โหมดครูใช้สอน ═══════ */}
      {mode === "teach" && (
        <div className="space-y-3">
          <div className="rounded-2xl bg-violet-50 px-4 py-2 text-center text-sm font-extrabold text-violet-700 ring-1 ring-violet-200">
            🧑‍🏫 โหมดครู — ชั่งของจริงในชีวิตประจำวัน (ผลไม้ เนื้อสัตว์ ของตลาด) ให้นักเรียนทายก่อน แล้วค่อยกด &quot;ชั่งเลย&quot; เฉลยพร้อมวิธีคิด + น้ำหนักจริง
          </div>

          <div className="space-y-1">
            <WeightPicker value={totalW} onChange={(n) => { setTotalW(n); }} />
            <p className="text-center text-[11px] font-bold text-slate-400">แนะนำตั้งไม่เกิน 3,000 กรัม (3 กก.) ให้สมจริงกับของที่ชั่งได้ในตลาด</p>
          </div>

          {/* คลังสิ่งของของฉัน — อัปโหลดรูปจริง + ตั้งชื่อ + บันทึกเก็บไว้ */}
          <div className="space-y-2 rounded-2xl border-2 border-amber-200 bg-amber-50/50 p-3">
            <p className="text-center text-xs font-extrabold text-amber-700 sm:text-sm">
              📦 คลังสิ่งของของฉัน — อัปโหลดรูปจริงมาใช้แทนของวิเศษ กดบันทึกเก็บไว้ใช้สอนครั้งหน้าได้
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <label className="flex cursor-pointer items-center gap-1.5 rounded-xl border-2 border-dashed border-amber-300 bg-white px-3 py-1.5 text-xs font-extrabold text-amber-700 transition hover:bg-amber-100">
                <Upload size={13} /> เลือกรูป
                <input type="file" accept="image/*" className="hidden" onChange={onFile} />
              </label>
              {draftImg && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={draftImg} alt="ตัวอย่างรูปที่เลือก" className="h-9 w-9 rounded-lg object-cover ring-2 ring-amber-300" />
              )}
              <input
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                placeholder="ชื่อสิ่งของ เช่น แอปเปิล"
                className="w-44 rounded-xl border-2 border-slate-200 bg-white px-2.5 py-1.5 text-sm font-bold text-slate-700 outline-none focus:border-amber-400"
              />
              <button
                onClick={addCustom}
                disabled={!draftImg || !draftName.trim()}
                className={cn("flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-extrabold text-white transition", draftImg && draftName.trim() ? "bg-amber-600 hover:bg-amber-700 active:scale-95" : "cursor-not-allowed bg-slate-300")}
              >
                <Save size={13} /> บันทึกเข้าคลัง
              </button>
            </div>
            {customs.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1.5">
                {customs.map((c) => (
                  <span key={c.id} className="relative inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.img} alt={c.name} title={c.name} className="h-10 w-10 rounded-lg object-cover ring-1 ring-slate-200" />
                    <button onClick={() => removeCustom(c.id)} title={`ลบ ${c.name}`} aria-label={`ลบ ${c.name}`} className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-rose-500 text-[10px] font-extrabold text-white shadow ring-2 ring-white transition hover:bg-rose-600 active:scale-90">✕</button>
                  </span>
                ))}
              </div>
            )}
            <p className="text-center text-[11px] font-bold text-slate-400">รูปที่บันทึกจะไปโผล่ท้ายแถวเลือกสิ่งของของทั้งสองฝั่ง (เก็บไว้ในเครื่องนี้)</p>
          </div>

          {/* ตั้งค่าสองฝั่ง */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2 rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 p-3">
              <p className="text-center text-xs font-extrabold text-emerald-700">ฝั่งซ้าย {liItem.emoji ?? "🖼️"} {liItem.name}</p>
              <FracPicker f={tl} onChange={(f) => { setTl(f); setTRevealed(false); }} tone="left" />
              <ItemPicker sel={tliKey} onSelect={setTliKey} customs={customs} items={REAL_ITEMS} />
            </div>
            <div className="space-y-2 rounded-2xl border-2 border-sky-200 bg-sky-50/50 p-3">
              <p className="text-center text-xs font-extrabold text-sky-700">ฝั่งขวา {riItem.emoji ?? "🖼️"} {riItem.name}</p>
              <FracPicker f={tr} onChange={(f) => { setTr(f); setTRevealed(false); }} tone="right" />
              <ItemPicker sel={triKey} onSelect={setTriKey} customs={customs} items={REAL_ITEMS} />
            </div>
          </div>

          {/* ปุ่มควบคุม */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {!tRevealed ? (
              <button onClick={teachReveal} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 px-7 py-2.5 text-base font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
                <Eye size={17} /> ⚖️ ชั่งเลย!
              </button>
            ) : (
              <button onClick={() => setTRevealed(false)} className="flex items-center gap-2 rounded-xl border-2 border-violet-300 bg-white px-6 py-2.5 text-base font-extrabold text-violet-700 transition hover:bg-violet-50">
                <EyeOff size={17} /> ซ่อนผล
              </button>
            )}
            <button onClick={teachRandom} className="flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50">
              <Shuffle size={15} /> สุ่มโจทย์
            </button>
            <div className="flex gap-1">
              {[1, 2, 3].map((lv) => (
                <button key={lv} onClick={() => setTeachLevel(lv)} title={LEVEL_LABELS[lv]} className={cn("rounded-lg border-2 px-2.5 py-1 text-xs font-extrabold transition", teachLevel === lv ? "border-violet-400 bg-violet-100 text-violet-700" : "border-slate-200 bg-white text-slate-400 hover:bg-slate-50")}>
                  ระดับ {lv}
                </button>
              ))}
            </div>
          </div>

          {/* ตาชั่ง + ฮูก */}
          <div className="relative">
            <BalanceScale l={tl} r={tr} li={liItem} ri={riItem} tilt={teachTilt} showQ={!tRevealed} verdict={tRevealed ? cmp(tl, tr) : null} wl={tRevealed ? fmtW(wOf(tl)) : null} wr={tRevealed ? fmtW(wOf(tr)) : null} />
            <OwlWizard className="absolute bottom-0 left-0 hidden h-24 w-20 sm:block" />
          </div>

          {tRevealed ? (
            <Explanation l={tl} r={tr} totalW={totalW} />
          ) : (
            <p className="text-center text-sm font-extrabold text-amber-600">🤔 ให้นักเรียนช่วยกันทายก่อน: ฝั่งไหนหนักกว่า แล้วค่อยกดชั่ง!</p>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
