import { useContext } from "preact/hooks";
import { group as d3Group, min as d3Min, max as d3Max } from "d3-array";
import { timeDay as d3TimeDay } from "d3-time";
import { scaleTime as d3ScaleTime } from "d3-scale";
import { axisTop as d3AxisTop } from "d3-axis";
import { DataContext } from "../context/data-context";
import { Row } from "../data";
import { translate } from "../svg";
import { MONTH_FORMAT } from "../formats";
import Axis from "./axis";

interface Streak {
  start: Date;
  end: Date;
  days: number;
  coins: number;
}

function streaks(rows: Row[]): Streak[] {
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
      if (start) {
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
  const { color, width: standardWidth, byPerson, currentYearExtent } = useContext(DataContext);

  const width = standardWidth * 2;
  const padding = {
    top: 20,
    left: 60,
    bottom: 10,
    right: 10,
  };

  const innerWidth = width - padding.left - padding.top;

  const x = d3ScaleTime().domain(currentYearExtent).range([0, innerWidth]);
  const xAxis = d3AxisTop(x).tickFormat(MONTH_FORMAT);

  const rowHeight = 20;

  return (
    <svg width={width} height={rowHeight * byPerson.length + padding.top + padding.bottom}>
      <Axis axis={xAxis} transform={translate(padding.left, padding.top)} />
      {byPerson.map(([person, rows], i) => (
        <g transform={translate(padding.left, padding.top + (i + 1) * rowHeight)}>
          <text className="start-label" transform={translate(-10, 0)}>
            {person}
          </text>
          {streaks(rows).map((streak) => (
            <line stroke={color(person)} x1={x(streak.start)} x2={x(streak.end)} y1={0} y2={0} />
          ))}
        </g>
      ))}
    </svg>
  );
}
