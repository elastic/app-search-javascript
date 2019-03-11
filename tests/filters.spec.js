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

    test("can remove a filter from any, all, or none", () => {
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

    test("can remove nested filters", () => {
      const filters = new Filters({
        all: [
          {
            all: [{ c: "c" }, { d: "d" }],
            none: [{ e: "e" }, { e: "e1" }, { f: "f" }],
            any: [
              {
                g: "g"
              },
              {
                all: [
                  {
                    h: "h"
                  },
                  {
                    any: [
                      {
                        i: "i"
                      }
                    ]
                  }
                ]
              }
            ]
          },
          { j: "j" }
        ],
        any: [
          {
            all: [{ k: "k" }],
            any: [{ l: "l" }]
          }
        ]
      });

      expect(
        filters
          .removeFilter("k")
          .removeFilter("i")
          .removeFilter("e").filtersJSON
      ).toEqual({
        all: [
          {
            all: [{ c: "c" }, { d: "d" }],
            none: [{ f: "f" }],
            any: [
              {
                g: "g"
              },
              {
                all: [
                  {
                    h: "h"
                  },
                  {
                    any: []
                  }
                ]
              }
            ]
          },
          { j: "j" }
        ],
        any: [
          {
            all: [],
            any: [{ l: "l" }]
          }
        ]
      });
    });
  });

  describe("#getListOfAppliedFilters", () => {
    test("it should return a single top level value filter", () => {
      const filters = new Filters({
        b: "b"
      });

      expect(filters.getListOfAppliedFilters()).toEqual(["b"]);
    });

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

    test("it should return nested filters", () => {
      const filters = new Filters({
        all: [
          {
            all: [{ c: "c" }, { d: "d" }],
            none: [{ e: "e" }, { e: "e1" }, { f: "f" }],
            any: [
              {
                g: "g"
              },
              {
                all: [
                  {
                    h: "h"
                  },
                  {
                    any: [
                      {
                        i: "i"
                      }
                    ]
                  }
                ]
              }
            ]
          },
          { j: "j" }
        ],
        any: [
          {
            all: [{ k: "k" }],
            any: [{ l: "l" }]
          }
        ]
      });

      expect(filters.getListOfAppliedFilters()).toEqual([
        "c",
        "d",
        "e",
        "f",
        "g",
        "h",
        "i",
        "j",
        "k",
        "l"
      ]);
    });
  });
});
