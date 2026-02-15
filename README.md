# pure-MD5

[![npm version](http://img.shields.io/npm/v/pure-md5.svg?style=flat)](https://npmjs.org/package/pure-md5 "View this project on npm")
[![npm downloads](http://img.shields.io/npm/dm/pure-md5.svg?style=flat)](https://npmjs.org/package/pure-md5 "View this project on npm")
[![Build Status](https://travis-ci.org/eustatos/pure-md5.svg?branch=master)](https://travis-ci.org/eustatos/pure-md5)
[![codecov](https://codecov.io/gh/eustatos/pure-md5/branch/master/graph/badge.svg)](https://codecov.io/gh/eustatos/pure-md5)
[![Maintainability](https://api.codeclimate.com/v1/badges/3aa330606ecdddb80dff/maintainability)](https://codeclimate.com/github/eustatos/pure-md5/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/3aa330606ecdddb80dff/test_coverage)](https://codeclimate.com/github/eustatos/pure-md5/test_coverage)
[![Node.js Package](https://github.com/eustatos/pure-md5/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/eustatos/pure-md5/actions/workflows/npm-publish.yml)

## Install

```bash
npm install -S pure-md5
```

## Usage

```javascript
import {md5} from 'pure-md5';

const hash = md5('hello'); // 5d41402abc4b2a76b9719d911017c592
```

### Streaming MD5

For hashing large files or streams of data:

```javascript
import { MD5Stream, pipeThroughMD5, fromStream } from 'pure-md5';
import fs from 'fs';

// Using the stream directly
const stream = new MD5Stream();
stream.on('md5', (result) => {
  console.log('MD5:', result.digest);
  console.log('Bytes:', result.bytesProcessed);
});

fs.createReadStream('file.txt').pipe(stream);

// Using pipeThroughMD5 with async/await
import { Readable } from 'stream';

const source = Readable.from(['hello', ' ', 'world']);
const result = await pipeThroughMD5(source);
console.log('MD5:', result.digest);

// Using fromStream helper
import { fromStream } from 'pure-md5';

const { stream, result } = fromStream(fs.createReadStream('file.txt'));
result.then(r => console.log('MD5:', r.digest));
```

### CDN

```html
<script src="https://unpkg.com/pure-md5@latest/lib/index.js"></script>
<script>
    console.log(md5('hello')); // 5d41402abc4b2a76b9719d911017c592
</script>
```
