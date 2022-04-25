/**
 * @jest-environment node
 */

import { request } from "../src/request";
import { Headers } from "node-fetch";
import { version } from "../package.json";
const nodeVersion = process.version;

describe("request - within node context", () => {
  const responseJson = {};
  const response = {
    json: () => Promise.resolve(responseJson)
  };

  const searchKey = "api-12345";
  const endpoint = "http://www.example.com";
  const path = "/v1/search";
  const params = {
    a: "a"
  };

  beforeEach(() => {
    global.Headers = Headers;
    jest.resetAllMocks();
    global.fetch = jest
      .fn()
      .mockImplementation(() => Promise.resolve(response));
  });

  it("will have the correct node based meta headers when running in node context", async () => {
    expect(global.window).not.toBeDefined();
    const res = await request(searchKey, endpoint, path, params, false);
    expect(res.response).toBe(response);
    expect(global.fetch.mock.calls.length).toBe(1);
    var [_, options] = global.fetch.mock.calls[0];
    expect(options.headers.get("x-elastic-client-meta")).toEqual(
      `ent=${version}-legacy,js=${nodeVersion},t=${version}-legacy,ft=universal`
    );
    const validHeaderRegex = /^[a-z]{1,}=[a-z0-9\.\-]{1,}(?:,[a-z]{1,}=[a-z0-9\.\-]+)*$/;
    expect(options.headers.get("x-elastic-client-meta")).toMatch(
      validHeaderRegex
    );
  });
});
