import md51 from './md51';

describe('md51', () => {
  it('', () => {
    const expected = [708854109, 1982483388, -1851952711, -1832577264];
    expect(md51('hello')).toMatchObject(expected);
  });
});
