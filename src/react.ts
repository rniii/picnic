import { react } from "plugins/common";

// @ts-expect-error
export const __picnic_createElement = (...args) => react.createElement(...args)
export const __picnic_Fragment = Symbol.for("react.fragment")
