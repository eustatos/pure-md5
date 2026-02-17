/**
 * Performance benchmarks for WHATWG stream implementations
 * Compares performance in browser-like environments
 */

import { MD5ReadableStream, hashBlob } from '../src/stream/whatwg-stream.js';

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
 * Benchmark MD5ReadableStream with different chunk sizes
 */
async function benchmarkMD5ReadableStreamChunkSizes(): Promise<void> {
  console.log('\n=== WHATWG Stream Chunk Size Benchmarks ===\n');
  
  const testString = 'a'.repeat(1024 * 1024); // 1MB
  const chunkSizes = [1, 10, 64, 1024, 16 * 1024, 64 * 1024, 256 * 1024, 1024 * 1024];
  
  console.log('Chunk Size (bytes) | Avg Time (ms) | Throughput (MB/s)');
  console.log('-'.repeat(60));
  
  for (const chunkSize of chunkSizes) {
    const times: number[] = [];
    
    for (let i = 0; i < 3; i++) {
      const chunks = Math.ceil(testString.length / chunkSize);
      const source = new ReadableStream({
        start(controller) {
          for (let j = 0; j < chunks; j++) {
            const start = j * chunkSize;
            const end = Math.min(start + chunkSize, testString.length);
            controller.enqueue(new TextEncoder().encode(testString.substring(start, end)));
          }
          controller.close();
        }
      });
      
      const { duration } = measureTime(async () => {
        await MD5ReadableStream.hash(source);
      });
      
      times.push(duration);
    }
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const throughput = (testString.length / 1024 / 1024) / (avgTime / 1000);
    
    console.log(`${chunkSize.toString().padStart(18)} | ${avgTime.toFixed(2).padStart(13)} | ${throughput.toFixed(2).padStart(17)}`);
  }
}

/**
 * Benchmark large file processing
 */
async function benchmarkLargeFileProcessing(): Promise<void> {
  console.log('\n=== Large File Processing Benchmarks ===\n');
  
  const sizes = [
    1024 * 1024,        // 1MB
    10 * 1024 * 1024,   // 10MB
    100 * 1024 * 1024   // 100MB
  ];
  
  console.log('Size (MB) | Time (ms) | Throughput (MB/s)');
  console.log('-'.repeat(60));
  
  for (const size of sizes) {
    const data = new Blob(['a'.repeat(size)]);
    
    const { duration } = measureTime(async () => {
      await hashBlob(data);
    });
    
    const sizeMB = size / 1024 / 1024;
    const throughput = sizeMB / (duration / 1000);
    
    console.log(`${sizeMB.toString().padStart(9)} | ${duration.toFixed(2).padStart(9)} | ${throughput.toFixed(2).padStart(17)}`);
  }
}

/**
 * Benchmark concurrent hashing
 */
async function benchmarkConcurrentHashing(): Promise<void> {
  console.log('\n=== Concurrent Hashing Benchmarks ===\n');
  
  const numFiles = [1, 5, 10, 20];
  const fileSize = 1024 * 1024; // 1MB each
  
  console.log('Concurrent Files | Total Time (ms) | Avg Time per File (ms)');
  console.log('-'.repeat(60));
  
  for (const count of numFiles) {
    const files: Blob[] = [];
    for (let i = 0; i < count; i++) {
      files.push(new Blob(['a'.repeat(fileSize)]));
    }
    
    const { duration } = measureTime(async () => {
      const promises = files.map(file => hashBlob(file));
      await Promise.all(promises);
    });
    
    const avgTime = duration / count;
    
    console.log(`${count.toString().padStart(16)} | ${duration.toFixed(2).padStart(16)} | ${avgTime.toFixed(2).padStart(22)}`);
  }
}

/**
 * Benchmark memory efficiency with large streams
 */
async function benchmarkMemoryEfficiency(): Promise<void> {
  console.log('\n=== Memory Efficiency Benchmarks ===\n');
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
  
  const sizes = [10 * 1024 * 1024, 50 * 1024 * 1024, 100 * 1024 * 1024]; // 10MB, 50MB, 100MB
  
  console.log('Size (MB) | Peak Memory (MB) | Streams Created');
  console.log('-'.repeat(60));
  
  for (const size of sizes) {
    const initialMemory = process.memoryUsage().heapUsed;
    
    // Process with streaming
    const blob = new Blob(['a'.repeat(size)]);
    await hashBlob(blob);
    
    const finalMemory = process.memoryUsage().heapUsed;
    const peakMemory = (finalMemory - initialMemory) / 1024 / 1024;
    
    console.log(`${(size / 1024 / 1024).toString().padStart(9)} | ${peakMemory.toFixed(2).padStart(16)} | 1`);
  }
}

/**
 * Run all WHATWG stream benchmarks
 */
async function runAllBenchmarks(): Promise<void> {
  console.log('Starting WHATWG Stream Performance Benchmarks');
  console.log('============================================\n');
  
  try {
    await benchmarkMD5ReadableStreamChunkSizes();
    await benchmarkLargeFileProcessing();
    await benchmarkConcurrentHashing();
    await benchmarkMemoryEfficiency();
    
    console.log('\n=== WHATWG Stream Benchmarks Complete ===\n');
  } catch (error) {
    console.error('Benchmark error:', error);
  }
}

// Run benchmarks if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllBenchmarks();
}

export {
  benchmarkMD5ReadableStreamChunkSizes,
  benchmarkLargeFileProcessing,
  benchmarkConcurrentHashing,
  benchmarkMemoryEfficiency,
  runAllBenchmarks
};
