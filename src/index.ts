/**
 * Pure MD5 - Unified adapter with auto-detection
 * Supports multiple backends: Web Crypto, Node.js crypto, IE11, and Pure JS
 */

import { md5Core as pureMD5 } from './core/index.js';
import { WebCryptoBackend } from './adapters/webcrypto.js';
import { NodeCryptoBackend } from './adapters/node.js';
import { IE11Backend } from './adapters/ie11.js';
import { StreamBackend } from './stream/adapter.js';
//
// PureJSBackend is exported below, not used directly in this file
import {
  getAllAvailableBackends,
  getBestAvailableBackend
} from './utils/detect.js';

export { md5Core } from './core/index.js';
export { WebCryptoBackend } from './adapters/webcrypto.js';
export { NodeCryptoBackend } from './adapters/node.js';
export { IE11Backend } from './adapters/ie11.js';
export { PureJSBackend } from './adapters/pure-js.js';
export { MD5Backend } from './adapters/types.js';
export {
  MD5Stream,
  MD5Result,
  createMD5Stream,
  pipeThroughMD5,
  fromStream,
  hashFile,
  hashFileStream,
  hashFileDigest,
  hashFileStreamDigest,
  hashFileSync,
  verifyFile,
  createProgressTracker,
  HashFileOptions
} from './stream/index.js';
export {
  getAllAvailableBackends,
  getBestAvailableBackend,
  BackendDetector,
  detector,
  FallbackManager,
  fallbackManager,
  robustHash,
  MetricsCollector,
  metrics
} from './utils/detect.js';

/**
 * Default MD5 adapter with auto-detection
 */
class MD5Adapter {
  private backend: any | null = null;
  private backendName: string | null = null;
  
  /**
   * Hash string data with automatic backend selection
   * @param data - String to hash
   * @returns MD5 hash as hex string
   */
  async hash(data: string): Promise<string> {
    const backend = await this.getBackend();
    return backend.hash(data);
  }
  
  /**
   * Hash binary data with automatic backend selection
   * @param data - Binary data to hash
   * @returns MD5 hash as hex string
   */
  async hashBinary(data: ArrayBuffer | Uint8Array): Promise<string> {
    const backend = await this.getBackend();
    return backend.hashBinary(data);
  }
  
  /**
   * Get backend name
   * @returns Name of the selected backend
   */
  async getBackendName(): Promise<string> {
    if (!this.backendName) {
      const available = await getAllAvailableBackends();
      this.backendName = getBestAvailableBackend(available);
    }
    return this.backendName;
  }
  
  /**
   * Get available backends
   * @returns List of available backend names
   */
  static async getAvailableBackends(): Promise<string[]> {
    return await getAllAvailableBackends();
  }
  
  /**
   * Force specific backend for all operations
   * @param backendName - Backend name to use
   */
  async useBackend(backendName: string): Promise<void> {
    this.backend = await this.createBackendByName(backendName);
    this.backendName = backendName;
  }
  
  /**
   * Create backend by name
   * @param name - Backend name
   * @returns Backend instance
   */
  private async createBackendByName(name: string): Promise<any> {
    switch (name) {
      case 'nodecrypto':
        return new NodeCryptoBackend();
      case 'webcrypto':
        return new WebCryptoBackend();
      case 'ie11':
        return new IE11Backend();
      case 'stream':
        return new StreamBackend();
      case 'purejs':
      default:
        return {
          hash: (data: string) => pureMD5(data),
          hashBinary: async (data: ArrayBuffer | Uint8Array) => pureMD5(data instanceof Uint8Array ? new TextDecoder().decode(data) : new TextDecoder().decode(new Uint8Array(data))),
          update: () => {},
          digest: () => '',
          reset: () => {},
          name: 'purejs',
          version: '0.1.0'
        };
    }
  }
  
  /**
   * Get backend instance (lazy initialization)
   * @returns Backend instance
   */
  private async getBackend(): Promise<any> {
    if (this.backend) {
      return this.backend;
    }
    
    // Get best available backend
    const available = await getAllAvailableBackends();
    const bestBackend = getBestAvailableBackend(available);
    
    this.backend = await this.createBackendByName(bestBackend);
    this.backendName = bestBackend;
    return this.backend;
  }
}

// Export backward-compatible function (synchronous)
export function md5(data: string): string {
  return pureMD5(data);
}

// Export adapter instance for advanced use cases
export const md5Adapter = new MD5Adapter();

// Export async hash method for adapter use
export async function md5Async(data: string): Promise<string> {
  return md5Adapter.hash(data);
}

// Export original function for backward compatibility
export { pureMD5 as md5Original };
