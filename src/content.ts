import { PatchContext, PatchDefinition, PatchFunction, PatchGroupDefinition, PluginDefinition } from "picnic"
import { pluginDefs } from "plugins"
import { wreq } from "webpack"

export * from "webpack"
export { wreq }

const consoleStyle = ["color:mediumaquamarine", "color:currentColor"]

if ("webpackJsonp" in window)
  console.warn("%c picnic | %cWebpack has already loaded!!", ...consoleStyle)
if ("browser" in window || "chrome" in window)
  console.warn("%c picnic | %cI shouldn't be running on the extension side!!", ...consoleStyle)

console.log(
  `%cpicnic | %cLoading %cv${VERSION}%c!`,
  ...consoleStyle,
  "font-weight:bold",
  "",
)

interface Patch extends PatchDefinition {
  query: string[]
  patch: PatchFunction[]
  applied?: boolean
}

interface PatchGroup extends PatchGroupDefinition {
  patches: Patch[]
}

interface Plugin extends PluginDefinition {
  patches: PatchGroup[]
}

export const plugins = [] as Plugin[]

for (const plugin of pluginDefs) {
  const p = plugin as Plugin

  // Normalise patches

  p.patches = plugin.patches?.map(p => "patches" in p ? p as PatchGroup : { patches: [p as Patch] }) ?? []

  for (const group of p.patches) {
    for (const patch of group.patches) {
      if (!Array.isArray(patch.query))
        patch.query = [patch.query]
      if (!Array.isArray(patch.patch))
        patch.patch = [patch.patch]
    }
  }

  plugins.push(p)
}

const applyPatches = (plugin: Plugin, factories: any, ctx: PatchContext) => {
  for (const group of plugin.patches) {
    for (const patch of group.patches) {
      let matched = false

      for (const m in factories) {
        let code: string
        try {
          code = Function.prototype.toString.call(factories[m])
        } catch {
          // pray it never happens!
          continue
        }

        if (!patch.query.every(m => code.includes(m)))
          continue

        matched = true
        for (const f of patch.patch) {
          code = f(code, ctx)
          if (patch.applied)
            console.warn("Query is not unique: ", patch.query)
          patch.applied = true
        }

        if (!code.includes("//# sourceURL"))
          code += `\n//# sourceURL=Webpack${m}`

        try {
          factories[m] = (0, eval)(`// Patched by ${plugin.name}\n0,${code}`)
        } catch (e) {
          console.warn(e)
        }
      }

      if (matched)
        break
    }
  }
}

// idk what this guy is im just calling him Jason
const Jason = (window as any).webpackJsonp = [] as any[]

let loadModules = Jason.push.bind(Jason)

function handlePush(chunk: any) {
  const [, factory] = chunk
  const ctx: PatchContext = { id: -1 }

  const url = Error().stack?.match(/https:\/\/[\w-._~\/]*/)?.[0]
  console.log("%cpicnic | %cIntercepted chunk", ...consoleStyle, url)
  console.time("patch")

  for (const [id, plugin] of plugins.entries()) {
    if (!plugin.patches.length)
      continue

    console.group(`%cpicnic | %cApplying patches from ${plugin.name}`, ...consoleStyle)
    ctx.id = id
    applyPatches(plugin, factory, ctx)
    console.groupEnd()
  }

  console.timeEnd("patch")

  queueMicrotask(() => {
    for (const plugin of plugins) {
      if (!plugin.start)
        continue

      console.log(`%cpicnic | %cStarting ${plugin.name}`)
      plugin.start()
    }
  })

  return loadModules(chunk)
}

handlePush.bind = (that: any) => loadModules.bind(that)

Object.defineProperty(Jason, "push", {
  get: () => handlePush,
  set: (value) => void (loadModules = value),
})

declare const VERSION: string
