import { slices } from "./array";
import { describe, it, expect } from "vitest";

describe("slices", () => {
  it("splits an array into slices", () => {
    const sliced = slices(3, [1, 2, 3, 4, 5, 6, 7, 8, 9]);

    expect(sliced).to.deep.equal([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]);
  });
});
