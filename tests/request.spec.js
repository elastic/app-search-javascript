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

  const apiKey = "api-12345";
  const endpoint = "http://www.example.com";
  const path = "/v1/search";
  const params = {
    a: "a"
  };

  beforeAll(() => {
    global.Headers = Headers;
    global.fetch = jest
      .fn()
      .mockImplementation(() => Promise.resolve(response));
  });

  beforeEach(() => {
    global.fetch.mockClear();
  });

  it("can fetch", async () => {
    const res = await request(apiKey, endpoint, path, params);
    expect(res.response).toBe(response);
    expect(global.fetch.mock.calls.length).toBe(1);
  });

  it("will return a cached response if already called once", async () => {
    const res = await request(apiKey, endpoint, path, params);
    expect(res.response).toBe(response);
    expect(global.fetch.mock.calls.length).toBe(0);
  });

  it("will not return the cached response if endpoint changes", async () => {
    const res = await request(apiKey, "http://www.jira.com", path, params);
    expect(res.response).toBe(response);
    expect(global.fetch.mock.calls.length).toBe(1);
  });

  it("will not return the cached response if path changes", async () => {
    const res = await request(apiKey, endpoint, "/new/path", params);
    expect(res.response).toBe(response);
    expect(global.fetch.mock.calls.length).toBe(1);
  });

  it("will not return the cached response if path params change", async () => {
    const res = await request(apiKey, endpoint, path, {
      a: "a",
      b: "b"
    });
    expect(res.response).toBe(response);
    expect(global.fetch.mock.calls.length).toBe(1);
  });

  it("will return another cached response", async () => {
    const res = await request(apiKey, endpoint, path, {
      a: "a",
      b: "b"
    });
    expect(res.response).toBe(response);
    expect(global.fetch.mock.calls.length).toBe(0);
  });

  it("will not cache an error response", async () => {
    global.fetch = jest
      .fn()
      .mockImplementation(() => Promise.resolve(responseWithParsingError));

    let res = await request(apiKey, "bad/endpoint", path, params);
    expect(res.json).toEqual({});
    expect(global.fetch.mock.calls.length).toBe(1);

    res = await request(apiKey, "bad/endpoint", path, params);
    expect(res.json).toEqual({});
    expect(global.fetch.mock.calls.length).toBe(2);
  });
});
