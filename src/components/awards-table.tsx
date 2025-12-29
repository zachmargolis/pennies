import { PERCENT_FORMAT } from "../formats";
import { ThPerson } from "./th-person";
import { RankMode, topFriends, topInternational, topN, topRookies, topValues } from "../awards";
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

export function FriendsTable({ data, count = 5 }: { data: Row[]; count?: number }) {
  const { currentYear: year } = useContext(DataContext);

  const rows = topFriends({ data, count, year });

  if (!rows.length) {
    return (
      <p>
        <small>(no friends entries for this year)</small>
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
        {rows.map(({ person, thisYear }, idx) => {
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

  const rows = topN({ data, year, count, mode });

  if (!rows.length) {
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
        {rows.map(({ person, change, thisYear, lastYear }, idx) => {
          return (
            <tr>
              <ThPerson person={person}>{rankEmoji(idx)}</ThPerson>
              <TdDivision person={person} />
              <td>+{mode == RankMode.PERCENT ? PERCENT_FORMAT(change) : change}</td>
              <td>{thisYear}</td>
              <td>{lastYear}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function InternationalRankTable({ data, count = 5 }: { data: Row[]; count?: number }) {
  const { currentYear: year } = useContext(DataContext);

  const rows = topInternational({ data, year, count });

  if (!rows.length) {
    return (
      <p>
        <small>(no international coins this year)</small>
      </p>
    );
  }

  return (
    <table className="width-100p table--inner-borders">
      <thead>
        <tr>
          <th scope="col">Person</th>
          <th scope="col">Division</th>
          <th scope="col">
            <span class="visible--wide">Total</span>
            <span class="visible--narrow">∑</span>
          </th>
          <th scope="col">
            <span class="visible--wide">Currency</span>
            <span class="visible--narrow">$</span>
          </th>
          <th scope="col">
            <span class="visible--wide">Count</span>
            <span class="visible--narrow">#</span>
          </th>
          <th scope="col">Amount</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ person, currencyCounts }, idx) => (
          <>
            <tr className="table-row--inner-border-top">
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

export function MostValuableTable({ data, count = 5 }: { data: Row[]; count?: number }) {
  const { currentYear: year } = useContext(DataContext);

  const rows = topValues({ data, year, count });

  return (
    <table className="width-100p table">
      <thead>
        <tr>
          <th scope="col">Person</th>
          <th scope="col">Division</th>
          <th scope="col">Amount</th>
          <th scope="col">Count</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ person, value, currency, count }, idx) => (
          <tr>
            <ThPerson person={person}>{rankEmoji(idx)}</ThPerson>
            <TdDivision person={person} />
            <td className="td--small-caps-pre">
              {formatAmount(value, currency)} {currency}
            </td>
            <td>{count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
