/**
 * Backend Detection Utilities
 * Detects available backends and environment
 */

import { WebCryptoBackend } from "../adapters/webcrypto.js";
import { NodeCryptoBackend } from "../adapters/node.js";
import { IE11Backend } from "../adapters/ie11.js";

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

export async function checkBackendAvailability(backend: string): Promise<BackendAvailability> {
  switch (backend) {
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
        backend,
        available: false,
        reason: "Unknown backend"
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
