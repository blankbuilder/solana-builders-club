import fs from 'node:fs'
import path from 'node:path'
import type { Member } from '../types'
import { SUPPORTED_IMAGE_EXTENSIONS } from '../config'

const MEMBERS_DIR = 'public/members'

/**
 * Checks if a filename has a supported image extension.
 * @param filename - The filename to check
 * @returns True if the file is a supported image format
 */
export function isImageFile(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase()
  return SUPPORTED_IMAGE_EXTENSIONS.includes(ext as typeof SUPPORTED_IMAGE_EXTENSIONS[number])
}

/**
 * Formats a member filename into a display name.
 * Removes the file extension and replaces hyphens with spaces.
 * @param filename - The image filename (e.g., "john-doe.svg")
 * @returns Formatted name (e.g., "john doe")
 */
export function formatMemberName(filename: string): string {
  const extPattern = new RegExp(
    `\\.(${SUPPORTED_IMAGE_EXTENSIONS.map(e => e.slice(1)).join('|')})$`,
    'i'
  )
  return filename.replace(extPattern, '').replaceAll('-', ' ')
}

/**
 * Retrieves all members from the members directory.
 * Scans the public/members directory for image files and returns
 * an array of Member objects sorted alphabetically by filename.
 * @returns Array of Member objects with name and image path
 */
export function getMembers(): Member[] {
  const membersPath = path.join(process.cwd(), MEMBERS_DIR)

  if (!fs.existsSync(membersPath)) {
    console.warn(`Members directory not found: ${membersPath}`)
    return []
  }

  try {
    const files = fs.readdirSync(membersPath)

    return files
      .filter(isImageFile)
      .sort()
      .map(file => ({
        name: formatMemberName(file),
        image: `/members/${file}`
      }))
  } catch (error: unknown) {
    console.error('Failed to read members directory:', error)
    return []
  }
}
