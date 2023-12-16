import { Row } from "./data";
import { YearOverYearLineChart } from "./components/year-over-year-line-chart";
import "./stylesheets/styles.css";
import { DataContextProvider } from "./context/data-context";
import { YearSelector } from "./components/year-selector";
import { TotalTable } from "./components/total-table";
import { BeePlot, Legend } from "./components/beeplot";
import { DivisionSelector } from "./components/division-selector";
import { WeekdayChart } from "./components/weekday-chart";
import { CoinTable } from "./components/coin-table";
import { YearOverYearBarChart } from "./components/year-over-year-bar-chart";

const WIDTH = 510;

export function App({ data, isInteractive }: { data: Row[] | undefined; isInteractive: Boolean }) {
  return (
    <DataContextProvider data={data || []} width={WIDTH}>
      <article>
        <h1>
          Pennies!{" "}
          <small>
            By <a href="/">Zach Margolis</a>
          </small>
        </h1>

        <p>
          This is the change that my family (and also a few friends) and I have found in every year
          since 2017. It's our friendly little competition, and everyone's a winner (and I'm the
          biggest winner).
        </p>

        <h2>Results</h2>

        <p>Total coins picked up, year-over-year</p>

        <div className="overflow-x-scroll overflow-x-padding">{<YearOverYearLineChart />}</div>

        <div className="overflow-x-scroll overflow-x-padding">{<YearOverYearBarChart />}</div>


        <div className="sticky-header">
          <h2>Year in Detail {<YearSelector />}</h2>
          {isInteractive && <DivisionSelector />}
        </div>

        {<TotalTable />}

        <h3>Timeline</h3>
        <div className="overflow-x-scroll overflow-x-padding">{<BeePlot />}</div>
        {<Legend />}

        <h3 className="clearfix">By Weekday</h3>
        <p>Number of coins picked up by weekday</p>

        <div className="overflow-x-scroll overflow-x-padding">{<WeekdayChart />}</div>

        <h3 className="clearfix">By Coin</h3>
        <div className="overflow-x-scroll">{<CoinTable />}</div>

        <br />
        <br />

        <h2>Methodology</h2>

        <p>
          We take pictures of coins we find on the ground (either in situ or once they've been
          picked up) and then message the pictures to a group chat with all of us. Almost all change
          is fair game, but we don't allow fishing in fountains (deliberately left change).
        </p>

        <p>
          Each year, I manually scroll through our message history and log the results in a
          spreadsheet. I lightly process and turn that spreadsheet into a CSV used to power these
          visualizations. Most of the time we note what coins we find (such as "a scuffed penny" or
          "a dime and a nickel") but sometimes we forget, so I have to take a guess (a blurry dime
          and nickel with no reference are hard to tell apart).
        </p>

        <p>
          Feel free to{" "}
          <a href="https://github.com/zachmargolis/pennies">check out the source on GitHub!</a>
        </p>
      </article>
    </DataContextProvider>
  );
}
