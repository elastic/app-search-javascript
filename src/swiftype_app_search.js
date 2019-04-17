"use strict";

import Client from "./client";

export function createClient({
  hostIdentifier,
  accountHostKey,
  apiKey,
  searchKey,
  engineName,
  endpointBase,
  cacheResponses,
  additionalHeaders
}) {
  hostIdentifier = hostIdentifier || accountHostKey; // accountHostKey is deprecated
  searchKey = searchKey || apiKey; //apiKey is deprecated
  return new Client(hostIdentifier, searchKey, engineName, {
    endpointBase,
    cacheResponses,
    additionalHeaders
  });
}
