"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Volume2, VolumeX, Shuffle, Square, GraduationCap, Sparkles } from "lucide-react";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { cn } from "@/lib/cn";
import { randInt } from "@/lib/randomFraction";

/* ── ชนิดข้อมูล ── */

type Frac = { num: number; den: number };
type BalloonState = "float" | "pop" | "wrong";
type Balloon = { id: number; num: number; den: number; isTarget: boolean; x: number; dur: number; tone: number; state: BalloonState };

const TARGET_BASES: Frac[] = [
  { num: 1, den: 2 }, { num: 1, den: 3 }, { num: 2, den: 3 }, { num: 1, den: 4 },
  { num: 3, den: 4 }, { num: 1, den: 5 }, { num: 2, den: 5 }, { num: 3, den: 5 },
];

const SPEEDS = [
  { label: "🐢 ช้า", dur: 14, spawn: 1900 },
  { label: "🚶 ปานกลาง", dur: 10, spawn: 1400 },
  { label: "🏃 เร็ว", dur: 7, spawn: 1000 },
];

const FUN_TIME = 60;

const BALLOON_TONES = [
  { a: "#fda4af", b: "#e11d48", hi: "#ffe4e6" },
  { a: "#fcd34d", b: "#d97706", hi: "#fef9c3" },
  { a: "#93c5fd", b: "#2563eb", hi: "#dbeafe" },
  { a: "#86efac", b: "#16a34a", hi: "#dcfce7" },
  { a: "#d8b4fe", b: "#9333ea", hi: "#f3e8ff" },
  { a: "#f9a8d4", b: "#db2777", hi: "#fce7f3" },
];

const equivTo = (num: number, den: number, t: Frac) => num * t.den === t.num * den;

/* ── เสียง ── */

type SoundKind = "pop" | "wrong" | "escape" | "combo" | "start" | "over" | "win" | "shoot";

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
  function burst() {
    if (mutedRef.current) return;
    const ctx = ensure();
    if (!ctx) return;
    const dur = 0.12;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.16, ctx.currentTime);
    src.connect(g).connect(ctx.destination);
    src.start();
  }
  function play(kind: SoundKind) {
    switch (kind) {
      case "pop": burst(); return tones([1319], 0.01, 0.09, "triangle", 0.1);
      case "wrong": return tones([220, 165], 0.11, 0.18, "sawtooth", 0.1);
      case "escape": return tones([494, 392, 311], 0.09, 0.14, "triangle", 0.1);
      case "combo": return tones([659, 880, 1047, 1319], 0.05, 0.11, "triangle", 0.15);
      case "start": return tones([523, 659, 784], 0.07, 0.12, "triangle", 0.14);
      case "over": return tones([392, 330, 262, 196], 0.14, 0.2, "triangle", 0.13);
      case "win": return tones([523, 659, 784, 1047, 1319], 0.09, 0.18, "triangle", 0.15);
      case "shoot": return tones([1200, 700], 0.03, 0.07, "square", 0.07);
    }
  }
  return { play, ensure };
}

/* ── เพลงลอยฟ้า (ชิปทูน ไม่ใช้ไฟล์) ── */

const SKY_LEAD = [76, 0, 79, 81, 84, 81, 79, 76, 74, 0, 77, 79, 81, 79, 77, 74, 72, 0, 76, 79, 84, 79, 76, 72, 74, 76, 77, 79, 81, 79, 77, 76];
const SKY_BASS = [48, 55, 52, 55, 45, 52, 50, 52, 41, 48, 45, 48, 43, 50, 47, 50];

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
      const m = SKY_LEAD[s];
      if (m) note(m, 0.2, "triangle", 0.032);
      if (s % 2 === 0) {
        const b = SKY_BASS[s / 2];
        if (b) note(b, 0.3, "sine", 0.05);
      }
    }, 225);
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

/* ── ลูกโป่ง SVG ── */

function BalloonSVG({ num, den, tone, state }: { num: number; den: number; tone: number; state: BalloonState }) {
  const t = BALLOON_TONES[tone % BALLOON_TONES.length];
  const gid = `bal-${tone}`;
  if (state === "pop") {
    return (
      <svg viewBox="0 0 76 120" className="h-full w-full">
        <g fill={t.b}>
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i * Math.PI * 2) / 8;
            return <circle key={i} cx={38 + Math.cos(a) * 22} cy={38 + Math.sin(a) * 22} r={4} opacity={0.85} />;
          })}
          <circle cx={38} cy={38} r={6} fill={t.a} />
        </g>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 76 120" className="h-full w-full">
      <defs>
        <radialGradient id={gid} cx="0.38" cy="0.3" r="0.85">
          <stop offset="0" stopColor={t.a} />
          <stop offset="1" stopColor={t.b} />
        </radialGradient>
      </defs>
      {/* เชือก */}
      <path d="M 38 76 q 6 10 -2 20 q -8 10 2 22" fill="none" stroke="#94a3b8" strokeWidth={1.8} />
      {/* ปมล่าง */}
      <polygon points="34,76 42,76 38,84" fill={t.b} />
      {/* ตัวลูกโป่ง */}
      <ellipse cx={38} cy={40} rx={29} ry={36} fill={`url(#${gid})`} stroke={t.b} strokeWidth={2} />
      <ellipse cx={27} cy={26} rx={8} ry={12} fill={t.hi} opacity={0.55} transform="rotate(-18 27 26)" />
      {/* เศษส่วนบนลูกโป่ง */}
      <g textAnchor="middle" fontWeight={900} fill="#fff">
        <text x={38} y={36} fontSize={17} style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,0.25)", strokeWidth: 2 }}>{num}</text>
        <line x1={26} y1={41} x2={50} y2={41} stroke="#fff" strokeWidth={2.4} strokeLinecap="round" />
        <text x={38} y={60} fontSize={17} style={{ paintOrder: "stroke", stroke: "rgba(0,0,0,0.25)", strokeWidth: 2 }}>{den}</text>
      </g>
      {/* กากบาทเมื่อกดผิด */}
      {state === "wrong" && (
        <g stroke="#dc2626" strokeWidth={5} strokeLinecap="round">
          <line x1={20} y1={22} x2={56} y2={58} />
          <line x1={56} y1={22} x2={20} y2={58} />
        </g>
      )}
    </svg>
  );
}

/* ── เกมหลัก ── */

let balloonSeq = 1;

export function FractionBalloonGame() {
  const [mode, setMode] = useState<"practice" | "fun">("practice");
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  useEffect(() => { mutedRef.current = muted; }, [muted]);
  const ctxRef = useRef<AudioContext | null>(null);
  const { play, ensure } = useSound(mutedRef, ctxRef);
  const bgm = useChiptune(mutedRef, ctxRef);

  /* ตั้งค่า (ครูกำหนด) */
  const [target, setTarget] = useState<Frac>({ num: 1, den: 2 });
  const [speedIdx, setSpeedIdx] = useState(1);

  /* สถานะเกม */
  const [playing, setPlaying] = useState(false);
  const [over, setOver] = useState(false);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(FUN_TIME);
  const timeoutsRef = useRef<number[]>([]);
  useEffect(() => () => timeoutsRef.current.forEach((t) => window.clearTimeout(t)), []);

  /* ปืนเล็ง + ลูกดอก */
  const fieldRef = useRef<HTMLDivElement | null>(null);
  const [aimAngle, setAimAngle] = useState(0); // องศาจากแนวตั้ง (+ = เอียงขวา)
  const [flash, setFlash] = useState(false);
  const [shots, setShots] = useState<{ id: number; x0: number; y0: number; dx: number; dy: number; ang: number }[]>([]);
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
  const muzzle = () => {
    const fr = fieldRef.current?.getBoundingClientRect();
    return { x: (fr?.width ?? 300) / 2, y: (fr?.height ?? 420) - 52 };
  };
  function aimAt(x: number, y: number) {
    const m = muzzle();
    setAimAngle(clamp((Math.atan2(x - m.x, m.y - y) * 180) / Math.PI, -82, 82));
  }
  function onFieldMove(e: React.PointerEvent) {
    if (!playing || !fieldRef.current) return;
    const fr = fieldRef.current.getBoundingClientRect();
    aimAt(e.clientX - fr.left, e.clientY - fr.top);
  }
  function fireDart(tx: number, ty: number) {
    const m = muzzle();
    aimAt(tx, ty);
    setFlash(true);
    timeoutsRef.current.push(window.setTimeout(() => setFlash(false), 120));
    const ang = (Math.atan2(ty - m.y, tx - m.x) * 180) / Math.PI + 90; // หัวลูกดอกชี้ทางวิ่ง
    const id = balloonSeq++;
    setShots((ss) => [...ss, { id, x0: m.x, y0: m.y, dx: tx - m.x, dy: ty - m.y, ang }]);
    play("shoot");
  }

  /* เพลงเล่นระหว่างเกม */
  useEffect(() => {
    if (playing) bgm.start();
    else bgm.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  /* สุ่มลูกโป่งใหม่ */
  function makeBalloon(t: Frac, spd: { dur: number }, sc: number, isFun: boolean): Balloon {
    const isTarget = randInt(1, 100) <= 45;
    let num: number, den: number;
    if (isTarget) {
      const kMax = Math.max(2, Math.floor(12 / t.den));
      const k = randInt(1, 5) === 1 ? 1 : randInt(2, kMax);
      num = t.num * k;
      den = t.den * k;
    } else {
      let guard = 0;
      do {
        den = randInt(2, 12);
        num = randInt(1, den - 1);
        guard++;
      } while (equivTo(num, den, t) && guard < 30);
      if (equivTo(num, den, t)) { num = Math.min(den - 1, num + 1); }
    }
    // โหมดสนุก: ยิ่งคะแนนสูง ลูกโป่งยิ่งเร็วขึ้นเรื่อย ๆ
    const accel = isFun ? Math.max(0.55, 1 - sc / 350) : 1;
    const dur = spd.dur * accel * (0.85 + randInt(0, 30) / 100);
    return { id: balloonSeq++, num, den, isTarget, x: randInt(4, 82), dur, tone: randInt(0, BALLOON_TONES.length - 1), state: "float" };
  }

  /* วงจรปล่อยลูกโป่ง */
  useEffect(() => {
    if (!playing) return;
    const spd = SPEEDS[speedIdx];
    const id = window.setInterval(() => {
      setBalloons((bs) => (bs.length >= 9 ? bs : [...bs, makeBalloon(target, spd, score, mode === "fun")]));
    }, spd.spawn);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, speedIdx, target, mode, score]);

  /* จับเวลา (โหมดสนุก) */
  useEffect(() => {
    if (!(playing && mode === "fun")) return;
    const id = window.setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => window.clearInterval(id);
  }, [playing, mode]);
  useEffect(() => {
    if (playing && mode === "fun" && timeLeft === 0) endGame(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, playing, mode]);

  function startGame(m: "practice" | "fun") {
    ensure();
    play("start");
    setMode(m);
    setBalloons([]);
    setScore(0);
    setCombo(0);
    setLives(3);
    setTimeLeft(FUN_TIME);
    setOver(false);
    setPlaying(true);
  }

  function stopGame() {
    setPlaying(false);
    setBalloons([]);
  }

  function endGame(finished: boolean) {
    setPlaying(false);
    setBalloons([]);
    setOver(true);
    setBest((b) => Math.max(b, score));
    play(finished && score >= 80 ? "win" : "over");
  }

  function removeBalloon(id: number) {
    setBalloons((bs) => bs.filter((b) => b.id !== id));
  }

  /* คลิกลูกโป่ง → ปืนหันไปยิงลูกดอก แล้วค่อยแตกตามผล */
  function shootBalloon(b: Balloon, e: React.MouseEvent) {
    if (!playing || b.state !== "float") return;
    const field = fieldRef.current;
    const br = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (field) {
      const fr = field.getBoundingClientRect();
      fireDart(br.left + br.width / 2 - fr.left, br.top + br.height / 2 - fr.top);
    }
    timeoutsRef.current.push(window.setTimeout(() => tap(b), 170));
  }

  function tap(b: Balloon) {
    if (!playing || b.state !== "float") return;
    if (equivTo(b.num, b.den, target)) {
      const nc = combo + 1;
      setCombo(nc);
      setScore((s) => s + 10 + Math.min(20, (nc - 1) * 5));
      play(nc >= 3 ? "combo" : "pop");
      setBalloons((bs) => bs.map((x) => (x.id === b.id ? { ...x, state: "pop" } : x)));
      timeoutsRef.current.push(window.setTimeout(() => removeBalloon(b.id), 320));
    } else {
      setCombo(0);
      play("wrong");
      setBalloons((bs) => bs.map((x) => (x.id === b.id ? { ...x, state: "wrong" } : x)));
      timeoutsRef.current.push(window.setTimeout(() => {
        setBalloons((bs) => bs.map((x) => (x.id === b.id ? { ...x, state: "float" } : x)));
      }, 550));
      if (mode === "fun") {
        setLives((lv) => {
          const nl = lv - 1;
          if (nl <= 0) timeoutsRef.current.push(window.setTimeout(() => endGame(false), 400));
          return nl;
        });
      }
    }
  }

  function escaped(b: Balloon) {
    removeBalloon(b.id);
    if (!playing) return;
    if (b.isTarget && mode === "fun") {
      play("escape");
      setCombo(0);
      setLives((lv) => {
        const nl = lv - 1;
        if (nl <= 0) timeoutsRef.current.push(window.setTimeout(() => endGame(false), 400));
        return nl;
      });
    }
  }

  const stars = score >= 150 ? 3 : score >= 80 ? 2 : 1;

  return (
    <div className="relative overflow-hidden rounded-2xl p-3 sm:p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-50" />
      <style>{`
        @keyframes balloonUp { from { transform: translateY(0); } to { transform: translateY(-620px); } }
        @keyframes dartFly { to { transform: translate(var(--dx), var(--dy)); } }
        .cloud-drift { animation: cloudDrift 42s linear infinite; }
        .cloud-drift2 { animation: cloudDrift 60s linear infinite; animation-delay: -25s; }
        @keyframes cloudDrift { from { transform: translateX(-120px); } to { transform: translateX(110vw); } }
      `}</style>

      <div className="relative space-y-3">
        {/* โหมด + ปิดเสียง */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex rounded-xl border-2 border-slate-200 bg-white p-1">
            <button onClick={() => { if (playing) stopGame(); setMode("practice"); setOver(false); }} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "practice" ? "bg-sky-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <GraduationCap size={15} /> โหมดฝึก (ครู)
            </button>
            <button onClick={() => { if (playing) stopGame(); setMode("fun"); setOver(false); }} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "fun" ? "bg-rose-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <Sparkles size={15} /> โหมดสนุก
            </button>
          </div>
          <button onClick={() => setMuted((m) => !m)} className="grid h-9 w-9 place-items-center rounded-xl border-2 border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50" title={muted ? "เปิดเสียง" : "ปิดเสียง"}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {/* ตั้งค่าครู: โจทย์ + ความเร็ว */}
        <div className="space-y-2 rounded-2xl border-2 border-slate-200 bg-white/85 px-3 py-2">
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <span className="text-sm font-extrabold text-slate-600">🎯 โจทย์:</span>
            {TARGET_BASES.map((t) => (
              <button key={`${t.num}/${t.den}`} onClick={() => { setTarget(t); setBalloons([]); }} className={cn("rounded-lg border-2 px-2 py-1 transition", target.num === t.num && target.den === t.den ? "border-rose-400 bg-rose-50" : "border-slate-200 bg-white hover:border-slate-300")}>
                <StackedFraction numerator={t.num} denominator={t.den} className="text-xs" toneClassName={target.num === t.num && target.den === t.den ? "text-rose-700" : "text-slate-500"} />
              </button>
            ))}
            <button onClick={() => { setTarget(TARGET_BASES[randInt(0, TARGET_BASES.length - 1)]); setBalloons([]); }} className="flex items-center gap-1 rounded-lg border-2 border-slate-200 bg-white px-2.5 py-1.5 text-xs font-extrabold text-slate-500 transition hover:bg-slate-50">
              <Shuffle size={12} /> สุ่ม
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <span className="text-sm font-extrabold text-slate-600">⚡ ความเร็ว:</span>
            {SPEEDS.map((s, i) => (
              <button key={s.label} onClick={() => setSpeedIdx(i)} className={cn("rounded-lg border-2 px-2.5 py-1 text-xs font-extrabold transition", speedIdx === i ? "border-sky-400 bg-sky-100 text-sky-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
                {s.label}
              </button>
            ))}
            {mode === "fun" && <span className="text-xs font-bold text-slate-400">(โหมดสนุกจะเร็วขึ้นเรื่อย ๆ ตามคะแนน!)</span>}
          </div>
        </div>

        {/* แถบสถานะ */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 rounded-2xl bg-white/85 px-4 py-2 ring-1 ring-sky-200">
          <span className="flex items-center gap-2 text-base font-extrabold text-slate-700">
            แตะลูกโป่งที่เท่ากับ
            <span className="rounded-xl bg-rose-100 px-2.5 py-1 ring-2 ring-rose-300">
              <StackedFraction numerator={target.num} denominator={target.den} className="text-lg" toneClassName="text-rose-700" />
            </span>
          </span>
          <span className="text-base font-extrabold text-amber-700">🏅 {score}</span>
          {combo >= 2 && <span className="text-base font-extrabold text-orange-600">🔥 x{combo}</span>}
          {mode === "fun" && (
            <>
              <span className="text-base tracking-wider">{Array.from({ length: 3 }, (_, i) => (i < lives ? "❤️" : "🤍")).join("")}</span>
              <span className="text-sm font-extrabold text-slate-600">⏱ {timeLeft} วิ</span>
            </>
          )}
        </div>

        {/* สนามลูกโป่ง */}
        <div ref={fieldRef} onPointerMove={onFieldMove} className="relative h-[420px] cursor-crosshair overflow-hidden rounded-2xl border-2 border-sky-200 bg-gradient-to-b from-sky-300/60 via-sky-200/50 to-emerald-100/60">
          {/* เมฆ */}
          <div className="cloud-drift pointer-events-none absolute left-0 top-8 text-4xl opacity-70">☁️</div>
          <div className="cloud-drift2 pointer-events-none absolute left-0 top-24 text-3xl opacity-50">☁️</div>
          <div className="pointer-events-none absolute bottom-2 left-4 text-2xl opacity-60">🌳</div>
          <div className="pointer-events-none absolute bottom-2 right-6 text-2xl opacity-60">🌳</div>

          {/* ลูกโป่ง */}
          {balloons.map((b) => (
            <button
              key={b.id}
              onClick={(e) => shootBalloon(b, e)}
              onAnimationEnd={() => escaped(b)}
              data-target={b.isTarget ? "1" : "0"}
              data-frac={`${b.num}/${b.den}`}
              className="absolute h-[110px] w-[72px] cursor-pointer"
              style={{ left: `${b.x}%`, bottom: "-120px", animation: `balloonUp ${b.dur}s linear forwards`, animationPlayState: playing ? "running" : "paused" }}
              aria-label={`ลูกโป่ง ${b.num}/${b.den}`}
            >
              <BalloonSVG num={b.num} den={b.den} tone={b.tone} state={b.state} />
            </button>
          ))}

          {/* ลูกดอกที่ยิงออกไป */}
          {shots.map((s) => (
            <div
              key={s.id}
              onAnimationEnd={() => setShots((ss) => ss.filter((x) => x.id !== s.id))}
              className="pointer-events-none absolute z-[15]"
              style={{ left: s.x0, top: s.y0, ["--dx" as string]: `${s.dx}px`, ["--dy" as string]: `${s.dy}px`, animation: "dartFly 0.17s linear forwards" }}
            >
              <svg viewBox="0 0 14 26" width={14} height={26} style={{ transform: `translate(-50%,-50%) rotate(${s.ang}deg)` }}>
                <polygon points="7,0 12,10 7,7 2,10" fill="#334155" />
                <rect x={5.5} y={7} width={3} height={14} rx={1.5} fill="#64748b" />
                <path d="M7,21 l-4,5 M7,21 l4,5" stroke="#f59e0b" strokeWidth={2} strokeLinecap="round" />
              </svg>
            </div>
          ))}

          {/* ปืนใหญ่ของเล่น (เล็งตามเมาส์ + ยิงลูกโป่ง) */}
          {playing && (
            <div className="pointer-events-none absolute bottom-1 left-1/2 z-[12] flex -translate-x-1/2 flex-col items-center">
              {/* ลำกล้องหมุนเล็งรอบฐานล่าง */}
              <div className="origin-bottom" style={{ transform: `rotate(${aimAngle}deg)`, transition: "transform 0.09s linear" }}>
                <svg viewBox="0 0 30 64" width={32} height={68} className="block">
                  <defs>
                    <linearGradient id="barrel" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0" stopColor="#fb7185" />
                      <stop offset="0.5" stopColor="#e11d48" />
                      <stop offset="1" stopColor="#9f1239" />
                    </linearGradient>
                  </defs>
                  <rect x={9} y={6} width={12} height={54} rx={6} fill="url(#barrel)" stroke="#881337" strokeWidth={2} />
                  <ellipse cx={15} cy={8} rx={6} ry={2.6} fill="#4c0519" />
                  <rect x={6} y={32} width={18} height={9} rx={3.5} fill="#be123c" stroke="#881337" strokeWidth={1.5} />
                  {flash && <circle cx={15} cy={4} r={9} fill="#fde68a" opacity={0.9} />}
                  {flash && <circle cx={15} cy={1} r={5} fill="#fff7ed" />}
                </svg>
              </div>
              {/* ฐานปืนล้อคู่ */}
              <svg viewBox="0 0 84 42" width={80} height={40} className="-mt-2 block">
                <ellipse cx={42} cy={38} rx={40} ry={4} fill="#00000018" />
                <path d="M 8 36 Q 42 4 76 36 Z" fill="#475569" stroke="#1e293b" strokeWidth={2.5} />
                <circle cx={22} cy={32} r={9} fill="#334155" stroke="#1e293b" strokeWidth={2} />
                <circle cx={62} cy={32} r={9} fill="#334155" stroke="#1e293b" strokeWidth={2} />
                <circle cx={22} cy={32} r={3} fill="#94a3b8" />
                <circle cx={62} cy={32} r={3} fill="#94a3b8" />
              </svg>
            </div>
          )}

          {/* จอเริ่ม/จบ */}
          {!playing && (
            <div className="absolute inset-0 z-10 grid place-items-center bg-white/60 backdrop-blur-[2px]">
              <div className="space-y-3 rounded-2xl border-2 border-sky-200 bg-white/95 p-5 text-center shadow-lg">
                {over ? (
                  <>
                    <p className="text-xl font-extrabold text-slate-800">🎈 จบเกม!</p>
                    <p className="text-2xl">{"⭐".repeat(stars)}{"☆".repeat(3 - stars)}</p>
                    <p className="text-base font-extrabold text-amber-700">🏅 คะแนน {score}</p>
                    {best > 0 && <p className="text-sm font-bold text-slate-500">สูงสุด {Math.max(best, score)}</p>}
                  </>
                ) : (
                  <>
                    <p className="text-3xl">🎈🎯</p>
                    <p className="text-lg font-extrabold text-slate-800">ยิงลูกโป่งเศษส่วนเท่ากัน</p>
                    <p className="max-w-xs text-sm font-bold text-slate-500">
                      แตะเฉพาะลูกโป่งที่<b>เท่ากับโจทย์</b>! {mode === "fun" ? "แตะผิดหรือปล่อยลูกถูกหลุด เสียหัวใจ ❤️" : "โหมดฝึก: ช้า ๆ ไม่มีหัวใจ เหมาะใช้สอน"}
                    </p>
                  </>
                )}
                <button onClick={() => startGame(mode)} className={cn("inline-flex items-center gap-2 rounded-xl px-7 py-2.5 text-base font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]", mode === "fun" ? "bg-gradient-to-r from-rose-600 to-pink-500" : "bg-gradient-to-r from-sky-600 to-cyan-500")}>
                  {over ? <><RotateCcw size={17} /> เล่นอีกครั้ง</> : <><Play size={17} /> เริ่มเกม!</>}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ปุ่มหยุด (ระหว่างเล่น) */}
        {playing && (
          <div className="text-center">
            <button onClick={() => (mode === "fun" ? endGame(false) : stopGame())} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-300 bg-white px-5 py-2 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50">
              <Square size={14} /> หยุดเกม
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
