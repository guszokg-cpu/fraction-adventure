import { AppShell } from "@/components/layout/AppShell";
import { AdminWorksheetsContent } from "@/components/admin/worksheets/AdminWorksheetsContent";

export default function AdminWorksheetsPage() {
  return (
    <AppShell
      title="จัดการใบงาน"
      eyebrow="Admin"
      description="เพิ่ม แก้ไข ซ่อน/เผยแพร่ใบงานประกอบบทเรียน"
      activePath="/admin/worksheets"
      aside={null}
    >
      <AdminWorksheetsContent />
    </AppShell>
  );
}
