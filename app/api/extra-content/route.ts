import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "extraContentData.json");

type StoreData = {
  blocks: object[];
  hiddenSteps: Record<string, number[]>;
};

const EMPTY: StoreData = { blocks: [], hiddenSteps: {} };

function readData(): StoreData {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return EMPTY;
  }
}

export async function GET() {
  return NextResponse.json(readData());
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
