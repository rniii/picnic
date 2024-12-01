import { define, devs, re, replace } from "picnic"

export default define({
  name: "picnic/core",
  authors: [devs.rini],
  patches: [
    {
      query: 'className:"link-footer"',
      patch: replace(re`"v",\i.\i)`, '$&,$self.renderLink()'),
    },
  ],

  renderLink: () =>
    <> + <a href="https://github.com/rniii/picnic" target="_blank">picnic</a></>
})
