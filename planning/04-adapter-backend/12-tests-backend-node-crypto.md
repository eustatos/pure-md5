# Task 12: Node.js Backend Tests

## Goal

Создать комплексные тесты для Node.js Crypto backend адаптера.

## Implementation

### 1. Создать файл `__tests__/adapters/node-crypto.test.ts`

```typescript
import { NodeCryptoBackend } from '../../src/adapters/node-crypto.js';

describe('NodeCryptoBackend', () => {
  let backend: NodeCryptoBackend;
  
  beforeAll(() => {
    if (!NodeCryptoBackend.isAvailable()) {
      console.log('Node.js Crypto not available, skipping tests');
      this.skip();
      return;
    }
    backend = new NodeCryptoBackend();
  });
  
  describe('Basic hashing', () => {
    it('should hash string correctly', () => {
      const result = backend.hash('hello');
      expect(result).toBe('5d41402abc4b2a76b9719d911017c592');
    });
    
    it('should hash empty string', () => {
      const result = backend.hash('');
      expect(result).toBe('d41d8cd98f00b204e9800998ecf8427e');
    });
    
    it('should hash special characters', () => {
      const result = backend.hash('!@#$%^&*()');
      expect(result).toBe('903246b67e6a702cbb3749e376397578');
    });
    
    it('should hash unicode characters', () => {
      const result = backend.hash('Привет мир');
      expect(result).toBe('expected_hash_here'); // Replace with actual expected hash
    });
    
    it('should hash long string', () => {
      const longString = 'a'.repeat(10000);
      const result = backend.hash(longString);
      expect(result.length).toBe(32);
    });
  });
  
  describe('Binary data', () => {
    it('should hash Uint8Array', () => {
      const data = new Uint8Array([104, 101, 108, 108, 111]); // "hello"
      const result = backend.hashBinary(data);
      expect(result).toBe('5d41402abc4b2a76b9719d911017c592');
    });
    
    it('should hash ArrayBuffer', () => {
      const data = new TextEncoder().encode('hello').buffer;
      const result = backend.hashBinary(data);
      expect(result).toBe('5d41402abc4b2a76b9719d911017c592');
    });
    
    it('should hash empty Uint8Array', () => {
      const data = new Uint8Array(0);
      const result = backend.hashBinary(data);
      expect(result).toBe('d41d8cd98f00b204e9800998ecf8427e');
    });
  });
  
  describe('Streaming', () => {
    it('should support streaming via update/digest', () => {
      backend.update('he');
      backend.update('l');
      backend.update('lo');
      const result = backend.digest('hex');
      expect(result).toBe('5d41402abc4b2a76b9719d911017c592');
    });
    
    it('should support streaming with binary data', () => {
      backend.update(new Uint8Array([104, 101]));
      backend.update(new Uint8Array([108, 108, 111]));
      const result = backend.digest('hex');
      expect(result).toBe('5d41402abc4b2a76b9719d911017c592');
    });
    
    it('should reset state', () => {
      backend.update('hello');
      backend.reset();
      backend.update('world');
      const result = backend.digest('hex');
      expect(result).toBe('5d41402abc4b2a76b9719d911017c592');
    });
  });
  
  describe('Availability', () => {
    it('should be available in Node.js', () => {
      const available = NodeCryptoBackend.isAvailable();
      expect(available).toBe(true);
    });
    
    it('should throw error if not available', () => {
      jest.spyOn(NodeCryptoBackend, 'isAvailable').mockReturnValue(false);
      
      expect(() => backend.hash('test')).toThrow('Node.js Crypto is not available');
    });
  });
  
  describe('Performance', () => {
    it('should hash 1MB data efficiently', () => {
      const data = 'a'.repeat(1024 * 1024); // 1MB
      
      const start = Date.now();
      const result = backend.hash(data);
      const duration = Date.now() - start;
      
      expect(result.length).toBe(32);
      expect(duration).toBeLessThan(500); // Should complete in under 500ms
    });
  });
  
  describe('Consistency', () => {
    it('should produce same hash for same input', () => {
      const input = 'test input';
      const result1 = backend.hash(input);
      const result2 = backend.hash(input);
      expect(result1).toBe(result2);
    });
    
    it('should produce different hash for different inputs', () => {
      const result1 = backend.hash('hello');
      const result2 = backend.hash('world');
      expect(result1).not.toBe(result2);
    });
  });
});
```

### 2. Tests stream API

Создать файл `__tests__/adapters/node-crypto-stream.test.ts`:

```typescript
import { NodeCryptoBackend } from '../../src/adapters/node-crypto.js';

describe('NodeCryptoBackend Streaming', () => {
  it('should handle incremental updates', () => {
    const backend = new NodeCryptoBackend();
    
    const parts = ['Hello', ' ', 'World', '!'];
    const fullString = parts.join('');
    
    parts.forEach(part => backend.update(part));
    
    const result = backend.digest('hex');
    
    // Compare with direct hash
    const directResult = backend.hash(fullString);
    expect(result).toBe(directResult);
  });
  
  it('should handle empty updates', () => {
    const backend = new NodeCryptoBackend();
    backend.update('');
    backend.update('');
    const result = backend.digest('hex');
    expect(result).toBe('d41d8cd98f00b204e9800998ecf8427e');
  });
  
  it('should handle null bytes', () => {
    const backend = new NodeCryptoBackend();
    backend.update('test\x00data');
    const result = backend.digest('hex');
    expect(result.length).toBe(32);
  });
});
```

### 3. Tests с реальными файлами

Создать файл `__tests__/integration/node-crypto-file.test.ts`:

```typescript
import fs from 'fs';
import path from 'path';
import { NodeCryptoBackend } from '../../src/adapters/node-crypto.js';

describe('NodeCryptoBackend with Files', () => {
  it('should hash a file', () => {
    const backend = new NodeCryptoBackend();
    const filePath = path.join(__dirname, 'fixtures', 'test-file.txt');
    const content = fs.readFileSync(filePath);
    
    const result = backend.hashBinary(content);
    expect(result.length).toBe(32);
  });
  
  it('should handle large files', () => {
    const backend = new NodeCryptoBackend();
    const filePath = path.join(__dirname, 'fixtures', 'large-file.bin');
    
    if (!fs.existsSync(filePath)) {
      console.log('Large file not found, skipping');
      return;
    }
    
    const content = fs.readFileSync(filePath);
    const result = backend.hashBinary(content);
    expect(result.length).toBe(32);
  });
});
```

## Ожидаемый результат

- ✅ Все тесты проходят успешно
- ✅ Покрытие кода >= 90%
- ✅ Tests stream API работают
- ✅ Интеграционные тесты с файлами
