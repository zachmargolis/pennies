import { group as d3Group, descending as d3Descending } from "d3-array";
import { Row } from "./data";

export function topN({
  calculator,
  data,
  year,
  count,
}: {
  calculator: (thisYear: number, lastYear: number) => number;
  data: Row[];
  year: number;
  count: number;
}): [string, number][] {
  const byPersonByYear = d3Group(
    data,
    ({ person }) => person,
    ({ timestamp }) => timestamp.getFullYear()
  );

  const changes = Array.from(byPersonByYear.keys())
    .map((person) => {
      const thisYearCount = byPersonByYear.get(person)?.get(year)?.length;
      const lastYearCount = byPersonByYear.get(person)?.get(year - 1)?.length;

      if (
        thisYearCount !== undefined &&
        lastYearCount !== undefined &&
        thisYearCount > lastYearCount
      ) {
        return [person, calculator(thisYearCount, lastYearCount)];
      } else {
        return [person, undefined];
      }
    })
    .filter(([_person, change]) => change !== undefined) as [string, number][];

  console.log(changes);

  return changes
    .sort(([_personA, changeA], [_personB, changeB]) => d3Descending(changeA, changeB))
    .slice(0, count);
}
