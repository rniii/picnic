import { createElement } from "plugins/common/react";

// @ts-expect-error
export const __picnic_createElement = (...args) => createElement(...args)
export const __picnic_Fragment = Symbol.for("react.fragment")
