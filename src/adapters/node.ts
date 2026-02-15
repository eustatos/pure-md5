/**
 * Node.js Crypto Backend
 * Uses Node.js native crypto module for MD5 hashing
 */

import { MD5Backend } from "./types.js";

export class NodeCryptoBackend implements MD5Backend {
  name: string = "nodecrypto";
  version: string = "1.0.0";

  static isAvailable(): boolean {
    try {
      const nodeCrypto = require("node:crypto");
      return typeof nodeCrypto.createHash === "function";
    } catch {
      return false;
    }
  }

  hash(data: string): string {
    const nodeCrypto = require("node:crypto");
    return nodeCrypto.createHash("md5").update(data).digest("hex");
  }

  async hashBinary(data: ArrayBuffer | Uint8Array): Promise<string> {
    const nodeCrypto = require("node:crypto");
    const buffer = data instanceof Uint8Array ? data : new Uint8Array(data);
    return nodeCrypto.createHash("md5").update(buffer).digest("hex");
  }

  update(_data: string | ArrayBuffer | Uint8Array): void | Promise<void> {
    // Node crypto handles streaming internally
    // This is here for interface compatibility
  }

  digest(_encoding?: "hex" | "buffer"): string | Uint8Array | Promise<string | Uint8Array> {
    throw new Error("Node crypto streaming not implemented");
  }

  reset(): void | Promise<void> {
    // No state to reset
  }
}
