(function () {
  const projects = window.PORTFOLIO_PROJECTS || [];
  const comingSoon = window.PORTFOLIO_COMING_SOON || [];
  const tools = window.PORTFOLIO_TOOLS || [];
  const background = window.PORTFOLIO_BACKGROUND || [];
  const profile = window.PORTFOLIO_PROFILE || {};
  const testimonials = window.PORTFOLIO_TESTIMONIALS || [];
  const stats = window.PORTFOLIO_STATS || { beats: [], collage: [] };
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

  function renderTestimonials() {
    if (!testimonials.length) return "";
    return `
      <section class="testimonial-section section-shell" aria-labelledby="testimonial-title">
        <div class="section-heading">
          <span>02</span>
          <h2 id="testimonial-title"><span class="reveal-line"><span>Recommendations</span></span></h2>
        </div>
        <div class="testimonial-carousel" role="region" aria-roledescription="carousel" aria-label="Recommendations" tabindex="0">
          ${testimonials
            .map(
              (item, index) => `
                <figure class="testimonial-card" data-index="${index}" aria-roledescription="slide" aria-label="${index + 1} of ${testimonials.length}">
                  <blockquote class="testimonial-quote">
                    ${item.quote
                      .map(
                        (paragraph, pIndex, arr) =>
                          `<p>${pIndex === 0 ? "\u201C" : ""}${paragraph}${pIndex === arr.length - 1 ? "\u201D" : ""}</p>`
                      )
                      .join("")}
                  </blockquote>
                  <figcaption class="testimonial-footer">
                    ${item.photo ? `<img class="testimonial-avatar" src="${assetUrl(item.photo)}" alt="${item.name}" width="56" height="56" loading="lazy" decoding="async" />` : ""}
                    <div class="testimonial-credit">
                      <span class="testimonial-name">${item.name}</span>
                      <span class="testimonial-role">${item.role}</span>
                      <span class="testimonial-meta">${item.relationship}${
                        item.sourceUrl
                          ? ` · <a href="${item.sourceUrl}" target="_blank" rel="noreferrer">via LinkedIn <span aria-hidden="true">↗</span></a>`
                          : ""
                      }</span>
                    </div>
                  </figcaption>
                </figure>
              `
            )
            .join("")}
        </div>
      </section>
    `;
  }

  // Pinned stat section: scale story told over a collage of work snapshots.
  const statLayout = [
    { fx: -0.3, fy: -0.3, w: 28, mx: -0.2, my: -0.36, mw: 46 },
    { fx: 0.33, fy: -0.26, w: 17, mx: 0.28, my: -0.3, mw: 32 },
    { fx: -0.385, fy: 0.06, w: 22, hideMobile: true },
    { fx: 0.385, fy: 0.12, w: 22, hideMobile: true },
    { fx: -0.17, fy: 0.33, w: 22, mx: -0.24, my: 0.34, mw: 42 },
    { fx: 0.16, fy: 0.36, w: 24, mx: 0.25, my: 0.38, mw: 44 },
  ];

  // Logo tiles sit on the corners of the screenshots so they overlap slightly.
  const logoLayout = [
    { fx: -0.165, fy: -0.2, mx: -0.02, my: -0.27 },
    { fx: 0.255, fy: -0.17, mx: 0.13, my: -0.17 },
    { fx: -0.29, fy: 0.15, hideMobile: true },
    { fx: 0.3, fy: 0.03, hideMobile: true },
    { fx: -0.085, fy: 0.25, mx: -0.07, my: 0.25 },
    { fx: 0.085, fy: 0.3, mx: 0.07, my: 0.29 },
  ];

  function renderStats() {
    if (!stats.beats.length) return "";
    const items = stats.collage
      .map((entry) => (typeof entry === "string" ? projects.find((project) => project.slug === entry) : entry))
      .filter(Boolean)
      .map((project, index) => {
        const layout = statLayout[index % statLayout.length];
        const aspect = String(project.aspect || "4 / 3");
        return `
          <span class="stat-item" style="--w: ${layout.w}; --mw: ${layout.mw || 40}; --aspect: ${aspect}"
            data-fx="${layout.fx}" data-fy="${layout.fy}" data-mx="${layout.mx ?? layout.fx}" data-my="${layout.my ?? layout.fy}"${layout.hideMobile ? " data-hide-mobile" : ""}>
            <img src="${assetUrl(project.cardImage || project.image)}" alt="" loading="lazy" decoding="async" draggable="false" />
          </span>`;
      })
      .join("");
    const logoItems = (stats.logos || [])
      .map((name, index) => {
        const layout = logoLayout[index % logoLayout.length];
        return `
          <span class="stat-item stat-logo" style="--aspect: 1 / 1"
            data-fx="${layout.fx}" data-fy="${layout.fy}" data-mx="${layout.mx ?? layout.fx}" data-my="${layout.my ?? layout.fy}"${layout.hideMobile ? " data-hide-mobile" : ""}>
            <img src="${assetUrl(`assets/stats/logos/${name}.webp`)}" alt="" loading="lazy" decoding="async" draggable="false" />
          </span>`;
      })
      .join("");
    const beats = stats.beats
      .map((beat) =>
        beat.type === "headline"
          ? `<div class="stat-beat"><h2 class="stat-headline">${beat.text}</h2></div>`
          : beat.type === "list"
          ? `<div class="stat-beat"><p class="stat-label">${beat.label}</p><ul class="stat-list">${beat.items.map((item) => `<li>${item}</li>`).join("")}</ul></div>`
          : `<div class="stat-beat"><p class="stat-number"><span>${beat.value}</span><span class="stat-plus">${beat.suffix || ""}</span></p><p class="stat-caption">${beat.caption}</p></div>`
      )
      .join("");
    return `
      <section class="stat-section" aria-label="Impact highlights">
        <div class="stat-stage">
          <div class="stat-collage" aria-hidden="true">${items}${logoItems}</div>
          <div class="stat-beats">${beats}</div>
        </div>
      </section>
    `;
  }

  function attachStats() {
    const section = document.querySelector(".stat-section");
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!(window.CSS && CSS.supports("position", "sticky"))) return;

    const stage = section.querySelector(".stat-stage");
    const items = Array.from(section.querySelectorAll(".stat-item"));
    const beatEls = Array.from(section.querySelectorAll(".stat-beat"));
    const mobile = window.matchMedia("(max-width: 679px)");
    const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
    const seg = (p, a, b) => clamp((p - a) / (b - a));
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);
    const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    const speeds = [-1, 1, -0.6, 0.8, -0.9, 0.7];
    // in / out windows (0-1 of the pinned scroll) for each beat
    const timeline = [
      { in: [0, 0.12], out: [0.26, 0.34] },
      { in: [0.3, 0.4], out: [0.52, 0.6] },
      { in: [0.56, 0.68], out: [0.78, 0.86] },
      { in: [0.82, 0.93], out: null },
    ];

    section.classList.add("is-live");
    let width = 0;
    let height = 0;
    let target = 0;
    let shown = 0;
    let frame = 0;

    function measure() {
      width = stage.clientWidth;
      height = stage.clientHeight;
    }

    function readTarget() {
      const rect = section.getBoundingClientRect();
      const total = section.offsetHeight - stage.offsetHeight;
      target = total > 0 ? clamp(-rect.top / total) : 0;
    }

    function render(d) {
      const small = mobile.matches;
      // As the closing headline arrives, the collage eases outward to clear the centre.
      const push = 1 + 0.08 * easeInOut(seg(d, 0.8, 0.95));
      items.forEach((item, index) => {
        const t = easeOut(seg(d, 0.02 * index, 0.26 + 0.02 * index));
        const fx = parseFloat(small ? item.dataset.mx : item.dataset.fx);
        const fy = parseFloat(small ? item.dataset.my : item.dataset.fy);
        const drift = (d - 0.5) * speeds[index % speeds.length] * height * 0.1;
        item.style.opacity = t > 0.001 ? "1" : "0";
        item.style.transform = `translate3d(${(fx * width * push * t).toFixed(1)}px, ${((fy * height * push + drift) * t).toFixed(1)}px, 0) scale(${t.toFixed(3)})`;
        const image = item.firstElementChild;
        if (image) image.style.transform = `scale(${(2 - t).toFixed(3)})`;
      });

      beatEls.forEach((beat, index) => {
        const plan = timeline[index];
        if (!plan) return;
        const enter = easeOut(seg(d, plan.in[0], plan.in[1]));
        const exit = plan.out ? easeInOut(seg(d, plan.out[0], plan.out[1])) : 0;
        const alpha = enter * (1 - exit);
        beat.style.opacity = alpha.toFixed(3);
        beat.style.visibility = alpha < 0.01 ? "hidden" : "visible";
        beat.style.transform = `translate3d(0, ${((1 - enter) * 40 - exit * 40).toFixed(2)}%, 0)`;
      });
    }

    function tick() {
      frame = 0;
      const diff = target - shown;
      shown = Math.abs(diff) < 0.0004 ? target : shown + diff * 0.14;
      render(shown);
      if (shown !== target) frame = window.requestAnimationFrame(tick);
    }

    function onScroll() {
      readTarget();
      if (!frame) frame = window.requestAnimationFrame(tick);
    }

    measure();
    readTarget();
    shown = target;
    render(shown);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", () => {
      measure();
      onScroll();
    });
  }

  // Work -> Recommendations: a scroll-scrubbed rule + rolling disc, then a staged reveal.
  function attachSectionTransitions() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const section = document.querySelector(".testimonial-section");
    if (section) {
      section.classList.add("reveal-ready");
      if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(
          (entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
              section.classList.add("is-revealed");
              observer.disconnect();
            }
          },
          { threshold: 0.15 }
        );
        observer.observe(section);
      } else {
        section.classList.add("is-revealed");
      }
    }

    const divider = document.querySelector(".section-transition");
    const canvas = divider && divider.querySelector(".st-canvas");
    if (!canvas) return;
    const context = canvas.getContext("2d");
    const clamp = (value) => Math.min(1, Math.max(0, value));
    const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    let width = 0;
    let height = 0;
    let frame = 0;

    function resize() {
      const ratio = window.devicePixelRatio || 1;
      width = divider.clientWidth;
      height = divider.clientHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    // A single pulse of hairlines travels left to right as you scroll, then settles flat onto the rule.
    function draw() {
      frame = 0;
      const bounds = divider.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      const center = bounds.top + bounds.height / 2;
      const progress = easeInOut(clamp((viewport * 0.95 - center) / (viewport * 0.6)));
      const styles = getComputedStyle(document.documentElement);
      const ink = styles.getPropertyValue("--ink").trim() || "#171717";
      const accent = styles.getPropertyValue("--accent").trim() || "#ff4704";
      const pitch = width < 680 ? 8 : 10;
      const count = Math.floor(width / pitch);
      const baseline = height * 0.78;
      const peak = height * 0.7;
      const crest = -0.2 + 1.4 * progress;

      context.clearRect(0, 0, width, height);
      for (let i = 0; i < count; i += 1) {
        const x = count > 1 ? i / (count - 1) : 0;
        const bump = Math.exp(-Math.pow((x - crest) / 0.075, 2));
        const lineHeight = peak * bump;
        if (lineHeight < 1) continue;
        context.fillStyle = bump > 0.94 ? accent : ink;
        context.fillRect(Math.round(x * (width - 1)), baseline - lineHeight, 1, lineHeight);
      }
    }

    function request() {
      if (!frame) frame = window.requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", () => {
      resize();
      request();
    });
  }

  function attachTestimonials() {
    const carousel = document.querySelector(".testimonial-carousel");
    if (!carousel) return;
    const cards = Array.from(carousel.children);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

    function stepBy(direction) {
      const card = carousel.querySelector(".testimonial-card");
      const step = card ? card.getBoundingClientRect().width + 20 : 300;
      carousel.scrollBy({ left: direction * step, behavior: reduceMotion.matches ? "auto" : "smooth" });
    }

    carousel.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") { event.preventDefault(); stepBy(1); }
      if (event.key === "ArrowLeft") { event.preventDefault(); stepBy(-1); }
    });

    // Touch and reduced-motion visitors: plain swipe / scroll with snapping.
    if (!finePointer.matches || reduceMotion.matches || cards.length < 2) return;

    // Desktop: the row drifts on its own, loops forever, and can be dragged or scrolled by hand.
    cards.forEach((card) => {
      const clone = card.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      clone.setAttribute("inert", "");
      carousel.appendChild(clone);
    });
    carousel.classList.add("is-marquee");

    const speed = 28; // px per second
    let setWidth = 0;
    let position = 0;
    let last = 0;
    let hovering = false;
    let focused = false;
    let dragging = false;
    let visible = true;
    let resumeAt = 0;

    function measure() {
      const first = carousel.children[0];
      const firstClone = carousel.children[cards.length];
      setWidth = firstClone.offsetLeft - first.offsetLeft;
    }

    function wrap() {
      if (!setWidth) return;
      if (carousel.scrollLeft >= setWidth) {
        carousel.scrollLeft -= setWidth;
        position = carousel.scrollLeft;
      } else if (carousel.scrollLeft <= 0 && (dragging || performance.now() < resumeAt)) {
        carousel.scrollLeft = setWidth;
        position = setWidth;
      }
    }

    function loop(now) {
      const dt = Math.min(64, now - (last || now));
      last = now;
      const paused = hovering || focused || dragging || now < resumeAt || !visible || document.hidden;
      if (!paused) {
        position += (speed * dt) / 1000;
        if (position >= setWidth) position -= setWidth;
        carousel.scrollLeft = position;
      }
      window.requestAnimationFrame(loop);
    }

    // Manual scrolling (trackpad, wheel, scrollbar-less drag) hands control to the user for a moment.
    carousel.addEventListener("scroll", () => {
      if (hovering || focused || dragging || performance.now() < resumeAt) position = carousel.scrollLeft;
      wrap();
    }, { passive: true });
    carousel.addEventListener("wheel", () => { resumeAt = performance.now() + 1800; }, { passive: true });
    carousel.addEventListener("pointerenter", () => { hovering = true; });
    carousel.addEventListener("pointerleave", () => { hovering = false; resumeAt = performance.now() + 600; });
    carousel.addEventListener("focusin", () => { focused = true; });
    carousel.addEventListener("focusout", () => { focused = false; });

    let startX = 0;
    let startLeft = 0;
    let moved = 0;
    carousel.addEventListener("pointerdown", (event) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      dragging = true;
      moved = 0;
      startX = event.clientX;
      startLeft = carousel.scrollLeft;
      carousel.classList.add("is-dragging");
      carousel.setPointerCapture(event.pointerId);
    });
    carousel.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      const delta = event.clientX - startX;
      moved = Math.max(moved, Math.abs(delta));
      let next = startLeft - delta;
      if (next <= 0) { startLeft += setWidth; next += setWidth; }
      if (next >= setWidth) { startLeft -= setWidth; next -= setWidth; }
      carousel.scrollLeft = next;
    });
    function endDrag() {
      if (!dragging) return;
      dragging = false;
      resumeAt = performance.now() + 1500;
      carousel.classList.remove("is-dragging");
    }
    carousel.addEventListener("pointerup", endDrag);
    carousel.addEventListener("pointercancel", endDrag);
    carousel.addEventListener("click", (event) => {
      if (moved > 5) { event.preventDefault(); event.stopPropagation(); moved = 0; }
    }, true);

    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => { visible = entries.some((entry) => entry.isIntersecting); }).observe(carousel);
    }
    window.addEventListener("resize", () => { measure(); wrap(); });
    measure();
    window.requestAnimationFrame(loop);
  }

  function shell(content) {
    return `
      <div class="interactive-grid-bg" aria-hidden="true"></div>
      <header class="site-header">
        <a class="brand" href="${homeHref()}" aria-label="Yichen Cao home">
          <span>Yichen Cao</span>
          <small>Product Designer · ANZ PR · Open to relo</small>
        </a>
        <nav class="nav" aria-label="Main navigation">
          <a href="${homeHref("#case-studies")}"${!isBackgroundPage && !isResumePage ? ' aria-current="page"' : ""}>Work</a>
          <a href="${backgroundUrl()}"${isBackgroundPage ? ' aria-current="page"' : ""}>Experience</a>
          <a href="${resumeUrl()}"${isResumePage ? ' aria-current="page"' : ""} data-about-navigation>About Me</a>
        </nav>
      </header>
      ${content}
      <footer class="footer">
        <div class="footer-opening">
          <p class="footer-invitation">Good things start with a conversation.</p>
          ${!isProjectPage && !isBackgroundPage && !isResumePage ? `<img class="landing-doodle footer-doodle" src="${assetUrl("assets/illustrations/yichen-ux-flow.webp")}" width="448" height="448" alt="" aria-hidden="true" loading="lazy" decoding="async" draggable="false" />` : ""}
        </div>
        <a class="footer-art-link" href="mailto:yichenc2017@gmail.com" aria-label="Let's chat — email Yichen Cao">
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
          <span class="footer-cursor-tab">Let's chat <span aria-hidden="true">↗</span></span>
        </a>
        <div class="footer-meta">
          <a href="${homeHref()}">Yichen Cao</a>
          <p>© 2026 · Made with curiosity.</p>
        </div>
      </footer>
    `;
  }

  function attachInteractiveGrid() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointerMode = window.matchMedia("(hover: hover) and (pointer: fine)");
    document.querySelectorAll(".hero-copy, .footer").forEach((surface) => {
      let frame = 0;
      function clearGlow() {
        window.cancelAnimationFrame(frame);
        surface.classList.remove("is-glow-active");
      }
      function setPosition(event) {
        if (reduceMotion.matches || !pointerMode.matches || event.pointerType === "touch") return;
        const bounds = surface.getBoundingClientRect();
        const offsetX = event.clientX - bounds.left;
        const offsetY = event.clientY - bounds.top;

        window.cancelAnimationFrame(frame);
        frame = window.requestAnimationFrame(() => {
          surface.style.setProperty("--glow-x", `${offsetX}px`);
          surface.style.setProperty("--glow-y", `${offsetY}px`);
          surface.classList.add("is-glow-active");
        });
      }

      surface.addEventListener("pointermove", setPosition, { passive: true });
      surface.addEventListener("pointerenter", setPosition, { passive: true });
      surface.addEventListener("pointerleave", clearGlow);
      surface.addEventListener("pointercancel", clearGlow);
      window.addEventListener("blur", clearGlow);
      window.addEventListener("scroll", clearGlow, { passive: true });
      reduceMotion.addEventListener("change", clearGlow);
      pointerMode.addEventListener("change", clearGlow);
    });
  }

  function attachSectionReveals() {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches || !("IntersectionObserver" in window)) return;
    const animations = new Set();
    const observer = new window.IntersectionObserver((entries) => {
      entries.forEach(({ isIntersecting, target }) => {
        if (!isIntersecting) return;
        observer.unobserve(target);
        if (!target.animate || reducedMotion.matches) return;
        const animation = target.animate([
          { opacity: .5, transform: "translateY(8px)" },
          { opacity: 1, transform: "translateY(0)" }
        ], { duration: 280, easing: "cubic-bezier(.22,1,.36,1)" });
        animations.add(animation);
        animation.finished.then(() => animations.delete(animation), () => animations.delete(animation));
      });
    }, { threshold: .15 });
    // Content is visible by default; motion never gates reading or navigation.
    document.querySelectorAll(".section-heading, .case-section-copy, .about-board-heading").forEach((node) => observer.observe(node));
    function stop() {
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
      animations.clear();
    }
    reducedMotion.addEventListener("change", () => { if (reducedMotion.matches) stop(); });
    window.addEventListener("pagehide", stop, { once: true });
  }

  function renderHome() {
    setPageContext("home");
    const projectItems = [...projects, ...comingSoon.map((item) => ({ ...item, muted: true }))];
    const projectFilters = ["All", "Product", "Startup", "Case Study", "UX/UI", "Visual", "Vibe Coding", "Motion"];
    const filterTerms = {
      Product: ["product"],
      Startup: ["startup"],
      "Case Study": ["case study"],
      "Vibe Coding": ["hobby", "leisure", "personal experiment"],
      "UX/UI": ["ux", "ui", "user", "interface", "branding", "visual", "prototype", "research", "product design", "product designer"],
      Motion: ["motion", "animation", "interactive", "kinetic"],
    };
    let activeFilter = "All";
    let moreProjectsExpanded = false;

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
      if (activeFilter === "All") return true;
      if (Array.isArray(project.filters)) {
        if (activeFilter === "UX/UI") return project.filters.includes("UX") || project.filters.includes("UI");
        return project.filters.includes(activeFilter);
      }
      const text = searchableText(project);
      return (filterTerms[activeFilter] || []).some((term) => {
        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "i").test(text);
      });
    }

    function projectCard(project) {
      const cardImage = project.cardImage || project.image;
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
                    cardImage
                      ? `<img src="${assetUrl(cardImage)}" alt="${project.title}" loading="lazy" style="--project-aspect: ${
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

    function masonryMarkup(items) {
      const count = columnCount();
      const columns = Array.from({ length: count }, () => ({ height: 0, cards: [] }));

      items.forEach((project) => {
        const shortest = columns.find((column) => column.cards.some((card) => card.slug === project.afterSlug))
          || columns.reduce((best, column) => (column.height < best.height ? column : best), columns[0]);
        shortest.cards.push(project);
        shortest.height += aspectHeightWeight(project.aspect) + 0.28;
      });

      return columns.map((column) => `<div class="project-column">${column.cards.map(projectCard).join("")}</div>`).join("");
    }

    function renderMasonry() {
      const grid = document.querySelector("#primary-projects");
      const toggle = document.querySelector(".project-more-toggle");
      if (!grid || !toggle) return;
      const matches = projectItems.filter(matchesFilter);
      // Keep older work last, but distribute every visible card through the same waterfall.
      const primary = matches.filter((project) => activeFilter !== "All" || !project.secondary);
      const secondary = activeFilter === "All" ? matches.filter((project) => project.secondary) : [];
      const canCollapse = columnCount() < 3 && primary.length > 0 && secondary.length > 0;
      const expanded = !canCollapse || moreProjectsExpanded;
      const visible = expanded ? [...primary, ...secondary] : primary;

      grid.innerHTML = visible.length ? masonryMarkup(visible)
        : `<p class="empty-filter">No works match ${activeFilter} yet.</p>`;
      grid.dataset.columns = String(columnCount());
      toggle.hidden = !canCollapse;
      toggle.setAttribute("aria-expanded", String(expanded));
      toggle.textContent = expanded ? "Show fewer works" : `Show more works (${secondary.length})`;
    }

    function updateFilterButtons() {
      document.querySelectorAll(".project-filter-tabs .filter-pill").forEach((button) => {
        const isActive = button.dataset.filter === activeFilter;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });
    }

    app.innerHTML = shell(`
      <main>
        <section class="hero">
          <div class="hero-copy">
            <div class="hero-greeting">
              <p class="hello">Hello! I'm Yichen.</p>
              <img class="hero-portrait" src="${assetUrl("assets/illustrations/yichen-collared-portrait.png")}" width="1254" height="1254" alt="" aria-hidden="true" decoding="async" draggable="false" />
            </div>
            <h1><button class="hero-word" type="button" data-character="coding" title="Meet my AI coding side">AI-native</button> <button class="hero-word" type="button" data-character="sketching" title="Meet my product design side">product</button> designer, crafting UX design with good taste, function, and <span class="hero-handwritten">human in the loop</span></h1>
            <div class="hero-connect-row">
              <img class="landing-doodle hero-whiteboard-doodle" src="${assetUrl("assets/illustrations/yichen-ux-flow.webp")}" width="448" height="448" alt="" aria-hidden="true" decoding="async" draggable="false" />
              <a class="primary-link" href="${profile.links.find((link) => link.label === "LinkedIn").url}" target="_blank" rel="noreferrer">Let's Connect</a>
              <img class="landing-doodle coding-doodle" src="${assetUrl("assets/illustrations/yichen-ai-coding-readable.png")}" width="448" height="448" alt="" aria-hidden="true" decoding="async" draggable="false" />
            </div>
            ${renderToolCarousel()}
          </div>
        </section>
        <section id="case-studies" class="work-section section-shell" aria-labelledby="work-title">
          <div class="section-heading projects-heading">
            <span>01</span>
            <h2 id="work-title">Works</h2>
            <img class="landing-doodle sketching-doodle" src="${assetUrl("assets/illustrations/yichen-sketching.webp")}" width="448" height="448" alt="" aria-hidden="true" loading="lazy" decoding="async" draggable="false" />
          </div>
          <div class="project-filter-tabs" aria-label="Work filters">
            ${projectFilters
              .map(
                (filter) => `
                  <button class="filter-pill" type="button" data-filter="${filter}" aria-pressed="false">${filter}</button>
                `
              )
              .join("")}
          </div>
          <div id="primary-projects" class="project-grid" aria-live="polite"></div>
          <button class="project-more-toggle filter-pill" type="button" aria-expanded="false" aria-controls="primary-projects" hidden>Show more works</button>
        </section>
        ${renderStats()}
        <div class="section-transition" aria-hidden="true">
          <span class="st-rule"></span>
          <canvas class="st-canvas"></canvas>
        </div>
        ${renderTestimonials()}
      </main>
    `);

    renderMasonry();
    updateFilterButtons();
    attachHeroWordplay();
    attachTestimonials();
    attachStats();
    attachSectionTransitions();

    document.querySelector(".project-more-toggle").addEventListener("click", () => {
      moreProjectsExpanded = !moreProjectsExpanded;
      renderMasonry();
    });

    document.querySelectorAll(".project-filter-tabs .filter-pill").forEach((button) => {
      button.addEventListener("click", () => {
        activeFilter = activeFilter === button.dataset.filter ? "All" : button.dataset.filter;
        moreProjectsExpanded = false;
        updateFilterButtons();
        renderMasonry();
        document.querySelector("#case-studies")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    let resizeFrame = 0;
    let renderedColumns = columnCount();
    window.addEventListener("resize", () => {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => {
        if (renderedColumns === columnCount()) return;
        renderedColumns = columnCount();
        renderMasonry();
      });
    });
  }

  function attachHeroWordplay() {
    const hero = document.querySelector(".hero-copy");
    if (!hero) return;
    const restingDoodle = hero.querySelector(".coding-doodle");
    const defaultSource = restingDoodle.src;
    const characters = {
      coding: "yichen-smiling-head.png",
      sketching: "yichen-product-cutout.png",
    };
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const pop = document.createElement("img");
    pop.className = "hero-character-pop";
    pop.alt = "";
    pop.setAttribute("aria-hidden", "true");
    pop.draggable = false;
    pop.hidden = true;
    document.body.append(pop);
    // Warm the small local assets so the first click is as smooth as later clicks.
    Object.values(characters).forEach((file) => {
      const image = new Image();
      image.src = assetUrl(`assets/illustrations/${file}`);
    });
    let dismissTimer;
    let animation;
    function dismiss() {
      window.clearTimeout(dismissTimer);
      animation?.cancel();
      pop.hidden = true;
      restingDoodle.src = defaultSource;
      hero.querySelectorAll(".hero-word").forEach((word) => word.classList.remove("is-playing"));
    }
    hero.querySelectorAll(".hero-word").forEach((word) => {
      word.addEventListener("click", (event) => {
        dismiss();
        word.classList.add("is-playing");
        const source = assetUrl(`assets/illustrations/${characters[word.dataset.character]}`);
        // Touch and keyboard activation use the reserved illustration space below the text.
        // Only mouse clicks reveal a doodle beside the cursor; it never captures input.
        const besideCursor = finePointer.matches && window.innerWidth >= 768 && event.detail > 0 && event.pointerType !== "touch";
        const target = besideCursor ? pop : restingDoodle;
        target.src = source;
        if (besideCursor) {
          const size = 200;
          pop.style.left = `${Math.max(12, Math.min(event.clientX + 20, window.innerWidth - size - 12))}px`;
          pop.style.top = `${Math.max(12, Math.min(event.clientY + 20, window.innerHeight - size - 12))}px`;
          pop.hidden = false;
        }
        if (!reducedMotion.matches) {
          animation = target.animate([
            { opacity: 0, transform: "translateY(10px) rotate(-6deg) scale(.92)", offset: 0 },
            { opacity: 1, transform: "translateY(-4px) rotate(3deg) scale(1)", offset: .16 },
            { opacity: 1, transform: "translateY(0) rotate(0) scale(1)", offset: .3 },
            { opacity: 1, transform: "translateY(0) rotate(0) scale(1)", offset: .85 },
            { opacity: 0, transform: "translateY(-8px) rotate(0) scale(.98)", offset: 1 },
          ], { duration: 2200, easing: "ease-out" });
        }
        dismissTimer = window.setTimeout(dismiss, 2200);
      });
    });
    window.addEventListener("scroll", dismiss, { passive: true });
    window.addEventListener("resize", dismiss);
    reducedMotion.addEventListener("change", dismiss);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") dismiss();
    });
  }

  function experienceText(text) {
    const safeText = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return safeText.replace(/70\+|80\+|more than half|more than 3,000|WCAG 2\.2|Figma|Linear|GitHub|reusable design system|progressive web app|Canva Demo Day|clinician interviews|computational design/g, "<strong>$&</strong>");
  }

  function attachExperienceExplorer() {
    const explorer = document.querySelector(".experience-explorer");
    if (!explorer) return;
    const buttons = [...explorer.querySelectorAll(".experience-trigger")];
    const panels = [...explorer.querySelectorAll(".experience-detail")];
    const desktop = window.matchMedia("(min-width: 921px)");
    const hover = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let active = -1;
    let selected = buttons.length ? 0 : -1;
    let animation;

    function select(index, animate = true) {
      const changed = index !== active;
      animation?.cancel();
      active = index;
      buttons.forEach((button, i) => {
        button.setAttribute("aria-expanded", String(i === active));
        button.dataset.state = i === active ? (i === selected ? "selected" : "preview") : "idle";
        panels[i].hidden = i !== active;
      });
      explorer.classList.add("is-enhanced");
      const panel = panels[active];
      if (animate && changed && panel?.animate && !reducedMotion.matches) {
        animation = panel.animate([
          { opacity: 0, transform: "translateY(8px)" },
          { opacity: 1, transform: "translateY(0)" }
        ], { duration: 220, easing: "cubic-bezier(.2,.7,.2,1)" });
      }
    }

    buttons.forEach((button, index) => {
      button.addEventListener("pointerenter", (event) => {
        // Touch uses the explicit tap interaction, even on hybrid devices.
        if (desktop.matches && hover.matches && event.pointerType !== "touch") select(index);
      });
      button.addEventListener("focus", () => {
        if (desktop.matches) select(index);
      });
      button.addEventListener("click", () => {
        selected = selected === index ? -1 : index;
        select(selected);
      });
    });
    explorer.addEventListener("pointerleave", () => {
      if (desktop.matches) select(selected);
    });
    explorer.addEventListener("focusout", (event) => {
      if (!explorer.contains(event.relatedTarget)) select(selected);
    });
    desktop.addEventListener("change", () => {
      select(selected, false);
    });
    reducedMotion.addEventListener("change", () => animation?.cancel());
    select(selected, false);
  }

  function renderBackground() {
    setPageContext("background");
    document.title = "Experience - Yichen Cao";
    app.innerHTML = shell(`
      <main class="background-page">
        <section id="background" class="background-section section-shell" aria-labelledby="background-title">
          <div class="section-heading">
            <span>01</span>
            <h1 id="background-title">Experience</h1>
          </div>
          <p class="experience-intro">I’m a product designer with a background in architecture, software development and design education. I bring research, UX/UI design and AI-assisted building together—from understanding the problem to shipping the experience.</p>
          <p class="experience-hint"><span class="experience-hint-desktop">Hover to preview. Click to keep a role open.</span><span class="experience-hint-mobile">Tap a role to explore.</span></p>
          <div class="experience-explorer">
            ${background
              .map(
                (item, index) => `
                  <article class="experience-entry" style="--experience-row: ${index + 1}">
                    <h3 class="experience-heading">
                      <button class="experience-trigger" type="button" id="experience-trigger-${index}" aria-expanded="false" aria-controls="experience-detail-${index}">
                        <span class="experience-period">${item.period}</span>
                        <span class="experience-company">${item.title.split(" · ")[1]}<span class="experience-indicator" aria-hidden="true">↗</span></span>
                        <span class="experience-role">${item.title.split(" · ")[0]}</span>
                      </button>
                    </h3>
                    <div class="experience-detail" id="experience-detail-${index}" role="region" aria-labelledby="experience-trigger-${index}" hidden>
                      <p class="experience-detail-label">${String(index + 1).padStart(2, "0")} / ${item.period}</p>
                      <h4>${item.title.split(" · ")[0]}</h4>
                      <p>${experienceText(item.body)}</p>
                      ${item.highlights ? `<ul class="experience-highlights">${item.highlights.map((highlight) => `<li>${experienceText(highlight)}</li>`).join("")}</ul>` : ""}
                      ${item.tools ? `<div class="experience-tools"><span>Tools & methods</span><p>${item.tools.map((tool) => `<strong>${tool}</strong>`).join("")}</p></div>` : ""}
                    </div>
                  </article>
                `
              )
              .join("")}
          </div>
        </section>
        <section class="education-section section-shell" aria-labelledby="education-title">
          <div class="section-heading"><span>02</span><h2 id="education-title">Education</h2></div>
          <div class="timeline">
            ${(window.PORTFOLIO_EDUCATION || []).map((item) => `<article class="timeline-item"><p>${item.period}</p><div><h3>${item.title}</h3><p>${item.body}</p></div></article>`).join("")}
          </div>
        </section>
      </main>
    `);
    attachExperienceExplorer();
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
        <a class="back-link" href="${homeHref("#case-studies")}">Back to works</a>
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
            ${project.repoUrl ? `<a class="case-repo-link ${project.actionUrl ? "text-link" : "primary-link"}" href="${project.repoUrl}" target="_blank" rel="noreferrer">View GitHub repository ↗</a>` : ""}
          </div>
          ${project.brandImage ? `
            <figure class="case-brand-snapshot">
              <a href="${project.actionUrl}" target="_blank" rel="noreferrer" aria-label="Explore ${project.title}’s website">
                <img src="${assetUrl(project.brandImage)}" alt="${project.brandImageAlt}" />
              </a>
              <figcaption>CareVo’s website <span>Brand & product context ↗</span></figcaption>
            </figure>
          ` : ""}
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
            project.heroImage
              ? `<img class="case-image hero-image" src="${assetUrl(project.heroImage)}" alt="${project.heroImageAlt || project.title}" />`
              : project.image
              ? `<img class="case-image hero-image" src="${assetUrl(project.image)}" alt="${project.title}" />`
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
    const wideViewport = window.matchMedia("(min-width: 768px)");
    const storageKey = "portfolio-about-navigation-geometry";
    let activeBurst;
    let cleanupTimer;

    function clearBurst() {
      activeBurst?.remove();
      activeBurst = null;
      window.clearTimeout(cleanupTimer);
    }

    function burst(x = window.innerWidth * 0.75, y = 90) {
      clearBurst();
      if (reduceMotion.matches || !wideViewport.matches) return;
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
      const link = event.target.closest("a[data-about-navigation]");
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.hasAttribute("download") || (link.target && link.target !== "_self") || reduceMotion.matches || !wideViewport.matches) return;
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
      if (isResumePage && pending && pending.path === window.location.pathname && pending.search === window.location.search && Date.now() - pending.time < 10000) {
        burst(pending.x * window.innerWidth, pending.y * window.innerHeight);
      }
    } catch { /* Optional enhancement only. */ }

    reduceMotion.addEventListener("change", clearBurst);
    wideViewport.addEventListener("change", clearBurst);
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
  attachSectionReveals();
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
