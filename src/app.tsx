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
import {
  FriendsTable,
  InternationalRankTable,
  MostValuableTable,
  RankTable,
  RookiesTable,
} from "./components/awards-table";
import { RankMode } from "./awards";
import { RelativeFrequencyChart } from "./components/relative-frequency-chart";
import { LinkableH1, LinkableH2, LinkableH3, LinkableH4 } from "./components/linkable-heading";

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
        <LinkableH1 id="pennies">
          Pennies!{" "}
          <small>
            By <a href="/">Zach Margolis</a>
          </small>
        </LinkableH1>
        <p>
          This is my annual found change report! It started out with just my family in 2017. In
          2022, a few friends started contributing as well and it's become one of my most favorite
          annual traditions to look back at the year. It's our friendly little competition, and
          everyone's a winner (and I'm the biggest winner).
        </p>
        <LinkableH2>Results</LinkableH2>
        <p class="margin-after-none">
          Looking at year-over-year summaries for just my family, I am maintaining my lead, while
          Mom has continued to find success after her big improvment last year. Dad improved a lot
          this year compared to last, and Noah continues to participate.
        </p>
        <div className="overflow-x-scroll overflow-x-padding">
          <LinkableH3>By Count</LinkableH3>
          <YearOverYearLineChart
            data={data}
            height={200}
            mode={Mode.COUNT}
            leaderboardFriendsCount={3}
          />
          <LinkableH3>
            By Amount <small>(USD only)</small>
          </LinkableH3>
          <YearOverYearLineChart
            data={data}
            height={150}
            mode={Mode.AMOUNT_USD}
            leaderboardFriendsCount={3}
          />
        </div>
        <h3>
          By Rank <small>(by count)</small>
        </h3>
        <div className="overflow-x-scroll overflow-x-padding">
          <BumpChart height={180} />
        </div>
        <div>
          <div className="sticky-header">
            <LinkableH2>Year in Detail</LinkableH2>
            <YearSelector />
            {isInteractive && <DivisionSelector />}
          </div>

          <TotalTable />

          <LinkableH3>Timeline</LinkableH3>
          <div className="overflow-x-scroll overflow-x-padding">
            <BeePlot />
          </div>
          <div>
            <Legend />
          </div>

          <LinkableH3>Streaks</LinkableH3>
          <p>A streak is two or more consecutive days of finds.</p>
          <StreaksTable />

          <LinkableH3 className="clearfix">By Weekday</LinkableH3>
          <p>Number of pickups by weekday</p>

          <div className="overflow-x-scroll overflow-x-padding">
            <WeekdayChart />
          </div>

          <h3 className="clearfix">By Type</h3>
          <div className="overflow-x-scroll">
            <CoinTable />
          </div>
          <h2>Awards</h2>
          <p>
            As this report has gotten bigger and bigger each year, I think it's easy to lose track
            of how much is going on. I've added these awards to highlight a few different kinds of
            contributions.
          </p>
          <h3>Top Friends</h3>
          <p>
            Since this project started out as family-only, I think it's important to recognize the
            friends who are holding their own! Inspired by MySpace, this award category has up to 8
            top friends.
          </p>
          <FriendsTable data={data} count={8} />
          <LinkableH3>Rookie of the Year</LinkableH3>
          <p>Awarded to the new person this year who found the most things.</p>
          <RookiesTable data={data} />
          <LinkableH3>Most Improved</LinkableH3>
          <p>
            Awarded to the people who found the most compared to the previous year, by percent and
            by count.
          </p>
          <LinkableH4 id="most-improved-by-count">By Count</LinkableH4>
          <RankTable data={data} mode={RankMode.COUNT} />
          <LinkableH4>By Percent Increase</LinkableH4>
          <RankTable data={data} mode={RankMode.PERCENT} />
          <LinkableH3>Most Valuable</LinkableH3>
          <p>Awarded to the person with the highest value finds.</p>
          <MostValuableTable data={data} />
          <LinkableH3>International They/Them of Mystery</LinkableH3>
          <p>
            Awarded to the person who found the most non-USD items. The cool thing about this award
            is that it usually correlates with international travel, it doesn't always! I've found
            Euros and Pesos here in San Francisco.
          </p>
          <InternationalRankTable data={data} count={10} />
        </div>
        <LinkableH2>Additional All-Time Data</LinkableH2>
        <LinkableH3 id="frequencies-over-time">
          Frequencies Over Time <small>(by quarter of a year)</small>
        </LinkableH3>
        <p>
          In early November 2025, the US Treasury stopped distributing pennies. I added this chart
          that shows the frequency of the top few coins and bills found over time, wondering if we
          would be able to see an effect from the discontinuation of the penny. The chart is
          bucketed quarterly, and it's been less than a full quarter since the end, so it's a little
          hard to say. Next year this might be a much more interesting chart!
        </p>
        <div className="overflow-x-scroll">
          <RelativeFrequencyChart height={250} data={data} topN={5} />
        </div>
        <LinkableH3>All-Time Counts</LinkableH3>
        <div className="overflow-x-scroll">
          <AllTimeTable data={data} />
        </div>
        <LinkableH2>Methodology</LinkableH2>
        <p>
          We take pictures of coins or bills we find on the ground (either in situ or once they've
          been picked up). For family members, we have a group text chat where we sent pictures and
          notes. Friends send me their pictures and notes individually (text messages, Instagram
          DMs, Snapchats). Almost all change is fair game, but we don't allow deliberately left
          change: coins left in fountains, "leave a penny take a penny" bowls.
        </p>
        <p>
          Each year, I manually scroll through our family's message history and log the results in a
          spreadsheet. I lightly process and turn that spreadsheet into a CSV used to power these
          visualizations. Most of the time we note what coins we find (such as "a scuffed penny" or
          "a dime and a nickel") but sometimes we forget, so I have to take a guess (a blurry dime
          and nickel with no reference are hard to tell apart). For friends, I enter them in the
          spreadsheet as soon as they send them to me, because I don't want to forget where sent it.
        </p>
        <p>
          Feel free to{" "}
          <a href="https://github.com/zachmargolis/pennies">check out the source on GitHub!</a>
        </p>
      </article>
    </DataContextProvider>
  );
}
