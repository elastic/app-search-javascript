'use strict'

import _omit from 'lodash/omit'
import ResultList from './result_list'

export default class Client {
  constructor(hostIdentifier, apiKey, engineName) {
    this.apiKey = apiKey
    this.engineName = engineName
    this.apiEndpoint = `https://${hostIdentifier}.api.swiftype.com/api/as/v1/`
    this.searchPath = `engines/${this.engineName}/search`
    this.clickPath = `engines/${this.engineName}/click`
  }

  /**
   * Sends a search request to the Swiftype App Search Api
   *
   * @param {String} query String, Query, or Object that is used to perform a search request.
   * @param {Object} options Object used for configuring the search like search_fields and result_fields
   * @returns {Promise<ResultList>} a Promise that returns a {ResultList} when resolved, otherwise throws an Error.
   */
  search(query, options) {
    const params = Object.assign({ query: query }, options)
    return this._requestJSON(`${this.searchPath}.json`, params).then(({ response, json }) => {
      if (!response.ok) {
        throw new Error(`[${response.status}]${json.errors ? ' ' + json.errors : ''}`)
      }
      return new ResultList(json.results, _omit(json, 'results'))
    })
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
  click({query, documentId, requestId, tags = []}) {
    const params = {
      query,
      document_id: documentId,
      search_request_id: requestId,
      tags
    }

    return this._requestJSON(`${this.clickPath}.json`, params).then(({ response, json }) => {
      if (!response.ok) {
        throw new Error(`[${response.status}]${json.errors ? ' ' + json.errors : ''}`)
      }
      return
    })
  }

  _requestJSON(path, params) {
    return this._request(path, params).then(response => {
      return response.json().then((json) => {
        return { response: response, json: json }
      }).catch(() => {
        return { response: response, json: {} }
      })
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
    })
  }

}
