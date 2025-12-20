import { useContext } from "preact/hooks";
import { group as d3Group, min as d3Min, max as d3Max, descending as d3Descending } from "d3-array";
import { timeDay as d3TimeDay } from "d3-time";
import { DataContext } from "../context/data-context";
import { Row } from "../data";
import { ThPerson } from "./th-person";
import { TdDivision } from "./td-division";

interface Streak {
  start: Date;
  end: Date;
  days: number;
  coins: number;
}

function toStreaks(rows: Row[]): Streak[] {
  const found: Streak[] = [];

  const byDay = d3Group(rows, (row) => d3TimeDay.floor(row.timestamp));

  let start: Date | null = null;
  let days = 0;
  let coins = 0;

  d3TimeDay.range(d3Min(byDay.keys()) as Date, d3Max(byDay.keys()) as Date, 1).forEach((day) => {
    const dayItems = byDay.get(day);
    if (dayItems) {
      if (start) {
        days += 1;
        coins += dayItems.length;
      } else {
        start = day;
        coins += dayItems.length;
      }
    } else {
      if (start && days > 1) {
        found.push({
          start,
          end: d3TimeDay.offset(start, days),
          days,
          coins,
        });
      }

      start = null;
      days = 0;
      coins = 0;
    }
  });

  return found;
}

export function StreaksTable() {
  const { byPerson } = useContext(DataContext);

  return (
    <table className="width-100p">
      <thead>
        <tr>
          <th scope="col">Person</th>
          <th scope="col">Division</th>
          <th scope="col">Number of streaks</th>
          <th scope="col">Longest streak</th>
        </tr>
      </thead>
      <tbody>
        {byPerson
          .map(
            ([person, coins]) =>
              [person, toStreaks(coins).sort((a, b) => d3Descending(a.days, b.days))] as [
                string,
                Streak[],
              ]
          )
          .filter(([, streaks]) => streaks.length)
          .map(([person, streaks]) => {
            const longestStreak = streaks[0];

            return (
              <tr>
                <ThPerson person={person} />
                <TdDivision person={person} />
                <td>{streaks.length > 0 ? streaks.length : undefined}</td>
                <td>{longestStreak ? `${longestStreak.days} days` : undefined}</td>
              </tr>
            );
          })}
      </tbody>
    </table>
  );
}
