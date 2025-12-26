import { timeQuarter } from "../time";
import { Row } from "../data";
import { group as d3Group, extent as d3Extent, descending as d3Descending } from "d3-array";
import { coin, Coin as CoinData, COIN_MAPPING, PENNY_END_DATE } from "../coins";
import { axisBottom as d3AxisBottom, axisLeft as d3AxisLeft } from "d3-axis";
import { scaleTime as d3ScaleTime, scaleLinear as d3ScaleLinear } from "d3-scale";
import { useContext, useMemo } from "preact/hooks";
import { DataContext } from "../context/data-context";
import { translate } from "../svg";
import Axis from "./axis";
import { line as d3Line, curveBumpX as d3CurveBumpX } from "d3-shape";
import { last } from "../array";
import { Coin } from "./coin";
import {
  forceSimulation as d3ForceSimulation,
  forceCollide as d3ForceCollide,
  forceX as d3ForceX,
  forceY as d3ForceY,
} from "d3-force";
import { PERCENT_FORMAT } from "../formats";

interface CoinFrequency {
  date: Date;
  coinKey: string;
  freq: number;
}

function toCoinFrequencies(data: Row[]): CoinFrequency[] {
  const allCoins = new Set(data.map((d) => coin(d)));

  return Array.from(
    d3Group(
      data,
      ({ timestamp }) => timeQuarter(timestamp),
      (d) => coin(d)
    ).entries()
  ).flatMap(([date, map]) => {
    const total = Array.from(map.values()).reduce((acc, v) => acc + v.length, 0);
    return Array.from(allCoins).map((coinKey) => {
      const freq = (map.get(coinKey) || []).length / total;
      return {
        date,
        coinKey,
        freq,
      };
    });
  });
}

function coinColor(coin: CoinData): string {
  if ("color" in coin) {
    return coin.color;
  } else {
    return coin.innerColor;
  }
}

interface Label {
  coinKey: string;
  frequencies: CoinFrequency[];
  fx?: number; // fixed x position
  x: number;
  y: number;
}

function calculateEndLabels({
  y,
  coinFrequencies,
}: {
  y: (v: number) => number;
  coinFrequencies: Map<string, CoinFrequency[]>;
}): Map<string, number> {
  const labels = Array.from(coinFrequencies.entries()).map(([coinKey, frequencies]) => {
    return {
      coinKey,
      frequencies,
      fx: 0,
      x: 0,
      y: y(last(frequencies).freq),
    };
  });

  const simulation = d3ForceSimulation(labels)
    .force("x", d3ForceX(0))
    .force(
      "y",
      d3ForceY((d: Label) => y(last(d.frequencies).freq))
    )
    .force("collide", d3ForceCollide(4))
    .stop();

  for (let tick = 0; tick < 120; ++tick) {
    simulation.tick();
  }

  return new Map(labels.map((d) => [d.coinKey, d.y]));
}

export function RelativeFrequencyChart({
  data,
  height,
  topN = 5,
}: {
  data: Row[];
  height: number;
  topN?: number;
}) {
  const padding = {
    top: 5,
    right: 70,
    bottom: 30,
    left: 50,
  };

  const { width } = useContext(DataContext);

  const coinFrequencies = useMemo(
    () =>
      new Map(
        Array.from(d3Group(toCoinFrequencies(data), ({ coinKey }) => coinKey))
          .sort(([_coinA, freqA], [_coinB, freqB]) => d3Descending(freqA.length, freqB.length))
          .slice(0, topN)
      ),
    [data]
  );

  const axisMargin = 5;
  const widthToFit = width - (padding.left + padding.right);
  const heightToFit = height - (padding.top + padding.bottom);

  const x = d3ScaleTime()
    .domain(d3Extent(data, ({ timestamp }) => timestamp) as [Date, Date])
    .range([0, widthToFit]);

  const xAxis = d3AxisBottom(x);

  const y = d3ScaleLinear().domain([0, 1]).range([heightToFit, 0]);

  const endLabels = useMemo(() => calculateEndLabels({ y, coinFrequencies }), [coinFrequencies]);

  const yAxis = d3AxisLeft(y).tickFormat(PERCENT_FORMAT);

  const line = d3Line<CoinFrequency>()
    .x(({ date }) => x(date))
    .y(({ freq }) => y(freq))
    .curve(d3CurveBumpX);

  return (
    <svg height={height} width={width}>
      <Axis
        axis={xAxis}
        transform={translate(padding.left, height - padding.bottom + axisMargin)}
      />
      <Axis axis={yAxis} transform={translate(padding.left - axisMargin, padding.top)} />
      <g transform={translate(padding.left, padding.top)}>
        <line
          className="line thin-line"
          stroke="gray"
          x1={x(PENNY_END_DATE)}
          x2={x(PENNY_END_DATE)}
          y1={y(1)}
          y2={y(0) + axisMargin}
        />
        <text class="start-label" transform={translate(x(PENNY_END_DATE) - axisMargin, y(1))}>
          RIP penny
        </text>
        {Array.from(coinFrequencies.entries()).map(([coinKey, frequencies]) => (
          <g>
            <path
              className="line"
              d={line(frequencies) || ""}
              stroke={coinColor(COIN_MAPPING[coinKey])}
            />
            <g transform={translate(x(frequencies[0].date), y(frequencies[0].freq))}>
              <Coin coinData={COIN_MAPPING[coinKey]} />{" "}
            </g>
            <g transform={translate(x(last(frequencies).date), y(last(frequencies).freq))}>
              <Coin coinData={COIN_MAPPING[coinKey]} />{" "}
            </g>
            <text
              className="end-label"
              transform={translate(widthToFit + axisMargin, endLabels.get(coinKey) || 0)}
            >
              {COIN_MAPPING[coinKey]?.name}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
}
