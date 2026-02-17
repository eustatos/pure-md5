/**
 * Performance benchmarks for MD5 stream implementations
 * Compares performance across different chunk sizes and data sizes
 */

import { MD5Stream, createMD5Stream, pipeThroughMD5 } from '../src/stream/md5-stream.js';
import crypto from 'crypto';
import { createReadStream, readFileSync } from 'fs';
import { Readable } from 'stream';

/**
 * Helper to measure execution time
 */
function measureTime<T>(fn: () => Promise<T> | T): { result: T; duration: number } {
  const start = process.hrtime.bigint();
  const result = fn();
  const end = process.hrtime.bigint();
  
  const duration = Number(end - start) / 1e6; // Convert to milliseconds
  return { result, duration };
}

/**
 * Benchmark MD5Stream with different chunk sizes
 */
async function benchmarkMD5StreamChunkSizes(): Promise<void> {
  console.log('\n=== MD5Stream Chunk Size Benchmarks ===\n');
  
  const testString = 'a'.repeat(1024 * 1024); // 1MB
  const chunkSizes = [1, 10, 64, 1024, 16 * 1024, 64 * 1024, 256 * 1024, 1024 * 1024];
  
  console.log('Chunk Size (bytes) | Avg Time (ms) | Throughput (MB/s)');
  console.log('-'.repeat(60));
  
  for (const chunkSize of chunkSizes) {
    const times: number[] = [];
    
    for (let i = 0; i < 5; i++) {
      const stream = new MD5Stream();
      const chunks = Math.ceil(testString.length / chunkSize);
      
      for (let j = 0; j < chunks; j++) {
        const start = j * chunkSize;
        const end = Math.min(start + chunkSize, testString.length);
        stream.write(testString.substring(start, end));
      }
      stream.end();
      
      const result = await new Promise<string>((resolve) => {
        stream.on('md5', (r: { digest: string }) => resolve(r.digest));
      });
      
      // Verify result
      const expected = require('crypto').createHash('md5').update(testString).digest('hex');
      if (result !== expected) {
        console.error(`Mismatch! Expected: ${expected}, Got: ${result}`);
      }
    }
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const throughput = (testString.length / 1024 / 1024) / (avgTime / 1000);
    
    console.log(`${chunkSize.toString().padStart(18)} | ${avgTime.toFixed(2).padStart(13)} | ${throughput.toFixed(2).padStart(17)}`);
  }
}

/**
 * Benchmark against Node.js native crypto
 */
async function benchmarkNativeCrypto(): Promise<void> {
  console.log('\n=== Native Crypto Comparison ===\n');
  
  const sizes = [1024, 1024 * 1024, 10 * 1024 * 1024]; // 1KB, 1MB, 10MB
  
  console.log('Size (MB) | MD5Stream (ms) | Native Crypto (ms) | Ratio');
  console.log('-'.repeat(60));
  
  for (const size of sizes) {
    const data = 'a'.repeat(size);
    
    // Benchmark MD5Stream
    const { duration: md5StreamTime } = measureTime(async () => {
      const stream = new MD5Stream();
      stream.write(data);
      stream.end();
      await new Promise((resolve) => stream.on('md5', resolve));
    });
    
    // Benchmark native crypto
    const { duration: nativeTime } = measureTime(() => {
      crypto.createHash('md5').update(data).digest('hex');
    });
    
    const sizeMB = size / 1024 / 1024;
    const ratio = md5StreamTime / nativeTime;
    
    console.log(`${sizeMB.toString().padStart(9)} | ${md5StreamTime.toFixed(2).padStart(14)} | ${nativeTime.toFixed(2).padStart(18)} | ${ratio.toFixed(2).padStart(6)}`);
  }
}

/**
 * Benchmark memory usage
 */
async function benchmarkMemoryUsage(): Promise<void> {
  console.log('\n=== Memory Usage Benchmarks ===\n');
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
  
  const sizes = [1024 * 1024, 10 * 1024 * 1024, 100 * 1024 * 1024]; // 1MB, 10MB, 100MB
  
  console.log('Size (MB) | Peak Memory (MB) | Streams Created');
  console.log('-'.repeat(60));
  
  for (const size of sizes) {
    const initialMemory = process.memoryUsage().heapUsed;
    
    // Process with streaming
    const stream = new MD5Stream();
    const chunkSize = 64 * 1024; // 64KB chunks
    const chunks = Math.ceil(size / chunkSize);
    
    for (let i = 0; i < chunks; i++) {
      stream.write('a'.repeat(chunkSize));
    }
    stream.end();
    
    await new Promise((resolve) => stream.on('md5', resolve));
    
    const finalMemory = process.memoryUsage().heapUsed;
    const peakMemory = (finalMemory - initialMemory) / 1024 / 1024;
    
    console.log(`${(size / 1024 / 1024).toString().padStart(9)} | ${peakMemory.toFixed(2).padStart(16)} | ${chunks}`);
  }
}

/**
 * Benchmark with file I/O
 */
async function benchmarkFileIO(filePath: string): Promise<void> {
  console.log('\n=== File I/O Benchmark ===\n');
  
  if (!filePath) {
    console.log('No file provided. Skipping file benchmark.');
    return;
  }
  
  // Benchmark MD5Stream
  const { duration: md5StreamTime } = measureTime(async () => {
    const stream = createReadStream(filePath);
    const md5Stream = new MD5Stream();
    
    await new Promise((resolve, reject) => {
      stream
        .pipe(md5Stream)
        .on('md5', resolve)
        .on('error', reject);
    });
  });
  
  // Benchmark native crypto
  const { duration: nativeTime } = measureTime(() => {
    const hash = crypto.createHash('md5');
    const fileContent = readFileSync(filePath);
    hash.update(fileContent);
    return hash.digest('hex');
  });
  
  console.log(`File: ${filePath}`);
  console.log(`MD5Stream: ${md5StreamTime.toFixed(2)} ms`);
  console.log(`Native Crypto: ${nativeTime.toFixed(2)} ms`);
  console.log(`Ratio: ${md5StreamTime / nativeTime.toFixed(2)}`);
}

/**
 * Run all benchmarks
 */
async function runAllBenchmarks(): Promise<void> {
  console.log('Starting MD5 Stream Performance Benchmarks');
  console.log('===========================================\n');
  
  try {
    await benchmarkMD5StreamChunkSizes();
    await benchmarkNativeCrypto();
    await benchmarkMemoryUsage();
    
    // File benchmark if file provided
    const filePath = process.argv[2];
    if (filePath) {
      await benchmarkFileIO(filePath);
    }
    
    console.log('\n=== Benchmarks Complete ===\n');
  } catch (error) {
    console.error('Benchmark error:', error);
  }
}

// Run benchmarks if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllBenchmarks();
}

export {
  benchmarkMD5StreamChunkSizes,
  benchmarkNativeCrypto,
  benchmarkMemoryUsage,
  benchmarkFileIO,
  runAllBenchmarks
};
