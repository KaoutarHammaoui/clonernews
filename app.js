import {fetchFeed,fetchItem} from "./api/client.js";
import {safeFetchItem} from "./api/cache.js";
import {createPostElement} from "./services/post.js";
// import {startLiveUpdates,} from "./services/liveservice.js";
import {startLiveUpdates,} from "./services/live.js";
  
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
        ids.map(id => safeFetchItem(id, fetchItem))
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
  
  export function setupInfiniteScroll() {
    window.addEventListener("scroll", handleScroll);
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
    feed.innerHTML = `
      <div class="error">
        ${message}
      </div>
    `;
  }
  
  init();