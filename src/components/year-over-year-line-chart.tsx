import { useContext, useMemo } from "preact/hooks";
import { extent as d3Extent, max as d3Max } from "d3-array";
import { axisBottom as d3AxisBottom, axisRight as d3AxisRight } from "d3-axis";
import { scaleLinear as d3ScaleLinear } from "d3-scale";
import { line as d3Line, curveMonotoneX as d3CurveMonotoneX } from "d3-shape";
import {
  forceSimulation as d3ForceSimulation,
  forceCollide as d3ForceCollide,
  forceX as d3ForceX,
  forceY as d3ForceY,
} from "d3-force";
import { Row } from "../data";
import Axis from "./axis";
import { PLAIN_NUMBER_FORMAT } from "../formats";
import { translate } from "../svg";
import { DataContext } from "../context/data-context";

export function YearOverYearLineChart() {
  const { color, width, byYear, byPersonByYear } = useContext(DataContext);

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

  interface Label {
    person: string;
    numCoins: number;
    year: number;
    x?: number;
    y?: number;
  }

  const labelsByPerson = useMemo(() => {
    const nodes: Label[] = Array.from(byPersonByYear.entries()).map(([person, personByYear]) => {
      const [year, coins] = Array.from(personByYear.entries())[0];
      return {
        person,
        numCoins: coins.length,
        year,
      };
    });

    const simulation = d3ForceSimulation(nodes)
      .force("x", d3ForceX((d: Label) => x(d.year)).strength(1))
      .force("y", d3ForceY((d: Label) => y(d.numCoins)).strength(1))
      .force("collide", d3ForceCollide(10))
      .stop();

    for (let tick = 0; tick < 120; ++tick) {
      simulation.tick();
    }

    const labels: Record<string, Label> = {};
    nodes.forEach((node) => {
      labels[node.person] = node;
    });
    return labels;
  }, [byPersonByYear]);

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
            const label = labelsByPerson[person];
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
                  transform={translate((label.x ?? 0) - axisMargin, label.y ?? 0)}
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
