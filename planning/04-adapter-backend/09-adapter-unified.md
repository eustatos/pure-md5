# Task 09: Creating Unified Adapter with Unified Interface

## Goal

Создать unified adapter, который объединяет все backend'ы и предоставляет единый API для пользователей.

## Implementation

### 1. Создать файл src/adapters/unified.ts

```typescript
import { PureJSBackend } from './pure-js.js';
import { WebCryptoBackend } from './web-crypto.js';
import { NodeCryptoBackend } from './node-crypto.js';
import { IE11Backend } from './ie11.js';
import { detector } from '../detection/backend-detector.js';

export interface MD5AdapterOptions {
  backend?: string;
  fallback?: boolean;
  reportFallback?: boolean;
}

export class MD5Adapter {
  private backend: any | null = null;
  private backendName: string | null = null;
  private options: MD5AdapterOptions;
  
  constructor(options: MD5AdapterOptions = {}) {
    this.options = {
      fallback: true,
      reportFallback: false,
      ...options
    };
  }
  
  /**
   * Hash string data with automatic backend selection or specified backend
   */
  async hash(data: string, options?: { backend?: string }): Promise<string> {
    const backend = await this.getBackend(options?.backend);
    return backend.hash(data);
  }
  
  /**
   * Hash binary data (ArrayBuffer, Uint8Array)
   */
  async hashBinary(data: ArrayBuffer | Uint8Array, options?: { backend?: string }): Promise<string> {
    const backend = await this.getBackend(options?.backend);
    return backend.hashBinary(data);
  }
  
  /**
   * Update hash with additional data (streaming)
   */
  async update(data: string | ArrayBuffer | Uint8Array, options?: { backend?: string }): Promise<void> {
    const backend = await this.getBackend(options?.backend);
    backend.update(data);
  }
  
  /**
   * Get final hash digest (for streaming)
   */
  async digest(encoding: 'hex' | 'buffer' = 'hex', options?: { backend?: string }): Promise<string | Uint8Array> {
    const backend = await this.getBackend(options?.backend);
    return backend.digest(encoding);
  }
  
  /**
   * Reset the hash state
   */
  async reset(options?: { backend?: string }): Promise<void> {
    const backend = await this.getBackend(options?.backend);
    backend.reset();
  }
  
  /**
   * Get backend name
   */
  async getBackendName(): Promise<string> {
    if (!this.backendName) {
      const result = await detector.detect();
      this.backendName = result.backend;
    }
    return this.backendName;
  }
  
  /**
   * Check if specific backend is available
   */
  static async isAvailable(backend: string): Promise<boolean> {
    const { checkBackendAvailability } = await import('./backend-availability.js');
    const result = await checkBackendAvailability(backend);
    return result.available;
  }
  
  /**
   * Get list of available backends
   */
  static async getAvailableBackends(): Promise<string[]> {
    const { getAllAvailableBackends } = await import('./backend-availability.js');
    return getAllAvailableBackends();
  }
  
  /**
   * Force specific backend for all operations
   */
  async useBackend(backendName: string): Promise<void> {
    this.backend = await detector.createBackendByName(backendName);
    this.backendName = backendName;
  }
  
  /**
   * Reset to automatic backend selection
   */
  async resetBackend(): Promise<void> {
    this.backend = null;
    this.backendName = null;
  }
  
  /**
   * Get backend instance (lazy initialization)
   */
  private async getBackend(overrideBackend?: string): Promise<any> {
    if (overrideBackend) {
      return await detector.createBackendByName(overrideBackend);
    }
    
    if (this.backend) {
      return this.backend;
    }
    
    this.backend = await detector.createBackend();
    this.backendName = await detector.getBackendName();
    return this.backend;
  }
}

export const md5 = new MD5Adapter();
```

### 2. Integration с основным API

В `src/index.ts` обновить экспорт:

```typescript
export { md5 } from './adapters/unified.js';

// Also keep original export
export { default as pureMD5 } from './md51.js';

// Export backend-related utilities
export { detector } from './detection/backend-detector.js';
export { BackendDetector } from './detection/backend-detector.js';
```

### 3. Упрощенный API для простых случаев

Создать файл `src/index-simple.ts`:

```typescript
import { md5 } from './adapters/unified.js';

/**
 * Simple MD5 hashing function
 * @param data - String to hash
 * @returns MD5 hash as hex string
 */
export async function hash(data: string): Promise<string> {
  return md5.hash(data);
}

/**
 * Hash with specific backend
 */
export async function hashWithBackend(data: string, backend: string): Promise<string> {
  return md5.hash(data, { backend });
}
```

### 4. Tests

Создать файл `__tests__/adapters/unified.test.ts`:

```typescript
describe('MD5Adapter', () => {
  let adapter: MD5Adapter;
  
  beforeAll(() => {
    adapter = new MD5Adapter();
  });
  
  it('should hash string with automatic backend', async () => {
    const result = await adapter.hash('hello');
    expect(result).toBe('5d41402abc4b2a76b9719d911017c592');
  });
  
  it('should hash with specific backend', async () => {
    const result = await adapter.hash('hello', { backend: 'purejs' });
    expect(result).toBe('5d41402abc4b2a76b9719d911017c592');
  });
  
  it('should hash binary data', async () => {
    const data = new Uint8Array([104, 101, 108, 108, 111]); // "hello"
    const result = await adapter.hashBinary(data);
    expect(result).toBe('5d41402abc4b2a76b9719d911017c592');
  });
  
  it('should support streaming', async () => {
    await adapter.update('he');
    await adapter.update('l');
    await adapter.update('lo');
    const result = await adapter.digest('hex');
    expect(result).toBe('5d41402abc4b2a76b9719d911017c592');
  });
  
  it('should reset state', async () => {
    await adapter.update('hello');
    await adapter.reset();
    await adapter.update('world');
    const result = await adapter.digest('hex');
    expect(result).toBe('5d41402abc4b2a76b9719d911017c592');
  });
  
  it('should get backend name', async () => {
    const name = await adapter.getBackendName();
    expect(typeof name).toBe('string');
  });
  
  it('should force specific backend', async () => {
    await adapter.useBackend('purejs');
    const backendName = await adapter.getBackendName();
    expect(backendName).toBe('purejs');
  });
  
  it('should get available backends', async () => {
    const backends = await MD5Adapter.getAvailableBackends();
    expect(Array.isArray(backends)).toBe(true);
    expect(backends.length).toBeGreaterThan(0);
  });
});
```

### 5. Documentation

Добавить JSDoc комментарии для всех публичных методов и классов.

## Ожидаемый результат

- ✅ Unified adapter реализован
- ✅ Единый API для всех backend'ов
- ✅ Support автоматического и принудительного выбора backend
- ✅ Tests проходят успешно
- ✅ Интегрирован в основной API
- ✅ Documentation создана
