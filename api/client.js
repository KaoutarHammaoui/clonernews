const BASE = "https://hacker-news.firebaseio.com/v0";

export async function fetchItem(id) {
  const res = await fetch(`${BASE}/item/${id}.json`);
  if (!res.ok) throw new Error("Failed item fetch");
  return res.json();
}

export async function fetchFeed(type = "topstories") {
  const res = await fetch(`${BASE}/${type}.json`);
  if (!res.ok) throw new Error("Failed feed fetch");
  return res.json(); 
}
