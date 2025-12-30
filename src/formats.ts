import { format as d3Format } from "d3-format";
import { utcFormat as d3UtcFormat } from "d3-time-format";
import { NumberValue } from "d3-scale";

export const PLAIN_NUMBER_FORMAT = d3Format(",");

// $1, $2
export const USD_FORMAT = d3Format("$.0f");

type DateFormatter = (d: Date | NumberValue) => string;

// "Jan"
export const MONTH_FORMAT: DateFormatter = d3UtcFormat("%b") as DateFormatter;

// "Jan 1"
export const DATE_FORMAT: DateFormatter = d3UtcFormat("%b %-d") as DateFormatter;

// 10.0%
export const PERCENT_FORMAT = d3Format(".1%");
