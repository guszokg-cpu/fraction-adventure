"use client";

import { useState } from "react";
import { CheckCircle2, RotateCcw, Shuffle, Eye, Info, Check, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FractionText } from "@/components/fractions/FractionText";
import { cn } from "@/lib/cn";
import { generateDrawChallenge, toMixedNumber, type FractionKind } from "@/lib/fractionUtils";

type FractionCard = {
  id: string;
  whole: number;
  numerator: number;
  denominator: number;
  kind: FractionKind;
};

const DEFAULT_CARDS: FractionCard[] = [
  { id: "c1", whole: 0, numerator: 3, denominator: 5, kind: "proper" },
  { id: "c2", whole: 0, numerator: 7, denominator: 4, kind: "improper" },
  { id: "c3", whole: 1, numerator: 2, denominator: 3, kind: "mixed" },
  { id: "c4", whole: 0, numerator: 8, denominator: 8, kind: "improper" },
  { id: "c5", whole: 0, numerator: 2, denominator: 9, kind: "proper" },
  { id: "c6", whole: 0, numerator: 5, denominator: 3, kind: "improper" },
  { id: "c7", whole: 2, numerator: 1, denominator: 4, kind: "mixed" },
  { id: "c8", whole: 0, numerator: 6, denominator: 10, kind: "proper" },
  { id: "c9", whole: 0, numerator: 9, denominator: 5, kind: "improper" },
  { id: "c10", whole: 3, numerator: 1, denominator: 2, kind: "mixed" },
];

const TOTAL_CARDS = DEFAULT_CARDS.length;

const KIND_CYCLE: FractionKind[] = ["proper", "improper", "mixed", "proper", "improper", "mixed", "proper", "improper", "mixed", "proper"];

function generateRandomCards(): FractionCard[] {
  return KIND_CYCLE.map((kind, i) => {
    const c = generateDrawChallenge([kind]);
    if (kind === "mixed") {
      const mixed = toMixedNumber(c.numerator, c.denominator);
      return { id: `r${i}-${Date.now()}`, whole: mixed.whole, numerator: mixed.numerator, denominator: mixed.denominator, kind };
    }
    return { id: `r${i}-${Date.now()}`, whole: 0, numerator: c.numerator, denominator: c.denominator, kind };
  }).sort(() => Math.random() - 0.5);
}

const BASKETS: {
  id: FractionKind;
  title: string;
  hint: string;
  example: { whole: number; numerator: number; denominator: number };
  icon: string;
  border: string;
  bg: string;
  text: string;
  ring: string;
}[] = [
  {
    id: "proper",
    title: "เศษส่วนแท้",
    hint: "ตัวเศษน้อยกว่าตัวส่วน",
    example: { whole: 0, numerator: 3, denominator: 4 },
    icon: "🟢",
    border: "border-emerald-300",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    ring: "ring-emerald-400",
  },
  {
    id: "improper",
    title: "เศษเกิน",
    hint: "ตัวเศษมากกว่าหรือเท่ากับตัวส่วน",
    example: { whole: 0, numerator: 5, denominator: 4 },
    icon: "🟠",
    border: "border-amber-300",
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-400",
  },
  {
    id: "mixed",
    title: "จำนวนคละ",
    hint: "จำนวนเต็ม + เศษส่วน",
    example: { whole: 1, numerator: 1, denominator: 2 },
    icon: "🔷",
    border: "border-violet-300",
    bg: "bg-violet-50",
    text: "text-violet-700",
    ring: "ring-violet-400",
  },
];

const KIND_LABEL: Record<FractionKind, string> = {
  proper: "เศษส่วนแท้",
  improper: "เศษเกิน",
  mixed: "จำนวนคละ",
};

function reasonFor(card: FractionCard): string {
  if (card.kind === "proper") {
    return `${card.numerator}/${card.denominator} เป็นเศษส่วนแท้ เพราะ ${card.numerator} น้อยกว่า ${card.denominator}`;
  }
  if (card.kind === "improper") {
    if (card.numerator === card.denominator) {
      return `${card.numerator}/${card.denominator} เป็นเศษเกิน เพราะตัวเศษเท่ากับตัวส่วน และมีค่าเท่ากับ 1`;
    }
    return `${card.numerator}/${card.denominator} เป็นเศษเกิน เพราะ ${card.numerator} มากกว่า ${card.denominator}`;
  }
  return `${card.whole} ${card.numerator}/${card.denominator} เป็นจำนวนคละ เพราะมีจำนวนเต็ม ${card.whole} นำหน้า`;
}

export function ClassifyActivity() {
  const [cards, setCards] = useState<FractionCard[]>(DEFAULT_CARDS);
  const [placements, setPlacements] = useState<Record<string, FractionKind | null>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const score = cards.reduce((sum, c) => sum + (placements[c.id] === c.kind ? 1 : 0), 0);

  function selectCard(id: string) {
    if (revealed) return;
    setSelectedId((prev) => (prev === id ? null : id));
  }

  function placeInBasket(kind: FractionKind) {
    if (revealed || !selectedId) return;
    setPlacements((prev) => ({ ...prev, [selectedId]: kind }));
    setSelectedId(null);
    setChecked(false);
  }

  function checkAnswers() {
    setChecked(true);
  }

  function restart() {
    setPlacements({});
    setSelectedId(null);
    setChecked(false);
    setRevealed(false);
  }

  function shuffleQuestions() {
    setCards(generateRandomCards());
    setPlacements({});
    setSelectedId(null);
    setChecked(false);
    setRevealed(false);
  }

  function revealAnswers() {
    const answerMap: Record<string, FractionKind> = {};
    cards.forEach((c) => {
      answerMap[c.id] = c.kind;
    });
    setPlacements(answerMap);
    setSelectedId(null);
    setChecked(true);
    setRevealed(true);
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden rounded-3xl p-0 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-sky-600 to-cyan-600 px-6 py-5 text-white">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20 text-lg font-extrabold">
              5
            </span>
            <div>
              <h2 className="text-2xl font-extrabold">แยกประเภทเศษส่วน</h2>
              <p className="mt-0.5 text-sm font-bold text-sky-100">ลากการ์ดเศษส่วนไปใส่ตะกร้าให้ถูกประเภท</p>
            </div>
          </div>
          <span className="rounded-xl bg-white px-4 py-2 text-center text-sm font-extrabold text-sky-700 shadow-sm">
            คะแนน
            <br />
            <span className="text-xl">{score}/{TOTAL_CARDS}</span>
          </span>
        </div>

        <div className="space-y-6 p-6">
          {/* ตะกร้า 3 ประเภท */}
          <div className="grid gap-4 sm:grid-cols-3">
            {BASKETS.map((b) => (
              <button
                key={b.id}
                onClick={() => placeInBasket(b.id)}
                disabled={revealed || !selectedId}
                className={cn(
                  "rounded-2xl border-2 p-5 text-center transition disabled:cursor-not-allowed",
                  b.border,
                  b.bg,
                  selectedId && !revealed && "cursor-pointer hover:-translate-y-0.5 hover:shadow-md",
                  selectedId && !revealed && `ring-2 ring-offset-2 ${b.ring}`
                )}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl" aria-hidden>{b.icon}</span>
                  <h3 className={cn("text-lg font-extrabold", b.text)}>{b.title}</h3>
                </div>
                <p className="mt-1 text-xs font-bold text-slate-500">{b.hint}</p>
                <div className="mt-3 flex items-center justify-center gap-1.5">
                  {b.example.whole > 0 && <span className={cn("text-2xl font-extrabold", b.text)}>{b.example.whole}</span>}
                  <FractionText numerator={b.example.numerator} denominator={b.example.denominator} className="text-2xl" toneClassName={b.text} />
                </div>
              </button>
            ))}
          </div>

          {/* คำแนะนำ */}
          <div className="flex items-start gap-2 rounded-xl bg-sky-50 px-4 py-3 text-sm font-bold text-sky-700">
            <Info size={16} className="mt-0.5 shrink-0" />
            เลือกการ์ดที่ต้องการก่อน แล้วคลิกตะกร้าที่ถูกต้อง — ทำให้ครบทั้ง {TOTAL_CARDS} ข้อ แล้วกด “ตรวจคำตอบ”
          </div>

          {/* กองการ์ดโจทย์ */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-base font-extrabold text-brand-900">
              🗂️ การ์ดโจทย์
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
              {cards.map((c) => {
                const placedKind = placements[c.id] ?? null;
                const isSelected = selectedId === c.id;
                const isCorrect = checked && placedKind === c.kind;
                const isWrong = checked && placedKind !== null && placedKind !== c.kind;
                const isUnplaced = checked && placedKind === null;
                const basketMeta = placedKind ? BASKETS.find((b) => b.id === placedKind) : null;

                return (
                  <button
                    key={c.id}
                    onClick={() => selectCard(c.id)}
                    disabled={revealed}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-2xl border-2 bg-white px-3 py-4 shadow-sm transition disabled:cursor-not-allowed",
                      isSelected && "border-sky-400 ring-2 ring-sky-300",
                      !isSelected && !checked && placedKind && basketMeta && basketMeta.border,
                      !isSelected && !checked && !placedKind && "border-slate-200 hover:border-sky-200",
                      checked && isCorrect && "border-emerald-400 bg-emerald-50",
                      checked && (isWrong || isUnplaced) && "border-rose-300 bg-rose-50"
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      {c.whole > 0 && <span className="text-2xl font-extrabold text-brand-900">{c.whole}</span>}
                      <FractionText numerator={c.numerator} denominator={c.denominator} className="text-2xl" toneClassName="text-brand-900" />
                    </div>

                    {placedKind && !checked && (
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-extrabold", basketMeta?.bg, basketMeta?.text)}>
                        {KIND_LABEL[placedKind]}
                      </span>
                    )}

                    {checked && (
                      <span className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold", isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600")}>
                        {isCorrect ? <Check size={11} /> : <X size={11} />}
                        {isUnplaced ? "ยังไม่ได้วาง" : KIND_LABEL[placedKind as FractionKind]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* คะแนนรวม */}
          {checked && !revealed && (
            <div className={cn("rounded-xl px-4 py-3 text-center text-base font-extrabold", score === TOTAL_CARDS ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600")}>
              ถูก {score} จาก {TOTAL_CARDS} ข้อ
            </div>
          )}

          {/* ปุ่มควบคุม */}
          <div className="flex flex-wrap justify-center gap-2.5">
            <button
              onClick={checkAnswers}
              disabled={revealed}
              className="flex items-center gap-1.5 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <CheckCircle2 size={16} />
              ตรวจคำตอบ
            </button>
            <button
              onClick={restart}
              className="flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-5 py-2.5 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50"
            >
              <RotateCcw size={16} />
              เริ่มใหม่
            </button>
            <button
              onClick={shuffleQuestions}
              className="flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-5 py-2.5 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50"
            >
              <Shuffle size={16} />
              สุ่มโจทย์
            </button>
            <button
              onClick={revealAnswers}
              className="flex items-center gap-1.5 rounded-xl border-2 border-slate-200 bg-white px-5 py-2.5 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50"
            >
              <Eye size={16} />
              ดูเฉลย
            </button>
          </div>

          {/* เฉลยพร้อมเหตุผล */}
          {revealed && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
              <h3 className="text-base font-extrabold text-brand-900">เฉลยพร้อมเหตุผล</h3>
              <ul className="mt-3 space-y-1.5 text-sm font-bold text-slate-600">
                {cards.map((c) => (
                  <li key={c.id} className="flex items-start gap-2">
                    <span className="mt-0.5 text-sky-500">•</span>
                    {reasonFor(c)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
