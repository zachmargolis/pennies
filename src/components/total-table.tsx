import { useContext } from "preact/hooks";
import { ascending as d3Ascending, descending as d3Descending, group as d3Group } from "d3-array";
import { DataContext, Division, toDivision } from "../context/data-context";
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
  const { byPerson, division } = useContext(DataContext);

  return (
    <table className="width-100p">
      <thead>
        <tr>
          <th scope="col">Person</th>
          {division === Division.FRIENDS && <th scope="col">Division</th>}
          <th scope="col">Total Pickups</th>
          <th scope="col">Total Value</th>
        </tr>
      </thead>
      <tbody>
        {byPerson.map(([person, coins]) => (
          <tr>
            <ThPerson person={person} />
            {division === Division.FRIENDS && (
              <td>{toDivision(person) === Division.FAMILY ? "Family" : "Friends"}</td>
            )}
            <td>{coins.length}</td>
            <td className="td--small-caps-pre">
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
