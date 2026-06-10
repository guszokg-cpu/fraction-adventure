import { AppShell } from "@/components/layout/AppShell";
import { PlaceholderPanel } from "@/components/ui/PlaceholderPanel";

export default function WorksheetsPage() {
  return (
    <AppShell title="สร้างใบงาน" eyebrow="Worksheet Builder" description="เตรียมโครงสร้างไว้สำหรับ Phase 4" activePath="/worksheets">
      <PlaceholderPanel title="ตัวสร้างใบงาน" description="Phase 1 วางหน้าและธีมไว้ก่อน ยังไม่สร้างโจทย์จริง" />
    </AppShell>
  );
}
