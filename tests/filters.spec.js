import Filters from "../src/filters";

describe("Filters", () => {
  test("can be instantiated", () => {
    const filters = new Filters({});
    expect(filters).toBeInstanceOf(Filters);
  });

  describe("#removeFilter", () => {
    // At a top level, there can only ever be one filter applied. In other words
    // the top level hash can have any combo of 'all', 'any', or 'none', and
    // if they have none of those, there can be one key for one top level filter
    test("can remove a filter at the top level", () => {
      const filters = new Filters({
        a: "a"
      });

      expect(filters.removeFilter("a").filtersJSON).toEqual({});
    });

    test("can be chained", () => {
      const filters = new Filters({
        all: [{ c: "c" }, { a: "a" }, { b: "b" }, { d: "d" }]
      });

      expect(filters.removeFilter("a").removeFilter("b").filtersJSON).toEqual({
        all: [{ c: "c" }, { d: "d" }]
      });
    });

    test("can remove a nested filters", () => {
      const filters = new Filters({
        all: [{ c: "c" }, { d: "d" }],
        none: [{ e: "e" }, { f: "f" }],
        any: [{ g: "g" }]
      });

      expect(
        filters
          .removeFilter("c")
          .removeFilter("f")
          .removeFilter("g").filtersJSON
      ).toEqual({
        all: [{ d: "d" }],
        none: [{ e: "e" }],
        any: []
      });
    });
  });

  describe("#getListOfAppliedFilters", () => {
    test("it should return a list of top level filters", () => {
      const filters = new Filters({
        b: ["b", "b1"]
      });

      expect(filters.getListOfAppliedFilters()).toEqual(["b"]);
    });

    test("it include filters nested in all, any, or not", () => {
      const filters = new Filters({
        all: [{ c: "c" }, { d: "d" }],
        none: [{ e: "e" }, { e: "e1" }, { f: "f" }],
        any: [{ g: "g" }]
      });

      expect(filters.getListOfAppliedFilters()).toEqual([
        "c",
        "d",
        "e",
        "f",
        "g"
      ]);
    });
  });
});
