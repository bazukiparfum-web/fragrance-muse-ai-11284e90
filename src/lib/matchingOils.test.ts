import { describe, it, expect } from "vitest";
import { matchingOils } from "./shopify";

const tower = { handle: "aroma-tower" };
const lav = { handle: "lav", title: "Lavender Oil", tags: ["diffuser-oil", "for-aroma-tower"] };
const rose = { handle: "rose", title: "Rose Oil", tags: ["diffuser-oil"] };
const perfume = { handle: "p", title: "Midnight Velvet", tags: ["perfume"] };
const diff = { handle: "nest", title: "Aroma Nest", tags: ["diffuser"] };

describe("matchingOils", () => {
  it("returns only oils tagged for that diffuser", () => {
    expect(matchingOils(tower, [lav, rose, perfume, diff]).map((p) => p.handle)).toEqual(["lav"]);
  });
  it("falls back to all oils when none are tagged for it", () => {
    expect(matchingOils({ handle: "nest" }, [lav, rose, perfume, diff]).map((p) => p.handle)).toEqual(["lav", "rose"]);
  });
  it("never includes perfumes or diffusers", () => {
    expect(matchingOils({ handle: "x" }, [perfume, diff])).toEqual([]);
  });
});
