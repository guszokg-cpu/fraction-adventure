"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { FlaskConical, Eye, EyeOff, RotateCcw, Pencil, Check, X, Gamepad2 } from "lucide-react";
import { Frac } from "@/components/lessons/Frac";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────────────────────────
   โจทย์ปัญหา (ลักษณะที่ 4): เลือก "ข้อความที่ถูกต้อง"
   ข้อความมีทั้งแบบ มาก/น้อยที่สุด และแบบเปรียบเทียบคู่ (X มากกว่า/น้อยกว่า Y)
   ครูแก้ค่าและแก้ข้อความได้ · ระบบประเมินว่าข้อไหนจริง = คำตอบอัตโนมัติ
   ───────────────────────────────────────────────────────────── */

type Item = { name: string; whole: number; num: number; den: number };
type Kind = "most" | "least" | "gt" | "lt" | "nth";
type Statement = { item: number; kind: Kind; other: number; n: number };
type Cfg = { thing: string; classifierWord: string; note: string; have: string; most: string; least: string; unit: string };

const improper = (p: Item) => p.whole * p.den + p.num;
const valueOf = (p: Item) => improper(p) / p.den;
const toMixed = (p: Item) => {
  const imp = improper(p);
  return { whole: Math.floor(imp / p.den), num: imp % p.den, den: p.den };
};

const NUM_TH = ["", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด"];
const PALETTE = ["#a78bfa", "#38bdf8", "#fb923c", "#34d399", "#f472b6", "#f59e0b"];
const colorOf = (i: number) => PALETTE[i % PALETTE.length];

const DEFAULT_ITEMS: Item[] = [
  { name: "น้ำใบเตย", whole: 0, num: 21, den: 8 },
  { name: "น้ำอัญชัน", whole: 0, num: 43, den: 20 },
  { name: "น้ำมะตูม", whole: 2, num: 3, den: 5 },
  { name: "น้ำชาเขียว", whole: 2, num: 11, den: 40 },
];
const DEFAULT_STMTS: Statement[] = [
  { item: 0, kind: "least", other: 1, n: 1 }, // น้ำใบเตย ... น้อยที่สุด
  { item: 2, kind: "most", other: 1, n: 1 },  // น้ำมะตูม ... มากที่สุด
  { item: 0, kind: "lt", other: 1, n: 1 },    // น้ำใบเตย ... น้อยกว่าน้ำอัญชัน
  { item: 3, kind: "gt", other: 1, n: 1 },    // น้ำชาเขียว ... มากกว่าน้ำอัญชัน  ✓
];
const DEFAULT_CFG: Cfg = { thing: "เครื่องดื่ม", classifierWord: "ชนิด", note: "ที่มีปริมาตรเท่ากัน", have: "ปริมาณน้ำตาล", most: "มาก", least: "น้อย", unit: "กรัม" };

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
const MixItem = ({ p, size }: { p: Item; size?: "sm" | "md" }) => { const m = toMixed(p); return <Mixed whole={m.whole} num={m.num} den={m.den} size={size} />; };

export function WPCompareStatement() {
  const [items, setItems] = useState<Item[]>(DEFAULT_ITEMS);
  const [stmts, setStmts] = useState<Statement[]>(DEFAULT_STMTS);
  const [cfg, setCfg] = useState<Cfg>(DEFAULT_CFG);
  const [edit, setEdit] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [showSolution, setShowSolution] = useState(false);

  const desc = items.map((p, i) => ({ p, i, v: valueOf(p) })).sort((a, b) => b.v - a.v || improper(b.p) * a.p.den - improper(a.p) * b.p.den);
  const rankOf: number[] = [];
  desc.forEach((s, k) => { rankOf[s.i] = k + 1; });
  const maxV = Math.max(...items.map(valueOf));
  const minV = Math.min(...items.map(valueOf));

  const evalStmt = (s: Statement) => {
    const v = valueOf(items[s.item]);
    if (s.kind === "most") return v === maxV;
    if (s.kind === "least") return v === minV;
    if (s.kind === "nth") return rankOf[s.item] === s.n;
    const o = valueOf(items[s.other]);
    return s.kind === "gt" ? v > o : v < o;
  };
  const truth = stmts.map(evalStmt);
  const trueCount = truth.filter(Boolean).length;
  const answerIdx = truth.findIndex(Boolean);

  const stmtText = (s: Statement) => {
    const name = items[s.item]?.name ?? "?";
    const head = `${name}มี${cfg.have}`;
    if (s.kind === "most") return `${head}${cfg.most}ที่สุด`;
    if (s.kind === "least") return `${head}${cfg.least}ที่สุด`;
    if (s.kind === "nth") return `${head}${cfg.most}เป็นอันดับที่${NUM_TH[s.n] ?? s.n}`;
    const other = items[s.other]?.name ?? "?";
    return `${head}${s.kind === "gt" ? cfg.most : cfg.least}กว่า${other}`;
  };

  const solved = picked !== null && truth[picked];

  function reset() { setPicked(null); setShowSolution(false); }
  function setItem(i: number, patch: Partial<Item>) { setItems((prev) => prev.map((p, k) => (k === i ? { ...p, ...patch } : p))); reset(); }
  function setStmt(i: number, patch: Partial<Statement>) { setStmts((prev) => prev.map((s, k) => (k === i ? { ...s, ...patch } : s))); reset(); }
  function restore() { setItems(DEFAULT_ITEMS); setStmts(DEFAULT_STMTS); setCfg(DEFAULT_CFG); reset(); }

  return (
    <div className="space-y-4">
      {/* แถบเครื่องมือครู */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-violet-200 bg-white/90 p-2.5">
        <div className="flex items-center gap-1.5 text-sm font-extrabold text-violet-700">
          <FlaskConical size={16} /> โจทย์ที่ 4 · เลือกข้อความเปรียบเทียบที่ถูก
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setEdit((v) => !v)} className={cn("flex items-center gap-1 rounded-lg border-2 px-2.5 py-1 text-xs font-extrabold transition", edit ? "border-violet-400 bg-violet-100 text-violet-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
            <Pencil size={13} /> แก้โจทย์ (ค่า/ข้อความ)
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
            <span className="font-extrabold text-violet-700">หมวด:</span>
            <input value={cfg.thing} onChange={(e) => { setCfg({ ...cfg, thing: e.target.value }); reset(); }} className="w-24 rounded-lg border-2 border-slate-200 px-2 py-1 font-bold outline-none focus:border-violet-400" />
            <span className="font-extrabold text-violet-700">สิ่งที่วัด:</span>
            <input value={cfg.have} onChange={(e) => { setCfg({ ...cfg, have: e.target.value }); reset(); }} className="w-28 rounded-lg border-2 border-slate-200 px-2 py-1 font-bold outline-none focus:border-violet-400" />
            <span className="font-extrabold text-violet-700">หน่วย:</span>
            <input value={cfg.unit} onChange={(e) => { setCfg({ ...cfg, unit: e.target.value }); reset(); }} className="w-20 rounded-lg border-2 border-slate-200 px-2 py-1 font-bold outline-none focus:border-violet-400" />
          </div>

          {/* ค่าของแต่ละสิ่ง */}
          <div className="grid gap-2 sm:grid-cols-2">
            {items.map((p, i) => (
              <div key={i} className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-2">
                <span className="h-4 w-4 rounded-full ring-1 ring-slate-300" style={{ background: colorOf(i) }} />
                <input value={p.name} onChange={(e) => setItem(i, { name: e.target.value })} className="w-24 rounded-lg border-2 border-slate-200 px-2 py-0.5 text-sm font-extrabold outline-none focus:border-violet-400" />
                <span className="text-xs font-bold text-slate-400">เต็ม</span>
                <NumField value={p.whole} min={0} onCommit={(n) => setItem(i, { whole: n })} className="w-11 rounded-lg border-2 border-slate-200 px-1 py-0.5 text-center text-sm font-bold outline-none focus:border-violet-400" />
                <span className="text-xs font-bold text-slate-400">เศษ</span>
                <NumField value={p.num} min={0} onCommit={(n) => setItem(i, { num: n })} className="w-11 rounded-lg border-2 border-slate-200 px-1 py-0.5 text-center text-sm font-bold outline-none focus:border-violet-400" />
                <span className="font-black text-slate-400">/</span>
                <NumField value={p.den} min={1} onCommit={(n) => setItem(i, { den: n })} className="w-11 rounded-lg border-2 border-slate-200 px-1 py-0.5 text-center text-sm font-bold outline-none focus:border-violet-400" />
              </div>
            ))}
          </div>

          {/* แก้ 4 ข้อความ */}
          <div>
            <p className="mb-1.5 text-sm font-extrabold text-violet-700">ข้อความตัวเลือก 4 ข้อ (ระบบจะประเมินให้ว่าข้อไหนถูก)</p>
            <div className="space-y-1.5">
              {stmts.map((s, i) => (
                <div key={i} className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-2 text-sm">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs font-extrabold text-slate-500">{i + 1}</span>
                  <select value={s.item} onChange={(e) => setStmt(i, { item: +e.target.value })} className="rounded-lg border-2 border-slate-200 px-1.5 py-1 font-bold outline-none focus:border-violet-400">
                    {items.map((p, k) => <option key={k} value={k}>{p.name}</option>)}
                  </select>
                  <select value={s.kind} onChange={(e) => setStmt(i, { kind: e.target.value as Kind })} className="rounded-lg border-2 border-slate-200 px-1.5 py-1 font-bold outline-none focus:border-violet-400">
                    <option value="most">{cfg.most}ที่สุด</option>
                    <option value="least">{cfg.least}ที่สุด</option>
                    <option value="gt">{cfg.most}กว่า…</option>
                    <option value="lt">{cfg.least}กว่า…</option>
                    <option value="nth">{cfg.most}อันดับที่…</option>
                  </select>
                  {(s.kind === "gt" || s.kind === "lt") && (
                    <select value={s.other} onChange={(e) => setStmt(i, { other: +e.target.value })} className="rounded-lg border-2 border-slate-200 px-1.5 py-1 font-bold outline-none focus:border-violet-400">
                      {items.map((p, k) => <option key={k} value={k}>{p.name}</option>)}
                    </select>
                  )}
                  {s.kind === "nth" && (
                    <select value={s.n} onChange={(e) => setStmt(i, { n: +e.target.value })} className="rounded-lg border-2 border-slate-200 px-1.5 py-1 font-bold outline-none focus:border-violet-400">
                      {items.map((_, k) => <option key={k} value={k + 1}>ที่ {NUM_TH[k + 1]}</option>)}
                    </select>
                  )}
                  <span className={cn("ml-auto rounded-md px-2 py-0.5 text-xs font-extrabold", truth[i] ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400")}>
                    {truth[i] ? "✓ ข้อนี้ถูก" : "✗ ผิด"}
                  </span>
                </div>
              ))}
            </div>
            {trueCount !== 1 && (
              <p className="mt-1.5 rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-extrabold text-amber-700">
                ⚠️ ตอนนี้มีข้อที่ถูก {trueCount} ข้อ — โจทย์ที่ดีควรมีข้อถูกเพียง 1 ข้อ
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── การ์ดโจทย์ (แบบข้อสอบ) ── */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <p className="text-base font-bold leading-relaxed text-slate-700 sm:text-lg">
          {cfg.thing} {items.length} {cfg.classifierWord} {cfg.note} มี{cfg.have}ในแต่ละ{cfg.classifierWord} ดังตารางต่อไปนี้
        </p>

        {/* ตาราง */}
        <div className="mx-auto mt-3 max-w-md overflow-hidden rounded-xl border-2 border-slate-300">
          <div className="grid grid-cols-2 bg-slate-100 text-center text-sm font-extrabold text-slate-700">
            <div className="border-r-2 border-slate-300 px-3 py-2">{cfg.thing}</div>
            <div className="px-3 py-2">{cfg.have} ({cfg.unit})</div>
          </div>
          {items.map((p, i) => (
            <div key={i} className="grid grid-cols-2 items-center border-t-2 border-slate-200 text-center">
              <div className="flex items-center justify-center gap-2 border-r-2 border-slate-200 px-3 py-2.5 text-base font-extrabold text-slate-700">
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: colorOf(i) }} />{p.name}
              </div>
              <div className="flex items-center justify-center px-3 py-2.5">
                <Mixed whole={p.whole} num={p.num} den={p.den} />
              </div>
            </div>
          ))}
        </div>

        <p className="mt-3 text-base font-extrabold leading-relaxed text-violet-700 sm:text-lg">ข้อใดต่อไปนี้ถูกต้อง</p>

        {/* ช้อย = 4 ข้อความ */}
        <div className="mt-2 space-y-2">
          {stmts.map((s, i) => {
            const chosen = picked === i;
            const isAns = truth[i];
            const showRes = picked !== null || showSolution;
            return (
              <button key={i} onClick={() => setPicked(i)}
                className={cn("flex w-full items-center gap-2.5 rounded-xl border-2 px-3 py-2.5 text-left text-base font-bold transition",
                  showRes && isAns ? "border-emerald-400 bg-emerald-50 text-emerald-800" :
                  chosen && !isAns ? "border-rose-300 bg-rose-50 text-rose-700" :
                  "border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50 active:scale-[0.99]")}>
                <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-lg text-sm font-extrabold",
                  showRes && isAns ? "bg-emerald-500 text-white" : chosen && !isAns ? "bg-rose-400 text-white" : "bg-slate-100 text-slate-500")}>
                  {showRes && isAns ? <Check size={16} /> : i + 1}
                </span>
                {stmtText(s)}
              </button>
            );
          })}
        </div>

        {picked !== null && (
          <p className={cn("mt-3 text-center text-base font-extrabold", solved ? "text-emerald-700" : "text-rose-600")}>
            {solved ? <>🎉 ถูกต้อง! ข้อ {picked + 1} เป็นข้อความที่ถูก</> : <>ยังไม่ใช่ — ลองกด &ldquo;ดูวิธีคิด&rdquo; ด้านล่างดูนะ</>}
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
                      <span className="h-3 w-3 rounded-full" style={{ background: colorOf(i) }} />
                      <b className="text-slate-700">{p.name}</b>
                      <Mixed whole={p.whole} num={p.num} den={p.den} size="sm" />
                      {isImp && <><span className="text-slate-400">=</span><Mixed whole={m.whole} num={m.num} den={m.den} size="sm" /></>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ขั้น 2 — แท่งเรียงมาก→น้อย */}
            <div className="rounded-xl border border-emerald-200 bg-white p-3">
              <p className="text-sm font-extrabold text-slate-700">② เรียงจาก{cfg.have}{cfg.most}ที่สุด → {cfg.least}ที่สุด</p>
              <div className="mt-2 space-y-2.5">
                {desc.map((s, k) => (
                  <div key={s.i} className="flex items-center gap-2">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-600 text-xs font-extrabold text-white">{k + 1}</span>
                    <span className="w-20 shrink-0 truncate text-sm font-extrabold text-slate-700">{s.p.name}</span>
                    <div className="relative h-5 flex-1 rounded-full bg-slate-100">
                      <div className="h-full rounded-full ring-1 ring-inset ring-black/10" style={{ width: `${Math.max(6, (s.v / maxV) * 100)}%`, background: colorOf(s.i) }} />
                    </div>
                    <span className="flex w-16 shrink-0 items-center justify-start"><MixItem p={s.p} size="sm" /></span>
                  </div>
                ))}
              </div>
            </div>

            {/* ขั้น 3 — ตรวจทีละข้อความ */}
            <div className="rounded-xl border border-emerald-200 bg-white p-3">
              <p className="text-sm font-extrabold text-slate-700">③ ตรวจข้อความทีละข้อ</p>
              <div className="mt-2 space-y-1.5">
                {stmts.map((s, i) => {
                  const t = truth[i];
                  const a = items[s.item];
                  const isPair = s.kind === "gt" || s.kind === "lt";
                  const b = items[s.other];
                  const sym = isPair ? (valueOf(a) > valueOf(b) ? ">" : valueOf(a) < valueOf(b) ? "<" : "=") : "";
                  return (
                    <div key={i} className={cn("flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg px-2.5 py-1.5 text-sm font-bold", t ? "bg-emerald-100 text-emerald-800" : "bg-rose-50 text-rose-600")}>
                      <span className={cn("grid h-5 w-5 shrink-0 place-items-center rounded-full text-white", t ? "bg-emerald-500" : "bg-rose-400")}>
                        {t ? <Check size={13} /> : <X size={13} />}
                      </span>
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded bg-white/70 text-xs font-extrabold text-slate-500">{i + 1}</span>
                      <span>{stmtText(s)}</span>
                      <span className="flex items-center gap-1.5 rounded-md bg-white/70 px-2 py-0.5">
                        <b>{a.name}</b><MixItem p={a} size="sm" />
                        {isPair
                          ? <><span className="text-base font-black">{sym}</span><MixItem p={b} size="sm" /><b>{b.name}</b></>
                          : <span className="text-xs font-extrabold text-slate-500">(อันดับ {rankOf[s.item]} จาก {items.length})</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* สรุป */}
            <div className="rounded-xl border-2 border-emerald-300 bg-emerald-100/70 p-3 text-center">
              <p className="text-base font-extrabold text-emerald-800">
                ④ ข้อความที่ถูกต้องคือ <span className="rounded-lg bg-white px-2 py-0.5 text-emerald-700">ข้อ {answerIdx + 1}</span>
                {answerIdx >= 0 && <> — {stmtText(stmts[answerIdx])}</>}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ลิงก์ไปเกม */}
      <Link href="/lessons/compare" className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-violet-300 bg-white px-4 py-3 text-sm font-extrabold text-violet-600 transition hover:bg-violet-50">
        <Gamepad2 size={17} /> ฝึกเปรียบเทียบให้คล่อง? ไปเล่นเกม &ldquo;เปรียบเทียบเศษส่วน&rdquo; →
      </Link>
    </div>
  );
}
