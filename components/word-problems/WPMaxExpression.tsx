"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { FlaskConical, Eye, EyeOff, RotateCcw, Pencil, Check, Star, Eraser, Gamepad2 } from "lucide-react";
import { Frac } from "@/components/lessons/Frac";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────────────────────────
   โจทย์ปัญหา (ลักษณะที่ 6): เติมเลขในช่องให้ผลลัพธ์มากที่สุด
   เลือกเลข 4 ตัว (ไม่ซ้ำ) ใส่ (a/b) − (c/d) ให้มากสุด
   มีโซนทดลองวางเลขเอง + ช้อยคำตอบ · ระบบหาค่ามากสุดจริงเอง (brute force)
   ───────────────────────────────────────────────────────────── */

type Op = "sub" | "add";
type Choice = { whole: number; num: number; den: number };

const gcd = (a: number, b: number): number => { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a || 1; };
const reduce = (n: number, d: number) => { const g = gcd(n, d) || 1; return { n: n / g, d: d / g }; };
const toMixed = (n: number, d: number) => { const r = reduce(Math.abs(n), d); return { sign: n < 0 ? -1 : 1, whole: Math.floor(r.n / r.d), num: r.n % r.d, den: r.d }; };

const DEFAULT_DIGITS = [2, 3, 4, 5, 6];
const DEFAULT_CHOICES: Choice[] = [
  { whole: 1, num: 1, den: 3 }, // 1⅓
  { whole: 1, num: 3, den: 5 }, // 1⅗
  { whole: 2, num: 2, den: 5 }, // 2⅖  ✓
  { whole: 2, num: 2, den: 3 }, // 2⅔
];

/* หาผลลัพธ์มากที่สุดจากทุกการจัดวาง (เลือก 4 ตัวไม่ซ้ำ) */
function findBest(digits: number[], op: Op) {
  let best: { num: number; den: number; t: number[] } | null = null;
  const n = digits.length;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) for (let k = 0; k < n; k++) for (let l = 0; l < n; l++) {
    if (i === j || i === k || i === l || j === k || j === l || k === l) continue;
    const a = digits[i], b = digits[j], c = digits[k], d = digits[l];
    const num = op === "sub" ? a * d - c * b : a * d + c * b;
    const den = b * d;
    if (!best || num * best.den > best.num * den) best = { num, den, t: [a, b, c, d] };
  }
  return best;
}

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

function Mixed({ sign = 1, whole, num, den, size = "md" }: { sign?: number; whole: number; num: number; den: number; size?: "sm" | "md" }) {
  const wc = size === "sm" ? "text-lg" : "text-2xl";
  const neg = sign < 0 ? "−" : "";
  if (num === 0) return <span className={cn("font-black text-slate-800", wc)}>{neg}{whole}</span>;
  return (
    <span className="inline-flex items-center gap-1 align-middle">
      {(whole > 0 || sign < 0) && <span className={cn("font-black text-slate-800", wc)}>{neg}{whole}</span>}
      <Frac n={num} d={den} className={cn("text-slate-800", size === "sm" ? "text-lg" : "text-xl")} />
    </span>
  );
}

export function WPMaxExpression() {
  const [digits, setDigits] = useState<number[]>(DEFAULT_DIGITS);
  const [op, setOp] = useState<Op>("sub");
  const [choices, setChoices] = useState<Choice[]>(DEFAULT_CHOICES);
  const [edit, setEdit] = useState(false);

  // โซนทดลอง
  const [boxes, setBoxes] = useState<(number | null)[]>([null, null, null, null]);
  const [selBox, setSelBox] = useState<number>(0);

  // ช้อย
  const [picked, setPicked] = useState<number | null>(null);
  const [showSolution, setShowSolution] = useState(false);

  const best = findBest(digits, op) ?? { num: 0, den: 1, t: [0, 0, 0, 0] };
  const bestMixed = toMixed(best.num, best.den);
  const answerIdx = choices.findIndex((c) => (c.whole * c.den + c.num) * best.den === best.num * c.den);
  const leftover = digits.filter((d) => !best.t.includes(d));

  const opSym = op === "sub" ? "−" : "+";
  const used = boxes.filter((b) => b !== null) as number[];
  const filled = boxes.every((b) => b !== null);
  let cur: { num: number; den: number } | null = null;
  if (filled) {
    const [a, b, c, d] = boxes as number[];
    cur = { num: op === "sub" ? a * d - c * b : a * d + c * b, den: b * d };
  }
  const curMixed = cur ? toMixed(cur.num, cur.den) : null;
  const curIsMax = cur ? cur.num * best.den === best.num * cur.den : false;

  function reset() { setPicked(null); setShowSolution(false); }
  function restore() { setDigits(DEFAULT_DIGITS); setOp("sub"); setChoices(DEFAULT_CHOICES); setBoxes([null, null, null, null]); setSelBox(0); reset(); }
  function placeDigit(d: number) {
    if (used.includes(d)) return;
    setBoxes((prev) => {
      const nx = [...prev];
      nx[selBox] = d;
      return nx;
    });
    const nextEmpty = boxes.findIndex((b, i) => b === null && i !== selBox);
    setSelBox(nextEmpty === -1 ? selBox : nextEmpty);
  }
  function clearBox(i: number) { setBoxes((prev) => prev.map((b, k) => (k === i ? null : b))); setSelBox(i); }
  function setChoice(i: number, patch: Partial<Choice>) { setChoices((prev) => prev.map((c, k) => (k === i ? { ...c, ...patch } : c))); reset(); }
  function setDigit(i: number, v: number) { setDigits((prev) => prev.map((d, k) => (k === i ? v : d))); setBoxes([null, null, null, null]); setSelBox(0); reset(); }

  const Box = ({ i }: { i: number }) => (
    <button
      onClick={() => (boxes[i] !== null ? clearBox(i) : setSelBox(i))}
      className={cn("grid h-11 w-11 place-items-center rounded-lg border-2 text-xl font-black transition",
        selBox === i && boxes[i] === null ? "border-violet-500 bg-violet-100 text-violet-700 ring-2 ring-violet-200" :
        boxes[i] !== null ? "border-violet-400 bg-white text-violet-700" : "border-dashed border-slate-300 bg-slate-50 text-slate-300")}
    >
      {boxes[i] ?? "?"}
    </button>
  );
  const FracBoxes = ({ top, bot }: { top: number; bot: number }) => (
    <div className="flex flex-col items-center gap-1">
      <Box i={top} />
      <div className="h-1 w-12 rounded-full bg-slate-700" />
      <Box i={bot} />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* แถบเครื่องมือครู */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-violet-200 bg-white/90 p-2.5">
        <div className="flex items-center gap-1.5 text-sm font-extrabold text-violet-700">
          <FlaskConical size={16} /> โจทย์ที่ 6 · เติมเลขให้ผลลัพธ์มากที่สุด
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setEdit((v) => !v)} className={cn("flex items-center gap-1 rounded-lg border-2 px-2.5 py-1 text-xs font-extrabold transition", edit ? "border-violet-400 bg-violet-100 text-violet-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
            <Pencil size={13} /> แก้โจทย์ (เลข/ช้อย)
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
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-extrabold text-violet-700">เลขโดดที่ให้:</span>
            {digits.map((d, i) => (
              <NumField key={i} value={d} min={1} onCommit={(n) => setDigit(i, n)} className="w-11 rounded-lg border-2 border-slate-200 px-1 py-0.5 text-center font-bold outline-none focus:border-violet-400" />
            ))}
            <span className="ml-2 font-extrabold text-violet-700">เครื่องหมาย:</span>
            <select value={op} onChange={(e) => { setOp(e.target.value as Op); setBoxes([null, null, null, null]); setSelBox(0); reset(); }} className="rounded-lg border-2 border-slate-200 px-2 py-1 font-bold outline-none focus:border-violet-400">
              <option value="sub">ลบ (−)</option>
              <option value="add">บวก (+)</option>
            </select>
          </div>
          <div>
            <p className="mb-1.5 font-extrabold text-violet-700">ช้อย 4 ข้อ (ระบบจะ mark ข้อที่เท่ากับค่ามากที่สุด)</p>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {choices.map((c, i) => (
                <div key={i} className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-2">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs font-extrabold text-slate-500">{i + 1}</span>
                  <span className="text-xs font-bold text-slate-400">เต็ม</span>
                  <NumField value={c.whole} min={0} onCommit={(n) => setChoice(i, { whole: n })} className="w-10 rounded-lg border-2 border-slate-200 px-1 py-0.5 text-center font-bold outline-none focus:border-violet-400" />
                  <span className="text-xs font-bold text-slate-400">เศษ</span>
                  <NumField value={c.num} min={0} onCommit={(n) => setChoice(i, { num: n })} className="w-10 rounded-lg border-2 border-slate-200 px-1 py-0.5 text-center font-bold outline-none focus:border-violet-400" />
                  <span className="font-black text-slate-400">/</span>
                  <NumField value={c.den} min={1} onCommit={(n) => setChoice(i, { den: n })} className="w-10 rounded-lg border-2 border-slate-200 px-1 py-0.5 text-center font-bold outline-none focus:border-violet-400" />
                  <span className={cn("ml-auto rounded-md px-2 py-0.5 text-xs font-extrabold", answerIdx === i ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400")}>
                    {answerIdx === i ? "✓ มากสุด" : ""}
                  </span>
                </div>
              ))}
            </div>
            {answerIdx < 0 && <p className="mt-1.5 rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-extrabold text-amber-700">⚠️ ยังไม่มีช้อยข้อไหนตรงกับค่ามากที่สุด — ปรับช้อยให้มี 1 ข้อที่ตรง</p>}
          </div>
        </div>
      )}

      {/* ── การ์ดโจทย์ ── */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="space-y-1.5 text-base font-bold leading-relaxed text-slate-700 sm:text-lg">
          <p>กำหนดเลขโดด {digits.length} ตัว คือ {digits.join(", ")}</p>
          <p>ถ้าเลือกเลขโดด 4 ตัวจากเลขที่กำหนด โดยไม่ให้ซ้ำกัน มาเติมในช่องละหนึ่งตัว เพื่อให้ผลลัพธ์ของ
            <span className="mx-1 inline-flex items-center gap-1 align-middle">
              <Frac n="☐" d="☐" /> {opSym} <Frac n="☐" d="☐" />
            </span>
            มีค่ามากที่สุด</p>
          <p className="font-extrabold text-violet-700">แล้วผลลัพธ์ที่มีค่ามากที่สุดเท่ากับเท่าใด?</p>
        </div>

        {/* โซนทดลองวางเลข */}
        <div className="mt-3 rounded-2xl border-2 border-violet-200 bg-violet-50/50 p-3">
          <p className="mb-2 text-center text-xs font-extrabold text-violet-500">🎮 ลองวางเลขเอง — แตะช่อง แล้วแตะเลข</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <FracBoxes top={0} bot={1} />
            <span className="text-2xl font-black text-slate-600">{opSym}</span>
            <FracBoxes top={2} bot={3} />
            <span className="text-2xl font-black text-slate-600">=</span>
            <div className="grid min-w-[70px] place-items-center rounded-xl bg-white px-3 py-2 ring-1 ring-slate-200">
              {curMixed ? <Mixed sign={curMixed.sign} whole={curMixed.whole} num={curMixed.num} den={curMixed.den} /> : <span className="text-sm font-bold text-slate-300">?</span>}
            </div>
          </div>

          {/* เลขให้เลือก */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            {digits.map((d, i) => {
              const isUsed = used.includes(d);
              return (
                <button key={i} onClick={() => placeDigit(d)} disabled={isUsed}
                  className={cn("grid h-10 w-10 place-items-center rounded-xl text-lg font-black shadow-sm transition",
                    isUsed ? "cursor-not-allowed bg-slate-100 text-slate-300" : "bg-violet-500 text-white hover:bg-violet-600 active:scale-95")}>
                  {d}
                </button>
              );
            })}
            <button onClick={() => { setBoxes([null, null, null, null]); setSelBox(0); }} className="flex items-center gap-1 rounded-xl border-2 border-slate-200 bg-white px-2.5 py-1.5 text-xs font-extrabold text-slate-500 hover:bg-slate-50">
              <Eraser size={13} /> ล้าง
            </button>
          </div>

          {/* ผลตอบสด */}
          {filled && (
            <p className={cn("mt-2.5 flex items-center justify-center gap-1.5 text-sm font-extrabold", curIsMax ? "text-emerald-600" : "text-slate-500")}>
              {curIsMax ? <><Star size={16} className="fill-emerald-500 text-emerald-500" /> เยี่ยม! นี่คือค่ามากที่สุดแล้ว</> : <>ยังมีการวางที่ให้ค่ามากกว่านี้ ลองอีกที 💪</>}
            </p>
          )}
        </div>

        {/* ช้อย */}
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {choices.map((c, i) => {
            const chosen = picked === i;
            const isAns = answerIdx === i;
            const showRes = picked !== null || showSolution;
            return (
              <button key={i} onClick={() => setPicked(i)}
                className={cn("flex items-center gap-2.5 rounded-xl border-2 px-3 py-2.5 text-left transition",
                  showRes && isAns ? "border-emerald-400 bg-emerald-50" :
                  chosen && !isAns ? "border-rose-300 bg-rose-50" :
                  "border-slate-200 bg-white hover:border-violet-300 hover:bg-violet-50 active:scale-[0.99]")}>
                <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-lg text-sm font-extrabold",
                  showRes && isAns ? "bg-emerald-500 text-white" : chosen && !isAns ? "bg-rose-400 text-white" : "bg-slate-100 text-slate-500")}>
                  {showRes && isAns ? <Check size={16} /> : i + 1}
                </span>
                <Mixed whole={c.whole} num={c.num} den={c.den} />
              </button>
            );
          })}
        </div>

        {picked !== null && (
          <p className={cn("mt-3 text-center text-base font-extrabold", answerIdx === picked ? "text-emerald-700" : "text-rose-600")}>
            {answerIdx === picked ? <>🎉 ถูกต้อง!</> : <>ยังไม่ใช่ — ลองวางเลขในโซนทดลอง หรือกด &ldquo;ดูวิธีคิด&rdquo;</>}
          </p>
        )}
      </div>

      {/* ── เฉลยแบบเห็นภาพ ── */}
      <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 p-4">
        {!showSolution ? (
          <button onClick={() => setShowSolution(true)} className="mx-auto flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-base font-extrabold text-white shadow transition hover:bg-emerald-700 active:scale-[0.98]">
            <Eye size={18} /> ดูวิธีคิดทีละขั้น
          </button>
        ) : (
          <div className="space-y-4">
            <h3 className="text-center text-lg font-extrabold text-emerald-800">💡 วิธีคิดทีละขั้น</h3>

            <div className="rounded-xl border border-emerald-200 bg-white p-3">
              <p className="text-sm font-extrabold text-slate-700">① {op === "sub" ? "อยากให้ผลลบมากสุด → ตัวตั้งมากสุด และตัวลบน้อยสุด" : "อยากให้ผลบวกมากสุด → ทั้งสองเศษส่วนมากที่สุด"}</p>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-white p-3">
              <p className="text-sm font-extrabold text-slate-700">② ตัวตั้งให้มากสุด: ตัวเศษเป็นเลขมาก · ตัวส่วนเป็นเลขน้อย</p>
              <div className="mt-1.5 flex items-center gap-2 text-lg font-bold text-slate-700">
                ได้ <Frac n={best.t[0]} d={best.t[1]} className="text-violet-600" />
              </div>
            </div>

            <div className="rounded-xl border border-emerald-200 bg-white p-3">
              <p className="text-sm font-extrabold text-slate-700">③ {op === "sub" ? "ตัวลบให้น้อยสุด: จากเลขที่เหลือ เอาตัวเศษน้อย · ตัวส่วนมาก" : "ตัวที่สองให้มากสุด: จากเลขที่เหลือ"}</p>
              <div className="mt-1.5 flex items-center gap-2 text-lg font-bold text-slate-700">
                ได้ <Frac n={best.t[2]} d={best.t[3]} className="text-amber-600" />
                {leftover.length > 0 && <span className="text-xs font-bold text-slate-400">(ไม่ใช้เลข {leftover.join(", ")})</span>}
              </div>
            </div>

            <div className="rounded-xl border-2 border-emerald-300 bg-emerald-100/70 p-3 text-center">
              <p className="flex flex-wrap items-center justify-center gap-2 text-base font-extrabold text-emerald-800">
                ④ ผลลัพธ์มากที่สุด =
                <Frac n={best.t[0]} d={best.t[1]} /> {opSym} <Frac n={best.t[2]} d={best.t[3]} /> =
                <span className="rounded-lg bg-white px-2 py-1"><Mixed sign={bestMixed.sign} whole={bestMixed.whole} num={bestMixed.num} den={bestMixed.den} size="sm" /></span>
                {answerIdx >= 0 && <span className="text-sm">(ข้อ {answerIdx + 1})</span>}
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
