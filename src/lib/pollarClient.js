import { PollarClient } from '@pollar/core';

export const POLLAR_API_KEY = import.meta.env.VITE_POLLAR_API_KEY || "pub_testnet_0bafb24f8ffa9564a0b6542d8a1e6311";
export const POLLAR_BASE_URL = import.meta.env.VITE_POLLAR_BASE_URL || "https://sdk.api.pollar.xyz";
export const POLLAR_SERVER_URL = import.meta.env.VITE_POLLAR_SERVER_URL || "https://server.api.pollar.xyz";

let clientSingleton = null;

/**
 * Returns singleton instance of official Pollar SDK client
 */
export function getPollarClient() {
  if (typeof window === 'undefined') return null;
  if (!clientSingleton) {
    try {
      clientSingleton = new PollarClient({
        apiKey: POLLAR_API_KEY,
        baseUrl: POLLAR_BASE_URL,
        stellarNetwork: 'testnet'
      });
    } catch (e) {
      console.warn('[Pollar] SDK initialization notice:', e);
    }
  }
  return clientSingleton;
}
