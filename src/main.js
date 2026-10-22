(function () {
  const projects = window.PORTFOLIO_PROJECTS || [];
  const comingSoon = window.PORTFOLIO_COMING_SOON || [];
  const tools = window.PORTFOLIO_TOOLS || [];
  const background = window.PORTFOLIO_BACKGROUND || [];
  const profile = window.PORTFOLIO_PROFILE || {};
  const app = document.querySelector("#app");
  const currentPath = window.location.pathname.replace(/\/index\.html$/, "").replace(/\/+$/, "");
  const currentPathLower = currentPath.toLowerCase();
  const isFilePreview = window.location.protocol === "file:";
  const slugMatch = currentPath.match(/\/(?:projects|case-study)\/([^/]+)$/i);
  const isProjectPage = currentPathLower.includes("/projects/") || currentPathLower.includes("/case-study/");
  const isBackgroundPage = /\/background$/i.test(currentPath);
  const isResumePage = /\/resume$/i.test(currentPath);

  function projectUrl(slug) {
    if (!isFilePreview) return `/projects/${slug}/`;
    if (isProjectPage) return `../${slug}/index.html`;
    if (isBackgroundPage || isResumePage) return `../projects/${slug}/index.html`;
    return `projects/${slug}/index.html`;
  }

  function projectHref(project) {
    if (project.internalPage) return projectUrl(project.slug);
    return project.externalUrl || projectUrl(project.slug);
  }

  function homeUrl() {
    if (!isFilePreview) return "/";
    if (isProjectPage) return "../../";
    if (isBackgroundPage || isResumePage) return "../";
    return "./";
  }

  function homeHref(anchor = "") {
    if (!isFilePreview) return `/${anchor}`;
    if (isProjectPage) return `../../index.html${anchor}`;
    if (isBackgroundPage || isResumePage) return `../index.html${anchor}`;
    return `./index.html${anchor}`;
  }

  function backgroundUrl() {
    if (!isFilePreview) return "/background/";
    if (isProjectPage) return "../../background/index.html";
    if (isBackgroundPage) return "./index.html";
    if (isResumePage) return "../background/index.html";
    return "background/index.html";
  }

  function resumeUrl() {
    if (!isFilePreview) return "/resume/";
    if (isProjectPage) return "../../resume/index.html";
    if (isBackgroundPage) return "../resume/index.html";
    if (isResumePage) return "./index.html";
    return "resume/index.html";
  }

  function assetUrl(path) {
    if (/^https?:\/\//.test(path)) return path;
    return `${homeUrl()}${path.replace(/^\//, "")}`;
  }

  function setPageContext(page) {
    document.body.classList.remove("home-page", "project-page", "background-page", "resume-page");
    document.body.classList.add(`${page}-page`);
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
          <a href="${resumeUrl()}">About Me</a>
        </nav>
      </header>
      ${content}
      <footer class="footer">
        <p class="footer-invitation">Good things start with a conversation.</p>
        <a class="footer-art-link" href="mailto:yichenc2017@gmail.com" aria-label="Let's collaborate — email Yichen Cao">
          <svg class="footer-wordmark" viewBox="0 0 1200 360" aria-hidden="true" focusable="false">
            <defs>
              <filter id="footer-pencil" x="-5%" y="-10%" width="110%" height="120%">
                <feTurbulence type="fractalNoise" baseFrequency="0.025" numOctaves="2" seed="8" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.8" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>
            <g class="footer-letters" filter="url(#footer-pencil)">
              ${[..."YICHENCAO"].map((letter, index) => {
                const x = [78, 205, 332, 459, 586, 713, 863, 990, 1117][index];
                const angle = [-7, 4, -5, 3, -4, 5, -6, 4, -3][index];
                return `<text x="${x}" y="246" text-anchor="middle" textLength="${letter === "I" ? 78 : 112}" lengthAdjust="spacingAndGlyphs" ${letter === "I" ? 'style="font-family: Georgia, serif"' : ""} transform="rotate(${angle} ${x} 220)">${letter}</text>`;
              }).join("")}
            </g>
            <g class="footer-doodles" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M24 263 Q4 268 30 275 M41 278 Q81 284 119 274 M145 269 Q165 261 184 267 M207 280 Q254 287 284 273 M302 268 Q330 278 366 270 M397 279 Q437 289 477 276 M506 271 Q544 281 578 270 M602 280 Q647 286 681 274 M703 274 Q736 282 765 270 M812 275 Q855 285 901 273 M929 277 Q978 286 1021 275 M1053 274 Q1093 285 1131 272 M1150 263 Q1195 267 1170 277" />
              <path d="M43 287 Q85 293 107 285 M313 285 Q348 290 371 281 M520 287 Q553 292 577 283 M825 290 Q866 296 888 286 M1063 290 Q1101 294 1129 285" />
              <g class="footer-spark">
                <path d="M1035 28 Q1037 52 1057 57 Q1037 60 1035 83 Q1031 61 1012 57 Q1033 52 1035 28Z M1075 40 L1082 30 M1084 61 L1095 64 M1010 28 L1004 20 M1001 75 L992 81" />
              </g>
              <path d="M168 53 Q191 23 212 53 Q191 78 168 53Z M190 43 Q181 54 190 64 Q199 54 190 43Z M175 34 L169 26 M192 28 L192 18 M208 34 L215 27" />
              <path d="M557 326 Q582 299 609 324 Q633 301 654 327 Q609 346 557 326Z M585 325 L591 325 M619 325 L625 325 M548 337 Q602 354 666 339" />
            </g>
          </svg>
          <span class="footer-cursor-tab">Let's collaborate <span aria-hidden="true">↗</span></span>
        </a>
        <div class="footer-meta">
          <a href="${homeHref()}">Yichen Cao</a>
          <p>© 2026 · Made with curiosity.</p>
        </div>
      </footer>
    `;
  }

  function attachInteractiveGrid() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const heroCopy = document.querySelector(".hero-copy");
    let frame = 0;

    function clearGlow() {
      heroCopy?.classList.remove("is-glow-active");
      document.body.classList.remove("is-grid-hot");
    }

    if (heroCopy) {
      function setPosition(event) {
        const bounds = heroCopy.getBoundingClientRect();
        const offsetX = event.clientX - bounds.left;
        const offsetY = event.clientY - bounds.top;

        window.cancelAnimationFrame(frame);
        frame = window.requestAnimationFrame(() => {
          heroCopy.style.setProperty("--hero-glow-x", `${offsetX}px`);
          heroCopy.style.setProperty("--hero-glow-y", `${offsetY}px`);
          heroCopy.classList.add("is-glow-active");
        });
      }

      heroCopy.addEventListener("pointermove", setPosition, { passive: true });
      heroCopy.addEventListener("pointerenter", setPosition, { passive: true });
      heroCopy.addEventListener("pointerleave", clearGlow);
    }

    document.addEventListener("pointerleave", clearGlow);
    if (reduceMotion) document.body.classList.add("reduce-grid-motion");
  }

  function renderHome() {
    setPageContext("home");
    const projectItems = [...projects, ...comingSoon.map((item) => ({ ...item, muted: true }))];
    const projectFilters = ["Vibe Coding", "UX/UI", "Architecture", "Motion", "All"];
    const filterTerms = {
      "Vibe Coding": ["vibe coding", "code", "coding", "interactive", "web app"],
      "UX/UI": ["ux", "ui", "user", "interface", "branding", "visual", "prototype", "research", "product design", "product designer"],
      Architecture: ["architecture", "architectural", "spatial"],
      Motion: ["motion", "animation", "interactive", "kinetic"],
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
      if (activeFilter === "All") return true;
      if (Array.isArray(project.filters)) {
        if (activeFilter === "UX/UI") return project.filters.includes("UX") || project.filters.includes("UI");
        return project.filters.includes(activeFilter);
      }
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
        const shortest = columns.find((column) => column.cards.some((card) => card.slug === project.afterSlug))
          || columns.reduce((best, column) => (column.height < best.height ? column : best), columns[0]);
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
            <h1>AI-native product designer, crafting UX design with good taste, function, and human in the loop</h1>
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
        activeFilter = button.dataset.filter === "All" || activeFilter === button.dataset.filter ? "" : button.dataset.filter;
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
    setPageContext("background");
    document.title = "Experience - Yichen Cao";
    app.innerHTML = shell(`
      <main class="background-page">
        <section id="background" class="background-section section-shell" aria-labelledby="background-title">
          <div class="section-heading">
            <span>01</span>
            <h2 id="background-title">Experience</h2>
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

  function renderResume() {
    setPageContext("resume");
    const skillGroups = profile.skills || [];
    const links = profile.links || [];

    document.title = "About Me - Yichen Cao";
    app.innerHTML = shell(`
      <main class="about-page">
        <section class="about-intro" aria-labelledby="about-title">
          <p class="about-eyebrow">A little more human / About Yichen</p>
          <div class="about-intro-grid">
            <h1 id="about-title">A designer.<br />An explorer.<br /><em>Always curious.</em></h1>
            <div class="about-intro-note">
              <img src="${assetUrl("assets/about/portrait.webp")}" width="500" height="500" alt="Portrait of Yichen Cao" />
              <p>Hi, I’m Yichen — a product designer based in Melbourne. I started in architecture. These days, I turn research into digital experiences, and ideas into things people can use.</p>
              <a class="text-link" href="#my-story">A few things that shaped me <span aria-hidden="true">↓</span></a>
            </div>
          </div>
        </section>
        <section class="about-moodboard" aria-labelledby="moodboard-title">
          <div class="about-board-heading"><h2 id="moodboard-title">Field notes from my life</h2><span>Work, wander & everything between</span></div>
          <div class="moodboard-grid">
            <figure class="mood-photo mood-hike">
              <img src="${assetUrl("assets/about/hiking-portrait.webp")}" width="1500" height="1003" alt="Yichen in a bright hiking jacket and pink beanie on a rocky mountain ridge" />
              <figcaption><span>01 / Away from the desk</span>My kind of headspace.</figcaption>
            </figure>
            <article class="mood-note mood-compass">
              <span class="note-index">A small introduction</span>
              <p>Drawn to<br />good questions.<br /><em>And the long way round.</em></p>
              <svg viewBox="0 0 80 80" aria-hidden="true"><path d="M40 6V74M6 40H74M17 17L63 63M17 63L63 17" fill="none" stroke="currentColor" stroke-width="1.5" /><circle cx="40" cy="40" r="22" fill="white" stroke="currentColor" /><path d="M48 23L43 43L23 49L37 37Z" fill="currentColor" /></svg>
            </article>
            <article class="mood-note mood-transition">
              <span class="note-index">Same curiosity, new medium</span>
              <p>Spaces <span aria-hidden="true">↗</span><br />Interfaces</p>
              <small>Architecture → code → product design.<br />The thread: how people experience things.</small>
              <small class="pile-context">Bauhaus lives in the soul of my design.<br />A few memories, and the references behind them.</small>
            </article>
            <div class="polaroid-pile" role="group" aria-label="Five photos and design influences. Drag a photo aside, or tap or press Enter to see the next.">
              ${[
                ["architecture-studio", "Architecture studio", "Where it began: spaces, systems and people."],
                ["creative-still-life", "A playful self-portrait", "Figma, curiosity and a little play. Illustration by ChatGPT, 2025."],
                ["mountain-trail", "Room to think", "Less screen time. More sky."],
                ["el-lissitzky-1922", "El Lissitzky · 1922", "A circle, a diagonal, a new rhythm. Geometry that inspires my work."],
                ["elizabeth-diller", "Elizabeth Diller", "My architectural north star, for a very long time."],
              ].map(([file, title, caption], index) => `
                <button class="polaroid-card" type="button" data-photo-title="${title}" aria-label="${title}. ${caption} Show next photo." tabindex="${index === 0 ? 0 : -1}" aria-hidden="${index !== 0}" style="--card-angle: ${[-3, 5, -7, 9, -11][index]}deg; --card-offset: ${index * 4}px; z-index: ${5 - index}">
                  <img src="${assetUrl(`assets/about/${file}.webp`)}" alt="" loading="lazy" draggable="false" />
                  <span class="polaroid-title">${title}</span>
                  <span class="polaroid-caption">${caption}</span>
                </button>
              `).join("")}
              <span class="pile-drag-tab" aria-hidden="true">Drag to discover ↗</span>
              <span class="pile-announcement" role="status" aria-live="polite"></span>
            </div>
            <div class="mood-signoff" aria-hidden="true"><span>A few pieces of me.</span><img src="${assetUrl("assets/about/personal-mark.webp")}" width="368" height="122" alt="" loading="lazy" /></div>
          </div>
        </section>
        <section class="about-story" id="my-story" aria-labelledby="story-title">
          <div class="about-story-heading"><p class="about-eyebrow">The connecting thread</p><h2 id="story-title">Different scales.<br />The same care.</h2></div>
          <div class="about-chapters">
            <article><span class="note-index">01 / Spaces & people</span><h3>I learned to look closely.</h3><p>Architecture taught me to consider both the whole system and the smallest detail. I studied Design and Architecture at the University of Melbourne, completing my Master of Architecture with First Class Honours. In the studio, an idea had to be explored, tested and explained — not just look good on a page.</p><p>Teaching design from 2020 to 2024 strengthened that habit. Helping students work through complex ideas taught me to listen, ask clearer questions and make room for different ways of thinking.</p></article>
            <article><span class="note-index">02 / From plans to prototypes</span><h3>I wanted to build the experience, too.</h3><p>That curiosity led me to software engineering at Holberton School Australia, then UX/UI design through RMIT Online. Code gave me a way to make ideas tangible; UX gave me a way to test them with the people they were for.</p><p>Since then, I’ve worked on dining recommendations with Relish, clinician workflows at Support Sorted, and research and accessibility design for CareVo. At MLAI, I bring research, product design and AI-assisted building together on Startup Pulse.</p></article>
            <article><span class="note-index">03 / Beyond the screen</span><h3>I make room for the outdoors.</h3><p>I love hiking: a winding trail, a wide sky, and a reason to slow down and notice what’s around me. It’s a different kind of exploration from design, but one I make time for.</p><p>Whether I’m working through a prototype or heading out for a walk, I like staying curious. There’s usually something worth noticing along the way.</p></article>
          </div>
        </section>
        <section class="about-section about-practice section-shell" aria-labelledby="practice-title">
          <div class="section-heading"><span>Now</span><h2 id="practice-title">What I bring to the table</h2></div>
          <div class="about-panel">
            <section class="about-skills" aria-labelledby="about-skills-title">
              <p class="case-section-eyebrow" id="about-skills-title">Skills</p>
              <div class="skill-groups">
                ${skillGroups
                  .map(
                    (group) => `
                      <article>
                        <h3>${group.label}</h3>
                        <p>${group.items.join(", ")}</p>
                      </article>
                    `
                  )
                  .join("")}
              </div>
            </section>
            <section class="about-links" aria-labelledby="about-links-title">
              <p class="case-section-eyebrow" id="about-links-title">Links</p>
              <div class="link-list">
                ${links
                  .map(
                    (link) => `
                      <a href="${link.url}" target="_blank" rel="noreferrer">
                        <span>${link.label}</span>
                        <small>${link.url.replace(/^mailto:/, "").replace(/^https?:\/\//, "")}</small>
                      </a>
                    `
                  )
                  .join("")}
              </div>
            </section>
          </div>
        </section>
      </main>
    `);
  }

  function renderProject(slug) {
    setPageContext("project");
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
  } else if (isResumePage) {
    renderResume();
  } else {
    renderHome();
  }

  function attachNavigationGeometry() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const storageKey = "portfolio-navigation-geometry";
    let activeBurst;
    let cleanupTimer;

    function clearBurst() {
      activeBurst?.remove();
      activeBurst = null;
      window.clearTimeout(cleanupTimer);
    }

    function burst(x = window.innerWidth * 0.75, y = 90) {
      clearBurst();
      if (reduceMotion.matches) return;
      const layer = document.createElement("div");
      layer.className = "navigation-geometry";
      layer.setAttribute("aria-hidden", "true");
      layer.style.left = `${Math.max(86, Math.min(x, window.innerWidth - 86))}px`;
      layer.style.top = `${Math.max(86, Math.min(y, window.innerHeight - 86))}px`;
      const pieces = [
        ["disc", -52, -35, 0], ["bar", 35, -46, -36],
        ["ring", 57, 18, 22], ["square", -26, 44, -38],
        ["line", -63, 10, -35], ["dot", 20, 57, 0],
        ["triangle", 6, -65, 20], ["arc", -9, -10, -42],
        ["dot", 65, -22, 0], ["line", -44, 60, -35],
      ];
      pieces.forEach(([shape, dx, dy, angle], index) => {
        const piece = document.createElement("i");
        piece.className = `geometry-piece geometry-${shape}`;
        piece.style.setProperty("--dx", `${dx}px`);
        piece.style.setProperty("--dy", `${dy}px`);
        piece.style.setProperty("--turn", `${angle}deg`);
        piece.style.setProperty("--delay", `${index * 12}ms`);
        layer.appendChild(piece);
      });
      document.body.appendChild(layer);
      activeBurst = layer;
      cleanupTimer = window.setTimeout(clearBurst, 750);
    }

    // Keep native navigation, modifier keys, downloads and external links intact.
    document.addEventListener("click", (event) => {
      const link = event.target.closest("a[href]");
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.hasAttribute("download") || (link.target && link.target !== "_self") || reduceMotion.matches) return;
      const target = new URL(link.href, window.location.href);
      if (target.origin !== window.location.origin || !["http:", "https:", "file:"].includes(target.protocol)) return;
      const bounds = link.getBoundingClientRect();
      const x = event.detail ? event.clientX : bounds.left + bounds.width / 2;
      const y = event.detail ? event.clientY : bounds.top + bounds.height / 2;
      if (target.pathname === window.location.pathname && target.search === window.location.search && target.hash) {
        burst(x, y);
        return;
      }
      try {
        sessionStorage.setItem(storageKey, JSON.stringify({path: target.pathname, search: target.search, time: Date.now(), x: x / window.innerWidth, y: y / window.innerHeight}));
      } catch { /* Navigation still works when storage is unavailable. */ }
    });

    try {
      const pending = JSON.parse(sessionStorage.getItem(storageKey) || "null");
      sessionStorage.removeItem(storageKey);
      if (pending && pending.path === window.location.pathname && pending.search === window.location.search && Date.now() - pending.time < 10000) {
        burst(pending.x * window.innerWidth, pending.y * window.innerHeight);
      }
    } catch { /* Optional enhancement only. */ }

    reduceMotion.addEventListener("change", clearBurst);
    window.addEventListener("pagehide", clearBurst);
  }

  function attachPolaroidPile() {
    const pile = document.querySelector(".polaroid-pile");
    if (!pile) return;
    let cards = [...pile.querySelectorAll(".polaroid-card")];
    let drag = null;
    let suppressClick = false;
    const angles = [-3, 5, -7, 9, -11];

    function arrange(announce = false, keepFocus = false) {
      cards.forEach((card, index) => {
        card.style.zIndex = String(cards.length - index);
        card.style.setProperty("--card-angle", `${angles[index]}deg`);
        card.style.setProperty("--card-offset", `${index * 4}px`);
        card.style.setProperty("--drag-x", "0px");
        card.style.setProperty("--drag-y", "0px");
        card.tabIndex = index === 0 ? 0 : -1;
        card.setAttribute("aria-hidden", String(index !== 0));
      });
      if (keepFocus) cards[0].focus({preventScroll: true});
      if (announce) pile.querySelector(".pile-announcement").textContent = `${cards[0].dataset.photoTitle}. ${cards[0].querySelector(".polaroid-caption").textContent}`;
    }

    function next() {
      const keepFocus = pile.contains(document.activeElement);
      cards.push(cards.shift());
      arrange(true, keepFocus);
    }

    pile.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || drag || !event.target.closest(".polaroid-card")) return;
      suppressClick = false;
      const card = cards[0];
      drag = {id: event.pointerId, card, x: event.clientX, y: event.clientY, dx: 0, dy: 0, width: pile.clientWidth};
      card.setPointerCapture(event.pointerId);
      card.classList.add("is-dragging");
      pile.classList.add("is-dragging");
    });
    pile.addEventListener("pointermove", (event) => {
      if (!drag || drag.id !== event.pointerId) return;
      drag.dx = event.clientX - drag.x;
      drag.dy = event.clientY - drag.y;
      const limit = drag.width * 0.65;
      drag.card.style.setProperty("--drag-x", `${Math.max(-limit, Math.min(limit, drag.dx))}px`);
      drag.card.style.setProperty("--drag-y", `${Math.max(-55, Math.min(55, drag.dy))}px`);
    });
    function finish(event, cancelled = false) {
      if (!drag || drag.id !== event.pointerId) return;
      const current = drag;
      drag = null;
      current.card.classList.remove("is-dragging");
      pile.classList.remove("is-dragging");
      if (current.card.hasPointerCapture(event.pointerId)) current.card.releasePointerCapture(event.pointerId);
      const distance = Math.hypot(current.dx, current.dy);
      suppressClick = !cancelled && distance > 8;
      if (!cancelled && distance > 40) next();
      else arrange();
    }
    pile.addEventListener("pointerup", (event) => finish(event));
    pile.addEventListener("pointercancel", (event) => finish(event, true));
    pile.addEventListener("lostpointercapture", (event) => finish(event, true));
    pile.addEventListener("click", (event) => {
      if (!event.target.closest(".polaroid-card")) return;
      if (suppressClick && event.detail !== 0) { suppressClick = false; return; }
      next();
    });
    pile.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && drag) finish({pointerId: drag.id}, true);
    });
    arrange();
  }

  attachPolaroidPile();
  attachNavigationGeometry();
  attachInteractiveGrid();
  const footerArt = document.querySelector(".footer-art-link");
  if (footerArt) {
    const pointerMode = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    footerArt.addEventListener("pointermove", (event) => {
      if (!pointerMode.matches || reducedMotion.matches || event.pointerType === "touch") return;
      const bounds = footerArt.getBoundingClientRect();
      const tab = footerArt.querySelector(".footer-cursor-tab");
      const x = Math.max(8, Math.min(event.clientX - bounds.left + 18, bounds.width - tab.offsetWidth - 8));
      const y = Math.max(8, Math.min(event.clientY - bounds.top + 18, bounds.height - tab.offsetHeight - 8));
      footerArt.style.setProperty("--cursor-x", `${x}px`);
      footerArt.style.setProperty("--cursor-y", `${y}px`);
      footerArt.classList.add("is-pointer-active");
    });
    const clearPointer = () => footerArt.classList.remove("is-pointer-active");
    footerArt.addEventListener("pointerleave", clearPointer);
    footerArt.addEventListener("blur", clearPointer);
    reducedMotion.addEventListener("change", clearPointer);
    pointerMode.addEventListener("change", clearPointer);
  }
})();
