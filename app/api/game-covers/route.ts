import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { GAME_REGISTRY } from "@/data/gameRegistry";

/* ─────────────────────────────────────────────────────────────
   หน้าปกเกม — เก็บเป็นไฟล์จริงในโปรเจกต์ (ไม่ใช้ localStorage)
     รูป  : public/images/games/<slug>-<id>.<ext>
     ดัชนี: data/gameCovers.json  → { "divide:frog": "/images/games/divide-frog.jpg?v=..." }

   ไม่มีเพดาน 5MB · ไม่หายเมื่อล้าง cache/เปลี่ยนเบราว์เซอร์/เปลี่ยน origin
   (เขียนไฟล์ได้เฉพาะตอนรันบนเครื่อง — บน Vercel ระบบไฟล์อ่านอย่างเดียว)
   ───────────────────────────────────────────────────────────── */

const DATA_FILE = path.join(process.cwd(), "data", "gameCovers.json");
const IMG_DIR = path.join(process.cwd(), "public", "images", "games");
const EXTS = ["jpg", "png", "webp"];

type Covers = Record<string, string>;

function readData(): Covers {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8")) as Covers;
  } catch {
    return {};
  }
}

function writeData(data: Covers) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

/** เกมนี้มีอยู่จริงใน registry ไหม (กัน path traversal + คีย์มั่ว) */
function isKnownGame(slug: string, id: string) {
  return GAME_REGISTRY.some((l) => l.slug === slug && l.games.some((g) => g.id === id));
}

const baseName = (slug: string, id: string) => `${slug}-${id}`.replace(/[^a-zA-Z0-9-]/g, "_");

function removeOldFiles(slug: string, id: string) {
  for (const ext of EXTS) {
    const p = path.join(IMG_DIR, `${baseName(slug, id)}.${ext}`);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
}

export async function GET() {
  return NextResponse.json(readData());
}

export async function POST(request: Request) {
  try {
    const { slug, id, dataUrl } = await request.json();

    if (typeof slug !== "string" || typeof id !== "string" || !isKnownGame(slug, id)) {
      return NextResponse.json({ ok: false, error: "ไม่รู้จักเกมนี้" }, { status: 400 });
    }
    const m = typeof dataUrl === "string" && dataUrl.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/);
    if (!m) {
      return NextResponse.json({ ok: false, error: "ไฟล์ภาพไม่ถูกต้อง" }, { status: 400 });
    }

    const ext = m[1] === "jpeg" ? "jpg" : m[1];
    const filename = `${baseName(slug, id)}.${ext}`;

    fs.mkdirSync(IMG_DIR, { recursive: true });
    removeOldFiles(slug, id); // กันไฟล์นามสกุลเก่าค้าง
    fs.writeFileSync(path.join(IMG_DIR, filename), Buffer.from(m[2], "base64"));

    const data = readData();
    // ?v= กัน browser cache เมื่อเปลี่ยนภาพชื่อไฟล์เดิม
    data[`${slug}:${id}`] = `/images/games/${filename}?v=${Date.now()}`;
    writeData(data);

    return NextResponse.json({ ok: true, path: data[`${slug}:${id}`] });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { slug, id } = await request.json();
    if (typeof slug !== "string" || typeof id !== "string" || !isKnownGame(slug, id)) {
      return NextResponse.json({ ok: false, error: "ไม่รู้จักเกมนี้" }, { status: 400 });
    }
    removeOldFiles(slug, id);
    const data = readData();
    delete data[`${slug}:${id}`];
    writeData(data);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
