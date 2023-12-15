import fs from "node:fs";
import { csvParse } from 'd3-dsv';
import { renderToString } from "preact-render-to-string";
import { App } from "./app";
import { convertRow } from "./data";

export function render() {
  const csv = fs.readFileSync("./public/pennies.csv", "utf-8");
  const data = csvParse(csv).map(convertRow);

  const html = renderToString(<App data={data} isInteractive={false} />);
  return { html };
}
