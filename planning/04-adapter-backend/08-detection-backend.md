# Task 08: Optimal Backend Detection System Implementation

## Goal

Создать систему интеллектуального выбора оптимального backend'а на основе окружения и приоритетов.

## Implementation

### 1. Создать файл src/detection/backend-detector.ts

```typescript
import { detectEnvironment, RuntimeEnvironment } from './environment.js';
import { checkBackendAvailability, getAllAvailableBackends } from './backend-availability.js';
import { BACKEND_PRIORITY, getBestAvailableBackend } from './backend-ranking.js';
import { PureJSBackend } from '../adapters/pure-js.js';
import { WebCryptoBackend } from '../adapters/web-crypto.js';
import { NodeCryptoBackend } from '../adapters/node-crypto.js';
import { IE11Backend } from '../adapters/ie11.js';

export interface DetectionResult {
  backend: string;
  environment: RuntimeEnvironment;
  availableBackends: string[];
  selectedBy: string;
}

export class BackendDetector {
  private static instance: BackendDetector;
  
  private constructor() {}
  
  static getInstance(): BackendDetector {
    if (!BackendDetector.instance) {
      BackendDetector.instance = new BackendDetector();
    }
    return BackendDetector.instance;
  }
  
  async detect(): Promise<DetectionResult> {
    const environment = detectEnvironment();
    const availableBackends = await getAllAvailableBackends();
    const selectedBackend = getBestAvailableBackend(availableBackends);
    
    // Determine why this backend was selected
    let selectedBy = 'priority';
    if (availableBackends.length === 1) {
      selectedBy = 'only_available';
    } else if (selectedBackend === 'nodecrypto') {
      selectedBy = 'fastest_available';
    } else if (selectedBackend === 'webcrypto') {
      selectedBy = 'fastest_available';
    }
    
    return {
      backend: selectedBackend,
      environment,
      availableBackends,
      selectedBy
    };
  }
  
  async createBackend(detectedBackend?: string): Promise<any> {
    const { backend } = detectedBackend 
      ? { backend: detectedBackend }
      : await this.detect();
    
    switch (backend) {
      case 'nodecrypto':
        return new NodeCryptoBackend();
      case 'webcrypto':
        return new WebCryptoBackend();
      case 'ie11':
        return new IE11Backend();
      case 'purejs':
      default:
        return new PureJSBackend();
    }
  }
  
  async createBackendByName(name: string): Promise<any> {
    switch (name) {
      case 'nodecrypto':
        return new NodeCryptoBackend();
      case 'webcrypto':
        return new WebCryptoBackend();
      case 'ie11':
        return new IE11Backend();
      case 'purejs':
      default:
        return new PureJSBackend();
    }
  }
}

export const detector = BackendDetector.getInstance();
```

### 2. Упрощенная функция для быстрого использования

Создать файл `src/detection/index.ts`:

```typescript
export { detectEnvironment, isNode, isBrowser, isWebWorker, RuntimeEnvironment } from './environment.js';
export { checkBackendAvailability, getAllAvailableBackends } from './backend-availability.js';
export { BACKEND_PRIORITY, getBestAvailableBackend } from './backend-ranking.js';
export { BackendDetector, detector } from './backend-detector.js';

// Quick access functions
export async function detectBackend(detectedBackend?: string): Promise<any> {
  return detector.createBackend(detectedBackend);
}

export async function getAvailableBackends(): Promise<string[]> {
  return getAllAvailableBackends();
}

export function getBackendPriority(): string[] {
  return BACKEND_PRIORITY.map(b => b.name);
}
```

### 3. Integration с основным API

В `src/index.ts`:

```typescript
import { detector } from './detection/backend-detector.js';

export async function md5(data: string, options?: { backend?: string }): Promise<string> {
  const backend = options?.backend 
    ? await detector.createBackendByName(options.backend)
    : await detector.createBackend();
  
  return backend.hash(data);
}

// Export backend factory
export { detector as backendDetector } from './detection/backend-detector.js';
```

### 4. Tests

Создать файл `__tests__/detection/backend-detector.test.ts`:

```typescript
describe('BackendDetector', () => {
  let detector: BackendDetector;
  
  beforeAll(() => {
    detector = BackendDetector.getInstance();
  });
  
  it('should detect backend', async () => {
    const result = await detector.detect();
    expect(result).toBeDefined();
    expect(result.backend).toBeDefined();
    expect(result.environment).toBeDefined();
    expect(result.availableBackends).toBeInstanceOf(Array);
  });
  
  it('should create backend by name', async () => {
    const backend = await detector.createBackendByName('purejs');
    expect(backend).toBeDefined();
    expect(typeof backend.hash).toBe('function');
  });
  
  it('should create default backend', async () => {
    const backend = await detector.createBackend();
    expect(backend).toBeDefined();
    expect(typeof backend.hash).toBe('function');
  });
  
  it('should cache singleton instance', () => {
    const instance1 = BackendDetector.getInstance();
    const instance2 = BackendDetector.getInstance();
    expect(instance1).toBe(instance2);
  });
  
  it('should handle backend name override', async () => {
    const backend = await detector.createBackendByName('purejs');
    const result = backend.hash('test');
    expect(result).toBeDefined();
  });
});
```

### 5. Documentation API

Добавить JSDoc комментарии:

```typescript
/**
 * Detects the optimal backend for MD5 computation
 * @returns Promise<DetectionResult> Object containing detected backend info
 * 
 * @example
 * const result = await detector.detect();
 * console.log(result.backend); // 'nodecrypto'
 * console.log(result.environment); // 'node'
 * console.log(result.availableBackends); // ['nodecrypto', 'purejs']
 */
```

## Ожидаемый результат

- ✅ BackendDetector реализован
- ✅ Intelligent выбор backend'а работает
- ✅ Tests проходят успешно
- ✅ Интегрирован в основной API
- ✅ Documentation создана
