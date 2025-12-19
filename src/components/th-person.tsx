import { useContext } from "preact/hooks";
import { DataContext } from "../context/data-context";
import { ComponentChildren } from "node_modules/preact/src";

/**
 * <th> for a person
 */
export function ThPerson({
  person,
  rowSpan,
  children,
}: {
  person: string;
  rowSpan?: number;
  children?: ComponentChildren;
}) {
  const { color } = useContext(DataContext);

  return (
    <th scope="row" className="no-wrap" rowSpan={rowSpan}>
      <span style={`color: ${color(person)}`}>●</span> {person}
      {children}
    </th>
  );
}
