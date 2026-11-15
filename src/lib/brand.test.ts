import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  brand,
  capacityStatusCopy,
  formatOpenProjectSlots,
} from "@/lib/brand";

describe("open project slots copy", () => {
  it("maps 2 to two from the brand constant", () => {
    assert.equal(brand.openProjectSlots, 2);
    assert.equal(formatOpenProjectSlots(2), "two");
    assert.match(capacityStatusCopy(2), /^Taking on two new projects now\./);
  });

  it("falls back to numerals outside the word map", () => {
    assert.equal(formatOpenProjectSlots(12), "12");
  });
});
