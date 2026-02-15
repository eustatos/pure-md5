# Задача 7: Анализ бандла и метрики

## Контекст

После настройки tsup и создания разных сборок (Задачи 1 и 6) необходимо измерить и проанализировать результаты оптимизаций. Без количественных метрик невозможно оценить эффективность проделанной работы.

## Цель

Создать систему для измерения и анализа:

1. Размера бандла до/после оптимизаций
2. Эффективности tree-shaking
3. Производительности MD5 реализации
4. Качества TypeScript типов

## Требуемые действия

### Шаг 1: Установить инструменты для анализа

1. Установить инструменты для анализа бандла и типов:
   ```bash
   npm install -D @arethetypeswrong/cli bundlewatch
   ```
2. Установить инструменты для бенчмарков:
   ```bash
   npm install -D benchmark microtime
   ```

### Шаг 2: Создать скрипты для анализа размера

1. Создать `scripts/analyze-size.js`:

   ```javascript
   // scripts/analyze-size.js
   import fs from 'fs';
   import { gzipSync } from 'zlib';
   import { brotliCompressSync } from 'zlib';

   const files = [
     'dist/index.js',
     'dist/index.mjs',
     'dist/index.min.js',
     'dist/index.browser.js'
   ];

   console.log('=== Bundle Size Analysis ===\n');

   files.forEach((file) => {
     if (fs.existsSync(file)) {
       const content = fs.readFileSync(file);
       const rawSize = content.length;
       const gzippedSize = gzipSync(content).length;
       const brotliSize = brotliCompressSync(content).length;

       console.log(`${file}:`);
       console.log(`  Raw: ${(rawSize / 1024).toFixed(2)} KB`);
       console.log(`  Gzipped: ${(gzippedSize / 1024).toFixed(2)} KB`);
       console.log(`  Brotli: ${(brotliSize / 1024).toFixed(2)} KB`);
       console.log(
         `  Gzip reduction: ${((1 - gzippedSize / rawSize) * 100).toFixed(1)}%`
       );
       console.log();
     }
   });
   ```

### Шаг 3: Создать бенчмарки производительности

1. Создать `benchmarks/performance.js`:

   ```javascript
   // benchmarks/performance.js
   import { md5 } from '../dist/index.mjs';
   import Benchmark from 'benchmark';

   const suite = new Benchmark.Suite('MD5 Performance');

   // Тестовые данные
   const testCases = [
     { name: 'Short string (10 chars)', data: 'Hello World' },
     { name: 'Medium string (100 chars)', data: 'x'.repeat(100) },
     { name: 'Long string (1000 chars)', data: 'x'.repeat(1000) },
     { name: 'Binary data (1KB)', data: Buffer.alloc(1024, 'x').toString() }
   ];

   testCases.forEach(({ name, data }) => {
     suite.add(name, () => {
       md5(data);
     });
   });

   suite
     .on('cycle', (event) => {
       console.log(String(event.target));
     })
     .on('complete', function () {
       console.log('\nFastest is: ' + this.filter('fastest').map('name'));
     })
     .run({ async: true });
   ```

### Шаг 4: Проверить качество TypeScript типов

1. Добавить скрипт для проверки типов:
   ```json
   "scripts": {
     "check-types": "tsc --noEmit",
     "check-exports": "attw --pack ."
   }
   ```
2. Создать `scripts/check-exports.js` для проверки exports

### Шаг 5: Создать метрики tree-shaking

1. Создать тестовый проект для проверки tree-shaking
2. Импортировать только `md5` функцию
3. Собрать проект и проверить что неиспользуемый код удален
4. Использовать `@arethetypeswrong/cli` для анализа

### Шаг 6: Создать baseline измерений

1. Сохранить текущие метрики (до оптимизаций):
   ```bash
   npm run build
   node scripts/analyze-size.js > benchmarks/baseline-size.json
   node benchmarks/performance.js > benchmarks/baseline-performance.json
   ```
2. Создать файлы с baseline данными

### Шаг 7: Создать скрипт для сравнения

1. Создать `scripts/compare-metrics.js`:

   ```javascript
   // scripts/compare-metrics.js
   import fs from 'fs';

   const baseline = JSON.parse(
     fs.readFileSync('benchmarks/baseline-size.json', 'utf8')
   );
   const current = JSON.parse(
     fs.readFileSync('benchmarks/current-size.json', 'utf8')
   );

   console.log('=== Size Comparison (Before vs After) ===\n');

   Object.keys(baseline).forEach((file) => {
     if (current[file]) {
       const baselineSize = baseline[file].raw;
       const currentSize = current[file].raw;
       const change = (
         ((currentSize - baselineSize) / baselineSize) *
         100
       ).toFixed(1);

       console.log(`${file}:`);
       console.log(`  Before: ${(baselineSize / 1024).toFixed(2)} KB`);
       console.log(`  After:  ${(currentSize / 1024).toFixed(2)} KB`);
       console.log(`  Change: ${change}%`);
       console.log();
     }
   });
   ```

### Шаг 8: Интегрировать в CI/CD

1. Обновить GitHub Actions workflow:
   ```yaml
   # .github/workflows/ci.yml
   jobs:
     analyze:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
         - run: npm ci
         - run: npm run build
         - run: npm run analyze-size
         - run: npm run check-types
         - run: npm run check-exports
   ```
2. Добавить проверки на регрессии

### Шаг 9: Документировать результаты

1. Создать `BENCHMARKS.md` в корне проекта
2. Задокументировать методологию измерений
3. Привести результаты до/после оптимизаций
4. Сделать выводы об эффективности

## Ожидаемый результат

- Полная система метрик и анализа
- Измерения размера бандла до/после
- Измерения производительности до/после
- Проверка качества TypeScript типов
- Интеграция в CI/CD
- Документация результатов

## Проверка прогресса

- [ ] Установлены инструменты для анализа
- [ ] Созданы скрипты для анализа размера
- [ ] Созданы бенчмарки производительности
- [ ] Настроена проверка TypeScript типов
- [ ] Созданы метрики tree-shaking
- [ ] Создан baseline измерений
- [ ] Создан скрипт для сравнения
- [ ] Интегрировано в CI/CD
- [ ] Документированы результаты

## Примечания

1. Измерения должны быть воспроизводимыми
2. Учитывать variance в измерениях производительности
3. Проводить multiple runs для статистической значимости
4. Сохранять историю измерений для tracking

## Метрики успеха

1. Уменьшение размера бандла на 20-30%
2. Улучшение производительности на 10-20%
3. Эффективное tree-shaking
4. Качественные TypeScript типы (no errors)

## Следующий шаг

После настройки системы метрик перейти к Задаче 8: Обновление документации и CI/CD.
