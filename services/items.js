import { safeFetchItem } from "../api/cache.js";

export function getItem(id) {
  return safeFetchItem(id);
}
