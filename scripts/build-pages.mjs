import { rename } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const apiDirectory = resolve(root, "app", "api");
const stashDirectory = resolve(root, ".pages-api-stash");

await rename(apiDirectory, stashDirectory);

try {
  const command = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = spawnSync(command, ["run", "build"], {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: {
      ...process.env,
      GITHUB_PAGES: "true",
      NEXT_PUBLIC_BASE_PATH: "/S2Volt"
    }
  });
  if (result.error) console.error(result.error);
  if (result.status !== 0) process.exitCode = result.status ?? 1;
} finally {
  await rename(stashDirectory, apiDirectory);
}
