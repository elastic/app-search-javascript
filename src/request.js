import { version } from "../package.json";
import QueryCache from "./query_cache";
const cache = new QueryCache();

export function request(
  searchKey,
  apiEndpoint,
  path,
  params,
  cacheResponses,
  { additionalHeaders } = {}
) {
  const method = "POST";
  const key = cache.getKey(method, apiEndpoint + path, params);
  if (cacheResponses) {
    const cachedResult = cache.retrieve(key);
    if (cachedResult) {
      return Promise.resolve(cachedResult);
    }
  }

  return _request(method, searchKey, apiEndpoint, path, params, {
    additionalHeaders
  }).then(response => {
    return response
      .json()
      .then(json => {
        const result = { response: response, json: json };
        if (cacheResponses) cache.store(key, result);
        return result;
      })
      .catch(() => {
        return { response: response, json: {} };
      });
  });
}

function _request(
  method,
  searchKey,
  apiEndpoint,
  path,
  params,
  { additionalHeaders } = {}
) {
  const jsVersion = typeof window !== "undefined" ? "browser" : process.version;
  const metaHeader = `ent=${version}-legacy,js=${jsVersion},t=${version}-legacy,ft=universal`;
  const headers = new Headers({
    ...(searchKey && { Authorization: `Bearer ${searchKey}` }),
    "Content-Type": "application/json",
    "X-Swiftype-Client": "elastic-app-search-javascript",
    "X-Swiftype-Client-Version": version,
    "x-elastic-client-meta": metaHeader,
    ...additionalHeaders
  });

  return fetch(`${apiEndpoint}${path}`, {
    method,
    headers,
    body: JSON.stringify(params),
    credentials: "include"
  });
}
