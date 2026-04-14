const STORAGE_KEY = "astraScratchProjects";
const GITHUB_TOKEN_KEY = "astraGithubToken";
const GITHUB_OWNER = "xushen1986";
const GITHUB_REPO = "astra-creations";
const GITHUB_BRANCH = "main";
const GITHUB_FILE_PATH = "projects.js";
const GITHUB_API_VERSION = "2022-11-28";
const projectGrid = document.getElementById("project-grid");
const modal = document.getElementById("project-modal");
const openModalButton = document.getElementById("open-modal-button");
const closeModalButton = document.getElementById("close-modal-button");
const cancelModalButton = document.getElementById("cancel-modal-button");
const projectForm = document.getElementById("project-form");
const formStatus = document.getElementById("form-status");
const githubTokenInput = document.getElementById("github-token");

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getStoredProjects() {
  try {
    const storedValue = localStorage.getItem(STORAGE_KEY);
    const parsedValue = storedValue ? JSON.parse(storedValue) : [];
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch (error) {
    return [];
  }
}

function saveStoredProjects(projects) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

function getAllProjects() {
  const storedProjects = getStoredProjects();
  const projectMap = new Map();

  storedProjects.forEach((project) => {
    projectMap.set(project.id, project);
  });

  scratchProjects.forEach((project) => {
    projectMap.set(project.id, project);
  });

  return Array.from(projectMap.values());
}

function getProjectUrl(projectId) {
  return `./project.html?id=${encodeURIComponent(projectId)}`;
}

function serializeProjects(projects) {
  const formattedProjects = JSON.stringify(projects, null, 2)
    .replace(/"([^"]+)":/g, "$1:")
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e");

  return `const scratchProjects = ${formattedProjects};\n`;
}

function getSavedGithubToken() {
  return localStorage.getItem(GITHUB_TOKEN_KEY) || "";
}

function saveGithubToken(token) {
  localStorage.setItem(GITHUB_TOKEN_KEY, token);
}

function encodeBase64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}

async function getRemoteProjectsFile(token) {
  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}?ref=${GITHUB_BRANCH}`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": GITHUB_API_VERSION
      }
    }
  );

  if (!response.ok) {
    throw new Error("GitHub could not open projects.js. Check your token and repository permissions.");
  }

  return response.json();
}

async function publishProjectsLibrary(projects, token, title) {
  const currentFile = await getRemoteProjectsFile(token);
  const content = serializeProjects(projects);
  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`,
    {
      method: "PUT",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": GITHUB_API_VERSION
      },
      body: JSON.stringify({
        message: `Add ${title} project`,
        content: encodeBase64(content),
        sha: currentFile.sha,
        branch: GITHUB_BRANCH
      })
    }
  );

  if (!response.ok) {
    throw new Error("GitHub could not publish the project live. Your token may need Contents write access.");
  }

  return response.json();
}

function normalizeEmbedCode(embedHtml) {
  const trimmedValue = embedHtml.trim();

  if (!trimmedValue.startsWith("<iframe") || !trimmedValue.includes("scratch.mit.edu/projects/")) {
    throw new Error("Please paste a valid Scratch iframe embed code.");
  }

  return trimmedValue;
}

function extractScratchProjectId(embedHtml) {
  const match = embedHtml.match(/scratch\.mit\.edu\/projects\/(\d+)\/embed/i);
  return match ? match[1] : null;
}

function createProjectCard(project) {
  const card = document.createElement("article");
  card.className = "project-card";

  const title = document.createElement("h3");
  title.textContent = project.title;

  const tag = document.createElement("p");
  tag.className = "project-tag";
  tag.textContent = project.tag;

  const summary = document.createElement("p");
  summary.className = "project-copy";
  summary.textContent = project.summary;

  const embedWrap = document.createElement("div");
  embedWrap.className = "project-embed";
  embedWrap.innerHTML = project.embedHtml;
  const iframe = embedWrap.querySelector("iframe");

  if (iframe) {
    iframe.removeAttribute("width");
    iframe.removeAttribute("height");
    iframe.setAttribute("loading", "lazy");
    iframe.setAttribute("title", project.title);
  }

  const actions = document.createElement("div");
  actions.className = "project-actions";

  const detailLink = document.createElement("a");
  detailLink.className = "button button-secondary";
  detailLink.href = getProjectUrl(project.id);
  detailLink.target = "_blank";
  detailLink.rel = "noreferrer";
  detailLink.textContent = "Open";

  actions.appendChild(detailLink);

  card.append(title, tag, summary, embedWrap, actions);
  return card;
}

function renderProjects() {
  projectGrid.textContent = "";

  const allProjects = getAllProjects();

  if (allProjects.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.textContent = "No projects yet. Use the add button to create Astra's first project page.";
    projectGrid.appendChild(emptyState);
    return;
  }

  allProjects.forEach((project) => {
    projectGrid.appendChild(createProjectCard(project));
  });
}

function openModal() {
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  formStatus.textContent = "";
  githubTokenInput.value = getSavedGithubToken();
  requestAnimationFrame(() => {
    document.getElementById("project-title").focus();
  });
}

function closeModal() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  projectForm.reset();
  formStatus.textContent = "";
}

async function handleProjectSubmit(event) {
  event.preventDefault();

  const formData = new FormData(projectForm);
  const title = String(formData.get("title") || "").trim();
  const summary = String(formData.get("summary") || "").trim();
  const tag = String(formData.get("tag") || "").trim();
  const rawEmbed = String(formData.get("embed") || "");
  const githubToken = String(formData.get("githubToken") || "").trim();

  try {
    if (!githubToken) {
      throw new Error("Paste your GitHub token to publish the project live.");
    }

    const embedHtml = normalizeEmbedCode(rawEmbed);
    const scratchId = extractScratchProjectId(embedHtml);
    const id = scratchId ? `scratch-${scratchId}` : `custom-${slugify(title)}`;

    const project = {
      id,
      title,
      summary,
      tag,
      embedHtml
    };

    const existingStoredProjects = getStoredProjects();
    const filteredProjects = existingStoredProjects.filter((entry) => entry.id !== id);
    filteredProjects.unshift(project);
    saveStoredProjects(filteredProjects);
    saveGithubToken(githubToken);

    const allProjects = getAllProjects();
    await publishProjectsLibrary(allProjects, githubToken, title);

    renderProjects();
    formStatus.innerHTML = `Project published live. <a href="${getProjectUrl(id)}">Open its dedicated page</a>.`;
    projectForm.reset();
    githubTokenInput.value = getSavedGithubToken();
  } catch (error) {
    formStatus.textContent = error.message;
  }
}

openModalButton.addEventListener("click", openModal);
closeModalButton.addEventListener("click", closeModal);
cancelModalButton.addEventListener("click", closeModal);
projectForm.addEventListener("submit", handleProjectSubmit);

modal.addEventListener("click", (event) => {
  const target = event.target;

  if (target instanceof HTMLElement && target.dataset.closeModal === "true") {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("is-open")) {
    closeModal();
  }
});

renderProjects();
