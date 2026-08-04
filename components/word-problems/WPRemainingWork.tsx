"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { FlaskConical, Eye, EyeOff, RotateCcw, Pencil, Check, X, Gamepad2 } from "lucide-react";
import { Frac } from "@/components/lessons/Frac";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────────────────────────
   โจทย์ปัญหา (ลักษณะที่ 8): ทำงานไปหลายส่วน หา "ส่วนที่เหลือ" เป็นปริมาณจริง
   เหลือ = (1 − ผลรวมเศษส่วนที่ทำแล้ว) × ปริมาณทั้งหมด
   เน้นภาพถนนแบ่งช่วง วันแรก/วันสอง/เหลือ
   ───────────────────────────────────────────────────────────── */

type Portion = { label: string; num: number; den: number };

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
const MixOf = ({ n, d, size }: { n: number; d: number; size?: "sm" | "md" }) => { const m = toMixed(n, d); return <Mixed whole={m.whole} num={m.num} den={m.den} size={size} />; };

const D = {
  who: "หมู่บ้านแห่งหนึ่ง", thing: "ถนน", verb: "ซ่อม", unit: "กิโลเมตร",
  tw: 2, tn: 1, td: 4,          // ถนนยาว 2¼ กม.
  portions: [
    { label: "วันแรก", num: 2, den: 5 },
    { label: "วันที่สอง", num: 1, den: 2 },
  ] as Portion[],
};

const SEG_COLORS = ["#60a5fa", "#a78bfa", "#38bdf8", "#fbbf24"];

export function WPRemainingWork() {
  const [who, setWho] = useState(D.who);
  const [thing, setThing] = useState(D.thing);
  const [verb, setVerb] = useState(D.verb);
  const [unit, setUnit] = useState(D.unit);
  const [tw, setTw] = useState(D.tw);
  const [tn, setTn] = useState(D.tn);
  const [td, setTd] = useState(D.td);
  const [portions, setPortions] = useState<Portion[]>(D.portions);
  const [edit, setEdit] = useState(false);

  const [aw, setAw] = useState(0);
  const [an, setAn] = useState(0);
  const [ad, setAd] = useState(1);
  const [checked, setChecked] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  /* ── คำนวณด้วยส่วนเท่า ๆ กัน ── */
  const L = portions.reduce((acc, p) => lcm(acc, p.den), 1);
  const partsEach = portions.map((p) => p.num * (L / p.den));
  const sumParts = partsEach.reduce((a, b) => a + b, 0);
  const remParts = L - sumParts;
  const invalid = remParts <= 0;

  const Timp = tw * td + tn, Tden = td;                          // ทั้งหมด
  const remaining = toMixed(remParts * Timp, L * Tden);          // ส่วนที่เหลือ (ปริมาณ)
  const sumFrac = reduce(sumParts, L);                           // ผลรวมที่ทำแล้ว (เศษส่วน)
  const portionLen = portions.map((p) => toMixed(p.num * Timp, p.den * Tden));

  const studentImp = aw * ad + an;
  const correct = !invalid && studentImp * (L * Tden) === remParts * Timp * ad;

  function reset() { setChecked(false); setShowSolution(false); }
  function setPortion(i: number, patch: Partial<Portion>) { setPortions((prev) => prev.map((p, k) => (k === i ? { ...p, ...patch } : p))); reset(); }
  function restore() {
    setWho(D.who); setThing(D.thing); setVerb(D.verb); setUnit(D.unit);
    setTw(D.tw); setTn(D.tn); setTd(D.td); setPortions(D.portions);
    setAw(0); setAn(0); setAd(1); reset();
  }

  return (
    <div className="space-y-4">
      {/* แถบเครื่องมือครู */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-violet-200 bg-white/90 p-2.5">
        <div className="flex items-center gap-1.5 text-sm font-extrabold text-violet-700">
          <FlaskConical size={16} /> โจทย์ที่ 8 · ทำไปหลายส่วน หาที่เหลือ
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
            <input value={who} onChange={(e) => { setWho(e.target.value); reset(); }} className="w-32 rounded-lg border-2 border-slate-200 px-2 py-1 font-bold outline-none focus:border-violet-400" />
            <span className="font-extrabold text-violet-700">สิ่งของ:</span>
            <input value={thing} onChange={(e) => { setThing(e.target.value); reset(); }} className="w-20 rounded-lg border-2 border-slate-200 px-2 py-1 font-bold outline-none focus:border-violet-400" />
            <span className="font-extrabold text-violet-700">หน่วย:</span>
            <input value={unit} onChange={(e) => { setUnit(e.target.value); reset(); }} className="w-24 rounded-lg border-2 border-slate-200 px-2 py-1 font-bold outline-none focus:border-violet-400" />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-extrabold text-violet-700">ทั้งหมด:</span>
            <NumField value={tw} min={0} onCommit={(n) => { setTw(n); reset(); }} className="w-12 rounded-lg border-2 border-slate-200 px-1 py-0.5 text-center font-bold outline-none focus:border-violet-400" />
            <NumField value={tn} min={0} onCommit={(n) => { setTn(n); reset(); }} className="w-12 rounded-lg border-2 border-slate-200 px-1 py-0.5 text-center font-bold outline-none focus:border-violet-400" />
            <span className="font-black text-slate-400">/</span>
            <NumField value={td} min={1} onCommit={(n) => { setTd(n); reset(); }} className="w-12 rounded-lg border-2 border-slate-200 px-1 py-0.5 text-center font-bold outline-none focus:border-violet-400" />
            <span className="font-bold text-slate-400">{unit}</span>
          </div>
          {portions.map((p, i) => (
            <div key={i} className="flex flex-wrap items-center gap-1.5">
              <span className="h-3.5 w-3.5 rounded-full" style={{ background: SEG_COLORS[i % SEG_COLORS.length] }} />
              <input value={p.label} onChange={(e) => setPortion(i, { label: e.target.value })} className="w-24 rounded-lg border-2 border-slate-200 px-2 py-0.5 font-extrabold outline-none focus:border-violet-400" />
              <span className="font-bold text-slate-400">{verb}ได้</span>
              <NumField value={p.num} min={0} onCommit={(n) => setPortion(i, { num: n })} className="w-11 rounded-lg border-2 border-slate-200 px-1 py-0.5 text-center font-bold outline-none focus:border-violet-400" />
              <span className="font-black text-slate-400">/</span>
              <NumField value={p.den} min={1} onCommit={(n) => setPortion(i, { den: n })} className="w-11 rounded-lg border-2 border-slate-200 px-1 py-0.5 text-center font-bold outline-none focus:border-violet-400" />
              <span className="text-xs font-bold text-slate-400">ของทั้งหมด</span>
            </div>
          ))}
          {invalid && <p className="rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-extrabold text-amber-700">⚠️ ผลรวมเศษส่วนที่ทำแล้วต้องน้อยกว่า 1 จึงจะมีส่วนเหลือ</p>}
        </div>
      )}

      {/* ── การ์ดโจทย์ ── */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="space-y-1.5 text-base font-bold leading-relaxed text-slate-700 sm:text-lg">
          <p>{who}ต้องการ{verb}{thing}ยาว <MixOf n={Timp} d={Tden} /> {unit}</p>
          {portions.map((p, i) => (
            <p key={i}>{p.label}{verb}ได้ <span style={{ color: SEG_COLORS[i % SEG_COLORS.length] }}><Frac n={p.num} d={p.den} /></span> ของความยาว{thing}ที่ต้องการ{verb}</p>
          ))}
          <p className="font-extrabold text-violet-700">{who}ต้อง{verb}{thing}อีกกี่{unit}จึงจะเสร็จ?</p>
        </div>

        {/* ── ภาพถนนแบ่งช่วง ── */}
        {!invalid && (
          <div className="mt-4">
            <p className="mb-1 text-xs font-bold text-slate-400">ถนนทั้งเส้น <MixOf n={Timp} d={Tden} size="sm" /> {unit}</p>
            <div className="relative flex h-12 w-full overflow-hidden rounded-xl ring-2 ring-slate-300">
              {portions.map((p, i) => (
                <div key={i} className="flex items-center justify-center text-[11px] font-extrabold text-white" style={{ width: `${(p.num / p.den) * 100}%`, background: SEG_COLORS[i % SEG_COLORS.length] }}>
                  {(p.num / p.den) * 100 > 14 && <span className="px-1 text-center leading-tight">{p.label}</span>}
                </div>
              ))}
              <div className="flex items-center justify-center bg-rose-400 text-[11px] font-extrabold text-white" style={{ width: `${(remParts / L) * 100}%`, backgroundImage: "repeating-linear-gradient(45deg, #fb7185, #fb7185 6px, #f43f5e 6px, #f43f5e 12px)" }}>
                {(remParts / L) * 100 > 10 && <span className="px-1 text-center leading-tight">เหลือ = ?</span>}
              </div>
              {/* เส้นกลางถนน */}
              <div className="pointer-events-none absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2" style={{ backgroundImage: "repeating-linear-gradient(90deg, #fff, #fff 10px, transparent 10px, transparent 20px)" }} />
            </div>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] font-bold">
              {portions.map((p, i) => (
                <span key={i} className="flex items-center gap-1" style={{ color: SEG_COLORS[i % SEG_COLORS.length] }}>
                  ● {p.label} <Frac n={p.num} d={p.den} />
                </span>
              ))}
              <span className="flex items-center gap-1 text-rose-500">● เหลือ = ?</span>
            </div>
          </div>
        )}

        {/* ช่องเติมคำตอบ */}
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 p-3">
          <span className="text-sm font-extrabold text-slate-600">ตอบ: ต้อง{verb}อีก =</span>
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
            {correct ? <><Check size={18} /> เก่งมาก! ตอบถูกต้อง</> : <><X size={18} /> ยังไม่ใช่ — ดูภาพถนนแล้วกด &ldquo;ดูวิธีคิด&rdquo; นะ</>}
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
          <p className="text-center text-sm font-extrabold text-amber-700">⚠️ ผลรวมเศษส่วนที่ทำแล้ว ≥ 1 จึงไม่มีส่วนเหลือ — แก้ตัวเลขก่อนนะ</p>
        ) : (
          <div className="space-y-4">
            <h3 className="text-center text-lg font-extrabold text-emerald-800">💡 วิธีคิดทีละขั้น</h3>

            <div className="rounded-xl border border-emerald-200 bg-white p-3">
              <p className="text-sm font-extrabold text-slate-700">① รวมส่วนที่{verb}แล้วทั้งหมด (ทำตัวส่วนให้เท่ากัน)</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-lg font-bold text-slate-700">
                {portions.map((p, i) => (
                  <span key={i} className="flex items-center gap-2">
                    {i > 0 && <span>+</span>}
                    <Frac n={p.num} d={p.den} />
                  </span>
                ))}
                <span>=</span>
                {portions.map((p, i) => (
                  <span key={i} className="flex items-center gap-2">
                    {i > 0 && <span>+</span>}
                    <Frac n={partsEach[i]} d={L} />
                  </span>
                ))}
                <span>=</span> <Frac n={sumFrac.n} d={sumFrac.d} className="text-blue-600" />
              </div>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-white p-3">
              <p className="text-sm font-extrabold text-slate-700">② ส่วนที่เหลือ = 1 − ส่วนที่{verb}แล้ว</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-lg font-bold text-slate-700">
                1 − <Frac n={sumParts} d={L} /> = <Frac n={L} d={L} /> − <Frac n={sumParts} d={L} /> = <Frac n={remParts} d={L} className="text-rose-600" /> ของถนน
              </div>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-white p-3">
              <p className="text-sm font-extrabold text-slate-700">③ ความยาวที่เหลือ = ส่วนที่เหลือ × ความยาวทั้งหมด</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-lg font-bold text-slate-700">
                <Frac n={remParts} d={L} /> × <MixOf n={Timp} d={Tden} size="sm" /> = <Frac n={remParts} d={L} /> × <Frac n={Timp} d={Tden} /> = <Frac n={remParts * Timp} d={L * Tden} />
              </div>
            </div>

            <div className="rounded-xl border-2 border-emerald-300 bg-emerald-100/70 p-3 text-center">
              <p className="flex flex-wrap items-center justify-center gap-2 text-base font-extrabold text-emerald-800">
                ④ ต้อง{verb}อีก <span className="rounded-lg bg-white px-2 py-1"><Mixed whole={remaining.whole} num={remaining.num} den={remaining.den} size="sm" /></span> {unit}
              </p>
              <p className="mt-1.5 flex flex-wrap items-center justify-center gap-1 text-xs font-bold text-emerald-600/80">
                ตรวจ:
                {portions.map((p, i) => (
                  <span key={i} className="flex items-center gap-1">{i > 0 && "+"} {p.label} <Mixed whole={portionLen[i].whole} num={portionLen[i].num} den={portionLen[i].den} size="sm" /></span>
                ))}
                + เหลือ <Mixed whole={remaining.whole} num={remaining.num} den={remaining.den} size="sm" /> = <MixOf n={Timp} d={Tden} size="sm" /> {unit} ✓
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ลิงก์ไปเกม */}
      <Link href="/lessons/add" className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-violet-300 bg-white px-4 py-3 text-sm font-extrabold text-violet-600 transition hover:bg-violet-50">
        <Gamepad2 size={17} /> ฝึกบวกเศษส่วนให้คล่อง? ไปเล่นเกม &ldquo;บวกเศษส่วน&rdquo; →
      </Link>
    </div>
  );
}
