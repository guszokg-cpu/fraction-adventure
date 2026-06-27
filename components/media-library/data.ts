export type MediaType = "worksheet" | "image" | "video" | "game" | "lesson-link";

export type MediaItem = {
  id: string;
  title: string;
  description: string;
  type: MediaType;
  grade: string;
  category: string;
  coverImage?: string;
  mediaUrl: string;
  tags: string[];
  favorite: boolean;
  uses: number;
  createdAt: number;
};

export type TypeMeta = {
  label: string;
  emoji: string;
  badge: string;
  cover: string;
};

export const TYPE_META: Record<MediaType, TypeMeta> = {
  worksheet: { label: "ใบงาน", emoji: "📝", badge: "bg-amber-100 text-amber-700", cover: "from-amber-100 to-orange-100" },
  image: { label: "ภาพประกอบ", emoji: "🖼️", badge: "bg-emerald-100 text-emerald-700", cover: "from-emerald-100 to-teal-100" },
  video: { label: "วิดีโอ", emoji: "🎬", badge: "bg-sky-100 text-sky-700", cover: "from-sky-100 to-blue-100" },
  game: { label: "เกม", emoji: "🎮", badge: "bg-violet-100 text-violet-700", cover: "from-violet-100 to-purple-100" },
  "lesson-link": { label: "ลิงก์บทเรียน", emoji: "🔗", badge: "bg-rose-100 text-rose-700", cover: "from-rose-100 to-pink-100" },
};

export const TYPE_TABS: { value: MediaType | "all"; label: string }[] = [
  { value: "all", label: "ทั้งหมด" },
  { value: "worksheet", label: "ใบงาน" },
  { value: "image", label: "ภาพประกอบ" },
  { value: "video", label: "วิดีโอ" },
  { value: "game", label: "เกม" },
  { value: "lesson-link", label: "ลิงก์บทเรียน" },
];

export const GRADE_FILTERS = ["ทั้งหมด", "ป.4", "ป.5", "ป.6"];

export const GRADE_OPTIONS = ["ป.4", "ป.5", "ป.6", "ป.4-ป.5", "ป.4-ป.6"];

export const CATEGORY_FILTERS = [
  "ทั้งหมด",
  "รู้จักเศษส่วน",
  "อ่านและเขียนเศษส่วน",
  "เปรียบเทียบเศษส่วน",
  "บวกเศษส่วน",
  "ลบเศษส่วน",
  "คูณเศษส่วน",
  "หารเศษส่วน",
];

export const CATEGORY_OPTIONS = [
  "รู้จักเศษส่วน",
  "อ่านและเขียนเศษส่วน",
  "เศษส่วนจากภาพ",
  "เศษส่วนบนเส้นจำนวน",
  "เปรียบเทียบเศษส่วน",
  "เศษส่วนที่เท่ากัน",
  "บวกเศษส่วน",
  "ลบเศษส่วน",
  "คูณเศษส่วน",
  "หารเศษส่วน",
];

export const SORT_OPTIONS: { value: "latest" | "popular" | "az"; label: string }[] = [
  { value: "latest", label: "ล่าสุด" },
  { value: "popular", label: "ใช้งานบ่อย" },
  { value: "az", label: "A-Z" },
];

/** เทียบระดับชั้นโดยรองรับช่วงชั้น เช่น "ป.4-ป.6" */
export function gradeMatches(itemGrade: string, selected: string): boolean {
  if (selected === "ทั้งหมด") return true;
  const target = Number(selected.replace("ป.", ""));
  const nums = (itemGrade.match(/\d/g) || []).map(Number);
  if (nums.length >= 2) {
    return target >= Math.min(...nums) && target <= Math.max(...nums);
  }
  return nums.includes(target);
}

export const initialMedia: MediaItem[] = [
  {
    id: "m1",
    title: "ใบงานรู้จักเศษส่วน",
    description: "แบบฝึกหัดแนะนำเรื่องเศษส่วน พร้อมเฉลย 10 ข้อ",
    type: "worksheet",
    grade: "ป.4",
    category: "รู้จักเศษส่วน",
    mediaUrl: "https://example.com/media/worksheet-intro",
    tags: ["ใบงาน", "เริ่มต้น", "เฉลย"],
    favorite: false,
    uses: 42,
    createdAt: 1715000000000,
  },
  {
    id: "m2",
    title: "ภาพเศษส่วนจากพิซซ่า",
    description: "ภาพประกอบเศษส่วนจากพิซซ่า สำหรับสื่อการสอน",
    type: "image",
    grade: "ป.4",
    category: "เศษส่วนจากภาพ",
    mediaUrl: "https://example.com/media/pizza-fraction",
    tags: ["พิซซ่า", "ภาพประกอบ"],
    favorite: true,
    uses: 88,
    createdAt: 1715100000000,
  },
  {
    id: "m3",
    title: "วิดีโออธิบายเศษส่วนคืออะไร",
    description: "วิดีโออธิบายความหมายของเศษส่วน พร้อมตัวอย่างใช้งานง่าย",
    type: "video",
    grade: "ป.4-ป.6",
    category: "รู้จักเศษส่วน",
    mediaUrl: "https://example.com/media/what-is-fraction",
    tags: ["วิดีโอ", "พื้นฐาน"],
    favorite: false,
    uses: 120,
    createdAt: 1715200000000,
  },
  {
    id: "m4",
    title: "เกมจับคู่เศษส่วน",
    description: "เกมจับคู่ภาพกับเศษส่วน เสริมทักษะการเรียนรู้",
    type: "game",
    grade: "ป.5",
    category: "เศษส่วนจากภาพ",
    mediaUrl: "https://example.com/media/match-game",
    tags: ["เกม", "จับคู่"],
    favorite: true,
    uses: 75,
    createdAt: 1715300000000,
  },
  {
    id: "m5",
    title: "ลิงก์บทเรียนออนไลน์เรื่องเศษส่วน",
    description: "ลิงก์ไปบทเรียนออนไลน์ เกี่ยวกับเศษส่วน",
    type: "lesson-link",
    grade: "ป.5",
    category: "รู้จักเศษส่วน",
    mediaUrl: "https://example.com/media/online-lesson",
    tags: ["ลิงก์", "ออนไลน์"],
    favorite: false,
    uses: 30,
    createdAt: 1715400000000,
  },
  {
    id: "m6",
    title: "ใบงานเขียนเศษส่วน",
    description: "ฝึกเขียนเศษส่วนจากภาพ พร้อมเฉลย",
    type: "worksheet",
    grade: "ป.5",
    category: "อ่านและเขียนเศษส่วน",
    mediaUrl: "https://example.com/media/write-fraction",
    tags: ["ใบงาน", "เขียน"],
    favorite: false,
    uses: 54,
    createdAt: 1715500000000,
  },
  {
    id: "m7",
    title: "แถบเศษส่วน",
    description: "แถบแสดงเศษส่วน 1/4 ถึง 4/4 สำหรับใช้ประกอบการสอน",
    type: "image",
    grade: "ป.4-ป.5",
    category: "เศษส่วนจากภาพ",
    mediaUrl: "https://example.com/media/fraction-bar",
    tags: ["แถบ", "ภาพประกอบ"],
    favorite: false,
    uses: 66,
    createdAt: 1715600000000,
  },
  {
    id: "m8",
    title: "วิดีโอการแบ่งเท่า ๆ กัน",
    description: "วิดีโอเรื่องการแบ่งเท่า ๆ กัน ก่อนเป็นเศษส่วน",
    type: "video",
    grade: "ป.4",
    category: "เศษส่วนจากภาพ",
    mediaUrl: "https://example.com/media/equal-parts",
    tags: ["วิดีโอ", "แบ่งเท่ากัน"],
    favorite: false,
    uses: 48,
    createdAt: 1715700000000,
  },
];

export const COMMON_CATEGORIES = [
  "รู้จักเศษส่วน",
  "เศษส่วนจากภาพ",
  "อ่านและเขียนเศษส่วน",
  "เปรียบเทียบเศษส่วน",
  "บวกเศษส่วน",
  "ลบเศษส่วน",
  "คูณเศษส่วน",
  "หารเศษส่วน",
];
