#!/usr/bin/env node

/**
 * Atomically deploy reviewed admin files and the current Netlify functions
 * while reusing every unchanged asset already present in production.
 *
 * This avoids reconstructing the full static site on disk. It is read-only by
 * default; pass --apply only after the printed delta has been reviewed.
 */
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const siteId = "925395d9-2336-4f0d-81e0-21a72b3c9074";
const apply = process.argv.includes("--apply");
const reviewedAdminFiles = ["index.html", "admin.css", "admin.js"];
const cliRoot = path.join(process.env.APPDATA, "npm", "node_modules", "netlify-cli");
const [{ NetlifyAPI }, { zipFunctions }] = await Promise.all([
  import(pathToFileURL(path.join(cliRoot, "dist", "index.js"))),
  import(pathToFileURL(path.join(cliRoot, "node_modules", "@netlify", "zip-it-and-ship-it", "dist", "main.js"))),
]);

const config = JSON.parse(await readFile(path.join(process.env.APPDATA, "netlify", "Config", "config.json"), "utf8"));
const token = process.env.NETLIFY_AUTH_TOKEN || config.users?.[config.userId]?.auth?.token;
if (!token) throw new Error("Netlify authentication token was not found");
const api = new NetlifyAPI(token);
const sha1 = (bytes) => createHash("sha1").update(bytes).digest("hex");
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const pause = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const liveFiles = await api.listSiteFiles({ siteId });
const liveDeployId = liveFiles[0]?.deploy_id;
if (!liveDeployId || liveFiles.some((file) => file.deploy_id !== liveDeployId)) throw new Error("Production file manifest contains mixed deploy IDs");
const files = Object.fromEntries(liveFiles.map((file) => [file.path, file.sha]));
const localFilesBySha = new Map();
const changedFiles = [];
for (const fileName of reviewedAdminFiles) {
  const normalizedPath = `/admin/${fileName}`;
  const bytes = await readFile(path.join(root, "public", "admin", fileName));
  const hash = sha1(bytes);
  localFilesBySha.set(hash, { bytes, normalizedPath });
  if (files[normalizedPath] !== hash) changedFiles.push(normalizedPath);
  files[normalizedPath] = hash;
}

const functionSearch = await api.searchSiteFunctions({ siteId });
const liveFunctions = new Map((functionSearch.functions || []).map((fn) => [fn.n, fn.d]));
const tmpDir = await mkdtemp(path.join(root, ".tmp", "netlify-admin-functions-"));
let functionZips;
try {
  functionZips = await zipFunctions([path.join(root, "netlify", "functions")], tmpDir, { basePath: root });
  const functions = {};
  const functionBySha = new Map();
  const functionsConfig = {};
  const changedFunctions = [];
  for (const fn of functionZips) {
    const bytes = await readFile(fn.path);
    const hash = sha256(bytes);
    functions[fn.name] = hash;
    functionBySha.set(hash, fn);
    if (liveFunctions.get(fn.name) !== hash) changedFunctions.push(fn.name);
    functionsConfig[fn.name] = {
      ...(fn.routes?.length ? { routes: fn.routes } : {}),
      ...(fn.displayName ? { display_name: fn.displayName } : {}),
      ...(fn.priority ? { priority: fn.priority } : {}),
      ...(fn.region ? { region: fn.region } : {}),
      ...(fn.memory ? { memory: fn.memory } : {}),
    };
  }

  const plan = {
    mode: apply ? "apply" : "plan",
    siteId,
    productionDeploy: liveDeployId,
    preservedStaticFiles: liveFiles.length - changedFiles.length,
    changedFiles,
    changedFunctions,
  };
  console.log(JSON.stringify(plan, null, 2));
  deployment: {
  if (!changedFiles.length && !changedFunctions.length) break deployment;
  if (!apply) break deployment;

  const created = await api.createSiteDeploy({
    siteId,
    title: "Admin shaft flex and inventory valuation",
    body: { draft: false, deploy_source: "cli" },
  });
  let deploy = await api.updateSiteDeploy({
    siteId,
    deployId: created.id,
    body: {
      files,
      functions,
      functions_config: functionsConfig,
      async: Object.keys(files).length > 1000,
      draft: false,
      framework: "unknown",
    },
  });

  for (let attempts = 0; deploy.state === "preparing" && attempts < 120; attempts += 1) {
    await pause(1000);
    deploy = await api.getSiteDeploy({ siteId, deployId: created.id });
  }
  if (deploy.state === "error") throw new Error(deploy.error_message || "Netlify failed while preparing the deploy");
  if (!Array.isArray(deploy.required) || !Array.isArray(deploy.required_functions)) throw new Error(`Deploy did not finish diffing (state: ${deploy.state})`);

  for (const hash of deploy.required) {
    const file = localFilesBySha.get(hash);
    if (!file) throw new Error(`Netlify requested an unexpected static file hash: ${hash}`);
    await api.uploadDeployFile({
      body: () => Readable.from(file.bytes),
      deployId: created.id,
      path: encodeURI(file.normalizedPath),
    });
  }
  for (const hash of deploy.required_functions) {
    const fn = functionBySha.get(hash);
    if (!fn) throw new Error(`Netlify requested an unexpected function hash: ${hash}`);
    await api.uploadDeployFunction({
      body: () => createReadStream(fn.path),
      deployId: created.id,
      name: encodeURI(fn.name),
      runtime: fn.runtimeVersion || fn.runtime,
      invocationMode: fn.invocationMode,
      ...(fn.timeout ? { timeout: fn.timeout } : {}),
    });
  }

  for (let attempts = 0; attempts < 180; attempts += 1) {
    deploy = await api.getSiteDeploy({ siteId, deployId: created.id });
    if (deploy.state === "ready") break;
    if (deploy.state === "error") throw new Error(deploy.error_message || "Netlify deployment failed");
    await pause(1000);
  }
  if (deploy.state !== "ready") throw new Error(`Timed out waiting for production deploy (state: ${deploy.state})`);

  const publishedFiles = await api.listSiteFiles({ siteId });
  const publishedByPath = new Map(publishedFiles.map((file) => [file.path, file.sha]));
  for (const liveFile of liveFiles) {
    if (changedFiles.includes(liveFile.path)) continue;
    if (publishedByPath.get(liveFile.path) !== liveFile.sha) throw new Error(`Unrelated production file changed: ${liveFile.path}`);
  }
  for (const [hash, file] of localFilesBySha) {
    if (publishedByPath.get(file.normalizedPath) !== hash) throw new Error(`Published admin file does not match reviewed bytes: ${file.normalizedPath}`);
  }

  console.log(JSON.stringify({ deployed: true, deployId: deploy.id, url: deploy.ssl_url || deploy.url, changedFiles, changedFunctions }, null, 2));
  }
} finally {
  await rm(tmpDir, { recursive: true, force: true });
}
