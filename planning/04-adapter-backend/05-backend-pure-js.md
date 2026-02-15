# Task 05: Рефакторинг Pure JS кода в адаптер

## Goal

Преобразовать существующую реализацию MD5 в адаптер, соответствующий интерфейсу MD5Backend.

## Текущая структура

Текущий код находится в `src/`:
- `src/index.ts` - главная функция md5
- `src/md51.ts` - обработка сообщений
- `src/md5blk.ts` - обработка блоков
- `src/md5cycle.ts` - цикл MD5
- `src/round-functions.ts` - функции раунда
- и т.д.

## Рефакторинг

### 1. Создать файл src/adapters/pure-js.ts

```typescript
import { hex, md51 } from '../index.js';

export class PureJSBackend implements MD5Backend {
  static name = 'purejs';
  static version = '0.1.0';
  
  private state: {
    data: string;
    finished: boolean;
  };
  
  constructor() {
    this.state = { data: '', finished: false };
  }
  
  hash(data: string): string {
    return md51(data);
  }
  
  hashBinary(data: ArrayBuffer | Uint8Array): string {
    const text = data instanceof ArrayBuffer
      ? new TextDecoder().decode(data)
      : new TextDecoder().decode(data);
    return md51(text);
  }
  
  update(data: string | ArrayBuffer | Uint8Array): void {
    if (this.state.finished) {
      // Reset if already finished
      this.state = { data: '', finished: false };
    }
    
    if (data instanceof ArrayBuffer) {
      this.state.data += new TextDecoder().decode(data);
    } else if (data instanceof Uint8Array) {
      this.state.data += new TextDecoder().decode(data);
    } else {
      this.state.data += data;
    }
  }
  
  digest(encoding: 'hex' | 'buffer' = 'hex'): string | Uint8Array {
    const result = md51(this.state.data);
    this.state.finished = true;
    
    if (encoding === 'buffer') {
      return this.hexToBuffer(result);
    }
    return result;
  }
  
  reset(): void {
    this.state = { data: '', finished: false };
  }
  
  static isAvailable(): boolean {
    return true; // Always available
  }
  
  private hexToBuffer(hex: string): Uint8Array {
    const bytes = [];
    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substring(i, i + 2), 16));
    }
    return new Uint8Array(bytes);
  }
}
```

### 2. Checking текущей реализации

Убедиться, что `md51` работает корректно:

```typescript
// Test from __tests__/md51.test.ts
it('should hash "hello" correctly', () => {
  expect(md51('hello')).toBe('5d41402abc4b2a76b9719d911017c592');
});
```

### 3. Integration с адаптерами

В `src/adapters/index.ts`:

```typescript
export { PureJSBackend } from './pure-js.js';
```

### 4. Conditional exports

В `package.json`:

```json
{
  "exports": {
    "./adapters/purejs": {
      "types": "./dist/adapters/pure-js.d.ts",
      "import": "./dist/adapters/pure-js.js"
    }
  }
}
```

### 5. Tests

Создать файл `__tests__/adapters/pure-js.test.ts`:

```typescript
describe('PureJSBackend', () => {
  let backend: PureJSBackend;
  
  beforeAll(() => {
    backend = new PureJSBackend();
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
  
  it('should be always available', () => {
    const available = PureJSBackend.isAvailable();
    expect(available).toBe(true);
  });
});
```

## Ожидаемый результат

- ✅ PureJSBackend реализован из существующего кода
- ✅ Сохранена совместимость с текущим API
- ✅ Support потоковой обработки (update/digest)
- ✅ Tests проходят успешно
- ✅ Интегрирован в общую систему адаптеров
