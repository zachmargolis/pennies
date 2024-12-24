import { useContext, useMemo } from "preact/hooks";
import { extent as d3Extent, max as d3Max, descending as d3Descending } from "d3-array";
import { axisLeft as d3AxisLeft, axisBottom as d3AxisBottom } from "d3-axis";
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
import { PLAIN_NUMBER_FORMAT, USD_FORMAT } from "../formats";
import { translate } from "../svg";
import { DataContext, isFamily } from "../context/data-context";
import { last } from "../array";

export enum Mode {
  COUNT,
  AMOUNT_USD,
}

const NUM_COINS = (rows: Row[]) => rows.length;
const USD_AMOUNT = (rows: Row[]) =>
  rows
    ?.filter(({ currency }) => currency == "USD")
    .reduce((sum, { denomination }) => sum + denomination, 0) || 0;

function accessor(mode: Mode): (rows: Row[]) => number {
  switch (mode) {
    case Mode.COUNT:
      return NUM_COINS;
    case Mode.AMOUNT_USD:
      return USD_AMOUNT;
  }
}

export function YearOverYearLineChart({
  height,
  mode,
  leaderboardFriendsCount,
}: {
  height: number;
  mode: Mode;
  leaderboardFriendsCount: number;
}) {
  const { color, width, byYear, byPersonByYear } = useContext(DataContext);

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

  const yGetter = accessor(mode);

  const maxY = d3Max(byPersonByYear, ([_key, person]) => d3Max(person.values(), yGetter));

  const y =
    mode == Mode.COUNT
      ? d3ScaleLinear([heightToFit, 0]).domain([0, Number(maxY)])
      : d3ScaleLinear([heightToFit, heightToFit * 0.25, 0]).domain([0, 25, Number(maxY)]);

  const yFormat = mode == Mode.COUNT ? PLAIN_NUMBER_FORMAT : USD_FORMAT;
  const yAxis = d3AxisLeft(y)
    .tickFormat(yFormat)
    .tickValues(
      mode == Mode.COUNT ? (undefined as unknown as number[]) : [0, 5, 10, 15, 20, 25, 200]
    );

  const line = d3Line<[number, Row[]]>()
    .x(([year, _rows]) => x(year))
    .y(([_year, rows]) => y(yGetter(rows)))
    .curve(d3CurveMonotoneX);

  const nameLabels: Map<string, number> = useMemo(() => {
    interface Label {
      person: string;
      rows: Row[];
      fx?: number; // fixed x position
      x: number;
      y: number;
    }

    const allLabels: Label[] = Array.from(byPersonByYear.entries()).map(
      ([person, personByYear]) => {
        const [, lastCoins] = last(Array.from(personByYear.entries()));
        return {
          person,
          rows: lastCoins,
          fx: 0,
          x: 0,
          y: y(yGetter(lastCoins)),
        };
      }
    );

    const familyLabels = allLabels.filter(({ person }) => isFamily(person));
    const topFriendsLabels = allLabels
      .filter(({ person }) => !isFamily(person))
      .sort((a, b) => d3Descending(yGetter(a.rows), yGetter(b.rows)))
      .slice(0, leaderboardFriendsCount);

    const labels = [...familyLabels, ...topFriendsLabels];

    const simulation = d3ForceSimulation(labels)
      .force("x", d3ForceX(0))
      .force(
        "y",
        d3ForceY((d: Label) => y(yGetter(d.rows)))
      )
      .force("collide", d3ForceCollide(4))
      .stop();

    for (let tick = 0; tick < 120; ++tick) {
      simulation.tick();
    }

    return new Map(labels.map((d) => [d.person, d.y]));
  }, [byPersonByYear]);

  return (
    <div>
      <svg width={width} height={height}>
        <Axis
          axis={xAxis}
          transform={translate(padding.left, heightToFit + padding.top + axisMargin)}
        />
        <Axis axis={yAxis} transform={translate(padding.left, padding.top)} />
        <g transform={translate(padding.left, padding.top)}>
          {Array.from(byPersonByYear.entries()).map(([person, personByYear]) => {
            const [lastYear] = last(Array.from(personByYear.entries()));
            const DOT_RADIUS = 3;

            const labelY = nameLabels.get(person) || 0;

            return (
              <g data-person={person}>
                <path className="line" stroke={color(person)} d={line(personByYear) || ""} />
                {Array.from(personByYear).map(([year, coins]) => (
                  <circle
                    className="dot"
                    cx={x(year)}
                    cy={y(yGetter(coins))}
                    r={DOT_RADIUS}
                    fill={color(person)}
                  >
                    <title>
                      {person}: {yFormat(yGetter(coins))} in {year}
                    </title>
                  </circle>
                ))}
                {nameLabels.has(person) && (
                  <text
                    className="end-label"
                    transform={translate(x(lastYear) + 3 * DOT_RADIUS - axisMargin, labelY)}
                  >
                    {person}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
