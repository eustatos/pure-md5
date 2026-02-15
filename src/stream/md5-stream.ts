/**
 * MD5Stream - Node.js Transform stream for MD5 hash computation
 * Provides streaming MD5 hashing with minimal overhead
 */

import { Transform, TransformCallback } from 'stream';
import md5cycle from '../md5cycle';
import hex from '../hex';
import add32 from '../add32';

/**
 * State interface for MD5 computation
 */
interface MD5State {
  state: number[];
  bytesProcessed: number;
  buffer: number[];
  bufferLength: number;
}

/**
 * Options for MD5Stream constructor
 */
interface MD5StreamOptions {
  /**
   * Custom add32 function for compatibility testing
   */
  add32?: (x: number, y: number) => number;
}

/**
 * MD5Stream - Node.js Transform stream for computing MD5 hashes
 * 
 * Usage example:
 * ```ts
 * import fs from 'fs';
 * import { MD5Stream } from 'pure-md5';
 * 
 * const stream = new MD5Stream();
 * stream.on('md5', (result) => {
 *   console.log('MD5:', result.digest);
 *   console.log('Bytes:', result.bytesProcessed);
 * });
 * 
 * fs.createReadStream('file.txt').pipe(stream);
 * ```
 */
export class MD5Stream extends Transform {
  private state: MD5State;
  private add32: (x: number, y: number) => number;
  private readonly initialMD5State = [1732584193, -271733879, -1732584194, 271733878];

  /**
   * Create new MD5Stream instance
   * @param options - Stream options
   */
  constructor(options?: MD5StreamOptions) {
    super({
      readableObjectMode: false,
      writableObjectMode: false
    });

    this.add32 = options?.add32 || add32;
    this.state = {
      state: [...this.initialMD5State],
      bytesProcessed: 0,
      buffer: [],
      bufferLength: 0
    };
  }

  /**
   * Process data chunk and update MD5 state
   * @param chunk - Data chunk to process
   * @param callback - Callback to signal chunk processing complete
   */
  _transform(chunk: Buffer, _encoding: BufferEncoding, callback: TransformCallback): void {
    try {
      const data = chunk as Buffer;
      const dataLength = data.length;
      
      // Combine with any existing buffer
      if (this.state.bufferLength > 0 && dataLength > 0) {
        const combinedLength = this.state.bufferLength + dataLength;
        const combined = new Array<number>(combinedLength);
        
        // Copy existing buffer
        for (let i = 0; i < this.state.bufferLength; i++) {
          combined[i] = this.state.buffer[i];
        }
        // Append new data
        for (let i = 0; i < dataLength; i++) {
          combined[this.state.bufferLength + i] = data[i];
        }
        
        this.state.buffer = combined;
        this.state.bufferLength = combinedLength;
      } else if (dataLength > 0) {
        // Just use the new data
        this.state.buffer = Array.from(data);
        this.state.bufferLength = dataLength;
      }
      
      // Process full 64-byte blocks
      const fullBlocks = Math.floor(this.state.bufferLength / 64);
      
      for (let i = 0; i < fullBlocks; i++) {
        const blockStart = i * 64;
        const block: number[] = [];
        
        for (let j = 0; j < 16; j++) {
          const idx = blockStart + j * 4;
          block[j] = 
            this.state.buffer[idx] +
            (this.state.buffer[idx + 1] << 8) +
            (this.state.buffer[idx + 2] << 16) +
            (this.state.buffer[idx + 3] << 24);
        }
        
        md5cycle(this.state.state, block, this.add32);
        this.state.bytesProcessed += 64;
      }
      
      // Keep remaining bytes in buffer
      const remaining = this.state.bufferLength % 64;
      if (remaining > 0) {
        const newBuffer = new Array<number>(remaining);
        for (let i = 0; i < remaining; i++) {
          newBuffer[i] = this.state.buffer[fullBlocks * 64 + i];
        }
        this.state.buffer = newBuffer;
        this.state.bufferLength = remaining;
      } else {
        this.state.buffer = [];
        this.state.bufferLength = 0;
      }
      
      callback();
    } catch (error) {
      callback(error as Error);
    }
  }

  /**
   * Finalize MD5 computation and emit result
   * @param callback - Callback to signal flush complete
   */
  _flush(callback: TransformCallback): void {
    try {
      const { state, bufferLength, buffer } = this.state;
      
      // Final padding
      const tail: number[] = new Array(16).fill(0);
      
      // Copy remaining buffer
      for (let i = 0; i < bufferLength; i++) {
        tail[i >> 2] |= (buffer[i] & 0xff) << ((i % 4) << 3);
      }
      
      // Append 0x80
      tail[bufferLength >> 2] |= 0x80 << ((bufferLength % 4) << 3);
      
      // If not enough space for length, process current block
      if (bufferLength > 55) {
        md5cycle(state, tail, this.add32);
        for (let i = 0; i < 16; i++) {
          tail[i] = 0;
        }
      }
      
      // Append length (in bits) - include remaining bytes
      tail[14] = (this.state.bytesProcessed + bufferLength) * 8;
      tail[15] = 0; // High 32 bits of length (not used for typical files)
      
      // Final MD5 cycle
      md5cycle(state, tail, this.add32);
      
      // Generate hex digest
      const digest = hex(state);
      
      // Emit result
      this.emit('md5', {
        digest,
        bytesProcessed: this.state.bytesProcessed + bufferLength
      });
      
      callback();
    } catch (error) {
      callback(error as Error);
    }
  }

  /**
   * Get current MD5 state (for debugging/testing)
   * @returns Current internal state
   */
  public getCurrentState(): { state: number[]; bytesProcessed: number } {
    return {
      state: [...this.state.state],
      bytesProcessed: this.state.bytesProcessed + this.state.bufferLength
    };
  }

  /**
   * Get bytes processed so far
   * @returns Number of bytes processed
   */
  public getBytesProcessed(): number {
    return this.state.bytesProcessed + this.state.bufferLength;
  }

  /**
   * Reset the stream state
   * Note: This resets the internal MD5 state but not the stream's ended state.
   * For full stream reset, use destroy() and create a new instance.
   */
  public reset(): void {
    // Reset internal MD5 state
    this.state = {
      state: [...this.initialMD5State],
      bytesProcessed: 0,
      buffer: [],
      bufferLength: 0
    };
  }
}

/**
 * Factory function to create MD5Stream instance
 * @param options - MD5Stream options
 * @returns New MD5Stream instance
 */
export function createMD5Stream(options?: MD5StreamOptions): MD5Stream {
  return new MD5Stream(options);
}

/**
 * Result type for MD5 computation
 */
export interface MD5Result {
  /**
   * MD5 hash as hex string
   */
  digest: string;
  /**
   * Number of bytes processed
   */
  bytesProcessed: number;
}

/**
 * Pipe through MD5 stream helper
 * @param this - MD5Stream instance
 * @param source - Source readable stream to process
 * @returns Promise with MD5 result
 */
export async function pipeThroughMD5(
  this: MD5Stream,
  source: import('stream').Readable
): Promise<MD5Result> {
  return new Promise((resolve, reject) => {
    const results: MD5Result[] = [];
    
    source
      .pipe(this)
      .on('md5', (result: MD5Result) => {
        results.push(result);
      })
      .on('error', reject)
      .on('finish', () => {
        resolve(results[0]);
      });
  });
}

/**
 * Static method to create MD5Stream from existing readable stream
 * @param source - Source readable stream
 * @param options - MD5Stream options
 * @returns Object containing stream and result promise
 */
export function fromStream(
  source: import('stream').Readable,
  options?: MD5StreamOptions
): { stream: MD5Stream; result: Promise<MD5Result> } {
  const stream = new MD5Stream(options);
  const result = pipeThroughMD5.call(stream, source);
  
  return { stream, result };
}
