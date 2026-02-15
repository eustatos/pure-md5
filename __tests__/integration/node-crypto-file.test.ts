/**
 * Integration tests for Node.js Crypto Backend with files
 */

import fs from 'fs';
import path from 'path';
import { NodeCryptoBackend } from '../../src/adapters/node.js';

describe('NodeCryptoBackend with Files', () => {
  let backend: NodeCryptoBackend;
  
  beforeAll(() => {
    if (!NodeCryptoBackend.isAvailable()) {
      console.log('Node.js Crypto not available, skipping tests');
      pending('Node.js Crypto not available');
      return;
    }
    backend = new NodeCryptoBackend();
  });
  
  it('should hash a file', async () => {
    if (!backend) {
      pending('Node.js Crypto not available');
      return;
    }
    
    const filePath = path.join(__dirname, 'fixtures', 'test-file.txt');
    
    if (!fs.existsSync(filePath)) {
      console.log('Test file not found, creating it');
      const fixturesDir = path.dirname(filePath);
      if (!fs.existsSync(fixturesDir)) {
        fs.mkdirSync(fixturesDir, { recursive: true });
      }
      fs.writeFileSync(filePath, 'Hello, World!');
    }
    
    const content = fs.readFileSync(filePath);
    const result = await backend.hashBinary(content);
    expect(result.length).toBe(32);
  });
  
  it('should handle large files efficiently', async () => {
    if (!backend) {
      pending('Node.js Crypto not available');
      return;
    }
    
    const filePath = path.join(__dirname, 'fixtures', 'large-file.bin');
    
    if (!fs.existsSync(filePath)) {
      console.log('Large file not found, skipping');
      return;
    }
    
    const content = fs.readFileSync(filePath);
    const start = Date.now();
    const result = await backend.hashBinary(content);
    const duration = Date.now() - start;
    
    expect(result.length).toBe(32);
    expect(duration).toBeLessThan(500);
  });
  
  it('should produce consistent hash for the same file', async () => {
    if (!backend) {
      pending('Node.js Crypto not available');
      return;
    }
    
    const filePath = path.join(__dirname, 'fixtures', 'test-file.txt');
    
    if (!fs.existsSync(filePath)) {
      const fixturesDir = path.dirname(filePath);
      if (!fs.existsSync(fixturesDir)) {
        fs.mkdirSync(fixturesDir, { recursive: true });
      }
      fs.writeFileSync(filePath, 'Consistent Test Data');
    }
    
    const content = fs.readFileSync(filePath);
    const result1 = await backend.hashBinary(content);
    const result2 = await backend.hashBinary(content);
    expect(result1).toBe(result2);
  });
});
