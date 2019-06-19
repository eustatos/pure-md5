function add32(x: number, y: number): number {
  //let lsw = (x & 0xffff) + (y & 0xffff);
  //let msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  //return (msw << 16) | (lsw & 0xffff);
  return (x + y) & 0xffffffff;
}

export default add32;
