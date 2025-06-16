import { describe, it, expect } from 'vitest';
import { parseBRCode, parseTLV } from '../src';

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

describe('parseTLV', () => {
  it('should parse a simple TLV string', () => {
    const result = parseTLV('000201');
    expect(result).toEqual({ '00': '01' });
  });

  it('should parse nested merchant information', () => {
    const tlv = parseTLV('00020126080004ABCD');
    const merchantInfo = parseTLV(tlv['26']);
    expect(merchantInfo).toEqual({ '00': 'ABCD' });
  });
});
