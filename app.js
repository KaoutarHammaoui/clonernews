import { fetchFeed } from "./api/client.js";
import { createPostElement } from "./services/post.js";
import { startLiveUpdates } from "./services/live.js";
import { getItem } from "./services/items.js";
import { loadMorePosts, setupInfiniteScroll, showError } from "./services/feed.js";

const feed = document.getElementById("feed");
const loader = document.getElementById("loader");
const PAGE_SIZE = 20;

const feedState = {
  feed,
  loader,
  pageSize: PAGE_SIZE,
  allIds: [],
  currentPage: 0,
  loading: false,
  getItem,
  createPostElement,
};

async function init() {
  try {
    feedState.allIds = await fetchFeed();

    await loadMorePosts(feedState);
    setupInfiniteScroll(feedState);
    startLiveUpdates(feedState.allIds);
  } catch (error) {
    showError(feedState, error.message);
  }
}

init();