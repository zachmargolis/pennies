import { useContext } from "preact/hooks";
import { DataContext } from "../context/data-context";

export function YearSelector() {
  const { byYear, currentYear, setCurrentYear } = useContext(DataContext);

  const possibleYears = Array.from(byYear.keys());

  return (
    <>
      <div className="year-selector">
        {possibleYears.map((year) => (
          <a
            className={["year-link", year === currentYear ? "active" : ""]
              .filter(Boolean)
              .join(" ")}
            href={`?year=${year}`}
            onClick={(event) => {
              event.preventDefault();
              setCurrentYear(year);
              return false;
            }}
          >
            {year}
          </a>
        ))}
      </div>
    </>
  );
}
