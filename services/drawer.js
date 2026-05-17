import { getItem } from "./items.js";

const COMMENTS_PAGE_SIZE = 20;
const MAX_INDENT = 64; // px cap so nested comments never overflow

const drawer   = document.getElementById("comments-drawer");
const overlay  = document.getElementById("drawer-overlay");
const closeBtn = document.getElementById("drawer-close");
const titleEl  = document.getElementById("drawer-title");
const bodyEl   = document.getElementById("drawer-body");
const footerEl = document.getElementById("drawer-footer");

// ── Open / close ──────────────────────────────────────────

function openDrawer() {
  drawer.classList.add("open");
  overlay.classList.add("open");
  document.body.classList.add("drawer-open");
}

function closeDrawer() {
  drawer.classList.remove("open");
  overlay.classList.remove("open");
  document.body.classList.remove("drawer-open");
}

closeBtn.addEventListener("click", closeDrawer);
overlay.addEventListener("click", closeDrawer);
document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeDrawer();
});

// ── Public entry point ────────────────────────────────────

export async function openCommentsDrawer(post) {
  titleEl.textContent = `Comments (${post.descendants || 0})`;
  bodyEl.innerHTML = "";
  footerEl.innerHTML = "";
  bodyEl.scrollTop = 0;

  openDrawer();

  const kidIds = post.kids || [];

  if (kidIds.length === 0) {
    bodyEl.innerHTML = `<p class="no-comments">No comments yet.</p>`;
    return;
  }

  let offset = 0;

  async function loadBatch() {
    setFooterStatus("Loading…");

    const batch = kidIds.slice(offset, offset + COMMENTS_PAGE_SIZE);
    offset += COMMENTS_PAGE_SIZE;

    try {
      // Fetch only this batch of top-level comments — no recursive deep fetch
      const comments = await fetchCommentsBatch(batch);

      comments.forEach(comment => {
        bodyEl.appendChild(renderComment(comment, 0));
      });

      footerEl.innerHTML = "";

      if (offset < kidIds.length) {
        const remaining = kidIds.length - offset;
        const btn = document.createElement("button");
        btn.className = "load-more-btn";
        btn.textContent = `Load more (${remaining} remaining)`;
        btn.addEventListener("click", () => {
          btn.remove();
          loadBatch();
        });
        footerEl.appendChild(btn);
      }
    } catch (err) {
      setFooterStatus("Failed to load comments.", true);
      console.error(err);
    }
  }

  await loadBatch();
}

// ── Fetch only a flat batch (no deep recursion) ───────────

async function fetchCommentsBatch(ids) {
  const results = await Promise.all(
    ids.map(async id => {
      try {
        const item = await getItem(id);
        if (!item || item.deleted || item.dead) return null;
        return item;
      } catch {
        return null;
      }
    })
  );

  return results
    .filter(Boolean)
    .sort((a, b) => b.time - a.time);
}

// ── Render a single comment (replies load on demand) ──────

function renderComment(comment, depth) {
  const indent = Math.min(depth * 16, MAX_INDENT);

  const el = document.createElement("div");
  el.className = "comment";
  el.style.marginLeft = `${indent}px`;

  const time = new Date(comment.time * 1000).toLocaleString();
  const hasReplies = comment.kids?.length > 0;

  el.innerHTML = `
    <div class="comment-meta">
      <span class="comment-author">${comment.by || "unknown"}</span>
      <span class="comment-time">${time}</span>
      ${hasReplies ? `<button class="toggle-replies">${comment.kids.length} repl${comment.kids.length === 1 ? "y" : "ies"}</button>` : ""}
    </div>
    <div class="comment-text">${comment.text || ""}</div>
    <div class="replies-container"></div>
  `;

  if (hasReplies) {
    const toggleBtn = el.querySelector(".toggle-replies");
    const repliesContainer = el.querySelector(".replies-container");
    let loaded = false;
    let open = false;

    toggleBtn.addEventListener("click", async () => {
      if (!loaded) {
        toggleBtn.textContent = "Loading…";
        toggleBtn.disabled = true;

        try {
          const replies = await fetchCommentsBatch(comment.kids);
          replies.forEach(reply => {
            repliesContainer.appendChild(renderComment(reply, depth + 1));
          });
          loaded = true;
          open = true;
          repliesContainer.style.display = "block";
          toggleBtn.textContent = `▲ Hide replies`;
        } catch {
          toggleBtn.textContent = "Failed to load";
        } finally {
          toggleBtn.disabled = false;
        }
      } else {
        open = !open;
        repliesContainer.style.display = open ? "block" : "none";
        toggleBtn.textContent = open
          ? "▲ Hide replies"
          : `▼ ${comment.kids.length} repl${comment.kids.length === 1 ? "y" : "ies"}`;
      }
    });
  }

  return el;
}

// ── Footer helper ─────────────────────────────────────────

function setFooterStatus(text, isError = false) {
  footerEl.innerHTML = `<p class="drawer-status${isError ? " error" : ""}">${text}</p>`;
}