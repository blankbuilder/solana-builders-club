import { neon } from '@neondatabase/serverless'
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http'
import * as schema from '@/lib/db/schema'

let db: NeonHttpDatabase<typeof schema> | null = null

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL)
}

export function getDb(): NeonHttpDatabase<typeof schema> {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not configured')
  }

  db ??= drizzle(neon(databaseUrl), { schema })

  return db
}
