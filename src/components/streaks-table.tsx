import { useContext } from "preact/hooks";
import { ascending as d3Ascending, descending as d3Descending } from "d3-array";
import { DataContext } from "../context/data-context";
import { ThPerson } from "./th-person";
import { TdDivision } from "./td-division";
import { Streak, toStreaks } from "../streaks";

export function StreaksTable() {
  const { byPerson } = useContext(DataContext);

  return (
    <table className="width-100p">
      <thead>
        <tr>
          <th scope="col">Person</th>
          <th scope="col">Division</th>
          <th scope="col">Number of streaks</th>
          <th scope="col">Longest streak</th>
        </tr>
      </thead>
      <tbody>
        {byPerson
          .map(
            ([person, coins]) =>
              [person, toStreaks(coins).sort((a, b) => d3Descending(a.days, b.days))] as [
                string,
                Streak[],
              ]
          )
          .filter(([, streaks]) => streaks.length)
          .sort(
            ([personA, streaksA], [personB, streaksB]) =>
              d3Descending(streaksA.length, streaksB.length) || d3Ascending(personA, personB)
          )
          .map(([person, streaks]) => {
            const longestStreak = streaks[0];

            return (
              <tr>
                <ThPerson person={person} />
                <TdDivision person={person} />
                <td>{streaks.length > 0 ? streaks.length : undefined}</td>
                <td>{longestStreak ? `${longestStreak.days} days` : undefined}</td>
              </tr>
            );
          })}
      </tbody>
    </table>
  );
}
