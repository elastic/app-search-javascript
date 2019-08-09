"use strict";

import ResultList from "./result_list";
import Filters from "./filters";
import { request } from "./request.js";

const SEARCH_TYPES = {
  SEARCH: "SEARCH",
  MULTI_SEARCH: "MULTI_SEARCH"
};

/**
 * Omit a single key from an object
 */
function omit(obj, keyToOmit) {
  if (!obj) return;
  const { [keyToOmit]: _, ...rest } = obj;
  return rest;
}

function flatten(arrayOfArrays) {
  return [].concat.apply([], arrayOfArrays);
}

function formatResultsJSON(json) {
  return new ResultList(json.results, omit(json, "results"));
}

function handleErrorResponse({ response, json }) {
  if (!response.ok) {
    const message = Array.isArray(json)
      ? ` ${flatten(json.map(response => response.errors)).join(", ")}`
      : `${json.errors ? " " + json.errors : ""}`;
    throw new Error(`[${response.status}]${message}`);
  }
  return json;
}

export default class Client {
  constructor(
    hostIdentifier,
    searchKey,
    engineName,
    { endpointBase = "", cacheResponses = true, additionalHeaders } = {}
  ) {
    this.additionalHeaders = additionalHeaders;
    this.searchKey = searchKey;
    this.cacheResponses = cacheResponses;
    this.engineName = engineName;
    this.apiEndpoint = endpointBase
      ? `${endpointBase}/api/as/v1/`
      : `https://${hostIdentifier}.api.swiftype.com/api/as/v1/`;
    this.searchPath = `engines/${this.engineName}/search`;
    this.multiSearchPath = `engines/${this.engineName}/multi_search`;
    this.querySuggestionPath = `engines/${this.engineName}/query_suggestion`;
    this.clickPath = `engines/${this.engineName}/click`;
  }

  /**
   * Sends a query suggestion request to the Elastic App Search Api
   *
   * @param {String} query String that is used to perform a query suggest.
   * @param {Object} options Object used for configuring the query suggest, like 'types' or 'size'
   * @returns {Promise<ResultList>} a Promise that returns results, otherwise throws an Error.
   */
  querySuggestion(query, options = {}) {
    const params = Object.assign({ query: query }, options);

    return request(
      this.searchKey,
      this.apiEndpoint,
      this.querySuggestionPath,
      params,
      this.cacheResponses,
      { additionalHeaders: this.additionalHeaders }
    ).then(handleErrorResponse);
  }

  /**
   * Sends a search request to the Elastic App Search Api
   *
   * @param {String} query String, Query, or Object that is used to perform a search request.
   * @param {Object} options Object used for configuring the search like search_fields and result_fields
   * @returns {Promise<ResultList>} a Promise that returns a {ResultList} when resolved, otherwise throws an Error.
   */
  search(query, options = {}) {
    const {
      disjunctiveFacets,
      disjunctiveFacetsAnalyticsTags,
      ...validOptions
    } = options;

    const params = Object.assign({ query: query }, validOptions);

    if (disjunctiveFacets && disjunctiveFacets.length > 0) {
      return this._performDisjunctiveSearch(
        params,
        disjunctiveFacets,
        disjunctiveFacetsAnalyticsTags
      ).then(formatResultsJSON);
    }
    return this._performSearch(params).then(formatResultsJSON);
  }

  /**
   * Sends multiple search requests to the Elastic App Search Api, using the
   * "multi_search" endpoint
   *
   * @param {Array[Object]} searches searches to send, valid keys are:
   * - query: String
   * - options: Object (optional)
   * @returns {Promise<[ResultList]>} a Promise that returns an array of {ResultList} when resolved, otherwise throws an Error.
   */
  multiSearch(searches) {
    const params = searches.map(search => ({
      query: search.query,
      ...(search.options || {})
    }));

    return this._performSearch(
      { queries: params },
      SEARCH_TYPES.MULTI_SEARCH
    ).then(responses => responses.map(formatResultsJSON));
  }

  /*
   * A disjunctive search, as opposed to a regular search is used any time
   * a `disjunctiveFacet` option is provided to the `search` method. A
   * a disjunctive facet requires multiple API calls.
   *
   * Typically:
   *
   * 1 API call to get the base results
   * 1 additional API call to get the "disjunctive" facet counts for each
   * facet configured as "disjunctive".
   *
   * The additional API calls are required, because a "disjunctive" facet
   * is one where we want the counts for a facet as if there is no filter applied
   * to a particular field.
   *
   * After all queries are performed, we merge the facet values on the
   * additional requests into the facet values of the original request, thus
   * creating a single response with the disjunctive facet values.
   */
  _performDisjunctiveSearch(
    params,
    disjunctiveFacets,
    disjunctiveFacetsAnalyticsTags = ["Facet-Only"]
  ) {
    const baseQueryPromise = this._performSearch(params);

    const filters = new Filters(params.filters);
    const appliedFilers = filters.getListOfAppliedFilters();
    const listOfAppliedDisjunctiveFilters = appliedFilers.filter(filter => {
      return disjunctiveFacets.includes(filter);
    });

    if (!listOfAppliedDisjunctiveFilters.length) {
      return baseQueryPromise;
    }

    const page = params.page || {};

    // We intentionally drop passed analytics tags here so that we don't get
    // double counted search analytics in the dashboard from disjunctive
    // calls
    const analytics = params.analytics || {};
    analytics.tags = disjunctiveFacetsAnalyticsTags;

    const disjunctiveQueriesPromises = listOfAppliedDisjunctiveFilters.map(
      appliedDisjunctiveFilter => {
        return this._performSearch({
          ...params,
          filters: filters.removeFilter(appliedDisjunctiveFilter).filtersJSON,
          page: {
            ...page,
            // Set this to 0 for performance, since disjunctive queries
            // don't need results
            size: 0
          },
          analytics,
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

  _performSearch(params, searchType = SEARCH_TYPES.SEARCH) {
    const searchPath =
      searchType === SEARCH_TYPES.MULTI_SEARCH
        ? this.multiSearchPath
        : this.searchPath;
    return request(
      this.searchKey,
      this.apiEndpoint,
      `${searchPath}.json`,
      params,
      this.cacheResponses,
      { additionalHeaders: this.additionalHeaders }
    ).then(handleErrorResponse);
  }

  /**
   * Sends a click event to the Elastic App Search Api, to track a click-through event
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

    return request(
      this.searchKey,
      this.apiEndpoint,
      `${this.clickPath}.json`,
      params,
      this.cacheResponses,
      { additionalHeaders: this.additionalHeaders }
    ).then(handleErrorResponse);
  }
}
