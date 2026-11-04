// Builds dist/sitemap.xml from the route list. Routes are kept in sync with src/data/nav.ts.
import { writeFileSync, readFileSync } from 'node:fs'
const BASE = 'https://www.grncpl.com'
const src = readFileSync(new URL('../src/data/nav.ts', import.meta.url), 'utf8')
const slugs = [...new Set([...src.matchAll(/href:\s*'(\/[^']*)'/g)].map((m) => m[1]))]
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${slugs
  .map((s) => `  <url><loc>${BASE}${s}</loc></url>`)
  .join('\n')}\n</urlset>\n`
writeFileSync(new URL('../dist/sitemap.xml', import.meta.url), xml)
console.log(`sitemap.xml: ${slugs.length} urls`)
