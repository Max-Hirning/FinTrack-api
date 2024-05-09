export function toFixedWithoutRounding(num: number, fixed: number): number {
  const re = new RegExp('^-?\\d+(?:\.\\d{0,' + (fixed || -1) + '})?');
  return parseFloat(num.toString().match(re)[0]);
}