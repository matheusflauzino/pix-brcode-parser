import { describe, it, expect } from 'vitest'
import { parseTLV } from '../src'

describe('parseTLV', () => {
  it('parses a simple TLV string', () => {
    const tlv = parseTLV('000201010212')
    expect(tlv).toEqual({ '00': '01', '01': '12' })
  })

  it('parses nested TLV values for subfields', () => {
    const root = parseTLV('26080004ABCD')
    const sub = parseTLV(root['26'])
    expect(sub).toEqual({ '00': 'ABCD' })
  })

  it('throws when length exceeds remaining data', () => {
    expect(() => parseTLV('000301')).toThrowError('Invalid TLV format')
  })

  it('throws when tag or length is not numeric', () => {
    expect(() => parseTLV('AA0201')).toThrowError('Campo fora do padrão')
  })
})
