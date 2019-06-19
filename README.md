# pure-MD5

[![npm version](http://img.shields.io/npm/v/pure-md5.svg?style=flat)](https://npmjs.org/package/bitrix24-verify-sign "View this project on npm")
[![npm downloads](http://img.shields.io/npm/dm/pure-md5.svg?style=flat)](https://npmjs.org/package/bitrix24-verify-sign "View this project on npm")
[![Build Status](https://travis-ci.org/eustatos/bitrix24-verify-sign.svg?branch=master)](https://travis-ci.org/eustatos/bitrix24-verify-sign)
[![codecov](https://codecov.io/gh/eustatos/bitrix24-verify-sign/branch/master/graph/badge.svg)](https://codecov.io/gh/eustatos/bitrix24-verify-sign)
[![Maintainability](https://api.codeclimate.com/v1/badges/3aa330606ecdddb80dff/maintainability)](https://codeclimate.com/github/eustatos/pure-md5/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/3aa330606ecdddb80dff/test_coverage)](https://codeclimate.com/github/eustatos/pure-md5/test_coverage)

## Install

```bash
npm install -S pure-md5
```

## Usage

```javascript
import md5 from 'pure-md5';

const hash = md5('hello'); // 5d41402abc4b2a76b9719d911017c592
```

### CDN

```html
<script src="//unpkg.com/pure-md5"></script>
<script>
    console.log(md5('hello')); // 5d41402abc4b2a76b9719d911017c592
</script>
```