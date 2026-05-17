const BASE = "https://hacker-news.firebaseio.com/v0";

async function fetchWithRetry(url, attempts = 3, delay = 300) {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
      return res.json();
    } catch (error) {
      lastError = error;
      if (attempt === attempts) break;
      await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
    }
  }

  throw lastError;
}

export async function fetchItem(id) {
  return fetchWithRetry(`${BASE}/item/${id}.json`);
}

export async function fetchFeed(type = "newstories") {
  return fetchWithRetry(`${BASE}/${type}.json`);
}
