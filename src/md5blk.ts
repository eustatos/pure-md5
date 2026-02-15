function md5blk(s: string): number[] {
  let md5blks: number[] = [];
  for (let i = 0; i < 64; i += 4) {
    md5blks[i >> 2] =
      (s.charCodeAt(i) || 0) +
      ((s.charCodeAt(i + 1) || 0) << 8) +
      ((s.charCodeAt(i + 2) || 0) << 16) +
      ((s.charCodeAt(i + 3) || 0) << 24);
  }
  return md5blks;
}

export default md5blk;
