import sharp from "sharp";
import { mkdir, copyFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const source = resolve(root, "s2volt-logo-source.svg");
const brandDir = resolve(root, "public", "brand");
const iconDir = resolve(root, "public", "icons");

await mkdir(brandDir, { recursive: true });
await mkdir(iconDir, { recursive: true });
await copyFile(source, resolve(brandDir, "s2volt-logo.svg"));
await copyFile(source, resolve(iconDir, "icon.svg"));
await copyFile(source, resolve(root, "public", "favicon.svg"));

async function renderSquare(size, filename, padding = 0.14) {
  const innerWidth = Math.round(size * (1 - padding * 2));
  const innerHeight = Math.max(1, Math.round(innerWidth * 5.176 / 33.858));
  const logo = await sharp(source).resize({ width: innerWidth, height: innerHeight, fit: "inside" }).png().toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 4, background: "#edf1f7" }
  }).composite([{ input: logo, gravity: "center" }]).png().toFile(resolve(iconDir, filename));
}

await renderSquare(192, "icon-192.png");
await renderSquare(512, "icon-512.png");
await renderSquare(512, "icon-maskable-512.png", 0.22);
await renderSquare(180, "apple-touch-icon.png");
console.log("S2-Volt PWA icons generated.");
