import { describe, it, expect } from 'vitest';
import { parseBRCode, computeCRC16 } from '../src';

describe('parseBRCode', () => {
  const dynamicCode = '00020101021226370014BR.GOV.BCB.PIX0115abc@example.com5204000053039865406123.455802BR5907MATHEUS6008SAOPAULO61081234567862100506abc12363042275';
  const staticCode = '00020101021126370014BR.GOV.BCB.PIX0115abc@example.com5204000053039865406123.455802BR5907MATHEUS6008SAOPAULO61081234567862100506abc1236304E2F7';

  it('should remove surrounding whitespace and parse fields', () => {
    const result = parseBRCode(`  ${dynamicCode}  `);
    expect(result.raw).toBe(dynamicCode);
    expect(result.type).toBe('DYNAMIC');
    expect(result.payloadFormatIndicator).toBe('01');
    expect(result.merchantCategoryCode).toBe('0000');
    expect(result.transactionCurrency).toBe('986');
    expect(result.transactionAmount).toBe(123.45);
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

  it('should default to static when tag 01 is missing', () => {
    const codeWithoutTag =
      '00020126370014BR.GOV.BCB.PIX0115abc@example.com5204000053039865406123.455802BR5907MATHEUS6008SAOPAULO61081234567862100506abc1236304CBBD';
    const result = parseBRCode(codeWithoutTag);
    expect(result.type).toBe('STATIC');
  });

  it('should detect dynamic codes when tag 01 is \"12\"', () => {
    const result = parseBRCode(dynamicCode);
    expect(result.type).toBe('DYNAMIC');
  });

  it('should handle newlines and tabs', () => {
    const spaced = `\n${dynamicCode}\t`;
    const result = parseBRCode(spaced);
    expect(result.raw).toBe(dynamicCode);
  });

  it('should throw when CRC does not match', () => {
    const invalid = dynamicCode.slice(0, -4) + 'FFFF';
    expect(() => parseBRCode(invalid)).toThrowError('Invalid CRC16');
  });

  it('should throw when mandatory tag 00 is missing', () => {
    const codeWithout00 =
      '01021226370014BR.GOV.BCB.PIX0115abc@example.com5204000053039865406123.455802BR5907MATHEUS6008SAOPAULO61081234567862100506abc1236304906E';
    expect(() => parseBRCode(codeWithout00)).toThrowError('Tag obrigatória ausente: 00');
  });

  it('should handle empty tag 00 and set empty payloadFormatIndicator', () => {
    const codeWithEmpty00 =
      '000001021226370014BR.GOV.BCB.PIX0115abc@example.com5204000053039865406123.455802BR5907MATHEUS6008SAOPAULO61081234567862100506abc1236304A537';
    const result = parseBRCode(codeWithEmpty00);
    expect(result.payloadFormatIndicator).toBe('');
  });

  it('should throw when mandatory tag 26 is missing', () => {
    const codeWithout26 =
      '0002010102125204000053039865406123.455802BR5907MATHEUS6008SAOPAULO61081234567862100506abc12363046BDE';
    expect(() => parseBRCode(codeWithout26)).toThrowError('Tag obrigatória ausente: 26');
  });

  it('should throw on invalid TLV format', () => {
    const invalidTLV = dynamicCode.slice(0, -1);
    expect(() => parseBRCode(invalidTLV)).toThrowError('Invalid TLV format');
  });

  it('should throw on fields out of pattern', () => {
    const weird = 'AA0201';
    expect(() => parseBRCode(weird)).toThrowError('Campo fora do padrão');
  });

  it('should parse different PIX key types', () => {
    const codes = {
      cpf:
        '00020101021226330014BR.GOV.BCB.PIX0111123456789095204000053039865406123.455802BR5907MATHEUS6008SAOPAULO61081234567862100506cpf0016304354C',
      cnpj:
        '00020101021226360014BR.GOV.BCB.PIX0114123456780001955204000053039865406123.455802BR5907MATHEUS6008SAOPAULO61081234567862110507cnpj00263043B03',
      phone:
        '00020101021226360014BR.GOV.BCB.PIX0114+55119999999995204000053039865406123.455802BR5907MATHEUS6008SAOPAULO61081234567862100506cel0036304917A',
      email:
        '00020101021226370014BR.GOV.BCB.PIX0115abc@example.com5204000053039865406123.455802BR5907MATHEUS6008SAOPAULO61081234567862100506email46304766B',
      uuid:
        '00020101021226580014BR.GOV.BCB.PIX0136550e8400-e29b-41d4-a716-4466554400005204000053039865406123.455802BR5907MATHEUS6008SAOPAULO61081234567862100506uuid056304E50F',
    } as const;

    const expectations = {
      cpf: { key: '12345678909', txid: 'cpf001' },
      cnpj: { key: '12345678000195', txid: 'cnpj002' },
      phone: { key: '+5511999999999', txid: 'cel003' },
      email: { key: 'abc@example.com', txid: 'email4' },
      uuid: { key: '550e8400-e29b-41d4-a716-446655440000', txid: 'uuid05' },
    } as const;

    for (const [type, code] of Object.entries(codes)) {
      const result = parseBRCode(code);
      const { key, txid } = (expectations as any)[type];
      expect(result.pixKey).toBe(key);
      expect(result.merchantName).toBe('MATHEUS');
      expect(result.transactionAmount).toBe(123.45);
      expect(result.txid).toBe(txid);
    }
  });

  it('should return undefined txid when tag 62 is absent', () => {
    const body =
      '00020101021226370014BR.GOV.BCB.PIX0115abc@example.com5204000053039865406123.455802BR5907MATHEUS6008SAOPAULO610812345678';
    const code = body + '6304' + computeCRC16(body + '6304');
    const result = parseBRCode(code);
    expect(result.txid).toBeUndefined();
    expect(result.pixKey).toBe('abc@example.com');
  });
});
