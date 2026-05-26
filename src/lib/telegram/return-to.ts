export function normalizeReturnTo(value: string | null | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/perks'
  }

  return value
}

export function withTelegramParam(returnTo: string, key: string, value: string): string {
  const normalizedReturnTo = normalizeReturnTo(returnTo)
  const [path, query = ''] = normalizedReturnTo.split('?')
  const params = new URLSearchParams(query)

  params.set(key, value)

  const serializedParams = params.toString()

  return serializedParams ? `${path}?${serializedParams}` : path
}
