'use strict'

import $ from 'jquery'
import _omit from 'lodash/omit'
import ResultList from './result_list'

export default class Client {
  constructor(accountHostKey, apiKey, engineName) {
    this.apiKey = apiKey
    this.engineName = engineName
    this.apiEndpoint = `https://${accountHostKey}.api.swiftype.com/api/as/v1/`
    this.searchPath = `engines/${this.engineName}/search`
  }

  /**
   * Send a search request to the Swiftype App Search Api
   * https://swiftype.com/documentation/app-search/
   *
   * @param {String} query String, Query, or Object that is used to perform a search request.
   * @param {Object} options Object used for configuring the search like search_fields and result_fields
   * @returns {Promise<ResultList>} a Promise that returns a {ResultList} when resolved, otherwise throws an Error.
   */
  search(query, options) {
    const params = Object.assign({ query: query }, options)
    return this._request(`${this.searchPath}.json`, params).then(({ response, json }) => {
      if (!response.ok) {
        throw new Error(`[${response.status}] ${json.errors}`)
      }
      return new ResultList(json.results, _omit(json, 'results'))
    })
  }

  _request(path, params) {
    const headers = new Headers({
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    })

    return fetch(`${this.apiEndpoint}${path}`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(params),
      credentials: 'include'
    }).then((response) => {
      return response.json().then((json) => {
        return { response: response, json: json }
      })
    })
  }

}
