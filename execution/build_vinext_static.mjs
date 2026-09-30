import { spawn } from "node:child_process";
import path from "node:path";

const environment = { ...process.env };
delete environment.NETLIFY;

const cli = path.resolve("node_modules/vinext/dist/cli.js");
const build = spawn(process.execPath, [cli, "build"], {
  env: environment,
  stdio: "inherit",
});

const exitCode = await new Promise((resolve, reject) => {
  build.once("error", reject);
  build.once("exit", (code) => resolve(code ?? 1));
});

if (exitCode !== 0) process.exit(exitCode);
