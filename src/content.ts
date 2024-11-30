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
}

interface PatchGroup extends PatchGroupDefinition {
  patches: Patch[]
  applied?: boolean
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

const patchModule = (module: Function) => {
  let code = "0," + module

  const ctx: PatchContext = {
    id: -1,
  }

  const matches = new Set<Plugin>()

  for (const id in Plugins) {
    let error
    const p = Plugins[id]

    ctx.id = +id

    for (const group of p.patches) {
      const rollback = code

      for (const patch of group.patches) {
        if (!patch.query.every(m => code.includes(m)))
          continue

        console.log("AAAAAAAA")
        for (const i in patch.patch) {
          const f = patch.patch[i]
          try {
            code = f(code, ctx)
            matches.add(p)
            if (group.applied)
              console.warn(`%c picnic | %cPatch #${i + 1} from ${p.name} was reapplied`, ...consoleStyle)
            group.applied = true
            error = undefined
            break
          } catch (e) {
            error = "" + e
            code = rollback
          }
        }
      }

      if (error != null)
        console.error(`%c picnic | %c${error}`, ...consoleStyle)
    }
  }

  if (matches.size) {
    code += `\n\n// Patched by ${[...matches].map(p => p.name).join(", ")}`

    return eval.call(undefined, code)
  } else {
    return module
  }
}

// idk what this guy is im just calling him Jason
const Jason = (window as any).webpackJsonp = [] as any[]

let loadModules = Jason.push.bind(Jason)

function handlePush(chunk: any) {
  const [, factory] = chunk

  for (const id in factory) {
    factory[id] = patchModule(factory[id])
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
