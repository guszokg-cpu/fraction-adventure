"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, Volume2, VolumeX, FlaskConical, Target, Eye, EyeOff, ArrowRight, Pencil } from "lucide-react";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { Frac } from "@/components/lessons/Frac";
import { cn } from "@/lib/cn";
import { randInt, shuffle } from "@/lib/randomFraction";

/* ── ค่าคงที่ ── */

const DEN_OPTIONS = [2, 3, 4, 5, 6, 8, 10, 12];
const MISSIONS_TOTAL = 8;

/* ตำแหน่งเดินของตัวละคร "เรา" (% แนวนอนในฉาก) */
const HOME_X = 13, GRAB_X = 34, GIVE_X = 61;

/* เด็กนักเรียน 5 คน */
type Hair = "short" | "ponytail" | "topknot" | "braids" | "bob";
const KIDS = [
  { name: "น้องภูมิ", skin: "#fcd9b8", hair: "#2d2013", hairStyle: "short" as Hair, shirt: "#f8fafc", bottom: "#8a5a2e", accent: "#3b82f6" },
  { name: "น้องแนน", skin: "#ffe0c4", hair: "#3b2412", hairStyle: "ponytail" as Hair, shirt: "#f8fafc", bottom: "#1e3a5f", accent: "#ef4444" },
  { name: "น้องเจได", skin: "#f5cba3", hair: "#1c1c1c", hairStyle: "topknot" as Hair, shirt: "#f8fafc", bottom: "#8a5a2e", accent: "#f59e0b" },
  { name: "น้องพลอย", skin: "#ffd9c9", hair: "#4a2e18", hairStyle: "braids" as Hair, shirt: "#f8fafc", bottom: "#1e3a5f", accent: "#ec4899" },
  { name: "น้องมายด์", skin: "#fbe3cf", hair: "#2b1d10", hairStyle: "bob" as Hair, shirt: "#f8fafc", bottom: "#8a5a2e", accent: "#facc15" },
];
type Kid = typeof KIDS[number];
type Mood = "normal" | "asking" | "yum" | "confused";
type Phase = "idle" | "snapping" | "settled";

/* ── เสียง ── */

type SoundKind = "snap" | "step" | "munch" | "ding" | "correct" | "wrong" | "start" | "star";

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
  function burst(dur: number, gain: number) {
    if (mutedRef.current) return;
    const ctx = ensure();
    if (!ctx) return;
    const n = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, ctx.currentTime);
    src.connect(g).connect(ctx.destination);
    src.start();
  }
  function play(kind: SoundKind) {
    switch (kind) {
      case "snap": return burst(0.06, 0.22);
      case "step": return tones([180, 150], 0.04, 0.04, "square", 0.045);
      case "munch": return tones([300, 260], 0.09, 0.09, "square", 0.07);
      case "ding": return tones([1047, 1319], 0.07, 0.16, "sine", 0.13);
      case "correct": return tones([660, 990, 1319], 0.06, 0.1, "triangle", 0.14);
      case "wrong": return tones([220, 165], 0.11, 0.18, "sawtooth", 0.09);
      case "start": return tones([523, 659, 784], 0.07, 0.12, "triangle", 0.14);
      case "star": return tones([1047, 1319, 1568, 2093], 0.07, 0.14, "triangle", 0.14);
    }
  }
  return { play, ensure };
}

/* ── เพลงขนมหวาน (ชิปทูน ไม่ใช้ไฟล์) ── */

const SW_LEAD = [76, 79, 81, 79, 76, 0, 79, 81, 83, 81, 79, 0, 76, 74, 72, 0, 74, 76, 79, 76, 74, 0, 76, 79, 81, 79, 76, 0, 0, 0, 0, 0];
const SW_BASS = [48, 55, 48, 55, 53, 60, 53, 60, 45, 52, 45, 52, 50, 57, 50, 57];

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
      const m = SW_LEAD[s];
      if (m) note(m, 0.15, "square", 0.028);
      if (s % 2 === 0) {
        const b = SW_BASS[s / 2];
        if (b) note(b, 0.28, "triangle", 0.05);
      }
    }, 180);
  }
  function stop() {
    if (timerRef.current) { window.clearInterval(timerRef.current); timerRef.current = null; }
  }
  useEffect(() => () => { if (timerRef.current) window.clearInterval(timerRef.current); }, []);
  return { start, stop };
}

/* ── ตัวละครเด็กนักเรียน (เดินได้) ── */

function KidChar({ kid, mood, size = 66, facing = 1, walking = false }: { kid: Kid; mood: Mood; size?: number; facing?: 1 | -1; walking?: boolean }) {
  const eyesClosed = mood === "yum";
  const mouthOpen = mood === "asking";
  const confused = mood === "confused";
  return (
    <svg viewBox="0 0 44 62" width={size * 0.71} height={size} className={cn(walking && "kc-bob")} style={{ transform: facing === -1 ? "scaleX(-1)" : undefined }} role="img" aria-label={`เด็กนักเรียน ${kid.name}`}>
      {kid.hairStyle === "ponytail" && <ellipse cx={31} cy={14} rx={5} ry={7} fill={kid.hair} />}
      {kid.hairStyle === "braids" && <><ellipse cx={11} cy={16} rx={3.6} ry={7} fill={kid.hair} /><ellipse cx={33} cy={16} rx={3.6} ry={7} fill={kid.hair} /></>}

      <rect x={12} y={8} width={20} height={17} rx={5} fill={kid.skin} stroke="#00000022" strokeWidth={1} />

      {kid.hairStyle === "short" && <path d="M10,12 Q11,4 22,4 Q33,4 34,12 L34,10 Q30,7 22,7 Q14,7 10,10 Z" fill={kid.hair} />}
      {kid.hairStyle === "ponytail" && <><path d="M10,12 Q11,4 22,4 Q33,4 34,12 L34,9 Q30,6 22,6 Q14,6 10,9 Z" fill={kid.hair} /><rect x={26} y={5} width={4} height={3} rx={1.5} fill="#ef4444" /></>}
      {kid.hairStyle === "topknot" && <><path d="M10,13 Q11,6 22,6 Q33,6 34,13 L34,11 Q30,8.5 22,8.5 Q14,8.5 10,11 Z" fill={kid.hair} /><circle cx={22} cy={3} r={3.4} fill={kid.hair} /></>}
      {kid.hairStyle === "braids" && <path d="M10,12 Q11,4 22,4 Q33,4 34,12 L34,10 Q30,7 22,7 Q14,7 10,10 Z" fill={kid.hair} />}
      {kid.hairStyle === "bob" && <path d="M9.5,15 Q10,4 22,4 Q34,4 34.5,15 L33,15 Q32,8 22,8 Q12,8 11,15 Z" fill={kid.hair} />}
      {kid.hairStyle === "topknot" && <><circle cx={19} cy={16} r={2.6} fill="none" stroke="#334155" strokeWidth={1.1} /><circle cx={25} cy={16} r={2.6} fill="none" stroke="#334155" strokeWidth={1.1} /><line x1={21.6} y1={16} x2={22.4} y2={16} stroke="#334155" strokeWidth={1} /></>}

      {!confused && !eyesClosed && <><rect x={17} y={14.5} width={3} height={4} rx={1} fill="#1e293b" /><rect x={24} y={14.5} width={3} height={4} rx={1} fill="#1e293b" /></>}
      {eyesClosed && <><path d="M16,16 Q18.5,18 21,16" stroke="#1e293b" strokeWidth={1.4} fill="none" strokeLinecap="round" /><path d="M23,16 Q25.5,18 28,16" stroke="#1e293b" strokeWidth={1.4} fill="none" strokeLinecap="round" /></>}
      {confused && <><circle cx={18.5} cy={16} r={1.6} fill="#1e293b" /><circle cx={25.5} cy={17} r={1.6} fill="#1e293b" /></>}
      {mood === "yum" && <><circle cx={15.5} cy={19.5} r={1.8} fill="#fca5a5" opacity={0.7} /><circle cx={28.5} cy={19.5} r={1.8} fill="#fca5a5" opacity={0.7} /></>}

      {mouthOpen
        ? <ellipse cx={22} cy={21} rx={2.6} ry={2.2} fill="#7f1d1d" />
        : confused
          ? <path d="M19,21.5 L25,20.5" stroke="#1e293b" strokeWidth={1.4} strokeLinecap="round" />
          : <path d="M18,20 Q22,22.5 26,20" stroke="#1e293b" strokeWidth={1.5} fill="none" strokeLinecap="round" />}

      <rect x={13} y={25} width={18} height={16} rx={3} fill={kid.shirt} stroke="#cbd5e1" strokeWidth={1.4} />
      <polygon points="20,25 22,29 24,25" fill={kid.accent} />
      <rect x={13} y={38} width={18} height={4} fill={kid.bottom} />

      {/* แขนซ้าย — ยื่นออกตอนขอ/รับ/ถือ */}
      <g style={{ transformOrigin: "10px 27px", transform: mood === "asking" || mood === "yum" ? "rotate(-38deg)" : "rotate(4deg)", transition: "transform 0.35s ease" }}>
        <rect x={6} y={25} width={5} height={13} rx={2.5} fill={kid.shirt} stroke="#cbd5e1" strokeWidth={1.2} />
        <circle cx={7.5} cy={38} r={2.6} fill={kid.skin} />
      </g>
      <g style={{ transformOrigin: "34px 27px", transform: "rotate(-4deg)" }}>
        <rect x={33} y={25} width={5} height={13} rx={2.5} fill={kid.shirt} stroke="#cbd5e1" strokeWidth={1.2} />
        <circle cx={35.5} cy={38} r={2.6} fill={kid.skin} />
      </g>

      {/* ขา (แกว่งตอนเดิน) */}
      <g className={walking ? "kc-leg1" : undefined} style={{ transformOrigin: "17px 41px" }}>
        <rect x={15} y={41} width={5.5} height={14} rx={2} fill={kid.bottom} />
        <rect x={14} y={54} width={7.5} height={4} rx={1.5} fill="#334155" />
      </g>
      <g className={walking ? "kc-leg2" : undefined} style={{ transformOrigin: "26px 41px" }}>
        <rect x={23.5} y={41} width={5.5} height={14} rx={2} fill={kid.bottom} />
        <rect x={22.5} y={54} width={7.5} height={4} rx={1.5} fill="#334155" />
      </g>
    </svg>
  );
}

/* ── บอลลูนคำพูด ── */

function SpeechBubble({ text, tone }: { text: React.ReactNode; tone: string }) {
  return (
    <div className={cn("relative inline-flex items-center gap-1 whitespace-nowrap rounded-xl border-2 bg-white px-2.5 py-1 text-[11px] font-extrabold shadow-sm", tone)}>
      {text}
      <span className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b-2 border-r-2 bg-white" style={{ borderColor: "inherit" }} />
    </div>
  );
}

/* ── ช็อกโกแลตชิ้นเดียว ── */

function ChocoPiece({ w = 22, h }: { w?: number; h?: number }) {
  return (
    <div className="relative rounded-[3px] border-2 border-amber-950" style={{ width: w, height: h ?? w * 1.4, background: "linear-gradient(135deg,#8a5321,#5c3315)" }}>
      <span className="absolute inset-x-[3px] top-[3px] h-[3px] rounded bg-white/25" />
      <span className="absolute inset-x-[3px] top-1/2 h-[2px] rounded bg-black/25" />
    </div>
  );
}

/* ── แท่งช็อกโกแลต (กรอบชัด ช่องว่างเห็นชัด) ── */

function ChocoBar({ den, have }: { den: number; have: number }) {
  return (
    <div className="inline-flex gap-[3px] rounded-lg border-[3px] border-amber-950 bg-amber-950/25 p-1.5 shadow-md">
      {Array.from({ length: den }, (_, i) => {
        const filled = i < have; // เติมจากซ้าย ช่องว่างโผล่ทางขวา
        return filled ? (
          <div key={i} className="relative h-11 w-6 rounded-[3px] border-2 border-amber-950 sm:h-12 sm:w-7" style={{ background: "linear-gradient(135deg,#8a5321,#5c3315)" }}>
            <span className="absolute inset-x-[3px] top-[3px] h-[3px] rounded bg-white/25" />
            <span className="absolute inset-x-[3px] top-1/2 h-[2px] rounded bg-black/25" />
          </div>
        ) : (
          <div key={i} className="h-11 w-6 rounded-[3px] border-2 border-dashed border-amber-700/70 bg-amber-100/50 sm:h-12 sm:w-7" />
        );
      })}
    </div>
  );
}

/* ── จานเพื่อน (สะสมชิ้นที่ได้รับ) ── */

function FriendPlate({ plate, den }: { plate: number; den: number }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-wrap justify-center gap-0.5" style={{ maxWidth: 96, minHeight: 18 }}>
        {Array.from({ length: plate }, (_, i) => <ChocoPiece key={i} w={13} h={17} />)}
      </div>
      <div className="mt-0.5 h-2 w-[76px] rounded-[50%] bg-gradient-to-b from-slate-200 to-slate-300 shadow-inner" />
      <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-extrabold text-orange-700">ได้รับ <Frac n={plate} d={den} /></span>
    </div>
  );
}

/* ── ฉากแบ่งช็อกโกแลต ── */

function ShareScene({ den, have, plate, ask, phase, me, friend, meX, meFacing, walking, carrying }: {
  den: number; have: number; plate: number; ask: number; phase: Phase; me: Kid; friend: Kid;
  meX: number; meFacing: 1 | -1; walking: boolean; carrying: boolean;
}) {
  const meMood: Mood = walking || carrying ? "normal" : phase === "settled" ? "normal" : "asking";
  const friendMood: Mood = plate > 0 ? "yum" : "asking";
  const moveT = walking ? "left 0.38s linear" : "none";
  return (
    <div className="relative h-[214px] overflow-hidden rounded-2xl border-2 border-amber-200 bg-gradient-to-b from-sky-100 via-amber-50 to-orange-100">
      <style>{`
        @keyframes kcBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
        .kc-bob { animation: kcBob 0.3s ease-in-out infinite; }
        @keyframes kcLeg { 0%,100% { transform: rotate(-20deg); } 50% { transform: rotate(20deg); } }
        .kc-leg1 { animation: kcLeg 0.3s ease-in-out infinite; }
        .kc-leg2 { animation: kcLeg 0.3s ease-in-out infinite reverse; }
      `}</style>

      {/* ฉากหลังห้องเรียน */}
      <div className="pointer-events-none absolute left-3 top-2 text-lg opacity-40">🏫</div>
      <div className="pointer-events-none absolute right-3 top-2 text-lg opacity-40">✏️</div>
      {/* พื้นห้อง */}
      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-b from-orange-200/60 to-orange-300/60" />
      <div className="absolute inset-x-0 bottom-8 h-[2px] bg-amber-700/30" />

      {/* โต๊ะวางช็อกโกแลต (กลาง) */}
      <div className="absolute" style={{ left: "41%", bottom: 30, transform: "translateX(-50%)" }}>
        <div className="h-2.5 w-24 rounded bg-gradient-to-b from-amber-600 to-amber-800" />
      </div>

      {/* แท่งช็อกโกแลต + บอลลูน */}
      <div className="absolute z-[2] flex flex-col items-center gap-1" style={{ left: "41%", bottom: 44, transform: "translateX(-50%)" }}>
        {phase === "idle" && <SpeechBubble text={<>ขอ <Frac n={ask} d={den} /> ได้ไหม? 🥺</>} tone="border-sky-300 text-sky-700" />}
        <ChocoBar den={den} have={have} />
        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-800">มีอยู่ <Frac n={have} d={den} /></span>
      </div>

      {/* เพื่อน (ขวา) + จาน */}
      <div className="absolute z-[3] flex flex-col items-center" style={{ left: "83%", bottom: 12, transform: "translateX(-50%)" }}>
        {plate > 0 && <SpeechBubble text="ขอบคุณนะ! 😋" tone="border-emerald-300 text-emerald-700" />}
        <KidChar kid={friend} mood={friendMood} size={62} facing={-1} />
        <span className="text-[11px] font-extrabold text-slate-600">{friend.name}</span>
      </div>
      <div className="absolute z-[2]" style={{ left: "69%", bottom: 20, transform: "translateX(-50%)" }}>
        <FriendPlate plate={plate} den={den} />
      </div>

      {/* เรา (เดินได้) */}
      <div className="absolute z-[4] flex flex-col items-center" style={{ left: `${meX}%`, bottom: 12, transform: "translateX(-50%)", transition: moveT }}>
        <KidChar kid={me} mood={meMood} size={62} facing={meFacing} walking={walking} />
        <span className="text-[11px] font-extrabold text-slate-600">{me.name} (เรา)</span>
      </div>
      {/* ชิ้นที่กำลังถือ */}
      {carrying && (
        <div className="absolute z-[5]" style={{ left: `${meX + (meFacing === 1 ? 4 : -4)}%`, bottom: 52, transform: "translateX(-50%)", transition: moveT }}>
          <ChocoPiece w={16} h={20} />
        </div>
      )}
    </div>
  );
}

/* ── เกมหลัก ── */

export function SubtractChocoGame() {
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

  /* โจทย์ */
  const [den, setDen] = useState(6);
  const [a, setA] = useState(5);
  const [b, setB] = useState(2);
  const [reveal, setReveal] = useState(false);
  const [meIdx, setMeIdx] = useState(0);
  const [friendIdx, setFriendIdx] = useState(1);
  const [names, setNames] = useState<string[]>(() => KIDS.map((k) => k.name));
  const [showNames, setShowNames] = useState(false);

  /* สถานะแบ่งจริง */
  const [have, setHave] = useState(5);
  const [plate, setPlate] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [meX, setMeX] = useState(HOME_X);
  const [meFacing, setMeFacing] = useState<1 | -1>(1);
  const [walking, setWalking] = useState(false);
  const [carrying, setCarrying] = useState(false);
  const timeoutsRef = useRef<number[]>([]);
  useEffect(() => () => timeoutsRef.current.forEach((t) => window.clearTimeout(t)), []);

  /* ภารกิจ */
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [guess, setGuess] = useState(0);
  const [firstTry, setFirstTry] = useState(true);
  const [checked, setChecked] = useState<null | boolean>(null);
  const [gameOver, setGameOver] = useState(false);

  const result = a - b;
  const finalHave = a - b;
  const movable = have - finalHave;
  const done = phase === "settled" && have === finalHave && have !== a;
  const atStart = have === a && phase === "idle";

  function resetLevels(na: number) {
    setHave(na); setPlate(0);
    setPhase("idle"); setCarrying(false); setWalking(false);
    setMeX(HOME_X); setMeFacing(1);
    setChecked(null);
  }
  function setupProblem(nd: number, na: number, nb: number, keepFriend = false) {
    setDen(nd); setA(na); setB(nb);
    resetLevels(na);
    setGuess(0); setFirstTry(true);
    if (!keepFriend) {
      setFriendIdx((prev) => {
        const pool = KIDS.map((_, i) => i).filter((i) => i !== meIdx);
        return shuffle(pool)[0] ?? prev;
      });
    }
  }

  /* เดินไปหยิบช็อกโกแลตไปให้เพื่อนทีละชิ้น */
  function share(n: number, evalGuess = false) {
    if (phase === "snapping") return;
    const moved = Math.min(n, have - finalHave);
    if (moved <= 0) return;
    ensure();
    setPhase("snapping");
    const at = (fn: () => void, ms: number) => timeoutsRef.current.push(window.setTimeout(fn, ms));
    const WALK = 380, GRAB = 160, GIVE = 200;
    let t = 0;
    at(() => { setWalking(true); setMeFacing(1); setMeX(GRAB_X); play("step"); }, t);
    t += WALK;
    for (let i = 0; i < moved; i++) {
      const last = i === moved - 1;
      at(() => { setWalking(false); setCarrying(true); setHave((v) => v - 1); play("snap"); }, t);
      t += GRAB;
      at(() => { setWalking(true); setMeFacing(1); setMeX(GIVE_X); play("step"); }, t);
      t += WALK;
      at(() => { setWalking(false); setCarrying(false); setPlate((v) => v + 1); play("munch"); }, t);
      t += GIVE;
      at(() => { setWalking(true); setMeFacing(-1); setMeX(last ? HOME_X : GRAB_X); }, t);
      t += WALK;
    }
    at(() => {
      setWalking(false); setMeFacing(1);
      setPhase("settled");
      play("ding");
      if (evalGuess) {
        const ok = guess === result;
        setChecked(ok);
        if (ok) { play("correct"); setScore((s) => s + (firstTry ? 25 : 12)); }
        else play("wrong");
      }
    }, t);
  }

  /* ภารกิจ flow */
  function randomProblem(): [number, number, number] {
    const nd = DEN_OPTIONS[randInt(1, DEN_OPTIONS.length - 2)];
    const na = randInt(2, nd);
    const allowZero = randInt(1, 5) === 1; // ~1 ใน 5 ข้อ ให้แบ่งหมดแท่งได้
    const nb = allowZero ? na : randInt(1, na - 1) || na;
    return [nd, na, Math.min(nb, na)];
  }
  function startMissions() {
    ensure(); play("start");
    setScore(0); setRound(1); setGameOver(false);
    setupProblem(6, 5, 2);
    setMode("mission");
  }
  function nextMission() {
    if (round >= MISSIONS_TOTAL) { setGameOver(true); play("star"); return; }
    setRound((r) => r + 1);
    const [nd, na, nb] = randomProblem();
    setupProblem(nd, na, nb);
  }

  const stars = score >= 170 ? 3 : score >= 100 ? 2 : 1;
  const me: Kid = { ...KIDS[meIdx], name: names[meIdx] };
  const friend: Kid = { ...KIDS[friendIdx], name: names[friendIdx] };

  return (
    <div className="relative overflow-hidden rounded-2xl p-3 sm:p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-50" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden text-2xl" aria-hidden>
        <span className="absolute left-4 top-5 opacity-40">🍫</span>
        <span className="absolute right-8 top-8 opacity-40">🏫</span>
        <span className="absolute bottom-8 left-8 opacity-30">🎒</span>
        <span className="absolute right-4 top-24 opacity-30">✏️</span>
      </div>

      <div className="relative space-y-3">
        {/* โหมด + ปิดเสียง */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex rounded-xl border-2 border-slate-200 bg-white p-1">
            <button onClick={() => { setMode("lab"); resetLevels(a); }} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "lab" ? "bg-amber-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <FlaskConical size={15} /> โหมดครู
            </button>
            <button onClick={startMissions} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition", mode === "mission" ? "bg-orange-600 text-white shadow" : "text-slate-500 hover:bg-slate-50")}>
              <Target size={15} /> แบ่งปันที่โรงเรียน
            </button>
          </div>
          <button onClick={() => setMuted((m) => !m)} className="grid h-9 w-9 place-items-center rounded-xl border-2 border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50" title={muted ? "เปิดเสียง" : "ปิดเสียง"}>
            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>

        {mode === "mission" && gameOver ? (
          <div className="space-y-4 rounded-2xl border-2 border-orange-300 bg-white/90 p-6 text-center">
            <div className="text-5xl">🍫🏆</div>
            <h3 className="text-xl font-extrabold text-slate-800 sm:text-2xl">แบ่งปันครบทุกคนแล้ว!</h3>
            <div className="flex flex-wrap justify-center gap-1.5">
              {KIDS.map((k, i) => <KidChar key={i} kid={{ ...k, name: names[i] }} mood="yum" size={44} />)}
            </div>
            <p className="text-2xl">{"⭐".repeat(stars)}{"☆".repeat(3 - stars)}</p>
            <p className="text-base font-extrabold text-orange-700">🏅 คะแนนรวม {score}</p>
            <button onClick={startMissions} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
              <Play size={18} /> เล่นอีกครั้ง
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* แถบตั้งค่า (ครู) / สถานะ (ภารกิจ) */}
            {mode === "lab" ? (
              <div className="space-y-2 rounded-2xl border-2 border-amber-200 bg-white/90 px-3 py-2">
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
                  <span className="text-sm font-extrabold text-amber-700">🧑‍🏫 ตั้งโจทย์:</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-slate-500">มีอยู่</span>
                    <button onClick={() => setupProblem(den, Math.max(1, a - 1), Math.min(b, a - 1), true)} className="h-8 w-8 rounded-lg border-2 border-slate-200 bg-white text-lg font-extrabold text-slate-600 hover:bg-slate-50 active:scale-95">−</button>
                    <span className="w-8 text-center text-2xl font-extrabold text-amber-700">{a}</span>
                    <button onClick={() => setupProblem(den, Math.min(den, a + 1), b, true)} className="h-8 w-8 rounded-lg border-2 border-slate-200 bg-white text-lg font-extrabold text-slate-600 hover:bg-slate-50 active:scale-95">+</button>
                  </div>
                  <span className="text-xl font-black text-slate-400">−</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-extrabold text-slate-500">แบ่งให้</span>
                    <button onClick={() => setupProblem(den, a, Math.max(0, b - 1), true)} className="h-8 w-8 rounded-lg border-2 border-slate-200 bg-white text-lg font-extrabold text-slate-600 hover:bg-slate-50 active:scale-95">−</button>
                    <span className="w-8 text-center text-2xl font-extrabold text-rose-500">{b}</span>
                    <button onClick={() => setupProblem(den, a, Math.min(a, b + 1), true)} className="h-8 w-8 rounded-lg border-2 border-slate-200 bg-white text-lg font-extrabold text-slate-600 hover:bg-slate-50 active:scale-95">+</button>
                  </div>
                  <span className="mx-1 text-slate-300">|</span>
                  <span className="text-xs font-extrabold text-slate-500">ช่อง (ตัวส่วน)</span>
                  {DEN_OPTIONS.map((d) => (
                    <button key={d} onClick={() => setupProblem(d, Math.min(a, d), Math.min(b, Math.min(a, d)), true)} className={cn("h-7 w-7 rounded-lg border-2 text-sm font-extrabold transition", den === d ? "border-amber-500 bg-amber-100 text-amber-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>{d}</button>
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button onClick={() => setReveal((v) => !v)} className={cn("flex items-center gap-1 rounded-lg border-2 px-2 py-1 text-xs font-extrabold transition", reveal ? "border-violet-400 bg-violet-100 text-violet-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
                    {reveal ? <EyeOff size={13} /> : <Eye size={13} />} เฉลย
                  </button>
                  <button onClick={() => setShowNames((v) => !v)} className={cn("flex items-center gap-1 rounded-lg border-2 px-2 py-1 text-xs font-extrabold transition", showNames ? "border-sky-400 bg-sky-100 text-sky-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
                    <Pencil size={12} /> แก้ชื่อ
                  </button>
                  <span className="mx-1 text-slate-300">|</span>
                  <span className="text-xs font-extrabold text-slate-500">เรา:</span>
                  {KIDS.map((k, i) => (
                    <button key={i} onClick={() => setMeIdx(i)} disabled={i === friendIdx} className={cn("rounded-lg border-2 p-0.5 transition disabled:cursor-not-allowed disabled:opacity-30", meIdx === i ? "border-amber-400 bg-amber-50" : "border-slate-200 bg-white")}>
                      <KidChar kid={{ ...k, name: names[i] }} mood="normal" size={26} />
                    </button>
                  ))}
                  <span className="mx-1 text-slate-300">|</span>
                  <span className="text-xs font-extrabold text-slate-500">เพื่อน:</span>
                  {KIDS.map((k, i) => (
                    <button key={i} onClick={() => setFriendIdx(i)} disabled={i === meIdx} className={cn("rounded-lg border-2 p-0.5 transition disabled:cursor-not-allowed disabled:opacity-30", friendIdx === i ? "border-orange-400 bg-orange-50" : "border-slate-200 bg-white")}>
                      <KidChar kid={{ ...k, name: names[i] }} mood="normal" size={26} />
                    </button>
                  ))}
                </div>
                {showNames && (
                  <div className="flex flex-wrap items-center justify-center gap-2 border-t border-slate-100 pt-1.5">
                    <span className="text-xs font-extrabold text-sky-700">✏️ ตั้งชื่อเอง:</span>
                    {KIDS.map((k, i) => (
                      <input
                        key={i}
                        value={names[i]}
                        maxLength={12}
                        onChange={(e) => setNames((ns) => { const nn = [...ns]; nn[i] = e.target.value; return nn; })}
                        className="w-20 rounded-lg border-2 border-slate-200 bg-white px-2 py-1 text-xs font-extrabold text-slate-700 focus:border-sky-400 focus:outline-none"
                      />
                    ))}
                    <button onClick={() => setNames(KIDS.map((kk) => kk.name))} className="rounded-lg border-2 border-slate-200 bg-white px-2 py-1 text-xs font-extrabold text-slate-500 hover:bg-slate-50">คืนค่าเดิม</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 rounded-2xl bg-white/90 px-4 py-2 ring-1 ring-orange-200">
                <span className="text-base font-extrabold text-orange-700">🎒 ข้อ {round}/{MISSIONS_TOTAL}</span>
                <span className="text-base font-extrabold text-amber-600">🏅 {score}</span>
                <span className="text-xs font-extrabold text-slate-500">ทายผลก่อน แล้วหักแบ่งพิสูจน์!</span>
              </div>
            )}

            {/* สมการใหญ่ */}
            <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-amber-200 bg-white/95 px-5 py-2.5 shadow-sm">
              <StackedFraction numerator={a} denominator={den} className="text-3xl sm:text-4xl" toneClassName="text-amber-700" />
              <span className="text-3xl font-black text-slate-400">−</span>
              <StackedFraction numerator={b} denominator={den} className="text-3xl sm:text-4xl" toneClassName="text-rose-500" />
              <span className="text-3xl font-black text-slate-400">=</span>
              {done || (mode === "lab" && reveal) ? (
                <StackedFraction numerator={result} denominator={den} className="text-3xl sm:text-4xl" toneClassName={done ? "text-orange-600" : "text-violet-500"} />
              ) : (
                <span className="grid h-12 w-12 place-items-center rounded-xl border-[3px] border-dashed border-amber-300 text-2xl font-black text-amber-400">?</span>
              )}
            </div>

            {/* ฉากแบ่งช็อกโกแลต */}
            <ShareScene den={den} have={have} plate={plate} ask={b} phase={phase} me={me} friend={friend} meX={meX} meFacing={meFacing} walking={walking} carrying={carrying} />

            {/* คำอธิบายผล */}
            {done && (
              <p className="flex flex-wrap items-center justify-center gap-1 text-center text-sm font-extrabold text-slate-600">
                {result === 0
                  ? <>แบ่งหมดแท่งให้ {friend.name}! เหลือ <Frac n={0} d={den} tone="text-rose-600" /> — ใจดีที่สุด! 💝</>
                  : <>แบ่งให้ {friend.name} ไป <Frac n={b} d={den} tone="text-rose-500" /> เหลือ <Frac n={result} d={den} tone="text-orange-600" /> — ช่องแท่งไม่เปลี่ยน (ตัวส่วนเท่าเดิม) เอาแค่ตัวเศษมาลบกัน!</>}
              </p>
            )}

            {/* โหมดทายก่อนหัก */}
            {mode === "mission" && atStart && (
              <div className="space-y-2 rounded-2xl border-2 border-orange-200 bg-white/90 p-3">
                <p className="text-center text-sm font-extrabold text-slate-600">🤔 ทายก่อน: แบ่งให้ {friend.name} แล้วจะเหลือกี่ชิ้น?</p>
                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => setGuess((g) => Math.max(0, g - 1))} className="h-9 w-9 rounded-lg border-2 border-slate-200 bg-white text-lg font-extrabold text-slate-600 active:scale-95">−</button>
                  <span className="inline-flex flex-col items-center rounded-xl border-2 border-orange-300 bg-white px-4 py-1">
                    <span className="text-2xl font-extrabold text-orange-600">{guess}</span>
                    <span className="h-[3px] w-8 rounded bg-orange-600" />
                    <span className="text-2xl font-extrabold text-slate-400">{den}</span>
                  </span>
                  <button onClick={() => setGuess((g) => Math.min(den, g + 1))} className="h-9 w-9 rounded-lg border-2 border-slate-200 bg-white text-lg font-extrabold text-slate-600 active:scale-95">+</button>
                  <button onClick={() => { setFirstTry(true); share(b, true); }} className="ml-3 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-2.5 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                    🍫 หักแบ่งพิสูจน์!
                  </button>
                </div>
              </div>
            )}

            {/* ผลทาย */}
            {mode === "mission" && checked !== null && (
              <div className={cn("rounded-2xl border-2 p-3 text-center", checked ? "border-emerald-300 bg-emerald-50" : "border-rose-300 bg-rose-50")}>
                <p className={cn("flex flex-wrap items-center justify-center gap-1 text-base font-extrabold", checked ? "text-emerald-700" : "text-rose-600")}>
                  {checked ? <>🎉 ทายถูก! <Frac n={a} d={den} /> − <Frac n={b} d={den} /> = <Frac n={result} d={den} /></> : <>ทาย <Frac n={guess} d={den} /> แต่เหลือจริง <Frac n={result} d={den} /> — {guess === a + b ? "นี่คือการบวก! เราแบ่งให้เพื่อนนะ" : guess === b ? "นั่นคือชิ้นที่ให้เพื่อนไป ไม่ใช่ที่เหลือ" : "ลองข้อต่อไป!"}</>}
                </p>
                <button onClick={nextMission} className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-2 text-base font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.98]">
                  {round >= MISSIONS_TOTAL ? "🏁 ดูสรุปผล" : <>ข้อต่อไป <ArrowRight size={16} /></>}
                </button>
              </div>
            )}

            {/* ปุ่มควบคุมการหักแบ่ง (โหมดครู) */}
            {mode === "lab" && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                {phase === "snapping" ? (
                  <span className="text-sm font-extrabold text-slate-500">🚶 กำลังเดินไปแบ่ง…</span>
                ) : movable > 0 ? (
                  <>
                    <button onClick={() => share(movable)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 px-6 py-2.5 text-base font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
                      🍫 หักแบ่งทั้งหมด
                    </button>
                    <button onClick={() => share(1)} className="inline-flex items-center gap-1.5 rounded-xl border-b-4 border-amber-700 bg-gradient-to-b from-amber-500 to-amber-600 px-4 py-2 text-sm font-extrabold text-white shadow transition hover:brightness-105 active:scale-[0.97] active:border-b-2">
                      ▶ เดินไปแบ่งทีละชิ้น
                    </button>
                    {have !== a && (
                      <button onClick={() => resetLevels(a)} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-3 py-1.5 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50">
                        <RotateCcw size={14} /> เอาคืน
                      </button>
                    )}
                  </>
                ) : (
                  <button onClick={() => resetLevels(a)} className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-5 py-2 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50">
                    <RotateCcw size={15} /> เอาคืน (เริ่มใหม่)
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
