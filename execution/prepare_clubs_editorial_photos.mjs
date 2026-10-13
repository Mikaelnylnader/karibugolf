/** Prepare the owner's club photographs without altering their originals. */
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { promisify } from "node:util";

const run = promisify(execFile);
const photos = [
  ["164055", "driver-swing.webp"],
  ["164042", "driver-headcover.webp"],
  ["164107", "driver-address.webp"],
  ["164147", "fairway-address.webp"],
  ["164214", "hybrid-swing.webp"],
  ["164330", "iron-on-course.webp"],
  ["165504", "p790-on-course.webp"],
  ["165517", "p790-in-bag.webp"],
  ["165527", "p790-set-on-grass.webp"],
  ["165539", "p790-cleaning.webp"],
  ["170312", "p770-on-course.webp"],
  ["170320", "p770-in-bag.webp"],
  ["170329", "p770-at-address.webp"],
  ["165914", "sm11-finishes.webp"],
  ["170521", "sm11-t-grind.webp"],
  ["170532", "sm11-d-grind.webp"],
  ["170541", "sm11-m-grind.webp"],
  ["170552", "sm11-f-grind.webp"],
  ["170612", "sm11-s-grind.webp"],
  ["170623", "sm11-wedge-setup.webp"],
  ["170635", "sm11-in-bag.webp"],
  ["173514", "sm11-k-grind.webp"],
  ["172538", "t200-back.webp"],
  ["172548", "t200-rear-profile.webp"],
  ["172604", "t200-address.webp"],
  ["172616", "t200-face.webp"],
  ["172626", "t200-sole.webp"],
  ["172635", "t200-construction.webp"],
];
const prefix = process.argv.find(argument=>argument.startsWith("--prefix="))?.slice(9);
if (prefix && !/^[a-z0-9-]+$/.test(prefix)) throw new Error("Invalid photo prefix");
const selectedPhotos = prefix ? photos.filter(([,filename])=>filename.startsWith(prefix)) : photos;
if (!selectedPhotos.length) throw new Error(`No photos match ${prefix}`);
await mkdir("public/images/shop/clubs-editorial", { recursive: true });
await mkdir(".tmp/clubs-editorial-photos", { recursive: true });
const manifest = [];
for (const [time, filename] of selectedPhotos) {
  const source = `C:/Users/mikae/Pictures/Screenshots/Skärmbild 2026-10-13 ${time}.png`;
  const target = `public/images/shop/clubs-editorial/${filename}`;
  const before = await readFile(source);
  await run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", source, "-frames:v", "1", "-c:v", "libwebp", "-quality", "90", "-compression_level", "6", target]);
  if (!before.equals(await readFile(source))) throw new Error(`Original changed: ${source}`);
  manifest.push({ source, target, sourceBytes: before.length, deliveryBytes: (await stat(target)).size, sourceSha256: createHash("sha256").update(before).digest("hex") });
}
await writeFile(`.tmp/clubs-editorial-photos/${prefix ? "manifest-"+prefix.replace(/-$/, "") : "manifest"}.json`, JSON.stringify(manifest, null, 2) + "\n");
console.log(JSON.stringify(manifest, null, 2));
