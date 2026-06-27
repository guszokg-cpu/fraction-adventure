import Link from "next/link";
import { ChevronRight, Lock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { dashboardStats } from "@/data/dashboard";
import { mockMissions } from "@/data/mockMissions";
import { mockUser } from "@/data/mockUser";
import { cn } from "@/lib/cn";
import { toPercent } from "@/lib/progress";

const mascotChars = [
  { emoji: "🐻", name: "หมีน้อย", unlocked: true },
  { emoji: "🐰", name: "กระต่ายน้อย", unlocked: true },
  { emoji: "🐱", name: "แมวเหมียว", unlocked: false },
];

export function RightPanel() {
  return (
    <aside className="w-[330px] shrink-0 space-y-4">
      {/* ภารกิจวันนี้ */}
      <Card className="overflow-hidden p-0">
        <div className="bg-gradient-to-r from-brand-700 to-violet-600 px-5 py-4 text-white">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎁</span>
            <h2 className="text-lg font-extrabold">ภารกิจวันนี้</h2>
          </div>
        </div>
        <div className="space-y-3 p-4">
          {mockMissions.map((mission) => (
            <div key={mission.id} className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-2xl shadow-sm">
                {mission.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 text-sm font-extrabold">
                  <span className="text-slate-700">{mission.title}</span>
                  <span className="shrink-0 text-brand-600">
                    {mission.current}/{mission.target}
                  </span>
                </div>
                <ProgressBar
                  value={toPercent(mission.current, mission.target)}
                  className="mt-1.5 h-2"
                />
              </div>
            </div>
          ))}
          <button className="flex w-full items-center justify-center gap-1 rounded-lg border border-brand-100 py-2 text-sm font-extrabold text-brand-600 transition hover:bg-brand-50">
            ดูภารกิจทั้งหมด
            <ChevronRight size={14} />
          </button>
        </div>
      </Card>

      {/* สรุปคะแนนวันนี้ */}
      <Card className="overflow-hidden p-0">
        <div className="bg-gradient-to-r from-violet-600 to-purple-700 px-5 py-4 text-white">
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <h2 className="text-lg font-extrabold">สรุปคะแนนวันนี้</h2>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-amber-50 p-3 text-center">
              <div className="text-2xl">⭐</div>
              <div className="mt-1 text-xs font-bold text-slate-500">คะแนนวันนี้</div>
              <div className="text-2xl font-extrabold text-brand-900">
                {dashboardStats.scoreToday}
              </div>
            </div>
            <div className="rounded-xl bg-sky-50 p-3 text-center">
              <div className="text-2xl">🏆</div>
              <div className="mt-1 text-xs font-bold text-slate-500">อันดับในห้อง</div>
              <div className="text-2xl font-extrabold text-brand-900">
                {dashboardStats.classroomRank}
              </div>
            </div>
            <div className="rounded-xl bg-emerald-50 p-3 text-center">
              <div className="text-2xl">🎯</div>
              <div className="mt-1 text-xs font-bold text-slate-500">ความสำเร็จ</div>
              <div className="text-2xl font-extrabold text-emerald-600">
                {dashboardStats.successRate}%
              </div>
            </div>
            <div className="rounded-xl bg-rose-50 p-3 text-center">
              <div className="text-xl">📚</div>
              <div className="mt-1 text-xs font-bold text-slate-500">ควรฝึกเพิ่ม</div>
              <div className="mt-0.5 text-sm font-extrabold text-rose-600">
                {dashboardStats.recommendedPractice}
              </div>
            </div>
          </div>
          <Link href="/lessons/divide">
            <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-sm font-extrabold text-white shadow-md shadow-violet-200 transition hover:bg-violet-700">
              ไปฝึกเลย
              <ChevronRight size={15} />
            </button>
          </Link>
        </div>
      </Card>

      {/* รางวัลของฉัน */}
      <Card className="overflow-hidden p-0">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-4 text-white">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎀</span>
            <h2 className="text-lg font-extrabold">รางวัลของฉัน</h2>
          </div>
        </div>
        <div className="p-4">
          {/* Coins/stars/boxes */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl bg-yellow-50 p-3">
              <div className="text-3xl">⭐</div>
              <div className="mt-1 text-xs font-bold text-slate-500">ดาว</div>
              <div className="text-xl font-extrabold text-brand-900">{mockUser.stars}</div>
            </div>
            <div className="rounded-xl bg-orange-50 p-3">
              <div className="text-3xl">🪙</div>
              <div className="mt-1 text-xs font-bold text-slate-500">เหรียญ</div>
              <div className="text-xl font-extrabold text-brand-900">
                {mockUser.coins.toLocaleString()}
              </div>
            </div>
            <div className="rounded-xl bg-purple-50 p-3">
              <div className="text-3xl">🎁</div>
              <div className="mt-1 text-xs font-bold text-slate-500">กล่องสุ่ม</div>
              <div className="text-xl font-extrabold text-brand-900">{dashboardStats.lootBoxes}</div>
            </div>
          </div>

          {/* Mascot characters */}
          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="mb-3 text-xs font-extrabold text-slate-500">ตัวละครที่ปลดล็อก</p>
            <div className="grid grid-cols-3 gap-2">
              {mascotChars.map((char) => (
                <div
                  key={char.name}
                  className={cn(
                    "relative flex flex-col items-center rounded-xl border p-2 text-center",
                    char.unlocked
                      ? "border-brand-100 bg-white"
                      : "border-slate-100 bg-slate-50"
                  )}
                >
                  <div className={cn("text-4xl", !char.unlocked && "opacity-30")}>
                    {char.emoji}
                  </div>
                  <p
                    className={cn(
                      "mt-1 text-xs font-bold",
                      char.unlocked ? "text-slate-600" : "text-slate-300"
                    )}
                  >
                    {char.name}
                  </p>
                  {char.unlocked && (
                    <div className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-emerald-500 text-[10px] font-extrabold text-white">
                      ✓
                    </div>
                  )}
                  {!char.unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl">
                      <Lock size={18} className="text-slate-300" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </aside>
  );
}
