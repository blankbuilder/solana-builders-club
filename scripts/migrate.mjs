import { createHash } from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import postgres from 'postgres'

const args = new Set(process.argv.slice(2))
const dryRun = args.has('--dry-run')
const productionOnly = args.has('--production-only')
const rootDir = process.cwd()
const migrationsDir = path.join(rootDir, 'db', 'migrations')
const advisoryLockKey = 741_512_203

await loadEnvFile(path.join(rootDir, '.env.local'))
await loadEnvFile(path.join(rootDir, '.env'))

if (productionOnly && process.env.VERCEL_ENV !== 'production') {
  console.log('Skipping migrations because VERCEL_ENV is not production.')
  process.exit(0)
}

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required to run migrations.')
}

const sql = postgres(databaseUrl, {
  max: 1,
  ssl: databaseUrl.includes('sslmode=disable') ? false : 'require',
})

try {
  await sql`SELECT pg_advisory_lock(${advisoryLockKey})`
  await ensureMigrationsTable()

  const files = (await fs.readdir(migrationsDir))
    .filter((file) => file.endsWith('.sql'))
    .sort()

  for (const file of files) {
    await applyMigration(file)
  }
} finally {
  await sql`SELECT pg_advisory_unlock(${advisoryLockKey})`.catch(() => undefined)
  await sql.end()
}

async function ensureMigrationsTable() {
  if (dryRun) {
    return
  }

  await sql`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      checksum TEXT NOT NULL,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `
}

async function applyMigration(file) {
  const id = file.replace(/\.sql$/, '')
  const sqlText = await fs.readFile(path.join(migrationsDir, file), 'utf8')
  const checksum = createHash('sha256').update(sqlText).digest('hex')

  const [existing] = dryRun
    ? []
    : await sql`SELECT checksum FROM schema_migrations WHERE id = ${id}`

  if (existing) {
    if (existing.checksum !== checksum) {
      throw new Error(`Migration ${id} was changed after it was applied.`)
    }

    console.log(`Already applied ${id}`)
    return
  }

  if (dryRun) {
    console.log(`Would apply ${id}`)
    return
  }

  console.log(`Applying ${id}`)

  await sql.begin(async (tx) => {
    await tx.unsafe(sqlText)
    await tx`
      INSERT INTO schema_migrations (id, checksum)
      VALUES (${id}, ${checksum})
    `
  })
}

async function loadEnvFile(filePath) {
  let contents

  try {
    contents = await fs.readFile(filePath, 'utf8')
  } catch {
    return
  }

  for (const line of contents.split('\n')) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
      continue
    }

    const [rawKey, ...rawValue] = trimmed.split('=')
    const key = rawKey.trim()
    const value = rawValue.join('=').trim().replace(/^['"]|['"]$/g, '')

    if (key && process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}
