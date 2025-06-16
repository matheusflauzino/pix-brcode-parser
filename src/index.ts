export function parseBRCode(brCode: string): { raw: string } {
  // Remove all whitespace characters from the provided BR Code
  const sanitized = brCode.replace(/\s+/g, '');
  return { raw: sanitized };
}
  