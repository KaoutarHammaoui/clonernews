import { openCommentsDrawer } from "./drawer.js";

export function createPostElement(post) {
  const article = document.createElement("article");
  article.className = "card";
  article.dataset.id = post.id;

  // badge
  const badge = document.createElement("div");
  badge.className = "badge";
  badge.textContent = post.type;
  article.appendChild(badge);

  // title
  if (post.title) {
    const title = document.createElement("h2");
    title.textContent = post.title;
    article.appendChild(title);
  }

  // meta (author + time)
  const meta = document.createElement("div");
  meta.className = "meta";

  const author = document.createElement("span");
  author.textContent = post.by || "unknown";

  const time = document.createElement("span");
  time.textContent = new Date(post.time * 1000).toLocaleString();

  meta.append(author, time);
  article.appendChild(meta);

  // Show button
  const button = document.createElement("button");
  button.className = "show-post";
  button.textContent = "Show";
  button.addEventListener("click", () => openCommentsDrawer(post));
  article.appendChild(button);

  return article;
}