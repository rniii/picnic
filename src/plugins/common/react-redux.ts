import type Immutable from "immutable"
import type R from "react-redux"
import { lazyModule } from "webpack"

type State = Immutable.Record<any>

export const reactRedux = lazyModule("connect", "Provider") as {
  useSelector: typeof R.useSelector<State>
} & typeof import("react-redux")

export const { useSelector } = reactRedux
