import { PERCENT_FORMAT } from "../formats";
import { ThPerson } from "./th-person";
import { topInternational, topN, topRookies } from "../awards";
import { Row } from "../data";
import { useContext } from "preact/hooks";
import { DataContext } from "../context/data-context";
import { formatAmount } from "../coins";

export enum RankMode {
  COUNT,
  PERCENT,
}

function rankCalculator(mode: RankMode): (a: number, b: number) => number {
  switch (mode) {
    case RankMode.COUNT:
      return (a, b) => a - b;
    case RankMode.PERCENT:
      return (a, b) => a / b;
    default:
      throw new Error(`Unknow mode=${mode}`);
  }
}

function rankEmoji(rank: number): string | undefined {
  switch (rank) {
    case 0:
      return "🥇";
    case 1:
      return "🥈";
    case 2:
      return "🥉";
    default:
      return;
  }
}

export function RookiesTable({ data, count = 5 }: { data: Row[]; count?: number }) {
  const { currentYear: year } = useContext(DataContext);

  return (
    <table className="width-100p">
      <thead>
        <tr>
          <th scope="col">Person</th>
          <th scope="col">{year}</th>
        </tr>
      </thead>
      <tbody>
        {topRookies({ data, year, count }).map(({ person, thisYear }, idx) => {
          return (
            <tr>
              <ThPerson person={person}>{rankEmoji(idx)}</ThPerson>
              <td>{thisYear}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function RankTable({
  data,
  mode,
  count = 5,
}: {
  data: Row[];
  mode: RankMode;
  count?: number;
}) {
  const { currentYear: year } = useContext(DataContext);

  return (
    <table className="width-100p">
      <thead>
        <tr>
          <th scope="col">Person</th>
          <th scope="col">Improvement</th>
          <th scope="col">{year}</th>
          <th scope="col">{year - 1}</th>
        </tr>
      </thead>
      <tbody>
        {topN({ data, year, count, calculator: rankCalculator(mode) }).map(
          ({ person, change, thisYear, lastYear }, idx) => {
            return (
              <tr>
                <ThPerson person={person}>{rankEmoji(idx)}</ThPerson>
                <td>+{mode == RankMode.PERCENT ? PERCENT_FORMAT(change) : change}</td>
                <td>{thisYear}</td>
                <td>{lastYear}</td>
              </tr>
            );
          }
        )}
      </tbody>
    </table>
  );
}

export function InternationalRankTable({ data, count = 5 }: { data: Row[]; count?: number }) {
  const { currentYear: year } = useContext(DataContext);

  return (
    <table className="width-100p">
      <thead>
        <tr>
          <th scope="col">Person</th>
          <th scope="col">Count</th>
          <th scope="col">Totals</th>
        </tr>
      </thead>
      <tbody>
        {topInternational({ data, year, count }).map(({ person, currencyCounts }, idx) => (
          <tr>
            <ThPerson person={person}>{rankEmoji(idx)}</ThPerson>
            <td>{currencyCounts.reduce((acc, { count }) => acc + count, 0)}</td>
            <td className="td--small-caps-pre">
              {currencyCounts
                .map(({ currency, value }) => `${formatAmount(value, currency)} ${currency}`)
                .join("\n")}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
