export const isInInterval = (num: number, lower: number, upper: number) => {
  return !isNaN(num) && !isNaN(lower) && !isNaN(upper) && lower <= upper && num >= lower && num <= upper;
};
