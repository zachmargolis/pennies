import { descending as d3Descending, ascending as d3Ascending, group as d3Group } from "d3-array";
import { ThPerson } from "./th-person";
import { Row } from "../data";
import { toDivision } from "../context/data-context";

export function AllTimeTable({ data }: { data: Row[] }) {
  const allYears = Array.from(new Set(data.map(({ timestamp }) => timestamp.getFullYear()))).sort();

  const byPersonByYear = d3Group(
    data,
    (d) => d.person,
    (d) => d.timestamp.getFullYear()
  );

  const rows = Array.from(byPersonByYear.entries()).sort(
    ([personA, byYearA], [personB, byYearB]) =>
      d3Ascending(toDivision(personA), toDivision(personB)) ||
      d3Descending(
        byYearA.values().reduce((sum, rows) => sum + rows.length, 0),
        byYearB.values().reduce((sum, rows) => sum + rows.length, 0)
      ) ||
      d3Ascending(personA, personB)
  );

  return (
    <table className="width-100p">
      <thead>
        <tr>
          <th scope="col">Person</th>
          {allYears.map((year) => (
            <th scope="col">{year}</th>
          ))}
          <th scope="col">Total</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([person, byYear]) => {
          return (
            <tr>
              <ThPerson person={person} />
              {allYears.map((year) => (
                <td>{byYear.get(year)?.length}</td>
              ))}
              <td>{Array.from(byYear.values()).flatMap((rows) => rows).length}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
