import { readFile, writeFile } from "node:fs/promises";

const ROOT = process.cwd();
const FOLDERS = ["server", "api", "shared", "drizzle"];

const FROM_RE = /(from\s+["'])(\.\.?\/[^"']*?)(["'])/g;
const IMPORT_RE = /(import\s+["'])(\.\.?\/[^"']*?)(["'])/g;

function fixSpecifier(spec) {
  const lastSeg = spec.split("/").pop();
  if (lastSeg.includes(".")) return spec;
  return spec + ".js";
}

async function* walk(dir) {
  const { readdir } = await import("node:fs/promises");
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) yield* walk(p);
    else if (e.isFile() && (p.endsWith(".ts") || p.endsWith(".tsx"))) yield p;
  }
}

let changed = 0;
for (const folder of FOLDERS) {
  for await (const path of walk(`${ROOT}/${folder}`)) {
    if (path.endsWith(".test.ts")) continue;
    const content = await readFile(path, "utf8");
    const next = content
      .replace(FROM_RE, (_, a, spec, c) => a + fixSpecifier(spec) + c)
      .replace(IMPORT_RE, (_, a, spec, c) => a + fixSpecifier(spec) + c);
    if (next !== content) {
      await writeFile(path, next);
      console.log("fixed", path);
      changed++;
    }
  }
}
console.log(`Done. ${changed} files changed.`);
