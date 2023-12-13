import { csv } from "d3-fetch";

export interface Row {
  timestamp: Date;
  person: string;
  denomination: number;
  currency: string;
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
  return csv("/pennies.csv").then((rows) => rows.map(convertRow));
}
