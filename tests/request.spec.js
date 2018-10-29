import { request } from "../src/request";
import { Headers } from "node-fetch";

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
    global.fetch = jest
      .fn()
      .mockImplementation(() => Promise.resolve(response));
  });

  beforeEach(() => {
    global.fetch.mockClear();
  });

  it("can fetch", async () => {
    const res = await request(searchKey, endpoint, path, params, true);
    expect(res.response).toBe(response);
    expect(global.fetch.mock.calls.length).toBe(1);
  });

  it("will return a cached response if already called once", async () => {
    const res = await request(searchKey, endpoint, path, params, true);
    expect(res.response).toBe(response);
    expect(global.fetch.mock.calls.length).toBe(0);
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
});
