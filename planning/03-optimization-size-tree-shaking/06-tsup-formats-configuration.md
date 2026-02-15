# Задача 6: Настройка tsup для разных форматов

## Контекст
После успешной миграции на tsup (Задача 1) необходимо настроить создание разных сборок для различных use cases. Tsup поддерживает генерацию множественных форматов из коробки.

## Цель
Настроить tsup для создания оптимизированных сборок:
1. CommonJS для Node.js и старых бандлеров
2. ES модули для современных бандлеров (Webpack 5+, Vite, Rollup)
3. UMD/IIFE для использования в браузере через script tag
4. Минимальная сборка с агрессивной оптимизацией для production

## Требуемые действия

### Шаг 1: Создать основную конфигурацию tsup
1. Обновить `tsup.config.ts` для поддержки всех форматов:
   ```typescript
   import { defineConfig } from 'tsup';
   
   export default defineConfig({
     entry: ['src/index.ts'],
     format: ['cjs', 'esm'], // CommonJS и ES модули
     dts: true, // Генерация .d.ts файлов
     sourcemap: true, // Source maps для отладки
     clean: true, // Очистка output директории
     minify: false, // Минификация отключена для dev
     treeshake: true, // Включить tree-shaking
     splitting: false, // Для библиотек обычно false
     bundle: true, // Bundle все зависимости
     outDir: 'dist', // Output директория
     target: 'es2020', // Современный target
   });
   ```

### Шаг 2: Создать production конфигурацию
1. Создать `tsup.config.prod.ts`:
   ```typescript
   import { defineConfig } from 'tsup';
   
   export default defineConfig({
     entry: ['src/index.ts'],
     format: ['cjs', 'esm'],
     dts: true,
     sourcemap: false, // Без source maps в production
     clean: true,
     minify: true, // Включить минификацию
     minifyWhitespace: true,
     minifyIdentifiers: true,
     minifySyntax: true,
     treeshake: true,
     splitting: false,
     bundle: true,
     outDir: 'dist',
     target: 'es2020',
   });
   ```

### Шаг 3: Создать UMD конфигурацию для браузера
1. Создать `tsup.config.umd.ts`:
   ```typescript
   import { defineConfig } from 'tsup';
   
   export default defineConfig({
     entry: ['src/index.ts'],
     format: ['iife'], // IIFE формат для браузера
     globalName: 'pureMD5', // Глобальная переменная
     dts: false, // .d.ts не нужны для браузера
     sourcemap: true,
     clean: true,
     minify: true,
     treeshake: true,
     splitting: false,
     bundle: true,
     outDir: 'dist',
     target: 'es2020',
     platform: 'browser', // Платформа браузера
     outExtension: () => ({ js: '.browser.js' }), // Другое расширение
   });
   ```

### Шаг 4: Создать минимальную конфигурацию
1. Создать `tsup.config.min.ts`:
   ```typescript
   import { defineConfig } from 'tsup';
   
   export default defineConfig({
     entry: ['src/index.ts'],
     format: ['esm'], // Только ES модули для минимального размера
     dts: false, // Без типов
     sourcemap: false, // Без source maps
     clean: true,
     minify: true,
     minifyWhitespace: true,
     minifyIdentifiers: true,
     minifySyntax: true,
     treeshake: true,
     pure: ['console.log', 'console.debug'], // Удалить console вызовы
     splitting: false,
     bundle: true,
     outDir: 'dist',
     target: 'es2020',
     outExtension: () => ({ js: '.min.js' }), // Расширение .min.js
   });
   ```

### Шаг 5: Обновить package.json scripts
1. Обновить скрипты в `package.json`:
   ```json
   "scripts": {
     "build": "tsup",
     "build:prod": "tsup --config tsup.config.prod.ts",
     "build:umd": "tsup --config tsup.config.umd.ts",
     "build:min": "tsup --config tsup.config.min.ts",
     "build:all": "npm run build && npm run build:prod && npm run build:umd && npm run build:min",
     "build:watch": "tsup --watch",
     "dev": "tsup --watch"
   }
   ```

### Шаг 6: Настроить exports в package.json
1. Обновить поле exports для поддержки разных форматов:
   ```json
   "exports": {
     ".": {
       "import": "./dist/index.mjs",
       "require": "./dist/index.js",
       "types": "./dist/index.d.ts",
       "default": "./dist/index.js"
     },
     "./browser": {
       "import": "./dist/index.browser.mjs",
       "require": "./dist/index.browser.js",
       "default": "./dist/index.browser.js"
     },
     "./min": {
       "import": "./dist/index.min.mjs",
       "require": "./dist/index.min.js",
       "default": "./dist/index.min.js"
     }
   },
   "main": "./dist/index.js",
   "module": "./dist/index.mjs",
   "browser": "./dist/index.browser.js",
   "types": "./dist/index.d.ts"
   ```

### Шаг 7: Проверить все сборки
1. Запустить полную сборку:
   ```bash
   npm run build:all
   ```
2. Проверить созданные файлы в `dist/`:
   ```bash
   ls -la dist/
   ```
3. Ожидаемые файлы:
   - `index.js` (CommonJS, development)
   - `index.mjs` (ES modules, development)
   - `index.d.ts` (TypeScript declarations)
   - `index.browser.js` (UMD для браузера)
   - `index.min.js` (Минимальная сборка)

### Шаг 8: Протестировать каждую сборку
1. Тестировать CommonJS сборку:
   ```bash
   node -e "const { md5 } = require('./dist/index.js'); console.log(md5('test'))"
   ```
2. Тестировать ES modules сборку (если поддерживается):
   ```bash
   node --loader ts-node/esm -e "import { md5 } from './dist/index.mjs'; console.log(md5('test'))"
   ```
3. Тестировать UMD сборку в браузере (симуляция):
   ```bash
   echo 'console.log(pureMD5.md5("test"))' | node -e "
   const vm = require('vm');
   const fs = require('fs');
   const code = fs.readFileSync('./dist/index.browser.js', 'utf8');
   const context = { console };
   vm.runInNewContext(code, context);
   "
   ```

### Шаг 9: Настроить анализ бандла
1. Установить инструменты для анализа:
   ```bash
   npm install -D @arethetypeswrong/cli
   ```
2. Добавить скрипт анализа:
   ```json
   "scripts": {
     "analyze": "attw --pack .",
     "analyze:size": "node scripts/analyze-size.js"
   }
   ```

## Ожидаемый результат
- 4 разные оптимизированные сборки
- Правильные exports в package.json
- Минимальная сборка значительно меньше основной
- Все сборки работают в своих средах
- Возможность анализа бандла

## Проверка прогресса
- [ ] Основная конфигурация tsup создана
- [ ] Production конфигурация создана
- [ ] UMD конфигурация создана
- [ ] Минимальная конфигурация создана
- [ ] package.json scripts обновлены
- [ ] exports в package.json настроены
- [ ] Все сборки создаются без ошибок
- [ ] Каждая сборка протестирована
- [ ] Инструменты анализа установлены
- [ ] Документированы различия между сборками

## Примечания
1. UMD формат может быть не нужен если библиотека используется только через npm
2. Минимальная сборка может ломать source maps для отладки
3. Проверить совместимость с существующими потребителями
4. Убедиться что tree-shaking работает корректно

## Метрики
1. Размер каждой сборки (raw и gzipped)
2. Время сборки для каждой конфигурации
3. Эффективность tree-shaking

## Следующий шаг
После настройки разных форматов перейти к Задаче 7: Анализ бандла и метрики.