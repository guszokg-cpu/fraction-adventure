export type PageRoute = {
  order: number;
  href: string;
  title: string;
  description: string;
  eyebrow: string;
  icon: string;
};

export const pageRoutes: PageRoute[] = [
  {
    order: 1,
    href: "/",
    title: "แผนที่การเรียนรู้",
    description: "ติดตามเส้นทางผจญภัยและเรียนต่อจากบทล่าสุด",
    eyebrow: "Learning Map",
    icon: "🗺️"
  },
  {
    order: 2,
    href: "/lessons/fraction-intro",
    title: "รู้จักเศษส่วน",
    description: "เข้าใจตัวเศษ ตัวส่วน และส่วนที่แบ่งเท่า ๆ กัน",
    eyebrow: "Lesson 1",
    icon: "🍕"
  },
  {
    order: 3,
    href: "/lessons/read-write",
    title: "อ่านและเขียนเศษส่วน",
    description: "ฝึกอ่าน เขียน และจับคู่คำอ่านของเศษส่วน",
    eyebrow: "Lesson 2",
    icon: "📖"
  },
  {
    order: 4,
    href: "/lessons/fraction-from-image",
    title: "เศษส่วนจากภาพ",
    description: "มองภาพแล้วเขียนเป็นเศษส่วนอย่างถูกต้อง",
    eyebrow: "Lesson 4",
    icon: "🧩"
  },
  {
    order: 5,
    href: "/lessons/number-line",
    title: "เศษส่วนบนเส้นจำนวน",
    description: "ระบุตำแหน่งเศษส่วนบนเส้นจำนวน",
    eyebrow: "Lesson 4",
    icon: "📏"
  },
  {
    order: 6,
    href: "/lessons/compare",
    title: "เปรียบเทียบเศษส่วน",
    description: "รู้ว่าเศษส่วนใดมากกว่า น้อยกว่า หรือเท่ากัน",
    eyebrow: "Lesson 5",
    icon: "⚖️"
  },
  {
    order: 7,
    href: "/lessons/equivalent",
    title: "เศษส่วนที่เท่ากัน",
    description: "เรียนรู้เศษส่วนที่มีค่าเท่ากันในหลายรูปแบบ",
    eyebrow: "Lesson 6",
    icon: "🔁"
  },
  {
    order: 8,
    href: "/lessons/simplify-expand",
    title: "ย่อและขยายเศษส่วน",
    description: "ทำเศษส่วนให้เท่ากันโดยไม่เปลี่ยนค่า",
    eyebrow: "Lesson 7",
    icon: "🔎"
  },
  {
    order: 9,
    href: "/lessons/mixed-improper",
    title: "จำนวนคละและเศษเกิน",
    description: "แปลงจำนวนคละและเศษเกินไปมา",
    eyebrow: "Lesson 8",
    icon: "1¼"
  },
  {
    order: 10,
    href: "/lessons/add",
    title: "บวกเศษส่วน",
    description: "รวมเศษส่วนตัวส่วนเท่ากันและต่างกัน",
    eyebrow: "Lesson 9",
    icon: "➕"
  },
  {
    order: 11,
    href: "/lessons/subtract",
    title: "ลบเศษส่วน",
    description: "หาผลต่างของเศษส่วนและจำนวนคละ",
    eyebrow: "Lesson 10",
    icon: "➖"
  },
  {
    order: 12,
    href: "/lessons/multiply",
    title: "คูณเศษส่วน",
    description: "เข้าใจการคูณว่าเป็นส่วนของส่วน",
    eyebrow: "Lesson 11",
    icon: "✖️"
  },
  {
    order: 13,
    href: "/lessons/divide",
    title: "หารเศษส่วน",
    description: "แบ่งเศษส่วนเป็นกลุ่มและใช้วิธีกลับเศษส่วน",
    eyebrow: "Lesson 12",
    icon: "➗"
  },
  {
    order: 14,
    href: "/lessons/word-problems",
    title: "โจทย์ปัญหาเศษส่วน",
    description: "อ่านโจทย์ วิเคราะห์ และเลือกวิธีแก้ปัญหา",
    eyebrow: "Lesson 13",
    icon: "🧠"
  },
  {
    order: 15,
    href: "/teacher/worksheet-factory",
    title: "สร้างใบงาน",
    description: "เตรียมพื้นที่สำหรับสร้างใบงานเศษส่วนในระยะถัดไป",
    eyebrow: "Teacher Tool",
    icon: "📝"
  },
  {
    order: 16,
    href: "/teacher/reports",
    title: "รายงานผลนักเรียน",
    description: "เตรียมพื้นที่สำหรับวิเคราะห์คะแนนและพัฒนาการ",
    eyebrow: "Teacher Report",
    icon: "📊"
  },
  {
    order: 17,
    href: "/teacher/library",
    title: "คลังสื่อการสอน",
    description: "เตรียมพื้นที่สำหรับจัดเก็บใบงาน ภาพ และสื่อประกอบ",
    eyebrow: "Media Library",
    icon: "🗂️"
  },
  {
    order: 18,
    href: "/teacher/classroom",
    title: "จัดการห้องเรียน",
    description: "เตรียมพื้นที่สำหรับจัดการนักเรียนและห้องเรียน",
    eyebrow: "Classroom",
    icon: "👥"
  },
  {
    order: 19,
    href: "/settings",
    title: "ตั้งค่าระบบ",
    description: "ตั้งค่าระบบให้เหมาะกับห้องเรียนของคุณ",
    eyebrow: "Control Center",
    icon: "⚙️"
  }
];

export function getPageRoute(href: string) {
  return pageRoutes.find((route) => route.href === href);
}
