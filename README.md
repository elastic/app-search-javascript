# Javascript client for the Swiftype App Search Api

[![CircleCI](https://circleci.com/gh/swiftype/swiftype-app-search-javascript.svg?style=svg)](https://circleci.com/gh/swiftype/swiftype-app-search-javascript)

## Getting Started

### Install from a CDN

The easiest way to install this client is to simply include the built distribution from the [jsDelivr](https://www.jsdelivr.com/) CDN.

```html
<script src="https://cdn.jsdelivr.net/npm/swiftype-app-search-javascript@2.1.0/dist/swiftype_app_search.umd.js"></script>
```

This will make the client available globally at:

```javascript
window.SwiftypeAppSearch;
```

### Install from NPM

This package can also be installed with `npm` or `yarn`.

```
npm install --save swiftype-app-search-javascript
```

The client could then be included into your project like follows:

```javascript
// CommonJS
var SwiftypeAppSearch = require("swiftype-app-search-javascript");

// ES
import * as SwiftypeAppSearch from "swiftype-app-search-javascript";
```

## Usage

### Setup: Configuring the client and authentication

Using this client assumes that you have already created an [App Search](https://swiftype.com/app-search) account, and subsequently created an Engine. You'll need to configure the client with the name of your Engine and your authentication credentials, which can be found here: https://app.swiftype.com/as/credentials.

```javascript
var client = SwiftypeAppSearch.createClient({
  hostIdentifier: "host-c5s2mj",
  searchKey: "search-mu75psc5egt9ppzuycnc2mc3",
  engineName: "favorite-videos"
});
```

\* Please note that you should only ever use a **Public Search Key** within Javascript code on the browser. By default, your account should have a Key prefixed with `search-` that is read-only. More information can be found in the [documentation](https://swiftype.com/documentation/app-search/credentials).

List of configuration options:

| Option         | Required | Description                                                                                                                                                                            |
| -------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| hostIdentifier | No       | Your **Host Identifier**, should start with `host-`. Required unless explicitly setting `endpointBase`                                                                                 |
| searchKey      | Yes      | Your **Public Search Key**. It should start with `search-`.                                                                                                                            |
| engineName     | Yes      |                                                                                                                                                                                        |
| endpointBase   | No       | Overrides the base of the Swiftype API endpoint completely. Useful when proxying the Swiftype API, developing against a local server, or a Managed Deploy. Ex. "http://localhost:3002" |
| cacheResponses | No       | Whether or not API responses should be cached. Default: `true`.                                                                                                                        |

### Using with App Search Managed Deploys

The client can be configured to use a managed deploy by using the
`endpointBase` parameter. Since managed deploys do not rely on a `hostIdentifier`
, it can be omitted.

```javascript
var client = SwiftypeAppSearch.createClient({
  searchKey: "search-mu75psc5egt9ppzuycnc2mc3",
  endpointBase: "http://127.0.0.1:3002",
  engineName: "favorite-videos"
});
```

### API Methods

This client is a thin interface to the Swiftype App Search API. Additional details for requests and responses can be
found in the [documentation](https://swiftype.com/documentation/app-search).

#### Searching

For the query term `lion`, a search call is constructed as follows:

```javascript
var options = {
  search_fields: { title: {} },
  result_fields: { id: { raw: {} }, title: { raw: {} } }
};

client
  .search("lion", options)
  .then(resultList => {
    resultList.results.forEach(result => {
      console.log(`id: ${result.getRaw("id")} raw: ${result.getRaw("title")}`);
    });
  })
  .catch(error => {
    console.log(`error: ${error}`);
  });
```

Note that `options` supports all options listed here: https://swiftype.com/documentation/app-search/guides/search.

In addition to the supported options above, we also support the following fields:

| Name              | Type          | Description                                                                                                                                                                                                                                                                                                                                                                                      |
| ----------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| disjunctiveFacets | Array[String] | An array of field names. Every field listed here must also be provided as a facet in the `facet` field. It denotes that a facet should be considered disjunctive. When returning counts for disjunctive facets, the counts will be returned as if no filter is applied on this field, even if one is applied. Note that these will be tagged as "Facet-Only" queries in the analytics dashboard. |

_Response_

The search method returns the response wrapped in a `ResultList` type:

```javascript
ResultList {
  rawResults: [], // List of raw `results` from JSON response
  rawInfo: { // Object wrapping the raw `meta` property from JSON response
    meta: {}
  },
  results: [ResultItem], // List of `results` wrapped in `ResultItem` type
  info: { // Currently the same as `rawInfo`
    meta: {}
  }
}

ResultItem {
  getRaw(fieldName), // Returns the HTML-unsafe raw value for a field, if it exists
  getSnippet(fieldName) // Returns the HTML-safe snippet value for a field, if it exists
}
```

#### Multi Search

It is possible to run multiple queries at once using the `multiSearch` method.

To search for the term `lion` and `tiger`, a search call is constructed as follows:

```javascript
var options = {
  search_fields: { name: {} },
  result_fields: { id: { raw: {} }, title: { raw: {} } }
};

client
  .multiSearch([{ query: "node", options }, { query: "java", options }])
  .then(allResults => {
    allResults.forEach(resultList => {
      resultList.results.forEach(result => {
        console.log(
          `id: ${result.getRaw("id")} raw: ${result.getRaw("title")}`
        );
      });
    });
  })
  .catch(error => {
    console.log(`error: ${error}`);
  });
```

#### Clickthrough Tracking

```javascript
client
  .click({
    query: "lion",
    documentId: "1234567",
    requestId: "8b55561954484f13d872728f849ffd22",
    tags: ["Animal"]
  })
  .catch(error => {
    console.log(`error: ${error}`);
  });
```

Clickthroughs can be tracked by binding `client.click` calls to click events on individual search result links.

The following example shows how this can be implemented declaratively by annotating links with class and data attributes.

```javascript
document.addEventListener("click", function(e) {
  const el = e.target;
  if (!el.classList.contains("track-click")) return;

  client.click({
    query: el.getAttribute("data-query"),
    documentId: el.getAttribute("data-document-id"),
    requestId: el.getAttribute("data-request-id"),
    tags: [el.getAttribute("data-tag")]
  });
});
```

```html
<a href="/items/1234567"
    class="track-click"
    data-request-id="8b55561954484f13d872728f849ffd22"
    data-document-id="1234567"
    data-query="lion"
    data-tag="Animal">
  Item 1
</a>
```

## Development

### Node

We depend upon the version of node defined in [.nvmrc](.nvmrc).

You will probably want to install a node version manager. nvm is recommended.

To install and use the correct node version with nvm:

```
nvm install
```

### Running Tests

```
nvm use
yarn test
```

### Build

This is run on `prepare` in [package.json](package.json). That means
this will be run when running `yarn` to install dependencies, and
also before publishing to npm.

```
nvm use
yarn build
```

### Publish

```
nvm use
yarn publish
```

### Adding and updating tests

The specs in this project use [node-replay](https://github.com/assaf/node-replay) to capture responses.

The responses are then checked against Jest snapshots.

To capture new responses and update snapshots, run tests with the following commands:

```
nvm use // Be sure to use the correct version of node
REPLAY=record yarn test -u
```

## Contributions

To contribute code, please fork the repository and submit a pull request.

## Development

Install dependencies

```
yarn
```

Run dev server

```
yarn dev
```
