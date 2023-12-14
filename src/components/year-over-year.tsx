import { useMemo } from "preact/hooks";
import { group as d3Group, extent as d3Extent, max as d3Max } from "d3-array";
import { axisBottom as d3AxisBottom, axisRight as d3AxisRight } from "d3-axis";
import { scaleLinear as d3ScaleLinear } from "d3-scale";
import { Row } from "../data";
import Axis from "./axis";
import { PLAIN_NUMBER_FORMAT } from "../formats";

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

  return (
    <div>
      <svg width={width} height={height}>
        <Axis
          axis={xAxis}
          transform={`translate(${padding.left}, ${heightToFit + padding.top + axisMargin})`}
        />
        <Axis
          axis={yAxis}
          transform={`translate(${widthToFit + padding.left + axisMargin}, ${padding.top})`}
        />
      </svg>
    </div>
  );
}
