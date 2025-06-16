import { describe, it, expect } from 'vitest';
import { parseBRCode } from '../src';

describe('parseBRCode', () => {
  const dynamicCode = '00020101021226370014BR.GOV.BCB.PIX0115abc@example.com5204000053039865406123.455802BR5907MATHEUS6008SAOPAULO61081234567862100506abc1236304ABCD';
  const staticCode = '00020101021126370014BR.GOV.BCB.PIX0115abc@example.com5204000053039865406123.455802BR5907MATHEUS6008SAOPAULO61081234567862100506abc1236304ABCD';

  it('should remove surrounding whitespace and parse fields', () => {
    const result = parseBRCode(`  ${dynamicCode}  `);
    expect(result.raw).toBe(dynamicCode);
    expect(result.type).toBe('DYNAMIC');
    expect(result.payloadFormatIndicator).toBe('01');
    expect(result.merchantCategoryCode).toBe('0000');
    expect(result.transactionCurrency).toBe('986');
    expect(result.transactionAmount).toBe('123.45');
    expect(result.countryCode).toBe('BR');
    expect(result.merchantName).toBe('MATHEUS');
    expect(result.merchantCity).toBe('SAOPAULO');
    expect(result.postalCode).toBe('12345678');
    expect(result.txid).toBe('abc123');
    expect(result.pixKey).toBe('abc@example.com');
  });

  it('should detect static codes', () => {
    const result = parseBRCode(staticCode);
    expect(result.type).toBe('STATIC');
  });

  it('should handle newlines and tabs', () => {
    const spaced = `\n${dynamicCode}\t`;
    const result = parseBRCode(spaced);
    expect(result.raw).toBe(dynamicCode);
  });
});
