import { useContext } from "preact/hooks";
import { max as d3Max, ascending as d3Ascending } from "d3-array";
import { scaleBand as d3ScaleBand, scaleLinear as d3scaleLinear } from "d3-scale";
import { axisBottom as d3AxisBottom, axisRight as d3AxisRight } from "d3-axis";
import { DataContext } from "../context/data-context";
import Axis from "./axis";
import { translate } from "../svg";

export function WeekdayChart() {
  const { color, width, byPersonByWeekday, currentYearByPerson } = useContext(DataContext);

  const padding = {
    top: 5,
    right: 30,
    bottom: 10,
    left: 40,
  };

  const axisMargin = 5;
  const rowHeight = 70;
  const rowSpacing = 20;
  const widthToFit = width - (padding.left + padding.right);
  const height = byPersonByWeekday.size * (rowHeight + rowSpacing) + (padding.top + padding.bottom);

  const mostCoins =
    d3Max(byPersonByWeekday, ([, weekdays]) => d3Max(weekdays, ([, coins]) => coins.length)) || 0;

  const x = d3ScaleBand<number>()
    .domain([0, 1, 2, 3, 4, 5, 6])
    .range([0, widthToFit])
    .round(true)
    .paddingInner(0.1);

  const weekdayLabels = ["S", "M", "T", "W", "Th", "F", "S"];
  const xAxis = d3AxisBottom(x).tickFormat((d) => weekdayLabels[Number(d)]);

  const y = d3scaleLinear()
    .domain([0, Number(mostCoins)])
    .range([rowHeight, 0]);

  const yAxis = d3AxisRight(y).ticks(5);

  return (
    <svg height={height} width={width}>
      {Array.from(byPersonByWeekday.entries())
        .sort(([personA], [personB]) =>
          d3Ascending(
            currentYearByPerson.findIndex(([p]) => p === personA),
            currentYearByPerson.findIndex(([p]) => p === personB)
          )
        )
        .map(([person, weekdays], i) => (
          <g transform={translate(padding.left, padding.top + (rowHeight + rowSpacing) * i)}>
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
        ))}
    </svg>
  );
}
