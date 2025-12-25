import { timeInterval as d3TimeInterval } from "d3-time";

const rounding = Math.ceil;

export const timeQuarter = d3TimeInterval(
  (date) => {
    date.setDate(1);
    date.setMonth(4 * rounding(date.getMonth() / 4));
    date.setHours(0, 0, 0, 0);
  },
  (date, step) => {
    date.setMonth(date.getMonth() + 3 * step);
  },
  (start, end) => {
    return end.getMonth() - start.getMonth() + (end.getFullYear() - start.getFullYear()) * 4;
  },
  (date) => {
    return 4 * rounding(date.getMonth() / 4);
  }
);
