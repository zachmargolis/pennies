import { ascending as d3Ascending, descending as d3Descending, group as d3Group } from "d3-array";
import { Row } from "./data";

export interface Sum {
  currency: string;
  count: number;
  sum: number;
}

export function sumByCurrency(rows: Row[]): Sum[] {
  return Array.from(d3Group(rows, (d) => d.currency).entries())
    .map(([currency, currencyRows]) => ({
      currency,
      count: currencyRows.length,
      sum: currencyRows.reduce((acc, d) => acc + d.denomination, 0),
    }))
    .sort((a, b) => d3Descending(a.count, b.count) || d3Ascending(a.currency, b.currency));
}

export function sumToMapByCurrency(rows: Row[]): Map<string, Sum> {
  return new Map(sumByCurrency(rows).map((sum) => [sum.currency, sum]));
}
