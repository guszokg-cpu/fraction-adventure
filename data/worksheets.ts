import type { Worksheet } from "@/types/worksheet";

// Mock data — เมื่อต่อ Supabase ให้เปลี่ยน getWorksheetsBySlug() ให้ query จาก DB แทน
export const MOCK_WORKSHEETS: Worksheet[] = [
  // ── Lesson 1: รู้จักเศษส่วน ──────────────────────────────────────
  {
    id: "ws-001",
    lessonSlug: "fraction-intro",
    title: "รู้จักเศษส่วนเบื้องต้น",
    description: "แบบฝึกระบายสีและเขียนเศษส่วนจากภาพ",
    level: "พื้นฐาน",
    fileType: "PDF",
    fileUrl: "https://drive.google.com/file/d/PLACEHOLDER_001/view",
    sortOrder: 1,
    isPublished: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "ws-002",
    lessonSlug: "fraction-intro",
    title: "ฝึกระบายสีเศษส่วน",
    description: "แบบฝึกหัดระบายสีส่วนที่กำหนด",
    level: "ฝึกทักษะ",
    fileType: "PDF",
    fileUrl: "https://drive.google.com/file/d/PLACEHOLDER_002/view",
    sortOrder: 2,
    isPublished: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "ws-003",
    lessonSlug: "fraction-intro",
    title: "แบบฝึกท้าทาย",
    description: "โจทย์เศษส่วนระดับสูงสำหรับนักเรียนที่พร้อม",
    level: "ท้าทาย",
    fileType: "PDF",
    fileUrl: "https://drive.google.com/file/d/PLACEHOLDER_003/view",
    sortOrder: 3,
    isPublished: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },

  // ── Lesson 2: อ่านและเขียนเศษส่วน ────────────────────────────────
  {
    id: "ws-004",
    lessonSlug: "read-write",
    title: "อ่านและเขียนเศษส่วน ชุด 1",
    description: "ฝึกอ่านชื่อเศษส่วนและเขียนในรูปตัวเลข",
    level: "พื้นฐาน",
    fileType: "PDF",
    fileUrl: "https://drive.google.com/file/d/PLACEHOLDER_004/view",
    sortOrder: 1,
    isPublished: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "ws-005",
    lessonSlug: "read-write",
    title: "จับคู่เศษส่วนกับคำ",
    description: "จับคู่ตัวเลขเศษส่วนกับชื่อภาษาไทย",
    level: "ฝึกทักษะ",
    fileType: "PDF",
    fileUrl: "https://drive.google.com/file/d/PLACEHOLDER_005/view",
    sortOrder: 2,
    isPublished: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },

  // ── Lesson 5: เปรียบเทียบเศษส่วน ─────────────────────────────────
  {
    id: "ws-006",
    lessonSlug: "compare",
    title: "เปรียบเทียบเศษส่วน ชุด 1",
    description: "ใช้สัญลักษณ์ > < = เปรียบเทียบเศษส่วนที่กำหนด",
    level: "พื้นฐาน",
    fileType: "PDF",
    fileUrl: "https://drive.google.com/file/d/PLACEHOLDER_006/view",
    sortOrder: 1,
    isPublished: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "ws-007",
    lessonSlug: "compare",
    title: "เรียงลำดับเศษส่วน",
    description: "เรียงเศษส่วนจากน้อยไปมากและมากไปน้อย",
    level: "ฝึกทักษะ",
    fileType: "PDF",
    fileUrl: "https://drive.google.com/file/d/PLACEHOLDER_007/view",
    sortOrder: 2,
    isPublished: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },

  // ── Lesson 6: เศษส่วนเท่ากัน ──────────────────────────────────────
  {
    id: "ws-008",
    lessonSlug: "equivalent",
    title: "หาเศษส่วนที่เท่ากัน",
    description: "เติมตัวเลขให้ได้เศษส่วนที่มีค่าเท่ากัน",
    level: "พื้นฐาน",
    fileType: "PDF",
    fileUrl: "https://drive.google.com/file/d/PLACEHOLDER_008/view",
    sortOrder: 1,
    isPublished: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },

  // ── Lesson 9: บวกเศษส่วน ──────────────────────────────────────────
  {
    id: "ws-009",
    lessonSlug: "add",
    title: "บวกเศษส่วน ชุดพื้นฐาน",
    description: "บวกเศษส่วนที่มีตัวส่วนเท่ากัน",
    level: "พื้นฐาน",
    fileType: "PDF",
    fileUrl: "https://drive.google.com/file/d/PLACEHOLDER_009/view",
    sortOrder: 1,
    isPublished: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "ws-010",
    lessonSlug: "add",
    title: "บวกเศษส่วนต่างตัวส่วน",
    description: "บวกเศษส่วนที่มีตัวส่วนต่างกัน โดยทำส่วนให้เท่ากันก่อน",
    level: "ฝึกทักษะ",
    fileType: "PDF",
    fileUrl: "https://drive.google.com/file/d/PLACEHOLDER_010/view",
    sortOrder: 2,
    isPublished: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "ws-011",
    lessonSlug: "add",
    title: "โจทย์ปัญหาการบวกเศษส่วน",
    description: "แก้โจทย์ปัญหาคณิตศาสตร์ที่เกี่ยวกับการบวกเศษส่วน",
    level: "ท้าทาย",
    fileType: "PDF",
    fileUrl: "https://drive.google.com/file/d/PLACEHOLDER_011/view",
    sortOrder: 3,
    isPublished: false,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
];

// ── Helper functions — จุดต่อ Supabase ในอนาคต ─────────────────────
// เมื่อพร้อม ให้แทนที่ฟังก์ชันนี้ด้วย:
//   const { data } = await supabase
//     .from('worksheets')
//     .select('*')
//     .eq('lessonSlug', slug)
//     .eq('isPublished', true)
//     .order('sortOrder')
export function getWorksheetsBySlug(slug: string): Worksheet[] {
  return MOCK_WORKSHEETS.filter((w) => w.lessonSlug === slug && w.isPublished).sort(
    (a, b) => a.sortOrder - b.sortOrder
  );
}

export function getAllWorksheets(): Worksheet[] {
  return [...MOCK_WORKSHEETS].sort((a, b) => a.lessonSlug.localeCompare(b.lessonSlug) || a.sortOrder - b.sortOrder);
}
