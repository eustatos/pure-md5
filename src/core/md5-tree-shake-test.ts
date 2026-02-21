// Simulate tree-shaken version - only what md5() needs
import { hex } from '../hex.js';
import { md51 } from '../md51.js';
import { add32 } from '../add32.js';

export function md5(message: string): string {
  return hex(md51(message, add32));
}
