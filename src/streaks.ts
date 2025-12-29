import { group as d3Group, min as d3Min, max as d3Max } from "d3-array";
import { timeDay as d3TimeDay, utcDay as d3UtcDay } from "d3-time";
import { Row } from "./data";

export interface Streak {
  /**
   * inclusive start
   */
  start: Date;
  /**
   * inclusive end
   */
  end: Date;
  days: number;
  coins: number;
}

export function toStreaks(rows: Row[]): Streak[] {
  const found: Streak[] = [];
  const interval = d3UtcDay;
  const byDay = d3Group(rows, (row) => interval.floor(row.timestamp));

  let start: Date | null = null;
  let days = 0;
  let coins = 0;

  interval
    .range(d3Min(byDay.keys()) as Date, interval.offset(d3Max(byDay.keys()) as Date, 1), 1)
    .forEach((day) => {
      const dayItems = byDay.get(day);
      if (dayItems?.length) {
        if (start) {
          days += 1;
          coins += dayItems.length;
        } else {
          start = day;
          coins += dayItems.length;
        }
      } else {
        if (start && days) {
          found.push({
            start,
            end: interval.offset(start, days),
            days: days + 1,
            coins,
          });
        }

        start = null;
        days = 0;
        coins = 0;
      }
    });

  if (start && days) {
    found.push({
      start,
      end: interval.offset(start, days),
      days: days + 1,
      coins,
    });
  }

  return found;
}
