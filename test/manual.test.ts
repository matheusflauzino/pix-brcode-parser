import { describe, it, expect } from 'vitest'
import { parseBRCode, computeCRC16 } from '../src'

// BR Code strings generated based on Manual BR Code examples

const minimalBody = '00020101021226370014BR.GOV.BCB.PIX0115abc@example.com5204000053039865802BR5907MATHEUS6008SAOPAULO62100506abc1236304'
const minimalCode = minimalBody + computeCRC16(minimalBody)

const withPostalBody = '00020101021226370014BR.GOV.BCB.PIX0115abc@example.com5204000053039865406123.455802BR5907MATHEUS6008SAOPAULO61081234567862100506abc1236304'
const withPostal = withPostalBody + computeCRC16(withPostalBody)

const withoutPostalBody = '00020101021226370014BR.GOV.BCB.PIX0115abc@example.com5204000053039865406123.455802BR5907MATHEUS6008SAOPAULO62100506abc1236304'
const withoutPostal = withoutPostalBody + computeCRC16(withoutPostalBody)

const noPIMBody = '00020126370014BR.GOV.BCB.PIX0115abc@example.com5204000053039865802BR5907MATHEUS6008SAOPAULO62100506abc1236304'
const noPIM = noPIMBody + computeCRC16(noPIMBody)

const invalidGUIBody = '00020101021226350012BR.COM.OUTRO0115abc@example.com5204000053039865802BR5907MATHEUS6008SAOPAULO62100506abc1236304'
const invalidGUI = invalidGUIBody + computeCRC16(invalidGUIBody)

const multiBody = '00020101021226370014BR.GOV.BCB.PIX0115abc@example.com27160012BR.COM.OUTRO5204000053039865802BR5907MATHEUS6008SAOPAULO62100506abc1236304'
const multi = multiBody + computeCRC16(multiBody)

const longTxidBody = '00020101021226370014BR.GOV.BCB.PIX0115abc@example.com5204000053039865802BR5907MATHEUS6008SAOPAULO62290525ABCDEFGHIJKLMNOPQRSTUVWXY6304'
const longTxid = longTxidBody + computeCRC16(longTxidBody)

describe('BR Code manual compliance', () => {
  it('parses minimal mandatory fields', () => {
    const result = parseBRCode(minimalCode)
    expect(result.pixKey).toBe('abc@example.com')
    expect(result.transactionAmount).toBeUndefined()
    expect(result.postalCode).toBeUndefined()
    expect(result.txid).toBe('abc123')
    expect(result.countryCode).toBe('BR')
  })

  it('extracts postalCode when present and ignores when absent', () => {
    expect(parseBRCode(withPostal).postalCode).toBe('12345678')
    expect(parseBRCode(withoutPostal).postalCode).toBeUndefined()
  })

  it('sets type based on tag 01', () => {
    expect(parseBRCode(minimalCode).type).toBe('DYNAMIC')
    expect(parseBRCode(noPIM).type).toBe('STATIC')
  })

  it('handles arrangement with invalid GUI', () => {
    expect(() => parseBRCode(invalidGUI)).toThrowError('Tag obrigatória ausente: 26')
  })

  it('ignores arrangements with unknown GUI', () => {
    const result = parseBRCode(multi)
    expect(result.pixKey).toBe('abc@example.com')
  })

  it('supports TXID of 25 characters', () => {
    expect(parseBRCode(longTxid).txid).toBe('ABCDEFGHIJKLMNOPQRSTUVWXY')
  })

  it('parses codes without CRC tag', () => {
    const code = withPostal.slice(0, -8) // remove 6304XXXX
    expect(parseBRCode(code).pixKey).toBe('abc@example.com')
  })

  it('throws on invalid CRC', () => {
    const invalid = withPostal.slice(0, -4) + 'FFFF'
    expect(() => parseBRCode(invalid)).toThrowError('Invalid CRC16')
  })
})
