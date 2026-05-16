import { fetchItem } from "../api/client.js";
import { safeFetchItem } from "../api/cache.js";

export function getItem(id) {
  return safeFetchItem(id, fetchItem);
}
