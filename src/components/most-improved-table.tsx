import { PERCENT_FORMAT } from "../formats";
import { ThPerson } from "./th-person";
import { topN } from "../awards";
import { Row } from "../data";

export function MostImprovedPercentTable({ data }: { data: Row[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th scope="col">Person</th>
          <th scope="col">Percent Increase</th>
        </tr>
      </thead>
      <tbody>
        {topN({ data, year: 2025, count: 5, calculator: (a, b) => a / b }).map(
          ([person, change], idx) => {
            return (
              <tr>
                <ThPerson person={person}>{idx === 0 ? "🏆" : undefined}</ThPerson>
                <td>{PERCENT_FORMAT(change)}</td>
              </tr>
            );
          }
        )}
      </tbody>
    </table>
  );
}

export function MostImprovedCountTable({ data }: { data: Row[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th scope="col">Person</th>
          <th scope="col">Count Increase</th>
        </tr>
      </thead>
      <tbody>
        {topN({ data, year: 2025, count: 5, calculator: (a, b) => a - b }).map(
          ([person, change], idx) => {
            return (
              <tr>
                <ThPerson person={person}>{idx === 0 ? "🏆" : undefined}</ThPerson>
                <td>{change}</td>
              </tr>
            );
          }
        )}
      </tbody>
    </table>
  );
}
