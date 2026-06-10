import type { Mission } from "@/types/mission";

export const mockMissions: Mission[] = [
  { id: "practice", title: "ทำแบบฝึกหัด 5 ข้อ", target: 5, current: 3, icon: "📝" },
  { id: "compare", title: "เปรียบเทียบเศษส่วน 10 ข้อ", target: 10, current: 6, icon: "⚖️" },
  { id: "game", title: "เล่นเกมจับคู่ 1 ครั้ง", target: 1, current: 0, icon: "🎮" }
];
