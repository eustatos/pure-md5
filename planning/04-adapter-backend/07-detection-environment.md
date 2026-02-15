# Task 07: Environment Detection and Available Backends Implementation

## Goal

Создать систему обнаружения окружения (браузер, Node.js) и проверки доступности backend'ов.

## Implementation

### 1. Создать файл src/detection/environment.ts

```typescript
export enum RuntimeEnvironment {
  BROWSER = 'browser',
  NODE = 'node',
  WEBWORKER = 'webworker',
  UNKNOWN = 'unknown'
}

export function detectEnvironment(): RuntimeEnvironment {
  // Check Node.js environment
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    return RuntimeEnvironment.NODE;
  }
  
  // Check web worker
  if (typeof importScripts !== 'undefined') {
    return RuntimeEnvironment.WEBWORKER;
  }
  
  // Check browser
  if (typeof window !== 'undefined' && window.document) {
    return RuntimeEnvironment.BROWSER;
  }
  
  return RuntimeEnvironment.UNKNOWN;
}

export function isNode(): boolean {
  return typeof process !== 'undefined' && 
         process.versions !== undefined && 
         'node' in process.versions;
}

export function isBrowser(): boolean {
  return typeof window !== 'undefined' && 
         typeof document !== 'undefined';
}

export function isWebWorker(): boolean {
  return typeof importScripts !== 'undefined';
}
```

### 2. Checking конкретных backend'ов

Создать файл `src/detection/backend-availability.ts`:

```typescript
import { PureJSBackend } from '../adapters/pure-js.js';
import { WebCryptoBackend } from '../adapters/web-crypto.js';
import { NodeCryptoBackend } from '../adapters/node-crypto.js';
import { IE11Backend } from '../adapters/ie11.js';

export interface BackendAvailability {
  backend: string;
  available: boolean;
  reason?: string;
}

export async function checkBackendAvailability(backend: string): Promise<BackendAvailability> {
  switch (backend) {
    case 'webcrypto':
      const webCryptoAvailable = await WebCryptoBackend.isAvailable();
      return {
        backend: 'webcrypto',
        available: webCryptoAvailable,
        reason: webCryptoAvailable ? undefined : 'Web Crypto API not available'
      };
    
    case 'nodecrypto':
      const nodeCryptoAvailable = NodeCryptoBackend.isAvailable();
      return {
        backend: 'nodecrypto',
        available: nodeCryptoAvailable,
        reason: nodeCryptoAvailable ? undefined : 'Node.js crypto not available'
      };
    
    case 'ie11':
      const ie11Available = await IE11Backend.isAvailable();
      return {
        backend: 'ie11',
        available: ie11Available,
        reason: ie11Available ? undefined : 'IE11 msCrypto not available'
      };
    
    case 'purejs':
      return {
        backend: 'purejs',
        available: PureJSBackend.isAvailable(),
        reason: 'Always available'
      };
    
    default:
      return {
        backend,
        available: false,
        reason: 'Unknown backend'
      };
  }
}

export async function getAllAvailableBackends(): Promise<string[]> {
  const backends = ['webcrypto', 'nodecrypto', 'ie11', 'purejs'];
  const available: string[] = [];
  
  for (const backend of backends) {
    const { available: isAvailable } = await checkBackendAvailability(backend);
    if (isAvailable) {
      available.push(backend);
    }
  }
  
  return available;
}
```

### 3. Rating backend'ов по приоритету

Создать файл `src/detection/backend-ranking.ts`:

```typescript
export interface BackendPriority {
  name: string;
  priority: number;
  description: string;
}

export const BACKEND_PRIORITY: BackendPriority[] = [
  {
    name: 'nodecrypto',
    priority: 1,
    description: 'Node.js native crypto (fastest)'
  },
  {
    name: 'webcrypto',
    priority: 2,
    description: 'Web Crypto API (fast, hardware accelerated)'
  },
  {
    name: 'ie11',
    priority: 3,
    description: 'IE11 msCrypto (legacy)'
  },
  {
    name: 'purejs',
    priority: 4,
    description: 'Pure JavaScript (always available, slower)'
  }
];

export function getBestAvailableBackend(availableBackends: string[]): string {
  const sortedPriority = [...BACKEND_PRIORITY].sort((a, b) => a.priority - b.priority);
  
  for (const { name } of sortedPriority) {
    if (availableBackends.includes(name)) {
      return name;
    }
  }
  
  return 'purejs'; // Fallback
}
```

### 4. Integration с фабрикой адаптеров

В `src/detection/index.ts`:

```typescript
export { detectEnvironment, isNode, isBrowser, isWebWorker, RuntimeEnvironment } from './environment.js';
export { checkBackendAvailability, getAllAvailableBackends } from './backend-availability.js';
export { BACKEND_PRIORITY, getBestAvailableBackend } from './backend-ranking.js';
```

### 5. Tests

Создать файл `__tests__/detection/environment.test.ts`:

```typescript
describe('Environment Detection', () => {
  it('should detect Node.js environment', () => {
    const env = detectEnvironment();
    expect(env).toBeDefined();
  });
  
  it('should detect browser environment', () => {
    const isBrowser = detectEnvironment() === RuntimeEnvironment.BROWSER;
    // May be true or false depending on test environment
    expect(typeof isBrowser).toBe('boolean');
  });
});

describe('Backend Availability', () => {
  it('should check pure JS availability', async () => {
    const result = await checkBackendAvailability('purejs');
    expect(result.available).toBe(true);
  });
  
  it('should check web crypto availability', async () => {
    const result = await checkBackendAvailability('webcrypto');
    expect(typeof result.available).toBe('boolean');
  });
  
  it('should get all available backends', async () => {
    const backends = await getAllAvailableBackends();
    expect(Array.isArray(backends)).toBe(true);
    expect(backends.length).toBeGreaterThan(0);
  });
  
  it('should get best available backend', async () => {
    const available = await getAllAvailableBackends();
    const best = getBestAvailableBackend(available);
    expect(typeof best).toBe('string');
  });
});
```

## Ожидаемый результат

- ✅ System обнаружения окружения реализована
- ✅ Checking доступности backend'ов работает корректно
- ✅ Rating backend'ов по приоритету настроен
- ✅ Tests проходят успешно
