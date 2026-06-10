import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { dashboardStats } from "@/data/dashboard";
import { mockMissions } from "@/data/mockMissions";
import { mockUser } from "@/data/mockUser";
import { toPercent } from "@/lib/progress";

export function RightPanel() {
  return (
    <aside className="w-[330px] shrink-0 space-y-4">
      <Card className="overflow-hidden p-0">
        <div className="bg-gradient-to-r from-brand-700 to-violet-600 px-5 py-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold">ภารกิจวันนี้</h2>
            <span className="text-2xl">📅</span>
          </div>
        </div>
        <div className="space-y-4 p-5">
          {mockMissions.map((mission) => (
            <div key={mission.id} className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-brand-50 text-2xl">{mission.icon}</div>
              <div className="flex-1">
                <div className="flex justify-between gap-3 text-sm font-extrabold">
                  <span>{mission.title}</span>
                  <span className="text-brand-700">
                    {mission.current}/{mission.target}
                  </span>
                </div>
                <ProgressBar value={toPercent(mission.current, mission.target)} className="mt-2 h-2" />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-brand-900">สรุปคะแนนวันนี้</h2>
          <span className="text-2xl">🏆</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-amber-50 p-4">
            <div className="text-sm font-bold text-slate-500">คะแนนวันนี้</div>
            <div className="mt-1 text-3xl font-extrabold text-brand-900">{dashboardStats.scoreToday}</div>
          </div>
          <div className="rounded-lg bg-sky-50 p-4">
            <div className="text-sm font-bold text-slate-500">อันดับในห้อง</div>
            <div className="mt-1 text-3xl font-extrabold text-brand-900">{dashboardStats.classroomRank}</div>
          </div>
          <div className="rounded-lg bg-emerald-50 p-4">
            <div className="text-sm font-bold text-slate-500">ความสำเร็จ</div>
            <div className="mt-1 text-3xl font-extrabold text-brand-900">{dashboardStats.successRate}%</div>
          </div>
          <div className="rounded-lg bg-rose-50 p-4">
            <div className="text-sm font-bold text-slate-500">ควรฝึกเพิ่ม</div>
            <div className="mt-1 text-lg font-extrabold text-rose-600">{dashboardStats.recommendedPractice}</div>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-extrabold text-brand-900">รางวัลของฉัน</h2>
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-lg bg-yellow-50 p-3">
            <div className="text-3xl">⭐</div>
            <div className="mt-1 text-sm font-bold text-slate-500">ดาว</div>
            <div className="text-2xl font-extrabold text-brand-900">{mockUser.stars}</div>
          </div>
          <div className="rounded-lg bg-orange-50 p-3">
            <div className="text-3xl">🪙</div>
            <div className="mt-1 text-sm font-bold text-slate-500">เหรียญ</div>
            <div className="text-2xl font-extrabold text-brand-900">{mockUser.coins.toLocaleString()}</div>
          </div>
          <div className="rounded-lg bg-purple-50 p-3">
            <div className="text-3xl">🎁</div>
            <div className="mt-1 text-sm font-bold text-slate-500">กล่องสุ่ม</div>
            <div className="text-2xl font-extrabold text-brand-900">{dashboardStats.lootBoxes}</div>
          </div>
        </div>
      </Card>
    </aside>
  );
}
