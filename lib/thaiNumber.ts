const THAI_DIGITS = ["", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
const THAI_PLACES = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน", "ล้าน"];

export function readThaiNumber(value: number): string {
  if (!Number.isFinite(value)) {
    return "";
  }

  const n = Math.floor(Math.abs(value));
  if (n === 0) {
    return "ศูนย์";
  }

  const digits = String(n).split("").map(Number);
  const length = digits.length;
  let result = "";

  for (let i = 0; i < length; i += 1) {
    const digit = digits[i];
    const place = length - i - 1;

    if (digit === 0) {
      continue;
    }

    if (place === 1) {
      if (digit === 1) {
        result += "สิบ";
      } else if (digit === 2) {
        result += "ยี่สิบ";
      } else {
        result += `${THAI_DIGITS[digit]}สิบ`;
      }
    } else if (place === 0) {
      result += digit === 1 && length > 1 ? "เอ็ด" : THAI_DIGITS[digit];
    } else {
      result += `${THAI_DIGITS[digit]}${THAI_PLACES[place]}`;
    }
  }

  return result;
}

export function readThaiFraction(numerator: number, denominator: number): string {
  return `เศษ${readThaiNumber(numerator)}ส่วน${readThaiNumber(denominator)}`;
}
