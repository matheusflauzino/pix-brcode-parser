import { describe, it, expect } from 'vitest';
import { parseBRCode } from '../src';

describe('parseBRCode', () => {
  it('should remove surrounding and internal whitespace', () => {
    const result = parseBRCode(' 0002 01\n');
    expect(result).toEqual({ raw: '000201' });
  });


  it('should handle newlines and tabs', () => {
    const result = parseBRCode('\n000201\t');
    expect(result).toEqual({ raw: '000201' });
  });

  it('should return the same string when there is no whitespace', () => {
    const result = parseBRCode('000201');
    expect(result).toEqual({ raw: '000201' });
  });
});
