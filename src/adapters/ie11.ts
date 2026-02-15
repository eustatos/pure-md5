/**
 * IE11 msCrypto Backend
 * Uses Internet Explorer 11 msCrypto API for MD5 hashing
 */

import { MD5Backend } from "./types.js";

interface WinWithMsCrypto extends Window {
  msCrypto?: Crypto;
}

export class IE11Backend implements MD5Backend {
  name: string = "ie11";
  version: string = "1.0.0";

  static isAvailable(): boolean {
    if (typeof window === "undefined") {
      return false;
    }
    const win = window as WinWithMsCrypto;
    return typeof win.msCrypto !== "undefined" &&
      typeof win.msCrypto.subtle !== "undefined" &&
      typeof win.msCrypto.subtle.digest === "function";
  }

  async hash(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const buffer = encoder.encode(data);
    return await this.hashBinary(buffer);
  }

  async hashBinary(data: ArrayBuffer | Uint8Array): Promise<string> {
    const win = window as WinWithMsCrypto;
    const buffer = data instanceof Uint8Array ? data.buffer as ArrayBuffer : data;
    const hashBuffer = await win.msCrypto!.subtle.digest("MD5", buffer);
    return this.bufferToHex(hashBuffer);
  }

  private bufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  update(_data: string | ArrayBuffer | Uint8Array): void | Promise<void> {
    throw new Error("msCrypto does not support streaming updates");
  }

  digest(_encoding?: "hex" | "buffer"): string | Uint8Array | Promise<string | Uint8Array> {
    throw new Error("msCrypto does not support streaming");
  }

  reset(): void | Promise<void> {
    // No state to reset
  }
}
