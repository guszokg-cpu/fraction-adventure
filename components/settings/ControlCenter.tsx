import { Bot, Database, Gift, GraduationCap, Palette, Save, ShieldCheck, Trophy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ThemeSwitcher } from "@/components/settings/ThemeSwitcher";

const setupCards = [
  { title: "ระดับชั้น", description: "เปิด/ปิด ป.4 ถึง ป.6", icon: GraduationCap },
  { title: "ภารกิจ", description: "ตั้งเป้าหมายรายวัน", icon: Trophy },
  { title: "รางวัล", description: "ดาว เหรียญ และของสะสม", icon: Gift },
  { title: "AI Tutor", description: "พื้นที่เตรียมต่อระบบช่วยสอน", icon: Bot },
  { title: "ฐานข้อมูล", description: "ตอนนี้ใช้ mock data ก่อน", icon: Database },
  { title: "Branding", description: "เลือกธีมสีและชื่อระบบ", icon: Palette }
];

export function ControlCenter() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-[1.3fr_0.9fr] gap-5">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-brand-900">ข้อมูลโรงเรียน</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">ตั้งค่าพื้นฐานของระบบโรงเรียน</p>
            </div>
            <ShieldCheck className="text-emerald-600" size={34} />
          </div>

          <div className="mt-5 grid grid-cols-[190px_1fr] gap-6">
            <div>
              <div className="grid aspect-square place-items-center rounded-xl bg-brand-50 text-7xl">📘</div>
              <Button className="mt-3 w-full" variant="secondary">เปลี่ยนโลโก้</Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="space-y-2">
                <span className="text-sm font-bold text-slate-600">ชื่อโรงเรียน</span>
                <input className="h-11 w-full rounded-lg border border-slate-200 px-3" defaultValue="โรงเรียนบ้านหนองบัวสิม" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-bold text-slate-600">รหัสโรงเรียน</span>
                <input className="h-11 w-full rounded-lg border border-slate-200 px-3" defaultValue="NBS001" />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-bold text-slate-600">ปีการศึกษา</span>
                <select className="h-11 w-full rounded-lg border border-slate-200 px-3" defaultValue="2569">
                  <option>2569</option>
                  <option>2570</option>
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-bold text-slate-600">ภาคเรียนปัจจุบัน</span>
                <select className="h-11 w-full rounded-lg border border-slate-200 px-3" defaultValue="1">
                  <option>1</option>
                  <option>2</option>
                </select>
              </label>
              <label className="col-span-2 space-y-2">
                <span className="text-sm font-bold text-slate-600">คำขวัญโรงเรียน</span>
                <input className="h-11 w-full rounded-lg border border-slate-200 px-3" defaultValue="เรียนดี มีวินัย ใฝ่ศึกษา พัฒนาสังคม" />
              </label>
            </div>
          </div>
          <Button className="mt-5 w-full">
            <Save size={18} />
            บันทึกข้อมูลโรงเรียน
          </Button>
        </Card>

        <Card>
          <h2 className="text-2xl font-extrabold text-brand-900">ธีมสีของแอพ</h2>
          <p className="mt-1 text-sm font-semibold text-slate-500">เลือกธีมแล้วระบบจะจำไว้ในเครื่องนี้</p>
          <div className="mt-5">
            <ThemeSwitcher />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {setupCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.title}>
              <Icon className="text-brand-600" size={30} />
              <h3 className="mt-3 text-lg font-extrabold text-brand-900">{card.title}</h3>
              <p className="mt-1 min-h-10 text-sm font-semibold text-slate-600">{card.description}</p>
              <Button className="mt-4 w-full" variant="secondary">ตั้งค่า</Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
