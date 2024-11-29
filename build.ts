import { execSync } from "child_process"
import { build, BuildOptions, context } from "esbuild"

const watch = process.arch.includes("--watch") || process.argv.includes("-w")
const gitHash = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim()
const version = `${process.env.npm_package_version!}+git.${gitHash}`

const userscriptHeader = (meta: any) =>
  [
    "// ==UserScript==",
    ...Object.entries(meta).map(([k, v]) => `// @${k.padEnd(14)} ${v}`),
    "// ==/UserScript==",
  ].join("\n")

const options: BuildOptions = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  minifySyntax: true,
  minifyWhitespace: true,
  define: {
    VERSION: JSON.stringify(version),
  },
  logLevel: "info",
}

const userscript: BuildOptions = {
  ...options,
  banner: {
    js: userscriptHeader({
      "name": "mini",
      "run-at": "document-start",
    }),
  },
  define: {
    ...options.define,
    window: "unsafeWindow",
  },
}

const targets: BuildOptions[] = [
  { ...userscript, outfile: "dist/mini.user.js" },
]

targets.forEach(watch ? async target => (await context(target)).watch() : build)
