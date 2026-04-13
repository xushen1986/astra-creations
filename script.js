const projectGrid = document.getElementById("project-grid");

function createProjectCard(project) {
  const card = document.createElement("article");
  card.className = "project-card";

  const header = document.createElement("div");
  header.className = "project-header";

  const titleGroup = document.createElement("div");

  const title = document.createElement("h3");
  title.textContent = project.title;

  const tag = document.createElement("p");
  tag.className = "project-tag";
  tag.textContent = project.tag;

  titleGroup.append(title, tag);

  const summary = document.createElement("p");
  summary.className = "project-copy";
  summary.textContent = project.summary;

  header.appendChild(titleGroup);

  const embedWrap = document.createElement("div");
  embedWrap.className = "project-embed";
  embedWrap.innerHTML = project.embedHtml;

  const meta = document.createElement("p");
  meta.className = "project-meta";
  meta.textContent = "Shared Scratch projects only will display publicly for visitors.";

  card.append(header, summary, embedWrap, meta);
  return card;
}

function renderProjects() {
  if (!Array.isArray(scratchProjects) || scratchProjects.length === 0) {
    const emptyState = document.createElement("div");
    emptyState.className = "empty-state";
    emptyState.textContent =
      "No Scratch projects yet. Add one in projects.js and republish the page.";
    projectGrid.appendChild(emptyState);
    return;
  }

  scratchProjects.forEach((project) => {
    projectGrid.appendChild(createProjectCard(project));
  });
}

renderProjects();
