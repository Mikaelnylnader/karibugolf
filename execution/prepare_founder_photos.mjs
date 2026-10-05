import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { promisify } from "node:util";

const run = promisify(execFile);
const photos = [
  ["Volvo China Open Tee-Off.png", "mikael-volvo-china-open-tee-off.webp"],
  ["Volvo China Open Qualifying Putts.png", "mikael-volvo-china-open-putting.webp"],
  ["Golfers Walking the Green at Volvo China Open.png", "mikael-volvo-china-open-walking.webp"],
];
await mkdir("public/images/founder", { recursive: true });
await mkdir(".tmp/founder-photos", { recursive: true });
const manifest = [];
for (const [original, filename] of photos) {
  const source = `C:/Users/mikae/Downloads/${original}`;
  const target = `public/images/founder/${filename}`;
  const before = await readFile(source);
  await run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", source, "-frames:v", "1", "-c:v", "libwebp", "-quality", "90", "-compression_level", "6", target]);
  const after = await readFile(source);
  if (!before.equals(after)) throw new Error(`Original photograph changed: ${source}`);
  manifest.push({ source, target, originalBytes: before.length, deliveryBytes: (await stat(target)).size, sourceSha256: createHash("sha256").update(before).digest("hex") });
}
await writeFile(".tmp/founder-photos/manifest.json", `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify(manifest, null, 2));
