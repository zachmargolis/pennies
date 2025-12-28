import { group as d3Group, descending as d3Descending, ascending as d3Ascending } from "d3-array";
import { Row } from "./data";
import { Division, toDivision } from "./context/data-context";

interface RankRow {
  person: string;
  change: number;
  thisYear: number;
  lastYear: number;
}

export enum RankMode {
  COUNT,
  PERCENT,
}

function rankCalculator(mode: RankMode): (a: number, b: number) => number {
  switch (mode) {
    case RankMode.COUNT:
      return (a, b) => a - b;
    case RankMode.PERCENT:
      return (a, b) => (a - b) / b;
    default:
      throw new Error(`Unknow mode=${mode}`);
  }
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

export function topFriends({
  data,
  year,
  count,
}: {
  data: Row[];
  year: number;
  count: number;
}): Pick<RankRow, "person" | "thisYear">[] {
  const byPersonByYear = d3Group(
    data.filter(({ person }) => toDivision(person) === Division.FRIENDS),
    ({ person }) => person,
    ({ timestamp }) => timestamp.getFullYear()
  );

  return Array.from(byPersonByYear.keys())
    .map((person) => {
      return {
        person,
        thisYear: byPersonByYear.get(person)?.get(year)?.length,
      };
    })
    .filter(({ thisYear }) => thisYear !== undefined)
    .map(({ person, thisYear: inThisYear }) => {
      const thisYear = inThisYear as number;
      return { person, thisYear };
    })
    .sort(
      ({ person: personA, thisYear: thisYearA }, { person: personB, thisYear: thisYearB }) =>
        d3Descending(thisYearA, thisYearB) || d3Ascending(personA, personB)
    )
    .slice(0, count);
}

export function topN({
  mode,
  data,
  year,
  count,
}: {
  mode: RankMode;
  data: Row[];
  year: number;
  count: number;
}): RankRow[] {
  const byPersonByYear = d3Group(
    data,
    ({ person }) => person,
    ({ timestamp }) => timestamp.getFullYear()
  );

  const calculator = rankCalculator(mode);

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

type PersonCurrencyCount = CurrencyCount & {
  person: string;
};

export function topValues({
  data,
  year,
  count,
}: {
  data: Row[];
  year: number;
  count: number;
}): PersonCurrencyCount[] {
  const byPersonByYear = d3Group(
    data,
    ({ person }) => person,
    ({ timestamp }) => timestamp.getFullYear()
  );

  return Array.from(byPersonByYear.keys())
    .flatMap((person) =>
      toCurrencyCounts(byPersonByYear.get(person)?.get(year) || []).map((currencyCount) => {
        return { person, ...currencyCount };
      })
    )
    .sort(
      ({ value: valueA, person: personA }, { value: valueB, person: personB }) =>
        d3Descending(valueA, valueB) || d3Ascending(personA, personB)
    )
    .slice(0, count);
}
