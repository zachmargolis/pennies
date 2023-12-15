import { useContext } from "preact/hooks";
import { ascending as d3Ascending, descending as d3Descending, group as d3Group } from "d3-array";
import { DataContext } from "../context/data-context";
import { Row } from "../data";
import { formatAmount } from "../coins";

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
  const { color, byPerson } = useContext(DataContext);

  return (
    <table className="width-100p">
      <thead>
        <tr>
          <th>Person</th>
          <th>Total Coins</th>
          <th>Total Value</th>
        </tr>
      </thead>
      <tbody>
        {byPerson.map(([person, coins]) => (
          <tr>
            <th>
              {person} <span style={`color: ${color(person)}`}>●</span>
            </th>
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
