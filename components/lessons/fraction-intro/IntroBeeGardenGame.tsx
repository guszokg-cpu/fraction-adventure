"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Volume2, VolumeX, FlaskConical, Target, ArrowRight } from "lucide-react";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { Frac } from "@/components/lessons/Frac";
import { cn } from "@/lib/cn";
import { randInt } from "@/lib/randomFraction";

/* ─────────────────────────────────────────────
   สวนผึ้งเก็บน้ำหวาน 🐝 — ตัวเศษ / ตัวส่วน
   ดอกไม้มี b กลีบ (ตัวส่วน = กลีบทั้งหมด)
   คลิกกลีบเพื่อส่งผึ้งไปเกาะ a กลีบ (ตัวเศษ = กลีบที่ผึ้งเกาะ)
   ───────────────────────────────────────────── */

const MISSIONS_TOTAL = 8;
const DENS = [2, 3, 4, 5, 6, 8];

type SoundKind = "buzz" | "land" | "off" | "correct" | "wrong" | "start" | "star";

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
      case "buzz": return tones([220, 233, 220], 0.05, 0.09, "sawtooth", 0.04);
      case "land": return tones([740, 988], 0.05, 0.09, "triangle", 0.1);
      case "off": return tones([500, 380], 0.05, 0.08, "triangle", 0.07);
      case "correct": return tones([660, 990, 1319], 0.06, 0.1, "triangle", 0.14);
      case "wrong": return tones([220, 165], 0.11, 0.18, "sawtooth", 0.09);
      case "start": return tones([523, 659, 784], 0.07, 0.12, "triangle", 0.14);
      case "star": return tones([1047, 1319, 1568, 2093], 0.07, 0.14, "triangle", 0.14);
    }
  }
  return { play, ensure };
}

/* เพลงสวนดอกไม้ */
const BG_LEAD = [76, 0, 79, 76, 74, 0, 72, 74, 76, 0, 72, 0, 69, 0, 0, 0, 74, 0, 77, 74, 72, 0, 71, 72, 74, 0, 79, 76, 72, 0, 0, 0];
const BG_BASS = [48, 55, 48, 55, 50, 57, 50, 57, 45, 52, 45, 52, 47, 55, 50, 48];

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
      const m = BG_LEAD[s];
      if (m) note(m, 0.2, "triangle", 0.028);
      if (s % 2 === 0) {
        const b = BG_BASS[s / 2];
        if (b) note(b, 0.32, "sine", 0.05);
      }
    }, 205);
  }
  function stop() { if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; } }
  useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);
  return { start, stop };
}

/* ── ผึ้งน้อย (วาดเป็น <g> ปีกกระพือ — จุดกึ่งกลางที่ (20,20)) ── */
function BeeG() {
  return (
    <g>
      {/* ปีกกระพือตลอด */}
      <g className="bg-wingL" style={{ transformOrigin: "18px 15px" }}>
        <ellipse cx={14} cy={10} rx={7} ry={9} fill="#dbeafe" opacity={0.85} transform="rotate(-24 14 10)" />
      </g>
      <g className="bg-wingR" style={{ transformOrigin: "22px 15px" }}>
        <ellipse cx={26} cy={10} rx={7} ry={9} fill="#dbeafe" opacity={0.85} transform="rotate(24 26 10)" />
      </g>
      {/* ตัว */}
      <ellipse cx={20} cy={20} rx={11} ry={8.5} fill="#fbbf24" stroke="#92400e" strokeWidth={1.4} />
      <path d="M14,13 Q13,20 14,27 M20,12 Q19,20 20,28 M26,13 Q27,20 26,27" stroke="#78350f" strokeWidth={2.4} fill="none" />
      <circle cx={30} cy={17} r={4.6} fill="#fcd34d" stroke="#92400e" strokeWidth={1.2} />
      <circle cx={31.5} cy={16} r={1.1} fill="#1e293b" />
      <path d="M32.8,19 Q34,19.8 35,19.2" stroke="#1e293b" strokeWidth={0.9} fill="none" strokeLinecap="round" />
      <path d="M9,20 L4,22" stroke="#92400e" strokeWidth={1.6} strokeLinecap="round" />
    </g>
  );
}

/* ── ดอกไม้กลีบ b กลีบ (คลิกกลีบได้) ── */
function Flower({ den, on, toggle, disabled }: { den: number; on: boolean[]; toggle?: (i: number) => void; disabled?: boolean }) {
  const CX = 130, CY = 122, R1 = 42, R2 = 108;
  const pt = (deg: number, r: number) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)];
  };
  return (
    <svg viewBox="0 0 260 250" className="w-full max-w-[420px]" role="img" aria-label={`ดอกไม้ ${den} กลีบ`} style={{ overflow: "visible" }}>
      <style>{`
        @keyframes bgWL { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(-26deg); } }
        @keyframes bgWR { 0%,100% { transform: rotate(0deg); } 50% { transform: rotate(26deg); } }
        .bg-wingL { animation: bgWL 0.12s linear infinite; }
        .bg-wingR { animation: bgWR 0.12s linear infinite; }
        @keyframes bgLand { 0% { transform: translate(0,-34px) scale(0.5); opacity: 0; } 60% { opacity: 1; } 100% { transform: translate(0,0) scale(1); opacity: 1; } }
        .bg-land { animation: bgLand 0.36s cubic-bezier(.4,1.3,.5,1) both; }
        @keyframes bgHover { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2.5px); } }
        .bg-hover { animation: bgHover 0.7s ease-in-out infinite; }
        @keyframes bgSway { 0%,100% { transform: rotate(-2.2deg); } 50% { transform: rotate(2.2deg); } }
        .bg-sway { transform-origin: ${CX}px ${CY + 30}px; animation: bgSway 3.4s ease-in-out infinite; }
      `}</style>
      {/* ก้าน+ใบ */}
      <path d={`M${CX},${CY + 30} Q${CX - 6},${CY + 80} ${CX},${CY + 118}`} stroke="#16a34a" strokeWidth={6} fill="none" strokeLinecap="round" />
      <path d={`M${CX},${CY + 84} Q${CX + 34},${CY + 68} ${CX + 40},${CY + 92} Q${CX + 14},${CY + 98} ${CX},${CY + 84}`} fill="#22c55e" stroke="#15803d" strokeWidth={1.4} />
      {/* หัวดอก (โยกตามลมทั้งดอก) */}
      <g className="bg-sway">
      {/* กลีบ */}
      {Array.from({ length: den }, (_, i) => {
        const a0 = (i * 360) / den, a1 = ((i + 1) * 360) / den, mid = (a0 + a1) / 2;
        const [x0, y0] = pt(a0, R1);
        const [x1, y1] = pt(a1, R1);
        const [tx, ty] = pt(mid, R2);
        const [c0x, c0y] = pt(a0 + (a1 - a0) * 0.14, R2 * 0.86);
        const [c1x, c1y] = pt(a1 - (a1 - a0) * 0.14, R2 * 0.86);
        const active = on[i];
        const [bx, by] = pt(mid, R2 * 0.62);
        return (
          <g key={i} onClick={() => !disabled && toggle?.(i)} style={{ cursor: disabled ? "default" : "pointer" }}>
            <path d={`M ${x0} ${y0} C ${c0x} ${c0y} ${tx - (tx - CX) * 0.06} ${ty - (ty - CY) * 0.06} ${tx} ${ty} C ${c1x} ${c1y} ${x1} ${y1} ${x1} ${y1} Z`}
              fill={active ? "#f9a8d4" : "#fce7f3"} stroke={active ? "#db2777" : "#f472b6"} strokeWidth={active ? 2.6 : 1.8}
              style={{ transition: "fill .25s, stroke .25s" }} />
            {/* ผึ้งบินลงเกาะ (ตำแหน่ง = SVG transform · อนิเมชันบิน/ลอย = inner g) */}
            {active && (
              <g transform={`translate(${bx}, ${by})`}>
                <g className="bg-land"><g className="bg-hover"><g transform="translate(-20,-17)"><BeeG /></g></g></g>
              </g>
            )}
          </g>
        );
      })}
      {/* เกสรกลาง */}
      <circle cx={CX} cy={CY} r={R1 - 8} fill="#fde047" stroke="#ca8a04" strokeWidth={2.4} />
      {Array.from({ length: 7 }, (_, k) => {
        const [dx, dy] = pt((k * 360) / 7, 16);
        return <circle key={k} cx={dx} cy={dy} r={3} fill="#f59e0b" opacity={0.7} />;
      })}
      </g>
    </svg>
  );
}

export function IntroBeeGardenGame() {
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

  const [den, setDen] = useState(5);
  const [target, setTarget] = useState(2);   // ตัวเศษเป้าหมาย
  const [on, setOn] = useState<boolean[]>(() => Array(5).fill(false));
  const [checked, setChecked] = useState<null | boolean>(null);

  /* ภารกิจ */
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [firstTry, setFirstTry] = useState(true);
  const [gameOver, setGameOver] = useState(false);

  const count = on.filter(Boolean).length;

  function setup(nd: number, nt: number) {
    setDen(nd); setTarget(nt);
    setOn(Array(nd).fill(false));
    setChecked(null); setFirstTry(true);
  }

  function toggle(i: number) {
    ensure();
    setChecked(null);
    setOn((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      play(next[i] ? "land" : "off");
      if (next[i]) play("buzz");
      return next;
    });
  }

  function check() {
    const ok = count === target;
    setChecked(ok);
    if (ok) {
      play("correct");
      if (mode === "mission") setScore((s) => s + (firstTry ? 25 : 10));
    } else {
      play("wrong");
      setFirstTry(false);
    }
  }

  function startMissions() {
    ensure(); play("start");
    setScore(0); setRound(1); setGameOver(false);
    const nd = DENS[randInt(1, DENS.length - 1)];
    setup(nd, randInt(1, nd - 1));
    setMode("mission");
  }
  function nextMission() {
    if (round >= MISSIONS_TOTAL) { setGameOver(true); play("star"); return; }
    setRound((r) => r + 1);
    const nd = DENS[randInt(1, DENS.length - 1)];
    setup(nd, randInt(1, nd - 1));
  }

  const stars = score >= 170 ? 3 : score >= 100 ? 2 : 1;
  const done = checked === true;

  return (
    <div className="relative overflow-hidden rounded-2xl p-3 sm:p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-lime-100 via-green-50 to-emerald-50" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden text-2xl" aria-hidden>
        <span className="absolute left-4 top-4 opacity-40">🌷</span>
        <span className="absolute right-8 top-7 opacity-40">🐝</span>
        <span className="absolute bottom-8 right-6 opacity-30">🍯</span>
      </div>

      <div className="relative space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex rounded-xl border-2 border-slate-200 bg-white p-1">
            <button onClick={() => { setMode("lab"); setup(den, target); }} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "lab" ? "bg-green-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <FlaskConical size={15} /> โหมดครู
            </button>
            <button onClick={startMissions} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "mission" ? "bg-amber-500 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <Target size={15} /> โหมดเก็บน้ำหวาน
            </button>
          </div>
          <button onClick={() => setMuted((m) => !m)} className="grid h-9 w-9 place-items-center rounded-xl border-2 border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50" title={muted ? "เปิดเสียง" : "ปิดเสียง"}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {mode === "mission" && gameOver ? (
          <div className="space-y-4 rounded-2xl border-2 border-amber-300 bg-white/90 p-6 text-center">
            <div className="text-5xl">🍯🏆</div>
            <h3 className="text-xl font-extrabold text-slate-800 sm:text-2xl">เก็บน้ำหวานเต็มรัง!</h3>
            <p className="text-2xl">{"⭐".repeat(stars)}{"☆".repeat(3 - stars)}</p>
            <p className="text-base font-extrabold text-amber-700">🏅 คะแนนรวม {score}</p>
            <button onClick={startMissions} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
              <Play size={18} /> เล่นอีกครั้ง
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* ตั้งค่า / สถานะ */}
            {mode === "lab" ? (
              <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-green-200 bg-white/90 px-3 py-2">
                <span className="text-sm font-extrabold text-green-700">🧑‍🏫 กลีบดอก (ตัวส่วน):</span>
                {DENS.map((d) => (
                  <button key={d} onClick={() => setup(d, Math.min(target, d - 1) || 1)} className={cn("h-8 w-8 rounded-lg border-2 text-base font-extrabold transition", den === d ? "border-green-500 bg-green-100 text-green-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>{d}</button>
                ))}
                <span className="mx-1 text-slate-300">|</span>
                <span className="text-sm font-extrabold text-amber-700">🐝 ส่งผึ้ง (ตัวเศษ):</span>
                <button onClick={() => setup(den, Math.max(1, target - 1))} className="h-8 w-8 rounded-lg border-2 border-slate-200 bg-white text-lg font-extrabold text-slate-600 active:scale-95">−</button>
                <span className="w-6 text-center text-2xl font-extrabold text-amber-600">{target}</span>
                <button onClick={() => setup(den, Math.min(den - 1, target + 1))} className="h-8 w-8 rounded-lg border-2 border-slate-200 bg-white text-lg font-extrabold text-slate-600 active:scale-95">+</button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 rounded-2xl bg-white/90 px-4 py-2 ring-1 ring-amber-200">
                <span className="text-base font-extrabold text-amber-700">🎯 ดอกที่ {round}/{MISSIONS_TOTAL}</span>
                <span className="text-base font-extrabold text-green-600">🏅 {score}</span>
              </div>
            )}

            {/* โจทย์ */}
            <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-green-200 bg-white/95 px-5 py-2.5 shadow-sm">
              <span className="text-base font-extrabold text-slate-700 sm:text-lg">ส่งผึ้งไปเกาะกลีบดอกให้ได้</span>
              <StackedFraction numerator={target} denominator={den} className="text-3xl sm:text-4xl" toneClassName="text-amber-600" />
              <span className="text-base font-extrabold text-slate-700 sm:text-lg">ของดอกไม้</span>
            </div>

            {/* ฉากดอกไม้ */}
            <div className="rounded-2xl border-2 border-green-200 bg-gradient-to-b from-sky-100/60 to-lime-50/60 p-2">
              <div className="flex flex-col items-center">
                <Flower den={den} on={on} toggle={toggle} disabled={done} />
                <span className="rounded-full bg-white px-4 py-1 text-sm font-extrabold text-slate-600 shadow-sm ring-1 ring-green-200">
                  ผึ้งเกาะแล้ว <b className="text-amber-600">{count}</b> จากทั้งหมด <b className="text-green-700">{den}</b> กลีบ
                  {count > 0 && <> = <Frac n={count} d={den} tone="text-amber-600" /></>}
                </span>
              </div>
            </div>

            {/* ปุ่มตรวจ */}
            {!done && (
              <div className="flex justify-center">
                <button onClick={check} className="inline-flex items-center gap-2 rounded-xl border-b-4 border-amber-600 bg-gradient-to-b from-amber-400 to-amber-500 px-8 py-2.5 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.97] active:border-b-2">
                  🍯 เก็บน้ำหวาน!
                </button>
              </div>
            )}

            {/* ผล */}
            {checked !== null && (
              <div className={cn("rounded-2xl border-2 p-3 text-center", checked ? "border-emerald-300 bg-emerald-50" : "border-rose-300 bg-rose-50")}>
                <p className={cn("text-base font-extrabold", checked ? "text-emerald-700" : "text-rose-600")}>
                  {checked
                    ? <>🎉 เก่งมาก! ผึ้งเกาะ <b>{target}</b> กลีบ จากทั้งหมด <b>{den}</b> กลีบ = <Frac n={target} d={den} /> — ตัวเศษคือกลีบที่ผึ้งเกาะ ตัวส่วนคือกลีบทั้งหมด</>
                    : <>ยังไม่ตรง — ตอนนี้ผึ้งเกาะ {count} กลีบ (<Frac n={count} d={den} />) แต่โจทย์ให้ <Frac n={target} d={den} /> · {count > target ? "เอาผึ้งออกบ้าง (แตะกลีบซ้ำ)" : "ส่งผึ้งเพิ่มอีก"}</>}
                </p>
                {checked && (
                  mode === "mission" ? (
                    <button onClick={nextMission} className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-2 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                      {round >= MISSIONS_TOTAL ? "🏁 ดูสรุปผล" : <>ดอกต่อไป <ArrowRight size={16} /></>}
                    </button>
                  ) : (
                    <button onClick={() => setup(den, target)} className="mt-2 inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-5 py-2 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50">
                      <RotateCcw size={15} /> เริ่มดอกใหม่
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
