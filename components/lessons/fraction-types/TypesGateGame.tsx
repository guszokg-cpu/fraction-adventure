"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Volume2, VolumeX, FlaskConical, Target, Shirt, Check, X } from "lucide-react";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { ThaiAvatar, AvatarPicker, usePlayerAvatar, randomAvatar } from "@/components/avatar/ThaiAvatar";
import { FRAC_TYPES, TYPE_INFO, makeFraction, randomType, classify, type FracType, type TypedFraction } from "@/lib/fractionTypes";
import { ThaiBackdrop } from "@/components/games/ThaiScenery";
import { cn } from "@/lib/cn";
import { randInt } from "@/lib/randomFraction";

/* ─────────────────────────────────────────────
   ด่านตรวจเศษส่วน 🚧
   กติกาสุ่ม: "วันนี้ให้ผ่านเฉพาะ[ประเภท]"
   นักเดินทาง (จิบิไทยสุ่มหน้าตา) ถือป้ายเศษส่วนมาที่ด่าน
   เด็กเป็นยาม (แต่งตัวได้) กด ✅ เปิดไม้กั้น / ❌ ไม่ให้ผ่าน
   ตอบเร็วถูกติด ๆ ได้สตรีคโบนัส!
   ───────────────────────────────────────────── */

const MISSIONS_TOTAL = 10;

type SoundKind = "gateup" | "deny" | "walk" | "correct" | "wrong" | "start" | "star" | "combo";

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
      case "gateup": return tones([392, 523, 659], 0.06, 0.1, "triangle", 0.1);
      case "deny": return tones([330, 262], 0.09, 0.14, "square", 0.07);
      case "walk": return tones([880], 0.04, 0.05, "sine", 0.04);
      case "correct": return tones([660, 990, 1319], 0.06, 0.1, "triangle", 0.14);
      case "wrong": return tones([220, 165], 0.11, 0.18, "sawtooth", 0.09);
      case "start": return tones([523, 659, 784], 0.07, 0.12, "triangle", 0.14);
      case "star": return tones([1047, 1319, 1568, 2093], 0.07, 0.14, "triangle", 0.14);
      case "combo": return tones([784, 988, 1175, 1568], 0.05, 0.1, "square", 0.09);
    }
  }
  return { play, ensure };
}

/* เพลงด่านชายแดนตื่นเต้น */
const GT_LEAD = [57, 0, 60, 62, 64, 0, 62, 60, 57, 0, 60, 0, 55, 0, 0, 0, 57, 0, 60, 62, 64, 0, 67, 0, 66, 64, 62, 60, 57, 0, 0, 0];
const GT_BASS = [33, 40, 33, 40, 36, 43, 36, 43, 38, 45, 38, 45, 33, 40, 40, 33];

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
      const m = GT_LEAD[s];
      if (m) note(m, 0.17, "square", 0.022);
      if (s % 2 === 0) {
        const b = GT_BASS[s / 2];
        if (b) note(b, 0.3, "triangle", 0.055);
      }
    }, 185);
  }
  function stop() { if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; } }
  useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);
  return { start, stop };
}

/* ── ไม้กั้นด่าน ── */
function GateBar({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 220 110" className="w-full max-w-[300px]" role="img" aria-label={open ? "ด่านเปิด" : "ด่านปิด"}>
      {/* ป้อมยาม */}
      <rect x={170} y={30} width={40} height={70} rx={5} fill="#e8d9b8" stroke="#a68a55" strokeWidth={2} />
      <rect x={166} y={22} width={48} height={12} rx={4} fill="#c0392b" stroke="#8a2a20" strokeWidth={1.5} />
      <rect x={178} y={46} width={22} height={18} rx={3} fill="#bfe3f2" stroke="#a68a55" strokeWidth={1.5} />
      {/* เสาไม้กั้น */}
      <rect x={158} y={62} width={10} height={40} rx={3} fill="#64748b" stroke="#334155" strokeWidth={1.5} />
      {/* ไม้กั้น (ลายแดงขาว) */}
      <g style={{ transformOrigin: "163px 66px", transform: open ? "rotate(-64deg)" : "rotate(0deg)", transition: "transform 0.45s cubic-bezier(.5,1.3,.5,1)" }}>
        {Array.from({ length: 7 }, (_, i) => (
          <rect key={i} x={163 - (i + 1) * 21} y={60} width={21} height={11} fill={i % 2 ? "#fff" : "#e04444"} stroke="#8a2a20" strokeWidth={0.8} />
        ))}
        <circle cx={163} cy={66} r={6} fill="#334155" />
      </g>
      {/* พื้นถนน */}
      <rect x={0} y={100} width={220} height={10} fill="#94a3b8" />
      <rect x={8} y={104} width={20} height={2.5} fill="#fff" opacity={0.8} />
      <rect x={48} y={104} width={20} height={2.5} fill="#fff" opacity={0.8} />
      <rect x={88} y={104} width={20} height={2.5} fill="#fff" opacity={0.8} />
      <rect x={128} y={104} width={20} height={2.5} fill="#fff" opacity={0.8} />
    </svg>
  );
}

export function TypesGateGame() {
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

  const [player, setPlayer] = usePlayerAvatar();
  const [showDress, setShowDress] = useState(false);

  const [rule, setRule] = useState<FracType>("proper");
  const [frac, setFrac] = useState<TypedFraction>(() => makeFraction("proper"));
  const [seed, setSeed] = useState(() => randInt(1, 9999));
  const [answered, setAnswered] = useState<null | { ok: boolean; gateOpen: boolean }>(null);
  /* เดินเข้าฉาก → ยืนรอ → เดินผ่านด่าน (เปิด) / หันหลังเดินกลับ (โดนกัน) */
  const [walk, setWalk] = useState<"enter" | "stand" | "pass" | "back">("enter");
  const timeoutsRef = useRef<number[]>([]);
  useEffect(() => () => timeoutsRef.current.forEach((t) => window.clearTimeout(t)), []);
  useEffect(() => {
    timeoutsRef.current.push(window.setTimeout(() => setWalk("stand"), 1050));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const traveler = randomAvatar(seed);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const shouldPass = classify(frac) === rule;

  function nextTraveler(sameRule = true, forceType?: FracType) {
    if (!sameRule) setRule(randomType());
    /* 50% ตรงกติกา 50% ไม่ตรง เพื่อไม่ให้เดาได้ */
    const t = forceType ?? (Math.random() < 0.5 ? rule : FRAC_TYPES.filter((x) => x !== rule)[randInt(0, 1)]);
    setFrac(makeFraction(t));
    setSeed(randInt(1, 99999));
    setAnswered(null);
    setWalk("enter");
    timeoutsRef.current.push(window.setTimeout(() => setWalk("stand"), 1050));
    play("walk");
  }

  function judge(letPass: boolean) {
    if (answered || walk === "enter") return;
    ensure();
    const ok = letPass === shouldPass;
    setAnswered({ ok, gateOpen: letPass });
    /* เปิดด่าน → เดินผ่านลอดไม้กั้นไปทางขวา · โดนกัน → หันหลังเดินกลับ */
    timeoutsRef.current.push(window.setTimeout(() => setWalk(letPass ? "pass" : "back"), letPass ? 480 : 650));
    if (letPass) play("gateup"); else play("deny");
    if (ok) {
      play("correct");
      if (mode === "mission") {
        const ns = streak + 1;
        setStreak(ns);
        setBestStreak((b) => Math.max(b, ns));
        if (ns >= 3) play("combo");
        setScore((s) => s + 20 + Math.min(ns, 5) * 5);
      }
    } else {
      play("wrong");
      setStreak(0);
    }
  }

  function proceed() {
    if (mode === "mission") {
      if (round >= MISSIONS_TOTAL) { setGameOver(true); play("star"); return; }
      setRound((r) => r + 1);
    }
    nextTraveler();
  }

  function startMissions() {
    ensure(); play("start");
    setScore(0); setStreak(0); setBestStreak(0); setRound(1); setGameOver(false);
    setRule(randomType());
    setTimeout(() => nextTraveler(), 0);
    setMode("mission");
  }

  const stars = score >= 260 ? 3 : score >= 170 ? 2 : 1;
  const info = TYPE_INFO[rule];

  return (
    <div className="relative overflow-hidden rounded-2xl p-3 sm:p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-100 via-lime-50 to-amber-50" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden text-2xl" aria-hidden>
        <span className="absolute left-4 top-4 opacity-40">🚧</span>
        <span className="absolute right-8 top-7 opacity-40">⛰️</span>
        <span className="absolute bottom-8 right-6 opacity-30">🌳</span>
      </div>

      <div className="relative space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex rounded-xl border-2 border-slate-200 bg-white p-1">
            <button onClick={() => { setMode("lab"); setAnswered(null); }} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "lab" ? "bg-emerald-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <FlaskConical size={15} /> โหมดครู
            </button>
            <button onClick={startMissions} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "mission" ? "bg-lime-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <Target size={15} /> โหมดยามกะเช้า
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowDress((v) => !v)} className={cn("flex items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 text-sm font-extrabold transition", showDress ? "border-violet-400 bg-violet-100 text-violet-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
              <Shirt size={15} /> แต่งตัว
            </button>
            <button onClick={() => setMuted((m) => !m)} className="grid h-9 w-9 place-items-center rounded-xl border-2 border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50" title={muted ? "เปิดเสียง" : "ปิดเสียง"}>
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>
        </div>

        {showDress && <AvatarPicker value={player} onChange={setPlayer} title="ยามด่านของฉัน" />}

        {mode === "mission" && gameOver ? (
          <div className="space-y-4 rounded-2xl border-2 border-lime-300 bg-white/90 p-6 text-center">
            <div className="text-5xl">🚧🏆</div>
            <h3 className="text-xl font-extrabold text-slate-800 sm:text-2xl">หมดกะ! ด่านปลอดภัย</h3>
            <p className="text-2xl">{"⭐".repeat(stars)}{"☆".repeat(3 - stars)}</p>
            <p className="text-base font-extrabold text-lime-700">🏅 คะแนน {score} · 🔥 สตรีคสูงสุด {bestStreak}</p>
            <button onClick={startMissions} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-lime-600 to-emerald-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
              <Play size={18} /> เข้ากะใหม่
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* กติกา + ตั้งค่า */}
            {mode === "lab" ? (
              <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-emerald-200 bg-white/90 px-3 py-2">
                <span className="text-sm font-extrabold text-emerald-700">🧑‍🏫 ตั้งกติกาด่าน:</span>
                {FRAC_TYPES.map((t) => (
                  <button key={t} onClick={() => { setRule(t); nextTraveler(); }} className="rounded-lg border-2 px-2.5 py-1 text-xs font-extrabold transition" style={{ borderColor: TYPE_INFO[t].color, color: TYPE_INFO[t].color, background: rule === t ? TYPE_INFO[t].bg : "#fff" }}>
                    ผ่านเฉพาะ{TYPE_INFO[t].label}
                  </button>
                ))}
                <span className="mx-1 text-slate-300">|</span>
                <span className="text-xs font-extrabold text-slate-500">ส่งคนถือ:</span>
                {FRAC_TYPES.map((t) => (
                  <button key={t} onClick={() => nextTraveler(true, t)} className="rounded-lg border-2 border-slate-200 bg-white px-2 py-1 text-xs font-extrabold text-slate-500 hover:bg-slate-50">{TYPE_INFO[t].label}</button>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 rounded-2xl bg-white/90 px-4 py-2 ring-1 ring-lime-200">
                <span className="text-base font-extrabold text-lime-700">🎯 คนที่ {round}/{MISSIONS_TOTAL}</span>
                <span className="text-base font-extrabold text-emerald-600">🏅 {score}</span>
                <span className={cn("text-base font-extrabold", streak >= 3 ? "text-orange-500" : "text-slate-400")}>🔥 สตรีค {streak}</span>
              </div>
            )}

            {/* ป้ายกติกา */}
            <div className="rounded-2xl border-4 px-4 py-2.5 text-center shadow-sm" style={{ borderColor: info.color, background: info.bg }}>
              <p className="text-lg font-extrabold sm:text-xl" style={{ color: info.color }}>
                📢 กติกาวันนี้: ให้ผ่านเฉพาะ &ldquo;{info.label}&rdquo; เท่านั้น!
              </p>
              <p className="text-xs font-bold text-slate-500">{info.hint}</p>
            </div>

            {/* ฉากด่าน */}
            <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-200 p-3">
              <ThaiBackdrop variant="checkpoint" />
              <div className="relative z-10">
              <style>{`
                @keyframes gtWalkIn { from { transform: translateX(-200px); } to { transform: translateX(0); } }
                .gt-enter { animation: gtWalkIn 1.05s linear both; }
                @keyframes gtPass { 0% { transform: translateX(0); opacity: 1; } 80% { opacity: 1; } 100% { transform: translateX(min(62vw, 460px)); opacity: 0; } }
                .gt-pass { animation: gtPass 1.6s ease-in both; }
                @keyframes gtBack { 0% { transform: translateX(0); opacity: 1; } 80% { opacity: 1; } 100% { transform: translateX(-240px); opacity: 0; } }
                .gt-back { animation: gtBack 1.4s ease-in both; }
              `}</style>
              <div className="flex items-end justify-center gap-4 overflow-hidden">
                {/* นักเดินทาง */}
                <div key={seed} className={cn("relative z-[2] flex flex-col items-center gap-1",
                  walk === "enter" && "gt-enter", walk === "pass" && "gt-pass", walk === "back" && "gt-back")}>
                  <div className="flex items-center gap-1 rounded-xl border-2 border-slate-300 bg-white px-2.5 py-1 shadow-md">
                    {frac.whole > 0 && <span className="text-xl font-black text-slate-800">{frac.whole}</span>}
                    <StackedFraction numerator={frac.num} denominator={frac.den} className="text-base" toneClassName="text-slate-800" />
                  </div>
                  <ThaiAvatar a={traveler} mood={answered ? (answered.gateOpen ? "happy" : "sad") : "normal"} size={140}
                    walking={walk !== "stand"} facing={walk === "back" ? -1 : 1} />
                  <span className="rounded-full bg-slate-700 px-2 py-0.5 text-[11px] font-extrabold text-white">นักเดินทาง</span>
                </div>
                {/* ไม้กั้น */}
                <div className="flex-1 max-w-[300px]">
                  <GateBar open={!!answered?.gateOpen} />
                </div>
                {/* ยาม (ผู้เล่น) */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xl">👮</span>
                  <ThaiAvatar a={player} mood={answered?.ok ? "happy" : "normal"} size={140} />
                  <span className="rounded-full bg-emerald-700 px-2 py-0.5 text-[11px] font-extrabold text-white">ยามด่าน (ฉัน)</span>
                </div>
              </div>

              {/* ปุ่มตัดสิน */}
              {!answered && (
                <div className="mt-3 flex items-center justify-center gap-3">
                  <button onClick={() => judge(true)} className="inline-flex items-center gap-2 rounded-xl border-b-4 border-emerald-700 bg-gradient-to-b from-emerald-500 to-emerald-600 px-7 py-3 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.97] active:border-b-2">
                    <Check size={18} /> ให้ผ่าน!
                  </button>
                  <button onClick={() => judge(false)} className="inline-flex items-center gap-2 rounded-xl border-b-4 border-rose-700 bg-gradient-to-b from-rose-500 to-rose-600 px-7 py-3 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.97] active:border-b-2">
                    <X size={18} /> ไม่ให้ผ่าน
                  </button>
                </div>
              )}
              </div>
            </div>

            {/* ผล */}
            {answered && (
              <div className={cn("rounded-2xl border-2 p-3 text-center", answered.ok ? "border-emerald-300 bg-emerald-50" : "border-rose-300 bg-rose-50")}>
                <p className={cn("flex flex-wrap items-center justify-center gap-1 text-base font-extrabold", answered.ok ? "text-emerald-700" : "text-rose-600")}>
                  {answered.ok ? "🎉 ตัดสินถูก!" : "❌ ตัดสินพลาด —"}{" "}
                  {frac.whole > 0 && <b>{frac.whole}</b>}<StackedFraction numerator={frac.num} denominator={frac.den} className="text-sm" toneClassName="text-current" /> เป็น<b>{TYPE_INFO[classify(frac)].label}</b>
                  {" "}({TYPE_INFO[classify(frac)].hint}) {shouldPass ? "→ ตรงกติกา ต้องให้ผ่าน" : "→ ไม่ตรงกติกา ต้องกันไว้"}
                  {answered.ok && streak >= 3 && mode === "mission" && <span className="text-orange-500"> 🔥 สตรีค {streak}!</span>}
                </p>
                <button onClick={proceed} className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-lime-600 to-emerald-500 px-6 py-2 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                  {mode === "mission" && round >= MISSIONS_TOTAL ? "🏁 ดูสรุปผล" : "คนต่อไป →"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
