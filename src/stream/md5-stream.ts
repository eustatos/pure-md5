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
  bufferLength: number;
  buffer: Uint8Array;
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
  private readonly bufferCapacity: number = 64;
  private buffer: Uint8Array = new Uint8Array(this.bufferCapacity);

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
      bufferLength: 0,
      buffer: this.buffer
    };
  }

  /**
   * Process data chunk and update MD5 state
   * @param chunk - Data chunk to process
   * @param callback - Callback to signal chunk processing complete
   */
  _transform(chunk: Buffer, _encoding: BufferEncoding, callback: TransformCallback): void {
    try {
      let data = chunk as Buffer;
      const dataLength = data.length;
      
      if (dataLength === 0) {
        callback();
        return;
      }

      // Combine with remaining buffer if needed
      if (this.state.bufferLength > 0) {
        const currentBufferLength = this.state.bufferLength;
        const neededBytes = 64 - currentBufferLength;
        const bytesToCopy = Math.min(dataLength, neededBytes);
        
        // Copy data to buffer
        for (let i = 0; i < bytesToCopy; i++) {
          this.buffer[currentBufferLength + i] = data[i];
        }
        
        this.state.bufferLength += bytesToCopy;
        
        // If buffer is full, process it
        if (this.state.bufferLength === 64) {
          this._processBufferBlock();
        }
        
        // If we used all data, we're done
        if (bytesToCopy === dataLength) {
          callback();
          return;
        }
        
        // Move to next position in original data
        // Shift remaining data to beginning of buffer
        const remainingData = dataLength - bytesToCopy;
        for (let i = 0; i < remainingData; i++) {
          data[i] = data[bytesToCopy + i];
        }
        // Create a new buffer with only the remaining data
        const remainingBuffer = Buffer.alloc(remainingData);
        for (let i = 0; i < remainingData; i++) {
          remainingBuffer[i] = data[i];
        }
        data = remainingBuffer;
      }
      
      // Process full 64-byte blocks directly from data
      const fullBlocks = Math.floor(data.length / 64);
      
      for (let i = 0; i < fullBlocks; i++) {
        const blockStart = i * 64;
        const block: number[] = [];
        
        for (let j = 0; j < 16; j++) {
          const idx = blockStart + j * 4;
          block[j] = 
            data[idx] +
            (data[idx + 1] << 8) +
            (data[idx + 2] << 16) +
            (data[idx + 3] << 24);
        }
        
        md5cycle(this.state.state, block, this.add32);
        this.state.bytesProcessed += 64;
      }
      
      // Store remaining bytes in buffer
      const remaining = data.length % 64;
      if (remaining > 0) {
        // Ensure buffer is large enough
        if (this.buffer.length < remaining) {
          this.buffer = new Uint8Array(remaining);
          this.state.buffer = this.buffer;
        }
        
        // Copy remaining bytes to buffer
        for (let i = 0; i < remaining; i++) {
          this.buffer[i] = data[fullBlocks * 64 + i];
        }
        this.state.bufferLength = remaining;
      }
      
      callback();
    } catch (error) {
      callback(error as Error);
    }
  }

  /**
   * Process the current buffer as a complete block
   */
  private _processBufferBlock(): void {
    const buffer = this.state.buffer;
    const block: number[] = [];
    
    for (let j = 0; j < 16; j++) {
      const idx = j * 4;
      block[j] = 
        buffer[idx] +
        (buffer[idx + 1] << 8) +
        (buffer[idx + 2] << 16) +
        (buffer[idx + 3] << 24);
    }
    
    md5cycle(this.state.state, block, this.add32);
    this.state.bytesProcessed += 64;
    this.state.bufferLength = 0;
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
      bufferLength: 0,
      buffer: this.buffer
    };
    this.buffer = new Uint8Array(this.bufferCapacity);
    this.state.buffer = this.buffer;
    this.state.bufferLength = 0;
  }

  /**
   * Static method to create MD5Stream from existing readable stream
   * @param source - Source readable stream
   * @param options - MD5Stream options
   * @returns Object containing stream and result promise
   */
  static fromStream(
    source: import('stream').Readable,
    options?: MD5StreamOptions
  ): { stream: MD5Stream; result: Promise<MD5Result> } {
    const stream = new MD5Stream(options);
    const result = pipeThroughMD5.call(stream, source);
    
    return { stream, result };
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
