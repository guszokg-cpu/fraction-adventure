import type { ThemePreset } from "@/types/theme";

export const themePresets: ThemePreset[] = [
  {
    id: "royal",
    name: "ม่วงผจญภัย",
    description: "ธีมหลักสดใส เหมาะกับห้องเรียนประถม",
    swatches: ["#4f36d8", "#7c3aed", "#fbbf24"]
  },
  {
    id: "ocean",
    name: "ฟ้าน้ำทะเล",
    description: "อ่านง่าย สบายตา สำหรับจอโปรเจกเตอร์",
    swatches: ["#0ea5e9", "#2563eb", "#10b981"]
  },
  {
    id: "forest",
    name: "เขียวป่าเรียนรู้",
    description: "โทนธรรมชาติ ใช้กับบทเรียนแนวแผนที่",
    swatches: ["#16a34a", "#047857", "#f59e0b"]
  },
  {
    id: "berry",
    name: "ชมพูเบอร์รี",
    description: "สดใส เหมาะกับเกมและกิจกรรม",
    swatches: ["#db2777", "#7c3aed", "#f97316"]
  }
];
