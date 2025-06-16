import { describe, it, expect } from 'vitest';
import { parseBRCode } from '../src';

describe('parseBRCode', () => {
  it('should remove surrounding and internal whitespace', () => {
    const result = parseBRCode(' 0002 01\n');
    expect(result).toEqual({ raw: '000201' });
  });
});
