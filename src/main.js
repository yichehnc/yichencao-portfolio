(function () {
  const projects = window.PORTFOLIO_PROJECTS || [];
  const comingSoon = window.PORTFOLIO_COMING_SOON || [];
  const background = window.PORTFOLIO_BACKGROUND || [];
  const app = document.querySelector("#app");
  const currentPath = window.location.pathname.replace(/\/index\.html$/, "").replace(/\/+$/, "");
  const slugMatch = currentPath.match(/\/(?:projects|Case-study)\/([^/]+)$/);

  function projectUrl(slug) {
    const fromProjectPage = currentPath.includes("/projects/") || currentPath.includes("/Case-study/");
    return fromProjectPage ? `../${slug}/` : `Case-study/${slug}/`;
  }

  function projectHref(project) {
    return project.externalUrl || projectUrl(project.slug);
  }

  function homeUrl() {
    return currentPath.includes("/projects/") || currentPath.includes("/Case-study/") ? "../../" : "./";
  }

  function shell(content) {
    return `
      <header class="site-header">
        <a class="brand" href="${homeUrl()}" aria-label="Yichen Cao home">
          <span>Yichen Cao</span>
          <small>Product Designer<br />based in Melbourne</small>
        </a>
        <nav class="nav">
          <a href="${homeUrl()}#case-studies">Case Studies</a>
          <a href="${homeUrl()}#background">Background</a>
          <a href="https://docs.google.com/" target="_blank" rel="noreferrer">Resume</a>
        </nav>
      </header>
      ${content}
      <footer class="footer">
        <a class="collab" href="mailto:yichenc2017@gmail.com">Let's<br />Collaborate</a>
        <div>
          <a href="${homeUrl()}">Yichen Cao</a>
          <p>© Yichen Cao 2024</p>
        </div>
      </footer>
    `;
  }

  function renderHome() {
    app.innerHTML = shell(`
      <main>
        <section class="hero">
          <div class="hero-copy">
            <p class="hello">Hello! I'm Yichen.</p>
            <h1>Tech-savvy Product Designer, crafting digital experiences that bridge creativity and function.</h1>
            <a class="primary-link" href="https://cal.com/" target="_blank" rel="noreferrer">Let's Connect</a>
          </div>
          <div class="hero-orbit" aria-hidden="true">
            <span>UX</span>
            <span>UI</span>
            <span>Code</span>
          </div>
        </section>
        <section id="case-studies" class="work-section section-shell" aria-labelledby="work-title">
          <div class="section-heading">
            <span>01</span>
            <h2 id="work-title">Projects</h2>
          </div>
          <div class="project-grid">
            ${projects
              .map(
                (project) => `
                  <article class="project-card" data-category="${project.category}">
                    <a href="${projectHref(project)}" aria-label="Open ${project.title}" ${
                  project.externalUrl ? 'target="_blank" rel="noreferrer"' : ""
                }>
                      ${
                        project.image
                          ? `<img src="${project.image}" alt="${project.title}" loading="lazy" />`
                          : `<div class="project-visual project-visual-${project.accent || "default"}" aria-hidden="true">
                              <span>${project.cardTitle}</span>
                            </div>`
                      }
                      <div class="project-card-body">
                        <h3>${project.cardTitle}</h3>
                        <p>${project.category}</p>
                      </div>
                    </a>
                  </article>
                `
              )
              .join("")}
            ${comingSoon
              .map(
                (item) => `
                  <article class="project-card is-muted">
                    <img src="${item.image}" alt="" loading="lazy" />
                    <div class="project-card-body">
                      <h3>${item.title}</h3>
                      <p>${item.category}</p>
                    </div>
                  </article>
                `
              )
              .join("")}
          </div>
        </section>
        <section id="background" class="background-section section-shell" aria-labelledby="background-title">
          <div class="section-heading">
            <span>02</span>
            <h2 id="background-title">Background</h2>
          </div>
          <div class="timeline">
            ${background
              .map(
                (item) => `
                  <article class="timeline-item">
                    <p>${item.period}</p>
                    <div>
                      <h3>${item.title}</h3>
                      <p>${item.body}</p>
                    </div>
                  </article>
                `
              )
              .join("")}
          </div>
        </section>
      </main>
    `);
  }

  function renderProject(slug) {
    const project = projects.find((item) => item.slug === slug);
    if (!project) {
      app.innerHTML = shell(`
        <main class="not-found">
          <h1>Project not found</h1>
          <a class="text-link" href="${homeUrl()}">Back</a>
        </main>
      `);
      return;
    }

    document.title = `${project.title} - Yichen Cao`;
    app.innerHTML = shell(`
      <main class="case-study">
        <a class="back-link" href="${homeUrl()}#case-studies">Back</a>
        <section class="case-hero">
          <div class="case-title">
            <h1>${project.title}</h1>
            <p>${project.summary}</p>
            ${
              project.actionUrl
                ? `<a class="primary-link" href="${project.actionUrl}" target="_blank" rel="noreferrer">${project.actionLabel}</a>`
                : ""
            }
          </div>
          <dl class="meta-list">
            <div>
              <dt>Date</dt>
              <dd>${project.date}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>${project.roles}</dd>
            </div>
            <div>
              <dt>Context</dt>
              <dd>${project.client}</dd>
            </div>
          </dl>
          <img class="case-image hero-image" src="${project.image}" alt="${project.title}" />
        </section>
        <div class="case-sections">
          ${project.sections
            .map(
              (section, index) => `
                <section class="case-section">
                  <span class="section-number">${String(index + 1).padStart(2, "0")}</span>
                  <div class="case-section-copy">
                    <h2>${section.title}</h2>
                    <div class="body-copy">${section.body}</div>
                  </div>
                  ${section.image ? `<img class="case-image" src="${section.image}" alt="${section.title}" loading="lazy" />` : ""}
                </section>
              `
            )
            .join("")}
        </div>
      </main>
    `);
  }

  if (slugMatch) {
    renderProject(slugMatch[1]);
  } else {
    renderHome();
  }
})();
