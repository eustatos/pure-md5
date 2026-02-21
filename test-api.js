// Test API exports
import { md5 } from './dist/index.js';
import { MD5Stream, createMD5Stream } from './dist/stream/md5-stream.js';
import { WebCryptoBackend } from './dist/adapters/webcrypto.js';
import { NodeCryptoBackend } from './dist/adapters/node.js';
import { getAllAvailableBackends } from './dist/utils/detect.js';

console.log('Testing main export:');
console.log('md5("hello"):', md5('hello'));

console.log('\nTesting stream export:');
const stream = createMD5Stream();
stream.on('md5', (result) => {
  console.log('Stream result:', result);
});
stream.write('test');
stream.end();

console.log('\nTesting adapter exports:');
console.log('WebCryptoBackend:', typeof WebCryptoBackend);
console.log('NodeCryptoBackend:', typeof NodeCryptoBackend);

console.log('\nTesting utils export:');
getAllAvailableBackends().then(backends => {
  console.log('Available backends:', backends);
});
