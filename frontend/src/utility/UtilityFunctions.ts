export const BLANK_SPACE = "\u00A0";

export function sumArray(numbers: number[]): number {
  return numbers.reduce((acc, curr) => acc + curr, 0);
}

export function addCommaToNumber(num: number | null): string {
  if (num == null) return '';
  let str = num.toString();
  const pattern = /(-?\d+)(\d{3})/;
  while (pattern.test(str))
    str = str.replace(pattern, "$1,$2");
  return str;
}

export function yearToYearAndMonth(years: number | null): string {
  if (years == null) return '';
  const wholeYears = Math.floor(years);
  const months = Math.round((years - wholeYears) * 12);

  const yearLabel = wholeYears === 1 ? "year" : "years";
  const monthLabel = months === 1 ? "month" : "months";

  if (wholeYears === 0) return `${months} ${monthLabel}`;
  if (months === 0) return `${wholeYears} ${yearLabel}`;
  return `${wholeYears} ${yearLabel}, ${months} ${monthLabel}`;
}
