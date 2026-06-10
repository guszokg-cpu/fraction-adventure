"use client";

import Link from "next/link";
import { Bell, BookOpen, Home, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function TopBar() {
  return (
    <div className="flex items-center justify-end gap-3">
      <Button variant="secondary" className="bg-white">
        <Volume2 size={18} />
        เสียงบรรยาย
      </Button>
      <Button variant="secondary" className="bg-white">
        <BookOpen size={18} />
        คู่มือการใช้งาน
      </Button>
      <button className="relative grid h-11 w-11 place-items-center rounded-lg border border-brand-100 bg-white text-brand-700">
        <Bell size={20} />
        <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-red-500 text-xs font-bold text-white">5</span>
      </button>
      <Link href="/">
        <Button>
          <Home size={18} />
          กลับหน้าหลัก
        </Button>
      </Link>
    </div>
  );
}
