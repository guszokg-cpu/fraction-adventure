"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { FlaskConical, Eye, EyeOff, RotateCcw, Pencil, Check, X, Gamepad2 } from "lucide-react";
import { Frac } from "@/components/lessons/Frac";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────────────────────────
   โจทย์ปัญหา (ลักษณะที่ 7): หา "ทั้งหมด" จากส่วนที่ต่างกัน
   มี fracBefore ของถัง · เอาออก amount · เหลือ fracAfter ของถัง → ความจุ = ?
   หัวใจ: amount = (fracBefore − fracAfter) ของความจุ  ⇒  ความจุ = amount ÷ ผลต่าง
   เน้นภาพถังแบ่งส่วนให้เห็นว่า amount คือ "ส่วนที่หายไป"
   ───────────────────────────────────────────────────────────── */

const gcd = (a: number, b: number): number => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; };
const lcm = (a: number, b: number) => (a * b) / gcd(a, b);
const reduce = (n: number, d: number) => { const g = gcd(n, d) || 1; return { n: n / g, d: d / g }; };
const toMixed = (n: number, d: number) => { const r = reduce(n, d); return { whole: Math.floor(r.n / r.d), num: r.n % r.d, den: r.d }; };

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

const D = { container: "ถัง", content: "น้ำมัน", unit: "ลิตร", b1: 3, d1: 5, amount: 40, b2: 11, d2: 25 };

export function WPFindWhole() {
  const [container, setContainer] = useState(D.container);
  const [content, setContent] = useState(D.content);
  const [unit, setUnit] = useState(D.unit);
  const [b1, setB1] = useState(D.b1);
  const [d1, setD1] = useState(D.d1);
  const [amount, setAmount] = useState(D.amount);
  const [b2, setB2] = useState(D.b2);
  const [d2, setD2] = useState(D.d2);
  const [edit, setEdit] = useState(false);

  const [aw, setAw] = useState(0);
  const [an, setAn] = useState(0);
  const [ad, setAd] = useState(1);
  const [checked, setChecked] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  /* ── คำนวณโดยใช้ "ส่วนเท่า ๆ กัน" (ตัวส่วนร่วม) ── */
  const L = lcm(d1, d2);              // จำนวนส่วนทั้งถัง
  const b1p = b1 * (L / d1);          // ตอนแรกกี่ส่วน
  const b2p = b2 * (L / d2);          // เหลือกี่ส่วน
  const diffParts = b1p - b2p;        // ส่วนที่ตวงออก
  const invalid = diffParts <= 0;

  const cap = toMixed(L * amount, diffParts || 1);          // ความจุ
  const onePart = toMixed(amount, diffParts || 1);          // 1 ส่วน
  const beforeAmt = toMixed(b1p * amount, diffParts || 1);  // ปริมาณตอนแรก
  const afterAmt = toMixed(b2p * amount, diffParts || 1);   // ปริมาณที่เหลือ

  const beforePct = (b1p / L) * 100;
  const afterPct = (b2p / L) * 100;

  const studentImp = aw * ad + an;
  const correct = !invalid && studentImp * diffParts === L * amount * ad;

  function reset() { setChecked(false); setShowSolution(false); }
  function restore() {
    setContainer(D.container); setContent(D.content); setUnit(D.unit);
    setB1(D.b1); setD1(D.d1); setAmount(D.amount); setB2(D.b2); setD2(D.d2);
    setAw(0); setAn(0); setAd(1); reset();
  }

  const gridlines = L <= 30 ? Array.from({ length: L - 1 }, (_, i) => i + 1) : [];

  return (
    <div className="space-y-4">
      {/* แถบเครื่องมือครู */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-violet-200 bg-white/90 p-2.5">
        <div className="flex items-center gap-1.5 text-sm font-extrabold text-violet-700">
          <FlaskConical size={16} /> โจทย์ที่ 7 · หาความจุทั้งหมดจากส่วนที่ต่าง
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
            <span className="font-extrabold text-violet-700">ภาชนะ:</span>
            <input value={container} onChange={(e) => { setContainer(e.target.value); reset(); }} className="w-20 rounded-lg border-2 border-slate-200 px-2 py-1 font-bold outline-none focus:border-violet-400" />
            <span className="font-extrabold text-violet-700">ของเหลว:</span>
            <input value={content} onChange={(e) => { setContent(e.target.value); reset(); }} className="w-20 rounded-lg border-2 border-slate-200 px-2 py-1 font-bold outline-none focus:border-violet-400" />
            <span className="font-extrabold text-violet-700">หน่วย:</span>
            <input value={unit} onChange={(e) => { setUnit(e.target.value); reset(); }} className="w-16 rounded-lg border-2 border-slate-200 px-2 py-1 font-bold outline-none focus:border-violet-400" />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-extrabold text-violet-700">ตอนแรกมี</span>
            <NumField value={b1} min={0} onCommit={(n) => { setB1(n); reset(); }} className="w-11 rounded-lg border-2 border-slate-200 px-1 py-0.5 text-center font-bold outline-none focus:border-violet-400" />
            <span className="font-black text-slate-400">/</span>
            <NumField value={d1} min={1} onCommit={(n) => { setD1(n); reset(); }} className="w-11 rounded-lg border-2 border-slate-200 px-1 py-0.5 text-center font-bold outline-none focus:border-violet-400" />
            <span className="font-bold text-slate-400">· ตวงออก</span>
            <NumField value={amount} min={0} onCommit={(n) => { setAmount(n); reset(); }} className="w-16 rounded-lg border-2 border-slate-200 px-1 py-0.5 text-center font-bold outline-none focus:border-violet-400" />
            <span className="font-bold text-slate-400">{unit} · เหลือ</span>
            <NumField value={b2} min={0} onCommit={(n) => { setB2(n); reset(); }} className="w-11 rounded-lg border-2 border-slate-200 px-1 py-0.5 text-center font-bold outline-none focus:border-violet-400" />
            <span className="font-black text-slate-400">/</span>
            <NumField value={d2} min={1} onCommit={(n) => { setD2(n); reset(); }} className="w-11 rounded-lg border-2 border-slate-200 px-1 py-0.5 text-center font-bold outline-none focus:border-violet-400" />
          </div>
          {invalid && <p className="rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-extrabold text-amber-700">⚠️ เศษส่วน &ldquo;ตอนแรก&rdquo; ต้องมากกว่า &ldquo;เหลือ&rdquo; (เพราะตวงออกไปแล้วต้องน้อยลง)</p>}
        </div>
      )}

      {/* ── การ์ดโจทย์ ── */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="space-y-1.5 text-base font-bold leading-relaxed text-slate-700 sm:text-lg">
          <p>{container}ใบหนึ่งมี{content}อยู่ <Frac n={b1} d={d1} className="text-teal-600" /> ของความจุของ{container} เมื่อตวง{content}จาก{container}ออกไป <b className="text-rose-600">{amount} {unit}</b></p>
          <p>พบว่า มี{content}เหลืออยู่ <Frac n={b2} d={d2} className="text-amber-600" /> ของความจุของ{container}</p>
          <p className="font-extrabold text-violet-700">{container}ใบนี้มีความจุกี่{unit}?</p>
        </div>

        {/* ── ภาพถัง (หัวใจของข้อนี้) ── */}
        {!invalid && (
          <div className="mt-4 flex items-start justify-center gap-2 sm:gap-4">
            {/* ถัง */}
            <div className="relative h-72 w-24 shrink-0 sm:w-28">
              <div className="absolute inset-0 overflow-hidden rounded-b-2xl rounded-t-lg border-4 border-slate-400 bg-slate-50">
                {/* น้ำมันที่เหลือ (0 → after) */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-amber-400 to-amber-300" style={{ height: `${afterPct}%` }} />
                {/* ส่วนที่ตวงออก (after → before) */}
                <div className="absolute inset-x-0" style={{ bottom: `${afterPct}%`, height: `${beforePct - afterPct}%`, backgroundImage: "repeating-linear-gradient(45deg, #fecaca, #fecaca 6px, #fca5a5 6px, #fca5a5 12px)" }} />
                {/* เส้นแบ่งส่วน */}
                {gridlines.map((i) => (
                  <div key={i} className="absolute inset-x-0 border-t border-slate-300/50" style={{ bottom: `${(i / L) * 100}%` }} />
                ))}
                {/* เส้นระดับในถัง */}
                <div className="absolute inset-x-0 border-t-2 border-teal-500" style={{ bottom: `${beforePct}%` }} />
                <div className="absolute inset-x-0 border-t-2 border-amber-600" style={{ bottom: `${afterPct}%` }} />
              </div>
            </div>

            {/* คอลัมน์ป้ายระดับ (ชิดถัง) */}
            <div className="relative h-72 w-24 shrink-0 text-[11px] font-extrabold sm:w-28">
              <div className="absolute left-0 -translate-y-1/2" style={{ bottom: "calc(100% - 6px)" }}>
                <span className="rounded-md bg-slate-200 px-2 py-0.5 text-slate-600">ความจุ = ? {unit}</span>
              </div>
              <div className="absolute left-0 flex -translate-y-1/2 items-center gap-1" style={{ bottom: `${beforePct}%` }}>
                <span className="flex items-center gap-1 rounded-md bg-teal-100 px-2 py-0.5 text-teal-700">ตอนแรก <Frac n={b1} d={d1} /></span>
              </div>
              <div className="absolute left-0 flex -translate-y-1/2 items-center gap-1" style={{ bottom: `${afterPct}%` }}>
                <span className="flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-amber-700">เหลือ <Frac n={b2} d={d2} /></span>
              </div>
            </div>

            {/* คอลัมน์ callout ตวงออก (มีวงเล็บปีกกาชี้ช่วง) */}
            <div className="relative h-72 flex-1 text-[11px] font-extrabold">
              {/* วงเล็บช่วงที่ตวงออก */}
              <div className="absolute left-0 rounded-l-md border-y-2 border-l-2 border-rose-400" style={{ bottom: `${afterPct}%`, height: `${beforePct - afterPct}%`, width: 10 }} />
              <div className="absolute flex -translate-y-1/2 flex-col gap-0.5" style={{ left: 16, bottom: `${(afterPct + beforePct) / 2}%` }}>
                <span className="w-fit rounded-md bg-rose-500 px-2 py-0.5 text-white">ตวงออก {amount} {unit}</span>
                <span className="text-rose-500">= {diffParts} ส่วน (จาก {L} ส่วน)</span>
              </div>
            </div>
          </div>
        )}

        {/* ช่องเติมคำตอบ */}
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 p-3">
          <span className="text-sm font-extrabold text-slate-600">ตอบ: ความจุ{container} =</span>
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
            {correct ? <><Check size={18} /> เก่งมาก! ตอบถูกต้อง</> : <><X size={18} /> ยังไม่ใช่ — ดูภาพถังแล้วกด &ldquo;ดูวิธีคิด&rdquo; นะ</>}
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
          <p className="text-center text-sm font-extrabold text-amber-700">⚠️ ตอนนี้เศษส่วน &ldquo;ตอนแรก&rdquo; ไม่มากกว่า &ldquo;เหลือ&rdquo; — แก้ตัวเลขก่อนนะ</p>
        ) : (
          <div className="space-y-4">
            <h3 className="text-center text-lg font-extrabold text-emerald-800">💡 วิธีคิดทีละขั้น</h3>

            <div className="rounded-xl border border-emerald-200 bg-white p-3">
              <p className="text-sm font-extrabold text-slate-700">① ทำตัวส่วนให้เท่ากันก่อน จะได้เทียบเป็น &ldquo;ส่วนเท่า ๆ กัน&rdquo;</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-lg font-bold text-slate-700">
                ตอนแรก <Frac n={b1} d={d1} className="text-teal-600" /> = <Frac n={b1p} d={L} className="text-teal-600" /> ·
                เหลือ <Frac n={b2} d={d2} className="text-amber-600" /> = <Frac n={b2p} d={L} className="text-amber-600" />
              </div>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-white p-3">
              <p className="text-sm font-extrabold text-slate-700">② {content}ที่ตวงออก = ส่วนที่หายไป = ตอนแรก − เหลือ</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-lg font-bold text-slate-700">
                <Frac n={b1p} d={L} /> − <Frac n={b2p} d={L} /> = <Frac n={diffParts} d={L} className="text-rose-600" /> ของถัง
                <span className="text-base">และเท่ากับ <b className="text-rose-600">{amount} {unit}</b></span>
              </div>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-white p-3">
              <p className="text-sm font-extrabold text-slate-700">③ หา &ldquo;1 ส่วน&rdquo; ({diffParts} ส่วน = {amount} {unit})</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-lg font-bold text-slate-700">
                <Frac n={1} d={L} /> ของถัง = {amount} ÷ {diffParts} = <span className="text-violet-700"><Mixed whole={onePart.whole} num={onePart.num} den={onePart.den} size="sm" /> {unit}</span>
              </div>
            </div>

            <div className="rounded-xl border-2 border-emerald-300 bg-emerald-100/70 p-3 text-center">
              <p className="flex flex-wrap items-center justify-center gap-2 text-base font-extrabold text-emerald-800">
                ④ ทั้งถัง = <Frac n={L} d={L} /> = {L} × <Mixed whole={onePart.whole} num={onePart.num} den={onePart.den} size="sm" /> =
                <span className="rounded-lg bg-white px-2 py-1"><Mixed whole={cap.whole} num={cap.num} den={cap.den} size="sm" /></span> {unit}
              </p>
              <p className="mt-1.5 text-xs font-bold text-emerald-600/80">
                ตรวจ: ตอนแรก <Mixed whole={beforeAmt.whole} num={beforeAmt.num} den={beforeAmt.den} size="sm" /> − ตวงออก {amount} = เหลือ <Mixed whole={afterAmt.whole} num={afterAmt.num} den={afterAmt.den} size="sm" /> {unit} ✓
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ลิงก์ไปเกม */}
      <Link href="/lessons/subtract" className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-violet-300 bg-white px-4 py-3 text-sm font-extrabold text-violet-600 transition hover:bg-violet-50">
        <Gamepad2 size={17} /> ฝึกลบเศษส่วนให้คล่อง? ไปเล่นเกม &ldquo;ลบเศษส่วน&rdquo; →
      </Link>
    </div>
  );
}
