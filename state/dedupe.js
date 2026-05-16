const seen = new Set();

export function isSeen(id) {
  return seen.has(id);
}

export function markSeen(id) {
  seen.add(id);
}
