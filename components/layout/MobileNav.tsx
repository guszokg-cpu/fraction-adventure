"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, X } from "lucide-react";
import { pageRoutes } from "@/data/pageRoutes";
import { cn } from "@/lib/cn";

export function MobileNav({ activePath }: { activePath?: string }) {
  const pathname = usePathname();
  const currentPath = activePath ?? pathname;
  const [open, setOpen] = useState(false);

  const current = pageRoutes.find((r) => r.href === currentPath);

  return (
    <>
      {/* แถบนำทางล่าง (เฉพาะจอเล็ก) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-3">
          <Link
            href="/"
            className={cn(
              "flex flex-col items-center gap-0.5 py-2 text-[11px] font-extrabold transition",
              currentPath === "/" ? "text-brand-600" : "text-slate-500",
            )}
          >
            <Home size={20} />
            หน้าหลัก
          </Link>
          <button
            onClick={() => setOpen(true)}
            className="flex flex-col items-center gap-0.5 py-2 text-[11px] font-extrabold text-slate-500 transition active:text-brand-600"
          >
            <LayoutGrid size={20} />
            บทเรียน
          </button>
          <div className="flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-extrabold text-slate-400">
            <span className="text-base leading-none">{current?.icon ?? "🍕"}</span>
            <span className="max-w-[6rem] truncate">{current?.title ?? "เศษส่วน"}</span>
          </div>
        </div>
      </nav>

      {/* Drawer เมนูบทเรียนทั้งหมด */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            aria-label="ปิดเมนู"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate-900/40"
          />
          <div className="fa-rise absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto rounded-t-3xl bg-white p-4 shadow-2xl">
            <div className="sticky -top-4 -mx-4 mb-2 flex items-center justify-between border-b border-slate-100 bg-white px-4 pb-3 pt-1">
              <h2 className="text-lg font-extrabold text-brand-900">เมนูบทเรียน</h2>
              <button
                onClick={() => setOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-600"
              >
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {pageRoutes.map((item) => {
                const active = currentPath === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-xl border px-3 py-2.5 text-[13px] font-bold transition",
                      active
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-slate-200 bg-white text-slate-700 active:bg-slate-50",
                    )}
                  >
                    <span className="text-lg leading-none">{item.icon}</span>
                    <span className="min-w-0 truncate">{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
