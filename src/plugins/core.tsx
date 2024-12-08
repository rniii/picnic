import { ErrorBoundary, withErrorBoundary } from "components/ErrorBoundary"
import { define, devs, type PatchFunction, re, replace } from "picnic"

const capture = (query: RegExp, f: (x: RegExpMatchArray) => PatchFunction): PatchFunction => {
  return (src, ctx) => {
    const match = src.match(query)
    if (!match) {
      console.warn(`Match failed: ${query}`)
      return src
    }

    return f(match)(src, ctx)
  }
}

const PICNIC = "picnic\0"

const LocalSettings = (props: { settings: any; onChange: any }) => {
  return (
    <div className="glitch local-settings__page general">
      <core.LocalSettingsPageItem
        settings={props.settings}
        item={[PICNIC, "freaky_mode"]}
        onChange={props.onChange}
      >
        Enable freaky mode
      </core.LocalSettingsPageItem>
    </div>
  )
}

const NavigationItem = (props: { index: number; onNavigate: any }) => {
  return (
    <core.LocalSettingsNavItem
      active={props.index === -1}
      index={-1}
      onNavigate={props.onNavigate}
      icon="cogs"
      title="Picnic"
    />
  )
}

const core = define({
  name: "picnic/core",
  authors: [devs.rini],
  patches: [
    {
      query: 'className:"link-footer"',
      patch: replace(re`"v",\i.\i)`, "$&,$self.renderFooterLink()"),
    },
    {
      query: "local-settings__page__item",
      patch: [
        replace(
          re`class \(\i\) extends\.\{0,100}index:\i,onNavigate:\i`,
          "var $1=$self.LocalSettingsNavItem=$&",
        ),
        replace(
          re`title:\i.formatMessage(\i.preferences)}),`,
          "$&$self.renderNavigationItem(this.props),",
        ),

        // replace(
        //   re`class \(\i\) extends\.\{0,200}options:\i,placeholder:\i`,
        //   "var $1=$self.LocalSettingsPageItem=$&",
        // ),
        replace(
          re`\(\?<=settings:\i}=this.props,\i=\)\i[\i]||\i[0]`,
          "this.props.index<0?$self.renderLocalSettings:$&",
        ),
      ],
    },
  ],

  LocalSettingsPageItem: (_: any) => null as React.ReactNode,
  LocalSettingsNavItem: (_: any) => null as React.ReactNode,

  renderFooterLink: () => (
    <>
      + <a href="https://github.com/rniii/picnic" target="_blank">picnic</a>
    </>
  ),

  renderNavigationItem: withErrorBoundary(NavigationItem),
  renderLocalSettings: withErrorBoundary(LocalSettings),
})

export default core
