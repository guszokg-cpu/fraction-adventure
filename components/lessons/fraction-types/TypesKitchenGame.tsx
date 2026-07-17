"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Volume2, VolumeX, FlaskConical, Target, ArrowRight, Shirt } from "lucide-react";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { ThaiAvatar, AvatarPicker, usePlayerAvatar, randomAvatar } from "@/components/avatar/ThaiAvatar";
import { FRAC_TYPES, TYPE_INFO, makeFraction, randomType, classify, type FracType, type TypedFraction } from "@/lib/fractionTypes";
import { ThaiBackdrop } from "@/components/games/ThaiScenery";
import { cn } from "@/lib/cn";
import { randInt, shuffle } from "@/lib/randomFraction";

/* ─────────────────────────────────────────────
   ครัวคุณป้าเศษส่วน 🍜
   ลูกค้า (จิบิไทยสุ่มหน้าตา) สั่ง "ขอเมนูเศษส่วนแท้ 1 ชาม!"
   เด็กเป็นผู้ช่วยเชฟ (แต่งตัวได้) เลือกเสิร์ฟชามที่ป้ายตรงประเภท
   ───────────────────────────────────────────── */

const MISSIONS_TOTAL = 8;
const BOWLS = 4;

type SoundKind = "order" | "serve" | "slurp" | "correct" | "wrong" | "start" | "star";

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
      case "order": return tones([659, 784], 0.07, 0.11, "triangle", 0.09);
      case "serve": return tones([523, 659, 784], 0.05, 0.09, "triangle", 0.1);
      case "slurp": return tones([300, 380, 300], 0.06, 0.08, "sine", 0.06);
      case "correct": return tones([660, 990, 1319], 0.06, 0.1, "triangle", 0.14);
      case "wrong": return tones([220, 165], 0.11, 0.18, "sawtooth", 0.09);
      case "start": return tones([523, 659, 784], 0.07, 0.12, "triangle", 0.14);
      case "star": return tones([1047, 1319, 1568, 2093], 0.07, 0.14, "triangle", 0.14);
    }
  }
  return { play, ensure };
}

/* เพลงร้านอาหารไทย */
const KT_LEAD = [64, 66, 69, 0, 71, 69, 66, 0, 64, 66, 69, 71, 74, 0, 71, 0, 76, 74, 71, 0, 69, 66, 64, 0, 66, 69, 71, 69, 64, 0, 0, 0];
const KT_BASS = [40, 47, 45, 52, 47, 54, 45, 52, 40, 47, 45, 52, 47, 52, 47, 40];

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
      const m = KT_LEAD[s];
      if (m) note(m, 0.2, "triangle", 0.028);
      if (s % 2 === 0) {
        const b = KT_BASS[s / 2];
        if (b) note(b, 0.32, "sine", 0.05);
      }
    }, 210);
  }
  function stop() { if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; } }
  useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);
  return { start, stop };
}

/* ── ชามก๋วยเตี๋ยว + ป้ายเศษส่วน ── */
function NoodleBowl({ f, state }: { f: TypedFraction; state: "idle" | "right" | "wrong" | "dim" }) {
  return (
    <div className={cn("flex flex-col items-center gap-1 transition", state === "dim" && "opacity-40", state === "right" && "kt-serve")}>
      <svg viewBox="0 0 90 62" width={104} height={72} role="img" aria-label="ชามก๋วยเตี๋ยว" style={{ overflow: "visible" }}>
        {state === "right" && <circle cx={45} cy={30} r={28} fill="none" stroke="#facc15" strokeWidth={4} opacity={0.9} />}
        {/* ไอน้ำลอยขึ้นจริง */}
        <path className="kt-steam" d="M32,14 Q29,8 33,3" stroke="#cbd5e1" strokeWidth={2.4} fill="none" strokeLinecap="round" />
        <path className="kt-steam" d="M45,14 Q42,7 46,1" stroke="#cbd5e1" strokeWidth={2.4} fill="none" strokeLinecap="round" style={{ animationDelay: "0.5s" }} />
        <path className="kt-steam" d="M58,14 Q55,8 59,3" stroke="#cbd5e1" strokeWidth={2.4} fill="none" strokeLinecap="round" style={{ animationDelay: "1s" }} />
        {/* เส้น+ลูกชิ้น */}
        <ellipse cx={45} cy={26} rx={26} ry={7} fill="#f8d49a" />
        <circle cx={34} cy={23} r={4.5} fill="#c98a5a" /><circle cx={50} cy={22} r={4.5} fill="#c98a5a" />
        <path d="M58,21 q4,2 3,6" stroke="#3f9e4f" strokeWidth={2.4} fill="none" strokeLinecap="round" />
        {/* ชาม */}
        <path d="M17,26 Q17,52 45,52 Q73,52 73,26 Z" fill={state === "wrong" ? "#fda4af" : "#e35d6a"} stroke="#a83240" strokeWidth={2} />
        <path d="M22,33 Q45,40 68,33" stroke="#ffffff66" strokeWidth={3} fill="none" />
        <rect x={36} y={52} width={18} height={5} rx={2} fill="#a83240" />
      </svg>
      <div className="flex items-center gap-1 rounded-lg border-2 border-amber-300 bg-white px-2 py-0.5 shadow-sm">
        {f.whole > 0 && <span className="text-lg font-black text-slate-800">{f.whole}</span>}
        <StackedFraction numerator={f.num} denominator={f.den} className="text-sm" toneClassName="text-slate-800" />
      </div>
    </div>
  );
}

function makeBowls(order: FracType): TypedFraction[] {
  /* 1 ชามถูกประเภท + ชามลวงประเภทอื่นผสม */
  const others = FRAC_TYPES.filter((t) => t !== order);
  const bowls: TypedFraction[] = [makeFraction(order)];
  for (let i = 1; i < BOWLS; i++) bowls.push(makeFraction(others[i % others.length]));
  return shuffle(bowls);
}

export function TypesKitchenGame() {
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

  const [order, setOrder] = useState<FracType>("proper");
  const [bowls, setBowls] = useState<TypedFraction[]>(() => makeBowls("proper"));
  const [seed, setSeed] = useState(() => randInt(1, 9999));
  const [picked, setPicked] = useState<number | null>(null);
  const [entering, setEntering] = useState(true);   // ลูกค้าเดินเข้าร้าน
  const enterTimer = useRef<number | null>(null);
  useEffect(() => {
    setEntering(true);
    if (enterTimer.current) window.clearTimeout(enterTimer.current);
    enterTimer.current = window.setTimeout(() => setEntering(false), 1000);
    return () => { if (enterTimer.current) window.clearTimeout(enterTimer.current); };
  }, [seed]);
  const customer = randomAvatar(seed);

  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [firstTry, setFirstTry] = useState(true);
  const [gameOver, setGameOver] = useState(false);

  const solved = picked !== null && classify(bowls[picked]) === order;

  function newOrder(t?: FracType) {
    const nt = t ?? randomType();
    setOrder(nt);
    setBowls(makeBowls(nt));
    setSeed(randInt(1, 99999));
    setPicked(null);
    setFirstTry(true);
    ensure(); play("order");
  }

  function serve(i: number) {
    if (solved || entering) return;
    ensure();
    setPicked(i);
    if (classify(bowls[i]) === order) {
      play("serve"); play("correct"); play("slurp");
      if (mode === "mission") setScore((s) => s + (firstTry ? 25 : 10));
    } else {
      play("wrong");
      setFirstTry(false);
    }
  }

  function startMissions() {
    ensure(); play("start");
    setScore(0); setRound(1); setGameOver(false);
    newOrder();
    setMode("mission");
  }
  function nextMission() {
    if (round >= MISSIONS_TOTAL) { setGameOver(true); play("star"); return; }
    setRound((r) => r + 1);
    newOrder();
  }

  const stars = score >= 170 ? 3 : score >= 100 ? 2 : 1;
  const info = TYPE_INFO[order];

  return (
    <div className="relative overflow-hidden rounded-2xl p-3 sm:p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-rose-100 via-amber-50 to-yellow-50" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden text-2xl" aria-hidden>
        <span className="absolute left-4 top-4 opacity-40">🍜</span>
        <span className="absolute right-8 top-7 opacity-40">🥢</span>
        <span className="absolute bottom-8 right-6 opacity-30">🌶️</span>
      </div>

      <div className="relative space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex rounded-xl border-2 border-slate-200 bg-white p-1">
            <button onClick={() => { setMode("lab"); newOrder(order); }} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "lab" ? "bg-rose-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <FlaskConical size={15} /> โหมดครู
            </button>
            <button onClick={startMissions} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "mission" ? "bg-amber-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <Target size={15} /> โหมดผู้ช่วยเชฟ
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

        {showDress && <AvatarPicker value={player} onChange={setPlayer} title="ผู้ช่วยเชฟของฉัน" />}

        {mode === "mission" && gameOver ? (
          <div className="space-y-4 rounded-2xl border-2 border-amber-300 bg-white/90 p-6 text-center">
            <div className="text-5xl">🍜🏆</div>
            <h3 className="text-xl font-extrabold text-slate-800 sm:text-2xl">ปิดร้าน ลูกค้าอิ่มทุกคน!</h3>
            <p className="text-2xl">{"⭐".repeat(stars)}{"☆".repeat(3 - stars)}</p>
            <p className="text-base font-extrabold text-amber-700">🏅 คะแนนรวม {score}</p>
            <button onClick={startMissions} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-rose-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
              <Play size={18} /> เปิดร้านใหม่
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* ตั้งค่า / สถานะ */}
            {mode === "lab" ? (
              <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border-2 border-rose-200 bg-white/90 px-3 py-2">
                <span className="text-sm font-extrabold text-rose-700">🧑‍🏫 ให้ลูกค้าสั่ง:</span>
                {FRAC_TYPES.map((t) => (
                  <button key={t} onClick={() => newOrder(t)} className="rounded-lg border-2 px-2.5 py-1 text-xs font-extrabold transition" style={{ borderColor: TYPE_INFO[t].color, color: TYPE_INFO[t].color, background: order === t && picked === null ? TYPE_INFO[t].bg : "#fff" }}>
                    {TYPE_INFO[t].label}
                  </button>
                ))}
                <button onClick={() => newOrder()} className="rounded-lg border-2 border-slate-200 bg-white px-2.5 py-1 text-xs font-extrabold text-slate-500 hover:bg-slate-50">🎲 สุ่ม</button>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 rounded-2xl bg-white/90 px-4 py-2 ring-1 ring-amber-200">
                <span className="text-base font-extrabold text-amber-700">🛎️ ลูกค้าที่ {round}/{MISSIONS_TOTAL}</span>
                <span className="text-base font-extrabold text-rose-600">🏅 {score}</span>
              </div>
            )}

            {/* ฉาก: ลูกค้าสั่ง + ผู้ช่วยเชฟ */}
            <div className="relative overflow-hidden rounded-2xl border-2 border-rose-200 p-3">
              <ThaiBackdrop variant="noodle" />
              <div className="relative z-10">
              <style>{`
                @keyframes ktWalkIn { from { transform: translateX(-160px); } to { transform: translateX(0); } }
                .kt-walkin { animation: ktWalkIn 1s linear both; }
                @keyframes ktSteam { 0% { opacity: 0; transform: translateY(4px) scaleY(0.7); } 40% { opacity: 0.8; } 100% { opacity: 0; transform: translateY(-14px) scaleY(1.2); } }
                .kt-steam { animation: ktSteam 1.5s ease-out infinite; }
                @keyframes ktServe { 0% { transform: translateY(-16px) scale(0.7); } 60% { transform: translateY(3px) scale(1.08); } 100% { transform: translateY(0) scale(1); } }
                .kt-serve { animation: ktServe 0.4s cubic-bezier(.4,1.5,.5,1) both; }
              `}</style>
              <div className="flex items-end justify-center gap-8 overflow-hidden">
                <div key={seed} className={cn("flex flex-col items-center gap-1", entering && "kt-walkin")}>
                  <div className="rounded-xl border-2 bg-white px-3 py-1.5 text-sm font-extrabold shadow-md" style={{ borderColor: info.color, color: info.color }}>
                    {entering ? "เดินเข้ามา…" : <>ขอเมนู &ldquo;{info.label}&rdquo; 1 ชามครับ! 🙏</>}
                  </div>
                  <ThaiAvatar a={customer} mood={solved ? "happy" : "normal"} size={150} walking={entering} />
                  <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[11px] font-extrabold text-white">ลูกค้า</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl">👨‍🍳</span>
                  <ThaiAvatar a={player} mood={solved ? "happy" : "normal"} size={150} />
                  <span className="rounded-full bg-amber-600 px-2 py-0.5 text-[11px] font-extrabold text-white">ผู้ช่วยเชฟ (ฉัน)</span>
                </div>
              </div>

              {/* เคาน์เตอร์ชาม */}
              <div className="mt-2 rounded-xl bg-gradient-to-b from-amber-800/80 to-amber-900/80 p-2">
                <div className="grid grid-cols-4 gap-1.5">
                  {bowls.map((b, i) => {
                    const state = solved && classify(b) === order && picked === i ? "right"
                      : picked === i && classify(b) !== order ? "wrong"
                      : solved ? "dim" : "idle";
                    return (
                      <button key={i} onClick={() => serve(i)} disabled={solved}
                        className={cn("rounded-xl p-1 transition", state === "idle" && "hover:bg-white/10 active:scale-95")}>
                        <NoodleBowl f={b} state={state} />
                      </button>
                    );
                  })}
                </div>
              </div>
              </div>
            </div>

            {/* ผล */}
            {picked !== null && (
              <div className={cn("rounded-2xl border-2 p-3 text-center", solved ? "border-emerald-300 bg-emerald-50" : "border-rose-300 bg-rose-50")}>
                <p className={cn("flex flex-wrap items-center justify-center gap-1 text-base font-extrabold", solved ? "text-emerald-700" : "text-rose-600")}>
                  {solved
                    ? <>🎉 เสิร์ฟถูก! ชามนี้เป็น<b>{info.label}</b> — {info.hint} ลูกค้าซดหมดชาม!</>
                    : <>ชามนั้นเป็น <b>{TYPE_INFO[classify(bowls[picked])].label}</b> ({TYPE_INFO[classify(bowls[picked])].hint}) ไม่ตรงออเดอร์ &ldquo;{info.label}&rdquo; ลองใหม่!</>}
                </p>
                {solved && (
                  mode === "mission" ? (
                    <button onClick={nextMission} className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-rose-500 px-6 py-2 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                      {round >= MISSIONS_TOTAL ? "🏁 ดูสรุปผล" : <>ลูกค้าคนต่อไป <ArrowRight size={16} /></>}
                    </button>
                  ) : (
                    <button onClick={() => newOrder()} className="mt-2 inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-5 py-2 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50">
                      🛎️ ออเดอร์ใหม่
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
