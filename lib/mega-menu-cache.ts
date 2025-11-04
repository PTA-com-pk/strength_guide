// Client-side cache for mega menu data
// This allows sharing data between MegaMenu instances

interface MenuData {
  description: string
  links: Array<{ name: string; href: string }>
}

type MegaMenuCache = Record<string, MenuData> | null

let cache: MegaMenuCache = null
let cachePromise: Promise<MegaMenuCache> | null = null

export async function getMegaMenuData(): Promise<MegaMenuCache> {
  // Return cached data if available
  if (cache) {
    return cache
  }

  // If there's already a fetch in progress, return that promise
  if (cachePromise) {
    return cachePromise
  }

  // Start fetching
  cachePromise = fetch('/api/mega-menu', {
    cache: 'default',
  })
    .then((res) => res.json())
    .then((data) => {
      cache = data
      return data
    })
    .catch((error) => {
      console.error('Error fetching mega menu data:', error)
      cachePromise = null
      return null
    })
    .finally(() => {
      // Clear the promise after completion
      setTimeout(() => {
        cachePromise = null
      }, 100)
    })

  return cachePromise
}

export function clearMegaMenuCache() {
  cache = null
  cachePromise = null
}

