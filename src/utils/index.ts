export const isInInterval = (num: number, lower: number, upper: number) => {
  return !isNaN(num) && !isNaN(lower) && !isNaN(upper) && lower <= upper && num >= lower && num <= upper;
};

export const getClientX = (e: MouseEvent | TouchEvent): number => {
  if (e instanceof MouseEvent) {
    return e.clientX;
  }
  return e.changedTouches && e.changedTouches[0] && e.changedTouches[0].clientX;
};

export const getClientY = (e: MouseEvent | TouchEvent): number => {
  if (e instanceof MouseEvent) {
    return e.clientY;
  }
  return e.changedTouches && e.changedTouches[0] && e.changedTouches[0].clientY;
};
