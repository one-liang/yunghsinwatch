import { buildSite } from "./builder-core.mjs";

const result = await buildSite(process.cwd());

for (const page of result.pages) {
  console.log(`built ${page.pageRelative} -> ${page.htmlOutputPath}`);
}
