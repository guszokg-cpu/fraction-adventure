import { Card } from "@/components/ui/Card";
import { LessonProgressHeader } from "@/components/lessons/LessonProgressHeader";
import { LessonActionBar } from "@/components/lessons/LessonActionBar";
import { ReadWriteStudio } from "@/components/lessons/read-write/ReadWriteStudio";
import { readWriteMeta } from "@/data/lessonReadWrite";

const activities = [
  { id: "a1", icon: "📖", title: "ทายคำอ่าน", desc: "เลือกคำอ่านให้ตรงกับเศษส่วน" },
  { id: "a2", icon: "✍️", title: "เขียนเศษส่วน", desc: "ฟังคำอ่านแล้วเขียนเป็นเศษส่วน" },
  { id: "a3", icon: "🔗", title: "จับคู่คำอ่าน", desc: "ลากจับคู่เศษส่วนกับคำอ่าน" },
  { id: "a4", icon: "🖼️", title: "อ่านจากภาพ", desc: "ดูภาพแล้วเขียนเป็นเศษส่วน" }
];

export function ReadWriteContent() {
  return (
    <div className="space-y-5">
      <LessonProgressHeader meta={readWriteMeta} lessonSlug="read-write" />

      <ReadWriteStudio />

      {/* กิจกรรมฝึกทักษะ — เปิดเล่นจริงใน Phase 3 (Exercises and Games) */}
      <Card>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-extrabold text-brand-900">กิจกรรมฝึกทักษะ</h2>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-600">
            เปิดเล่นได้ใน Phase ถัดไป
          </span>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {activities.map((activity) => (
            <div key={activity.id} className="rounded-xl border border-brand-100 bg-white p-4 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-3xl">
                {activity.icon}
              </div>
              <div className="mt-3 font-extrabold text-brand-900">{activity.title}</div>
              <p className="mt-1 text-xs font-semibold text-slate-500">{activity.desc}</p>
              <button className="mt-3 inline-flex h-9 items-center justify-center rounded-lg bg-brand-50 px-4 text-sm font-bold text-brand-400">
                เริ่มเล่น
              </button>
            </div>
          ))}
        </div>
      </Card>

      <LessonActionBar meta={readWriteMeta} practiceCount={10} />
    </div>
  );
}
