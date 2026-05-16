const BASE_URL = "https://hacker-news.firebaseio.com/v0";

export const endpoints = {
  item: (id) => `${BASE_URL}/item/${id}.json`,
  feed: (type) => `${BASE_URL}/${type}.json`,
}
