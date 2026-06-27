import { randInt, shuffle } from "./randomFraction";

export type QuizQuestion = {
  prompt: string;
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

// ──────────────────────────────────────────────────────────────────────────────
// รู้จักเศษส่วน
// ──────────────────────────────────────────────────────────────────────────────
export function makeFractionIntroQuestion(): QuizQuestion {
  const d = randInt(2, 8);
  const n = randInt(1, d - 1);
  const correct = frac(n, d);
  const choices = buildChoices(correct, [
    frac(d, n),
    frac(d - n, d),
    frac(n + 1, d),
    frac(n, d + 1),
    frac(n > 1 ? n - 1 : n + 2, d),
  ]);
  return {
    prompt: `แบ่งสิ่งของออกเป็น ${d} ส่วนเท่า ๆ กัน แล้วเลือก ${n} ส่วน เขียนเป็นเศษส่วนว่าอย่างไร?`,
    choices,
    correctIndex: choices.indexOf(correct),
    explanation: `ตัวเศษ = ส่วนที่เลือก (${n}), ตัวส่วน = ทั้งหมด (${d}) → ได้ ${correct}`,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// เส้นจำนวน
// ──────────────────────────────────────────────────────────────────────────────
export function makeNumberLineQuestion(): QuizQuestion {
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

// ──────────────────────────────────────────────────────────────────────────────
// อ่านเศษส่วนจากภาพ
// ──────────────────────────────────────────────────────────────────────────────
export function makeFractionFromImageQuestion(): QuizQuestion {
  const d = randInt(2, 8);
  const n = randInt(1, d - 1);
  const correct = frac(n, d);
  const choices = buildChoices(correct, [
    frac(d - n, d),
    frac(n + 1, d),
    frac(d, n),
    frac(n, d + 1),
    frac(n > 1 ? n - 1 : n + 2, d),
  ]);
  return {
    prompt: `ภาพแสดงรูปทรงทั้งหมด ${d} ชิ้น ระบายสี ${n} ชิ้น เศษส่วนที่ระบายคือ?`,
    choices,
    correctIndex: choices.indexOf(correct),
    explanation: `ตัวเศษ = ที่ระบาย (${n}), ตัวส่วน = ทั้งหมด (${d}) → ${correct}`,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// เปรียบเทียบเศษส่วน
// ──────────────────────────────────────────────────────────────────────────────
export function makeCompareQuestion(): QuizQuestion {
  const pool: Array<{ n: number; d: number; val: number }> = [];
  while (pool.length < 4) {
    const d = randInt(2, 8);
    const n = randInt(1, d - 1);
    const val = n / d;
    if (!pool.some((f) => Math.abs(f.val - val) < 0.06)) {
      pool.push({ n, d, val });
    }
  }
  const sorted = [...pool].sort((a, b) => b.val - a.val);
  const wantMax = randInt(0, 1) === 0;
  const target = wantMax ? sorted[0] : sorted[sorted.length - 1];
  const label = wantMax ? "มากที่สุด" : "น้อยที่สุด";
  const correct = frac(target.n, target.d);
  const choices = pool.map((f) => frac(f.n, f.d));
  return {
    prompt: `ข้อใดต่อไปนี้มีค่า${label}?`,
    choices,
    correctIndex: choices.indexOf(correct),
    explanation: `${correct} ≈ ${target.val.toFixed(2)} ซึ่ง${label}ในสี่ตัวเลือก`,
  };
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
