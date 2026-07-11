"use client";

import { useState } from "react";
import { Shuffle, Volume2, Eye, EyeOff, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FractionShape } from "@/components/fractions/FractionShape";
import { cn } from "@/lib/cn";
import { readThaiFraction } from "@/lib/thaiNumber";
import type { FractionShapeKind, FractionTone } from "@/types/lessonContent";

/* ─── ประเภทภาพที่เลือกได้ ─── */
type ShapeTab = {
  id: FractionShapeKind;
  label: string;
  icon: string;
  tone: FractionTone;
};

const SHAPE_TABS: ShapeTab[] = [
  { id: "pizza", label: "พิซซ่า", icon: "🍕", tone: "accent" },
  { id: "watermelon", label: "แตงโม", icon: "🍉", tone: "pink" },
  { id: "chocolate", label: "ช็อกโกแลต", icon: "🍫", tone: "accent" },
  { id: "glass", label: "แก้วน้ำ", icon: "🥛", tone: "sky" },
  { id: "grid", label: "ตาราง", icon: "▦", tone: "violet" },
];

const DENOMINATORS = [2, 3, 4, 5, 6, 8, 10];

/** คำอธิบายสำหรับนักเรียน (ไม่ใช้ตัวแปร a/b) */
function describe(numerator: number, denominator: number): string {
  if (numerator === 0) {
    return "ยังไม่ได้ระบายส่วนใด — ลองเลือกจำนวนส่วนที่จะระบายดูสิ";
  }
  if (numerator === denominator) {
    return `ระบายครบทั้ง ${denominator} ส่วน รวมกันเป็น 1 หน่วยเต็มพอดี`;
  }
  return `ระบาย ${numerator} ส่วน จากทั้งหมด ${denominator} ส่วนที่แบ่งเท่า ๆ กัน`;
}

/** คำอ่าน เช่น เศษสามส่วนสี่ (ถ้ายังไม่ระบายให้บอกตรง ๆ) */
function readAloud(numerator: number, denominator: number): string {
  if (numerator === 0) return "ยังไม่ได้ระบายส่วนใด";
  return readThaiFraction(numerator, denominator);
}

export function InteractiveFractionExamples() {
  const [shape, setShape] = useState<FractionShapeKind>("pizza");
  const [denominator, setDenominator] = useState(4);
  const [numerator, setNumerator] = useState(3);
  const [showAnswer, setShowAnswer] = useState(true);
  const [speaking, setSpeaking] = useState(false);

  const activeTab = SHAPE_TABS.find((t) => t.id === shape) ?? SHAPE_TABS[0];
  const isFull = numerator === denominator;
  const isEmpty = numerator === 0;

  function handleDenominator(next: number) {
    setDenominator(next);
    if (numerator > next) setNumerator(next);
  }

  function randomize() {
    const tab = SHAPE_TABS[Math.floor(Math.random() * SHAPE_TABS.length)];
    const den = DENOMINATORS[Math.floor(Math.random() * DENOMINATORS.length)];
    const num = Math.floor(Math.random() * (den + 1));
    setShape(tab.id);
    setDenominator(den);
    setNumerator(num);
    setShowAnswer(true);
  }

  /** ฟังคำอ่าน — ใช้ Web Speech API ของเบราว์เซอร์ (ไม่เพิ่ม library) มี fallback เป็น visual */
  function speak() {
    const text = `${readAloud(numerator, denominator)}`;
    setSpeaking(true);
    window.setTimeout(() => setSpeaking(false), 1400);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = "th-TH";
        utter.rate = 0.9;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utter);
      } catch {
        /* เงียบไว้ ถ้าเบราว์เซอร์ไม่รองรับก็แสดง visual อย่างเดียว */
      }
    }
  }

  return (
    <Card className="overflow-hidden !p-0">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-5">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-2xl shadow-sm">
            🧪
          </span>
          <div>
            <h2 className="text-xl font-extrabold text-brand-900">ห้องทดลองเศษส่วน</h2>
            <p className="mt-0.5 text-sm font-bold text-slate-500">
              เลือกของ ปรับจำนวนส่วน ฟังคำอ่าน — หรือกดซ่อนคำตอบให้เพื่อนทายหน้าชั้น
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={randomize}
            className="flex items-center gap-1.5 rounded-xl border border-violet-200 bg-white px-3.5 py-2 text-sm font-extrabold text-violet-600 transition hover:bg-violet-50"
          >
            <Shuffle size={15} />
            สุ่มตัวอย่าง
          </button>
          <button
            onClick={speak}
            className={cn(
              "flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-extrabold transition",
              speaking
                ? "border-sky-300 bg-sky-100 text-sky-700"
                : "border-sky-200 bg-white text-sky-600 hover:bg-sky-50"
            )}
          >
            <Volume2 size={15} className={speaking ? "animate-pulse" : ""} />
            {speaking ? "กำลังอ่าน…" : "ฟังคำอ่าน"}
          </button>
          <button
            onClick={() => setShowAnswer((v) => !v)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50"
          >
            {showAnswer ? <EyeOff size={15} /> : <Eye size={15} />}
            {showAnswer ? "ซ่อนคำตอบ" : "แสดงคำตอบ"}
          </button>
        </div>
      </div>

      {/* ── Body: ห้องทดลอง ── */}
      <div className="p-6">
        <div className="grid gap-5 md:grid-cols-[260px_1fr]">
          {/* ── ตัวควบคุม ── */}
          <div className="space-y-5">
            {/* เลือกประเภทภาพ */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
                เลือกประเภทภาพ
              </div>
              <div className="mt-3 grid grid-cols-5 gap-1.5">
                {SHAPE_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setShape(tab.id)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl border px-1 py-2 text-[10px] font-extrabold transition",
                      tab.id === shape
                        ? "border-violet-300 bg-violet-50 text-violet-700 shadow-sm"
                        : "border-slate-200 bg-white text-slate-500 hover:border-violet-200 hover:bg-violet-50/40"
                    )}
                  >
                    <span className="text-lg leading-none">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* จำนวนส่วนทั้งหมด */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
                จำนวนส่วนทั้งหมด <span className="text-brand-500">(ตัวส่วน)</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {DENOMINATORS.map((value) => (
                  <button
                    key={value}
                    onClick={() => handleDenominator(value)}
                    className={cn(
                      "h-10 w-10 rounded-xl border text-sm font-extrabold transition",
                      value === denominator
                        ? "border-brand-600 bg-brand-600 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:bg-brand-50"
                    )}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            {/* จำนวนส่วนที่ระบาย */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <div className="text-xs font-extrabold uppercase tracking-wide text-slate-500">
                จำนวนส่วนที่ระบาย <span className="text-rose-500">(ตัวเศษ)</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {Array.from({ length: denominator + 1 }, (_, i) => i).map((value) => (
                  <button
                    key={value}
                    onClick={() => setNumerator(value)}
                    className={cn(
                      "h-10 w-10 rounded-xl border text-sm font-extrabold transition",
                      value === numerator
                        ? "border-rose-500 bg-rose-500 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-rose-300 hover:bg-rose-50"
                    )}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <input
                type="range"
                min={0}
                max={denominator}
                value={numerator}
                onChange={(e) => setNumerator(Number(e.target.value))}
                className="mt-4 w-full accent-rose-500"
                aria-label="เลื่อนเลือกจำนวนส่วนที่ระบาย"
              />
              <div className="mt-2 flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-700">
                <Sparkles size={13} />
                ลองปรับค่าแล้วดูว่าเศษส่วนเปลี่ยนอย่างไร
              </div>
            </div>
          </div>

          {/* ── การ์ด Preview ใหญ่ ── */}
          <div className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-violet-100 bg-gradient-to-b from-violet-50/50 to-white p-6">
            <FractionShape
              numerator={numerator}
              denominator={denominator}
              shape={shape}
              tone={activeTab.tone}
              className="h-44 w-44"
            />

            {showAnswer ? (
              <>
                {/* เศษส่วนตัวใหญ่ */}
                <div className="flex flex-col items-center leading-none">
                  <span className="text-5xl font-extrabold text-rose-500">{numerator}</span>
                  <span className="my-1.5 h-1.5 w-16 rounded-full bg-amber-400" />
                  <span className="text-5xl font-extrabold text-brand-600">{denominator}</span>
                </div>

                {/* คำอ่าน */}
                <div className="rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 px-5 py-1.5 text-base font-extrabold text-white shadow-sm">
                  {readAloud(numerator, denominator)}
                </div>

                {/* badge สถานะพิเศษ */}
                {isFull && (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-700">
                    = 1 หน่วยเต็ม
                  </span>
                )}
                {isEmpty && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-500">
                    0 / {denominator}
                  </span>
                )}

                {/* คำอธิบาย */}
                <p className="max-w-xs text-center text-sm font-bold leading-relaxed text-slate-600">
                  {describe(numerator, denominator)}
                </p>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <span className="text-5xl font-extrabold text-slate-300">?</span>
                <p className="max-w-xs text-sm font-bold text-slate-400">
                  ลองทายจากภาพก่อนว่าเป็นเศษส่วนอะไร แล้วกด “แสดงคำตอบ”
                </p>
              </div>
            )}

            {/* ตัวเศษ / ตัวส่วน relation */}
            <div className="flex w-full max-w-sm items-stretch gap-2 text-center text-[11px] font-bold">
              <div className="flex-1 rounded-xl bg-rose-50 px-3 py-2 text-rose-600">
                <div className="text-base">🎨</div>
                ตัวเศษ = ส่วนที่ระบาย
              </div>
              <div className="grid place-items-center text-lg font-extrabold text-slate-300">/</div>
              <div className="flex-1 rounded-xl bg-brand-50 px-3 py-2 text-brand-700">
                <div className="text-base">🍰</div>
                ตัวส่วน = ส่วนทั้งหมด
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer: รู้ไว้ใช่ว่า ── */}
      <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-4">
        <div className="flex items-center gap-2 text-sm font-extrabold text-violet-700">
          <span>🏆</span> รู้ไว้ใช่ว่า!
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="flex items-start gap-2.5 rounded-xl bg-white px-3.5 py-3 shadow-sm">
            <span className="text-lg">✅</span>
            <div className="text-xs font-bold text-slate-600">
              ถ้าระบายครบทุกส่วน
              <div className="text-slate-400">เช่น 4/4 = 1 หน่วยเต็ม</div>
            </div>
          </div>
          <div className="flex items-start gap-2.5 rounded-xl bg-white px-3.5 py-3 shadow-sm">
            <span className="text-lg">⚪</span>
            <div className="text-xs font-bold text-slate-600">
              ถ้ายังไม่ระบายส่วนใดเลย
              <div className="text-slate-400">เช่น 0/5 = ยังไม่ได้ระบาย</div>
            </div>
          </div>
          <div className="flex items-start gap-2.5 rounded-xl bg-white px-3.5 py-3 shadow-sm">
            <span className="text-lg">💡</span>
            <div className="text-xs font-bold text-slate-600">
              เศษส่วนใช้เปรียบเทียบ
              <div className="text-slate-400">บอกว่ามากกว่าน้อยกว่าเท่าใด</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
