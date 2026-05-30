const CURRENT_AUTHOR = "AmirHossein Yavari";

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeAssetPath(path) {
  if (!path) return "";
  return path.startsWith("./") ? path.slice(2) : path;
}

function parseAuthors(authors) {
  if (!Array.isArray(authors)) return "";

  return authors
    .map((author) => {
      const name = escapeHTML(author.name);
      const renderedName = author.name === CURRENT_AUTHOR ? `<strong>${name}</strong>` : name;

      if (author.url) {
        return `<a href="${escapeHTML(author.url)}">${renderedName}</a>`;
      }

      return renderedName;
    })
    .join(", ");
}

function renderPublicationImage(pub) {
  if (!pub.image) return "";

  const imageUrl = normalizeAssetPath(pub.image);

  return `
    <div class="pub-image">
      <img src="${escapeHTML(imageUrl)}" alt="Thumbnail for ${escapeHTML(pub.title)}" loading="lazy">
    </div>
  `;
}

function renderAwards(pub) {
  if (!Array.isArray(pub.awards) || pub.awards.length === 0) return "";

  return pub.awards
    .map((award) => `<span class="award-badge">${escapeHTML(award.text)}</span>`)
    .join("");
}

function renderPublicationLinks(pub) {
  const links = [];

  if (pub.pdf) {
    links.push(`<a class="pub-link" href="${escapeHTML(pub.pdf)}">PDF</a>`);
  }

  if (pub.page) {
    links.push(`<a class="pub-link" href="${escapeHTML(pub.page)}">Project</a>`);
  }

  if (pub.code) {
    links.push(`<a class="pub-link" href="${escapeHTML(pub.code)}">Code</a>`);
  }

  if (pub.doi) {
    links.push(`<a class="pub-link" href="${escapeHTML(pub.doi)}">DOI</a>`);
  }

  if (links.length === 0) return "";

  return `<div class="pub-links">${links.join("")}</div>`;
}

function renderPublication(pub) {
  const conferenceShort = pub.conference_short || "";
  const badgeClass = conferenceShort.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "publication";
  const title = escapeHTML(pub.title);

  const titleHTML = pub.pdf
    ? `<a href="${escapeHTML(pub.pdf)}">${title}</a>`
    : title;

  return `
    <article class="publication">
      ${renderPublicationImage(pub)}

      <div class="pub-content">
        <h3 class="pub-title">${titleHTML}</h3>

        <p class="pub-authors">
          ${parseAuthors(pub.authors)}
        </p>

        <div class="pub-meta">
          ${
            conferenceShort
              ? `<span class="pub-badge ${escapeHTML(badgeClass)}">${escapeHTML(conferenceShort)}</span>`
              : ""
          }
          ${pub.conference ? `<span>${escapeHTML(pub.conference)}</span>` : ""}
          ${renderAwards(pub)}
        </div>

        ${renderPublicationLinks(pub)}
      </div>
    </article>
  `;
}

async function loadPublications() {
  const container = document.getElementById("publications-container");
  if (!container) return;

  try {
    const response = await fetch("publications.yml", { cache: "no-cache" });

    if (!response.ok) {
      throw new Error(`Failed to load publications.yml: ${response.status}`);
    }

    const yamlText = await response.text();
    const parsed = jsyaml.load(yamlText);
    const publications = Array.isArray(parsed?.main) ? parsed.main : [];

    if (publications.length === 0) {
      container.innerHTML = `<p class="muted">No publications listed yet.</p>`;
      return;
    }

    container.innerHTML = publications.map(renderPublication).join("");
  } catch (error) {
    console.error(error);
    container.innerHTML = `
      <p class="muted">
        Error loading publications. Please check <code>publications.yml</code>.
      </p>
    `;
  }
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const target = document.querySelector(anchor.getAttribute("href"));
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function initThemeToggle() {
  const button = document.getElementById("theme-toggle");
  if (!button) return;

  const storedTheme = localStorage.getItem("theme");
  if (storedTheme === "light" || storedTheme === "dark") {
    document.documentElement.dataset.theme = storedTheme;
  }

  function currentTheme() {
    const explicit = document.documentElement.dataset.theme;

    if (explicit === "light" || explicit === "dark") {
      return explicit;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function updateButtonLabel() {
    button.textContent = currentTheme() === "dark" ? "light" : "dark";
  }

  button.addEventListener("click", () => {
    const nextTheme = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("theme", nextTheme);
    updateButtonLabel();
  });

  updateButtonLabel();
}

window.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  initSmoothScroll();
  loadPublications();
});