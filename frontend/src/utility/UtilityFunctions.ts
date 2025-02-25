export function sumArray(numbers: number[]): number {
  return numbers.reduce((acc, curr) => acc + curr, 0);
}

export function addCommaToNumber(num: number): string {
  let str = num.toString();
  const pattern = /(-?\d+)(\d{3})/;
  while (pattern.test(str))
    str = str.replace(pattern, "$1,$2");
  return str;
}
