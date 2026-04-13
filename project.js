const PROJECT_STORAGE_KEY = "astraScratchProjects";
const projectDetailRoot = document.getElementById("project-detail-root");

function getBaseProjects() {
  return Array.isArray(scratchProjects) ? scratchProjects : [];
}

function getStoredProjects() {
  try {
    const storedValue = localStorage.getItem(PROJECT_STORAGE_KEY);
    const parsedValue = storedValue ? JSON.parse(storedValue) : [];
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch (error) {
    return [];
  }
}

function getAllProjects() {
  return [...getBaseProjects(), ...getStoredProjects()];
}

function getProjectIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function renderMissingState() {
  const section = document.createElement("section");
  section.className = "detail-card";

  const label = document.createElement("p");
  label.className = "section-label";
  label.textContent = "Project Not Found";

  const title = document.createElement("h1");
  title.textContent = "This Astra page is not available on this device.";

  const copy = document.createElement("p");
  copy.className = "hero-copy";
  copy.textContent =
    "Projects added through the popup are stored in this browser, so this link only works where the project was created unless you add it to the published project list.";

  const link = document.createElement("a");
  link.className = "button button-primary";
  link.href = "./index.html";
  link.textContent = "Back to Astra's gallery";

  section.append(label, title, copy, link);
  projectDetailRoot.appendChild(section);
}

function renderProject(project) {
  document.title = `${project.title} | Astra's Work`;

  const section = document.createElement("section");
  section.className = "detail-card";

  const label = document.createElement("p");
  label.className = "section-label";
  label.textContent = project.tag;

  const title = document.createElement("h1");
  title.className = "detail-title";
  title.textContent = project.title;

  const copy = document.createElement("p");
  copy.className = "hero-copy";
  copy.textContent = project.summary;

  const actions = document.createElement("div");
  actions.className = "hero-actions";

  const homeLink = document.createElement("a");
  homeLink.className = "button button-secondary";
  homeLink.href = "./index.html";
  homeLink.textContent = "Back to gallery";

  const scratchLink = document.createElement("a");
  scratchLink.className = "button button-primary";
  scratchLink.href = project.embedHtml.match(/src="([^"]+)"/i)?.[1]?.replace("/embed", "") || "#";
  scratchLink.target = "_blank";
  scratchLink.rel = "noreferrer";
  scratchLink.textContent = "Open on Scratch";

  actions.append(homeLink, scratchLink);

  const embedWrap = document.createElement("div");
  embedWrap.className = "project-embed detail-embed";
  embedWrap.innerHTML = project.embedHtml;
  const iframe = embedWrap.querySelector("iframe");

  if (iframe) {
    iframe.removeAttribute("width");
    iframe.removeAttribute("height");
    iframe.setAttribute("title", project.title);
  }

  section.append(label, title, copy, actions, embedWrap);
  projectDetailRoot.appendChild(section);
}

function initProjectDetailPage() {
  const projectId = getProjectIdFromUrl();
  const project = getAllProjects().find((entry) => entry.id === projectId);

  if (!project) {
    renderMissingState();
    return;
  }

  renderProject(project);
}

initProjectDetailPage();
