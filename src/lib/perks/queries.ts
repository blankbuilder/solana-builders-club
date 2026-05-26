import { and, desc, eq } from 'drizzle-orm'
import { getDb, isDatabaseConfigured } from '@/lib/db/client'
import { perkEvents, perks, type NewPerkRecord, type PerkRecord } from '@/lib/db/schema'
import type { AdminPerkFormInput, PerkFormInput } from '@/lib/perks/validation'
import type { Perk } from '@/types'

export function isPerksDatabaseConfigured(): boolean {
  return isDatabaseConfigured()
}

export async function getApprovedPerks(): Promise<Perk[]> {
  if (!isDatabaseConfigured()) {
    return []
  }

  const rows = await getDb()
    .select()
    .from(perks)
    .where(eq(perks.status, 'approved'))
    .orderBy(desc(perks.featured), desc(perks.approvedAt), desc(perks.createdAt))

  return rows.map(mapPerk)
}

export async function getAdminPerks(): Promise<Perk[]> {
  if (!isDatabaseConfigured()) {
    return []
  }

  const rows = await getDb()
    .select()
    .from(perks)
    .orderBy(desc(perks.createdAt))

  return rows.map(mapPerk)
}

export async function getPerk(id: string): Promise<Perk | null> {
  if (!isDatabaseConfigured()) {
    return null
  }

  const [row] = await getDb().select().from(perks).where(eq(perks.id, id)).limit(1)

  return row ? mapPerk(row) : null
}

export async function getApprovedPerk(id: string): Promise<Perk | null> {
  if (!isDatabaseConfigured()) {
    return null
  }

  const [row] = await getDb()
    .select()
    .from(perks)
    .where(and(eq(perks.id, id), eq(perks.status, 'approved')))
    .limit(1)

  return row ? mapPerk(row) : null
}

export async function createSubmittedPerk(input: PerkFormInput): Promise<string> {
  const db = getDb()
  const [row] = await db
    .insert(perks)
    .values(toNewPerkRecord(input))
    .returning({ id: perks.id })

  await db.insert(perkEvents).values({
    perkId: row.id,
    eventType: 'submitted',
    actorName: input.telegramUsername,
    notes: `Submitted by ${input.telegramUsername}`,
  })

  return row.id
}

export async function updateAdminPerk({
  id,
  input,
  actorTelegramId,
  actorName,
}: {
  id: string
  input: AdminPerkFormInput
  actorTelegramId: string
  actorName: string | null
}): Promise<void> {
  const db = getDb()
  const existing = await getPerk(id)

  if (!existing) {
    throw new Error('Perk not found')
  }

  const approvedAt =
    input.status === 'approved'
      ? existing.status === 'approved' && existing.approvedAt
        ? new Date(existing.approvedAt)
        : new Date()
      : null
  const approvedByTelegramId =
    input.status === 'approved'
      ? existing.status === 'approved'
        ? existing.approvedByTelegramId
        : actorTelegramId
      : null

  await db
    .update(perks)
    .set({
      ...toNewPerkRecord(input),
      status: input.status,
      featured: input.featured,
      rejectionReason: input.rejectionReason,
      approvedAt,
      approvedByTelegramId,
      updatedByTelegramId: actorTelegramId,
      updatedAt: new Date(),
    })
    .where(eq(perks.id, id))

  await db.insert(perkEvents).values({
    perkId: id,
    eventType: 'edited',
    actorTelegramId,
    actorName,
    notes: `Status: ${existing.status} -> ${input.status}`,
  })
}

export async function setPerkStatus({
  id,
  status,
  rejectionReason,
  actorTelegramId,
  actorName,
}: {
  id: string
  status: 'approved' | 'rejected' | 'paused' | 'archived'
  rejectionReason?: string | null
  actorTelegramId: string
  actorName: string | null
}): Promise<void> {
  const db = getDb()
  const approvedAt = status === 'approved' ? new Date() : null

  await db
    .update(perks)
    .set({
      status,
      rejectionReason: status === 'rejected' ? rejectionReason ?? null : null,
      approvedAt,
      approvedByTelegramId: status === 'approved' ? actorTelegramId : null,
      updatedByTelegramId: actorTelegramId,
      updatedAt: new Date(),
    })
    .where(eq(perks.id, id))

  await db.insert(perkEvents).values({
    perkId: id,
    eventType: status,
    actorTelegramId,
    actorName,
    notes: rejectionReason ?? null,
  })
}

export async function setPerkFeatured({
  id,
  featured,
  actorTelegramId,
  actorName,
}: {
  id: string
  featured: boolean
  actorTelegramId: string
  actorName: string | null
}): Promise<void> {
  const db = getDb()

  await db
    .update(perks)
    .set({
      featured,
      updatedByTelegramId: actorTelegramId,
      updatedAt: new Date(),
    })
    .where(eq(perks.id, id))

  await db.insert(perkEvents).values({
    perkId: id,
    eventType: featured ? 'featured' : 'unfeatured',
    actorTelegramId,
    actorName,
  })
}

function toNewPerkRecord(input: PerkFormInput): NewPerkRecord {
  return {
    telegramUsername: input.telegramUsername,
    projectName: input.projectName,
    projectDescription: input.projectDescription,
    projectWebsite: input.projectWebsite,
    logoDataUrl: input.logoDataUrl,
    offerTitle: input.offerTitle,
    offerTerms: input.offerTerms,
    offerCode: input.offerCode,
  }
}

function mapPerk(row: PerkRecord): Perk {
  return {
    id: row.id,
    telegramUsername: row.telegramUsername,
    projectName: row.projectName,
    projectDescription: row.projectDescription,
    projectWebsite: row.projectWebsite,
    logoDataUrl: row.logoDataUrl,
    offerTitle: row.offerTitle,
    offerTerms: row.offerTerms,
    offerCode: row.offerCode,
    status: row.status,
    featured: row.featured,
    rejectionReason: row.rejectionReason,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    approvedAt: row.approvedAt?.toISOString() ?? null,
    approvedByTelegramId: row.approvedByTelegramId,
  }
}
