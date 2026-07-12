"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Volume2, VolumeX, FlaskConical, Target, Zap, Sparkles } from "lucide-react";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { cn } from "@/lib/cn";
import { randInt } from "@/lib/randomFraction";

/* ── ค่าคงที่ ── */

type Frac = { num: number; den: number };
const PRIMES = [2, 3, 5, 7];
const MISSIONS_TOTAL = 8;

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
const isLowest = (n: number, d: number) => gcd(n, d) === 1;

/* สุ่มเศษส่วน "ยังไม่อย่างต่ำ" — เอารูปอย่างต่ำ × k */
function randomNonLowest(): Frac {
  const bases: Frac[] = [
    { num: 1, den: 2 }, { num: 2, den: 3 }, { num: 3, den: 4 }, { num: 1, den: 3 },
    { num: 3, den: 5 }, { num: 2, den: 5 }, { num: 4, den: 5 }, { num: 5, den: 6 }, { num: 1, den: 4 },
  ];
  const b = bases[randInt(0, bases.length - 1)];
  const kMax = Math.floor(24 / b.den);
  const k = randInt(2, Math.max(2, kMax));
  return { num: b.num * k, den: b.den * k };
}

/* ── เสียง ── */

type SoundKind = "shrink" | "nope" | "lowest" | "correct" | "star" | "start";

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
      case "shrink": return sweep(900, 380, 0.2, "square", 0.08);
      case "nope": return tones([200, 150], 0.1, 0.16, "sawtooth", 0.1);
      case "lowest": return tones([660, 990, 1319, 1568], 0.07, 0.14, "triangle", 0.15);
      case "correct": return tones([660, 990, 1319], 0.06, 0.1, "triangle", 0.14);
      case "star": return tones([1047, 1319, 1568, 2093], 0.07, 0.14, "triangle", 0.14);
      case "start": return tones([523, 659, 784], 0.07, 0.12, "triangle", 0.14);
    }
  }
  return { play, ensure };
}

/* ── เพลงโรงงาน (ชิปทูน ไม่ใช้ไฟล์) ── */

const MC_LEAD = [60, 64, 67, 64, 60, 0, 55, 0, 57, 60, 64, 60, 55, 0, 52, 0, 60, 64, 67, 72, 67, 64, 60, 64, 62, 60, 59, 60, 62, 64, 0, 0];
const MC_BASS = [36, 43, 36, 43, 31, 38, 31, 38, 33, 40, 33, 40, 35, 42, 35, 42];

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
      const m = MC_LEAD[s];
      if (m) note(m, 0.17, "square", 0.028);
      if (s % 2 === 0) {
        const b = MC_BASS[s / 2];
        if (b) note(b, 0.3, "triangle", 0.05);
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

/* ── แถบภาพเศษส่วน (พิสูจน์ค่าไม่เปลี่ยน) ── */

function FractionBar({ num, den, pulse, ok }: { num: number; den: number; pulse: boolean; ok: boolean }) {
  return (
    <div className={cn("relative rounded-2xl border-4 bg-white p-1.5 shadow-inner transition-all", ok ? "border-emerald-400" : "border-orange-300", pulse && "shrink-pulse")}>
      <div className="flex h-16 w-full overflow-hidden rounded-lg sm:h-20">
        {Array.from({ length: den }, (_, i) => (
          <div
            key={i}
            className={cn("flex-1 border-r-2 border-white transition-[background-color] duration-300 last:border-r-0", i < num ? (ok ? "bg-emerald-400" : "bg-orange-400") : "bg-slate-100")}
          />
        ))}
      </div>
      <p className="mt-1 text-center text-[11px] font-bold text-slate-400">แบ่ง {den} ส่วน · ระบาย {num} ส่วน · ยาว = {((num / den) * 100).toFixed(0)}% (คงเดิม!)</p>
    </div>
  );
}

/* ── ตัวเลือกเศษส่วน (มาตรฐาน: แถวบน=เศษ ล่าง=ส่วน ลบซ้าย บวกขวา) ── */

function FracPicker({ f, onChange }: { f: Frac; onChange: (f: Frac) => void }) {
  function step(part: "num" | "den", d: number) {
    if (part === "den") {
      const den = Math.max(2, Math.min(24, f.den + d));
      onChange({ den, num: Math.min(f.num, den - 1) });
    } else {
      onChange({ ...f, num: Math.max(1, Math.min(f.den - 1, f.num + d)) });
    }
  }
  const btn = "h-8 w-8 rounded-lg border-2 border-slate-200 bg-white text-base font-extrabold text-slate-600 transition hover:bg-slate-50 active:scale-95";
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center justify-center gap-2">
        <span className="w-8 text-right text-[10px] font-extrabold text-slate-400">เศษ</span>
        <button onClick={() => step("num", -1)} className={btn}>−</button>
        <span className="w-12 text-center text-3xl font-extrabold leading-none text-orange-700">{f.num}</span>
        <button onClick={() => step("num", 1)} className={btn}>+</button>
        <span className="w-8" aria-hidden />
      </div>
      <div className="h-[3px] w-14 rounded bg-orange-700" />
      <div className="flex items-center justify-center gap-2">
        <span className="w-8 text-right text-[10px] font-extrabold text-slate-400">ส่วน</span>
        <button onClick={() => step("den", -1)} className={btn}>−</button>
        <span className="w-12 text-center text-3xl font-extrabold leading-none text-orange-700">{f.den}</span>
        <button onClick={() => step("den", 1)} className={btn}>+</button>
        <span className="w-8" aria-hidden />
      </div>
    </div>
  );
}

/* ── เกมหลัก ── */

export function SimplifyShrinkMachine() {
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

  const [cur, setCur] = useState<Frac>({ num: 12, den: 18 });
  const [start, setStart] = useState<Frac>({ num: 12, den: 18 });
  const [steps, setSteps] = useState<{ by: number; num: number; den: number }[]>([]);
  const [pulse, setPulse] = useState(false);
  const [badDiv, setBadDiv] = useState<number | null>(null);
  const timeoutsRef = useRef<number[]>([]);
  useEffect(() => () => timeoutsRef.current.forEach((t) => window.clearTimeout(t)), []);

  const lowest = isLowest(cur.num, cur.den);
  const curGcd = gcd(cur.num, cur.den);

  /* โหมดภารกิจ */
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [taps, setTaps] = useState(0);
  const [done, setDone] = useState(false);

  function reset(f: Frac) {
    setCur(f);
    setStart(f);
    setSteps([]);
    setBadDiv(null);
    setTaps(0);
  }

  function divideBy(d: number) {
    if (lowest) return;
    setTaps((t) => t + 1);
    if (cur.num % d === 0 && cur.den % d === 0) {
      const nn = cur.num / d, nd = cur.den / d;
      setCur({ num: nn, den: nd });
      setSteps((s) => [...s, { by: d, num: nn, den: nd }]);
      setBadDiv(null);
      setPulse(true);
      timeoutsRef.current.push(window.setTimeout(() => setPulse(false), 320));
      if (isLowest(nn, nd)) {
        play("lowest");
        if (mode === "mission") {
          const perfect = taps === 0; // กดครั้งเดียวถึง (ใช้ ห.ร.ม.)
          setScore((sc) => sc + (perfect ? 30 : 15));
        }
      } else {
        play("shrink");
      }
    } else {
      setBadDiv(d);
      play("nope");
      timeoutsRef.current.push(window.setTimeout(() => setBadDiv(null), 600));
    }
  }

  function useGcd() {
    if (lowest || curGcd <= 1) return;
    divideBy(curGcd);
  }

  /* ภารกิจ */
  function startMissions() {
    ensure();
    play("start");
    setScore(0); setRound(1); setDone(false);
    reset(randomNonLowest());
    setMode("mission");
  }
  function nextMission() {
    if (round >= MISSIONS_TOTAL) { setDone(true); play("star"); return; }
    setRound((r) => r + 1);
    reset(randomNonLowest());
  }

  return (
    <div className="relative overflow-hidden rounded-2xl p-3 sm:p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-orange-50 via-amber-50 to-yellow-50" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden text-xl" aria-hidden>
        <span className="absolute left-5 top-8 opacity-30">⚙️</span>
        <span className="absolute right-8 top-14 opacity-30">🏭</span>
        <span className="absolute bottom-10 left-8 opacity-25">🔧</span>
        <span className="absolute bottom-14 right-6 opacity-30">✨</span>
      </div>
      <style>{`
        .shrink-pulse { animation: shrinkPulse 0.32s ease-out; }
        @keyframes shrinkPulse { 0% { transform: scaleX(1); } 45% { transform: scaleX(0.9); } 100% { transform: scaleX(1); } }
        @keyframes badShake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
        .bad-shake { animation: badShake 0.3s ease-in-out; }
      `}</style>

      <div className="relative space-y-3">
        {/* โหมด + ปิดเสียง */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex rounded-xl border-2 border-slate-200 bg-white p-1">
            <button onClick={() => setMode("lab")} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "lab" ? "bg-orange-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <FlaskConical size={15} /> โหมดครู
            </button>
            <button onClick={startMissions} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "mission" ? "bg-amber-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <Target size={15} /> โหมดภารกิจ
            </button>
          </div>
          <button onClick={() => setMuted((m) => !m)} className="grid h-9 w-9 place-items-center rounded-xl border-2 border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50" title={muted ? "เปิดเสียง" : "ปิดเสียง"}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {mode === "mission" && done ? (
          <div className="space-y-4 rounded-2xl border-2 border-amber-300 bg-white/90 p-6 text-center">
            <div className="text-5xl">🏭🏆</div>
            <h3 className="text-xl font-extrabold text-slate-800 sm:text-2xl">จบภารกิจเครื่องย่อ!</h3>
            <p className="text-base font-extrabold text-amber-700 sm:text-lg">🏅 คะแนนรวม {score}</p>
            <p className="text-sm font-bold text-slate-500">{score >= 200 ? "🌟🌟🌟 นายช่างย่อเศษส่วนตัวจริง! (ใช้ ห.ร.ม. เก่งมาก)" : score >= 130 ? "🌟🌟 เยี่ยม! ลองใช้ ห.ร.ม. ให้ครบทุกข้อ" : "🌟 เก่งแล้ว ลองย่อให้น้อยครั้งขึ้น!"}</p>
            <button onClick={startMissions} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
              <Play size={18} /> เล่นอีกครั้ง
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {mode === "lab" ? (
              <div className="rounded-2xl bg-orange-50 px-4 py-2 text-center text-sm font-extrabold text-orange-700 ring-1 ring-orange-200">
                🧑‍🏫 ตั้งเศษส่วน แล้วกดปุ่มตัวหารเพื่อ &quot;บีบ&quot; ให้เล็กลง — <u>ค่าเท่าเดิม แต่ชื่อเล็กลง</u> จนถึงอย่างต่ำ!
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 rounded-2xl bg-white/85 px-4 py-2 ring-1 ring-amber-200">
                <span className="text-base font-extrabold text-amber-700">🎯 ข้อ {round}/{MISSIONS_TOTAL}</span>
                <span className="text-base font-extrabold text-orange-700">🏅 {score}</span>
                <span className="text-sm font-extrabold text-slate-500">กดไป {taps} ครั้ง</span>
              </div>
            )}

            {mode === "lab" && (
              <div className="flex justify-center">
                <FracPicker f={cur} onChange={reset} />
              </div>
            )}

            {/* เครื่องย่อ: เศษส่วนปัจจุบัน + แถบภาพ */}
            <div className="mx-auto max-w-xl space-y-2 rounded-2xl border-2 border-slate-200 bg-white/90 p-4 shadow-sm">
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl">🏭</span>
                <StackedFraction numerator={cur.num} denominator={cur.den} className="text-4xl" toneClassName={lowest ? "text-emerald-700" : "text-orange-700"} />
                {lowest && <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-extrabold text-emerald-700 ring-1 ring-emerald-300">✨ อย่างต่ำแล้ว!</span>}
              </div>
              <FractionBar num={cur.num} den={cur.den} pulse={pulse} ok={lowest} />
            </div>

            {/* ปุ่มตัวหาร */}
            {!lowest ? (
              <div className="space-y-2">
                <p className="text-center text-sm font-extrabold text-slate-600">🔽 กดตัวหารเพื่อบีบเครื่อง:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {PRIMES.map((d) => (
                    <button key={d} onClick={() => divideBy(d)} className={cn("rounded-2xl border-b-4 bg-gradient-to-b from-orange-400 to-orange-500 px-5 py-2.5 text-lg font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.97] active:border-b-2", badDiv === d && "bad-shake border-rose-700 from-rose-500 to-rose-600")}>
                      ÷{d}
                    </button>
                  ))}
                  <button onClick={useGcd} className="flex items-center gap-1.5 rounded-2xl border-b-4 border-violet-700 bg-gradient-to-b from-violet-500 to-violet-600 px-4 py-2.5 text-sm font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.97] active:border-b-2">
                    <Zap size={15} /> ห.ร.ม. ทางลัด (÷{curGcd})
                  </button>
                </div>
                {badDiv !== null && <p className="text-center text-sm font-extrabold text-rose-600">❌ {badDiv} หารไม่ลงตัวทั้งบน-ล่าง ลองตัวอื่น!</p>}
              </div>
            ) : (
              <div className="space-y-2 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-3 text-center">
                <p className="flex items-center justify-center gap-2 text-lg font-extrabold text-emerald-700"><Sparkles size={18} /> เยี่ยม! {start.num}/{start.den} = {cur.num}/{cur.den} (อย่างต่ำ)</p>
                {steps.length > 0 && (
                  <p className="flex flex-wrap items-center justify-center gap-1.5 text-sm font-extrabold text-slate-600">
                    <StackedFraction numerator={start.num} denominator={start.den} className="text-base" toneClassName="text-slate-600" />
                    {steps.map((st, i) => (
                      <span key={i} className="flex items-center gap-1.5">
                        <span className="text-violet-600">→(÷{st.by})</span>
                        <StackedFraction numerator={st.num} denominator={st.den} className="text-base" toneClassName={i === steps.length - 1 ? "text-emerald-700" : "text-slate-600"} />
                      </span>
                    ))}
                  </p>
                )}
                {mode === "mission" ? (
                  <button onClick={nextMission} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 px-6 py-2.5 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                    {round >= MISSIONS_TOTAL ? "🏁 ดูสรุปผล" : "⚙️ ข้อถัดไป"}
                  </button>
                ) : (
                  <button onClick={() => reset(start)} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-5 py-2 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50">
                    <RotateCcw size={15} /> เริ่มใหม่จาก {start.num}/{start.den}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
