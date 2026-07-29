#!/usr/bin/env node
// Validates every <script type="application/ld+json"> block in index.html.
// Fails the build (exit 1) on JSON parse errors or missing sitelinks structure.
// Runs via `prebuild`.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const html = readFileSync(resolve("index.html"), "utf8");
const re = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;

let idx = 0;
let errors = 0;
let sawNavGraph = false;

for (const match of html.matchAll(re)) {
  idx++;
  const raw = match[1];
  try {
    const parsed = JSON.parse(raw);
    const nodes = Array.isArray(parsed["@graph"]) ? parsed["@graph"] : [parsed];
    const navs = nodes.filter((n) => n && n["@type"] === "SiteNavigationElement");
    if (navs.length > 0) {
      sawNavGraph = true;
      const requiredFields = ["name", "url", "description"];
      navs.forEach((n, i) => {
        for (const f of requiredFields) {
          if (!n[f] || typeof n[f] !== "string") {
            console.error(`[jsonld] block #${idx} nav[${i}] missing/invalid "${f}"`);
            errors++;
          }
        }
        if (n.url && !/^https?:\/\//.test(n.url)) {
          console.error(`[jsonld] block #${idx} nav[${i}] url must be absolute: ${n.url}`);
          errors++;
        }
      });
    }
    console.log(`[jsonld] block #${idx} OK (${nodes.length} node${nodes.length > 1 ? "s" : ""})`);
  } catch (err) {
    console.error(`[jsonld] block #${idx} JSON parse error:`, err.message);
    errors++;
  }
}

if (!sawNavGraph) {
  console.error("[jsonld] no SiteNavigationElement (sitelinks) block found in index.html");
  errors++;
}

if (errors > 0) {
  console.error(`[jsonld] FAILED with ${errors} error(s)`);
  process.exit(1);
}
console.log(`[jsonld] all ${idx} block(s) valid`);