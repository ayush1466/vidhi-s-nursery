const cache = new Map()

export const getAdminCache = (key, maxAgeMs = 120000) => {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.ts > maxAgeMs) return null
  return entry.value
}

export const setAdminCache = (key, value) => {
  cache.set(key, { value, ts: Date.now() })
}
