import { lazy } from "picnic"

export interface WebpackFactory {
  (module: WebpackModule, exports: any, require: typeof wreq): any
}

export interface WebpackModule {
  i: number
  l: boolean
  exports: any
}

export let wreq: {
  m: Record<number, WebpackFactory>
  c: Record<number, WebpackModule>
  (id: number): WebpackModule
}

Object.defineProperty(Function.prototype, "c", {
  configurable: true,
  set(value) {
    // @ts-expect-error
    window.wreq = wreq = this, delete Function.prototype.c

    this.c = value
  },
})

export const getModule = (...filter: string[]) => {
  for (const id in wreq.c) {
    const m = wreq.c[id]
    if (!m?.l || !m.exports)
      continue

    if (filter.every(f => typeof m.exports == "object" && f in m.exports))
      return m.exports
  }
}

export const lazyModule = (...filter: string[]) => lazy(() => getModule(...filter))

export const getMangled = (
  query: string | string[],
  predicate: (obj: any) => boolean,
) => {
  if (!Array.isArray(query))
    query = [query]

  const m = search(...query)
  if (!m || !m.exports)
    return

  for (const p in m.exports) {
    if (predicate(m.exports[p]))
      return m.exports[p]
  }
}

export const lazyMangled = (
  query: string | string[],
  predicate: (obj: any) => boolean,
) => lazy(() => getMangled(query, predicate))

export const search = (...query: string[]) => {
  for (const id in wreq.m) {
    let code: string
    try {
      code = Function.prototype.toString.call(wreq.m[id])
    } catch {
      continue
    }

    if (!query.every(m => code.includes(m)))
      continue

    return wreq.c[id]
  }
}
