import { PERCENT_FORMAT } from "../formats";
import { ThPerson } from "./th-person";
import { RankMode, topInternational, topN, topRookies } from "../awards";
import { Row } from "../data";
import { useContext } from "preact/hooks";
import { DataContext } from "../context/data-context";
import { formatAmount } from "../coins";
import { TdDivision } from "./td-division";

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

  if (year === 2017) {
    return (
      <p>
        <small>(not available for the first year)</small>
      </p>
    );
  }

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

  if (year === 2017) {
    return (
      <p>
        <small>(not available for the first year)</small>
      </p>
    );
  }

  return (
    <table className="width-100p">
      <thead>
        <tr>
          <th scope="col">Person</th>
          <th scope="col">Division</th>
          <th scope="col">Improvement</th>
          <th scope="col">{year}</th>
          <th scope="col">{year - 1}</th>
        </tr>
      </thead>
      <tbody>
        {topN({ data, year, count, mode }).map(
          ({ person, change, thisYear, lastYear }, idx) => {
            return (
              <tr>
                <ThPerson person={person}>{rankEmoji(idx)}</ThPerson>
                <TdDivision person={person} />
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
    <table className="width-100p align-top">
      <thead>
        <tr>
          <th scope="col">Person</th>
          <th scope="col">Division</th>
          <th scope="col">Total</th>
          <th scope="col">Currency</th>
          <th scope="col">Count</th>
          <th scope="col">Amount</th>
        </tr>
      </thead>
      <tbody>
        {topInternational({ data, year, count }).map(({ person, currencyCounts }, idx) => (
          <>
            <tr>
              <ThPerson person={person} rowSpan={currencyCounts.length}>
                {rankEmoji(idx)}
              </ThPerson>
              <TdDivision person={person} rowSpan={currencyCounts.length} />
              <td rowSpan={currencyCounts.length}>
                {currencyCounts.reduce((acc, { count }) => acc + count, 0)}
              </td>
              {currencyCounts.slice(0, 1).map(({ currency, value, count }) => (
                <>
                  <td className="td--small-caps-pre">{currency}</td>
                  <td>{count}</td>
                  <td className="td--small-caps-pre">
                    {formatAmount(value, currency)} {currency}
                  </td>
                </>
              ))}
            </tr>
            {currencyCounts.slice(1).map(({ currency, value, count }) => (
              <tr>
                <td className="text-right td--small-caps-pre">{currency}</td>
                <td>{count}</td>
                <td className="td--small-caps-pre">
                  {formatAmount(value, currency)} {currency}
                </td>
              </tr>
            ))}
          </>
        ))}
      </tbody>
    </table>
  );
}
