"use strict";

import { version, name } from "../package.json";
import ResultList from "./result_list";
import Filters from "./filters";

function omit(obj, keyToOmit) {
  if (!obj) return;
  return Object.keys(obj).reduce((acc, key) => {
    const value = obj[key];
    if (key !== keyToOmit) acc[key] = value;
    return acc;
  }, {});
}

function removeOption(options, optionKey) {
  const option = options[optionKey];
  const updatedOptions = omit(options, optionKey);
  return [option, updatedOptions];
}

function formatResultsJSON(json) {
  return new ResultList(json.results, omit(json, "results"));
}

export default class Client {
  constructor(hostIdentifier, apiKey, engineName, { endpointBase = "" } = {}) {
    this.apiKey = apiKey;
    this.engineName = engineName;
    this.apiEndpoint = endpointBase
      ? `${endpointBase}/api/as/v1/`
      : `https://${hostIdentifier}.api.swiftype.com/api/as/v1/`;
    this.searchPath = `engines/${this.engineName}/search`;
    this.clickPath = `engines/${this.engineName}/click`;
  }

  /**
   * Sends a search request to the Swiftype App Search Api
   *
   * @param {String} query String, Query, or Object that is used to perform a search request.
   * @param {Object} options Object used for configuring the search like search_fields and result_fields
   * @returns {Promise<ResultList>} a Promise that returns a {ResultList} when resolved, otherwise throws an Error.
   */
  search(query, options = {}) {
    const [disjunctiveFacets, validOptions] = removeOption(
      options,
      "disjunctiveFacets"
    );

    const params = Object.assign({ query: query }, validOptions);

    if (disjunctiveFacets && disjunctiveFacets.length > 0) {
      return this._performDisjunctiveSearch(params, disjunctiveFacets).then(
        formatResultsJSON
      );
    }
    return this._performSearch(params).then(formatResultsJSON);
  }

  _performDisjunctiveSearch(params, disjunctiveFacets) {
    const baseQueryPromise = this._performSearch(params);

    const filters = new Filters(params.filters);
    const appliedFilers = filters.getListOfAppliedFilters();
    const listOfAppliedDisjunctiveFilters = appliedFilers.filter(filter => {
      return disjunctiveFacets.includes(filter);
    });

    if (!listOfAppliedDisjunctiveFilters.length) {
      return baseQueryPromise;
    }

    const disjunctiveQueriesPromises = listOfAppliedDisjunctiveFilters.map(
      appliedDisjunctiveFilter => {
        return this._performSearch({
          ...params,
          filters: filters.removeFilter(appliedDisjunctiveFilter).filtersJSON,
          facets: {
            [appliedDisjunctiveFilter]: params.facets[appliedDisjunctiveFilter]
          }
        });
      }
    );

    return Promise.all([baseQueryPromise, ...disjunctiveQueriesPromises]).then(
      ([baseQueryResults, ...disjunctiveQueries]) => {
        disjunctiveQueries.forEach(disjunctiveQueryResults => {
          const [facetName, facetValue] = Object.entries(
            disjunctiveQueryResults.facets
          )[0];
          baseQueryResults.facets[facetName] = facetValue;
        });
        return baseQueryResults;
      }
    );
  }

  _performSearch(params) {
    return this._requestJSON(`${this.searchPath}.json`, params).then(
      ({ response, json }) => {
        if (!response.ok) {
          throw new Error(
            `[${response.status}]${json.errors ? " " + json.errors : ""}`
          );
        }
        return json;
      }
    );
  }

  /**
   * Sends a click event to the Swiftype App Search Api, to track a click-through event
   *
   * @param {String} query Query that was used to perform the search request
   * @param {String} documentId ID of the document that was clicked
   * @param {String} requestId Request_id from search response
   * @param {String[]} tags Tags to categorize this request in the Dashboard
   * @returns {Promise} An empty Promise, otherwise throws an Error.
   */
  click({ query, documentId, requestId, tags = [] }) {
    const params = {
      query,
      document_id: documentId,
      request_id: requestId,
      tags
    };

    return this._requestJSON(`${this.clickPath}.json`, params).then(
      ({ response, json }) => {
        if (!response.ok) {
          throw new Error(
            `[${response.status}]${json.errors ? " " + json.errors : ""}`
          );
        }
        return;
      }
    );
  }

  _requestJSON(path, params) {
    return this._request(path, params).then(response => {
      return response
        .json()
        .then(json => {
          return { response: response, json: json };
        })
        .catch(() => {
          return { response: response, json: {} };
        });
    });
  }

  _request(path, params) {
    const headers = new Headers({
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
      "X-Swiftype-Client": name,
      "X-Swiftype-Client-Version": version
    });

    return fetch(`${this.apiEndpoint}${path}`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(params),
      credentials: "include"
    });
  }
}
