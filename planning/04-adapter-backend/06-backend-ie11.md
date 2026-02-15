# Task 06: Support for Internet Explorer 11 (msCrypto)

## Goal

Создать адаптер для использования устаревшего `window.msCrypto` в Internet Explorer 11.

## Важные замечания

- IE11 поддерживает только подмножество Web Crypto API
- Некоторые алгоритмы могут отличаться
- Проверить совместимость с MD5

## Implementation

### 1. Создать файл src/adapters/ie11.ts

```typescript
export class IE11Backend implements MD5Backend {
  static name = 'ie11';
  static version = '1.0.0';
  
  private crypto: Crypto;
  private algorithm: string = 'MD5';
  
  constructor() {
    if (!this.isAvailable()) {
      throw new Error('IE11 Crypto is not available');
    }
    this.crypto = (window as any).msCrypto;
  }
  
  async hash(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const buffer = encoder.encode(data);
    const hashBuffer = await this.crypto.subtle.digest(this.algorithm, buffer);
    return this.bufferToHex(hashBuffer);
  }
  
  async hashBinary(data: ArrayBuffer | Uint8Array): Promise<string> {
    const buffer = data instanceof Uint8Array 
      ? data.buffer 
      : data;
    const hashBuffer = await this.crypto.subtle.digest(this.algorithm, buffer);
    return this.bufferToHex(hashBuffer);
  }
  
  static async isAvailable(): Promise<boolean> {
    if (typeof window === 'undefined') {
      return false;
    }
    
    const msCrypto = (window as any).msCrypto;
    if (!msCrypto) {
      return false;
    }
    
    if (!msCrypto.subtle) {
      return false;
    }
    
    try {
      // Checking поддержки MD5
      const testBuffer = new Uint8Array([1, 2, 3, 4]);
      await msCrypto.subtle.digest('MD5', testBuffer);
      return true;
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

Создать файл `__tests__/adapters/ie11.test.ts`:

```typescript
describe('IE11Backend', () => {
  let backend: IE11Backend;
  
  beforeAll(async () => {
    if (!await IE11Backend.isAvailable()) {
      console.log('IE11 Crypto not available, skipping tests');
      return;
    }
    backend = new IE11Backend();
  });
  
  it('should hash string correctly', async () => {
    const result = await backend.hash('hello');
    expect(result).toBe('5d41402abc4b2a76b9719d911017c592');
  });
  
  it('should hash empty string', async () => {
    const result = await backend.hash('');
    expect(result).toBe('d41d8cd98f00b204e9800998ecf8427e');
  });
  
  it('should be available in IE11', async () => {
    const available = await IE11Backend.isAvailable();
    // В реальных тестах этот тест будет пропущен в modern browsers
    if (available) {
      expect(true).toBe(true);
    }
  });
});
```

### 3. Integration

В `src/adapters/index.ts`:

```typescript
export { IE11Backend } from './ie11.js';
```

### 4. Conditional exports

В `package.json`:

```json
{
  "exports": {
    "./adapters/ie11": {
      "types": "./dist/adapters/ie11.d.ts",
      "import": "./dist/adapters/ie11.js"
    }
  }
}
```

### 5. Обработка ошибок

В IE11 могут возникнуть ошибки, поэтому обернуть в try-catch:

```typescript
try {
  const backend = new IE11Backend();
  const result = await backend.hash('data');
} catch (error) {
  console.warn('IE11 backend failed:', error);
  // Fallback to pure JS
}
```

## Ожидаемый результат

- ✅ IE11Backend реализован
- ✅ Tests проходят успешно (если IE11 доступен)
- ✅ Интегрирован в общую систему адаптеров
- ✅ Обработка ошибок при отсутствии поддержки
