import { Division, toDivision } from "../context/data-context";

/**
 * <td> for a person's division (Friends or Family)
 */
export function TdDivision({ person, rowSpan }: { person: string; rowSpan?: number }) {
  return <td rowSpan={rowSpan}>{toDivision(person) === Division.FAMILY ? "Family" : "Friends"}</td>;
}
