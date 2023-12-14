import { scaleOrdinal as d3ScaleOrdinal } from "d3-scale";
import { schemeSet1 as d3SchemeSet1 } from "d3-scale-chromatic";
import { ComponentChildren, createContext } from "preact";
import { useMemo } from "preact/hooks";
import { InternMap, group as d3Group } from "d3-array";
import { Row } from "../data";

const ORDERED_NAMES = [
  'Zach',
  'Dad',
  'Mom',
  'Noah',
];

const COLOR = d3ScaleOrdinal(d3SchemeSet1).domain(ORDERED_NAMES);

interface DataContextProviderProps {
  data: Row[];
  width: number;
  children: ComponentChildren;
}

export interface DataContextProviderInterface {
  width: number;
  data: Row[];
  color: typeof COLOR;
  byYear: InternMap<number, Row[]>;
  byPersonByYear: InternMap<string, InternMap<number, Row[]>>;
}

export const DataContext = createContext<DataContextProviderInterface>({
  color: COLOR,
  width: 0,
  data: [],
  byYear: new InternMap(),
  byPersonByYear: new InternMap(),
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

  return <DataContext.Provider
    value={{
      width,
      color: COLOR,
      data,
      byYear,
      byPersonByYear,
    }}
  >
    {children}
  </DataContext.Provider>;
}
