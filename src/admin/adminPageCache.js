const cache = new Map()
const STORAGE_PREFIX = 'admin_cache:'
const getStorage = () => {
  try {
    return globalThis?.localStorage || null
  } catch {
    return null
  }
}

const readStorage = (key) => {
  const storage = getStorage()
  if (!storage) return null
  try {
    const raw = storage.getItem(STORAGE_PREFIX + key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    if (typeof parsed.ts !== 'number') return null
    return parsed
  } catch {
    return null
  }
}

const writeStorage = (key, entry) => {
  const storage = getStorage()
  if (!storage) return
  try {
    storage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry))
  } catch {
    // Ignore quota/privacy mode failures; in-memory cache still works.
  }
}

const removeStorage = (key) => {
  const storage = getStorage()
  if (!storage) return
  try {
    storage.removeItem(STORAGE_PREFIX + key)
  } catch {
    // no-op
  }
}

export const getAdminCache = (key, maxAgeMs = 120000) => {
  let entry = cache.get(key)
  if (!entry) {
    entry = readStorage(key)
    if (entry) cache.set(key, entry)
  }
  if (!entry) return null
  if (Date.now() - entry.ts > maxAgeMs) {
    cache.delete(key)
    removeStorage(key)
    return null
  }
  return entry.value
}

export const setAdminCache = (key, value) => {
  const entry = { value, ts: Date.now() }
  cache.set(key, entry)
  writeStorage(key, entry)
}
