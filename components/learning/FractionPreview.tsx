export function FractionPreview() {
  return (
    <div className="grid grid-cols-[220px_1fr] gap-6 rounded-xl border border-brand-100 bg-white p-5">
      <div className="relative grid aspect-square place-items-center rounded-full border-4 border-brand-900 bg-white">
        <div className="absolute inset-0 rounded-full bg-[conic-gradient(hsl(var(--accent-400))_0_270deg,transparent_270deg_360deg)]" />
        <div className="absolute inset-0 rounded-full border-4 border-white/80" />
        <div className="relative rounded-lg bg-white/90 px-4 py-2 text-4xl font-extrabold text-brand-900">3/4</div>
      </div>
      <div className="flex flex-col justify-center">
        <div className="text-sm font-extrabold text-brand-600">บทเรียนที่กำลังเรียน</div>
        <h2 className="mt-1 text-3xl font-extrabold text-brand-900">เศษส่วนบนเส้นจำนวน</h2>
        <p className="mt-2 text-lg font-medium text-slate-600">ฝึกวางเศษส่วนบนเส้นจำนวน และเชื่อมโยงกับภาพเศษส่วน</p>
        <div className="mt-5 flex gap-3">
          <span className="rounded-lg bg-brand-50 px-4 py-2 text-sm font-extrabold text-brand-700">ความคืบหน้า 60%</span>
          <span className="rounded-lg bg-accent-100 px-4 py-2 text-sm font-extrabold text-brand-900">รับได้ 2 ดาว</span>
        </div>
      </div>
    </div>
  );
}
