import MarkdownIt from "markdown-it"
import { define, devs, re, replace } from "picnic"
import { reactRedux } from "./common"
import { ErrorBoundary } from "components/ErrorBoundary"

const md = MarkdownIt().set({ linkify: true })

const Preview = () => {
  const store = reactRedux.useStore()

  return <div>{store}</div>
}

export default define({
  name: "picnic/markdown-preview",
  authors: [devs.rini],
  patches: [
    {
      query: 'className:"compose-panel"',
      patch: [
        replace(re`\(\i.\i\),{singleColumn:!0}),`, "$&$self.renderPreview(),"),
      ],
    },
    {
      query: 'className:"compose-form"',
      patch: [
        replace("", ""),
      ],
    },
  ],

  renderPreview: () => <ErrorBoundary fallback={null}>
    <Preview />
  </ErrorBoundary>,
})
