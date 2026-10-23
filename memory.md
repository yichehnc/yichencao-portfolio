# Memory

- New project entries should use the existing case-study template, with shorter content when appropriate. Always show a prominent repository link when a repository is supplied.

- Preview and verify website changes on localhost by default. The user uses Vercel Hobby and wants small edits batched to avoid unnecessary deployments. Run relevant checks and keep local commits for meaningful changes, but do not push after every small edit. Push the combined batch when the user asks for the final deploy/publish or says the batch is ready. This supersedes the previous automatic-push-after-every-major-change preference. Use Conventional Commit messages with the appropriate prefix, such as `feat:`, `fix:`, `style:`, `refactor:`, `docs:`, `test:`, or `chore:`. A local commit does not deploy; a push to the Vercel-connected branch can trigger deployment.

- Portfolio brand direction (2026-10-23): ElevenLabs-inspired neutral surfaces and black/white pill CTAs, with a very small amount of saturated orange #FF4704 sampled from the supplied elevenlabs2.png. This explicitly supersedes the previous monochrome-only preference. Orange is for tiny markers and underlines, not body text or full CTA fills; avoid muted terracotta/Claude orange. Use the lightweight grained gradient in assets/brand/atmosphere.svg for introductory backdrops, retain the hand-drawn illustrations/Caveat phrase, and respect reduced motion. Shared tokens live in src/styles.css; design-system/index.html is the visual reference.

- Personal design influences: Bauhaus is central to Yichen's design outlook; El Lissitzky's geometric compositions inspire visual motion; Elizabeth Diller is a long-standing architectural north star. Keep these influences distinct rather than labeling Lissitzky's work as Bauhaus.
