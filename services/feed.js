export async function loadMorePosts(state) {
  if (state.loading) return;

  state.loading = true;
  state.loader.style.display = "block";

  try {
    const start = state.currentPage * state.pageSize;
    const end = start + state.pageSize;
    const ids = state.allIds.slice(start, end);

    const posts = await Promise.all(ids.map((id) => state.getItem(id)));

    posts
      .filter(Boolean)
      .sort((a, b) => b.time - a.time)
      .forEach((post) => {
        const element = state.createPostElement(post);
        state.feed.appendChild(element);
      });

    state.currentPage += 1;
  } catch (error) {
    showError(state, error.message);
  } finally {
    state.loading = false;
    state.loader.style.display = "none";
  }
}

export function setupInfiniteScroll(state) {
  window.addEventListener("scroll", throttle(() => handleScroll(state), 200));
}

function handleScroll(state) {
  const scrollTop = window.scrollY;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;

  if (scrollTop + windowHeight >= documentHeight - 200 && !state.loading) {
    loadMorePosts(state);
  }
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

export function showError(state, message) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "error";
  errorDiv.textContent = message;
  state.feed.innerHTML = "";
  state.feed.appendChild(errorDiv);
}
