import { getComments } from "./comments.js";
import { getItem } from "./items.js";

const COMMENTS_PAGE_SIZE = 20;
const MAX_INDENT = 64; // px cap so nested comments never overflow

const drawer   = document.getElementById("post-drawer");
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
  titleEl.textContent = post.title || "Details";
  bodyEl.innerHTML = "";
  footerEl.innerHTML = "";
  bodyEl.scrollTop = 0;

  openDrawer();

  // Render post header info
  const header = document.createElement("div");
  header.className = "drawer-header";
  const meta = document.createElement("div");
  meta.className = "drawer-meta";
  const authorSpan = document.createElement("span");
  authorSpan.textContent = post.by || "unknown";
  const timeSpan = document.createElement("span");
  timeSpan.textContent = new Date(post.time * 1000).toLocaleString();
  const typeSpan = document.createElement("span");
  typeSpan.textContent = post.type;
  meta.append(authorSpan, document.createTextNode(" · "), timeSpan, document.createTextNode(" · "), typeSpan);
  header.appendChild(meta);

  // If poll, show options
  if (post.type === "poll" && Array.isArray(post.parts) && post.parts.length > 0) {
    const pollSection = document.createElement("div");
    pollSection.className = "poll-section";
    const pollHeading = document.createElement("h3");
    pollHeading.textContent = "Poll options";
    pollSection.appendChild(pollHeading);
    const listEl = document.createElement("ul");
    listEl.className = "poll-options-list";

    try {
      const opts = await Promise.all(post.parts.map(id => getItem(id)));
      opts.filter(Boolean).sort((a, b) => (b.score || 0) - (a.score || 0)).forEach(opt => {
        const li = document.createElement("li");
        li.className = "poll-option-item";
        const textSpan = document.createElement("span");
        textSpan.className = "poll-text";
        textSpan.textContent = opt.text || "[no text]";
        const scoreSpan = document.createElement("span");
        scoreSpan.className = "poll-score";
        scoreSpan.textContent = `${opt.score || 0} pts`;
        li.append(textSpan, scoreSpan);
        listEl.appendChild(li);
      });
      pollSection.appendChild(listEl);
      header.appendChild(pollSection);
    } catch (err) {
      console.error("Failed to load poll options", err);
    }
  }

  // Post text/content
  if (post.text) {
    const content = document.createElement("div");
    content.className = "drawer-content";
    content.textContent = post.text;
    header.appendChild(content);
  }

  // URL link if exists
  if (post.url) {
    const urlLink = document.createElement("a");
    urlLink.href = post.url;
    urlLink.target = "_blank";
    urlLink.className = "drawer-url-link";
    urlLink.textContent = "→ Open link";
    header.appendChild(urlLink);
  }

  bodyEl.appendChild(header);

  const kidIds = post.kids || [];

  if (kidIds.length === 0) {
    const noneEl = document.createElement("p");
    noneEl.className = "no-comments";
    noneEl.textContent = "No comments yet.";
    bodyEl.appendChild(noneEl);
    return;
  }

  let offset = 0;

  async function loadBatch() {
    setFooterStatus("Loading…");

    const batch = kidIds.slice(offset, offset + COMMENTS_PAGE_SIZE);
    offset += COMMENTS_PAGE_SIZE;

    try {
      const comments = await getComments(batch);
      comments.forEach(comment => bodyEl.appendChild(renderComment(comment, 0)));

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

// ── Render a single comment (replies load on demand) ──────

function renderComment(comment, depth) {
  const indent = Math.min(depth * 16, MAX_INDENT);

  const el = document.createElement("div");
  el.className = "comment";
  el.dataset.id = comment.id;
  el.style.marginLeft = `${indent}px`;

  const time = new Date(comment.time * 1000).toLocaleString();
  const replies = comment.kids || [];
  const hasReplies = replies.length > 0;

  const meta = document.createElement("div");
  meta.className = "comment-meta";
  const author = document.createElement("span");
  author.className = "comment-author";
  author.textContent = comment.by || "unknown";
  const timeEl = document.createElement("span");
  timeEl.className = "comment-time";
  timeEl.textContent = time;
  meta.append(author, timeEl);
  
  if (hasReplies) {
    const toggleBtn = document.createElement("button");
    toggleBtn.className = "toggle-replies";
    toggleBtn.textContent = `${replies.length} repl${replies.length === 1 ? "y" : "ies"}`;
    meta.appendChild(toggleBtn);
  }
  
  el.appendChild(meta);
  
  const textDiv = document.createElement("div");
  textDiv.className = "comment-text";
  textDiv.textContent = comment.text || "";
  el.appendChild(textDiv);
  
  const repliesContainer = document.createElement("div");
  repliesContainer.className = "replies-container";
  repliesContainer.style.display = "none";
  el.appendChild(repliesContainer);

  if (hasReplies) {
    const toggleBtn = meta.querySelector(".toggle-replies");
    let loaded = false;
    let open = false;

    toggleBtn.addEventListener("click", () => {
      if (!loaded) {
        replies.forEach(reply => repliesContainer.appendChild(renderComment(reply, depth + 1)));
        loaded = true;
        open = true;
        repliesContainer.style.display = "block";
        toggleBtn.textContent = "▲ Hide replies";
      } else {
        open = !open;
        repliesContainer.style.display = open ? "block" : "none";
        toggleBtn.textContent = open
          ? "▲ Hide replies"
          : `▼ ${replies.length} repl${replies.length === 1 ? "y" : "ies"}`;
      }
    });
  }

  return el;
}

// ── Footer helper ─────────────────────────────────────────

function setFooterStatus(text, isError = false) {
  footerEl.innerHTML = "";
  const p = document.createElement("p");
  p.className = `drawer-status${isError ? " error" : ""}`;
  p.textContent = text;
  footerEl.appendChild(p);
}