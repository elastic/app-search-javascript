import { version, name } from "../package.json";
import QueryCache from "./query_cache";
const cache = new QueryCache();

export function request(apiKey, apiEndpoint, path, params, cacheResponses) {
  const method = "POST";
  const key = cache.getKey(method, apiEndpoint + path, params);
  if (cacheResponses) {
    const cachedResult = cache.retrieve(key);
    if (cachedResult) {
      return Promise.resolve(cachedResult);
    }
  }

  return _request(method, apiKey, apiEndpoint, path, params).then(response => {
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

function _request(method, apiKey, apiEndpoint, path, params) {
  const headers = new Headers({
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "X-Swiftype-Client": name,
    "X-Swiftype-Client-Version": version
  });

  return fetch(`${apiEndpoint}${path}`, {
    method,
    headers,
    body: JSON.stringify(params),
    credentials: "include"
  });
}
