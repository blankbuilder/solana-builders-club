import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import { getMembers, formatMemberName, isImageFile } from './members'

vi.mock('node:fs')

describe('members', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('isImageFile', () => {
    it('should return true for supported image extensions', () => {
      expect(isImageFile('test.svg')).toBe(true)
      expect(isImageFile('test.png')).toBe(true)
      expect(isImageFile('test.jpg')).toBe(true)
      expect(isImageFile('test.webp')).toBe(true)
    })

    it('should return true for uppercase extensions', () => {
      expect(isImageFile('test.SVG')).toBe(true)
      expect(isImageFile('test.PNG')).toBe(true)
    })

    it('should return false for unsupported extensions', () => {
      expect(isImageFile('test.txt')).toBe(false)
      expect(isImageFile('test.gif')).toBe(false)
      expect(isImageFile('test.pdf')).toBe(false)
    })

    it('should return false for files without extension', () => {
      expect(isImageFile('test')).toBe(false)
    })
  })

  describe('formatMemberName', () => {
    it('should remove image extension', () => {
      expect(formatMemberName('john-doe.svg')).toBe('john doe')
      expect(formatMemberName('jane-smith.png')).toBe('jane smith')
    })

    it('should replace hyphens with spaces', () => {
      expect(formatMemberName('john-doe.svg')).toBe('john doe')
      expect(formatMemberName('jane-marie-smith.png')).toBe('jane marie smith')
    })

    it('should handle uppercase extensions', () => {
      expect(formatMemberName('test.SVG')).toBe('test')
    })
  })

  describe('getMembers', () => {
    it('should return empty array when directory does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false)

      const members = getMembers()

      expect(members).toEqual([])
    })

    it('should return members from directory', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readdirSync).mockReturnValue(
        ['alice.svg', 'bob-smith.png', 'charlie.txt'] as unknown as ReturnType<typeof fs.readdirSync>
      )

      const members = getMembers()

      expect(members).toHaveLength(2)
      expect(members[0]).toEqual({ name: 'alice', image: '/members/alice.svg' })
      expect(members[1]).toEqual({ name: 'bob smith', image: '/members/bob-smith.png' })
    })

    it('should sort members alphabetically', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readdirSync).mockReturnValue(
        ['charlie.svg', 'alice.svg', 'bob.svg'] as unknown as ReturnType<typeof fs.readdirSync>
      )

      const members = getMembers()

      expect(members[0].name).toBe('alice')
      expect(members[1].name).toBe('bob')
      expect(members[2].name).toBe('charlie')
    })

    it('should handle read errors gracefully', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true)
      vi.mocked(fs.readdirSync).mockImplementation(() => {
        throw new Error('Read error')
      })

      const members = getMembers()

      expect(members).toEqual([])
    })
  })
})
