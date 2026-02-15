# Phase 4: Adapter for Different Backends

Эта фаза посвящена созданию системы адаптеров для поддержки различных криптографических API (Web Crypto API, Node.js Crypto, Pure JS) с интеллектуальным обнаружением и fallback механизмами.

## Архитектурные задачи

- [01-architecture-assessment](./01-architecture-assessment.md) - Анализ архитектуры: интеграция или отдельный пакет
- [02-architecture-backend-api](./02-architecture-backend-api.md) - Проектирование универсального API для backend адаптеров

## Implementation backend адаптеров

- [03-backend-web-crypto](./03-backend-web-crypto.md) - Implementation Web Crypto API адаптера
- [04-backend-node-crypto](./04-backend-node-crypto.md) - Implementation Node.js Crypto адаптера
- [05-backend-pure-js](./05-backend-pure-js.md) - Рефакторинг существующего Pure JS кода в адаптер
- [06-backend-ie11](./06-backend-ie11.md) - Support Internet Explorer 11 (msCrypto)

## Интеллектуальное обнаружение backend

- [07-detection-environment](./07-detection-environment.md) - Implementation обнаружения окружения и доступных backend'ов
- [08-detection-backend](./08-detection-backend.md) - Implementation системы детекции оптимального backend'а

## Unified adapter и fallback

- [09-adapter-unified](./09-adapter-unified.md) - Создание unified adapter с единым интерфейсом
- [10-fallback-mechanism](./10-fallback-mechanism.md) - Implementation fallback механизмов с порядком предпочтения

## Testing и документация

- [11-tests-backend-web-crypto](./11-tests-backend-web-crypto.md) - Tests Web Crypto backend
- [12-tests-backend-node-crypto](./12-tests-backend-node-crypto.md) - Tests Node.js backend
- [13-tests-backend-pure-js](./13-tests-backend-pure-js.md) - Tests Pure JS backend
- [14-tests-detection](./14-tests-detection.md) - Tests системы детекции backend
- [15-tests-fallback](./15-tests-fallback.md) - Tests fallback механизмов
- [16-docs-adapter](./16-docs-adapter.md) - Documentation по использованию backend адаптеров

## Optimization и бенчмарки

- [17-optimization-tree-shaking](./17-optimization-tree-shaking.md) - Optimization для tree-shaking backend модулей
- [18-benchmarks-performance](./18-benchmarks-performance.md) - Бенчмарки производительности各 backend

## Integration в основной проект

- [19-integration-main](./19-integration-main.md) - Integration backend адаптеров в основной пакет
- [20-export-conditional](./20-export-conditional.md) - Setup conditional exports для разных backend'ов
- [21-versioning](./21-versioning.md) - Планирование версии с backend адаптерами
