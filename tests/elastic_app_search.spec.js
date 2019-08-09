import { createClient } from "../src/elastic_app_search";
import Client from "../src/client";

const hostIdentifier = "host-2376rb";
const searchKey = "api-hean6g8dmxnm2shqqiag757a";
const engineName = "node-modules";

describe("ElasticAppSearch#createClient", () => {
  test("instantiates a new client", () => {
    var client = createClient({
      hostIdentifier,
      searchKey,
      engineName
    });

    expect(client).toBeInstanceOf(Client);
  });

  test("instantiates a new client with deprecates accountHostKey parameter", () => {
    var client = createClient({
      accountHostKey: hostIdentifier,
      searchKey,
      engineName
    });

    expect(client).toBeInstanceOf(Client);
  });

  test("instantiates a new client with options", () => {
    var client = createClient({
      hostIdentifier,
      searchKey,
      engineName,
      endpointBase: "http://localhost:3002",
      cacheResponses: true
    });

    expect(client).toBeInstanceOf(Client);
  });
});
