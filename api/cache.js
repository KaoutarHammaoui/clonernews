const cache = new Map()
const inFlight = new Map()

export async function safeFetchItem(id, fetcher) {
  if (cache.has(id)) return cache.get(id)
  if (inFlight.has(id)) return inFlight.get(id)
  const promise = fetcher(id)
    .then((data) => {
      cache.set(id, data)
      inFlight.delete(id)
      return data
    }).catch((err) => {
      inFlight.delete(id)
      throw err
    });

  inFlight.set(id, promise)
  return promise
}