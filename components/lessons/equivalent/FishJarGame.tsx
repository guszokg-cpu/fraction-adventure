"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Volume2, VolumeX, FlaskConical, Target, Eye, Droplets } from "lucide-react";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { Frac, SvgFrac } from "@/components/lessons/Frac";
import { cn } from "@/lib/cn";
import { randInt } from "@/lib/randomFraction";

/* ── ค่าคงที่ ──
   ระดับน้ำเก็บเป็นจำนวนเต็ม 0..120 (120 หารด้วย 2,3,4,5,6,8,10,12 ลงตัวหมด
   ทำให้ทุกขีดของทุกแถบตกบนกริดพอดี ตรวจ "ตรงขีด" ได้แบบเป๊ะ ๆ) */

const GRID = 120;
const DEN_OPTIONS = [2, 3, 4, 5, 6, 8, 10, 12];
const MISSIONS_TOTAL = 8;

/* ตำแหน่ง+สีของแถบกระดาษ 4 ช่อง (นอกซ้าย/ในซ้าย/ในขวา/นอกขวา) — โทนเทปสีแบบหนังสือเรียน */
const SLOT_META = [
  { x: 140, label: "แถบ 1", fill: "#fecdd3", stroke: "#e11d48", text: "#9f1239" },
  { x: 186, label: "แถบ 2", fill: "#fde68a", stroke: "#d97706", text: "#92400e" },
  { x: 466, label: "แถบ 3", fill: "#a7f3d0", stroke: "#059669", text: "#065f46" },
  { x: 512, label: "แถบ 4", fill: "#ddd6fe", stroke: "#7c3aed", text: "#5b21b6" },
];

const JAR = { top: 60, bottom: 380, left: 186, right: 494 };
const INNER_H = JAR.bottom - JAR.top;

/* ── โหมดตู้เพาะเลี้ยง ── */
const FISH_SPECIES = ["🐟", "🐠", "🐡", "🦈", "🐢", "🦐", "🐙", "🐬"];
const TANK_TONES = [
  { water: ["#7dd3fc", "#0ea5e9"], glass: "#38bdf8", badge: "#0369a1", chip: "bg-sky-100 text-sky-700 ring-sky-300" },
  { water: ["#6ee7b7", "#10b981"], glass: "#34d399", badge: "#047857", chip: "bg-emerald-100 text-emerald-700 ring-emerald-300" },
  { water: ["#c4b5fd", "#8b5cf6"], glass: "#a78bfa", badge: "#6d28d9", chip: "bg-violet-100 text-violet-700 ring-violet-300" },
];
type TankJar = { num: number; den: number; species: number; count: number };

type Frac = { num: number; den: number };
type Mission = { kind: "fraction" | "ml"; num: number; den: number; target: number };

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
function simplify(num: number, den: number): Frac {
  const g = gcd(num, den) || 1;
  return { num: num / g, den: den / g };
}
const sameValue = (a: TankJar, b: TankJar) => a.num * b.den === b.num * a.den;

const fmtMl = (n: number) => (Number.isInteger(n) ? n.toLocaleString("th-TH") : n.toFixed(1));

/* ── เสียง ── */

type SoundKind = "ding" | "correct" | "wrong" | "star" | "start" | "pour";

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
      case "ding": return tones([1319, 1568], 0.07, 0.14, "triangle", 0.13);
      case "correct": return tones([660, 990, 1319], 0.06, 0.1, "triangle", 0.14);
      case "wrong": return tones([220, 165], 0.11, 0.2, "sawtooth", 0.1);
      case "star": return tones([1047, 1319, 1568, 2093], 0.07, 0.14, "triangle", 0.14);
      case "start": return tones([523, 784, 1047], 0.08, 0.12, "triangle", 0.14);
      case "pour": return tones([392], 0.01, 0.05, "sine", 0.05);
    }
  }
  return { play, ensure };
}

/* ── เพลงตู้ปลา (ชิปทูนนุ่ม ๆ ไม่ใช้ไฟล์) ── */

const AQUA_LEAD = [72, 0, 76, 79, 84, 0, 79, 76, 74, 0, 77, 81, 79, 0, 76, 74, 72, 0, 76, 79, 84, 0, 81, 79, 77, 76, 74, 76, 72, 0, 0, 0];
const AQUA_BASS = [48, 55, 52, 55, 45, 52, 50, 52, 41, 48, 45, 48, 43, 50, 47, 43];

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
      const m = AQUA_LEAD[s];
      if (m) note(m, 0.22, "triangle", 0.035);
      if (s % 2 === 0) {
        const b = AQUA_BASS[s / 2];
        if (b) note(b, 0.34, "sine", 0.05);
      }
    }, 240);
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

/* ── โหลปลา SVG ── */

function FishJarSVG({ strips, level, showLabels }: { strips: (number | null)[]; level: number; showLabels: boolean }) {
  const waterY = JAR.bottom - (level / GRID) * INNER_H;
  const fishY = level === 0 ? JAR.bottom - 14 : Math.max(waterY + 16, JAR.top + 24);
  return (
    <svg viewBox="0 0 680 440" className="mx-auto w-full max-w-4xl" role="img" aria-label="โหลปลาเศษส่วน">
      <style>{`
        .fish-bob { animation: fishBob 2.4s ease-in-out infinite; }
        @keyframes fishBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        .bubble { animation: bubbleUp 3.4s linear infinite; }
        .bubble2 { animation: bubbleUp 4.6s linear infinite; animation-delay: 1.4s; }
        @keyframes bubbleUp { 0% { transform: translateY(0); opacity: 0; } 15% { opacity: 0.8; } 100% { transform: translateY(-160px); opacity: 0; } }
        .tick-glow { animation: tickGlow 1.4s ease-in-out infinite; }
        @keyframes tickGlow { 0%,100% { opacity: 1; } 50% { opacity: 0.45; } }
      `}</style>
      <defs>
        <linearGradient id="jarWater" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7dd3fc" />
          <stop offset="1" stopColor="#0ea5e9" />
        </linearGradient>
        <clipPath id="jarClip">
          <rect x={JAR.left} y={JAR.top} width={JAR.right - JAR.left} height={INNER_H} rx={14} />
        </clipPath>
      </defs>

      {/* เงาพื้น */}
      <ellipse cx={340} cy={424} rx={190} ry={8} fill="#00000010" />

      {/* น้ำ (คลิปในโหล) */}
      <g clipPath="url(#jarClip)">
        {level > 0 && (
          <>
            <rect x={JAR.left} y={waterY} width={JAR.right - JAR.left} height={JAR.bottom - waterY} fill="url(#jarWater)" opacity={0.75} style={{ transition: "all 0.3s ease-out" }} />
            <ellipse cx={(JAR.left + JAR.right) / 2} cy={waterY} rx={(JAR.right - JAR.left) / 2} ry={7} fill="#bae6fd" opacity={0.9} style={{ transition: "all 0.3s ease-out" }} />
            <circle className="bubble" cx={290} cy={JAR.bottom - 16} r={4} fill="#e0f2fe" opacity={0.7} />
            <circle className="bubble2" cx={396} cy={JAR.bottom - 10} r={3} fill="#e0f2fe" opacity={0.7} />
          </>
        )}
        {/* ก้อนกรวด */}
        <circle cx={250} cy={JAR.bottom - 6} r={8} fill="#cbd5e1" />
        <circle cx={286} cy={JAR.bottom - 5} r={6} fill="#94a3b8" />
        <circle cx={420} cy={JAR.bottom - 6} r={7} fill="#cbd5e1" />
        {/* สาหร่าย */}
        <path d={`M 448 ${JAR.bottom} q -8 -26 2 -48 q 9 -20 -1 -38`} stroke="#34d399" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.85} />
        {/* ปลาลอยตามระดับน้ำ */}
        <text className="fish-bob" x={318} y={fishY} fontSize={34} style={{ transition: "all 0.3s ease-out" }}>🐟</text>
      </g>

      {/* ตัวโหลแก้ว */}
      <rect x={JAR.left - 6} y={JAR.top - 8} width={JAR.right - JAR.left + 12} height={INNER_H + 16} rx={18} fill="#e0f2fe" opacity={0.25} />
      <rect x={JAR.left - 6} y={JAR.top - 8} width={JAR.right - JAR.left + 12} height={INNER_H + 16} rx={18} fill="none" stroke="#7dd3fc" strokeWidth={5} />
      <ellipse cx={(JAR.left + JAR.right) / 2} cy={JAR.top - 8} rx={(JAR.right - JAR.left) / 2 - 8} ry={6} fill="none" stroke="#7dd3fc" strokeWidth={3} opacity={0.7} />

      {/* แถบกระดาษเศษส่วน 4 ช่อง */}
      {SLOT_META.map((slot, i) => {
        const den = strips[i];
        if (!den) return null;
        const ticks = Array.from({ length: den + 1 }, (_, k) => k);
        return (
          <g key={i}>
            <rect x={slot.x} y={JAR.top} width={28} height={INNER_H} rx={4} fill={slot.fill} stroke={slot.stroke} strokeWidth={2} opacity={0.95} />
            {ticks.map((k) => {
              const y = JAR.bottom - (k / den) * INNER_H;
              const hit = level > 0 && (level * den) % GRID === 0 && (level * den) / GRID === k && k > 0;
              return (
                <g key={k}>
                  <line x1={slot.x + (k === 0 || k === den ? 0 : 5)} y1={y} x2={slot.x + 28 - (k === 0 || k === den ? 0 : 5)} y2={y} stroke={hit ? "#ea580c" : slot.stroke} strokeWidth={hit ? 4 : k === 0 || k === den ? 2.5 : 1.6} className={hit ? "tick-glow" : undefined} />
                  {showLabels && k > 0 && k < den && (
                    <text x={slot.x + 14} y={y - 3} fontSize={11} textAnchor="middle" fontWeight={800} fill={hit ? "#c2410c" : slot.text}>{k}</text>
                  )}
                </g>
              );
            })}
            {/* ป้ายบอกส่วนใต้แถบ */}
            <rect x={slot.x - 2} y={JAR.bottom + 10} width={32} height={26} rx={7} fill="#fff" stroke={slot.stroke} strokeWidth={2} />
            <text x={slot.x + 14} y={JAR.bottom + 28} fontSize={13} textAnchor="middle" fontWeight={900} fill={slot.text}>{den}</text>
          </g>
        );
      })}
      {/* คำอธิบายป้าย */}
      <text x={340} y={JAR.bottom + 30} fontSize={12} textAnchor="middle" fontWeight={700} fill="#94a3b8">ตัวเลขใต้แถบ = แบ่งโหลเป็นกี่ส่วน</text>

      {/* เส้นผิวน้ำลากผ่านทุกแถบ */}
      {level > 0 && (
        <line x1={128} y1={waterY} x2={552} y2={waterY} stroke="#0369a1" strokeWidth={2.5} strokeDasharray="7 5" style={{ transition: "all 0.3s ease-out" }} />
      )}
    </svg>
  );
}

/* ── ตู้กระจก 3D ทรงสี่เหลี่ยมมุมฉาก (โหมดตู้เพาะเลี้ยง) — reusable ── */

function FractionTank3D({ numerator, denominator, toneIdx, watered, released, pouring, fishEmoji, fishCount, capacity, equalBadge, fillSecs }: {
  numerator: number; denominator: number; toneIdx: number; watered: boolean; released: boolean; pouring: boolean;
  fishEmoji: string; fishCount: number; capacity: number; equalBadge: boolean; fillSecs: number;
}) {
  // เรขาคณิตตู้: หน้าตู้ (L,T)-(R,B) + ความลึกเฉียงไปหลัง-ขวา (DX,DY)
  const L = 12, R = 118, T = 64, B = 252, DX = 22, DY = 13;
  const H = B - T;
  const cx = (L + R) / 2;
  const tone = TANK_TONES[toneIdx % TANK_TONES.length];
  const frac = numerator / denominator;
  const waterY = watered ? B - frac * H : B;
  const dur = watered ? fillSecs : 0.5; // เติมช้าตามเวลาที่ครูตั้ง / เทออกเร็ว
  const ml = (capacity * numerator) / denominator;
  const ticks = Array.from({ length: denominator + 1 }, (_, k) => k);
  const labelSize = denominator > 8 ? 8.5 : 10.5;
  const gid = `tank3d-${toneIdx}`;
  // ตำแหน่งปลาแบบคงที่ต่อ index (ไม่สุ่มใหม่ทุก render)
  const fishPos = [
    { x: 42, o: 0 }, { x: 88, o: 0.5 }, { x: 62, o: 1.1 }, { x: 100, o: 1.7 }, { x: 34, o: 2.3 },
  ];
  return (
    <svg viewBox="0 0 176 308" className="w-full" role="img" aria-label={`โหลปลา ${numerator}/${denominator}`}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={tone.water[0]} />
          <stop offset="1" stopColor={tone.water[1]} />
        </linearGradient>
        <clipPath id={`${gid}-clip`}>
          <rect x={L + 2} y={T + 2} width={R - L - 4} height={H - 3} />
        </clipPath>
      </defs>
      <style>{`
        .tf-${toneIdx} { animation: tfSwim-${toneIdx} 4.6s ease-in-out infinite; }
        @keyframes tfSwim-${toneIdx} { 0%,100% { transform: translate(0,0); } 50% { transform: translate(10px,-8px); } }
        .pourstream-${toneIdx} { animation: pourStream 0.5s linear infinite; }
        @keyframes pourStream { 0% { opacity: .5; } 50% { opacity: .95; } 100% { opacity: .5; } }
        .splash-${toneIdx} { animation: splash-${toneIdx} 0.7s ease-out infinite; }
        @keyframes splash-${toneIdx} { 0% { transform: translateY(0); opacity: .9; } 100% { transform: translateY(9px); opacity: 0; } }
      `}</style>

      {/* ป้ายเศษส่วนบนตู้ */}
      <rect x={36} y={2} width={80} height={40} rx={11} fill="#fff" stroke={tone.glass} strokeWidth={2.5} />
      <g textAnchor="middle" fontWeight={900} fill={tone.badge}>
        <text x={76} y={19} fontSize={15}>{numerator}</text>
        <line x1={62} y1={23} x2={90} y2={23} stroke={tone.badge} strokeWidth={2.2} strokeLinecap="round" />
        <text x={76} y={39} fontSize={15}>{denominator}</text>
      </g>

      {/* ฐานตู้ */}
      <ellipse cx={(L + R + DX) / 2} cy={B + 12} rx={78} ry={5} fill="#00000012" />
      <rect x={L - 5} y={B} width={R - L + DX + 10} height={11} rx={4} fill={tone.glass} stroke={tone.badge} strokeWidth={1.5} />

      {/* ขอบหลังของตู้ (จาง ๆ ให้เห็นความลึก) */}
      <line x1={L + DX} y1={T - DY} x2={L + DX} y2={B - DY} stroke={tone.glass} strokeWidth={1.5} opacity={0.35} />
      <line x1={L + DX} y1={B - DY} x2={R + DX} y2={B - DY} stroke={tone.glass} strokeWidth={1.5} opacity={0.35} />

      {/* ผนังกระจกด้านขวา */}
      <polygon points={`${R},${T} ${R + DX},${T - DY} ${R + DX},${B - DY} ${R},${B}`} fill={tone.water[0]} opacity={0.13} stroke={tone.glass} strokeWidth={2} />

      {/* น้ำ + ปลา + ของตกแต่ง (คลิปในหน้าตู้)
          น้ำถูก render ตลอด (เริ่มที่ก้นตู้ สูง 0) เพื่อให้ transition ไหลขึ้นจริงตามเวลาที่ตั้ง */}
      <g clipPath={`url(#${gid}-clip)`}>
        <rect x={L + 2} y={waterY} width={R - L - 4} height={B - waterY} fill={`url(#${gid})`} opacity={0.85} style={{ transition: `y ${dur}s linear, height ${dur}s linear` }} />
        {/* สายน้ำเทลงจากปากตู้ — หดสั้นลงตามระดับน้ำที่สูงขึ้น */}
        <rect className={pouring ? `pourstream-${toneIdx}` : undefined} x={cx - 5} y={T - 8} width={10} height={Math.max(0, waterY - (T - 8))} rx={5} fill={tone.water[0]} style={{ transition: `height ${dur}s linear, opacity 0.3s`, opacity: pouring ? 0.8 : 0 }} />
        <circle cx={38} cy={B - 6} r={7} fill="#cbd5e1" />
        <circle cx={62} cy={B - 4} r={5} fill="#94a3b8" />
        <circle cx={100} cy={B - 6} r={6} fill="#cbd5e1" />
        <path d={`M 106 ${B} q -7 -22 2 -40 q 8 -17 -1 -32`} stroke="#34d399" strokeWidth={4.5} fill="none" strokeLinecap="round" opacity={0.85} />
        {/* ปลาที่ปล่อย — ว่ายในน้ำ ลอยตามระดับ */}
        {released && watered && fishCount > 0 && fishPos.slice(0, fishCount).map((p, i) => {
          const fy = Math.min(B - 14, waterY + 22 + (i % 3) * 22);
          return (
            <text key={i} className={`tf-${toneIdx}`} x={p.x} y={fy} fontSize={21} textAnchor="middle" style={{ animationDelay: `${p.o}s`, transition: `all ${dur}s linear` }}>
              {fishEmoji}
            </text>
          );
        })}
      </g>

      {/* ผิวน้ำ 3D (สี่เหลี่ยมด้านขนานเลื่อนตามระดับ) — render ตลอดเพื่อให้เลื่อนขึ้นแบบ transition */}
      <g style={{ transform: `translateY(${waterY}px)`, transition: `transform ${dur}s linear, opacity 0.3s`, opacity: watered ? 1 : 0 }}>
        <polygon points={`${L + 2},0 ${R - 2},0 ${R - 2 + DX * 0.85},${-DY * 0.85} ${L + 2 + DX * 0.85},${-DY * 0.85}`} fill={tone.water[0]} opacity={0.95} stroke="#ffffff" strokeWidth={1.2} />
        <line x1={L + 2} y1={0} x2={R - 2} y2={0} stroke="#fff" strokeWidth={1.6} opacity={0.85} />
        {pouring && (
          <>
            <circle className={`splash-${toneIdx}`} cx={cx - 9} cy={-2} r={3} fill="#fff" opacity={0.85} />
            <circle className={`splash-${toneIdx}`} cx={cx + 10} cy={-2} r={2.5} fill="#fff" opacity={0.85} style={{ animationDelay: "0.3s" }} />
          </>
        )}
      </g>

      {/* เส้นแบ่งเศษส่วน + ป้ายกำกับด้านขวา (0 → เต็ม) */}
      {ticks.map((k) => {
        const y = B - (k / denominator) * H;
        const target = k === numerator;
        return (
          <g key={k}>
            <line x1={L + 3} y1={y} x2={R - 3} y2={y} stroke={tone.badge} strokeWidth={target ? 3 : 1.5} strokeDasharray="6 4" opacity={target ? 0.95 : 0.45} />
            {k === 0 || k === denominator
              ? <text x={R + DX + 5} y={y + 3.5} fontSize={target ? labelSize + 1 : labelSize} fontWeight={800} fill={tone.badge} opacity={target ? 1 : 0.6}>{k === 0 ? "0" : "เต็ม"}</text>
              : <g opacity={target ? 1 : 0.6}><SvgFrac x={R + DX + 12} y={y + 1} n={k} d={denominator} size={target ? labelSize + 1 : labelSize} fill={tone.badge} /></g>}
          </g>
        );
      })}

      {/* ปากตู้ด้านบน */}
      <polygon points={`${L},${T} ${R},${T} ${R + DX},${T - DY} ${L + DX},${T - DY}`} fill="#ffffff" opacity={0.4} stroke={tone.glass} strokeWidth={2} />

      {/* กระจกหน้าตู้ + แสงสะท้อน */}
      <rect x={L} y={T} width={R - L} height={H} rx={2} fill="#f0f9ff" opacity={0.15} stroke={tone.glass} strokeWidth={3.5} />
      <polygon points={`${L + 9},${T + 8} ${L + 19},${T + 8} ${L + 8},${B - 26} ${L + 2},${B - 26}`} fill="#fff" opacity={0.16} />
      <polygon points={`${L + 26},${T + 8} ${L + 30},${T + 8} ${L + 18},${B - 62} ${L + 14},${B - 62}`} fill="#fff" opacity={0.12} />

      {/* ปริมาตร มล. */}
      {watered && <text x={76} y={280} fontSize={13} textAnchor="middle" fontWeight={800} fill={tone.badge}>{fmtMl(ml)} มล.</text>}
      {/* ป้ายน้ำเท่ากัน */}
      {equalBadge && watered && (
        <g>
          <rect x={22} y={286} width={108} height={18} rx={9} fill="#fef3c7" stroke="#f59e0b" strokeWidth={1.5} />
          <text x={76} y={299} fontSize={11} textAnchor="middle" fontWeight={900} fill="#b45309">✨ น้ำเท่ากัน!</text>
        </g>
      )}
    </svg>
  );
}

/* ── ตัวควบคุมระดับน้ำ ── */

function WaterControls({ level, setLevel, onPour, snapTo }: { level: number; setLevel: (n: number) => void; onPour: () => void; snapTo: () => void }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xl">🚰</span>
        <input
          type="range"
          min={0}
          max={GRID}
          value={level}
          onChange={(e) => { setLevel(Number(e.target.value)); onPour(); }}
          className="h-3 flex-1 cursor-pointer accent-sky-500"
          aria-label="ระดับน้ำ"
        />
        <span className="w-14 text-right text-sm font-extrabold text-sky-700">{Math.round((level / GRID) * 100)}%</span>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <button onClick={() => { setLevel(Math.max(0, level - 1)); onPour(); }} className="rounded-xl border-2 border-slate-200 bg-white px-3.5 py-1.5 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50 active:scale-95">− ลดทีละนิด</button>
        <button onClick={() => { setLevel(Math.min(GRID, level + 1)); onPour(); }} className="rounded-xl border-2 border-sky-300 bg-sky-50 px-3.5 py-1.5 text-sm font-extrabold text-sky-700 transition hover:bg-sky-100 active:scale-95">+ เทเพิ่มทีละนิด</button>
        <button onClick={snapTo} className="flex items-center gap-1 rounded-xl border-2 border-amber-300 bg-amber-50 px-3.5 py-1.5 text-sm font-extrabold text-amber-700 transition hover:bg-amber-100 active:scale-95">🧲 ดูดเข้าขีดใกล้สุด</button>
        <button onClick={() => setLevel(0)} className="flex items-center gap-1 rounded-xl border-2 border-slate-200 bg-white px-3.5 py-1.5 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50 active:scale-95"><Droplets size={14} /> เทน้ำออกหมด</button>
      </div>
    </div>
  );
}

/* ── เกมหลัก ── */

export function FishJarGame() {
  const [mode, setMode] = useState<"lab" | "mission" | "tank">("lab");
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  useEffect(() => { mutedRef.current = muted; }, [muted]);
  const ctxRef = useRef<AudioContext | null>(null);
  const { play, ensure } = useSound(mutedRef, ctxRef);
  const bgm = useChiptune(mutedRef, ctxRef);

  /* ตั้งค่าร่วม (ครูกำหนด) */
  const [strips, setStrips] = useState<(number | null)[]>([2, 4, 6, 8]);
  const [level, setLevel] = useState(60); // เริ่มครึ่งโหล
  const [showLabels, setShowLabels] = useState(true);
  const [capacity, setCapacity] = useState(1000); // มล.

  /* โหมดภารกิจ */
  const [mission, setMission] = useState<Mission | null>(null);
  const [missionNo, setMissionNo] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [checked, setChecked] = useState<null | boolean>(null);
  const [done, setDone] = useState(false);

  /* โหมดตู้เพาะเลี้ยง */
  const [jarCount, setJarCount] = useState(2);
  const [tankJars, setTankJars] = useState<TankJar[]>([
    { num: 1, den: 2, species: 0, count: 2 },
    { num: 2, den: 4, species: 1, count: 2 },
    { num: 3, den: 4, species: 2, count: 3 },
  ]);
  const [wateredJars, setWateredJars] = useState<boolean[]>([false, false, false]);
  const [releasedJars, setReleasedJars] = useState<boolean[]>([false, false, false]);
  const [pouringJars, setPouringJars] = useState<boolean[]>([false, false, false]);
  const [fillSecs, setFillSecs] = useState(10); // ครูตั้งเวลาเติมน้ำ 1-60 วิ ให้เด็กลุ้นระดับน้ำ
  const pourTimers = useRef<number[]>([]);
  const resetTank = () => { setWateredJars([false, false, false]); setReleasedJars([false, false, false]); setPouringJars([false, false, false]); };
  const setAt = (arr: boolean[], i: number, v: boolean) => arr.map((x, k) => (k === i ? v : x));
  function fillJar(i: number) {
    play("pour");
    setWateredJars((w) => setAt(w, i, true));
    setPouringJars((p) => setAt(p, i, true));
    if (pourTimers.current[i]) window.clearTimeout(pourTimers.current[i]);
    pourTimers.current[i] = window.setTimeout(() => setPouringJars((p) => setAt(p, i, false)), fillSecs * 1000 + 400);
  }
  function fillAll() {
    for (let i = 0; i < jarCount; i++) fillJar(i);
  }
  useEffect(() => () => pourTimers.current.forEach((t) => t && window.clearTimeout(t)), []);
  const setTankJar = (i: number, patch: Partial<TankJar>) => {
    setTankJars((js) => js.map((j, k) => (k === i ? { ...j, ...patch } : j)));
    setWateredJars((w) => setAt(w, i, false));
    setReleasedJars((r) => setAt(r, i, false));
  };

  const activeDens = strips.filter((d): d is number => d !== null);
  const aligned: Frac[] = activeDens
    .filter((den) => (level * den) % GRID === 0)
    .map((den) => ({ num: (level * den) / GRID, den }))
    .filter((f) => f.num > 0)
    .sort((a, b) => a.den - b.den);
  const ml = (capacity * level) / GRID;

  /* เพลงเปิดตลอดที่อยู่ในเกม */
  useEffect(() => {
    bgm.start();
    return () => bgm.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* เสียงติ๊งเมื่อผิวน้ำตรงขีดตั้งแต่ 2 แถบขึ้นไป (= เจอเศษส่วนเท่ากัน) */
  const lastDing = useRef(-1);
  useEffect(() => {
    if (level > 0 && aligned.length >= 2 && lastDing.current !== level) {
      lastDing.current = level;
      play("ding");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  function snapTo() {
    if (activeDens.length === 0) return;
    let best = level, dist = Infinity;
    for (const den of activeDens) {
      for (let k = 0; k <= den; k++) {
        const g = (k * GRID) / den;
        if (Math.abs(g - level) < dist) { dist = Math.abs(g - level); best = g; }
      }
    }
    setLevel(best);
  }

  function setSlot(i: number, den: number | null) {
    setStrips((s) => s.map((v, j) => (j === i ? den : v)));
  }

  function newMission(no: number) {
    const dens = activeDens.length ? activeDens : [2, 4, 6, 8];
    const den = dens[randInt(0, dens.length - 1)];
    const num = randInt(1, den - 1);
    const kind: Mission["kind"] = no % 2 === 0 ? "fraction" : "ml";
    setMission({ kind, num, den, target: (num * GRID) / den });
    setChecked(null);
    setLevel(0);
  }

  function startMissions() {
    ensure();
    play("start");
    setScore(0); setStreak(0); setMissionNo(1); setDone(false);
    newMission(1);
    setMode("mission");
  }

  function checkMission() {
    if (!mission) return;
    const ok = level === mission.target;
    setChecked(ok);
    if (ok) {
      const ns = streak + 1;
      setStreak(ns);
      setScore((s) => s + 10 + Math.min(15, (ns - 1) * 5));
      play(ns >= 3 ? "star" : "correct");
    } else {
      setStreak(0);
      play("wrong");
    }
  }

  function nextMission() {
    if (missionNo >= MISSIONS_TOTAL) { setDone(true); play("star"); return; }
    const n = missionNo + 1;
    setMissionNo(n);
    newMission(n);
  }

  const targetMl = mission ? (capacity * mission.target) / GRID : 0;

  return (
    <div className="relative overflow-hidden rounded-2xl p-3 sm:p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-100 via-cyan-50 to-teal-50" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden text-xl" aria-hidden>
        <span className="absolute left-5 top-8 opacity-40">🫧</span>
        <span className="absolute right-8 top-16 opacity-40">🐠</span>
        <span className="absolute bottom-10 left-8 opacity-30">🐚</span>
        <span className="absolute bottom-14 right-6 opacity-30">🌿</span>
      </div>

      <div className="relative space-y-3">
        {/* โหมด + ปิดเสียง */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex rounded-xl border-2 border-slate-200 bg-white p-1">
            <button onClick={() => setMode("lab")} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "lab" ? "bg-sky-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <FlaskConical size={15} /> โหมดทดลอง (ครู)
            </button>
            <button onClick={startMissions} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "mission" ? "bg-teal-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <Target size={15} /> โหมดภารกิจ
            </button>
            <button onClick={() => { setMode("tank"); resetTank(); }} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "tank" ? "bg-indigo-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              🐠 โหมดตู้เพาะเลี้ยง
            </button>
          </div>
          <button onClick={() => setMuted((m) => !m)} className="grid h-9 w-9 place-items-center rounded-xl border-2 border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50" title={muted ? "เปิดเสียง" : "ปิดเสียง"}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {/* ═══ โหมดทดลอง ═══ */}
        {mode === "lab" && (
          <div className="space-y-3">
            <div className="rounded-2xl bg-sky-50 px-4 py-2 text-center text-sm font-extrabold text-sky-700 ring-1 ring-sky-200">
              🧑‍🏫 ติดแถบกระดาษเศษส่วนที่ขอบโหล แล้วเทน้ำดู — ขีดที่ตรงกับผิวน้ำพร้อมกันคือ <u>เศษส่วนที่เท่ากัน!</u>
            </div>

            {/* เลือกแถบ 4 ช่อง */}
            <div className="grid gap-2 rounded-2xl border-2 border-slate-200 bg-white/85 p-3 sm:grid-cols-2">
              {SLOT_META.map((slot, i) => (
                <div key={i} className="flex flex-wrap items-center gap-1.5">
                  <span className="w-14 text-xs font-extrabold" style={{ color: slot.text }}>{slot.label}</span>
                  <button onClick={() => setSlot(i, null)} className={cn("rounded-lg border-2 px-2 py-1 text-xs font-extrabold transition", strips[i] === null ? "border-slate-400 bg-slate-100 text-slate-600" : "border-slate-200 bg-white text-slate-400 hover:bg-slate-50")}>
                    ไม่ใช้
                  </button>
                  {DEN_OPTIONS.map((d) => (
                    <button key={d} onClick={() => setSlot(i, d)} className={cn("rounded-lg border-2 px-2 py-1 text-xs font-extrabold transition", strips[i] === d ? "bg-white shadow-sm" : "border-slate-200 bg-white text-slate-400 hover:bg-slate-50")} style={strips[i] === d ? { borderColor: slot.stroke, color: slot.text, backgroundColor: slot.fill } : undefined}>
                    {d}
                    </button>
                  ))}
                </div>
              ))}
            </div>

            {/* ตัวเลือกเสริม */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button onClick={() => setShowLabels((v) => !v)} className={cn("flex items-center gap-1.5 rounded-xl border-2 px-3.5 py-1.5 text-sm font-extrabold transition", showLabels ? "border-violet-400 bg-violet-50 text-violet-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
                <Eye size={14} /> ตัวเลขบนแถบ {showLabels ? "เปิด" : "ปิด (ให้เด็กทาย)"}
              </button>
              <span className="text-sm font-extrabold text-slate-600">🫙 ความจุโหล</span>
              <input type="number" min={1} max={100000} value={capacity} onChange={(e) => setCapacity(Math.max(1, Math.min(100000, Number(e.target.value) || 1)))} className="w-24 rounded-xl border-2 border-slate-200 bg-white px-2 py-1.5 text-center text-sm font-extrabold text-slate-700 outline-none focus:border-sky-400" />
              <span className="text-sm font-extrabold text-slate-600">มล.</span>
              {[500, 1000, 2000].map((c) => (
                <button key={c} onClick={() => setCapacity(c)} className={cn("rounded-lg border-2 px-2.5 py-1 text-xs font-extrabold transition", capacity === c ? "border-sky-400 bg-sky-100 text-sky-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
                  {c >= 1000 ? `${c / 1000} ล.` : `${c} มล.`}
                </button>
              ))}
            </div>

            {/* โหล */}
            <FishJarSVG strips={strips} level={level} showLabels={showLabels} />
            <WaterControls level={level} setLevel={setLevel} onPour={() => play("pour")} snapTo={() => { snapTo(); play("ding"); }} />

            {/* ผลอ่านค่า */}
            <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/80 p-3 text-center">
              {level === 0 ? (
                <p className="text-sm font-extrabold text-slate-500">โหลยังว่าง — ลองเทน้ำเข้าไปสิ!</p>
              ) : aligned.length === 0 ? (
                <p className="text-sm font-extrabold text-slate-500">ผิวน้ำยังไม่ตรงขีดพอดี ({fmtMl(ml)} มล.) — กด 🧲 เพื่อดูดเข้าขีดใกล้สุด</p>
              ) : (
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <span className="text-sm font-extrabold text-emerald-700 sm:text-base">💡 ผิวน้ำตอนนี้:</span>
                  {aligned.map((f, i) => (
                    <span key={`${f.num}/${f.den}`} className="flex items-center gap-2">
                      {i > 0 && <span className="text-xl font-extrabold text-emerald-600">=</span>}
                      <StackedFraction numerator={f.num} denominator={f.den} className="text-xl" toneClassName="text-emerald-800" />
                    </span>
                  ))}
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-extrabold text-sky-700 ring-1 ring-sky-200">= {fmtMl(ml)} มล.</span>
                  {aligned.length >= 2 && <span className="text-base font-extrabold text-amber-600">✨ เศษส่วนเท่ากัน {aligned.length} ชื่อ!</span>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ โหมดภารกิจ ═══ */}
        {mode === "mission" && mission && !done && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 rounded-2xl bg-white/85 px-4 py-2 ring-1 ring-teal-200">
              <span className="text-base font-extrabold text-teal-700">🎯 ภารกิจ {missionNo}/{MISSIONS_TOTAL}</span>
              <span className="text-base font-extrabold text-amber-700">🏅 {score}</span>
              {streak >= 2 && <span className="text-base font-extrabold text-orange-600">🔥 x{streak}</span>}
            </div>

            <div className="mx-auto flex max-w-xl flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-teal-300 bg-white/90 px-4 py-3 text-center">
              <span className="text-2xl">🐟</span>
              <span className="text-base font-extrabold text-slate-700 sm:text-lg">เติมน้ำให้ได้</span>
              {mission.kind === "fraction" ? (
                <>
                  <StackedFraction numerator={mission.num} denominator={mission.den} className="text-2xl" toneClassName="text-teal-700" />
                  <span className="text-base font-extrabold text-slate-700 sm:text-lg">ของโหล</span>
                </>
              ) : (
                <span className="text-lg font-extrabold text-teal-700 sm:text-xl">{fmtMl(targetMl)} มล. <span className="text-sm font-bold text-slate-400">(โหลจุ {fmtMl(capacity)} มล.)</span></span>
              )}
            </div>

            <FishJarSVG strips={strips} level={level} showLabels={showLabels} />
            <WaterControls level={level} setLevel={setLevel} onPour={() => play("pour")} snapTo={() => { snapTo(); play("ding"); }} />

            <div className="space-y-2 text-center">
              {checked === null ? (
                <button onClick={checkMission} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
                  ✅ ตรวจระดับน้ำ
                </button>
              ) : checked ? (
                <div className="space-y-2 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-3">
                  <p className="text-lg font-extrabold text-emerald-700">🎉 เป๊ะเลย! ระดับน้ำ = {fmtMl(ml)} มล.</p>
                  {aligned.length >= 2 && (
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <span className="text-sm font-extrabold text-slate-600">และยังเท่ากับ:</span>
                      {aligned.map((f, i) => (
                        <span key={`${f.num}/${f.den}`} className="flex items-center gap-2">
                          {i > 0 && <span className="text-lg font-extrabold text-emerald-600">=</span>}
                          <StackedFraction numerator={f.num} denominator={f.den} className="text-lg" toneClassName="text-emerald-800" />
                        </span>
                      ))}
                    </div>
                  )}
                  <button onClick={nextMission} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500 px-6 py-2.5 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                    {missionNo >= MISSIONS_TOTAL ? "🏁 ดูสรุปผล" : "🐟 ภารกิจถัดไป"}
                  </button>
                </div>
              ) : (
                <div className="space-y-2 rounded-2xl border-2 border-rose-200 bg-rose-50 p-3">
                  <p className="text-base font-extrabold text-rose-600">ยังไม่ตรงเป้า — ตอนนี้ได้ {fmtMl(ml)} มล. ลองปรับอีกนิด (ใช้ปุ่ม 🧲 ช่วยได้)</p>
                  <button onClick={() => setChecked(null)} className="inline-flex items-center gap-2 rounded-xl border-2 border-rose-300 bg-white px-5 py-2 text-sm font-extrabold text-rose-600 transition hover:bg-rose-50">
                    <RotateCcw size={15} /> ลองใหม่
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══ สรุปผลภารกิจ ═══ */}
        {mode === "mission" && done && (
          <div className="space-y-4 rounded-2xl border-2 border-teal-300 bg-white/90 p-6 text-center">
            <div className="text-5xl">🐟🏆</div>
            <h3 className="text-xl font-extrabold text-slate-800 sm:text-2xl">จบภารกิจโหลปลา!</h3>
            <p className="text-base font-extrabold text-amber-700 sm:text-lg">🏅 คะแนนรวม {score}</p>
            <p className="text-sm font-bold text-slate-500">
              {score >= 110 ? "🌟🌟🌟 นักเทน้ำมือทอง!" : score >= 60 ? "🌟🌟 แม่นมาก อีกนิดเดียวเพอร์เฟกต์!" : "🌟 เก่งแล้ว ลองเล่นอีกรอบให้แม่นขึ้น!"}
            </p>
            <button onClick={startMissions} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
              <Play size={18} /> เล่นอีกครั้ง
            </button>
          </div>
        )}

        {/* ═══ โหมดตู้เพาะเลี้ยง ═══ */}
        {mode === "tank" && (() => {
          const jars = tankJars.slice(0, jarCount);
          // จัดกลุ่มโหลที่เศษส่วนเท่ากัน (ค่าเดียวกัน) เพื่อขึ้นป้าย ✨
          const equalIdx = jars.map((j, i) => jars.some((o, k) => k !== i && sameValue(j, o)));
          const equalGroups: TankJar[][] = [];
          jars.forEach((j) => {
            const g = equalGroups.find((grp) => sameValue(grp[0], j));
            if (g) g.push(j); else equalGroups.push([j]);
          });
          const anyEqual = equalGroups.some((g) => g.length >= 2);
          const idxs = jars.map((_, i) => i);
          const allWatered = idxs.every((i) => wateredJars[i]);
          const anyWatered = idxs.some((i) => wateredJars[i]);
          const allReleased = idxs.every((i) => releasedJars[i]);
          return (
            <div className="space-y-3">
              <div className="rounded-2xl bg-indigo-50 px-4 py-2 text-center text-sm font-extrabold text-indigo-700 ring-1 ring-indigo-200">
                🐠 สร้างตู้ปลาของครู! เลือกจำนวนโหล → ตั้งเศษส่วนน้ำแต่ละโหล → เติมน้ำ → ปล่อยปลา — โหลที่ <u>น้ำเท่ากัน</u> คือเศษส่วนเทียบเท่า
              </div>

              {/* จำนวนโหล + ความจุ */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="text-sm font-extrabold text-slate-600">🫙 จำนวนโหล</span>
                {[1, 2, 3].map((n) => (
                  <button key={n} onClick={() => { setJarCount(n); resetTank(); }} className={cn("rounded-lg border-2 px-3 py-1 text-sm font-extrabold transition", jarCount === n ? "border-indigo-400 bg-indigo-100 text-indigo-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
                    {n} โหล
                  </button>
                ))}
                <span className="ml-2 text-sm font-extrabold text-slate-600">💧 โหลจุ</span>
                <input type="number" min={1} max={100000} value={capacity} onChange={(e) => setCapacity(Math.max(1, Math.min(100000, Number(e.target.value) || 1)))} className="w-24 rounded-xl border-2 border-slate-200 bg-white px-2 py-1.5 text-center text-sm font-extrabold text-slate-700 outline-none focus:border-indigo-400" />
                <span className="text-sm font-extrabold text-slate-600">มล.</span>
              </div>

              {/* เวลาเติมน้ำ — น้ำค่อย ๆ ไหลขึ้นให้เด็กลุ้น */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="text-sm font-extrabold text-slate-600">⏱ เวลาเติมน้ำ</span>
                <input type="number" min={1} max={60} value={fillSecs} onChange={(e) => setFillSecs(Math.max(1, Math.min(60, Number(e.target.value) || 1)))} className="w-16 rounded-xl border-2 border-slate-200 bg-white px-2 py-1.5 text-center text-sm font-extrabold text-slate-700 outline-none focus:border-indigo-400" />
                <span className="text-sm font-extrabold text-slate-600">วินาที</span>
                {[3, 10, 30, 60].map((s) => (
                  <button key={s} onClick={() => setFillSecs(s)} className={cn("rounded-lg border-2 px-2.5 py-1 text-xs font-extrabold transition", fillSecs === s ? "border-indigo-400 bg-indigo-100 text-indigo-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
                    {s} วิ
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-400">น้ำจะค่อย ๆ ไหลขึ้นตามเวลาที่ตั้ง — ให้นักเรียนลุ้นว่าถึงขีดไหน!</span>
              </div>

              {/* การ์ดตั้งค่าแต่ละโหล */}
              <div className={cn("grid gap-3", jarCount === 1 ? "sm:grid-cols-1" : jarCount === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3")}>
                {jars.map((jar, i) => {
                  const tone = TANK_TONES[i % TANK_TONES.length];
                  const stepFrac = (part: "num" | "den", d: number) => {
                    if (part === "den") {
                      const den = Math.max(2, Math.min(12, jar.den + d));
                      setTankJar(i, { den, num: Math.min(jar.num, den) });
                    } else {
                      setTankJar(i, { num: Math.max(1, Math.min(jar.den, jar.num + d)) });
                    }
                  };
                  const btn = "h-7 w-7 rounded-lg border-2 border-slate-200 bg-white text-sm font-extrabold text-slate-600 transition hover:bg-slate-50 active:scale-95";
                  return (
                    <div key={i} className="space-y-2 rounded-2xl border-2 p-3" style={{ borderColor: tone.glass }}>
                      <p className="text-center text-xs font-extrabold" style={{ color: tone.badge }}>โหล {i + 1}</p>
                      {/* เศษส่วน — แถวบนคุมตัวเศษ แถวล่างคุมตัวส่วน (ลบซ้าย บวกขวา เสมอ) */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center justify-center gap-2">
                          <span className="w-8 text-right text-[10px] font-extrabold text-slate-400">เศษ</span>
                          <button onClick={() => stepFrac("num", -1)} className={btn}>−</button>
                          <span className="w-10 text-center text-3xl font-extrabold leading-none text-slate-700">{jar.num}</span>
                          <button onClick={() => stepFrac("num", 1)} className={btn}>+</button>
                          <span className="w-8" aria-hidden />
                        </div>
                        <div className="h-[3px] w-12 rounded bg-slate-700" />
                        <div className="flex items-center justify-center gap-2">
                          <span className="w-8 text-right text-[10px] font-extrabold text-slate-400">ส่วน</span>
                          <button onClick={() => stepFrac("den", -1)} className={btn}>−</button>
                          <span className="w-10 text-center text-3xl font-extrabold leading-none text-slate-700">{jar.den}</span>
                          <button onClick={() => stepFrac("den", 1)} className={btn}>+</button>
                          <span className="w-8" aria-hidden />
                        </div>
                      </div>
                      {/* สายพันธุ์ปลา */}
                      <div className="flex flex-wrap justify-center gap-1">
                        {FISH_SPECIES.map((f, si) => (
                          <button key={si} onClick={() => setTankJar(i, { species: si })} className={cn("grid h-8 w-8 place-items-center rounded-lg border-2 text-base transition", jar.species === si ? "border-indigo-400 bg-indigo-50" : "border-slate-100 bg-white hover:border-slate-300")}>{f}</button>
                        ))}
                      </div>
                      {/* จำนวนปลา 1-5 */}
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-xs font-extrabold text-slate-500">ปลา</span>
                        {[1, 2, 3, 4, 5].map((c) => (
                          <button key={c} onClick={() => setTankJar(i, { count: c })} className={cn("h-7 w-7 rounded-lg border-2 text-xs font-extrabold transition", jar.count === c ? "border-indigo-400 bg-indigo-100 text-indigo-700" : "border-slate-200 bg-white text-slate-400 hover:bg-slate-50")}>{c}</button>
                        ))}
                        <span className="text-xs font-extrabold text-slate-500">ตัว</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ปุ่มทุกโหล / รีเซต */}
              <div className="flex flex-wrap justify-center gap-2">
                <button onClick={fillAll} disabled={allWatered} className={cn("flex items-center gap-2 rounded-xl px-6 py-2.5 text-base font-extrabold text-white shadow transition", allWatered ? "cursor-default bg-slate-300" : "bg-gradient-to-r from-sky-600 to-cyan-500 hover:brightness-105 active:scale-[0.98]")}>
                  💧 เติมน้ำทุกโหล
                </button>
                <button onClick={() => { setReleasedJars((r) => r.map((v, k) => (k < jarCount && wateredJars[k] ? true : v))); play("ding"); }} disabled={!anyWatered || allReleased} className={cn("flex items-center gap-2 rounded-xl px-6 py-2.5 text-base font-extrabold text-white shadow transition", !anyWatered || allReleased ? "cursor-default bg-slate-300" : "bg-gradient-to-r from-indigo-600 to-violet-500 hover:brightness-105 active:scale-[0.98]")}>
                  🐟 ปล่อยปลาทุกโหล
                </button>
                <button onClick={resetTank} className="flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50">
                  <RotateCcw size={15} /> เทน้ำออก
                </button>
              </div>
              <p className="text-center text-xs font-bold text-slate-400">👇 หรือกดเติมน้ำ/ปล่อยปลาทีละโหลใต้แต่ละโหลได้เลย</p>

              {/* โหลปลา + ปุ่มทีละโหล */}
              <div className={cn("mx-auto grid gap-3", jarCount === 1 ? "max-w-[220px] grid-cols-1" : jarCount === 2 ? "max-w-lg grid-cols-2" : "max-w-2xl grid-cols-3")}>
                {jars.map((jar, i) => {
                  const partnerWet = jars.some((o, k) => k !== i && sameValue(o, jar) && wateredJars[k]);
                  return (
                    <div key={i} className="space-y-1.5">
                      <FractionTank3D numerator={jar.num} denominator={jar.den} toneIdx={i} watered={wateredJars[i]} released={releasedJars[i]} pouring={pouringJars[i]} fishEmoji={FISH_SPECIES[jar.species % FISH_SPECIES.length]} fishCount={jar.count} capacity={capacity} equalBadge={equalIdx[i] && partnerWet} fillSecs={fillSecs} />
                      <div className="flex justify-center gap-1.5">
                        {!wateredJars[i] ? (
                          <button onClick={() => fillJar(i)} className="rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-extrabold text-white shadow transition hover:bg-sky-600 active:scale-95">💧 เติมน้ำ</button>
                        ) : !releasedJars[i] ? (
                          <button onClick={() => { setReleasedJars((r) => setAt(r, i, true)); play("ding"); }} className="rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-extrabold text-white shadow transition hover:bg-indigo-600 active:scale-95">🐟 ปล่อยปลา</button>
                        ) : (
                          <button onClick={() => { setWateredJars((w) => setAt(w, i, false)); setReleasedJars((r) => setAt(r, i, false)); }} className="rounded-lg border-2 border-slate-200 bg-white px-3 py-1.5 text-xs font-extrabold text-slate-500 transition hover:bg-slate-50">↺ เทออก</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* แผงสรุปเทียบ */}
              {anyWatered && (
                <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/70 p-3 text-center">
                  {anyEqual ? (
                    <div className="space-y-1.5">
                      {equalGroups.filter((g) => g.length >= 2).map((g, gi) => {
                        const s = simplify(g[0].num, g[0].den);
                        return (
                          <div key={gi} className="flex flex-wrap items-center justify-center gap-2 text-base font-extrabold">
                            <span className="text-amber-600">✨ น้ำเท่ากัน:</span>
                            {g.map((j, ji) => (
                              <span key={ji} className="flex items-center gap-2">
                                {ji > 0 && <span className="text-emerald-600">=</span>}
                                <StackedFraction numerator={j.num} denominator={j.den} className="text-xl" toneClassName="text-slate-700" />
                              </span>
                            ))}
                            <span className="rounded-full bg-white px-2.5 py-0.5 text-sm text-emerald-700 ring-1 ring-emerald-200">
                              = {fmtMl((capacity * s.num) / s.den)} มล. (รูปอย่างต่ำ {s.num}/{s.den})
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm font-extrabold text-slate-500">
                      ลองตั้งให้ 2 โหลมีน้ำเท่ากันดูสิ! เช่น <b>1/2</b> กับ <b>2/4</b> — ระดับน้ำจะเสมอกันพอดี
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
