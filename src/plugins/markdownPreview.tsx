import { ErrorBoundary } from "components/ErrorBoundary"
import MarkdownIt from "markdown-it"
import { define, devs, re, replace } from "picnic"

const md = MarkdownIt().set({ linkify: true })

const Preview = (props: any) => {
  return (
    <div className="status__content">
      <div
        className="status__content__text"
        dangerouslySetInnerHTML={{ __html: md.render(props.text) }}
      >
      </div>
    </div>
  )
}

export default define({
  name: "picnic/markdown-preview",
  authors: [devs.rini],
  patches: [
    {
      query: 'className:"compose-form"',
      patch: [
        replace(re`disabled:!this.canSubmit()}))))]})`, "$&,$self.renderPreview(this.props)"),
      ],
    },
  ],

  renderPreview: (props: any) => (
    <ErrorBoundary>
      <Preview {...props} />
    </ErrorBoundary>
  ),
})
