"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { FlaskConical, Eye, EyeOff, RotateCcw, Pencil, Check, X, Gamepad2 } from "lucide-react";
import { Frac } from "@/components/lessons/Frac";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────────────────────────
   โจทย์ปัญหา (ลักษณะที่ 5): หาพื้นที่/ปริมาณ "ส่วนที่เหลือ"
   ทั้งหมด × (1 − เศษส่วนที่ใช้) = ส่วนที่เหลือ  (เติมคำตอบ)
   ครูแก้ชื่อ/ตัวเลขได้ · ระบบคำนวณคำตอบ + เฉลยเห็นภาพให้อัตโนมัติ
   ───────────────────────────────────────────────────────────── */

const gcd = (a: number, b: number): number => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; };
const reduce = (n: number, d: number) => { const g = gcd(n, d); return { n: n / g, d: d / g }; };
const toMixedFrac = (n: number, d: number) => { const r = reduce(n, d); return { whole: Math.floor(r.n / r.d), num: r.n % r.d, den: r.d }; };

function NumField({ value, min = 0, onCommit, className }: { value: number; min?: number; onCommit: (n: number) => void; className?: string }) {
  const [raw, setRaw] = useState(String(value));
  const last = useRef(value);
  if (value !== last.current) {
    last.current = value;
    if (String(value) !== raw) setRaw(String(value));
  }
  return (
    <input
      type="text"
      inputMode="numeric"
      value={raw}
      onChange={(e) => {
        const t = e.target.value.replace(/[^0-9]/g, "");
        setRaw(t);
        const n = t === "" ? min : parseInt(t, 10);
        const committed = Math.max(min, Number.isFinite(n) ? n : min);
        last.current = committed;
        onCommit(committed);
      }}
      onBlur={() => setRaw(String(Math.max(min, parseInt(raw, 10) || min)))}
      className={className}
    />
  );
}

function Mixed({ whole, num, den, size = "md" }: { whole: number; num: number; den: number; size?: "sm" | "md" }) {
  const wc = size === "sm" ? "text-lg" : "text-2xl";
  if (num === 0) return <span className={cn("font-black text-slate-800", wc)}>{whole}</span>;
  return (
    <span className="inline-flex items-center gap-1 align-middle">
      {whole > 0 && <span className={cn("font-black text-slate-800", wc)}>{whole}</span>}
      <Frac n={num} d={den} className={cn("text-slate-800", size === "sm" ? "text-lg" : "text-xl")} />
    </span>
  );
}

const DEFAULTS = {
  person: "ปรีชา",
  landWhole: 12, landNum: 1, landDen: 2,   // ที่ดินทั้งหมด 12½ ไร่
  useNum: 11, useDen: 25,                   // ปลูกไม้ผล 11/25
  cropA: "ไม้ผล",
  cropB: "ยางพารา",
  unit: "ไร่",
};

export function WPRemainder() {
  const [person, setPerson] = useState(DEFAULTS.person);
  const [lw, setLw] = useState(DEFAULTS.landWhole);
  const [ln, setLn] = useState(DEFAULTS.landNum);
  const [ld, setLd] = useState(DEFAULTS.landDen);
  const [un, setUn] = useState(DEFAULTS.useNum);
  const [ud, setUd] = useState(DEFAULTS.useDen);
  const [cropA, setCropA] = useState(DEFAULTS.cropA);
  const [cropB, setCropB] = useState(DEFAULTS.cropB);
  const [unit, setUnit] = useState(DEFAULTS.unit);
  const [edit, setEdit] = useState(false);

  // คำตอบของนักเรียน
  const [aw, setAw] = useState(0);
  const [an, setAn] = useState(0);
  const [ad, setAd] = useState(1);
  const [checked, setChecked] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  /* คำนวณ (เก็บเป็นเศษส่วนเพื่อความแม่นยำ) */
  const Timp = lw * ld + ln;                 // ที่ดินทั้งหมด = Timp/ld
  const remN = ud - un, remD = ud;           // ส่วนที่เหลือ = (ud-un)/ud
  const invalid = un >= ud;                  // ใช้เกิน 1 ส่วน = ไม่ถูกต้อง
  const rubberN = remN * Timp, rubberD = remD * ld;   // ยางพารา = remFrac × ทั้งหมด
  const ans = toMixedFrac(Math.max(0, rubberN), rubberD);
  const usedArea = toMixedFrac(un * Timp, ud * ld);    // พื้นที่ไม้ผล (ไว้โชว์)
  const land = { whole: lw, num: ln, den: ld };

  const studentImp = aw * ad + an;
  const correct = !invalid && studentImp * rubberD === rubberN * ad;

  function reset() { setChecked(false); setShowSolution(false); }
  function restore() {
    setPerson(DEFAULTS.person); setLw(DEFAULTS.landWhole); setLn(DEFAULTS.landNum); setLd(DEFAULTS.landDen);
    setUn(DEFAULTS.useNum); setUd(DEFAULTS.useDen); setCropA(DEFAULTS.cropA); setCropB(DEFAULTS.cropB); setUnit(DEFAULTS.unit);
    setAw(0); setAn(0); setAd(1); reset();
  }

  const usePct = Math.min(100, (un / ud) * 100);
  const remPct = Math.max(0, 100 - usePct);

  return (
    <div className="space-y-4">
      {/* แถบเครื่องมือครู */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-violet-200 bg-white/90 p-2.5">
        <div className="flex items-center gap-1.5 text-sm font-extrabold text-violet-700">
          <FlaskConical size={16} /> โจทย์ที่ 5 · หาส่วนที่เหลือ (เติมคำตอบ)
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setEdit((v) => !v)} className={cn("flex items-center gap-1 rounded-lg border-2 px-2.5 py-1 text-xs font-extrabold transition", edit ? "border-violet-400 bg-violet-100 text-violet-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
            <Pencil size={13} /> แก้โจทย์ (ชื่อ/ตัวเลข)
          </button>
          <button onClick={() => setShowSolution((v) => !v)} className={cn("flex items-center gap-1 rounded-lg border-2 px-2.5 py-1 text-xs font-extrabold transition", showSolution ? "border-emerald-400 bg-emerald-100 text-emerald-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
            {showSolution ? <EyeOff size={13} /> : <Eye size={13} />} เฉลย
          </button>
          <button onClick={restore} className="flex items-center gap-1 rounded-lg border-2 border-slate-200 bg-white px-2.5 py-1 text-xs font-extrabold text-slate-500 hover:bg-slate-50">
            <RotateCcw size={13} /> ค่าเริ่มต้น
          </button>
        </div>
      </div>

      {/* แผงแก้โจทย์ */}
      {edit && (
        <div className="space-y-2.5 rounded-2xl border-2 border-violet-200 bg-violet-50/60 p-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-extrabold text-violet-700">ชื่อ:</span>
            <input value={person} onChange={(e) => { setPerson(e.target.value); reset(); }} className="w-24 rounded-lg border-2 border-slate-200 px-2 py-1 font-bold outline-none focus:border-violet-400" />
            <span className="font-extrabold text-violet-700">หน่วย:</span>
            <input value={unit} onChange={(e) => { setUnit(e.target.value); reset(); }} className="w-16 rounded-lg border-2 border-slate-200 px-2 py-1 font-bold outline-none focus:border-violet-400" />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-extrabold text-violet-700">ที่ดินทั้งหมด:</span>
            <span className="text-xs font-bold text-slate-400">เต็ม</span>
            <NumField value={lw} min={0} onCommit={(n) => { setLw(n); reset(); }} className="w-12 rounded-lg border-2 border-slate-200 px-1 py-0.5 text-center font-bold outline-none focus:border-violet-400" />
            <span className="text-xs font-bold text-slate-400">เศษ</span>
            <NumField value={ln} min={0} onCommit={(n) => { setLn(n); reset(); }} className="w-12 rounded-lg border-2 border-slate-200 px-1 py-0.5 text-center font-bold outline-none focus:border-violet-400" />
            <span className="font-black text-slate-400">/</span>
            <NumField value={ld} min={1} onCommit={(n) => { setLd(n); reset(); }} className="w-12 rounded-lg border-2 border-slate-200 px-1 py-0.5 text-center font-bold outline-none focus:border-violet-400" />
            <span className="ml-1 font-bold text-slate-400">{unit}</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <input value={cropA} onChange={(e) => { setCropA(e.target.value); reset(); }} className="w-20 rounded-lg border-2 border-slate-200 px-2 py-0.5 font-extrabold text-emerald-600 outline-none focus:border-violet-400" />
            <span className="font-extrabold text-violet-700">ใช้ไป</span>
            <NumField value={un} min={0} onCommit={(n) => { setUn(n); reset(); }} className="w-12 rounded-lg border-2 border-slate-200 px-1 py-0.5 text-center font-bold outline-none focus:border-violet-400" />
            <span className="font-black text-slate-400">/</span>
            <NumField value={ud} min={1} onCommit={(n) => { setUd(n); reset(); }} className="w-12 rounded-lg border-2 border-slate-200 px-1 py-0.5 text-center font-bold outline-none focus:border-violet-400" />
            <span className="font-bold text-slate-400">ที่เหลือปลูก</span>
            <input value={cropB} onChange={(e) => { setCropB(e.target.value); reset(); }} className="w-24 rounded-lg border-2 border-slate-200 px-2 py-0.5 font-extrabold text-amber-600 outline-none focus:border-violet-400" />
          </div>
          {invalid && <p className="rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-extrabold text-amber-700">⚠️ เศษส่วนที่ใช้ต้องน้อยกว่า 1 (ตัวเศษน้อยกว่าตัวส่วน) จึงจะมีพื้นที่เหลือ</p>}
        </div>
      )}

      {/* ── การ์ดโจทย์ (แบบข้อสอบ) ── */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="space-y-1.5 text-base font-bold leading-relaxed text-slate-700 sm:text-lg">
          <p>{person}มีที่ดินอยู่แปลงหนึ่งซึ่งมีพื้นที่ <Mixed whole={land.whole} num={land.num} den={land.den} /> {unit}</p>
          <p>ปลูก<span className="text-emerald-600">{cropA}</span> <Frac n={un} d={ud} className="text-emerald-600" /> ของพื้นที่ที่ดินแปลงนี้ พื้นที่ที่เหลือปลูก<span className="text-amber-600">{cropB}</span></p>
          <p className="font-extrabold text-violet-700">{person}ปลูก{cropB}กี่{unit}?</p>
        </div>

        {/* แถบที่ดินแบ่งสัดส่วน */}
        <div className="mt-3">
          <p className="mb-1 text-xs font-bold text-slate-400">ที่ดินทั้งหมด <Mixed whole={land.whole} num={land.num} den={land.den} size="sm" /> {unit}</p>
          <div className="flex h-11 w-full overflow-hidden rounded-xl ring-1 ring-slate-200">
            <div className="flex items-center justify-center bg-emerald-400 text-xs font-extrabold text-white" style={{ width: `${usePct}%` }}>
              {usePct > 18 && <span className="px-1 text-center leading-tight">{cropA}</span>}
            </div>
            <div className="flex items-center justify-center bg-amber-400 text-xs font-extrabold text-white" style={{ width: `${remPct}%` }}>
              {remPct > 18 && <span className="px-1 text-center leading-tight">{cropB} = ?</span>}
            </div>
          </div>
        </div>

        {/* ช่องเติมคำตอบ */}
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 p-3">
          <span className="text-sm font-extrabold text-slate-600">ตอบ: {person}ปลูก{cropB} =</span>
          <NumField value={aw} min={0} onCommit={(n) => { setAw(n); setChecked(false); }} className="w-14 rounded-lg border-2 border-slate-200 px-1.5 py-1 text-center text-base font-bold outline-none focus:border-violet-400" />
          <span className="flex items-center gap-1 text-xs font-bold text-slate-400">
            เศษ
            <NumField value={an} min={0} onCommit={(n) => { setAn(n); setChecked(false); }} className="w-11 rounded-lg border-2 border-slate-200 px-1 py-1 text-center text-sm font-bold outline-none focus:border-violet-400" />
            <span className="font-black text-slate-400">/</span>
            <NumField value={ad} min={1} onCommit={(n) => { setAd(n); setChecked(false); }} className="w-11 rounded-lg border-2 border-slate-200 px-1 py-1 text-center text-sm font-bold outline-none focus:border-violet-400" />
          </span>
          <span className="text-sm font-extrabold text-slate-600">{unit}</span>
          <button onClick={() => setChecked(true)} className="ml-auto rounded-xl bg-violet-600 px-4 py-1.5 text-sm font-extrabold text-white shadow transition hover:bg-violet-700 active:scale-95">
            ตรวจคำตอบ
          </button>
        </div>
        {checked && (
          <p className={cn("mt-2 flex items-center justify-center gap-1.5 text-base font-extrabold", correct ? "text-emerald-700" : "text-rose-600")}>
            {correct ? <><Check size={18} /> เก่งมาก! ตอบถูกต้อง</> : <><X size={18} /> ยังไม่ใช่ — ลองกด &ldquo;ดูวิธีคิด&rdquo; ดูนะ</>}
          </p>
        )}
      </div>

      {/* ── เฉลยแบบเห็นภาพ ── */}
      <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 p-4">
        {!showSolution ? (
          <button onClick={() => setShowSolution(true)} className="mx-auto flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-base font-extrabold text-white shadow transition hover:bg-emerald-700 active:scale-[0.98]">
            <Eye size={18} /> ดูวิธีคิดทีละขั้น
          </button>
        ) : invalid ? (
          <p className="text-center text-sm font-extrabold text-amber-700">⚠️ ตอนนี้เศษส่วนที่ใช้ ≥ 1 จึงไม่มีพื้นที่เหลือ — แก้ตัวเลขให้ตัวเศษน้อยกว่าตัวส่วนก่อน</p>
        ) : (
          <div className="space-y-4">
            <h3 className="text-center text-lg font-extrabold text-emerald-800">💡 วิธีคิดทีละขั้น</h3>

            {/* ขั้น 1 — หาเศษส่วนของส่วนที่เหลือ */}
            <div className="rounded-xl border border-emerald-200 bg-white p-3">
              <p className="text-sm font-extrabold text-slate-700">① ทั้งแปลงคือ 1 ส่วน — ปลูก{cropA}ไป <Frac n={un} d={ud} /> เหลือให้{cropB}เท่าไร?</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-lg font-bold text-slate-700">
                <span>ที่เหลือ = 1 −</span> <Frac n={un} d={ud} /> <span>=</span> <Frac n={ud} d={ud} /> <span>−</span> <Frac n={un} d={ud} /> <span>=</span> <Frac n={remN} d={remD} className="text-amber-600" />
              </div>
            </div>

            {/* ขั้น 2 — คูณกับพื้นที่ทั้งหมด */}
            <div className="rounded-xl border border-emerald-200 bg-white p-3">
              <p className="text-sm font-extrabold text-slate-700">② พื้นที่{cropB} = เศษส่วนที่เหลือ × ที่ดินทั้งหมด</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg bg-slate-50 px-3 py-2 text-lg font-bold text-slate-700">
                <Frac n={remN} d={remD} className="text-amber-600" /> <span>ของ</span> <Mixed whole={land.whole} num={land.num} den={land.den} size="sm" />
                <span>=</span> <Frac n={remN} d={remD} /> <span>×</span> <Frac n={Timp} d={ld} />
                <span>=</span> <Frac n={remN * Timp} d={remD * ld} />
              </div>
            </div>

            {/* ขั้น 3 — คำตอบ */}
            <div className="rounded-xl border-2 border-emerald-300 bg-emerald-100/70 p-3 text-center">
              <p className="flex flex-wrap items-center justify-center gap-2 text-base font-extrabold text-emerald-800">
                ③ {person}ปลูก{cropB} = <span className="rounded-lg bg-white px-2 py-1"><Mixed whole={ans.whole} num={ans.num} den={ans.den} size="sm" /></span> {unit}
              </p>
              <p className="mt-1 text-xs font-bold text-emerald-600/80">
                (ตรวจ: {cropA} <Mixed whole={usedArea.whole} num={usedArea.num} den={usedArea.den} size="sm" /> + {cropB} <Mixed whole={ans.whole} num={ans.num} den={ans.den} size="sm" /> = ที่ดินทั้งหมด <Mixed whole={land.whole} num={land.num} den={land.den} size="sm" /> {unit})
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ลิงก์ไปเกม */}
      <Link href="/lessons/multiply" className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-violet-300 bg-white px-4 py-3 text-sm font-extrabold text-violet-600 transition hover:bg-violet-50">
        <Gamepad2 size={17} /> ฝึกหาเศษส่วนของจำนวน? ไปเล่นเกม &ldquo;คูณเศษส่วน&rdquo; →
      </Link>
    </div>
  );
}
