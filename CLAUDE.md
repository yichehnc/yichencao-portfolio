# CLAUDE.md — Framer Portfolio V2

Context file for Claude Code (and Cowork). Read this at the start of every session.

---

## Project

**Framer project:** https://framer.com/projects/Portfolio2--YuXvC3nafYv2kTqb8HFi-j4YLL
**Live site:** https://yichencao.com
**Linear board:** https://linear.app/yichenc/project/framer-portfolio-redesign-df3b0b3cb0eb

Owner: Yichen Cao (yichenc2017@gmail.com)

---

## Tooling

- **Framer MCP** — canvas manipulation via XML nodes. MCP server ID prefix: `mcp__a5a1ee09-80a2-4031-b197-c6aa30030e43`
- **Vercel MCP** — deployment. Server prefix: `mcp__5f28ca60-cf12-45c6-9507-1b2fcfc101a7`
- Always call `getProjectXml` at the start of any Framer session to refresh node IDs (they can change).

---

## Role split (Claude vs Codex)

| Surface | Owner |
|---|---|
| Canvas layout, node XML, breakpoints, spacing | Claude |
| Code files (`.tsx`) — logic, filtering, animation | Codex |
| Design decisions, visual hierarchy, copy | Claude |
| Cross-file coordination, prop contracts | Claude spec → Codex implement |

**Handoff:** user says "Codex has control" / "Claude has control". Claude pauses canvas edits when Codex is active.

---

## Page map

| Page | nodeId | Path |
|---|---|---|
| Home | `augiA20Il` | `/` |
| Projects index | `pFGNtluJg` | `/projects` |
| /page | `Xl91HrLWu` | `/page` |
| Relish | `VdbfFYXF1` | `/projects/relish` |
| Walley Bank | `KvGhI0vau` | `/projects/walley-bank` |
| REA Redesign | `S3fWxZ4J0` | `/projects/rea-redesign` |
| Yichen Arch Portfolio | `a43OGq9Vi` | `/projects/yichenarch-portfolio` |
| MLAI Founder Tools | `YgLhVf907` | `/projects/mlai-founder-tools` |

---

## Key node IDs — Home page (`augiA20Il`)

| Node | ID | Notes |
|---|---|---|
| Desktop breakpoint | `WQLkyLRf1` | 1400px, gap 136px |
| Tablet breakpoint | `bfiEk1MR4` | 810px, gap 80px — replica variant |
| Phone breakpoint | `kqsRgmkqX` | 390px, gap 56px — replica variant |
| TopNav instance | `VRXVg3PCZ` | componentId `SatP92P1v` |
| SectionHero | `Gv2eSNnP8` | padding 56px 100px 0px 100px |
| Hero inner | `RZXqogYqZ` | maxWidth 1200px |
| Heading text | `rewTUAzBW` | inlineTextStyle `/Heading 1`, width 1fr |
| FilterableProjects | `TqdYM0OzZ` | componentId `KZ9Jbdy`, minColumnWidth 290, maxColumns 3 |
| SectionProjects | `Snd65OQpA` | padding 0px 100px |
| Footer instance | `Lj2ExKCXg` | componentId `rf9xDC3ks` |

---

## Key node IDs — Components

| Component | nodeId | Variants of note |
|---|---|---|
| TopNav | `SatP92P1v` | Desktop `ZKcM9msF9`, Tablet `v0iI_NcKh`, MobileClosed `o0KNAPNqx` |
| Footer | `rf9xDC3ks` | `ORDBu7oYR` |
| Back button | `sPtJo6Czv` | Used on detail pages |
| Button | `WUPcCODow` | `SSmbu1nN4` |

---

## Code files

| File | codeFileId | Purpose |
|---|---|---|
| `FilterableProjects.tsx` | `KZ9Jbdy` | Home page project waterfall grid |
| `GridBackground.tsx` | `QBuhIOt` | Decorative dot/line grid |
| `Workshop/Image.tsx` | `pk2Qz5o` | Image helper |
| `Toggle.tsx` | `jgGUsQz` | Code override |

### FilterableProjects — current behaviour
- True waterfall: flex columns + ResizeObserver (not CSS grid)
- Greedy shortest-column distribution — no empty row gaps
- Responsive: auto-collapses columns based on `minColumnWidth` + container width
- MLAI page wired in PAGE_MAP: `"YgLhVf907": "/projects/mlai-founder-tools"`

---

## Color & text styles

**Colors:** `/Grey 1000` (bg), `/Grey 800`, `/Grey 600`, `/Black 1000`, `/White`

**Text styles:**
- `/Heading 1` — 78px Inter Tight 500 (desktop hero)
- `/Heading 2` — 32px (section titles)
- `/Heading 3` — 22px
- `/Heading 3b` — 32px regular (use for phone hero instead of /Heading 1)
- `/Project Heading` — 48px, -0.02em tracking
- `/Body` — 16px, 28px line height
- `/Body 2` — 14px Inter

---

## Detail page layout (reference: `/projects/relish`)

Structure (vertical stack, gap 64px, padding 48px 0px):
1. TopNav (`SatP92P1v`, variant `ZKcM9msF9`)
2. Content stack (width 1fr, maxWidth 1200px, padding 0px 100px, gap 64px)
   - Back button (`sPtJo6Czv`)
   - Header: project title (`/Project Heading`) + meta (`/Body 2`)
   - Hero image (height 764px, borderRadius 32px)
   - Tagline (`/Heading 3b`)
   - Section: H2 + Body
   - Image (height 540px, borderRadius 24px)
   - Section, Image, Section…
3. Footer (`rf9xDC3ks`, variant `ORDBu7oYR`)

---

## Breakpoint rules

- Tablet/Phone are **replica variant frames** — they inherit Desktop content automatically.
- MCP can update attributes on the breakpoint frame itself (gap, padding on root) but **cannot add new children** to replica frames.
- Per-node responsive overrides (e.g. TopNav variant, section padding) must be set manually in Framer canvas while in the Tablet/Phone breakpoint view.
- **NEVER delete a breakpoint without explicit user confirmation.**

### Manual overrides to apply in Framer canvas (not yet done via MCP)

| Node | Tablet override | Phone override |
|---|---|---|
| TopNav | variant → `v0iI_NcKh` | variant → `o0KNAPNqx` |
| SectionHero | padding → `40px 48px 0px 48px` | padding → `24px 24px 0px 24px` |
| SectionProjects | padding → `0px 48px` | padding → `0px 24px` |
| Hero heading | — | text style → `/Heading 3b` |

---

## V2 Linear tickets (current status)

| Ticket | Title | Status |
|---|---|---|
| YIC-42 | Detail pages content | Done (MLAI built) |
| YIC-43 | Tablet breakpoint — landing waterfall | Partial (gap set, per-node overrides manual) |
| YIC-44 | Mobile breakpoint — landing waterfall | Partial (gap set, per-node overrides manual) |
| YIC-45 | Typography & spacing polish | Pending |
| YIC-46 | Remaining detail pages (Kinetic, ThinkLess, CloudMind) | Pending |
| YIC-47 | Final QA + publish | Pending |

---

## Rules / preferences

- **Never delete** Framer nodes, breakpoints, or frames without asking first.
- Responses: brief, no fluff, no summaries unless asked.
- Don't use bullet lists for conversational replies.
- Always call `getProjectXml` before canvas work to get fresh node IDs.
- When updating a node that has children, always include full child order in XML to avoid reordering bugs.
