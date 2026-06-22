import { Card } from "@/components/ui/Card";
import { mixedPracticeActivities } from "@/data/lessonMixedImproper";

export function MixedPracticeGrid() {
  return (
    <Card>
      <div className="flex items-center gap-2">
        <h2 className="text-xl font-extrabold text-brand-900">กิจกรรมท้ายหน้า</h2>
        <span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-bold text-pink-600">prototype</span>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {mixedPracticeActivities.map((activity, index) => (
          <div key={activity.id} className="rounded-xl border border-pink-100 bg-white p-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-50">
              <span className="text-3xl">{activity.icon}</span>
            </div>
            <div className="mt-2 text-xs font-bold text-pink-600">กิจกรรมที่ {index + 1}</div>
            <div className="mt-1 font-extrabold text-brand-900">{activity.title}</div>
            <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-500">{activity.desc}</p>
            <button className="mt-3 inline-flex h-9 items-center justify-center rounded-lg bg-pink-50 px-4 text-sm font-bold text-pink-600 hover:bg-pink-100 transition">
              เริ่มเล่น
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}
