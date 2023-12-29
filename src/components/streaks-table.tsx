import { useContext, useMemo } from "preact/hooks";
import { group as d3Group, min as d3Min, max as d3Max, descending as d3Descending } from "d3-array";
import { timeDay as d3TimeDay } from "d3-time";
import { axisTop as d3AxisTop } from "d3-axis";
import { scaleTime as d3ScaleTime } from "d3-scale";
import { DataContext } from "../context/data-context";
import { Row } from "../data";
import { ThPerson } from "./th-person";
import { MONTH_FORMAT } from "../formats";
import { translate } from "../svg";
import Axis from "./axis";

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

export function StreaksChart() {
  const { color, byPerson, width: pageWidth, currentYearExtent } = useContext(DataContext);

  const width = Math.ceil(pageWidth);

  const streaks = useMemo(
    () =>
      byPerson
        .map(
          ([person, coins]) =>
            [person, toStreaks(coins).sort((a, b) => d3Descending(a.days, b.days))] as [
              string,
              Streak[],
            ]
        )
        .filter(([, s]) => s.length),
    byPerson
  );

  const padding = {
    top: 20,
    left: 60,
    bottom: 10,
    right: 10,
  };

  const innerWidth = width - padding.left - padding.top;

  const x = d3ScaleTime().domain(currentYearExtent).range([0, innerWidth]);
  const xAxis = d3AxisTop(x).tickFormat(MONTH_FORMAT);

  const rowHeight = 30;
  const rowCenter = -rowHeight / 2;
  const circleRadius = 9;

  return (
    <svg width={width} height={rowHeight * streaks.length + padding.top + padding.bottom}>
      <Axis axis={xAxis} transform={translate(padding.left, padding.top)} />
      {streaks.map(([person, personStreaks], i) => (
        <g transform={translate(padding.left, padding.top + (i + 1) * rowHeight)}>
          <text className="start-label" transform={translate(-10, rowCenter)}>
            {person}
          </text>
          {personStreaks.map((streak) => (
            <g>
              <line
                stroke={color(person)}
                stroke-linecap="round"
                x1={x(streak.start)}
                x2={x(streak.end)}
                y1={rowCenter}
                y2={rowCenter}
                stroke-width={4}
              />
              <circle
                fill={color(person)}
                cx={x(streak.end) + circleRadius}
                cy={rowCenter}
                r={circleRadius}
              />
              <text x={x(streak.end) + circleRadius} y={rowCenter} className="center-label" fill="white">
                {streak.days}
              </text>
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}

export function StreaksTable() {
  const { byPerson } = useContext(DataContext);

  return (
    <table className="width-100p">
      <thead>
        <tr>
          <th scope="col">Person</th>
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
                <td>{streaks.length > 0 ? streaks.length : undefined}</td>
                <td>{longestStreak ? `${longestStreak.days} days` : undefined}</td>
              </tr>
            );
          })}
      </tbody>
    </table>
  );
}
