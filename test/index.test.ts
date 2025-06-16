import { describe, it, expect } from 'vitest';
import { parseBRCode } from '../src';

describe('parseBRCode', () => {
  it('should return raw code', () => {
    const result = parseBRCode(' 000201 ');
    expect(result).toEqual({ raw: '000201' });
  });
});
