import { useContext } from "preact/hooks";
import { DataContext, Division } from "../context/data-context";

export function DivisionSelector() {
  const { division, setDivision } = useContext(DataContext);

  return (
    <form>
      <fieldset>
        <legend>Division</legend>
        <label>
          <input
            type="radio"
            name="division"
            value={Division.FAMILY}
            onChange={(e) => setDivision(Number((e.target as HTMLInputElement)?.value))}
            checked={division === Division.FAMILY}
          />{" "}
          Family only
        </label>
        <label>
          <input
            type="radio"
            name="division"
            value={Division.FRIENDS}
            checked={division === Division.FRIENDS}
            onChange={(e) => setDivision(Number((e.target as HTMLInputElement)?.value))}
          />{" "}
          Friends &amp; Family
        </label>
      </fieldset>
    </form>
  );
}
