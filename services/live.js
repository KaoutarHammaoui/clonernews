import { fetchFeed, fetchItem } from "../api/client.js";
import { invalidateCache } from "../api/cache.js";
import { createPostElement } from "./post.js";
const banner = document.getElementById("live-banner");
const postsContainer = document.getElementById("feed");
const POLL_INTERVAL = 5000; 

export function startLiveUpdates(existingIds) {
  setInterval(async () => {
    try {
      const [latestIds, updates] = await Promise.all([
        fetchFeed(),
        fetchFeed("updates"),
      ]);

      handleNewPosts(latestIds, existingIds);
      handleItemUpdates(updates?.items || [], existingIds);
    } catch (error) {
      console.error(error);
    }
  }, POLL_INTERVAL);
}

function handleNewPosts(latestIds, existingIds) {
  const newIds = latestIds.filter(id => !existingIds.includes(id));
  if (newIds.length === 0) return;

  banner.hidden = false;
  banner.textContent = `${newIds.length} new posts available`;

  const firstChild = postsContainer.firstChild;
  banner.onclick = async () => {
    banner.hidden = true;
    const posts = await Promise.all(
      newIds.map(id => fetchItem(id))
    );
  
    // newest -> oldest
    posts.sort((a, b) => a.time - b.time);
  
    for (const post of posts) {
      const element = createPostElement(post);
  
      // add in order
      postsContainer.prepend(element);
    }
    
    existingIds.unshift(...posts.map(p => p.id).reverse());
  };
}

async function handleItemUpdates(updateIds, existingIds) {
  if (!updateIds.length) return;

  const refreshed = await Promise.all(
    updateIds.map(async (id) => {
      if (!existingIds.includes(id)) return null;
      
      const existingCard = document.querySelector(`[data-id="${id}"]`);
      if (!existingCard) return null;

      invalidateCache(id);
      const post = await fetchItem(id);
      
      if (post.deleted || post.dead) {
        existingCard.remove();
        return id;
      }
      
      const updatedCard = createPostElement(post);
      existingCard.replaceWith(updatedCard);
      return id;
    })
  );

  const count = refreshed.filter(Boolean).length;
  if (count) {
    console.debug(`Refreshed ${count} updated item${count === 1 ? "" : "s"}`);
  }
}