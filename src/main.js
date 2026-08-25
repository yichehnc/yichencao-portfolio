(function () {
  const projects = window.PORTFOLIO_PROJECTS || [];
  const comingSoon = window.PORTFOLIO_COMING_SOON || [];
  const tools = window.PORTFOLIO_TOOLS || [];
  const background = window.PORTFOLIO_BACKGROUND || [];
  const app = document.querySelector("#app");
  const currentPath = window.location.pathname.replace(/\/index\.html$/, "").replace(/\/+$/, "");
  const currentPathLower = currentPath.toLowerCase();
  const isFilePreview = window.location.protocol === "file:";
  const slugMatch = currentPath.match(/\/(?:projects|case-study)\/([^/]+)$/i);
  const isProjectPage = currentPathLower.includes("/projects/") || currentPathLower.includes("/case-study/");
  const isBackgroundPage = /\/background$/i.test(currentPath);

  function projectUrl(slug) {
    if (!isFilePreview) return `/projects/${slug}/`;
    if (isProjectPage) return `../${slug}/index.html`;
    if (isBackgroundPage) return `../projects/${slug}/index.html`;
    return `projects/${slug}/index.html`;
  }

  function projectHref(project) {
    if (project.internalPage) return projectUrl(project.slug);
    return project.externalUrl || projectUrl(project.slug);
  }

  function homeUrl() {
    if (!isFilePreview) return "/";
    if (isProjectPage) return "../../";
    if (isBackgroundPage) return "../";
    return "./";
  }

  function homeHref(anchor = "") {
    if (!isFilePreview) return `/${anchor}`;
    if (isProjectPage) return `../../index.html${anchor}`;
    if (isBackgroundPage) return `../index.html${anchor}`;
    return `./index.html${anchor}`;
  }

  function backgroundUrl() {
    if (!isFilePreview) return "/background/";
    if (isProjectPage) return "../../background/index.html";
    if (isBackgroundPage) return "./index.html";
    return "background/index.html";
  }

  function assetUrl(path) {
    if (/^https?:\/\//.test(path)) return path;
    return `${homeUrl()}${path.replace(/^\//, "")}`;
  }

  function splitMetricValue(value) {
    const text = String(value);
    const match = text.match(/^([^0-9]*)([\d,]+)(.*)$/);
    if (!match) return null;
    return {
      prefix: match[1],
      number: Number(match[2].replace(/,/g, "")),
      suffix: match[3],
    };
  }

  function animateProofNumbers() {
    const metrics = Array.from(document.querySelectorAll("[data-count-target]"));
    if (!metrics.length) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    metrics.forEach((metric) => {
      const target = Number(metric.dataset.countTarget);
      const prefix = metric.dataset.countPrefix || "";
      const suffix = metric.dataset.countSuffix || "";
      const formatter = new Intl.NumberFormat("en-US");

      if (!Number.isFinite(target) || reduceMotion) {
        metric.textContent = `${prefix}${formatter.format(target)}${suffix}`;
        return;
      }

      const duration = 680;
      const start = performance.now();

      function tick(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        metric.textContent = `${prefix}${formatter.format(Math.round(target * eased))}${suffix}`;
        if (progress < 1) window.requestAnimationFrame(tick);
      }

      metric.textContent = `${prefix}0${suffix}`;
      window.requestAnimationFrame(tick);
    });
  }

  function renderToolCarousel() {
    if (!tools.length) return "";
    const repeatedTools = [...tools, ...tools];

    return `
      <div class="skill-carousel" aria-label="Software skills">
        <div class="skill-marquee">
          <div class="skill-track">
            ${repeatedTools
              .map(
                (tool) => `
                  <div class="skill-chip" title="${tool.name}">
                    <img class="skill-icon" src="${tool.icon}" alt="${tool.name}" loading="lazy" />
                  </div>
                `
              )
              .join("")}
          </div>
        </div>
      </div>
    `;
  }

  function shell(content) {
    return `
      <div class="interactive-grid-bg" aria-hidden="true"></div>
      <header class="site-header">
        <a class="brand" href="${homeHref()}" aria-label="Yichen Cao home">
          <span>Yichen Cao</span>
          <small>Product Designer<br />based in Melbourne</small>
        </a>
        <nav class="nav">
          <a href="${homeHref("#case-studies")}">Projects</a>
          <a href="${backgroundUrl()}">Background</a>
          <a href="https://docs.google.com/" target="_blank" rel="noreferrer">Resume</a>
        </nav>
      </header>
      ${content}
      <footer class="footer">
        <a class="collab" href="mailto:yichenc2017@gmail.com">Let's<br />Collaborate</a>
        <div>
          <a href="${homeHref()}">Yichen Cao</a>
          <p>© Yichen Cao 2026</p>
        </div>
      </footer>
    `;
  }

  function attachInteractiveGrid() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;

    function setPosition(event) {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty("--grid-x", `${event.clientX}px`);
        document.documentElement.style.setProperty("--grid-y", `${event.clientY}px`);
        document.body.classList.add("is-grid-hot");
      });
    }

    document.addEventListener("pointermove", setPosition, { passive: true });
    document.addEventListener("pointerleave", () => document.body.classList.remove("is-grid-hot"));
    if (reduceMotion) document.body.classList.add("reduce-grid-motion");
  }

  function renderHome() {
    const projectItems = [...projects, ...comingSoon.map((item) => ({ ...item, muted: true }))];
    const projectFilters = ["Vibe Coding", "UX", "UI", "Architecture", "Motion", "Graphic Design"];
    const filterTerms = {
      "Vibe Coding": ["vibe coding", "code", "coding", "interactive", "web app"],
      UX: ["ux", "user", "research", "product design", "product designer"],
      UI: ["ui", "interface", "branding", "visual", "prototype"],
      Architecture: ["architecture", "architectural", "spatial"],
      Motion: ["motion", "animation", "interactive", "kinetic"],
      "Graphic Design": ["graphic design", "publication", "editorial", "visualisation"],
    };
    let activeFilter = "";

    function aspectHeightWeight(aspect) {
      const [wide, tall] = String(aspect || "1 / 1")
        .split("/")
        .map((part) => Number(part.trim()));
      return wide > 0 && tall > 0 ? tall / wide : 1;
    }

    function columnCount() {
      if (window.matchMedia("(max-width: 679px)").matches) return 1;
      if (window.matchMedia("(max-width: 1023px)").matches) return 2;
      return 3;
    }

    function searchableText(project) {
      return [
        project.title,
        project.cardTitle,
        project.category,
        project.roles,
        project.client,
        project.summary,
        ...(project.sections || []).flatMap((section) => [section.title, section.body]),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
    }

    function matchesFilter(project) {
      if (!activeFilter) return true;
      if (Array.isArray(project.filters)) return project.filters.includes(activeFilter);
      const text = searchableText(project);
      return filterTerms[activeFilter].some((term) => {
        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i").test(text);
      });
    }

    function projectCard(project) {
      return `
        <article class="project-card${project.muted ? " is-muted" : ""}" data-category="${project.category}">
          ${
            project.muted
              ? `
                <div class="project-card-inner">
                  <img src="${project.image}" alt="" loading="lazy" style="--project-aspect: ${project.aspect || "1 / 1"}" />
                  <div class="project-card-body">
                    <h3>${project.title}</h3>
                    <p>${project.category}</p>
                    ${project.cardBio ? `<p class="project-card-bio">${project.cardBio}</p>` : ""}
                  </div>
                </div>
              `
              : `
                <a href="${projectHref(project)}" aria-label="Open ${project.title}" ${
                  project.externalUrl && !project.internalPage ? 'target="_blank" rel="noreferrer"' : ""
                }>
                  ${
                    project.image
                      ? `<img src="${project.image}" alt="${project.title}" loading="lazy" style="--project-aspect: ${
                          project.aspect || "1 / 1"
                        }" />`
                      : `<div class="project-visual project-visual-${project.accent || "default"}" style="--project-aspect: ${
                          project.aspect || "1 / 1"
                        }" aria-hidden="true">
                            <span>${project.cardTitle}</span>
                          </div>`
                  }
                  <div class="project-card-body">
                    <h3>${project.cardTitle}</h3>
                    <p>${project.category}</p>
                    ${project.cardBio ? `<p class="project-card-bio">${project.cardBio}</p>` : ""}
                  </div>
                </a>
              `
          }
        </article>
      `;
    }

    function renderMasonry() {
      const count = columnCount();
      const columns = Array.from({ length: count }, () => ({ height: 0, cards: [] }));
      const visibleItems = projectItems.filter(matchesFilter);

      visibleItems.forEach((project) => {
        const shortest = columns.reduce((best, column) => (column.height < best.height ? column : best), columns[0]);
        shortest.cards.push(project);
        shortest.height += aspectHeightWeight(project.aspect) + 0.28;
      });

      const grid = document.querySelector(".project-grid");
      if (!grid) return;
      grid.innerHTML = visibleItems.length
        ? columns.map((column) => `<div class="project-column">${column.cards.map(projectCard).join("")}</div>`).join("")
        : `<p class="empty-filter">No projects match ${activeFilter} yet.</p>`;
      grid.dataset.columns = String(count);
    }

    function updateFilterButtons() {
      document.querySelectorAll(".filter-pill").forEach((button) => {
        const isActive = button.dataset.filter === activeFilter;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });
    }

    app.innerHTML = shell(`
      <main>
        <section class="hero">
          <div class="hero-copy">
            <p class="hello">Hello! I'm Yichen.</p>
            <h1>Tech-savvy Product Designer, crafting digital experiences that bridge creativity and function.</h1>
            <a class="primary-link" href="https://cal.com/" target="_blank" rel="noreferrer">Let's Connect</a>
            ${renderToolCarousel()}
          </div>
        </section>
        <section id="case-studies" class="work-section section-shell" aria-labelledby="work-title">
          <div class="section-heading">
            <span>01</span>
            <h2 id="work-title">Projects</h2>
          </div>
          <div class="project-filter-tabs" aria-label="Project filters">
            ${projectFilters
              .map(
                (filter) => `
                  <button class="filter-pill" type="button" data-filter="${filter}" aria-pressed="false">${filter}</button>
                `
              )
              .join("")}
          </div>
          <div class="project-grid" aria-live="polite"></div>
        </section>
      </main>
    `);

    renderMasonry();
    updateFilterButtons();

    document.querySelectorAll(".filter-pill").forEach((button) => {
      button.addEventListener("click", () => {
        activeFilter = activeFilter === button.dataset.filter ? "" : button.dataset.filter;
        updateFilterButtons();
        renderMasonry();
        document.querySelector("#case-studies")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    let resizeFrame = 0;
    window.addEventListener("resize", () => {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(renderMasonry);
    });
  }

  function renderBackground() {
    document.title = "Background - Yichen Cao";
    app.innerHTML = shell(`
      <main class="background-page">
        <section id="background" class="background-section section-shell" aria-labelledby="background-title">
          <div class="section-heading">
            <span>01</span>
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
          <a class="text-link" href="${homeHref()}">Back</a>
        </main>
      `);
      return;
    }

    document.title = `${project.title} - Yichen Cao`;
    const metaItems =
      project.meta || [
        { label: "Date", value: project.date },
        { label: "Role", value: project.roles },
        { label: "Context", value: project.client },
      ];

    app.innerHTML = shell(`
      <main class="case-study${project.accent ? ` case-study-${project.accent}` : ""}">
        <a class="back-link" href="${homeHref("#case-studies")}">Back to projects</a>
        <section class="case-hero">
          <div class="case-title">
            <span class="case-eyebrow">${project.category}</span>
            <h1>${project.title}</h1>
            <p>${project.subtitle || project.summary}</p>
            ${
              project.actionUrl
                ? `<a class="primary-link" href="${project.actionUrl}" target="_blank" rel="noreferrer">${project.actionLabel}</a>`
                : ""
            }
          </div>
          <dl class="meta-list">
            ${metaItems
              .map(
                (item) => `
                  <div>
                    <dt>${item.label}</dt>
                    <dd>${item.value}</dd>
                  </div>
                `
              )
              .join("")}
          </dl>
          ${
            project.image
              ? `<img class="case-image hero-image" src="${project.image}" alt="${project.title}" />`
              : `<div class="case-image hero-image project-visual project-visual-${project.accent || "default"}" aria-hidden="true">
                  <span>${project.cardTitle}</span>
                </div>`
          }
        </section>
        ${
          project.proof
            ? `<section class="case-proof-band" aria-label="Project proof">
                <h2>The proof.</h2>
                <div class="case-proof-stats">
                  ${project.proof
                    .map(
                      (item) => {
                        const metric = splitMetricValue(item.value);
                        return `
                          <div>
                            <strong${
                              metric
                                ? ` data-count-target="${metric.number}" data-count-prefix="${metric.prefix}" data-count-suffix="${metric.suffix}"`
                                : ""
                            }>${item.value}</strong>
                            <span>${item.label}</span>
                          </div>
                        `;
                      }
                    )
                    .join("")}
                </div>
              </section>`
            : ""
        }
        <div class="case-sections">
          ${project.sections
            .map(
              (section, index) => `
                <section class="case-section${section.variant ? ` case-section-${section.variant}` : ""}">
                  <span class="section-number">${String(index + 1).padStart(2, "0")}</span>
                  <div class="case-section-copy">
                    ${section.eyebrow ? `<p class="case-section-eyebrow">${section.eyebrow}</p>` : ""}
                    <h2>${section.title}</h2>
                    <div class="body-copy">
                      ${
                        section.journey
                          ? `<ol>
                              ${section.journey
                                .map(
                                  (item) => `
                                    <li>
                                      <div>
                                        <strong>${item.title}</strong>
                                        <span>${item.body}</span>
                                        ${
                                          item.evidence
                                            ? `<div class="case-gallery">
                                                ${item.evidence
                                                  .map(
                                                    (evidence) => `
                                                      <figure>
                                                        <img src="${assetUrl(evidence.src)}" alt="${evidence.alt}" loading="lazy" />
                                                        <figcaption>${evidence.caption}</figcaption>
                                                      </figure>
                                                    `
                                                  )
                                                  .join("")}
                                              </div>`
                                            : ""
                                        }
                                      </div>
                                    </li>
                                  `
                                )
                                .join("")}
                            </ol>`
                          : section.body
                      }
                    </div>
                    ${
                      section.gallery
                        ? `<div class="case-gallery">
                            ${section.gallery
                              .map(
                                (item) => `
                                  <figure>
                                    <img src="${assetUrl(item.src)}" alt="${item.alt}" loading="lazy" />
                                    <figcaption>${item.caption}</figcaption>
                                  </figure>
                                `
                              )
                              .join("")}
                          </div>`
                        : ""
                    }
                  </div>
                  ${section.image ? `<img class="case-image" src="${section.image}" alt="${section.title}" loading="lazy" />` : ""}
                </section>
              `
            )
            .join("")}
        </div>
      </main>
    `);

    animateProofNumbers();
  }

  if (slugMatch) {
    renderProject(slugMatch[1]);
  } else if (isBackgroundPage) {
    renderBackground();
  } else {
    renderHome();
  }

  attachInteractiveGrid();
})();
