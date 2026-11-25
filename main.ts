// news-image-20261124 entry.
//
// The entry is a program that writes one image summing up the world's news
// of Tuesday 24 November 2026 to /output/entry.png. The image itself
// (entry.png, a newspaper front page drawn in-session from the day's wire
// reports) ships in this repository; the program copies it to the output
// directory after checking it is a whole PNG or JPEG inside the gate's
// limits. No network, no secrets, Node standard library only.
//
// Run it outside the grader with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const here = dirname(fileURLToPath(import.meta.url));
const bytes = readFileSync(join(here, 'entry.png'));

// The gate takes a whole PNG or JPEG of at most 1 MiB: refuse anything else.
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const isPng = bytes.subarray(0, 8).equals(PNG_MAGIC);
const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
if (!isPng && !isJpeg) throw new Error('entry.png is not a PNG or JPEG');
if (bytes.length > 1048576) throw new Error('entry.png exceeds 1 MiB');
if (isPng) {
  // PNG header: width and height sit at bytes 16-23 (big-endian uint32s).
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  if (width > 1024 || height > 1024) {
    throw new Error(`entry.png is ${width}x${height}, over the 1024x1024 cap`);
  }
}

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'entry.png'), bytes);
