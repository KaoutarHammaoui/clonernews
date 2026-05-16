import { fetchFeed } from "../api/client.js";
import { getItem } from "./items.js";

let lastIds = new Set();

export function startLiveUpdates(onNewItems) {
  setInterval(async () => {
    const latest = await fetchFeed("newstories");

    const newIds = latest.filter((id) => !lastIds.has(id));

    if (newIds.length > 0) {
      const items = await Promise.all(newIds.map(getItem));
      onNewItems(items);
    }

    lastIds = new Set(latest);
  }, 5000);
}
