import { format as d3Format } from "d3-format";
import { utcFormat as d3UtcFormat } from "d3-time-format";
import { NumberValue } from "d3-scale";

// 2020
export const PLAIN_NUMBER_FORMAT = d3Format("");

// 1,234
export const COMMAS_FORMAT = d3Format(",");

// $1, $2
export const USD_FORMAT = d3Format("$.0f");

// $1.00, $2.00
export const USD_FORMAT_CENTS = d3Format("$.2f");

type DateFormatter = (d: Date | NumberValue) => string;

// "Jan"
export const MONTH_FORMAT: DateFormatter = d3UtcFormat("%b") as DateFormatter;

// "Jan 1"
export const DATE_FORMAT: DateFormatter = d3UtcFormat("%b %-d") as DateFormatter;

// 10.0%
export const PERCENT_FORMAT = d3Format(".1%");
