/**
 * Stream Backend Adapter
 * Integrates MD5 stream computation with backend detection system
 */

import { MD5Backend } from '../adapters/types.js';
import { MD5Stream, MD5Result } from './md5-stream.js';
import { MD5ReadableStream as WHATWGMD5Stream } from './whatwg-stream.js';

/**
 * Stream backend state
 */
interface StreamBackendState {
  stream: MD5Stream | WHATWGMD5Stream;
  type: 'node' | 'whatwg';
}

/**
 * Stream backend for MD5 operations that supports streaming
 * Can be used with both Node.js streams and WHATWG streams
 */
export class StreamBackend implements MD5Backend {
  name: string = 'stream';
  version: string = '0.1.0';
  
  private state: StreamBackendState | null = null;
  
  /**
   * Initialize with Node.js stream
   * @param stream Node.js Transform stream
   */
  initNodeStream(stream: MD5Stream): void {
    this.state = {
      stream,
      type: 'node'
    };
  }
  
  /**
   * Initialize with WHATWG stream
   * @param stream WHATWG ReadableStream
   */
  initWhatWGStream(stream: WHATWGMD5Stream): void {
    this.state = {
      stream,
      type: 'whatwg'
    };
  }
  
  /**
   * Hash string data (converts to stream internally)
   * @param data String to hash
   * @returns MD5 hash as hex string
   */
  async hash(data: string): Promise<string> {
    const stream = new MD5Stream();
    const result = await new Promise<MD5Result>((resolve, reject) => {
      stream
        .on('md5', (result) => resolve(result))
        .on('error', reject)
        .end(data);
    });
    return result.digest;
  }
  
  /**
   * Hash binary data (converts to stream internally)
   * @param data Binary data to hash
   * @returns MD5 hash as hex string
   */
  async hashBinary(data: ArrayBuffer | Uint8Array): Promise<string> {
    const stream = new MD5Stream();
    // Convert ArrayBuffer to Buffer first
    let buffer: Buffer;
    if (data instanceof Uint8Array) {
      buffer = Buffer.from(data);
    } else if (data instanceof ArrayBuffer) {
      buffer = Buffer.from(new Uint8Array(data));
    } else {
      buffer = Buffer.from(data);
    }
    const result = await new Promise<MD5Result>((resolve, reject) => {
      stream
        .on('md5', (result) => resolve(result))
        .on('error', reject)
        .end(buffer);
    });
    return result.digest;
  }
  
  /**
   * Update hash with additional data (streaming)
   * @param data Data to add to hash
   */
  update(data: string | ArrayBuffer | Uint8Array): void | Promise<void> {
    if (!this.state) {
      throw new Error('Stream backend not initialized. Call initNodeStream() or initWhatWGStream() first.');
    }
    
    if (this.state.type === 'node') {
      const nodeStream = this.state.stream as MD5Stream;
      // Convert to Buffer properly based on type
      let buffer: Buffer;
      if (typeof data === 'string') {
        buffer = Buffer.from(data);
      } else if (data instanceof Uint8Array) {
        buffer = Buffer.from(data);
      } else if (data instanceof ArrayBuffer) {
        buffer = Buffer.from(new Uint8Array(data));
      } else {
        buffer = Buffer.from(data);
      }
      nodeStream.write(buffer);
    }
    // WHATWG streams don't support update in the same way
  }
  
  /**
   * Get final hash digest
   * @param encoding Output encoding ('hex' or 'buffer')
   * @returns Hash digest
   */
  digest(encoding?: 'hex' | 'buffer'): string | Uint8Array | Promise<string | Uint8Array> {
    if (!this.state) {
      throw new Error('Stream backend not initialized. Call initNodeStream() or initWhatWGStream() first.');
    }
    
    if (this.state.type === 'node') {
      const nodeStream = this.state.stream as MD5Stream;
      nodeStream.end();
      
      return new Promise<string>((resolve, reject) => {
        nodeStream
          .on('md5', (result) => {
            if (encoding === 'buffer') {
              const hexDigest = result.digest;
              const bytes: number[] = [];
              for (let i = 0; i < hexDigest.length; i += 2) {
                bytes.push(parseInt(hexDigest.substring(i, i + 2), 16));
              }
              // Type assertion to avoid TypeScript error
              resolve(Buffer.from(bytes) as any);
            } else {
              resolve(result.digest);
            }
          })
          .on('error', reject);
      });
    } else {
      const whatwgStream = this.state.stream as WHATWGMD5Stream;
      return whatwgStream.getResult().then(result => result.digest);
    }
  }
  
  /**
   * Reset the hash state
   */
  reset(): void | Promise<void> {
    if (!this.state) {
      return;
    }
    
    if (this.state.type === 'node') {
      (this.state.stream as MD5Stream).reset();
    }
    // WHATWG streams don't support reset
  }
  
  /**
   * Check if backend is available
   * @returns Always true for stream backend
   */
  static isAvailable(): boolean {
    return true; // Stream backend is always available
  }
}
