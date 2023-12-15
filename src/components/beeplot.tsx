import { useContext } from "preact/hooks";
import { scaleTime as d3ScaleTime } from "d3-scale";
import { axisTop as d3AxisTop } from "d3-axis";
import {
  forceSimulation as d3ForceSimulation,
  forceCollide as d3ForceCollide,
  forceX as d3ForceX,
  forceY as d3ForceY,
} from "d3-force";
import { VNode } from "preact";
import { DataContext } from "../context/data-context";
import { MONTH_FORMAT } from "../formats";
import Axis from "./axis";
import { translate } from "../svg";
import { Row } from "../data";
import { COIN_MAPPING, coin, polygonPath } from "../coins";

const ITEM_SIZE = 4;

function Coin({ row }: { row: Row }): VNode {
  const key = coin(row);
  const coinData = COIN_MAPPING[key];
  let elem = <></>;

  if (!coinData) {
    // eslint-disable-next-line no-console
    console.error(`could not find coin for ${key}`);
  }

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
  return <g transform={translate(row.x ?? 0, row.y ?? 0)}>{elem}</g>;
}

export function BeePlot() {
  const padding = { top: 20, left: 15, right: 15, bottom: 20 };
  const rowHeight = 90;
  const axisHeight = 30;
  const { currentYearByPerson, width, currentYearExtent } = useContext(DataContext);

  const x = d3ScaleTime().domain(currentYearExtent).range([0, width]);

  const xAxis = d3AxisTop(x).tickFormat(MONTH_FORMAT);

  return (
    <svg
      width={width + padding.left + padding.right}
      height={axisHeight + currentYearByPerson.length * rowHeight + padding.top + padding.bottom}
    >
      <Axis axis={xAxis} transform={translate(padding.left, padding.top)} />
      {currentYearByPerson.map(([person, personRows], i) => {
        const simulation = d3ForceSimulation(personRows)
          .force("x", d3ForceX((d: Row) => x(d.timestamp)).strength(1))
          .force("y", d3ForceY(rowHeight / 2))
          .force("collide", d3ForceCollide(4))
          .stop();

        for (let tick = 0; tick < 120; ++tick) {
          simulation.tick();
        }

        return (
          <g transform={translate(padding.left, padding.top + axisHeight + i * rowHeight)}>
            <text className="name">{person}</text>
            {personRows.map((row) => (
              <Coin row={row} />
            ))}
          </g>
        );
      })}
    </svg>
  );
}
