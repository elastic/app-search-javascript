import { request } from "../src/request";
import { Headers } from "node-fetch";
import { version } from "../package.json";

describe("request", () => {
  const responseJson = {};
  const response = {
    json: () => Promise.resolve(responseJson)
  };
  const responseWithParsingError = {
    json: () => Promise.reject()
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

  it("can send a fetch request, authenticated by the provided search key", async () => {
    const res = await request(searchKey, endpoint, path, params, false);
    expect(res.response).toBe(response);
    expect(global.fetch.mock.calls.length).toBe(1);
    var [_, options] = global.fetch.mock.calls[0];
    expect(options.headers.get("Authorization")).toEqual("Bearer api-12345");
  });

  // The use case for this is mostly internal to Elastic, where we rely on the logged in user session (via cookies) to authenticate
  it("can send an authenticated fetch request, when no search key is provided", async () => {
    const res = await request(undefined, endpoint, path, params, false);
    expect(global.fetch.mock.calls.length).toBe(1);
    var [_, options] = global.fetch.mock.calls[0];
    expect(options.headers.has("Authorization")).toBe(false);
  });

  it("will return a cached response if already called once", async () => {
    const res = await request(searchKey, endpoint, path, params, true);
    await request(searchKey, endpoint, path, params, true);
    await request(searchKey, endpoint, path, params, true);
    expect(res.response).toBe(response);
    expect(global.fetch.mock.calls.length).toBe(1);
  });

  it("will not return the cached response if endpoint changes", async () => {
    const res = await request(
      searchKey,
      "http://www.jira.com",
      path,
      params,
      true
    );
    expect(res.response).toBe(response);
    expect(global.fetch.mock.calls.length).toBe(1);
  });

  it("will not return the cached response if path changes", async () => {
    const res = await request(searchKey, endpoint, "/new/path", params, true);
    expect(res.response).toBe(response);
    expect(global.fetch.mock.calls.length).toBe(1);
  });

  it("will not return the cached response if path params change", async () => {
    const res = await request(
      searchKey,
      endpoint,
      path,
      {
        a: "a",
        b: "b"
      },
      true
    );
    expect(res.response).toBe(response);
    expect(global.fetch.mock.calls.length).toBe(1);
  });

  it("will return another cached response", async () => {
    const res = await request(
      searchKey,
      endpoint,
      path,
      {
        a: "a",
        b: "b"
      },
      true
    );
    expect(res.response).toBe(response);
    expect(global.fetch.mock.calls.length).toBe(0);
  });

  it("will not cache an error response", async () => {
    global.fetch = jest
      .fn()
      .mockImplementation(() => Promise.resolve(responseWithParsingError));

    let res = await request(searchKey, "bad/endpoint", path, params, true);
    expect(res.json).toEqual({});
    expect(global.fetch.mock.calls.length).toBe(1);

    res = await request(searchKey, "bad/endpoint", path, params, true);
    expect(res.json).toEqual({});
    expect(global.fetch.mock.calls.length).toBe(2);
  });

  it("will ignore cache if cacheResponses is false", async () => {
    const res = await request(searchKey, endpoint, path, params, false);
    expect(res.response).toBe(response);
    expect(global.fetch.mock.calls.length).toBe(1);
  });

  it("will have the correct browser based meta headers when running in browser context", async () => {
    expect(global.window).toBeDefined();
    const res = await request(searchKey, endpoint, path, params, false);
    expect(res.response).toBe(response);
    expect(global.fetch.mock.calls.length).toBe(1);
    var [_, options] = global.fetch.mock.calls[0];
    expect(options.headers.get("x-elastic-client-meta")).toEqual(
      `ent=${version}-legacy,js=browser,t=${version}-legacy,ft=universal`
    );
    const validHeaderRegex = /^[a-z]{1,}=[a-z0-9\.\-]{1,}(?:,[a-z]{1,}=[a-z0-9\.\-]+)*$/;
    expect(options.headers.get("x-elastic-client-meta")).toMatch(
      validHeaderRegex
    );
  });
});
