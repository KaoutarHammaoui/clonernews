import { openCommentsDrawer } from "./drawer.js";

export function createPostElement(post) {
  const article = document.createElement("article");
  article.className = "card";

  const titleContent = post.url
    ? `<a href="${post.url}" target="_blank" class="post-title-link">${post.title || "Untitled"}</a>`
    : post.title || "Untitled";

  article.innerHTML = `
    <div class="badge">${post.type}</div>

    <h2>${titleContent}</h2>

    <div class="meta">
      <span>${post.by || "unknown"}</span>
      <span>${new Date(post.time * 1000).toLocaleString()}</span>
    </div>

    ${post.text ? `<div class="text">${post.text}</div>` : ""}

    <button class="toggle-comments">
      Comments (${post.descendants || 0})
    </button>
  `;

  const button = article.querySelector(".toggle-comments");

  button.addEventListener("click", () => {
    openCommentsDrawer(post);
  });

  return article;
}