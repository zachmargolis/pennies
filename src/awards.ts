import { group as d3Group, descending as d3Descending } from "d3-array";
import { Row } from "./data";

interface RankRow {
  person: string;
  change: number;
  thisYear: number;
  lastYear: number;
}

export function topRookies({
  data,
  year,
  count,
}: {
  data: Row[];
  year: number;
  count: number;
}): Pick<RankRow, "person" | "thisYear">[] {
  const byPersonByYear = d3Group(
    data,
    ({ person }) => person,
    ({ timestamp }) => timestamp.getFullYear()
  );

  return Array.from(byPersonByYear.keys())
    .map((person) => {
      return {
        person,
        thisYear: byPersonByYear.get(person)?.get(year)?.length,
        lastYear: byPersonByYear.get(person)?.get(year - 1)?.length,
      };
    })
    .filter(({ thisYear, lastYear }) => thisYear !== undefined && lastYear === undefined)
    .map(({ person, thisYear: inThisYear }) => {
      const thisYear = inThisYear as number;
      return { person, thisYear };
    })
    .sort(({ thisYear: thisYearA }, { thisYear: thisYearB }) => d3Descending(thisYearA, thisYearB))
    .slice(0, count);
}

export function topN({
  calculator,
  data,
  year,
  count,
}: {
  calculator: (thisYear: number, lastYear: number) => number;
  data: Row[];
  year: number;
  count: number;
}): RankRow[] {
  const byPersonByYear = d3Group(
    data,
    ({ person }) => person,
    ({ timestamp }) => timestamp.getFullYear()
  );

  return Array.from(byPersonByYear.keys())
    .map((person) => {
      return {
        person,
        thisYear: byPersonByYear.get(person)?.get(year)?.length,
        lastYear: byPersonByYear.get(person)?.get(year - 1)?.length,
      };
    })
    .filter(
      ({ thisYear, lastYear }) =>
        thisYear !== undefined && lastYear !== undefined && thisYear > lastYear
    )
    .map(({ person, thisYear: inThisYear, lastYear: inLastYear }) => {
      const thisYear = inThisYear as number;
      const lastYear = inLastYear as number;
      return {
        person,
        thisYear,
        lastYear,
        change: calculator(thisYear, lastYear) as number,
      };
    })
    .sort(({ change: changeA }, { change: changeB }) => d3Descending(changeA, changeB))
    .slice(0, count);
}
