export interface Member {
  name: string
  image: string
}

export type PerkStatus = 'submitted' | 'approved' | 'rejected' | 'paused' | 'archived'

export interface Perk {
  id: string
  telegramUsername: string
  projectName: string
  projectDescription: string
  projectWebsite: string
  logoDataUrl: string
  offerTitle: string
  offerTerms: string
  offerCode: string | null
  status: PerkStatus
  featured: boolean
  rejectionReason: string | null
  createdAt: string
  updatedAt: string
  approvedAt: string | null
  approvedByTelegramId: string | null
}

export interface SiteConfig {
  name: string
  url: string
  domain: string
  title: string
  description: string
  metaDescription: string
  waitlistTallyId: string
  social: {
    x: string
    xHandle: string
  }
}
