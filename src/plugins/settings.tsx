import { define, devs, re, replace } from "picnic"

export default define({
  name: "picnic/settings",
  authors: [devs.rini],
  patches: [
    {
      query: 'className:"navigation-panel"',
      patch: [
        replace(re`text:\i.formatMessage(\i.app_settings)})`, "$&,$self.renderSettings()"),
      ],
    },
  ],

  renderSettings() {
    return <div>meow</div>
  },
})
