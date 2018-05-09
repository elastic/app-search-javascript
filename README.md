# Javascript client for the Swiftype App Search Api

**Note: Swiftype App Search is currently in beta**

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

\* Please note that you should only ever use a read-only API Key within Javascript code on the browser. By default, your account should have a Key prefixed with `search-` that is read-only. More information can be found here: https://swiftype.com/documentation/app-search/understanding-api-authentication.

### Searching

```javascript
var options = {
  search_fields: {title: {}},
  result_fields: {id: {raw: {}}, title: {raw: {}}}
}

client.search('cat', options).then((resultList) => {
  resultList.results.forEach((result) => {
    console.log(`id: ${result.getRaw('id')} raw: ${result.getRaw('title')}`)
  })
}).catch((error) => {
  console.log(`error: ${error}`)
})
```

Note that `options` supports all options listed here: https://swiftype.com/documentation/app-search/guides/searching.

### Click Through Tracking

```javascript
client.click(
  'Cat',
  '1234567',
  '8b55561954484f13d872728f849ffd22',
  ['Animal']
).catch((error) => {
  console.log(`error: ${error}`)
})
```

Click throughs can be tracked by binding `client.click` calls to click events on individual search result links.

The following example shows how this can be implemented declaratively by annotating links with class and data attributes.

```javascript
document.addEventListener('click', function(e) {
  const el = e.target;
  if !(el.classList.contains('track-click')) return;

  client.click(
    el.getAttribute('data-query'),
    el.getAttribute('data-document-id'),
    el.getAttribute('data-request-id'),
    [el.getAttribute('data-tag')]
  )
})
```

```html
<a href="/items/1234567"
    class="track-click"
    data-request-id="8b55561954484f13d872728f849ffd22"
    data-document-id="1234567"
    data-query="Cat"
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

  $ npm test

## Adding an updating Tests

  The specs in this project use [node-replay](https://github.com/assaf/node-replay) to capture responses. The engine which was used to capture these
  responses was created using the engine created in [this](https://github.com/swiftype/app-search-demo-react#push-data-to-the-node-modules-engine) tutorial. They were then swapped out with fake credentials as to not expose them publicly.

  To capture new responses:

  1. Re-create that engine per that tutorial, but using "test-engine" as the Engine name. Take note of the new Account and API Keys.
  2. Rename the folder "fixtures/host-01kd84.api.swiftype.com-443" to match your new Account Key.
  3. Replace all instances of "search-aw9sk38fjs7akd9ajbnfav69" in this project with your new Search API Key.
  4. Run the tests and observe that they pass.
  5. Make whatever updates you need, including generating new fixtures with `REPLAY=record npm test`.
  6. Once you're done making changes, do steps 2. and 3. in reverse to swap out your real credentials with fake credentials.
  7. Run the tests and observe that they pass.
  8. Commit your changes.

  We hope to smooth this process out in the future, right now it can be a bit clunky.

## Contributions

  To contribute code, please fork the repository and submit a pull request.
