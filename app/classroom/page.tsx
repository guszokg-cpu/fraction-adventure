import { AppShell } from "@/components/layout/AppShell";
import { PlaceholderPanel } from "@/components/ui/PlaceholderPanel";

export default function ClassroomPage() {
  return (
    <AppShell title="จัดการห้องเรียน" eyebrow="Classroom" description="จัดการนักเรียนและกลุ่มเรียน" activePath="/classroom">
      <PlaceholderPanel title="ห้องเรียนของฉัน" description="Phase 1 เตรียมพื้นที่สำหรับ mock classroom" />
    </AppShell>
  );
}
