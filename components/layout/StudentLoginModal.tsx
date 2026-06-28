"use client";

import { useEffect, useRef, useState } from "react";
import { X, ArrowRight, ArrowLeft, Users, Hash } from "lucide-react";
import { cn } from "@/lib/cn";
import { findClassroomFromStore as findClassroom, findStudentFromStore as findStudent } from "@/lib/classroomStore";
import type { MockClassroom } from "@/lib/classroomStore";
import type { StudentSession } from "@/lib/studentSession";

type Step = "pin" | "studentId";

interface Props {
  onSuccess: (session: StudentSession) => void;
  onClose: () => void;
}

const inputCls = (error: boolean) =>
  cn(
    "h-12 w-full rounded-xl border px-4 text-center text-lg font-extrabold tracking-[0.18em] outline-none transition",
    error
      ? "border-rose-400 bg-rose-50 text-rose-700 placeholder:text-rose-300 focus:border-rose-500"
      : "border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-300 focus:border-violet-400 focus:bg-white"
  );

export function StudentLoginModal({ onSuccess, onClose }: Props) {
  const [step, setStep] = useState<Step>("pin");
  const [pin, setPin] = useState("");
  const [studentId, setStudentId] = useState("");
  const [classroom, setClassroom] = useState<MockClassroom | null>(null);
  const [pinError, setPinError] = useState(false);
  const [studentError, setStudentError] = useState(false);

  const pinRef = useRef<HTMLInputElement>(null);
  const studentRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === "pin") setTimeout(() => pinRef.current?.focus(), 80);
    if (step === "studentId") setTimeout(() => studentRef.current?.focus(), 80);
  }, [step]);

  function handlePinSubmit(e: React.FormEvent) {
    e.preventDefault();
    const found = findClassroom(pin);
    if (found) {
      setClassroom(found);
      setPinError(false);
      setStep("studentId");
    } else {
      setPinError(true);
      setPin("");
      setTimeout(() => pinRef.current?.focus(), 50);
    }
  }

  function handleStudentSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = findStudent(pin, studentId);
    if (result) {
      onSuccess({
        teacherPin: pin.toUpperCase(),
        studentId: result.student.id,
        studentName: result.student.name,
        grade: result.student.grade,
        className: result.classroom.className,
        teacherName: result.classroom.teacherName,
      });
    } else {
      setStudentError(true);
      setStudentId("");
      setTimeout(() => studentRef.current?.focus(), 50);
    }
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <button aria-label="ปิด" onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-violet-600 to-brand-600 px-5 py-4 text-white">
          <div className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/20">
              {step === "pin" ? <Users size={16} /> : <Hash size={16} />}
            </div>
            <div>
              <p className="text-sm font-extrabold">
                {step === "pin" ? "เข้าสู่ห้องเรียน" : `ห้อง ${classroom?.className}`}
              </p>
              <p className="text-[11px] text-white/70">
                {step === "pin" ? "กรอกรหัส PIN ของครู" : `${classroom?.teacherName}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-white/20 transition hover:bg-white/30">
            <X size={16} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex gap-1.5 bg-violet-50 px-5 py-2.5">
          {(["pin", "studentId"] as Step[]).map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-1.5">
              <div className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold transition-all",
                step === s || (s === "pin" && step === "studentId")
                  ? "bg-violet-600 text-white"
                  : "bg-violet-200 text-violet-500"
              )}>
                {i + 1}
              </div>
              <span className={cn("text-[10px] font-bold", step === s ? "text-violet-700" : "text-violet-400")}>
                {s === "pin" ? "รหัสครู" : "รหัสนักเรียน"}
              </span>
            </div>
          ))}
        </div>

        {/* Step 1: PIN */}
        {step === "pin" && (
          <form onSubmit={handlePinSubmit} className="space-y-4 p-5">
            <div>
              <label className="mb-1.5 block text-center text-sm font-extrabold text-slate-600">
                Teacher PIN
              </label>
              <input
                ref={pinRef}
                type="text"
                value={pin}
                onChange={(e) => { setPin(e.target.value.toUpperCase()); setPinError(false); }}
                placeholder="เช่น TEACH01"
                maxLength={10}
                className={inputCls(pinError)}
              />
              {pinError && (
                <p className="mt-1.5 text-center text-[11px] font-bold text-rose-500">
                  ❌ ไม่พบรหัสห้องเรียนนี้ — ขอรหัสจากครูของคุณ
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!pin.trim()}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-brand-600 text-sm font-extrabold text-white shadow-sm transition hover:brightness-110 disabled:opacity-50"
            >
              ถัดไป <ArrowRight size={16} />
            </button>

            <p className="text-center text-[10px] text-slate-400">
              ทดลองใช้: <code className="rounded bg-slate-100 px-1 font-mono">TEACH01</code> หรือ{" "}
              <code className="rounded bg-slate-100 px-1 font-mono">TEACH02</code>
            </p>
          </form>
        )}

        {/* Step 2: Student ID */}
        {step === "studentId" && (
          <form onSubmit={handleStudentSubmit} className="space-y-4 p-5">
            {/* Classroom info chip */}
            <div className="flex items-center gap-2 rounded-xl bg-violet-50 px-3 py-2">
              <span className="text-lg">🏫</span>
              <div>
                <p className="text-xs font-extrabold text-violet-700">{classroom?.className} • {classroom?.teacherName}</p>
                <p className="text-[10px] text-violet-500">มีนักเรียนทั้งหมด {classroom?.students.length} คน</p>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-center text-sm font-extrabold text-slate-600">
                Student ID
              </label>
              <input
                ref={studentRef}
                type="text"
                value={studentId}
                onChange={(e) => { setStudentId(e.target.value.toUpperCase()); setStudentError(false); }}
                placeholder="เช่น S001"
                maxLength={10}
                className={inputCls(studentError)}
              />
              {studentError && (
                <p className="mt-1.5 text-center text-[11px] font-bold text-rose-500">
                  ❌ ไม่พบรหัสนักเรียนนี้ — ขอรหัสจากครูของคุณ
                </p>
              )}
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => { setStep("pin"); setStudentId(""); setStudentError(false); }}
                className="flex h-12 items-center gap-1.5 rounded-xl border border-slate-200 px-4 text-sm font-extrabold text-slate-600 transition hover:bg-slate-50"
              >
                <ArrowLeft size={15} />
              </button>
              <button
                type="submit"
                disabled={!studentId.trim()}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-brand-600 text-sm font-extrabold text-white shadow-sm transition hover:brightness-110 disabled:opacity-50"
              >
                เข้าเรียนเลย! 🚀
              </button>
            </div>

            <p className="text-center text-[10px] text-slate-400">
              ทดลองใช้: <code className="rounded bg-slate-100 px-1 font-mono">S001</code> ถึง{" "}
              <code className="rounded bg-slate-100 px-1 font-mono">S005</code>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
