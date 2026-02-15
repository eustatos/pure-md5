/**
 * Web Crypto API Backend
 * Uses browser's native Web Crypto API for MD5 hashing
 */

import { MD5Backend } from "./types.js";

export class WebCryptoBackend implements MD5Backend {
  name: string = "webcrypto";
  version: string = "1.0.0";

  static isAvailable(): boolean {
    return typeof crypto !== "undefined" &&
      typeof crypto.subtle !== "undefined" &&
      typeof crypto.subtle.digest === "function";
  }

  async hash(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const buffer = encoder.encode(data);
    return await this.hashBinary(buffer);
  }

  async hashBinary(data: ArrayBuffer | Uint8Array): Promise<string> {
    const buffer = data instanceof Uint8Array ? (data.buffer as ArrayBuffer) : data;
    const hashBuffer = await crypto.subtle.digest({ name: "MD5" }, buffer);
    return this.bufferToHex(hashBuffer);
  }

  private bufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
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
