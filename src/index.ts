export interface TLVData {
  [tag: string]: string;
}

export function parseTLV(data: string): TLVData {
  const result: TLVData = {};
  let i = 0;
  while (i < data.length) {
    if (i + 4 > data.length) {
      throw new Error('Invalid TLV format: incomplete tag or length');
    }

    const tag = data.slice(i, i + 2);
    const lengthStr = data.slice(i + 2, i + 4);

    if (!/^\d{2}$/.test(tag) || !/^\d{2}$/.test(lengthStr)) {
      throw new Error('Campo fora do padrão');
    }

    const length = parseInt(lengthStr, 10);

    if (i + 4 + length > data.length) {
      throw new Error('Invalid TLV format: length exceeds data size');
    }

    const value = data.slice(i + 4, i + 4 + length);
    result[tag] = value;
    i += 4 + length;
  }
  return result;
}

export interface BRCodeData {
  type: 'STATIC' | 'DYNAMIC';
  payloadFormatIndicator: string;
  merchantCategoryCode?: string;
  transactionCurrency?: string;
  transactionAmount?: number;
  countryCode?: string;
  merchantName?: string;
  merchantCity?: string;
  postalCode?: string;
  pixKey?: string;
  infoAdicional?: string;
  txid?: string;
  raw: string;
}

export function computeCRC16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function parseBRCode(brCode: string): BRCodeData {
  const sanitized = brCode.replace(/\s+/g, '');
  const tlv = parseTLV(sanitized);

  if (!tlv['00']) {
    throw new Error('Tag obrigatória ausente: 00');
  }

  if (tlv['63']) {
    const toCheck = sanitized.slice(0, sanitized.length - 4);
    const expected = tlv['63'].toUpperCase();
    const calculated = computeCRC16(toCheck);
    if (calculated !== expected) {
      throw new Error(`Invalid CRC16: expected ${expected}, got ${calculated}`);
    }
  }

  const type: 'STATIC' | 'DYNAMIC' = tlv['01'] === '12' ? 'DYNAMIC' : 'STATIC';

  const additional = tlv['62'] ? parseTLV(tlv['62']) : {};

  let pixKey: string | undefined;
  let infoAdicional: string | undefined;

  for (let i = 26; i <= 51; i++) {
    const tag = String(i).padStart(2, '0');
    const value = tlv[tag];
    if (value) {
      const sub = parseTLV(value);
      if (sub['00'] && sub['00'].toUpperCase() === 'BR.GOV.BCB.PIX') {
        pixKey = sub['01'];
        if (sub['02']) {
          infoAdicional = sub['02'];
        }
        break;
      }
    }
  }

  if (!pixKey) {
    throw new Error('Tag obrigatória ausente: 26');
  }

  return {
    raw: sanitized,
    type,
    payloadFormatIndicator: tlv['00'] || '',
    merchantCategoryCode: tlv['52'],
    transactionCurrency: tlv['53'],
    transactionAmount: tlv['54'] ? parseFloat(tlv['54']) : undefined,
    countryCode: tlv['58'],
    merchantName: tlv['59'],
    merchantCity: tlv['60'],
    postalCode: tlv['61'],
    txid: additional['05'],
    pixKey,
    infoAdicional,
  };
}
