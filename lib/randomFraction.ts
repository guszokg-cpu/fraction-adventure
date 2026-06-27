/** Random integer in [min, max] inclusive */
export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Shuffle array (Fisher-Yates), returns new array */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Random improper fraction — remainder is always ≥ 1 (never evenly divisible) */
export function randomImproper(denMin = 2, denMax = 7) {
  const den = randInt(denMin, denMax);
  const whole = randInt(1, 4);
  const remainder = randInt(1, Math.max(1, den - 1));
  return { num: whole * den + remainder, den };
}

/** Random mixed number where 1 ≤ num < den */
export function randomMixed(denMin = 2, denMax = 7) {
  const whole = randInt(1, 4);
  const den = randInt(denMin, denMax);
  const num = randInt(1, Math.max(1, den - 1));
  return { whole, num, den };
}

/** Random proper fraction where 1 ≤ num < den */
export function randomProper(denMin = 2, denMax = 9) {
  const den = randInt(denMin, denMax);
  const num = randInt(1, den - 1);
  return { num, den };
}

export type MixedOpt = { whole: number; num: number; den: number; correct: boolean };

/**
 * 3 shuffled mixed-number options (1 correct + 2 distinct wrong).
 * Wrong answers differ by ±1/2 in whole-part or fraction-part.
 */
export function wrongMixedOpts(whole: number, num: number, den: number): MixedOpt[] {
  const correct: MixedOpt = { whole, num, den, correct: true };
  const used = new Set([`${whole},${num}`]);
  const pool: { whole: number; num: number }[] = [];

  // Vary the whole part
  for (const dw of [-2, -1, 1, 2]) {
    const w = whole + dw;
    if (w > 0) pool.push({ whole: w, num });
  }
  // Vary the fraction part (clamped to valid range, deduped)
  for (const dn of [-2, -1, 1, 2]) {
    const n = Math.max(0, Math.min(num + dn, den - 1));
    const key = `${whole},${n}`;
    if (!used.has(key)) { used.add(key); pool.push({ whole, num: n }); }
  }

  const wrongs = shuffle(pool).slice(0, 2).map(c => ({ ...c, den, correct: false }) as MixedOpt);
  return shuffle([correct, ...wrongs]);
}

export type ImproperOpt = { num: number; den: number; correct: boolean };

/**
 * 3 shuffled improper-fraction options (1 correct + 2 distinct wrong).
 * Wrong answers differ by ±1–3 in numerator, must still be > denominator.
 */
export function wrongImproperOpts(resultNum: number, den: number): ImproperOpt[] {
  const correct: ImproperOpt = { num: resultNum, den, correct: true };
  const pool = [-3, -2, -1, 1, 2, 3]
    .map(d => resultNum + d)
    .filter(n => n > den && n > 0);
  const wrongs = shuffle(pool).slice(0, 2).map(n => ({ num: n, den, correct: false }) as ImproperOpt);
  return shuffle([correct, ...wrongs]);
}
