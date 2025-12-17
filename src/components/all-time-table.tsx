import { Sum, sumToMapByCurrency } from "../sum";
import { descending as d3Descending, group as d3Group } from "d3-array";
import { ThPerson } from "./th-person";
import { formatAmount } from "../coins";
import { Row } from "../data";

interface TableRow {
  person: string;
  years: Map<number, Map<string, Sum>>;
  currencies: Set<string>;
  sum: Map<string, Sum>;
}

function toTableData(data: Row[]): TableRow[] {
  const byPersonByYear = d3Group(
    data,
    (d) => d.person,
    (d) => d.timestamp.getFullYear()
  );

  return Array.from(byPersonByYear.entries())
    .sort(([, byYearA], [, byYearB]) =>
      d3Descending(
        byYearA.values().reduce((sum, rows) => sum + rows.length, 0),
        byYearB.values().reduce((sum, rows) => sum + rows.length, 0)
      )
    )
    .map(([person, byYear]) => {
      const years = new Map(
        Array.from(byYear.entries()).map(([year, rows]) => {
          return [year, sumToMapByCurrency(rows)];
        })
      );

      return {
        person,
        years,
        currencies: new Set(years.values().flatMap((years) => years.keys())),
        sum: sumToMapByCurrency(Array.from(byYear.values()).flatMap((rows) => rows)),
      };
    });
}

export function AllTimeTable({ data }: { data: Row[] }) {
  const allYears = Array.from(new Set(data.map(({ timestamp }) => timestamp.getFullYear()))).sort();

  const tableRows = toTableData(data);

  return (
    <table className="width-100p">
      <thead>
        <tr>
          <th scope="col">Person</th>
          {/* <th scope="col">Division</th> */}
          <th></th>
          {allYears.map((year) => (
            <th scope="col">{year}</th>
          ))}
          <th scope="col">Total</th>
        </tr>
      </thead>
      <tbody>
        {tableRows.map(({ person, years, currencies, sum }) => (
          <>
            <tr>
              <ThPerson person={person} rowSpan={2} />
              <td></td>
              {/* <td>{toDivision(person) === Division.FAMILY ? "Family" : "Friends"}</td> */}
              {allYears.map((year) => {
                return (
                  <td>
                    {years.get(year)?.get("USD")?.count
                      ? years.get(year)?.get("USD")?.count
                      : undefined}
                  </td>
                );
              })}
              <td>{sum.get("USD")?.count}</td>
            </tr>
            <tr>
              {/* skipped */}
              <td className="td--small-caps-pre">USD</td>
              {allYears.map((year) => {
                return (
                  <td className="td--small-caps-pre">
                    {years.get(year)?.get("USD")?.sum
                      ? formatAmount(years.get(year)?.get("USD")?.sum as number, "USD")
                      : undefined}
                  </td>
                );
              })}
              <td className="td--small-caps-pre">
                {formatAmount(sum.get("USD")?.sum || 0, "USD")}
              </td>
            </tr>
          </>
        ))}
      </tbody>
    </table>
  );
}
