/* ─────────────────────────────────────────────────────────────
   ทะเบียนเกมกลาง (Single Source of Truth)

   ทั้ง "โซนเกม" ในแต่ละบทเรียน และหน้า "เกมเศษส่วน" (/games)
   อ่านข้อมูลเกมจากไฟล์นี้ที่เดียว
   → แก้ชื่อ/คำอธิบาย/สถานะพร้อมใช้ ที่นี่ที่เดียว อัปเดตทุกหน้าอัตโนมัติ
   → เพิ่มเกมใหม่: เพิ่มรายการที่นี่ + ลงทะเบียนคอมโพเนนต์ใน
     components/games/gameComponents.tsx (คีย์ `${slug}:${id}`)
   ───────────────────────────────────────────────────────────── */

export type GameDef = {
  /** ไอดีเกม (ไม่ซ้ำภายในบทเรียนเดียวกัน) */
  id: string;
  emoji: string;
  title: string;
  /** ใช้สอนอะไร เรื่องอะไร */
  desc: string;
  /** แนวคิดที่เกมนี้สอน — แสดงเป็นป้ายบนการ์ด */
  concept: string;
  /** gradient ของไอคอน/หน้าปก */
  accent: string;
  ready: boolean;
};

export type LessonGames = {
  /** ตรงกับโฟลเดอร์ components/lessons/<slug> และ path บทเรียน */
  slug: string;
  lessonTitle: string;
  href: string;
  /** อีโมจิประจำบทเรียน */
  icon: string;
  /** สีหัวข้อของกลุ่ม */
  accent: string;
  games: GameDef[];
};

export const GAME_REGISTRY: LessonGames[] = [
  {
    slug: "compare",
    lessonTitle: "เปรียบเทียบเศษส่วน",
    href: "/lessons/compare",
    icon: "⚖️",
    accent: "from-emerald-500 to-green-500",
    games: [
      { id: "race", emoji: "🏁", title: "แข่งวิ่งบนเส้นจำนวน", desc: "ใครวิ่งได้ไกลกว่า? มีโหมดครูใช้สอน + โหมดแข่งขัน", concept: "เทียบค่าบนเส้นจำนวน", accent: "from-emerald-500 to-green-500", ready: true },
      { id: "balance", emoji: "⚖️", title: "ศึกตาชั่งเศษส่วน", desc: "ช่วยพ่อมดฮูกชั่งของวิเศษ! ฝึกเครื่องหมาย > < =", concept: "เครื่องหมาย > < =", accent: "from-sky-500 to-cyan-500", ready: true },
      { id: "duel", emoji: "⚔️", title: "ดวลการ์ดเศษส่วน", desc: "พลิกการ์ดเลือกใบที่มากที่สุด จับเวลา + คอมโบ + รอบบอสมังกร", concept: "หาค่ามากที่สุด", accent: "from-fuchsia-500 to-pink-500", ready: true },
      { id: "gates", emoji: "🚪", title: "ประตูเครื่องหมายมหัศจรรย์", desc: "ปีนหอคอย 4 ชั้น เดินเข้าประตู > = < ให้ถูก เก็บดาวเปิดหีบสมบัติ", concept: "เลือกเครื่องหมายให้ถูก", accent: "from-violet-500 to-purple-500", ready: true },
    ],
  },
  {
    slug: "equivalent",
    lessonTitle: "เศษส่วนที่เท่ากัน",
    href: "/lessons/equivalent",
    icon: "🔁",
    accent: "from-sky-500 to-cyan-500",
    games: [
      { id: "jar", emoji: "🐟", title: "โหลปลาเศษส่วน", desc: "ติดแถบเศษส่วนที่โหล เทน้ำหาขีดที่ตรงกัน — โหมดครู + ภารกิจ", concept: "หาเศษส่วนที่เท่ากัน", accent: "from-sky-500 to-cyan-500", ready: true },
      { id: "choc", emoji: "🍫", title: "โรงงานช็อกโกแลตแฝด", desc: "ตัดแท่งขวาให้เท่าแท่งซ้าย พิสูจน์ด้วยการเทียบปริมาณ", concept: "พิสูจน์ความเท่ากัน", accent: "from-amber-600 to-orange-500", ready: true },
      { id: "train", emoji: "🚂", title: "รถไฟจับคู่เศษส่วน", desc: "เปิดการ์ดจับคู่ที่เท่ากัน ต่อขบวนรถไฟ 3D + โหมด 2 ทีมแข่งหน้าห้อง", concept: "จับคู่เศษส่วนเท่ากัน", accent: "from-emerald-500 to-teal-500", ready: true },
      { id: "balloon", emoji: "🎈", title: "ยิงลูกโป่งเศษส่วน", desc: "แตะเฉพาะลูกโป่งที่เท่ากับโจทย์ ก่อนลอยหลุดไป!", concept: "คัดเศษส่วนเท่ากัน (จับเวลา)", accent: "from-rose-500 to-pink-500", ready: true },
    ],
  },
  {
    slug: "simplify-expand",
    lessonTitle: "เศษส่วนอย่างต่ำ",
    href: "/lessons/simplify-expand",
    icon: "🔎",
    accent: "from-orange-500 to-amber-500",
    games: [
      { id: "shrink", emoji: "🏭", title: "เครื่องย่อเศษส่วน", desc: "กดตัวหารบีบให้เล็กลง — ค่าเท่าเดิม ชื่อเล็กลง จนอย่างต่ำ", concept: "ย่อเศษส่วนด้วยตัวหารร่วม", accent: "from-orange-500 to-amber-500", ready: true },
      { id: "rocket", emoji: "🚀", title: "จรวดเศษส่วนอย่างต่ำ", desc: "เลือกรูปอย่างต่ำเติมเชื้อเพลิงให้จรวดทะยาน — มีโหมด 2 ทีมแข่ง", concept: "ระบุรูปอย่างต่ำ", accent: "from-indigo-500 to-violet-500", ready: true },
    ],
  },
  {
    slug: "mixed-improper",
    lessonTitle: "จำนวนคละและเศษเกิน",
    href: "/lessons/mixed-improper",
    icon: "1¼",
    accent: "from-orange-500 to-rose-500",
    games: [
      { id: "pizza", emoji: "🍕", title: "ร้านพิซซ่าจำนวนคละ", desc: "แพ็กชิ้นพิซซ่าใส่กล่อง แปลงเศษเกิน → จำนวนคละ ทีละสถานการณ์", concept: "เศษเกิน → จำนวนคละ", accent: "from-orange-500 to-rose-500", ready: true },
      { id: "juice", emoji: "🧃", title: "โรงงานน้ำผลไม้", desc: "เทขวดเป็นแก้ว แปลงจำนวนคละ → เศษเกิน — มีโหมด 2 ทีมแข่ง", concept: "จำนวนคละ → เศษเกิน", accent: "from-lime-500 to-emerald-500", ready: true },
      { id: "mix", emoji: "⚽", title: "เตะบอลจำนวนคละ", desc: "เลือกช่องโกลที่ถูกแล้วซัด! เข้าเสียบตาข่าย GOAL — โจทย์สลับ 2 ทาง + 2 ทีมดวลจุดโทษ", concept: "แปลง 2 ทาง (จับเวลา)", accent: "from-emerald-500 to-lime-500", ready: true },
      { id: "boss", emoji: "🐉", title: "ศึกบอสมังกรเศษส่วน", desc: "ด่านสุดท้าย! รวมทุกทักษะ ตอบถูกฟาดบอส — เปรียบเทียบ/เท่ากัน/แปลง 2 ทาง + โหมดทั้งห้อง", concept: "ทบทวนรวมทุกทักษะ", accent: "from-violet-600 to-fuchsia-500", ready: true },
    ],
  },
  {
    slug: "add",
    lessonTitle: "บวกเศษส่วน",
    href: "/lessons/add",
    icon: "➕",
    accent: "from-orange-500 to-amber-500",
    games: [
      { id: "juice", emoji: "🍊", title: "โหลน้ำส้มรวมพลัง", desc: "เทน้ำส้มจากโหล A ลงโหล B ดูระดับเพิ่มขึ้นจริง — ครูตั้งโจทย์ได้ + โหมดทายก่อนเท", concept: "บวกตัวส่วนเท่ากัน", accent: "from-orange-500 to-amber-500", ready: true },
      { id: "drink", emoji: "🥤", title: "บาร์ผสมน้ำ (จำนวนคละ)", desc: "เลือกสี+ตั้งชื่อน้ำ เทรวมสองแก้ว น้ำล้นก็เพิ่มแก้ว = จำนวนคละ 1 แก้วกับอีกเศษ", concept: "บวกได้จำนวนคละ", accent: "from-pink-500 to-rose-500", ready: true },
      { id: "bridge", emoji: "🌉", title: "สะพานข้ามเหวเศษส่วน", desc: "เลือกแผ่นไม้ 2 แผ่นบวกให้พอดีเหว ตัวละครเดินข้าม — โหมดครู + แข่ง 2 ทีม", concept: "หาคู่ที่บวกได้พอดี", accent: "from-emerald-500 to-teal-500", ready: true },
      { id: "whole", emoji: "🚗", title: "ขับรถให้ถึงเส้นชัย (ครบ 1)", desc: "เลือกระยะที่เหลือให้รถถึงเส้นชัยพอดี (รวมกันได้ 1) + โหมดระยะจริง กม./ม.", concept: "ส่วนเติมเต็มให้ครบ 1", accent: "from-violet-500 to-purple-500", ready: true },
      { id: "race", emoji: "🏎️", title: "รถแข่งบวกเร็ว", desc: "เห็นโจทย์ตอบเลย ตอบถูกรถพุ่ง แข่งกับรถ AI ถึงเส้นชัยก่อนชนะ", concept: "บวกเร็ว (จับเวลา)", accent: "from-rose-500 to-pink-500", ready: true },
    ],
  },
  {
    slug: "subtract",
    lessonTitle: "ลบเศษส่วน",
    href: "/lessons/subtract",
    icon: "➖",
    accent: "from-sky-500 to-cyan-500",
    games: [
      { id: "fishjar", emoji: "🐠", title: "โหลปลาน้ำลด", desc: "เทน้ำออกจากโหลปลาผ่านก๊อก น้ำลดจริง ปลาลอยตามระดับ — โหมดครู + ทายก่อนเท", concept: "ลบตัวส่วนเท่ากัน", accent: "from-sky-500 to-cyan-500", ready: true },
      { id: "choco", emoji: "🍫", title: "ช็อกโกแลตแบ่งเพื่อน", desc: "หักช็อกโกแลตแบ่งให้เพื่อน เหลือกี่ชิ้น — โหมดครู + แบ่งปันที่โรงเรียน 8 ข้อ", concept: "ลบตัวส่วนเท่ากัน (ของจริง)", accent: "from-amber-600 to-orange-500", ready: true },
      { id: "balance", emoji: "⚖️", title: "เครื่องชั่งสมดุล", desc: "ทำส่วนให้เท่าก่อน แล้ววางลูกตุ้มชั่งหาความต่าง — โหมดครู + นักชั่งแห่งแล็บ", concept: "ลบตัวส่วนต่างกัน", accent: "from-violet-500 to-purple-500", ready: true },
      { id: "cake", emoji: "🎂", title: "ร้านขนมหมู่บ้าน", desc: "ลบจำนวนคละที่เศษพอลบกันได้ ลูกค้าพิกเซลเดินมาซื้อเค้ก โหมดครู + เปิดร้านวันหยุด", concept: "ลบจำนวนคละ (ไม่ยืม)", accent: "from-pink-500 to-rose-500", ready: true },
      { id: "bottle", emoji: "🧃", title: "สถานีน้ำนักวิ่ง", desc: "เศษลบไม่ได้ ต้องเปิดขวดเต็มแตกเป็นเศษก่อน (การยืม) — โหมดครู + สถานีน้ำ กม.5", concept: "ลบจำนวนคละ (การยืม)", accent: "from-emerald-500 to-teal-500", ready: true },
    ],
  },
  {
    slug: "multiply",
    lessonTitle: "คูณเศษส่วน",
    href: "/lessons/multiply",
    icon: "✖️",
    accent: "from-amber-500 to-orange-500",
    games: [
      { id: "market", emoji: "⚖️", title: "ตลาดนัดชั่งกิโล", desc: "วางถุงสินค้าทีละถุงลงตาชั่งเข็มหมุน เห็นการบวกซ้ำ — เปลี่ยนชื่อ/สินค้า/ตัวละครได้", concept: "จำนวนเต็ม × เศษส่วน", accent: "from-amber-500 to-orange-500", ready: true },
      { id: "money", emoji: "💰", title: "เงินค่าขนมของฉัน", desc: "แบ่งเงิน (หรือจำนวนนักเรียน) เป็นกอง ๆ ด้วยแถบบาร์โมเดล แล้วเลือก a/b ของทั้งหมด", concept: "เศษส่วนของจำนวน", accent: "from-emerald-500 to-green-500", ready: true },
      { id: "garden", emoji: "🥬", title: "แปลงผักคุณยาย", desc: "ปลูกผักเป็นคอลัมน์ แล้วหว่านผักบุ้งเป็นแถว ช่องซ้อนทับคือคำตอบ — เห็นชัดว่าทำไมตัวส่วนคูณกัน", concept: "เศษส่วน × เศษส่วน (พื้นที่)", accent: "from-lime-500 to-emerald-500", ready: true },
      { id: "tower", emoji: "📦", title: "หอคอยกล่องมหัศจรรย์", desc: "วางกล่องซ้อนวัดความสูงรวมด้วยไม้บรรทัดยักษ์ (หรือเทน้ำลงแท็งก์) — สลับเมตร↔ลิตรได้", concept: "จำนวนคละ × จำนวนเต็ม", accent: "from-amber-600 to-orange-500", ready: true },
    ],
  },
  {
    slug: "divide",
    lessonTitle: "หารเศษส่วน",
    href: "/lessons/divide",
    icon: "➗",
    accent: "from-violet-600 to-purple-500",
    games: [
      { id: "ribbon", emoji: "✂️", title: "ร้านตัดริบบิ้น", desc: "ตัดริบบิ้นเป็นชิ้นเท่า ๆ กัน นับว่าได้กี่ชิ้น — เปลี่ยนชื่อ/สี/ตัวละครได้", concept: "เศษ ÷ เศษหน่วย (มีกี่ชิ้น)", accent: "from-pink-500 to-rose-500", ready: true },
      { id: "cake", emoji: "🍰", title: "แบ่งเค้กให้เพื่อน", desc: "ซอยเค้กแบ่งให้เพื่อนเท่า ๆ กัน คนละเท่าไร — เปลี่ยนชื่อ/ตัวละครได้", concept: "เศษ ÷ จำนวนเต็ม (การแบ่ง)", accent: "from-amber-500 to-orange-500", ready: true },
      { id: "bottle", emoji: "🧴", title: "โรงบรรจุน้ำ", desc: "กรอกน้ำจากแท็งก์ใส่ขวดเล็ก ได้กี่ขวด — เปลี่ยนชื่อ/ตัวละครได้", concept: "จำนวนเต็ม ÷ เศษส่วน", accent: "from-sky-500 to-cyan-500", ready: true },
      { id: "frog", emoji: "🐸", title: "กบกระโดดเส้นจำนวน", desc: "กบกระโดดวัดว่ากี่ก้าวถึงเป้า เหลือเศษเท่าไร — เห็นตัวส่วนร่วม + กลับแล้วคูณ", concept: "เศษ ÷ เศษ (กลับแล้วคูณ)", accent: "from-lime-500 to-green-500", ready: true },
    ],
  },
];

/** ดึงรายการเกมของบทเรียน (ใช้ใน GameHub ของแต่ละบท) */
export function getLessonGames(slug: string): GameDef[] {
  return GAME_REGISTRY.find((l) => l.slug === slug)?.games ?? [];
}

/** จำนวนเกมที่พร้อมเล่นทั้งหมด */
export function totalReadyGames(): number {
  return GAME_REGISTRY.reduce((sum, l) => sum + l.games.filter((g) => g.ready).length, 0);
}
