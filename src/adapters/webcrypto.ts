/**
 * Web Crypto API Backend
 * Uses browser's native Web Crypto API for MD5 hashing
 * Note: Web Crypto API does not support MD5 in most browsers, so this backend
 * falls back to pure JS implementation
 */

import { MD5Backend } from "./types.js";
import { md5Core } from "../core/index.js";

export class WebCryptoBackend implements MD5Backend {
  name: string = "webcrypto";
  version: string = "1.0.0";

  static isAvailable(): boolean {
    // Check if Web Crypto API is available
    return typeof crypto !== "undefined" &&
      typeof crypto.subtle !== "undefined" &&
      typeof crypto.subtle.digest === "function";
  }

  async hash(data: string): Promise<string> {
    // Web Crypto API doesn't support MD5, so use pure JS implementation
    return md5Core(data);
  }

  async hashBinary(data: ArrayBuffer | Uint8Array): Promise<string> {
    // Web Crypto API doesn't support MD5, so use pure JS implementation
    const text = data instanceof ArrayBuffer
      ? new TextDecoder().decode(data)
      : new TextDecoder().decode(data);
    return md5Core(text);
  }

  update(_data: string | ArrayBuffer | Uint8Array): void | Promise<void> {
    throw new Error("Web Crypto API does not support streaming updates");
  }

  digest(_encoding?: "hex" | "buffer"): string | Uint8Array | Promise<string | Uint8Array> {
    throw new Error("Web Crypto API does not support streaming");
  }

  reset(): void | Promise<void> {
    // No state to reset
  }
}
