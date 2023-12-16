import { useContext } from "preact/hooks";
import { DataContext } from "../context/data-context";
import { COIN_MAPPING } from "../coins";
import { ThPerson } from "./th-person";

export function CoinTable() {
  const { byPerson, byCoinByPerson } = useContext(DataContext);

  const coins = Array.from(byCoinByPerson.entries()).map(([key]) => key);

  const people = byPerson.map(([person]) => person);

  return (
    <table className="width-min100p">
      <thead>
        <tr>
          <th scope="col">Person</th>
          {coins.map((coin) => (
            <th scope="col" className="tiny-header no-wrap">{COIN_MAPPING[coin].name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {people.map((person) => (
          <tr>
            <ThPerson person={person} />
            {coins.map((coin) => (
              <td>{byCoinByPerson.get(coin)?.get(person)?.length}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
