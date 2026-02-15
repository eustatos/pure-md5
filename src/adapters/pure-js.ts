/**
 * Pure JavaScript Backend
 * Uses the internal md5Core implementation
 */

import { MD5Backend } from "./types.js";
import { md5Core } from "../core/index.js";

export class PureJSBackend implements MD5Backend {
  name: string = "purejs";
  version: string = "0.1.0";

  private state: {
    data: string;
    finished: boolean;
  };

  constructor() {
    this.state = { data: "", finished: false };
  }

  hash(data: string): string {
    return md5Core(data);
  }

  async hashBinary(data: ArrayBuffer | Uint8Array): Promise<string> {
    const text =
      data instanceof ArrayBuffer
        ? new TextDecoder().decode(data)
        : new TextDecoder().decode(data);
    return md5Core(text);
  }

  update(data: string | ArrayBuffer | Uint8Array): void | Promise<void> {
    if (this.state.finished) {
      // Reset if already finished
      this.state = { data: "", finished: false };
    }

    if (data instanceof ArrayBuffer) {
      this.state.data += new TextDecoder().decode(data);
    } else if (data instanceof Uint8Array) {
      this.state.data += new TextDecoder().decode(data);
    } else {
      this.state.data += data;
    }
  }

  digest(encoding?: "hex" | "buffer"): string | Uint8Array | Promise<string | Uint8Array> {
    const result = md5Core(this.state.data);
    this.state.finished = true;

    if (encoding === "buffer") {
      return this.hexToBuffer(result);
    }
    return result;
  }

  reset(): void | Promise<void> {
    this.state = { data: "", finished: false };
  }

  static isAvailable(): boolean {
    return true; // Always available
  }

  private hexToBuffer(hex: string): Uint8Array {
    const bytes: number[] = [];
    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substring(i, i + 2), 16));
    }
    return new Uint8Array(bytes);
  }
}
