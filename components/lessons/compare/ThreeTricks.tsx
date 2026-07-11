"use client";

import { useEffect, useState } from "react";
import { Check, Shuffle, Target, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StackedFraction } from "@/components/lessons/compare/StackedFraction";
import { cn } from "@/lib/cn";
import { randInt } from "@/lib/randomFraction";

const SIGNS = [">", "=", "<"] as const;
type Sign = (typeof SIGNS)[number];

function signOf(a: number, b: number): Sign {
  if (a > b) return ">";
  if (a < b) return "<";
  return "=";
}
function signWord(s: Sign): string {
  return s === ">" ? "มากกว่า" : s === "<" ? "น้อยกว่า" : "เท่ากับ";
}

// ── สีแท่งที่เลือกได้ ──
type BarColor = { id: string; hex: string; text: string; label: string };
const BAR_COLORS: BarColor[] = [
  { id: "sky", hex: "#38bdf8", text: "text-sky-600", label: "ฟ้า" },
  { id: "emerald", hex: "#34d399", text: "text-emerald-600", label: "เขียว" },
  { id: "pink", hex: "#f472b6", text: "text-pink-600", label: "ชมพู" },
  { id: "amber", hex: "#fbbf24", text: "text-amber-500", label: "เหลือง" },
  { id: "violet", hex: "#a78bfa", text: "text-violet-600", label: "ม่วง" },
];
function colorOf(id: string): BarColor {
  return BAR_COLORS.find((c) => c.id === id) ?? BAR_COLORS[0];
}

type TrickId = "same-denominator" | "same-numerator" | "benchmark";
type Frac = { n: number; d: number };
type Challenge = { left: Frac; right: Frac };

function makeChallenge(trick: TrickId): Challenge {
  if (trick === "same-denominator") {
    const d = randInt(3, 9);
    let n1 = randInt(1, d - 1);
    let n2 = randInt(1, d - 1);
    let tries = 0;
    while (n1 === n2 && tries++ < 20) n2 = randInt(1, d - 1);
    return { left: { n: n1, d }, right: { n: n2, d } };
  }
  if (trick === "same-numerator") {
    const n = randInt(1, 3);
    let d1 = randInt(n + 1, 9);
    let d2 = randInt(n + 1, 9);
    let tries = 0;
    while (d1 === d2 && tries++ < 20) d2 = randInt(n + 1, 9);
    return { left: { n, d: d1 }, right: { n, d: d2 } };
  }
  let d = randInt(3, 9);
  let n = randInt(1, d - 1);
  let tries = 0;
  while (n / d === 0.5 && tries++ < 20) {
    d = randInt(3, 9);
    n = randInt(1, d - 1);
  }
  return { left: { n, d }, right: { n: 1, d: 2 } };
}

const DEFAULT_CHALLENGE: Record<TrickId, Challenge> = {
  "same-denominator": { left: { n: 3, d: 5 }, right: { n: 2, d: 5 } },
  "same-numerator": { left: { n: 1, d: 3 }, right: { n: 1, d: 5 } },
  benchmark: { left: { n: 3, d: 5 }, right: { n: 1, d: 2 } },
};

const TRICKS: {
  id: TrickId;
  icon: string;
  title: string;
  rule: string;
  color: string;
  activeClass: string;
  badgeClass: string;
}[] = [
  {
    id: "same-denominator",
    icon: "1️⃣",
    title: "ตัวส่วนเท่ากัน",
    rule: "ถ้าตัวส่วนเท่ากัน กรอบสูงเท่ากันและแบ่งชั้นเท่ากัน — ดูที่ตัวเศษ ระบายสูงกว่า ค่ามากกว่า",
    color: "text-sky-700",
    activeClass: "border-sky-500 bg-sky-50",
    badgeClass: "bg-sky-100 text-sky-700",
  },
  {
    id: "same-numerator",
    icon: "2️⃣",
    title: "ตัวเศษเท่ากัน",
    rule: "ถ้าตัวเศษเท่ากัน ตัวส่วนยิ่งน้อย ค่ายิ่งมาก — เพราะแบ่งน้อยชั้น แต่ละชั้นเลยสูงกว่า",
    color: "text-amber-700",
    activeClass: "border-amber-500 bg-amber-50",
    badgeClass: "bg-amber-100 text-amber-700",
  },
  {
    id: "benchmark",
    icon: "3️⃣",
    title: "เทียบกับครึ่ง (1/2)",
    rule: "ใช้เส้นครึ่ง (1/2) เป็นเกณฑ์ — แท่งสูงเกินเส้น = มากกว่าครึ่ง ต่ำกว่าเส้น = น้อยกว่าครึ่ง",
    color: "text-violet-700",
    activeClass: "border-violet-500 bg-violet-50",
    badgeClass: "bg-violet-100 text-violet-700",
  },
];

/** ตรวจว่าโจทย์เข้าเงื่อนไขเคล็ดลับใดบ้าง (ใช้ทำ badge อัตโนมัติ) */
function detectTricks(c: Challenge): TrickId[] {
  const out: TrickId[] = [];
  if (c.left.d === c.right.d) out.push("same-denominator");
  if (c.left.n === c.right.n) out.push("same-numerator");
  if (c.right.n === 1 && c.right.d === 2) out.push("benchmark");
  return out;
}

const DETECT_LABEL: Record<TrickId, string> = {
  "same-denominator": "ตัวส่วนเท่ากัน",
  "same-numerator": "ตัวเศษเท่ากัน",
  benchmark: "เทียบกับ 1/2",
};

/** แถวเลือกสีแท่ง */
function ColorSwatches({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      {BAR_COLORS.map((c) => (
        <button
          key={c.id}
          onClick={() => onChange(c.id)}
          aria-label={`เลือกสี${c.label}`}
          title={c.label}
          className={cn(
            "h-6 w-6 rounded-full border-2 transition",
            value === c.id ? "scale-110 border-slate-700 shadow" : "border-white shadow-sm"
          )}
          style={{ backgroundColor: c.hex }}
        />
      ))}
    </div>
  );
}

/** แท่งเศษส่วนแนวตั้งแบบเกจวัด — กรอบสูงเท่ากันเสมอ (แทน 1 หน่วย) แบ่งชั้นตามตัวส่วน เติมสีจากล่างขึ้น */
function VerticalBar({
  frac,
  fillHex,
  raised,
  showBenchmark,
  highlightTopCell,
}: {
  frac: Frac;
  fillHex: string;
  raised: boolean;
  showBenchmark?: boolean;
  highlightTopCell?: boolean;
}) {
  const pct = (frac.n / frac.d) * 100;
  const cellPct = 100 / frac.d;
  return (
    <div className="relative h-56 w-16 sm:h-72 sm:w-24">
      <div className="absolute inset-0 overflow-hidden rounded-2xl border-4 border-slate-700 bg-white shadow-inner">
        {/* สีที่เติม (ไล่ระดับขึ้น) */}
        <div
          className="absolute inset-x-0 bottom-0 transition-[height] duration-700 ease-out"
          style={{ height: raised ? `${pct}%` : "0%", backgroundColor: fillHex }}
        />
        {/* ตารางชั้น — เส้นแบ่งเห็นชัดทั้งช่องที่เติมสีและช่องว่าง
            หมายเหตุ: container เป็น flex-col-reverse ดังนั้น "ลูกตัวแรก" (i=0) อยู่ล่างสุดของภาพ
            ต้องเอา border-t ออกจาก "ลูกตัวสุดท้าย" (บนสุดของภาพ) ไม่ใช่ตัวแรก มิเช่นนั้นเส้นแบ่งเส้นล่างสุดจะหายไป */}
        <div className="absolute inset-0 flex flex-col-reverse">
          {Array.from({ length: frac.d }, (_, i) => (
            <div key={i} className="flex-1 border-t-2 border-slate-500 last:border-t-0" />
          ))}
        </div>
        {/* เส้นเกณฑ์ครึ่ง 1/2 */}
        {showBenchmark && (
          <>
            <div className="absolute inset-x-0 border-t-[3px] border-dashed border-rose-500" style={{ bottom: "50%" }} />
            <span className="absolute right-1 top-1/2 -translate-y-1/2 rounded bg-rose-500 px-1 py-0.5 text-[9px] font-extrabold text-white">½</span>
          </>
        )}
      </div>

      {/* ไฮไลต์ชั้นบนสุดที่ระบาย — กรอบเข้มเกือบดำ ตัดกับสีเติมได้ทุกสี (ไม่กลืนแบบกรอบเหลืองเดิม) */}
      {highlightTopCell && frac.n > 0 && (
        <div
          className={cn("pointer-events-none absolute inset-x-0 rounded-sm transition-opacity duration-500", raised ? "opacity-100" : "opacity-0")}
          style={{
            bottom: `${(frac.n - 1) * cellPct}%`,
            height: `${cellPct}%`,
            boxShadow: "inset 0 0 0 3px #0f172a",
          }}
        />
      )}
    </div>
  );
}

type Stats = Record<TrickId, { correct: number; total: number }>;

function TrickPractice({
  trick,
  onAnswer,
  stat,
  leftColorId,
  rightColorId,
  onLeftColor,
  onRightColor,
}: {
  trick: TrickId;
  onAnswer: (trick: TrickId, correct: boolean) => void;
  stat: { correct: number; total: number };
  leftColorId: string;
  rightColorId: string;
  onLeftColor: (id: string) => void;
  onRightColor: (id: string) => void;
}) {
  const [challenge, setChallenge] = useState<Challenge>(DEFAULT_CHALLENGE[trick]);
  const [picked, setPicked] = useState<Sign | null>(null);
  const [raised, setRaised] = useState(false);

  // แท่งไล่ระดับขึ้นทุกครั้งที่เปลี่ยนโจทย์
  useEffect(() => {
    setRaised(false);
    const id = window.setTimeout(() => setRaised(true), 70);
    return () => window.clearTimeout(id);
  }, [challenge]);

  const answer = signOf(challenge.left.n / challenge.left.d, challenge.right.n / challenge.right.d);
  const isCorrect = picked === answer;
  const detected = detectTricks(challenge);

  const isBenchmark = trick === "benchmark";
  const isSameNum = trick === "same-numerator";
  const leftColor = colorOf(leftColorId);
  const rightColor = colorOf(rightColorId);

  function choose(sign: Sign) {
    if (picked) return;
    setPicked(sign);
    onAnswer(trick, sign === answer);
  }
  function next() {
    setChallenge(makeChallenge(trick));
    setPicked(null);
  }

  return (
    <div className="space-y-4">
      {/* badge ตรวจโจทย์อัตโนมัติ */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400"><Target size={13} /> โจทย์นี้เข้าเงื่อนไข:</span>
        {detected.map((d) => {
          const t = TRICKS.find((x) => x.id === d)!;
          return (
            <span key={d} className={cn("rounded-full px-2.5 py-0.5 text-xs font-extrabold", t.badgeClass)}>
              {DETECT_LABEL[d]}
            </span>
          );
        })}
      </div>

      {/* แท่งแนวตั้งคู่ */}
      <div className="flex flex-wrap items-end justify-center gap-6 rounded-2xl border border-slate-200 bg-slate-50/50 p-5 sm:gap-10">
        <div className="flex flex-col items-center gap-2">
          <VerticalBar frac={challenge.left} fillHex={leftColor.hex} raised={raised} showBenchmark={isBenchmark} highlightTopCell={isSameNum} />
          <StackedFraction numerator={challenge.left.n} denominator={challenge.left.d} className="text-2xl sm:text-3xl" toneClassName={leftColor.text} />
          {isSameNum && <span className="text-[11px] font-bold text-slate-400">ชั้นละ 1/{challenge.left.d}</span>}
          <ColorSwatches value={leftColorId} onChange={onLeftColor} />
        </div>

        <span className="pb-24 text-3xl font-extrabold text-slate-400 sm:pb-32">?</span>

        <div className="flex flex-col items-center gap-2">
          <VerticalBar frac={challenge.right} fillHex={rightColor.hex} raised={raised} showBenchmark={isBenchmark} highlightTopCell={isSameNum} />
          <StackedFraction numerator={challenge.right.n} denominator={challenge.right.d} className="text-2xl sm:text-3xl" toneClassName={rightColor.text} />
          {isSameNum && <span className="text-[11px] font-bold text-slate-400">ชั้นละ 1/{challenge.right.d}</span>}
          <ColorSwatches value={rightColorId} onChange={onRightColor} />
        </div>
      </div>

      {/* ปุ่มเครื่องหมาย + สุ่มใหม่ */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {SIGNS.map((sign) => {
          const active = picked === sign;
          const rightPick = sign === answer;
          return (
            <button
              key={sign}
              onClick={() => choose(sign)}
              disabled={picked !== null}
              aria-label={`เลือกเครื่องหมาย ${sign}`}
              className={cn(
                "grid h-14 w-14 place-items-center rounded-2xl border-2 text-2xl font-extrabold transition sm:h-16 sm:w-16 sm:text-3xl",
                !picked && "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50",
                picked && !active && !rightPick && "border-slate-100 bg-slate-50 text-slate-300",
                active && rightPick && "border-emerald-400 bg-emerald-500 text-white",
                active && !rightPick && "border-rose-400 bg-rose-50 text-rose-600",
                picked && rightPick && !active && "border-emerald-300 bg-emerald-50 text-emerald-600"
              )}
            >
              {sign}
            </button>
          );
        })}
        <button
          onClick={next}
          className="ml-2 flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50"
        >
          <Shuffle size={14} /> ลองข้อใหม่
        </button>
      </div>

      {/* สถิติความเชี่ยวชาญของเคล็ดลับนี้ */}
      <div className="flex justify-center">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-500">
          เคล็ดลับนี้: ตอบถูก {stat.correct}/{stat.total} ข้อ
        </span>
      </div>

      {picked && (
        <div className={cn("rounded-xl px-4 py-3 text-sm font-bold sm:text-base", isCorrect ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600")}>
          <span className="flex items-start gap-2">
            {isCorrect ? <Check size={18} className="mt-0.5 shrink-0" /> : <X size={18} className="mt-0.5 shrink-0" />}
            <span>
              {isCorrect ? "ถูกต้อง! " : "ยังไม่ถูก — "}
              {trick === "same-denominator" &&
                `ตัวส่วนเท่ากัน (${challenge.left.d}) กรอบสูงเท่ากัน จึงดูตัวเศษ: ${challenge.left.n} ${signWord(answer)} ${challenge.right.n}`}
              {trick === "same-numerator" &&
                `ตัวเศษเท่ากัน (ระบายฝั่งละ ${challenge.left.n} ชั้น) แต่ชั้นของ ${challenge.left.d < challenge.right.d ? `1/${challenge.left.d}` : `1/${challenge.right.d}`} สูงกว่า (แบ่งน้อยชั้นกว่า) จึงมีค่ามากกว่า`}
              {trick === "benchmark" &&
                `ครึ่งหนึ่งของ ${challenge.left.d} คือ ${challenge.left.d / 2} — ตัวเศษ ${challenge.left.n} ${challenge.left.n > challenge.left.d / 2 ? "เกินครึ่ง" : challenge.left.n < challenge.left.d / 2 ? "ไม่ถึงครึ่ง" : "พอดีครึ่ง"} แท่งจึง${signWord(answer)}เส้นครึ่ง`}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}

const INITIAL_STATS: Stats = {
  "same-denominator": { correct: 0, total: 0 },
  "same-numerator": { correct: 0, total: 0 },
  benchmark: { correct: 0, total: 0 },
};

export function ThreeTricks() {
  const [active, setActive] = useState<TrickId>("same-denominator");
  const [stats, setStats] = useState<Stats>(INITIAL_STATS);
  const [leftColorId, setLeftColorId] = useState("sky");
  const [rightColorId, setRightColorId] = useState("emerald");
  const activeTrick = TRICKS.find((t) => t.id === active)!;

  function handleAnswer(trick: TrickId, correct: boolean) {
    setStats((prev) => ({
      ...prev,
      [trick]: { correct: prev[trick].correct + (correct ? 1 : 0), total: prev[trick].total + 1 },
    }));
  }

  return (
    <Card className="overflow-hidden rounded-3xl p-0 shadow-sm">
      <div className="flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-green-500 px-6 py-5 text-white">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20 text-lg font-extrabold">3</span>
        <div>
          <h2 className="text-2xl font-extrabold sm:text-3xl">3 เคล็ดลับเปรียบเทียบ</h2>
          <p className="mt-0.5 text-sm font-bold text-emerald-100 sm:text-base">เลือกเคล็ดลับให้เหมาะกับโจทย์ แล้วดูแท่งสูงต่ำเทียบค่าทันที</p>
        </div>
      </div>

      <div className="space-y-5 bg-gradient-to-b from-slate-50/40 to-white p-5 sm:p-6">
        {/* แท็บเลือกเคล็ดลับ + สถิติต่อเคล็ดลับ */}
        <div className="grid gap-3 sm:grid-cols-3">
          {TRICKS.map((t) => {
            const s = stats[t.id];
            return (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={cn(
                  "rounded-2xl border-2 p-4 text-left transition",
                  active === t.id ? t.activeClass : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl" aria-hidden>{t.icon}</span>
                  <span className={cn("text-base font-extrabold", active === t.id ? t.color : "text-slate-700")}>{t.title}</span>
                </div>
                {s.total > 0 && (
                  <div className="mt-1.5 text-xs font-bold text-slate-400">ตอบถูก {s.correct}/{s.total} ข้อ</div>
                )}
              </button>
            );
          })}
        </div>

        {/* กฎของเคล็ดลับที่เลือก */}
        <div className={cn("rounded-2xl px-5 py-4 text-center text-base font-bold sm:text-lg", activeTrick.activeClass, activeTrick.color)}>
          💡 {activeTrick.rule}
        </div>

        {/* ฝึกทันที — key รีเซ็ต state เมื่อสลับเคล็ดลับ */}
        <TrickPractice
          key={active}
          trick={active}
          onAnswer={handleAnswer}
          stat={stats[active]}
          leftColorId={leftColorId}
          rightColorId={rightColorId}
          onLeftColor={setLeftColorId}
          onRightColor={setRightColorId}
        />
      </div>
    </Card>
  );
}
