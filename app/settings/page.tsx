import { AppShell } from "@/components/layout/AppShell";
import { SettingsContent } from "@/components/settings/SettingsContent";

export default function SettingsPage() {
  return (
    <AppShell
      title="ตั้งค่าระบบ"
      eyebrow="Admin"
      description="จัดการข้อมูลโรงเรียน ห้องเรียน ความปลอดภัย และข้อมูลระบบ"
      activePath="/settings"
      aside={null}
    >
      <SettingsContent />
    </AppShell>
  );
}
