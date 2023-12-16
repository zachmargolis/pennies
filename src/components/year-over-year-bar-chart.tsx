import { useContext, useMemo, useState } from "preact/hooks";
import {
  group as d3Group,
  max as d3Max,
  ascending as d3Ascending,
  descending as d3Descending,
  InternMap,
} from "d3-array";
import { axisBottom as d3AxisBottom, axisRight as d3AxisRight } from "d3-axis";
import {
  timeDay as d3TimeDay,
  timeWeek as d3TimeWeek,
  timeMonth as d3TimeMonth,
  timeYear as d3TimeYear,
} from "d3-time";
import { scaleLinear as d3ScaleLinear, scaleBand as d3ScaleBand } from "d3-scale";
import { DataContext, toDivision } from "../context/data-context";
import { MONTH_FORMAT, PLAIN_NUMBER_FORMAT } from "../formats";
import { translate } from "../svg";
import Axis from "./axis";
import { Row } from "../data";

enum Interval {
  DAY,
  WEEK,
  MONTH,
}

function toIntervalFunction(interval: Interval) {
  switch (interval) {
    case Interval.DAY:
      return d3TimeDay;
    case Interval.WEEK:
      return d3TimeWeek;
    case Interval.MONTH:
      return d3TimeMonth;
    default:
      throw new Error(`unknown interval=${interval}`);
  }
}

export function YearOverYearBarChart() {
  const {
    data,
    color,
    width,
    timeExtent: [minTime, maxTime],
  } = useContext(DataContext);

  const height = 100;
  const padding = {
    top: 5,
    right: 30,
    bottom: 30,
    left: 40,
  };

  const [interval, _setInterval] = useState(Interval.WEEK);

  const intervalFn = toIntervalFunction(interval);

  const byPersonByInterval: [string, InternMap<Date, Row[]>][] = useMemo(
    () =>
      Array.from(
        d3Group(
          data,
          (d) => d.person,
          (d) => intervalFn.floor(d.timestamp)
        ).entries()
      ).sort(
        ([aPerson, a], [bPerson, b]) =>
          d3Ascending(toDivision(aPerson), toDivision(bPerson)) || d3Descending(a.size, b.size)
      ),
    [interval, data]
  );

  const axisMargin = 5;

  const widthToFit = width - (padding.left + padding.right);
  const heightToFit = height - (padding.top + padding.bottom);

  const x = d3ScaleBand<Date>([0, widthToFit]).domain(intervalFn.range(minTime, maxTime));
  const xAxis = d3AxisBottom(x)
    .tickFormat(MONTH_FORMAT)
    .tickValues(d3TimeMonth.range(minTime, maxTime, 3));

  const mostCoins = d3Max(byPersonByInterval, ([, person]) =>
    d3Max(person.values(), (d) => d.length)
  );

  const y = d3ScaleLinear([heightToFit, 0]).domain([0, Number(mostCoins)]);
  const yAxis = d3AxisRight(y).tickFormat(PLAIN_NUMBER_FORMAT);

  return (
    <svg width={width} height={height}>
      <Axis
        axis={xAxis}
        transform={translate(padding.left, heightToFit + padding.top + axisMargin)}
      />
      <Axis
        axis={yAxis}
        transform={translate(widthToFit + padding.left + axisMargin, padding.top)}
      />
      <g transform={translate(padding.left, padding.top)}>
        {byPersonByInterval.map(([person, byInterval]) => (
          <g>
            {Array.from(byInterval.entries()).map(([date, coins]) => (
              <rect
                fill={color(person)}
                x={x(date)}
                y={y(coins.length)}
                height={heightToFit - y(coins.length)}
                width={x.bandwidth()}
              />
            ))}
          </g>
        ))}
      </g>
    </svg>
  );
}
