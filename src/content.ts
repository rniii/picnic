import { PatchContext, PatchDefinition, PatchFunction, PatchGroupDefinition, PluginDefinition } from "picnic"
import { pluginDefs } from "plugins"

const consoleStyle = ["color:mediumaquamarine", "color:currentColor"]

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

const Plugins = [] as Plugin[]

for (const plugin of pluginDefs) {
  const p = plugin as Plugin

  // Normalise patches

  p.patches = plugin.patches.map(p => "patches" in p ? p as PatchGroup : { patches: [p as Patch] })

  for (const group of p.patches) {
    for (const patch of group.patches) {
      if (!Array.isArray(patch.query))
        patch.query = [patch.query]
      if (!Array.isArray(patch.patch))
        patch.patch = [patch.patch]
    }
  }

  Plugins.push(p)
}

const applyPatches = (plugin: Plugin, factory: any, ctx: PatchContext) => {
  for (const group of plugin.patches) {
    for (const patch of group.patches) {
      let matched = false

      for (const m in factory) {
        let code: string
        try {
          code = Function.prototype.toString.call(factory[m])
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

        factory[m] = (0, eval)(`0,${code}\n// Patched by ${plugin.name}`)
      }

      if (matched)
        break;
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

  for (const [id, plugin] of Plugins.entries()) {
    if (!plugin.patches.length)
      continue

    console.group(`%cpicnic | %cApplying patches from ${plugin.name}`, ...consoleStyle)
    ctx.id = id
    applyPatches(plugin, factory, ctx)
    console.groupEnd()
  }

  return loadModules(chunk)
}

handlePush.bind = (that: any) => loadModules.bind(that)

let webpackCache: any
Object.defineProperty(Function.prototype, "c", {
  configurable: true,
  set(value) {
    Object.defineProperty(Function.prototype, "c", { configurable: true, value })
    webpackCache = value
  },
})

Object.defineProperty(Jason, "push", {
  get: () => handlePush,
  set: (value) => void (loadModules = value),
})

declare const VERSION: string
