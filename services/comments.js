import { getItem } from "./items.js";

export async function getComments(ids = []) {
  const comments = await Promise.all(
    ids.map(async (id) => {
      const item = await getItem(id);

      if (!item || item.deleted) return null;

      const kids = item.kids?.length ? await getComments(item.kids) : [];

      return {
        ...item,
        kids,
      };
    }),
  );

    return comments
    .filter(Boolean)
    .sort((a, b) => b.time - a.time);
}
