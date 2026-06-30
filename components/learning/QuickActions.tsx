import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { quickActions } from "@/data/dashboard";
import { cn } from "@/lib/cn";

const toneClasses: Record<string, string> = {
  green: "from-emerald-500 to-green-600",
  blue: "from-sky-500 to-blue-600",
  purple: "from-violet-500 to-purple-600",
  orange: "from-orange-400 to-amber-500",
  pink: "from-pink-500 to-rose-500"
};

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {quickActions.map((action) => (
        <Link
          key={action.title}
          href={action.href}
          className={cn(
            "group flex min-h-[116px] items-center gap-3 rounded-2xl bg-gradient-to-br p-4 text-white shadow-lg transition hover:-translate-y-1",
            toneClasses[action.tone]
          )}
        >
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/22 text-4xl">{action.icon}</div>
          <div className="min-w-0">
            <h3 className="text-lg font-extrabold leading-tight">{action.title}</h3>
            <p className="mt-1 text-xs font-bold text-white/85">{action.description}</p>
            <div className="mt-2 flex items-center text-xs font-extrabold">
              เปิดใช้งาน <ArrowRight className="ml-1 transition group-hover:translate-x-1" size={15} />
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
