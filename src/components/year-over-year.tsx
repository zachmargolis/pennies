import { useMemo } from "preact/hooks";
import { group as d3Group, extent as d3Extent, max as d3Max } from "d3-array";
import { axisBottom as d3AxisBottom, axisRight as d3AxisRight } from "d3-axis";
import { scaleLinear as d3ScaleLinear, scaleOrdinal as d3ScaleOrdinal } from "d3-scale";
import { schemeSet1 as d3SchemeSet1 } from "d3-scale-chromatic";
import { line as d3Line, curveMonotoneX as d3CurveMonotoneX } from "d3-shape";
import { Row } from "../data";
import Axis from "./axis";
import { PLAIN_NUMBER_FORMAT } from "../formats";
import { translate } from "../svg";

export function YearOverYear({ data, width }: { data: Row[]; width: number }) {
  const height = 200;
  const padding = {
    top: 5,
    right: 30,
    bottom: 30,
    left: 40,
  };

  const axisMargin = 5;

  const widthToFit = width - (padding.left + padding.right);
  const heightToFit = height - (padding.top + padding.bottom);

  // NOTE: move these to a shared context?
  const { byYear, byPersonByYear } = useMemo(
    () => ({
      byYear: d3Group(data, (d) => d.timestamp.getFullYear()),
      byPersonByYear: d3Group(
        data,
        (d) => d.person,
        (d) => d.timestamp.getFullYear()
      ),
    }),
    [data]
  );

  const x = d3ScaleLinear([0, widthToFit]).domain(d3Extent(byYear.keys()) as [number, number]);
  const xAxis = d3AxisBottom(x).tickFormat(PLAIN_NUMBER_FORMAT).ticks(byYear.size);

  const mostCoins = d3Max(byPersonByYear, ([_key, person]) =>
    d3Max(person.values(), (d) => d.length)
  );

  const y = d3ScaleLinear([heightToFit, 0]).domain([0, Number(mostCoins)]);

  const yAxis = d3AxisRight(y).tickFormat(PLAIN_NUMBER_FORMAT);

  const line = d3Line<[number, Row[]]>()
    .x(([year, _rows]) => x(year))
    .y(([_year, rows]) => y(rows.length))
    .curve(d3CurveMonotoneX);

  const color = d3ScaleOrdinal(d3SchemeSet1);

  return (
    <div>
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
          {Array.from(byPersonByYear.entries()).map(([person, personByYear]) => {
            const [firstYear, firstCoins] = Array.from(personByYear.entries())[0];

            const firstLabelOffset: Record<string, number> = {
              Mom: 5,
              Brian: -5,
              Dominica: -2,
              Meghan: 3,
            };

            return (
              <g data-person={person}>
                {Array.from(personByYear).map(([year, coins]) => (
                  <circle
                    className="dot"
                    cx={x(year)}
                    cy={y(coins.length)}
                    r="3"
                    fill={color(person)}
                  />
                ))}
                <path className="line" stroke={color(person)} d={line(personByYear) || ""} />
                <text
                  className="start-label"
                  transform={translate(
                    x(firstYear) - axisMargin,
                    y(firstCoins.length) + (firstLabelOffset[person] || 0)
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
