"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { FlaskConical, Eye, EyeOff, RotateCcw, Pencil, Check, Gamepad2 } from "lucide-react";
import { Frac } from "@/components/lessons/Frac";
import { cn } from "@/lib/cn";

/* ─────────────────────────────────────────────────────────────
   โจทย์ปัญหา: เปรียบเทียบและเรียงลำดับจำนวนคละ/เศษเกิน
   (ครูแก้ชื่อ/ตัวเลข/ลำดับที่ถามได้ · ระบบคิดคำตอบ + ช้อยที่ถูกให้อัตโนมัติ)
   ───────────────────────────────────────────────────────────── */

type Person = { name: string; whole: number; num: number; den: number };

/* ค่าเป็นเศษเกิน (ตัวเศษเทียบตัวส่วนเดียว) เพื่อเทียบ/เรียงแม่นยำ */
const improper = (p: Person) => p.whole * p.den + p.num;      // เศษเกินบนตัวส่วน p.den
const valueOf = (p: Person) => improper(p) / p.den;           // ค่าโดยประมาณ (ใช้จัดเรียง/ความยาวแท่ง)
/* แปลงเศษเกิน → จำนวนคละ (ไว้โชว์ตอนเฉลย) */
const toMixed = (p: Person) => {
  const imp = improper(p);
  return { whole: Math.floor(imp / p.den), num: imp % p.den, den: p.den };
};

const ORD = ["", "ที่ 1", "ที่ 2", "ที่ 3", "ที่ 4"];
const BAR_COLORS = ["#f472b6", "#38bdf8", "#fb923c", "#a78bfa"];

const DEFAULT_PEOPLE: Person[] = [
  { name: "สมหญิง", whole: 0, num: 5, den: 6 },
  { name: "สมศรี", whole: 1, num: 1, den: 9 },
  { name: "สมพร", whole: 0, num: 7, den: 3 },
  { name: "สมพงษ์", whole: 2, num: 1, den: 15 },
];

/* จำนวนคละแบบตั้ง (จำนวนเต็ม + เศษ) */
function Mixed({ whole, num, den, size = "md" }: { whole: number; num: number; den: number; size?: "sm" | "md" | "lg" }) {
  const wc = size === "lg" ? "text-3xl" : size === "sm" ? "text-lg" : "text-2xl";
  if (num === 0) return <span className={cn("font-black text-slate-800", wc)}>{whole}</span>;
  return (
    <span className="inline-flex items-center gap-1 align-middle">
      {whole > 0 && <span className={cn("font-black text-slate-800", wc)}>{whole}</span>}
      <Frac n={num} d={den} className={cn("text-slate-800", size === "lg" ? "text-2xl" : "text-xl")} />
    </span>
  );
}

/* ช่องกรอกตัวเลขที่พิมพ์ลื่น — เก็บ string ภายใน ให้ลบ/พิมพ์เลขหลายหลักได้
   แล้วส่งค่าที่แปลงเป็นตัวเลขขึ้นไปทันที (ว่าง = ค่า min) */
function NumField({ value, min = 0, onCommit, className }: { value: number; min?: number; onCommit: (n: number) => void; className?: string }) {
  const [raw, setRaw] = useState(String(value));
  const last = useRef(value);
  // ซิงก์เมื่อค่าเปลี่ยนจากภายนอก (เช่น กดปุ่ม "ค่าเริ่มต้น")
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
        last.current = committed;            // ค่านี้มาจากการพิมพ์เอง อย่าให้ sync มาทับ raw ที่ยังพิมพ์ค้าง
        onCommit(committed);
      }}
      onBlur={() => setRaw(String(Math.max(min, parseInt(raw, 10) || min)))}
      className={className}
    />
  );
}

export function WPCompareOrder() {
  const [people, setPeople] = useState<Person[]>(DEFAULT_PEOPLE);
  const [activity, setActivity] = useState("ออกกำลังกาย");
  const [unit, setUnit] = useState("ชั่วโมง");
  const [rank, setRank] = useState(3);
  const [edit, setEdit] = useState(false);

  const [picked, setPicked] = useState<number | null>(null);
  const [showSolution, setShowSolution] = useState(false);

  /* เรียงจากน้อยไปมาก (คำนวณคำตอบอัตโนมัติ) */
  const sorted = people
    .map((p, i) => ({ p, i, v: valueOf(p) }))
    .sort((a, b) => a.v - b.v || improper(a.p) * b.p.den - improper(b.p) * a.p.den);
  const answerIdx = sorted[Math.min(rank, people.length) - 1]?.i ?? 0;   // ช้อยที่ถูก (index ในตาราง)
  const maxV = Math.max(...people.map(valueOf), 0.01);

  const solved = picked === answerIdx;

  function reset() { setPicked(null); setShowSolution(false); }
  function setP(i: number, patch: Partial<Person>) {
    setPeople((prev) => prev.map((p, k) => (k === i ? { ...p, ...patch } : p)));
    reset();
  }

  return (
    <div className="space-y-4">
      {/* แถบเครื่องมือครู */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-violet-200 bg-white/90 p-2.5">
        <div className="flex items-center gap-1.5 text-sm font-extrabold text-violet-700">
          <FlaskConical size={16} /> โจทย์ที่ 1 · เปรียบเทียบและเรียงลำดับ
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setEdit((v) => !v)} className={cn("flex items-center gap-1 rounded-lg border-2 px-2.5 py-1 text-xs font-extrabold transition", edit ? "border-violet-400 bg-violet-100 text-violet-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
            <Pencil size={13} /> แก้โจทย์ (ชื่อ/ตัวเลข)
          </button>
          <button onClick={() => setShowSolution((v) => !v)} className={cn("flex items-center gap-1 rounded-lg border-2 px-2.5 py-1 text-xs font-extrabold transition", showSolution ? "border-emerald-400 bg-emerald-100 text-emerald-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50")}>
            {showSolution ? <EyeOff size={13} /> : <Eye size={13} />} เฉลย
          </button>
          <button onClick={() => { setPeople(DEFAULT_PEOPLE); setActivity("ออกกำลังกาย"); setUnit("ชั่วโมง"); setRank(3); reset(); }} className="flex items-center gap-1 rounded-lg border-2 border-slate-200 bg-white px-2.5 py-1 text-xs font-extrabold text-slate-500 hover:bg-slate-50">
            <RotateCcw size={13} /> ค่าเริ่มต้น
          </button>
        </div>
      </div>

      {/* แผงแก้โจทย์ */}
      {edit && (
        <div className="space-y-2 rounded-2xl border-2 border-violet-200 bg-violet-50/60 p-3">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-extrabold text-violet-700">กิจกรรม:</span>
            <input value={activity} onChange={(e) => { setActivity(e.target.value); reset(); }} className="w-32 rounded-lg border-2 border-slate-200 px-2 py-1 font-bold outline-none focus:border-violet-400" />
            <span className="font-extrabold text-violet-700">หน่วย:</span>
            <input value={unit} onChange={(e) => { setUnit(e.target.value); reset(); }} className="w-24 rounded-lg border-2 border-slate-200 px-2 py-1 font-bold outline-none focus:border-violet-400" />
            <span className="font-extrabold text-violet-700">ถามลำดับ:</span>
            <select value={rank} onChange={(e) => { setRank(+e.target.value); reset(); }} className="rounded-lg border-2 border-slate-200 px-2 py-1 font-bold outline-none focus:border-violet-400">
              {people.map((_, i) => <option key={i} value={i + 1}>ที่ {i + 1}</option>)}
            </select>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {people.map((p, i) => (
              <div key={i} className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-2">
                <span className="h-4 w-4 rounded-full" style={{ background: BAR_COLORS[i] }} />
                <input value={p.name} onChange={(e) => setP(i, { name: e.target.value })} className="w-24 rounded-lg border-2 border-slate-200 px-2 py-0.5 text-sm font-extrabold outline-none focus:border-violet-400" />
                <span className="text-xs font-bold text-slate-400">เต็ม</span>
                <NumField value={p.whole} min={0} onCommit={(n) => setP(i, { whole: n })} className="w-12 rounded-lg border-2 border-slate-200 px-1.5 py-0.5 text-center text-sm font-bold outline-none focus:border-violet-400" />
                <span className="text-xs font-bold text-slate-400">เศษ</span>
                <NumField value={p.num} min={0} onCommit={(n) => setP(i, { num: n })} className="w-12 rounded-lg border-2 border-slate-200 px-1.5 py-0.5 text-center text-sm font-bold outline-none focus:border-violet-400" />
                <span className="font-black text-slate-400">/</span>
                <NumField value={p.den} min={1} onCommit={(n) => setP(i, { den: n })} className="w-12 rounded-lg border-2 border-slate-200 px-1.5 py-0.5 text-center text-sm font-bold outline-none focus:border-violet-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── การ์ดโจทย์ (แบบข้อสอบ) ── */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <p className="text-base font-bold leading-relaxed text-slate-700 sm:text-lg">
          <b>{people.map((p) => p.name).join(" ")}</b> บันทึกจำนวนเวลาการ{activity}ของตนเองใน 1 สัปดาห์ โดยมีข้อมูลดังตารางต่อไปนี้
        </p>

        {/* ตาราง */}
        <div className="mx-auto mt-3 max-w-md overflow-hidden rounded-xl border-2 border-slate-300">
          <div className="grid grid-cols-2 bg-slate-100 text-center text-sm font-extrabold text-slate-700">
            <div className="border-r-2 border-slate-300 px-3 py-2">รายชื่อ</div>
            <div className="px-3 py-2">รวมเวลาการ{activity}ใน 1 สัปดาห์</div>
          </div>
          {people.map((p, i) => (
            <div key={i} className="grid grid-cols-2 items-center border-t-2 border-slate-200 text-center">
              <div className="border-r-2 border-slate-200 px-3 py-2.5 text-base font-extrabold text-slate-700">{p.name}</div>
              <div className="flex items-center justify-center gap-1.5 px-3 py-2.5">
                <Mixed whole={p.whole} num={p.num} den={p.den} /> <span className="text-sm font-bold text-slate-500">{unit}</span>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-3 text-base font-bold leading-relaxed text-slate-700 sm:text-lg">
          ถ้าเรียงจำนวนเวลาการ{activity}ใน 1 สัปดาห์ ของทุกคนจากน้อยไปมาก อยากทราบว่า
          เวลาของใครอยู่ลำดับ<b className="text-violet-700"> {ORD[rank]}</b>
        </p>

        {/* ช้อย */}
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {people.map((p, i) => {
            const chosen = picked === i;
            const isAns = i === answerIdx;
            const showRes = picked !== null || showSolution;
            return (
              <button key={i} onClick={() => setPicked(i)}
                className={cn("flex items-center gap-2.5 rounded-xl border-2 px-3 py-2.5 text-left text-base font-extrabold transition",
                  showRes && isAns ? "border-emerald-400 bg-emerald-50 text-emerald-800" :
                  chosen && !isAns ? "border-rose-300 bg-rose-50 text-rose-700" :
                  "border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50 active:scale-[0.98]")}>
                <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-lg text-sm",
                  showRes && isAns ? "bg-emerald-500 text-white" : chosen && !isAns ? "bg-rose-400 text-white" : "bg-slate-100 text-slate-500")}>
                  {showRes && isAns ? <Check size={16} /> : i + 1}
                </span>
                {p.name}
              </button>
            );
          })}
        </div>

        {/* ผลตอบ */}
        {picked !== null && (
          <p className={cn("mt-3 text-center text-base font-extrabold", solved ? "text-emerald-700" : "text-rose-600")}>
            {solved ? <>🎉 ถูกต้อง! ลำดับ {ORD[rank]} คือ <u>{people[answerIdx].name}</u></> : <>ยังไม่ใช่ — ลองกด &ldquo;ดูวิธีคิด&rdquo; ด้านล่างดูนะ</>}
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
              <p className="text-sm font-extrabold text-slate-700">① ดู &ldquo;จำนวนเต็ม&rdquo; ก่อน — เศษเกินให้แปลงเป็นจำนวนคละ</p>
              <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                {people.map((p, i) => {
                  const m = toMixed(p);
                  const isImp = p.whole === 0 && p.num >= p.den;
                  return (
                    <div key={i} className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-sm">
                      <span className="h-3 w-3 rounded-full" style={{ background: BAR_COLORS[i] }} />
                      <b className="text-slate-700">{p.name}</b>
                      <Mixed whole={p.whole} num={p.num} den={p.den} size="sm" />
                      {isImp && <><span className="text-slate-400">=</span><Mixed whole={m.whole} num={m.num} den={m.den} size="sm" /></>}
                      <span className="ml-auto text-xs font-bold text-slate-400">
                        {m.whole === 0 ? "ยังไม่ถึง 1" : `เกิน ${m.whole} มานิดหน่อย`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ขั้น 2 — แท่งเปรียบเทียบเรียงน้อย→มาก */}
            <div className="rounded-xl border border-emerald-200 bg-white p-3">
              <p className="text-sm font-extrabold text-slate-700">② เทียบความยาวเวลา แล้วเรียงจากน้อยไปมาก (แท่งยิ่งยาว = เวลายิ่งมาก)</p>
              <div className="mt-2 space-y-2.5">
                {sorted.map((s, k) => {
                  const m = toMixed(s.p);
                  return (
                    <div key={s.i} className="flex items-center gap-2">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-600 text-xs font-extrabold text-white">{k + 1}</span>
                      <span className="w-14 shrink-0 truncate text-sm font-extrabold text-slate-700">{s.p.name}</span>
                      <div className="relative h-5 flex-1 rounded-full bg-slate-100">
                        <div className="h-full rounded-full" style={{ width: `${Math.max(6, (s.v / maxV) * 100)}%`, background: BAR_COLORS[s.i] }} />
                      </div>
                      <span className="flex w-16 shrink-0 items-center justify-start gap-1">
                        <Mixed whole={m.whole} num={m.num} den={m.den} size="sm" />
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-1.5 text-center text-xs font-bold text-slate-400">← น้อย ......................................... มาก →</p>
            </div>

            {/* ขั้น 3 */}
            <div className="rounded-xl border-2 border-emerald-300 bg-emerald-100/70 p-3 text-center">
              <p className="text-base font-extrabold text-emerald-800">
                ③ นับจากน้อยไปมาก → ลำดับ {ORD[rank]} คือ <span className="rounded-lg bg-white px-2 py-0.5 text-emerald-700">{people[answerIdx].name}</span>
                {" "}(ตอบข้อ {answerIdx + 1})
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ลิงก์ไปเกมที่เกี่ยวข้อง */}
      <Link href="/lessons/compare" className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-violet-300 bg-white px-4 py-3 text-sm font-extrabold text-violet-600 transition hover:bg-violet-50">
        <Gamepad2 size={17} /> ยังไม่คล่องเรื่องเปรียบเทียบ? ไปเล่นเกม &ldquo;เปรียบเทียบเศษส่วน&rdquo; ก่อน →
      </Link>
    </div>
  );
}
