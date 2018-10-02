import hash from "object-hash";

export default class QueryCache {
  constructor() {
    this.cache = {};
  }

  getKey(method, url, params) {
    return method + url + hash(params);
  }

  store(key, response) {
    this.cache[key] = response;
  }

  retrieve(key) {
    return this.cache[key];
  }
}
