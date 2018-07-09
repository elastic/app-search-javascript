import ResultItem from "../src/result_item";

describe("ResultItem", () => {
  test("can be instantiated", () => {
    const resultItem = new ResultItem({});
    expect(resultItem).toBeInstanceOf(ResultItem);
  });

  describe("#getRaw", () => {
    test("returns a raw value for the specified field", () => {
      const resultItem = new ResultItem({
        field: {
          raw: "value"
        }
      });
      expect(resultItem.getRaw("field")).toEqual("value");
    });

    test("returns undefined if the field isn't contained within the response", () => {
      const resultItem = new ResultItem({});
      expect(resultItem.getRaw("field")).toBeUndefined;
    });
  });

  describe("#getSnippet", () => {
    test("returns a raw value for the specified field", () => {
      const resultItem = new ResultItem({
        field: {
          snippet: "value"
        }
      });
      expect(resultItem.getSnippet("field")).toEqual("value");
    });

    test("returns undefined if the field isn't contained within the response", () => {
      const resultItem = new ResultItem({});
      expect(resultItem.getSnippet("field")).toBeUndefined;
    });
  });
});
