"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function TopBar() {
  return (
    <div className="flex items-center justify-end">
      <Link href="/">
        <Button>
          <Home size={18} />
          กลับหน้าหลัก
        </Button>
      </Link>
    </div>
  );
}
