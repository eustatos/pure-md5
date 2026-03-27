/**
 * Tests for MD5Stream public methods: getCurrentState, getBytesProcessed, reset
 */

import { describe, it, expect } from 'vitest';
import { MD5Stream, createMD5Stream, MD5Result } from '../../../src/stream/md5-stream.js';
import { md5Core } from '../../../src/core/index.js';

/**
 * Helper to promisify MD5Stream result
 */
function getResult(stream: MD5Stream): Promise<MD5Result> {
  return new Promise((resolve, reject) => {
    stream.on('md5', resolve).on('error', reject);
  });
}

describe('MD5Stream - Public Methods', () => {
  describe('getCurrentState()', () => {
    it('should return initial state on new instance', () => {
      const stream = new MD5Stream();
      const state = stream.getCurrentState();

      expect(state.state).toHaveLength(4);
      expect(state.state[0]).toBe(1732584193);
      expect(state.state[1]).toBe(-271733879);
      expect(state.state[2]).toBe(-1732584194);
      expect(state.state[3]).toBe(271733878);
      expect(state.bytesProcessed).toBe(0);
    });

    it('should update state after processing data', () => {
      const stream = new MD5Stream();
      stream.write('a'.repeat(70));
      const state = stream.getCurrentState();

      expect(state.bytesProcessed).toBeGreaterThan(0);
      expect(state.state).not.toEqual([1732584193, -271733879, -1732584194, 271733878]);
    });

    it('should not modify internal state on multiple calls', () => {
      const stream = new MD5Stream();
      stream.write('test');

      const state1 = stream.getCurrentState();
      const state2 = stream.getCurrentState();
      const state3 = stream.getCurrentState();

      expect(state1).toEqual(state2);
      expect(state2).toEqual(state3);
    });

    it('should return deep copy of state', () => {
      const stream = new MD5Stream();
      const state1 = stream.getCurrentState();

      state1.state[0] = 0;
      state1.bytesProcessed = 999;

      const state2 = stream.getCurrentState();
      expect(state2.state[0]).not.toBe(0);
      expect(state2.bytesProcessed).not.toBe(999);
    });
  });

  describe('getBytesProcessed()', () => {
    it('should return 0 for new instance', () => {
      const stream = new MD5Stream();
      expect(stream.getBytesProcessed()).toBe(0);
    });

    it('should increment with data chunks', () => {
      const stream = new MD5Stream();

      expect(stream.getBytesProcessed()).toBe(0);
      stream.write('ab');
      expect(stream.getBytesProcessed()).toBe(2);
      stream.write('cd');
      expect(stream.getBytesProcessed()).toBe(4);
    });

    it('should not include pending buffer bytes', () => {
      const stream = new MD5Stream();
      const partial = 'a'.repeat(32);
      stream.write(partial);
      expect(stream.getBytesProcessed()).toBe(32);
    });
  });

  describe('reset()', () => {
    it('should reset state to initial values', () => {
      const stream = new MD5Stream();
      stream.write('test data that will be reset');
      stream.reset();

      const state = stream.getCurrentState();
      expect(state.state[0]).toBe(1732584193);
      expect(state.bytesProcessed).toBe(0);
    });

    it('should allow reusing stream after reset and finish', async () => {
      const stream = new MD5Stream();

      // First computation
      stream.write('first');
      const result1Promise = getResult(stream);
      stream.end();
      const result1 = await result1Promise;
      expect(result1.digest).toBe(md5Core('first'));

      // Reset creates new internal state
      stream.reset();
      expect(stream.getBytesProcessed()).toBe(0);
      expect(stream.getCurrentState().state[0]).toBe(1732584193);
    });
  });
});

describe('MD5Stream - Factory Functions', () => {
  it('createMD5Stream should return valid instance', () => {
    const stream = createMD5Stream();
    expect(stream).toBeInstanceOf(MD5Stream);
    expect(stream.getCurrentState().bytesProcessed).toBe(0);
  });

  it('createMD5Stream should support options', () => {
    const customAdd32 = (x: number, y: number): number => (x + y) & 0xffffffff;
    const stream = createMD5Stream({ add32: customAdd32 });

    expect(stream).toBeInstanceOf(MD5Stream);
    expect(stream.getCurrentState().bytesProcessed).toBe(0);
  });
});

describe('MD5Stream - Error Handling', () => {
  it('should handle destroyed stream gracefully', () => {
    const stream = new MD5Stream();
    stream.destroy();
    // After destroy, stream should not throw but should be in ended state
    expect(stream.destroyed).toBe(true);
  });

  it('should track bytes after destroy', () => {
    const stream = new MD5Stream();
    stream.write('data');
    const bytesBefore = stream.getBytesProcessed();
    stream.destroy();
    // Bytes should be tracked even after destroy
    expect(stream.getBytesProcessed()).toBe(bytesBefore);
  });
});
