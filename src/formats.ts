import { format as d3Format } from "d3-format";
import { timeFormat as d3TimeFormat } from "d3-time-format";
import { NumberValue } from "d3-scale";

export const PLAIN_NUMBER_FORMAT = d3Format("");

export const MONTH_FORMAT: (d: Date | NumberValue) => string = d3TimeFormat("%b") as (
  d: Date | NumberValue
) => string;
