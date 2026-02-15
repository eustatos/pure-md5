# Task 04: Node.js Crypto Adapter Implementation

## Goal

Создать адаптер для использования нативного `node:crypto` модуля для вычисления MD5 хеша.

## Requirements

- Support Node.js crypto API (версии 10+)
- Обработка строк и бинарных данных
- Потоковая обработка через update/digest
- Integration с единым интерфейсом MD5Backend

## Implementation

### 1. Создать файл src/adapters/node-crypto.ts

```typescript
export class NodeCryptoBackend implements MD5Backend {
  static name = 'nodecrypto';
  static version = '1.0.0';
  
  private hashInstance: import('node:crypto').Hash | null = null;
  
  hash(data: string): string {
    if (!this.isAvailable()) {
      throw new Error('Node.js Crypto is not available');
    }
    
    const crypto = require('node:crypto');
    return crypto.createHash('md5').update(data).digest('hex');
  }
  
  hashBinary(data: ArrayBuffer | Uint8Array): string {
    if (!this.isAvailable()) {
      throw new Error('Node.js Crypto is not available');
    }
    
    const crypto = require('node:crypto');
    const buffer = data instanceof Uint8Array 
      ? data 
      : Buffer.from(data);
    return crypto.createHash('md5').update(buffer).digest('hex');
  }
  
  update(data: string | ArrayBuffer | Uint8Array): void {
    if (!this.hashInstance) {
      const crypto = require('node:crypto');
      this.hashInstance = crypto.createHash('md5');
    }
    
    if (data instanceof ArrayBuffer) {
      this.hashInstance.update(Buffer.from(data));
    } else if (data instanceof Uint8Array) {
      this.hashInstance.update(data);
    } else {
      this.hashInstance.update(data);
    }
  }
  
  digest(encoding: 'hex' | 'buffer' = 'hex'): string | Uint8Array {
    if (!this.hashInstance) {
      return encoding === 'hex' ? '' : new Uint8Array(0);
    }
    
    return encoding === 'hex' 
      ? this.hashInstance.digest('hex') 
      : this.hashInstance.digest();
  }
  
  reset(): void {
    this.hashInstance = null;
  }
  
  static isAvailable(): boolean {
    try {
      const crypto = require('node:crypto');
      return typeof crypto.createHash === 'function';
    } catch {
      return false;
    }
  }
}
```

### 2. Tests

Создать файл `__tests__/adapters/node-crypto.test.ts`:

```typescript
describe('NodeCryptoBackend', () => {
  let backend: NodeCryptoBackend;
  
  beforeAll(() => {
    if (!NodeCryptoBackend.isAvailable()) {
      console.log('Node.js Crypto not available, skipping tests');
      return;
    }
    backend = new NodeCryptoBackend();
  });
  
  it('should hash string correctly', () => {
    const result = backend.hash('hello');
    expect(result).toBe('5d41402abc4b2a76b9719d911017c592');
  });
  
  it('should hash empty string', () => {
    const result = backend.hash('');
    expect(result).toBe('d41d8cd98f00b204e9800998ecf8427e');
  });
  
  it('should hash binary data', () => {
    const data = new Uint8Array([104, 101, 108, 108, 111]); // "hello"
    const result = backend.hashBinary(data);
    expect(result).toBe('5d41402abc4b2a76b9719d911017c592');
  });
  
  it('should support streaming via update/digest', () => {
    backend.update('he');
    backend.update('l');
    backend.update('lo');
    const result = backend.digest('hex');
    expect(result).toBe('5d41402abc4b2a76b9719d911017c592');
  });
  
  it('should reset state', () => {
    backend.update('hello');
    backend.reset();
    backend.update('world');
    const result = backend.digest('hex');
    expect(result).toBe('5d41402abc4b2a76b9719d911017c592'); // "world" hash
  });
  
  it('should be available in Node.js', () => {
    const available = NodeCryptoBackend.isAvailable();
    expect(available).toBe(true);
  });
});
```

### 3. Integration с основным кодом

В `src/adapters/index.ts`:

```typescript
export { NodeCryptoBackend } from './node-crypto.js';
```

### 4. Conditional exports

В `package.json`:

```json
{
  "exports": {
    "./adapters/node": {
      "types": "./dist/adapters/node-crypto.d.ts",
      "import": "./dist/adapters/node-crypto.js",
      "require": "./dist/adapters/node-crypto.cjs"
    }
  }
}
```

### 5. Support CommonJS

Для совместимости с CommonJS добавить `src/adapters/node-crypto.cjs`:

```javascript
'use strict';
const { NodeCryptoBackend } = require('./node-crypto.js');
module.exports = { NodeCryptoBackend };
```

## Ожидаемый результат

- ✅ NodeCryptoBackend реализован
- ✅ Support потоковой обработки (update/digest)
- ✅ Tests проходят успешно
- ✅ Интегрирован в общую систему адаптеров
- ✅ Документирован usage
