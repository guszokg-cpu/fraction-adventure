"use client";

import { useState } from "react";
import { Shuffle } from "lucide-react";
import { FractionShape } from "@/components/fractions/FractionShape";
import { FractionText } from "@/components/fractions/FractionText";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { randomImproper, randomMixed } from "@/lib/randomFraction";

type Mode = "toMixed" | "toImproper";

function StepBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-50 text-xl font-extrabold text-pink-600 transition hover:bg-pink-100 active:scale-95"
    >
      {children}
    </button>
  );
}

function Stepper({ label, value, onDec, onInc }: { label: string; value: number; onDec: () => void; onInc: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-bold text-slate-500">{label}</span>
      <StepBtn onClick={onDec}>−</StepBtn>
      <span className="w-9 text-center text-3xl font-extrabold text-pink-600">{value}</span>
      <StepBtn onClick={onInc}>+</StepBtn>
    </div>
  );
}

/** แถววงกลม: เต็ม whole วง + เศษ rem อีก 1 วง — ทุกวงขนาดเท่ากัน */
function CircleRow({ whole, rem, den }: { whole: number; rem: number; den: number }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-pink-50/60 p-4">
      {Array.from({ length: whole }).map((_, i) => (
        <FractionShape key={i} numerator={den} denominator={den} shape="circle" tone="pink" className="h-20 w-20 sm:h-24 sm:w-24" />
      ))}
      {rem > 0 && <FractionShape numerator={rem} denominator={den} shape="circle" tone="violet" className="h-20 w-20 sm:h-24 sm:w-24" />}
    </div>
  );
}

export function TwoWayConverterCard() {
  const [mode, setMode] = useState<Mode>("toMixed");

  // โหมดเศษเกิน → คละ
  const [impNum, setImpNum] = useState(7);
  const [impDen, setImpDen] = useState(3);

  // โหมดคละ → เศษเกิน
  const [mixWhole, setMixWhole] = useState(2);
  const [mixNum, setMixNum] = useState(1);
  const [mixDen, setMixDen] = useState(3);

  const t1Whole = Math.floor(impNum / impDen);
  const t1Rem = impNum % impDen;

  const t2Product = mixWhole * mixDen;
  const t2Result = t2Product + mixNum;

  function randomize() {
    if (mode === "toMixed") {
      const { num, den } = randomImproper(2, 6);
      setImpNum(num);
      setImpDen(den);
    } else {
      const { whole, num, den } = randomMixed(2, 6);
      setMixWhole(whole);
      setMixNum(num);
      setMixDen(den);
    }
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-r from-pink-600 to-fuchsia-600 px-5 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-white/20 text-sm font-extrabold">2</span>
          <h2 className="text-xl font-extrabold">เครื่องแปลง 2 ทิศทาง</h2>
        </div>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        {/* สลับโหมด */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setMode("toMixed")}
            className={cn(
              "flex h-12 items-center justify-center rounded-xl text-sm font-extrabold transition sm:text-base",
              mode === "toMixed" ? "bg-pink-600 text-white shadow-md" : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            )}
          >
            เศษเกิน → จำนวนคละ
          </button>
          <button
            onClick={() => setMode("toImproper")}
            className={cn(
              "flex h-12 items-center justify-center rounded-xl text-sm font-extrabold transition sm:text-base",
              mode === "toImproper" ? "bg-fuchsia-600 text-white shadow-md" : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            )}
          >
            จำนวนคละ → เศษเกิน
          </button>
        </div>

        {mode === "toMixed" ? (
          <div className="space-y-5">
            {/* ตั้งค่า */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              <Stepper
                label="เศษ"
                value={impNum}
                onDec={() => setImpNum((n) => Math.max(impDen + 1, n - 1))}
                onInc={() => setImpNum((n) => Math.min(impDen * 4, n + 1))}
              />
              <Stepper
                label="ส่วน"
                value={impDen}
                onDec={() => {
                  const nd = Math.max(2, impDen - 1);
                  setImpDen(nd);
                  setImpNum((n) => Math.max(nd + 1, n));
                }}
                onInc={() => {
                  const nd = Math.min(9, impDen + 1);
                  setImpDen(nd);
                  setImpNum((n) => Math.max(nd + 1, n));
                }}
              />
              <button
                onClick={randomize}
                className="flex h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50"
              >
                <Shuffle size={15} /> สุ่มโจทย์
              </button>
            </div>

            {/* วิธีทำทีละขั้น */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border-2 border-pink-100 bg-white p-4 text-center">
                <span className="rounded-full bg-pink-500 px-3 py-0.5 text-xs font-extrabold text-white">ขั้นที่ 1: หาร</span>
                <p className="mt-3 text-2xl font-extrabold text-slate-700 sm:text-3xl">
                  {impNum} ÷ {impDen} = <span className="text-pink-600">{t1Whole}</span> เศษ{" "}
                  <span className="text-fuchsia-600">{t1Rem}</span>
                </p>
              </div>
              <div className="rounded-2xl border-2 border-fuchsia-100 bg-white p-4 text-center">
                <span className="rounded-full bg-fuchsia-500 px-3 py-0.5 text-xs font-extrabold text-white">ขั้นที่ 2: เขียนคำตอบ</span>
                <p className="mt-2 flex items-center justify-center gap-1 text-2xl font-extrabold sm:text-3xl">
                  <span className="text-pink-600">{t1Whole}</span>
                  {t1Rem > 0 && <FractionText numerator={t1Rem} denominator={impDen} className="text-2xl sm:text-3xl" toneClassName="text-fuchsia-600" />}
                </p>
                <p className="mt-1 text-xs font-bold text-slate-400">จำนวนเต็ม = ผลหาร, เศษที่เหลือเป็นตัวเศษ</p>
              </div>
            </div>

            {/* สมการรวม */}
            <div className="flex items-center justify-center gap-4 rounded-2xl bg-gradient-to-r from-pink-500 to-fuchsia-500 px-4 py-4 text-white">
              <FractionText numerator={impNum} denominator={impDen} className="text-4xl sm:text-5xl" toneClassName="text-white" />
              <span className="text-3xl font-extrabold sm:text-4xl">=</span>
              <div className="flex items-center gap-1">
                <span className="text-4xl font-extrabold sm:text-5xl">{t1Whole}</span>
                {t1Rem > 0 && <FractionText numerator={t1Rem} denominator={impDen} className="text-3xl sm:text-4xl" toneClassName="text-white" />}
              </div>
            </div>

            <CircleRow whole={t1Whole} rem={t1Rem} den={impDen} />
            <p className="text-center text-sm font-bold text-slate-600 sm:text-base">
              วงเต็มสีชมพู = จำนวนเต็ม {t1Whole} วง {t1Rem > 0 && <>วงสีม่วง = เศษที่เหลือ {t1Rem} ชิ้นจาก {impDen}</>}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* ตั้งค่า */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              <Stepper label="จำนวนเต็ม" value={mixWhole} onDec={() => setMixWhole((w) => Math.max(1, w - 1))} onInc={() => setMixWhole((w) => Math.min(5, w + 1))} />
              <Stepper
                label="เศษ"
                value={mixNum}
                onDec={() => setMixNum((n) => Math.max(1, n - 1))}
                onInc={() => setMixNum((n) => Math.min(mixDen - 1, n + 1))}
              />
              <Stepper
                label="ส่วน"
                value={mixDen}
                onDec={() => {
                  const nd = Math.max(2, mixDen - 1);
                  setMixDen(nd);
                  setMixNum((n) => Math.min(n, nd - 1));
                }}
                onInc={() => setMixDen((d) => Math.min(9, d + 1))}
              />
              <button
                onClick={randomize}
                className="flex h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-500 transition hover:bg-slate-50"
              >
                <Shuffle size={15} /> สุ่มโจทย์
              </button>
            </div>

            {/* วิธีทำทีละขั้น */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border-2 border-fuchsia-100 bg-white p-4 text-center">
                <span className="rounded-full bg-fuchsia-500 px-3 py-0.5 text-xs font-extrabold text-white">ขั้นที่ 1: คูณ</span>
                <p className="mt-3 text-2xl font-extrabold text-slate-700 sm:text-3xl">
                  {mixWhole} × {mixDen} = <span className="text-fuchsia-600">{t2Product}</span>
                </p>
                <p className="mt-1 text-xs font-bold text-slate-400">จำนวนเต็ม × ตัวส่วน</p>
              </div>
              <div className="rounded-2xl border-2 border-pink-100 bg-white p-4 text-center">
                <span className="rounded-full bg-pink-500 px-3 py-0.5 text-xs font-extrabold text-white">ขั้นที่ 2: บวกตัวเศษ</span>
                <p className="mt-3 text-2xl font-extrabold text-slate-700 sm:text-3xl">
                  {t2Product} + {mixNum} = <span className="text-pink-600">{t2Result}</span>
                </p>
                <p className="mt-1 text-xs font-bold text-slate-400">ได้ตัวเศษใหม่ ตัวส่วนคงเดิม</p>
              </div>
            </div>

            {/* สมการรวม */}
            <div className="flex items-center justify-center gap-4 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-pink-500 px-4 py-4 text-white">
              <div className="flex items-center gap-1">
                <span className="text-4xl font-extrabold sm:text-5xl">{mixWhole}</span>
                <FractionText numerator={mixNum} denominator={mixDen} className="text-3xl sm:text-4xl" toneClassName="text-white" />
              </div>
              <span className="text-3xl font-extrabold sm:text-4xl">=</span>
              <FractionText numerator={t2Result} denominator={mixDen} className="text-4xl sm:text-5xl" toneClassName="text-white" />
            </div>

            <CircleRow whole={mixWhole} rem={mixNum} den={mixDen} />
            <p className="text-center text-sm font-bold text-slate-600 sm:text-base">
              นับทุกชิ้นรวมกัน: {mixWhole} วงเต็ม ({t2Product} ชิ้น) + อีก {mixNum} ชิ้น = {t2Result} ชิ้น จากถาดละ {mixDen}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
