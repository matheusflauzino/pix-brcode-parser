export function parseBRCode(brCode: string): { raw: string } {
  // Remove all whitespace characters from the provided BR Code
  const sanitized = brCode.replace(/\s+/g, '');
  return { raw: sanitized };
}

export function parseTLV(emv: string): Record<string, string> {
  const result: Record<string, string> = {};
  let index = 0;

  while (index < emv.length) {
    const tag = emv.substring(index, index + 2);
    const length = parseInt(emv.substring(index + 2, index + 4), 10);
    const valueStart = index + 4;
    const valueEnd = valueStart + length;

    result[tag] = emv.substring(valueStart, valueEnd);
    index = valueEnd;
  }

  return result;
}
