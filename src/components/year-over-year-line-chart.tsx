import { useContext } from "preact/hooks";
import { extent as d3Extent, max as d3Max } from "d3-array";
import { axisLeft as d3AxisLeft, axisBottom as d3AxisBottom } from "d3-axis";
import { scaleLinear as d3ScaleLinear } from "d3-scale";
import { line as d3Line, curveMonotoneX as d3CurveMonotoneX } from "d3-shape";
import { Row } from "../data";
import Axis from "./axis";
import { PLAIN_NUMBER_FORMAT } from "../formats";
import { translate } from "../svg";
import { DataContext } from "../context/data-context";
import { last } from "../array";

export function YearOverYearLineChart() {
  const { color, width, byYear, byPersonByYear } = useContext(DataContext);

  const height = 200;
  const padding = {
    top: 5,
    right: 60,
    bottom: 30,
    left: 40,
  };

  const axisMargin = 5;

  const widthToFit = width - (padding.left + padding.right);
  const heightToFit = height - (padding.top + padding.bottom);

  const x = d3ScaleLinear([0, widthToFit]).domain(d3Extent(byYear.keys()) as [number, number]);
  const xAxis = d3AxisBottom(x).tickFormat(PLAIN_NUMBER_FORMAT).ticks(byYear.size);

  const mostCoins = d3Max(byPersonByYear, ([_key, person]) =>
    d3Max(person.values(), (d) => d.length)
  );

  const y = d3ScaleLinear([heightToFit, 0]).domain([0, Number(mostCoins)]);

  const yAxis = d3AxisLeft(y).tickFormat(PLAIN_NUMBER_FORMAT);

  const line = d3Line<[number, Row[]]>()
    .x(([year, _rows]) => x(year))
    .y(([_year, rows]) => y(rows.length))
    .curve(d3CurveMonotoneX);

  return (
    <div>
      <svg width={width} height={height}>
        <Axis
          axis={xAxis}
          transform={translate(padding.left, heightToFit + padding.top + axisMargin)}
        />
        <Axis
          axis={yAxis}
          transform={translate(padding.left, padding.top)}
        />
        <g transform={translate(padding.left, padding.top)}>
          {Array.from(byPersonByYear.entries()).map(([person, personByYear]) => {
            const [lastYear, lastCoins] = last(Array.from(personByYear.entries()));
            const dotRadius = 3;

            const firstLabelOffset: Record<string, [number, number] | number> = {
              // Mom: 5,
              Brian: -5,
              Dominica: -2,
              Meghan: 3,
              "Amanda F": [-20, -58],
              "Sarah R": [-20, -80],
              "Alison F": [-20, -70],
              "Kerianne B": [-20, -62],
              "Ethan S": [-20, -25],
              "Abby B": [-20, -18],
            };

            const labelOffset = firstLabelOffset[person] || 0;
            const needsLine = Array.isArray(labelOffset);
            const [xOffset, yOffset] = Array.isArray(labelOffset) ? labelOffset : [0, labelOffset];

            return (
              <g data-person={person}>
                {needsLine && false && (
                  <line
                    stroke="gray"
                    x1={x(lastYear) + xOffset}
                    x2={x(lastYear)}
                    y1={y(lastCoins.length) + yOffset}
                    y2={y(lastCoins.length)}
                  />
                )}
                {Array.from(personByYear).map(([year, coins]) => (
                  <circle
                    className="dot"
                    cx={x(year)}
                    cy={y(coins.length)}
                    r={dotRadius}
                    fill={color(person)}
                  />
                ))}
                <path className="line" stroke={color(person)} d={line(personByYear) || ""} />
                <text
                  className="end-label"
                  transform={translate(
                    x(lastYear) + (3 * dotRadius) - axisMargin,
                    y(lastCoins.length) + 0
                  )}
                >
                  {person}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
