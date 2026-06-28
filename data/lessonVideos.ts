/**
 * ลิงก์วิดีโอ YouTube สำหรับแต่ละบทเรียน
 * วางลิงก์ YouTube ในรูปแบบใดก็ได้:
 *   https://www.youtube.com/watch?v=XXXXXXX
 *   https://youtu.be/XXXXXXX
 *   https://www.youtube.com/embed/XXXXXXX
 * ถ้ายังไม่มีวิดีโอให้ใส่ "" (ค่าว่าง) ระบบจะแสดง placeholder
 */
export const lessonVideos: Record<string, string> = {
  "/lessons/fraction-intro":   "",   // รู้จักเศษส่วน
  "/lessons/number-line":      "",   // เศษส่วนบนเส้นจำนวน
  "/lessons/compare":          "https://www.youtube.com/watch?v=tAS2JmECfmA",   // เปรียบเทียบเศษส่วน
  "/lessons/mixed-improper":   "",   // จำนวนคละและเศษเกิน
  "/lessons/add":              "https://www.youtube.com/watch?v=P9trAPTXiuc",   // บวกเศษส่วน
  "/lessons/subtract":         "https://www.youtube.com/watch?v=XgrsYUkkIxE",   // ลบเศษส่วน
  "/lessons/multiply":         "",   // คูณเศษส่วน
  "/lessons/divide":           "",   // หารเศษส่วน
  "/lessons/equivalent":       "",   // เศษส่วนที่เท่ากัน
};

/** แปลง YouTube URL ทุกรูปแบบเป็น embed URL */
export function toEmbedUrl(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    // https://www.youtube.com/watch?v=ID
    if (u.hostname.includes("youtube.com") && u.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${u.searchParams.get("v")}`;
    }
    // https://youtu.be/ID
    if (u.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${u.pathname}`;
    }
    // https://www.youtube.com/embed/ID (ใส่มาแล้ว)
    if (u.hostname.includes("youtube.com") && u.pathname.startsWith("/embed/")) {
      return url;
    }
  } catch {
    return null;
  }
  return null;
}
