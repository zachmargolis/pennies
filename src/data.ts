import { csv } from "d3-fetch";

export interface Row {
  timestamp: Date;
  person: string;
  denomination: number;
  currency: string;
}

export function loadData(): Promise<Row[]> {
  return csv("/pennies.csv").then((rows) =>
    rows.map(({ timestamp, person, denomination, currency }) => ({
      timestamp: new Date(+timestamp),
      person,
      denomination: +denomination,
      currency,
    }))
  );
}
