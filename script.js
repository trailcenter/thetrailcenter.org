
document.addEventListener("DOMContentLoaded", function () {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const toggle = document.querySelector(".menu-toggle");
  const navLinks = document.getElementById("nav-links");
  if (toggle && navLinks) {
    toggle.addEventListener("click", function () {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      navLinks.classList.toggle("open");
    });
  }

  document.querySelectorAll(".dropdown-toggle").forEach(function(button) {
    button.addEventListener("click", function() {
      const dropdown = button.closest(".dropdown");
      if (dropdown) dropdown.classList.toggle("open");
    });
  });

  const form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      const to = document.getElementById("inquiry").value;
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const organization = document.getElementById("organization").value.trim();
      const inquiryLabel = document.getElementById("inquiry").selectedOptions[0].text;
      const message = document.getElementById("message").value.trim();

      const subject = encodeURIComponent("TRAIL Center Inquiry: " + inquiryLabel);
      const body = encodeURIComponent(
        "Name: " + name + "\n" +
        "Email: " + email + "\n" +
        "Organization: " + organization + "\n" +
        "Inquiry Type: " + inquiryLabel + "\n\n" +
        "Message:\n" + message
      );

      window.location.href = "mailto:" + to + "?subject=" + subject + "&body=" + body;
    });
  }
});


// Blog / Insights system
function formatPostDate(dateText) {
  return dateText || "Undated";
}

function escapeHTML(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function getPosts() {
  const response = await fetch("posts.json", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Could not load posts.json");
  }
  return await response.json();
}

async function loadInsightsPosts() {
  const list = document.getElementById("insights-list");
  if (!list) return;

  try {
    const posts = await getPosts();

    if (!posts.length) {
      list.innerHTML = `
        <article class="insight-card">
          <div class="insight-date">Soon</div>
          <div>
            <h2>No posts yet</h2>
            <p>New TRAIL Center Insights will be posted here soon.</p>
          </div>
        </article>
      `;
      return;
    }

    list.innerHTML = posts.map((post) => `
      <article class="insight-card">
        <div class="insight-date">${escapeHTML(formatPostDate(post.date))}</div>
        <div>
          <h2>${escapeHTML(post.title)}</h2>
          <p class="insight-meta">${escapeHTML(post.category)} • ${escapeHTML(post.author)}</p>
          <p>${escapeHTML(post.excerpt)}</p>
          <a class="text-link" href="post.html?id=${encodeURIComponent(post.id)}">Read full post</a>
        </div>
      </article>
    `).join("");
  } catch (error) {
    list.innerHTML = `
      <article class="insight-card">
        <div class="insight-date">Error</div>
        <div>
          <h2>Posts could not be loaded</h2>
          <p>Please check that posts.json is uploaded to GitHub and formatted correctly.</p>
        </div>
      </article>
    `;
  }
}

async function loadSinglePost() {
  const title = document.getElementById("post-title");
  const meta = document.getElementById("post-meta");
  const content = document.getElementById("post-content");
  if (!title || !meta || !content) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  try {
    const posts = await getPosts();
    const post = posts.find((item) => item.id === id);

    if (!post) {
      title.textContent = "Post Not Found";
      meta.textContent = "The requested Insight post could not be found.";
      content.innerHTML = `
        <div class="article-placeholder">
          <p>The post link may be incorrect, or the post may have been removed from posts.json.</p>
          <p><a class="text-link" href="insights.html">Return to Insights</a></p>
        </div>
      `;
      return;
    }

    document.title = `${post.title} | TRAIL Center`;
    title.textContent = post.title;
    meta.textContent = `${post.category} • ${post.author} • ${post.date}`;

    const paragraphs = Array.isArray(post.content) ? post.content : [post.content];
    content.innerHTML = `
      <p class="insight-meta">${escapeHTML(post.category)} • ${escapeHTML(post.author)} • ${escapeHTML(post.date)}</p>
      ${paragraphs.map((paragraph) => `<p>${escapeHTML(paragraph)}</p>`).join("")}
    `;
  } catch (error) {
    title.textContent = "Post Could Not Load";
    meta.textContent = "There was a problem loading this Insight post.";
    content.innerHTML = `
      <div class="article-placeholder">
        <p>Please check that posts.json is uploaded to GitHub and formatted correctly.</p>
      </div>
    `;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  loadInsightsPosts();
  loadSinglePost();
});
