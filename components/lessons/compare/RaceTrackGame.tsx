"use client";

import { useEffect, useRef, useState } from "react";
import { Flag, Play, Pause, RotateCcw, Shuffle, Volume2, VolumeX, FlaskConical, Trophy, Plus, Trash2, Upload, Maximize2, X, Eye } from "lucide-react";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { cn } from "@/lib/cn";
import { randInt } from "@/lib/randomFraction";

/* ── ข้อมูลนักวิ่ง ── */

/** ตัวการ์ตูนแต่งเองได้: สีผิว / ทรงผม+สีผม / สีเสื้อ (export ให้เกมอื่นใช้ซ้ำ) */
export type Custom = { skin: string; hair: HairStyle; hairColor: string; shirt: string };
type HairStyle = "short" | "long" | "buns" | "spiky" | "bob" | "curly";

type Racer = { id: number; avatar: string; img: string | null; custom: Custom | null; name: string; num: number; den: number };
type Winner = "r1" | "r2" | "equal";

const SKINS = ["#fcd7b8", "#f3b98c", "#d99a6c", "#8d5a3b"];
const HAIR_COLORS = ["#1f2937", "#5b3a1e", "#a16207", "#dc2626", "#7c3aed", "#0ea5e9"];
const SHIRT_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#0ea5e9", "#8b5cf6", "#ec4899", "#334155"];
const HAIR_STYLES: { id: HairStyle; label: string }[] = [
  { id: "short", label: "สั้น" },
  { id: "long", label: "ยาว" },
  { id: "buns", label: "จุกคู่" },
  { id: "spiky", label: "ชี้ฟู" },
  { id: "bob", label: "บ๊อบ" },
  { id: "curly", label: "หยิก" },
];

function defaultCustom(i: number): Custom {
  return { skin: SKINS[i % SKINS.length], hair: HAIR_STYLES[i % HAIR_STYLES.length].id, hairColor: HAIR_COLORS[i % HAIR_COLORS.length], shirt: SHIRT_COLORS[i % SHIRT_COLORS.length] };
}

const AVATARS = ["🏃‍♂️", "🏃‍♀️", "👦", "👧", "🦸‍♂️", "🦸‍♀️", "🧒", "🐢", "🐰", "🚗", "🏎️", "🦊"];
const DEN_CHOICES = [2, 3, 4, 5, 6, 8, 10];
const DISTANCE_PRESETS = [50, 100, 200, 400];
const MAX_DEN = 12;
const MAX_RACERS = 6;

const TONES = [
  { text: "text-sky-700", chip: "bg-sky-100 text-sky-700", card: "border-sky-200 bg-sky-50/60", btn: "bg-sky-500 hover:bg-sky-600", lane: "border-sky-300 from-sky-200 to-sky-300" },
  { text: "text-rose-700", chip: "bg-rose-100 text-rose-700", card: "border-rose-200 bg-rose-50/60", btn: "bg-rose-500 hover:bg-rose-600", lane: "border-rose-300 from-rose-200 to-rose-300" },
  { text: "text-emerald-700", chip: "bg-emerald-100 text-emerald-700", card: "border-emerald-200 bg-emerald-50/60", btn: "bg-emerald-500 hover:bg-emerald-600", lane: "border-emerald-300 from-emerald-200 to-emerald-300" },
  { text: "text-amber-700", chip: "bg-amber-100 text-amber-700", card: "border-amber-200 bg-amber-50/60", btn: "bg-amber-500 hover:bg-amber-600", lane: "border-amber-300 from-amber-200 to-amber-300" },
  { text: "text-violet-700", chip: "bg-violet-100 text-violet-700", card: "border-violet-200 bg-violet-50/60", btn: "bg-violet-500 hover:bg-violet-600", lane: "border-violet-300 from-violet-200 to-violet-300" },
  { text: "text-cyan-700", chip: "bg-cyan-100 text-cyan-700", card: "border-cyan-200 bg-cyan-50/60", btn: "bg-cyan-500 hover:bg-cyan-600", lane: "border-cyan-300 from-cyan-200 to-cyan-300" },
];

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(1));
const distOf = (r: Racer, total: number) => (r.num / r.den) * total;
const pctOf = (r: Racer) => Math.min(100, (r.num / r.den) * 100);

function compareFractions(a: Racer, b: Racer): Winner {
  const l = a.num * b.den;
  const r = b.num * a.den;
  if (l > r) return "r1";
  if (l < r) return "r2";
  return "equal";
}

function randomFrac() {
  const den = DEN_CHOICES[randInt(0, DEN_CHOICES.length - 1)];
  return { num: randInt(1, den), den };
}

let racerSeq = 100;
function newRacer(i: number): Racer {
  const names = ["นักวิ่งฟ้า", "นักวิ่งชมพู", "นักวิ่งเขียว", "นักวิ่งส้ม", "นักวิ่งม่วง", "นักวิ่งฟ้าคราม"];
  const av = ["🏃‍♂️", "🏃‍♀️", "🧒", "🦸‍♂️", "🦸‍♀️", "🦊"];
  const f = randomFrac();
  return { id: racerSeq++, avatar: av[i % av.length], img: null, custom: defaultCustom(i), name: names[i % names.length], num: i === 0 ? 2 : i === 1 ? 3 : f.num, den: 5 };
}

/* ── ระบบเสียง ── */

type SoundKind = "whistle" | "cheer" | "correct" | "wrong" | "combo";

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
      case "whistle": return tones([1568, 1976, 1568], 0.06, 0.12, "triangle", 0.13);
      case "cheer": return tones([523, 659, 784, 1047, 1319, 1568], 0.09, 0.15, "triangle", 0.16);
      case "correct": return tones([660, 990, 1319], 0.06, 0.1, "triangle", 0.14);
      case "wrong": return tones([200, 130], 0.11, 0.18, "sawtooth", 0.12);
      case "combo": return tones([659, 880, 1047, 1319], 0.05, 0.11, "triangle", 0.15);
    }
  }
  return { play, ensure };
}

/* ── ตัวการ์ตูนแต่งเอง (SVG) — ขาแขนแกว่งวิ่งได้ ── */

function HairSVG({ style, color }: { style: HairStyle; color: string }) {
  switch (style) {
    case "short":
      return <path d="M17,19 C17,10 23,5 30,5 C37,5 43,10 43,19 C39,13 36,12 30,12 C24,12 21,13 17,19 Z" fill={color} />;
    case "long":
      return (
        <g fill={color}>
          <path d="M17,19 C17,10 23,5 30,5 C37,5 43,10 43,19 C39,13 36,12 30,12 C24,12 21,13 17,19 Z" />
          <rect x="14.5" y="15" width="6" height="19" rx="3" />
          <rect x="39.5" y="15" width="6" height="19" rx="3" />
        </g>
      );
    case "buns":
      return (
        <g fill={color}>
          <path d="M17,19 C17,10 23,5 30,5 C37,5 43,10 43,19 C39,13 36,12 30,12 C24,12 21,13 17,19 Z" />
          <circle cx="19" cy="8" r="5" />
          <circle cx="41" cy="8" r="5" />
        </g>
      );
    case "spiky":
      return <path d="M16,19 L19,8 L23,14 L27,4 L31,13 L35,5 L39,13 L44,9 L44,19 C40,13 36,12 30,12 C24,12 20,13 16,19 Z" fill={color} />;
    case "bob":
      return <path d="M15,26 C15,10 22,4 30,4 C38,4 45,10 45,26 C45,29 42,29 42,26 L42,20 C38,14 36,13 30,13 C24,13 22,14 18,20 L18,26 C18,29 15,29 15,26 Z" fill={color} />;
    case "curly":
      return (
        <g fill={color}>
          <circle cx="20" cy="11" r="6" />
          <circle cx="30" cy="7" r="7" />
          <circle cx="40" cy="11" r="6" />
          <circle cx="16" cy="18" r="4.5" />
          <circle cx="44" cy="18" r="4.5" />
        </g>
      );
  }
}

/** ตัวการ์ตูนเต็มตัว หันขวา — running=true จะแกว่งแขนขา (export ให้เกมอื่นใช้ซ้ำ) */
export function RunnerSVG({ c, running, className }: { c: Custom; running: boolean; className?: string }) {
  const limb = (name: string) => (running ? { animation: `${name} 0.45s linear infinite` } : undefined);
  return (
    <svg viewBox="0 0 60 94" className={className} role="img" aria-label="ตัวการ์ตูนนักวิ่ง">
      <style>{`
        @keyframes limb-a { 0%,100% { transform: rotate(32deg); } 50% { transform: rotate(-32deg); } }
        @keyframes limb-b { 0%,100% { transform: rotate(-32deg); } 50% { transform: rotate(32deg); } }
      `}</style>
      {/* แขนหลัง */}
      <g style={{ transformOrigin: "24px 40px", ...limb("limb-b") }}>
        <rect x="20.5" y="38" width="6.5" height="17" rx="3.2" fill={c.skin} opacity="0.85" />
      </g>
      {/* ขาหลัง */}
      <g style={{ transformOrigin: "26px 62px", ...limb("limb-b") }}>
        <rect x="22.5" y="60" width="7" height="22" rx="3.5" fill={c.skin} opacity="0.9" />
        <ellipse cx="26" cy="84" rx="6.5" ry="4" fill="#334155" />
      </g>
      {/* ขาหน้า */}
      <g style={{ transformOrigin: "34px 62px", ...limb("limb-a") }}>
        <rect x="30.5" y="60" width="7" height="22" rx="3.5" fill={c.skin} />
        <ellipse cx="34" cy="84" rx="6.5" ry="4" fill="#1e293b" />
      </g>
      {/* กางเกง */}
      <rect x="19" y="52" width="22" height="13" rx="6" fill="#1e293b" />
      {/* เสื้อ */}
      <rect x="16.5" y="32" width="27" height="24" rx="9" fill={c.shirt} stroke="#00000022" strokeWidth="1" />
      {/* แขนหน้า */}
      <g style={{ transformOrigin: "38px 40px", ...limb("limb-a") }}>
        <rect x="34.5" y="38" width="6.5" height="17" rx="3.2" fill={c.skin} />
      </g>
      {/* หัว */}
      <circle cx="30" cy="19" r="13" fill={c.skin} />
      <HairSVG style={c.hair} color={c.hairColor} />
      {/* หน้า (หันขวาเล็กน้อย) */}
      <circle cx="29" cy="20" r="1.9" fill="#1e293b" />
      <circle cx="38" cy="20" r="1.9" fill="#1e293b" />
      <path d="M31,25.5 Q34,28.5 37,25.5" stroke="#b45309" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <circle cx="26" cy="24" r="2" fill="#fda4af" opacity="0.6" />
    </svg>
  );
}

/* ── หน้าตานักวิ่ง ── */

function RunnerFace({ r, size, running = false }: { r: Racer; size: "sm" | "lg"; running?: boolean }) {
  if (r.custom) {
    return <RunnerSVG c={r.custom} running={running} className={size === "lg" ? "h-[4.7rem] w-14 sm:h-20 sm:w-16" : "h-16 w-12 sm:h-[4.5rem] sm:w-14"} />;
  }
  const px = size === "lg" ? "h-12 w-12 sm:h-14 sm:w-14" : "h-10 w-10 sm:h-12 sm:w-12";
  if (r.img) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={r.img} alt={r.name} className={cn("rounded-full object-cover shadow ring-2 ring-white", px)} />;
  }
  // พลิกอีโมจิให้หันหน้าไปทางขวา (ทิศที่วิ่ง)
  return <span className={cn("inline-block -scale-x-100", size === "lg" ? "text-4xl sm:text-5xl" : "text-3xl sm:text-4xl")}>{r.avatar}</span>;
}

/* ── ลู่วิ่ง N เลน (มีเส้นแบ่งเศษส่วน + คลิกดูระยะ) ── */

function RaceTrack({ racers, total, duration, started, animate, big, autoReveal, runKey, paused = false, onFinish, view3d = false, showLabels = false }: {
  racers: Racer[]; total: number; duration: number; started: boolean; animate: boolean; big?: boolean; autoReveal?: boolean; runKey: number; paused?: boolean; onFinish?: () => void; view3d?: boolean; showLabels?: boolean;
}) {
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  useEffect(() => { setRevealed(new Set()); }, [runKey]);
  const [raceDone, setRaceDone] = useState(false);
  useEffect(() => { setRaceDone(false); }, [runKey, started]);

  const laneH = big ? "h-24 sm:h-28" : "h-20 sm:h-24";
  const marks = [0, 0.25, 0.5, 0.75, 1];

  function toggle(id: number) {
    if (!started) return;
    setRevealed((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }

  return (
    <div className="space-y-2 rounded-2xl border-2 border-amber-200 bg-gradient-to-b from-sky-100 to-emerald-50 p-3 sm:p-4">
      <style>{`@keyframes runto { from { left: 2%; } to { left: var(--tg); } }`}</style>
      <div className="flex items-center justify-between px-1 text-xs font-extrabold text-slate-500">
        <span>🏁 ออกตัว (0)</span>
        <span>เส้นชัย {fmt(total)} เมตร 🚩</span>
      </div>

      <div style={view3d ? { perspective: "1200px" } : undefined}>
      <div className="space-y-2" style={view3d ? { transform: "rotateX(24deg)", transformOrigin: "50% 100%" } : undefined}>
      {racers.map((r, i) => {
        const tone = TONES[i % TONES.length];
        const pct = pctOf(r);
        const dist = distOf(r, total);
        const ticks = Array.from({ length: r.den + 1 }, (_, k) => k / r.den);
        const show = autoReveal || revealed.has(r.id);
        const anim = started && animate;
        const moveStyle = {
          left: "2%",
          ...(anim ? { animationName: "runto", animationDuration: `${duration}s`, animationTimingFunction: "linear", animationFillMode: "forwards", animationPlayState: paused ? "paused" : "running" } : {}),
          "--tg": `${pct}%`,
        } as React.CSSProperties;
        return (
          <div key={r.id} className="space-y-0.5">
            {/* ป้ายเศษส่วน ณ จุดที่วิ่งไปถึง (ระยะทางซ่อนจนกว่าจะคลิก) — วางไว้เหนือเลนแยกจากตัววิ่ง กันทับตัวส่วน */}
            {started ? (
              <div className="relative h-6">
                <div className="absolute top-0 z-10 -translate-x-1/2" style={moveStyle}>
                  <div className="flex items-center gap-1 rounded-full bg-white px-1.5 py-0.5 shadow ring-1 ring-slate-200">
                    <StackedFraction numerator={r.num} denominator={r.den} className={cn("leading-none", big ? "text-sm" : "text-[11px]")} toneClassName={tone.text} />
                    {show && <span className={cn("font-extrabold", big ? "text-xs" : "text-[10px]", tone.text)}>= {fmt(dist)} ม.</span>}
                  </div>
                </div>
              </div>
            ) : null}
          <div className={cn("relative overflow-hidden rounded-xl border-2 bg-gradient-to-b", laneH, tone.lane)}>
            {/* ชื่อจาง ๆ ตัวใหญ่กลางลู่ */}
            {r.name && (
              <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
                <span className={cn("select-none whitespace-nowrap font-black uppercase tracking-widest opacity-[0.14]", big ? "text-5xl" : "text-3xl sm:text-4xl", tone.text)}>{r.name}</span>
              </div>
            )}
            {/* เส้นหลัก */}
            <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/75" />
            {/* เส้นแบ่งเศษส่วน — แสดงค่าตลอดเมื่อเปิดโหมด หรือเอาเมาส์ชี้ */}
            {ticks.map((t, k) => {
              const end = k === 0 || k === r.den;
              return (
                <div key={k} className="group absolute inset-y-0 z-[6] w-6 -translate-x-1/2" style={{ left: `${t * 100}%` }}>
                  <div
                    className={cn(
                      "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded transition-all",
                      end
                        ? "h-full w-1 bg-slate-800"
                        : cn("h-full w-0.5 bg-slate-700/60 group-hover:w-1 group-hover:bg-violet-600", showLabels && "w-1 bg-slate-700/80"),
                    )}
                  />
                  <div
                    className={cn(
                      "pointer-events-none absolute left-1/2 top-0.5 z-30 -translate-x-1/2 rounded-lg bg-slate-800 px-1.5 py-0.5 shadow-lg transition",
                      showLabels ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                    )}
                  >
                    {end ? <span className="text-xs font-extrabold text-white">{k === 0 ? "0" : "1"}</span> : <StackedFraction numerator={k} denominator={r.den} className="text-[11px]" toneClassName="text-white" />}
                  </div>
                </div>
              );
            })}
            {/* เส้นชัยลายหมากรุก */}
            <div className="absolute right-0 top-0 h-full w-3" style={{ backgroundImage: "repeating-conic-gradient(#111 0% 25%, #fff 0% 50%)", backgroundSize: "6px 6px" }} />

            {/* นักวิ่ง (คลิกเพื่อเฉลยระยะทาง) */}
            <button
              onClick={() => toggle(r.id)}
              onAnimationEnd={(e) => { if (e.animationName === "runto") { setRaceDone(true); onFinish?.(); } }}
              title="คลิกเพื่อดูระยะทาง"
              className={cn("absolute bottom-0.5 z-10 -translate-x-1/2 drop-shadow-md", started && !autoReveal ? "cursor-pointer" : "cursor-default")}
              style={moveStyle}
            >
              <RunnerFace r={r} size={big ? "lg" : "sm"} running={anim && !paused && !raceDone} />
            </button>
          </div>
          </div>
        );
      })}
      </div>
      </div>

      {/* ไม้บรรทัดเมตร */}
      <div className="relative mt-1 h-6">
        <div className="absolute inset-x-0 top-2 h-0.5 rounded bg-slate-400" />
        {marks.map((m) => (
          <div key={m} className="absolute -translate-x-1/2 text-center" style={{ left: `${m * 100}%` }}>
            <div className="mx-auto h-2 w-0.5 bg-slate-400" />
            <div className="text-[10px] font-extrabold text-slate-500 sm:text-xs">{fmt(m * total)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── ตัวปรับค่าคู่ ── */

function Stepper({ label, value, min, max, onChange, color }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void; color: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs font-extrabold text-slate-500">{label}</span>
      <div className="flex items-center gap-1.5">
        <button onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`ลด${label}`} className={cn("grid h-8 w-8 place-items-center rounded-lg text-white transition active:scale-95 disabled:opacity-30", color)}>−</button>
        <span className="w-7 text-center text-base font-extrabold text-slate-700">{value}</span>
        <button onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`เพิ่ม${label}`} className={cn("grid h-8 w-8 place-items-center rounded-lg text-white transition active:scale-95 disabled:opacity-30", color)}>+</button>
      </div>
    </div>
  );
}

/* ── การ์ดตั้งค่านักวิ่ง ── */

function SetupCard({ r, index, onChange, onRemove, canRemove }: { r: Racer; index: number; onChange: (r: Racer) => void; onRemove: () => void; canRemove: boolean }) {
  const tone = TONES[index % TONES.length];
  function upload(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange({ ...r, img: reader.result as string, custom: null });
    reader.readAsDataURL(file);
  }
  return (
    <div className={cn("space-y-2.5 rounded-2xl border-2 p-3", tone.card)}>
      <div className="flex items-center justify-between">
        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-extrabold", tone.chip)}>เลน {index + 1}</span>
        {canRemove && <button onClick={onRemove} aria-label="ลบนักวิ่ง" className="grid h-7 w-7 place-items-center rounded-lg bg-white text-rose-500 shadow-sm transition hover:bg-rose-50"><Trash2 size={14} /></button>}
      </div>
      {/* สลับโหมดตัวละคร */}
      <div className="flex gap-1 rounded-xl bg-white/70 p-1">
        <button onClick={() => onChange({ ...r, custom: r.custom ?? defaultCustom(index), img: null })} className={cn("flex-1 rounded-lg py-1 text-xs font-extrabold transition", r.custom ? "bg-amber-400 text-white shadow" : "text-slate-500 hover:bg-white")}>🎨 การ์ตูน</button>
        <button onClick={() => onChange({ ...r, custom: null, img: null })} className={cn("flex-1 rounded-lg py-1 text-xs font-extrabold transition", !r.custom && !r.img ? "bg-amber-400 text-white shadow" : "text-slate-500 hover:bg-white")}>😀 อีโมจิ</button>
      </div>

      {/* ห้องแต่งตัวการ์ตูน */}
      {r.custom ? (
        <div className="flex gap-2">
          <div className="grid w-16 shrink-0 place-items-center rounded-xl bg-white/80 ring-1 ring-slate-200">
            <RunnerSVG c={r.custom} running={false} className="h-20 w-14" />
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-1">
              <span className="w-8 text-[10px] font-extrabold text-slate-500">ผิว</span>
              {SKINS.map((s) => (
                <button key={s} onClick={() => onChange({ ...r, custom: { ...r.custom!, skin: s } })} className={cn("h-5 w-5 rounded-full ring-2 transition active:scale-90", r.custom!.skin === s ? "ring-amber-500" : "ring-white")} style={{ background: s }} aria-label="เลือกสีผิว" />
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-1">
              <span className="w-8 text-[10px] font-extrabold text-slate-500">ผม</span>
              {HAIR_STYLES.map((h) => (
                <button key={h.id} onClick={() => onChange({ ...r, custom: { ...r.custom!, hair: h.id } })} className={cn("rounded-md px-1.5 py-0.5 text-[10px] font-extrabold ring-1 transition active:scale-95", r.custom!.hair === h.id ? "bg-amber-400 text-white ring-amber-500" : "bg-white text-slate-600 ring-slate-200")}>{h.label}</button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <span className="w-8 text-[10px] font-extrabold text-slate-500">สีผม</span>
              {HAIR_COLORS.map((s) => (
                <button key={s} onClick={() => onChange({ ...r, custom: { ...r.custom!, hairColor: s } })} className={cn("h-5 w-5 rounded-full ring-2 transition active:scale-90", r.custom!.hairColor === s ? "ring-amber-500" : "ring-white")} style={{ background: s }} aria-label="เลือกสีผม" />
              ))}
            </div>
            <div className="flex items-center gap-1">
              <span className="w-8 text-[10px] font-extrabold text-slate-500">เสื้อ</span>
              {SHIRT_COLORS.map((s) => (
                <button key={s} onClick={() => onChange({ ...r, custom: { ...r.custom!, shirt: s } })} className={cn("h-5 w-5 rounded-full ring-2 transition active:scale-90", r.custom!.shirt === s ? "ring-amber-500" : "ring-white")} style={{ background: s }} aria-label="เลือกสีเสื้อ" />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-6 gap-1">
          {AVATARS.map((a) => (
            <button key={a} onClick={() => onChange({ ...r, avatar: a, img: null, custom: null })} className={cn("grid aspect-square place-items-center rounded-lg border-2 text-lg transition active:scale-95", !r.img && r.avatar === a ? "border-amber-400 bg-amber-50" : "border-transparent bg-white/60 hover:bg-white")}>{a}</button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <label className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-300 bg-white px-2 py-1.5 text-xs font-extrabold text-slate-500 transition hover:border-amber-400 hover:text-amber-600">
          <Upload size={13} /> {r.img ? "เปลี่ยนรูป" : "อัปโหลดรูป"}
          <input type="file" accept="image/*" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
        </label>
        {r.img && <RunnerFace r={r} size="sm" />}
      </div>
      <input value={r.name} onChange={(e) => onChange({ ...r, name: e.target.value.slice(0, 14) })} placeholder="ตั้งชื่อนักวิ่ง" className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-1.5 text-center text-sm font-extrabold text-slate-700 outline-none focus:border-amber-400" />
      <div className="flex items-center justify-center">
        <StackedFraction numerator={r.num} denominator={r.den} className="text-3xl" toneClassName="text-slate-700" />
      </div>
      <div className="space-y-1">
        <Stepper label="ตัวเศษ" value={r.num} min={0} max={r.den} onChange={(n) => onChange({ ...r, num: n })} color={tone.btn} />
        <Stepper label="ตัวส่วน" value={r.den} min={2} max={MAX_DEN} onChange={(d) => onChange({ ...r, den: d, num: Math.min(r.num, d) })} color={tone.btn} />
      </div>
    </div>
  );
}

/* ══════════════ เกมหลัก ══════════════ */

type Mode = "lab" | "race";

export function RaceTrackGame() {
  const [mode, setMode] = useState<Mode>("lab");
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const { play, ensure } = useSound(mutedRef);
  useEffect(() => { mutedRef.current = muted; }, [muted]);

  /* เพลงประกอบ — เล่นตอนกำลังวิ่งในโหมดทดลอง และตลอดโหมดแข่งขัน */
  const [labPlaying, setLabPlaying] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!bgmRef.current) {
      const audio = new Audio("/sounds/fraction-sprint.mp3");
      audio.loop = true;
      audio.volume = 0.3;
      bgmRef.current = audio;
    }
    const bgm = bgmRef.current;
    const shouldPlay = !muted && (mode === "race" || (mode === "lab" && labPlaying));
    if (shouldPlay) void bgm.play().catch(() => {});
    else { bgm.pause(); if (mode === "lab" && !labPlaying) bgm.currentTime = 0; }
  }, [mode, muted, labPlaying]);
  useEffect(() => () => bgmRef.current?.pause(), []);

  /* ── โหมดทดลอง ── */
  const [racers, setRacers] = useState<Racer[]>(() => [newRacer(0), newRacer(1)]);
  const [distance, setDistance] = useState(100);
  const [duration, setDuration] = useState(3); // ทุกคนใช้เวลาเท่ากัน (วินาที)
  const [labStarted, setLabStarted] = useState(false);
  const [labAnimate, setLabAnimate] = useState(false);
  const [labRunId, setLabRunId] = useState(0);
  const [revealAll, setRevealAll] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [labFinished, setLabFinished] = useState(false);
  const [view3d, setView3d] = useState(true);
  const [showLabels, setShowLabels] = useState(false);

  useEffect(() => { if (!labStarted) { setLabAnimate(false); setPaused(false); setLabFinished(false); } }, [labStarted]);

  /* เพลงเล่นเฉพาะช่วงที่นักวิ่งกำลังวิ่งจริง (หยุดเมื่อพัก/จบ/รีเซต) */
  useEffect(() => {
    setLabPlaying(labStarted && labAnimate && !paused && !labFinished);
  }, [labStarted, labAnimate, paused, labFinished]);
  useEffect(() => {
    document.body.style.overflow = fullscreen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [fullscreen]);

  function startLab() {
    ensure();
    play("whistle");
    setRevealAll(false);
    setPaused(false);
    setLabFinished(false);
    setLabRunId((n) => n + 1);
    setLabAnimate(false);
    setLabStarted(true);
    window.setTimeout(() => { setLabAnimate(true); play("cheer"); }, 90);
  }
  function updateRacer(id: number, r: Racer) { setRacers((rs) => rs.map((x) => (x.id === id ? r : x))); setLabStarted(false); }
  function addRacer() { if (racers.length < MAX_RACERS) { setRacers((rs) => [...rs, newRacer(rs.length)]); setLabStarted(false); } }
  function removeRacer(id: number) { setRacers((rs) => (rs.length > 2 ? rs.filter((x) => x.id !== id) : rs)); setLabStarted(false); }
  function resetLab() { setRacers([newRacer(0), newRacer(1)]); setDistance(100); setDuration(3); setLabStarted(false); }

  const ranking = [...racers].sort((a, b) => distOf(b, distance) - distOf(a, distance));

  /* ── โหมดแข่งขัน ── */
  const [gr1, setGr1] = useState<Racer>(() => ({ id: 1, avatar: "🏃‍♂️", img: null, custom: { ...defaultCustom(0), shirt: "#0ea5e9" }, name: "ฟ้า", ...randomFrac() }));
  const [gr2, setGr2] = useState<Racer>(() => ({ id: 2, avatar: "🏃‍♀️", img: null, custom: { ...defaultCustom(1), shirt: "#ec4899" }, name: "ชมพู", ...randomFrac() }));
  const [guess, setGuess] = useState<Winner | null>(null);
  const [raceAnimate, setRaceAnimate] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [best, setBest] = useState(0);
  const [rounds, setRounds] = useState(0);
  const [fireworks, setFireworks] = useState(false);

  useEffect(() => {
    if (guess === null) { setRaceAnimate(false); return; }
    const id = window.setTimeout(() => setRaceAnimate(true), 60);
    return () => window.clearTimeout(id);
  }, [guess]);

  useEffect(() => {
    if (!fireworks) return;
    const id = window.setTimeout(() => setFireworks(false), 1800);
    return () => window.clearTimeout(id);
  }, [fireworks]);

  const raceWinner = compareFractions(gr1, gr2);
  const raceSign = raceWinner === "r1" ? ">" : raceWinner === "r2" ? "<" : "=";

  function makeGuess(g: Winner) {
    if (guess) return;
    ensure(); play("whistle");
    setGuess(g); setRounds((n) => n + 1);
    if (g === raceWinner) {
      setScore((s) => s + 1);
      const c = combo + 1;
      setCombo(c);
      window.setTimeout(() => { play("cheer"); play(c >= 3 ? "combo" : "correct"); setFireworks(true); }, 1500);
    } else {
      setCombo(0);
      window.setTimeout(() => play("wrong"), 1500);
    }
  }
  function nextRound() { setBest((b) => Math.max(b, score)); setGr1((r) => ({ ...r, ...randomFrac() })); setGr2((r) => ({ ...r, ...randomFrac() })); setGuess(null); }
  function resetRace() { setScore(0); setCombo(0); setRounds(0); setGuess(null); setGr1((r) => ({ ...r, ...randomFrac() })); setGr2((r) => ({ ...r, ...randomFrac() })); }

  return (
    <div className="relative space-y-4">
      <style>{`
        @keyframes fw-pop { 0% { transform: scale(0.2); opacity: 0; } 40% { transform: scale(1.25); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes fw-fall { 0% { transform: translateY(-20px) rotate(0); opacity: 1; } 100% { transform: translateY(320px) rotate(360deg); opacity: 0; } }
      `}</style>

      {/* พลุฉลองตอบถูก */}
      {fireworks && (
        <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
          <div className="absolute left-1/2 top-1/3 -translate-x-1/2 text-6xl sm:text-7xl" style={{ animation: "fw-pop 0.5s ease-out both" }}>🎉</div>
          {["🎊", "✨", "🎆", "⭐", "🎉", "💫", "🎊", "✨", "🌟", "🎆"].map((e, i) => (
            <span key={i} className="absolute text-2xl sm:text-3xl" style={{ left: `${8 + i * 9}%`, top: "-10px", animation: `fw-fall ${1 + (i % 4) * 0.25}s ${(i % 5) * 0.1}s ease-in both` }}>{e}</span>
          ))}
        </div>
      )}

      {/* แถบโหมด */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2 rounded-2xl bg-slate-100 p-1">
          <button onClick={() => setMode("lab")} className={cn("flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-extrabold transition sm:px-4", mode === "lab" ? "bg-white text-emerald-700 shadow" : "text-slate-500")}>
            <FlaskConical size={16} /> โหมดทดลอง
          </button>
          <button onClick={() => setMode("race")} className={cn("flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-extrabold transition sm:px-4", mode === "race" ? "bg-white text-amber-700 shadow" : "text-slate-500")}>
            <Flag size={16} /> โหมดแข่งขัน
          </button>
        </div>
        <button onClick={() => setMuted((m) => !m)} aria-label={muted ? "เปิดเสียง" : "ปิดเสียง"} className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200">
          {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
        </button>
      </div>

      {/* ═══════ โหมดทดลอง ═══════ */}
      {mode === "lab" && (
        <div className="space-y-4">
          <div className="rounded-2xl border-2 border-emerald-100 bg-emerald-50/60 px-4 py-2.5 text-center text-sm font-bold text-emerald-700 sm:text-base">
            🧪 <span className="font-extrabold">โหมดครูใช้สอน</span> — เพิ่มนักวิ่ง (สูงสุด 6) · อัปโหลดรูป · แต่ละลู่มีเส้นแบ่งเศษส่วน · ทุกคนหยุดพร้อมกัน
          </div>

          {/* การ์ดตั้งค่านักวิ่ง */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {racers.map((r, i) => (
              <SetupCard key={r.id} r={r} index={i} onChange={(nr) => updateRacer(r.id, nr)} onRemove={() => removeRacer(r.id)} canRemove={racers.length > 2} />
            ))}
            {racers.length < MAX_RACERS && (
              <button onClick={addRacer} className="flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 p-4 text-emerald-600 transition hover:border-emerald-400 hover:bg-emerald-50 active:scale-[0.98]">
                <Plus size={28} />
                <span className="text-sm font-extrabold">เพิ่มนักวิ่ง</span>
                <span className="text-xs font-bold text-emerald-400">({racers.length}/{MAX_RACERS})</span>
              </button>
            )}
          </div>

          {/* ระยะทาง + เวลาวิ่ง */}
          <div className="grid gap-3 rounded-2xl bg-slate-50 p-3 sm:grid-cols-2">
            <div className="space-y-2">
              <span className="text-sm font-extrabold text-slate-600">📏 ระยะทางทั้งหมด</span>
              <div className="flex flex-wrap items-center gap-2">
                {DISTANCE_PRESETS.map((d) => (
                  <button key={d} onClick={() => { setDistance(d); setLabStarted(false); }} className={cn("rounded-xl border-2 px-3 py-1.5 text-sm font-extrabold transition", distance === d ? "border-amber-400 bg-amber-100 text-amber-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50")}>{d} ม.</button>
                ))}
                <div className="flex items-center gap-1">
                  <input type="number" min={1} max={9999} value={distance} onChange={(e) => { setDistance(Math.max(1, Math.min(9999, Number(e.target.value) || 1))); setLabStarted(false); }} className="w-20 rounded-xl border-2 border-slate-200 bg-white px-2 py-1.5 text-center text-sm font-extrabold text-slate-700 outline-none focus:border-amber-400" />
                  <span className="text-sm font-bold text-slate-500">ม.</span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-sm font-extrabold text-slate-600">⏱️ เวลาวิ่ง (ทุกคนหยุดพร้อมกัน)</span>
              <div className="flex items-center gap-2">
                <input type="range" min={1} max={120} value={duration} onChange={(e) => { setDuration(Number(e.target.value)); setLabStarted(false); }} className="flex-1 accent-emerald-500" />
                <span className="w-28 rounded-lg bg-white px-2 py-1 text-center text-sm font-extrabold text-emerald-700 ring-1 ring-slate-200">
                  {duration} วิ{duration >= 60 ? ` (${(duration / 60).toFixed(duration % 60 === 0 ? 0 : 1)} นาที)` : ""}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[3, 10, 30, 60, 120].map((s) => (
                  <button key={s} onClick={() => { setDuration(s); setLabStarted(false); }} className={cn("rounded-lg border-2 px-2.5 py-1 text-xs font-extrabold transition", duration === s ? "border-emerald-400 bg-emerald-100 text-emerald-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
                    {s >= 60 ? `${s / 60} นาที` : `${s} วิ`}
                  </button>
                ))}
              </div>
              <p className="text-xs font-bold text-slate-400">ใช้เวลาเท่ากันทุกคน — ใครไปได้ไม่ไกล แปลว่าวิ่งช้ากว่า (เลือกได้ถึง 2 นาที)</p>
            </div>
          </div>

          {/* ปุ่ม */}
          <div className="flex flex-wrap justify-center gap-2">
            {labStarted && !labFinished ? (
              paused ? (
                <button onClick={() => setPaused(false)} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
                  <Play size={20} /> วิ่งต่อ
                </button>
              ) : (
                <button onClick={() => setPaused(true)} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
                  <Pause size={20} /> หยุดวิ่ง
                </button>
              )
            ) : (
              <button onClick={startLab} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 px-8 py-3 text-lg font-extrabold text-white shadow-lg transition hover:brightness-105 active:scale-[0.98]">
                <Play size={20} /> {labFinished ? "วิ่งอีกครั้ง" : "เริ่มวิ่ง!"}
              </button>
            )}
            <button onClick={() => setFullscreen(true)} className="flex items-center gap-1.5 rounded-xl border-2 border-emerald-300 bg-white px-4 py-2 text-sm font-extrabold text-emerald-700 transition hover:bg-emerald-50">
              <Maximize2 size={15} /> ขยายสนาม
            </button>
            <button onClick={resetLab} className="flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50">
              <RotateCcw size={15} /> รีเซต
            </button>
            <button onClick={() => setView3d((v) => !v)} className={cn("flex items-center gap-1.5 rounded-xl border-2 px-4 py-2 text-sm font-extrabold transition", view3d ? "border-indigo-400 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
              🧊 มุมมอง {view3d ? "3 มิติ" : "แบน"}
            </button>
            <button onClick={() => setShowLabels((v) => !v)} className={cn("flex items-center gap-1.5 rounded-xl border-2 px-4 py-2 text-sm font-extrabold transition", showLabels ? "border-violet-400 bg-violet-50 text-violet-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
              🏷️ เศษส่วนทุกจุด {showLabels ? "เปิด" : "ปิด"}
            </button>
          </div>

          {/* ลู่วิ่ง */}
          <RaceTrack racers={racers} total={distance} duration={duration} started={labStarted} animate={labAnimate} autoReveal={revealAll} runKey={labRunId} paused={paused} onFinish={() => setLabFinished(true)} view3d={view3d} showLabels={showLabels} />

          {/* หลังวิ่ง: ถามก่อน แล้วค่อยเฉลย */}
          {labStarted && labAnimate && (
            <div className="space-y-2 rounded-2xl border-2 border-amber-200 bg-amber-50/60 p-3 text-center">
              {!revealAll ? (
                <>
                  <p className="text-sm font-extrabold text-amber-700 sm:text-base">👆 คลิกที่ตัวนักวิ่งบนลู่เพื่อดูระยะทาง — ลองให้นักเรียนทายก่อน!</p>
                  <button onClick={() => setRevealAll(true)} className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-5 py-2 text-sm font-extrabold text-white shadow transition hover:bg-amber-700 active:scale-[0.98]">
                    <Eye size={15} /> เฉลยระยะทางทั้งหมด
                  </button>
                </>
              ) : (
                <div className="space-y-1.5">
                  <p className="text-lg font-extrabold text-amber-700">🏆 ผลการแข่ง (เรียงจากไกลสุด)</p>
                  {ranking.map((r, i) => (
                    <div key={r.id} className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-sm font-bold text-slate-600 sm:text-base">
                      <span className="font-extrabold text-amber-600">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}</span>
                      <RunnerFace r={r} size="sm" />
                      <span className={cn("font-extrabold", TONES[racers.indexOf(r) % TONES.length].text)}>{r.name}</span>
                      <StackedFraction numerator={r.num} denominator={r.den} className="mx-1 text-lg" toneClassName={TONES[racers.indexOf(r) % TONES.length].text} />
                      ของ {fmt(distance)} = <span className="font-extrabold">{fmt(distOf(r, distance))} ม.</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══════ โหมดแข่งขัน ═══════ */}
      {mode === "race" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 rounded-2xl bg-amber-50 px-4 py-2.5">
            <span className="text-xl font-extrabold text-amber-700 sm:text-2xl">🏅 คะแนน {score}</span>
            {combo >= 2 && <span className="text-lg font-extrabold text-orange-600">🔥 คอมโบ x{combo}</span>}
            {best > 0 && <span className="flex items-center gap-1 text-sm font-extrabold text-slate-500"><Trophy size={14} /> สูงสุด {best}</span>}
          </div>
          <p className="text-center text-base font-extrabold text-slate-700 sm:text-lg">🤔 ทายก่อน! ใครจะวิ่งได้ไกลกว่ากันบนลู่ 100 เมตร?</p>

          <div className="flex items-center justify-center gap-4 sm:gap-8">
            <div className="flex flex-col items-center gap-1">
              <span className="text-4xl">{gr1.avatar}</span>
              <StackedFraction numerator={gr1.num} denominator={gr1.den} className="text-4xl sm:text-5xl" toneClassName="text-sky-700" />
            </div>
            <span className="text-3xl font-extrabold text-slate-300">vs</span>
            <div className="flex flex-col items-center gap-1">
              <span className="text-4xl">{gr2.avatar}</span>
              <StackedFraction numerator={gr2.num} denominator={gr2.den} className="text-4xl sm:text-5xl" toneClassName="text-rose-700" />
            </div>
          </div>

          {!guess && (
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <button onClick={() => makeGuess("r1")} className="rounded-2xl border-2 border-sky-300 bg-sky-50 py-3 text-sm font-extrabold text-sky-700 transition hover:bg-sky-100 active:scale-95 sm:text-base">{gr1.avatar} ฟ้าไกลกว่า</button>
              <button onClick={() => makeGuess("equal")} className="rounded-2xl border-2 border-slate-300 bg-slate-50 py-3 text-sm font-extrabold text-slate-600 transition hover:bg-slate-100 active:scale-95 sm:text-base">🤝 เท่ากัน</button>
              <button onClick={() => makeGuess("r2")} className="rounded-2xl border-2 border-rose-300 bg-rose-50 py-3 text-sm font-extrabold text-rose-700 transition hover:bg-rose-100 active:scale-95 sm:text-base">{gr2.avatar} ชมพูไกลกว่า</button>
            </div>
          )}

          {guess && <RaceTrack racers={[gr1, gr2]} total={100} duration={3} started animate={raceAnimate} autoReveal runKey={rounds} />}

          {guess && raceAnimate && (
            <div className={cn("rounded-2xl border-2 p-4 text-center", guess === raceWinner ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50")}>
              <p className={cn("text-xl font-extrabold sm:text-2xl", guess === raceWinner ? "text-emerald-700" : "text-rose-600")}>{guess === raceWinner ? "🎉 ทายถูก!" : "ยังไม่ใช่!"}</p>
              <div className="mt-1 flex items-center justify-center gap-3 text-2xl font-extrabold">
                <StackedFraction numerator={gr1.num} denominator={gr1.den} className="text-2xl" toneClassName="text-sky-700" />
                <span className="text-amber-600">{raceSign}</span>
                <StackedFraction numerator={gr2.num} denominator={gr2.den} className="text-2xl" toneClassName="text-rose-700" />
              </div>
              <p className="mt-1 text-sm font-bold text-slate-600">
                {raceWinner === "equal" ? "ทั้งคู่วิ่งได้ไกลเท่ากัน" : `${(raceWinner === "r1" ? gr1 : gr2).avatar} วิ่งได้ ${fmt(distOf(raceWinner === "r1" ? gr1 : gr2, 100))} ม. ไกลกว่า ${fmt(distOf(raceWinner === "r1" ? gr2 : gr1, 100))} ม.`}
              </p>
              <div className="mt-3 flex justify-center gap-2">
                <button onClick={nextRound} className="flex items-center gap-1.5 rounded-xl bg-amber-600 px-6 py-2.5 text-sm font-extrabold text-white shadow transition hover:bg-amber-700 active:scale-[0.98] sm:text-base"><Shuffle size={16} /> คู่ต่อไป</button>
                {rounds >= 3 && <button onClick={resetRace} className="rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50">เริ่มนับใหม่</button>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════ ขยายสนามเต็มจอ ═══════ */}
      {fullscreen && (
        <div className="fixed inset-0 z-[9999] flex flex-col bg-slate-900/95 p-4 sm:p-8">
          <div className="mb-3 flex items-center justify-between text-white">
            <h3 className="text-lg font-extrabold sm:text-2xl">🏁 สนามแข่งเศษส่วน — {fmt(distance)} เมตร</h3>
            <div className="flex gap-2">
              {labStarted && !labFinished ? (
                paused ? (
                  <button onClick={() => setPaused(false)} className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-extrabold text-white shadow transition hover:bg-emerald-600"><Play size={16} /> วิ่งต่อ</button>
                ) : (
                  <button onClick={() => setPaused(true)} className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2 text-sm font-extrabold text-white shadow transition hover:bg-orange-600"><Pause size={16} /> หยุดวิ่ง</button>
                )
              ) : (
                <button onClick={startLab} className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-extrabold text-white shadow transition hover:bg-emerald-600"><Play size={16} /> {labFinished ? "วิ่งอีกครั้ง" : "เริ่มวิ่ง"}</button>
              )}
              <button onClick={() => setShowLabels((v) => !v)} className={cn("flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-extrabold transition", showLabels ? "bg-violet-500 text-white hover:bg-violet-600" : "bg-white/20 text-white hover:bg-white/30")}>🏷️ เศษส่วนทุกจุด</button>
              <button onClick={() => setFullscreen(false)} className="flex items-center gap-1.5 rounded-xl bg-white/20 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-white/30"><X size={16} /> ปิด</button>
            </div>
          </div>
          <div className="flex flex-1 items-center justify-center overflow-auto">
            <div className="w-full max-w-6xl">
              <RaceTrack racers={racers} total={distance} duration={duration} started={labStarted} animate={labAnimate} autoReveal={revealAll} runKey={labRunId} paused={paused} onFinish={() => setLabFinished(true)} view3d={view3d} showLabels={showLabels} big />
            </div>
          </div>
          <p className="mt-2 text-center text-xs font-bold text-white/70">👆 คลิกที่ตัวนักวิ่งเพื่อเฉลยระยะทางทีละคน</p>
        </div>
      )}
    </div>
  );
}
