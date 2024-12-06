import type { PluginDefinition } from "picnic"
import common from "plugins/common"
import core from "plugins/core"
import markdownPreview from "plugins/markdownPreview"
import notifFilter from "plugins/notifFilter"

export const pluginDefs = [
  common,
  core,
  markdownPreview,
  notifFilter,
] as PluginDefinition[]
