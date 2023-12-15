import { useContext } from "preact/hooks";
import { DataContext } from "../context/data-context";
import { COIN_MAPPING } from "../coins";

export function CoinTable() {
  const { color, byPerson, byCoinByPerson } = useContext(DataContext);

  const coins = Array.from(byCoinByPerson.entries()).map(([key]) => key);

  const people = byPerson.map(([person]) => person);

  return (
    <table>
      <thead>
        <tr>
          <th>Person</th>
          {coins.map((coin) => (
            <th className="tiny-header no-wrap">{COIN_MAPPING[coin].name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {people.map((person) => (
          <tr>
            <th className="no-wrap">
              {person} <span style={`color: ${color(person)}`}>●</span>
            </th>
            {coins.map((coin) => (
              <td>{byCoinByPerson.get(coin)?.get(person)?.length}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
