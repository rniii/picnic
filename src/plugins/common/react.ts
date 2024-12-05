import { lazyModule } from "webpack";

export const react = lazyModule("createElement", "Fragment") as typeof import("react")
export const { createElement } = react
