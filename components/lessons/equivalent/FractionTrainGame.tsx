"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Volume2, VolumeX, Eye, EyeOff, Users, User } from "lucide-react";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { cn } from "@/lib/cn";
import { randInt } from "@/lib/randomFraction";

/* ── ชนิดข้อมูล ── */

type Frac = { num: number; den: number };
type CardForm = "mix" | "num" | "pic";
type CardT = { id: number; pairId: number; kind: "num" | "pic"; num: number; den: number };

/* เศษส่วนฐาน (ค่าไม่ซ้ำกันเลย — กันการจับคู่ข้ามคู่) */
const BASES: Frac[] = [
  { num: 1, den: 2 }, { num: 1, den: 3 }, { num: 2, den: 3 }, { num: 1, den: 4 },
  { num: 3, den: 4 }, { num: 1, den: 5 }, { num: 2, den: 5 }, { num: 3, den: 5 },
  { num: 4, den: 5 }, { num: 1, den: 6 }, { num: 5, den: 6 },
];

const PAIR_OPTIONS = [4, 6, 8];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let cardSeq = 1;

function genDeck(pairs: number, form: CardForm): CardT[] {
  const bases = shuffle(BASES).slice(0, pairs);
  const cards: CardT[] = [];
  bases.forEach((b, pairId) => {
    const kMax = Math.max(2, Math.floor(12 / b.den));
    const k = randInt(2, kMax);
    const partner = { num: b.num * k, den: b.den * k };
    const kinds: ["num" | "pic", "num" | "pic"] =
      form === "num" ? ["num", "num"] : form === "pic" ? ["pic", "pic"] : randInt(0, 1) === 0 ? ["num", "pic"] : ["pic", "num"];
    cards.push({ id: cardSeq++, pairId, kind: kinds[0], ...b });
    cards.push({ id: cardSeq++, pairId, kind: kinds[1], ...partner });
  });
  return shuffle(cards);
}

/* ── เสียง ── */

type SoundKind = "flip" | "match" | "wrong" | "chug" | "whistle" | "win" | "start";

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
      case "flip": return tones([880, 1175], 0.04, 0.08, "triangle", 0.08);
      case "match": return tones([660, 990, 1319], 0.06, 0.1, "triangle", 0.14);
      case "wrong": return tones([220, 165], 0.11, 0.18, "sawtooth", 0.1);
      case "chug": return tones([98, 98, 131, 98], 0.09, 0.1, "sawtooth", 0.09);
      case "whistle": return tones([740, 880, 880], 0.14, 0.32, "sine", 0.12);
      case "win": return tones([523, 659, 784, 1047, 1319, 1568], 0.09, 0.18, "triangle", 0.15);
      case "start": return tones([523, 659, 784], 0.07, 0.12, "triangle", 0.14);
    }
  }
  return { play, ensure };
}

/* ── เพลงรถไฟ (ชิปทูน ไม่ใช้ไฟล์) ── */

const TRAIN_LEAD = [72, 72, 74, 76, 72, 0, 67, 0, 69, 69, 72, 74, 69, 0, 64, 0, 72, 72, 74, 76, 79, 76, 74, 72, 74, 72, 69, 67, 69, 72, 0, 0];
const TRAIN_BASS = [48, 55, 48, 55, 41, 48, 41, 48, 45, 52, 45, 52, 43, 50, 43, 50];

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
      const m = TRAIN_LEAD[s];
      if (m) note(m, 0.16, "square", 0.026);
      if (s % 2 === 0) {
        const b = TRAIN_BASS[s / 2];
        if (b) note(b, 0.26, "triangle", 0.05);
      }
    }, 210);
  }
  function stop() {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }
  useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);
  return { start, stop };
}

/* ── เศษส่วนจิ๋วใน SVG ── */

function TrainFrac({ x, y, num, den, color }: { x: number; y: number; num: number; den: number; color: string }) {
  return (
    <g textAnchor="middle" fontWeight={900} fill={color}>
      <text x={x} y={y} fontSize={11}>{num}</text>
      <line x1={x - 6} y1={y + 3} x2={x + 6} y2={y + 3} stroke={color} strokeWidth={1.4} strokeLinecap="round" />
      <text x={x} y={y + 13} fontSize={11}>{den}</text>
    </g>
  );
}

/* ── ขบวนรถไฟ 3D — หัวรถจักร + ตู้ที่จับคู่ได้ ── */

const CAR_TONES = [
  { front: "#fda4af", top: "#fb7185", side: "#e11d48", text: "#881337" },
  { front: "#fcd34d", top: "#fbbf24", side: "#d97706", text: "#78350f" },
  { front: "#86efac", top: "#4ade80", side: "#16a34a", text: "#14532d" },
  { front: "#93c5fd", top: "#60a5fa", side: "#2563eb", text: "#1e3a8a" },
  { front: "#d8b4fe", top: "#c084fc", side: "#9333ea", text: "#581c87" },
  { front: "#fdba74", top: "#fb923c", side: "#ea580c", text: "#7c2d12" },
  { front: "#a5f3fc", top: "#67e8f9", side: "#0891b2", text: "#164e63" },
  { front: "#f9a8d4", top: "#f472b6", side: "#db2777", text: "#831843" },
];

function TrainSVG({ cars, engineColor, label }: { cars: { a: Frac; b: Frac }[]; engineColor: string; label?: string }) {
  const CAR_W = 78, PAD = 8, ENGINE_W = 104, STEP = 20;
  const DX = 9, DY = 6;
  const n = cars.length;
  const offset = n * STEP; // ตอบถูกแต่ละข้อ → เลื่อนขวาทีละนิด
  const engineX = PAD + n * CAR_W; // หัวรถไฟอยู่ขวาสุด (หลังกล่องตัวเลข)
  const W = engineX + ENGINE_W + offset + 48;
  return (
    <svg viewBox={`0 0 ${W} 112`} style={{ width: Math.min(640, W * 1.3), maxWidth: "100%" }} className="h-auto" role="img" aria-label={`รถไฟ${label ?? ""} มี ${n} ตู้`}>
      <style>{`
        .tr-bounce { animation: trBounce 1.6s ease-in-out infinite; }
        @keyframes trBounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-1.6px); } }
        .tr-smoke { animation: trSmoke 2.2s ease-out infinite; }
        @keyframes trSmoke { 0% { transform: translateY(0); opacity: 0.7; } 100% { transform: translateY(-16px); opacity: 0; } }
        .tr-carin { animation: trCarIn 0.5s cubic-bezier(.34,1.4,.5,1); }
        @keyframes trCarIn { 0% { transform: scale(0.4) translateY(-18px); opacity: 0; } 100% { transform: scale(1) translateY(0); opacity: 1; } }
      `}</style>

      {/* ราง (อยู่กับที่) */}
      <line x1={0} y1={100} x2={W} y2={100} stroke="#94a3b8" strokeWidth={3} />
      <line x1={0} y1={105} x2={W} y2={105} stroke="#cbd5e1" strokeWidth={2} strokeDasharray="8 6" />

      {/* ธงปลายทาง (อยู่กับที่ ขวาสุด) */}
      <g>
        <line x1={W - 22} y1={100} x2={W - 22} y2={64} stroke="#78350f" strokeWidth={2.5} />
        <path d={`M ${W - 22} 64 L ${W - 4} 71 L ${W - 22} 78 Z`} fill="#ef4444" stroke="#b91c1c" strokeWidth={1} />
      </g>

      {/* ขบวนรถไฟ — เลื่อนไปขวาทีละนิดทุกครั้งที่ตอบถูก */}
      <g style={{ transform: `translateX(${offset}px)`, transition: "transform 0.6s cubic-bezier(.34,1.2,.5,1)" }}>
        <g className="tr-bounce">
          {/* กล่องตัวเลข (ซ้าย) */}
          {cars.map((car, i) => {
            const x = PAD + i * CAR_W;
            const t = CAR_TONES[i % CAR_TONES.length];
            return (
              <g key={i} className={i === n - 1 ? "tr-carin" : undefined} style={{ transformOrigin: `${x + 32}px 70px` }}>
                {/* ข้อต่อ (ขวา → ตู้ถัดไป/หัวรถ) */}
                <line x1={x + 64} y1={82} x2={x + CAR_W} y2={82} stroke="#475569" strokeWidth={3} />
                {/* กล่อง 3D */}
                <polygon points={`${x},46 ${x + 64},46 ${x + 64 + DX},${46 - DY} ${x + DX},${46 - DY}`} fill={t.top} stroke="#1e293b" strokeWidth={1.5} />
                <polygon points={`${x + 64},46 ${x + 64 + DX},${46 - DY} ${x + 64 + DX},${88 - DY} ${x + 64},88`} fill={t.side} stroke="#1e293b" strokeWidth={1.5} />
                <rect x={x} y={46} width={64} height={42} rx={4} fill={t.front} stroke="#1e293b" strokeWidth={2.5} />
                {/* คู่เศษส่วนบนตู้ */}
                <TrainFrac x={x + 16} y={62} num={car.a.num} den={car.a.den} color={t.text} />
                <text x={x + 32} y={70} fontSize={13} textAnchor="middle" fontWeight={900} fill={t.text}>=</text>
                <TrainFrac x={x + 48} y={62} num={car.b.num} den={car.b.den} color={t.text} />
                {/* ล้อ */}
                <circle cx={x + 14} cy={92} r={7} fill="#334155" stroke="#1e293b" strokeWidth={2} />
                <circle cx={x + 50} cy={92} r={7} fill="#334155" stroke="#1e293b" strokeWidth={2} />
              </g>
            );
          })}

          {/* หัวรถจักร 3D (ขวาสุด หันหน้าขวา) */}
          <g transform={`translate(${engineX - 14},0)`}>
            {/* ควัน */}
            <circle className="tr-smoke" cx={92} cy={26} r={5} fill="#cbd5e1" />
            <circle className="tr-smoke" cx={97} cy={22} r={3.5} fill="#e2e8f0" style={{ animationDelay: "0.8s" }} />
            {/* ตัวรถ */}
            <polygon points={`14,44 74,44 ${74 + DX},${44 - DY} ${14 + DX},${44 - DY}`} fill={engineColor} opacity={0.75} stroke="#1e293b" strokeWidth={1.5} />
            <polygon points={`74,44 ${74 + DX},${44 - DY} ${74 + DX},${88 - DY} 74,88`} fill="#1e293b" opacity={0.25} stroke="#1e293b" strokeWidth={1.5} />
            <rect x={14} y={44} width={60} height={44} rx={5} fill={engineColor} stroke="#1e293b" strokeWidth={2.5} />
            {/* ห้องคนขับ */}
            <rect x={18} y={26} width={26} height={22} rx={4} fill={engineColor} stroke="#1e293b" strokeWidth={2.5} />
            <rect x={23} y={31} width={12} height={10} rx={2} fill="#e0f2fe" stroke="#1e293b" strokeWidth={1.5} />
            {/* ปล่องไฟ */}
            <rect x={84} y={28} width={12} height={18} rx={3} fill="#334155" stroke="#1e293b" strokeWidth={2} />
            {/* หม้อน้ำหน้า */}
            <rect x={74} y={52} width={26} height={36} rx={6} fill={engineColor} stroke="#1e293b" strokeWidth={2.5} />
            <circle cx={87} cy={64} r={5} fill="#fef3c7" stroke="#1e293b" strokeWidth={1.5} />
            {/* คราด */}
            <polygon points={`100,88 112,88 100,72`} fill="#475569" stroke="#1e293b" strokeWidth={1.5} />
            {/* ล้อ */}
            {[28, 56, 86].map((wx) => (
              <g key={wx}>
                <circle cx={wx} cy={92} r={8} fill="#334155" stroke="#1e293b" strokeWidth={2} />
                <circle cx={wx} cy={92} r={2.5} fill="#94a3b8" />
              </g>
            ))}
          </g>
        </g>
      </g>
    </svg>
  );
}

/* ── หลังการ์ดสไตล์การ์ดสะสม (SVG ล้วน) ── */

function TrainCardBack() {
  return (
    <svg viewBox="0 0 120 160" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <radialGradient id="tcb-bg" cx="0.5" cy="0.42" r="0.75">
          <stop offset="0" stopColor="#5eead4" />
          <stop offset="0.55" stopColor="#14b8a6" />
          <stop offset="1" stopColor="#0f766e" />
        </radialGradient>
        <linearGradient id="tcb-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0d9488" />
          <stop offset="1" stopColor="#134e4a" />
        </linearGradient>
        <radialGradient id="tcb-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ccfbf1" stopOpacity="0.75" />
          <stop offset="1" stopColor="#ccfbf1" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* พื้นหลัง + กรอบ */}
      <rect x="0" y="0" width="120" height="160" rx="12" fill="url(#tcb-bg)" />
      {/* แสงพุ่งจากกลาง */}
      <g opacity="0.18">
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i * Math.PI * 2) / 16;
          return <polygon key={i} points={`60,74 ${60 + Math.cos(a - 0.09) * 120},${74 + Math.sin(a - 0.09) * 120} ${60 + Math.cos(a + 0.09) * 120},${74 + Math.sin(a + 0.09) * 120}`} fill="#ecfeff" />;
        })}
      </g>
      {/* กรอบอาร์ตเดโค */}
      <rect x="4.5" y="4.5" width="111" height="151" rx="10" fill="none" stroke="#f0fdfa" strokeWidth="2.5" opacity="0.9" />
      <rect x="9" y="9" width="102" height="142" rx="7" fill="none" stroke="#0f766e" strokeWidth="1.6" opacity="0.7" />
      {/* มุมประดับ */}
      {[[13, 13, 1, 1], [107, 13, -1, 1], [13, 147, 1, -1], [107, 147, -1, -1]].map(([x, y, sx, sy], i) => (
        <path key={i} d={`M ${x} ${(y as number) + 9 * (sy as number)} L ${x} ${y} L ${(x as number) + 9 * (sx as number)} ${y}`} fill="none" stroke="#fcd34d" strokeWidth="1.6" opacity="0.85" />
      ))}

      {/* เข็มทิศ + ดาวมุมบนซ้าย */}
      <g transform="translate(24,24)">
        <circle r="10.5" fill="#0f766e" opacity="0.55" />
        <circle r="12.5" fill="none" stroke="#f0fdfa" strokeWidth="0.9" strokeDasharray="2 2" opacity="0.8" />
        <path d="M0,-8 L2,-2 L8,0 L2,2 L0,8 L-2,2 L-8,0 L-2,-2 Z" fill="#fcd34d" stroke="#f59e0b" strokeWidth="0.6" />
        <circle r="1.6" fill="#fffbeb" />
      </g>

      {/* ดาว/จุดกระจาย */}
      {[[46, 20, 2.4], [88, 30, 1.6], [96, 96, 2], [22, 104, 1.6], [78, 118, 2.2]].map(([x, y, r], i) => (
        <path key={i} d={`M ${x} ${(y as number) - (r as number)} L ${(x as number) + (r as number) * 0.4} ${(y as number) - (r as number) * 0.4} L ${(x as number) + (r as number)} ${y} L ${(x as number) + (r as number) * 0.4} ${(y as number) + (r as number) * 0.4} L ${x} ${(y as number) + (r as number)} L ${(x as number) - (r as number) * 0.4} ${(y as number) + (r as number) * 0.4} L ${(x as number) - (r as number)} ${y} L ${(x as number) - (r as number) * 0.4} ${(y as number) - (r as number) * 0.4} Z`} fill="#ecfeff" opacity="0.75" />
      ))}
      {[[36, 40], [92, 62], [30, 70], [100, 120]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1" fill="#ccfbf1" opacity="0.6" />
      ))}
      {/* เส้นโค้งประ */}
      <path d="M 92 38 C 112 54, 74 72, 98 92" fill="none" stroke="#f0fdfa" strokeWidth="1" strokeDasharray="3 3" opacity="0.35" />
      <path d="M 28 118 C 12 100, 46 92, 26 74" fill="none" stroke="#f0fdfa" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />

      {/* หัวรถจักรไอน้ำ */}
      <ellipse cx="60" cy="78" rx="42" ry="34" fill="url(#tcb-glow)" />
      <g transform="translate(60,80)">
        {/* ควัน */}
        <circle cx="17" cy="-40" r="7" fill="#f8fafc" opacity="0.95" />
        <circle cx="9" cy="-34" r="5.5" fill="#f1f5f9" opacity="0.9" />
        <circle cx="23" cy="-33" r="4.5" fill="#f8fafc" opacity="0.85" />
        {/* เงาใต้รถ */}
        <ellipse cx="0" cy="30" rx="40" ry="5" fill="#0f766e" opacity="0.5" />
        {/* คราดหน้า */}
        <polygon points="26,20 40,20 30,4" fill="#0d9488" stroke="#134e4a" strokeWidth="1" />
        {[28, 32, 36].map((x) => <line key={x} x1={x} y1="8" x2={x} y2="20" stroke="#134e4a" strokeWidth="1" />)}
        {/* ฐาน + กันชนทอง */}
        <rect x="-32" y="14" width="66" height="8" rx="2" fill="#fbbf24" stroke="#b45309" strokeWidth="1" />
        {/* หม้อน้ำหน้า (วงกลมดำ) */}
        <circle cx="20" cy="-2" r="17" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
        <circle cx="20" cy="-2" r="11" fill="#334155" />
        <circle cx="20" cy="-2" r="5.5" fill="#fcd34d" stroke="#b45309" strokeWidth="1" />
        <circle cx="20" cy="-2" r="2.2" fill="#fffbeb" />
        {/* โคมไฟบน */}
        <circle cx="14" cy="-17" r="4.5" fill="#fbbf24" stroke="#b45309" strokeWidth="1" />
        {/* ลำตัวหม้อน้ำ */}
        <rect x="-10" y="-14" width="28" height="26" rx="6" fill="url(#tcb-body)" stroke="#134e4a" strokeWidth="1.5" />
        <rect x="-10" y="-2" width="28" height="5" fill="#fbbf24" opacity="0.9" />
        {/* โดมทอง */}
        <path d="M -1 -14 q 6 -9 12 0 Z" fill="#fbbf24" stroke="#b45309" strokeWidth="1" />
        {/* ปล่องไฟ */}
        <rect x="12" y="-30" width="10" height="16" rx="2" fill="#1e293b" stroke="#0f172a" strokeWidth="1" />
        <rect x="10.5" y="-31" width="13" height="4" rx="2" fill="#fbbf24" stroke="#b45309" strokeWidth="0.8" />
        {/* ห้องคนขับ */}
        <path d="M -34 12 L -34 -10 Q -34 -18 -26 -18 L -10 -18 L -10 12 Z" fill="url(#tcb-body)" stroke="#134e4a" strokeWidth="1.5" />
        <rect x="-30" y="-13" width="11" height="10" rx="2" fill="#bae6fd" stroke="#fbbf24" strokeWidth="1.2" />
        <line x1="-24.5" y1="-13" x2="-24.5" y2="-3" stroke="#7dd3fc" strokeWidth="0.8" />
        {/* ล้อ */}
        {[-24, -10, 6].map((x, i) => (
          <g key={x}>
            <circle cx={x} cy="20" r={i === 2 ? 9 : 7} fill="#1e293b" stroke="#0f172a" strokeWidth="1.2" />
            <circle cx={x} cy="20" r={i === 2 ? 5.5 : 4} fill="none" stroke="#fbbf24" strokeWidth="1.4" />
            <circle cx={x} cy="20" r="1.6" fill="#fcd34d" />
          </g>
        ))}
      </g>

      {/* รางรถไฟด้านล่าง */}
      <g opacity="0.85">
        <rect x="12" y="138" width="96" height="2.5" rx="1" fill="#0f766e" />
        <rect x="12" y="146" width="96" height="2.5" rx="1" fill="#0f766e" />
        {Array.from({ length: 11 }, (_, i) => <rect key={i} x={14 + i * 9} y="136" width="3" height="14" rx="1" fill="#0f766e" opacity="0.7" />)}
      </g>

      {/* ป้าย ? มุมล่างขวา */}
      <g transform="translate(100,146)">
        <circle r="10.5" fill="#0f766e" opacity="0.5" />
        <circle r="10.5" fill="none" stroke="#fef9c3" strokeWidth="1" strokeDasharray="2.5 2.5" opacity="0.85" />
        <text x="0" y="4.5" fontSize="14" textAnchor="middle" fontWeight="900" fill="#fef9c3">?</text>
      </g>
    </svg>
  );
}

/* ── การ์ด (พลิก 3D) ── */

function TrainCard({ card, faceUp, matched, shaking, onFlip }: {
  card: CardT; faceUp: boolean; matched: boolean; shaking: boolean; onFlip: () => void;
}) {
  const show = faceUp || matched;
  return (
    <button
      onClick={onFlip}
      disabled={show}
      data-pair={card.pairId}
      className={cn("group relative w-full transition [perspective:600px]", !show && "hover:-translate-y-1", shaking && "tcard-shake", matched && "opacity-70")}
    >
      <div className="relative aspect-[3/4] w-full transition-transform duration-500 [transform-style:preserve-3d]" style={{ transform: show ? "rotateY(0deg)" : "rotateY(180deg)" }}>
        {/* หน้าการ์ด */}
        <div className={cn("absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-xl border-[3px] bg-white p-1 shadow [backface-visibility:hidden]", matched ? "border-emerald-400" : "border-teal-300")}>
          {card.kind === "num" ? (
            <StackedFraction numerator={card.num} denominator={card.den} className="text-xl sm:text-2xl" toneClassName="text-slate-700" />
          ) : (
            <div className="flex w-full flex-col items-center gap-1 px-1">
              <div className="flex h-6 w-full overflow-hidden rounded-md border-2 border-amber-400 bg-white sm:h-7">
                {Array.from({ length: card.den }, (_, i) => (
                  <div key={i} className={cn("flex-1 border-r border-amber-300/70 last:border-r-0", i < card.num && "bg-amber-400")} />
                ))}
              </div>
              <span className="text-[9px] font-extrabold text-slate-400">แบ่ง {card.den} ส่วน</span>
            </div>
          )}
          {matched && <span className="absolute -right-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-[10px] text-white">✓</span>}
        </div>
        {/* หลังการ์ด — สไตล์การ์ดสะสม */}
        <div className="absolute inset-0 overflow-hidden rounded-xl shadow [backface-visibility:hidden]" style={{ transform: "rotateY(180deg)" }}>
          <TrainCardBack />
        </div>
      </div>
    </button>
  );
}

/* ── เกมหลัก ── */

export function FractionTrainGame() {
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

  /* ตั้งค่า (ครูกำหนด) */
  const [pairs, setPairs] = useState(6);
  const [form, setForm] = useState<CardForm>("mix");
  const [teamMode, setTeamMode] = useState(false);

  /* กระดาน */
  const [deck, setDeck] = useState<CardT[]>(() => genDeck(6, "mix"));
  const [faceUp, setFaceUp] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number[]>([]);
  const [shakeIds, setShakeIds] = useState<number[]>([]);
  const [lock, setLock] = useState(false);
  const [peek, setPeek] = useState(false);
  const [moves, setMoves] = useState(0);

  /* รถไฟ: เดี่ยว = ขบวนเดียว / ทีม = 2 ขบวน */
  const [team, setTeam] = useState(0);
  const [teamCars, setTeamCars] = useState<{ a: Frac; b: Frac }[][]>([[], []]);
  const timeouts = useRef<number[]>([]);
  useEffect(() => () => timeouts.current.forEach((t) => window.clearTimeout(t)), []);

  const won = matchedPairs.length === pairs;

  function newGame(p = pairs, f = form, tm = teamMode) {
    ensure();
    play("whistle");
    setDeck(genDeck(p, f));
    setFaceUp([]);
    setMatchedPairs([]);
    setShakeIds([]);
    setLock(false);
    setPeek(false);
    setMoves(0);
    setTeam(0);
    setTeamCars([[], []]);
    setPairs(p);
    setForm(f);
    setTeamMode(tm);
  }

  function flip(card: CardT) {
    if (lock || peek || won) return;
    if (faceUp.includes(card.id) || matchedPairs.includes(card.pairId)) return;
    play("flip");
    const next = [...faceUp, card.id];
    setFaceUp(next);
    if (next.length < 2) return;

    setLock(true);
    setMoves((m) => m + 1);
    const [aId, bId] = next;
    const a = deck.find((c) => c.id === aId)!;
    const b = deck.find((c) => c.id === bId)!;
    if (a.pairId === b.pairId) {
      timeouts.current.push(window.setTimeout(() => {
        setMatchedPairs((mp) => [...mp, a.pairId]);
        setFaceUp([]);
        setLock(false);
        play("match");
        timeouts.current.push(window.setTimeout(() => play("chug"), 300));
        const pairCar = { a: { num: a.num, den: a.den }, b: { num: b.num, den: b.den } };
        setTeamCars((tc) => {
          const nextTc: typeof tc = [[...tc[0]], [...tc[1]]];
          nextTc[teamMode ? team : 0].push(pairCar);
          return nextTc;
        });
        if (matchedPairs.length + 1 === pairs) timeouts.current.push(window.setTimeout(() => play("win"), 600));
        // จับคู่ถูก → ทีมเดิมเล่นต่อ
      }, 550));
    } else {
      timeouts.current.push(window.setTimeout(() => {
        setShakeIds([aId, bId]);
        play("wrong");
        timeouts.current.push(window.setTimeout(() => {
          setShakeIds([]);
          setFaceUp([]);
          setLock(false);
          if (teamMode) setTeam((t) => 1 - t); // พลาด → สลับทีม
        }, 500));
      }, 700));
    }
  }

  const cols = pairs === 4 ? "grid-cols-4" : pairs === 6 ? "grid-cols-4" : "grid-cols-4";
  const winnerTeam = teamCars[0].length === teamCars[1].length ? -1 : teamCars[0].length > teamCars[1].length ? 0 : 1;
  const stars = moves <= pairs + 2 ? 3 : moves <= pairs * 2 ? 2 : 1;

  return (
    <div className="relative overflow-hidden rounded-2xl p-3 sm:p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 via-teal-50 to-sky-50" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden text-xl" aria-hidden>
        <span className="absolute left-5 top-8 opacity-30">⛰️</span>
        <span className="absolute right-8 top-14 opacity-40">☁️</span>
        <span className="absolute bottom-12 left-8 opacity-30">🌲</span>
        <span className="absolute bottom-16 right-6 opacity-30">🌻</span>
      </div>
      <style>{`
        .tcard-shake { animation: tcardShake 0.4s ease-in-out; }
        @keyframes tcardShake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
      `}</style>

      <div className="relative space-y-3">
        {/* แถบตั้งค่า + ปิดเสียง */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex rounded-xl border-2 border-slate-200 bg-white p-1">
            <button onClick={() => newGame(pairs, form, false)} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", !teamMode ? "bg-teal-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <User size={15} /> เล่นคนเดียว
            </button>
            <button onClick={() => newGame(pairs, form, true)} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", teamMode ? "bg-rose-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <Users size={15} /> 2 ทีมแข่งกัน
            </button>
          </div>
          <button onClick={() => setMuted((m) => !m)} className="grid h-9 w-9 place-items-center rounded-xl border-2 border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50" title={muted ? "เปิดเสียง" : "ปิดเสียง"}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {/* ตั้งค่าครู */}
        <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white/85 px-3 py-2">
          <span className="text-sm font-extrabold text-slate-600">🃏 จำนวนคู่</span>
          {PAIR_OPTIONS.map((p) => (
            <button key={p} onClick={() => newGame(p, form, teamMode)} className={cn("rounded-lg border-2 px-2.5 py-1 text-xs font-extrabold transition", pairs === p ? "border-teal-400 bg-teal-100 text-teal-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
              {p} คู่
            </button>
          ))}
          <span className="ml-2 text-sm font-extrabold text-slate-600">🎴 รูปแบบ</span>
          {([["mix", "ผสม"], ["num", "ตัวเลข"], ["pic", "ภาพ"]] as [CardForm, string][]).map(([f, label]) => (
            <button key={f} onClick={() => newGame(pairs, f, teamMode)} className={cn("rounded-lg border-2 px-2.5 py-1 text-xs font-extrabold transition", form === f ? "border-teal-400 bg-teal-100 text-teal-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
              {label}
            </button>
          ))}
          <button onClick={() => setPeek((v) => !v)} className={cn("ml-2 flex items-center gap-1.5 rounded-lg border-2 px-2.5 py-1 text-xs font-extrabold transition", peek ? "border-violet-400 bg-violet-100 text-violet-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
            {peek ? <EyeOff size={13} /> : <Eye size={13} />} {peek ? "ปิดเฉลย" : "เฉลย (ครูสอน)"}
          </button>
          <button onClick={() => newGame()} className="flex items-center gap-1.5 rounded-lg border-2 border-slate-200 bg-white px-2.5 py-1 text-xs font-extrabold text-slate-500 transition hover:bg-slate-50">
            <RotateCcw size={13} /> เริ่มใหม่
          </button>
        </div>

        {/* สถานะ */}
        {teamMode ? (
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className={cn("rounded-full px-4 py-1.5 text-sm font-extrabold transition", team === 0 ? "bg-rose-500 text-white shadow ring-2 ring-rose-300" : "bg-rose-100 text-rose-600")}>
              🔴 ทีมแดง — {teamCars[0].length} ตู้ {team === 0 && !won && "◀ ตาเล่น"}
            </span>
            <span className={cn("rounded-full px-4 py-1.5 text-sm font-extrabold transition", team === 1 ? "bg-sky-500 text-white shadow ring-2 ring-sky-300" : "bg-sky-100 text-sky-600")}>
              🔵 ทีมน้ำเงิน — {teamCars[1].length} ตู้ {team === 1 && !won && "◀ ตาเล่น"}
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-extrabold text-slate-600">
            <span>🃏 เปิดไป {moves} ครั้ง</span>
            <span>🚃 ได้ {matchedPairs.length}/{pairs} ตู้</span>
          </div>
        )}

        {/* กระดานการ์ด */}
        <div className={cn("mx-auto grid max-w-2xl gap-2 sm:gap-3", cols)}>
          {deck.map((c) => (
            <TrainCard
              key={c.id}
              card={c}
              faceUp={peek || faceUp.includes(c.id)}
              matched={matchedPairs.includes(c.pairId)}
              shaking={shakeIds.includes(c.id)}
              onFlip={() => flip(c)}
            />
          ))}
        </div>

        {/* ชนะ */}
        {won && (
          <div className="space-y-2 rounded-2xl border-2 border-amber-300 bg-amber-50/90 p-4 text-center">
            {teamMode ? (
              <p className="text-lg font-extrabold text-amber-700 sm:text-xl">
                {winnerTeam === -1 ? "🤝 เสมอกัน! เก่งทั้งสองทีม" : winnerTeam === 0 ? "🏆 ทีมแดงชนะ! ขบวนยาวกว่า" : "🏆 ทีมน้ำเงินชนะ! ขบวนยาวกว่า"}
              </p>
            ) : (
              <>
                <p className="text-lg font-extrabold text-amber-700 sm:text-xl">🎉 ต่อขบวนครบ {pairs} ตู้!</p>
                <p className="text-2xl">{"⭐".repeat(stars)}{"☆".repeat(3 - stars)}</p>
                <p className="text-sm font-bold text-slate-500">เปิดไป {moves} ครั้ง {stars === 3 ? "— ความจำสุดยอด!" : stars === 2 ? "— เก่งมาก!" : "— ลองอีกรอบให้น้อยครั้งลง!"}</p>
              </>
            )}
            <button onClick={() => newGame()} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500 px-6 py-2.5 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
              <Play size={16} /> เล่นอีกครั้ง
            </button>
          </div>
        )}

        {/* ขบวนรถไฟ */}
        <div className="space-y-2 rounded-2xl border-2 border-slate-200 bg-white/80 p-3">
          {teamMode ? (
            <>
              <div className="overflow-x-auto">
                <p className="text-xs font-extrabold text-rose-600">🔴 ขบวนทีมแดง</p>
                <TrainSVG cars={teamCars[0]} engineColor="#e11d48" label="ทีมแดง" />
              </div>
              <div className="overflow-x-auto">
                <p className="text-xs font-extrabold text-sky-600">🔵 ขบวนทีมน้ำเงิน</p>
                <TrainSVG cars={teamCars[1]} engineColor="#0284c7" label="ทีมน้ำเงิน" />
              </div>
            </>
          ) : (
            <div className="overflow-x-auto">
              <TrainSVG cars={teamCars[0]} engineColor="#0d9488" />
              {teamCars[0].length === 0 && <p className="text-center text-xs font-bold text-slate-400">จับคู่เศษส่วนที่เท่ากันให้ถูก — ตู้รถไฟจะมาต่อขบวนเรื่อย ๆ 🚃</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
