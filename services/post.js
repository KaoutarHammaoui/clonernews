export function createPostElement(post) {
    const article =
      document.createElement("article");
  
    article.className = "card";
  
    const badge =post.type;
  
    article.innerHTML = `
      <div class="badge">
        ${badge}
      </div>
  
      <h2>${post.title || "Untitled"}</h2>
  
      <div class="meta">
        <span>${post.by || "unknown"}</span>
        <span>
          ${new Date(
            post.time * 1000
          ).toLocaleString()}
        </span>
      </div>
  
      ${
        post.url
          ? `
          <a
            href="${post.url}"
            target="_blank"
          >
            Open Link
          </a>
        `
          : ""
      }
  
      ${
        post.text
          ? `
          <div class="text">
            ${post.text}
          </div>
        `
          : ""
      }
  
      <button class="toggle-comments">
        Comments (${post.descendants || 0})
      </button>
  
      <div class="comments"></div>
    `;
  
    const button =
      article.querySelector(
        ".toggle-comments"
      );
  
    const commentsContainer =
      article.querySelector(".comments");
  
    let loaded = false;
  
    button.addEventListener(
      "click",
      async () => {
        //todo: comment loading
        //todo: comment loading
        //todo: comment loading
        //todo: comment loading
        //todo: comment loading
        //todo: comment loading
        console.log("todo: comment loading");
      }
    );
  
    return article;
  }