"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────────────────────────
   ตัวละครไทยจิบิ (หัวโต ตาโต แก้มชมพู) แบบปรับแต่งได้
   ใช้ร่วมกันทุกเกม — เลือกสีผิว / ทรงผม / สีผม / สีเสื้อ
   ค่าที่ผู้เล่นแต่งไว้เก็บใน localStorage ใช้ต่อทุกเกมอัตโนมัติ
   ───────────────────────────────────────────────────────────── */

export const SKINS = ["#ffe3c8", "#f8cfa8", "#eeb87f", "#dda366", "#c08a52"];
export const HAIR_COLORS = ["#1c1c1c", "#4a2c14", "#8a5a2e", "#c9c9c9", "#e8b93c"];
export const SHIRTS = ["#e04444", "#2f6fd6", "#2e9e57", "#e86ea8", "#f0a52e", "#7b52c9"];
export type HairStyle = "short" | "bob" | "bun" | "ponytail" | "curly" | "flat";
export const HAIR_STYLES: { id: HairStyle; label: string }[] = [
  { id: "short", label: "สั้น" },
  { id: "bob", label: "บ๊อบ" },
  { id: "bun", label: "มวยจุก" },
  { id: "ponytail", label: "หางม้า" },
  { id: "curly", label: "หยิก" },
  { id: "flat", label: "รองทรง" },
];

export type AvatarConfig = { skin: number; hairStyle: HairStyle; hairColor: number; shirt: number };
export const DEFAULT_AVATAR: AvatarConfig = { skin: 1, hairStyle: "short", hairColor: 0, shirt: 1 };

const KEY = "fa_player_avatar";
const EVT = "fa-avatar-changed";

export function loadAvatar(): AvatarConfig {
  if (typeof window === "undefined") return DEFAULT_AVATAR;
  try {
    return { ...DEFAULT_AVATAR, ...(JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<AvatarConfig>) };
  } catch {
    return DEFAULT_AVATAR;
  }
}
export function saveAvatar(a: AvatarConfig) {
  localStorage.setItem(KEY, JSON.stringify(a));
  window.dispatchEvent(new CustomEvent(EVT));
}
/** อ่าน avatar ของผู้เล่น + sync ทุกเกมเมื่อมีการแต่งตัวใหม่ */
export function usePlayerAvatar(): [AvatarConfig, (a: AvatarConfig) => void] {
  const [av, setAv] = useState<AvatarConfig>(DEFAULT_AVATAR);
  useEffect(() => {
    const sync = () => setAv(loadAvatar());
    sync();
    window.addEventListener(EVT, sync);
    return () => window.removeEventListener(EVT, sync);
  }, []);
  return [av, (a) => { saveAvatar(a); setAv(a); }];
}

/** สุ่มหน้าตา (ใช้กับตัวประกอบ เช่น ผู้โดยสาร/ลูกค้า) — deterministic จาก seed */
export function randomAvatar(seed: number): AvatarConfig {
  const r = (m: number, salt: number) => Math.abs((seed * 9301 + salt * 49297) % 233280) % m;
  return {
    skin: r(SKINS.length, 1),
    hairStyle: HAIR_STYLES[r(HAIR_STYLES.length, 7)].id,
    hairColor: r(HAIR_COLORS.length, 13),
    shirt: r(SHIRTS.length, 29),
  };
}

/* ── ตัวเรนเดอร์ (เต็มตัว 2.5D — แสงเงาไล่มิติ + เดินแกว่งแขนขาได้) ── */

let uidCounter = 0;

export function ThaiAvatar({ a, mood = "normal", size = 96, walking = false, facing = 1 }: {
  a: AvatarConfig; mood?: "normal" | "happy" | "sad"; size?: number; walking?: boolean; facing?: 1 | -1;
}) {
  const skin = SKINS[a.skin % SKINS.length];
  const hair = HAIR_COLORS[a.hairColor % HAIR_COLORS.length];
  const shirt = SHIRTS[a.shirt % SHIRTS.length];
  const [uid] = useState(() => `ta${++uidCounter}`);
  return (
    <svg viewBox="0 0 80 122" width={size * 0.66} height={size} role="img" aria-label="ตัวละคร"
      style={{ transform: facing === -1 ? "scaleX(-1)" : undefined, overflow: "visible" }}>
      <defs>
        {/* แสง 2.5D: สว่างบนซ้าย → เข้มล่างขวา */}
        <radialGradient id={`${uid}-face`} cx="0.38" cy="0.3" r="0.85">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="0.55" stopColor={skin} stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.13" />
        </radialGradient>
        <linearGradient id={`${uid}-shirt`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.34" />
          <stop offset="0.5" stopColor={shirt} stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id={`${uid}-hair`} x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.28" />
          <stop offset="0.6" stopColor={hair} stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.22" />
        </linearGradient>
      </defs>
      <style>{`
        @keyframes taBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-2.5px); } }
        @keyframes taLegA { 0%,100% { transform: rotate(20deg); } 50% { transform: rotate(-20deg); } }
        @keyframes taLegB { 0%,100% { transform: rotate(-20deg); } 50% { transform: rotate(20deg); } }
        @keyframes taArmA { 0%,100% { transform: rotate(-16deg); } 50% { transform: rotate(16deg); } }
        @keyframes taArmB { 0%,100% { transform: rotate(16deg); } 50% { transform: rotate(-16deg); } }
        .${uid}-bob { animation: taBob 0.44s ease-in-out infinite; }
        .${uid}-legA { animation: taLegA 0.44s ease-in-out infinite; transform-origin: 33px 92px; }
        .${uid}-legB { animation: taLegB 0.44s ease-in-out infinite; transform-origin: 47px 92px; }
        .${uid}-armA { animation: taArmA 0.44s ease-in-out infinite; transform-origin: 24px 64px; }
        .${uid}-armB { animation: taArmB 0.44s ease-in-out infinite; transform-origin: 56px 64px; }
      `}</style>

      {/* เงาใต้เท้า */}
      <ellipse cx={40} cy={118} rx={17} ry={3.6} fill="#000000" opacity={0.16} />

      {/* ขา (แกว่งตอนเดิน) */}
      <g className={walking ? `${uid}-legA` : undefined}>
        <rect x={29} y={92} width={9} height={20} rx={4} fill={skin} />
        <rect x={29} y={92} width={9} height={20} rx={4} fill="#00000012" />
        <path d="M27,110 L38,110 L39,116 Q39,118 36,118 L29,118 Q26,118 27,114 Z" fill="#5b4632" />
      </g>
      <g className={walking ? `${uid}-legB` : undefined}>
        <rect x={42} y={92} width={9} height={20} rx={4} fill={skin} />
        <path d="M41,110 L52,110 L53,116 Q53,118 50,118 L43,118 Q40,118 41,114 Z" fill="#5b4632" />
      </g>
      {/* กางเกง */}
      <path d="M26,84 L54,84 L53,97 L43,97 L40,90 L37,97 L27,97 Z" fill="#3a4a63" />
      <path d="M26,84 L54,84 L53,97 L43,97 L40,90 L37,97 L27,97 Z" fill={`url(#${uid}-shirt)`} opacity={0.5} />

      {/* แขน (แกว่งตอนเดิน) */}
      <g className={walking ? `${uid}-armA` : undefined}>
        <rect x={19} y={63} width={8.5} height={23} rx={4.2} fill={shirt} stroke="#00000022" strokeWidth={1} />
        <circle cx={23.2} cy={87} r={4} fill={skin} />
      </g>
      <g className={walking ? `${uid}-armB` : undefined}>
        <rect x={52.5} y={63} width={8.5} height={23} rx={4.2} fill={shirt} stroke="#00000022" strokeWidth={1} />
        <circle cx={56.8} cy={87} r={4} fill={skin} />
      </g>

      {/* ทั้งตัวท่อนบนเด้งตามจังหวะเดิน */}
      <g className={walking ? `${uid}-bob` : undefined}>
      {/* ตัว/เสื้อ */}
      <path d="M24,66 Q24,58 40,58 Q56,58 56,66 L55,86 L25,86 Z" fill={shirt} stroke="#00000022" strokeWidth={1.6} />
      <path d="M24,66 Q24,58 40,58 Q56,58 56,66 L55,86 L25,86 Z" fill={`url(#${uid}-shirt)`} />
      <path d="M33,59 L40,66 L47,59" fill="none" stroke="#ffffff55" strokeWidth={2.5} strokeLinecap="round" />
      {/* คอ */}
      <rect x={35} y={52} width={10} height={9} rx={4} fill={skin} />
      {/* หัวโต */}
      <ellipse cx={40} cy={33} rx={23} ry={22} fill={skin} stroke="#00000014" strokeWidth={1.4} />
      <ellipse cx={40} cy={33} rx={23} ry={22} fill={`url(#${uid}-face)`} />
      {/* หู */}
      <ellipse cx={17.5} cy={35} rx={3.6} ry={5} fill={skin} />
      <ellipse cx={62.5} cy={35} rx={3.6} ry={5} fill={skin} />
      {/* ผม */}
      {a.hairStyle === "short" && (
        <path d="M17,32 Q15,10 40,9 Q65,10 63,32 Q62,20 52,17 Q56,24 50,20 Q42,15 30,19 Q20,23 18,32 Z" fill={hair} />
      )}
      {a.hairStyle === "flat" && (
        <path d="M17,29 Q17,11 40,10 Q63,11 63,29 L63,26 Q52,17 40,17 Q28,17 17,26 Z" fill={hair} />
      )}
      {a.hairStyle === "bob" && (
        <>
          <path d="M15,42 Q13,9 40,8 Q67,9 65,42 L58,42 Q60,24 40,22 Q20,24 22,42 Z" fill={hair} />
          <path d="M17,30 Q17,16 40,15 Q63,16 63,30 L63,25 Q52,18 40,18 Q28,18 17,25 Z" fill={hair} />
        </>
      )}
      {a.hairStyle === "bun" && (
        <>
          <circle cx={40} cy={9} r={7.5} fill={hair} />
          <path d="M17,30 Q17,12 40,11 Q63,12 63,30 L63,26 Q52,18 40,18 Q28,18 17,26 Z" fill={hair} />
        </>
      )}
      {a.hairStyle === "ponytail" && (
        <>
          <path d="M17,30 Q17,12 40,11 Q63,12 63,30 L63,26 Q52,18 40,18 Q28,18 17,26 Z" fill={hair} />
          <path d="M60,22 Q72,26 69,46 Q66,38 61,33 Z" fill={hair} />
        </>
      )}
      {a.hairStyle === "curly" && (
        <>
          <circle cx={24} cy={20} r={8} fill={hair} />
          <circle cx={36} cy={13} r={9} fill={hair} />
          <circle cx={50} cy={14} r={8.5} fill={hair} />
          <circle cx={59} cy={23} r={7} fill={hair} />
          <path d="M18,32 Q18,20 40,17 Q62,20 62,32 L62,28 Q50,20 40,20 Q30,20 18,28 Z" fill={hair} />
        </>
      )}
      {/* คิ้ว */}
      <path d="M27,26 Q31,24 35,26" stroke="#3a2a18" strokeWidth={2} fill="none" strokeLinecap="round" />
      <path d="M45,26 Q49,24 53,26" stroke="#3a2a18" strokeWidth={2} fill="none" strokeLinecap="round" />
      {/* ตาโต */}
      <ellipse cx={31} cy={34} rx={5} ry={6.2} fill="#fff" />
      <ellipse cx={49} cy={34} rx={5} ry={6.2} fill="#fff" />
      <circle cx={31.5} cy={35} r={3.4} fill="#241a12" />
      <circle cx={49.5} cy={35} r={3.4} fill="#241a12" />
      <circle cx={32.8} cy={33.4} r={1.2} fill="#fff" />
      <circle cx={50.8} cy={33.4} r={1.2} fill="#fff" />
      {/* จมูก */}
      <path d="M39,40 Q40,42 41,40" stroke="#00000030" strokeWidth={1.4} fill="none" strokeLinecap="round" />
      {/* ปาก */}
      {mood === "happy" && <path d="M33,45 Q40,52 47,45" stroke="#8a4a32" strokeWidth={2.2} fill="none" strokeLinecap="round" />}
      {mood === "normal" && <path d="M35,46 Q40,49 45,46" stroke="#8a4a32" strokeWidth={2} fill="none" strokeLinecap="round" />}
      {mood === "sad" && <path d="M34,48.5 Q40,44.5 46,48.5" stroke="#8a4a32" strokeWidth={2} fill="none" strokeLinecap="round" />}
      {/* แก้มชมพู */}
      <ellipse cx={25} cy={42} rx={3.6} ry={2.4} fill="#f79b9b" opacity={0.65} />
      <ellipse cx={55} cy={42} rx={3.6} ry={2.4} fill="#f79b9b" opacity={0.65} />
      {/* เงาไล่มิติบนผม (2.5D) */}
      <path d="M17,32 Q15,10 40,9 Q65,10 63,32 Q62,20 52,17 Q42,13 30,17 Q20,21 17,32 Z" fill={`url(#${uid}-hair)`} opacity={0.8} />
      </g>
    </svg>
  );
}

/* ── UI แต่งตัวละคร ── */

export function AvatarPicker({ value, onChange, title = "แต่งตัวละครของฉัน" }: { value: AvatarConfig; onChange: (a: AvatarConfig) => void; title?: string }) {
  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="w-14 shrink-0 text-xs font-extrabold text-slate-500">{label}</span>
      {children}
    </div>
  );
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 rounded-2xl border-2 border-slate-200 bg-white/90 p-3">
      <div className="flex flex-col items-center gap-1">
        <ThaiAvatar a={value} mood="happy" size={92} />
        <span className="text-xs font-extrabold text-slate-500">{title}</span>
      </div>
      <div className="space-y-1.5">
        <Row label="สีผิว">
          {SKINS.map((s, i) => (
            <button key={i} onClick={() => onChange({ ...value, skin: i })} className={cn("h-6 w-6 rounded-full border-2 transition", value.skin === i ? "scale-110 border-slate-700" : "border-white ring-1 ring-slate-200")} style={{ background: s }} aria-label={`สีผิว ${i + 1}`} />
          ))}
        </Row>
        <Row label="ทรงผม">
          {HAIR_STYLES.map((h) => (
            <button key={h.id} onClick={() => onChange({ ...value, hairStyle: h.id })} className={cn("rounded-lg border-2 px-2 py-0.5 text-[11px] font-extrabold transition", value.hairStyle === h.id ? "border-violet-500 bg-violet-100 text-violet-700" : "border-slate-200 bg-white text-slate-500")}>{h.label}</button>
          ))}
        </Row>
        <Row label="สีผม">
          {HAIR_COLORS.map((c, i) => (
            <button key={i} onClick={() => onChange({ ...value, hairColor: i })} className={cn("h-6 w-6 rounded-full border-2 transition", value.hairColor === i ? "scale-110 border-slate-700" : "border-white ring-1 ring-slate-200")} style={{ background: c }} aria-label={`สีผม ${i + 1}`} />
          ))}
        </Row>
        <Row label="เสื้อ">
          {SHIRTS.map((c, i) => (
            <button key={i} onClick={() => onChange({ ...value, shirt: i })} className={cn("h-6 w-6 rounded-full border-2 transition", value.shirt === i ? "scale-110 border-slate-700" : "border-white ring-1 ring-slate-200")} style={{ background: c }} aria-label={`สีเสื้อ ${i + 1}`} />
          ))}
        </Row>
      </div>
    </div>
  );
}
