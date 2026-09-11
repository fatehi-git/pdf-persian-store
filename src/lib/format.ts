const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

/** Convert Latin digits to Persian digits. */
export function toFa(value: string | number): string {
  return String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

/** Convert Persian/Arabic digits back to Latin (for payment inputs). */
export function toEn(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

/** Format a number with Persian thousand separators + digits. */
export function faNumber(value: number): string {
  return toFa(value.toLocaleString("en-US"));
}

/** Price in تومان, e.g. ۲۴۸٬۰۰۰ تومان */
export function faToman(value: number): string {
  return `${faNumber(value)} تومان`;
}

/** Gregorian → Jalali (Solar Hijri) date via Intl. */
export function faDate(ts: number): string {
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(ts));
}

export function faDateTime(ts: number): string {
  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ts));
}

/** "۳ روز پیش" style relative time. */
export function faTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "همین حالا";
  if (minutes < 60) return `${toFa(minutes)} دقیقه پیش`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${toFa(hours)} ساعت پیش`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${toFa(days)} روز پیش`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${toFa(months)} ماه پیش`;
  return `${toFa(Math.floor(months / 12))} سال پیش`;
}

/** Group Latin digits into "#### #### #### ####". */
export function groupCardNumber(digits: string): string {
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

/** Luhn check for the simulated card validation. */
export function luhnValid(digits: string): boolean {
  const arr = digits.split("").reverse().map(Number);
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    if (i % 2 === 1) {
      arr[i] *= 2;
      if (arr[i] > 9) arr[i] -= 9;
    }
    sum += arr[i];
  }
  return sum % 10 === 0;
}
