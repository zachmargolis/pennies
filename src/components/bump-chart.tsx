import { InternMap, descending as d3Descending, extent as d3Extent, max as d3Max } from "d3-array";
import { useContext, useMemo } from "preact/hooks";
import { DataContext, Division } from "../context/data-context";
import { Row } from "../data";
import { scaleLinear as d3ScaleLinear } from "d3-scale";
import { line as d3Line, curveBumpX as d3CurveBumpX } from "d3-shape";
import { axisTop as d3AxisTop } from "d3-axis";
import Axis from "./axis";
import { translate } from "../svg";
import { last } from "../array";

const FRIENDS_YEAR_START = 2021;

interface RankEntry {
  year: number;
  rank: number;
  change: number;
  count: number;
}

interface BumpChartDatum {
  person: string;
  data: RankEntry[];
}

function toBumpChartData({
  byPersonByYear,
  byYearByPerson,
  division,
}: {
  byYearByPerson: InternMap<number, InternMap<string, Row[]>>;
  byPersonByYear: InternMap<string, InternMap<number, Row[]>>;
  division: Division;
}): BumpChartDatum[] {
  const shouldIncludeYear = (year: number) =>
    division === Division.FRIENDS ? year >= FRIENDS_YEAR_START : true;

  return Array.from(byPersonByYear.keys())
    .map((person) => {
      const data = Array.from(byYearByPerson.keys())
        .map((year) => {
          const allYear = byYearByPerson.get(year) || new Map();
          const numThisYear = allYear.get(person)?.length;
          const rank = numThisYear
            ? Array.from(allYear.entries())
                .sort(([_personA, yearA], [_personB, yearB]) =>
                  d3Descending(yearA.length, yearB.length)
                )
                .findIndex(([name, finds]) => finds.length === numThisYear && name === person)
            : undefined;

          return {
            year,
            rank,
            count: numThisYear,
          };
        })
        .filter(
          ({ rank, year }) => Number.isFinite(rank) && shouldIncludeYear(year)
        ) as RankEntry[];

      for (let idx = 1; idx < data.length; idx++) {
        const lastYearRank = data[idx - 1].rank;
        const thisYearRank = data[idx].rank;

        if (
          lastYearRank !== undefined &&
          Number.isFinite(lastYearRank) &&
          thisYearRank !== undefined &&
          Number.isFinite(thisYearRank)
        ) {
          data[idx].change = lastYearRank - thisYearRank;
        }
      }

      return {
        person,
        data,
      };
    })
    .filter(({ data }) => data.length > 0);
}

function trendLabel(diff: number): string | undefined {
  if (diff === 0) {
    return "➡️";
  } else if (diff < 0) {
    return "↘️";
  } else if (diff > 0) {
    return "↗️";
  } else if (diff == undefined) {
    return "🆕";
  }
}

export function BumpChart({ height: inHeight }: { height: number }) {
  const { color, division, width, byPersonByYear, byYearByPerson } = useContext(DataContext);
  const height = division === Division.FAMILY ? inHeight : Math.floor(inHeight * 2.5);

  const bumpData = useMemo(
    () => toBumpChartData({ byPersonByYear, byYearByPerson, division }),
    [division, byPersonByYear, byYearByPerson]
  );

  const padding = {
    top: 20,
    right: 100,
    bottom: 30,
    left: 40,
  };

  const axisMargin = 10;
  const labelMargin = 5;

  const widthToFit = width - (padding.left + padding.right);
  const heightToFit = height - (padding.top + padding.bottom);

  const x = d3ScaleLinear([0, widthToFit]).domain(
    d3Extent(
      bumpData.flatMap(({ data }) => d3Extent(data, ({ year }) => year) as [number, number])
    ) as [number, number]
  );
  const y = d3ScaleLinear([0, heightToFit]).domain([
    0,
    d3Max(byYearByPerson, ([_year, entries]) => entries.size),
  ] as [number, number]);

  const xAxis = d3AxisTop(x)
    .tickValues(Array.from(byYearByPerson.keys()))
    .tickFormat((year) => String(year));

  const line = d3Line<RankEntry>()
    .x(({ year }) => x(year))
    .y(({ rank }) => y(rank))
    .curve(d3CurveBumpX);

  return (
    <div>
      <svg width={width} height={height}>
        <Axis axis={xAxis} transform={translate(padding.left, padding.top)} />
        <g transform={translate(padding.left, padding.top + axisMargin)}>
          <g class="lines">
            {bumpData.map(({ person, data }) => (
              <path
                stroke={color(person)}
                stroke-width={1.5}
                fill="none"
                d={line(data) as string}
              />
            ))}
          </g>
          <g class="dots">
            {bumpData.map(({ person, data }) => (
              <g color={color(person)}>
                {data.map(({ rank, year, count }) => (
                  <circle cx={x(year)} cy={y(rank)} r={3} fill="currentColor">
                    <title>
                      {person}: #{rank + 1} in {year} ({count} total)
                    </title>
                  </circle>
                ))}
              </g>
            ))}
          </g>
          {/* <g class="start-labels">
            {bumpData
              .filter(({ data }) => data.length > 1)
              .map(({ person, data: [{ rank, year }] }) => (
                <text className="start-label" transform={translate(x(year) - labelMargin, y(rank))}>
                  {person}
                </text>
              ))}
          </g> */}
          <g class="end-labels">
            {bumpData.map(({ person, data }) => (
              <text
                className="end-label"
                transform={translate(x(last(data).year) + labelMargin, y(last(data).rank))}
              >
                {[person, trendLabel(last(data).change)].filter(Boolean).join(" ")}
              </text>
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
}
