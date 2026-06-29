"use client";

import { Plus } from "lucide-react";

type Props = {
  onAdd: () => void;
  isAdmin: boolean;
};

export function MediaHeader({ onAdd, isAdmin }: Props) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="text-sm font-extrabold uppercase tracking-wide text-brand-600">MEDIA LIBRARY</div>
        <h1 className="mt-1 text-[40px] font-extrabold leading-tight text-brand-900">คลังสื่อการสอน</h1>
        <p className="mt-1 text-lg font-bold text-slate-700">
          จัดเก็บใบงาน ภาพ และลิงก์สื่อการสอนให้ค้นหาและใช้งานได้ง่าย
        </p>
      </div>
      {isAdmin && (
        <button
          onClick={onAdd}
          className="inline-flex h-12 items-center gap-2 rounded-xl bg-violet-600 px-5 text-base font-extrabold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-700"
        >
          <Plus size={20} /> เพิ่มสื่อใหม่
        </button>
      )}
    </header>
  );
}
