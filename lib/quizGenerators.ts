import { randInt, shuffle } from "./randomFraction";
import { readThaiFraction } from "./thaiNumber";
import { generateDrawChallenge, splitIntoShapeNumerators, toMixedNumber, type FractionKind } from "./fractionUtils";
import type { FractionShapeKind, FractionTone } from "@/types/lessonContent";

export { splitIntoShapeNumerators };

/** ภาพประกอบคำถาม — เศษส่วนจริง (FractionShape), ภาพ "แบ่งไม่เท่ากัน", หลายรูปรวมกัน (เศษเกิน/จำนวนคละ) หรือเส้นจำนวน */
export type QuizImage =
  | { kind: "fraction"; shape: FractionShapeKind; numerator: number; denominator: number; tone: FractionTone }
  | { kind: "unequal"; variant: "circle" | "bar" | "grid" }
  | { kind: "multiFraction"; shape: FractionShapeKind; denominator: number; totalNumerator: number; tone: FractionTone }
  | { kind: "numberLine"; denominator: number; marker: number; tone: FractionTone };

export type QuizQuestion = {
  prompt: string;
  image?: QuizImage;            // ภาพเดียวประกอบโจทย์ (เหนือคำถาม)
  choiceImages?: QuizImage[];   // ภาพประจำแต่ละตัวเลือก (ใช้แทนข้อความ) — ต้องยาวเท่า choices ถ้ามี
  choices: string[];   // "N/D" → rendered as FractionStack; "W N/D" → mixed; else plain text
  correctIndex: number;
  explanation: string;
};

function frac(n: number, d: number): string {
  return `${n}/${d}`;
}

function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

/** Return up to `count` unique wrong choices from candidates */
function wrongs(correct: string, candidates: string[], count = 3): string[] {
  const pool = [...new Set(candidates)].filter(
    (s) => s !== correct && !s.includes("/0") && !s.startsWith("0/") && !s.includes("-")
  );
  return shuffle(pool).slice(0, count);
}

/** Fill up to 4 choices (pad with numeric variants if pool is small) */
function buildChoices(correct: string, pool: string[]): string[] {
  let ws = wrongs(correct, pool);
  // fallback: vary numerator by ±1,±2
  if (ws.length < 3) {
    const [n, d] = correct.split("/").map(Number);
    const fallback = [1, 2, 3].map((δ) => frac(n + δ, d)).filter((s) => s !== correct);
    ws = [...new Set([...ws, ...fallback])].filter((s) => s !== correct).slice(0, 3);
  }
  return shuffle([correct, ...ws]);
}

/** ตัวช่วยสำหรับตัวเลือกที่ไม่ใช่รูปแบบ "N/D" (คำอ่านไทย, ตัวเลขล้วน ฯลฯ) */
function uniqueWrongs(correct: string, pool: string[], count = 3): string[] {
  const set = [...new Set(pool)].filter((s) => s !== correct);
  return shuffle(set).slice(0, count);
}
function withChoices(correct: string, pool: string[], count = 3): string[] {
  return shuffle([correct, ...uniqueWrongs(correct, pool, count)]);
}

/** ตัวเลข 1..d-1 ที่ไม่ใช่ n — ใช้สุ่มตัวเลือกผิดที่เป็นตัวเศษ/ตัวส่วนอื่น */
function otherNumerators(n: number, d: number): number[] {
  const arr: number[] = [];
  for (let i = 1; i < d; i++) if (i !== n) arr.push(i);
  return arr;
}

// ──────────────────────────────────────────────────────────────────────────────
// รู้จักเศษส่วน — คลังคำถาม 13 แบบ (สลับสับเปลี่ยนไม่ให้ซ้ำรูปแบบเดิม)
// ──────────────────────────────────────────────────────────────────────────────

/** รูปทรงสี่เหลี่ยมผืนผ้าแคบ (bar) ถูกตัดออกเพราะไม่พอดีกับกรอบสี่เหลี่ยมจัตุรัสของตัวเลือก */
const QUIZ_SHAPES: FractionShapeKind[] = ["pizza", "watermelon", "chocolate", "glass", "circle", "grid"];
const QUIZ_TONES: FractionTone[] = ["accent", "emerald", "violet", "sky", "pink"];

function randomShape(): FractionShapeKind {
  return QUIZ_SHAPES[randInt(0, QUIZ_SHAPES.length - 1)];
}
function randomTone(): FractionTone {
  return QUIZ_TONES[randInt(0, QUIZ_TONES.length - 1)];
}
function fractionImage(shape: FractionShapeKind, n: number, d: number, tone = randomTone()): QuizImage {
  return { kind: "fraction", shape, numerator: n, denominator: d, tone };
}

/** T1: ดูภาพแล้วบอกว่าเป็นเศษส่วนใด */
function q_imageToFraction(): QuizQuestion {
  const d = randInt(3, 8);
  const n = randInt(1, d - 1);
  const correct = frac(n, d);
  const choices = buildChoices(correct, [
    frac(d, n), frac(d - n, d), frac(n + 1, d), frac(n, d + 1),
    frac(n > 1 ? n - 1 : n + 2, d),
  ]);
  return {
    prompt: "ภาพนี้แสดงเศษส่วนใด?",
    image: fractionImage(randomShape(), n, d),
    choices,
    correctIndex: choices.indexOf(correct),
    explanation: `ระบายไป ${n} ส่วน จากทั้งหมด ${d} ส่วนที่เท่ากัน → ${correct}`,
  };
}

/** T2: ให้เศษส่วนเป็นตัวหนังสือ ถามคำอ่านที่ถูกต้อง */
function q_fractionToRead(): QuizQuestion {
  const d = randInt(3, 9);
  const n = randInt(1, d - 1);
  const correct = readThaiFraction(n, d);
  const pool = [
    readThaiFraction(d, n),
    readThaiFraction(n, d + 1),
    ...shuffle(otherNumerators(n, d)).slice(0, 3).map((alt) => readThaiFraction(alt, d)),
  ];
  const choices = withChoices(correct, pool, 3);
  return {
    prompt: `เศษส่วน ${frac(n, d)} อ่านว่าอย่างไร?`,
    choices,
    correctIndex: choices.indexOf(correct),
    explanation: `อ่านตัวเศษก่อน แล้วตามด้วยตัวส่วน → “${correct}”`,
  };
}

/** T3: ดูภาพแล้วเลือกคำอ่านที่ถูกต้อง */
function q_imageToRead(): QuizQuestion {
  const d = randInt(3, 9);
  const n = randInt(1, d - 1);
  const correct = readThaiFraction(n, d);
  const pool = [
    readThaiFraction(d, n),
    readThaiFraction(n, d + 1),
    ...shuffle(otherNumerators(n, d)).slice(0, 3).map((alt) => readThaiFraction(alt, d)),
  ];
  const choices = withChoices(correct, pool, 3);
  return {
    prompt: "ภาพนี้อ่านว่าอย่างไร?",
    image: fractionImage(randomShape(), n, d),
    choices,
    correctIndex: choices.indexOf(correct),
    explanation: `ระบาย ${n} ส่วน จาก ${d} ส่วน อ่านว่า “${correct}”`,
  };
}

/** T4: ภาพ 4 ใบ มี 1 ใบแบ่งไม่เท่ากัน ให้หาภาพนั้น */
function q_whichUnequal(): QuizQuestion {
  const unequalIdx = randInt(0, 3);
  const equalShapes = shuffle(QUIZ_SHAPES).slice(0, 3);
  const unequalVariant = (["circle", "bar", "grid"] as const)[randInt(0, 2)];

  const choiceImages: QuizImage[] = [];
  const choices: string[] = [];
  let ei = 0;
  for (let i = 0; i < 4; i++) {
    if (i === unequalIdx) {
      choiceImages.push({ kind: "unequal", variant: unequalVariant });
    } else {
      const d = randInt(3, 6);
      const n = randInt(1, d - 1);
      choiceImages.push(fractionImage(equalShapes[ei % equalShapes.length], n, d));
      ei++;
    }
    choices.push("");
  }

  return {
    prompt: "ภาพใดแบ่งไม่เท่ากัน?",
    choiceImages,
    choices,
    correctIndex: unequalIdx,
    explanation: "ภาพอื่นแบ่งเป็นชิ้นขนาดเท่ากันทุกชิ้น จึงเขียนเป็นเศษส่วนได้ แต่ภาพที่เลือกมีขนาดชิ้นไม่เท่ากัน จึงเขียนเป็นเศษส่วนไม่ได้",
  };
}

/** T5: ภาพระบายครบทุกส่วน (ตัวเศษ = ตัวส่วน) หมายถึงอะไร */
function q_fullUnitMeaning(): QuizQuestion {
  const d = randInt(3, 8);
  const correct = "ครบ 1 หน่วยเต็ม";
  const choices = shuffle([correct, "ยังไม่ได้ระบายเลย", "ระบายไปครึ่งเดียว", "ระบายเกินจำนวนทั้งหมด"]);
  return {
    prompt: `ภาพนี้ระบายครบทุกส่วน (${frac(d, d)}) หมายถึงอะไร?`,
    image: fractionImage(randomShape(), d, d),
    choices,
    correctIndex: choices.indexOf(correct),
    explanation: `เมื่อตัวเศษเท่ากับตัวส่วน (${d}/${d}) หมายถึงระบายครบทุกส่วน เท่ากับ 1 หน่วยเต็มพอดี`,
  };
}

/** T6: ภาพยังไม่ได้ระบายเลย (ตัวเศษ = 0) หมายถึงอะไร */
function q_zeroShadedMeaning(): QuizQuestion {
  const d = randInt(3, 8);
  const correct = "ยังไม่ได้ระบายส่วนใดเลย";
  const choices = shuffle([correct, "ระบายครบทุกส่วนแล้ว", "ระบายไปครึ่งหนึ่ง", "แบ่งไม่เท่ากัน"]);
  return {
    prompt: `ภาพนี้ยังไม่มีส่วนใดถูกระบาย (${frac(0, d)}) หมายถึงอะไร?`,
    image: fractionImage(randomShape(), 0, d),
    choices,
    correctIndex: choices.indexOf(correct),
    explanation: `ตัวเศษเป็น 0 หมายถึงยังไม่ได้เลือกหรือระบายส่วนใดเลย แม้จะแบ่งไว้ ${d} ส่วนเท่ากันแล้วก็ตาม`,
  };
}

/** T7: โจทย์ปัญหาจากสถานการณ์จริง (พิซซ่า/แตงโม/ช็อกโกแลต/น้ำ) พร้อมภาพประกอบ */
const WORD_PROBLEM_CONTEXTS: { obj: string; unit: string; verb: string; shape: FractionShapeKind }[] = [
  { obj: "พิซซ่า 1 ถาด", unit: "ชิ้น", verb: "กิน", shape: "pizza" },
  { obj: "แตงโม 1 ลูก", unit: "ชิ้น", verb: "กิน", shape: "watermelon" },
  { obj: "ช็อกโกแลต 1 แผ่น", unit: "ชิ้น", verb: "แบ่งให้เพื่อน", shape: "chocolate" },
  { obj: "น้ำ 1 แก้ว", unit: "ส่วน", verb: "ดื่ม", shape: "glass" },
];
function q_wordProblem(): QuizQuestion {
  const ctx = WORD_PROBLEM_CONTEXTS[randInt(0, WORD_PROBLEM_CONTEXTS.length - 1)];
  const d = randInt(3, 8);
  const n = randInt(1, d - 1);
  const correct = frac(n, d);
  const choices = buildChoices(correct, [
    frac(d, n), frac(d - n, d), frac(n + 1, d), frac(n, d + 1),
  ]);
  return {
    prompt: `มี${ctx.obj} แบ่งเป็น ${d} ${ctx.unit}เท่า ๆ กัน ${ctx.verb}ไป ${n} ${ctx.unit} คิดเป็นเศษส่วนเท่าไรของทั้งหมด?`,
    image: fractionImage(ctx.shape, n, d, "accent"),
    choices,
    correctIndex: choices.indexOf(correct),
    explanation: `${ctx.verb}ไป ${n} ${ctx.unit} จากทั้งหมด ${d} ${ctx.unit}ที่แบ่งเท่า ๆ กัน → ${correct}`,
  };
}

/** T8: ดูภาพแล้วบอกตัวเศษ (ตัวเลขล้วน ไม่ใช่เศษส่วนเต็มรูป) */
function q_numeratorFromImage(): QuizQuestion {
  const d = randInt(4, 9);
  const n = randInt(1, d - 1);
  const correct = String(n);
  const pool = [...new Set([...otherNumerators(n, d), d])].map(String);
  const choices = withChoices(correct, pool, 3);
  return {
    prompt: "จากภาพ ตัวเศษ (จำนวนส่วนที่ระบาย) คือข้อใด?",
    image: fractionImage(randomShape(), n, d),
    choices,
    correctIndex: choices.indexOf(correct),
    explanation: `ภาพนี้ระบายไป ${n} ส่วน → ตัวเศษ = ${n}`,
  };
}

/** T9: ดูภาพแล้วบอกตัวส่วน (ตัวเลขล้วน) */
function q_denominatorFromImage(): QuizQuestion {
  const d = randInt(4, 9);
  const n = randInt(1, d - 1);
  const poolNums = new Set<number>([n, d + 1, d + 2, Math.max(n + 1, d - 1)]);
  poolNums.delete(d);
  const correct = String(d);
  const pool = [...poolNums].map(String);
  const choices = withChoices(correct, pool, 3);
  return {
    prompt: "จากภาพ ตัวส่วน (จำนวนส่วนทั้งหมด) คือข้อใด?",
    image: fractionImage(randomShape(), n, d),
    choices,
    correctIndex: choices.indexOf(correct),
    explanation: `ภาพนี้แบ่งไว้ทั้งหมด ${d} ส่วนเท่า ๆ กัน → ตัวส่วน = ${d}`,
  };
}

/** T10: ภาพ 4 ใบ 3 ใบเป็นเศษส่วนเดียวกัน (รูปทรงต่างกัน) อีก 1 ใบไม่เหมือนใคร */
function q_oddOneOut(): QuizQuestion {
  const d = randInt(3, 6);
  const n = randInt(1, d - 1);
  let dOther = randInt(3, 6);
  let nOther = randInt(1, dOther - 1);
  let tries = 0;
  while (nOther / dOther === n / d && tries++ < 10) {
    dOther = randInt(3, 6);
    nOther = randInt(1, dOther - 1);
  }

  const shapes = shuffle(QUIZ_SHAPES).slice(0, 4);
  const oddIdx = randInt(0, 3);
  const choiceImages: QuizImage[] = shapes.map((shape, i) =>
    i === oddIdx ? fractionImage(shape, nOther, dOther, "pink") : fractionImage(shape, n, d, "emerald")
  );

  return {
    prompt: "ภาพ 3 ใน 4 นี้แสดงเศษส่วนเดียวกัน ภาพใดแสดงเศษส่วนที่ไม่เหมือนภาพอื่น?",
    choiceImages,
    choices: ["", "", "", ""],
    correctIndex: oddIdx,
    explanation: `ภาพอื่นแสดง ${frac(n, d)} เหมือนกันแม้จะเป็นรูปทรงต่างกัน แต่ภาพที่เลือกแสดง ${frac(nOther, dOther)} ซึ่งไม่เท่ากัน`,
  };
}

/** T11: นิยามตัวเศษ (ล้วนข้อความ ไม่มีภาพ) */
function q_defineNumerator(): QuizQuestion {
  const correct = "จำนวนส่วนที่เลือกหรือระบาย";
  const choices = shuffle([correct, "จำนวนส่วนทั้งหมดที่แบ่งเท่า ๆ กัน", "ผลบวกของเศษส่วน", "จำนวนรูปทรงที่ใช้วาดภาพ"]);
  return {
    prompt: "ตัวเศษของเศษส่วน หมายถึงอะไร?",
    choices,
    correctIndex: choices.indexOf(correct),
    explanation: "ตัวเศษ (ตัวบน) บอกจำนวนส่วนที่เราเลือกหรือระบายสี",
  };
}

/** T12: นิยามตัวส่วน (ล้วนข้อความ ไม่มีภาพ) */
function q_defineDenominator(): QuizQuestion {
  const correct = "จำนวนส่วนทั้งหมดที่แบ่งเท่า ๆ กัน";
  const choices = shuffle([correct, "จำนวนส่วนที่เลือกหรือระบาย", "ผลลบของเศษส่วน", "ขนาดของรูปทรงทั้งหมด"]);
  return {
    prompt: "ตัวส่วนของเศษส่วน หมายถึงอะไร?",
    choices,
    correctIndex: choices.indexOf(correct),
    explanation: "ตัวส่วน (ตัวล่าง) บอกจำนวนส่วนทั้งหมดที่แบ่งไว้เท่า ๆ กัน",
  };
}

/** T13: ทำไมต้องแบ่งเท่า ๆ กัน (ล้วนข้อความ ทดสอบความเข้าใจเชิงแนวคิด) */
function q_whyEqualParts(): QuizQuestion {
  const correct = "เพราะถ้าแบ่งไม่เท่ากัน จะเขียนเป็นเศษส่วนที่ถูกต้องไม่ได้";
  const choices = shuffle([
    correct,
    "เพราะทำให้ภาพดูสวยงามขึ้น",
    "เพราะตัวส่วนต้องเป็นเลขคู่เท่านั้น",
    "เพราะตัวเศษต้องมากกว่าตัวส่วนเสมอ",
  ]);
  return {
    prompt: "ทำไมการแบ่งเป็นส่วนเท่า ๆ กันจึงสำคัญกับการเขียนเศษส่วน?",
    choices,
    correctIndex: choices.indexOf(correct),
    explanation: "เศษส่วนใช้บอกส่วนหนึ่งของทั้งหมดที่ถูกแบ่งเท่า ๆ กันเท่านั้น ถ้าส่วนต่าง ๆ มีขนาดไม่เท่ากัน จะไม่สามารถเขียนหรือเปรียบเทียบเป็นเศษส่วนได้อย่างถูกต้อง",
  };
}

const FRACTION_INTRO_GENERATORS: Array<() => QuizQuestion> = [
  q_imageToFraction,
  q_fractionToRead,
  q_imageToRead,
  q_whichUnequal,
  q_fullUnitMeaning,
  q_zeroShadedMeaning,
  q_wordProblem,
  q_numeratorFromImage,
  q_denominatorFromImage,
  q_oddOneOut,
  q_defineNumerator,
  q_defineDenominator,
  q_whyEqualParts,
];

/** สุ่มลำดับประเภทคำถามใหม่ทุกครั้งที่เริ่มชุด (index === 0) แล้วไล่ตามลำดับนั้นไม่ให้ซ้ำแบบในชุดเดียวกัน */
let fractionIntroOrder: number[] = [];

export function makeFractionIntroQuestion(_unused?: unknown, index = 0): QuizQuestion {
  if (index === 0 || fractionIntroOrder.length !== FRACTION_INTRO_GENERATORS.length) {
    fractionIntroOrder = shuffle(FRACTION_INTRO_GENERATORS.map((_, i) => i));
  }
  const typeIdx = fractionIntroOrder[index % fractionIntroOrder.length];
  return FRACTION_INTRO_GENERATORS[typeIdx]();
}

// ──────────────────────────────────────────────────────────────────────────────
// เส้นจำนวน — คลังคำถาม 7 แบบ (เน้นภาพเส้นจำนวนจริงในโจทย์)
// ──────────────────────────────────────────────────────────────────────────────

function nlImage(marker: number, denominator: number): QuizImage {
  return { kind: "numberLine", denominator, marker, tone: randomTone() };
}

/** T1: ดูจุดบนเส้นจำนวน แล้วเลือกเศษส่วน */
function q_nl_readPoint(): QuizQuestion {
  const d = randInt(2, 8);
  const n = randInt(1, d - 1);
  const correct = frac(n, d);
  const choices = buildChoices(correct, [
    frac(n + 1, d),
    frac(n > 1 ? n - 1 : n + 2, d),
    frac(n, d + 1),
    frac(d - n, d),
  ]);
  return {
    prompt: "จุดบนเส้นจำนวนนี้ตรงกับเศษส่วนใด?",
    image: nlImage(n, d),
    choices,
    correctIndex: choices.indexOf(correct),
    explanation: `เส้นแบ่งเป็น ${d} ช่องเท่ากัน จุดอยู่ห่างจาก 0 ไป ${n} ช่อง → ${correct}`,
  };
}

/** T2: ให้เศษส่วน เลือกภาพเส้นจำนวนที่แสดงตำแหน่งถูกต้อง */
function q_nl_pickLine(): QuizQuestion {
  const d = randInt(5, 8);
  const n = randInt(1, d - 1);
  const otherMarkers = shuffle(otherNumerators(n, d)).slice(0, 3);
  const correctIdx = randInt(0, 3);
  const choiceImages: QuizImage[] = [];
  let mi = 0;
  for (let i = 0; i < 4; i++) {
    if (i === correctIdx) choiceImages.push(nlImage(n, d));
    else choiceImages.push(nlImage(otherMarkers[mi++], d));
  }
  return {
    prompt: `ภาพใดแสดงตำแหน่งของ ${frac(n, d)} บนเส้นจำนวน?`,
    choiceImages,
    choices: ["", "", "", ""],
    correctIndex: correctIdx,
    explanation: `${frac(n, d)} คือจุดที่นับจาก 0 ไป ${n} ช่อง จากทั้งหมด ${d} ช่องเท่า ๆ กัน`,
  };
}

/** T3: นับจำนวนช่องทั้งหมด (ตัวส่วน) จากภาพ */
function q_nl_totalSegments(): QuizQuestion {
  const d = randInt(3, 8);
  const n = randInt(1, d - 1);
  const correct = String(d);
  const pool = [...new Set([d - 1, d + 1, d + 2, n])].filter((v) => v >= 2 && v !== d).map(String);
  const choices = withChoices(correct, pool, 3);
  return {
    prompt: "เส้นจำนวนนี้แบ่งระยะ 0 ถึง 1 ออกเป็นกี่ช่องเท่า ๆ กัน?",
    image: nlImage(n, d),
    choices,
    correctIndex: choices.indexOf(correct),
    explanation: `นับช่องระหว่าง 0 กับ 1 ได้ ${d} ช่อง → ตัวส่วนของเศษส่วนบนเส้นนี้คือ ${d}`,
  };
}

/** T4: นับช่องจาก 0 ถึงจุด (ตัวเศษ) จากภาพ */
function q_nl_countFromZero(): QuizQuestion {
  const d = randInt(4, 9);
  const n = randInt(1, d - 1);
  const correct = String(n);
  const pool = [...new Set([...otherNumerators(n, d), d])].map(String);
  const choices = withChoices(correct, pool, 3);
  return {
    prompt: "จากภาพ จุดอยู่ห่างจาก 0 กี่ช่อง?",
    image: nlImage(n, d),
    choices,
    correctIndex: choices.indexOf(correct),
    explanation: `นับช่องจาก 0 มาถึงจุดได้ ${n} ช่อง → ตัวเศษของจุดนี้คือ ${n}`,
  };
}

/** T5: จุดใดใกล้ 0 หรือ 1 ที่สุด (ตัวส่วนเดียวกัน เทียบตำแหน่ง) */
function q_nl_closestEdge(): QuizQuestion {
  const d = randInt(5, 9);
  const nums = shuffle(Array.from({ length: d - 1 }, (_, i) => i + 1)).slice(0, 4);
  const wantOne = randInt(0, 1) === 0;
  const target = wantOne ? Math.max(...nums) : Math.min(...nums);
  const correct = frac(target, d);
  const choices = shuffle(nums.map((v) => frac(v, d)));
  return {
    prompt: wantOne
      ? "เศษส่วนใดอยู่ใกล้เลข 1 บนเส้นจำนวนมากที่สุด?"
      : "เศษส่วนใดอยู่ใกล้เลข 0 บนเส้นจำนวนมากที่สุด?",
    choices,
    correctIndex: choices.indexOf(correct),
    explanation: wantOne
      ? `ตัวส่วนเท่ากัน ตัวเศษยิ่งมาก จุดยิ่งอยู่ทางขวา → ${correct} อยู่ใกล้ 1 ที่สุด`
      : `ตัวส่วนเท่ากัน ตัวเศษยิ่งน้อย จุดยิ่งอยู่ทางซ้าย → ${correct} อยู่ใกล้ 0 ที่สุด`,
  };
}

/** T6: ดูจุดบนเส้น แล้วเลือกคำอ่านภาษาไทย */
function q_nl_readPointThai(): QuizQuestion {
  const d = randInt(3, 9);
  const n = randInt(1, d - 1);
  const correct = readThaiFraction(n, d);
  const pool = [
    readThaiFraction(d, n),
    readThaiFraction(n, d + 1),
    ...shuffle(otherNumerators(n, d)).slice(0, 3).map((alt) => readThaiFraction(alt, d)),
  ];
  const choices = withChoices(correct, pool, 3);
  return {
    prompt: "จุดบนเส้นจำนวนนี้อ่านว่าอย่างไร?",
    image: nlImage(n, d),
    choices,
    correctIndex: choices.indexOf(correct),
    explanation: `จุดอยู่ที่ ${frac(n, d)} อ่านว่า “${correct}”`,
  };
}

/** T7: โจทย์บรรยายด้วยคำพูด (ฝึกแปลงคำบรรยายเป็นเศษส่วน) */
function q_nl_word(): QuizQuestion {
  const d = randInt(2, 8);
  const n = randInt(1, d - 1);
  const correct = frac(n, d);
  const choices = buildChoices(correct, [
    frac(n + 1, d),
    frac(n > 1 ? n - 1 : n + 2, d),
    frac(n, d + 1),
    frac(d - n, d),
  ]);
  return {
    prompt: `บนเส้นจำนวน แบ่งระยะ 0 ถึง 1 เป็น ${d} ช่วง แล้วนับไป ${n} ช่วงจาก 0 ได้จุดใด?`,
    choices,
    correctIndex: choices.indexOf(correct),
    explanation: `นับ ${n} ช่วงจาก 0 บนเส้นที่แบ่ง ${d} ส่วน → ${correct}`,
  };
}

const NUMBER_LINE_GENERATORS: Array<() => QuizQuestion> = [
  q_nl_readPoint,
  q_nl_pickLine,
  q_nl_totalSegments,
  q_nl_countFromZero,
  q_nl_closestEdge,
  q_nl_readPointThai,
  q_nl_word,
];

/** สุ่มลำดับประเภทคำถามใหม่ทุกครั้งที่เริ่มชุด (index === 0) แล้วไล่ตามลำดับนั้นไม่ให้ซ้ำแบบในชุดเดียวกัน */
let numberLineOrder: number[] = [];

export function makeNumberLineQuestion(_unused?: unknown, index = 0): QuizQuestion {
  if (index === 0 || numberLineOrder.length !== NUMBER_LINE_GENERATORS.length) {
    numberLineOrder = shuffle(NUMBER_LINE_GENERATORS.map((_, i) => i));
  }
  const typeIdx = numberLineOrder[index % numberLineOrder.length];
  return NUMBER_LINE_GENERATORS[typeIdx]();
}

// ──────────────────────────────────────────────────────────────────────────────
// อ่านเศษส่วนจากภาพ — คลังคำถาม 10 แบบ (ทุกข้อมีภาพประกอบ)
// ──────────────────────────────────────────────────────────────────────────────

/** ภาพหลัก 1 ภาพ ให้เลือกภาพอื่นที่แสดงค่าเศษส่วนเดียวกัน (แม้รูปทรงต่างกัน) */
function q_sameValueMatch(): QuizQuestion {
  const promptShape = randomShape();
  const d = randInt(3, 6);
  const n = randInt(1, d - 1);

  const candidateShapes = shuffle(QUIZ_SHAPES.filter((s) => s !== promptShape)).slice(0, 4);
  const matchIdx = randInt(0, 3);

  let dOther = randInt(3, 6);
  let nOther = randInt(1, dOther - 1);
  let tries = 0;
  while (nOther / dOther === n / d && tries++ < 10) {
    dOther = randInt(3, 6);
    nOther = randInt(1, dOther - 1);
  }

  const choiceImages: QuizImage[] = candidateShapes.map((shape, i) =>
    i === matchIdx ? fractionImage(shape, n, d, "emerald") : fractionImage(shape, nOther, dOther, "pink")
  );

  return {
    prompt: "ภาพใดต่อไปนี้แสดงเศษส่วนเดียวกับภาพหลัก (แม้จะเป็นรูปทรงต่างกัน)?",
    image: fractionImage(promptShape, n, d, "accent"),
    choiceImages,
    choices: ["", "", "", ""],
    correctIndex: matchIdx,
    explanation: `ภาพหลักแสดง ${frac(n, d)} ภาพที่เลือกก็แสดงค่า ${frac(n, d)} เท่ากัน แม้จะวาดเป็นรูปทรงต่างกัน`,
  };
}

/** ภาพหลายรูปรวมกัน (ระบายมากกว่า 1 รูปเต็ม) ให้บอกว่าเป็นเศษเกินเท่าไร */
function q_improperFromMultiImage(): QuizQuestion {
  const d = randInt(2, 5);
  const total = d + randInt(1, 2 * d - 1); // รับประกันว่า total > d และ shapeCount ไม่เกิน 3
  const correct = frac(total, d);
  const choices = buildChoices(correct, [
    frac(total + 1, d), frac(total - 1, d), frac(total, d + 1), frac(total + d, d),
  ]);
  return {
    prompt: "ภาพนี้มีหลายรูปรวมกัน แสดงเศษเกินข้อใด?",
    image: { kind: "multiFraction", shape: randomShape(), denominator: d, totalNumerator: total, tone: randomTone() },
    choices,
    correctIndex: choices.indexOf(correct),
    explanation: `นับส่วนที่ระบายทั้งหมด = ${total} ส่วน จากที่แต่ละรูปแบ่งไว้ ${d} ส่วน → เศษเกิน ${correct} (ตัวเศษมากกว่าตัวส่วน)`,
  };
}

/** ภาพหลายรูปรวมกัน ให้บอกว่าเป็นจำนวนคละเท่าไร */
function q_mixedFromMultiImage(): QuizQuestion {
  const d = randInt(2, 5);
  const whole = randInt(1, 3);
  const r = randInt(1, d - 1);
  const total = whole * d + r;
  const correct = `${whole} ${frac(r, d)}`;
  const alt1 = `${whole + 1} ${frac(r, d)}`;
  const alt2 = `${Math.max(1, whole - 1)} ${frac(r, d)}`;
  const altR = r > 1 ? r - 1 : Math.min(r + 1, d - 1);
  const alt3 = `${whole} ${frac(altR, d)}`;
  const choices = shuffle([...new Set([correct, alt1, alt2, alt3])]);
  return {
    prompt: "ภาพนี้มีหลายรูปรวมกัน แสดงจำนวนคละข้อใด?",
    image: { kind: "multiFraction", shape: randomShape(), denominator: d, totalNumerator: total, tone: randomTone() },
    choices,
    correctIndex: choices.indexOf(correct),
    explanation: `รวมส่วนที่ระบายทั้งหมด = ${total} ส่วน = ${whole} เต็ม กับเศษ ${r} ส่วน จาก ${d} → จำนวนคละ ${correct}`,
  };
}

const FRACTION_FROM_IMAGE_GENERATORS: Array<() => QuizQuestion> = [
  q_imageToFraction,
  q_imageToRead,
  q_whichUnequal,
  q_wordProblem,
  q_numeratorFromImage,
  q_denominatorFromImage,
  q_oddOneOut,
  q_sameValueMatch,
  q_improperFromMultiImage,
  q_mixedFromMultiImage,
];

/** สุ่มลำดับประเภทคำถามใหม่ทุกครั้งที่เริ่มชุด (index === 0) แล้วไล่ตามลำดับนั้นไม่ให้ซ้ำแบบในชุดเดียวกัน */
let fractionFromImageOrder: number[] = [];

export function makeFractionFromImageQuestion(_unused?: unknown, index = 0): QuizQuestion {
  if (index === 0 || fractionFromImageOrder.length !== FRACTION_FROM_IMAGE_GENERATORS.length) {
    fractionFromImageOrder = shuffle(FRACTION_FROM_IMAGE_GENERATORS.map((_, i) => i));
  }
  const typeIdx = fractionFromImageOrder[index % fractionFromImageOrder.length];
  return FRACTION_FROM_IMAGE_GENERATORS[typeIdx]();
}

// ──────────────────────────────────────────────────────────────────────────────
// เปรียบเทียบเศษส่วน
// ──────────────────────────────────────────────────────────────────────────────
/** สุ่มเศษส่วนแท้ 4 ตัวที่ค่าไม่ซ้ำกัน (ห่างกันพอให้ตัดสินได้ชัด) */
function distinctFractionPool(count: number): Array<{ n: number; d: number; val: number }> {
  const pool: Array<{ n: number; d: number; val: number }> = [];
  let guard = 0;
  while (pool.length < count && guard++ < 200) {
    const d = randInt(2, 8);
    const n = randInt(1, d - 1);
    const val = n / d;
    if (!pool.some((f) => Math.abs(f.val - val) < 0.07)) pool.push({ n, d, val });
  }
  return pool;
}

/** T1/T2: ดูภาพแท่ง 4 ภาพ เลือกอันที่มากสุด/น้อยสุด */
function q_cmp_extremeImage(): QuizQuestion {
  const pool = distinctFractionPool(4);
  const wantMax = randInt(0, 1) === 0;
  const sorted = [...pool].sort((a, b) => b.val - a.val);
  const target = wantMax ? sorted[0] : sorted[sorted.length - 1];
  const label = wantMax ? "มากที่สุด" : "น้อยที่สุด";
  const choiceImages: QuizImage[] = pool.map((f) => ({ kind: "fraction", shape: "bar", numerator: f.n, denominator: f.d, tone: randomTone() }));
  const correctIndex = pool.findIndex((f) => f === target);
  return {
    prompt: `ภาพใดมีค่า${label}?`,
    choiceImages,
    choices: pool.map(() => ""),
    correctIndex,
    explanation: `แท่งที่ระบาย${wantMax ? "ยาว" : "สั้น"}ที่สุดคือ ${frac(target.n, target.d)} จึงมีค่า${label}`,
  };
}

/** T3: เทียบเศษส่วน 2 ตัว เลือกเครื่องหมาย > < = */
function q_cmp_sign(): QuizQuestion {
  const d1 = randInt(2, 8);
  const n1 = randInt(1, d1 - 1);
  const d2 = randInt(2, 8);
  const n2 = randInt(1, d2 - 1);
  const v1 = n1 / d1;
  const v2 = n2 / d2;
  const correct = v1 > v2 ? ">" : v1 < v2 ? "<" : "=";
  const choices = [">", "<", "="];
  return {
    prompt: `เติมเครื่องหมายให้ถูกต้อง: ${frac(n1, d1)} ___ ${frac(n2, d2)}`,
    choices,
    correctIndex: choices.indexOf(correct),
    explanation: `${frac(n1, d1)} ${correct} ${frac(n2, d2)} — ทำตัวส่วนให้เท่ากันหรือนึกภาพแท่งก็ได้`,
  };
}

/** T4: เทียบเศษส่วนกับ 1/2 (ใช้ครึ่งเป็นหลัก) */
function q_cmp_benchmark(): QuizQuestion {
  let d = randInt(3, 9);
  let n = randInt(1, d - 1);
  let guard = 0;
  while (n / d === 0.5 && guard++ < 20) {
    d = randInt(3, 9);
    n = randInt(1, d - 1);
  }
  const correct = n / d > 0.5 ? "มากกว่า 1/2" : "น้อยกว่า 1/2";
  const choices = shuffle(["มากกว่า 1/2", "น้อยกว่า 1/2", "เท่ากับ 1/2"]);
  return {
    prompt: `เศษส่วนนี้เทียบกับครึ่งหนึ่ง (1/2) เป็นอย่างไร?`,
    image: { kind: "fraction", shape: randomShape(), numerator: n, denominator: d, tone: randomTone() },
    choices,
    correctIndex: choices.indexOf(correct),
    explanation: `ครึ่งหนึ่งของ ${d} คือ ${d / 2} — ตัวเศษ ${n} ${n > d / 2 ? "มากกว่า" : "น้อยกว่า"}ครึ่ง จึง${correct}`,
  };
}

/** T5: เรียงจากน้อยไปมาก เลือกลำดับที่ถูก (ข้อความ) */
function q_cmp_order(): QuizQuestion {
  const pool = distinctFractionPool(3);
  const asc = [...pool].sort((a, b) => a.val - b.val);
  const correct = asc.map((f) => frac(f.n, f.d)).join(" , ");
  const wrongs = new Set<string>();
  let guard = 0;
  while (wrongs.size < 3 && guard++ < 30) {
    const s = shuffle(pool).map((f) => frac(f.n, f.d)).join(" , ");
    if (s !== correct) wrongs.add(s);
  }
  const choices = shuffle([correct, ...Array.from(wrongs).slice(0, 3)]);
  return {
    prompt: "ข้อใดเรียงเศษส่วนจากน้อยไปมากได้ถูกต้อง?",
    choices,
    correctIndex: choices.indexOf(correct),
    explanation: `เรียงจากน้อยไปมากคือ ${correct}`,
  };
}

/** T6: หาตัวมากสุด/น้อยสุดแบบข้อความ (4 ตัวเลือกเศษส่วน) */
function q_cmp_extremeText(): QuizQuestion {
  const pool = distinctFractionPool(4);
  const wantMax = randInt(0, 1) === 0;
  const sorted = [...pool].sort((a, b) => b.val - a.val);
  const target = wantMax ? sorted[0] : sorted[sorted.length - 1];
  const label = wantMax ? "มากที่สุด" : "น้อยที่สุด";
  const correct = frac(target.n, target.d);
  const choices = pool.map((f) => frac(f.n, f.d));
  return {
    prompt: `ข้อใดต่อไปนี้มีค่า${label}?`,
    choices,
    correctIndex: choices.indexOf(correct),
    explanation: `${correct} มีค่า${label}ในสี่ตัวเลือก`,
  };
}

const COMPARE_GENERATORS: Array<() => QuizQuestion> = [
  q_cmp_extremeImage,
  q_cmp_sign,
  q_cmp_benchmark,
  q_cmp_order,
  q_cmp_extremeText,
  q_cmp_extremeImage,
];

let compareOrder: number[] = [];

export function makeCompareQuestion(_unused?: unknown, index = 0): QuizQuestion {
  if (index === 0 || compareOrder.length !== COMPARE_GENERATORS.length) {
    compareOrder = shuffle(COMPARE_GENERATORS.map((_, i) => i));
  }
  const typeIdx = compareOrder[index % compareOrder.length];
  return COMPARE_GENERATORS[typeIdx]();
}

// ──────────────────────────────────────────────────────────────────────────────
// จำนวนคละและเศษเกิน
// ──────────────────────────────────────────────────────────────────────────────
export function makeMixedImproperQuestion(): QuizQuestion {
  const toMixed = randInt(0, 1) === 0;
  const d = randInt(2, 6);
  const whole = randInt(1, 4);
  const r = randInt(1, d - 1);
  const num = whole * d + r;

  if (toMixed) {
    const correct = `${whole} ${frac(r, d)}`;
    const alt1 = `${whole + 1} ${frac(r, d)}`;
    const alt2 = `${Math.max(1, whole - 1)} ${frac(r, d)}`;
    const alt3 = `${whole} ${frac(Math.min(r + 1, d - 1), d)}`;
    const choices = shuffle([correct, alt1, alt2, alt3]);
    return {
      prompt: `แปลง ${frac(num, d)} เป็นจำนวนคละ`,
      choices,
      correctIndex: choices.indexOf(correct),
      explanation: `${num} ÷ ${d} = ${whole} เศษ ${r} → จำนวนคละ = ${correct}`,
    };
  } else {
    const correct = frac(num, d);
    const choices = buildChoices(correct, [
      frac(num + 1, d), frac(num - 1, d),
      frac(whole * r, d), frac(whole + r, d),
    ]);
    return {
      prompt: `แปลง ${whole} และ ${frac(r, d)} เป็นเศษเกิน`,
      choices,
      correctIndex: choices.indexOf(correct),
      explanation: `(${whole} × ${d}) + ${r} = ${num} → ได้ ${correct}`,
    };
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// บวกเศษส่วน
// ──────────────────────────────────────────────────────────────────────────────
export function makeAddQuestion(): QuizQuestion {
  const den = randInt(2, 9);
  const a = randInt(1, Math.max(1, den - 2));
  const b = randInt(1, Math.max(1, den - a - 1));
  const sum = a + b;
  const correct = frac(sum, den);
  const choices = buildChoices(correct, [
    frac(sum + 1, den), frac(sum + 2, den),
    frac(sum, den + 1), frac(a, b),
    frac(sum - 1 > 0 ? sum - 1 : sum + 3, den),
  ]);
  return {
    prompt: `${frac(a, den)} + ${frac(b, den)} = ?`,
    choices,
    correctIndex: choices.indexOf(correct),
    explanation: `ตัวส่วนเท่ากัน → บวกตัวเศษ: ${a} + ${b} = ${sum}, ตัวส่วนคงเดิม ${den} → ได้ ${correct}`,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// ลบเศษส่วน
// ──────────────────────────────────────────────────────────────────────────────
export function makeSubtractQuestion(): QuizQuestion {
  const den = randInt(2, 9);
  const b = randInt(1, Math.max(1, den - 2));
  const a = b + randInt(1, Math.max(1, den - b));
  const diff = a - b;
  const correct = frac(diff, den);
  const choices = buildChoices(correct, [
    frac(diff + 1, den), frac(diff + 2, den),
    frac(a + b, den), frac(diff, den + 1),
  ]);
  return {
    prompt: `${frac(a, den)} - ${frac(b, den)} = ?`,
    choices,
    correctIndex: choices.indexOf(correct),
    explanation: `ตัวส่วนเท่ากัน → ลบตัวเศษ: ${a} - ${b} = ${diff}, ตัวส่วนคงเดิม ${den} → ได้ ${correct}`,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// คูณเศษส่วน
// ──────────────────────────────────────────────────────────────────────────────
export function makeMultiplyQuestion(): QuizQuestion {
  const n1 = randInt(1, 3), d1 = randInt(2, 5);
  const n2 = randInt(1, 3), d2 = randInt(2, 5);
  const rn = n1 * n2, rd = d1 * d2;
  const correct = frac(rn, rd);
  const choices = buildChoices(correct, [
    frac(rn + 1, rd), frac(rn + 2, rd),
    frac(n1 + n2, d1 + d2), frac(n1 * d2, d1 * n2),
    frac(rn, rd + 1),
  ]);
  return {
    prompt: `${frac(n1, d1)} × ${frac(n2, d2)} = ?`,
    choices,
    correctIndex: choices.indexOf(correct),
    explanation: `คูณเศษ×เศษ: ${n1}×${n2}=${rn}, ส่วน×ส่วน: ${d1}×${d2}=${rd} → ได้ ${correct}`,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// หารเศษส่วน
// ──────────────────────────────────────────────────────────────────────────────
export function makeDivideQuestion(): QuizQuestion {
  const n1 = randInt(1, 4), d1 = randInt(2, 5);
  const n2 = randInt(1, 3), d2 = randInt(2, 5);
  const rn = n1 * d2, rd = d1 * n2;
  const correct = frac(rn, rd);
  const choices = buildChoices(correct, [
    frac(rn + 1, rd), frac(rn + 2, rd),
    frac(n1 * n2, d1 * d2), frac(rd, rn),
    frac(rn, rd + 1),
  ]);
  return {
    prompt: `${frac(n1, d1)} ÷ ${frac(n2, d2)} = ?`,
    choices,
    correctIndex: choices.indexOf(correct),
    explanation: `กลับตัวหลัง แล้วคูณ: ${frac(n1, d1)} × ${frac(d2, n2)} → ${n1}×${d2}=${rn}, ${d1}×${n2}=${rd} ได้ ${correct}`,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// เศษส่วนที่เท่ากัน
// ──────────────────────────────────────────────────────────────────────────────
export function makeEquivalentQuestion(): QuizQuestion {
  const n = randInt(1, 4);
  const d = randInt(n + 1, n + 6);
  const k = randInt(2, 5);
  const n2 = n * k, d2 = d * k;
  const correct = frac(n2, d2);
  const choices = buildChoices(correct, [
    frac(n2 + k, d2), frac(n2 - k > 0 ? n2 - k : n2 + 2 * k, d2),
    frac(n + k, d + k), frac(n2, d2 + k),
  ]);
  return {
    prompt: `${frac(n, d)} = ?/${d2}   ตัวเศษที่หายไปคือเท่าไร?  (คำตอบอยู่ในรูป ?/${d2})`,
    choices,
    correctIndex: choices.indexOf(correct),
    explanation: `คูณบนล่างด้วย ${k}: ${n}×${k}=${n2}, ${d}×${k}=${d2} → ได้ ${correct}`,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// ย่อเศษส่วน
// ──────────────────────────────────────────────────────────────────────────────
export function makeSimplifyQuestion(): QuizQuestion {
  const k = randInt(2, 4);
  let sn = randInt(1, 4), sd = randInt(sn + 1, 8);
  // ensure sn and sd are coprime
  let tries = 0;
  while (gcd(sn, sd) > 1 && tries++ < 20) {
    sd = randInt(sn + 1, 8);
  }
  const n = sn * k, d = sd * k;
  const correct = frac(sn, sd);
  const choices = buildChoices(correct, [
    frac(n, d),
    frac(sn + 1, sd), frac(sn, sd + 1),
    frac(sn > 1 ? sn - 1 : sn + 2, sd),
  ]);
  return {
    prompt: `ย่อ ${frac(n, d)} ให้อยู่ในรูปอย่างต่ำ`,
    choices,
    correctIndex: choices.indexOf(correct),
    explanation: `หาร ${n} และ ${d} ด้วย ${k} พร้อมกัน → ${n}÷${k}=${sn}, ${d}÷${k}=${sd} ได้ ${correct}`,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// ประเภทของเศษส่วน (เศษส่วนแท้ / เศษเกิน / จำนวนคละ) — คลังคำถาม 7 แบบ
// ──────────────────────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<FractionKind, string> = {
  proper: "เศษส่วนแท้",
  improper: "เศษเกิน",
  mixed: "จำนวนคละ",
};
const ALL_TYPE_LABELS = Object.values(TYPE_LABEL);

/** ภาพหลายรูปรวมกัน ให้จำแนกว่าเป็นประเภทใด */
function q_classifyFromImage(): QuizQuestion {
  const c = generateDrawChallenge(["proper", "improper", "mixed"]);
  const correct = TYPE_LABEL[c.kind];
  const choices = shuffle(ALL_TYPE_LABELS);
  const notation =
    c.kind === "mixed"
      ? (() => {
          const m = toMixedNumber(c.numerator, c.denominator);
          return `${m.whole} ${frac(m.numerator, m.denominator)}`;
        })()
      : frac(c.numerator, c.denominator);
  return {
    // หมายเหตุ: ภาพหลายรูปรวมกันเพียงอย่างเดียวแยกเศษเกิน/จำนวนคละไม่ได้ (ค่าและภาพเหมือนกันทุกประการ ต่างกันแค่วิธีเขียน)
    // จึงต้องใส่ตัวเลขที่เขียนจริงลงในโจทย์ด้วยเสมอ
    prompt: `ภาพและตัวเลข ${notation} นี้ เป็นเศษส่วนประเภทใด?`,
    image: { kind: "multiFraction", shape: randomShape(), denominator: c.denominator, totalNumerator: c.numerator, tone: randomTone() },
    choices,
    correctIndex: choices.indexOf(correct),
    explanation: `${notation} → เป็น${correct}`,
  };
}

/** เศษส่วนแท้/เศษเกิน แบบข้อความล้วน ให้จำแนกประเภท */
function q_classifyFromText(): QuizQuestion {
  const kind = randInt(0, 1) === 0 ? "proper" : "improper";
  const c = generateDrawChallenge([kind]);
  const correct = TYPE_LABEL[c.kind];
  const choices = shuffle(ALL_TYPE_LABELS);
  return {
    prompt: `${frac(c.numerator, c.denominator)} เป็นเศษส่วนประเภทใด?`,
    choices,
    correctIndex: choices.indexOf(correct),
    explanation:
      c.kind === "proper"
        ? `ตัวเศษ (${c.numerator}) น้อยกว่าตัวส่วน (${c.denominator}) → เป็นเศษส่วนแท้`
        : `ตัวเศษ (${c.numerator}) มากกว่าหรือเท่ากับตัวส่วน (${c.denominator}) → เป็นเศษเกิน`,
  };
}

/** จำนวนคละแบบข้อความล้วน ให้จำแนกประเภท */
function q_classifyMixedFromText(): QuizQuestion {
  const c = generateDrawChallenge(["mixed"]);
  const mixed = toMixedNumber(c.numerator, c.denominator);
  const correct = TYPE_LABEL.mixed;
  const choices = shuffle(ALL_TYPE_LABELS);
  return {
    prompt: `${mixed.whole} ${frac(mixed.numerator, mixed.denominator)} เป็นเศษส่วนประเภทใด?`,
    choices,
    correctIndex: choices.indexOf(correct),
    explanation: `มีจำนวนเต็ม (${mixed.whole}) รวมกับเศษส่วนแท้ (${frac(mixed.numerator, mixed.denominator)}) → เป็นจำนวนคละ`,
  };
}

/** ให้เลือกเศษส่วนที่เป็นประเภทที่กำหนด จาก 4 ตัวเลือก (คนละประเภทกัน) */
function q_pickTypeFromChoices(): QuizQuestion {
  const targetKind = (["proper", "improper", "mixed"] as FractionKind[])[randInt(0, 2)];
  const otherKinds = (["proper", "improper", "mixed"] as FractionKind[]).filter((k) => k !== targetKind);

  function strFor(kind: FractionKind): string {
    const c = generateDrawChallenge([kind]);
    if (kind === "mixed") {
      const m = toMixedNumber(c.numerator, c.denominator);
      return `${m.whole} ${frac(m.numerator, m.denominator)}`;
    }
    return frac(c.numerator, c.denominator);
  }

  const correctStr = strFor(targetKind);
  const distractors = [strFor(otherKinds[0]), strFor(otherKinds[1]), strFor(targetKind)];
  const choices = shuffle([correctStr, ...distractors]);

  return {
    prompt: `ข้อใดต่อไปนี้เป็น${TYPE_LABEL[targetKind]}?`,
    choices,
    correctIndex: choices.indexOf(correctStr),
    explanation: `${correctStr} เป็น${TYPE_LABEL[targetKind]}`,
  };
}

/** นิยามเศษส่วนแท้ */
function q_defineProper(): QuizQuestion {
  const correct = "ตัวเศษน้อยกว่าตัวส่วน มีค่าน้อยกว่า 1";
  const choices = shuffle([correct, "ตัวเศษมากกว่าหรือเท่ากับตัวส่วน มีค่ามากกว่าหรือเท่ากับ 1", "มีจำนวนเต็มรวมกับเศษส่วน", "ตัวเศษกับตัวส่วนเท่ากันเสมอ"]);
  return {
    prompt: "เศษส่วนแท้ คือเศษส่วนแบบใด?",
    choices,
    correctIndex: choices.indexOf(correct),
    explanation: "เศษส่วนแท้ คือเศษส่วนที่ตัวเศษน้อยกว่าตัวส่วน จึงมีค่าน้อยกว่า 1 หน่วยเสมอ",
  };
}

/** นิยามเศษเกิน */
function q_defineImproper(): QuizQuestion {
  const correct = "ตัวเศษมากกว่าหรือเท่ากับตัวส่วน มีค่ามากกว่าหรือเท่ากับ 1";
  const choices = shuffle([correct, "ตัวเศษน้อยกว่าตัวส่วน มีค่าน้อยกว่า 1", "มีจำนวนเต็มรวมกับเศษส่วน", "ตัวส่วนต้องเป็นเลขคู่เท่านั้น"]);
  return {
    prompt: "เศษเกิน คือเศษส่วนแบบใด?",
    choices,
    correctIndex: choices.indexOf(correct),
    explanation: "เศษเกิน คือเศษส่วนที่ตัวเศษมากกว่าหรือเท่ากับตัวส่วน จึงมีค่ามากกว่าหรือเท่ากับ 1 หน่วยเสมอ",
  };
}

/** นิยามจำนวนคละ */
function q_defineMixed(): QuizQuestion {
  const correct = "มีจำนวนเต็มรวมกับเศษส่วนแท้";
  const choices = shuffle([correct, "ตัวเศษน้อยกว่าตัวส่วนเสมอ", "ตัวเศษกับตัวส่วนหารกันลงตัว", "มีแต่ตัวเศษ ไม่มีตัวส่วน"]);
  return {
    prompt: "จำนวนคละ คือเศษส่วนแบบใด?",
    choices,
    correctIndex: choices.indexOf(correct),
    explanation: "จำนวนคละ คือจำนวนที่มีจำนวนเต็มรวมกับเศษส่วนแท้ เช่น 1 กับ 1/4 รวมกันเป็น 1 1/4",
  };
}

const FRACTION_TYPES_GENERATORS: Array<() => QuizQuestion> = [
  q_classifyFromImage,
  q_classifyFromText,
  q_classifyMixedFromText,
  q_pickTypeFromChoices,
  q_defineProper,
  q_defineImproper,
  q_defineMixed,
];

/** สุ่มลำดับประเภทคำถามใหม่ทุกครั้งที่เริ่มชุด (index === 0) แล้วไล่ตามลำดับนั้นไม่ให้ซ้ำแบบในชุดเดียวกัน */
let fractionTypesOrder: number[] = [];

export function makeFractionTypesQuestion(_unused?: unknown, index = 0): QuizQuestion {
  if (index === 0 || fractionTypesOrder.length !== FRACTION_TYPES_GENERATORS.length) {
    fractionTypesOrder = shuffle(FRACTION_TYPES_GENERATORS.map((_, i) => i));
  }
  const typeIdx = fractionTypesOrder[index % fractionTypesOrder.length];
  return FRACTION_TYPES_GENERATORS[typeIdx]();
}
