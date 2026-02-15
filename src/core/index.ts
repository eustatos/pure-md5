/**
 * Core MD5 implementation - Pure JavaScript
 * No dependencies, no environment detection
 * This is the minimal, tree-shakeable core
 */

import hex from '../hex';
import md51 from '../md51';
import add32 from '../add32';

/**
 * Compute MD5 hash of a string
 * @param string - Input string to hash
 * @returns MD5 hash as hex string
 */
export function md5Core(string: string): string {
  // Use the original implementation
  const fn = add32;
  return hex(md51(string, fn));
}

export { md5Core as md5 };
