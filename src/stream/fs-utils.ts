/**
 * File System Utilities for MD5 hashing
 * Provides convenient utilities for hashing files through Node.js file system streams
 */

import fs from 'fs';
import { Readable } from 'stream';
import { MD5Result, createMD5Stream } from './md5-stream.js';
import { md5Core } from '../core/index.js';

/**
 * Options for file hashing operations
 */
export interface HashFileOptions {
  /**
   * Chunk size for reading file (default: 64KB)
   */
  chunkSize?: number;
  
  /**
   * Progress callback for tracking hashing progress
   * @param current - Current position in bytes
   */
  onProgress?: (current: number) => void;
}

/**
 * Hash a file by its path
 * @param filePath - Path to the file to hash
 * @param options - Optional configuration
 * @returns Promise with MD5 result (digest and bytes processed)
 * 
 * @example
 * ```ts
 * import { hashFile } from 'pure-md5';
 * 
 * const result = await hashFile('path/to/file.txt');
 * console.log('MD5:', result.digest);
 * console.log('Bytes:', result.bytesProcessed);
 * ```
 */
export async function hashFile(
  filePath: string,
  options: HashFileOptions = {}
): Promise<MD5Result> {
  // Validate file path
  if (typeof filePath !== 'string' || filePath.trim() === '') {
    throw new Error('Invalid file path: must be a non-empty string');
  }

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  // Get file stats to check if it's a file (not directory)
  let stats: fs.Stats;
  try {
    stats = fs.statSync(filePath);
  } catch (error) {
    throw new Error(`Failed to access file ${filePath}: ${(error as Error).message}`);
  }

  if (!stats.isFile()) {
    throw new Error(`Path is not a file: ${filePath}`);
  }

  // Create readable stream
  const readStream = fs.createReadStream(filePath, {
    highWaterMark: options.chunkSize || 64 * 1024 // 64KB default
  });

  try {
    return await hashFileStream(readStream, {
      onProgress: options.onProgress,
      totalSize: stats.size
    });
  } finally {
    // Ensure stream is destroyed to free resources
    readStream.destroy();
  }
}

/**
 * Hash data from an existing readable stream
 * @param readStream - Readable stream to hash
 * @param options - Optional configuration
 * @returns Promise with MD5 result (digest and bytes processed)
 * 
 * @example
 * ```ts
 * import { createReadStream } from 'fs';
 * import { hashFileStream } from 'pure-md5';
 * 
 * const stream = createReadStream('path/to/file.txt');
 * const result = await hashFileStream(stream);
 * console.log('MD5:', result.digest);
 * ```
 */
export async function hashFileStream(
  readStream: Readable,
  options: {
    onProgress?: (current: number) => void;
    totalSize?: number;
  } = {}
): Promise<MD5Result> {
  // Validate stream
  if (!readStream || typeof readStream.on !== 'function') {
    throw new Error('Invalid readable stream: stream must have event listener support');
  }

  // Create MD5 stream
  const md5Stream = createMD5Stream();

  // Track progress if callback provided
  let bytesProcessed = 0;
  
  if (options.onProgress) {
    readStream.on('data', (chunk: Buffer) => {
      bytesProcessed += chunk.length;
      options.onProgress?.(bytesProcessed);
    });
  }

  // Handle stream errors
  readStream.on('error', (error) => {
    md5Stream.destroy(error);
  });

  // Handle stream end
  readStream.on('end', () => {
    md5Stream.end();
  });

  // Pipe stream through MD5
  return new Promise<MD5Result>((resolve, reject) => {
    md5Stream
      .on('md5', (result: MD5Result) => {
        resolve(result);
      })
      .on('error', (error) => {
        reject(error);
      });
    
    readStream.pipe(md5Stream);
  });
}

/**
 * Hash a file and return only the hex digest
 * @param filePath - Path to the file to hash
 * @param options - Optional configuration
 * @returns Promise with MD5 hex digest string
 * 
 * @example
 * ```ts
 * import { hashFileDigest } from 'pure-md5';
 * 
 * const digest = await hashFileDigest('path/to/file.txt');
 * console.log('MD5:', digest);
 * ```
 */
export async function hashFileDigest(
  filePath: string,
  options: HashFileOptions = {}
): Promise<string> {
  const result = await hashFile(filePath, options);
  return result.digest;
}

/**
 * Hash a file stream and return only the hex digest
 * @param readStream - Readable stream to hash
 * @param options - Optional configuration
 * @returns Promise with MD5 hex digest string
 */
export async function hashFileStreamDigest(
  readStream: Readable,
  options: { onProgress?: (current: number) => void; totalSize?: number } = {}
): Promise<string> {
  const result = await hashFileStream(readStream, options);
  return result.digest;
}

/**
 * Verify file integrity by comparing MD5 hash
 * @param filePath - Path to the file to verify
 * @param expectedDigest - Expected MD5 hex digest
 * @param options - Optional configuration
 * @returns Promise with verification result
 * 
 * @example
 * ```ts
 * import { verifyFile } from 'pure-md5';
 * 
 * const isVerified = await verifyFile(
 *   'path/to/file.txt',
 *   '5d41402abc4b2a76b9719d911017c592'
 * );
 * console.log('Verified:', isVerified);
 * ```
 */
export async function verifyFile(
  filePath: string,
  expectedDigest: string,
  options: HashFileOptions = {}
): Promise<boolean> {
  const result = await hashFile(filePath, options);
  return result.digest.toLowerCase() === expectedDigest.toLowerCase();
}

/**
 * Get MD5 hash of a file synchronously (not recommended for large files)
 * @param filePath - Path to the file to hash
 * @returns MD5 hex digest string
 * 
 * @example
 * ```ts
 * import { hashFileSync } from 'pure-md5';
 * 
 * const digest = hashFileSync('path/to/file.txt');
 * console.log('MD5:', digest);
 * ```
 */
export function hashFileSync(filePath: string): string {
  // Validate file path
  if (typeof filePath !== 'string' || filePath.trim() === '') {
    throw new Error('Invalid file path: must be a non-empty string');
  }

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  // Get file stats
  let stats: fs.Stats;
  try {
    stats = fs.statSync(filePath);
  } catch (error) {
    throw new Error(`Failed to access file ${filePath}: ${(error as Error).message}`);
  }

  if (!stats.isFile()) {
    throw new Error(`Path is not a file: ${filePath}`);
  }

  // Read entire file into memory (not recommended for large files)
  let content: Buffer;
  try {
    content = fs.readFileSync(filePath);
  } catch (error) {
    throw new Error(`Failed to read file ${filePath}: ${(error as Error).message}`);
  }

  // Use synchronous MD5 computation
  return md5Core(content.toString());
}

/**
 * Utility to create a progress tracker for file hashing
 * @param totalSize - Total size of the file being hashed
 * @param onUpdate - Callback with progress percentage (0-100)
 * @returns Progress callback function
 * 
 * @example
 * ```ts
 * import { hashFile, createProgressTracker } from 'pure-md5';
 * 
 * const totalSize = 1024 * 1024 * 100; // 100MB
 * const progress = createProgressTracker(totalSize, (percent) => {
 *   console.log(`Progress: ${percent.toFixed(1)}%`);
 * });
 * 
 * const result = await hashFile('large-file.bin', { onProgress: progress });
 * ```
 */
export function createProgressTracker(
  totalSize: number,
  onUpdate: (percentage: number) => void
): (current: number) => void {
  let lastPercentage = 0;
  
  return (current: number) => {
    if (totalSize > 0) {
      const percentage = Math.min(100, (current / totalSize) * 100);
      
      // Only update if percentage changed significantly
      if (Math.floor(percentage) !== Math.floor(lastPercentage)) {
        onUpdate(percentage);
        lastPercentage = percentage;
      }
    }
  };
}
