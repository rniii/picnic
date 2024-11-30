import { PluginDefinition } from "picnic"
import common from "plugins/common"
import core from "plugins/core"
import settings from "plugins/settings"

export const pluginDefs = [
  common,
  core,
  settings,
] as PluginDefinition[]
