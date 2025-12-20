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

interface CurrencyCount {
  currency: string;
  count: number;
  value: number;
}

function toCurrencyCounts(data: Row[]): CurrencyCount[] {
  const byCurrency = d3Group(data, ({ currency }) => currency);

  return Array.from(byCurrency.entries())
    .map(([currency, rows]) => {
      return {
        currency,
        count: rows.length,
        value: rows.reduce((acc, { denomination }) => acc + denomination, 0),
      };
    })
    .sort(({ count: countA }, { count: countB }) => d3Descending(countA, countB));
}

interface InterationalRow {
  person: string;
  currencyCounts: CurrencyCount[];
}

export function topInternational({
  data,
  year,
  count,
}: {
  data: Row[];
  year: number;
  count: number;
}): InterationalRow[] {
  const byPersonByYear = d3Group(
    data.filter(({ currency }) => currency !== "USD"),
    ({ person }) => person,
    ({ timestamp }) => timestamp.getFullYear()
  );

  return Array.from(byPersonByYear.keys())
    .map((person) => {
      return {
        person,
        currencyCounts: toCurrencyCounts(byPersonByYear.get(person)?.get(year) || []),
      };
    })
    .filter(({ currencyCounts }) => currencyCounts.length > 0)
    .sort(({ currencyCounts: countsA }, { currencyCounts: countsB }) =>
      d3Descending(
        countsA.reduce((acc, { count }) => acc + count, 0),
        countsB.reduce((acc, { count }) => acc + count, 0)
      )
    )
    .slice(0, count);
}
