import { define } from "picnic"
import { lazyModule } from "webpack"

export let react: typeof import("react") = lazyModule("createElement", "Fragment")

export default define({
  name: "picnic/common",
  authors: [],
})
