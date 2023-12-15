import { scaleOrdinal as d3ScaleOrdinal } from "d3-scale";
import { schemeSet1 as d3SchemeSet1 } from "d3-scale-chromatic";
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

const ORDERED_NAMES = ["Zach", "Dad", "Mom", "Noah"];

const COLOR = d3ScaleOrdinal(d3SchemeSet1).domain(ORDERED_NAMES);

enum Division {
  FAMILY = 1,
  FRIENDS = 2,
}

const FAMILY = new Set(ORDERED_NAMES);

function division(person: string): Division {
  return FAMILY.has(person) ? Division.FAMILY : Division.FRIENDS;
}

interface DataContextProviderProps {
  data: Row[];
  width: number;
  children: ComponentChildren;
}

export interface DataContextProviderInterface {
  width: number;
  data: Row[];
  color: typeof COLOR;
  currentYear: number;
  setCurrentYear: (year: number) => void;
  byYear: InternMap<number, Row[]>;
  byPersonByYear: InternMap<string, InternMap<number, Row[]>>;
  currentYearByPerson: [string, Row[]][];
  currentYearExtent: [Date, Date];
}

export const DataContext = createContext<DataContextProviderInterface>({
  color: COLOR,
  width: 0,
  currentYear: 0,
  setCurrentYear: (_year) => {},
  data: [],
  byYear: new InternMap(),
  byPersonByYear: new InternMap(),
  currentYearByPerson: [],
  currentYearExtent: [new Date(0), new Date(0)],
});

export function DataContextProvider({ children, data, width }: DataContextProviderProps) {
  const { byYear, byPersonByYear } = useMemo(
    () => ({
      byYear: d3Group(data, (d) => d.timestamp.getFullYear()),
      byPersonByYear: d3Group(
        data,
        (d) => d.person,
        (d) => d.timestamp.getFullYear()
      ),
    }),
    [data]
  );

  const [currentYear, setCurrentYear] = useState(0);

  const { currentYearByPerson, currentYearExtent } = useMemo(() => {
    const yearRows = byYear.get(currentYear) || [];
    return {
      currentYearExtent: d3Extent(yearRows, (d) => d.timestamp),
      currentYearByPerson: Array.from(d3Group(yearRows, (d) => d.person).entries()).sort(
        ([aPerson, a], [bPerson, b]) =>
          d3Ascending(division(aPerson), division(bPerson)) || d3Descending(a.length, b.length)
      ),
    };
  }, [data, currentYear]);

  if (data.length && !currentYear) {
    setCurrentYear(d3Max(byYear, ([year]) => year) || 0);
  }

  return (
    <DataContext.Provider
      value={{
        width,
        color: COLOR,
        data,
        byYear,
        byPersonByYear,
        currentYear,
        setCurrentYear,
        currentYearByPerson,
        currentYearExtent,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
