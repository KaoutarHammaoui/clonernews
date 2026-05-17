import {fetchFeed} from "./api/client.js";
import {createPostElement} from "./services/post.js";
import {startLiveUpdates,} from "./services/live.js";
import { getItem } from "./services/items.js";
  
  const feed = document.getElementById("feed");
  const loader = document.getElementById("loader");
  
  const PAGE_SIZE = 20;
  
  let allIds = [];
  let currentPage = 0;
  let loading = false;
  
async function init() {
  try {
    allIds = await fetchFeed();

    await loadMorePosts();

    setupInfiniteScroll();

    startLiveUpdates(allIds);
  } catch (error) {
    showError(error.message);
  }
}
  
async function loadMorePosts() {
  if (loading) return;

  loading = true;

  loader.style.display = "block";

  try {
    const start = currentPage * PAGE_SIZE;
    const end = start + PAGE_SIZE;

    const ids = allIds.slice(start, end);

    const posts = await Promise.all(
      ids.map(id => getItem(id))
    );

    posts.sort((a, b) => b.time - a.time);

    posts.forEach(post => {
      const element =
        createPostElement(post);

      feed.appendChild(element);
    });

    currentPage++;

  } catch (error) {
    showError(error.message);
  } finally {
    loading = false;

    loader.style.display = "none";
  }
}
  
function setupInfiniteScroll() {
  window.addEventListener("scroll", throttle(handleScroll, 200));
}

function throttle(fn, wait) {
  let last = 0;
  return function throttled(...args) {
    const now = Date.now();
    if (now - last >= wait) {
      last = now;
      fn.apply(this, args);
    }
  };
}
  
function handleScroll() {
  const scrollTop = window.scrollY;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;

  // Trigger near bottom
  if (
    scrollTop + windowHeight >= documentHeight - 200 &&
    !loading
  ) {
    loadMorePosts();
  }
}

function showError(message) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "error";
  errorDiv.textContent = message;
  feed.innerHTML = "";
  feed.appendChild(errorDiv);
}

init();