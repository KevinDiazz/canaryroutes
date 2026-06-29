/**
 * postbuild: patch-html-lang
 *
 * Next.js App Router can't set <html lang> dynamically from the root layout
 * when using `output: 'export'`. This script runs after `next build` and
 * replaces `lang="und"` in every exported HTML file with the correct locale
 * derived from the file path.
 *
 * Usage (called automatically via "postbuild" in package.json):
 *   tsx scripts/patch-html-lang.ts
 */

import fs from 'fs';
import path from 'path';

const OUT_DIR = path.join(process.cwd(), 'out');
const LOCALE_RE = /^\/?(es|en|de)\//;
const DEFAULT_LOCALE = 'es';

/** Walk a directory recursively and yield .html file paths. */
function* walkHtml(dir: string): Generator<string> {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkHtml(full);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      yield full;
    }
  }
}

/** Derive the locale from an absolute file path under OUT_DIR. */
function localeFromPath(filePath: string): string {
  const relative = filePath.slice(OUT_DIR.length).replace(/\\/g, '/');
  const match = relative.match(LOCALE_RE);
  return match ? match[1] : DEFAULT_LOCALE;
}

if (!fs.existsSync(OUT_DIR)) {
  console.error(`❌ Out directory not found: ${OUT_DIR}`);
  console.error('   Run "next build" before this script.');
  process.exit(1);
}

let patched = 0;
let skipped = 0;

for (const filePath of walkHtml(OUT_DIR)) {
  const locale = localeFromPath(filePath);
  const html = fs.readFileSync(filePath, 'utf-8');

  // Target only the lang attribute on the <html> opening tag.
  // NOTE: html.includes(`lang="${locale}"`) would false-positive on hreflang
  // link tags (e.g. <link hreflang="en" ...>), so we check the <html> tag only.
  const updated = html.replace(
    /(<html\b[^>]*?\s)lang="[^"]*"/,
    `$1lang="${locale}"`,
  );

  if (updated === html) {
    skipped++;
  } else {
    fs.writeFileSync(filePath, updated, 'utf-8');
    patched++;
  }
}

console.log(`✅ patch-html-lang: ${patched} files patched, ${skipped} already correct.`);
