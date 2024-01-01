import { csv } from "d3-fetch";

export interface Row {
  timestamp: Date;
  person: string;
  denomination: number;
  currency: string;

  /** Set by the d3 forceSimulation */
  x?: number;
  /** Set by the d3 forceSimulation */
  y?: number;
}

export function convertRow({
  timestamp,
  person,
  denomination,
  currency,
}: Record<string, string>): Row {
  return {
    timestamp: new Date(+timestamp),
    person,
    denomination: +denomination,
    currency,
  };
}

export function loadData(): Promise<Row[]> {
  return csv("./pennies.csv").then((rows) => rows.map(convertRow));
}
