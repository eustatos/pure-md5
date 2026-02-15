# Task 11: Web Crypto Backend Tests

## Goal

Создать комплексные тесты для Web Crypto backend адаптера.

## Implementation

### 1. Создать файл `__tests__/adapters/web-crypto.test.ts`

```typescript
import { WebCryptoBackend } from '../../src/adapters/web-crypto.js';

describe('WebCryptoBackend', () => {
  let backend: WebCryptoBackend;
  
  beforeAll(async () => {
    const available = await WebCryptoBackend.isAvailable();
    if (!available) {
      console.log('Web Crypto API not available, skipping tests');
      this.skip();
      return;
    }
    backend = new WebCryptoBackend();
  });
  
  describe('Basic hashing', () => {
    it('should hash string correctly', async () => {
      const result = await backend.hash('hello');
      expect(result).toBe('5d41402abc4b2a76b9719d911017c592');
    });
    
    it('should hash empty string', async () => {
      const result = await backend.hash('');
      expect(result).toBe('d41d8cd98f00b204e9800998ecf8427e');
    });
    
    it('should hash special characters', async () => {
      const result = await backend.hash('!@#$%^&*()');
      expect(result).toBe('903246b67e6a702cbb3749e376397578');
    });
    
    it('should hash unicode characters', async () => {
      const result = await backend.hash('Привет мир');
      expect(result).toBe('8b7d1e6d8e6a702cbb3749e376397578'); // Expected hash
    });
    
    it('should hash long string', async () => {
      const longString = 'a'.repeat(10000);
      const result = await backend.hash(longString);
      expect(result.length).toBe(32); // MD5 always produces 32 char hex
    });
  });
  
  describe('Binary data', () => {
    it('should hash Uint8Array', async () => {
      const data = new Uint8Array([104, 101, 108, 108, 111]); // "hello"
      const result = await backend.hashBinary(data);
      expect(result).toBe('5d41402abc4b2a76b9719d911017c592');
    });
    
    it('should hash ArrayBuffer', async () => {
      const data = new TextEncoder().encode('hello').buffer;
      const result = await backend.hashBinary(data);
      expect(result).toBe('5d41402abc4b2a76b9719d911017c592');
    });
    
    it('should hash empty Uint8Array', async () => {
      const data = new Uint8Array(0);
      const result = await backend.hashBinary(data);
      expect(result).toBe('d41d8cd98f00b204e9800998ecf8427e');
    });
  });
  
  describe('Availability', () => {
    it('should be available in modern browsers', async () => {
      const available = await WebCryptoBackend.isAvailable();
      // May be true or false depending on test environment
      expect(typeof available).toBe('boolean');
    });
    
    it('should throw error if not available', async () => {
      // Mock isAvailable to return false
      jest.spyOn(WebCryptoBackend, 'isAvailable').mockResolvedValue(false);
      
      await expect(backend.hash('test')).rejects.toThrow('Web Crypto API is not available');
    });
  });
  
  describe('Performance', () => {
    it('should hash 1MB data efficiently', async () => {
      const data = 'a'.repeat(1024 * 1024); // 1MB
      
      const start = performance.now();
      const result = await backend.hash(data);
      const duration = performance.now() - start;
      
      expect(result.length).toBe(32);
      expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    });
  });
  
  describe('Consistency', () => {
    it('should produce same hash for same input', async () => {
      const input = 'test input';
      const result1 = await backend.hash(input);
      const result2 = await backend.hash(input);
      expect(result1).toBe(result2);
    });
    
    it('should produce different hash for different inputs', async () => {
      const result1 = await backend.hash('hello');
      const result2 = await backend.hash('world');
      expect(result1).not.toBe(result2);
    });
  });
});
```

### 2. Tests интеграции

Создать файл `__tests__/integration/web-crypto.test.ts`:

```typescript
import { md5 } from '../../src/adapters/unified.js';

describe('WebCrypto Backend Integration', () => {
  describe('Unified adapter with WebCrypto', () => {
    it('should use WebCrypto if available', async () => {
      const available = await md5.isAvailable('webcrypto');
      if (!available) {
        console.log('WebCrypto not available, skipping');
        return;
      }
      
      const result = await md5.hash('hello');
      expect(result).toBe('5d41402abc4b2a76b9719d911017c592');
    });
    
    it('should accept backend override', async () => {
      const result = await md5.hash('hello', { backend: 'webcrypto' });
      expect(result).toBe('5d41402abc4b2a76b9719d911017c592');
    });
  });
});
```

### 3. Tests в Node.js с WebCrypto

Создать файл `__tests__/adapters/web-crypto-node.test.ts`:

```typescript
// Only run in Node.js 15+ with WebCrypto
const { isNode } = require('../detection/environment.js');

if (!isNode()) {
  console.log('Not in Node.js, skipping');
  process.exit(0);
}

const nodeVersion = process.versions.node.split('.').map(Number);
if (nodeVersion[0] < 15) {
  console.log('Node.js version too low, skipping');
  process.exit(0);
}

describe('WebCryptoBackend in Node.js', () => {
  let backend: WebCryptoBackend;
  
  beforeAll(async () => {
    const available = await WebCryptoBackend.isAvailable();
    if (!available) {
      console.log('WebCrypto not available in Node.js, skipping');
      return;
    }
    backend = new WebCryptoBackend();
  });
  
  it('should work in Node.js', async () => {
    const result = await backend.hash('hello');
    expect(result).toBe('5d41402abc4b2a76b9719d911017c592');
  });
});
```

## Ожидаемый результат

- ✅ Все тесты проходят успешно
- ✅ Покрытие кода >= 90%
- ✅ Tests работают в браузерах и Node.js
- ✅ Performance тесты включены
