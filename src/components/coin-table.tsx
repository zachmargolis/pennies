import { useContext } from "preact/hooks";
import { ascending as d3Ascending } from "d3-array";
import { DataContext } from "../context/data-context";
import { COIN_MAPPING } from "../coins";
import { ThPerson } from "./th-person";
import { HtmlCoin } from "./coin";

export function CoinTable() {
  const { byPerson, byCoinByPerson } = useContext(DataContext);

  const coinMappingKeys = Object.keys(COIN_MAPPING);

  const coins = Array.from(byCoinByPerson.entries())
    .map(([key]) => key)
    .sort((a, b) => d3Ascending(coinMappingKeys.indexOf(a), coinMappingKeys.indexOf(b)));

  const people = byPerson.map(([person]) => person);

  return (
    <table className="width-min100p">
      <thead>
        <tr>
          <th scope="col"></th>
          {coins.map((coin) => (
            <th scope="col" className="tiny-header no-wrap">
              <HtmlCoin coinData={COIN_MAPPING[coin]} spacing={3} />
            </th>
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
