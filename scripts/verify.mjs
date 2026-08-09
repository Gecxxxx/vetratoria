import { access, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { allPages } from "../src/pages.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

const fileForRoute = (route) => {
  if (route === "/") return join(root, "index.html");
  if (route === "/404.html") return join(root, "404.html");
  return join(root, route.replace(/^\//, ""), "index.html");
};

const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

const exists = async (file) => {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
};

for (const page of allPages) {
  const file = fileForRoute(page.path);
  assert(await exists(file), `${page.path}: generated file is missing`);
  if (!(await exists(file))) continue;

  const html = await readFile(file, "utf8");
  const h1Count = (html.match(/<h1(?:\s|>)/g) || []).length;
  assert(h1Count === 1, `${page.path}: expected one h1, found ${h1Count}`);
  assert(/<title>[^<]+<\/title>/.test(html), `${page.path}: title is missing`);
  assert(/<meta name="description" content="[^"]+">/.test(html), `${page.path}: description is missing`);
  assert(/<link rel="canonical" href="[^"]+">/.test(html), `${page.path}: canonical is missing`);
  assert(/<main id="main">/.test(html), `${page.path}: main landmark is missing`);

  for (const match of html.matchAll(/<img\b[^>]*>/g)) {
    assert(/\salt="[^"]*"/.test(match[0]), `${page.path}: image without alt attribute`);
  }

  for (const match of html.matchAll(/<button\b[^>]*>/g)) {
    assert(/\stype="(?:button|submit|reset)"/.test(match[0]), `${page.path}: button without explicit type`);
  }

  for (const match of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
    assert(/\srel="[^"]*noopener[^"]*"/.test(match[0]), `${page.path}: target=_blank link without noopener`);
  }

  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  assert(new Set(ids).size === ids.length, `${page.path}: duplicate id detected`);

  for (const match of html.matchAll(/\shref="#([^"]+)"/g)) {
    assert(ids.includes(match[1]), `${page.path}: local fragment is missing: #${match[1]}`);
  }

  for (const match of html.matchAll(/\s(?:src|href)="([^"]+)"/g)) {
    const value = match[1].split("?")[0];
    if (!value.startsWith("/") || value.startsWith("//")) continue;
    if (value.startsWith("/#")) continue;

    if (/\.(?:webp|png|jpe?g|svg|css|js)$/i.test(value)) {
      assert(await exists(join(root, value.slice(1))), `${page.path}: asset is missing: ${value}`);
      continue;
    }

    const [route, hash] = value.split("#");
    if (!route) continue;
    const target = fileForRoute(route.endsWith("/") || route === "/404.html" ? route : `${route}/`);
    assert(await exists(target), `${page.path}: internal route is missing: ${value}`);
    if (hash && await exists(target)) {
      const targetHtml = await readFile(target, "utf8");
      assert(targetHtml.includes(`id="${hash}"`), `${page.path}: fragment is missing: ${value}`);
    }
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Verified ${allPages.length} pages: routes, assets, metadata, landmarks and headings are valid.`);
}
