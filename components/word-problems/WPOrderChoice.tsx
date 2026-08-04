"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { FlaskConical, Eye, EyeOff, RotateCcw, Pencil, Check, ArrowRight, Gamepad2 } from "lucide-react";
import { Frac } from "@/components/lessons/Frac";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────────────────────────
   โจทย์ปัญหา (ลักษณะที่ 3): เลือก "ลำดับการเรียง" ที่ถูกต้อง
   ช้อยแต่ละข้อ = การเรียงของทั้งชุด · ระบบหาลำดับจริงแล้ว mark ข้อที่ตรง
   ครูแก้ค่าได้ (ลำดับถูกเปลี่ยนเอง) และสลับลำดับในแต่ละช้อยได้
   ───────────────────────────────────────────────────────────── */

type Item = { name: string; whole: number; num: number; den: number };
type Dir = "asc" | "desc";
type Cfg = { thing: string; classifier: string; most: string; unit: string };

const improper = (p: Item) => p.whole * p.den + p.num;
const valueOf = (p: Item) => improper(p) / p.den;
const toMixed = (p: Item) => {
  const imp = improper(p);
  return { whole: Math.floor(imp / p.den), num: imp % p.den, den: p.den };
};
const eqArr = (a: number[], b: number[]) => a.length === b.length && a.every((x, i) => x === b[i]);

const NUM_TH = ["", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด"];

const THAI_COLOR: Record<string, string> = {
  ขาว: "#f1f5f9", ดำ: "#1f2937", แดง: "#ef4444", ฟ้า: "#38bdf8", เขียว: "#22c55e",
  เหลือง: "#eab308", ส้ม: "#f97316", ม่วง: "#a855f7", ชมพู: "#ec4899",
  น้ำเงิน: "#3b82f6", น้ำตาล: "#92400e", เทา: "#94a3b8", ทอง: "#d4af37",
};
const FALLBACK = ["#f472b6", "#38bdf8", "#fb923c", "#a78bfa", "#34d399"];
const colorOf = (name: string, i: number) => THAI_COLOR[name.trim()] ?? FALLBACK[i % FALLBACK.length];

const DEFAULT_ITEMS: Item[] = [
  { name: "แดง", whole: 0, num: 7, den: 3 },
  { name: "ขาว", whole: 0, num: 11, den: 12 },
  { name: "ดำ", whole: 2, num: 1, den: 6 },
];
/* ช้อย 4 ข้อ = ลำดับ (index ของเชือก) — ยึดตามข้อสอบ */
const DEFAULT_CHOICES: number[][] = [
  [1, 2, 0], // ขาว ดำ แดง  ✓
  [1, 0, 2], // ขาว แดง ดำ
  [0, 1, 2], // แดง ขาว ดำ
  [0, 2, 1], // แดง ดำ ขาว
];
const DEFAULT_CFG: Cfg = { thing: "เชือก", classifier: "เส้น", most: "ยาว", unit: "เมตร" };

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

export function WPOrderChoice() {
  const [items, setItems] = useState<Item[]>(DEFAULT_ITEMS);
  const [choices, setChoices] = useState<number[][]>(DEFAULT_CHOICES);
  const [dir, setDir] = useState<Dir>("asc");
  const [cfg, setCfg] = useState<Cfg>(DEFAULT_CFG);
  const [edit, setEdit] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [showSolution, setShowSolution] = useState(false);

  /* ลำดับที่ถูก (เรียงตามทิศที่โจทย์ถาม) */
  const order = items
    .map((p, i) => ({ i, v: valueOf(p) }))
    .sort((a, b) => (dir === "asc" ? a.v - b.v : b.v - a.v))
    .map((s) => s.i);
  const answerIdx = choices.findIndex((c) => eqArr(c, order));
  const maxV = Math.max(...items.map(valueOf));

  const solved = picked !== null && picked === answerIdx;

  function reset() { setPicked(null); setShowSolution(false); }
  function setItem(i: number, patch: Partial<Item>) { setItems((prev) => prev.map((p, k) => (k === i ? { ...p, ...patch } : p))); reset(); }
  function setChoicePos(ci: number, pos: number, itemIdx: number) {
    setChoices((prev) => prev.map((c, k) => (k === ci ? c.map((v, p) => (p === pos ? itemIdx : v)) : c)));
    reset();
  }
  function restore() { setItems(DEFAULT_ITEMS); setChoices(DEFAULT_CHOICES); setDir("asc"); setCfg(DEFAULT_CFG); reset(); }

  const dirText = dir === "asc"
    ? `${cfg.thing}ที่${cfg.most}น้อยที่สุดไปหา${cfg.thing}ที่${cfg.most}มากที่สุด`
    : `${cfg.thing}ที่${cfg.most}มากที่สุดไปหา${cfg.thing}ที่${cfg.most}น้อยที่สุด`;

  const Swatch = ({ i }: { i: number }) => (
    <span className="inline-flex items-center gap-1">
      <span className="h-3.5 w-3.5 rounded-full ring-1 ring-slate-300" style={{ background: colorOf(items[i]?.name ?? "", i) }} />
      สี{items[i]?.name ?? "?"}
    </span>
  );

  return (
    <div className="space-y-4">
      {/* แถบเครื่องมือครู */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-violet-200 bg-white/90 p-2.5">
        <div className="flex items-center gap-1.5 text-sm font-extrabold text-violet-700">
          <FlaskConical size={16} /> โจทย์ที่ 3 · เลือกลำดับการเรียงที่ถูกต้อง
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setEdit((v) => !v)} className={cn("flex items-center gap-1 rounded-lg border-2 px-2.5 py-1 text-xs font-extrabold transition", edit ? "border-violet-400 bg-violet-100 text-violet-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
            <Pencil size={13} /> แก้โจทย์ (ค่า/ลำดับช้อย)
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
        <div className="space-y-3 rounded-2xl border-2 border-violet-200 bg-violet-50/60 p-3">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-extrabold text-violet-700">สิ่งของ:</span>
            <input value={cfg.thing} onChange={(e) => { setCfg({ ...cfg, thing: e.target.value }); reset(); }} className="w-20 rounded-lg border-2 border-slate-200 px-2 py-1 font-bold outline-none focus:border-violet-400" />
            <span className="font-extrabold text-violet-700">คุณสมบัติ:</span>
            <input value={cfg.most} onChange={(e) => { setCfg({ ...cfg, most: e.target.value }); reset(); }} className="w-16 rounded-lg border-2 border-slate-200 px-2 py-1 font-bold outline-none focus:border-violet-400" />
            <span className="font-extrabold text-violet-700">หน่วย:</span>
            <input value={cfg.unit} onChange={(e) => { setCfg({ ...cfg, unit: e.target.value }); reset(); }} className="w-20 rounded-lg border-2 border-slate-200 px-2 py-1 font-bold outline-none focus:border-violet-400" />
            <span className="font-extrabold text-violet-700">เรียง:</span>
            <select value={dir} onChange={(e) => { setDir(e.target.value as Dir); reset(); }} className="rounded-lg border-2 border-slate-200 px-2 py-1 font-bold outline-none focus:border-violet-400">
              <option value="asc">น้อย → มาก</option>
              <option value="desc">มาก → น้อย</option>
            </select>
          </div>

          {/* ค่าของแต่ละสิ่ง */}
          <div className="grid gap-2 sm:grid-cols-2">
            {items.map((p, i) => (
              <div key={i} className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-2">
                <span className="h-4 w-4 rounded-full ring-1 ring-slate-300" style={{ background: colorOf(p.name, i) }} />
                <span className="text-xs font-bold text-slate-400">สี</span>
                <input value={p.name} onChange={(e) => setItem(i, { name: e.target.value })} className="w-20 rounded-lg border-2 border-slate-200 px-2 py-0.5 text-sm font-extrabold outline-none focus:border-violet-400" />
                <span className="text-xs font-bold text-slate-400">เต็ม</span>
                <NumField value={p.whole} min={0} onCommit={(n) => setItem(i, { whole: n })} className="w-11 rounded-lg border-2 border-slate-200 px-1 py-0.5 text-center text-sm font-bold outline-none focus:border-violet-400" />
                <span className="text-xs font-bold text-slate-400">เศษ</span>
                <NumField value={p.num} min={0} onCommit={(n) => setItem(i, { num: n })} className="w-11 rounded-lg border-2 border-slate-200 px-1 py-0.5 text-center text-sm font-bold outline-none focus:border-violet-400" />
                <span className="font-black text-slate-400">/</span>
                <NumField value={p.den} min={1} onCommit={(n) => setItem(i, { den: n })} className="w-11 rounded-lg border-2 border-slate-200 px-1 py-0.5 text-center text-sm font-bold outline-none focus:border-violet-400" />
              </div>
            ))}
          </div>

          {/* แก้ลำดับในแต่ละช้อย */}
          <div>
            <p className="mb-1.5 text-sm font-extrabold text-violet-700">ลำดับในแต่ละช้อย 4 ข้อ (ระบบจะ mark ข้อที่ตรงกับลำดับที่ถูก)</p>
            <div className="space-y-1.5">
              {choices.map((c, ci) => (
                <div key={ci} className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-2 text-sm">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs font-extrabold text-slate-500">{ci + 1}</span>
                  {c.map((itemIdx, pos) => (
                    <span key={pos} className="flex items-center gap-1">
                      {pos > 0 && <ArrowRight size={12} className="text-slate-300" />}
                      <select value={itemIdx} onChange={(e) => setChoicePos(ci, pos, +e.target.value)} className="rounded-lg border-2 border-slate-200 px-1.5 py-1 font-bold outline-none focus:border-violet-400">
                        {items.map((p, k) => <option key={k} value={k}>สี{p.name}</option>)}
                      </select>
                    </span>
                  ))}
                  <span className={cn("ml-auto rounded-md px-2 py-0.5 text-xs font-extrabold", eqArr(c, order) ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400")}>
                    {eqArr(c, order) ? "✓ ข้อนี้ถูก" : "✗ ผิด"}
                  </span>
                </div>
              ))}
            </div>
            {answerIdx < 0 && (
              <p className="mt-1.5 rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-extrabold text-amber-700">
                ⚠️ ยังไม่มีช้อยข้อไหนตรงกับลำดับที่ถูก — ปรับลำดับในช้อยให้มี 1 ข้อที่ถูก
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── การ์ดโจทย์ (แบบข้อสอบ) ── */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <p className="text-base font-bold leading-relaxed text-slate-700 sm:text-lg">
          {cfg.thing} {NUM_TH[items.length] ?? items.length} {cfg.classifier} มีความ{cfg.most} ดังนี้
        </p>

        {/* รายการเชือก */}
        <div className="mt-2.5 space-y-1.5">
          {items.map((p, i) => (
            <div key={i} className="flex items-center gap-2.5 text-base font-bold text-slate-700 sm:text-lg">
              <span className="h-4 w-4 shrink-0 rounded-full ring-1 ring-slate-300" style={{ background: colorOf(p.name, i) }} />
              <span>{cfg.thing}สี{p.name}{cfg.most}</span>
              <Mixed whole={p.whole} num={p.num} den={p.den} />
              <span className="text-sm font-bold text-slate-500">{cfg.unit}</span>
            </div>
          ))}
        </div>

        <p className="mt-3 text-base font-bold leading-relaxed text-slate-700 sm:text-lg">
          ข้อใดต่อไปนี้เรียงลำดับ{dirText}ได้<b className="text-violet-700">ถูกต้อง</b>
        </p>

        {/* ช้อย = 4 ลำดับ */}
        <div className="mt-3 space-y-2">
          {choices.map((c, ci) => {
            const chosen = picked === ci;
            const isAns = ci === answerIdx;
            const showRes = picked !== null || showSolution;
            return (
              <button key={ci} onClick={() => setPicked(ci)}
                className={cn("flex w-full items-center gap-2.5 rounded-xl border-2 px-3 py-2.5 text-left text-base font-bold transition",
                  showRes && isAns ? "border-emerald-400 bg-emerald-50 text-emerald-800" :
                  chosen && !isAns ? "border-rose-300 bg-rose-50 text-rose-700" :
                  "border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50 active:scale-[0.99]")}>
                <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-lg text-sm font-extrabold",
                  showRes && isAns ? "bg-emerald-500 text-white" : chosen && !isAns ? "bg-rose-400 text-white" : "bg-slate-100 text-slate-500")}>
                  {showRes && isAns ? <Check size={16} /> : ci + 1}
                </span>
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  {c.map((itemIdx, pos) => (
                    <span key={pos} className="flex items-center gap-2">
                      {pos > 0 && <ArrowRight size={14} className="text-slate-300" />}
                      <Swatch i={itemIdx} />
                    </span>
                  ))}
                </span>
              </button>
            );
          })}
        </div>

        {picked !== null && (
          <p className={cn("mt-3 text-center text-base font-extrabold", solved ? "text-emerald-700" : "text-rose-600")}>
            {solved ? <>🎉 ถูกต้อง! ข้อ {picked + 1} เรียงลำดับถูก</> : <>ยังไม่ใช่ — ลองกด &ldquo;ดูวิธีคิด&rdquo; ด้านล่างดูนะ</>}
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

            {/* ขั้น 1 */}
            <div className="rounded-xl border border-emerald-200 bg-white p-3">
              <p className="text-sm font-extrabold text-slate-700">① เศษเกินให้แปลงเป็นจำนวนคละก่อน จะเทียบง่ายขึ้น</p>
              <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                {items.map((p, i) => {
                  const m = toMixed(p);
                  const isImp = p.whole === 0 && p.num >= p.den;
                  return (
                    <div key={i} className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-sm">
                      <span className="h-3 w-3 rounded-full ring-1 ring-slate-300" style={{ background: colorOf(p.name, i) }} />
                      <b className="text-slate-700">สี{p.name}</b>
                      <Mixed whole={p.whole} num={p.num} den={p.den} size="sm" />
                      {isImp && <><span className="text-slate-400">=</span><Mixed whole={m.whole} num={m.num} den={m.den} size="sm" /></>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ขั้น 2 — แท่งสีเรียงตามทิศที่ถาม */}
            <div className="rounded-xl border border-emerald-200 bg-white p-3">
              <p className="text-sm font-extrabold text-slate-700">② เรียงตามที่โจทย์ถาม: {dir === "asc" ? `${cfg.most}น้อยสุด → ${cfg.most}มากสุด` : `${cfg.most}มากสุด → ${cfg.most}น้อยสุด`}</p>
              <div className="mt-2 space-y-2.5">
                {order.map((idx, k) => {
                  const p = items[idx];
                  const m = toMixed(p);
                  return (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-600 text-xs font-extrabold text-white">{k + 1}</span>
                      <span className="w-14 shrink-0 truncate text-sm font-extrabold text-slate-700">สี{p.name}</span>
                      <div className="relative h-5 flex-1 rounded-full bg-slate-100">
                        <div className="h-full rounded-full ring-1 ring-inset ring-black/10" style={{ width: `${Math.max(6, (valueOf(p) / maxV) * 100)}%`, background: colorOf(p.name, idx) }} />
                      </div>
                      <span className="flex w-16 shrink-0 items-center justify-start gap-1">
                        <Mixed whole={m.whole} num={m.num} den={m.den} size="sm" />
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ขั้น 3 — อ่านลำดับ → จับคู่ช้อย */}
            <div className="rounded-xl border border-emerald-200 bg-white p-3">
              <p className="text-sm font-extrabold text-slate-700">③ อ่านชื่อสีตามลำดับด้านบน แล้วหาว่าตรงกับช้อยข้อไหน</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-extrabold text-slate-700">
                {order.map((idx, k) => (
                  <span key={idx} className="flex items-center gap-2">
                    {k > 0 && <ArrowRight size={14} className="text-emerald-400" />}
                    <span className="inline-flex items-center gap-1">
                      <span className="h-3.5 w-3.5 rounded-full ring-1 ring-slate-300" style={{ background: colorOf(items[idx].name, idx) }} />
                      สี{items[idx].name}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* สรุป */}
            <div className="rounded-xl border-2 border-emerald-300 bg-emerald-100/70 p-3 text-center">
              <p className="text-base font-extrabold text-emerald-800">
                ④ ลำดับนี้ตรงกับ <span className="rounded-lg bg-white px-2 py-0.5 text-emerald-700">ข้อ {answerIdx + 1}</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ลิงก์ไปเกม */}
      <Link href="/lessons/compare" className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-violet-300 bg-white px-4 py-3 text-sm font-extrabold text-violet-600 transition hover:bg-violet-50">
        <Gamepad2 size={17} /> ฝึกเรียงลำดับให้คล่อง? ไปเล่นเกม &ldquo;เปรียบเทียบเศษส่วน&rdquo; →
      </Link>
    </div>
  );
}
