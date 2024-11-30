import { execSync } from "child_process"
import { build } from "esbuild"
import { copyFile } from "fs/promises"
import path from "path"

const gitHash = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim()
const version = `${process.env.npm_package_version}+git.${gitHash}`

const resources = [
  "src/background.ts",
  "src/content.ts",
  "src/options.ts",
  "src/options.html",
  "manifest.json",
]

const options = {
  bundle: true,
  minifySyntax: true,
  logLevel: "info",
  define: {
    VERSION: JSON.stringify(version),
  },
}

for (const src of resources) {
  const dst = path.join("dist/unpacked", path.basename(src))
  if (path.extname(src) == ".ts")
    await build({ ...options, entryPoints: [src], outfile: dst.replace(/.ts$/, ".js") })
  else
    await copyFile(src, dst)
}
