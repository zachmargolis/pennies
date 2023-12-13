import fs from "node:fs/promises";
import { render } from '../dist/server/render-server.js';

const template = await fs.readFile("./dist/client/index.html", "utf-8");

const rendered = render();

const html = template.replace(`<!--ssr-outlet-->`, `<!--prerendered-->${rendered.html}`);

// eslint-disable-next-line no-console
console.log(html);
