# Portfolio handoff

## Current state

- Repository: `yichehnc/yichencao-portfolio`
- Live site: [yichencao.com](https://www.yichencao.com/)
- Main branch HEAD: `65f3eb9` — `feat: showcase archived visual projects and open current experience`
- The current batch was pushed and Vercel reported a successful production deployment.
- The worktree is clean apart from ignored/generated `output/` and `tmp/` folders. Do not add either folder to commits.

## How to run and verify locally

This is a static HTML, CSS and JavaScript site; there is no build step.

```powershell
python -m http.server 8080 --bind 127.0.0.1
```

Open `http://127.0.0.1:8080/`. Check the home page, `/background/` (Experience), `/resume/` (About Me), and relevant project pages under `/projects/`.

Run these lightweight checks after JavaScript changes:

```powershell
node --check src/main.js
node --check src/data.js
git diff --check
```

## Delivery workflow

- Commit locally after every change, using Conventional Commit messages (`feat:`, `fix:`, `style:`, `refactor:`, `docs:`, `chore:`).
- Do not push after each commit. Pushing `main` triggers a Vercel production deploy (Hobby plan), so push batches only when the user approves.
- Remote: `https://github.com/yichehnc/yichencao-portfolio.git`

## Design direction

- ElevenLabs-inspired neutral surfaces with black/white pill CTAs.
- Use saturated orange `#FF4704` sparingly for dots, underlines and small highlights. Avoid orange body copy and large orange CTAs.
- Keep the lightweight grain gradient from `assets/brand/atmosphere.svg`, hand-drawn illustration language, Caveat phrase, and reduced-motion support.
- The faint 40px landing-page grid is intentional and must remain. It is also used in the footer backdrop.
- The guiding feel is nuanced, elegant, minimal and “less is more.” Bauhaus informs the approach; El Lissitzky is a distinct influence on geometric motion; Elizabeth Diller is an architectural north star.

## Recent implementation

### Home / Work

- Navigation labels are **Work**, **Experience**, and **About Me**.
- Header availability line: “Product Designer · ANZ PR · Open to relo”.
- “Let’s Connect” opens `https://linkedin.com/in/ycaoc`.
- The hero includes interactive **AI-native** and **product** words that show illustration popups. Their images should remain transparent/cut-out and must not cover adjacent text.
- The footer uses the same faint grid and a cursor-following gradient; its primary CTA says “Let’s chat”.
- `src/main.js` renders the waterfall and filter controls. `src/data.js` is the source of project records. `src/styles.css` contains all visual tokens and responsive styling.

### Archived visual projects

The former single “Archived Portfolio” card was replaced with seven direct Wix-linked cards, stored locally in `assets/archive/` and exposed by the **Visual** filter:

1. Speed of Modernity — also Motion
2. The Lived-in Room
3. Ghost Hardware: DeepBlue — also Motion
4. Housing, Home and Content(s)
5. Tangling Pavilion
6. Blurred Zones
7. Digital Fabrication

They use `externalUrl`, so the existing card renderer opens each old-portfolio project in a new tab. The first two visual cards are intentionally the most visually striking; the masonry distribution determines column position after that.

### Experience

- `/background/` is an interactive CV: hover/focus reveals supporting detail, while clicking a role expands it.
- MLAI / Stone & Chalk is the default expanded role. Other roles remain collapsed and should use lighter grey text until hover/selection.
- The interaction respects reduced motion. The existing implementation is lightweight JavaScript/CSS; do not add a large animation dependency without need.

### About Me

- `/resume/` is the About Me page, with the photo-stack/moodboard experience.

## Useful files

| Path | Purpose |
|---|---|
| `index.html` | Home entry point and cache-busting script versions |
| `background/index.html` | Experience entry point |
| `resume/index.html` | About Me entry point |
| `src/data.js` | Profile, work, case-study and archive project data |
| `src/main.js` | Rendering, filters, interactions and page routing |
| `src/styles.css` | Design tokens, layout, responsive rules and motion |
| `assets/archive/` | Local snapshots for the seven visual archive projects |
| `assets/illustrations/` | Hero/footer illustration assets |
| `assets/brand/atmosphere.svg` | Grained background gradient |
| `memory.md` | Persistent product/design preferences |
| `CLAUDE.md` | Older Framer project context; relevant only for Framer canvas work |

## Known follow-ups

- Framer canvas work, if resumed, needs manual tablet/phone breakpoint overrides described in `CLAUDE.md`; never delete breakpoints.
- Remaining detail pages listed in `CLAUDE.md` are Kinetic, ThinkLess and CloudMind.
- Before pushing, review the work on localhost at desktop and mobile widths, then push the combined batch only when approved by the user.
