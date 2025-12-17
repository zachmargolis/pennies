import { Row } from "./data";
import { Mode, YearOverYearLineChart } from "./components/year-over-year-line-chart";
import "./stylesheets/styles.css";
import { DataContextProvider } from "./context/data-context";
import { YearSelector } from "./components/year-selector";
import { TotalTable } from "./components/total-table";
import { BeePlot, Legend } from "./components/beeplot";
import { DivisionSelector } from "./components/division-selector";
import { WeekdayChart } from "./components/weekday-chart";
import { CoinTable } from "./components/coin-table";
import { StreaksTable } from "./components/streaks-table";
import { BumpChart } from "./components/bump-chart";
import { AllTimeTable } from "./components/all-time-table";

const WIDTH = 510;

export function App({
  data = [],
  isInteractive,
}: {
  data: Row[] | undefined;
  isInteractive: Boolean;
}) {
  return (
    <DataContextProvider data={data} width={WIDTH}>
      <article>
        <h1>
          Pennies!{" "}
          <small>
            By <a href="/">Zach Margolis</a>
          </small>
        </h1>

        <p>
          This is the change that my family and I have found in every year since 2017, and a few
          friends started contributing in 2022. It's our friendly little competition, and everyone's
          a winner (and I'm the biggest winner).
        </p>

        <h2>Results</h2>
        <p class="margin-after-none">Year-over-year summaries</p>

        <div className="overflow-x-scroll overflow-x-padding">
          <h3>By Count</h3>
          <YearOverYearLineChart height={200} mode={Mode.COUNT} leaderboardFriendsCount={3} />
          <h3>
            By Amount <small>(USD only)</small>
          </h3>
          <YearOverYearLineChart height={150} mode={Mode.AMOUNT_USD} leaderboardFriendsCount={5} />
        </div>
        <h3>
          By Rank <small>(by count)</small>
        </h3>
        <div className="overflow-x-scroll overflow-x-padding">
          <BumpChart height={150} />
        </div>

        <AllTimeTable data={data} />

        <div className="sticky-header">
          <h2>Year in Detail</h2>
          <YearSelector />
          {isInteractive && <DivisionSelector />}
        </div>

        <TotalTable />

        <h3>Timeline</h3>
        <div className="overflow-x-scroll overflow-x-padding">
          <BeePlot />
        </div>
        <Legend />

        <h3>Streaks</h3>
        <p>A streak is two or more consecutive days of finds.</p>
        <StreaksTable />

        <h3 className="clearfix">By Weekday</h3>
        <p>Number of pickups by weekday</p>

        <div className="overflow-x-scroll overflow-x-padding">
          <WeekdayChart />
        </div>

        <h3 className="clearfix">By Type</h3>
        <div className="overflow-x-scroll">
          <CoinTable />
        </div>

        <h2>Methodology</h2>

        <p>
          We take pictures of coins or bills we find on the ground (either in situ or once they've
          been picked up). For family members, we have a group text chat where we sent pictures and
          notes. Friends send me their pictures and notes individually. Almost all change is fair
          game, but we don't allow fishing in fountains (deliberately left change).
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
