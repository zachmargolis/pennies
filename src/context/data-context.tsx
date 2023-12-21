import { scaleOrdinal as d3ScaleOrdinal } from "d3-scale";
import { schemeSet1 as d3SchemeSet1, schemeSet2 as d3SchemeSet2 } from "d3-scale-chromatic";
import { ComponentChildren, createContext } from "preact";
import { useMemo, useState } from "preact/hooks";
import {
  InternMap,
  group as d3Group,
  max as d3Max,
  extent as d3Extent,
  ascending as d3Ascending,
  descending as d3Descending,
} from "d3-array";
import { Row } from "../data";
import { coin } from "../coins";

const ORDERED_NAMES = ["Zach", "Dad", "Mom", "Noah"];

const COLOR = d3ScaleOrdinal(d3SchemeSet1.slice(0, 4).concat(d3SchemeSet2)).domain(ORDERED_NAMES);

export enum Division {
  FAMILY = 1,
  FRIENDS = 2,
}

const FAMILY = new Set(ORDERED_NAMES);

export function toDivision(person: string): Division {
  return FAMILY.has(person) ? Division.FAMILY : Division.FRIENDS;
}

interface DataContextProviderProps {
  data: Row[];
  width: number;
  children: ComponentChildren;
}

export interface DataContextProviderInterface {
  width: number;
  color: typeof COLOR;
  currentYear: number;
  setCurrentYear: (year: number) => void;
  byYear: InternMap<number, Row[]>;
  byPersonByYear: InternMap<string, InternMap<number, Row[]>>;
  byPersonByWeekday: InternMap<string, InternMap<number, Row[]>>;
  byPerson: [string, Row[]][];
  currentYearExtent: [Date, Date];
  division: Division;
  setDivision: (division: Division) => void;
  byCoinByPerson: InternMap<string, InternMap<string, Row[]>>;
}

export const DataContext = createContext<DataContextProviderInterface>({
  color: COLOR,
  width: 0,
  currentYear: 0,
  setCurrentYear: (_year) => {},
  byYear: new InternMap(),
  byPersonByYear: new InternMap(),
  byPersonByWeekday: new InternMap(),
  byPerson: [],
  currentYearExtent: [new Date(0), new Date(0)],
  division: Division.FAMILY,
  setDivision: (_division) => {},
  byCoinByPerson: new InternMap(),
});

export function DataContextProvider({ children, data, width }: DataContextProviderProps) {
  const [currentYear, setCurrentYear] = useState(0);
  const [division, setDivision] = useState(Division.FAMILY);

  const filteredData = useMemo(
    () =>
      (data || []).filter(
        (row) => division === Division.FRIENDS || toDivision(row.person) === division
      ),
    [data, division]
  );

  const { byYear, byPersonByYear } = useMemo(
    () => ({
      byYear: d3Group(filteredData, (d) => d.timestamp.getFullYear()),
      byPersonByYear: d3Group(
        filteredData,
        (d) => d.person,
        (d) => d.timestamp.getFullYear()
      ),
    }),
    [filteredData]
  );

  if (filteredData.length && !currentYear) {
    setCurrentYear(d3Max(byYear, ([year]) => year) || 0);
  }

  const { byPerson, byPersonByWeekday, currentYearExtent, byCoinByPerson } = useMemo(() => {
    const currentYearRows = byYear.get(currentYear) || [];
    return {
      currentYearExtent: d3Extent(currentYearRows, (d) => d.timestamp) as [Date, Date],
      byPerson: Array.from(d3Group(currentYearRows, (d) => d.person).entries()).sort(
        ([aPerson, a], [bPerson, b]) =>
          d3Ascending(toDivision(aPerson), toDivision(bPerson)) || d3Descending(a.length, b.length)
      ),
      byPersonByWeekday: d3Group(
        currentYearRows,
        (d) => d.person,
        (d) => d.timestamp.getDay()
      ),
      byCoinByPerson: d3Group(
        currentYearRows,
        (d) => coin(d),
        (d) => d.person
      ),
    };
  }, [byYear, currentYear]);

  return (
    <DataContext.Provider
      value={{
        width,
        color: COLOR,
        byYear,
        byPersonByYear,
        byPersonByWeekday,
        currentYear,
        setCurrentYear,
        division,
        setDivision,
        byPerson,
        currentYearExtent,
        byCoinByPerson,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
