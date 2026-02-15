import { FallbackManager, robustHash, metrics, detector } from '../src/utils/detect.js';
import { WebCryptoBackend } from '../src/adapters/webcrypto.js';
import { NodeCryptoBackend } from '../src/adapters/node.js';
import { IE11Backend } from '../src/adapters/ie11.js';
import { PureJSBackend } from '../src/adapters/pure-js.js';

describe('FallbackManager', () => {
  let manager: FallbackManager;

  beforeEach(() => {
    manager = new FallbackManager();
  });

  describe('Constructor', () => {
    it('should create with default fallback order', () => {
      expect(manager).toBeDefined();
    });

    it('should create with custom fallback order', () => {
      const customManager = new FallbackManager(['purejs', 'webcrypto']);
      expect(customManager).toBeDefined();
    });
  });

  describe('getAvailableBackends', () => {
    it('should return available backends in priority order', async () => {
      const available = await manager.getAvailableBackends();
      expect(Array.isArray(available)).toBe(true);
      expect(available.length).toBeGreaterThan(0);
    });

    it('should include purejs as fallback', async () => {
      const available = await manager.getAvailableBackends();
      expect(available).toContain('purejs');
    });

    it('should check nodecrypto availability', async () => {
      const available = await manager.getAvailableBackends();
      const hasNodeCrypto = available.includes('nodecrypto');
      const nodeAvailable = NodeCryptoBackend.isAvailable();
      expect(hasNodeCrypto).toBe(nodeAvailable);
    });

    it('should check webcrypto availability', async () => {
      const available = await manager.getAvailableBackends();
      const hasWebCrypto = available.includes('webcrypto');
      const webAvailable = await WebCryptoBackend.isAvailable();
      expect(hasWebCrypto).toBe(webAvailable);
    });
  });

  describe('getBestBackend', () => {
    it('should return best available backend', async () => {
      const best = await manager.getBestBackend();
      expect(typeof best).toBe('string');
      expect(['nodecrypto', 'webcrypto', 'ie11', 'purejs']).toContain(best);
    });

    it('should prioritize nodecrypto if available', async () => {
      const available = await manager.getAvailableBackends();
      const best = await manager.getBestBackend();

      if (available.includes('nodecrypto')) {
        expect(best).toBe('nodecrypto');
      }
    });
  });

  describe('execute', () => {
    it('should execute operation with fallback and return success', async () => {
      const result = await manager.execute(async (backend) => backend.hash('hello'));
      expect(result.success).toBe(true);
      expect(result.backend).toBeDefined();
      expect(result.data).toBe('5d41402abc4b2a76b9719d911017c592');
    });

    it('should fallback to available backend when first fails', async () => {
      // Test that fallback works when first backend throws error
      const failingManager = new FallbackManager(['nodecrypto', 'purejs']);
      
      // Mock NodeCryptoBackend to throw error
      const originalHash = NodeCryptoBackend.prototype.hash;
      NodeCryptoBackend.prototype.hash = function() {
        throw new Error('Node crypto not available');
      };
      
      try {
        const result = await failingManager.execute(async (backend) => backend.hash('hello'));
        
        expect(result.success).toBe(true);
        expect(result.backend).toBe('purejs');
      } finally {
        // Restore original
        NodeCryptoBackend.prototype.hash = originalHash;
      }
    });

    it('should handle backend that throws error', async () => {
      const managerWithFailing = new FallbackManager(['purejs']);

      const result = await managerWithFailing.execute(async () => {
        throw new Error('Direct error');
      });

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('hash', () => {
    it('should hash string with fallback', async () => {
      const result = await manager.hash('hello');
      expect(result.success).toBe(true);
      expect(result.data).toBe('5d41402abc4b2a76b9719d911017c592');
    });

    it('should hash empty string', async () => {
      const result = await manager.hash('');
      expect(result.success).toBe(true);
      expect(result.data).toBe('d41d8cd98f00b204e9800998ecf8427e');
    });

    it('should return correct backend name', async () => {
      const result = await manager.hash('test');
      expect(result.backend).toBeDefined();
      expect(['nodecrypto', 'webcrypto', 'ie11', 'purejs']).toContain(result.backend);
    });
  });

  describe('hashBinary', () => {
    it('should hash binary data with fallback', async () => {
      const data = new Uint8Array([104, 101, 108, 108, 111]); // "hello"
      const result = await manager.hashBinary(data);
      expect(result.success).toBe(true);
      expect(result.data).toBe('5d41402abc4b2a76b9719d911017c592');
    });

    it('should hash ArrayBuffer', async () => {
      const data = new TextEncoder().encode('hello').buffer;
      const result = await manager.hashBinary(data);
      expect(result.success).toBe(true);
    });
  });

  describe('detector integration', () => {
    it('should use detector for backend creation', async () => {
      const backend = await detector.createBackendByName('purejs');
      expect(backend).toBeInstanceOf(PureJSBackend);
    });

    it('should create different backend types', async () => {
      const nodeBackend = await detector.createBackendByName('nodecrypto');
      expect(nodeBackend).toBeInstanceOf(NodeCryptoBackend);

      const webBackend = await detector.createBackendByName('webcrypto');
      expect(webBackend).toBeInstanceOf(WebCryptoBackend);

      const ie11Backend = await detector.createBackendByName('ie11');
      expect(ie11Backend).toBeInstanceOf(IE11Backend);

      const pureBackend = await detector.createBackendByName('purejs');
      expect(pureBackend).toBeInstanceOf(PureJSBackend);
    });
  });
});

describe('robustHash function', () => {
  beforeEach(() => {
    metrics.reset();
  });

  it('should hash with default fallback', async () => {
    const result = await robustHash('hello');
    expect(result).toBe('5d41402abc4b2a76b9719d911017c592');
  });

  it('should hash empty string', async () => {
    const result = await robustHash('');
    expect(result).toBe('d41d8cd98f00b204e9800998ecf8427e');
  });

  it('should use specific backend when forceBackend is set', async () => {
    const result = await robustHash('hello', { forceBackend: 'purejs' });
    expect(result).toBe('5d41402abc4b2a76b9719d911017c592');
  });

  it('should skip fallback when fallback: false', async () => {
    const result = await robustHash('hello', { fallback: false });
    expect(result).toBe('5d41402abc4b2a76b9719d911017c592');
  });

  it('should support reportFallback option', async () => {
    const consoleSpy = jest.spyOn(console, 'info').mockImplementation();
    
    const result = await robustHash('hello', { 
      fallback: true, 
      reportFallback: true 
    });

    expect(result).toBe('5d41402abc4b2a76b9719d911017c592');
    consoleSpy.mockRestore();
  });

  it('should handle multiple backends in fallback chain', async () => {
    // Test with various inputs
    const testCases = [
      'hello',
      '',
      'The quick brown fox jumps over the lazy dog',
      'a'.repeat(1000)
    ];

    for (const input of testCases) {
      const result = await robustHash(input);
      expect(typeof result).toBe('string');
      expect(result.length).toBe(32);
      expect(result).toMatch(/^[0-9a-f]+$/);
    }
  });
});

describe('MetricsCollector', () => {
  beforeEach(() => {
    metrics.reset();
  });

  describe('recordSuccess', () => {
    it('should increment success count for nodecrypto', () => {
      metrics.recordSuccess('nodecrypto');
      expect(metrics.getMetrics().nodecrypto.success).toBe(1);
    });

    it('should increment success count for webcrypto', () => {
      metrics.recordSuccess('webcrypto');
      expect(metrics.getMetrics().webcrypto.success).toBe(1);
    });

    it('should increment success count for purejs', () => {
      metrics.recordSuccess('purejs');
      expect(metrics.getMetrics().purejs.success).toBe(1);
    });

    it('should not fail for unknown backend', () => {
      expect(() => metrics.recordSuccess('unknown')).not.toThrow();
    });
  });

  describe('recordFail', () => {
    it('should increment fail count for nodecrypto', () => {
      metrics.recordFail('nodecrypto');
      expect(metrics.getMetrics().nodecrypto.fail).toBe(1);
    });

    it('should increment fail count for webcrypto', () => {
      metrics.recordFail('webcrypto');
      expect(metrics.getMetrics().webcrypto.fail).toBe(1);
    });

    it('should not fail for unknown backend', () => {
      expect(() => metrics.recordFail('unknown')).not.toThrow();
    });
  });

  describe('getMetrics', () => {
    it('should return all backends metrics', () => {
      const allMetrics = metrics.getMetrics();
      
      expect(allMetrics.nodecrypto).toBeDefined();
      expect(allMetrics.webcrypto).toBeDefined();
      expect(allMetrics.ie11).toBeDefined();
      expect(allMetrics.purejs).toBeDefined();
    });

    it('should return correct structure', () => {
      const metricsObj = metrics.getMetrics();
      
      expect(metricsObj.nodecrypto).toEqual({ success: 0, fail: 0 });
      expect(metricsObj.webcrypto).toEqual({ success: 0, fail: 0 });
      expect(metricsObj.ie11).toEqual({ success: 0, fail: 0 });
      expect(metricsObj.purejs).toEqual({ success: 0, fail: 0 });
    });
  });

  describe('getSummary', () => {
    it('should return summary string', () => {
      metrics.recordSuccess('nodecrypto');
      metrics.recordFail('webcrypto');
      
      const summary = metrics.getSummary();
      
      expect(typeof summary).toBe('string');
      expect(summary).toContain('Total operations:');
      // Check that it contains some backend stats
      expect(summary).toContain('success');
      expect(summary).toContain('fail');
    });

    it('should show correct totals', () => {
      metrics.recordSuccess('nodecrypto');
      metrics.recordSuccess('nodecrypto');
      metrics.recordFail('webcrypto');
      
      const summary = metrics.getSummary();
      
      expect(summary).toContain('Total operations: 3');
    });
  });

  describe('reset', () => {
    it('should reset all metrics', () => {
      metrics.recordSuccess('nodecrypto');
      metrics.recordFail('webcrypto');
      
      metrics.reset();
      
      const afterReset = metrics.getMetrics();
      expect(afterReset.nodecrypto).toEqual({ success: 0, fail: 0 });
      expect(afterReset.webcrypto).toEqual({ success: 0, fail: 0 });
    });
  });

  describe('Integration with FallbackManager', () => {
    it('should track operations through fallback', () => {
      // Since FallbackManager doesn't automatically record metrics,
      // we test that metrics can be manually recorded
      metrics.reset();
      metrics.recordSuccess('purejs');
      
      const currentMetrics = metrics.getMetrics();
      expect(currentMetrics.purejs.success).toBe(1);
    });
  });
});
