"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { FlaskConical, Eye, EyeOff, RotateCcw, Pencil, Check, X, AlertTriangle, Gamepad2 } from "lucide-react";
import { Frac } from "@/components/lessons/Frac";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────────────────────────
   โจทย์ปัญหา (ลักษณะที่ 9): เศษส่วน "ของที่เหลือ" (ฐานเปลี่ยน!)
   เช้าขาย f1 ของทั้งหมด · บ่ายขาย f2 ของ "ที่เหลือ" (ไม่ใช่ทั้งหมด)
   หัวใจ: ช่วงบ่ายคิดจากที่เหลือ ไม่ใช่จากจำนวนเดิม — เน้นด้วยภาพ 2 แถบ
   ───────────────────────────────────────────────────────────── */

const gcd = (a: number, b: number): number => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; };
const toMixed = (n: number, d: number) => { const g = gcd(n, d) || 1; n /= g; d /= g; return { whole: Math.floor(n / d), num: n % d, den: d }; };

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
const MixOf = ({ n, d, size }: { n: number; d: number; size?: "sm" | "md" }) => { const m = toMixed(n, d); return <Mixed whole={m.whole} num={m.num} den={m.den} size={size} />; };

const D = {
  who: "พ่อค้า", item: "มังคุด", unit: "กิโลกรัม",
  tw: 90, tn: 0, td: 1,
  s1label: "ช่วงเช้า", f1n: 1, f1d: 5,
  s2label: "ช่วงบ่าย", f2n: 2, f2d: 3,
};

export function WPFractionOfRemainder() {
  const [who, setWho] = useState(D.who);
  const [item, setItem] = useState(D.item);
  const [unit, setUnit] = useState(D.unit);
  const [tw, setTw] = useState(D.tw);
  const [tn, setTn] = useState(D.tn);
  const [td, setTd] = useState(D.td);
  const [s1, setS1] = useState(D.s1label);
  const [f1n, setF1n] = useState(D.f1n);
  const [f1d, setF1d] = useState(D.f1d);
  const [s2, setS2] = useState(D.s2label);
  const [f2n, setF2n] = useState(D.f2n);
  const [f2d, setF2d] = useState(D.f2d);
  const [edit, setEdit] = useState(false);

  const [aw, setAw] = useState(0);
  const [an, setAn] = useState(0);
  const [ad, setAd] = useState(1);
  const [checked, setChecked] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const invalid = f1n >= f1d || f2n > f2d;

  const Timp = tw * td + tn, Tden = td;
  const morning = toMixed(f1n * Timp, f1d * Tden);                          // เช้าขาย
  const remN = (f1d - f1n) * Timp, remD = f1d * Tden;                       // ที่เหลือหลังเช้า
  const remaining = toMixed(remN, remD);
  const afternoon = toMixed(f2n * remN, f2d * remD);                        // บ่ายขาย (คำตอบ)
  const leftover = toMixed((f2d - f2n) * remN, f2d * remD);                 // เหลือสุดท้าย

  const studentImp = aw * ad + an;
  const correct = !invalid && studentImp * (f2d * remD) === f2n * remN * ad;

  // เปอร์เซ็นต์สำหรับแถบ
  const morningPct = (f1n / f1d) * 100;
  const remPct = 100 - morningPct;
  const afternoonPct = (f2n / f2d) * 100;
  const leftoverPct = 100 - afternoonPct;

  function reset() { setChecked(false); setShowSolution(false); }
  function restore() {
    setWho(D.who); setItem(D.item); setUnit(D.unit); setTw(D.tw); setTn(D.tn); setTd(D.td);
    setS1(D.s1label); setF1n(D.f1n); setF1d(D.f1d); setS2(D.s2label); setF2n(D.f2n); setF2d(D.f2d);
    setAw(0); setAn(0); setAd(1); reset();
  }

  return (
    <div className="space-y-4">
      {/* แถบเครื่องมือครู */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-violet-200 bg-white/90 p-2.5">
        <div className="flex items-center gap-1.5 text-sm font-extrabold text-violet-700">
          <FlaskConical size={16} /> โจทย์ที่ 9 · เศษส่วนของ &ldquo;ที่เหลือ&rdquo;
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
            <span className="font-extrabold text-violet-700">ใคร:</span>
            <input value={who} onChange={(e) => { setWho(e.target.value); reset(); }} className="w-20 rounded-lg border-2 border-slate-200 px-2 py-1 font-bold outline-none focus:border-violet-400" />
            <span className="font-extrabold text-violet-700">ของ:</span>
            <input value={item} onChange={(e) => { setItem(e.target.value); reset(); }} className="w-20 rounded-lg border-2 border-slate-200 px-2 py-1 font-bold outline-none focus:border-violet-400" />
            <span className="font-extrabold text-violet-700">หน่วย:</span>
            <input value={unit} onChange={(e) => { setUnit(e.target.value); reset(); }} className="w-24 rounded-lg border-2 border-slate-200 px-2 py-1 font-bold outline-none focus:border-violet-400" />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-extrabold text-violet-700">ทั้งหมด:</span>
            <NumField value={tw} min={0} onCommit={(n) => { setTw(n); reset(); }} className="w-14 rounded-lg border-2 border-slate-200 px-1 py-0.5 text-center font-bold outline-none focus:border-violet-400" />
            <NumField value={tn} min={0} onCommit={(n) => { setTn(n); reset(); }} className="w-10 rounded-lg border-2 border-slate-200 px-1 py-0.5 text-center font-bold outline-none focus:border-violet-400" />
            <span className="font-black text-slate-400">/</span>
            <NumField value={td} min={1} onCommit={(n) => { setTd(n); reset(); }} className="w-10 rounded-lg border-2 border-slate-200 px-1 py-0.5 text-center font-bold outline-none focus:border-violet-400" />
            <span className="font-bold text-slate-400">{unit}</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <input value={s1} onChange={(e) => { setS1(e.target.value); reset(); }} className="w-20 rounded-lg border-2 border-slate-200 px-2 py-0.5 font-extrabold text-amber-600 outline-none focus:border-violet-400" />
            <span className="font-bold text-slate-400">ขาย</span>
            <NumField value={f1n} min={0} onCommit={(n) => { setF1n(n); reset(); }} className="w-10 rounded-lg border-2 border-slate-200 px-1 py-0.5 text-center font-bold outline-none focus:border-violet-400" />
            <span className="font-black text-slate-400">/</span>
            <NumField value={f1d} min={1} onCommit={(n) => { setF1d(n); reset(); }} className="w-10 rounded-lg border-2 border-slate-200 px-1 py-0.5 text-center font-bold outline-none focus:border-violet-400" />
            <span className="text-xs font-bold text-slate-400">ของทั้งหมด</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <input value={s2} onChange={(e) => { setS2(e.target.value); reset(); }} className="w-20 rounded-lg border-2 border-slate-200 px-2 py-0.5 font-extrabold text-fuchsia-600 outline-none focus:border-violet-400" />
            <span className="font-bold text-slate-400">ขาย</span>
            <NumField value={f2n} min={0} onCommit={(n) => { setF2n(n); reset(); }} className="w-10 rounded-lg border-2 border-slate-200 px-1 py-0.5 text-center font-bold outline-none focus:border-violet-400" />
            <span className="font-black text-slate-400">/</span>
            <NumField value={f2d} min={1} onCommit={(n) => { setF2d(n); reset(); }} className="w-10 rounded-lg border-2 border-slate-200 px-1 py-0.5 text-center font-bold outline-none focus:border-violet-400" />
            <span className="text-xs font-bold text-fuchsia-500">ของ &ldquo;ที่เหลือ&rdquo;</span>
          </div>
          {invalid && <p className="rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-extrabold text-amber-700">⚠️ ตรวจตัวเลข: เศษส่วนช่วงแรกต้องน้อยกว่า 1 และช่วงสองไม่เกิน 1</p>}
        </div>
      )}

      {/* ── การ์ดโจทย์ ── */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="space-y-1.5 text-base font-bold leading-relaxed text-slate-700 sm:text-lg">
          <p>{who}ซื้อ{item}มาขาย <MixOf n={Timp} d={Tden} /> {unit}</p>
          <p><span className="text-amber-600">{s1}</span>ขายไป <span className="text-amber-600"><Frac n={f1n} d={f1d} /></span> ของ{item}ที่ซื้อมา</p>
          <p><span className="text-fuchsia-600">{s2}</span>ขายได้อีก <span className="text-fuchsia-600"><Frac n={f2n} d={f2d} /></span> ของ{item}<u className="decoration-fuchsia-400 decoration-2">ที่เหลือ</u></p>
          <p className="font-extrabold text-violet-700">{s2}{who}ขาย{item}ได้เท่าไร?</p>
        </div>

        {/* ── ภาพ 2 แถบ (หัวใจ: ฐานเปลี่ยน) ── */}
        {!invalid && (
          <div className="mt-4 space-y-3">
            {/* แถบ 1: ทั้งหมด */}
            <div>
              <p className="mb-1 text-xs font-bold text-slate-400">① {item}ทั้งหมด <MixOf n={Timp} d={Tden} size="sm" /> {unit}</p>
              <div className="flex h-11 w-full overflow-hidden rounded-xl ring-2 ring-slate-300">
                <div className="flex items-center justify-center bg-amber-400 px-1 text-center text-[11px] font-extrabold leading-tight text-white" style={{ width: `${morningPct}%` }}>
                  {morningPct > 14 && <span>{s1}<br />ขาย <MixOf n={f1n * Timp} d={f1d * Tden} size="sm" /></span>}
                </div>
                <div className="flex items-center justify-center border-l-2 border-dashed border-white bg-slate-300 px-1 text-center text-[11px] font-extrabold leading-tight text-slate-600" style={{ width: `${remPct}%` }}>
                  ที่เหลือ <MixOf n={remN} d={remD} size="sm" /> {unit}
                </div>
              </div>
            </div>

            {/* คำเตือนฐานเปลี่ยน */}
            <div className="flex items-center justify-center gap-1.5 rounded-lg bg-fuchsia-50 px-3 py-1.5 text-center text-xs font-extrabold text-fuchsia-700">
              <AlertTriangle size={14} /> {s2}ขาย <Frac n={f2n} d={f2d} /> ของ &ldquo;ที่เหลือ <MixOf n={remN} d={remD} size="sm" /> {unit}&rdquo; — ไม่ใช่ของ <MixOf n={Timp} d={Tden} size="sm" />!
            </div>

            {/* แถบ 2: ซูมดูที่เหลือ */}
            <div>
              <p className="mb-1 text-xs font-bold text-slate-400">② ซูมดู &ldquo;ที่เหลือ&rdquo; <MixOf n={remN} d={remD} size="sm" /> {unit} → แบ่งเป็น {f2d} ส่วน</p>
              <div className="flex h-11 w-full overflow-hidden rounded-xl ring-2 ring-fuchsia-300">
                <div className="flex items-center justify-center bg-fuchsia-500 px-1 text-center text-[11px] font-extrabold leading-tight text-white" style={{ width: `${afternoonPct}%` }}>
                  {afternoonPct > 14 && <span>{s2}ขาย = ?</span>}
                </div>
                <div className="flex items-center justify-center bg-slate-300 px-1 text-center text-[11px] font-extrabold leading-tight text-slate-600" style={{ width: `${leftoverPct}%` }}>
                  {leftoverPct > 12 && <span>เหลือ <MixOf n={(f2d - f2n) * remN} d={f2d * remD} size="sm" /></span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ช่องเติมคำตอบ */}
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 p-3">
          <span className="text-sm font-extrabold text-slate-600">ตอบ: {s2}ขายได้ =</span>
          <NumField value={aw} min={0} onCommit={(n) => { setAw(n); setChecked(false); }} className="w-16 rounded-lg border-2 border-slate-200 px-1.5 py-1 text-center text-base font-bold outline-none focus:border-violet-400" />
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
            {correct ? <><Check size={18} /> เก่งมาก! ตอบถูกต้อง</> : <><X size={18} /> ยังไม่ใช่ — ระวัง! บ่ายคิดจาก &ldquo;ที่เหลือ&rdquo; กด &ldquo;ดูวิธีคิด&rdquo;</>}
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
          <p className="text-center text-sm font-extrabold text-amber-700">⚠️ ตรวจตัวเลขก่อนนะ (ช่วงแรก &lt; 1, ช่วงสอง ≤ 1)</p>
        ) : (
          <div className="space-y-4">
            <h3 className="text-center text-lg font-extrabold text-emerald-800">💡 วิธีคิดทีละขั้น</h3>

            <div className="rounded-xl border border-emerald-200 bg-white p-3">
              <p className="text-sm font-extrabold text-slate-700">① {s1}ขาย = <Frac n={f1n} d={f1d} /> ของทั้งหมด</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-lg font-bold text-slate-700">
                <Frac n={f1n} d={f1d} /> × <MixOf n={Timp} d={Tden} size="sm" /> = <span className="text-amber-600"><MixOf n={f1n * Timp} d={f1d * Tden} size="sm" /> {unit}</span>
              </div>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-white p-3">
              <p className="text-sm font-extrabold text-slate-700">② เหลือ = ทั้งหมด − {s1}ที่ขาย</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-lg font-bold text-slate-700">
                <MixOf n={Timp} d={Tden} size="sm" /> − <MixOf n={f1n * Timp} d={f1d * Tden} size="sm" /> = <span className="text-slate-700"><MixOf n={remN} d={remD} size="sm" /> {unit}</span>
              </div>
            </div>

            <div className="rounded-xl border-2 border-fuchsia-300 bg-fuchsia-50 p-3">
              <p className="flex items-center gap-1.5 text-sm font-extrabold text-fuchsia-700"><AlertTriangle size={15} /> ③ {s2}ขาย = <Frac n={f2n} d={f2d} /> ของ &ldquo;ที่เหลือ&rdquo; (<MixOf n={remN} d={remD} size="sm" /> {unit}) — ไม่ใช่ของทั้งหมด!</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg bg-white px-3 py-2 text-lg font-bold text-slate-700">
                <Frac n={f2n} d={f2d} /> × <MixOf n={remN} d={remD} size="sm" /> = <span className="text-fuchsia-600"><MixOf n={f2n * remN} d={f2d * remD} size="sm" /> {unit}</span>
              </div>
            </div>

            <div className="rounded-xl border-2 border-emerald-300 bg-emerald-100/70 p-3 text-center">
              <p className="flex flex-wrap items-center justify-center gap-2 text-base font-extrabold text-emerald-800">
                ④ {s2}ขายได้ <span className="rounded-lg bg-white px-2 py-1"><Mixed whole={afternoon.whole} num={afternoon.num} den={afternoon.den} size="sm" /></span> {unit}
              </p>
              <p className="mt-1.5 text-xs font-bold text-emerald-600/80">
                ตรวจ: {s1} <MixOf n={f1n * Timp} d={f1d * Tden} size="sm" /> + {s2} <Mixed whole={afternoon.whole} num={afternoon.num} den={afternoon.den} size="sm" /> + เหลือ <Mixed whole={leftover.whole} num={leftover.num} den={leftover.den} size="sm" /> = <MixOf n={Timp} d={Tden} size="sm" /> {unit} ✓
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
