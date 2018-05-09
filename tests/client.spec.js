import Client from "../src/client";
import fetch, { Headers } from "node-fetch";
import Replay from "replay";

const accountHostKey = "host-01kd84";
const apiKey = "search-aw9sk38fjs7akd9ajbnfav69";
const engineName = "test-engine";

describe("Client", () => {
  beforeAll(() => {
    global.Headers = Headers;
    global.fetch = fetch;
  });

  const client = new Client(accountHostKey, apiKey, engineName);

  test("can be instantiated", () => {
    expect(client).toBeInstanceOf(Client);
  });

  describe("#search", () => {
    test("should query", async () => {
      const result = await client.search("cat", {});
      expect(result).toMatchSnapshot();
    });

    test("should should reject when given invalid options", async () => {
      try {
        await client.search();
      } catch (e) {
        expect(e).toEqual(new Error("[400] Missing required parameter: query"));
      }
    });

    test("should reject on a 404", async () => {
      const badClient = new Client("invalid", "invalid", "invalid");
      try {
        await badClient.search();
      } catch (e) {
        expect(e).toEqual(new Error("[404]"));
      }
    });
  });

  describe("#click", () => {
    test("should resolve", async () => {
      const result = await client.click(
        "Cat",
        "rex-cli",
        "8b55561954484f13d872728f849ffd22",
        ["Cat"]
      );
      expect(result).toMatchSnapshot();
    });

    test("should resolve if no tags are provided", async () => {
      const result = await client.click(
        "Cat",
        "rex-cli",
        "8b55561954484f13d872728f849ffd22"
      );
      expect(result).toMatchSnapshot();
    });

    test("should should reject when given invalid options", async () => {
      try {
        await client.click();
      } catch (e) {
        expect(e).toEqual(new Error("[400] Missing required parameter: query"));
      }
    });

    test("should reject on a 404", async () => {
      const badClient = new Client("invalid", "invalid", "invalid");
      try {
        await badClient.click();
      } catch (e) {
        expect(e).toEqual(new Error("[404]"));
      }
    });
  });
});
