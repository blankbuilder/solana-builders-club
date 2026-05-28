import { sql } from 'drizzle-orm'
import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

export const perkStatusEnum = pgEnum('perk_status', [
  'submitted',
  'approved',
  'rejected',
  'paused',
  'archived',
])

export const perkEventTypeEnum = pgEnum('perk_event_type', [
  'submitted',
  'edited',
  'approved',
  'rejected',
  'paused',
  'archived',
  'featured',
  'unfeatured',
])

export const perks = pgTable(
  'perks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    telegramUsername: text('telegram_username').notNull(),
    projectName: text('project_name').notNull(),
    projectDescription: text('project_description').notNull(),
    projectWebsite: text('project_website').notNull(),
    logoDataUrl: text('logo_data_url').notNull(),
    offerTitle: text('offer_title').notNull(),
    offerTerms: text('offer_terms').notNull(),
    offerCode: text('offer_code'),
    status: perkStatusEnum('status').notNull().default('submitted'),
    featured: boolean('featured').notNull().default(false),
    sortOrder: integer('sort_order').notNull().default(0),
    rejectionReason: text('rejection_reason'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    approvedAt: timestamp('approved_at', { withTimezone: true }),
    approvedByTelegramId: text('approved_by_telegram_id'),
    updatedByTelegramId: text('updated_by_telegram_id'),
  },
  (table) => [
    index('perks_status_created_at_idx').on(table.status, table.createdAt),
    index('perks_featured_idx').on(table.featured),
    index('perks_status_sort_order_idx').on(table.status, table.sortOrder),
  ]
)

export const perkEvents = pgTable(
  'perk_events',
  {
    id: bigint('id', { mode: 'number' }).generatedAlwaysAsIdentity().primaryKey(),
    perkId: uuid('perk_id')
      .notNull()
      .references(() => perks.id, { onDelete: 'cascade' }),
    eventType: perkEventTypeEnum('event_type').notNull(),
    actorTelegramId: text('actor_telegram_id'),
    actorName: text('actor_name'),
    notes: text('notes'),
    metadata: jsonb('metadata').notNull().default(sql`'{}'::jsonb`),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('perk_events_perk_id_created_at_idx').on(table.perkId, table.createdAt),
    index('perk_events_event_type_idx').on(table.eventType),
  ]
)

export type PerkRecord = typeof perks.$inferSelect
export type NewPerkRecord = typeof perks.$inferInsert
export type NewPerkEventRecord = typeof perkEvents.$inferInsert
