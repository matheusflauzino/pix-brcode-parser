export interface TLVData {
  [tag: string]: string;
}

export function parseTLV(data: string): TLVData {
  const result: TLVData = {};
  let i = 0;
  while (i < data.length) {
    const tag = data.slice(i, i + 2);
    const length = parseInt(data.slice(i + 2, i + 4), 10);
    const value = data.slice(i + 4, i + 4 + length);
    result[tag] = value;
    i += 4 + length;
  }
  return result;
}

export interface ParsedBRCode {
  raw: string;
  type: 'STATIC' | 'DYNAMIC';
  payloadFormatIndicator?: string;
  merchantCategoryCode?: string;
  transactionCurrency?: string;
  transactionAmount?: string;
  countryCode?: string;
  merchantName?: string;
  merchantCity?: string;
  postalCode?: string;
  txid?: string;
  pixKey?: string;
  infoAdicional?: string;
}

export function parseBRCode(brCode: string): ParsedBRCode {
  const sanitized = brCode.replace(/\s+/g, '');
  const tlv = parseTLV(sanitized);

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

  return {
    raw: sanitized,
    type,
    payloadFormatIndicator: tlv['00'],
    merchantCategoryCode: tlv['52'],
    transactionCurrency: tlv['53'],
    transactionAmount: tlv['54'],
    countryCode: tlv['58'],
    merchantName: tlv['59'],
    merchantCity: tlv['60'],
    postalCode: tlv['61'],
    txid: additional['05'],
    pixKey,
    infoAdicional,
  };
}
