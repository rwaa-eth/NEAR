import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { clientAddress, countryFromHeaders, isLatamCountry, isLocalAddress } from "../src/region";

describe("cash-out region", () => {
  it("treats Latin America as the Spanish guide", () => {
    assert.equal(isLatamCountry("MX"), true);
    assert.equal(isLatamCountry("br"), true);
    assert.equal(isLatamCountry("AR"), true);
    assert.equal(isLatamCountry("AU"), false);
    assert.equal(isLatamCountry("US"), false);
    assert.equal(isLatamCountry("ES"), false);
    assert.equal(isLatamCountry(null), false);
    assert.equal(isLatamCountry("T1"), false);
  });

  it("reads a country only from a real edge header", () => {
    assert.equal(countryFromHeaders({ "cf-ipcountry": "mx" }), "MX");
    assert.equal(countryFromHeaders({ "cf-ipcountry": "XX" }), null);
    assert.equal(countryFromHeaders({ "x-vercel-ip-country": "CL" }), "CL");
    assert.equal(countryFromHeaders({}), null);
  });

  it("ignores loopback addresses", () => {
    assert.equal(isLocalAddress("127.0.0.1"), true);
    assert.equal(isLocalAddress("::ffff:127.0.0.1"), true);
    assert.equal(isLocalAddress("8.8.8.8"), false);
    assert.equal(clientAddress({ "cf-connecting-ip": "189.203.1.2" }, "127.0.0.1"), "189.203.1.2");
    assert.equal(clientAddress({ "x-forwarded-for": "201.1.1.1, 10.0.0.1" }, "127.0.0.1"), "201.1.1.1");
  });
});
