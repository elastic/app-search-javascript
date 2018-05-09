import Client from "../src/client";
import fetch, { Headers } from "node-fetch";
import Replay from "replay";

const accountHostKey = "host-n16af4";
const apiKey = "search-ow8h58jvykmoc96whnnfhv69";
const engineName = "node-modules";

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
  });
});
