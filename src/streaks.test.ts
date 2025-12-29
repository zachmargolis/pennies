import { Row } from "./data";
import { toStreaks } from "./streaks";
import { describe, it, expect } from "vitest";

describe("streaks", () => {
  function buildRow(timestampString: string): Row {
    return {
      person: "A",
      timestamp: new Date(timestampString),
      currency: "USD",
      denomination: 1,
    };
  }

  it("calculates consecutive streaks from input data", () => {
    const data: Row[] = [
      // 1-day, not a streak
      buildRow("2025-01-01"),
      // 2-day streak
      buildRow("2025-01-03"),
      buildRow("2025-01-04"),
      // 3-day streak
      buildRow("2025-01-06"),
      buildRow("2025-01-07"),
      buildRow("2025-01-08"),
      buildRow("2025-01-08"),
    ];

    const result = toStreaks(data);

    expect(result).to.deep.equal([
      {
        start: new Date("2025-01-03"),
        end: new Date("2025-01-04"),
        days: 2,
        coins: 2,
      },
      {
        start: new Date("2025-01-06"),
        end: new Date("2025-01-08"),
        days: 3,
        coins: 4,
      },
    ]);
  });
});
