import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isNavigableHttpUrl } from "./linkify";

describe("isNavigableHttpUrl", () => {
  it("accepts Gatekeeper handler URL", () => {
    assert.equal(
      isNavigableHttpUrl("https://gatekeeper.arsalandev.studio/@arsalandev"),
      true,
    );
  });

  it("rejects placeholder install templates", () => {
    assert.equal(
      isNavigableHttpUrl(
        "https://practitioner.arsalandev.studio/api/auth?shop=[STORE-NAME].myshopify.com",
      ),
      false,
    );
  });

  it("rejects non-http schemes", () => {
    assert.equal(isNavigableHttpUrl("javascript:alert(1)"), false);
  });
});
