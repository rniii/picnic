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

export const lazyModule = (...filter: string[]) => {
  let cached: any
  return new Proxy({} as any, {
    get(_, key) {
      cached ??= getModule(...filter)
      return cached[key]
    },
  })
}
