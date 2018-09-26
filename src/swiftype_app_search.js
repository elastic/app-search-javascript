"use strict";

import Client from "./client";

export function createClient({
  hostIdentifier,
  accountHostKey,
  apiKey,
  engineName,
  endpointBase
}) {
  hostIdentifier = hostIdentifier || accountHostKey; // accountHostKey is deprecated
  return new Client(hostIdentifier, apiKey, engineName, { endpointBase });
}
