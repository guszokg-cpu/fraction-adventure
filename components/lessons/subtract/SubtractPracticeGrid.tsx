import { Card } from "@/components/ui/Card";
import { subtractPracticeActivities } from "@/data/lessonSubtract";

export function SubtractPracticeGrid() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="bg-gradient-to-r from-emerald-700 to-green-500 px-4 py-3 text-white">
        <h2 className="text-lg font-extrabold">กิจกรรมท้ายหน้า</h2>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-5">
        {subtractPracticeActivities.map((activity) => (
          <div key={activity.id} className="rounded-xl border border-emerald-100 bg-white p-4">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-600 text-sm font-extrabold text-white">
                {activity.order}
              </span>
              <span className="text-2xl">{activity.icon}</span>
            </div>
            <h3 className="mt-3 font-extrabold text-brand-900">{activity.title}</h3>
            <p className="mt-1 text-xs font-semibold text-slate-500">{activity.desc}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
