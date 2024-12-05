import MarkdownIt from "markdown-it"
import { define, devs, re, replace } from "picnic"
import { useSelector } from "./common/react-redux"
import { withErrorBoundary } from "components/ErrorBoundary"

const md = MarkdownIt()
  .set({ linkify: true })
  .disable(["table", "code"])

md.linkify.set({ fuzzyEmail: false, fuzzyLink: false })
md.linkify.add("@", {
  validate: new RegExp(`^${md.linkify.re.src_email_name}(?:@${md.linkify.re.src_host_strict})?`, "i"),
  normalize(match) {
    match.text = "@" + match.text.split("@")[1]
    match.url = "/" + match.url
  },
})
md.linkify.add("#", {
  validate: new RegExp(`^${md.linkify.re.src_pseudo_letter}*`),
  normalize(match) {
    match.url = "/tags/" + match.url.replace(/^#/, "")
  },
})
md.linkify.add("xmpp:", "mailto:")
md.core.ruler.after("linkify", "shorten_links", (state) => {
  for (const block of state.tokens) {
    if (block.type != "inline")
      continue

    let foundLink = false
    for (const token of block.children!) {
      if (token.type == "text" && foundLink) {
        token.content = token.content.replace(/^https?:\/\/(www\.)?|xmpp:/, "")
        if (token.content.length > 30)
          token.content = token.content.slice(0, 30) + "…"
      } else if (token.type == "link_open") {
        if (token.attrGet("href")?.match(/^[a-z]/))
          token.attrSet("class", "unhandled-link")
        foundLink = true
      } else {
        foundLink = false
      }
    }
  }

  return false
})

// parsed by mastodon, but stripped out
md.renderer.rules.hr = () => ""

const Preview = (props: { text: string }) => {
  const contentType = useSelector(state => state.getIn(["compose", "content_type"]))

  // TODO: html preview
  if (contentType != "text/markdown")
    return

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
  description: "Adds a preview of the post's markdown. Does not currently support HTML.",
  authors: [devs.rini],
  patches: [
    {
      query: 'className:"compose-form"',
      patch: replace(
        re`disabled:!this.canSubmit()}))))]})`,
        "$&,$self.renderPreview(this.props)",
      ),
    },
  ],

  renderPreview: withErrorBoundary(Preview),
})
