import {
    fetchFeed,
  } from "../api/client.js";
  
  const banner =
    document.getElementById(
      "live-banner"
    );
  
  export function startLiveUpdates(
    existingIds
  ) {
    setInterval(async () => {
      try {
        const latestIds =
          await fetchFeed();
  
        const newItems =
          latestIds.filter(
            id =>
              !existingIds.includes(id)
          );
  
        if (newItems.length > 0) {
          banner.hidden = false;
  
          banner.textContent = `
            ${newItems.length}
            new posts available
          `;
  
          banner.onclick = () => {
            location.reload();
          };
        }
  
      } catch (error) {
        console.error(error);
      }
    }, 5000);
  }