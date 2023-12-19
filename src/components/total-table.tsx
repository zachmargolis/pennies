import { useContext } from "preact/hooks";
import { ascending as d3Ascending, descending as d3Descending, group as d3Group } from "d3-array";
import { DataContext } from "../context/data-context";
import { Row } from "../data";
import { formatAmount } from "../coins";
import { ThPerson } from "./th-person";

function sumByCurrency(rows: Row[]): [string, number][] {
  return Array.from(d3Group(rows, (d) => d.currency).entries())
    .map(([currency, currencyRows]) => ({
      currency,
      count: currencyRows.length,
      sum: currencyRows.reduce((acc, d) => acc + d.denomination, 0),
    }))
    .sort((a, b) => d3Descending(a.count, b.count) || d3Ascending(a.currency, b.currency))
    .map(({ currency, sum }) => [currency, sum]);
}

export function TotalTable() {
  const { byPerson } = useContext(DataContext);

  return (
    <table className="width-100p">
      <thead>
        <tr>
          <th scope="col">Person</th>
          <th scope="col">Total Coins</th>
          <th scope="col">Total Value</th>
        </tr>
      </thead>
      <tbody>
        {byPerson.map(([person, coins]) => (
          <tr>
            <ThPerson person={person} />
            <td>{coins.length}</td>
            <td>
              {sumByCurrency(coins)
                .map(([currency, sum]) => `${formatAmount(sum, currency)} ${currency}`)
                .join("\n")}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}