"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Volume2, VolumeX, Eye, EyeOff, User, Users, CheckCircle2, XCircle } from "lucide-react";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { cn } from "@/lib/cn";
import { randInt } from "@/lib/randomFraction";

/* ── ค่าคงที่ ── */

type Frac = { num: number; den: number };
type Level = 1 | 2 | 3;
const FUEL_FULL = 5;

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
const simplify = (n: number, d: number): Frac => { const g = gcd(n, d) || 1; return { num: n / g, den: d / g }; };
const eq = (a: Frac, b: Frac) => a.num * b.den === b.num * a.den;

const BASES: Frac[] = [
  { num: 1, den: 2 }, { num: 2, den: 3 }, { num: 3, den: 4 }, { num: 1, den: 3 },
  { num: 3, den: 5 }, { num: 2, den: 5 }, { num: 4, den: 5 }, { num: 5, den: 6 }, { num: 1, den: 4 },
];

type Question = { q: Frac; answer: Frac; options: Frac[] };

function genQuestion(level: Level): Question {
  const base = BASES[randInt(0, BASES.length - 1)];
  const kMax = Math.floor(24 / base.den);
  const k = level === 1 ? 2 : level === 2 ? randInt(2, 3) : randInt(2, Math.max(2, kMax));
  const q = { num: base.num * k, den: base.den * k };
  const answer = { ...base };
  // ตัวลวง: รูปเทียบเท่าแต่ยังไม่อย่างต่ำ + เศษส่วนใกล้เคียงที่ผิด
  const distractors: Frac[] = [];
  // ลวง 1: หารแค่บางส่วน (เทียบเท่าแต่ไม่อย่างต่ำ) ถ้าทำได้
  if (k >= 4 && k % 2 === 0) distractors.push({ num: base.num * (k / 2), den: base.den * (k / 2) });
  // ลวง: สลับ/เพี้ยนตัวเลข
  let guard = 0;
  while (distractors.length < 3 && guard++ < 40) {
    const cand: Frac = randInt(0, 1) === 0
      ? { num: base.num + (randInt(0, 1) ? 1 : -1), den: base.den }
      : { num: base.num, den: base.den + (randInt(0, 1) ? 1 : -1) };
    if (cand.num < 1 || cand.den < 2 || cand.num >= cand.den) continue;
    if (eq(cand, answer)) continue;
    if (distractors.some((d) => eq(d, cand))) continue;
    distractors.push(cand);
  }
  const options = [answer, ...distractors.slice(0, 3)];
  // สลับ
  for (let i = options.length - 1; i > 0; i--) { const j = randInt(0, i); [options[i], options[j]] = [options[j], options[i]]; }
  return { q, answer, options };
}

/* ── เสียง ── */

type SoundKind = "fuel" | "leak" | "count" | "launch" | "combo" | "start" | "win";

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
      case "fuel": return tones([784, 1047], 0.05, 0.1, "triangle", 0.12);
      case "leak": return sweep(500, 180, 0.25, "sawtooth", 0.09);
      case "count": return tones([880], 0.01, 0.12, "square", 0.1);
      case "launch": return sweep(200, 1600, 0.7, "sawtooth", 0.12);
      case "combo": return tones([659, 880, 1047, 1319], 0.05, 0.11, "triangle", 0.15);
      case "start": return tones([523, 659, 784], 0.07, 0.12, "triangle", 0.14);
      case "win": return tones([523, 659, 784, 1047, 1319, 1568], 0.09, 0.18, "triangle", 0.15);
    }
  }
  return { play, ensure };
}

/* ── เพลงอวกาศ (ชิปทูน ไม่ใช้ไฟล์) ── */

const SP_LEAD = [69, 72, 76, 72, 69, 0, 65, 0, 67, 71, 74, 71, 67, 0, 64, 0, 69, 72, 76, 81, 76, 72, 69, 72, 71, 69, 67, 69, 71, 72, 0, 0];
const SP_BASS = [45, 52, 45, 52, 41, 48, 41, 48, 43, 50, 43, 50, 40, 47, 40, 47];

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
      const m = SP_LEAD[s];
      if (m) note(m, 0.18, "triangle", 0.03);
      if (s % 2 === 0) {
        const b = SP_BASS[s / 2];
        if (b) note(b, 0.3, "sine", 0.05);
      }
    }, 215);
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

/* ── จรวด SVG (เชื้อเพลิงเพิ่ม + ทะยาน) ── */

function Rocket({ color, fuel, launching }: { color: "red" | "blue"; fuel: number; launching: boolean }) {
  const c = color === "red" ? { body: "#f87171", dark: "#b91c1c", fin: "#dc2626" } : { body: "#60a5fa", dark: "#1d4ed8", fin: "#2563eb" };
  const pct = Math.min(1, fuel / FUEL_FULL);
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn("relative", launching && "rocket-launch")}>
        <svg viewBox="0 0 60 110" width={70} height={128} role="img" aria-label={`จรวด${color === "red" ? "แดง" : "น้ำเงิน"}`}>
          {/* เปลวไฟตอนทะยาน */}
          {launching && (
            <g className="rocket-flame">
              <path d="M22,92 Q30,120 38,92 Q30,104 22,92 Z" fill="#f59e0b" />
              <path d="M26,92 Q30,110 34,92 Z" fill="#fde68a" />
            </g>
          )}
          {/* ครีบ */}
          <path d="M14,70 L4,92 L18,84 Z" fill={c.fin} stroke={c.dark} strokeWidth={1.5} />
          <path d="M46,70 L56,92 L42,84 Z" fill={c.fin} stroke={c.dark} strokeWidth={1.5} />
          {/* ลำตัว */}
          <path d="M30,4 Q46,34 46,72 Q46,88 30,90 Q14,88 14,72 Q14,34 30,4 Z" fill={c.body} stroke={c.dark} strokeWidth={2} />
          {/* หน้าต่าง */}
          <circle cx={30} cy={40} r={9} fill="#e0f2fe" stroke={c.dark} strokeWidth={2} />
          <circle cx={30} cy={40} r={4} fill="#7dd3fc" />
          {/* แถบเชื้อเพลิงในตัวจรวด */}
          <rect x={22} y={56} width={16} height={26} rx={3} fill="#fff" opacity={0.5} />
          <rect x={22} y={56 + 26 * (1 - pct)} width={16} height={26 * pct} rx={3} fill="#22c55e" style={{ transition: "all 0.4s ease-out" }} />
        </svg>
      </div>
      {/* มาตรวัดเชื้อเพลิง */}
      <div className="flex items-center gap-1">
        {Array.from({ length: FUEL_FULL }, (_, i) => (
          <span key={i} className={cn("h-3 w-3 rounded-full ring-1 transition-all", i < fuel ? "bg-emerald-500 ring-emerald-600" : "bg-slate-200 ring-slate-300")} />
        ))}
      </div>
    </div>
  );
}

/* ── เกมหลัก ── */

export function SimplifyRocketGame() {
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

  /* ตั้งค่า (ครู) */
  const [level, setLevel] = useState<Level>(2);
  const [teamMode, setTeamMode] = useState(false);
  const [reveal, setReveal] = useState(false);

  /* สถานะเกม */
  const [started, setStarted] = useState(false);
  const [q, setQ] = useState<Question>(() => genQuestion(2));
  const [picked, setPicked] = useState<Frac | null>(null);
  const [phase, setPhase] = useState<"ask" | "result">("ask");
  const [fuel, setFuel] = useState<[number, number]>([0, 0]);
  const [team, setTeam] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [launched, setLaunched] = useState<number | null>(null);
  const timeoutsRef = useRef<number[]>([]);
  useEffect(() => () => timeoutsRef.current.forEach((t) => window.clearTimeout(t)), []);

  const ok = picked ? eq(picked, q.answer) : false;

  function newQuestion() {
    setQ(genQuestion(level));
    setPicked(null);
    setPhase("ask");
  }

  function start() {
    ensure();
    play("start");
    setFuel([0, 0]);
    setTeam(0);
    setScore(0);
    setCombo(0);
    setLaunched(null);
    setCountdown(null);
    setQ(genQuestion(level));
    setPicked(null);
    setPhase("ask");
    setStarted(true);
  }

  function doLaunch(t: number) {
    setCountdown(3);
    play("count");
    [2, 1].forEach((n, i) => timeoutsRef.current.push(window.setTimeout(() => { setCountdown(n); play("count"); }, (i + 1) * 700)));
    timeoutsRef.current.push(window.setTimeout(() => {
      setCountdown(null);
      setLaunched(t);
      play("launch");
    }, 2100));
  }

  function pick(opt: Frac) {
    if (phase !== "ask" || countdown !== null || launched !== null) return;
    setPicked(opt);
    setPhase("result");
    if (eq(opt, q.answer)) {
      const nc = combo + 1;
      setCombo(nc);
      setScore((s) => s + 10 + Math.min(15, (nc - 1) * 5));
      play(nc >= 3 ? "combo" : "fuel");
      setFuel((f) => {
        const nf: [number, number] = [...f];
        nf[team] = Math.min(FUEL_FULL, nf[team] + 1);
        if (nf[team] >= FUEL_FULL) timeoutsRef.current.push(window.setTimeout(() => doLaunch(team), 700));
        return nf;
      });
    } else {
      // ตอบผิด → เชื้อเพลิงรั่ว 1 ช่อง (ไม่ต่ำกว่า 0)
      setCombo(0);
      play("leak");
      setFuel((f) => {
        const nf: [number, number] = [...f];
        nf[team] = Math.max(0, nf[team] - 1);
        return nf;
      });
    }
  }

  function next() {
    if (teamMode && ok === false) setTeam((t) => 1 - t); // ตอบผิด → สลับทีม
    newQuestion();
  }

  const stars = score >= 120 ? 3 : score >= 70 ? 2 : 1;

  /* ดูสรุปผลหลังปล่อยจรวด */
  function afterLaunch() {
    play("win");
    setStarted(false);
  }

  return (
    <div className="relative overflow-hidden rounded-2xl p-3 sm:p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-950 via-indigo-900 to-slate-900" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {[[8, 12], [30, 30], [70, 18], [88, 40], [20, 60], [55, 70], [82, 80], [40, 88]].map(([x, y], i) => (
          <span key={i} className="absolute text-white/70" style={{ left: `${x}%`, top: `${y}%`, fontSize: i % 2 ? 10 : 7 }}>✦</span>
        ))}
      </div>
      <style>{`
        .rocket-launch { animation: rocketUp 1.6s cubic-bezier(.5,0,.9,.5) forwards; }
        @keyframes rocketUp { 0% { transform: translateY(0); } 25% { transform: translateY(6px); } 100% { transform: translateY(-460px); } }
        .rocket-flame { animation: flameFlick 0.12s ease-in-out infinite; transform-origin: 30px 92px; }
        @keyframes flameFlick { 0%,100% { transform: scaleY(1); } 50% { transform: scaleY(1.4); } }
        @keyframes cdPop { 0% { transform: scale(0.4); opacity: 0; } 50% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(1); opacity: 0.9; } }
        .cd-pop { animation: cdPop 0.6s ease-out; }
      `}</style>

      <div className="relative space-y-3">
        {/* โหมด + ปิดเสียง */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex rounded-xl border-2 border-white/20 bg-white/10 p-1">
            <button onClick={() => { setTeamMode(false); setStarted(false); }} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", !teamMode ? "bg-sky-500 text-white shadow" : "text-white/70 hover:bg-white/10")}>
              <User size={15} /> เล่นคนเดียว
            </button>
            <button onClick={() => { setTeamMode(true); setStarted(false); }} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", teamMode ? "bg-rose-500 text-white shadow" : "text-white/70 hover:bg-white/10")}>
              <Users size={15} /> 2 ทีมแข่งกัน
            </button>
          </div>
          <button onClick={() => setMuted((m) => !m)} className="grid h-9 w-9 place-items-center rounded-xl border-2 border-white/20 bg-white/10 text-white/80 transition hover:bg-white/20" title={muted ? "เปิดเสียง" : "ปิดเสียง"}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {/* ตั้งค่าครู */}
        <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-white/15 bg-white/10 px-3 py-2 text-white">
          <span className="text-sm font-extrabold">⚡ ความยาก:</span>
          {([[1, "ง่าย (×2)"], [2, "ปานกลาง"], [3, "ยาก (คละ)"]] as [Level, string][]).map(([lv, label]) => (
            <button key={lv} onClick={() => { setLevel(lv); setStarted(false); }} className={cn("rounded-lg border-2 px-2.5 py-1 text-xs font-extrabold transition", level === lv ? "border-amber-300 bg-amber-400/30 text-amber-100" : "border-white/20 bg-white/5 text-white/70 hover:bg-white/10")}>
              {label}
            </button>
          ))}
          <button onClick={() => setReveal((v) => !v)} className={cn("ml-2 flex items-center gap-1.5 rounded-lg border-2 px-2.5 py-1 text-xs font-extrabold transition", reveal ? "border-violet-300 bg-violet-400/30 text-violet-100" : "border-white/20 bg-white/5 text-white/70 hover:bg-white/10")}>
            {reveal ? <EyeOff size={13} /> : <Eye size={13} />} เฉลย (ครูสอน)
          </button>
        </div>

        {!started ? (
          <div className="space-y-4 rounded-2xl border-2 border-white/15 bg-white/10 p-6 text-center text-white">
            {launched !== null ? (
              <>
                <div className="text-5xl">🚀✨</div>
                <h3 className="text-xl font-extrabold sm:text-2xl">{teamMode ? `ทีม${launched === 0 ? "แดง 🔴" : "น้ำเงิน 🔵"} ปล่อยจรวดก่อน — ชนะ!` : "จรวดทะยานสู่อวกาศ!"}</h3>
                {!teamMode && <><p className="text-2xl">{"⭐".repeat(stars)}{"☆".repeat(3 - stars)}</p><p className="text-base font-extrabold text-amber-200">🏅 คะแนน {score}</p></>}
              </>
            ) : (
              <>
                <div className="text-5xl">🚀🌟</div>
                <h3 className="text-xl font-extrabold sm:text-2xl">จรวดเศษส่วนอย่างต่ำ</h3>
                <p className="mx-auto max-w-md text-sm font-bold text-white/80">
                  เลือก<b>รูปอย่างต่ำ</b>ของเศษส่วนให้ถูก → เติมเชื้อเพลิง! เต็ม {FUEL_FULL} ช่องเมื่อไหร่ <b>จรวดทะยาน!</b> {teamMode && "ทีมไหนเต็มก่อนชนะ 🏆"}
                </p>
              </>
            )}
            <button onClick={start} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
              {launched !== null ? <><RotateCcw size={18} /> เล่นอีกครั้ง</> : <><Play size={18} /> เริ่มปล่อยจรวด!</>}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* แถบสถานะ */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-white">
              {teamMode ? (
                <>
                  <span className={cn("rounded-full px-3 py-1 text-sm font-extrabold transition", team === 0 ? "bg-rose-500 ring-2 ring-rose-300" : "bg-rose-500/30")}>🔴 ทีมแดง {fuel[0]}/{FUEL_FULL} {team === 0 && "◀"}</span>
                  <span className={cn("rounded-full px-3 py-1 text-sm font-extrabold transition", team === 1 ? "bg-sky-500 ring-2 ring-sky-300" : "bg-sky-500/30")}>🔵 ทีมน้ำเงิน {fuel[1]}/{FUEL_FULL} {team === 1 && "◀"}</span>
                </>
              ) : (
                <>
                  <span className="text-base font-extrabold text-amber-200">🏅 {score}</span>
                  {combo >= 2 && <span className="text-base font-extrabold text-orange-300">🔥 x{combo}</span>}
                  <span className="text-sm font-extrabold text-white/80">⛽ เชื้อเพลิง {fuel[0]}/{FUEL_FULL}</span>
                </>
              )}
            </div>

            <div className="flex items-end justify-center gap-6">
              {teamMode && <Rocket color="red" fuel={fuel[0]} launching={launched === 0} />}
              {!teamMode && <Rocket color="red" fuel={fuel[0]} launching={launched === 0} />}
              {teamMode && <Rocket color="blue" fuel={fuel[1]} launching={launched === 1} />}
            </div>

            {countdown !== null && (
              <p key={countdown} className="cd-pop text-center text-5xl font-black text-amber-300">{countdown}</p>
            )}

            {launched === null && countdown === null && (
              <>
                {/* โจทย์ */}
                <div className="mx-auto flex max-w-md flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-white/15 bg-white/10 px-4 py-3 text-center text-white">
                  <span className="text-base font-extrabold sm:text-lg">รูปอย่างต่ำของ</span>
                  <StackedFraction numerator={q.q.num} denominator={q.q.den} className="text-3xl" toneClassName="text-amber-200" />
                  <span className="text-base font-extrabold sm:text-lg">คือ?</span>
                </div>

                {/* ตัวเลือก */}
                <div className="mx-auto grid max-w-md grid-cols-2 gap-2 sm:gap-3">
                  {q.options.map((opt, i) => {
                    const isAns = eq(opt, q.answer);
                    const chosen = picked && eq(picked, opt);
                    return (
                      <button
                        key={i}
                        onClick={() => pick(opt)}
                        disabled={phase === "result"}
                        className={cn(
                          "flex items-center justify-center rounded-2xl border-b-4 bg-white/95 py-3 shadow transition",
                          phase === "ask" ? "border-slate-300 hover:-translate-y-0.5 active:scale-[0.97]" : isAns ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-300" : chosen ? "border-rose-500 bg-rose-50 opacity-90" : "border-slate-300 opacity-50",
                          reveal && isAns && phase === "ask" && "ring-2 ring-amber-300",
                        )}
                      >
                        <StackedFraction numerator={opt.num} denominator={opt.den} className="text-2xl" toneClassName="text-slate-700" />
                      </button>
                    );
                  })}
                </div>

                {/* ผลลัพธ์ */}
                {phase === "result" && (
                  <div className={cn("space-y-2 rounded-2xl border-2 p-3 text-center", ok ? "border-emerald-400 bg-emerald-500/15" : "border-rose-400 bg-rose-500/15")}>
                    <p className={cn("flex items-center justify-center gap-2 text-base font-extrabold", ok ? "text-emerald-200" : "text-rose-200")}>
                      {ok ? <><CheckCircle2 size={18} /> เติมเชื้อเพลิงสำเร็จ!</> : <><XCircle size={18} /> ยังไม่ใช่รูปอย่างต่ำ</>}
                    </p>
                    <p className="flex flex-wrap items-center justify-center gap-2 text-sm font-extrabold text-white">
                      <StackedFraction numerator={q.q.num} denominator={q.q.den} className="text-lg" toneClassName="text-amber-200" />
                      <span className="text-violet-300">÷ ห.ร.ม.({gcd(q.q.num, q.q.den)})</span>
                      <span>=</span>
                      <StackedFraction numerator={simplify(q.q.num, q.q.den).num} denominator={simplify(q.q.num, q.q.den).den} className="text-lg" toneClassName="text-emerald-200" />
                    </p>
                    <button onClick={next} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-2 text-sm font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                      🚀 ข้อถัดไป{teamMode && !ok ? " (สลับทีม)" : ""}
                    </button>
                  </div>
                )}
              </>
            )}

            {launched !== null && (
              <div className="text-center">
                <button onClick={afterLaunch} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-2.5 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                  🎉 ดูสรุปผล
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
