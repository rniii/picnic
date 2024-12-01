export const lazy = <T extends object>(get: () => T) => {
  let cached: any

  return new Proxy<T>(function() {} as any, {
    get: (_, key) => Reflect.get(cached ??= get(), key),
    set: (_, key, val) => Reflect.set(cached ??= get(), key, val),
  })
}

export const lazyComponent = <P extends object>(
  get: () => React.ComponentClass<P> | ((props: P) => React.ReactNode),
) => {
  let cached: any

  // @ts-expect-error
  return (props: P) => __picnic_createElement(cached ??= get(), props)
}

export const re = (template: TemplateStringsArray) => {
  const raw = template.raw[0]
  const flags = raw.match(/^\(\?([a-z]+)\)/)
  const regex = new RegExp(
    raw
      .slice(flags?.[0].length)
      .replace(/\\*[.*+?^${()|[]/g, (m) => m.length % 2 ? "\\" + m : m.slice(1))
      .replace(/\\i/g, "[A-Za-z_$][\\w$]*"),
    flags?.[1],
  )
  regex.toString = () => "re`" + raw + "`"
  return regex
}

export const replace = (match: string | RegExp, repl: string): PatchFunction => {
  return (src, ctx) => {
    const oldSrc = src
    src = src.replace(match, repl.replace("$self", `picnic.plugins[${ctx.id}]`))
    if (oldSrc === src)
      console.warn(`Patch failed: ${match}`)
    return src
  }
}

export interface PatchContext {
  id: number
}

export type PatchFunction = (src: string, ctx: PatchContext) => string

export interface PatchDefinition {
  name?: string
  query: string | string[]
  patch: PatchFunction | PatchFunction[]
}

export interface PatchGroupDefinition {
  name?: string
  patches: PatchDefinition[]
}

export interface Author {
  name: string
  handle: string
}

export interface PluginDefinition {
  name: string
  authors: Author[]
  description?: string
  patches?: (PatchDefinition | PatchGroupDefinition)[]
  start?(): void
}

export const define = <T extends PluginDefinition>(m: T) => m

export const devs = {
  rini: {
    name: "rini",
    handle: "@rini@wetdry.world",
  },
} satisfies Record<string, Author>
