# Astra Creates

Static webpage for showcasing Astra's shared Scratch projects.

## Files

- `index.html`: main page
- `styles.css`: styling and layout
- `projects.js`: where you add Scratch embed code
- `script.js`: renders the project cards

## Add a Scratch project

Open `projects.js` and add another object to the `scratchProjects` array:

```js
{
  title: "Project Name",
  summary: "What Astra made.",
  tag: "Game",
  embedHtml:
    '<iframe src="https://scratch.mit.edu/projects/123456789/embed" allowtransparency="true" width="485" height="402" frameborder="0" scrolling="no" allowfullscreen></iframe>'
}
```

## Publish publicly

Use any static host. Easy options:

1. GitHub Pages
2. Netlify
3. Vercel

If you want, I can also set this up specifically for GitHub Pages next.
