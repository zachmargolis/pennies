import { useContext } from "preact/hooks";
import { ascending as d3Ascending } from "d3-array";
import { DataContext } from "../context/data-context";
import { COIN_MAPPING } from "../coins";
import { ThPerson } from "./th-person";
import { Coin, ITEM_SIZE } from "./coin";
import { translate } from "../svg";

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
              {COIN_MAPPING[coin]?.name || "MISSING"}
            </th>
          ))}
        </tr>
        <tr>
          <th scope="col">Person</th>
          {coins.map((coin) => (
            <th>
              <svg height={ITEM_SIZE * 2} width={ITEM_SIZE * 2}>
                <g transform={translate(ITEM_SIZE, ITEM_SIZE)}>
                  <Coin coinData={COIN_MAPPING[coin]} />
                </g>
              </svg>
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
