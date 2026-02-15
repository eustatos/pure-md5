/**
 * Backend interface for MD5 operations
 */
export interface MD5Backend {
  /**
   * Name of the backend
   */
  name: string;
  
  /**
   * Version of the backend
   */
  version: string;
  
  /**
   * Hash string data
   * @param data - String to hash
   * @returns MD5 hash as hex string
   */
  hash(data: string): string | Promise<string>;
  
  /**
   * Hash binary data (ArrayBuffer, Uint8Array)
   * @param data - Binary data to hash
   * @returns MD5 hash as hex string
   */
  hashBinary(data: ArrayBuffer | Uint8Array): string | Promise<string>;
  
  /**
   * Update hash with additional data (for streaming)
   * @param data - Data to add to hash
   */
  update(data: string | ArrayBuffer | Uint8Array): void | Promise<void>;
  
  /**
   * Get final hash digest
   * @param encoding - Output encoding ('hex' or 'buffer')
   * @returns Hash digest
   */
  digest(encoding?: 'hex' | 'buffer'): string | Uint8Array | Promise<string | Uint8Array>;
  
  /**
   * Reset the hash state
   */
  reset(): void | Promise<void>;
}
