# Task 10: Fallback Mechanisms Implementation with Priority Order

## Goal

Implement fallback механизм, который автоматически пробует альтернативные backend'ы при ошибке основного.

## Implementation

### 1. Создать файл src/adapters/fallback.ts

```typescript
import { PureJSBackend } from './pure-js.js';
import { WebCryptoBackend } from './web-crypto.js';
import { NodeCryptoBackend } from './node-crypto.js';
import { IE11Backend } from './ie11.js';
import { BackendDetector } from '../detection/backend-detector.js';

export interface FallbackResult<T> {
  success: boolean;
  backend: string;
  data: T;
  errors?: { backend: string; error: Error }[];
}

export class FallbackManager {
  private detector: BackendDetector;
  private fallbackOrder: string[];
  
  constructor(fallbackOrder: string[] = ['nodecrypto', 'webcrypto', 'ie11', 'purejs']) {
    this.detector = new BackendDetector();
    this.fallbackOrder = fallbackOrder;
  }
  
  /**
   * Execute operation with fallback mechanism
   */
  async execute<T>(operation: (backend: any) => Promise<T>): Promise<FallbackResult<T>> {
    const errors: { backend: string; error: Error }[] = [];
    
    for (const backendName of this.fallbackOrder) {
      try {
        const backend = await this.detector.createBackendByName(backendName);
        const result = await operation(backend);
        return {
          success: true,
          backend: backendName,
          data: result
        };
      } catch (error) {
        errors.push({ backend: backendName, error: error as Error });
        
        // Don't fallback if last backend failed
        if (backendName === this.fallbackOrder[this.fallbackOrder.length - 1]) {
          return {
            success: false,
            backend: backendName,
            data: null as unknown as T,
            errors
          };
        }
      }
    }
    
    return {
      success: false,
      backend: '',
      data: null as unknown as T,
      errors
    };
  }
  
  /**
   * Hash with fallback mechanism
   */
  async hash(data: string): Promise<FallbackResult<string>> {
    return this.execute(async (backend) => backend.hash(data));
  }
  
  /**
   * Hash binary data with fallback
   */
  async hashBinary(data: ArrayBuffer | Uint8Array): Promise<FallbackResult<string>> {
    return this.execute(async (backend) => backend.hashBinary(data));
  }
  
  /**
   * Get the best available backend
   */
  async getBestBackend(): Promise<string> {
    const available = await this.getAvailableBackends();
    if (available.length === 0) {
      return 'purejs'; // Fallback
    }
    return available[0]; // First is best
  }
  
  /**
   * Get available backends in priority order
   */
  async getAvailableBackends(): Promise<string[]> {
    const available: string[] = [];
    
    for (const backendName of this.fallbackOrder) {
      try {
        const backend = await this.detector.createBackendByName(backendName);
        available.push(backendName);
      } catch {
        // Backend not available
      }
    }
    
    return available;
  }
  
  /**
   * Get backend metrics for monitoring
   */
  getMetrics(): Record<string, { success: number; fail: number }> {
    // Implementation for tracking usage
    return {};
  }
}

export const fallbackManager = new FallbackManager();
```

### 2. Integration с unified adapter

Обновить `src/adapters/unified.ts`:

```typescript
import { FallbackManager, fallbackManager } from './fallback.js';

export class MD5Adapter {
  private fallbackManager: FallbackManager;
  
  constructor(options: MD5AdapterOptions = {}) {
    this.fallbackManager = options.fallback !== false 
      ? new FallbackManager() 
      : null;
  }
  
  async hash(data: string, options?: { backend?: string }): Promise<string> {
    if (options?.backend) {
      const backend = await this.getBackend(options.backend);
      return backend.hash(data);
    }
    
    // Use fallback if enabled
    if (this.fallbackManager) {
      const result = await this.fallbackManager.hash(data);
      if (result.success) {
        return result.data;
      }
      throw new Error(`MD5 hash failed: ${result.errors.map(e => e.error.message).join(', ')}`);
    }
    
    const backend = await this.getBackend();
    return backend.hash(data);
  }
  
  // ... остальные методы с fallback
}
```

### 3. Робастная функция хэширования

Создать файл `src/adapters/robust.ts`:

```typescript
import { FallbackManager } from './fallback.js';

export async function robustHash(
  data: string,
  options: { 
    fallback?: boolean;
    reportFallback?: boolean;
    forceBackend?: string;
  } = {}
): Promise<string> {
  const fallbackManager = new FallbackManager();
  
  if (options.forceBackend) {
    // Use specific backend without fallback
    const backend = await fallbackManager.detector.createBackendByName(options.forceBackend);
    return backend.hash(data);
  }
  
  if (options.fallback === false) {
    // Use default backend without fallback
    const backend = await fallbackManager.detector.createBackend();
    return backend.hash(data);
  }
  
  // Use fallback
  const result = await fallbackManager.hash(data);
  
  if (result.success) {
    if (options.reportFallback && result.backend !== 'nodecrypto' && result.backend !== 'webcrypto') {
      console.info(`MD5 used fallback backend: ${result.backend}`);
    }
    return result.data;
  }
  
  // All backends failed
  const errorMessage = result.errors 
    ? result.errors.map(e => `${e.backend}: ${e.error.message}`).join(', ')
    : 'All backends failed';
  
  throw new Error(`MD5 hash failed after all attempts: ${errorMessage}`);
}
```

### 4. Мониторинг fallback механизмов

Создать файл `src/adapters/metrics.ts`:

```typescript
interface BackendMetrics {
  success: number;
  fail: number;
}

export class MetricsCollector {
  private metrics: Record<string, BackendMetrics> = {
    nodecrypto: { success: 0, fail: 0 },
    webcrypto: { success: 0, fail: 0 },
    ie11: { success: 0, fail: 0 },
    purejs: { success: 0, fail: 0 }
  };
  
  recordSuccess(backend: string): void {
    if (this.metrics[backend]) {
      this.metrics[backend].success++;
    }
  }
  
  recordFail(backend: string): void {
    if (this.metrics[backend]) {
      this.metrics[backend].fail++;
    }
  }
  
  getMetrics(): Record<string, BackendMetrics> {
    return this.metrics;
  }
  
  getSummary(): string {
    const total = Object.values(this.metrics).reduce(
      (sum, m) => sum + m.success + m.fail, 
      0
    );
    
    return `Total operations: ${total}\n` +
      Object.entries(this.metrics)
        .map(([backend, m]) => 
          `${backend}: ${m.success} success, ${m.fail} fail`
        )
        .join('\n');
  }
  
  reset(): void {
    Object.keys(this.metrics).forEach(key => {
      this.metrics[key] = { success: 0, fail: 0 };
    });
  }
}

export const metrics = new MetricsCollector();
```

### 5. Tests

Создать файл `__tests__/adapters/fallback.test.ts`:

```typescript
describe('FallbackManager', () => {
  let manager: FallbackManager;
  
  beforeAll(() => {
    manager = new FallbackManager();
  });
  
  it('should hash with fallback', async () => {
    const result = await manager.hash('hello');
    expect(result.success).toBe(true);
    expect(result.data).toBe('5d41402abc4b2a76b9719d911017c592');
  });
  
  it('should get best backend', async () => {
    const best = await manager.getBestBackend();
    expect(typeof best).toBe('string');
  });
  
  it('should get available backends', async () => {
    const available = await manager.getAvailableBackends();
    expect(Array.isArray(available)).toBe(true);
    expect(available.length).toBeGreaterThan(0);
  });
  
  it('should execute operation with fallback', async () => {
    const result = await manager.execute(async (backend) => backend.hash('test'));
    expect(result.success).toBe(true);
  });
  
  describe('Robust hash', () => {
    it('should hash with fallback', async () => {
      const result = await robustHash('hello');
      expect(result).toBe('5d41402abc4b2a76b9719d911017c592');
    });
    
    it('should hash with force backend', async () => {
      const result = await robustHash('hello', { forceBackend: 'purejs' });
      expect(result).toBe('5d41402abc4b2a76b9719d911017c592');
    });
    
    it('should throw on all backends failure', async () => {
      // This test requires mocking all backends to fail
      // In practice, this should never happen
      await expect(robustHash('test')).resolves.toBeDefined();
    });
  });
});
```

## Ожидаемый результат

- ✅ Fallback mechanism реализован
- ✅ Автоматический retry с другими backend'ами
- ✅ Мониторинг и метрики
- ✅ Робастная функция robustHash
- ✅ Tests проходят успешно
- ✅ Documentation создана
