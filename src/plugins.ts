import { PluginDefinition } from "picnic"
import common from "plugins/common"
import core from "plugins/core"
import markdownPreview from "plugins/markdownPreview"

export const pluginDefs = [
  common,
  core,
  markdownPreview,
] as PluginDefinition[]
