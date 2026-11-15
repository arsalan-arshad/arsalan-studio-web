import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatUserLocation } from "@/lib/format-location";

describe("formatUserLocation", () => {
  it("combines city and country", () => {
    assert.equal(
      formatUserLocation({ city: "Karachi", country: "PK" }),
      "Karachi, PK",
    );
  });

  it("shows country only", () => {
    assert.equal(formatUserLocation({ city: null, country: "US" }), "US");
  });

  it("shows city only", () => {
    assert.equal(formatUserLocation({ city: "London", country: "" }), "London");
  });

  it("returns null when blank", () => {
    assert.equal(formatUserLocation({ city: null, country: null }), null);
  });
});
