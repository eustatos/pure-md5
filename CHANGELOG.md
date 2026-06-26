# pure-md5

## 0.2.5

### Patch Changes

- fix: implement UTF-8 encoding for proper Unicode support

  The MD5 implementation now correctly handles Unicode characters by encoding strings to UTF-8 bytes before hashing. This fixes incorrect hash computation for non-ASCII characters like em-dash (—), Cyrillic text, emoji, and other Unicode symbols.

  Previously, the implementation used only the lower 8 bits of UTF-16 code units, which produced incorrect hashes for characters outside the ASCII range. The new implementation properly encodes all Unicode characters to their UTF-8 byte representation, matching the behavior of standard MD5 implementations (Node.js crypto, Web Crypto API, etc.).

## 0.2.2

### Patch Changes

- optimize build and readme

## 0.2.1

### Patch Changes

- optimize dist size

## 0.2.0

### Minor Changes

- add streaming and some optimization

- add streaming and some optimization
