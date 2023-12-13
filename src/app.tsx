export function App() {
  return <article>
    <h1>
      Pennies!
      {" "}
      <small>By <a href="/">Zach Margolis</a></small>
    </h1>

    <p>This is the change that my family and I have found in every year since 2017. It's our friendly little competition, and everyone's a winner (and I'm the biggest winner).</p>

    <h2>
      Results
    </h2>

    <p>Total coins picked up, year-over-year</p>

    <div class="year-over-year overflow-x-scroll overflow-x-padding"></div>

    <h2 class="sticky-header">
      Year in Detail
      <ul class="year-selector"></ul>
    </h2>

    <div class="by-person"></div>

    <h3>Timeline</h3>
    <div class="by-time overflow-x-scroll overflow-x-padding"></div>
    <ul class="coin-legend no-bullet"></ul>

    <h3 class="clearfix">By Weekday</h3>
    <p>Number of coins picked up by weekday</p>
    <div class="by-weekday overflow-x-scroll overflow-x-padding"></div>

    <h3 class="clearfix">By Coin</h3>
    <div class="by-coin-table overflow-x-scroll"></div>

    <br />
    <br />

    <h2>Methodology</h2>

    <p>We take pictures of coins we find on the ground (either in situ or once they've been picked up) and then
    message the pictures to a group chat with all of us. Almost all change is fair game, but we don't allow fishing
    in fountains (deliberately left change).</p>

    <p>Each year, I manually scroll through our message history and log the results in a spreadsheet. I lightly
    process and turn that spreadsheet into a CSV used to power these visualizations. Most of the time we note what
    coins we find (such as "a scuffed penny" or "a dime and a nickel") but sometimes we forget, so I have to take a
    guess (a blurry dime and nickel with no reference are hard to tell apart).</p>

    <p>Feel free to <a href="https://github.com/zachmargolis/pennies">check out the source on GitHub!</a></p>
  </article>;
}