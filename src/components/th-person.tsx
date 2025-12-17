import { useContext } from "preact/hooks";
import { DataContext } from "../context/data-context";

/**
 * <th> for a person
 */
export function ThPerson({ person, rowSpan }: { person: string; rowSpan?: number }) {
  const { color } = useContext(DataContext);

  return (
    <th scope="row" className="no-wrap" rowSpan={rowSpan}>
      <span style={`color: ${color(person)}`}>●</span> {person}
    </th>
  );
}
