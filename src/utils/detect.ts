/**
 * Backend Detection Utilities
 * Detects available backends and environment
 */

import { WebCryptoBackend } from "../adapters/webcrypto.js";
import { NodeCryptoBackend } from "../adapters/node.js";
import { IE11Backend } from "../adapters/ie11.js";
import { PureJSBackend } from "../adapters/pure-js.js";

export enum RuntimeEnvironment {
  BROWSER = "browser",
  NODE = "node",
  WEBWORKER = "webworker",
  UNKNOWN = "unknown"
}

export function detectEnvironment(): RuntimeEnvironment {
  // Check Node.js environment
  if (typeof process !== "undefined" && process.versions && process.versions.node) {
    return RuntimeEnvironment.NODE;
  }

  // Check web worker
  if (typeof importScripts !== "undefined") {
    return RuntimeEnvironment.WEBWORKER;
  }

  // Check browser
  if (typeof window !== "undefined" && window.document) {
    return RuntimeEnvironment.BROWSER;
  }

  return RuntimeEnvironment.UNKNOWN;
}

export function isNode(): boolean {
  return typeof process !== "undefined" &&
    process.versions !== undefined &&
    "node" in process.versions;
}

export function isBrowser(): boolean {
  return typeof window !== "undefined" &&
    typeof document !== "undefined";
}

export function isWebWorker(): boolean {
  return typeof importScripts !== "undefined";
}

export interface BackendAvailability {
  backend: string;
  available: boolean;
  reason?: string;
}

export async function checkBackendAvailability(backendName: string): Promise<BackendAvailability> {
  switch (backendName) {
    case "webcrypto":
      const webCryptoAvailable = WebCryptoBackend.isAvailable();
      return {
        backend: "webcrypto",
        available: webCryptoAvailable,
        reason: webCryptoAvailable ? undefined : "Web Crypto API not available"
      };

    case "nodecrypto":
      const nodeCryptoAvailable = NodeCryptoBackend.isAvailable();
      return {
        backend: "nodecrypto",
        available: nodeCryptoAvailable,
        reason: nodeCryptoAvailable ? undefined : "Node.js crypto not available"
      };

    case "ie11":
      const ie11Available = IE11Backend.isAvailable();
      return {
        backend: "ie11",
        available: ie11Available,
        reason: ie11Available ? undefined : "IE11 msCrypto not available"
      };

    case "purejs":
      return {
        backend: "purejs",
        available: true,
        reason: "Always available"
      };

    default:
      return {
        backend: backendName || 'unknown',
        available: false,
        reason: 'Unknown backend'
      };
  }
}

export async function getAllAvailableBackends(): Promise<string[]> {
  const backends = ["webcrypto", "nodecrypto", "ie11", "purejs"];
  const available: string[] = [];

  for (const backend of backends) {
    const { available: isAvailable } = await checkBackendAvailability(backend);
    if (isAvailable) {
      available.push(backend);
    }
  }

  return available;
}

export interface BackendPriority {
  name: string;
  priority: number;
  description: string;
}

export const BACKEND_PRIORITY: BackendPriority[] = [
  {
    name: "nodecrypto",
    priority: 1,
    description: "Node.js native crypto (fastest)"
  },
  {
    name: "webcrypto",
    priority: 2,
    description: "Web Crypto API (fast, hardware accelerated)"
  },
  {
    name: "ie11",
    priority: 3,
    description: "IE11 msCrypto (legacy)"
  },
  {
    name: "purejs",
    priority: 4,
    description: "Pure JavaScript (always available, slower)"
  }
];

export function getBestAvailableBackend(availableBackends: string[]): string {
  const sortedPriority = [...BACKEND_PRIORITY].sort((a, b) => a.priority - b.priority);

  for (const { name } of sortedPriority) {
    if (availableBackends.includes(name)) {
      return name;
    }
  }

  return "purejs"; // Fallback
}

/**
 * Backend Detector for creating instances
 */
export class BackendDetector {
  private static instance: BackendDetector;

  private constructor() {}

  static getInstance(): BackendDetector {
    if (!BackendDetector.instance) {
      BackendDetector.instance = new BackendDetector();
    }
    return BackendDetector.instance;
  }

  async createBackendByName(name: string): Promise<any> {
    switch (name) {
      case "nodecrypto":
        return new NodeCryptoBackend();
      case "webcrypto":
        return new WebCryptoBackend();
      case "ie11":
        return new IE11Backend();
      case "purejs":
      default:
        return new PureJSBackend();
    }
  }

  async createBackend(detectedBackend?: string): Promise<any> {
    const backendName = detectedBackend || getBestAvailableBackend(await getAllAvailableBackends());
    return this.createBackendByName(backendName);
  }
}

export const detector = BackendDetector.getInstance();

/**
 * Fallback Manager with retry logic
 */
export interface FallbackResult<T> {
  success: boolean;
  backend: string;
  data: T;
  errors?: { backend: string; error: Error }[];
}

export class FallbackManager {
  public detector: BackendDetector;
  private fallbackOrder: string[];

  constructor(fallbackOrder: string[] = ["nodecrypto", "webcrypto", "ie11", "purejs"]) {
    this.detector = BackendDetector.getInstance();
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
      backend: "",
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
      return "purejs"; // Fallback
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
        await this.detector.createBackendByName(backendName);
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

/**
 * Robust hash function with fallback support
 */
export async function robustHash(
  data: string,
  options: {
    fallback?: boolean;
    reportFallback?: boolean;
    forceBackend?: string;
  } = {}
): Promise<string> {
  const fm = new FallbackManager();

  if (options.forceBackend) {
    // Use specific backend without fallback
    const backend = await fm.detector.createBackendByName(options.forceBackend);
    return backend.hash(data);
  }

  if (options.fallback === false) {
    // Use default backend without fallback
    const backend = await fm.detector.createBackend();
    return backend.hash(data);
  }

  // Use fallback
  const result = await fm.hash(data);

  if (result.success) {
    if (
      options.reportFallback &&
      result.backend !== "nodecrypto" &&
      result.backend !== "webcrypto"
    ) {
      console.info(`MD5 used fallback backend: ${result.backend}`);
    }
    return result.data;
  }

  // All backends failed
  const errorMessage = result.errors
    ? result.errors.map((e) => `${e.backend}: ${e.error.message}`).join(", ")
    : "All backends failed";

  throw new Error(`MD5 hash failed after all attempts: ${errorMessage}`);
}

/**
 * Metrics collector for backend usage
 */
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return (
      `Total operations: ${total}\n` +
      Object.entries(this.metrics)
        .map(([, m]) => `${m.success} success, ${m.fail} fail`)
        .join("\n")
    );
  }

  reset(): void {
    Object.keys(this.metrics).forEach((key) => {
      this.metrics[key] = { success: 0, fail: 0 };
    });
  }
}

export const metrics = new MetricsCollector();
