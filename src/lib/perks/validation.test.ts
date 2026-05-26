import { describe, expect, it } from 'vitest'
import { FormValidationError, parseAdminPerkForm, parsePartnerPerkForm } from './validation'

describe('parsePartnerPerkForm', () => {
  it('parses a valid partner perk submission', async () => {
    const input = await parsePartnerPerkForm(
      formData({
        telegramUsername: 'helius_team',
        projectName: 'Helius',
        projectDescription: 'RPC, APIs, webhooks, and indexing for Solana teams.',
        projectWebsite: 'https://helius.dev',
        logo: logoFile(),
        offerTitle: 'RPC credits',
        offerTerms: '$5k in credits for eligible teams building on Solana.',
        offerCode: 'SBC5000',
      })
    )

    expect(input.telegramUsername).toBe('@helius_team')
    expect(input.projectWebsite).toBe('https://helius.dev/')
    expect(input.logoDataUrl).toMatch(/^data:image\/png;base64,/)
    expect(input.offerCode).toBe('SBC5000')
  })

  it('rejects invalid telegram usernames', async () => {
    await expect(
      parsePartnerPerkForm(
        formData({
          telegramUsername: '@bad user',
          projectName: 'Helius',
          projectDescription: 'RPC, APIs, webhooks, and indexing for Solana teams.',
          projectWebsite: 'https://helius.dev',
          logo: logoFile(),
          offerTitle: 'RPC credits',
          offerTerms: '$5k in credits for eligible teams building on Solana.',
        })
      )
    ).rejects.toThrow('Telegram username must be 5-32 characters and contain only letters, numbers, or underscores')
  })

  it('requires a logo upload', async () => {
    await expect(
      parsePartnerPerkForm(
        formData({
          telegramUsername: '@helius_team',
          projectName: 'Helius',
          projectDescription: 'RPC, APIs, webhooks, and indexing for Solana teams.',
          projectWebsite: 'https://helius.dev',
          offerTitle: 'RPC credits',
          offerTerms: '$5k in credits for eligible teams building on Solana.',
        })
      )
    ).rejects.toThrow('Logo is required')
  })

  it('returns every invalid field in one validation error', async () => {
    await expect(parsePartnerPerkForm(formData({}))).rejects.toMatchObject({
      errors: {
        telegramUsername: 'Telegram username is required',
        projectName: 'Project name is required',
        projectDescription: 'Project description is required',
        projectWebsite: 'Project website is required',
        logo: 'Logo is required',
        offerTitle: 'Offer title is required',
        offerTerms: 'Offer terms is required',
      },
    } satisfies Partial<FormValidationError>)
  })
})

describe('parseAdminPerkForm', () => {
  it('keeps the existing logo when no replacement is uploaded', async () => {
    const input = await parseAdminPerkForm(
      formData({
        telegramUsername: '@helius_team',
        projectName: 'Helius',
        projectDescription: 'RPC, APIs, webhooks, and indexing for Solana teams.',
        projectWebsite: 'https://helius.dev',
        existingLogoDataUrl: 'data:image/png;base64,bG9nbw==',
        offerTitle: 'RPC credits',
        offerTerms: '$5k in credits for eligible teams building on Solana.',
        status: 'approved',
        featured: 'on',
      })
    )

    expect(input.logoDataUrl).toBe('data:image/png;base64,bG9nbw==')
    expect(input.status).toBe('approved')
    expect(input.featured).toBe(true)
  })
})

function formData(values: Record<string, string | File>): FormData {
  const data = new FormData()

  for (const [key, value] of Object.entries(values)) {
    data.set(key, value)
  }

  return data
}

function logoFile(): File {
  return new File(['logo'], 'logo.png', { type: 'image/png' })
}
