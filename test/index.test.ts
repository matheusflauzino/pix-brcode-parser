import { describe, it, expect } from 'vitest';
import { parseBRCode } from '../src';

describe('parseBRCode', () => {
  it('should remove surrounding and internal whitespace', () => {
    const result = parseBRCode(' 0002 01\n');
    expect(result).toEqual({ raw: '000201' });
  });

  it('should handle newline and tab characters', () => {
    const result = parseBRCode('\n000201\t');
    expect(result).toEqual({ raw: '000201' });
  });

  it('should return the same string when there is no whitespace', () => {
    const input = '000201';
    const result = parseBRCode(input);
    expect(result).toEqual({ raw: input });
  });
});
