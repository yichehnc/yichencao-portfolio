# Yichen Cao Portfolio

Static portfolio exported from the Framer CMS snapshot and hard-coded for simple hosting.

## Run Locally

Open `index.html` directly in a browser, or serve the folder with any static server.

## Deploy To Netlify

1. Create a new Netlify site from this folder or GitHub repo.
2. Set the publish directory to `.`.
3. Leave the build command empty.

The included `netlify.toml` already sets the publish directory.

## Deploy To GitHub Pages

1. Push this folder to a GitHub repository.
2. In repository settings, enable Pages from the main branch.
3. Use the repository root as the publishing source.

The site uses real static files under `Case-study/<slug>/`, matching the current Framer case-study URLs without a single-page app rewrite.
