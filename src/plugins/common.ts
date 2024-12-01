import { define } from "picnic"
import { lazyModule } from "webpack"

export const react: typeof import("react") = lazyModule("createElement", "Fragment")
export const reactRedux: typeof import("react-redux") = lazyModule("useStore", "Provider")

export default define({
  name: "picnic/common",
  authors: [],
})
