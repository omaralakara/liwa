// Downloads approved imagery into public/images at responsive widths (WebP via the
// Unsplash/imgix CDN), builds an inline blur placeholder per image, and writes
// src/data/assets.ts plus public/images/SOURCES.md for attribution.
//
// Usage: node scripts/fetch-assets.mjs [scripts/assets.json]
// Re-runnable: existing files are skipped unless --force is passed.

import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = resolve(root, process.argv[2] ?? "scripts/assets.json");
const force = process.argv.includes("--force");

const WIDTHS = [640, 1280, 1920, 2560];
const PLACEHOLDER_WIDTH = 24;

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

// Placeholders already generated on a previous run, so assets whose files all exist need no network at all
// (some CDNs are unreachable from some networks; a re-run must not depend on them).
const previousPlaceholders = new Map();
try {
  const prev = await readFile(resolve(root, "src/data/assets.ts"), "utf8");
  for (const m of prev.matchAll(/"id": "([^"]+)"[\s\S]*?"placeholder": "([^"]+)"/g)) previousPlaceholders.set(m[1], m[2]);
} catch {}
const downloads = manifest.filter((a) => !a.deriveFrom);
const derived = manifest.filter((a) => a.deriveFrom);

function cdnUrl(asset, width, { placeholder = false } = {}) {
  const url = new URL(asset.downloadUrl);
  if (asset.source === "unsplash" || asset.source === "pexels") {
    // Both CDNs are imgix-backed and accept the same resize/crop parameters.
    url.search = "";
    url.searchParams.set("w", String(width));
    // The 2560 tier only serves large high-DPR screens; trade a little quality for weight there.
    const q = placeholder ? 30 : (asset.quality ?? 78) - (width >= 2560 ? 10 : 0);
    url.searchParams.set("q", String(q));
    url.searchParams.set("fm", placeholder ? "jpg" : "webp");
    url.searchParams.set("fit", "max");
    if (asset.crop && asset.source === "pexels") {
      // Pexels supports only a centred crop to explicit dimensions.
      const [aw, ah] = (asset.ar ?? "4:5").split(":").map(Number);
      url.searchParams.set("fit", "crop");
      url.searchParams.set("h", String(Math.round((width * ah) / aw)));
    } else if (asset.crop) {
      url.searchParams.set("fit", "crop");
      url.searchParams.set("crop", asset.crop); // e.g. "entropy", "edges", "focalpoint"
      if (asset.ar) url.searchParams.set("ar", asset.ar);
      if (asset.fpX != null) url.searchParams.set("fp-x", String(asset.fpX));
      if (asset.fpY != null) url.searchParams.set("fp-y", String(asset.fpY));
      if (asset.fpZ != null) url.searchParams.set("fp-z", String(asset.fpZ));
    }
    return url.toString();
  }
  return asset.downloadUrl;
}

async function exists(path) {
  try {
    const s = await stat(path);
    return s.size > 0;
  } catch {
    return false;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Fetches the whole body with retries; the CDN link can be slow and drops connections. */
async function fetchWithRetry(url, tries = 5) {
  let lastError;
  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0", Accept: "image/webp,image/*,application/json" },
        signal: AbortSignal.timeout(240_000),
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const type = res.headers.get("content-type") ?? "";
      const buf = Buffer.from(await res.arrayBuffer());
      return { buf, type };
    } catch (err) {
      lastError = err;
      console.warn(`  retry ${attempt}/${tries} (${err.cause?.code ?? err.name ?? err.message}) ${url.slice(0, 80)}`);
      await sleep(2000 * attempt);
    }
  }
  throw lastError;
}

async function download(url, dest) {
  const { buf, type } = await fetchWithRetry(url);
  if (!type.startsWith("image/")) throw new Error(`non-image content-type ${type} for ${url}`);
  await writeFile(dest, buf);
  return { bytes: buf.length, type };
}

const out = [];
const sources = ["# Image sources", "", "All imagery below is used under its stated license. Conceptual imagery is labelled in the site itself.", ""];

for (const asset of downloads) {
  const dir = resolve(root, "public/images", asset.folder);
  await mkdir(dir, { recursive: true });

  // Intrinsic size from the CDN when the manifest does not state it (imgix fm=json).
  if (!asset.width || !asset.height) {
    const metaUrl = new URL(asset.downloadUrl);
    metaUrl.search = "";
    metaUrl.searchParams.set("fm", "json");
    if (asset.crop) {
      metaUrl.searchParams.set("fit", "crop");
      metaUrl.searchParams.set("crop", asset.crop);
      if (asset.ar) metaUrl.searchParams.set("ar", asset.ar);
      metaUrl.searchParams.set("w", String(WIDTHS[WIDTHS.length - 1]));
    }
    const meta = JSON.parse((await fetchWithRetry(metaUrl.toString())).buf.toString("utf8"));
    const w = meta.PixelWidth ?? meta["Output.Width"] ?? meta.width;
    const h = meta.PixelHeight ?? meta["Output.Height"] ?? meta.height;
    if (asset.crop && asset.ar) {
      const [aw, ah] = asset.ar.split(":").map(Number);
      asset.width = 2560;
      asset.height = Math.round((2560 * ah) / aw);
    } else {
      asset.width = w;
      asset.height = h;
    }
  }
  const files = {};
  let downloaded = false;
  for (const w of WIDTHS) {
    if (asset.maxWidth && w > asset.maxWidth) continue;
    const file = `${asset.slug}-${w}.webp`;
    const dest = resolve(dir, file);
    if (!force && (await exists(dest))) {
      files[w] = `/images/${asset.folder}/${file}`;
      continue;
    }
    downloaded = true;
    const { bytes } = await download(cdnUrl(asset, w), dest);
    files[w] = `/images/${asset.folder}/${file}`;
    console.log(`${asset.slug} ${w}w  ${(bytes / 1024).toFixed(0)} kB`);
  }

  // Blur placeholder: tiny JPEG as a data URI, inlined so the first paint has colour.
  let placeholder = !force && !downloaded ? previousPlaceholders.get(asset.slug) : undefined;
  if (!placeholder) {
    const phBuf = (await fetchWithRetry(cdnUrl(asset, PLACEHOLDER_WIDTH, { placeholder: true }))).buf;
    placeholder = `data:image/jpeg;base64,${phBuf.toString("base64")}`;
  }

  out.push({
    id: asset.slug,
    alt: asset.alt,
    width: asset.width,
    height: asset.height,
    conceptual: Boolean(asset.conceptual),
    credit: { photographer: asset.photographer, source: asset.source, pageUrl: asset.pageUrl, license: asset.license },
    files,
    placeholder,
  });

  sources.push(
    `- **${asset.slug}** — ${asset.title} by ${asset.photographer} (${asset.source}, ${asset.license}). ${asset.pageUrl}` +
      (asset.location ? ` Location: ${asset.location}.` : "") +
      (asset.conceptual ? " Conceptual imagery, not LIWA property." : ""),
  );
  await writeOutputs(); // incremental: a partial run still yields a valid manifest
  console.log(`done ${asset.slug}`);
}

// Derived exposures: the same licensed photograph re-graded locally with sharp (no new source).
if (derived.length) {
  const sharp = (await import("sharp")).default;
  for (const d of derived) {
    const source = out.find((a) => a.id === d.deriveFrom);
    if (!source) throw new Error(`deriveFrom ${d.deriveFrom} not found for ${d.slug}`);
    const dir = resolve(root, "public/images", d.folder ?? source.credit.folder ?? "derived");
    await mkdir(dir, { recursive: true });
    const files = {};
    const grade = (img) =>
      img
        .modulate({ brightness: d.brightness ?? 1, saturation: d.saturation ?? 1, hue: d.hue ?? 0 })
        .linear(d.contrast ?? 1, d.offset ?? 0);
    for (const [w, path] of Object.entries(source.files)) {
      const file = `${d.slug}-${w}.webp`;
      const dest = resolve(dir, file);
      if (force || !(await exists(dest))) {
        await grade(sharp(resolve(root, "public", path.replace(/^\//, "")))).webp({ quality: d.quality ?? 74 }).toFile(dest);
        console.log(`${d.slug} ${w}w (derived)`);
      }
      files[w] = `/images/${d.folder}/${file}`;
    }
    const phIn = Buffer.from(source.placeholder.split(",")[1], "base64");
    const phOut = await grade(sharp(phIn)).jpeg({ quality: 40 }).toBuffer();
    out.push({
      id: d.slug,
      alt: d.alt ?? source.alt,
      width: source.width,
      height: source.height,
      conceptual: source.conceptual,
      credit: { ...source.credit, note: `Derived exposure of ${source.id}` },
      files,
      placeholder: `data:image/jpeg;base64,${phOut.toString("base64")}`,
    });
    sources.push(`- **${d.slug}** — derived exposure of ${source.id} (same photograph, re-graded locally).`);
  }
}

await writeOutputs();
console.log(`\nWrote ${out.length} assets to src/data/assets.ts and public/images/SOURCES.md`);

async function writeOutputs() {
  const ts = `// Generated by scripts/fetch-assets.mjs. Do not edit by hand.

export interface ImageAsset {
  id: string;
  alt: string;
  width: number;
  height: number;
  conceptual: boolean;
  credit: { photographer: string; source: string; pageUrl: string; license: string; note?: string };
  files: Record<string, string>;
  placeholder: string;
}

export const images = ${JSON.stringify(Object.fromEntries(out.map((a) => [a.id, a])), null, 2)} as const satisfies Record<string, ImageAsset>;

export type ImageId = keyof typeof images;
`;
  await writeFile(resolve(root, "src/data/assets.ts"), ts);
  await writeFile(resolve(root, "public/images/SOURCES.md"), sources.join("\n") + "\n");
}
