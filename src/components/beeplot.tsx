import { useContext, useMemo } from "preact/hooks";
import { scaleTime as d3ScaleTime } from "d3-scale";
import { axisTop as d3AxisTop } from "d3-axis";
import {
  forceSimulation as d3ForceSimulation,
  forceCollide as d3ForceCollide,
  forceX as d3ForceX,
  forceY as d3ForceY,
} from "d3-force";
import { descending as d3Descending, group as d3Group, extent as d3Extent } from "d3-array";
import { VNode } from "preact";
import { DataContext } from "../context/data-context";
import { MONTH_FORMAT } from "../formats";
import Axis from "./axis";
import { translate } from "../svg";
import { Row } from "../data";
import { COIN_MAPPING, coin, polygonPath, Coin as CoinData } from "../coins";

const ITEM_SIZE = 4;

function Coin({ coinData }: { coinData: CoinData }): VNode {
  let elem = <></>;

  const sharedAttribs = {
    title: coinData?.name,
    fill: coinData?.color,
  };

  if ("square" in coinData) {
    elem = (
      <rect
        x={-0.5 * (coinData.ratio * ITEM_SIZE)}
        y={-0.5 * ITEM_SIZE}
        width={coinData.ratio * ITEM_SIZE}
        height={ITEM_SIZE}
        {...sharedAttribs}
      />
    );
  } else if ("nSides" in coinData) {
    elem = (
      <path d={polygonPath(coinData.nSides, ITEM_SIZE * coinData.diameter)} {...sharedAttribs} />
    );
  } else if ("diameter" in coinData) {
    elem = <circle cx="0" cy="0" r={ITEM_SIZE * coinData.diameter} {...sharedAttribs} />;
  }
  return elem;
}

export function BeePlot() {
  const padding = { top: 20, left: 15, right: 15, bottom: 20 };
  const axisHeight = 20;
  const rowSpacing = 30;
  const { byPerson, width, currentYearExtent } = useContext(DataContext);

  const x = d3ScaleTime().domain(currentYearExtent).range([0, width]).nice();

  const xAxis = d3AxisTop(x).tickFormat((d, i) =>
    // These are always scoped to 1 year at a time, return a blank value instead of a second January
    i < 12 ? MONTH_FORMAT(d) : ""
  );

  const heights = useMemo(
    () =>
      byPerson.map(([, personRows]) => {
        const simulation = d3ForceSimulation(personRows)
          .force("x", d3ForceX((d: Row) => x(d.timestamp)).strength(1))
          .force("y", d3ForceY(0))
          .force("collide", d3ForceCollide(4))
          .stop();

        for (let tick = 0; tick < 120; ++tick) {
          simulation.tick();
        }

        const [minY, maxY] = d3Extent(personRows, (d) => d.y) as [number, number];
        return Math.max(maxY - minY, 30);
      }),
    byPerson
  );

  return (
    <svg
      width={width + padding.left + padding.right}
      height={
        axisHeight + heights.reduce((a, b) => a + b + rowSpacing, 0) + padding.top + padding.bottom
      }
    >
      <Axis axis={xAxis} transform={translate(padding.left, padding.top)} />
      {byPerson.map(([person, personRows], i) => (
        <g
          transform={translate(
            padding.left,
            padding.top + axisHeight + heights.slice(0, i).reduce((a, b) => a + b + rowSpacing, 0)
          )}
        >
          <text className="name" transform={translate(0, -5)}>
            {person}
          </text>
          {personRows.map((row) => (
            <g transform={translate(row.x ?? 0, (row.y ?? 0) + Math.ceil(heights[i] / 2))}>
              <Coin coinData={COIN_MAPPING[coin(row)]} />
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}

export function Legend() {
  const { byYear, currentYear } = useContext(DataContext);
  const padding = { left: 5 };

  const coinDatas = useMemo(
    () =>
      Array.from(d3Group(byYear.get(currentYear) || [], (d) => coin(d)).entries())
        .sort(([, aCoins], [, bCoins]) => d3Descending(aCoins.length, bCoins.length))
        .map(([key]) => COIN_MAPPING[key] || console.warn(`unknown coin key=${key}`)),
    [currentYear]
  );

  return (
    <ul className="no-bullet">
      {coinDatas.map((coinData) => (
        <li>
          <svg height={ITEM_SIZE * 2} width={padding.left + ITEM_SIZE * 2}>
            <g transform={translate(ITEM_SIZE, ITEM_SIZE)}>
              <Coin coinData={coinData} />
            </g>
          </svg>
          {coinData.name}
        </li>
      ))}
    </ul>
  );
}
