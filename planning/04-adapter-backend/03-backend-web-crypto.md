# Task 03: Web Crypto API Adapter Implementation

## Goal

Создать адаптер для использования Web Crypto API (Crypto.subtle.digest) для вычисления MD5 хеша.

## Requirements

- Support Web Crypto API в современных браузерах и Node.js 15+
- Обработка строк и бинарных данных
- Integration с единым интерфейсом MD5Backend

## Implementation

### 1. Создать файл src/adapters/web-crypto.ts

```typescript
export class WebCryptoBackend implements MD5Backend {
  static name = 'webcrypto';
  static version = '1.0.0';
  
  async hash(data: string): Promise<string> {
    if (!await this.isAvailable()) {
      throw new Error('Web Crypto API is not available');
    }
    
    const encoder = new TextEncoder();
    const buffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('MD5', buffer);
    return this.bufferToHex(hashBuffer);
  }
  
  async hashBinary(data: ArrayBuffer | Uint8Array): Promise<string> {
    if (!await this.isAvailable()) {
      throw new Error('Web Crypto API is not available');
    }
    
    const buffer = data instanceof Uint8Array 
      ? data.buffer 
      : data;
    const hashBuffer = await crypto.subtle.digest('MD5', buffer);
    return this.bufferToHex(hashBuffer);
  }
  
  static async isAvailable(): Promise<boolean> {
    if (typeof crypto === 'undefined' || crypto === null) {
      return false;
    }
    
    if (typeof crypto.subtle === 'undefined' || crypto.subtle === null) {
      return false;
    }
    
    try {
      return typeof crypto.subtle.digest === 'function';
    } catch {
      return false;
    }
  }
  
  private bufferToHex(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    return Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}
```

### 2. Tests

Создать файл `__tests__/adapters/web-crypto.test.ts`:

```typescript
describe('WebCryptoBackend', () => {
  let backend: WebCryptoBackend;
  
  beforeAll(async () => {
    if (!await WebCryptoBackend.isAvailable()) {
      console.log('Web Crypto API not available, skipping tests');
      return;
    }
    backend = new WebCryptoBackend();
  });
  
  it('should hash string correctly', async () => {
    const result = await backend.hash('hello');
    expect(result).toBe('5d41402abc4b2a76b9719d911017c592');
  });
  
  it('should hash empty string', async () => {
    const result = await backend.hash('');
    expect(result).toBe('d41d8cd98f00b204e9800998ecf8427e');
  });
  
  it('should hash binary data', async () => {
    const data = new Uint8Array([104, 101, 108, 108, 111]); // "hello"
    const result = await backend.hashBinary(data);
    expect(result).toBe('5d41402abc4b2a76b9719d911017c592');
  });
  
  it('should be available in modern browsers', async () => {
    const available = await WebCryptoBackend.isAvailable();
    expect(available).toBe(true);
  });
});
```

### 3. Integration с основным кодом

В `src/adapters/index.ts`:

```typescript
export { WebCryptoBackend } from './web-crypto.js';
```

### 4. Conditional exports

В `package.json`:

```json
{
  "exports": {
    "./adapters/webcrypto": {
      "types": "./dist/adapters/web-crypto.d.ts",
      "import": "./dist/adapters/web-crypto.js"
    }
  }
}
```

### 5. Checking в браузере и Node.js

Тестирование в различных окружениях:

```bash
# Browsers
npm run test:browser

# Node.js 15+
node --experimental-global-crypto --experimental-wasm-threads test.js
```

## Ожидаемый результат

- ✅ WebCryptoBackend реализован
- ✅ Tests проходят успешно
- ✅ Интегрирован в общую систему адаптеров
- ✅ Документирован usage
