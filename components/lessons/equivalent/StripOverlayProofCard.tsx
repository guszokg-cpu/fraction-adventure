"use client";

import { useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Hand, RotateCcw, Sparkles, Check, X, MoveHorizontal, MoveVertical } from "lucide-react";
import { FractionStack } from "@/components/lessons/equivalent/EquivalentMath";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────────
   ทาบแถบพิสูจน์ 🤚 — "เท่ากันจริงไหม ลองทาบดู"
   จำลองกิจกรรมจริงในห้อง : ลากแถบที่สองไปทาบแถบแรกให้ "ขอบตรงกัน"
   แล้วดูว่าส่วนที่ระบายสียาว/สูงเท่ากันหรือไม่ (หลักฐานพิสูจน์ความเท่ากัน)
   เลือกได้ 2 แนว — แนวนอน (ทาบปลายซ้าย เหมือนแถบกระดาษ/ช็อกโกแลต)
   และแนวตั้ง (ทาบปลายล่าง เหมือนระดับน้ำในโหล/ตู้ปลา)
   ครูตั้งเศษส่วนทั้งสองแถบได้ + มีปุ่มโจทย์สำเร็จรูปจากสถานการณ์ช็อกโกแลต/ตู้ปลา
   ───────────────────────────────────────────── */

const DENS = [2, 3, 4, 5, 6, 8, 10, 12];
const SNAP = 26; // ระยะที่ถือว่า "ทาบตรง" แล้วดูดเข้าที่ (พิกเซล) — เผื่อไว้ให้เด็กลากบนจอสัมผัสง่าย

type Frac = { n: number; d: number };
type Orient = "h" | "v";

const PRESETS: { label: string; a: Frac; b: Frac; hint: string; orient?: Orient }[] = [
  { label: "🍫 พี่ต้น–น้องน้ำ", a: { n: 1, d: 2 }, b: { n: 2, d: 4 }, hint: "พี่ต้นกิน 1 จาก 2 ชิ้น · น้องน้ำกิน 2 จาก 4 ชิ้น", orient: "h" },
  { label: "🐟 ตู้ปลา", a: { n: 2, d: 3 }, b: { n: 4, d: 6 }, hint: "ระดับน้ำเดียวกัน อ่านด้วยแถบคนละแบบ", orient: "v" },
  { label: "⚠️ กับดักบวก", a: { n: 1, d: 2 }, b: { n: 2, d: 3 }, hint: "บวก 1 ทั้งบนล่าง — จะเท่ากันจริงไหม?" },
];

function Strip({ n, d, tone, ghost, orient }: { n: number; d: number; tone: "teal" | "violet"; ghost?: boolean; orient: Orient }) {
  const fill = tone === "teal" ? "#0d9488" : "#7c3aed";
  const pct = (n / d) * 100;

  if (orient === "v") {
    return (
      <div
        className={cn("relative h-44 w-16 overflow-hidden rounded-lg border-[3px] bg-white sm:h-52 sm:w-20", ghost && "opacity-70")}
        style={{ borderColor: fill }}
      >
        {/* ส่วนที่ระบายสี (ไล่จากล่างขึ้นบน เหมือนระดับน้ำ) */}
        <div className="absolute inset-x-0 bottom-0" style={{ height: `${pct}%`, background: fill, opacity: ghost ? 0.55 : 0.85 }} />
        {/* เส้นแบ่งช่อง (แนวนอน) */}
        {Array.from({ length: d - 1 }, (_, i) => (
          <div key={i} className="absolute inset-x-0 border-t-2 border-dashed" style={{ bottom: `${((i + 1) / d) * 100}%`, borderColor: "#00000033" }} />
        ))}
        {/* เส้นระดับปลายส่วนที่ระบาย (หลักฐานเทียบความสูง) */}
        <div className="absolute inset-x-0 h-[3px]" style={{ bottom: `calc(${pct}% - 1.5px)`, background: fill }} />
      </div>
    );
  }
  return (
    <div
      className={cn("relative h-14 w-full overflow-hidden rounded-lg border-[3px] bg-white sm:h-16", ghost && "opacity-70")}
      style={{ borderColor: fill }}
    >
      {/* ส่วนที่ระบายสี */}
      <div className="absolute inset-y-0 left-0" style={{ width: `${pct}%`, background: fill, opacity: ghost ? 0.55 : 0.85 }} />
      {/* เส้นแบ่งช่อง */}
      {Array.from({ length: d - 1 }, (_, i) => (
        <div key={i} className="absolute inset-y-0 border-l-2 border-dashed" style={{ left: `${((i + 1) / d) * 100}%`, borderColor: "#00000033" }} />
      ))}
      {/* เส้นปลายส่วนที่ระบาย (หลักฐานเทียบความยาว) */}
      <div className="absolute inset-y-0 w-[3px]" style={{ left: `calc(${pct}% - 1.5px)`, background: fill }} />
    </div>
  );
}

/* ค่าเริ่มต้นของแถบที่ลาก (เยื้องจากตำแหน่งทาบตรงพอดี) — แยกตามแนว เพราะขนาดแถบต่างกัน */
const DEFAULT_OFFSET: Record<Orient, { x: number; y: number }> = {
  h: { x: 78, y: 92 },
  v: { x: 96, y: -46 },
};

export function StripOverlayProofCard() {
  const [orient, setOrient] = useState<Orient>("h");
  const [a, setA] = useState<Frac>({ n: 1, d: 2 });
  const [b, setB] = useState<Frac>({ n: 2, d: 4 });
  const [hint, setHint] = useState(PRESETS[0].hint);

  /* ตำแหน่งแถบที่ลากได้ (0,0 = ทาบตรงพอดี) */
  const [pos, setPos] = useState(DEFAULT_OFFSET.h);
  const [dragging, setDragging] = useState(false);
  const draggingRef = useRef(false);   // อ่านได้ทันทีใน handler (state อัปเดตช้ากว่า 1 เฟรม ทำให้ลากเร็ว ๆ หลุด)
  const startRef = useRef({ px: 0, py: 0, x: 0, y: 0 });

  const snapped = pos.x === 0 && pos.y === 0;
  const equal = a.n * b.d === b.n * a.d;

  function reset(nx = DEFAULT_OFFSET[orient].x, ny = DEFAULT_OFFSET[orient].y) {
    setPos({ x: nx, y: ny });
  }
  function switchOrient(o: Orient) {
    setOrient(o);
    setPos(DEFAULT_OFFSET[o]);
  }
  function applyPreset(p: (typeof PRESETS)[number]) {
    setA(p.a); setB(p.b); setHint(p.hint);
    const o = p.orient ?? orient;
    setOrient(o);
    setPos(DEFAULT_OFFSET[o]);
  }
  function setFrac(which: "a" | "b", patch: Partial<Frac>) {
    const cur = which === "a" ? a : b;
    const next = { ...cur, ...patch };
    if (next.n > next.d) next.n = next.d;      // ตัวเศษห้ามเกินตัวส่วน (แถบเดียว)
    (which === "a" ? setA : setB)(next);
    setHint("");
    reset();
  }

  function onPointerDown(e: React.PointerEvent) {
    // จับ pointer ไว้กับแถบ เพื่อให้ลากออกนอกกรอบแล้วยังลากต่อได้
    // (ห่อ try ไว้ — บางเบราว์เซอร์/อุปกรณ์อาจโยน error แล้วทำให้ลากไม่ติดทั้งอัน)
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch { /* ลากต่อได้ตามปกติ */ }
    startRef.current = { px: e.clientX, py: e.clientY, x: pos.x, y: pos.y };
    draggingRef.current = true;
    setDragging(true);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!draggingRef.current) return;
    const dx = e.clientX - startRef.current.px;
    const dy = e.clientY - startRef.current.py;
    setPos({ x: startRef.current.x + dx, y: startRef.current.y + dy });
  }
  function onPointerUp() {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);
    setPos((p) => (Math.abs(p.x) < SNAP && Math.abs(p.y) < SNAP ? { x: 0, y: 0 } : p));
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-500 px-4 py-2.5 text-white">
        <Hand size={20} />
        <h2 className="text-lg font-extrabold">ทาบแถบพิสูจน์ — เท่ากันจริงไหม?</h2>
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        {/* ── สลับแนว ── */}
        <div className="flex items-center justify-center gap-1 rounded-xl border-2 border-slate-200 bg-slate-50 p-1">
          <button
            onClick={() => switchOrient("h")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition",
              orient === "h" ? "bg-white text-teal-700 shadow" : "text-slate-500 hover:bg-white/60"
            )}
          >
            <MoveHorizontal size={15} /> แนวนอน (ทาบแถบ)
          </button>
          <button
            onClick={() => switchOrient("v")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-extrabold transition",
              orient === "v" ? "bg-white text-teal-700 shadow" : "text-slate-500 hover:bg-white/60"
            )}
          >
            <MoveVertical size={15} /> แนวตั้ง (ระดับน้ำ)
          </button>
        </div>

        <p className="text-center text-sm font-bold text-slate-600 sm:text-base">
          ลาก<span className="text-violet-700">แถบสีม่วง</span>ไปทาบ<span className="text-teal-700">แถบสีเขียว</span> ให้{" "}
          <b>{orient === "h" ? "ปลายซ้ายตรงกัน" : "ปลายล่างตรงกัน"}</b> —
          แล้วดูว่าส่วนที่ระบายสี{orient === "h" ? "ยาว" : "สูง"}เท่ากันหรือไม่
        </p>

        {/* ── เวทีทาบแถบ ── */}
        <div
          className={cn(
            "select-none overflow-hidden rounded-2xl border-2 border-teal-100 bg-gradient-to-b from-teal-50/60 to-white px-4 pb-4 pt-3 sm:px-6",
            orient === "v" ? "flex items-start justify-center gap-4 sm:gap-6" : "relative"
          )}
          style={{ height: orient === "h" ? 250 : 320 }}
        >
          {/* กลุ่มแถบ (เขียว+ม่วง) — แนวนอนใช้ relative เต็มกล่อง / แนวตั้งเป็นคอลัมน์ซ้าย ให้ผลลัพธ์อยู่ข้าง ๆ ไม่ทับกัน */}
          <div className={cn(orient === "h" ? "relative h-full" : "relative shrink-0")}>
            {orient === "h" ? (
              /* เส้นไกด์ปลายซ้าย (แนวนอน) */
              <div
                className={cn("pointer-events-none absolute bottom-4 top-3 border-l-[3px] border-dashed transition-colors", snapped ? "border-emerald-500" : "border-slate-300")}
                style={{ left: "1rem" }}
              />
            ) : (
              /* เส้นไกด์ปลายล่าง (แนวตั้ง) */
              <div
                className={cn("pointer-events-none absolute inset-x-0 border-b-[3px] border-dashed transition-colors", snapped ? "border-emerald-500" : "border-slate-300")}
                style={{ bottom: "3.5rem" }}
              />
            )}

            {/* แถบอ้างอิง (เขียว) */}
            <div className={cn(orient === "v" && "flex flex-col items-center")}>
              <div className={cn(orient === "h" ? "mb-1 flex items-center gap-2" : "mb-1 flex flex-col items-center gap-0.5")}>
                <FractionStack top={a.n} bottom={a.d} className="text-lg text-teal-700" />
                <span className="whitespace-nowrap text-xs font-extrabold text-teal-600">แถบอ้างอิง (อยู่กับที่)</span>
              </div>

              {/* ตัวยึดตำแหน่ง : แถบม่วงเป็นลูกของแถบเขียว → pos (0,0) = ซ้อนทับพอดีเสมอ ไม่ต้องคำนวณค่าคงที่ */}
              <div className="relative">
                <Strip n={a.n} d={a.d} tone="teal" orient={orient} />

                {/* แถบลากได้ (ม่วง) — ป้ายอยู่ด้านตรงข้ามแถบอ้างอิง กันชนกันตอนซ้อนทับ */}
                <div
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerUp}
                  className={cn(
                    "absolute touch-none rounded-xl transition-shadow",
                    orient === "h" ? "inset-x-0 top-0" : "inset-y-0 left-0",
                    dragging ? "cursor-grabbing shadow-2xl" : "cursor-grab shadow-lg",
                    snapped && "ring-4 ring-emerald-400/60"
                  )}
                  style={{
                    transform: `translate(${pos.x}px, ${pos.y}px)`,
                    transition: dragging ? "none" : "transform 0.22s cubic-bezier(.34,1.4,.5,1)",
                  }}
                >
                  <Strip n={b.n} d={b.d} tone="violet" ghost={snapped} orient={orient} />
                  {/* ป้ายนี้จะชนกล่องผลลัพธ์ตอนทาบตรง (โดยเฉพาะแนวนอนที่วางผลลัพธ์ไว้ด้านล่าง) — ซ่อนไปเลยเพราะกล่องผลลัพธ์บอกซ้ำอยู่แล้ว */}
                  {!snapped && (
                    <div className={cn(orient === "h" ? "mt-1 flex items-center gap-2" : "mt-1 flex flex-col items-center gap-0.5")}>
                      <FractionStack top={b.n} bottom={b.d} className="text-lg text-violet-700" />
                      <span className="whitespace-nowrap text-xs font-extrabold text-violet-600">👆 ลากแถบนี้ไปทาบ</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ป้ายผลการพิสูจน์ (แนวนอน) — วางไว้ใต้แถบ เพราะแถบแนวนอนเตี้ยและกว้าง มีที่ว่างด้านล่างพอ */}
            {orient === "h" && snapped && (
              <div
                className={cn(
                  "absolute inset-x-4 bottom-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-xl border-2 px-3 py-2 text-center text-sm font-extrabold sm:inset-x-6 sm:text-base",
                  equal ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-rose-300 bg-rose-50 text-rose-600"
                )}
              >
                {equal ? (
                  <>
                    <Check size={18} className="shrink-0" /> ปลายส่วนที่ระบายตรงกันพอดี →
                    <FractionStack top={a.n} bottom={a.d} className="text-base" /> = <FractionStack top={b.n} bottom={b.d} className="text-base" />
                    <span className="text-emerald-600">เท่ากัน!</span>
                  </>
                ) : (
                  <>
                    <X size={18} className="shrink-0" /> ปลายส่วนที่ระบาย<b>ไม่ตรงกัน</b> →
                    <FractionStack top={a.n} bottom={a.d} className="text-base" /> ≠ <FractionStack top={b.n} bottom={b.d} className="text-base" />
                    <span className="text-rose-500">ไม่เท่ากัน</span>
                  </>
                )}
              </div>
            )}
          </div>

          {/* ป้ายผลการพิสูจน์ (แนวตั้ง) — วางไว้ "ข้าง" แถบแทนด้านล่าง กันไม่ให้ทับแท่งน้ำที่สูงเต็มพื้นที่ */}
          {orient === "v" && (
            <div
              className={cn(
                "flex w-[130px] shrink-0 self-center flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 text-center text-xs font-extrabold transition-opacity duration-200 sm:w-[150px] sm:text-sm",
                snapped ? "opacity-100" : "pointer-events-none opacity-0",
                equal ? "border-emerald-300 bg-emerald-50 text-emerald-700" : "border-rose-300 bg-rose-50 text-rose-600"
              )}
            >
              {equal ? <Check size={20} /> : <X size={20} />}
              <span>ปลายระดับสี{equal ? "ตรงกันพอดี" : "ไม่ตรงกัน"}</span>
              <div className="flex items-center gap-1.5">
                <FractionStack top={a.n} bottom={a.d} className="text-sm" />
                <span>{equal ? "=" : "≠"}</span>
                <FractionStack top={b.n} bottom={b.d} className="text-sm" />
              </div>
              <span className={equal ? "text-emerald-600" : "text-rose-500"}>{equal ? "เท่ากัน!" : "ไม่เท่ากัน"}</span>
            </div>
          )}
        </div>

        {hint && <p className="text-center text-xs font-bold text-slate-400 sm:text-sm">💡 {hint}</p>}

        {/* ── โจทย์สำเร็จรูป ── */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className="rounded-xl border-2 border-slate-200 bg-white px-3 py-1.5 text-sm font-extrabold text-slate-600 transition hover:border-teal-300 hover:bg-teal-50 active:scale-95"
            >
              {p.label}
            </button>
          ))}
          <button
            onClick={() => reset()}
            className="flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-3 py-1.5 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50 active:scale-95"
          >
            <RotateCcw size={14} /> วางแถบใหม่
          </button>
        </div>

        {/* ── ตั้งค่าครู ── */}
        <div className="grid gap-2 rounded-2xl border-2 border-slate-200 bg-slate-50/70 p-3 sm:grid-cols-2">
          {([
            { key: "a" as const, f: a, label: "แถบอ้างอิง", tone: "teal" },
            { key: "b" as const, f: b, label: "แถบที่ลาก", tone: "violet" },
          ]).map(({ key, f, label, tone }) => (
            <div key={key} className="space-y-1.5">
              <p className={cn("text-xs font-extrabold", tone === "teal" ? "text-teal-700" : "text-violet-700")}>🧑‍🏫 {label}</p>
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-xs font-bold text-slate-400">ระบาย</span>
                {Array.from({ length: f.d + 1 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setFrac(key, { n: i })}
                    className={cn(
                      "h-7 w-7 rounded-lg border-2 text-sm font-extrabold transition",
                      f.n === i
                        ? tone === "teal" ? "border-teal-500 bg-teal-100 text-teal-700" : "border-violet-500 bg-violet-100 text-violet-700"
                        : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    {i}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-1">
                <span className="text-xs font-bold text-slate-400">แบ่ง</span>
                {DENS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setFrac(key, { d })}
                    className={cn(
                      "h-7 w-7 rounded-lg border-2 text-sm font-extrabold transition",
                      f.d === d
                        ? tone === "teal" ? "border-teal-500 bg-teal-100 text-teal-700" : "border-violet-500 bg-violet-100 text-violet-700"
                        : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="flex items-center justify-center gap-1.5 text-center text-xs font-bold text-slate-400">
          <Sparkles size={13} /> ทาบแล้วปลายตรงกัน = เท่ากัน · ปลายเลยหรือขาด = ไม่เท่ากัน — เหมือนที่ทาบแถบกระดาษจริงในห้องเลย
        </p>
      </div>
    </Card>
  );
}
