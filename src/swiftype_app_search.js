'use strict'

import Client from './client'

export function createClient({accountHostKey, apiKey, engineName}) {
  return new Client(accountHostKey, apiKey, engineName)
}
