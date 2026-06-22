import { Card } from "@/components/ui/Card";
import { comparePracticeActivities } from "@/data/lessonCompare";

export function ComparePracticeGrid() {
  return (
    <Card>
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-extrabold text-brand-900">กิจกรรมฝึกทักษะ</h2>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">prototype</span>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {comparePracticeActivities.map((activity, index) => (
          <div key={activity.id} className="rounded-xl border border-brand-100 bg-white p-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
              <span className="text-3xl">{activity.icon}</span>
            </div>
            <div className="mt-2 text-xs font-bold text-emerald-600">กิจกรรมที่ {index + 1}</div>
            <div className="mt-1 font-extrabold text-brand-900">{activity.title}</div>
            <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-500">{activity.desc}</p>
            <button className="mt-3 inline-flex h-9 items-center justify-center rounded-lg bg-emerald-50 px-4 text-sm font-bold text-emerald-600">
              เริ่มเล่น
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}
