import { format as d3Format } from "d3-format";
import { timeFormat as d3TimeFormat } from "d3-time-format";
import { NumberValue } from "d3-scale";

export const PLAIN_NUMBER_FORMAT = d3Format("");

type DateFormatter = (d: Date | NumberValue) => string;

// "Jan"
export const MONTH_FORMAT: DateFormatter = d3TimeFormat("%b") as DateFormatter;

// "Jan 1"
export const DATE_FORMAT: DateFormatter = d3TimeFormat("%b %d") as DateFormatter;
