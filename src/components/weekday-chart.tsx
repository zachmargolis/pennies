import { useContext } from "preact/hooks";
import { max as d3Max, ascending as d3Ascending } from "d3-array";
import { scaleBand as d3ScaleBand, scaleLinear as d3scaleLinear } from "d3-scale";
import { axisBottom as d3AxisBottom, axisRight as d3AxisRight } from "d3-axis";
import { DataContext, toDivision } from "../context/data-context";
import Axis from "./axis";
import { translate } from "../svg";

export function WeekdayChart() {
  const { color, width, byPersonByWeekday, byPerson } = useContext(DataContext);

  const padding = {
    top: 5,
    right: 30,
    bottom: 10,
    left: 70,
  };

  const axisMargin = 5;
  const maxRowHeight = 80;
  const minRowCoins = 10;
  const yAxisTickInterval = 10;
  const rowSpacing = 20;
  const widthToFit = width - (padding.left + padding.right);

  const overallMostCoins =
    d3Max(byPersonByWeekday, ([, weekdays]) => d3Max(weekdays, ([, coins]) => coins.length)) || 0;

  const x = d3ScaleBand<number>()
    .domain([0, 1, 2, 3, 4, 5, 6])
    .range([0, widthToFit])
    .round(true)
    .paddingInner(0.1);

  const weekdayLabels = ["S", "M", "T", "W", "Th", "F", "S"];
  const xAxis = d3AxisBottom(x).tickFormat((d) => weekdayLabels[Number(d)]);

  return (
    <>
      {Array.from(byPersonByWeekday.entries())
        .sort(
          ([aPerson], [bPerson]) =>
            d3Ascending(toDivision(aPerson), toDivision(bPerson)) ||
            d3Ascending(
              byPerson.findIndex(([p]) => p === aPerson),
              byPerson.findIndex(([p]) => p === bPerson)
            )
        )
        .map(([person, weekdays]) => {
          const personMostCoins = Math.max(
            minRowCoins,
            d3Max(weekdays, ([, coins]) => coins.length) || 0
          );
          const rowHeight = Math.ceil(maxRowHeight * (personMostCoins / overallMostCoins));

          const y = d3scaleLinear([rowHeight, 0]).domain([0, personMostCoins]);

          const yAxis = d3AxisRight(y).ticks(Math.floor(personMostCoins / yAxisTickInterval));

          return (
            <svg
              key={person}
              height={rowHeight + padding.top + padding.bottom + rowSpacing}
              width={width}
            >
              <g transform={translate(padding.left, padding.top)}>
                <Axis axis={xAxis} transform={translate(0, rowHeight + axisMargin)} />
                <Axis axis={yAxis} transform={translate(widthToFit + axisMargin, 0)} />
                {Array.from(weekdays.entries()).map(([weekday, coins]) => (
                  <rect
                    fill={color(person)}
                    x={x(weekday)}
                    y={y(coins.length)}
                    height={rowHeight - y(coins.length)}
                    width={x.bandwidth()}
                  />
                ))}
                <text className="start-label" transform={translate(-axisMargin, rowHeight)}>
                  {person}
                </text>
              </g>
            </svg>
          );
        })}
    </>
  );
}
