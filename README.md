# Javascript client for the Swiftype App Search Api

**Note: Swiftype App Search is currently in beta**

## Build

```bash
yarn install
yarn build
```


## Install

```bash
cp public/bundle.js ~/your_web_project/swiftype-app-search-bundle.js
```


## Usage

```javascript
var client = SwiftypeAppSearch.createClient({
  accountHostKey: 'host-c5s2mj',
  apiKey: 'api-mu75psc5egt9ppzuycnc2mc3',
  engineName: 'favorite-videos'
})

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
