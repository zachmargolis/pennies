import { useContext } from "preact/hooks";
import { DataContext, Division, toDivision } from "../context/data-context";
import { formatAmount } from "../coins";
import { ThPerson } from "./th-person";
import { sumByCurrency } from "../sum";

export function TotalTable() {
  const { byPerson, division } = useContext(DataContext);

  return (
    <table className="width-100p">
      <thead>
        <tr>
          <th scope="col">Person</th>
          {division === Division.FRIENDS && <th scope="col">Division</th>}
          <th scope="col">Count</th>
          <th scope="col">Value</th>
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
                .map(({ currency, sum }) => `${formatAmount(sum, currency)} ${currency}`)
                .join("\n")}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
