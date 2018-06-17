# Javascript client for the Swiftype App Search Api

## Getting Started
### Install from a CDN

The easiest way to install this client is to simply include the built distribution from the [jsDelivr](https://www.jsdelivr.com/) CDN.

```html
<script src="https://cdn.jsdelivr.net/npm/swiftype-app-search-javascript@1.0.3"></script>
```

This will make the client available globally at:

```javascript
window.SwiftypeAppSearch
```

### Install from NPM

This package can also be installed with `npm` or `yarn`.

```
npm install --save swiftype-app-search-javascript
```

The client could then be included into your project like follows:

```javascript
// CommonJS
var SwiftypeAppSearch = require('swiftype-app-search-javascript')

// ES
import * as SwiftypeAppSearch from 'swiftype-app-search-javascript'
```

## Usage

### Setup: Configuring the client and authentication

Using this client assumes that you have already created an [App Search](https://swiftype.com/app-search) account, and subsequently created an Engine. You'll need to configure the client with the name of your Engine and your authentication credentials, which can be found here: https://app.swiftype.com/as/credentials.

- accountHostKey -> Your "Account Key", should start with `host-`
- apiKey -> A read-only "API Key" *

```javascript
var client = SwiftypeAppSearch.createClient({
  accountHostKey: 'host-c5s2mj',
  apiKey: 'search-mu75psc5egt9ppzuycnc2mc3',
  engineName: 'favorite-videos'
})
```

\* Please note that you should only ever use a read-only API Key within Javascript code on the browser. By default, your account should have a Key prefixed with `search-` that is read-only. More information can be found here: https://swiftype.com/documentation/app-search/api-keys

### API Methods

This client is a thin interface to the Swiftype App Search API. Additional details for requests and responses can be
found in the [documentation](https://swiftype.com/documentation/app-search).

#### Searching

For the query term `lion`, a search call is constructed as follows:

```javascript
var options = {
  search_fields: {title: {}},
  result_fields: {id: {raw: {}}, title: {raw: {}}}
}

client.search('tiger', options).then((resultList) => {
  resultList.results.forEach((result) => {
    console.log(`id: ${result.getRaw('id')} raw: ${result.getRaw('title')}`)
  })
}).catch((error) => {
  console.log(`error: ${error}`)
})
```

Note that `options` supports all options listed here: https://swiftype.com/documentation/app-search/guides/search.

#### Clickthrough Tracking

```javascript
client.click(
  {
    query: 'lion',
    documentId: '1234567',
    requestId: '8b55561954484f13d872728f849ffd22',
    tags: ['Animal']
  }
).catch((error) => {
  console.log(`error: ${error}`)
})
```

Clickthroughs can be tracked by binding `client.click` calls to click events on individual search result links.

The following example shows how this can be implemented declaratively by annotating links with class and data attributes.

```javascript
document.addEventListener('click', function(e) {
  const el = e.target
  if (!el.classList.contains('track-click')) return

  client.click({
    query: el.getAttribute('data-query'),
    documentId: el.getAttribute('data-document-id'),
    requestId: el.getAttribute('data-request-id'),
    tags: [el.getAttribute('data-tag')]
  })
})
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

## Build

```bash
yarn install
yarn build
```

## Running Tests

  $ yarn test

## Adding and updating

  The specs in this project use [node-replay](https://github.com/assaf/node-replay) to capture responses.

  To capture new responses, run tests with the following command:

  ```
  REPLAY=record yarn test
  ```

## Contributions

  To contribute code, please fork the repository and submit a pull request.
