import { afterEach, describe, expect, it, vi } from 'vitest'
import { checkTelegramMembership } from './membership'

describe('checkTelegramMembership', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('treats normal members as verified', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          ok: true,
          result: { status: 'member' },
        }),
      })
    )

    const membership = await checkTelegramMembership({
      botToken: 'bot-token',
      chatId: '-100123',
      userId: '42',
    })

    expect(membership).toEqual({ isMember: true, status: 'member' })
  })

  it('requires restricted users to still be members', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          ok: true,
          result: { status: 'restricted', is_member: false },
        }),
      })
    )

    const membership = await checkTelegramMembership({
      botToken: 'bot-token',
      chatId: '-100123',
      userId: '42',
    })

    expect(membership).toEqual({ isMember: false, status: 'restricted' })
  })
})
