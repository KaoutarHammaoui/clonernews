const loadedIds = new Set();
import { fetchFeed } from "../api/client.js";
import { getItem } from "./items.js";

export async function getFeed(type, limit = 20, offset = 0) {
  const ids = await fetchFeed(type);

  const slice = ids.slice(offset, offset + limit);

  const items = await Promise.all(
    slice.map(async (id) => {
      if (loadedIds.has(id)) return null;
      loadedIds.add(id);
      return getItem(id);
    }),
  );

  return items.filter(Boolean);
}